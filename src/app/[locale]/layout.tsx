import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/components/locale-provider";
import { SiteShell } from "@/components/site-shell";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/i18n";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const uiLocale = locale as Locale;

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleProvider initialLocale={uiLocale}>
        <SiteShell locale={locale}>{children}</SiteShell>
      </LocaleProvider>
    </NextIntlClientProvider>
  );
}
