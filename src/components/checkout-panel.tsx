"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
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
      <div className="text-center">
        <h1 className="text-[32px] leading-tight font-bold tracking-tight text-heading">
          {c.title}
        </h1>
        <p className="mt-1 text-[16px] text-heading/70">{c.subtitle}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-3xl border border-border bg-white p-5 shadow-[0_18px_40px_-24px_rgba(28,36,48,0.35)]"
      >
        <section
          aria-label={c.plan}
          className="rounded-2xl bg-[#F4F1EA]/70 p-4"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[16px] font-semibold text-heading">{c.plan}</p>
            <p className="text-[16px] font-bold text-heading tabular-nums">
              {c.price}
            </p>
          </div>
          <ul className="mt-2.5 flex flex-col gap-1">
            {c.includes.map((line) => (
              <li
                key={line}
                className="flex items-start gap-1.5 text-[13px] leading-snug text-heading/75"
              >
                <Check
                  className="mt-0.5 size-3.5 shrink-0 text-[#2563EB]"
                  aria-hidden="true"
                />
                {line}
              </li>
            ))}
          </ul>
        </section>

        {user.email && (
          <p className="mt-4 text-center text-[13px] text-heading/70">
            {c.email}:{" "}
            <span className="font-medium text-heading">{user.email}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="mt-5 h-12 w-full rounded-2xl bg-[#2563EB] text-[16px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.8)] transition-colors hover:bg-[#1d4fd8] disabled:opacity-50 disabled:cursor-not-allowed"
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
