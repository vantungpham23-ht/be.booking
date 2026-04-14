-- Run in Supabase SQL Editor if you already have get_available_slots (updates in place).
-- Uses Europe/Bratislava for: “today”, and hiding past time slots on the current day.

CREATE OR REPLACE FUNCTION get_available_slots(
  p_stylist_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER
)
RETURNS TABLE (
  slot_time TIME
) AS $$
DECLARE
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
  v_current_time TIME;
  v_slot_interval INTERVAL;
  v_today_sk DATE;
BEGIN
  v_today_sk := (timezone('Europe/Bratislava', now()))::date;
  IF p_date < v_today_sk THEN
    RETURN;
  END IF;

  v_day_of_week := EXTRACT(DOW FROM p_date);

  SELECT wh.start_time, wh.end_time INTO v_start_time, v_end_time
  FROM working_hours wh
  WHERE wh.stylist_id = p_stylist_id AND wh.day_of_week = v_day_of_week;

  IF v_start_time IS NULL THEN
    RETURN;
  END IF;

  v_slot_interval := (p_duration_minutes || ' minutes')::INTERVAL;
  v_current_time := v_start_time;

  WHILE v_current_time + v_slot_interval <= v_end_time LOOP
    IF p_date = v_today_sk
       AND ((p_date + v_current_time) AT TIME ZONE 'Europe/Bratislava') <= now() THEN
      v_current_time := v_current_time + INTERVAL '30 minutes';
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.stylist_id = p_stylist_id
        AND b.booking_date = p_date
        AND b.status NOT IN ('cancelled')
        AND (
          (b.start_time <= v_current_time AND b.end_time > v_current_time)
          OR (b.start_time < v_current_time + v_slot_interval AND b.end_time >= v_current_time + v_slot_interval)
          OR (b.start_time >= v_current_time AND b.end_time <= v_current_time + v_slot_interval)
        )
    ) THEN
      slot_time := v_current_time;
      RETURN NEXT;
    END IF;

    v_current_time := v_current_time + INTERVAL '30 minutes';
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

GRANT EXECUTE ON FUNCTION get_available_slots(UUID, DATE, INTEGER) TO anon, authenticated;
