# Break Web

Sales landing + account + Pro checkout for **Break** (iOS). Create an account (email, Google, or Apple), pay **Annual Pro ($49.99)**, then download on the App Store.

Locales: English (`/en`), Spanish (`/es`), Portuguese (`/pt`).

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Firebase Auth (email/password, Google, Apple) + Analytics + Firestore Pro status
- Stripe Checkout (hosted) + webhook
- FirstPromoter affiliate tracking
- next-intl (EN / ES / PT)

## Pricing

| Plan | Price |
|------|-------|
| Annual | **$49.99 / year** |

Stripe Price ID: `STRIPE_PRICE_ID_ANNUAL` (or legacy `STRIPE_PRICE_ID`), default `price_1UQFdLBMIFugty3a7b54OLdG`.

## Run locally

```bash
npm install
cp .env.example .env.local
# Fill NEXT_PUBLIC_FIREBASE_* (see .env.example). Leave NEXT_PUBLIC_MOCK_MODE unset/false for real Auth.
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) (dev binds `0.0.0.0:3000`).

**Mock mode** (demo banner): only when `NEXT_PUBLIC_MOCK_MODE=true`. Missing Firebase public keys alone do **not** force the demo banner.

**Live checkout**: server uses `STRIPE_SECRET_KEY` (real Stripe) when set; otherwise checkout is simulated. Webhooks need `STRIPE_WEBHOOK_SECRET`.

**Vercel env names** (exact): `FIRSTPROMOTER_ACCOUNT_ID`, `FIRSTPROMOTER_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Redirects to locale (default `en`) |
| `/[locale]` | Sales landing + account section (`#account`) |
| `/[locale]/signup`, `/login` | Standalone auth (then → plans) |
| `/[locale]/plans` | **Auth required** — Annual Pro checkout ($49.99) |
| `/[locale]/checkout` | Redirects to `/plans` |
| `/success` → `/[locale]/success` | Payment approved + email + App Store CTA |
| `POST /api/checkout/embedded` | Hosted Stripe Checkout session (annual); returns `url` |
| `POST /api/checkout` | Redirect Checkout session |
| `POST /api/webhook` | Stripe → Firestore Pro |
| `POST /api/auth/session` | Mock/demo form POST auth |

Unauthenticated visits to `/plans` redirect to `/[locale]#account`.

## Firestore Pro schema (iOS-compatible)

On successful payment the webhook writes:

**Collection:** `users` · **Document ID:** Firebase Auth `uid`

```json
{
  "email": "user@example.com",
  "isPro": true,
  "plan": "pro",
  "subscriptionStatus": "active",
  "stripeCustomerId": "cus_…",
  "stripeSubscriptionId": "sub_…",
  "stripeCheckoutSessionId": "cs_…",
  "proUpdatedAt": "2026-10-17T12:00:00.000Z"
}
```

## Environment variables

See `.env.example` (names only). Never commit `.env.local`.

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Optional Analytics |
| `NEXT_PUBLIC_MOCK_MODE` | `true` forces demo banner / mock auth UI |
| `STRIPE_SECRET_KEY` | Live checkout (Vercel name) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks (Vercel name) |
| `STRIPE_PRICE_ID` / `STRIPE_PRICE_ID_ANNUAL` | Annual Price ID (default `price_1UQFdLBMIFugty3a7b54OLdG`) |
| `FIREBASE_*` (Admin) | Webhook Pro writes |
| `FIRSTPROMOTER_ACCOUNT_ID` | Affiliates cid (Vercel name) |
| `FIRSTPROMOTER_API_KEY` | FirstPromoter API (Vercel name) |
| `NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID` | Local cid fallback |
| `NEXT_PUBLIC_APP_STORE_URL` | Success CTA |
| `NEXT_PUBLIC_SITE_URL` | Return URLs |

## FirstPromoter

1. Script loads with cid from `FIRSTPROMOTER_ACCOUNT_ID` (or NEXT_PUBLIC fallback / default).
2. `?fpr=AFFILIATE_ID` sets a `fpr` cookie (90 days).
3. Checkout passes that as Stripe `client_reference_id`.

## Scripts

```bash
npm run dev      # 0.0.0.0:3000
npm run build
npm run start    # 0.0.0.0:4317
npm run lint
```
