import { NextRequest, NextResponse } from "next/server";
import { grantProStatus } from "@/lib/firebase/admin";
import { appConfig } from "@/lib/config";
import { getRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";

/** Native form POST fallback for mock checkout (no client JS required). */
export async function POST(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const uid = String(form.get("uid") || "").trim();
  const locale = form.get("locale") === "pt" ? "pt" : "es";

  if (!email || !uid) {
    return NextResponse.redirect(new URL(`/${locale}/checkout`, origin), 303);
  }

  if (appConfig.mockMode) {
    await grantProStatus({ uid, email });
  }

  const url = new URL(`/${locale}/success`, origin);
  url.searchParams.set("mock", "1");
  url.searchParams.set("uid", uid);
  url.searchParams.set("email", email);
  return NextResponse.redirect(url, 303);
}
