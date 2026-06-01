/**
 * Server-side queries for the marketplace pages.
 *
 * Public-read tables (no RLS gates): suppliers, supplier_products.
 * Org-scoped tables: rfqs, quotes — RLS already restricts to user's orgs.
 */
import { createClient } from "@/lib/supabase/server";

/* ────────────────────────────────────────────────────────────
 * Public types (shaped for UI consumption)
 * ──────────────────────────────────────────────────────────── */

export interface SupplierListItem {
  id: string;
  trade_name: string;
  country: string;             // ISO-2
  country_flag: string;         // emoji derived from ISO-2
  city: string | null;
  established_year: number | null;
  staff_count: number | null;
  is_verified: boolean;
  trade_assurance: boolean;
  response_hours_avg: number | null;
  on_time_delivery_rate: number | null;
  rating: number;               // 0 if missing
  review_count: number;
  main_categories: { name: string; hs_chapter: string }[];
  main_markets: string[];
  export_volume_usd_yearly: number;
  supports_form_e: boolean;
  supports_form_rcep: boolean;
  product_count: number;
  ships_to_thailand_days_min: number;
  ships_to_thailand_days_max: number;
  ships_from_port: string | null;
}

export interface SupplierDetail extends SupplierListItem {
  legal_name: string;
  factory_size_sqm: number | null;
  verified_by: string | null;
  response_rate: number | null;
  wechat_id: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  banner_url: string | null;
  business_license_no: string | null;
}

export interface SupplierProductRow {
  id: string;
  supplier_id: string;
  name_en: string;
  name_th: string | null;
  description: string | null;
  category: string | null;
  hs_code: string | null;
  hs_confidence: number | null;
  moq: number;
  moq_unit: string;
  price_min_usd: number | null;
  price_max_usd: number | null;
  price_unit: string;
  payment_terms: string[];
  lead_time_days_min: number | null;
  lead_time_days_max: number | null;
  ships_from_port: string | null;
  hs_form_eligible: string[];
  image_urls: string[];
  certifications: string[];
  total_sold_units: number;
  view_count: number;
}

export interface TrendingProduct extends SupplierProductRow {
  supplier_trade_name: string;
  supplier_country: string;
  supplier_country_flag: string;
  supplier_is_verified: boolean;
}

export interface MarketplaceStats {
  verified_supplier_count: number;
  total_supplier_count: number;
  classified_product_count: number;
  countries_represented: number;
}

export interface SupplierReview {
  id: string;
  rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  delivery_rating: number | null;
  title: string | null;
  body: string | null;
  would_reorder: boolean | null;
  verified_purchase: boolean;
  org_name: string | null;
  created_at: string;
}

/* ────────────────────────────────────────────────────────────
 * Marketplace landing — featured + stats + trending
 * ──────────────────────────────────────────────────────────── */

/**
 * Verified suppliers sorted by rating × review_count (a simple
 * "social proof" score). Used by the "Verified Suppliers แนะนำ" section.
 */
export async function getFeaturedSuppliers(limit = 6): Promise<SupplierListItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select(
      `
        id, trade_name, country, city, established_year, staff_count,
        is_verified, trade_assurance, response_hours_avg, on_time_delivery_rate,
        main_categories, main_markets, export_volume_usd_yearly,
        supports_form_e, supports_form_rcep, rating, review_count
      `
    )
    .eq("is_verified", true)
    .order("rating", { ascending: false, nullsFirst: false })
    .order("review_count", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  // Bulk-fetch product counts + earliest-lead products for these suppliers.
  const ids = data.map((s) => s.id);
  const productAgg = await aggregateProductInfoForSuppliers(supabase, ids);

  return data.map((s) => mapSupplierRow(s, productAgg));
}

/**
 * The most-viewed products with their supplier embedded.
 * Used for the "สินค้ามาแรงในไทย" section.
 */
export async function getTrendingProducts(limit = 6): Promise<TrendingProduct[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("supplier_products")
    .select(
      `
        id, supplier_id, name_en, name_th, description, category,
        hs_code, hs_confidence, moq, moq_unit, price_min_usd, price_max_usd,
        price_unit, payment_terms, lead_time_days_min, lead_time_days_max,
        ships_from_port, hs_form_eligible, image_urls, certifications,
        total_sold_units, view_count,
        suppliers:supplier_id (trade_name, country, is_verified)
      `
    )
    .eq("is_active", true)
    .order("total_sold_units", { ascending: false, nullsFirst: false })
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((p: any) => {
    const sup = Array.isArray(p.suppliers) ? p.suppliers[0] : p.suppliers;
    return {
      ...mapProductRow(p),
      supplier_trade_name: sup?.trade_name ?? "—",
      supplier_country: sup?.country ?? "",
      supplier_country_flag: countryFlag(sup?.country ?? ""),
      supplier_is_verified: Boolean(sup?.is_verified),
    };
  });
}

/**
 * High-level counts shown in the 4 stat cards on /marketplace.
 */
export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  const supabase = createClient();
  const [verifiedRes, totalRes, productRes, countriesRes] = await Promise.all([
    supabase
      .from("suppliers")
      .select("id", { count: "exact", head: true })
      .eq("is_verified", true),
    supabase.from("suppliers").select("id", { count: "exact", head: true }),
    supabase
      .from("supplier_products")
      .select("id", { count: "exact", head: true })
      .not("hs_code", "is", null),
    supabase.from("suppliers").select("country"),
  ]);

  const countries = new Set(
    (countriesRes.data ?? []).map((s: { country: string }) => s.country)
  );

  return {
    verified_supplier_count: verifiedRes.count ?? 0,
    total_supplier_count: totalRes.count ?? 0,
    classified_product_count: productRes.count ?? 0,
    countries_represented: countries.size,
  };
}

/* ────────────────────────────────────────────────────────────
 * Supplier profile page
 * ──────────────────────────────────────────────────────────── */

export async function getSupplierById(id: string): Promise<SupplierDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select(
      `
        id, legal_name, trade_name, country, city, established_year, staff_count,
        factory_size_sqm, business_license_no,
        is_verified, verified_by, trade_assurance,
        response_rate, response_hours_avg, on_time_delivery_rate,
        main_categories, main_markets, export_volume_usd_yearly,
        supports_form_e, supports_form_rcep,
        wechat_id, whatsapp, email, website, logo_url, banner_url,
        rating, review_count
      `
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const agg = await aggregateProductInfoForSuppliers(supabase, [data.id]);
  const base = mapSupplierRow(data, agg);

  return {
    ...base,
    legal_name: data.legal_name,
    factory_size_sqm: data.factory_size_sqm,
    verified_by: data.verified_by,
    response_rate: data.response_rate,
    wechat_id: data.wechat_id,
    whatsapp: data.whatsapp,
    email: data.email,
    website: data.website,
    logo_url: data.logo_url,
    banner_url: data.banner_url,
    business_license_no: data.business_license_no,
  };
}

export async function getSupplierProducts(
  supplierId: string,
  limit = 30
): Promise<SupplierProductRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("supplier_products")
    .select(
      `
        id, supplier_id, name_en, name_th, description, category,
        hs_code, hs_confidence, moq, moq_unit, price_min_usd, price_max_usd,
        price_unit, payment_terms, lead_time_days_min, lead_time_days_max,
        ships_from_port, hs_form_eligible, image_urls, certifications,
        total_sold_units, view_count
      `
    )
    .eq("supplier_id", supplierId)
    .eq("is_active", true)
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map(mapProductRow);
}

export async function getSupplierReviews(
  supplierId: string,
  limit = 10
): Promise<SupplierReview[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("supplier_reviews")
    .select(
      `
        id, rating, quality_rating, communication_rating, delivery_rating,
        title, body, would_reorder, verified_purchase, created_at,
        organizations:org_id ( name )
      `
    )
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((r: any) => {
    const org = Array.isArray(r.organizations) ? r.organizations[0] : r.organizations;
    return {
      id: r.id,
      rating: r.rating,
      quality_rating: r.quality_rating,
      communication_rating: r.communication_rating,
      delivery_rating: r.delivery_rating,
      title: r.title,
      body: r.body,
      would_reorder: r.would_reorder,
      verified_purchase: Boolean(r.verified_purchase),
      org_name: org?.name ?? null,
      created_at: r.created_at,
    };
  });
}

/* ────────────────────────────────────────────────────────────
 * RFQ pages
 * ──────────────────────────────────────────────────────────── */

export interface RfqRow {
  id: string;
  org_id: string;
  title: string;
  description: string;
  category: string | null;
  hs_code_hint: string | null;
  quantity: number;
  quantity_unit: string;
  target_price_usd: number | null;
  currency: string;
  preferred_origin: string[];
  required_certifications: string[];
  required_form_e: boolean;
  required_form_rcep: boolean;
  delivery_incoterm: string;
  delivery_port: string;
  needed_by_date: string | null;
  sample_required: boolean;
  status: "draft" | "open" | "closed" | "awarded" | "cancelled";
  expires_at: string | null;
  created_at: string;
}

export interface QuoteRow {
  id: string;
  supplier_id: string;
  supplier_trade_name: string;
  supplier_country: string;
  supplier_country_flag: string;
  supplier_is_verified: boolean;
  unit_price_usd: number;
  total_price_usd: number;
  moq: number;
  lead_time_days: number;
  incoterm: string;
  ships_from_port: string | null;
  offers_form_e: boolean;
  offers_form_rcep: boolean;
  certifications: string[];
  message: string | null;
  attachments: string[];
  valid_until: string | null;
  status: "submitted" | "viewed" | "shortlisted" | "rejected" | "awarded";
  match_score: number | null;
  created_at: string;
}

export async function getRfqById(rfqId: string): Promise<RfqRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rfqs")
    .select(
      `
        id, org_id, title, description, category, hs_code_hint, quantity,
        quantity_unit, target_price_usd, currency, preferred_origin,
        required_certifications, required_form_e, required_form_rcep,
        delivery_incoterm, delivery_port, needed_by_date, sample_required,
        status, expires_at, created_at
      `
    )
    .eq("id", rfqId)
    .maybeSingle();

  if (error || !data) return null;
  return data as RfqRow;
}

export async function getQuotesForRfq(rfqId: string): Promise<QuoteRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      `
        id, supplier_id, unit_price_usd, total_price_usd, moq,
        lead_time_days, incoterm, ships_from_port,
        offers_form_e, offers_form_rcep, certifications, message,
        attachments, valid_until, status, match_score, created_at,
        suppliers:supplier_id (trade_name, country, is_verified)
      `
    )
    .eq("rfq_id", rfqId)
    .order("match_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((q: any) => {
    const sup = Array.isArray(q.suppliers) ? q.suppliers[0] : q.suppliers;
    return {
      id: q.id,
      supplier_id: q.supplier_id,
      supplier_trade_name: sup?.trade_name ?? "—",
      supplier_country: sup?.country ?? "",
      supplier_country_flag: countryFlag(sup?.country ?? ""),
      supplier_is_verified: Boolean(sup?.is_verified),
      unit_price_usd: Number(q.unit_price_usd ?? 0),
      total_price_usd: Number(q.total_price_usd ?? 0),
      moq: q.moq,
      lead_time_days: q.lead_time_days,
      incoterm: q.incoterm,
      ships_from_port: q.ships_from_port,
      offers_form_e: q.offers_form_e,
      offers_form_rcep: q.offers_form_rcep,
      certifications: q.certifications ?? [],
      message: q.message,
      attachments: q.attachments ?? [],
      valid_until: q.valid_until,
      status: q.status,
      match_score: q.match_score == null ? null : Number(q.match_score),
      created_at: q.created_at,
    };
  });
}

/* ────────────────────────────────────────────────────────────
 * Supplier Inquiries
 * ──────────────────────────────────────────────────────────── */

export interface InquiryListItem {
  id: string;
  supplier_id: string;
  supplier_trade_name: string;
  supplier_country: string;
  supplier_country_flag: string;
  subject: string;
  message: string;
  quantity: number | null;
  quantity_unit: string;
  target_price_usd: number | null;
  needed_by_date: string | null;
  status: "pending" | "in_review" | "forwarded" | "responded" | "closed";
  admin_note: string | null;
  supplier_response: string | null;
  responded_at: string | null;
  created_at: string;
}

export async function getInquiriesForOrg(
  orgId: string | null
): Promise<InquiryListItem[]> {
  if (!orgId) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("supplier_inquiries")
    .select(
      `
        id, supplier_id, subject, message, quantity, quantity_unit,
        target_price_usd, needed_by_date, status, admin_note,
        supplier_response, responded_at, created_at,
        suppliers:supplier_id (trade_name, country)
      `
    )
    .eq("buyer_org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((r: any) => {
    const sup = Array.isArray(r.suppliers) ? r.suppliers[0] : r.suppliers;
    return {
      id: r.id,
      supplier_id: r.supplier_id,
      supplier_trade_name: sup?.trade_name ?? "—",
      supplier_country: sup?.country ?? "",
      supplier_country_flag: countryFlag(sup?.country ?? ""),
      subject: r.subject,
      message: r.message,
      quantity: r.quantity,
      quantity_unit: r.quantity_unit ?? "pcs",
      target_price_usd: r.target_price_usd == null ? null : Number(r.target_price_usd),
      needed_by_date: r.needed_by_date,
      status: r.status,
      admin_note: r.admin_note,
      supplier_response: r.supplier_response,
      responded_at: r.responded_at,
      created_at: r.created_at,
    };
  });
}

export interface RfqListItem {
  id: string;
  title: string;
  status: RfqRow["status"];
  quantity: number;
  quantity_unit: string;
  category: string | null;
  preferred_origin: string[];
  required_form_e: boolean;
  needed_by_date: string | null;
  created_at: string;
  quote_count: number;
}

export async function getRfqsForOrg(orgId: string | null): Promise<RfqListItem[]> {
  if (!orgId) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rfqs")
    .select(
      `
        id, title, status, quantity, quantity_unit, category,
        preferred_origin, required_form_e, needed_by_date, created_at,
        quotes(count)
      `
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data.map((r: any) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    quantity: r.quantity,
    quantity_unit: r.quantity_unit,
    category: r.category,
    preferred_origin: r.preferred_origin ?? [],
    required_form_e: r.required_form_e,
    needed_by_date: r.needed_by_date,
    created_at: r.created_at,
    quote_count: r.quotes?.[0]?.count ?? 0,
  }));
}

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */

/**
 * Aggregate product-count + min/max shipping-days + ships_from_port for a list
 * of supplier IDs in one round-trip, then bucket by supplier_id.
 *
 * Used to enrich SupplierListItem (the UI shows "184 สินค้า" / "ส่ง TH 18-25 วัน"
 * but the DB stores these on the products table, not the supplier).
 */
async function aggregateProductInfoForSuppliers(
  supabase: ReturnType<typeof createClient>,
  supplierIds: string[]
): Promise<Map<string, { product_count: number; lead_min: number; lead_max: number; port: string | null }>> {
  const map = new Map<
    string,
    { product_count: number; lead_min: number; lead_max: number; port: string | null }
  >();
  if (supplierIds.length === 0) return map;

  const { data } = await supabase
    .from("supplier_products")
    .select("supplier_id, lead_time_days_min, lead_time_days_max, ships_from_port")
    .in("supplier_id", supplierIds)
    .eq("is_active", true);

  for (const row of data ?? []) {
    const cur = map.get(row.supplier_id) ?? {
      product_count: 0,
      lead_min: Infinity,
      lead_max: 0,
      port: null,
    };
    cur.product_count++;
    if (row.lead_time_days_min != null) {
      cur.lead_min = Math.min(cur.lead_min, row.lead_time_days_min);
    }
    if (row.lead_time_days_max != null) {
      cur.lead_max = Math.max(cur.lead_max, row.lead_time_days_max);
    }
    if (!cur.port && row.ships_from_port) cur.port = row.ships_from_port;
    map.set(row.supplier_id, cur);
  }
  return map;
}

function mapSupplierRow(
  s: any,
  agg: Map<string, { product_count: number; lead_min: number; lead_max: number; port: string | null }>
): SupplierListItem {
  const a = agg.get(s.id);
  return {
    id: s.id,
    trade_name: s.trade_name,
    country: s.country,
    country_flag: countryFlag(s.country),
    city: s.city,
    established_year: s.established_year,
    staff_count: s.staff_count,
    is_verified: Boolean(s.is_verified),
    trade_assurance: Boolean(s.trade_assurance),
    response_hours_avg: s.response_hours_avg,
    on_time_delivery_rate: s.on_time_delivery_rate == null ? null : Number(s.on_time_delivery_rate),
    rating: s.rating == null ? 0 : Number(s.rating),
    review_count: s.review_count ?? 0,
    main_categories: parseMainCategories(s.main_categories ?? []),
    main_markets: s.main_markets ?? [],
    export_volume_usd_yearly: Number(s.export_volume_usd_yearly ?? 0),
    supports_form_e: Boolean(s.supports_form_e),
    supports_form_rcep: Boolean(s.supports_form_rcep),
    product_count: a?.product_count ?? 0,
    ships_to_thailand_days_min: a && a.lead_min !== Infinity ? a.lead_min : 0,
    ships_to_thailand_days_max: a?.lead_max ?? 0,
    ships_from_port: a?.port ?? null,
  };
}

function mapProductRow(p: any): SupplierProductRow {
  return {
    id: p.id,
    supplier_id: p.supplier_id,
    name_en: p.name_en,
    name_th: p.name_th,
    description: p.description,
    category: p.category,
    hs_code: p.hs_code,
    hs_confidence: p.hs_confidence == null ? null : Number(p.hs_confidence),
    moq: p.moq,
    moq_unit: p.moq_unit,
    price_min_usd: p.price_min_usd == null ? null : Number(p.price_min_usd),
    price_max_usd: p.price_max_usd == null ? null : Number(p.price_max_usd),
    price_unit: p.price_unit,
    payment_terms: p.payment_terms ?? [],
    lead_time_days_min: p.lead_time_days_min,
    lead_time_days_max: p.lead_time_days_max,
    ships_from_port: p.ships_from_port,
    hs_form_eligible: p.hs_form_eligible ?? [],
    image_urls: p.image_urls ?? [],
    certifications: p.certifications ?? [],
    total_sold_units: p.total_sold_units ?? 0,
    view_count: p.view_count ?? 0,
  };
}

/**
 * Some supplier rows have main_categories as text[] of HS chapters ("8504")
 * for backward-compat with the schema. We render them as { name, hs_chapter }
 * pairs where the "name" is a friendlier label.
 *
 * If the DB ever stores objects directly (seeded that way), pass through.
 */
function parseMainCategories(
  raw: string[] | { name: string; hs_chapter: string }[]
): { name: string; hs_chapter: string }[] {
  if (raw.length === 0) return [];
  if (typeof raw[0] === "string") {
    return (raw as string[]).map((chapter) => ({
      name: hsChapterLabel(chapter),
      hs_chapter: chapter,
    }));
  }
  return raw as { name: string; hs_chapter: string }[];
}

const HS_CHAPTER_LABELS: Record<string, string> = {
  "85": "Electrical machinery",
  "8504": "Power converters / inverters",
  "8507": "Batteries",
  "61": "Knit garments",
  "6109": "Knit garments",
  "62": "Apparel",
  "63": "Textiles",
  "6302": "Home textiles",
  "84": "Machinery",
  "33": "Cosmetics",
  "3304": "Cosmetics",
  "39": "Plastics",
  "94": "Furniture",
  "73": "Iron & steel articles",
  "87": "Vehicles & parts",
};

function hsChapterLabel(code: string): string {
  return HS_CHAPTER_LABELS[code] ?? `HS ${code}`;
}

/**
 * Convert ISO-3166 alpha-2 country code to a flag emoji. Pure formula:
 * regional indicator symbol = base 0x1F1E6 + (letter offset from 'A').
 */
function countryFlag(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return "🏳";
  const code = iso2.toUpperCase();
  const A = 0x1f1e6;
  const offset = "A".charCodeAt(0);
  return (
    String.fromCodePoint(A + (code.charCodeAt(0) - offset)) +
    String.fromCodePoint(A + (code.charCodeAt(1) - offset))
  );
}

export { countryFlag };
