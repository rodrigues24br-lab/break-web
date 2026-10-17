import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import {
  FPR_COOKIE,
  FPR_COOKIE_MAX_AGE,
  FPR_QUERY,
  parseAffiliateRef,
} from "./lib/firstpromoter";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const fpr = parseAffiliateRef(
    request.nextUrl.searchParams.get(FPR_QUERY)
  );
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
  matcher: ["/", "/(es|pt)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
