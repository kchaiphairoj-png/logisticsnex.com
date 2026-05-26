/**
 * Mock data for the marketplace pages. In production this lives in Supabase
 * (`suppliers`, `supplier_products`, `rfqs`, `quotes` tables — see
 * supabase/migrations/20260527_marketplace.sql).
 */

export type Supplier = {
  id: string;
  legal_name: string;
  trade_name: string;
  country: string;       // ISO-2
  country_flag: string;  // emoji
  city: string;
  established_year: number;
  staff_count: number;
  factory_size_sqm: number;
  is_verified: boolean;
  verified_by?: string;
  trade_assurance: boolean;
  response_rate: number;
  response_hours_avg: number;
  on_time_delivery_rate: number;
  main_categories: { name: string; hs_chapter: string }[];
  main_markets: string[];
  export_volume_usd_yearly: number;
  supports_form_e: boolean;
  supports_form_rcep: boolean;
  certifications: string[];
  rating: number;
  review_count: number;
  ships_to_thailand_days_min: number;
  ships_to_thailand_days_max: number;
  ships_from_port: string;
  wechat_id?: string;
  whatsapp?: string;
  email?: string;
  description: string;
  product_count: number;
};

export const suppliers: Supplier[] = [
  {
    id: "sup-001",
    legal_name: "深圳市先进储能科技有限公司",
    trade_name: "Shenzhen Advanced Energy Tech",
    country: "CN",
    country_flag: "🇨🇳",
    city: "Shenzhen",
    established_year: 2014,
    staff_count: 420,
    factory_size_sqm: 18_000,
    is_verified: true,
    verified_by: "SGS · 2025",
    trade_assurance: true,
    response_rate: 96.4,
    response_hours_avg: 3,
    on_time_delivery_rate: 94.7,
    main_categories: [
      { name: "Lithium-ion batteries", hs_chapter: "8507" },
      { name: "Solar charge controllers", hs_chapter: "8504" },
      { name: "Hybrid inverters", hs_chapter: "8504" },
    ],
    main_markets: ["TH", "VN", "ID", "MY", "DE"],
    export_volume_usd_yearly: 28_400_000,
    supports_form_e: true,
    supports_form_rcep: true,
    certifications: ["CE", "FCC", "RoHS", "UN38.3", "ISO9001"],
    rating: 4.8,
    review_count: 142,
    ships_to_thailand_days_min: 18,
    ships_to_thailand_days_max: 25,
    ships_from_port: "CNSHK Shekou",
    wechat_id: "shenzhen-aet",
    whatsapp: "+86 138 1234 5678",
    email: "sales@aet.cn",
    description:
      "ผู้ผลิตชั้นนำด้านแบตเตอรี่ลิเธียมไอออนและ inverter สำหรับระบบ off-grid solar เปิดโรงงานปี 2014 ที่ Shenzhen ส่งออกไปกว่า 30 ประเทศ ลูกค้าหลักในไทยกว่า 40 ราย ออก Form E ให้ฟรีทุก shipment",
    product_count: 184,
  },
  {
    id: "sup-002",
    legal_name: "义乌市鸿运纺织品有限公司",
    trade_name: "Yiwu Hongyun Textile Co.",
    country: "CN",
    country_flag: "🇨🇳",
    city: "Yiwu",
    established_year: 2008,
    staff_count: 180,
    factory_size_sqm: 9_500,
    is_verified: true,
    verified_by: "BV · 2024",
    trade_assurance: true,
    response_rate: 88.1,
    response_hours_avg: 5,
    on_time_delivery_rate: 91.2,
    main_categories: [
      { name: "Knit garments", hs_chapter: "6109" },
      { name: "Home textiles", hs_chapter: "6302" },
    ],
    main_markets: ["TH", "PH", "ID", "JP"],
    export_volume_usd_yearly: 6_200_000,
    supports_form_e: true,
    supports_form_rcep: true,
    certifications: ["OEKO-TEX", "GOTS", "BSCI"],
    rating: 4.6,
    review_count: 89,
    ships_to_thailand_days_min: 16,
    ships_to_thailand_days_max: 22,
    ships_from_port: "CNNGB Ningbo",
    wechat_id: "hongyun-textile",
    email: "lily@hongyun-tex.cn",
    description:
      "OEM/ODM เสื้อผ้าถัก น้ำหนัก 130-260gsm รับผลิต private label MOQ 300 pcs ใช้เวลา 25-35 วัน เป็น supplier ให้แบรนด์ไทยกว่า 18 แบรนด์",
    product_count: 312,
  },
  {
    id: "sup-003",
    legal_name: "Hanoi Precision Components JSC",
    trade_name: "Hanoi Precision",
    country: "VN",
    country_flag: "🇻🇳",
    city: "Hà Nội",
    established_year: 2017,
    staff_count: 95,
    factory_size_sqm: 4_200,
    is_verified: true,
    verified_by: "TÜV · 2025",
    trade_assurance: false,
    response_rate: 92.3,
    response_hours_avg: 4,
    on_time_delivery_rate: 89.5,
    main_categories: [
      { name: "Automotive parts", hs_chapter: "8708" },
      { name: "Metal stamping", hs_chapter: "7326" },
    ],
    main_markets: ["TH", "JP", "MY"],
    export_volume_usd_yearly: 3_800_000,
    supports_form_e: false,
    supports_form_rcep: true,
    certifications: ["IATF 16949", "ISO 14001"],
    rating: 4.7,
    review_count: 34,
    ships_to_thailand_days_min: 7,
    ships_to_thailand_days_max: 10,
    ships_from_port: "VNHPH Haiphong",
    email: "export@hanoi-precision.vn",
    description:
      "โรงงาน metal stamping + CNC ที่เวียดนาม รับงาน automotive precision components ใช้ Form D (ATIGA) ส่งออกได้ภาษี 0% ลูกค้าหลักเป็น Tier-2 supplier ของ Toyota/Honda ที่ระยอง",
    product_count: 67,
  },
  {
    id: "sup-004",
    legal_name: "Guangzhou Glamour Cosmetics Mfg.",
    trade_name: "GZ Glamour Cosmetics",
    country: "CN",
    country_flag: "🇨🇳",
    city: "Guangzhou",
    established_year: 2011,
    staff_count: 260,
    factory_size_sqm: 12_000,
    is_verified: true,
    verified_by: "SGS · 2024",
    trade_assurance: true,
    response_rate: 94.0,
    response_hours_avg: 2,
    on_time_delivery_rate: 96.1,
    main_categories: [
      { name: "Skincare OEM", hs_chapter: "3304" },
      { name: "Cosmetic packaging", hs_chapter: "3923" },
    ],
    main_markets: ["TH", "VN", "ID", "PH", "US"],
    export_volume_usd_yearly: 14_200_000,
    supports_form_e: true,
    supports_form_rcep: true,
    certifications: ["GMP", "ISO 22716", "FDA"],
    rating: 4.9,
    review_count: 207,
    ships_to_thailand_days_min: 15,
    ships_to_thailand_days_max: 20,
    ships_from_port: "CNHUA Huangpu",
    wechat_id: "gz-glamour",
    whatsapp: "+86 159 8765 4321",
    email: "amy@gz-glamour.com",
    description:
      "โรงงาน GMP cosmetics OEM ที่กว่างโจว รับผลิต skincare/serum/cream MOQ 1,000 ชิ้น มีทีม R&D ช่วย formulate ฟรี ทำงานกับแบรนด์ความงามไทยกว่า 60 แบรนด์",
    product_count: 421,
  },
  {
    id: "sup-005",
    legal_name: "Busan Marine Equipment Co., Ltd.",
    trade_name: "Busan Marine",
    country: "KR",
    country_flag: "🇰🇷",
    city: "Busan",
    established_year: 2003,
    staff_count: 88,
    factory_size_sqm: 7_500,
    is_verified: true,
    verified_by: "KR-Inspection · 2024",
    trade_assurance: false,
    response_rate: 78.0,
    response_hours_avg: 12,
    on_time_delivery_rate: 92.0,
    main_categories: [
      { name: "Marine pumps", hs_chapter: "8413" },
      { name: "Stainless valves", hs_chapter: "8481" },
    ],
    main_markets: ["TH", "JP", "SG"],
    export_volume_usd_yearly: 9_600_000,
    supports_form_e: false,
    supports_form_rcep: true,
    certifications: ["KR-Class", "ABS", "DNV"],
    rating: 4.5,
    review_count: 52,
    ships_to_thailand_days_min: 9,
    ships_to_thailand_days_max: 13,
    ships_from_port: "KRPUS Busan",
    email: "intl@busan-marine.kr",
    description:
      "ผู้ผลิตเครื่องสูบและวาล์วเกรด marine จากเกาหลีใต้ ใช้ Form AK ลดอากรเหลือ 0-5% ลูกค้าหลักเป็นอู่ต่อเรือไทย",
    product_count: 96,
  },
  {
    id: "sup-006",
    legal_name: "Foshan Smart Home Appliance Co.",
    trade_name: "Foshan SmartHome",
    country: "CN",
    country_flag: "🇨🇳",
    city: "Foshan",
    established_year: 2016,
    staff_count: 340,
    factory_size_sqm: 22_000,
    is_verified: true,
    verified_by: "SGS · 2025",
    trade_assurance: true,
    response_rate: 91.5,
    response_hours_avg: 4,
    on_time_delivery_rate: 88.9,
    main_categories: [
      { name: "Air purifiers", hs_chapter: "8421" },
      { name: "Smart fans", hs_chapter: "8414" },
    ],
    main_markets: ["TH", "VN", "MY", "AU"],
    export_volume_usd_yearly: 18_900_000,
    supports_form_e: true,
    supports_form_rcep: true,
    certifications: ["CE", "FCC", "RoHS", "ETL"],
    rating: 4.4,
    review_count: 78,
    ships_to_thailand_days_min: 17,
    ships_to_thailand_days_max: 24,
    ships_from_port: "CNHUA Huangpu",
    wechat_id: "foshan-sh",
    email: "ben@foshan-sh.cn",
    description:
      "ผู้ผลิตเครื่องใช้ในบ้าน IoT-ready รองรับ Tuya/Smart Life MOQ 500 ชิ้น มีโหมด air purifier + UV-C เหมาะกับตลาดไทย",
    product_count: 156,
  },
];

export type Product = {
  id: string;
  supplier_id: string;
  name_en: string;
  name_th: string;
  category: string;
  hs_code: string;
  moq: number;
  price_min_usd: number;
  price_max_usd: number;
  lead_time_days_min: number;
  lead_time_days_max: number;
  hs_form_eligible: string[];
  certifications: string[];
  image_emoji: string;       // visual placeholder
  payment_terms: string[];
  total_sold_units: number;
};

export const products: Product[] = [
  {
    id: "prod-001",
    supplier_id: "sup-001",
    name_en: "Hybrid Solar Inverter 5kW Pure Sine Wave",
    name_th: "อินเวอร์เตอร์ไฮบริดโซลาร์ 5kW คลื่นไซน์บริสุทธิ์",
    category: "Solar / Energy",
    hs_code: "8504.40.90",
    moq: 10,
    price_min_usd: 720,
    price_max_usd: 920,
    lead_time_days_min: 18,
    lead_time_days_max: 28,
    hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["CE", "RoHS"],
    image_emoji: "⚡",
    payment_terms: ["TT 30/70", "LC at sight"],
    total_sold_units: 1_482,
  },
  {
    id: "prod-002",
    supplier_id: "sup-001",
    name_en: "LiFePO4 Battery Pack 48V 100Ah",
    name_th: "แบตเตอรี่ลิเธียมไอออน 48V 100Ah",
    category: "Solar / Energy",
    hs_code: "8507.60.00",
    moq: 20,
    price_min_usd: 340,
    price_max_usd: 420,
    lead_time_days_min: 22,
    lead_time_days_max: 30,
    hs_form_eligible: ["Form E"],
    certifications: ["UN38.3", "CE", "MSDS"],
    image_emoji: "🔋",
    payment_terms: ["TT 30/70"],
    total_sold_units: 2_104,
  },
  {
    id: "prod-003",
    supplier_id: "sup-002",
    name_en: "Cotton Crewneck T-Shirt 180gsm",
    name_th: "เสื้อยืดคอกลม คอตตอน 180 แกรม",
    category: "Apparel",
    hs_code: "6109.10.00",
    moq: 300,
    price_min_usd: 2.4,
    price_max_usd: 3.8,
    lead_time_days_min: 25,
    lead_time_days_max: 35,
    hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["OEKO-TEX"],
    image_emoji: "👕",
    payment_terms: ["TT 30/70", "PayPal"],
    total_sold_units: 18_200,
  },
  {
    id: "prod-004",
    supplier_id: "sup-004",
    name_en: "Vitamin C Brightening Serum 30ml OEM",
    name_th: "เซรั่มวิตามินซี 30ml รับผลิตแบรนด์",
    category: "Beauty / Cosmetics",
    hs_code: "3304.99.30",
    moq: 1000,
    price_min_usd: 1.8,
    price_max_usd: 3.2,
    lead_time_days_min: 40,
    lead_time_days_max: 60,
    hs_form_eligible: ["Form E"],
    certifications: ["GMP", "ISO 22716"],
    image_emoji: "✨",
    payment_terms: ["TT 50/50"],
    total_sold_units: 320_000,
  },
  {
    id: "prod-005",
    supplier_id: "sup-006",
    name_en: "HEPA Air Purifier 60m² with UV-C",
    name_th: "เครื่องฟอกอากาศ HEPA 60ตร.ม. + UV-C",
    category: "Home Appliances",
    hs_code: "8421.39.20",
    moq: 50,
    price_min_usd: 78,
    price_max_usd: 102,
    lead_time_days_min: 28,
    lead_time_days_max: 35,
    hs_form_eligible: ["Form E"],
    certifications: ["CE", "ETL"],
    image_emoji: "💨",
    payment_terms: ["TT 30/70"],
    total_sold_units: 5_840,
  },
  {
    id: "prod-006",
    supplier_id: "sup-003",
    name_en: "CNC-Machined Bracket Aluminum 6061-T6",
    name_th: "ขาจับ CNC อลูมิเนียม 6061-T6",
    category: "Industrial / Auto Parts",
    hs_code: "7616.99.90",
    moq: 500,
    price_min_usd: 1.2,
    price_max_usd: 2.8,
    lead_time_days_min: 14,
    lead_time_days_max: 21,
    hs_form_eligible: ["Form D", "Form RCEP"],
    certifications: ["IATF 16949"],
    image_emoji: "🔩",
    payment_terms: ["TT 30/70", "OA 30"],
    total_sold_units: 84_500,
  },
];

export type Category = {
  slug: string;
  name: string;
  emoji: string;
  hs_chapters: string[];
  supplier_count: number;
};

export const categories: Category[] = [
  { slug: "energy",   name: "Solar / พลังงาน",        emoji: "⚡", hs_chapters: ["8504","8507","8541"], supplier_count: 142 },
  { slug: "apparel",  name: "เสื้อผ้า / สิ่งทอ",      emoji: "👕", hs_chapters: ["61","62","63"],       supplier_count: 387 },
  { slug: "beauty",   name: "ความงาม / สกินแคร์",   emoji: "✨", hs_chapters: ["33","34"],            supplier_count: 218 },
  { slug: "home",     name: "ของใช้ในบ้าน",          emoji: "🏠", hs_chapters: ["73","76","84","85"], supplier_count: 503 },
  { slug: "auto",     name: "ชิ้นส่วนยานยนต์",       emoji: "🚗", hs_chapters: ["8708","7326"],       supplier_count: 167 },
  { slug: "food",     name: "อาหาร / เครื่องดื่ม",   emoji: "🍱", hs_chapters: ["19","20","21","22"], supplier_count: 124 },
  { slug: "pack",     name: "บรรจุภัณฑ์",             emoji: "📦", hs_chapters: ["39","48","76"],     supplier_count: 211 },
  { slug: "elec",     name: "อิเล็กทรอนิกส์",         emoji: "💻", hs_chapters: ["84","85"],          supplier_count: 642 },
];

export function getSupplier(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function getSupplierProducts(supplierId: string): Product[] {
  return products.filter((p) => p.supplier_id === supplierId);
}
