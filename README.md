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

**Mock mode** (demo banner + simulated checkout): only when `NEXT_PUBLIC_MOCK_MODE=true`. Otherwise Auth is Firebase and Checkout requires `STRIPE_SECRET_KEY`.

### Product flow (live)

1. Signup/login (email, Apple, Google) → Firebase Auth `break-99b8e` → `/[locale]/plans`
2. Pay CTA → hosted Stripe Checkout (`STRIPE_SECRET_KEY` + annual price `price_1UQFdLBMIFugty3a7b54OLdG`) with FirstPromoter `client_reference_id`
3. Success → `https://breakapplimit.com/success?session_id={CHECKOUT_SESSION_ID}&email=…`
4. Success page → App Store download

### Vercel env checklist (exact names)

| Required for live | Variable |
|-------------------|----------|
| Auth | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| Auth | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `break-99b8e.firebaseapp.com` |
| Auth | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `break-99b8e` |
| Auth | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| Auth | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| Auth | `NEXT_PUBLIC_FIREBASE_APP_ID` |
| Optional Analytics | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` |
| Checkout | `STRIPE_SECRET_KEY` |
| Checkout price | `STRIPE_PRICE_ID_ANNUAL` (or default `price_1UQFdLBMIFugty3a7b54OLdG`) |
| Webhook Pro grant | `STRIPE_WEBHOOK_SECRET` + Firebase Admin (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) |
| Affiliates | `FIRSTPROMOTER_ACCOUNT_ID`, `FIRSTPROMOTER_API_KEY` |
| Optional | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (hosted Checkout does not need it) |
| Optional | `NEXT_PUBLIC_SITE_URL` = `https://breakapplimit.com` |
| Keep unset/false | `NEXT_PUBLIC_MOCK_MODE` |

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
| `POST /api/webhook` | Stripe → Firestore Pro (`checkout.session.completed`) |
| `POST /api/webhook/stripe` | Alias of `/api/webhook` |
| `POST /api/firstpromoter-webhook` | FirstPromoter `referral.created` / `referral.converted` |
| `GET /api/pricing` | Localized display price (geo + Frankfurter FX; USD fallback) |
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
  "status": "active",
  "stripeCustomerId": "cus_…",
  "stripeSubscriptionId": "sub_…",
  "subscriptionId": "sub_…",
  "stripeCheckoutSessionId": "cs_…",
  "currentPeriodEnd": "2027-10-17T12:00:00.000Z",
  "proUpdatedAt": "2026-10-17T12:00:00.000Z"
}
```

## Environment variables

See `.env.example` (names only). Never commit `.env.local`.

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_*` | Web client; defaults target `break-99b8e` |
| `NEXT_PUBLIC_MOCK_MODE` | `true` only for demo; keep unset in production |
| `STRIPE_SECRET_KEY` | **Required** live Checkout (Vercel name) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Firestore Pro (Vercel name) |
| `STRIPE_PRICE_ID` / `STRIPE_PRICE_ID_ANNUAL` | Default `price_1UQFdLBMIFugty3a7b54OLdG` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional (hosted Checkout) |
| `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | Admin Pro grants |
| `FIRSTPROMOTER_ACCOUNT_ID` | Affiliates cid (Vercel name) |
| `FIRSTPROMOTER_API_KEY` | FirstPromoter API (Vercel name) |
| `NEXT_PUBLIC_FIRSTPROMOTER_ACCOUNT_ID` | Local cid fallback |
| `NEXT_PUBLIC_APP_STORE_URL` | Success CTA |
| `NEXT_PUBLIC_SITE_URL` | Prefer `https://breakapplimit.com` on Vercel |

## FirstPromoter

1. Script loads with cid from `FIRSTPROMOTER_ACCOUNT_ID` (or NEXT_PUBLIC fallback / default).
2. `?fpr=AFFILIATE_ID` sets a `fpr` cookie (90 days).
3. Checkout sets Stripe `client_reference_id` to the Firebase **uid**; FPR tid goes in `metadata.fpr` / `metadata.affiliateRef` only (never as uid).
4. Stripe webhook resolves the user from `metadata.uid`, then session email — never from FPR `client_reference_id`.
5. FirstPromoter webhook: `POST /api/firstpromoter-webhook` — set subscription custom header `X-API-KEY` to `FIRSTPROMOTER_API_KEY`. Handles `referral.created` / `referral.converted` by confirming the lead via `GET /api/v1/leads/show`.

## Scripts

```bash
npm run dev      # 0.0.0.0:3000
npm run build
npm run start    # 0.0.0.0:4317
npm run lint
```
