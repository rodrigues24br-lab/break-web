import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AmbientBg } from "@/components/ambient-bg";
import { BrandMark } from "@/components/brand-mark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MockBanner } from "@/components/mock-banner";

export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations("nav");
  return (
    <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
      <Link href={`/${locale}`} className="opacity-90 transition hover:opacity-100">
        <BrandMark size="nav" />
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/login`}
          className="hidden text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline"
        >
          {t("login")}
        </Link>
        <LocaleSwitcher />
      </div>
    </header>
  );
}

export async function SiteShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return (
    <div className="relative flex min-h-full flex-col">
      <AmbientBg />
      <MockBanner />
      <SiteHeader locale={locale} />
      <main className="relative z-10 flex flex-1 flex-col px-5 pb-16 pt-6 sm:px-8">
        {children}
      </main>
    </div>
  );
}
