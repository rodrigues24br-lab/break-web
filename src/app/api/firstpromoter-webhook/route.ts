import { NextRequest, NextResponse } from "next/server";
import {
  confirmReferralLead,
  getFirstPromoterApiKey,
  resolveEventType,
  validateFirstPromoterWebhookAuth,
  type FirstPromoterWebhookPayload,
} from "@/lib/firstpromoter-server";

export const runtime = "nodejs";

const HANDLED = new Set(["referral.created", "referral.converted"]);

/**
 * FirstPromoter webhook receiver.
 * Configure the subscription custom header to send FIRSTPROMOTER_API_KEY
 * (e.g. X-API-KEY) — FPR v2 has no documented fixed HMAC header.
 * Always responds HTTP 200 so FirstPromoter does not retry forever on our errors.
 */
export async function POST(request: NextRequest) {
  const ok = () => NextResponse.json({ received: true }, { status: 200 });

  try {
    const apiKey = getFirstPromoterApiKey();
    const rawBody = await request.text();

    if (!apiKey) {
      console.error("[firstpromoter-webhook] FIRSTPROMOTER_API_KEY missing");
      return ok();
    }

    if (!validateFirstPromoterWebhookAuth(request.headers, rawBody, apiKey)) {
      console.error("[firstpromoter-webhook] signature/auth validation failed");
      return ok();
    }

    let payload: FirstPromoterWebhookPayload = {};
    try {
      payload = rawBody ? (JSON.parse(rawBody) as FirstPromoterWebhookPayload) : {};
    } catch {
      console.error("[firstpromoter-webhook] invalid JSON body");
      return ok();
    }

    const eventType = resolveEventType(payload, request.headers);
    const eventId =
      request.headers.get("x-event-id") ||
      payload.event_id ||
      (payload.event?.id != null ? String(payload.event.id) : undefined);

    if (!HANDLED.has(eventType)) {
      console.info("[firstpromoter-webhook] ignored event", {
        eventType: eventType || "(empty)",
        eventId: eventId || undefined,
      });
      return ok();
    }

    const data =
      payload.data && typeof payload.data === "object" ? payload.data : undefined;

    const result = await confirmReferralLead(data, payload.entity_id);
    if (!result.ok) {
      console.error("[firstpromoter-webhook] leads/show confirm failed", {
        eventType,
        eventId: eventId || undefined,
        status: result.status || undefined,
      });
    } else {
      console.info("[firstpromoter-webhook] confirmed", {
        eventType,
        eventId: eventId || undefined,
      });
    }

    return ok();
  } catch (error) {
    console.error("[firstpromoter-webhook] unhandled error", error);
    return ok();
  }
}
