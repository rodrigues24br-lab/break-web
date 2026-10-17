"use client";

type FprFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    fpr?: FprFn & { q?: unknown[] };
  }
}

/** Call FirstPromoter referral after a successful new-account signup. */
export function trackFirstPromoterReferral(user: {
  email?: string | null;
  uid: string;
}) {
  if (typeof window === "undefined") return;

  const payload = user.email?.trim()
    ? { email: user.email.trim().toLowerCase() }
    : { uid: user.uid };

  const run = () => {
    if (typeof window.fpr === "function") {
      window.fpr("referral", payload);
      return true;
    }
    return false;
  };

  if (run()) return;

  // Script may still be loading — retry briefly (queue exists once init snippet ran)
  let tries = 0;
  const id = window.setInterval(() => {
    tries += 1;
    if (run() || tries >= 40) window.clearInterval(id);
  }, 100);
}
