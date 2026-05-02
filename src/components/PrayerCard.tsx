"use client";

import { formatTime, type PrayerSlot } from "@/lib/prayer";
import { useI18n } from "./I18nProvider";

type Props = {
  slot: PrayerSlot;
  now: Date;
  isNext: boolean;
  hour12: boolean;
};

export default function PrayerCard({ slot, now, isNext, hour12 }: Props) {
  const { t, locale } = useI18n();
  const passed = slot.time.getTime() < now.getTime();
  const isArabic = locale === "ar";
  const label = t.prayers[slot.key as keyof typeof t.prayers] ?? slot.label;

  return (
    <div
      className={[
        "relative rounded-2xl p-4 transition-all duration-300 group",
        "border backdrop-blur-md overflow-hidden",
        isNext
          ? "border-gold-400/60 bg-gradient-to-br from-gold-500/20 via-white/5 to-transparent shadow-[0_0_32px_-8px_rgba(212,167,60,0.55)] scale-[1.02]"
          : passed
            ? "border-white/5 bg-white/[0.02] opacity-60"
            : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:-translate-y-0.5",
      ].join(" ")}
    >
      {isNext && (
        <span className="absolute top-2 end-2 text-[10px] uppercase tracking-widest text-gold-300 bg-gold-500/15 border border-gold-400/30 rounded-full px-2 py-0.5">
          {t.nextBadge}
        </span>
      )}
      <div className="flex items-center gap-2">
        <PrayerIcon name={slot.key} />
        <div>
          <div className="text-sm font-semibold tracking-wide">{label}</div>
          {!isArabic && <div className="text-[11px] text-gold-300/70">{slot.arabic}</div>}
        </div>
      </div>
      <div className="mt-3 text-xl font-mono tabular-nums">{formatTime(slot.time, hour12, locale)}</div>
      {!slot.isObligatory && (
        <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
          {t.sunriseEndFajr}
        </div>
      )}
    </div>
  );
}

function PrayerIcon({ name }: { name: PrayerSlot["key"] }) {
  const common = "h-5 w-5 text-gold-400";
  switch (name) {
    case "fajr":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 18h18M5 18a7 7 0 0 1 14 0M12 4v3M5 8l2 2M19 8l-2 2" strokeLinecap="round" />
        </svg>
      );
    case "sunrise":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 20h18M6 20a6 6 0 0 1 12 0M12 4v6M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "dhuhr":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2 2M17.1 17.1l2 2M4.9 19.1l2-2M17.1 6.9l2-2" strokeLinecap="round" />
        </svg>
      );
    case "asr":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 4v2M12 18v2M4 12h2M18 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" strokeLinecap="round" />
        </svg>
      );
    case "maghrib":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 20h18M6 20a6 6 0 0 1 12 0M12 14V8M8 12l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "isha":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor">
          <path d="M14 3a8 8 0 1 0 7 12 7 7 0 0 1-7-12Z" />
          <circle cx="18" cy="6" r="0.8" />
          <circle cx="20" cy="10" r="0.6" />
        </svg>
      );
  }
}
