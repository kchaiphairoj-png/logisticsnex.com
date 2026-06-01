/**
 * Marketplace expansion seed.
 *
 * Adds 24 more suppliers (so total = 30) + ~70 products across 8 categories
 * and 6 countries. All upserts use stable hard-coded UUIDs so the script is
 * idempotent — re-running has no effect.
 *
 * USAGE
 *   npx tsx scripts/seed-suppliers-expansion.ts
 *
 * REQUIRES `.env.local`:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

/* ────────────────────────────────────────────────────────────
 * Suppliers — 24 new (existing 6 keep IDs 1111..6666)
 * UUIDs use the pattern 7xxxx..7777, 8xxxx..8888, ... per country
 * to keep them easy to grep later.
 * ──────────────────────────────────────────────────────────── */
interface SupplierRow {
  id: string;
  legal_name: string;
  trade_name: string;
  country: string;
  city: string;
  established_year: number;
  staff_count: number;
  factory_size_sqm: number;
  business_license_no: string;
  is_verified: boolean;
  verified_by: string;
  trade_assurance: boolean;
  response_rate: number;
  response_hours_avg: number;
  on_time_delivery_rate: number;
  main_categories: string[];
  main_markets: string[];
  export_volume_usd_yearly: number;
  supports_form_e: boolean;
  supports_form_aj: boolean;
  supports_form_ak: boolean;
  supports_form_d: boolean;
  supports_form_rcep: boolean;
  contact_name: string;
  wechat_id: string | null;
  whatsapp: string | null;
  email: string;
  website: string | null;
  rating: number;
  review_count: number;
}

const suppliers: SupplierRow[] = [
  // ─── China — Electronics + Solar ─────────────────────────────
  {
    id: "77777777-1111-0001-0000-000000000001",
    legal_name: "深圳市优创智能科技有限公司",
    trade_name: "Shenzhen UniCreate Smart Tech",
    country: "CN", city: "Shenzhen", established_year: 2013, staff_count: 380, factory_size_sqm: 15000,
    business_license_no: "91440300MA5UX0001X",
    is_verified: true, verified_by: "SGS · 2025", trade_assurance: true,
    response_rate: 95.2, response_hours_avg: 3, on_time_delivery_rate: 93.5,
    main_categories: ["8528", "8525", "8517"],
    main_markets: ["TH", "VN", "MY", "ID", "PH", "US"],
    export_volume_usd_yearly: 22500000,
    supports_form_e: true, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Daniel Zhao", wechat_id: "unicreate-sz", whatsapp: "+86 138 0011 2233",
    email: "inquiry@unicreate-tech.cn", website: "https://unicreate-tech.cn",
    rating: 4.7, review_count: 118,
  },
  {
    id: "77777777-1111-0002-0000-000000000002",
    legal_name: "东莞市星辰电子科技有限公司",
    trade_name: "Dongguan Starlight Electronics",
    country: "CN", city: "Dongguan", established_year: 2010, staff_count: 540, factory_size_sqm: 22000,
    business_license_no: "91441900MA5SL0002Y",
    is_verified: true, verified_by: "BV · 2024", trade_assurance: true,
    response_rate: 91.8, response_hours_avg: 4, on_time_delivery_rate: 90.2,
    main_categories: ["8504", "8536", "8544"],
    main_markets: ["TH", "VN", "ID", "DE", "US"],
    export_volume_usd_yearly: 35800000,
    supports_form_e: true, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Eva Lin", wechat_id: "starlight-dg", whatsapp: "+86 139 0022 3344",
    email: "sales@starlight-elec.cn", website: "https://starlight-elec.cn",
    rating: 4.5, review_count: 167,
  },
  {
    id: "77777777-1111-0003-0000-000000000003",
    legal_name: "苏州绿能光伏科技有限公司",
    trade_name: "Suzhou GreenSolar Power",
    country: "CN", city: "Suzhou", established_year: 2015, staff_count: 280, factory_size_sqm: 12000,
    business_license_no: "91320500MA5GS0003Z",
    is_verified: true, verified_by: "TÜV · 2025", trade_assurance: true,
    response_rate: 93.6, response_hours_avg: 3, on_time_delivery_rate: 95.1,
    main_categories: ["8541", "8504"],
    main_markets: ["TH", "VN", "AU", "DE", "JP"],
    export_volume_usd_yearly: 18200000,
    supports_form_e: true, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Linda Wang", wechat_id: "greensolar-sz", whatsapp: null,
    email: "export@greensolar-cn.com", website: "https://greensolar-cn.com",
    rating: 4.8, review_count: 96,
  },

  // ─── China — Apparel + Textile ───────────────────────────────
  {
    id: "77777777-2222-0004-0000-000000000004",
    legal_name: "杭州锦绣服装有限公司",
    trade_name: "Hangzhou JinXiu Garment",
    country: "CN", city: "Hangzhou", established_year: 2007, staff_count: 220, factory_size_sqm: 11000,
    business_license_no: "91330100MA5JX0004A",
    is_verified: true, verified_by: "BSCI · 2024", trade_assurance: true,
    response_rate: 89.5, response_hours_avg: 5, on_time_delivery_rate: 88.7,
    main_categories: ["6109", "6110", "6204"],
    main_markets: ["TH", "PH", "ID", "JP", "AU"],
    export_volume_usd_yearly: 9100000,
    supports_form_e: true, supports_form_aj: true, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Sara Chen", wechat_id: "jinxiu-hz", whatsapp: "+86 137 0033 4455",
    email: "sara@jinxiu-garment.cn", website: "https://jinxiu-garment.cn",
    rating: 4.5, review_count: 134,
  },
  {
    id: "77777777-2222-0005-0000-000000000005",
    legal_name: "广州市丝绸之路服饰有限公司",
    trade_name: "Guangzhou Silk Road Apparel",
    country: "CN", city: "Guangzhou", established_year: 2012, staff_count: 145, factory_size_sqm: 7800,
    business_license_no: "91440101MA5SR0005B",
    is_verified: true, verified_by: "OEKO-TEX · 2024", trade_assurance: false,
    response_rate: 87.2, response_hours_avg: 6, on_time_delivery_rate: 86.4,
    main_categories: ["6204", "6203", "6211"],
    main_markets: ["TH", "MY", "ID", "JP"],
    export_volume_usd_yearly: 5400000,
    supports_form_e: true, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Helen Wu", wechat_id: null, whatsapp: "+86 136 0044 5566",
    email: "helen@silkroad-apparel.cn", website: null,
    rating: 4.3, review_count: 78,
  },

  // ─── China — Cosmetics + Personal Care ───────────────────────
  {
    id: "77777777-3333-0006-0000-000000000006",
    legal_name: "广州市玫瑰庄园生物科技有限公司",
    trade_name: "Guangzhou Rose Garden Biotech",
    country: "CN", city: "Guangzhou", established_year: 2014, staff_count: 110, factory_size_sqm: 5200,
    business_license_no: "91440101MA5RG0006C",
    is_verified: true, verified_by: "GMP+ISO 22716 · 2025", trade_assurance: true,
    response_rate: 96.1, response_hours_avg: 2, on_time_delivery_rate: 94.8,
    main_categories: ["3304", "3305", "3307"],
    main_markets: ["TH", "VN", "MY", "ID", "KR"],
    export_volume_usd_yearly: 6800000,
    supports_form_e: true, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: false,
    contact_name: "Rose Zhang", wechat_id: "rosegarden-bio", whatsapp: "+86 138 0055 6677",
    email: "rose@rosegarden-bio.cn", website: "https://rosegarden-bio.cn",
    rating: 4.8, review_count: 187,
  },
  {
    id: "77777777-3333-0007-0000-000000000007",
    legal_name: "上海纯净化妆品制造有限公司",
    trade_name: "Shanghai Pure Beauty Mfg",
    country: "CN", city: "Shanghai", established_year: 2011, staff_count: 165, factory_size_sqm: 8800,
    business_license_no: "91310115MA5PB0007D",
    is_verified: true, verified_by: "ISO 22716 · 2024", trade_assurance: true,
    response_rate: 94.3, response_hours_avg: 3, on_time_delivery_rate: 92.6,
    main_categories: ["3304", "3401"],
    main_markets: ["TH", "MY", "SG", "AU", "JP"],
    export_volume_usd_yearly: 8900000,
    supports_form_e: true, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: false,
    contact_name: "Cynthia Li", wechat_id: "purebeauty-sh", whatsapp: "+86 139 0066 7788",
    email: "cynthia@purebeauty-sh.cn", website: "https://purebeauty-sh.cn",
    rating: 4.6, review_count: 142,
  },

  // ─── China — Home + Furniture ────────────────────────────────
  {
    id: "77777777-4444-0008-0000-000000000008",
    legal_name: "佛山市现代家居制造有限公司",
    trade_name: "Foshan Modern Home Mfg",
    country: "CN", city: "Foshan", established_year: 2006, staff_count: 480, factory_size_sqm: 28000,
    business_license_no: "91440605MA5MH0008E",
    is_verified: true, verified_by: "SGS · 2025", trade_assurance: true,
    response_rate: 88.9, response_hours_avg: 5, on_time_delivery_rate: 87.3,
    main_categories: ["9401", "9403"],
    main_markets: ["TH", "PH", "MY", "AU", "US", "DE"],
    export_volume_usd_yearly: 24500000,
    supports_form_e: true, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Tony Wang", wechat_id: "modernhome-fs", whatsapp: "+86 138 0077 8899",
    email: "tony@modernhome-fs.cn", website: "https://modernhome-fs.cn",
    rating: 4.4, review_count: 215,
  },
  {
    id: "77777777-4444-0009-0000-000000000009",
    legal_name: "嘉兴市恒美厨具有限公司",
    trade_name: "Jiaxing Heng Mei Kitchenware",
    country: "CN", city: "Jiaxing", established_year: 2009, staff_count: 195, factory_size_sqm: 9500,
    business_license_no: "91330400MA5HM0009F",
    is_verified: true, verified_by: "BV · 2024", trade_assurance: true,
    response_rate: 90.5, response_hours_avg: 4, on_time_delivery_rate: 89.7,
    main_categories: ["7323", "7615", "8211"],
    main_markets: ["TH", "VN", "ID", "JP", "DE"],
    export_volume_usd_yearly: 7200000,
    supports_form_e: true, supports_form_aj: true, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Michael Zhou", wechat_id: "hengmei-jx", whatsapp: null,
    email: "michael@hengmei-kitchen.cn", website: null,
    rating: 4.5, review_count: 102,
  },

  // ─── China — Auto Parts ──────────────────────────────────────
  {
    id: "77777777-5555-0010-0000-000000000010",
    legal_name: "重庆市精工汽配制造有限公司",
    trade_name: "Chongqing Jinggong Auto Parts",
    country: "CN", city: "Chongqing", established_year: 2008, staff_count: 320, factory_size_sqm: 16500,
    business_license_no: "91500103MA5JG0010G",
    is_verified: true, verified_by: "IATF 16949 · 2025", trade_assurance: true,
    response_rate: 92.1, response_hours_avg: 4, on_time_delivery_rate: 91.5,
    main_categories: ["8708", "8409", "8483"],
    main_markets: ["TH", "VN", "ID", "BR", "RU"],
    export_volume_usd_yearly: 16800000,
    supports_form_e: true, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Frank Li", wechat_id: "jinggong-cq", whatsapp: "+86 137 0088 9900",
    email: "frank@jinggong-auto.cn", website: "https://jinggong-auto.cn",
    rating: 4.6, review_count: 89,
  },

  // ─── China — Machinery ───────────────────────────────────────
  {
    id: "77777777-6666-0011-0000-000000000011",
    legal_name: "济南机械制造集团有限公司",
    trade_name: "Jinan Heavy Machinery Group",
    country: "CN", city: "Jinan", established_year: 2003, staff_count: 720, factory_size_sqm: 42000,
    business_license_no: "91370100MA5HM0011H",
    is_verified: true, verified_by: "SGS+CE · 2025", trade_assurance: true,
    response_rate: 87.4, response_hours_avg: 6, on_time_delivery_rate: 85.2,
    main_categories: ["8429", "8431", "8474"],
    main_markets: ["TH", "VN", "ID", "RU", "AU"],
    export_volume_usd_yearly: 38400000,
    supports_form_e: true, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "James Wang", wechat_id: "jinan-heavy", whatsapp: "+86 139 0099 0011",
    email: "james@jinan-heavy.cn", website: "https://jinan-heavy.cn",
    rating: 4.3, review_count: 67,
  },

  // ─── Vietnam ─────────────────────────────────────────────────
  {
    id: "77777777-7777-0012-0000-000000000012",
    legal_name: "Saigon Garment Manufacturing JSC",
    trade_name: "Saigon Garment Mfg",
    country: "VN", city: "Ho Chi Minh City", established_year: 2005, staff_count: 410, factory_size_sqm: 18000,
    business_license_no: "0301234567",
    is_verified: true, verified_by: "BSCI+WRAP · 2024", trade_assurance: false,
    response_rate: 88.7, response_hours_avg: 5, on_time_delivery_rate: 87.9,
    main_categories: ["6109", "6203", "6204"],
    main_markets: ["TH", "JP", "KR", "US", "DE"],
    export_volume_usd_yearly: 14200000,
    supports_form_e: false, supports_form_aj: false, supports_form_ak: false, supports_form_d: true, supports_form_rcep: true,
    contact_name: "Tran Van Nam", wechat_id: null, whatsapp: "+84 90 111 2233",
    email: "nam@saigongarment.vn", website: "https://saigongarment.vn",
    rating: 4.5, review_count: 156,
  },
  {
    id: "77777777-7777-0013-0000-000000000013",
    legal_name: "Da Nang Furniture Crafts Co., Ltd.",
    trade_name: "Da Nang Furniture Crafts",
    country: "VN", city: "Da Nang", established_year: 2010, staff_count: 175, factory_size_sqm: 9200,
    business_license_no: "0401234568",
    is_verified: true, verified_by: "FSC · 2024", trade_assurance: false,
    response_rate: 86.3, response_hours_avg: 7, on_time_delivery_rate: 84.8,
    main_categories: ["9401", "9403"],
    main_markets: ["TH", "JP", "DE", "US", "AU"],
    export_volume_usd_yearly: 6300000,
    supports_form_e: false, supports_form_aj: false, supports_form_ak: false, supports_form_d: true, supports_form_rcep: true,
    contact_name: "Le Thi Mai", wechat_id: null, whatsapp: "+84 90 222 3344",
    email: "mai@dangfurniture.vn", website: null,
    rating: 4.4, review_count: 93,
  },
  {
    id: "77777777-7777-0014-0000-000000000014",
    legal_name: "Hanoi Food Industry JSC",
    trade_name: "Hanoi Food Industry",
    country: "VN", city: "Hanoi", established_year: 2008, staff_count: 245, factory_size_sqm: 11500,
    business_license_no: "0101234569",
    is_verified: true, verified_by: "HACCP+FDA · 2025", trade_assurance: true,
    response_rate: 91.2, response_hours_avg: 4, on_time_delivery_rate: 90.6,
    main_categories: ["2008", "1905", "1806"],
    main_markets: ["TH", "JP", "KR", "DE", "US"],
    export_volume_usd_yearly: 11800000,
    supports_form_e: false, supports_form_aj: true, supports_form_ak: false, supports_form_d: true, supports_form_rcep: true,
    contact_name: "Pham Van Hung", wechat_id: null, whatsapp: "+84 90 333 4455",
    email: "hung@hanoifood.vn", website: "https://hanoifood.vn",
    rating: 4.6, review_count: 124,
  },

  // ─── Korea ───────────────────────────────────────────────────
  {
    id: "77777777-8888-0015-0000-000000000015",
    legal_name: "Seoul K-Beauty Cosmetics Inc.",
    trade_name: "Seoul K-Beauty",
    country: "KR", city: "Seoul", established_year: 2015, staff_count: 88, factory_size_sqm: 3600,
    business_license_no: "211-86-23456",
    is_verified: true, verified_by: "ISO 22716+CGMP · 2025", trade_assurance: true,
    response_rate: 95.7, response_hours_avg: 2, on_time_delivery_rate: 96.4,
    main_categories: ["3304", "3305"],
    main_markets: ["TH", "VN", "MY", "ID", "JP", "US"],
    export_volume_usd_yearly: 14600000,
    supports_form_e: false, supports_form_aj: false, supports_form_ak: true, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Kim Soo-yeon", wechat_id: null, whatsapp: "+82 10 2233 4455",
    email: "kim@seoul-kbeauty.kr", website: "https://seoul-kbeauty.kr",
    rating: 4.9, review_count: 248,
  },
  {
    id: "77777777-8888-0016-0000-000000000016",
    legal_name: "Busan Marine Tech Co., Ltd.",
    trade_name: "Busan Marine Tech",
    country: "KR", city: "Busan", established_year: 2009, staff_count: 132, factory_size_sqm: 6700,
    business_license_no: "180-86-34567",
    is_verified: true, verified_by: "BV · 2024", trade_assurance: false,
    response_rate: 90.2, response_hours_avg: 4, on_time_delivery_rate: 91.1,
    main_categories: ["8483", "8413", "8431"],
    main_markets: ["TH", "VN", "JP", "ID", "AU"],
    export_volume_usd_yearly: 9700000,
    supports_form_e: false, supports_form_aj: false, supports_form_ak: true, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Park Jin-ho", wechat_id: null, whatsapp: "+82 10 3344 5566",
    email: "jinho@busanmarine.kr", website: "https://busanmarine.kr",
    rating: 4.5, review_count: 71,
  },
  {
    id: "77777777-8888-0017-0000-000000000017",
    legal_name: "Incheon Pet Food Industries",
    trade_name: "Incheon Pet Food",
    country: "KR", city: "Incheon", established_year: 2013, staff_count: 72, factory_size_sqm: 3200,
    business_license_no: "130-86-45678",
    is_verified: true, verified_by: "HACCP+ISO 22000 · 2024", trade_assurance: true,
    response_rate: 93.8, response_hours_avg: 3, on_time_delivery_rate: 94.7,
    main_categories: ["2309"],
    main_markets: ["TH", "JP", "MY", "VN", "AU"],
    export_volume_usd_yearly: 5100000,
    supports_form_e: false, supports_form_aj: false, supports_form_ak: true, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Lee Ji-eun", wechat_id: null, whatsapp: "+82 10 4455 6677",
    email: "jieun@incheonpet.kr", website: "https://incheonpet.kr",
    rating: 4.7, review_count: 89,
  },

  // ─── Japan ───────────────────────────────────────────────────
  {
    id: "77777777-9999-0018-0000-000000000018",
    legal_name: "Osaka Precision Industries Ltd.",
    trade_name: "Osaka Precision",
    country: "JP", city: "Osaka", established_year: 1998, staff_count: 215, factory_size_sqm: 9800,
    business_license_no: "JP-OSK-1234567",
    is_verified: true, verified_by: "JIS+IATF 16949 · 2025", trade_assurance: true,
    response_rate: 89.4, response_hours_avg: 6, on_time_delivery_rate: 97.8,
    main_categories: ["8708", "8482", "8483"],
    main_markets: ["TH", "VN", "ID", "MY", "US"],
    export_volume_usd_yearly: 28900000,
    supports_form_e: false, supports_form_aj: true, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Yamamoto Hiroshi", wechat_id: null, whatsapp: "+81 80 1122 3344",
    email: "yamamoto@osakaprecision.jp", website: "https://osakaprecision.jp",
    rating: 4.9, review_count: 134,
  },
  {
    id: "77777777-9999-0019-0000-000000000019",
    legal_name: "Tokyo Health Foods Co., Ltd.",
    trade_name: "Tokyo Health Foods",
    country: "JP", city: "Tokyo", established_year: 2010, staff_count: 96, factory_size_sqm: 4100,
    business_license_no: "JP-TKY-7654321",
    is_verified: true, verified_by: "HACCP+JAS · 2024", trade_assurance: true,
    response_rate: 92.5, response_hours_avg: 4, on_time_delivery_rate: 95.6,
    main_categories: ["2106", "2103", "2007"],
    main_markets: ["TH", "VN", "SG", "MY", "TW"],
    export_volume_usd_yearly: 7800000,
    supports_form_e: false, supports_form_aj: true, supports_form_ak: false, supports_form_d: false, supports_form_rcep: true,
    contact_name: "Suzuki Akiko", wechat_id: null, whatsapp: "+81 80 2233 4455",
    email: "suzuki@tokyohealthfoods.jp", website: "https://tokyohealthfoods.jp",
    rating: 4.7, review_count: 108,
  },

  // ─── India ───────────────────────────────────────────────────
  {
    id: "77777777-aaaa-0020-0000-000000000020",
    legal_name: "Mumbai Pharma Exports Pvt Ltd",
    trade_name: "Mumbai Pharma Exports",
    country: "IN", city: "Mumbai", established_year: 2007, staff_count: 185, factory_size_sqm: 8500,
    business_license_no: "27AAACM0021A1Z5",
    is_verified: true, verified_by: "WHO-GMP+ISO 9001 · 2024", trade_assurance: false,
    response_rate: 89.7, response_hours_avg: 5, on_time_delivery_rate: 88.2,
    main_categories: ["3004", "3003"],
    main_markets: ["TH", "VN", "PH", "NG", "BR"],
    export_volume_usd_yearly: 13400000,
    supports_form_e: false, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: false,
    contact_name: "Rajesh Patel", wechat_id: null, whatsapp: "+91 98 1122 3344",
    email: "rajesh@mumbaipharma.in", website: "https://mumbaipharma.in",
    rating: 4.4, review_count: 92,
  },
  {
    id: "77777777-aaaa-0021-0000-000000000021",
    legal_name: "Tirupur Cotton Textiles Pvt Ltd",
    trade_name: "Tirupur Cotton Textiles",
    country: "IN", city: "Tirupur", established_year: 2002, staff_count: 320, factory_size_sqm: 14000,
    business_license_no: "33AAACT0022B2Z6",
    is_verified: true, verified_by: "GOTS+OEKO-TEX · 2024", trade_assurance: false,
    response_rate: 85.4, response_hours_avg: 7, on_time_delivery_rate: 86.3,
    main_categories: ["6109", "6203", "6204"],
    main_markets: ["TH", "DE", "US", "AU", "JP"],
    export_volume_usd_yearly: 11200000,
    supports_form_e: false, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: false,
    contact_name: "Krishnan Murali", wechat_id: null, whatsapp: "+91 98 2233 4455",
    email: "krishnan@tirupurcotton.in", website: "https://tirupurcotton.in",
    rating: 4.2, review_count: 76,
  },

  // ─── Germany ─────────────────────────────────────────────────
  {
    id: "77777777-bbbb-0022-0000-000000000022",
    legal_name: "München Industrial Engineering GmbH",
    trade_name: "München Industrial Engineering",
    country: "DE", city: "München", established_year: 1995, staff_count: 165, factory_size_sqm: 7800,
    business_license_no: "DE-MUN-12345678",
    is_verified: true, verified_by: "DIN ISO 9001+CE · 2025", trade_assurance: false,
    response_rate: 88.6, response_hours_avg: 8, on_time_delivery_rate: 96.4,
    main_categories: ["8479", "8474", "8417"],
    main_markets: ["TH", "VN", "ID", "MY", "US", "BR"],
    export_volume_usd_yearly: 32700000,
    supports_form_e: false, supports_form_aj: false, supports_form_ak: false, supports_form_d: false, supports_form_rcep: false,
    contact_name: "Klaus Müller", wechat_id: null, whatsapp: null,
    email: "klaus@muenchen-ind.de", website: "https://muenchen-ind.de",
    rating: 4.8, review_count: 65,
  },

  // ─── Indonesia (ASEAN) ───────────────────────────────────────
  {
    id: "77777777-cccc-0023-0000-000000000023",
    legal_name: "PT Jakarta Spice Industries",
    trade_name: "Jakarta Spice Industries",
    country: "ID", city: "Jakarta", established_year: 2006, staff_count: 138, factory_size_sqm: 6200,
    business_license_no: "ID-JKT-87654321",
    is_verified: true, verified_by: "HACCP+Halal MUI · 2024", trade_assurance: true,
    response_rate: 88.2, response_hours_avg: 6, on_time_delivery_rate: 87.5,
    main_categories: ["0910", "0904", "2103"],
    main_markets: ["TH", "MY", "SG", "JP", "DE"],
    export_volume_usd_yearly: 6900000,
    supports_form_e: false, supports_form_aj: false, supports_form_ak: false, supports_form_d: true, supports_form_rcep: true,
    contact_name: "Budi Santoso", wechat_id: null, whatsapp: "+62 812 3344 5566",
    email: "budi@jakartaspice.id", website: "https://jakartaspice.id",
    rating: 4.5, review_count: 87,
  },
  {
    id: "77777777-cccc-0024-0000-000000000024",
    legal_name: "PT Bandung Eco Packaging",
    trade_name: "Bandung Eco Packaging",
    country: "ID", city: "Bandung", established_year: 2014, staff_count: 92, factory_size_sqm: 4500,
    business_license_no: "ID-BDG-11223344",
    is_verified: true, verified_by: "FSC+ISO 14001 · 2024", trade_assurance: false,
    response_rate: 90.7, response_hours_avg: 5, on_time_delivery_rate: 89.4,
    main_categories: ["4819", "4811"],
    main_markets: ["TH", "MY", "SG", "AU", "PH"],
    export_volume_usd_yearly: 4800000,
    supports_form_e: false, supports_form_aj: false, supports_form_ak: false, supports_form_d: true, supports_form_rcep: true,
    contact_name: "Siti Rahayu", wechat_id: null, whatsapp: "+62 813 4455 6677",
    email: "siti@bandungeco.id", website: null,
    rating: 4.4, review_count: 54,
  },
];

/* ────────────────────────────────────────────────────────────
 * Products — 2-4 per supplier (≈70 rows)
 * Tip: keep IDs prefix-aligned with the supplier id to ease grep.
 * ──────────────────────────────────────────────────────────── */
interface ProductRow {
  id: string;
  supplier_id: string;
  name_en: string;
  name_th: string;
  description: string;
  category: string;
  hs_code: string;
  hs_confidence: number;
  moq: number;
  moq_unit: string;
  price_min_usd: number;
  price_max_usd: number;
  price_unit: string;
  payment_terms: string[];
  lead_time_days_min: number;
  lead_time_days_max: number;
  ships_from_port: string;
  hs_form_eligible: string[];
  certifications: string[];
  total_sold_units: number;
  view_count: number;
}

/**
 * Build a deterministic product UUID from the parent supplier's "000X" segment
 * (chars 14-18 of the supplier id, which is the only part that's unique per
 * supplier). Without this, suppliers in the same country group ("aaaa", "cccc")
 * would generate colliding product IDs.
 */
const P = (sup: string, suffix: string) =>
  `bbbbbbbb-${sup.slice(14, 18)}-${suffix}-0000-000000000000`;

const products: ProductRow[] = [
  // UniCreate Smart Tech (77...7111-0001)
  {
    id: P("77777777-1111-0001", "1001"),
    supplier_id: "77777777-1111-0001-0000-000000000001",
    name_en: "4K Smart LED TV 55 inch Android 13",
    name_th: "สมาร์ททีวี 4K LED 55 นิ้ว Android 13",
    description: "55-inch 4K HDR Android TV with built-in Chromecast, Google Assistant, Dolby Vision, low-latency mode for gaming.",
    category: "Electronics / TV", hs_code: "8528.72.91", hs_confidence: 0.95,
    moq: 30, moq_unit: "pcs", price_min_usd: 220, price_max_usd: 320, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 25, lead_time_days_max: 35,
    ships_from_port: "CNSHK Shekou", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["CE", "FCC", "RoHS", "Google Certified"], total_sold_units: 5400, view_count: 8920,
  },
  {
    id: P("77777777-1111-0001", "1002"),
    supplier_id: "77777777-1111-0001-0000-000000000001",
    name_en: "WiFi 6 Mesh Router AX3000 Tri-band",
    name_th: "เราเตอร์ Mesh WiFi 6 AX3000 3 ช่องสัญญาณ",
    description: "Tri-band WiFi 6 mesh system, 3000Mbps, 2-pack covers 5000sqft, Tuya app support.",
    category: "Electronics / Network", hs_code: "8517.62.00", hs_confidence: 0.94,
    moq: 50, moq_unit: "pcs", price_min_usd: 85, price_max_usd: 125, price_unit: "pcs",
    payment_terms: ["TT", "PayPal"], lead_time_days_min: 20, lead_time_days_max: 28,
    ships_from_port: "CNSHK Shekou", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["CE", "FCC", "WiFi Alliance"], total_sold_units: 3200, view_count: 6420,
  },
  {
    id: P("77777777-1111-0001", "1003"),
    supplier_id: "77777777-1111-0001-0000-000000000001",
    name_en: "4G LTE Industrial Router Dual SIM",
    name_th: "เราเตอร์อุตสาหกรรม 4G LTE 2 ซิม",
    description: "Rugged dual-SIM 4G/LTE router for IoT/M2M deployments, DIN-rail mountable, -40~75°C operating.",
    category: "Electronics / Industrial IoT", hs_code: "8517.62.00", hs_confidence: 0.91,
    moq: 20, moq_unit: "pcs", price_min_usd: 145, price_max_usd: 220, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 22, lead_time_days_max: 30,
    ships_from_port: "CNSHK Shekou", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["CE", "FCC", "PTCRB"], total_sold_units: 1240, view_count: 3210,
  },

  // Dongguan Starlight Electronics (77...1111-0002)
  {
    id: P("77777777-1111-0002", "2001"),
    supplier_id: "77777777-1111-0002-0000-000000000002",
    name_en: "USB-C PD 65W GaN Charger 3-port",
    name_th: "ที่ชาร์จ GaN USB-C PD 65W 3 ช่อง",
    description: "Compact GaN charger, 65W PD 3.0 + dual USB-A, foldable plug, supports laptop / phone / tablet.",
    category: "Electronics / Power", hs_code: "8504.40.30", hs_confidence: 0.96,
    moq: 100, moq_unit: "pcs", price_min_usd: 9.5, price_max_usd: 14.8, price_unit: "pcs",
    payment_terms: ["TT", "PayPal"], lead_time_days_min: 15, lead_time_days_max: 22,
    ships_from_port: "CNSZX Yantian", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["CE", "FCC", "UL"], total_sold_units: 24600, view_count: 11400,
  },
  {
    id: P("77777777-1111-0002", "2002"),
    supplier_id: "77777777-1111-0002-0000-000000000002",
    name_en: "Industrial Cable Assembly Custom Harness",
    name_th: "สายไฟอุตสาหกรรมประกอบเฉพาะงาน",
    description: "Custom-spec wire harness, UL 1015 / 1007, JST/Molex/AMP connectors, RoHS compliant.",
    category: "Electronics / Cable", hs_code: "8544.42.00", hs_confidence: 0.93,
    moq: 500, moq_unit: "pcs", price_min_usd: 0.85, price_max_usd: 3.4, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 18, lead_time_days_max: 25,
    ships_from_port: "CNSZX Yantian", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["UL", "RoHS"], total_sold_units: 48400, view_count: 7820,
  },

  // GreenSolar Power (77...1111-0003)
  {
    id: P("77777777-1111-0003", "3001"),
    supplier_id: "77777777-1111-0003-0000-000000000003",
    name_en: "Monocrystalline Solar Panel 550W",
    name_th: "แผงโซลาร์เซลล์โมโน 550W",
    description: "Half-cut monocrystalline PERC solar panel 550W, 21.5% efficiency, 25-year warranty.",
    category: "Solar / Panel", hs_code: "8541.40.21", hs_confidence: 0.97,
    moq: 30, moq_unit: "pcs", price_min_usd: 105, price_max_usd: 145, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 22, lead_time_days_max: 30,
    ships_from_port: "CNSHA Shanghai", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["TÜV", "CE", "IEC 61215"], total_sold_units: 8600, view_count: 6240,
  },
  {
    id: P("77777777-1111-0003", "3002"),
    supplier_id: "77777777-1111-0003-0000-000000000003",
    name_en: "On-Grid Solar Inverter 10kW 3-phase",
    name_th: "อินเวอร์เตอร์โซลาร์ on-grid 10kW 3 เฟส",
    description: "Three-phase grid-tie solar inverter 10kW, dual MPPT, IP65, WiFi monitoring.",
    category: "Solar / Inverter", hs_code: "8504.40.90", hs_confidence: 0.95,
    moq: 5, moq_unit: "pcs", price_min_usd: 720, price_max_usd: 980, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 25, lead_time_days_max: 35,
    ships_from_port: "CNSHA Shanghai", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["CE", "VDE", "G99"], total_sold_units: 1240, view_count: 4180,
  },

  // JinXiu Garment (77...2222-0004)
  {
    id: P("77777777-2222-0004", "4001"),
    supplier_id: "77777777-2222-0004-0000-000000000004",
    name_en: "Polo Shirt Cotton Pique 220gsm OEM",
    name_th: "เสื้อโปโลคอตตอน Pique 220gsm OEM",
    description: "Cotton pique polo shirt 220gsm, custom embroidery/print, sizes XS-3XL.",
    category: "Apparel / Polo", hs_code: "6105.10.00", hs_confidence: 0.97,
    moq: 200, moq_unit: "pcs", price_min_usd: 5.2, price_max_usd: 8.4, price_unit: "pcs",
    payment_terms: ["TT", "LC", "OA"], lead_time_days_min: 28, lead_time_days_max: 38,
    ships_from_port: "CNNGB Ningbo", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["OEKO-TEX", "BSCI"], total_sold_units: 32400, view_count: 6810,
  },
  {
    id: P("77777777-2222-0004", "4002"),
    supplier_id: "77777777-2222-0004-0000-000000000004",
    name_en: "Hoodie Pullover Heavyweight 380gsm",
    name_th: "เสื้อฮู้ดดี้ heavyweight 380gsm",
    description: "Brushed-back fleece pullover hoodie 380gsm, oversized fit, custom print/embroidery.",
    category: "Apparel / Hoodie", hs_code: "6110.20.00", hs_confidence: 0.96,
    moq: 200, moq_unit: "pcs", price_min_usd: 8.8, price_max_usd: 13.5, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 28, lead_time_days_max: 38,
    ships_from_port: "CNNGB Ningbo", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["OEKO-TEX", "BSCI"], total_sold_units: 18200, view_count: 4520,
  },

  // Silk Road Apparel (77...2222-0005)
  {
    id: P("77777777-2222-0005", "5001"),
    supplier_id: "77777777-2222-0005-0000-000000000005",
    name_en: "Women's Summer Dress Chiffon Print",
    name_th: "ชุดเดรสผู้หญิงผ้าชีฟอง พิมพ์ลายฤดูร้อน",
    description: "Lightweight chiffon midi dress, V-neck, sleeveless, A-line, MOQ 300pcs.",
    category: "Apparel / Dress", hs_code: "6204.43.40", hs_confidence: 0.94,
    moq: 300, moq_unit: "pcs", price_min_usd: 6.5, price_max_usd: 11.2, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 30, lead_time_days_max: 42,
    ships_from_port: "CNCAN Guangzhou", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["OEKO-TEX"], total_sold_units: 9800, view_count: 4120,
  },

  // Rose Garden Biotech (77...3333-0006)
  {
    id: P("77777777-3333-0006", "6001"),
    supplier_id: "77777777-3333-0006-0000-000000000006",
    name_en: "Snail Mucin Repair Essence 100ml",
    name_th: "เอสเซ้นส์เมือกหอยทาก 100ml",
    description: "96% snail secretion filtrate essence, repair + hydration, K-beauty inspired formula.",
    category: "Cosmetics / Essence", hs_code: "3304.99.00", hs_confidence: 0.93,
    moq: 1000, moq_unit: "pcs", price_min_usd: 2.4, price_max_usd: 3.8, price_unit: "pcs",
    payment_terms: ["TT", "PayPal"], lead_time_days_min: 25, lead_time_days_max: 32,
    ships_from_port: "CNCAN Guangzhou", hs_form_eligible: ["Form E"],
    certifications: ["GMP", "ISO 22716"], total_sold_units: 14800, view_count: 9610,
  },
  {
    id: P("77777777-3333-0006", "6002"),
    supplier_id: "77777777-3333-0006-0000-000000000006",
    name_en: "Centella Asiatica Soothing Toner 200ml",
    name_th: "โทนเนอร์ใบบัวบกผ่อนคลาย 200ml",
    description: "Madecassoside-rich centella asiatica toner, soothes redness + sensitive skin.",
    category: "Cosmetics / Toner", hs_code: "3304.99.00", hs_confidence: 0.92,
    moq: 1000, moq_unit: "pcs", price_min_usd: 1.8, price_max_usd: 2.9, price_unit: "pcs",
    payment_terms: ["TT", "PayPal"], lead_time_days_min: 25, lead_time_days_max: 32,
    ships_from_port: "CNCAN Guangzhou", hs_form_eligible: ["Form E"],
    certifications: ["GMP", "ISO 22716"], total_sold_units: 18400, view_count: 8720,
  },
  {
    id: P("77777777-3333-0006", "6003"),
    supplier_id: "77777777-3333-0006-0000-000000000006",
    name_en: "Bubble Sheet Mask Detox 25g",
    name_th: "แผ่นมาสก์โฟมล้างพิษ 25g",
    description: "Activated carbon bubble sheet mask, deep cleansing + detox, 25g per piece.",
    category: "Cosmetics / Mask", hs_code: "3304.99.00", hs_confidence: 0.90,
    moq: 2000, moq_unit: "pcs", price_min_usd: 0.45, price_max_usd: 0.85, price_unit: "pcs",
    payment_terms: ["TT", "PayPal"], lead_time_days_min: 22, lead_time_days_max: 30,
    ships_from_port: "CNCAN Guangzhou", hs_form_eligible: ["Form E"],
    certifications: ["GMP"], total_sold_units: 42600, view_count: 11800,
  },

  // Pure Beauty (77...3333-0007)
  {
    id: P("77777777-3333-0007", "7001"),
    supplier_id: "77777777-3333-0007-0000-000000000007",
    name_en: "Mineral Sunscreen SPF50 Reef-safe 60ml",
    name_th: "ครีมกันแดดแร่ธาตุ SPF50 ปลอดภัยต่อปะการัง 60ml",
    description: "Zinc oxide + titanium dioxide mineral sunscreen, reef-safe (no oxybenzone/octinoxate).",
    category: "Cosmetics / Sunscreen", hs_code: "3304.99.00", hs_confidence: 0.94,
    moq: 1000, moq_unit: "pcs", price_min_usd: 2.8, price_max_usd: 4.2, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 25, lead_time_days_max: 32,
    ships_from_port: "CNSHA Shanghai", hs_form_eligible: ["Form E"],
    certifications: ["ISO 22716", "FDA"], total_sold_units: 12200, view_count: 6240,
  },
  {
    id: P("77777777-3333-0007", "7002"),
    supplier_id: "77777777-3333-0007-0000-000000000007",
    name_en: "Liquid Bath Soap Argan Oil 500ml",
    name_th: "สบู่เหลวอาบน้ำน้ำมันอาร์แกน 500ml",
    description: "Moroccan argan oil + glycerin liquid bath soap, sulfate-free, OEM-ready.",
    category: "Personal Care / Body Wash", hs_code: "3401.30.00", hs_confidence: 0.93,
    moq: 500, moq_unit: "pcs", price_min_usd: 1.8, price_max_usd: 3.4, price_unit: "pcs",
    payment_terms: ["TT"], lead_time_days_min: 22, lead_time_days_max: 30,
    ships_from_port: "CNSHA Shanghai", hs_form_eligible: ["Form E"],
    certifications: ["ISO 22716"], total_sold_units: 8400, view_count: 3210,
  },

  // Modern Home Mfg (77...4444-0008)
  {
    id: P("77777777-4444-0008", "8001"),
    supplier_id: "77777777-4444-0008-0000-000000000008",
    name_en: "Modern Velvet Sofa 3-Seater Convertible",
    name_th: "โซฟากำมะหยี่โมเดิร์น 3 ที่นั่ง ปรับเป็นเตียง",
    description: "3-seater convertible velvet sofa with storage, 200cm, gold metal legs, knockdown packaging.",
    category: "Furniture / Sofa", hs_code: "9401.40.00", hs_confidence: 0.94,
    moq: 30, moq_unit: "pcs", price_min_usd: 145, price_max_usd: 220, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 35, lead_time_days_max: 45,
    ships_from_port: "CNCAN Guangzhou", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["SGS"], total_sold_units: 4800, view_count: 6210,
  },
  {
    id: P("77777777-4444-0008", "8002"),
    supplier_id: "77777777-4444-0008-0000-000000000008",
    name_en: "Dining Table Set 6-Seater Solid Wood",
    name_th: "ชุดโต๊ะอาหาร 6 ที่นั่ง ไม้จริง",
    description: "Solid oak dining table 180cm + 6 upholstered chairs, modern Scandinavian style.",
    category: "Furniture / Dining", hs_code: "9403.60.00", hs_confidence: 0.93,
    moq: 20, moq_unit: "set", price_min_usd: 380, price_max_usd: 550, price_unit: "set",
    payment_terms: ["TT", "LC"], lead_time_days_min: 35, lead_time_days_max: 45,
    ships_from_port: "CNCAN Guangzhou", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["FSC", "SGS"], total_sold_units: 1820, view_count: 4920,
  },

  // Heng Mei Kitchenware (77...4444-0009)
  {
    id: P("77777777-4444-0009", "9001"),
    supplier_id: "77777777-4444-0009-0000-000000000009",
    name_en: "Stainless Steel Cookware Set 12-pc",
    name_th: "ชุดหม้อสแตนเลส 12 ชิ้น",
    description: "18/10 stainless steel cookware set, 5-ply bottom, induction compatible, 12-pc.",
    category: "Home / Kitchen", hs_code: "7323.93.00", hs_confidence: 0.96,
    moq: 50, moq_unit: "set", price_min_usd: 65, price_max_usd: 105, price_unit: "set",
    payment_terms: ["TT", "LC"], lead_time_days_min: 25, lead_time_days_max: 35,
    ships_from_port: "CNNGB Ningbo", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["LFGB", "SGS"], total_sold_units: 6400, view_count: 4810,
  },
  {
    id: P("77777777-4444-0009", "9002"),
    supplier_id: "77777777-4444-0009-0000-000000000009",
    name_en: "Cast Aluminum Non-stick Frying Pan 28cm",
    name_th: "กระทะอลูมิเนียมเคลือบ non-stick 28cm",
    description: "Die-cast aluminum non-stick frying pan 28cm, granite coating, bakelite handle.",
    category: "Home / Kitchen", hs_code: "7615.10.00", hs_confidence: 0.95,
    moq: 200, moq_unit: "pcs", price_min_usd: 5.4, price_max_usd: 8.8, price_unit: "pcs",
    payment_terms: ["TT"], lead_time_days_min: 22, lead_time_days_max: 30,
    ships_from_port: "CNNGB Ningbo", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["LFGB"], total_sold_units: 18400, view_count: 6210,
  },

  // Jinggong Auto Parts (77...5555-0010)
  {
    id: P("77777777-5555-0010", "0001"),
    supplier_id: "77777777-5555-0010-0000-000000000010",
    name_en: "OEM Brake Pads Ceramic Set",
    name_th: "ผ้าเบรกเซรามิก OEM",
    description: "Ceramic brake pads, low dust + low noise, fits Toyota/Honda/Nissan, OEM quality.",
    category: "Auto / Brake", hs_code: "8708.30.10", hs_confidence: 0.97,
    moq: 100, moq_unit: "set", price_min_usd: 8.5, price_max_usd: 15.2, price_unit: "set",
    payment_terms: ["TT", "LC"], lead_time_days_min: 22, lead_time_days_max: 30,
    ships_from_port: "CNSHA Shanghai", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["IATF 16949", "ECE R90"], total_sold_units: 18400, view_count: 6420,
  },
  {
    id: P("77777777-5555-0010", "0002"),
    supplier_id: "77777777-5555-0010-0000-000000000010",
    name_en: "Aftermarket Shock Absorber Twin-tube",
    name_th: "โช้คอัพ aftermarket twin-tube",
    description: "Gas-pressurized twin-tube shock absorber, 50K-km warranty, applications for SUV / pickup.",
    category: "Auto / Suspension", hs_code: "8708.80.00", hs_confidence: 0.95,
    moq: 100, moq_unit: "pcs", price_min_usd: 18.5, price_max_usd: 32.4, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 25, lead_time_days_max: 35,
    ships_from_port: "CNSHA Shanghai", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["IATF 16949"], total_sold_units: 9200, view_count: 4120,
  },

  // Jinan Heavy Machinery (77...6666-0011)
  {
    id: P("77777777-6666-0011", "1101"),
    supplier_id: "77777777-6666-0011-0000-000000000011",
    name_en: "Concrete Mixing Plant HZS60 60m³/h",
    name_th: "แพลนต์ผสมคอนกรีต HZS60 60m³/h",
    description: "Stationary concrete batching plant 60m³/h, twin-shaft mixer, PLC control, CE-marked.",
    category: "Machinery / Construction", hs_code: "8474.31.00", hs_confidence: 0.96,
    moq: 1, moq_unit: "set", price_min_usd: 65000, price_max_usd: 95000, price_unit: "set",
    payment_terms: ["TT", "LC"], lead_time_days_min: 45, lead_time_days_max: 60,
    ships_from_port: "CNQIN Qingdao", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["CE", "SGS", "ISO 9001"], total_sold_units: 142, view_count: 2810,
  },
  {
    id: P("77777777-6666-0011", "1102"),
    supplier_id: "77777777-6666-0011-0000-000000000011",
    name_en: "Hydraulic Excavator 6-ton Mini",
    name_th: "รถขุดไฮดรอลิคขนาด 6 ตัน",
    description: "Mini hydraulic crawler excavator 6T, Yanmar engine, Kawasaki main pump, rubber tracks.",
    category: "Machinery / Construction", hs_code: "8429.52.00", hs_confidence: 0.94,
    moq: 1, moq_unit: "pcs", price_min_usd: 28500, price_max_usd: 38500, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 40, lead_time_days_max: 55,
    ships_from_port: "CNQIN Qingdao", hs_form_eligible: ["Form E", "Form RCEP"],
    certifications: ["CE"], total_sold_units: 280, view_count: 3420,
  },

  // Saigon Garment Mfg (77...7777-0012)
  {
    id: P("77777777-7777-0012", "2001"),
    supplier_id: "77777777-7777-0012-0000-000000000012",
    name_en: "Performance T-shirt Quick Dry Polyester",
    name_th: "เสื้อยืดผ้าโพลีเอสเตอร์ระบายเหงื่อ",
    description: "Moisture-wicking polyester performance tee 150gsm, anti-microbial, custom logo.",
    category: "Apparel / Sportswear", hs_code: "6109.90.00", hs_confidence: 0.96,
    moq: 300, moq_unit: "pcs", price_min_usd: 3.2, price_max_usd: 5.4, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 22, lead_time_days_max: 30,
    ships_from_port: "VNSGN Saigon", hs_form_eligible: ["Form D", "Form RCEP"],
    certifications: ["BSCI", "WRAP"], total_sold_units: 28400, view_count: 6210,
  },
  {
    id: P("77777777-7777-0012", "2002"),
    supplier_id: "77777777-7777-0012-0000-000000000012",
    name_en: "Workwear Coverall Cotton/Polyester",
    name_th: "ชุดเอี๊ยมทำงานคอตตอน/โพลี",
    description: "Industrial workwear coverall 65/35 polycotton 220gsm, reflective trim, multi-pocket.",
    category: "Apparel / Workwear", hs_code: "6203.22.00", hs_confidence: 0.93,
    moq: 200, moq_unit: "pcs", price_min_usd: 9.5, price_max_usd: 14.5, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 28, lead_time_days_max: 38,
    ships_from_port: "VNSGN Saigon", hs_form_eligible: ["Form D", "Form RCEP"],
    certifications: ["BSCI"], total_sold_units: 14200, view_count: 4120,
  },

  // Da Nang Furniture (77...7777-0013)
  {
    id: P("77777777-7777-0013", "3001"),
    supplier_id: "77777777-7777-0013-0000-000000000013",
    name_en: "Rattan Lounge Chair Indoor/Outdoor",
    name_th: "เก้าอี้ rattan สำหรับในและนอกบ้าน",
    description: "Hand-woven synthetic rattan lounge chair, powder-coated aluminum frame, fade-resistant cushion.",
    category: "Furniture / Outdoor", hs_code: "9401.71.00", hs_confidence: 0.94,
    moq: 50, moq_unit: "pcs", price_min_usd: 45, price_max_usd: 75, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 35, lead_time_days_max: 45,
    ships_from_port: "VNDAD Da Nang", hs_form_eligible: ["Form D", "Form RCEP"],
    certifications: ["FSC"], total_sold_units: 4200, view_count: 3810,
  },

  // Hanoi Food (77...7777-0014)
  {
    id: P("77777777-7777-0014", "4001"),
    supplier_id: "77777777-7777-0014-0000-000000000014",
    name_en: "Dried Tropical Fruit Mix 1kg",
    name_th: "ผลไม้อบแห้งรวม 1kg",
    description: "Mixed dried tropical fruit (mango, pineapple, jackfruit, dragonfruit), no added sugar, 1kg bag.",
    category: "Food / Snacks", hs_code: "0813.50.00", hs_confidence: 0.95,
    moq: 500, moq_unit: "kg", price_min_usd: 4.8, price_max_usd: 7.2, price_unit: "kg",
    payment_terms: ["TT", "LC"], lead_time_days_min: 22, lead_time_days_max: 30,
    ships_from_port: "VNHPH Haiphong", hs_form_eligible: ["Form D", "Form RCEP"],
    certifications: ["HACCP", "FDA"], total_sold_units: 18200, view_count: 4520,
  },
  {
    id: P("77777777-7777-0014", "4002"),
    supplier_id: "77777777-7777-0014-0000-000000000014",
    name_en: "Cashew Nuts W320 Premium Grade 1kg",
    name_th: "เม็ดมะม่วงหิมพานต์ W320 พรีเมียม 1kg",
    description: "Vietnamese cashew kernels W320 grade, vacuum-packed 1kg, premium quality.",
    category: "Food / Nuts", hs_code: "0801.32.00", hs_confidence: 0.97,
    moq: 1000, moq_unit: "kg", price_min_usd: 6.4, price_max_usd: 8.5, price_unit: "kg",
    payment_terms: ["TT", "LC"], lead_time_days_min: 18, lead_time_days_max: 28,
    ships_from_port: "VNHPH Haiphong", hs_form_eligible: ["Form D", "Form RCEP"],
    certifications: ["HACCP", "FDA", "BRC"], total_sold_units: 42800, view_count: 8420,
  },

  // Seoul K-Beauty (77...8888-0015)
  {
    id: P("77777777-8888-0015", "5001"),
    supplier_id: "77777777-8888-0015-0000-000000000015",
    name_en: "Glass Skin Glow Serum 30ml",
    name_th: "เซรั่มกระจกใส Glass Skin 30ml",
    description: "K-beauty glass skin serum with niacinamide + arbutin + alpha-arbutin, MOQ 500.",
    category: "Cosmetics / Serum", hs_code: "3304.99.00", hs_confidence: 0.94,
    moq: 500, moq_unit: "pcs", price_min_usd: 4.2, price_max_usd: 6.8, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 25, lead_time_days_max: 35,
    ships_from_port: "KRPUS Busan", hs_form_eligible: ["Form AK", "Form RCEP"],
    certifications: ["ISO 22716", "CGMP"], total_sold_units: 8400, view_count: 6210,
  },
  {
    id: P("77777777-8888-0015", "5002"),
    supplier_id: "77777777-8888-0015-0000-000000000015",
    name_en: "Sheet Mask Variety Pack 10-sheet",
    name_th: "แผ่นมาสก์ K-beauty รวม 10 แผ่น",
    description: "10-variety sheet mask box, hyaluronic / collagen / centella / niacinamide / vit C and more.",
    category: "Cosmetics / Mask", hs_code: "3304.99.00", hs_confidence: 0.93,
    moq: 500, moq_unit: "box", price_min_usd: 5.8, price_max_usd: 8.2, price_unit: "box",
    payment_terms: ["TT", "PayPal"], lead_time_days_min: 22, lead_time_days_max: 30,
    ships_from_port: "KRPUS Busan", hs_form_eligible: ["Form AK", "Form RCEP"],
    certifications: ["ISO 22716", "CGMP"], total_sold_units: 12200, view_count: 7820,
  },

  // Busan Marine Tech (77...8888-0016)
  {
    id: P("77777777-8888-0016", "6001"),
    supplier_id: "77777777-8888-0016-0000-000000000016",
    name_en: "Marine Centrifugal Water Pump SS316",
    name_th: "ปั๊มหอยโข่งสำหรับเรือ SS316",
    description: "Stainless 316 marine centrifugal pump for seawater, mechanical seal, 50-300 m³/h.",
    category: "Machinery / Marine", hs_code: "8413.70.00", hs_confidence: 0.95,
    moq: 5, moq_unit: "pcs", price_min_usd: 1450, price_max_usd: 2850, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 35, lead_time_days_max: 50,
    ships_from_port: "KRPUS Busan", hs_form_eligible: ["Form AK", "Form RCEP"],
    certifications: ["DNV", "BV"], total_sold_units: 340, view_count: 1820,
  },

  // Incheon Pet Food (77...8888-0017)
  {
    id: P("77777777-8888-0017", "7001"),
    supplier_id: "77777777-8888-0017-0000-000000000017",
    name_en: "Premium Dry Dog Food Salmon Recipe 15kg",
    name_th: "อาหารสุนัขเม็ดพรีเมียม สูตรปลาแซลมอน 15kg",
    description: "Grain-free salmon recipe dry dog food, omega-3 enriched, all-life-stages, 15kg bag.",
    category: "Pet Food", hs_code: "2309.10.00", hs_confidence: 0.97,
    moq: 500, moq_unit: "bag", price_min_usd: 18, price_max_usd: 26, price_unit: "bag",
    payment_terms: ["TT", "LC"], lead_time_days_min: 25, lead_time_days_max: 35,
    ships_from_port: "KRPUS Busan", hs_form_eligible: ["Form AK", "Form RCEP"],
    certifications: ["HACCP", "ISO 22000"], total_sold_units: 8400, view_count: 4820,
  },

  // Osaka Precision (77...9999-0018)
  {
    id: P("77777777-9999-0018", "8001"),
    supplier_id: "77777777-9999-0018-0000-000000000018",
    name_en: "High-Precision Ball Bearings 6000 Series",
    name_th: "แบริ่งเม็ดกลมความแม่นยำสูง ซีรีส์ 6000",
    description: "ABEC-5 / P5 grade deep groove ball bearings, 6000 / 6200 / 6300 series, OEM quality.",
    category: "Hardware / Bearings", hs_code: "8482.10.00", hs_confidence: 0.97,
    moq: 1000, moq_unit: "pcs", price_min_usd: 0.85, price_max_usd: 3.40, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 30, lead_time_days_max: 45,
    ships_from_port: "JPOSA Osaka", hs_form_eligible: ["Form AJ", "Form RCEP"],
    certifications: ["IATF 16949", "JIS"], total_sold_units: 184000, view_count: 8420,
  },
  {
    id: P("77777777-9999-0018", "8002"),
    supplier_id: "77777777-9999-0018-0000-000000000018",
    name_en: "Industrial Robot Reducer RV-100E",
    name_th: "เกียร์ลด robot อุตสาหกรรม RV-100E",
    description: "Cycloidal RV reducer for industrial robots, payload 100kg, backlash ≤1 arcmin.",
    category: "Machinery / Robotics", hs_code: "8483.40.00", hs_confidence: 0.95,
    moq: 5, moq_unit: "pcs", price_min_usd: 1850, price_max_usd: 2850, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 35, lead_time_days_max: 50,
    ships_from_port: "JPOSA Osaka", hs_form_eligible: ["Form AJ", "Form RCEP"],
    certifications: ["JIS", "IATF 16949"], total_sold_units: 180, view_count: 2410,
  },

  // Tokyo Health Foods (77...9999-0019)
  {
    id: P("77777777-9999-0019", "9001"),
    supplier_id: "77777777-9999-0019-0000-000000000019",
    name_en: "Matcha Latte Powder Premium 200g",
    name_th: "ผงมัทฉะลาเต้ พรีเมียม 200g",
    description: "Premium grade matcha latte powder, 200g, vacuum-sealed, batch-tested for radionuclides.",
    category: "Food / Beverage", hs_code: "2106.90.00", hs_confidence: 0.92,
    moq: 500, moq_unit: "pcs", price_min_usd: 8.5, price_max_usd: 13.4, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 25, lead_time_days_max: 35,
    ships_from_port: "JPTYO Tokyo", hs_form_eligible: ["Form AJ", "Form RCEP"],
    certifications: ["HACCP", "JAS"], total_sold_units: 14200, view_count: 6420,
  },

  // Mumbai Pharma (77...aaaa-0020)
  {
    id: P("77777777-aaaa-0020", "0001"),
    supplier_id: "77777777-aaaa-0020-0000-000000000020",
    name_en: "Paracetamol 500mg Tablets 10x10 Blister",
    name_th: "พาราเซตามอล 500mg 10x10 blister",
    description: "Paracetamol 500mg tablets, WHO-GMP manufactured, 10x10 blister, lifesaver generic.",
    category: "Pharma / OTC", hs_code: "3004.90.00", hs_confidence: 0.96,
    moq: 10000, moq_unit: "pcs", price_min_usd: 0.012, price_max_usd: 0.025, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 30, lead_time_days_max: 45,
    ships_from_port: "INBOM Mumbai", hs_form_eligible: ["—"],
    certifications: ["WHO-GMP", "ISO 9001"], total_sold_units: 8800000, view_count: 4120,
  },

  // Tirupur Cotton (77...aaaa-0021)
  {
    id: P("77777777-aaaa-0021", "0001"),
    supplier_id: "77777777-aaaa-0021-0000-000000000021",
    name_en: "Organic Cotton T-Shirt 180gsm GOTS",
    name_th: "เสื้อยืดคอตตอนออร์แกนิค 180gsm GOTS",
    description: "100% GOTS-certified organic cotton t-shirt 180gsm, custom dyeing + print, MOQ 500.",
    category: "Apparel / Knit", hs_code: "6109.10.00", hs_confidence: 0.96,
    moq: 500, moq_unit: "pcs", price_min_usd: 3.8, price_max_usd: 6.2, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 35, lead_time_days_max: 50,
    ships_from_port: "INMAA Chennai", hs_form_eligible: ["—"],
    certifications: ["GOTS", "OEKO-TEX", "Fair Trade"], total_sold_units: 24800, view_count: 5210,
  },

  // München Industrial Engineering (77...bbbb-0022)
  {
    id: P("77777777-bbbb-0022", "0001"),
    supplier_id: "77777777-bbbb-0022-0000-000000000022",
    name_en: "Twin-Screw Extruder 65mm Industrial",
    name_th: "เครื่อง twin-screw extruder 65mm อุตสาหกรรม",
    description: "Co-rotating twin-screw extruder Ø65mm, throughput 150-300 kg/h, food/polymer/pet food.",
    category: "Machinery / Industrial", hs_code: "8479.89.00", hs_confidence: 0.94,
    moq: 1, moq_unit: "set", price_min_usd: 145000, price_max_usd: 240000, price_unit: "set",
    payment_terms: ["TT", "LC"], lead_time_days_min: 90, lead_time_days_max: 120,
    ships_from_port: "DEHAM Hamburg", hs_form_eligible: ["—"],
    certifications: ["CE", "DIN ISO 9001"], total_sold_units: 64, view_count: 1820,
  },

  // Jakarta Spice Industries (77...cccc-0023)
  {
    id: P("77777777-cccc-0023", "0001"),
    supplier_id: "77777777-cccc-0023-0000-000000000023",
    name_en: "Black Pepper Whole 550 g/l 1kg",
    name_th: "พริกไทยดำเม็ดเต็ม 550 g/l 1kg",
    description: "Lampung black pepper whole, 550 g/l density, MC ≤10%, vacuum-packed 1kg.",
    category: "Food / Spices", hs_code: "0904.11.00", hs_confidence: 0.97,
    moq: 500, moq_unit: "kg", price_min_usd: 5.8, price_max_usd: 8.4, price_unit: "kg",
    payment_terms: ["TT", "LC"], lead_time_days_min: 25, lead_time_days_max: 35,
    ships_from_port: "IDJKT Jakarta", hs_form_eligible: ["Form D", "Form RCEP"],
    certifications: ["HACCP", "Halal MUI"], total_sold_units: 32400, view_count: 4820,
  },
  {
    id: P("77777777-cccc-0023", "0002"),
    supplier_id: "77777777-cccc-0023-0000-000000000023",
    name_en: "Cinnamon Cassia AA Grade 1kg",
    name_th: "อบเชยจีน AA grade 1kg",
    description: "Indonesian Cinnamon cassia AA grade sticks, MC ≤14%, 1kg vacuum-packed bag.",
    category: "Food / Spices", hs_code: "0906.11.00", hs_confidence: 0.96,
    moq: 500, moq_unit: "kg", price_min_usd: 4.8, price_max_usd: 7.2, price_unit: "kg",
    payment_terms: ["TT", "LC"], lead_time_days_min: 25, lead_time_days_max: 35,
    ships_from_port: "IDJKT Jakarta", hs_form_eligible: ["Form D", "Form RCEP"],
    certifications: ["HACCP", "Halal MUI"], total_sold_units: 18200, view_count: 3210,
  },

  // Bandung Eco Packaging (77...cccc-0024)
  {
    id: P("77777777-cccc-0024", "0001"),
    supplier_id: "77777777-cccc-0024-0000-000000000024",
    name_en: "Kraft Paper Mailer Bag Eco-friendly",
    name_th: "ซองกระดาษคราฟท์เป็นมิตรกับสิ่งแวดล้อม",
    description: "FSC-certified kraft paper mailer with self-seal, biodegradable, sizes S/M/L/XL.",
    category: "Packaging / Mailer", hs_code: "4819.30.00", hs_confidence: 0.95,
    moq: 5000, moq_unit: "pcs", price_min_usd: 0.18, price_max_usd: 0.42, price_unit: "pcs",
    payment_terms: ["TT", "LC"], lead_time_days_min: 22, lead_time_days_max: 30,
    ships_from_port: "IDJKT Jakarta", hs_form_eligible: ["Form D", "Form RCEP"],
    certifications: ["FSC", "ISO 14001"], total_sold_units: 184000, view_count: 4120,
  },
];

/* ────────────────────────────────────────────────────────────
 * Run
 * ──────────────────────────────────────────────────────────── */
async function main() {
  console.log(`\n🌱 Seeding ${suppliers.length} suppliers + ${products.length} products...\n`);

  const { error: supErr, count: supCount } = await supabase
    .from("suppliers")
    .upsert(suppliers, { onConflict: "id", count: "exact" });

  if (supErr) {
    console.error("✗ Suppliers insert failed:", supErr.message);
    process.exit(1);
  }
  console.log(`✓ Suppliers upserted (target ${suppliers.length})`);

  const { error: prodErr } = await supabase
    .from("supplier_products")
    .upsert(products, { onConflict: "id", count: "exact" });

  if (prodErr) {
    console.error("✗ Products insert failed:", prodErr.message);
    process.exit(1);
  }
  console.log(`✓ Products upserted (target ${products.length})`);

  // Final counts (just for confidence)
  const totalSup = await supabase.from("suppliers").select("id", { count: "exact", head: true });
  const totalProd = await supabase.from("supplier_products").select("id", { count: "exact", head: true });
  console.log(`\n📊 Totals now: ${totalSup.count} suppliers, ${totalProd.count} products`);
  console.log("\n✓ Done.\n");
}

main().catch((e) => {
  console.error("✗ Unhandled:", e);
  process.exit(1);
});
