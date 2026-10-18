"use client";

import { useEffect, useState } from "react";
import {
  USD_PRICING,
  formatMoney,
  type PricingResponse,
} from "@/lib/pricing";

type Props = {
  /** Server-rendered fallback from i18n (e.g. "$49.99" or "≈ $4.17/mo"). */
  fallback: string;
  className?: string;
  mode?: "annual" | "monthly";
  /** Used when mode is monthly — `{price}` replaced with formatted monthly. */
  monthlyTemplate?: string;
};

let cachedPricing: PricingResponse | null = null;
let inflight: Promise<PricingResponse | null> | null = null;

function loadPricing(): Promise<PricingResponse | null> {
  if (cachedPricing) return Promise.resolve(cachedPricing);
  if (inflight) return inflight;
  inflight = fetch("/api/pricing")
    .then(async (res) => {
      if (!res.ok) throw new Error("pricing failed");
      return (await res.json()) as PricingResponse;
    })
    .then((data) => {
      if (
        typeof data?.priceLocal === "number" &&
        typeof data?.monthlyLocal === "number" &&
        typeof data?.currency === "string" &&
        typeof data?.symbol === "string"
      ) {
        cachedPricing = data;
        return data;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function DynamicPrice({
  fallback,
  className,
  mode = "annual",
  monthlyTemplate = "≈ {price}/mo",
}: Props) {
  const [pricing, setPricing] = useState<PricingResponse | null>(cachedPricing);

  useEffect(() => {
    let cancelled = false;
    void loadPricing().then((data) => {
      if (!cancelled && data) setPricing(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!pricing) {
    return <span className={className}>{fallback}</span>;
  }

  if (mode === "monthly") {
    const monthly = formatMoney(
      pricing.monthlyLocal,
      pricing.currency,
      pricing.symbol
    );
    return (
      <span className={className} data-pricing-monthly>
        {monthlyTemplate.replace("{price}", monthly)}
      </span>
    );
  }

  return (
    <span className={className} data-pricing-annual>
      {formatMoney(pricing.priceLocal, pricing.currency, pricing.symbol)}
    </span>
  );
}
