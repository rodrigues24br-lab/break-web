import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LanguageSwitcher from "@/components/language-switcher";
import BreakIcon from "@/components/break-icon";

type Props = { params: Promise<{ locale: string }> };

const SECTION_KEYS = [
  "collection",
  "payments",
  "affiliates",
  "retention",
  "security",
  "rights",
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  return { title: `${t("title")} — Vemluz`, description: t("intro") };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.privacy");

  return (
    <main className="flex min-h-svh flex-1 flex-col items-center bg-background px-6 pb-16 pt-6 sm:pb-24">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <BreakIcon size={36} alt="Vemluz" />
        <LanguageSwitcher />
      </div>
      <article className="mt-10 flex w-full max-w-2xl flex-col gap-10 sm:mt-16">
        <header className="flex flex-col gap-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("updated")}</p>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            {t("intro")}
          </p>
        </header>

        {SECTION_KEYS.map((key) => (
          <section
            key={key}
            aria-labelledby={`privacy-${key}`}
            className="flex flex-col gap-2 border-t border-border pt-6"
          >
            <h2
              id={`privacy-${key}`}
              className="text-lg font-semibold tracking-tight"
            >
              {t(`sections.${key}.title`)}
            </h2>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              {t(`sections.${key}.body`)}
            </p>
          </section>
        ))}
      </article>
    </main>
  );
}
