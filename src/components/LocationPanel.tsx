"use client";

import { useEffect, useRef, useState } from "react";
import { PRESET_CITIES, searchCity, type Geo } from "@/lib/geo";
import { useI18n } from "./I18nProvider";

type Props = {
  geo: Geo;
  onChange: (geo: Geo) => void;
};

export default function LocationPanel({ geo, onChange }: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Geo[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await searchCity(query);
        setResults(r);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="glass-soft p-5 sm:p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold tracking-wide">{t.locationLabel}</h3>
        <span className="text-xs text-white/50 truncate max-w-[60%]">{geo.label}</span>
      </div>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm placeholder:text-white/30 focus:outline-none focus:border-gold-400/50"
        />
        {searching && (
          <div className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-white/40">...</div>
        )}
        {results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full max-h-64 overflow-auto scrollbar-thin rounded-xl bg-night-800 border border-white/10 shadow-2xl">
            {results.map((r) => (
              <li key={`${r.latitude},${r.longitude},${r.label}`}>
                <button
                  onClick={() => {
                    onChange(r);
                    setQuery("");
                    setResults([]);
                  }}
                  className="w-full text-start px-4 py-2 text-sm hover:bg-white/5"
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-white/40 mb-2">{t.quickPresets}</div>
        <div className="flex flex-wrap gap-2">
          {PRESET_CITIES.map((c) => {
            const active = c.label === geo.label;
            return (
              <button
                key={c.label}
                onClick={() => onChange(c)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs border transition",
                  active
                    ? "bg-gold-500/20 border-gold-400/50 text-gold-200"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10",
                ].join(" ")}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
