/**
 * DynamicWeatherBackground — Atmospheric campus environment visualization
 * that reacts to real time (Asia/Dhaka) and live weather conditions.
 *
 * Implements the premium visual design reference:
 * - Dynamic sky with rich time-of-day gradients (morning, noon, sunset, dusk, night)
 * - Radiant Sun with lens flare & corona (day) or luminous textured Moon with crater maria (night)
 * - Realistic cumulus cloud layers with slow atmospheric drift
 * - Campus architecture silhouette on the right with warmly illuminated windows at night
 * - Lush tree canopies and campus landscape
 * - Live rain canvas and lightning flash
 * - Smooth frosted readability gradient on the left so foreground course details are 100% legible
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useLiveTime } from '../../hooks/useLiveTime';
import { useWeather } from '../../hooks/useWeather';
import { computeEnvironment } from '../../services/environmentEngine';
import type { WeatherCondition } from '../../services/weatherService';

// ═══════════════════════════════════════════════════════════════════
// CELESTIAL BODIES (SUN & MOON)
// ═══════════════════════════════════════════════════════════════════

/** Realistic SVG Sun with multi-layered glow, radiant corona, and golden flare rays */
function Sun({ x, y, elevation }: { x: number; y: number; elevation: number }) {
  if (elevation <= 0) return null;

  const scale = 0.65 + elevation * 0.22;
  const opacity = Math.min(1, elevation * 1.5);

  const coreG = Math.round(210 + elevation * 45);
  const coreB = Math.round(80 + elevation * 140);
  const coronaG = Math.round(155 + elevation * 65);
  const coronaB = Math.round(30 + elevation * 60);

  const rayInner = 16 * scale;
  const rayOuter = (16 + 12 + elevation * 14) * scale;

  return (
    <g
      transform={`translate(${x * 440}, ${y * 180})`}
      opacity={opacity}
      className="transition-all duration-[2500ms] ease-out pointer-events-none"
    >
      {/* Outer ambient solar haze */}
      <circle
        r={52 * scale}
        fill={`rgba(255, ${coronaG}, ${coronaB}, 0.08)`}
        className="animate-solar-breathe"
      />

      {/* Broad corona glow */}
      <circle
        r={32 * scale}
        fill={`rgba(255, ${coronaG}, ${coronaB}, 0.18)`}
      />

      {/* Inner bright corona */}
      <circle
        r={20 * scale}
        fill={`rgba(255, ${coronaG + 25}, ${coronaB + 20}, 0.32)`}
      />

      {/* Radiating solar rays (12 directions) */}
      <g
        stroke={`rgba(255, ${coronaG + 15}, ${coronaB}, ${0.25 + elevation * 0.2})`}
        strokeWidth={1.2 * scale}
        strokeLinecap="round"
      >
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, idx) => {
          const rad = (angle * Math.PI) / 180;
          const outerLen = idx % 2 === 0 ? rayOuter : rayOuter * 0.75;
          return (
            <line
              key={angle}
              x1={Math.cos(rad) * rayInner}
              y1={Math.sin(rad) * rayInner}
              x2={Math.cos(rad) * outerLen}
              y2={Math.sin(rad) * outerLen}
            />
          );
        })}
      </g>

      {/* Sun Core Sphere */}
      <circle
        r={12 * scale}
        fill={`rgb(255, ${coreG}, ${coreB})`}
        stroke="rgba(255, 250, 210, 0.6)"
        strokeWidth={0.8}
      />

      {/* Radiant White-Hot Center */}
      <circle
        r={6 * scale}
        fill="rgba(255, 255, 255, 0.85)"
      />
    </g>
  );
}

/** Luminous realistic Full Moon with surface crater maria and lunar halo */
function Moon({ x, y, elevation, cloudCover }: {
  x: number; y: number; elevation: number; cloudCover: number;
}) {
  if (elevation <= 0) return null;

  const opacity = Math.min(1, elevation * 1.4) * (1 - (cloudCover / 100) * 0.45);
  const scale = 0.65 + elevation * 0.18;

  return (
    <g
      transform={`translate(${x * 440}, ${y * 180})`}
      opacity={opacity}
      className="transition-all duration-[2500ms] ease-out pointer-events-none"
    >
      {/* Outer ambient lunar haze */}
      <circle
        r={48 * scale}
        fill="rgba(186, 220, 255, 0.07)"
        className="animate-solar-breathe"
      />

      {/* Inner lunar atmospheric corona */}
      <circle
        r={28 * scale}
        fill="rgba(210, 235, 255, 0.14)"
      />

      {/* Moon Orb */}
      <circle
        r={16 * scale}
        fill="#e2e8f0"
        stroke="rgba(203, 213, 225, 0.5)"
        strokeWidth={0.8}
      />

      {/* Lunar Maria (Dark plains & craters for photorealistic depth) */}
      <g fill="rgba(148, 163, 184, 0.35)">
        {/* Oceanus Procellarum / Mare Imbrium */}
        <ellipse cx={-4 * scale} cy={-5 * scale} rx={4.5 * scale} ry={3.5 * scale} />
        {/* Mare Serenitatis */}
        <circle cx={4 * scale} cy={-4 * scale} r={3 * scale} />
        {/* Mare Tranquillitatis */}
        <ellipse cx={6 * scale} cy={1 * scale} rx={3.5 * scale} ry={2.8 * scale} />
        {/* Mare Crisium */}
        <circle cx={9 * scale} cy={-2 * scale} r={2 * scale} />
        {/* Mare Fecunditatis & Nectaris */}
        <ellipse cx={5.5 * scale} cy={5.5 * scale} rx={3 * scale} ry={2.2 * scale} />
        {/* Mare Nubium / Humorum */}
        <ellipse cx={-3.5 * scale} cy={4.5 * scale} rx={3.5 * scale} ry={2.5 * scale} />
        {/* Tycho crater rays highlight */}
        <circle cx={-1 * scale} cy={8 * scale} r={1.2 * scale} fill="rgba(255, 255, 255, 0.45)" />
      </g>

      {/* Soft limb brightening highlight */}
      <circle
        r={15.5 * scale}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth={0.6}
      />
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CLOUDS & STARS
// ═══════════════════════════════════════════════════════════════════

/** Atmospheric 3D cumulus cloud layers */
function CloudLayer({ condition, isDay, phase }: {
  condition: WeatherCondition; isDay: boolean; phase: string;
}) {
  let cloudOpacity: number;
  let cloudCount: number;

  switch (condition) {
    case 'clear':
      cloudOpacity = 0.22; cloudCount = 1; break;
    case 'partly_cloudy':
      cloudOpacity = 0.42; cloudCount = 2; break;
    case 'cloudy':
    case 'fog':
      cloudOpacity = 0.60; cloudCount = 3; break;
    case 'drizzle':
    case 'rain':
      cloudOpacity = 0.72; cloudCount = 3; break;
    case 'thunderstorm':
      cloudOpacity = 0.85; cloudCount = 3; break;
  }

  const isStorm = condition === 'thunderstorm' || condition === 'rain';
  const isSunsetish = phase === 'sunset' || phase === 'dusk' || phase === 'dawn';

  const clouds = [
    // Cloud 1 — High right, majestic billowing cumulus floating across upper sky
    <g key="c1" className="animate-cloud-drift-1">
      {/* Volumetric cloud base */}
      <path
        d="M 215 54 C 208 44, 218 34, 232 34 C 238 20, 260 14, 282 20 C 292 8, 322 8, 338 20 C 352 14, 375 18, 384 30 C 398 34, 404 46, 394 56 C 382 60, 362 57, 342 58 C 318 60, 288 56, 262 58 C 242 60, 224 57, 215 54 Z"
        fill="url(#cumulusGradMain)"
      />
      {/* Sunlit/Moonlit billowing crest highlight */}
      <path
        d="M 234 32 C 242 20, 262 16, 280 20 C 292 9, 320 9, 336 21 C 350 16, 370 20, 378 30 C 360 26, 338 23, 318 24 C 294 25, 264 26, 245 31 Z"
        fill="url(#cumulusCrestGrad)"
      />
      {/* Inner billow contours for 3D cloud volume */}
      <path
        d="M 272 26 C 285 18, 310 18, 322 26 C 308 24, 290 24, 272 26 Z"
        fill={isDay ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.12)'}
      />
      <path
        d="M 245 40 C 256 30, 274 27, 288 34 C 276 32, 258 33, 245 40 Z"
        fill={isDay ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.08)'}
      />
      <path
        d="M 322 34 C 336 24, 355 26, 366 36 C 352 33, 335 32, 322 34 Z"
        fill={isDay ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.08)'}
      />
    </g>,

    // Cloud 2 — Upper left/center drifting soft cumulus
    <g key="c2" className="animate-cloud-drift-2">
      <path
        d="M 112 50 C 106 42, 115 33, 128 32 C 136 22, 156 18, 174 24 C 186 14, 210 15, 224 24 C 236 20, 252 26, 256 36 C 260 44, 252 52, 242 53 C 218 52, 186 49, 156 52 C 136 53, 120 53, 112 50 Z"
        fill="url(#cumulusGradMain)"
      />
      <path
        d="M 130 30 C 140 20, 158 19, 172 24 C 184 16, 206 16, 218 24 C 206 22, 188 22, 172 25 C 156 27, 142 28, 130 30 Z"
        fill="url(#cumulusCrestGrad)"
      />
      <path
        d="M 152 33 C 165 24, 184 24, 196 32 C 184 29, 168 29, 152 33 Z"
        fill={isDay ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)'}
      />
    </g>,

    // Cloud 3 — Mid-height atmospheric horizon cumulus layer
    <g key="c3" className="animate-cloud-drift-3">
      <path
        d="M 275 72 C 268 64, 278 57, 290 55 C 300 46, 320 44, 335 48 C 346 40, 370 41, 384 49 C 396 46, 412 52, 416 62 C 418 70, 408 76, 396 76 C 368 74, 335 72, 305 75 C 290 76, 280 75, 275 72 Z"
        fill="url(#cumulusGradMain)"
      />
      <path
        d="M 292 53 C 304 45, 322 45, 334 49 C 346 42, 366 42, 378 49 C 364 47, 346 47, 332 50 C 318 52, 304 53, 292 53 Z"
        fill="url(#cumulusCrestGrad)"
      />
    </g>,
  ];

  return (
    <>
      <defs>
        {/* Cumulus Main Body Gradient */}
        <linearGradient id="cumulusGradMain" x1="0%" y1="0%" x2="0%" y2="100%">
          {isDay ? (
            isStorm ? (
              <>
                <stop offset="0%" stopColor="#475569" stopOpacity={cloudOpacity * 1.1} />
                <stop offset="60%" stopColor="#334155" stopOpacity={cloudOpacity} />
                <stop offset="100%" stopColor="#1e293b" stopOpacity={cloudOpacity * 0.85} />
              </>
            ) : isSunsetish ? (
              <>
                <stop offset="0%" stopColor="#fef08a" stopOpacity={cloudOpacity * 1.3} />
                <stop offset="45%" stopColor="#f472b6" stopOpacity={cloudOpacity * 1.1} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={cloudOpacity * 0.7} />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ffffff" stopOpacity={Math.min(0.95, cloudOpacity * 1.35)} />
                <stop offset="40%" stopColor="#f8fafc" stopOpacity={Math.min(0.85, cloudOpacity * 1.15)} />
                <stop offset="75%" stopColor="#e2e8f0" stopOpacity={Math.min(0.70, cloudOpacity * 0.90)} />
                <stop offset="100%" stopColor="#cbd5e1" stopOpacity={Math.min(0.50, cloudOpacity * 0.65)} />
              </>
            )
          ) : (
            isStorm ? (
              <>
                <stop offset="0%" stopColor="#334155" stopOpacity={cloudOpacity * 1.1} />
                <stop offset="100%" stopColor="#0f172a" stopOpacity={cloudOpacity * 0.85} />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#cbd5e1" stopOpacity={cloudOpacity * 1.3} />
                <stop offset="50%" stopColor="#64748b" stopOpacity={cloudOpacity * 0.9} />
                <stop offset="100%" stopColor="#1e293b" stopOpacity={cloudOpacity * 0.4} />
              </>
            )
          )}
        </linearGradient>

        {/* Cumulus Sunlit/Moonlit Rim Crest Gradient */}
        <linearGradient id="cumulusCrestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor={isDay ? (isSunsetish ? '#fef08a' : '#ffffff') : '#e2e8f0'}
            stopOpacity={isDay ? (isStorm ? 0.40 : (isSunsetish ? 0.85 : 0.92)) : 0.45}
          />
          <stop
            offset="100%"
            stopColor={isDay ? '#ffffff' : '#94a3b8'}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      {clouds.slice(0, cloudCount)}
    </>
  );
}

/** Star field with twinkling night stars */
function StarField({ moonElevation }: { moonElevation: number }) {
  const baseOpacity = Math.max(0.3, 0.7 - moonElevation * 0.15);

  const stars = useMemo(() => [
    { cx: 215, cy: 18, r: 1.1, twinkle: true },
    { cx: 245, cy: 32, r: 0.8, twinkle: false },
    { cx: 265, cy: 14, r: 1.2, twinkle: true },
    { cx: 295, cy: 26, r: 0.7, twinkle: false },
    { cx: 325, cy: 12, r: 1.0, twinkle: true },
    { cx: 350, cy: 35, r: 0.9, twinkle: false },
    { cx: 375, cy: 16, r: 1.2, twinkle: true },
    { cx: 405, cy: 28, r: 0.7, twinkle: false },
    { cx: 425, cy: 14, r: 1.0, twinkle: true },
    { cx: 235, cy: 52, r: 0.6, twinkle: false },
    { cx: 275, cy: 45, r: 0.8, twinkle: true },
    { cx: 310, cy: 58, r: 0.6, twinkle: false },
    { cx: 360, cy: 48, r: 0.9, twinkle: true },
    { cx: 415, cy: 42, r: 0.7, twinkle: false },
    { cx: 185, cy: 24, r: 0.8, twinkle: true },
    { cx: 160, cy: 38, r: 0.6, twinkle: false },
  ], []);

  return (
    <g opacity={baseOpacity} className="pointer-events-none">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.cx} cy={s.cy} r={s.r}
          fill="#e2e8f0"
          className={s.twinkle ? 'animate-star-twinkle' : undefined}
          style={s.twinkle ? { animationDelay: `${i * 0.55}s` } : undefined}
        />
      ))}
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CAMPUS ARCHITECTURE & HORIZON SCENERY
// ═══════════════════════════════════════════════════════════════════

/**
 * Campus Architecture & Landscape:
 * Engineered to full proportional height and width without clipping or cutoff.
 * Main Academic Building & Courtyard tree safely end at x = 433 (inside viewBox 440).
 */
function CampusHorizon({ isDay, phase }: {
  isDay: boolean; phase: string;
}) {
  const isSunsetish = phase === 'sunset' || phase === 'dusk' || phase === 'dawn';

  // Architectural tones — clearly defined against both day and night skies
  const buildingBase = isDay
    ? isSunsetish
      ? '#3b2539'
      : '#2c3c52'
    : '#141d2d';

  const buildingTrim = isDay
    ? isSunsetish
      ? '#5c3959'
      : '#435e80'
    : '#233248';

  const buildingOutline = isDay
    ? 'rgba(255, 255, 255, 0.16)'
    : 'rgba(96, 165, 250, 0.22)';

  // Window colors
  const litWindow = isDay
    ? 'rgba(219, 234, 254, 0.85)'
    : '#fbbf24';

  const dimWindow = isDay
    ? 'rgba(147, 197, 253, 0.35)'
    : '#1e293b';

  // Tree & Vegetation colors
  const treeTrunk = isDay
    ? isSunsetish ? '#2a1e17' : '#1e1610'
    : '#0d130f';

  const treeFar = isDay
    ? isSunsetish ? '#244030' : '#184a2d'
    : '#0b1d14';

  const treeNear = isDay
    ? isSunsetish ? '#336142' : '#227040'
    : '#122e1e';

  const treeHighlight = isDay
    ? isSunsetish ? '#527c44' : '#329555'
    : '#1a4029';

  const treeRim = isDay
    ? isSunsetish ? '#8fa356' : '#52ba75'
    : '#255437';

  return (
    <g className="pointer-events-none">
      {/* ── DISTANT HORIZON RIDGE ── */}
      <path
        d="M 170 162 Q 220 148, 270 152 Q 320 140, 370 148 Q 410 142, 440 149 L 440 180 L 170 180 Z"
        fill={isDay ? (isSunsetish ? '#261b30' : '#20324c') : '#0a101c'}
        opacity={isDay ? 0.5 : 0.8}
      />

      {/* ── DISTANT HORIZON TREES (Backdrop Grove) ── */}
      <g fill={treeFar} opacity={0.75}>
        <circle cx="207" cy="155" r="13" />
        <circle cx="218" cy="150" r="15" />
        <circle cx="230" cy="153" r="14" />
        <circle cx="242" cy="148" r="16" />
      </g>

      {/* ── SECONDARY LECTURE WING (Left Building, x: 292 to 338) ── */}
      <g>
        {/* Facade */}
        <rect
          x="292" y="106" width="46" height="62" rx="2"
          fill={buildingBase}
          stroke={buildingOutline}
          strokeWidth="1"
        />
        {/* Parapet */}
        <rect x="290" y="103.5" width="50" height="3.5" rx="1" fill={buildingTrim} />
        {/* Floor divider */}
        <rect x="292" y="125" width="46" height="2" fill={buildingTrim} />
        {/* Corner pillar trim */}
        <rect x="292" y="106" width="2" height="62" fill={buildingTrim} opacity="0.6" />

        {/* Windows — Floor 2 */}
        <rect x="298" y="111" width="7" height="9.5" rx="1.2" fill={litWindow} />
        <rect x="310" y="111" width="7" height="9.5" rx="1.2" fill={litWindow} />
        <rect x="322" y="111" width="7" height="9.5" rx="1.2" fill={dimWindow} />

        {/* Windows — Floor 1 */}
        <rect x="298" y="131" width="7" height="9.5" rx="1.2" fill={litWindow} />
        <rect x="310" y="131" width="7" height="9.5" rx="1.2" fill={dimWindow} />
        <rect x="322" y="131" width="7" height="9.5" rx="1.2" fill={litWindow} />
      </g>

      {/* ── MAIN ACADEMIC BUILDING (IRE Department Main Campus, x: 338 to 426) ── */}
      <g>
        {/* 4-Story Facade Body (safely ends at x = 426) */}
        <rect
          x="338" y="83" width="88" height="85" rx="2.5"
          fill={buildingBase}
          stroke={buildingOutline}
          strokeWidth="1"
        />

        {/* Roofline Architectural Cornice (ends at x = 428, 12px margin before 440) */}
        <rect x="334" y="80" width="94" height="4.5" rx="1.5" fill={buildingTrim} />

        {/* Rooftop Penthouse & HVAC */}
        <rect x="346" y="73" width="20" height="7.5" rx="1.2" fill={buildingTrim} />
        {/* Rooftop Telecom / Weather Mast */}
        <line x1="356" y1="73" x2="356" y2="62" stroke={buildingTrim} strokeWidth="1.4" />
        <circle cx="356" cy="62" r="1.5" fill={isDay ? '#ef4444' : '#f87171'} />

        {/* Floor Ledges / Mullions */}
        <rect x="338" y="102" width="88" height="2.5" fill={buildingTrim} />
        <rect x="338" y="123" width="88" height="2.5" fill={buildingTrim} />
        <rect x="338" y="144" width="88" height="2.5" fill={buildingTrim} />

        {/* Corner Pilasters / Vertical Accent Trim */}
        <rect x="338" y="83" width="2" height="85" fill={buildingTrim} opacity="0.6" />
        <rect x="424" y="83" width="2" height="85" fill={buildingTrim} opacity="0.6" />

        {/* Windows Grid — Floor 4 */}
        <rect x="344" y="88" width="8.5" height="11" rx="1.5" fill={litWindow} />
        <rect x="359" y="88" width="8.5" height="11" rx="1.5" fill={litWindow} />
        <rect x="374" y="88" width="8.5" height="11" rx="1.5" fill={dimWindow} />
        <rect x="389" y="88" width="8.5" height="11" rx="1.5" fill={litWindow} />
        <rect x="404" y="88" width="8.5" height="11" rx="1.5" fill={litWindow} />

        {/* Windows Grid — Floor 3 */}
        <rect x="344" y="109" width="8.5" height="11" rx="1.5" fill={dimWindow} />
        <rect x="359" y="109" width="8.5" height="11" rx="1.5" fill={litWindow} />
        <rect x="374" y="109" width="8.5" height="11" rx="1.5" fill={litWindow} />
        <rect x="389" y="109" width="8.5" height="11" rx="1.5" fill={litWindow} />
        <rect x="404" y="109" width="8.5" height="11" rx="1.5" fill={dimWindow} />

        {/* Windows Grid — Floor 2 */}
        <rect x="344" y="130" width="8.5" height="11" rx="1.5" fill={litWindow} />
        <rect x="359" y="130" width="8.5" height="11" rx="1.5" fill={litWindow} />
        <rect x="374" y="130" width="8.5" height="11" rx="1.5" fill={dimWindow} />
        <rect x="389" y="130" width="8.5" height="11" rx="1.5" fill={litWindow} />
        <rect x="404" y="130" width="8.5" height="11" rx="1.5" fill={litWindow} />

        {/* Ground Floor Entrance (Level 1) */}
        <rect x="365" y="148" width="28" height="2.5" rx="1" fill={buildingTrim} />
        <rect x="368" y="150.5" width="22" height="17" rx="1" fill={litWindow} opacity="0.9" />
        <line x1="379" y1="150.5" x2="379" y2="167.5" stroke={buildingTrim} strokeWidth="1" />
        {/* Flanking Ground Floor Windows */}
        <rect x="346" y="151" width="8.5" height="11" rx="1.5" fill={litWindow} />
        <rect x="404" y="151" width="8.5" height="11" rx="1.5" fill={dimWindow} />

        {/* Window warm light spills at night */}
        {!isDay && (
          <g fill="rgba(251, 191, 36, 0.20)">
            <circle cx="359" cy="93" r="13" />
            <circle cx="389" cy="93" r="13" />
            <circle cx="374" cy="114" r="14" />
            <circle cx="404" cy="114" r="12" />
            <circle cx="359" cy="135" r="13" />
            <circle cx="389" cy="135" r="13" />
            <circle cx="379" cy="158" r="15" />
            <circle cx="310" cy="116" r="11" />
          </g>
        )}
      </g>

      {/* ── REALISTIC ORGANIC CAMPUS TREES & FOLIAGE ── */}
      <g>
        {/* Tree 1: Grand Campus Shade Tree (Left of wing, x: 254–294) */}
        <g>
          {/* Tapered bark trunk with natural branching */}
          <path
            d="M 272 168 C 272 157, 274 150, 275 142 C 276 136, 279 130, 282 124 M 275 142 C 272 137, 267 133, 262 130 M 277 134 C 281 130, 286 127, 291 125"
            stroke={treeTrunk}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Root flare */}
          <polygon points="268,168 276,168 274,162 270,162" fill={treeTrunk} />

          {/* Foliage Tier 1: Deep forest base */}
          <g fill={treeFar}>
            <circle cx="260" cy="144" r="14" />
            <circle cx="268" cy="132" r="15" />
            <circle cx="280" cy="122" r="16" />
            <circle cx="291" cy="130" r="14" />
            <circle cx="292" cy="144" r="13" />
            <circle cx="277" cy="138" r="17" />
          </g>

          {/* Foliage Tier 2: Rich mid-foliage */}
          <g fill={treeNear}>
            <circle cx="262" cy="142" r="12" />
            <circle cx="270" cy="130" r="13" />
            <circle cx="279" cy="121" r="14" />
            <circle cx="288" cy="128" r="12" />
            <circle cx="289" cy="141" r="11" />
            <circle cx="276" cy="134" r="14" />
          </g>

          {/* Foliage Tier 3: Sunlit / Ambient highlight puffs & leaf textures */}
          <g fill={treeHighlight} opacity={isDay ? 0.85 : 0.50}>
            <circle cx="267" cy="126" r="8" />
            <circle cx="277" cy="116" r="9" />
            <circle cx="286" cy="123" r="7" />
            <circle cx="270" cy="120" r="4.5" />
            <circle cx="282" cy="132" r="5" />
          </g>

          {/* Foliage Tier 4: Sunlit leaf rim tip */}
          {isDay && (
            <ellipse cx="275" cy="113" rx="6" ry="4" fill={treeRim} opacity={0.75} />
          )}
        </g>

        {/* Tree 2: Secondary Campus Tree (x: 234–260) */}
        <g>
          <path
            d="M 246 168 C 246 159, 247 153, 248 146 C 249 141, 251 136, 254 132 M 248 146 C 245 142, 240 139, 236 137"
            stroke={treeTrunk}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <polygon points="243,168 249,168 247,163 245,163" fill={treeTrunk} />

          <g fill={treeFar}>
            <circle cx="238" cy="148" r="11" />
            <circle cx="244" cy="138" r="12" />
            <circle cx="252" cy="144" r="11" />
            <circle cx="246" cy="133" r="10" />
          </g>
          <g fill={treeNear}>
            <circle cx="239" cy="146" r="9" />
            <circle cx="244" cy="137" r="10" />
            <circle cx="251" cy="142" r="9" />
          </g>
          <g fill={treeHighlight} opacity={isDay ? 0.85 : 0.50}>
            <circle cx="243" cy="131" r="6" />
          </g>
        </g>

        {/* Tree 3: Courtyard Framing Tree (Right of building, x: 424–438) */}
        {/* Beautifully nestled against the building's right wall, 100% visible, ends safely at x = 437 */}
        <g>
          <path
            d="M 430 168 C 430 158, 431 151, 432 144 C 433 139, 434 135, 435 131 M 432 144 C 429 140, 425 137, 422 135"
            stroke={treeTrunk}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <polygon points="428,168 433,168 431,163 429,163" fill={treeTrunk} />

          <g fill={treeFar}>
            <circle cx="426" cy="146" r="8" />
            <circle cx="430" cy="134" r="9" />
            <circle cx="433" cy="142" r="6" />
            <circle cx="428" cy="126" r="7" />
          </g>
          <g fill={treeNear}>
            <circle cx="427" cy="144" r="6.5" />
            <circle cx="430" cy="133" r="7.5" />
            <circle cx="432" cy="140" r="5" />
            <circle cx="428" cy="125" r="6" />
          </g>
          <g fill={treeHighlight} opacity={isDay ? 0.85 : 0.50}>
            <circle cx="428" cy="122" r="4.5" />
            <circle cx="431" cy="128" r="4" />
          </g>
        </g>
      </g>

      {/* ── WARM PATHWAY LAMPPOSTS AT NIGHT ── */}
      {!isDay && (
        <g>
          {/* Lamppost 1 */}
          <line x1="290" y1="154" x2="290" y2="168" stroke="#475569" strokeWidth="1.2" />
          <circle cx="290" cy="154" r="2.2" fill="#fef08a" />
          <circle cx="290" cy="154" r="9" fill="rgba(253, 224, 71, 0.28)" />

          {/* Lamppost 2 */}
          <line x1="336" y1="154" x2="336" y2="168" stroke="#475569" strokeWidth="1.2" />
          <circle cx="336" cy="154" r="2.2" fill="#fef08a" />
          <circle cx="336" cy="154" r="9" fill="rgba(253, 224, 71, 0.28)" />
        </g>
      )}

      {/* ── CAMPUS ROADWAY / GROUND LINE (Full Base) ── */}
      <rect
        x="-100"
        y="167"
        width="640"
        height="18"
        fill={isDay ? '#182436' : '#080d18'}
      />
      {/* Curb highlight line */}
      <line
        x1="210" y1="167" x2="440" y2="167"
        stroke={isDay ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)'}
        strokeWidth="1"
      />
    </g>
  );
}

// ═══════════════════════════════════════════════════════════════════
// WEATHER EFFECTS (RAIN, LIGHTNING, FOG)
// ═══════════════════════════════════════════════════════════════════

/** Lightweight canvas rain */
function RainCanvas({ intensity }: { intensity: 'light' | 'moderate' | 'heavy' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dropCount = intensity === 'heavy' ? 60 : intensity === 'moderate' ? 32 : 16;
  const dropsRef = useRef<Array<{ x: number; y: number; speed: number; length: number }>>([]);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const initDrops = useCallback((w: number, h: number) => {
    dropsRef.current = Array.from({ length: dropCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 2.2 + Math.random() * 3.2,
      length: 8 + Math.random() * 14,
    }));
  }, [dropCount]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
      initDrops(canvas.width, canvas.height);
    };
    resize();

    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(180, 205, 230, 0.28)';
      ctx.lineWidth = 0.8;

      for (const drop of dropsRef.current) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 1, drop.y + drop.length);
        ctx.stroke();
        drop.y += drop.speed;
        drop.x -= 0.35;
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, [prefersReducedMotion, initDrops]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 4 }}
    />
  );
}

/** Lightning flash for thunderstorms */
function LightningFlash() {
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timeout: ReturnType<typeof setTimeout>;
    const flash = () => {
      if (flashRef.current) {
        flashRef.current.style.opacity = '0.14';
        setTimeout(() => { if (flashRef.current) flashRef.current.style.opacity = '0'; }, 70);
        if (Math.random() > 0.5) {
          setTimeout(() => {
            if (flashRef.current) flashRef.current.style.opacity = '0.09';
            setTimeout(() => { if (flashRef.current) flashRef.current.style.opacity = '0'; }, 45);
          }, 130);
        }
      }
      timeout = setTimeout(flash, 6000 + Math.random() * 12000);
    };
    timeout = setTimeout(flash, 3000 + Math.random() * 8000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      ref={flashRef}
      className="absolute inset-0 bg-white/10 pointer-events-none transition-opacity duration-75 rounded-3xl"
      style={{ opacity: 0, zIndex: 5 }}
    />
  );
}

/** Fog overlay */
function FogOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none rounded-3xl"
      style={{
        background: `linear-gradient(180deg,
          rgba(140, 155, 175, 0.15) 0%,
          rgba(120, 135, 155, 0.22) 45%,
          rgba(95, 110, 130, 0.15) 100%)`,
        zIndex: 3,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN DYNAMIC WEATHER COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function DynamicWeatherBackground() {
  const now = useLiveTime();
  const weather = useWeather();

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 639px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const condition: WeatherCondition = weather?.condition ?? 'partly_cloudy';
  const cloudCover = weather?.cloudCover ?? 40;

  const env = useMemo(() => {
    return computeEnvironment(now, condition, cloudCover);
  }, [now, condition, cloudCover]);

  const rainIntensity = useMemo(() => {
    if (condition === 'thunderstorm') return 'heavy' as const;
    if (condition === 'rain') return 'moderate' as const;
    if (condition === 'drizzle') return 'light' as const;
    return null;
  }, [condition]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[26px] select-none">
      {/* Layer 1: Dynamic Sky Gradient */}
      <div
        className="absolute inset-0 transition-all duration-[3000ms] ease-in-out"
        style={{ background: env.sky.skyGradient }}
      />

      {/* Layer 2: Ambient Celestial Glow (Dynamically tracks sun/moon in mobile and desktop frames) */}
      <div
        className="absolute inset-0 transition-all duration-[2500ms]"
        style={{
          background: (() => {
            const body = env.isDay ? env.sun : env.moon;
            if (!body.visible) return 'none';
            const glowOpStr = env.sky.glowColor.replace('VAR', String(env.sky.glowOpacity));
            // On mobile (viewBox 150-440), convert SVG coordinate (body.x * 440) to percentage of visible width
            const glowXPercent = isMobile
              ? Math.max(10, Math.min(95, ((body.x * 440 - 150) / 290) * 100))
              : body.x * 100;
            return `radial-gradient(ellipse 180px 140px at ${glowXPercent}% ${body.y * 100}%, ${glowOpStr}, transparent 75%)`;
          })(),
        }}
      />

      {/* Layer 3–6: SVG Canvas (Stars, Celestial Bodies, Clouds, Campus Landscape)
          On desktop: Wide panoramic frame 0 0 440 180
          On mobile: Focused landscape frame 150 0 290 180 so trees, wing, building & sun all fit perfectly */}
      <svg
        viewBox={isMobile ? '150 0 290 180' : '0 0 440 180'}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
      >
        {/* Stars (Night only) */}
        {!env.isDay && <StarField moonElevation={env.moon.elevation} />}

        {/* Sun */}
        {env.sun.visible && (
          <Sun x={env.sun.x} y={env.sun.y} elevation={env.sun.elevation} />
        )}

        {/* Moon */}
        {env.moon.visible && (
          <Moon
            x={env.moon.x} y={env.moon.y}
            elevation={env.moon.elevation}
            cloudCover={cloudCover}
          />
        )}

        {/* Dynamic Drifting Clouds */}
        <CloudLayer condition={condition} isDay={env.isDay} phase={env.phase} />

        {/* Campus Architecture & Trees */}
        <CampusHorizon isDay={env.isDay} phase={env.phase} />
      </svg>

      {/* Layer 7: Rain particles */}
      {rainIntensity && <RainCanvas intensity={rainIntensity} />}

      {/* Layer 8: Lightning flash */}
      {condition === 'thunderstorm' && <LightningFlash />}

      {/* Layer 9: Fog */}
      {condition === 'fog' && <FogOverlay />}

      {/* Layer 10: Smooth Frosted Readability Shield on Left —
           Ensures course code, faculty, room, and action buttons are 100% legible
           while allowing the rich sky and campus scenery (trees + building) to shine on the right */}
      <div
        className="absolute inset-y-0 left-0 w-[50%] sm:w-[58%] pointer-events-none transition-all duration-1000"
        style={{
          background: `linear-gradient(to right,
            rgba(6, 10, 18, 0.95) 0%,
            rgba(8, 14, 24, 0.90) 45%,
            rgba(10, 18, 30, 0.50) 75%,
            rgba(12, 20, 34, 0.10) 90%,
            transparent 100%)`,
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 8,
        }}
      />
    </div>
  );
}
