/**
 * Environment Engine — computes the atmospheric state from real time + weather data.
 *
 * Pure functions: no React dependency. Used by DynamicWeatherBackground to derive
 * sky gradients, celestial body positions, and overlay parameters.
 */

import type { WeatherCondition } from '../services/weatherService';

// ─── Time-of-Day Phases ─────────────────────────────────────────────
export type TimePhase =
  | 'dawn'
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'sunset'
  | 'dusk'
  | 'night';

export interface CelestialPosition {
  /** 0 at horizon (rise), 1 at zenith, back to 0 at set */
  elevation: number;
  /** X position as fraction 0–1 across the card */
  x: number;
  /** Y position as fraction 0–1 (0 = top, 1 = bottom) */
  y: number;
  /** Whether the celestial body is above the horizon */
  visible: boolean;
}

export interface SkyColors {
  /** CSS gradient for the sky background */
  skyGradient: string;
  /** Ambient glow color around celestial body */
  glowColor: string;
  /** Glow opacity 0–1 */
  glowOpacity: number;
  /** Horizon line color */
  horizonColor: string;
}

export interface EnvironmentState {
  phase: TimePhase;
  isDay: boolean;
  sun: CelestialPosition;
  moon: CelestialPosition;
  sky: SkyColors;
  /** 0–1, how much of the phase is "complete" within its range */
  phaseProgress: number;
  /** Total minutes since midnight */
  totalMinutes: number;
}

// ─── Phase Boundaries (BDT minutes since midnight) ──────────────────
const DAWN_START = 330;    // 5:30
const MORNING_START = 390; // 6:30
const NOON_START = 690;    // 11:30
const AFTERNOON_START = 780; // 13:00
const SUNSET_START = 1020; // 17:00
const DUSK_START = 1080;   // 18:00
const NIGHT_START = 1110;  // 18:30

/**
 * Determine the current time-of-day phase from minutes since midnight.
 */
export function getTimePhase(totalMinutes: number): TimePhase {
  if (totalMinutes >= NIGHT_START || totalMinutes < DAWN_START) return 'night';
  if (totalMinutes < MORNING_START) return 'dawn';
  if (totalMinutes < NOON_START) return 'morning';
  if (totalMinutes < AFTERNOON_START) return 'noon';
  if (totalMinutes < SUNSET_START) return 'afternoon';
  if (totalMinutes < DUSK_START) return 'sunset';
  return 'dusk';
}

/**
 * Compute how far into the current phase we are (0–1).
 */
function getPhaseProgress(totalMinutes: number, phase: TimePhase): number {
  const ranges: Record<TimePhase, [number, number]> = {
    dawn: [DAWN_START, MORNING_START],
    morning: [MORNING_START, NOON_START],
    noon: [NOON_START, AFTERNOON_START],
    afternoon: [AFTERNOON_START, SUNSET_START],
    sunset: [SUNSET_START, DUSK_START],
    dusk: [DUSK_START, NIGHT_START],
    night: [NIGHT_START, DAWN_START + 1440], // wraps midnight
  };

  const [start, end] = ranges[phase];
  const duration = end - start;
  let elapsed = totalMinutes - start;

  // Handle night wrapping across midnight
  if (phase === 'night' && totalMinutes < start) {
    elapsed = totalMinutes + 1440 - start;
  }

  return Math.max(0, Math.min(1, elapsed / duration));
}

/**
 * Compute the sun position on a natural arc.
 * The sun moves along a semi-circular arc from east (left) horizon
 * to west (right) horizon during daytime (dawn through dusk).
 */
/**
 * Compute the sun position on a natural arc staged in the right scenic half.
 * This keeps the celestial body framed in the open sky while the left half holds text.
 */
function computeSunPosition(totalMinutes: number): CelestialPosition {
  const RISE_TIME = 345;  // 5:45 AM
  const SET_TIME = 1095;  // 18:15

  if (totalMinutes < RISE_TIME || totalMinutes >= SET_TIME) {
    return { elevation: 0, x: 0.82, y: 1.1, visible: false };
  }

  const progress = (totalMinutes - RISE_TIME) / (SET_TIME - RISE_TIME);
  const elevation = Math.sin(progress * Math.PI);

  // Staged in right quadrant (0.72 - 0.86)
  const x = 0.72 + Math.sin(progress * Math.PI * 0.9) * 0.14;
  const y = 0.68 - elevation * 0.50;

  return { elevation, x, y, visible: true };
}

/**
 * Compute the moon position on a natural arc staged in the right scenic half.
 */
function computeMoonPosition(totalMinutes: number): CelestialPosition {
  const RISE_TIME = 1095; // 18:15
  const SET_TIME = 345;   // 05:45 (next day)

  const isNight = totalMinutes >= RISE_TIME || totalMinutes < SET_TIME;
  if (!isNight) {
    return { elevation: 0, x: 0.85, y: 1.1, visible: false };
  }

  let elapsed: number;
  if (totalMinutes >= RISE_TIME) {
    elapsed = totalMinutes - RISE_TIME;
  } else {
    elapsed = totalMinutes + 1440 - RISE_TIME;
  }

  const duration = 1440 - RISE_TIME + SET_TIME; // 690 minutes
  const progress = elapsed / duration;
  const elevation = Math.sin(progress * Math.PI);

  // Staged in right upper quadrant (0.76 - 0.88, y: 0.24 - 0.58)
  const x = 0.76 + Math.sin(progress * Math.PI * 0.85) * 0.11;
  const y = 0.62 - elevation * 0.38;

  return { elevation, x, y, visible: true };
}


/**
 * Compute the sky gradient and glow based on time phase and weather.
 */
function computeSkyColors(
  phase: TimePhase,
  weather: WeatherCondition,
  cloudCover: number
): SkyColors {
  // Base sky gradients per phase (richer, more atmospheric)
  const phaseGradients: Record<TimePhase, string> = {
    dawn: `linear-gradient(145deg,
      rgba(24, 18, 48, 0.98) 0%,
      rgba(75, 36, 68, 0.92) 28%,
      rgba(165, 75, 65, 0.82) 58%,
      rgba(225, 130, 65, 0.75) 85%,
      rgba(240, 165, 80, 0.65) 100%)`,
    morning: `linear-gradient(145deg,
      rgba(18, 48, 92, 0.95) 0%,
      rgba(28, 78, 138, 0.9) 32%,
      rgba(52, 122, 192, 0.82) 65%,
      rgba(105, 175, 230, 0.75) 100%)`,
    noon: `linear-gradient(145deg,
      rgba(16, 52, 108, 0.96) 0%,
      rgba(25, 85, 155, 0.9) 35%,
      rgba(48, 135, 210, 0.82) 70%,
      rgba(100, 185, 245, 0.75) 100%)`,
    afternoon: `linear-gradient(145deg,
      rgba(20, 50, 95, 0.95) 0%,
      rgba(35, 80, 140, 0.9) 35%,
      rgba(70, 128, 185, 0.82) 70%,
      rgba(145, 170, 195, 0.75) 100%)`,
    sunset: `linear-gradient(145deg,
      rgba(38, 20, 52, 0.98) 0%,
      rgba(95, 32, 60, 0.92) 25%,
      rgba(180, 65, 48, 0.85) 50%,
      rgba(235, 115, 45, 0.78) 75%,
      rgba(245, 160, 55, 0.7) 100%)`,
    dusk: `linear-gradient(145deg,
      rgba(12, 14, 34, 0.98) 0%,
      rgba(28, 24, 52, 0.94) 35%,
      rgba(65, 40, 68, 0.85) 65%,
      rgba(105, 55, 62, 0.75) 100%)`,
    night: `linear-gradient(145deg,
      rgba(4, 8, 18, 0.98) 0%,
      rgba(8, 16, 32, 0.96) 35%,
      rgba(14, 26, 48, 0.92) 70%,
      rgba(18, 35, 62, 0.88) 100%)`,
  };

  // Glow colors per phase
  const phaseGlow: Record<TimePhase, { color: string; opacity: number }> = {
    dawn: { color: 'rgba(255, 160, 60, VAR)', opacity: 0.4 },
    morning: { color: 'rgba(255, 200, 80, VAR)', opacity: 0.35 },
    noon: { color: 'rgba(255, 240, 150, VAR)', opacity: 0.45 },
    afternoon: { color: 'rgba(255, 200, 100, VAR)', opacity: 0.35 },
    sunset: { color: 'rgba(255, 120, 40, VAR)', opacity: 0.5 },
    dusk: { color: 'rgba(180, 80, 60, VAR)', opacity: 0.3 },
    night: { color: 'rgba(100, 150, 220, VAR)', opacity: 0.25 },
  };

  // Weather darkening factor
  let darken = 1.0;
  if (weather === 'cloudy' || weather === 'fog') darken = 0.65;
  else if (weather === 'rain' || weather === 'drizzle') darken = 0.5;
  else if (weather === 'thunderstorm') darken = 0.35;
  else if (weather === 'partly_cloudy') darken = 0.85;

  // Reduce cloud effect slightly
  const cloudDarken = 1 - (cloudCover / 100) * 0.2;
  darken *= cloudDarken;

  const glow = phaseGlow[phase];

  return {
    skyGradient: phaseGradients[phase],
    glowColor: glow.color,
    glowOpacity: glow.opacity * darken,
    horizonColor:
      phase === 'night' || phase === 'dusk'
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(255, 255, 255, 0.08)',
  };
}

/**
 * Master function: compute the full environment state.
 */
export function computeEnvironment(
  now: Date,
  weather: WeatherCondition = 'partly_cloudy',
  cloudCover: number = 40
): EnvironmentState {
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const phase = getTimePhase(totalMinutes);
  const phaseProgress = getPhaseProgress(totalMinutes, phase);
  const isDay = phase !== 'night' && phase !== 'dusk';

  const sun = computeSunPosition(totalMinutes);
  const moon = computeMoonPosition(totalMinutes);
  const sky = computeSkyColors(phase, weather, cloudCover);

  return {
    phase,
    isDay,
    sun,
    moon,
    sky,
    phaseProgress,
    totalMinutes,
  };
}
