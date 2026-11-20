-- Migration: Cập nhật hàm get_wheel_config_stats tính toán Dòng tiền xu ròng toàn thời gian (All-time)
CREATE OR REPLACE FUNCTION public.get_wheel_config_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_start_of_today TIMESTAMPTZ;
  v_start_of_yesterday TIMESTAMPTZ;
  v_total_historical_spins INTEGER := 0;
  v_total_spins_today INTEGER := 0;
  v_total_spins_yesterday INTEGER := 0;
  v_total_coins_rewarded_today BIGINT := 0;
  v_total_coins_deducted_today BIGINT := 0;
  v_all_time_rewarded_coins BIGINT := 0;
  v_all_time_spin_fee_collected BIGINT := 0;
  v_all_time_total_collected BIGINT := 0;
  v_all_time_net_coins_flow BIGINT := 0;
  v_hit_counts JSONB := '{}'::jsonb;
BEGIN
  v_start_of_today := (date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')) AT TIME ZONE 'Asia/Ho_Chi_Minh';
  v_start_of_yesterday := v_start_of_today - INTERVAL '1 day';

  SELECT
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE created_at >= v_start_of_today)::INTEGER,
    COUNT(*) FILTER (WHERE created_at >= v_start_of_yesterday AND created_at < v_start_of_today)::INTEGER,
    COALESCE(SUM(reward_coins) FILTER (WHERE created_at >= v_start_of_today AND reward_coins > 0), 0)::BIGINT,
    COALESCE(SUM(spin_cost + CASE WHEN reward_coins < 0 THEN ABS(reward_coins) ELSE 0 END) FILTER (WHERE created_at >= v_start_of_today), 0)::BIGINT,
    COALESCE(SUM(reward_coins) FILTER (WHERE reward_coins > 0), 0)::BIGINT,
    COALESCE(SUM(spin_cost) FILTER (WHERE spin_cost > 0), 0)::BIGINT,
    COALESCE(SUM(spin_cost + CASE WHEN reward_coins < 0 THEN ABS(reward_coins) ELSE 0 END), 0)::BIGINT
  INTO
    v_total_historical_spins,
    v_total_spins_today,
    v_total_spins_yesterday,
    v_total_coins_rewarded_today,
    v_total_coins_deducted_today,
    v_all_time_rewarded_coins,
    v_all_time_spin_fee_collected,
    v_all_time_total_collected
  FROM public.wheel_spins;

  v_all_time_net_coins_flow := v_all_time_rewarded_coins - v_all_time_total_collected;

  SELECT COALESCE(jsonb_object_agg(prize_id, hit_count), '{}'::jsonb)
  INTO v_hit_counts
  FROM (
    SELECT prize_id, COUNT(*)::INTEGER AS hit_count
    FROM public.wheel_spins
    GROUP BY prize_id
  ) sub;

  RETURN jsonb_build_object(
    'total_historical_spins', v_total_historical_spins,
    'total_spins_today', v_total_spins_today,
    'total_spins_yesterday', v_total_spins_yesterday,
    'total_coins_rewarded_today', v_total_coins_rewarded_today,
    'total_coins_deducted_today', v_total_coins_deducted_today,
    'all_time_rewarded_coins', v_all_time_rewarded_coins,
    'all_time_spin_fee_collected', v_all_time_spin_fee_collected,
    'all_time_total_collected', v_all_time_total_collected,
    'all_time_net_coins_flow', v_all_time_net_coins_flow,
    'hit_counts', v_hit_counts
  );
END;
$function$;
