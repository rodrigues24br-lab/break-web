"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
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

type InitialUser = { uid: string; email: string } | null;

export function CheckoutPanel({
  initialUser = null,
}: {
  initialUser?: InitialUser;
}) {
  const { t, locale } = useLocale();
  const c = t.checkoutPage;
  const [user, setUser] = useState<User | MockUser | null>(() => {
    if (initialUser) {
      return {
        uid: initialUser.uid,
        email: initialUser.email,
        getIdToken: async () => `mock-token:${initialUser.uid}`,
      };
    }
    return appConfig.mockMode ? getCurrentMockOrNull() : null;
  });
  const [ready, setReady] = useState(Boolean(initialUser) || appConfig.mockMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appConfig.mockMode) {
      const current = getCurrentMockOrNull();
      if (current) setUser(current);
      setReady(true);
      return;
    }
    setReady(false);
    const unsub = subscribeToAuth((u) => {
      setUser(u);
      setReady(true);
    });
    return unsub;
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.email || !user.uid || submitting) return;
    setSubmitting(true);
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
        throw new Error(data.error || c.paymentFailed);
      }
      if (window.self !== window.top) {
        window.open(data.url, "_blank", "noopener,noreferrer");
        setSubmitting(false);
      } else {
        window.location.assign(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : c.paymentFailed);
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div
        className="mt-10 h-96 w-full rounded-3xl bg-white/60 animate-pulse"
        aria-busy="true"
      />
    );
  }

  if (!user) {
    return (
      <div className="mx-auto mt-10 flex w-full flex-col gap-4 text-center">
        <p className="text-muted-foreground">{c.subtitle}</p>
        <Link
          href={`/${locale}/signup`}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground"
        >
          {t.auth.signup.submit}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full mt-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-border bg-white/85 backdrop-blur-sm p-6 shadow-[0_18px_40px_-24px_rgba(28,36,48,0.35)]"
      >
        <div className="text-center">
          <h1 className="text-[28px] leading-tight font-bold tracking-tight text-heading sm:text-[32px]">
            {c.title}
          </h1>
          {user.email ? (
            <p className="mt-4 text-[15px] text-heading/70">
              {c.email}
              <span className="mt-1 block text-[17px] font-semibold text-heading break-all">
                {user.email}
              </span>
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="mt-7 h-12 w-full rounded-2xl bg-[#2563EB] text-[16px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.8)] transition-colors hover:bg-[#1d4fd8] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? c.processing : c.pay}
        </button>

        {error && (
          <p
            role="alert"
            className="mt-2.5 text-center text-[13px] leading-snug text-red-600"
          >
            {error}
          </p>
        )}

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-heading/60">
          <Lock className="size-3" aria-hidden="true" />
          {c.secure}
        </p>
      </form>
    </div>
  );
}

export default CheckoutPanel;
