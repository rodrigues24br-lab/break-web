import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const brand = await getTranslations("brand");

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-10 py-8 text-center">
      <div className="space-y-4">
        <BrandMark size="hero" />
        <p className="animate-rise-delay text-lg text-muted-foreground sm:text-xl">
          {brand("tagline")}
        </p>
      </div>
      <h1 className="animate-rise-delay sr-only">{t("headline")}</h1>
      <p className="animate-rise-delay text-xl text-foreground/90 sm:text-2xl">
        {t("headline")}
      </p>
      <div className="animate-rise-delay flex flex-col gap-3 sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href={`/${locale}/signup`}
          className="inline-flex h-16 items-center justify-center rounded-2xl bg-primary px-10 text-lg font-semibold tracking-wide text-primary-foreground shadow-[0_0_40px_-12px_var(--glow)] transition-all hover:brightness-110 animate-soft-pulse"
        >
          {t("cta")}
        </Link>
        <Link
          href={`/${locale}/login`}
          className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-8 text-base font-semibold text-foreground backdrop-blur-sm transition hover:bg-white/10"
        >
          {t("hasAccount")}
        </Link>
      </div>
    </section>
  );
}
