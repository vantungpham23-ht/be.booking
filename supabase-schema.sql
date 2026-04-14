-- ===================================
-- BE. BOOKING — FULL SCHEMA (project mới hoặc reset)
-- Chạy trong Supabase SQL Editor. Xóa toàn bộ bảng cũ (CASCADE).
-- Bước 2 (RLS production + RPC đồng bộ): chạy supabase-policies.sql (đổi UUID admin trong file đó).
-- ===================================

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS stylist_services CASCADE;
DROP TABLE IF EXISTS time_off CASCADE;
DROP TABLE IF EXISTS working_hours CASCADE;
DROP TABLE IF EXISTS stylists CASCADE;
DROP TABLE IF EXISTS services CASCADE;

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mens', 'womens', 'spa', 'massage', 'eyebrow')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active_category ON services(is_active, category, sort_order);

CREATE TABLE stylists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  avatar_url TEXT,
  specialties TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE stylist_services (
  stylist_id UUID NOT NULL REFERENCES stylists(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (stylist_id, service_id)
);

CREATE INDEX idx_stylist_services_service ON stylist_services(service_id);

CREATE TABLE working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stylist_id, day_of_week)
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  service_id UUID REFERENCES services(id),
  stylist_id UUID REFERENCES stylists(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stylist_id UUID REFERENCES stylists(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_stylist ON bookings(stylist_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_working_hours_stylist ON working_hours(stylist_id);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylist_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;

-- Khách + admin (anon): đọc dịch vụ / nhân viên / liên kết / giờ làm
CREATE POLICY "services_select" ON services FOR SELECT USING (true);
CREATE POLICY "services_mutate" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "services_update" ON services FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "services_delete" ON services FOR DELETE USING (true);

CREATE POLICY "stylists_select" ON stylists FOR SELECT USING (true);
CREATE POLICY "stylists_insert" ON stylists FOR INSERT WITH CHECK (true);
CREATE POLICY "stylists_update" ON stylists FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "stylists_delete" ON stylists FOR DELETE USING (true);

CREATE POLICY "stylist_services_select" ON stylist_services FOR SELECT USING (true);
CREATE POLICY "stylist_services_insert" ON stylist_services FOR INSERT WITH CHECK (true);
CREATE POLICY "stylist_services_update" ON stylist_services FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "stylist_services_delete" ON stylist_services FOR DELETE USING (true);

CREATE POLICY "working_hours_all" ON working_hours FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "bookings_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_select" ON bookings FOR SELECT USING (true);
CREATE POLICY "bookings_update" ON bookings FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "time_off_all" ON time_off FOR ALL USING (true) WITH CHECK (true);

-- ========== SEED: dịch vụ (theo cenník trên site) ==========
INSERT INTO services (name, description, duration_minutes, price, category, sort_order) VALUES
('BE SPECIAL COMBO PRE MUŽOV', 'Strih, umytie vlasov, masaz hlavy a sije, maska na tvar, susenie a zaverecny styling', 60, 35, 'mens', 0),
('KLASICKÝ STRIH', 'Classic Haircut — strih strojčekom, nožnicami, umytie vlasov, styling', 30, 15, 'mens', 1),
('STRIH DLHÝCH VLASOV', 'Long Haircut over 20cm — strih nožnicami, umytie vlasov, styling', 40, 18, 'mens', 2),
('DETSKÝ STRIH', 'Kids Haircut — deti do 13 rokov', 30, 10, 'mens', 3),
('ÚPRAVA BRADY BRITVOU', 'Straight Razor Beard Trim', 30, 10, 'mens', 4),
('KOMBINÁCIA STRIH + ÚPRAVA BRADY', 'Combo: Haircut + Beard Trim', 45, 25, 'mens', 5),
('FARBENIE ŠEDÍN', 'Grey Hair Coverage', 25, 20, 'mens', 6),
('ODFARBOVANIE VLASOV', 'Hair Bleaching', 60, 40, 'mens', 7),
('KLASICKÉ FARBENIE VLASOV', 'Classic Hair Coloring', 40, 25, 'mens', 8),
('TRVALÁ ONDULÁCIA VLASOV', 'Men''s Perm', 90, 35, 'mens', 9),

('BE SPECIAL COMBO PRE ŽENY', 'Umytie vlasov, masaz hlavy a sije, kolagenova kura, maska na tvar, susenie Dyson, styling', 105, 65, 'womens', 0),
('FÚKANÁ VLASOV', 'Blow Dry — umytie, sušenie, styling', 20, 15, 'womens', 1),
('STRIHANIE KOMPLET', 'Signature Cut — umytie, strih, sušenie, styling', 45, 21, 'womens', 2),
('FARBENIE BEZ ODFARBOVANIA', 'Essential Color — umytie, sušenie, styling', 100, 40, 'womens', 3),
('MELÍR', 'Highlights — umytie, sušenie, styling', 75, 55, 'womens', 4),
('BALAYAGE', 'Balayage — umytie, sušenie, styling', 200, 80, 'womens', 5),
('ODFARBENIE VLASOV', 'Hair Bleaching — umytie, strih, sušenie, styling', 150, 90, 'womens', 6),
('TRVALÁ ONDULÁCIA VLASOV', 'Perm — umytie, sušenie, styling', 180, 40, 'womens', 7),
('VYROVNÁVANIE VLASOV', 'Hair Straightening Treatment', 320, 65, 'womens', 8),
('KERATÍNOVA REGENERÁCIA', 'Keratin Regeneration', 75, 35, 'womens', 9),
('KOLAGÉNOVA KÚRA', 'Collagen Treatment', 60, 18, 'womens', 10),

('CLASSIC HEAD SPA', 'Umytie vlasov, relaxačná masáž hlavy, tváre, šije a ramien, rúk', 60, 40, 'spa', 1),
('STANDARD HEAD SPA', 'Umytie, masáž hlavy, tváre, šije, ramien, dekoltu, chrbta, rúk, maska, obklady na oči', 75, 55, 'spa', 2),
('LUXURY HEAD SPA', 'Odstránenie make-upu, umývanie tváre, umytie vlasov, masáž full, maska', 90, 65, 'spa', 3),

('RELAXAČNÁ MASÁŽ CELÉHO TELA', 'Relaxing Full Body Massage', 60, 40, 'massage', 1),
('TERAPEUTICKÁ MASÁŽ CELÉHO TELA', 'Therapeutic Full Body Massage', 90, 60, 'massage', 2),

('ÚPRAVA OBOČIA (PINZETOU)', 'Eyebrow shaping (tweezers)', 30, 7, 'eyebrow', 1),
('ZASTRIHÁVANIE OBOČIA', 'Eyebrow trimming', 20, 5, 'eyebrow', 2),
('FARBENIE OBOČIA', 'Eyebrow coloring', 30, 8, 'eyebrow', 3);

INSERT INTO stylists (name, phone, email, specialties, is_active) VALUES
('Quan K.', NULL, NULL, ARRAY['Men''s grooming', 'Beard'], true),
('Son Ngo.', NULL, NULL, ARRAY['Color', 'Women''s cuts'], true),
('Hank.', NULL, NULL, ARRAY['Head spa', 'Massage'], true);

DO $$
DECLARE
  r RECORD;
  dow INTEGER;
BEGIN
  FOR r IN SELECT id FROM stylists LOOP
    FOR dow IN 1..5 LOOP
      INSERT INTO working_hours (stylist_id, day_of_week, start_time, end_time)
      VALUES (r.id, dow, '09:00', '19:00');
    END LOOP;
    INSERT INTO working_hours (stylist_id, day_of_week, start_time, end_time)
    VALUES (r.id, 6, '09:00', '18:00');
    INSERT INTO working_hours (stylist_id, day_of_week, start_time, end_time)
    VALUES (r.id, 0, '10:00', '17:00');
  END LOOP;
END $$;

-- Ai làm dịch vụ nào (theo team: barber / salon / spa)
INSERT INTO stylist_services (stylist_id, service_id)
SELECT st.id, sv.id FROM stylists st CROSS JOIN services sv
WHERE st.name = 'Quan K.' AND sv.category IN ('mens', 'eyebrow');

INSERT INTO stylist_services (stylist_id, service_id)
SELECT st.id, sv.id FROM stylists st CROSS JOIN services sv
WHERE st.name = 'Son Ngo.' AND sv.category IN ('womens', 'eyebrow');

INSERT INTO stylist_services (stylist_id, service_id)
SELECT st.id, sv.id FROM stylists st CROSS JOIN services sv
WHERE st.name = 'Hank.' AND sv.category IN ('spa', 'massage');

-- ========== RPC ==========
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
  -- Calendar “today” in Slovakia (Europe/Bratislava), not UTC server date
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
    -- Drop slots that already started (wall clock in Slovakia)
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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
