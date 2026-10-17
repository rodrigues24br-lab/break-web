import { NextRequest } from "next/server";
import { appConfig } from "@/lib/config";

/** Prefer Host header / public site URL over bind address (0.0.0.0). */
export function getRequestOrigin(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (request.nextUrl.protocol.replace(":", "") || "http");

  if (host && !host.startsWith("0.0.0.0")) {
    return `${proto}://${host}`;
  }

  return appConfig.siteUrl.replace(/\/$/, "");
}
