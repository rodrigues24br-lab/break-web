import { NextRequest, NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import {
  MOCK_SESSION_COOKIE,
  buildMockSession,
  encodeMockSession,
} from "@/lib/mock-session";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";

/**
 * Progressive-enhancement auth for mock/demo mode.
 * Works with a plain HTML form POST even if client JS has not hydrated.
 */
export async function POST(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const contentType = request.headers.get("content-type") || "";
  let email = "";
  let password = "";
  let locale = "es";
  let mode = "signup";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      locale?: string;
      mode?: string;
    };
    email = body.email?.trim() || "";
    password = body.password || "";
    locale =
      body.locale === "pt" || body.locale === "es" || body.locale === "en"
        ? body.locale
        : "en";
    mode = body.mode === "login" ? "login" : "signup";
  } else {
    const form = await request.formData();
    email = String(form.get("email") || "").trim();
    password = String(form.get("password") || "");
    const loc = String(form.get("locale") || "en");
    locale = loc === "pt" || loc === "es" || loc === "en" ? loc : "en";
    mode = form.get("mode") === "login" ? "login" : "signup";
  }

  if (!email || !email.includes("@")) {
    return NextResponse.redirect(
      new URL(
        `/${locale}/${mode === "login" ? "login" : "signup"}?error=email`,
        origin
      ),
      303
    );
  }
  if (password.length < 6) {
    return NextResponse.redirect(
      new URL(
        `/${locale}/${mode === "login" ? "login" : "signup"}?error=password`,
        origin
      ),
      303
    );
  }

  // Real Firebase auth is client-side; this route is the mock/demo path.
  if (!appConfig.mockMode) {
    return NextResponse.json(
      { error: "Use client Firebase auth when mock mode is disabled" },
      { status: 400 }
    );
  }

  const session = buildMockSession(email);
  const redirectTo = new URL(`/${locale}/plans`, origin);
  const response = NextResponse.redirect(redirectTo, 303);
  response.cookies.set(MOCK_SESSION_COOKIE, encodeMockSession(session), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
