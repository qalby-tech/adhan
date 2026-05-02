# Adhan

Modern Islamic prayer times app built with Next.js 15 and the [adhan-js](https://github.com/batoulapps/adhan-js) library. Includes sunrise timing, a live qibla compass, sunnah times (midnight, last third of the night), location search, and 12 calculation methods.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3001
```

## Production build

```bash
npm run build
npm start            # http://localhost:3001
```

## Docker

```bash
docker compose up --build -d
# open http://localhost:3001
```

To rebuild after changes:

```bash
docker compose up --build -d --force-recreate
```

## Features

- Live countdown to next prayer with progress bar
- Six daily times: Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
- Sunnah times: midnight & last third of the night
- Interactive qibla compass (uses device orientation when available)
- Geolocation + city search (OpenStreetMap Nominatim)
- 12 calculation methods, Shafi/Hanafi madhab toggle, 12/24h format
- Hijri + Gregorian date display
- Settings persisted to localStorage
