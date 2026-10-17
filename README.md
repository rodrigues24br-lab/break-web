# Break Web

Sales landing + account + Pro plans for **Break** (iOS). Create an account (email, Google, or Apple), choose **Monthly ($5.99)** or **Annual ($49.99)**, pay with Stripe, then download on the App Store.

Locales: English (`/en`), Spanish (`/es`), Portuguese (`/pt`).

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Firebase Auth (email/password, Google, Apple) + Analytics + Firestore Pro status
- Stripe Checkout (embedded) + webhook
- FirstPromoter affiliate tracking
- next-intl (EN / ES / PT)

## Pricing

| Plan | Price | Notes |
|------|-------|--------|
| Monthly | **$5.99 / month** | Flexible; cancel anytime |
| Annual | **$49.99 / year** | Best value (~$4.17/mo vs monthly) |

Stripe Price IDs (optional — otherwise Checkout uses `price_data`):

- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_ANNUAL` (or legacy `STRIPE_PRICE_ID`)

## Run locally

```bash
npm install
cp .env.example .env.local
# Fill NEXT_PUBLIC_FIREBASE_* (see .env.example). Leave NEXT_PUBLIC_MOCK_MODE unset/false for real Auth.
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) (dev binds `0.0.0.0:3000`).

**Mock mode** (`NEXT_PUBLIC_MOCK_MODE=true` or missing Firebase client config): auth is simulated in `localStorage` / cookie; checkout grants Pro in-memory without Stripe.

**Real mode** (Firebase client vars set and mock not forced): Firebase Auth initializes; Analytics loads in the browser when `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is set. Stripe still needs its own keys for live payment (otherwise checkout stays simulated).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Redirects to locale (default `en`) |
| `/[locale]` | Sales landing + account section (`#account`) |
| `/[locale]/signup`, `/login` | Standalone auth (then → plans) |
| `/[locale]/plans` | **Auth required** — Monthly / Annual Pro checkout |
| `/[locale]/checkout` | Redirects to `/plans` |
| `/[locale]/success` | Confirmation + App Store CTA |
| `POST /api/checkout/embedded` | Embedded Stripe session (`plan`: `month` \| `year`) |
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
| `NEXT_PUBLIC_MOCK_MODE` | `true` forces mock; omit/`false` when Firebase is configured |
| `STRIPE_*` / `STRIPE_PRICE_ID_*` | Live checkout |
| `FIREBASE_*` (Admin) | Webhook Pro writes |
| `NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID` | Affiliates |
| `NEXT_PUBLIC_APP_STORE_URL` | Success CTA |
| `NEXT_PUBLIC_SITE_URL` | Return URLs |

## FirstPromoter

1. Script loads when `NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID` is set.
2. `?fpr=AFFILIATE_ID` sets a `fpr` cookie (90 days).
3. Checkout passes that as Stripe `client_reference_id`.

## Scripts

```bash
npm run dev      # 0.0.0.0:3000
npm run build
npm run start    # 0.0.0.0:4317
npm run lint
```
