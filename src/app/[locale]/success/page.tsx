import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";
import { appConfig } from "@/lib/config";

type Props = { params: Promise<{ locale: string }> };

export default async function SuccessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("success");

  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-10 py-6 text-center">
      <div className="space-y-4">
        <BrandMark size="hero" />
        <h1 className="animate-rise-delay text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="animate-rise-delay text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>
      <div className="animate-rise-delay flex flex-col gap-3">
        <a
          href={appConfig.appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-16 items-center justify-center rounded-2xl bg-primary px-10 text-lg font-semibold tracking-wide text-primary-foreground shadow-[0_0_40px_-12px_var(--glow)] transition-all hover:brightness-110 animate-soft-pulse"
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
