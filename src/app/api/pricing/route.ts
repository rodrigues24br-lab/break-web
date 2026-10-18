import { NextRequest, NextResponse } from "next/server";
import {
  PRICE_ANNUAL_USD,
  PRICE_MONTHLY_USD,
  USD_PRICING,
  clientIpFromHeaders,
  countryFromHeaders,
  currencyForCountry,
  roundMoney,
  symbolForCurrency,
  type PricingResponse,
} from "@/lib/pricing";

export const runtime = "nodejs";

const CACHE =
  "public, s-maxage=300, stale-while-revalidate=3600, max-age=60";

function json(body: PricingResponse, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": CACHE,
      "CDN-Cache-Control": CACHE,
      "Vercel-CDN-Cache-Control": CACHE,
    },
  });
}

async function countryFromIp(ip: string | null): Promise<string | null> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.")) {
    return null;
  }
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/country_code/`, {
      headers: { Accept: "text/plain" },
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const text = (await res.text()).trim().toUpperCase();
    if (text.length === 2 && /^[A-Z]{2}$/.test(text)) return text;
    return null;
  } catch {
    return null;
  }
}

async function rateUsdTo(currency: string): Promise<number | null> {
  if (currency === "USD") return 1;
  try {
    const url = `https://api.frankfurter.app/latest?from=USD&to=${encodeURIComponent(currency)}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: Record<string, number> };
    const rate = data.rates?.[currency];
    return typeof rate === "number" && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    let country = countryFromHeaders(request.headers);
    if (!country) {
      country = await countryFromIp(clientIpFromHeaders(request.headers));
    }

    // US or unknown → fixed USD
    if (!country || country === "US") {
      return json(USD_PRICING);
    }

    const currency = currencyForCountry(country);
    if (currency === "USD") {
      return json(USD_PRICING);
    }

    const rate = await rateUsdTo(currency);
    if (rate == null) {
      return json(USD_PRICING);
    }

    const priceLocal = roundMoney(PRICE_ANNUAL_USD * rate, currency);
    const monthlyLocal = roundMoney(PRICE_MONTHLY_USD * rate, currency);

    return json({
      priceLocal,
      monthlyLocal,
      currency,
      symbol: symbolForCurrency(currency),
    });
  } catch (error) {
    console.error("[pricing]", error);
    return json(USD_PRICING);
  }
}
