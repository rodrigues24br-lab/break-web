import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { AffiliateContent, AffiliateFooter, AffiliateHeader } from "@/components/affiliate-program"
import { AFFILIATE_COPY } from "@/lib/affiliate-copy"
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n"

type PageProps = {
  params: Promise<{ locale: string }>
}

function resolveLocale(value: string): Locale {
  return (LOCALES as readonly string[]).includes(value) ? (value as Locale) : DEFAULT_LOCALE
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const { meta } = AFFILIATE_COPY[resolveLocale(locale)]
  return { title: meta.title, description: meta.description }
}

export default async function AffiliateProgramPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const resolved = resolveLocale(locale)

  return (
    <>
      <AffiliateHeader />
      <main lang={resolved === "pt" ? "pt-BR" : resolved} className="min-h-screen bg-background">
        <AffiliateContent />
      </main>
      <AffiliateFooter />
    </>
  )
}
