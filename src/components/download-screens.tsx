"use client"

import { LocaleProvider } from "@/components/locale-provider"
import { MenuScreen, PauseScreen, PhoneFrame, ProtectedAppsScreen } from "@/components/phone-mockup"
import { getDictionary, type Locale } from "@/lib/i18n"

const SCREENS = [ProtectedAppsScreen, PauseScreen, MenuScreen]

export default function DownloadScreens({ locale }: { locale: Locale }) {
  const { screensLabel, screens } = getDictionary(locale).downloadPage
  return (
    <LocaleProvider initialLocale={locale}>
      <section aria-label={screensLabel} className="mt-12">
        <div className="-mx-6 px-6 scroll-px-6 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 md:justify-center md:overflow-visible">
          {SCREENS.map((Screen, i) => (
            <figure key={screens[i]} className="snap-start shrink-0 flex flex-col items-center gap-2">
              <PhoneFrame compact>
                <Screen />
              </PhoneFrame>
              <figcaption className="text-[13px] font-semibold">{screens[i]}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </LocaleProvider>
  )
}
