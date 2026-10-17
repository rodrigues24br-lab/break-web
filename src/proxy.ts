import { NextRequest, NextResponse } from "next/server";
import {
  FPR_COOKIE,
  FPR_COOKIE_MAX_AGE,
  FPR_QUERY,
  parseAffiliateRef,
} from "./lib/firstpromoter";

const LOCALES = ["en", "es", "pt"] as const;
const LOCALE_SET = new Set<string>(LOCALES);
const DEFAULT_LOCALE = "en";

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && LOCALE_SET.has(cookie)) return cookie;

  const header = (request.headers.get("accept-language") || "").toLowerCase();
  // Prefer first matching language tag in Accept-Language order
  const parts = header.split(",").map((p) => p.trim().split(";")[0]);
  for (const part of parts) {
    if (!part) continue;
    const base = part.slice(0, 2);
    if (LOCALE_SET.has(base)) return base;
  }
  return DEFAULT_LOCALE;
}

/** Locale redirect + FirstPromoter cookie. Never blocks. */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hasLocale = first ? LOCALE_SET.has(first) : false;
  const locale = hasLocale ? first! : detectLocale(request);

  let response: NextResponse;

  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  const fpr = parseAffiliateRef(searchParams.get(FPR_QUERY));
  if (fpr) {
    response.cookies.set(FPR_COOKIE, fpr, {
      maxAge: FPR_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
