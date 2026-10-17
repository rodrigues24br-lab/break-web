# Break Web

Web slice for **Break** (iOS App Store): create account, log in, annual Pro checkout ($49.99 USD), and post-payment confirmation with an App Store download CTA.

Spanish (`/es`) and Portuguese (`/pt`) UI. No marketing site beyond the confirmation download button.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Firebase Auth (email/password) + Firestore (Pro status)
- Stripe Checkout + webhook
- FirstPromoter affiliate tracking
- next-intl (ES / PT)

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev -- -p 4317 -H 0.0.0.0
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

With `NEXT_PUBLIC_MOCK_MODE=true` (default in `.env.local`), the app runs without real Firebase/Stripe: auth is stored in `localStorage`, and checkout grants Pro in an in-memory store then redirects to success.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Redirects to `/es` |
| `/es`, `/pt` | Entry — create account / login CTAs |
| `/[locale]/signup` | Create account (Firebase Auth) |
| `/[locale]/login` | Login |
| `/[locale]/checkout` | Annual Pro Checkout ($49.99) |
| `/[locale]/success` | Confirmation + App Store CTA |
| `POST /api/checkout` | Creates Stripe Checkout session (`client_reference_id` from FirstPromoter) |
| `POST /api/webhook` | Stripe webhook → writes Pro to Firestore |
| `GET /api/mock-pro` | Debug: list mock Pro grants (local only) |

## Firestore Pro schema (iOS-compatible)

On successful payment the webhook writes:

**Collection:** `users`  
**Document ID:** Firebase Auth `uid`

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

Native iOS should continue reading **`isPro`** (and optionally `plan` / `subscriptionStatus`) on login. Do not rename these fields without coordinating with the iOS app.

## Environment variables

See `.env.example`.

| Variable | Required for | Notes |
|----------|--------------|-------|
| `NEXT_PUBLIC_FIREBASE_*` | Real auth | Client Firebase config |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Webhook Pro writes | Admin SDK |
| `STRIPE_SECRET_KEY` | Real checkout | |
| `STRIPE_WEBHOOK_SECRET` | Verified webhooks | |
| `STRIPE_PRICE_ID` | Optional | If empty, uses inline `$49.99/year` price_data |
| `NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID` | Affiliate script | |
| `NEXT_PUBLIC_APP_STORE_URL` | Success CTA | |
| `NEXT_PUBLIC_SITE_URL` | Checkout return URLs | |
| `NEXT_PUBLIC_MOCK_MODE` | Local demo | `true` skips real Firebase/Stripe |

## FirstPromoter

1. Script loads when `NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID` is set.
2. Visiting `?fpr=AFFILIATE_ID` sets a `fpr` cookie (90 days) via middleware.
3. Checkout passes that value as Stripe `client_reference_id`.

## Stripe webhook

Point Stripe to `POST /api/webhook`. On `checkout.session.completed`, Pro is granted for `metadata.uid` / `metadata.email` (set when creating the session).

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # production server
npm run lint     # eslint
```
