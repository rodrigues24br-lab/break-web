import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import BreakIcon from "@/components/break-icon";
import AppStoreBadge from "@/components/app-store-badge";
import DownloadScreens from "@/components/download-screens";
import { getDictionary, type Locale } from "@/lib/i18n";
import { appConfig } from "@/lib/config";
import { getStripe } from "@/lib/stripe";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    email?: string;
    session_id?: string;
    plan?: string;
    mock?: string;
  }>;
};

async function resolveEmail(
  queryEmail: string | undefined,
  sessionId: string | undefined
): Promise<string | null> {
  const fromQuery = queryEmail?.trim().toLowerCase();
  if (fromQuery && fromQuery.includes("@")) return fromQuery;

  if (!sessionId || sessionId.includes("{CHECKOUT_SESSION_ID}")) return null;

  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const email =
      session.customer_details?.email ||
      session.customer_email ||
      session.metadata?.email ||
      null;
    return email?.trim().toLowerCase() || null;
  } catch {
    return null;
  }
}

export default async function SuccessPage({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const q = await searchParams;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;
  const t = getDictionary(locale).downloadPage;
  const email = await resolveEmail(q.email, q.session_id);

  return (
    <div lang={locale} className="min-h-dvh bg-[#F4F1EA] text-[#1b3a4b]">
      <main className="w-full max-w-md mx-auto px-6 pt-16 pb-16 md:pt-24">
        <section className="flex flex-col items-center text-center">
          <BreakIcon
            size={48}
            alt="Vemluz"
            className="shadow-[0_10px_24px_-12px_rgba(27,58,75,0.45)]"
          />
          <h1 className="mt-6 text-[32px] leading-tight font-bold tracking-tight text-balance">
            {t.title}
          </h1>
          <p className="mt-2 text-base font-medium">{t.subtitle}</p>

          {email ? (
            <p className="mt-3 text-sm text-[#5E7385]">
              <span className="break-all font-medium text-[#1B3A4B]">{email}</span>
            </p>
          ) : null}

          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-balance shadow-[0_6px_24px_-12px_rgba(27,58,75,0.18)]">
            <span
              className="size-2 shrink-0 rounded-full bg-[#2563EB]"
              aria-hidden="true"
            />
            {t.socialProof}
          </p>

          <p className="mt-4 text-[15px] font-semibold leading-snug text-balance">
            {t.instruction}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <BreakIcon
              size={48}
              alt=""
              className="shrink-0 shadow-[0_8px_20px_-10px_rgba(27,58,75,0.45)]"
            />
            <div className="animate-badge-pulse">
              <AppStoreBadge href={appConfig.appStoreUrl} />
            </div>
          </div>
        </section>

        <section aria-labelledby="steps-title" className="mt-14">
          <h2 id="steps-title" className="sr-only">
            {t.stepsTitle}
          </h2>
          <ol className="flex flex-col gap-3">
            {t.steps.map((step, i) => (
              <li
                key={step}
                className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_6px_24px_-12px_rgba(27,58,75,0.18)]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[15px] font-bold text-white tabular-nums">
                  {i + 1}
                </span>
                <p className="text-[17px] font-semibold leading-snug">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <DownloadScreens locale={locale} />

        <p className="mt-8 text-center text-[20px] font-bold leading-snug text-balance">
          {t.closing}
        </p>

        <div className="mt-8 text-center">
          <Link
            href={`/${locale}`}
            className="text-sm text-[#8A9AAB] transition hover:text-[#5E7385]"
          >
            Vemluz
          </Link>
        </div>
      </main>
    </div>
  );
}
