import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function SalesFooter({ locale }: { locale: string }) {
  const t = await getTranslations("sales.footer");
  return (
    <footer className="mt-24 border-t border-border px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
          Break
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href={`/${locale}/privacy`} className="hover:text-foreground">
            {t("privacy")}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:text-foreground">
            {t("terms")}
          </Link>
          <Link href={`/${locale}/support`} className="hover:text-foreground">
            {t("support")}
          </Link>
          <Link href={`/${locale}/affiliate`} className="hover:text-foreground">
            {t("affiliate")}
          </Link>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-3xl text-xs text-muted-foreground/80">
        {t("tagline")}
      </p>
    </footer>
  );
}
