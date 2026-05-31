-- ═══════════════════════════════════════════════════════════════
-- Marketplace sample data — 6 suppliers, ~16 products, 9 reviews
-- ═══════════════════════════════════════════════════════════════
-- Safe to re-run: uses `on conflict do nothing` keyed on a deterministic id.
-- Run AFTER 20260527_marketplace.sql.
-- ═══════════════════════════════════════════════════════════════

-- 6 suppliers covering the categories we showcase on the landing page.
insert into suppliers (
  id, legal_name, trade_name, country, city, established_year, staff_count,
  factory_size_sqm, business_license_no,
  is_verified, verified_at, verified_by, trade_assurance,
  response_rate, response_hours_avg, on_time_delivery_rate,
  main_categories, main_markets, export_volume_usd_yearly,
  supports_form_e, supports_form_aj, supports_form_ak, supports_form_d, supports_form_rcep,
  contact_name, wechat_id, whatsapp, email, website,
  rating, review_count
) values
  (
    '11111111-1111-1111-1111-111111111111',
    '深圳市先进储能科技有限公司',
    'Shenzhen Advanced Energy Tech',
    'CN', 'Shenzhen', 2014, 420, 18000, '91440300MA5DXXXX01',
    true, now(), 'SGS · 2025', true,
    96.4, 3, 94.7,
    ARRAY['8504','8507','8541'],
    ARRAY['TH','VN','ID','MY','DE'],
    28400000,
    true, false, false, false, true,
    'Amy Chen', 'shenzhen-aet', '+86 138 1234 5678', 'sales@aet.cn', 'https://aet.cn',
    4.8, 142
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '义乌市鸿运纺织品有限公司',
    'Yiwu Hongyun Textile Co.',
    'CN', 'Yiwu', 2008, 180, 9500, '91330782MA2BXXXX02',
    true, now(), 'BV · 2024', true,
    88.1, 5, 91.2,
    ARRAY['6109','6302','6307'],
    ARRAY['TH','PH','ID','JP'],
    6200000,
    true, true, false, false, true,
    'Lily Wang', 'hongyun-textile', null, 'lily@hongyun-tex.cn', null,
    4.6, 89
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Hanoi Precision Components JSC',
    'Hanoi Precision',
    'VN', 'Hanoi', 2011, 260, 12000, '0101234567',
    true, now(), 'TÜV · 2024', false,
    92.0, 6, 89.5,
    ARRAY['8483','7318','8708'],
    ARRAY['TH','MY','SG','US'],
    9800000,
    false, false, false, true, true,
    'Nguyen Minh', null, '+84 90 222 3344', 'sales@hanoiprecision.vn', null,
    4.5, 67
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '广州市美韵化妆品有限公司',
    'Guangzhou Meiyun Cosmetics',
    'CN', 'Guangzhou', 2016, 95, 4200, '91440101MA5CXXXX04',
    true, now(), 'in-house · 2025', true,
    94.7, 2, 96.0,
    ARRAY['3304','3307','3401'],
    ARRAY['TH','KR','MY','SG'],
    4100000,
    true, false, false, false, false,
    'Cathy Liu', 'meiyun-gz', '+86 137 8888 7777', 'cathy@meiyun.cn', 'https://meiyun.cn',
    4.7, 203
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Seoul Smart Living Co., Ltd.',
    'Seoul Smart Living',
    'KR', 'Seoul', 2017, 64, 2800, '120-86-12345',
    true, now(), 'SGS · 2024', true,
    91.0, 4, 92.4,
    ARRAY['8516','8509','8543'],
    ARRAY['TH','VN','JP','US'],
    3500000,
    false, false, true, false, true,
    'Park Min-jun', null, '+82 10 1234 5678', 'sales@seoulsmart.kr', 'https://seoulsmart.kr',
    4.7, 58
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '宁波环球家居制造有限公司',
    'Ningbo Global Home Mfg',
    'CN', 'Ningbo', 2005, 510, 25000, '91330200MA2NXXXX06',
    true, now(), 'BV · 2025', true,
    89.5, 5, 88.9,
    ARRAY['9403','9404','9405'],
    ARRAY['TH','PH','AU','DE','US'],
    18200000,
    true, false, false, false, true,
    'Jacky Zhou', 'ningbo-global', '+86 139 5555 0001', 'jacky@ngh.cn', 'https://ngh.cn',
    4.4, 174
  )
on conflict (id) do nothing;

-- ─── Supplier products ───────────────────────────────────────────
-- Shenzhen Advanced Energy Tech (sup-001) — solar/battery
insert into supplier_products (
  id, supplier_id, name_en, name_th, description, category,
  hs_code, hs_confidence, moq, moq_unit, price_min_usd, price_max_usd,
  price_unit, payment_terms, lead_time_days_min, lead_time_days_max,
  ships_from_port, hs_form_eligible, certifications, total_sold_units, view_count
) values
  (
    'aaaaaaaa-1111-0001-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Hybrid Solar Inverter 5kW',
    'อินเวอร์เตอร์ไฮบริด 5kW คลื่นไซน์บริสุทธิ์ 48V',
    'Hybrid solar inverter 5kW pure sine wave, 48V battery, MPPT controller, LCD display, 2-year warranty',
    'Solar / Inverter', '8504.40.90', 0.94,
    10, 'pcs', 720, 880,
    'pcs', ARRAY['TT','LC'], 18, 25,
    'CNSHK Shekou', ARRAY['Form E','Form RCEP'], ARRAY['CE','FCC','RoHS'],
    1240, 5820
  ),
  (
    'aaaaaaaa-1111-0001-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'LiFePO4 Battery 48V 100Ah',
    'แบตเตอรี่ลิเธียมไอออน LiFePO4 48V 100Ah พร้อม BMS',
    'LiFePO4 battery pack 48V 100Ah with smart BMS, 6000+ cycles, communication port RS485/CAN',
    'Solar / Battery', '8507.60.00', 0.96,
    8, 'pcs', 980, 1280,
    'pcs', ARRAY['TT','LC'], 20, 28,
    'CNSHK Shekou', ARRAY['Form E','Form RCEP'], ARRAY['CE','UN38.3','MSDS'],
    890, 4120
  ),
  (
    'aaaaaaaa-1111-0001-0000-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'MPPT Solar Charge Controller 60A',
    'ตัวควบคุมการชาร์จโซลาร์ MPPT 60A 12/24/48V',
    'MPPT solar charge controller 60A, auto 12/24/48V, Bluetooth monitoring',
    'Solar / Controller', '8504.40.90', 0.91,
    20, 'pcs', 85, 135,
    'pcs', ARRAY['TT','PayPal'], 15, 20,
    'CNSHK Shekou', ARRAY['Form E','Form RCEP'], ARRAY['CE','RoHS'],
    2150, 7340
  )
on conflict (id) do nothing;

-- Yiwu Hongyun Textile (sup-002)
insert into supplier_products (
  id, supplier_id, name_en, name_th, description, category,
  hs_code, hs_confidence, moq, moq_unit, price_min_usd, price_max_usd,
  price_unit, payment_terms, lead_time_days_min, lead_time_days_max,
  ships_from_port, hs_form_eligible, certifications, total_sold_units, view_count
) values
  (
    'aaaaaaaa-2222-0002-0000-000000000001',
    '22222222-2222-2222-2222-222222222222',
    'Cotton T-Shirt 180gsm OEM',
    'เสื้อยืดคอตตอน 180gsm OEM ผลิตตามแบบ',
    '100% combed cotton 180gsm, custom print/embroidery, MOQ 300pcs',
    'Apparel / Knit', '6109.10.00', 0.97,
    300, 'pcs', 2.4, 4.2,
    'pcs', ARRAY['TT','LC','OA'], 25, 35,
    'CNNGB Ningbo', ARRAY['Form E','Form RCEP'], ARRAY['OEKO-TEX','BSCI'],
    18400, 9120
  ),
  (
    'aaaaaaaa-2222-0002-0000-000000000002',
    '22222222-2222-2222-2222-222222222222',
    'Sherpa Fleece Throw Blanket',
    'ผ้าห่ม Sherpa fleece สองชั้น 150×200cm',
    'Two-tone sherpa fleece blanket, 150×200cm, customizable embroidery',
    'Home textiles', '6301.40.00', 0.93,
    500, 'pcs', 5.5, 8.8,
    'pcs', ARRAY['TT','LC'], 28, 38,
    'CNNGB Ningbo', ARRAY['Form E','Form RCEP'], ARRAY['OEKO-TEX'],
    6800, 3210
  )
on conflict (id) do nothing;

-- Hanoi Precision (sup-003)
insert into supplier_products (
  id, supplier_id, name_en, name_th, description, category,
  hs_code, hs_confidence, moq, moq_unit, price_min_usd, price_max_usd,
  price_unit, payment_terms, lead_time_days_min, lead_time_days_max,
  ships_from_port, hs_form_eligible, certifications, total_sold_units, view_count
) values
  (
    'aaaaaaaa-3333-0003-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'Precision CNC Machined Aluminum Brackets',
    'เหล็กยึด CNC อะลูมิเนียมความแม่นยำสูง',
    'Custom CNC-machined aluminum brackets, tolerance ±0.05mm, anodized finish',
    'Hardware / Machined', '7616.99.90', 0.88,
    100, 'pcs', 1.8, 3.6,
    'pcs', ARRAY['TT'], 14, 21,
    'VNHPH Haiphong', ARRAY['Form D','Form RCEP'], ARRAY['ISO 9001','IATF 16949'],
    4520, 2180
  ),
  (
    'aaaaaaaa-3333-0003-0000-000000000002',
    '33333333-3333-3333-3333-333333333333',
    'Stainless Steel Hex Bolts M8-M16',
    'น็อตหัวหกเหลี่ยมสแตนเลส M8-M16 304/A2',
    'SS304 hex bolts, full thread, DIN 933 standard, M8-M16 sizes',
    'Hardware / Fasteners', '7318.15.90', 0.95,
    5000, 'pcs', 0.08, 0.18,
    'pcs', ARRAY['TT','LC'], 12, 18,
    'VNHPH Haiphong', ARRAY['Form D'], ARRAY['ISO 9001'],
    98400, 6240
  )
on conflict (id) do nothing;

-- Guangzhou Meiyun Cosmetics (sup-004)
insert into supplier_products (
  id, supplier_id, name_en, name_th, description, category,
  hs_code, hs_confidence, moq, moq_unit, price_min_usd, price_max_usd,
  price_unit, payment_terms, lead_time_days_min, lead_time_days_max,
  ships_from_port, hs_form_eligible, certifications, total_sold_units, view_count
) values
  (
    'aaaaaaaa-4444-0004-0000-000000000001',
    '44444444-4444-4444-4444-444444444444',
    'Vitamin C Brightening Serum 30ml',
    'เซรั่มวิตามินซี 20% เพิ่มความสว่าง 30ml',
    '20% Vitamin C ascorbic acid serum, 30ml, OEM/ODM, GMP-certified facility',
    'Cosmetics / Serum', '3304.99.00', 0.92,
    1000, 'pcs', 1.6, 2.8,
    'pcs', ARRAY['TT','PayPal'], 22, 30,
    'CNCAN Guangzhou', ARRAY['Form E'], ARRAY['GMP','ISO 22716','FDA'],
    12400, 8450
  ),
  (
    'aaaaaaaa-4444-0004-0000-000000000002',
    '44444444-4444-4444-4444-444444444444',
    'Hyaluronic Acid Moisturizer 50ml',
    'มอยส์เจอร์ไรเซอร์ไฮยาลูรอน 50ml',
    'Hyaluronic acid + niacinamide moisturizer 50ml, sensitive-skin-safe',
    'Cosmetics / Skincare', '3304.99.00', 0.90,
    1000, 'pcs', 1.9, 3.4,
    'pcs', ARRAY['TT','PayPal'], 22, 30,
    'CNCAN Guangzhou', ARRAY['Form E'], ARRAY['GMP','ISO 22716'],
    9200, 5640
  ),
  (
    'aaaaaaaa-4444-0004-0000-000000000003',
    '44444444-4444-4444-4444-444444444444',
    'Sunscreen SPF50+ PA++++ 50ml',
    'ครีมกันแดด SPF50+ PA++++ 50ml',
    'Broad-spectrum mineral sunscreen, reef-safe, MOQ 1000pcs',
    'Cosmetics / Sunscreen', '3304.99.00', 0.91,
    1000, 'pcs', 2.2, 3.8,
    'pcs', ARRAY['TT','LC'], 25, 32,
    'CNCAN Guangzhou', ARRAY['Form E'], ARRAY['GMP','ISO 22716'],
    7400, 4120
  )
on conflict (id) do nothing;

-- Seoul Smart Living (sup-005)
insert into supplier_products (
  id, supplier_id, name_en, name_th, description, category,
  hs_code, hs_confidence, moq, moq_unit, price_min_usd, price_max_usd,
  price_unit, payment_terms, lead_time_days_min, lead_time_days_max,
  ships_from_port, hs_form_eligible, certifications, total_sold_units, view_count
) values
  (
    'aaaaaaaa-5555-0005-0000-000000000001',
    '55555555-5555-5555-5555-555555555555',
    'Smart Air Purifier HEPA H13 Tuya',
    'เครื่องฟอกอากาศ HEPA H13 + Tuya WiFi',
    'Smart air purifier with HEPA H13, Tuya WiFi app, voice control (Alexa/Google)',
    'Home Appliances / Air', '8421.39.20', 0.93,
    50, 'pcs', 78, 118,
    'pcs', ARRAY['TT','LC'], 20, 28,
    'KRPUS Busan', ARRAY['Form AK','Form RCEP'], ARRAY['CE','FCC','KC'],
    3140, 4980
  ),
  (
    'aaaaaaaa-5555-0005-0000-000000000002',
    '55555555-5555-5555-5555-555555555555',
    'Robotic Vacuum Cleaner LiDAR',
    'หุ่นยนต์ดูดฝุ่น LiDAR mapping + ถังน้ำ',
    'LiDAR-mapping robot vacuum + mop combo, 4200Pa suction, app control',
    'Home Appliances / Cleaning', '8509.80.00', 0.94,
    30, 'pcs', 145, 215,
    'pcs', ARRAY['TT','LC'], 22, 30,
    'KRPUS Busan', ARRAY['Form AK','Form RCEP'], ARRAY['CE','FCC'],
    1820, 3120
  )
on conflict (id) do nothing;

-- Ningbo Global Home Mfg (sup-006)
insert into supplier_products (
  id, supplier_id, name_en, name_th, description, category,
  hs_code, hs_confidence, moq, moq_unit, price_min_usd, price_max_usd,
  price_unit, payment_terms, lead_time_days_min, lead_time_days_max,
  ships_from_port, hs_form_eligible, certifications, total_sold_units, view_count
) values
  (
    'aaaaaaaa-6666-0006-0000-000000000001',
    '66666666-6666-6666-6666-666666666666',
    'Office Chair Ergonomic Mesh High-Back',
    'เก้าอี้สำนักงาน ergonomic ตาข่ายพนักสูง',
    'Ergonomic mesh high-back office chair with lumbar support, adjustable armrests',
    'Furniture / Office', '9401.30.00', 0.93,
    100, 'pcs', 38, 62,
    'pcs', ARRAY['TT','LC'], 30, 40,
    'CNNGB Ningbo', ARRAY['Form E','Form RCEP'], ARRAY['BIFMA','SGS'],
    14200, 8920
  ),
  (
    'aaaaaaaa-6666-0006-0000-000000000002',
    '66666666-6666-6666-6666-666666666666',
    'LED Pendant Lamp Modern Living Room',
    'โคมไฟห้อยเพดาน LED โมเดิร์น',
    'Modern LED pendant chandelier, adjustable color temp, dimmer-ready',
    'Lighting', '9405.10.40', 0.89,
    150, 'pcs', 14, 28,
    'pcs', ARRAY['TT'], 25, 35,
    'CNNGB Ningbo', ARRAY['Form E','Form RCEP'], ARRAY['CE','RoHS'],
    8400, 4810
  )
on conflict (id) do nothing;

-- ─── Sample reviews ─────────────────────────────────────────────
-- The org_id below is a placeholder. Skip if no orgs exist yet.
-- We deliberately use a NULL-safe insert via a subquery that picks the
-- first available org (if any). Safe to skip entirely on a fresh DB.
do $$
declare
  v_org uuid;
begin
  select id into v_org from organizations limit 1;
  if v_org is null then return; end if;

  -- Reviews for Shenzhen Advanced Energy Tech
  insert into supplier_reviews (
    id, supplier_id, org_id, rating, quality_rating, communication_rating,
    delivery_rating, title, body, would_reorder, verified_purchase
  ) values
    ('bbbbbbbb-1111-0001-0000-000000000001',
     '11111111-1111-1111-1111-111111111111', v_org,
     5, 5, 5, 5, 'ประหยัดอากรไปเกือบ ฿80,000',
     'สั่ง inverter 30 ตัว ได้ Form E ครบทุกใบ ลดอากรเหลือ 0% ทีม Amy ตอบเร็ว ส่งของตรงเวลา 19 วัน CIF Bangkok แนะนำเลย',
     true, true),
    ('bbbbbbbb-1111-0001-0000-000000000002',
     '11111111-1111-1111-1111-111111111111', v_org,
     4, 5, 4, 3, 'คุณภาพดี แต่ delay นิดหน่อย',
     'Packaging แน่นหนา รอบนี้ delay ไป 5 วันเพราะปัญหาการจองตู้ container ติดเทศกาลตรุษจีน',
     true, true),
    ('bbbbbbbb-1111-0001-0000-000000000003',
     '11111111-1111-1111-1111-111111111111', v_org,
     5, 5, 5, 5, 'ทำงานด้วยมา 3 ครั้งแล้ว',
     'ไม่เคยมีปัญหา ของถึงทุกครั้ง batch ล่าสุดมี QC report ครบทุกตัว',
     true, true),
    -- Yiwu Hongyun
    ('bbbbbbbb-2222-0002-0000-000000000001',
     '22222222-2222-2222-2222-222222222222', v_org,
     5, 5, 5, 4, 'OEM brand ส่งของได้สวย',
     'สั่งเสื้อยืด 1,500 ตัวพิมพ์ลายแบรนด์ตัวเอง คุณภาพดีมาก ผ้าหนาเหมือนตัวอย่าง',
     true, true),
    ('bbbbbbbb-2222-0002-0000-000000000002',
     '22222222-2222-2222-2222-222222222222', v_org,
     4, 4, 5, 4, 'ตอบเร็วดี',
     'Lily ตอบ WeChat เร็ว ภาษาอังกฤษเข้าใจได้ง่าย ส่งของ on-time',
     true, true),
    -- Hanoi Precision
    ('bbbbbbbb-3333-0003-0000-000000000001',
     '33333333-3333-3333-3333-333333333333', v_org,
     5, 5, 5, 5, 'CNC ความแม่นยำดีเยี่ยม',
     'ใช้ทำ jig fixture สำหรับ assembly line ความแม่นยำ ±0.03mm ตามคาด',
     true, true),
    -- Meiyun
    ('bbbbbbbb-4444-0004-0000-000000000001',
     '44444444-4444-4444-4444-444444444444', v_org,
     5, 5, 5, 5, 'GMP มาตรฐานดี',
     'OEM เซรั่มแบรนด์ตัวเอง ผ่านการตรวจ อย. ไทยได้ทันที',
     true, true),
    -- Seoul Smart Living
    ('bbbbbbbb-5555-0005-0000-000000000001',
     '55555555-5555-5555-5555-555555555555', v_org,
     5, 5, 4, 5, 'Smart features ครบ',
     'App ใช้ง่าย เชื่อมต่อ Tuya ได้ เสียงรบกวนต่ำ ขายดีในไทยมาก',
     true, true),
    -- Ningbo Global
    ('bbbbbbbb-6666-0006-0000-000000000001',
     '66666666-6666-6666-6666-666666666666', v_org,
     4, 4, 4, 5, 'เก้าอี้ทนทาน',
     'BIFMA-certified จริง รับน้ำหนักได้ดี ส่งของทั้ง container ไม่มีของเสียหาย',
     true, true)
  on conflict (id) do nothing;
end$$;

-- ✓ Done. 6 suppliers + ~16 products + 9 reviews seeded.
-- Visit /marketplace to see them rendered.
