"use client";

import { useEffect, useRef, useState } from "react";
import GB from "country-flag-icons/react/3x2/GB";
import SA from "country-flag-icons/react/3x2/SA";
import RU from "country-flag-icons/react/3x2/RU";
import TR from "country-flag-icons/react/3x2/TR";
import ID from "country-flag-icons/react/3x2/ID";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

type FlagProps = { className?: string; title?: string };
const FLAGS: Record<Locale, React.ComponentType<FlagProps>> = {
  en: GB as unknown as React.ComponentType<FlagProps>,
  ar: SA as unknown as React.ComponentType<FlagProps>,
  ru: RU as unknown as React.ComponentType<FlagProps>,
  tr: TR as unknown as React.ComponentType<FlagProps>,
  id: ID as unknown as React.ComponentType<FlagProps>,
};

function Flag({ locale, className }: { locale: Locale; className?: string }) {
  const Component = FLAGS[locale];
  return (
    <span
      className={[
        "inline-block overflow-hidden rounded-[3px] ring-1 ring-white/15 shrink-0",
        className ?? "h-4 w-6",
      ].join(" ")}
    >
      <Component className="h-full w-full object-cover" />
    </span>
  );
}

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 transition px-3 py-2 text-sm border border-white/10"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.language}
      >
        <Flag locale={locale} />
        <span className="font-medium">{LOCALE_LABELS[locale]}</span>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/60" fill="currentColor">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 mt-2 z-[100] min-w-[200px] rounded-xl bg-night-800/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in"
        >
          {LOCALES.map((l) => {
            const active = l === locale;
            return (
              <li key={l}>
                <button
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLocale(l as Locale);
                    setOpen(false);
                  }}
                  className={[
                    "w-full text-start px-4 py-2.5 text-sm flex items-center gap-3 transition",
                    active ? "bg-gold-500/15 text-gold-200" : "text-white/85 hover:bg-white/5",
                  ].join(" ")}
                >
                  <Flag locale={l} />
                  <span className="flex-1">{LOCALE_LABELS[l]}</span>
                  <span className="text-[10px] uppercase text-white/40">{l}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
