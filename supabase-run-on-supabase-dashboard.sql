-- =============================================================================
-- BE. BOOKING — CHẠY TRONG SUPABASE: SQL Editor → New query → Run
-- =============================================================================
--
-- Mục tiêu:
--   • Trang chủ / đặt lịch dùng ANON KEY: chỉ đọc menu + đặt lịch (insert booking),
--     KHÔNG xem/sửa booking của người khác, KHÔNG sửa dịch vụ/nhân viên.
--   • /admin: app bắt login; sau khi đăng nhập Supabase Auth, JWT gửi kèm request
--     với role "authenticated" — chỉ đúng UUID admin bên dưới mới có TOÀN QUYỀN CRUD.
--
-- Trước khi chạy: tạo user admin (Authentication → Users), copy User UID,
-- sửa dòng UUID nếu khác với env NEXT_PUBLIC_ALLOWED_ADMIN_USER_ID.
--
-- Có thể chạy lại file (idempotent): DROP IF EXISTS trước khi CREATE.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) UUID ADMIN — THAY NẾU CẦN (hiện tại trùng user bạn đã tạo)
-- -----------------------------------------------------------------------------
-- 3c0ac872-fea8-4051-8d14-12cc04e470ee

-- -----------------------------------------------------------------------------
-- 2) Xóa mọi policy cũ / trùng tên (schema gốc + migration cũ + bản RLS trước)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "services_select" ON services;
DROP POLICY IF EXISTS "services_mutate" ON services;
DROP POLICY IF EXISTS "services_update" ON services;
DROP POLICY IF EXISTS "services_delete" ON services;
DROP POLICY IF EXISTS "services_insert" ON services;
DROP POLICY IF EXISTS "Public can view services" ON services;
DROP POLICY IF EXISTS "services_anon_select_active" ON services;
DROP POLICY IF EXISTS "services_admin_all" ON services;

DROP POLICY IF EXISTS "stylists_select" ON stylists;
DROP POLICY IF EXISTS "stylists_insert" ON stylists;
DROP POLICY IF EXISTS "stylists_update" ON stylists;
DROP POLICY IF EXISTS "stylists_delete" ON stylists;
DROP POLICY IF EXISTS "Public can view stylists" ON stylists;
DROP POLICY IF EXISTS "stylists_anon_select_active" ON stylists;
DROP POLICY IF EXISTS "stylists_admin_all" ON stylists;

DROP POLICY IF EXISTS "stylist_services_select" ON stylist_services;
DROP POLICY IF EXISTS "stylist_services_insert" ON stylist_services;
DROP POLICY IF EXISTS "stylist_services_update" ON stylist_services;
DROP POLICY IF EXISTS "stylist_services_delete" ON stylist_services;
DROP POLICY IF EXISTS "stylist_services_anon_select" ON stylist_services;
DROP POLICY IF EXISTS "stylist_services_admin_all" ON stylist_services;

DROP POLICY IF EXISTS "working_hours_all" ON working_hours;
DROP POLICY IF EXISTS "Public can view working hours" ON working_hours;
DROP POLICY IF EXISTS "working_hours_anon_select" ON working_hours;
DROP POLICY IF EXISTS "working_hours_admin_all" ON working_hours;

DROP POLICY IF EXISTS "bookings_insert" ON bookings;
DROP POLICY IF EXISTS "bookings_select" ON bookings;
DROP POLICY IF EXISTS "bookings_update" ON bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Public can update bookings" ON bookings;
DROP POLICY IF EXISTS "bookings_anon_insert" ON bookings;
DROP POLICY IF EXISTS "bookings_admin_select" ON bookings;
DROP POLICY IF EXISTS "bookings_admin_update" ON bookings;
DROP POLICY IF EXISTS "bookings_admin_all" ON bookings;
DROP POLICY IF EXISTS "bookings_authenticated_customer_insert" ON bookings;

DROP POLICY IF EXISTS "time_off_all" ON time_off;
DROP POLICY IF EXISTS "time_off_admin_all" ON time_off;

-- -----------------------------------------------------------------------------
-- 3) Bật RLS (an toàn nếu đã bật)
-- -----------------------------------------------------------------------------
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4) ANON — chỉ đọc dữ liệu public + tạo booking (khách)
-- -----------------------------------------------------------------------------
CREATE POLICY "services_anon_select_active"
  ON services FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "stylists_anon_select_active"
  ON stylists FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "stylist_services_anon_select"
  ON stylist_services FOR SELECT TO anon
  USING (true);

CREATE POLICY "working_hours_anon_select"
  ON working_hours FOR SELECT TO anon
  USING (true);

-- Anon: INSERT only (no SELECT). Client must not use .select() after insert — use a client-generated UUID.
CREATE POLICY "bookings_anon_insert"
  ON bookings FOR INSERT TO anon
  WITH CHECK (true);

-- Khách đã login Supabase (không phải admin) vẫn đặt lịch được — tránh lỗi khi session admin còn trên cùng trình duyệt.
CREATE POLICY "bookings_authenticated_customer_insert"
  ON bookings FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS DISTINCT FROM '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid);

-- -----------------------------------------------------------------------------
-- 5) AUTHENTICATED — chỉ UUID admin: TOÀN QUYỀN (trùng với login /admin)
-- -----------------------------------------------------------------------------
CREATE POLICY "services_admin_all"
  ON services FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid)
  WITH CHECK ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid);

CREATE POLICY "stylists_admin_all"
  ON stylists FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid)
  WITH CHECK ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid);

CREATE POLICY "stylist_services_admin_all"
  ON stylist_services FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid)
  WITH CHECK ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid);

CREATE POLICY "working_hours_admin_all"
  ON working_hours FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid)
  WITH CHECK ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid);

CREATE POLICY "bookings_admin_all"
  ON bookings FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid)
  WITH CHECK ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid);

CREATE POLICY "time_off_admin_all"
  ON time_off FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid)
  WITH CHECK ((SELECT auth.uid()) = '3c0ac872-fea8-4051-8d14-12cc04e470ee'::uuid);

-- -----------------------------------------------------------------------------
-- 6) RPC giờ trống — anon vẫn gọi được khi đặt lịch
--     Ngày “hôm nay” + ẩn slot đã qua: Europe/Bratislava (Slovakia)
-- -----------------------------------------------------------------------------
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

GRANT EXECUTE ON FUNCTION get_available_slots(uuid, date, integer) TO anon, authenticated;

-- =============================================================================
-- Xong. Kiểm tra: đặt lịch từ site (anon) vẫn chạy; /admin sau login mới sửa DB.
-- =============================================================================
