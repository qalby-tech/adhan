"use client";

import {
  formatTime,
  METHOD_LABELS,
  type MadhabKey,
  type MethodKey,
} from "@/lib/prayer";
import { useI18n } from "./I18nProvider";

type Props = {
  method: MethodKey;
  madhab: MadhabKey;
  hour12: boolean;
  hour12Format: boolean;
  sunnah: { lastThirdOfNight: Date; midnight: Date };
  onChange: (patch: Partial<{ method: MethodKey; madhab: MadhabKey; hour12: boolean }>) => void;
};

export default function SettingsPanel({
  method,
  madhab,
  hour12,
  hour12Format,
  sunnah,
  onChange,
}: Props) {
  const { t, locale } = useI18n();
  return (
    <div className="glass-soft p-5 sm:p-6 space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-white/40">
            {t.calculationMethod}
          </span>
          <select
            value={method}
            onChange={(e) => onChange({ method: e.target.value as MethodKey })}
            className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:border-gold-400/50"
          >
            {(Object.keys(METHOD_LABELS) as MethodKey[]).map((k) => (
              <option key={k} value={k} className="bg-night-800">
                {METHOD_LABELS[k]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-widest text-white/40">{t.madhabLabel}</span>
          <div className="mt-1 flex rounded-xl border border-white/10 bg-black/30 p-1">
            {(["Shafi", "Hanafi"] as MadhabKey[]).map((m) => (
              <button
                key={m}
                onClick={() => onChange({ madhab: m })}
                className={[
                  "flex-1 rounded-lg py-2 text-sm transition",
                  madhab === m ? "bg-gold-500/20 text-gold-200" : "text-white/60 hover:bg-white/5",
                ].join(" ")}
              >
                {m}
              </button>
            ))}
          </div>
        </label>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3">
        <div>
          <div className="text-sm font-medium">{t.hour12Label}</div>
          <div className="text-xs text-white/40">{t.hour12Hint}</div>
        </div>
        <button
          onClick={() => onChange({ hour12: !hour12 })}
          className={[
            "relative w-12 h-6 rounded-full transition",
            hour12 ? "bg-gold-500/70" : "bg-white/10",
          ].join(" ")}
          aria-pressed={hour12}
        >
          <span
            className={[
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
              hour12 ? "left-6" : "left-0.5",
            ].join(" ")}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SunnahCard
          title={t.midnight}
          subtitle={t.midnightSubtitle}
          time={formatTime(sunnah.midnight, hour12Format, locale)}
        />
        <SunnahCard
          title={t.lastThird}
          subtitle={t.lastThirdSubtitle}
          time={formatTime(sunnah.lastThirdOfNight, hour12Format, locale)}
        />
      </div>
    </div>
  );
}

function SunnahCard({ title, subtitle, time }: { title: string; subtitle: string; time: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-3">
      <div className="text-xs text-white/40 uppercase tracking-widest">{title}</div>
      <div className="text-lg font-mono tabular-nums mt-0.5">{time}</div>
      <div className="text-[11px] text-white/40 mt-0.5">{subtitle}</div>
    </div>
  );
}
