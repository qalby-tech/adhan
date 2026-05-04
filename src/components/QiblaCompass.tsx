"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "./I18nProvider";

type Props = { degrees: number; location: string };

type DeviceOrientationEventConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

type CompassStatus =
  | "idle"
  | "needs-permission"
  | "needs-secure-context"
  | "listening"
  | "active"
  | "denied"
  | "unsupported";

const SMOOTH_ALPHA = 0.15;

function getScreenAngle() {
  if (typeof window === "undefined") return 0;
  const so = window.screen?.orientation;
  if (so && typeof so.angle === "number") return so.angle;
  const legacy = (window as unknown as { orientation?: number }).orientation;
  return typeof legacy === "number" ? legacy : 0;
}

function shortestDelta(from: number, to: number) {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

function rawHeadingFromEvent(e: DeviceOrientationEvent): number | null {
  const webkit = (e as DeviceOrientationEvent & { webkitCompassHeading?: number })
    .webkitCompassHeading;
  if (typeof webkit === "number" && !Number.isNaN(webkit)) {
    return webkit;
  }
  if (e.alpha != null) {
    const screen = getScreenAngle();
    return (((360 - e.alpha + screen) % 360) + 360) % 360;
  }
  return null;
}

export default function QiblaCompass({ degrees, location }: Props) {
  const { t, locale } = useI18n();
  // Continuous (unwrapped) heading. Lets CSS rotate smoothly across the 0/360 boundary.
  const [headingCont, setHeadingCont] = useState<number | null>(null);
  const [status, setStatus] = useState<CompassStatus>("idle");
  const enableRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) {
      setStatus("unsupported");
      return;
    }
    const host = window.location.hostname;
    const isSecure =
      window.isSecureContext || host === "localhost" || host === "127.0.0.1";
    if (!isSecure) {
      setStatus("needs-secure-context");
      return;
    }

    let attached = false;
    let smoothedCont: number | null = null;
    let rafId: number | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let probeTimer: ReturnType<typeof setTimeout> | null = null;
    let source: "absolute" | "relative" | null = null;

    const commit = () => {
      rafId = null;
      if (smoothedCont != null) {
        setHeadingCont(smoothedCont);
        setStatus("active");
      }
    };

    const process = (e: DeviceOrientationEvent) => {
      const raw = rawHeadingFromEvent(e);
      if (raw == null) return;
      if (smoothedCont == null) {
        smoothedCont = raw;
      } else {
        const cur = ((smoothedCont % 360) + 360) % 360;
        const delta = shortestDelta(cur, raw);
        smoothedCont = smoothedCont + SMOOTH_ALPHA * delta;
      }
      if (rafId == null) rafId = requestAnimationFrame(commit);
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const handleAbsolute = (e: Event) => {
      const ev = e as DeviceOrientationEvent;
      if (source !== "absolute") {
        source = "absolute";
        // Absolute is authoritative; drop relative so the two don't fight.
        window.removeEventListener("deviceorientation", handleRelative, true);
        if (probeTimer) {
          clearTimeout(probeTimer);
          probeTimer = null;
        }
      }
      process(ev);
    };

    const handleRelative = (e: Event) => {
      const ev = e as DeviceOrientationEvent;
      if (source === "absolute") return;
      if (source == null) source = ev.absolute ? "absolute" : "relative";
      process(ev);
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      setStatus("listening");
      window.addEventListener("deviceorientationabsolute", handleAbsolute, true);
      // Fall back to relative orientation only if absolute never fires.
      probeTimer = setTimeout(() => {
        probeTimer = null;
        if (source == null) {
          window.addEventListener("deviceorientation", handleRelative, true);
        }
      }, 600);
      fallbackTimer = setTimeout(() => {
        if (smoothedCont == null) setStatus("unsupported");
      }, 5000);
    };

    const detach = () => {
      attached = false;
      window.removeEventListener("deviceorientationabsolute", handleAbsolute, true);
      window.removeEventListener("deviceorientation", handleRelative, true);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (probeTimer) clearTimeout(probeTimer);
      if (rafId != null) cancelAnimationFrame(rafId);
    };

    const ctor = window.DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission;
    if (typeof ctor.requestPermission === "function") {
      setStatus("needs-permission");
      enableRef.current = async () => {
        try {
          const r = await ctor.requestPermission!();
          if (r === "granted") attach();
          else setStatus("denied");
        } catch {
          setStatus("denied");
        }
      };
    } else {
      enableRef.current = () => attach();
      attach();
    }

    return detach;
  }, []);

  const enableCompass = useCallback(() => enableRef.current(), []);

  const headingDisplay =
    headingCont != null ? ((headingCont % 360) + 360) % 360 : null;
  const arrowRotation = headingCont != null ? degrees - headingCont : degrees;
  const cardinalRotation = headingCont != null ? -headingCont : 0;
  const aligned =
    headingDisplay != null && Math.abs(shortestDelta(headingDisplay, degrees)) < 5;
  const formattedDeg = degrees.toLocaleString(locale, { maximumFractionDigits: 1 });

  return (
    <div className="glass p-6 sm:p-8 flex flex-col items-center text-center animate-fade-in">
      <div className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">{t.qiblaDirection}</div>
      <h3 className="text-lg font-semibold mb-1">{t.fromNorth(formattedDeg)}</h3>
      <div className="text-xs text-white/50 mb-6">{location}</div>

      <div className="relative h-64 w-64">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-night-800 to-night-900 border border-white/10 shadow-inner shadow-black/40" />
        <div className="absolute inset-3 rounded-full border border-white/10" />
        <div className="absolute inset-6 rounded-full border border-dashed border-white/10" />

        <Markings />

        <div
          className="absolute inset-0 transition-transform duration-100 ease-out will-change-transform"
          style={{ transform: `rotate(${cardinalRotation}deg)` }}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-white/70">
            N
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/40">S</div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-white/40">W</div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40">E</div>
        </div>

        <div
          className="absolute inset-0 transition-transform duration-100 ease-out will-change-transform"
          style={{ transform: `rotate(${arrowRotation}deg)` }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center gap-1">
            <div className={`text-2xl ${aligned ? "text-emerald-300" : "text-gold-400"}`}>🕋</div>
            <div
              className={`w-0 h-0 border-l-[10px] border-r-[10px] border-l-transparent border-r-transparent ${
                aligned ? "border-b-[28px] border-b-emerald-400" : "border-b-[28px] border-b-gold-500"
              }`}
            />
            <div
              className={`w-1.5 h-20 rounded-b-full ${aligned ? "bg-emerald-500/70" : "bg-gold-500/70"}`}
            />
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-gold-400 ring-4 ring-night-900" />
      </div>

      <CompassStatusUI status={status} aligned={aligned} onEnable={enableCompass} t={t} />
    </div>
  );
}

function CompassStatusUI({
  status,
  aligned,
  onEnable,
  t,
}: {
  status: CompassStatus;
  aligned: boolean;
  onEnable: () => void;
  t: ReturnType<typeof useI18n>["t"];
}) {
  if (aligned) {
    return (
      <p className="mt-4 text-xs uppercase tracking-widest text-emerald-300">{t.alignedToQibla}</p>
    );
  }
  switch (status) {
    case "idle":
    case "needs-permission":
      return (
        <button
          onClick={onEnable}
          className="mt-6 rounded-full bg-gold-500/90 hover:bg-gold-500 text-night-900 font-semibold px-5 py-2 text-sm"
        >
          {t.enableCompass}
        </button>
      );
    case "listening":
      return <p className="mt-4 text-xs text-white/50">{t.calibrating}</p>;
    case "active":
      return null;
    case "denied":
      return <p className="mt-4 text-xs text-amber-300/80">{t.permissionDenied}</p>;
    case "needs-secure-context":
      return (
        <div className="mt-4 max-w-xs space-y-2">
          <p className="text-xs text-amber-300/80">{t.needsHttps}</p>
          <p className="text-[11px] text-white/50 leading-relaxed">{t.needsHttpsHint}</p>
        </div>
      );
    case "unsupported":
      return <p className="mt-4 text-xs text-white/50 max-w-xs">{t.unsupportedCompass}</p>;
  }
}

function Markings() {
  const ticks = Array.from({ length: 36 });
  return (
    <div className="absolute inset-0">
      {ticks.map((_, i) => {
        const major = i % 9 === 0;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${i * 10}deg)`,
              height: "50%",
            }}
          >
            <div
              className={`mx-auto ${major ? "h-3 w-[2px] bg-white/40" : "h-1.5 w-px bg-white/20"}`}
            />
          </div>
        );
      })}
    </div>
  );
}
