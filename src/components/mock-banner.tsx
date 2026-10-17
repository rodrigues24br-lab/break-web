"use client";

import { useTranslations } from "next-intl";
import { appConfig } from "@/lib/config";

export function MockBanner() {
  const t = useTranslations("common");
  if (!appConfig.mockMode) return null;
  return (
    <div className="animate-fade border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100/90 sm:text-sm">
      {t("mockBanner")}
    </div>
  );
}
