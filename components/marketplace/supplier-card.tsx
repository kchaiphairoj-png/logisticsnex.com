"use client";
import * as React from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Package,
  Clock,
  MessageSquare,
  Award,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Supplier } from "@/lib/marketplace-data";
import { cn } from "@/lib/utils";

export function SupplierCard({
  supplier,
  matchScore,
  matchReason,
}: {
  supplier: Supplier;
  matchScore?: number;
  matchReason?: string;
}) {
  return (
    <Card className="group overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      {/* Match score banner */}
      {matchScore !== undefined && (
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-emerald-500/10 to-transparent px-5 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20">
              <Award className="h-3 w-3 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-emerald-400">
              AI Match Score
            </span>
          </div>
          <span className="text-sm font-bold tabular-nums text-emerald-400">
            {(matchScore * 100).toFixed(0)}%
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 ring-1 ring-blue-500/30 text-xl">
            {supplier.country_flag}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold truncate">
                {supplier.trade_name}
              </h3>
              {supplier.is_verified && (
                <Badge variant="success" className="shrink-0">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {supplier.city} · ก่อตั้ง {supplier.established_year} · {supplier.staff_count} คน
            </p>
          </div>
        </div>

        {/* Rating + categories */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium tabular-nums">
              {supplier.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({supplier.review_count})
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            ส่งออก {(supplier.export_volume_usd_yearly / 1_000_000).toFixed(1)}M USD/ปี
          </span>
        </div>

        {/* Match reason (AI) */}
        {matchReason && (
          <p className="mt-3 rounded-md bg-emerald-500/5 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-200/90 leading-relaxed">
            <span className="font-medium text-emerald-400">เพราะ:</span>{" "}
            {matchReason}
          </p>
        )}

        {/* Categories */}
        <div className="mt-3 flex flex-wrap gap-1">
          {supplier.main_categories.slice(0, 2).map((c) => (
            <Badge key={c.hs_chapter} variant="outline" className="text-[10px]">
              {c.name}
            </Badge>
          ))}
        </div>

        {/* FTA badges */}
        <div className="mt-3 flex flex-wrap gap-1">
          {supplier.supports_form_e && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
              ✓ Form E
            </span>
          )}
          {supplier.supports_form_rcep && (
            <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-400">
              ✓ Form RCEP
            </span>
          )}
          {supplier.trade_assurance && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
              🛡 Trade Assurance
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
          <Stat icon={Package} label="สินค้า" value={supplier.product_count.toString()} />
          <Stat icon={MessageSquare} label="ตอบ" value={`${supplier.response_hours_avg}ชม`} />
          <Stat icon={Clock} label="ส่ง TH" value={`${supplier.ships_to_thailand_days_min}-${supplier.ships_to_thailand_days_max}ว`} />
        </div>

        <Button asChild variant="outline" size="sm" className="mt-4 w-full">
          <Link href={`/marketplace/suppliers/${supplier.id}`}>
            ดูโปรไฟล์
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <Icon className="mx-auto h-3 w-3 text-muted-foreground" />
      <p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-medium tabular-nums">{value}</p>
    </div>
  );
}

export function ProductCard({
  product,
  supplier,
}: {
  product: {
    id: string;
    supplier_id: string;
    name_th: string;
    name_en: string;
    image_emoji: string;
    category: string;
    hs_code: string;
    moq: number;
    price_min_usd: number;
    price_max_usd: number;
    lead_time_days_min: number;
    lead_time_days_max: number;
    hs_form_eligible: string[];
    total_sold_units: number;
  };
  supplier?: Supplier;
}) {
  return (
    <Card className="group overflow-hidden transition-all hover:border-primary/40">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-secondary/60 to-secondary/20 text-5xl">
        {product.image_emoji}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            {product.hs_code}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {product.category}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug">
          {product.name_th}
        </h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
          {product.name_en}
        </p>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-base font-bold text-foreground tabular-nums">
            ${product.price_min_usd.toFixed(2)}-{product.price_max_usd.toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">/ pcs</span>
        </div>

        <p className="mt-1 text-[11px] text-muted-foreground">
          MOQ <span className="font-medium text-foreground">{product.moq.toLocaleString()}</span>
          {" · "}
          ส่ง <span className="font-medium text-foreground">{product.lead_time_days_min}-{product.lead_time_days_max} วัน</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {product.hs_form_eligible.slice(0, 2).map((f) => (
            <span
              key={f}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                f === "Form E"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-sky-500/10 text-sky-400"
              )}
            >
              ✓ {f}
            </span>
          ))}
        </div>

        {supplier && (
          <Link
            href={`/marketplace/suppliers/${supplier.id}`}
            className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <span>{supplier.country_flag}</span>
            <span className="truncate">{supplier.trade_name}</span>
            {supplier.is_verified && (
              <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
            )}
          </Link>
        )}
      </div>
    </Card>
  );
}
