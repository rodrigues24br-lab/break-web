import { createHmac, timingSafeEqual } from "crypto";

const FPR_API_BASE = "https://firstpromoter.com/api/v1";

export function getFirstPromoterApiKey() {
  return process.env.FIRSTPROMOTER_API_KEY?.trim() || "";
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * FirstPromoter v2 docs do not publish a fixed HMAC header; subscriptions
 * authenticate via custom headers (and OpenAPI mentions a per-subscription
 * secret_key / "signature" for test deliveries).
 *
 * We accept:
 * - Shared secret equal to FIRSTPROMOTER_API_KEY in
 *   X-API-KEY | X-Api-Key | X-FPR-API-KEY | Authorization: Bearer …
 * - HMAC-SHA256 of the raw body (hex or base64, optional `sha256=` prefix) in
 *   X-Webhook-Signature | X-FPR-Signature | X-Signature | X-Hub-Signature-256
 *   using FIRSTPROMOTER_WEBHOOK_SECRET when set, else FIRSTPROMOTER_API_KEY.
 */
export function validateFirstPromoterWebhookAuth(
  headers: Headers,
  rawBody: string,
  apiKey: string
): boolean {
  if (!apiKey) return false;

  const sharedCandidates = [
    headers.get("x-api-key"),
    headers.get("x-fpr-api-key"),
    headers.get("x-firstpromoter-key"),
    headers.get("x-firstpromoter-api-key"),
  ];
  const authorization = headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    sharedCandidates.push(authorization.slice(7).trim());
  }
  for (const value of sharedCandidates) {
    if (value && safeEqual(value, apiKey)) return true;
  }

  const secret =
    process.env.FIRSTPROMOTER_WEBHOOK_SECRET?.trim() || apiKey;
  const expectedHex = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBase64 = createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");

  const signatureHeaders = [
    headers.get("x-webhook-signature"),
    headers.get("x-fpr-signature"),
    headers.get("x-signature"),
    headers.get("x-hub-signature-256"),
  ];

  for (const raw of signatureHeaders) {
    if (!raw) continue;
    const cleaned = raw.replace(/^sha256=/i, "").trim();
    if (safeEqual(cleaned, expectedHex) || safeEqual(cleaned, expectedBase64)) {
      return true;
    }
  }

  return false;
}

export type FirstPromoterWebhookPayload = {
  event_id?: string;
  event_type?: string;
  action?: string;
  entity_type?: string;
  entity_id?: number | string;
  data?: Record<string, unknown>;
  event?: { id?: string | number; type?: string };
  timestamp?: string;
};

export function resolveEventType(
  payload: FirstPromoterWebhookPayload,
  headers: Headers
): string {
  return (
    headers.get("x-event-type") ||
    payload.event_type ||
    payload.event?.type ||
    ""
  ).trim();
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
}

/** Confirm a referral exists via Leads show (safe acknowledge; no double-track). */
export async function confirmReferralLead(
  data: Record<string, unknown> | undefined,
  entityId?: number | string
): Promise<{ ok: boolean; status: number }> {
  const apiKey = getFirstPromoterApiKey();
  if (!apiKey) return { ok: false, status: 0 };

  const nestedLead =
    data && typeof data.lead === "object" && data.lead
      ? (data.lead as Record<string, unknown>)
      : undefined;

  const id = pickString(entityId, data?.id, nestedLead?.id);
  const email = pickString(data?.email, nestedLead?.email);
  const uid = pickString(data?.uid, nestedLead?.uid);

  const params = new URLSearchParams();
  if (id) params.set("id", id);
  else if (email) params.set("email", email);
  else if (uid) params.set("uid", uid);
  else return { ok: false, status: 0 };

  const res = await fetch(`${FPR_API_BASE}/leads/show?${params.toString()}`, {
    method: "GET",
    headers: {
      "X-API-KEY": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return { ok: res.ok, status: res.status };
}
