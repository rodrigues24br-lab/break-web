"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import {
  getCurrentMockOrNull,
  subscribeToAuth,
  type MockUser,
} from "@/lib/firebase/client";
import type { User } from "firebase/auth";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function CheckoutPanel() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [user, setUser] = useState<User | MockUser | null>(null);
  const [ready, setReady] = useState(() => appConfig.mockMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appConfig.mockMode) {
      setUser(getCurrentMockOrNull());
      setReady(true);
      return;
    }
    const unsub = subscribeToAuth((u) => {
      setUser(u);
      setReady(true);
    });
    return unsub;
  }, []);

  async function startCheckout() {
    if (!user?.email || !user.uid) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const fpr = getCookie("fpr");
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(fpr ? { "x-fpr-ref": fpr } : {}),
        },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid,
          locale,
          idToken,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  const features = (t.raw("features") as string[]) || [];

  if (!ready) {
    return (
      <div className="mx-auto h-40 w-full max-w-md animate-pulse rounded-3xl bg-white/5" />
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 text-center">
        <p className="text-muted-foreground">{t("needAuth")}</p>
        <Link
          href={`/${locale}/login`}
          className="inline-flex h-16 w-full items-center justify-center rounded-2xl bg-primary px-10 text-lg font-semibold tracking-wide text-primary-foreground shadow-[0_0_40px_-12px_var(--glow)] transition-all hover:brightness-110"
        >
          {t("needAuth")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8">
      <div className="space-y-1 text-center">
        <p className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-primary sm:text-6xl">
          {t("price")}
          <span className="ml-2 text-lg font-medium text-muted-foreground">
            {t("period")}
          </span>
        </p>
      </div>

      <ul className="space-y-3 text-left text-base text-foreground/85">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {appConfig.mockMode ? (
        <p className="text-center text-xs text-muted-foreground">{t("mockNote")}</p>
      ) : null}

      {error ? (
        <p className="text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        size="xl"
        className="w-full animate-soft-pulse"
        disabled={loading}
        onClick={startCheckout}
      >
        {loading ? t("loading") : t("cta")}
      </Button>
    </div>
  );
}
