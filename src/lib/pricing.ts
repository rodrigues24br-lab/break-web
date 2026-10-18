/** Annual Break Pro list price (USD). */
export const PRICE_ANNUAL_USD = 49.99;
/** Display monthly equivalent (49.99 / 12). */
export const PRICE_MONTHLY_USD = 4.17;

export type PricingResponse = {
  priceLocal: number;
  monthlyLocal: number;
  currency: string;
  symbol: string;
};

export const USD_PRICING: PricingResponse = {
  priceLocal: PRICE_ANNUAL_USD,
  monthlyLocal: PRICE_MONTHLY_USD,
  currency: "USD",
  symbol: "$",
};

/** ISO country → ISO 4217 currency (major markets). */
export const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  MX: "MXN",
  BR: "BRL",
  AR: "ARS",
  CL: "CLP",
  CO: "COP",
  PE: "PEN",
  GB: "GBP",
  IE: "EUR",
  PT: "EUR",
  ES: "EUR",
  FR: "EUR",
  DE: "EUR",
  IT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  FI: "EUR",
  GR: "EUR",
  LU: "EUR",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  RO: "RON",
  AU: "AUD",
  NZ: "NZD",
  JP: "JPY",
  KR: "KRW",
  CN: "CNY",
  HK: "HKD",
  SG: "SGD",
  IN: "INR",
  ZA: "ZAR",
  AE: "AED",
  IL: "ILS",
  TR: "TRY",
};

export const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  CAD: "CA$",
  MXN: "MX$",
  BRL: "R$",
  ARS: "AR$",
  CLP: "CLP$",
  COP: "COL$",
  PEN: "S/",
  GBP: "£",
  EUR: "€",
  CHF: "CHF",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  CZK: "Kč",
  HUF: "Ft",
  RON: "lei",
  AUD: "A$",
  NZD: "NZ$",
  JPY: "¥",
  KRW: "₩",
  CNY: "¥",
  HKD: "HK$",
  SGD: "S$",
  INR: "₹",
  ZAR: "R",
  AED: "AED",
  ILS: "₪",
  TRY: "₺",
};

export function currencyForCountry(country: string | null | undefined): string {
  if (!country) return "USD";
  const code = country.trim().toUpperCase();
  if (code === "US" || code === "XX" || code === "T1") return "USD";
  return COUNTRY_CURRENCY[code] || "USD";
}

export function symbolForCurrency(currency: string): string {
  return CURRENCY_SYMBOL[currency] || currency;
}

export function roundMoney(value: number, currency: string): number {
  // Zero-decimal currencies
  if (currency === "JPY" || currency === "KRW" || currency === "CLP") {
    return Math.round(value);
  }
  return Math.round(value * 100) / 100;
}

export function formatMoney(amount: number, currency: string, symbol: string) {
  const decimals =
    currency === "JPY" || currency === "KRW" || currency === "CLP" ? 0 : 2;
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

export function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return null;
}

export function countryFromHeaders(headers: Headers): string | null {
  const vercel = headers.get("x-vercel-ip-country")?.trim();
  if (vercel && vercel.length === 2 && vercel.toUpperCase() !== "XX") {
    return vercel.toUpperCase();
  }
  const cf = headers.get("cf-ipcountry")?.trim();
  if (cf && cf.length === 2 && cf.toUpperCase() !== "XX") {
    return cf.toUpperCase();
  }
  return null;
}
