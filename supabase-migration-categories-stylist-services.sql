-- ===================================
-- MIGRATION: DB đã có sẵn bảng cũ (không có category / stylist_services)
-- Chạy từng khối; nếu báo "already exists" thì bỏ qua dòng đó.
-- ===================================

-- 1) Cột phân vùng + thứ tự hiển thị
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'mens';
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE services DROP CONSTRAINT IF EXISTS services_category_check;
ALTER TABLE services ADD CONSTRAINT services_category_check
  CHECK (category IN ('mens', 'womens', 'spa', 'massage', 'eyebrow'));

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active_category ON services(is_active, category, sort_order);

-- 2) Bảng nối nhân viên ↔ dịch vụ
CREATE TABLE IF NOT EXISTS stylist_services (
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (stylist_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_stylist_services_service ON stylist_services(service_id);

ALTER TABLE stylist_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stylist_services_select" ON stylist_services;
DROP POLICY IF EXISTS "stylist_services_insert" ON stylist_services;
DROP POLICY IF EXISTS "stylist_services_update" ON stylist_services;
DROP POLICY IF EXISTS "stylist_services_delete" ON stylist_services;

CREATE POLICY "stylist_services_select" ON stylist_services FOR SELECT USING (true);
CREATE POLICY "stylist_services_insert" ON stylist_services FOR INSERT WITH CHECK (true);
CREATE POLICY "stylist_services_update" ON stylist_services FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "stylist_services_delete" ON stylist_services FOR DELETE USING (true);

-- 3) Gán tạm: mọi stylist ↔ mọi dịch vụ (vào Admin chỉnh lại cho đúng)
INSERT INTO stylist_services (stylist_id, service_id)
SELECT s.id, v.id FROM stylists s CROSS JOIN services v
ON CONFLICT DO NOTHING;

-- 4) Cho admin sửa dịch vụ / nhân viên qua anon (tạm — nên dùng Auth sau)
DROP POLICY IF EXISTS "Public can view services" ON services;
DROP POLICY IF EXISTS "services_select" ON services;
DROP POLICY IF EXISTS "services_mutate" ON services;
DROP POLICY IF EXISTS "services_update" ON services;
DROP POLICY IF EXISTS "services_delete" ON services;

CREATE POLICY "services_select" ON services FOR SELECT USING (true);
CREATE POLICY "services_insert" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "services_update" ON services FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "services_delete" ON services FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public can view stylists" ON stylists;
DROP POLICY IF EXISTS "stylists_select" ON stylists;

CREATE POLICY "stylists_select" ON stylists FOR SELECT USING (true);
CREATE POLICY "stylists_insert" ON stylists FOR INSERT WITH CHECK (true);
CREATE POLICY "stylists_update" ON stylists FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "stylists_delete" ON stylists FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public can view working hours" ON working_hours;
DROP POLICY IF EXISTS "working_hours_all" ON working_hours;
CREATE POLICY "working_hours_all" ON working_hours FOR ALL USING (true) WITH CHECK (true);

-- 5) RPC (giữ nguyên nếu đã có)
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
