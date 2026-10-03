import { useState, useEffect } from 'react';
import { fetchWeather } from '../services/weatherService';
import type { WeatherData } from '../services/weatherService';

const POLL_INTERVAL = 10 * 60 * 1000; // 10 minutes

/**
 * Hook that provides live weather data for Dhaka.
 * Fetches on mount, then polls every 10 minutes.
 * Returns null briefly on first load, then resolved data.
 */
export function useWeather(): WeatherData | null {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await fetchWeather();
      if (active) setWeather(data);
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return weather;
}
