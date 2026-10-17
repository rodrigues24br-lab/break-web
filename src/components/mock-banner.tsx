"use client";

import { useTranslations } from "next-intl";
import { appConfig } from "@/lib/config";

export function MockBanner() {
  const t = useTranslations("common");
  if (!appConfig.mockMode) return null;
  return (
    <div className="animate-fade border-b border-[rgb(94_115_133/18%)] bg-[#E4EEF8] px-4 py-2 text-center text-xs text-[#1B3A4B] sm:text-sm">
      {t("mockBanner")}
    </div>
  );
}
