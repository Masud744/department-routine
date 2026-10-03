/**
 * Weather Service — fetches real-time weather for Dhaka from Open-Meteo (free, no API key).
 * Maps WMO weather codes to semantic conditions used by the Dynamic Environment system.
 */

export type WeatherCondition =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'thunderstorm';

export interface WeatherData {
  temperature: number;
  condition: WeatherCondition;
  cloudCover: number;        // 0–100
  humidity: number;          // 0–100
  windSpeed: number;         // km/h
  isDay: boolean;
  weatherCode: number;       // WMO code
  fetchedAt: number;         // timestamp ms
}

// Dhaka coordinates
const LAT = 23.8103;
const LON = 90.4125;

const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,wind_speed_10m,is_day&timezone=Asia%2FDhaka`;

/** Map WMO weather code → semantic condition */
function mapWeatherCode(code: number): WeatherCondition {
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  if (code === 0) return 'clear';

  // 1, 2: Mainly clear / partly cloudy
  if (code === 1 || code === 2) return 'partly_cloudy';

  // 3: Overcast
  if (code === 3) return 'cloudy';

  // 45, 48: Fog / depositing rime fog
  if (code === 45 || code === 48) return 'fog';

  // 51, 53, 55: Drizzle (light, moderate, dense)
  if (code >= 51 && code <= 55) return 'drizzle';

  // 56, 57: Freezing Drizzle
  if (code === 56 || code === 57) return 'drizzle';

  // 61, 63, 65: Rain (slight, moderate, heavy)
  if (code >= 61 && code <= 65) return 'rain';

  // 66, 67: Freezing rain
  if (code === 66 || code === 67) return 'rain';

  // 71–77: Snow (not common in Dhaka, treat as cloudy)
  if (code >= 71 && code <= 77) return 'cloudy';

  // 80, 81, 82: Rain showers
  if (code >= 80 && code <= 82) return 'rain';

  // 85, 86: Snow showers
  if (code === 85 || code === 86) return 'cloudy';

  // 95, 96, 99: Thunderstorm
  if (code >= 95) return 'thunderstorm';

  return 'partly_cloudy';
}

const CACHE_KEY = 'ire_weather_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/** Try loading cached weather data */
function getCachedWeather(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as WeatherData;
    if (Date.now() - data.fetchedAt < CACHE_DURATION) {
      return data;
    }
  } catch {
    // ignore
  }
  return null;
}

/** Save weather data to cache */
function cacheWeather(data: WeatherData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/** Fetch current weather from Open-Meteo */
export async function fetchWeather(): Promise<WeatherData> {
  // Check cache first
  const cached = getCachedWeather();
  if (cached) return cached;

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Weather API HTTP ${res.status}`);
    const json = await res.json();

    const current = json.current;
    const data: WeatherData = {
      temperature: Math.round(current.temperature_2m),
      condition: mapWeatherCode(current.weather_code),
      cloudCover: current.cloud_cover ?? 50,
      humidity: current.relative_humidity_2m ?? 70,
      windSpeed: current.wind_speed_10m ?? 5,
      isDay: current.is_day === 1,
      weatherCode: current.weather_code,
      fetchedAt: Date.now(),
    };

    cacheWeather(data);
    return data;
  } catch {
    // Fallback: return sensible default so the UI always works
    return {
      temperature: 30,
      condition: 'partly_cloudy',
      cloudCover: 40,
      humidity: 75,
      windSpeed: 8,
      isDay: true,
      weatherCode: 2,
      fetchedAt: Date.now(),
    };
  }
}
