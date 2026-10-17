import Script from "next/script";
import { appConfig } from "@/lib/config";

/**
 * FirstPromoter tracking — loads in document head (beforeInteractive).
 * `?fpr=` cookie (proxy) still feeds Stripe `client_reference_id`.
 */
export function FirstPromoterScript() {
  const cid = appConfig.firstPromoterAccountId;
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
