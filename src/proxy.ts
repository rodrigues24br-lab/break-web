import { NextRequest, NextResponse } from "next/server";
import {
  FPR_COOKIE,
  FPR_COOKIE_MAX_AGE,
  FPR_QUERY,
  parseAffiliateRef,
} from "./lib/firstpromoter";

const LOCALES = new Set(["es", "pt"]);
const DEFAULT_LOCALE = "es";

/**
 * Lightweight proxy: locale redirect + FirstPromoter cookie only.
 * No auth gates, no 403s — never block requests.
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Never interfere with APIs, Next internals, or static assets
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
  const hasLocale = first ? LOCALES.has(first) : false;

  let response: NextResponse;

  if (!hasLocale) {
    // / → /es  (or /foo → /es/foo)
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  response.cookies.set("NEXT_LOCALE", hasLocale ? first! : DEFAULT_LOCALE, {
    path: "/",
    sameSite: "lax",
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
  // Only page navigations — exclude api, next internals, static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
