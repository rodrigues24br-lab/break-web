import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import {
  AffiliateCommission,
  AffiliateFinalCta,
  AffiliateFooter,
  AffiliateHeader,
  AffiliateHero,
  AffiliateHowItWorks,
  AffiliateProduct,
} from "@/components/affiliate-program"
import { AFFILIATE_COPY, toAffiliateLocale } from "@/lib/affiliate-copy"
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n"

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const copy = AFFILIATE_COPY[toAffiliateLocale(isLocale(locale) ? locale : DEFAULT_LOCALE)]
  return { title: copy.metaTitle, description: copy.metaDescription }
}

export default async function AffiliateProgramPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <AffiliateHeader />
      <main className="min-h-screen bg-background">
        <AffiliateHero />
        <AffiliateCommission />
        <AffiliateProduct />
        <AffiliateHowItWorks />
        <AffiliateFinalCta />
      </main>
      <AffiliateFooter />
    </>
  )
}
