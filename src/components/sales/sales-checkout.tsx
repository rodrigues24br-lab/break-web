"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appConfig } from "@/lib/config";
import {
  loginWithEmail,
  registerWithEmail,
  subscribeToAuth,
  type MockUser,
} from "@/lib/firebase/client";
import type { User } from "firebase/auth";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

type Props = {
  initiallyPaid?: boolean;
};

export function SalesCheckout({ initiallyPaid = false }: Props) {
  const t = useTranslations("sales.pay");
  const locale = useLocale();
  const [user, setUser] = useState<User | MockUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paid, setPaid] = useState(initiallyPaid);
  const [stripePromise, setStripePromise] =
    useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key) setStripePromise(loadStripe(key));
  }, []);

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      if (appConfig.mockMode) {
        await registerWithEmail(
          email || `google_${Date.now()}@break.app`,
          "google-mock-password"
        );
        return;
      }
      const { GoogleAuthProvider, signInWithPopup } = await import(
        "firebase/auth"
      );
      const { getClientAuth } = await import("@/lib/firebase/client");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(getClientAuth(), provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }

  const startEmbedded = useCallback(async () => {
    if (!user?.email || !user.uid) {
      setError(t("needAccount"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fpr = getCookie("fpr");
      const res = await fetch("/api/checkout/embedded", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(fpr ? { "x-fpr-ref": fpr } : {}),
        },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid,
          locale,
        }),
      });
      const data = (await res.json()) as {
        mock?: boolean;
        clientSecret?: string | null;
        returnUrl?: string;
        url?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || t("error"));

      if (data.mock) {
        setPaid(true);
        if (data.returnUrl) {
          window.history.replaceState(null, "", data.returnUrl);
        }
        return;
      }
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(t("error"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setLoading(false);
    }
  }, [user, locale, t]);

  const options = useMemo(
    () => (clientSecret ? { clientSecret } : undefined),
    [clientSecret]
  );

  if (paid) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 text-center">
        <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
          {t("paidTitle")}
        </h3>
        <p className="text-muted-foreground">{t("paidSubtitle")}</p>
        <a
          href={appConfig.appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-16 items-center justify-center rounded-2xl bg-primary px-10 text-lg font-semibold text-primary-foreground shadow-[0_0_40px_-12px_var(--glow)] animate-soft-pulse"
        >
          {t("download")}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      {!user ? (
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              className={
                mode === "signup"
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              }
              onClick={() => setMode("signup")}
            >
              {t("create")}
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              className={
                mode === "login"
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              }
              onClick={() => setMode("login")}
            >
              {t("login")}
            </button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sales-email">{t("email")}</Label>
            <Input
              id="sales-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sales-password">{t("password")}</Label>
            <Input
              id="sales-password"
              name="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="xl" className="w-full" disabled={loading}>
            {loading
              ? t("loading")
              : mode === "signup"
                ? t("create")
                : t("login")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={loading}
            onClick={handleGoogle}
          >
            {t("google")}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {user.email}
          </p>
          <h3 className="text-xl font-semibold tracking-tight">
            {t("payTitle")}
          </h3>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {!clientSecret ? (
            <Button
              type="button"
              size="xl"
              className="w-full animate-soft-pulse"
              disabled={loading}
              onClick={startEmbedded}
            >
              {loading
                ? t("loading")
                : appConfig.mockMode
                  ? t("mockPay")
                  : t("payCta")}
            </Button>
          ) : stripePromise && options ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-2">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to show Stripe Embedded
              Checkout.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
