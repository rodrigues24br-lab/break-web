import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function SupportPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.support");
  return (
    <article className="mx-auto max-w-2xl space-y-4 py-12">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
        {t("title")}
      </h1>
      <p className="text-muted-foreground leading-relaxed">{t("body")}</p>
    </article>
  );
}
