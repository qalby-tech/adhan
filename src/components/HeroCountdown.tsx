"use client";

import { formatTime, type PrayerSlot } from "@/lib/prayer";
import { useI18n } from "./I18nProvider";

type Props = {
  next: PrayerSlot;
  current: PrayerSlot | null;
  remaining: string;
  progress: number;
  location: string;
  hour12: boolean;
};

export default function HeroCountdown({
  next,
  current,
  remaining,
  progress,
  location,
  hour12,
}: Props) {
  const { t, locale } = useI18n();
  const isArabic = locale === "ar";

  return (
    <section className="glass relative overflow-hidden p-6 sm:p-10 animate-fade-in">
      <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">{t.nextPrayer}</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-5xl sm:text-6xl font-display font-semibold gold-text">
              {t.prayers[next.key as keyof typeof t.prayers] ?? next.label}
            </h2>
            {!isArabic && <span className="text-2xl text-gold-400/80">{next.arabic}</span>}
          </div>
          <div className="text-white/70">
            {t.at}{" "}
            <span className="font-semibold text-white">{formatTime(next.time, hour12, locale)}</span>
            <span className="mx-2 text-white/30">·</span>
            <span className="text-white/60">{location}</span>
          </div>

          <div className="pt-4">
            <div className="text-white/50 text-xs uppercase tracking-widest mb-1">
              {t.timeRemaining}
            </div>
            <div className="text-4xl sm:text-5xl font-mono tabular-nums tracking-tight text-white" dir="ltr">
              {remaining}
            </div>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between text-xs text-white/50 mb-2">
              <span>{current ? t.prayers[current.key as keyof typeof t.prayers] ?? current.label : "—"}</span>
              <span>{t.prayers[next.key as keyof typeof t.prayers] ?? next.label}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-500 via-gold-400 to-amber-200 transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <PulsingMoon />
        </div>
      </div>
    </section>
  );
}

function PulsingMoon() {
  return (
    <div className="relative h-48 w-48 sm:h-56 sm:w-56">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold-400/30 via-gold-500/10 to-transparent border border-white/10 animate-pulse-ring" />
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-night-700 to-night-900 border border-white/15 shadow-inner shadow-black/40 grid place-items-center">
        <svg
          viewBox="0 0 64 64"
          className="h-24 w-24 text-gold-400 drop-shadow-[0_0_18px_rgba(212,167,60,0.45)]"
          fill="currentColor"
        >
          <path d="M40.6 8a24 24 0 1 0 15.4 35.5A20 20 0 0 1 40.6 8Z" />
          <circle cx="50" cy="14" r="1.4" />
          <circle cx="58" cy="20" r="1" />
          <circle cx="54" cy="28" r="1.2" />
        </svg>
      </div>
    </div>
  );
}
