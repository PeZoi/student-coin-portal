-- Migration: Tạo hàm RPC submit_reward_exchange xử lý đổi tiền mặt & tự chọn quà (Atomic ACID)

CREATE OR REPLACE FUNCTION public.submit_reward_exchange(
  p_student_id uuid,
  p_choice_type public.monthly_exchange_choice,
  p_coins_to_exchange integer,
  p_amount_vnd integer,
  p_shopee_product_url text,
  p_shopee_note text,
  p_month integer,
  p_year integer,
  p_tx_description text
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_coins INTEGER;
  v_new_coins INTEGER;
  v_is_active BOOLEAN;
  v_is_deleted BOOLEAN;
  v_request_id UUID;
  v_hold_tx_id UUID;
  v_created_at TIMESTAMPTZ;
  v_clean_description TEXT;
BEGIN
  IF p_choice_type NOT IN ('cash', 'gift') THEN
    RAISE EXCEPTION 'INVALID_CHOICE_TYPE';
  END IF;

  IF COALESCE(p_coins_to_exchange, 0) <= 0 OR COALESCE(p_amount_vnd, 0) <= 0 THEN
    RAISE EXCEPTION 'INVALID_EXCHANGE_AMOUNT';
  END IF;

  -- 1. Khóa dòng (Row-level Lock) chống Race Condition / Spam Click
  SELECT current_coins, is_active, is_deleted
  INTO v_current_coins, v_is_active, v_is_deleted
  FROM public.users
  WHERE id = p_student_id
  FOR UPDATE;

  IF NOT FOUND OR v_is_deleted = true OR v_is_active = false THEN
    RAISE EXCEPTION 'STUDENT_NOT_ACTIVE';
  END IF;

  v_current_coins := COALESCE(v_current_coins, 0);

  IF v_current_coins < p_coins_to_exchange THEN
    RAISE EXCEPTION 'INSUFFICIENT_COINS';
  END IF;

  v_new_coins := v_current_coins - p_coins_to_exchange;

  -- 2. Trừ xu trong bảng users (không cập nhật updated_at trên users)
  UPDATE public.users
  SET current_coins = v_new_coins
  WHERE id = p_student_id;

  -- 3. Tạo yêu cầu đổi quà ở trạng thái pending
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
    p_choice_type,
    p_coins_to_exchange,
    p_amount_vnd,
    p_shopee_product_url,
    p_shopee_note,
    'pending'
  )
  RETURNING id, created_at INTO v_request_id, v_created_at;

  -- 4. Ghi sổ cái coin_transactions (EXCHANGE_HOLD)
  v_clean_description := NULLIF(TRIM(COALESCE(p_tx_description, '')), '');
  IF v_clean_description IS NULL THEN
    v_clean_description := 'Giữ xu đổi thưởng Heo Đất';
  END IF;

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
    'EXCHANGE_HOLD',
    -p_coins_to_exchange,
    v_current_coins,
    v_new_coins,
    'monthly_exchange_requests',
    v_request_id,
    v_clean_description,
    p_student_id
  )
  RETURNING id INTO v_hold_tx_id;

  -- 5. Liên kết hold_tx_id vào yêu cầu đổi quà
  UPDATE public.monthly_exchange_requests
  SET hold_tx_id = v_hold_tx_id
  WHERE id = v_request_id;

  RETURN jsonb_build_object(
    'request_id', v_request_id,
    'hold_tx_id', v_hold_tx_id,
    'current_coins', v_new_coins,
    'coins_to_exchange', p_coins_to_exchange,
    'amount_vnd', p_amount_vnd,
    'created_at', v_created_at
  );
END;
$function$;
