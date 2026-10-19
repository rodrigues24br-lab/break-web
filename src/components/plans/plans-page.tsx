"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { DynamicPrice } from "@/components/dynamic-price";
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

export function PlansPage() {
  const t = useTranslations("plans");
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<User | MockUser | null>(() =>
    appConfig.mockMode ? getCurrentMockOrNull() : null
  );
  const [authReady, setAuthReady] = useState(appConfig.mockMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace(`/${locale}#account`);
    }
  }, [authReady, user, locale, router]);

  const startCheckout = useCallback(async () => {
    if (!user?.email || !user.uid) {
      router.replace(`/${locale}#account`);
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
          plan: "year",
        }),
      });
      const data = (await res.json()) as {
        mock?: boolean;
        url?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || t("error"));

      // Live product: never follow a mock checkout URL unless mock mode is on.
      if (data.mock && !appConfig.mockMode) {
        throw new Error(data.error || t("error"));
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(t("error"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
      setLoading(false);
    }
  }, [user, locale, router, t]);

  if (!authReady || !user) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">{t("checkingAuth")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-10 py-10">
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <BrandMark size="nav" />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-title sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <div className="relative rounded-2xl border-2 border-pro/40 bg-card p-6 shadow-sm sm:p-8">
        <span className="absolute -top-3 right-4 rounded-full bg-pro px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
          {t("annual.badge")}
        </span>
        <p className="text-sm font-medium text-pro">{t("annual.label")}</p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-title sm:text-5xl">
          <DynamicPrice fallback={t("annual.price")} />
          <span className="ml-2 text-lg font-medium text-muted-foreground">
            {t("annual.period")}
          </span>
        </p>
        <p className="mt-2 text-base text-muted-foreground">
          <DynamicPrice
            mode="monthly"
            fallback={t("annual.monthlyApprox", { price: "$4.17" })}
            monthlyTemplate={t("annual.monthlyApprox")}
          />
        </p>
        <p className="mt-3 text-sm text-muted-foreground">{t("annual.blurb")}</p>
      </div>

      <ul className="space-y-2 text-sm text-foreground sm:text-base">
        {(t.raw("includes") as string[]).map((item) => (
          <li key={item} className="flex items-center gap-3">
            <span className="flex size-6 items-center justify-center rounded-full bg-pro/15 text-xs font-bold text-pro">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>

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
        {loading
          ? t("loading")
          : appConfig.mockMode
            ? t("mockPay")
            : t("cta")}
      </Button>
    </div>
  );
}
