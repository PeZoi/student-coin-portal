-- Migration: Bổ sung loại 'spin_gift' (Quà tuỳ chọn Spin) và cột unclaimed_gifts (Hộp quà vòng quay chưa mở)

-- 1. Thêm giá trị 'spin_gift' vào ENUM monthly_exchange_choice
ALTER TYPE public.monthly_exchange_choice ADD VALUE IF NOT EXISTS 'spin_gift';

-- 2. Thêm cột unclaimed_gifts vào bảng public.users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS unclaimed_gifts INTEGER NOT NULL DEFAULT 0
  CONSTRAINT users_unclaimed_gifts_check CHECK (unclaimed_gifts >= 0);

-- 3. Cập nhật hàm RPC execute_wheel_spin: cộng +1 vào unclaimed_gifts khi trúng ô 'gift'
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
  v_unclaimed_gifts INTEGER;
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
  v_final_unclaimed_gifts INTEGER;
  v_spin_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- 1. Khóa dòng (Row-level Lock) chống Race Condition / Spam Click
  SELECT current_coins, total_earned_coins, free_spins, unclaimed_gifts, is_active, is_deleted
  INTO v_current_coins, v_total_earned, v_free_spins, v_unclaimed_gifts, v_is_active, v_is_deleted
  FROM public.users
  WHERE id = p_student_id
  FOR UPDATE;

  IF NOT FOUND OR v_is_deleted = true OR v_is_active = false THEN
    RAISE EXCEPTION 'STUDENT_NOT_ACTIVE';
  END IF;

  v_current_coins := COALESCE(v_current_coins, 0);
  v_total_earned := COALESCE(v_total_earned, 0);
  v_free_spins := COALESCE(v_free_spins, 0);
  v_unclaimed_gifts := COALESCE(v_unclaimed_gifts, 0);

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
  v_final_unclaimed_gifts := v_unclaimed_gifts;

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
  ELSIF p_prize_type = 'gift' THEN
    v_final_coins := v_coins_after_fee;
    v_final_total_earned := v_total_earned;
    v_final_spins := v_spins_after_fee;
    v_final_unclaimed_gifts := v_unclaimed_gifts + 1;
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

  -- 5. Cập nhật số dư xu, lượt quay và hộp quà chưa mở của học sinh
  UPDATE public.users
  SET
    current_coins = v_final_coins,
    total_earned_coins = v_final_total_earned,
    free_spins = v_final_spins,
    unclaimed_gifts = v_final_unclaimed_gifts,
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
    'free_spins', v_final_spins,
    'unclaimed_gifts', v_final_unclaimed_gifts
  );
END;
$function$;

-- 4. Tạo hàm RPC claim_wheel_gift_box: trừ 1 hộp quà chưa mở và tạo đơn spin_gift (không hardcode giới hạn tiền ở DB)
CREATE OR REPLACE FUNCTION public.claim_wheel_gift_box(
  p_student_id uuid,
  p_amount_vnd integer,
  p_shopee_product_url text,
  p_shopee_note text,
  p_month integer,
  p_year integer
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_unclaimed_gifts INTEGER;
  v_is_active BOOLEAN;
  v_is_deleted BOOLEAN;
  v_request_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  SELECT unclaimed_gifts, is_active, is_deleted
  INTO v_unclaimed_gifts, v_is_active, v_is_deleted
  FROM public.users
  WHERE id = p_student_id
  FOR UPDATE;

  IF NOT FOUND OR v_is_deleted = true OR v_is_active = false THEN
    RAISE EXCEPTION 'STUDENT_NOT_ACTIVE';
  END IF;

  v_unclaimed_gifts := COALESCE(v_unclaimed_gifts, 0);
  IF v_unclaimed_gifts <= 0 THEN
    RAISE EXCEPTION 'NO_UNCLAIMED_GIFTS';
  END IF;

  UPDATE public.users
  SET
    unclaimed_gifts = v_unclaimed_gifts - 1,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_student_id;

  INSERT INTO public.monthly_exchange_requests (
    month,
    year,
    student_id,
    choice_type,
    coins_to_exchange,
    amount_vnd,
    shopee_product_url,
    shopee_note,
    status
  ) VALUES (
    p_month,
    p_year,
    p_student_id,
    'spin_gift',
    0,
    GREATEST(0, COALESCE(p_amount_vnd, 0)),
    p_shopee_product_url,
    p_shopee_note,
    'pending'
  )
  RETURNING id, created_at INTO v_request_id, v_created_at;

  RETURN jsonb_build_object(
    'request_id', v_request_id,
    'unclaimed_gifts', v_unclaimed_gifts - 1,
    'created_at', v_created_at
  );
END;
$function$;

-- 5. Cập nhật constraint chk_exchange_request_choice_rules để cho phép coins_to_exchange >= 0 với choice_type = 'spin_gift'
ALTER TABLE public.monthly_exchange_requests
  DROP CONSTRAINT IF EXISTS chk_exchange_request_choice_rules;

ALTER TABLE public.monthly_exchange_requests
  ADD CONSTRAINT chk_exchange_request_choice_rules
  CHECK (
    amount_vnd > 0
    AND (
      (choice_type = 'spin_gift'::public.monthly_exchange_choice AND coins_to_exchange >= 0)
      OR (choice_type <> 'spin_gift'::public.monthly_exchange_choice AND coins_to_exchange > 0)
    )
  );
