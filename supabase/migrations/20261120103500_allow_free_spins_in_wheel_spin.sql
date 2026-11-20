-- Migration: Ưu tiên trừ lượt quay miễn phí khi học sinh có lượt quay miễn phí
-- Đồng thời cập nhật allow_free_spin trong system_settings

CREATE OR REPLACE FUNCTION public.execute_wheel_spin(
  p_student_id uuid,
  p_prize_id character varying,
  p_prize_label character varying,
  p_prize_short_label character varying,
  p_prize_type character varying,
  p_reward_coins integer,
  p_reward_free_spins integer,
  p_spin_cost integer,
  p_allow_free_spin boolean,
  p_fee_description text,
  p_prize_description text
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_coins INTEGER;
  v_total_earned INTEGER;
  v_free_spins INTEGER;
  v_is_active BOOLEAN;
  v_is_deleted BOOLEAN;
  v_is_free_spin BOOLEAN;
  v_actual_spin_cost INTEGER;
  v_spins_after_fee INTEGER;
  v_coins_after_fee INTEGER;
  v_deduct_amount INTEGER;
  v_actual_reward_coins INTEGER := 0;
  v_actual_reward_spins INTEGER := 0;
  v_final_coins INTEGER;
  v_final_total_earned INTEGER;
  v_final_spins INTEGER;
  v_spin_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- 1. Khóa dòng (Row-level Lock) chống Race Condition / Spam Click
  SELECT current_coins, total_earned_coins, free_spins, is_active, is_deleted
  INTO v_current_coins, v_total_earned, v_free_spins, v_is_active, v_is_deleted
  FROM public.users
  WHERE id = p_student_id
  FOR UPDATE;

  IF NOT FOUND OR v_is_deleted = true OR v_is_active = false THEN
    RAISE EXCEPTION 'STUDENT_NOT_ACTIVE';
  END IF;

  v_current_coins := COALESCE(v_current_coins, 0);
  v_total_earned := COALESCE(v_total_earned, 0);
  v_free_spins := COALESCE(v_free_spins, 0);

  -- 2. Ưu tiên sử dụng lượt quay miễn phí nếu học sinh đang có (v_free_spins > 0)
  IF v_free_spins > 0 THEN
    v_is_free_spin := true;
    v_actual_spin_cost := 0;
    v_spins_after_fee := v_free_spins - 1;
    v_coins_after_fee := v_current_coins;
  ELSE
    v_is_free_spin := false;
    v_actual_spin_cost := GREATEST(0, COALESCE(p_spin_cost, 0));

    IF v_current_coins < v_actual_spin_cost THEN
      RAISE EXCEPTION 'INSUFFICIENT_COINS';
    END IF;

    v_spins_after_fee := v_free_spins;
    v_coins_after_fee := v_current_coins - v_actual_spin_cost;
  END IF;

  -- 3. Áp dụng phần thưởng hoặc hình phạt từ ô trúng
  IF p_prize_type = 'coin' AND COALESCE(p_reward_coins, 0) > 0 THEN
    v_actual_reward_coins := ABS(p_reward_coins);
    v_final_coins := v_coins_after_fee + v_actual_reward_coins;
    v_final_total_earned := v_total_earned + v_actual_reward_coins;
    v_final_spins := v_spins_after_fee;
  ELSIF p_prize_type = 'deduct_coin' AND COALESCE(p_reward_coins, 0) <> 0 THEN
    v_deduct_amount := LEAST(v_coins_after_fee, ABS(p_reward_coins));
    v_actual_reward_coins := -v_deduct_amount;
    v_final_coins := v_coins_after_fee - v_deduct_amount;
    v_final_total_earned := v_total_earned;
    v_final_spins := v_spins_after_fee;
  ELSIF p_prize_type = 'free_spin' AND COALESCE(p_reward_free_spins, 0) > 0 THEN
    v_actual_reward_spins := GREATEST(1, p_reward_free_spins);
    v_final_coins := v_coins_after_fee;
    v_final_total_earned := v_total_earned;
    v_final_spins := v_spins_after_fee + v_actual_reward_spins;
  ELSE
    v_final_coins := v_coins_after_fee;
    v_final_total_earned := v_total_earned;
    v_final_spins := v_spins_after_fee;
  END IF;

  -- 4. Ghi log lịch sử quay (Immutable Snapshot)
  INSERT INTO public.wheel_spins (
    student_id,
    prize_id,
    prize_label_snapshot,
    prize_short_label_snapshot,
    prize_type_snapshot,
    spin_cost,
    reward_coins,
    reward_free_spins,
    is_free_spin
  ) VALUES (
    p_student_id,
    p_prize_id,
    p_prize_label,
    p_prize_short_label,
    p_prize_type,
    v_actual_spin_cost,
    v_actual_reward_coins,
    v_actual_reward_spins,
    v_is_free_spin
  )
  RETURNING id, created_at INTO v_spin_id, v_created_at;

  -- 5. Cập nhật số dư xu và lượt quay của học sinh
  UPDATE public.users
  SET
    current_coins = v_final_coins,
    total_earned_coins = v_final_total_earned,
    free_spins = v_final_spins,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_student_id;

  -- 6. Ghi sổ cái coin_transactions cho phí quay (nếu mất xu)
  IF v_is_free_spin = false AND v_actual_spin_cost > 0 THEN
    INSERT INTO public.coin_transactions (
      user_id,
      tx_type,
      amount,
      balance_before,
      balance_after,
      reference_type,
      reference_id,
      description,
      created_by
    ) VALUES (
      p_student_id,
      'WHEEL_SPIN_FEE',
      -v_actual_spin_cost,
      v_current_coins,
      v_coins_after_fee,
      'wheel_spins',
      v_spin_id,
      p_fee_description,
      p_student_id
    );
  END IF;

  -- 7. Ghi sổ cái coin_transactions cho phần thưởng / phạt xu (nếu khác 0)
  IF v_actual_reward_coins <> 0 THEN
    INSERT INTO public.coin_transactions (
      user_id,
      tx_type,
      amount,
      balance_before,
      balance_after,
      reference_type,
      reference_id,
      description,
      created_by
    ) VALUES (
      p_student_id,
      'WHEEL_PRIZE',
      v_actual_reward_coins,
      v_coins_after_fee,
      v_final_coins,
      'wheel_spins',
      v_spin_id,
      p_prize_description,
      p_student_id
    );
  END IF;

  RETURN jsonb_build_object(
    'spin_id', v_spin_id,
    'created_at', v_created_at,
    'is_free_spin', v_is_free_spin,
    'spin_cost', v_actual_spin_cost,
    'actual_reward_coins', v_actual_reward_coins,
    'actual_reward_free_spins', v_actual_reward_spins,
    'current_coins', v_final_coins,
    'total_earned_coins', v_final_total_earned,
    'free_spins', v_final_spins
  );
END;
$function$;

UPDATE public.system_settings
SET value = jsonb_set(value, '{allow_free_spin}', 'true'::jsonb)
WHERE key = 'wheel_setting';
