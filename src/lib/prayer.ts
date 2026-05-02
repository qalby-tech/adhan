import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
  Qibla,
  SunnahTimes,
  HighLatitudeRule,
  type CalculationParameters,
} from "adhan";

export type MethodKey =
  | "MuslimWorldLeague"
  | "Egyptian"
  | "Karachi"
  | "UmmAlQura"
  | "Dubai"
  | "Qatar"
  | "Kuwait"
  | "MoonsightingCommittee"
  | "Singapore"
  | "Turkey"
  | "Tehran"
  | "NorthAmerica";

export const METHOD_LABELS: Record<MethodKey, string> = {
  MuslimWorldLeague: "Muslim World League",
  Egyptian: "Egyptian General Authority",
  Karachi: "University of Islamic Sciences, Karachi",
  UmmAlQura: "Umm al-Qura, Makkah",
  Dubai: "Dubai",
  Qatar: "Qatar",
  Kuwait: "Kuwait",
  MoonsightingCommittee: "Moonsighting Committee",
  Singapore: "Singapore",
  Turkey: "Diyanet, Turkey",
  Tehran: "Tehran Institute of Geophysics",
  NorthAmerica: "ISNA — North America",
};

export type MadhabKey = "Shafi" | "Hanafi";

export type PrayerKey =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export type PrayerSlot = {
  key: PrayerKey;
  label: string;
  arabic: string;
  time: Date;
  isObligatory: boolean;
};

export type DailyTimes = {
  date: Date;
  slots: PrayerSlot[];
  qiblaDegrees: number;
  sunnah: { lastThirdOfNight: Date; midnight: Date };
};

const PRAYER_LABELS: Record<PrayerKey, { label: string; arabic: string }> = {
  fajr: { label: "Fajr", arabic: "الفجر" },
  sunrise: { label: "Sunrise", arabic: "الشروق" },
  dhuhr: { label: "Dhuhr", arabic: "الظهر" },
  asr: { label: "Asr", arabic: "العصر" },
  maghrib: { label: "Maghrib", arabic: "المغرب" },
  isha: { label: "Isha", arabic: "العشاء" },
};

function buildParams(method: MethodKey, madhab: MadhabKey): CalculationParameters {
  const params = CalculationMethod[method]();
  params.madhab = madhab === "Hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  return params;
}

export function computeDaily(
  latitude: number,
  longitude: number,
  date: Date,
  method: MethodKey,
  madhab: MadhabKey,
): DailyTimes {
  const coords = new Coordinates(latitude, longitude);
  const params = buildParams(method, madhab);
  const times = new PrayerTimes(coords, date, params);
  const sunnah = new SunnahTimes(times);

  const slots: PrayerSlot[] = [
    { key: "fajr", time: times.fajr, isObligatory: true, ...PRAYER_LABELS.fajr },
    { key: "sunrise", time: times.sunrise, isObligatory: false, ...PRAYER_LABELS.sunrise },
    { key: "dhuhr", time: times.dhuhr, isObligatory: true, ...PRAYER_LABELS.dhuhr },
    { key: "asr", time: times.asr, isObligatory: true, ...PRAYER_LABELS.asr },
    { key: "maghrib", time: times.maghrib, isObligatory: true, ...PRAYER_LABELS.maghrib },
    { key: "isha", time: times.isha, isObligatory: true, ...PRAYER_LABELS.isha },
  ];

  return {
    date,
    slots,
    qiblaDegrees: Qibla(coords),
    sunnah: {
      lastThirdOfNight: sunnah.lastThirdOfTheNight,
      midnight: sunnah.middleOfTheNight,
    },
  };
}

export function nextPrayer(
  latitude: number,
  longitude: number,
  method: MethodKey,
  madhab: MadhabKey,
  now: Date = new Date(),
): { slot: PrayerSlot; current: PrayerSlot | null } {
  const today = computeDaily(latitude, longitude, now, method, madhab);
  const upcoming = today.slots.find((s) => s.time.getTime() > now.getTime());

  if (upcoming) {
    const currentIndex = today.slots.findIndex((s) => s.key === upcoming.key) - 1;
    return {
      slot: upcoming,
      current: currentIndex >= 0 ? today.slots[currentIndex] : null,
    };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const next = computeDaily(latitude, longitude, tomorrow, method, madhab);
  return { slot: next.slots[0], current: today.slots[today.slots.length - 1] };
}

export function qiblaBearing(latitude: number, longitude: number): number {
  return Qibla(new Coordinates(latitude, longitude));
}

export function formatRemaining(targetMs: number, now: number = Date.now()): string {
  const diff = Math.max(0, targetMs - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatTime(d: Date, hour12 = true, locale?: string): string {
  return d.toLocaleTimeString(locale, {
    hour: hour12 ? "numeric" : "2-digit",
    minute: "2-digit",
    hour12,
  });
}
