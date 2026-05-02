"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LOCALES, MESSAGES, RTL_LOCALES, type Locale, type Messages, isLocale } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "adhan:locale:v1";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Messages;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && isLocale(saved) && saved !== initialLocale) {
        setLocaleState(saved);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {}
  };

  const value = useMemo<Ctx>(
    () => ({ locale, setLocale, t: MESSAGES[locale] }),
    [locale],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export { LOCALES };
