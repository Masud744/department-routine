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

import { useMemo, useRef, useEffect, useCallback } from 'react';
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

  const scale = 0.8 + elevation * 0.35;
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
  const scale = 0.85 + elevation * 0.3;

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
function CloudLayer({ condition, isDay }: {
  condition: WeatherCondition; isDay: boolean;
}) {
  let cloudOpacity: number;
  let cloudCount: number;

  switch (condition) {
    case 'clear':
      cloudOpacity = 0.08; cloudCount = 1; break;
    case 'partly_cloudy':
      cloudOpacity = 0.22; cloudCount = 2; break;
    case 'cloudy':
    case 'fog':
      cloudOpacity = 0.38; cloudCount = 3; break;
    case 'drizzle':
    case 'rain':
      cloudOpacity = 0.52; cloudCount = 3; break;
    case 'thunderstorm':
      cloudOpacity = 0.65; cloudCount = 3; break;
  }

  const isStorm = condition === 'thunderstorm' || condition === 'rain';
  const cloudFill = isDay
    ? isStorm
      ? `rgba(45, 52, 68, ${cloudOpacity})`
      : condition === 'cloudy'
        ? `rgba(180, 195, 215, ${cloudOpacity})`
        : `rgba(235, 245, 255, ${cloudOpacity})`
    : isStorm
      ? `rgba(18, 24, 38, ${cloudOpacity})`
      : `rgba(75, 95, 130, ${cloudOpacity})`;

  const clouds = [
    // Cloud 1 — High right, floating across upper sky
    <g key="c1" className="animate-cloud-drift-1">
      <path
        d="M 230 38 Q 245 22, 270 26 Q 292 12, 320 22 Q 345 14, 360 30 Q 375 24, 385 40 Q 392 52, 375 60 L 235 60 Q 220 54, 230 38 Z"
        fill={cloudFill}
      />
    </g>,
    // Cloud 2 — Upper center / left drift
    <g key="c2" className="animate-cloud-drift-2">
      <path
        d="M 120 45 Q 135 28, 160 32 Q 180 18, 205 28 Q 225 22, 235 38 Q 242 48, 230 58 L 125 58 Q 112 52, 120 45 Z"
        fill={cloudFill}
      />
    </g>,
    // Cloud 3 — Mid-height atmospheric layer
    <g key="c3" className="animate-cloud-drift-3">
      <path
        d="M 280 62 Q 298 48, 322 54 Q 345 42, 370 50 Q 388 44, 398 60 Q 405 70, 390 78 L 285 78 Q 272 72, 280 62 Z"
        fill={cloudFill}
      />
    </g>,
  ];

  return <>{clouds.slice(0, cloudCount)}</>;
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
 * Positioned on the right side (x: 240–440) so open sky and campus scenery
 * shine through while the left side smoothly fades into the dark readability shield.
 */
function CampusHorizon({ isDay, phase }: {
  isDay: boolean; phase: string;
}) {
  const isSunsetish = phase === 'sunset' || phase === 'dusk' || phase === 'dawn';

  // Architectural tones — clearly defined against both day and night skies
  const buildingBase = isDay
    ? isSunsetish
      ? '#3b2539'
      : '#2d3f58'
    : '#162032';

  const buildingTrim = isDay
    ? isSunsetish
      ? '#5c3959'
      : '#476388'
    : '#253550';

  const buildingOutline = isDay
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(96, 165, 250, 0.25)';

  // Window colors
  const litWindow = isDay
    ? 'rgba(191, 219, 254, 0.75)'
    : '#fbbf24';

  const dimWindow = isDay
    ? 'rgba(147, 197, 253, 0.35)'
    : '#1e293b';

  // Tree colors
  const treeFar = isDay
    ? isSunsetish ? '#244030' : '#1e5436'
    : '#0b1d14';

  const treeNear = isDay
    ? isSunsetish ? '#336142' : '#227849'
    : '#112b1d';

  const treeHighlight = isDay
    ? isSunsetish ? '#4c825b' : '#349e62'
    : '#1a3e2a';

  return (
    <g className="pointer-events-none">
      {/* ── DISTANT HORIZON RIDGE ── */}
      <path
        d="M 170 160 Q 220 142, 270 148 Q 320 134, 370 144 Q 410 136, 440 146 L 440 180 L 170 180 Z"
        fill={isDay ? (isSunsetish ? '#261b30' : '#20324c') : '#0a101c'}
        opacity={isDay ? 0.5 : 0.8}
      />

      {/* ── DISTANT CAMPUS TREES (Backdrop) ── */}
      <g fill={treeFar} opacity={0.85}>
        <ellipse cx="232" cy="144" rx="16" ry="22" />
        <ellipse cx="254" cy="147" rx="14" ry="20" />
        <ellipse cx="278" cy="142" rx="18" ry="24" />
        <ellipse cx="424" cy="140" rx="20" ry="26" />
      </g>

      {/* ── MAIN ACADEMIC BUILDING (IRE Department Campus Wing) ── */}
      <g>
        {/* Main 4-story building facade */}
        <rect
          x="332" y="84" width="94" height="96" rx="3"
          fill={buildingBase}
          stroke={buildingOutline}
          strokeWidth="1"
        />

        {/* Roofline architectural cornice */}
        <rect x="328" y="82" width="102" height="5" rx="1.5" fill={buildingTrim} />

        {/* Rooftop HVAC & Antenna */}
        <rect x="346" y="74" width="20" height="9" rx="1.5" fill={buildingTrim} />
        <line x1="356" y1="74" x2="356" y2="65" stroke={buildingTrim} strokeWidth="1.4" />
        <circle cx="356" cy="65" r="1.5" fill={isDay ? '#ef4444' : '#f87171'} />

        {/* Floor ledges / architectural mullions */}
        <rect x="332" y="104" width="94" height="2.5" fill={buildingTrim} />
        <rect x="332" y="124" width="94" height="2.5" fill={buildingTrim} />
        <rect x="332" y="144" width="94" height="2.5" fill={buildingTrim} />

        {/* Windows Grid — Floor 4 */}
        <rect x="338" y="90" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="352" y="90" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="366" y="90" width="8" height="10" rx="1.2" fill={dimWindow} />
        <rect x="380" y="90" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="394" y="90" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="408" y="90" width="8" height="10" rx="1.2" fill={dimWindow} />

        {/* Windows Grid — Floor 3 */}
        <rect x="338" y="110" width="8" height="10" rx="1.2" fill={dimWindow} />
        <rect x="352" y="110" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="366" y="110" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="380" y="110" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="394" y="110" width="8" height="10" rx="1.2" fill={dimWindow} />
        <rect x="408" y="110" width="8" height="10" rx="1.2" fill={litWindow} />

        {/* Windows Grid — Floor 2 */}
        <rect x="338" y="130" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="352" y="130" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="366" y="130" width="8" height="10" rx="1.2" fill={dimWindow} />
        <rect x="380" y="130" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="394" y="130" width="8" height="10" rx="1.2" fill={litWindow} />
        <rect x="408" y="130" width="8" height="10" rx="1.2" fill={litWindow} />

        {/* Secondary Left Lecture Wing */}
        <rect
          x="284" y="102" width="52" height="78" rx="2"
          fill={buildingBase}
          stroke={buildingOutline}
          strokeWidth="1"
        />
        <rect x="282" y="100" width="56" height="3.5" rx="1" fill={buildingTrim} />
        <rect x="284" y="122" width="52" height="2" fill={buildingTrim} />

        <rect x="290" y="107" width="7" height="9" rx="1" fill={litWindow} />
        <rect x="302" y="107" width="7" height="9" rx="1" fill={litWindow} />
        <rect x="314" y="107" width="7" height="9" rx="1" fill={dimWindow} />
        <rect x="290" y="127" width="7" height="9" rx="1" fill={litWindow} />
        <rect x="302" y="127" width="7" height="9" rx="1" fill={dimWindow} />
        <rect x="314" y="127" width="7" height="9" rx="1" fill={litWindow} />

        {/* Window warm light spills at night */}
        {!isDay && (
          <g fill="rgba(251, 191, 36, 0.22)">
            <circle cx="356" cy="95" r="14" />
            <circle cx="384" cy="115" r="15" />
            <circle cx="356" cy="135" r="14" />
            <circle cx="412" cy="135" r="14" />
            <circle cx="294" cy="111" r="12" />
          </g>
        )}
      </g>

      {/* ── FOREGROUND LUSH TREES & CAMPUS GARDEN ── */}
      <g>
        {/* Tree cluster near lecture wing */}
        <ellipse cx="262" cy="132" rx="20" ry="30" fill={treeNear} />
        <ellipse cx="266" cy="126" rx="14" ry="18" fill={treeHighlight} opacity={0.65} />
        <ellipse cx="278" cy="138" rx="16" ry="24" fill={treeFar} />
        <ellipse cx="248" cy="142" rx="15" ry="22" fill={treeNear} />
        <rect x="260" y="156" width="4.5" height="20" rx="1" fill="#141a24" />

        {/* Tree cluster framing right edge */}
        <ellipse cx="426" cy="128" rx="18" ry="30" fill={treeNear} />
        <ellipse cx="430" cy="122" rx="12" ry="18" fill={treeHighlight} opacity={0.65} />
        <ellipse cx="438" cy="136" rx="15" ry="24" fill={treeFar} />
        <rect x="425" y="154" width="4" height="22" rx="1" fill="#141a24" />
      </g>

      {/* ── CAMPUS ROADWAY / GROUND LINE ── */}
      <rect
        x="0"
        y="166"
        width="440"
        height="16"
        fill={isDay ? '#182436' : '#080d18'}
      />

      {/* Warm campus pathway lampposts at night */}
      {!isDay && (
        <g>
          {/* Lamppost 1 */}
          <line x1="282" y1="154" x2="282" y2="168" stroke="#475569" strokeWidth="1.2" />
          <circle cx="282" cy="154" r="2.2" fill="#fef08a" />
          <circle cx="282" cy="154" r="9" fill="rgba(253, 224, 71, 0.28)" />

          {/* Lamppost 2 */}
          <line x1="334" y1="154" x2="334" y2="168" stroke="#475569" strokeWidth="1.2" />
          <circle cx="334" cy="154" r="2.2" fill="#fef08a" />
          <circle cx="334" cy="154" r="9" fill="rgba(253, 224, 71, 0.28)" />
        </g>
      )}
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

      {/* Layer 2: Ambient Celestial Glow */}
      <div
        className="absolute inset-0 transition-all duration-[2500ms]"
        style={{
          background: (() => {
            const body = env.isDay ? env.sun : env.moon;
            if (!body.visible) return 'none';
            const glowOpStr = env.sky.glowColor.replace('VAR', String(env.sky.glowOpacity));
            return `radial-gradient(ellipse 180px 140px at ${body.x * 100}% ${body.y * 100}%, ${glowOpStr}, transparent 75%)`;
          })(),
        }}
      />

      {/* Layer 3–6: SVG Canvas (Stars, Celestial Bodies, Clouds, Campus Landscape) */}
      <svg
        viewBox="0 0 440 180"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
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
        <CloudLayer condition={condition} isDay={env.isDay} />

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
           while allowing the rich sky and campus scenery to shine on the right */}
      <div
        className="absolute inset-y-0 left-0 w-[58%] pointer-events-none transition-all duration-1000"
        style={{
          background: `linear-gradient(to right,
            rgba(6, 10, 18, 0.95) 0%,
            rgba(8, 14, 24, 0.90) 45%,
            rgba(10, 18, 30, 0.55) 75%,
            rgba(12, 20, 34, 0.15) 90%,
            transparent 100%)`,
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 8,
        }}
      />
    </div>
  );
}
