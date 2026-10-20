#!/usr/bin/env node
/**
 * One-off: list recent checkout.session.completed events and/or grant Pro
 * for a known session / subscription.
 *
 * Requires env:
 *   STRIPE_SECRET_KEY
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *
 * Usage:
 *   node scripts/replay-pro-grant.mjs                  # list recent events
 *   node scripts/replay-pro-grant.mjs --grant <cs_…>   # grant from session id
 *   node scripts/replay-pro-grant.mjs --resend <evt_…> # stripe events resend
 */
import Stripe from "stripe";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

async function getAdminDb() {
  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: requireEnv("FIREBASE_PROJECT_ID"),
        clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
        privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
      }),
    });
  }
  return admin.firestore();
}

async function grantFromSession(stripe, sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const uid = session.metadata?.uid?.trim();
  const email = (
    session.metadata?.email ||
    session.customer_details?.email ||
    session.customer_email ||
    ""
  )
    .trim()
    .toLowerCase();

  if (!uid) {
    console.error("Session missing metadata.uid — refusing to use client_reference_id", {
      client_reference_id: session.client_reference_id,
      email,
    });
    process.exit(1);
  }

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : null;
  let currentPeriodEnd = null;
  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const end =
      sub.items?.data?.[0]?.current_period_end ||
      sub.current_period_end ||
      null;
    if (end) currentPeriodEnd = new Date(end * 1000).toISOString();
  }

  const db = await getAdminDb();
  const payload = {
    email,
    isPro: true,
    plan: "pro",
    subscriptionStatus: "active",
    status: "active",
    stripeCustomerId:
      typeof session.customer === "string" ? session.customer : null,
    stripeSubscriptionId: subscriptionId,
    subscriptionId,
    stripeCheckoutSessionId: session.id,
    currentPeriodEnd,
    proUpdatedAt: new Date().toISOString(),
  };

  await db.collection("users").doc(uid).set(payload, { merge: true });
  console.log("Pro granted", { uid, ...payload });
}

async function listRecent(stripe) {
  const events = await stripe.events.list({
    type: "checkout.session.completed",
    limit: 10,
  });
  for (const ev of events.data) {
    const s = ev.data.object;
    console.log({
      eventId: ev.id,
      created: new Date(ev.created * 1000).toISOString(),
      sessionId: s.id,
      uid: s.metadata?.uid || null,
      email: s.customer_details?.email || s.customer_email || s.metadata?.email,
      client_reference_id: s.client_reference_id,
      subscription: s.subscription,
    });
  }
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error(
      "STRIPE_SECRET_KEY missing. Set it (and Firebase Admin vars) then re-run.\n" +
        "On Vercel: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
    process.exit(1);
  }
  const stripe = new Stripe(key);
  const args = process.argv.slice(2);

  if (args[0] === "--grant" && args[1]) {
    await grantFromSession(stripe, args[1]);
    return;
  }
  if (args[0] === "--resend" && args[1]) {
    const ev = await stripe.events.retrieve(args[1]);
    // Stripe Node: events.resend if available
    if (typeof stripe.events.resend === "function") {
      const resent = await stripe.events.resend(args[1]);
      console.log("Resent", resent.id, resent.type);
    } else {
      console.log(
        "Use CLI: stripe events resend",
        args[1],
        "(API resend not in this SDK). Event:",
        ev.id,
        ev.type
      );
    }
    return;
  }

  await listRecent(stripe);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
