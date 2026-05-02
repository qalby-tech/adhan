export const LOCALES = ["en", "ar", "ru", "tr", "id"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  ru: "Русский",
  tr: "Türkçe",
  id: "Bahasa",
};

export const RTL_LOCALES: ReadonlyArray<Locale> = ["ar"];

export function isLocale(s: string): s is Locale {
  return (LOCALES as readonly string[]).includes(s);
}

export function pickLocale(
  acceptLanguage: string | null | undefined,
  fallback: Locale = "en",
): Locale {
  if (!acceptLanguage) return fallback;
  const parts = acceptLanguage
    .split(",")
    .map((p) => {
      const [tag, ...params] = p.trim().split(";").map((x) => x.trim());
      const qParam = params.find((x) => x.startsWith("q="));
      const q = qParam ? parseFloat(qParam.slice(2)) : 1;
      return { tag: tag.toLowerCase(), q: Number.isNaN(q) ? 1 : q };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of parts) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return fallback;
}

export type Messages = {
  brand: string;
  tagline: string;
  nextPrayer: string;
  at: string;
  timeRemaining: string;
  useMyLocation: string;
  locating: string;
  language: string;
  prayers: Record<"fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha", string>;
  sunriseEndFajr: string;
  nextBadge: string;
  locationLabel: string;
  searchPlaceholder: string;
  quickPresets: string;
  calculationMethod: string;
  madhabLabel: string;
  hour12Label: string;
  hour12Hint: string;
  midnight: string;
  midnightSubtitle: string;
  lastThird: string;
  lastThirdSubtitle: string;
  qiblaDirection: string;
  fromNorth: (deg: string) => string;
  enableCompass: string;
  calibrating: string;
  permissionDenied: string;
  needsHttps: string;
  needsHttpsHint: string;
  unsupportedCompass: string;
  alignedToQibla: string;
  computedLocally: (time: string) => string;
};

const en: Messages = {
  brand: "Adhan",
  tagline: "Prayer Times & Qibla",
  nextPrayer: "Next prayer",
  at: "at",
  timeRemaining: "Time remaining",
  useMyLocation: "Use my location",
  locating: "Locating...",
  language: "Language",
  prayers: {
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
  },
  sunriseEndFajr: "Sunrise · end of Fajr",
  nextBadge: "Next",
  locationLabel: "Location",
  searchPlaceholder: "Search any city...",
  quickPresets: "Quick presets",
  calculationMethod: "Calculation method",
  madhabLabel: "Madhab (Asr)",
  hour12Label: "12-hour clock",
  hour12Hint: "Toggle between 12h and 24h time",
  midnight: "Midnight",
  midnightSubtitle: "Half the night",
  lastThird: "Last third",
  lastThirdSubtitle: "Best time for Tahajjud",
  qiblaDirection: "Qibla Direction",
  fromNorth: (deg) => `${deg}° from North`,
  enableCompass: "Enable live compass",
  calibrating: "Move your device in a figure-8 to calibrate the compass...",
  permissionDenied:
    "Compass permission denied. Enable motion sensors in your browser settings, then reload.",
  needsHttps: "Live compass needs a secure connection (HTTPS).",
  needsHttpsHint:
    "Mobile browsers block motion sensors over plain HTTP. Open the site via https://, deploy behind a TLS proxy, or tunnel with cloudflared / ngrok.",
  unsupportedCompass:
    "Live compass not available on this device. Static qibla bearing shown above.",
  alignedToQibla: "Aligned to Qibla",
  computedLocally: (time) => `Times computed locally with adhan-js · ${time} local`,
};

const ar: Messages = {
  brand: "أذان",
  tagline: "مواقيت الصلاة والقبلة",
  nextPrayer: "الصلاة القادمة",
  at: "في",
  timeRemaining: "الوقت المتبقي",
  useMyLocation: "استخدم موقعي",
  locating: "جاري التحديد...",
  language: "اللغة",
  prayers: {
    fajr: "الفجر",
    sunrise: "الشروق",
    dhuhr: "الظهر",
    asr: "العصر",
    maghrib: "المغرب",
    isha: "العشاء",
  },
  sunriseEndFajr: "الشروق · نهاية وقت الفجر",
  nextBadge: "التالية",
  locationLabel: "الموقع",
  searchPlaceholder: "ابحث عن أي مدينة...",
  quickPresets: "اختيارات سريعة",
  calculationMethod: "طريقة الحساب",
  madhabLabel: "المذهب (العصر)",
  hour12Label: "نظام 12 ساعة",
  hour12Hint: "تبديل بين 12 و 24 ساعة",
  midnight: "منتصف الليل",
  midnightSubtitle: "نصف الليل",
  lastThird: "الثلث الأخير",
  lastThirdSubtitle: "أفضل وقت للتهجد",
  qiblaDirection: "اتجاه القبلة",
  fromNorth: (deg) => `${deg}° من الشمال`,
  enableCompass: "تفعيل البوصلة المباشرة",
  calibrating: "حرّك جهازك على شكل ٨ لمعايرة البوصلة...",
  permissionDenied:
    "تم رفض إذن البوصلة. فعّل مستشعرات الحركة في إعدادات المتصفح ثم أعد التحميل.",
  needsHttps: "تحتاج البوصلة المباشرة إلى اتصال آمن (HTTPS).",
  needsHttpsHint:
    "تمنع متصفحات الهواتف مستشعرات الحركة على HTTP. افتح الموقع عبر https:// أو استخدم نفقًا مثل cloudflared / ngrok.",
  unsupportedCompass:
    "البوصلة المباشرة غير متوفرة على هذا الجهاز. اتجاه القبلة الثابت مبين أعلاه.",
  alignedToQibla: "متجه نحو القبلة",
  computedLocally: (time) => `حُسبت المواقيت محليًا بواسطة adhan-js · ${time} محلي`,
};

const ru: Messages = {
  brand: "Адхан",
  tagline: "Время намаза и Кибла",
  nextPrayer: "Следующий намаз",
  at: "в",
  timeRemaining: "Осталось времени",
  useMyLocation: "Моё местоположение",
  locating: "Определение...",
  language: "Язык",
  prayers: {
    fajr: "Фаджр",
    sunrise: "Восход",
    dhuhr: "Зухр",
    asr: "Аср",
    maghrib: "Магриб",
    isha: "Иша",
  },
  sunriseEndFajr: "Восход · конец Фаджра",
  nextBadge: "Скоро",
  locationLabel: "Местоположение",
  searchPlaceholder: "Найти любой город...",
  quickPresets: "Быстрый выбор",
  calculationMethod: "Метод расчёта",
  madhabLabel: "Мазхаб (Аср)",
  hour12Label: "12-часовой формат",
  hour12Hint: "Переключение между 12 и 24 часами",
  midnight: "Полночь",
  midnightSubtitle: "Середина ночи",
  lastThird: "Последняя треть",
  lastThirdSubtitle: "Лучшее время для Тахаджуда",
  qiblaDirection: "Направление Киблы",
  fromNorth: (deg) => `${deg}° от севера`,
  enableCompass: "Включить компас",
  calibrating: "Поверните устройство восьмёркой для калибровки компаса...",
  permissionDenied:
    "Доступ к компасу запрещён. Включите датчики движения в настройках браузера и перезагрузите.",
  needsHttps: "Живой компас требует защищённого соединения (HTTPS).",
  needsHttpsHint:
    "Мобильные браузеры блокируют датчики движения по HTTP. Откройте сайт через https://, или используйте туннель cloudflared / ngrok.",
  unsupportedCompass:
    "Живой компас недоступен на этом устройстве. Показано статическое направление Киблы.",
  alignedToQibla: "Направлено на Киблу",
  computedLocally: (time) => `Время рассчитано локально через adhan-js · ${time} местное`,
};

const tr: Messages = {
  brand: "Ezan",
  tagline: "Namaz Vakitleri ve Kıble",
  nextPrayer: "Sonraki namaz",
  at: "saat",
  timeRemaining: "Kalan süre",
  useMyLocation: "Konumumu kullan",
  locating: "Konum alınıyor...",
  language: "Dil",
  prayers: {
    fajr: "İmsak",
    sunrise: "Güneş",
    dhuhr: "Öğle",
    asr: "İkindi",
    maghrib: "Akşam",
    isha: "Yatsı",
  },
  sunriseEndFajr: "Güneş · İmsak sonu",
  nextBadge: "Sıradaki",
  locationLabel: "Konum",
  searchPlaceholder: "Şehir ara...",
  quickPresets: "Hızlı seçim",
  calculationMethod: "Hesaplama yöntemi",
  madhabLabel: "Mezhep (İkindi)",
  hour12Label: "12 saat biçimi",
  hour12Hint: "12 saat ile 24 saat arasında geçiş",
  midnight: "Gece yarısı",
  midnightSubtitle: "Gecenin yarısı",
  lastThird: "Son üçte bir",
  lastThirdSubtitle: "Teheccüd için en iyi zaman",
  qiblaDirection: "Kıble Yönü",
  fromNorth: (deg) => `Kuzeyden ${deg}°`,
  enableCompass: "Canlı pusulayı etkinleştir",
  calibrating: "Pusulayı kalibre etmek için cihazınızı 8 şeklinde hareket ettirin...",
  permissionDenied:
    "Pusula izni reddedildi. Tarayıcı ayarlarından hareket sensörlerini etkinleştirip sayfayı yenileyin.",
  needsHttps: "Canlı pusula güvenli bağlantı (HTTPS) gerektirir.",
  needsHttpsHint:
    "Mobil tarayıcılar HTTP üzerinden hareket sensörlerini engeller. Siteyi https:// ile açın veya cloudflared / ngrok tüneli kullanın.",
  unsupportedCompass:
    "Bu cihazda canlı pusula mevcut değil. Statik kıble açısı yukarıda gösterilmiştir.",
  alignedToQibla: "Kıbleye yöneldi",
  computedLocally: (time) => `Vakitler adhan-js ile yerel olarak hesaplandı · ${time} yerel`,
};

const id: Messages = {
  brand: "Adzan",
  tagline: "Waktu Salat & Kiblat",
  nextPrayer: "Salat berikutnya",
  at: "pukul",
  timeRemaining: "Sisa waktu",
  useMyLocation: "Gunakan lokasi saya",
  locating: "Mencari lokasi...",
  language: "Bahasa",
  prayers: {
    fajr: "Subuh",
    sunrise: "Syuruk",
    dhuhr: "Zuhur",
    asr: "Asar",
    maghrib: "Magrib",
    isha: "Isya",
  },
  sunriseEndFajr: "Syuruk · akhir Subuh",
  nextBadge: "Berikutnya",
  locationLabel: "Lokasi",
  searchPlaceholder: "Cari kota apa pun...",
  quickPresets: "Pilihan cepat",
  calculationMethod: "Metode perhitungan",
  madhabLabel: "Mazhab (Asar)",
  hour12Label: "Format 12 jam",
  hour12Hint: "Beralih antara format 12 dan 24 jam",
  midnight: "Tengah malam",
  midnightSubtitle: "Setengah malam",
  lastThird: "Sepertiga akhir",
  lastThirdSubtitle: "Waktu terbaik untuk Tahajud",
  qiblaDirection: "Arah Kiblat",
  fromNorth: (deg) => `${deg}° dari Utara`,
  enableCompass: "Aktifkan kompas langsung",
  calibrating: "Gerakkan perangkat membentuk angka 8 untuk kalibrasi kompas...",
  permissionDenied:
    "Izin kompas ditolak. Aktifkan sensor gerak di pengaturan peramban lalu muat ulang.",
  needsHttps: "Kompas langsung memerlukan koneksi aman (HTTPS).",
  needsHttpsHint:
    "Peramban seluler memblokir sensor gerak pada HTTP. Buka situs melalui https:// atau gunakan terowongan cloudflared / ngrok.",
  unsupportedCompass:
    "Kompas langsung tidak tersedia di perangkat ini. Arah kiblat statis ditampilkan di atas.",
  alignedToQibla: "Mengarah ke Kiblat",
  computedLocally: (time) => `Waktu dihitung lokal dengan adhan-js · ${time} waktu lokal`,
};

export const MESSAGES: Record<Locale, Messages> = { en, ar, ru, tr, id };

export function intlLocaleTag(locale: Locale): string {
  return locale;
}
