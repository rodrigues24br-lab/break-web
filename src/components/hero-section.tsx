"use client"

import { Check, CircleCheck, Lock, Smartphone } from "lucide-react"
import CheckoutButton from "@/components/checkout-button"
import { useLocale } from "@/components/locale-provider"
import { AppTile, BRAND_APPS, FocusScreen, PhoneFrame } from "@/components/phone-mockup"

const blockedApps = BRAND_APPS.slice(0, 3)

export default function HeroSection({ checkoutSuccess }: { checkoutSuccess?: boolean }) {
  const { t } = useLocale()

  return (
    <section className="pt-6 pb-10 md:pt-16 md:pb-28">
      <div className="max-w-6xl mx-auto px-5">
        {checkoutSuccess && (
          <div
            role="status"
            className="mb-6 md:mb-10 flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 text-[14px]"
          >
            <CircleCheck className="w-5 h-5 text-success shrink-0" aria-hidden="true" />
            {t.hero.checkoutSuccess}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <span className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] font-medium text-accent-foreground bg-accent px-3 py-1 rounded-full">
              <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
              {t.hero.badge}
            </span>

            <h1 className="font-serif font-bold text-heading text-[36px] leading-[1.05] md:text-[64px] mt-4 md:mt-5 text-balance">
              {t.hero.title}
            </h1>
            <p className="text-[15px] md:text-[18px] text-muted-foreground mt-3 md:mt-5 max-w-md text-pretty">
              {t.hero.subtitle}
            </p>

            <div className="mt-5 md:mt-8" data-hide-mobile-cta>
              <CheckoutButton
                label={t.hero.cta}
                size="lg"
                className="px-5 py-2.5 text-[15px] md:px-7 md:py-4 md:text-base"
              />
            </div>

            <ul className="mt-3 md:mt-5 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5">
              {t.hero.trust.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1 text-[12px] md:text-[13px] font-medium text-foreground"
                >
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[12px] md:text-[13px] text-muted-foreground mt-2 md:mt-3">{t.hero.note}</p>

            <dl className="mt-5 md:mt-10 grid grid-cols-3 gap-2 md:gap-3 w-full max-w-md">
              {t.hero.stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-3 text-left">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-[18px] md:text-[20px] font-bold text-heading leading-none">{stat.value}</dd>
                  <dd className="text-[11px] md:text-[12px] text-muted-foreground mt-1.5 leading-snug">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative flex items-center justify-center gap-4" data-hide-mobile-cta>
            <div
              className="hidden sm:block absolute inset-x-6 top-10 bottom-10 rounded-[48px] bg-secondary/70"
              aria-hidden="true"
            />
            <PhoneFrame compact className="relative">
              <FocusScreen />
            </PhoneFrame>

            <div className="flex flex-col gap-2.5 sm:contents" aria-hidden="true">
              <ul className="flex flex-col gap-2.5 sm:gap-3 sm:absolute sm:left-0 lg:left-4 sm:top-24">
                {blockedApps.map((app) => (
                  <li
                    key={app.name}
                    className="flex items-center gap-2.5 bg-card border border-border rounded-2xl px-3 py-2 shadow-lg"
                  >
                    <AppTile app={app} size={30} blocked />
                    <div>
                      <p className="text-[13px] font-semibold leading-tight">{app.name}</p>
                      <p className="text-[11px] text-accent-foreground font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {t.phone.blocked}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bg-card border border-border rounded-2xl px-4 py-2.5 shadow-lg sm:absolute sm:right-0 lg:right-4 sm:bottom-28">
                <p className="text-[22px] font-bold text-success leading-none">+2h</p>
                <p className="text-[11px] text-muted-foreground mt-1">{t.phone.savedToday}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
