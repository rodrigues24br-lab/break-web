"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DICTIONARIES,
  LOCALE_COOKIE,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const LOCALE_PREFIX = /^\/(en|es|pt)(?=\/|$)/;

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale === "pt" ? "pt-BR" : locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
      const rest = (pathname || "/").replace(LOCALE_PREFIX, "") || "";
      router.push(`/${next}${rest}`);
    },
    [pathname, router]
  );

  const value = useMemo(
    () => ({ locale, t: DICTIONARIES[locale], setLocale }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useBreakLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useBreakLocale must be used within LocaleProvider");
  return context;
}

/** Alias matching the Downloads layout components. */
export function useLocale() {
  return useBreakLocale();
}
