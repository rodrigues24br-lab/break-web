import Script from "next/script";
import { appConfig } from "@/lib/config";

/**
 * FirstPromoter tracking — loads in document head (beforeInteractive).
 * CID from FIRSTPROMOTER_ACCOUNT_ID (Vercel) or NEXT_PUBLIC_* / default.
 * `?fpr=` cookie (proxy) is stored in Checkout metadata.fpr — not client_reference_id.
 */
export function FirstPromoterScript() {
  // Prefer exact Vercel name at render time (server component)
  const cid =
    process.env.FIRSTPROMOTER_ACCOUNT_ID ||
    appConfig.firstPromoterAccountId;
  if (!cid) return null;

  const init = `(function(w){w.fpr=w.fpr||function(){w.fpr.q = w.fpr.q||[];w.fpr.q[arguments[0]=='set'?'unshift':'push'](arguments);};})(window);
fpr("init", {cid:"${cid}"});
fpr("click");`;

  return (
    <>
      <Script id="firstpromoter-init" strategy="beforeInteractive">
        {init}
      </Script>
      <Script
        src="https://cdn.firstpromoter.com/fpr.js"
        strategy="beforeInteractive"
      />
    </>
  );
}
