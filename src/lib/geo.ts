export type Geo = { latitude: number; longitude: number; label?: string };

export const FALLBACK_GEO: Geo = {
  latitude: 21.4225,
  longitude: 39.8262,
  label: "Makkah, Saudi Arabia",
};

export const PRESET_CITIES: Geo[] = [
  { latitude: 21.4225, longitude: 39.8262, label: "Makkah" },
  { latitude: 24.4672, longitude: 39.6111, label: "Madinah" },
  { latitude: 41.0082, longitude: 28.9784, label: "Istanbul" },
  { latitude: 25.2048, longitude: 55.2708, label: "Dubai" },
  { latitude: 33.6844, longitude: 73.0479, label: "Islamabad" },
  { latitude: 30.0444, longitude: 31.2357, label: "Cairo" },
  { latitude: 51.5074, longitude: -0.1278, label: "London" },
  { latitude: 40.7128, longitude: -74.006, label: "New York" },
  { latitude: -6.2088, longitude: 106.8456, label: "Jakarta" },
  { latitude: 3.139, longitude: 101.6869, label: "Kuala Lumpur" },
];

export async function ipGeolocate(): Promise<Geo | null> {
  const endpoints = [
    {
      url: "https://ipapi.co/json/",
      parse: (d: { latitude?: number; longitude?: number; city?: string; country_name?: string }) =>
        d.latitude != null && d.longitude != null
          ? {
              latitude: d.latitude,
              longitude: d.longitude,
              label: [d.city, d.country_name].filter(Boolean).join(", ") || "Approximate location",
            }
          : null,
    },
    {
      url: "https://ipwho.is/",
      parse: (d: { latitude?: number; longitude?: number; city?: string; country?: string; success?: boolean }) =>
        d.success && d.latitude != null && d.longitude != null
          ? {
              latitude: d.latitude,
              longitude: d.longitude,
              label: [d.city, d.country].filter(Boolean).join(", ") || "Approximate location",
            }
          : null,
    },
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      const geo = ep.parse(data);
      if (geo) return geo;
    } catch {}
  }
  return null;
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=en`,
      { headers: { "User-Agent": "AdhanApp/1.0" } },
    );
    if (!res.ok) throw new Error("reverse geocode failed");
    const data = await res.json();
    const a = data.address ?? {};
    const city = a.city || a.town || a.village || a.county || a.state;
    const country = a.country;
    return [city, country].filter(Boolean).join(", ") || "Your Location";
  } catch {
    return "Your Location";
  }
}

export async function searchCity(query: string): Promise<Geo[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&accept-language=en`,
    { headers: { "User-Agent": "AdhanApp/1.0" } },
  );
  if (!res.ok) return [];
  const data: Array<{ lat: string; lon: string; display_name: string }> = await res.json();
  return data.map((d) => ({
    latitude: parseFloat(d.lat),
    longitude: parseFloat(d.lon),
    label: d.display_name,
  }));
}
