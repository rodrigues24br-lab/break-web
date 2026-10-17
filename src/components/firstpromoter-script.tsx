"use client";

import Script from "next/script";
import { appConfig } from "@/lib/config";

/**
 * FirstPromoter tracking snippet.
 * Also relies on middleware setting the `fpr` cookie from `?fpr=`.
 * That cookie value is passed to Stripe as `client_reference_id`.
 */
export function FirstPromoterScript() {
  const accountId = appConfig.firstPromoterAccountId;
  if (!accountId) return null;

  return (
    <>
      <Script id="firstpromoter-init" strategy="afterInteractive">
        {`(function(w){w.fpr=w.fpr||function(){w.fpr.q=w.fpr.q||[];w.fpr.q[arguments[0]=='set'? 'unshift':'push'](arguments);};})(window);fpr("init", {cid:"${accountId}"});fpr("click");`}
      </Script>
      <Script
        src="https://cdn.firstpromoter.com/fpr.js"
        strategy="afterInteractive"
      />
    </>
  );
}
