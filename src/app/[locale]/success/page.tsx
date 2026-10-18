import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AppStoreBadge } from "@/components/app-store-badge";
import { ProSeal } from "@/components/pro-seal";
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

const successFont =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif';

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
  const { locale } = await params;
  const q = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("success");
  const email = await resolveEmail(q.email, q.session_id);

  return (
    <section
      className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-10 py-12 sm:py-16"
      style={{
        fontFamily: successFont,
        backgroundColor: "#F4F1EA",
      }}
    >
      <div className="space-y-6 text-center">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <p
            className="text-[2.75rem] font-semibold tracking-tight text-[#1B3A4B] sm:text-6xl md:text-7xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            Break
          </p>
          <ProSeal label={t("proSeal")} className="mt-1 sm:mt-2" />
        </div>

        <div className="space-y-3">
          <h1
            className="text-[1.85rem] font-semibold tracking-tight text-[#1B3A4B] sm:text-4xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            {t("title")}
          </h1>
          <p className="text-base text-[#5E7385] sm:text-lg">{t("subtitle")}</p>
        </div>

        {email ? (
          <p className="text-sm text-[#5E7385]">
            <span className="text-[#8A9AAB]">{t("emailLabel")}: </span>
            <span className="break-all font-medium text-[#1B3A4B]">{email}</span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-center sm:gap-5">
        <AppStoreBadge href={appConfig.appStoreUrl} label={t("download")} />
        <p className="max-w-[16rem] text-center text-sm leading-relaxed text-[#5E7385] sm:max-w-[14rem] sm:text-left">
          {t("downloadHint")}
        </p>
      </div>

      <div className="text-center">
        <Link
          href={`/${locale}`}
          className="text-sm text-[#8A9AAB] transition hover:text-[#5E7385]"
        >
          {t("back")}
        </Link>
      </div>
    </section>
  );
}
