"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeDaily,
  formatRemaining,
  formatTime,
  type MadhabKey,
  type MethodKey,
} from "@/lib/prayer";
import { FALLBACK_GEO, ipGeolocate, reverseGeocode, type Geo } from "@/lib/geo";
import { formatGregorian, formatHijri } from "@/lib/hijri";
import HeroCountdown from "./HeroCountdown";
import PrayerCard from "./PrayerCard";
import QiblaCompass from "./QiblaCompass";
import LocationPanel from "./LocationPanel";
import SettingsPanel from "./SettingsPanel";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "./I18nProvider";

const STORAGE_KEY = "adhan:settings:v1";

type Settings = {
  geo: Geo;
  method: MethodKey;
  madhab: MadhabKey;
  hour12: boolean;
};

const DEFAULTS: Settings = {
  geo: FALLBACK_GEO,
  method: "MuslimWorldLeague",
  madhab: "Shafi",
  hour12: true,
};

export default function AdhanApp() {
  const { t, locale } = useI18n();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [locating, setLocating] = useState(false);
  const [autoLocated, setAutoLocated] = useState(false);

  useEffect(() => {
    let stored: Settings | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {}
    if (stored) {
      setSettings(stored);
      setAutoLocated(true);
    } else {
      ipGeolocate().then((geo) => {
        if (geo) setSettings((s) => ({ ...s, geo }));
        setAutoLocated(true);
      });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !autoLocated) return;
    if (!("geolocation" in navigator) || !("permissions" in navigator)) return;
    (async () => {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        if (status.state === "granted") {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const label = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
              setSettings((s) => ({
                ...s,
                geo: {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  label,
                },
              }));
            },
            () => {},
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
          );
        }
      } catch {}
    })();
  }, [hydrated, autoLocated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings, hydrated]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const daily = useMemo(
    () =>
      computeDaily(
        settings.geo.latitude,
        settings.geo.longitude,
        now,
        settings.method,
        settings.madhab,
      ),
    [settings.geo, settings.method, settings.madhab, now],
  );

  const tomorrow = useMemo(() => {
    const t2 = new Date(now);
    t2.setDate(t2.getDate() + 1);
    return computeDaily(
      settings.geo.latitude,
      settings.geo.longitude,
      t2,
      settings.method,
      settings.madhab,
    );
  }, [settings.geo, settings.method, settings.madhab, now]);

  const upcoming = useMemo(() => {
    const obligatory = daily.slots.filter((s) => s.isObligatory || s.key === "sunrise");
    const next = obligatory.find((s) => s.time.getTime() > now.getTime());
    if (next) {
      const idx = daily.slots.findIndex((s) => s.key === next.key);
      const current = idx > 0 ? daily.slots[idx - 1] : null;
      return { next, current };
    }
    return { next: tomorrow.slots[0], current: daily.slots[daily.slots.length - 1] };
  }, [daily, tomorrow, now]);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const label = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setSettings((s) => ({
          ...s,
          geo: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            label,
          },
        }));
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const remaining = formatRemaining(upcoming.next.time.getTime(), now.getTime());
  const totalGap =
    upcoming.next.time.getTime() - (upcoming.current?.time.getTime() ?? now.getTime() - 3600_000);
  const elapsed = now.getTime() - (upcoming.current?.time.getTime() ?? now.getTime() - totalGap);
  const progress = Math.min(100, Math.max(0, (elapsed / Math.max(1, totalGap)) * 100));
  const hijri = formatHijri(now, locale);

  return (
    <main className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <header className="relative z-40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight">
            <span className="gold-text">{t.brand}</span>
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {formatGregorian(now, locale)}
            {hijri && <span className="ms-2 text-gold-400/80">· {hijri}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={requestLocation}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 transition px-4 py-2 text-sm border border-white/10"
          >
            <span
              className={`h-2 w-2 rounded-full ${locating ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}
            />
            {locating ? t.locating : t.useMyLocation}
          </button>
        </div>
      </header>

      <HeroCountdown
        next={upcoming.next}
        current={upcoming.current}
        remaining={remaining}
        progress={progress}
        location={settings.geo.label ?? ""}
        hour12={settings.hour12}
      />

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-fade-in">
        {daily.slots.map((slot) => (
          <PrayerCard
            key={slot.key}
            slot={slot}
            now={now}
            isNext={slot.key === upcoming.next.key}
            hour12={settings.hour12}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LocationPanel
            geo={settings.geo}
            onChange={(geo) => setSettings((s) => ({ ...s, geo }))}
          />
          <SettingsPanel
            method={settings.method}
            madhab={settings.madhab}
            hour12={settings.hour12}
            onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
            sunnah={daily.sunnah}
            hour12Format={settings.hour12}
          />
        </div>
        <QiblaCompass degrees={daily.qiblaDegrees} location={settings.geo.label ?? ""} />
      </section>

      <footer className="pt-6 text-center text-xs text-white/40">
        {t.computedLocally(formatTime(now, settings.hour12, locale))}
      </footer>
    </main>
  );
}
