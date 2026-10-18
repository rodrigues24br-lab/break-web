import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";
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
  const { locale } = await params;
  const q = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("success");
  const email = await resolveEmail(q.email, q.session_id);

  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-10 py-10 text-center">
      <div className="space-y-5">
        <div className="flex justify-center">
          <BrandMark size="hero" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pro">
          {t("approved")}
        </p>
        <h1 className="animate-rise-delay font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-title sm:text-4xl">
          {t("title")}
        </h1>
        <p className="animate-rise-delay text-base text-muted-foreground sm:text-lg">
          {t("subtitle")}
        </p>
        {email ? (
          <div className="animate-rise-delay mx-auto w-full max-w-md rounded-2xl border border-border/80 bg-card/70 px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("emailLabel")}
            </p>
            <p className="mt-1 break-all text-base font-semibold text-title sm:text-lg">
              {email}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t("emailHint")}</p>
          </div>
        ) : null}
      </div>

      <div className="animate-rise-delay flex flex-col gap-3">
        <a
          href={appConfig.appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-16 items-center justify-center rounded-2xl bg-primary px-8 text-lg font-semibold tracking-wide text-primary-foreground shadow-sm transition hover:brightness-110 animate-soft-pulse sm:h-[4.25rem] sm:text-xl"
        >
          {t("download")}
        </a>
        <Link
          href={`/${locale}`}
          className="inline-flex h-12 items-center justify-center text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          {t("back")}
        </Link>
      </div>
    </section>
  );
}
