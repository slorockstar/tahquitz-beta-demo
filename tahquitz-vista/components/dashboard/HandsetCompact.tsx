'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DevPanel from './HandsetDevPanel';

/* =========================================================
   TAHQUITZ "MERIDIAN" — compact 2″×5″ corded handset
   One SKU, three cabin tiers (software skins).

   Hardware (5 shaped glass keys over a full-face, non-touch display):
     ┌──────── [POWER / SLEEP] ────────┐   ← mechanical, top edge
     │                                 │
     │          DISPLAY ZONE           │
     │                                 │ ┃ CALL (mechanical, right edge)
     │ ┌────┐   ╭──────╮   ┌──┐        │
     │ │MENU│   │  ORB │   │  │ VOLUME │
     │ └────┘   ╰──────╯   │  │ BLADE  │
     │ ┌────┐  ‹═ SCRUB ═› │  │ (rocker│
     │ │LIGHT│             │  │  + / −)│
     │ └────┘              └──┘        │
     └─────────────── cord ────────────┘
   • Volume Blade  – tall rocker under the right thumb; display renders a liquid level inside it.
   • Orb           – hero play/pause/select key, round so it's findable by feel.
   • Scrub pill    – horizontal rocker: left half ‹, right half ›.
   • Menu / Light  – ancillary keys, lower-left (less frequent, out of the thumb's main arc).
   • Every key's legend is drawn by the display under the glass, so it changes by context.
   ========================================================= */

export type Tier = 'economy' | 'premium' | 'business';
export type Kind = 'Movies' | 'TV' | 'Music';
export type Item = { kind: Kind; title: string; sub: string; art: string; hue: number; duration: number; chapters: string[] };
export type Library = Record<Kind, Item[]>;

export const LIBRARY: Library = {
  Movies: [
    { kind: 'Movies', title: 'Last Light', sub: 'Sci-Fi · 2h 18m · PG-13', art: '/handset/last_light.jpg', hue: 28, duration: 8280, chapters: ['Launch', 'Drift', 'Ice Ridge', 'Signal', 'Sunrise'] },
    { kind: 'Movies', title: 'Harbor Lights', sub: 'Romance · 1h 52m · PG', art: '/handset/harbor_lights.jpg', hue: 340, duration: 6720, chapters: ['Arrival', 'The Tram', 'Rain', 'Fado Night', 'Goodbye?'] },
  ],
  TV: [
    { kind: 'TV', title: 'Deep Blue', sub: 'S1 · E3 “The Breach”', art: '/handset/deep_blue_tv.jpg', hue: 205, duration: 3120, chapters: ['Cold Open', 'Migration', 'The Breach', 'Below'] },
    { kind: 'TV', title: 'Still Waters', sub: 'Docuseries · E1', art: '/handset/still_waters.jpg', hue: 182, duration: 2880, chapters: ['Dawn', 'Fjords', 'Reflection'] },
  ],
  Music: [
    { kind: 'Music', title: 'Velvet Horizon', sub: 'Amara Sol', art: '/handset/velvet_horizon.jpg', hue: 28, duration: 236, chapters: ['Verse', 'Chorus', 'Bridge', 'Chorus'] },
    { kind: 'Music', title: 'Neon Meridian', sub: 'Kōdo Drift', art: '/handset/neon_meridian.jpg', hue: 300, duration: 284, chapters: ['Intro', 'Build', 'Drop', 'Outro'] },
    { kind: 'Music', title: 'Blue Hour at FL410', sub: 'The Ellison Quartet', art: '/handset/midnight_altitude.jpg', hue: 222, duration: 318, chapters: ['Head', 'Sax Solo', 'Piano Solo', 'Outro'] },
  ],
};
export const KINDS: Kind[] = ['Movies', 'TV', 'Music'];
const KIND_ICON: Record<Kind, string> = { Movies: '🎬', TV: '📺', Music: '♪' };
const SLEEP_STEPS = [0, 15, 30, 60];
const fmt = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60);
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
};

type OsdK = 'vol' | 'seek' | 'play' | 'sent' | 'sleep' | 'light';
export type Mood = 'auto' | 'day' | 'sunset' | 'night' | 'dark';
const resolveMood = (m: Mood): Exclude<Mood, 'auto'> => {
  if (m !== 'auto') return m;
  const hr = new Date().getHours();
  return hr >= 6 && hr < 17 ? 'day' : hr >= 17 && hr < 20 ? 'sunset' : 'night';
};
// Logo palette per cabin mood: [from, to] hues + lightness
const MOOD_STYLE: Record<Exclude<Mood, 'auto'>, { a: number; b: number; l: number; label: string }> = {
  day: { a: 190, b: 45, l: 70, label: 'Day' },
  sunset: { a: 20, b: 330, l: 66, label: 'Sunset' },
  night: { a: 250, b: 200, l: 68, label: 'Night' },
  dark: { a: 0, b: 25, l: 45, label: 'Cabin dark' }, // red/amber keeps night vision
};

/* ---------- Theme tokens (editable live in Developer mode) ---------- */
export type Theme = { primary: string; secondary: string; followArt: boolean; logoUrl: string | null; airline: string; font: string };
export const DEFAULT_THEME: Theme = { primary: '#38bdf8', secondary: '#f59e0b', followArt: true, logoUrl: null, airline: 'Tahquitz', font: 'Inter, system-ui, sans-serif' };
export const hexHue = (hex: string) => {
  const m = hex.replace('#', '').match(/.{2}/g); if (!m) return 200;
  const [r, g, b] = m.map((x) => parseInt(x, 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  const hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round(hh * 60 + 360) % 360;
};

/* ---------- Airline mark, rendered by the display (lower-left) ---------- */
function AirlineLogo({ tier, mood, asleep, light, theme }: { tier: Tier; mood: Exclude<Mood, 'auto'>; asleep: boolean; light: boolean; theme: Theme }) {
  const s = theme.followArt ? MOOD_STYLE[mood] : { ...MOOD_STYLE[mood], a: hexHue(theme.primary), b: hexHue(theme.secondary) };
  const dim = asleep ? 0.25 : mood === 'dark' ? 0.55 : 1;
  const id = `lg-${tier}`;
  const mono = tier === 'economy';
  return (
    <motion.div className="absolute z-40 left-[40px] top-[446px] w-[70px] flex flex-col items-center pointer-events-none"
      animate={{ opacity: mono ? (mood === 'night' || mood === 'dark' || asleep ? 0.35 : 0.7) : asleep ? [0.15, 0.35, 0.15] : dim }}
      transition={asleep ? { duration: 4, repeat: Infinity } : { duration: 1.2 }}>
      {light && !mono && (
        <motion.span className="absolute -inset-2 rounded-full blur-md" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
          style={{ background: 'radial-gradient(circle, rgba(255,200,130,.6), transparent 70%)' }} />
      )}
      {theme.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={theme.logoUrl} alt={theme.airline} className={`relative max-h-[26px] max-w-[64px] object-contain ${mono ? 'grayscale brightness-200' : ''}`} />
      ) : (
      <svg viewBox="0 0 32 24" width="34" height="26" className="relative overflow-visible">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <motion.stop offset="0%" animate={{ stopColor: mono ? '#fff' : `hsl(${s.a} 80% ${s.l}%)` }} transition={{ duration: 1.5 }} />
            <motion.stop offset="100%" animate={{ stopColor: mono ? '#fff' : `hsl(${s.b} 85% ${s.l}%)` }} transition={{ duration: 1.5 }} />
          </linearGradient>
          {tier === 'business' && (
            <linearGradient id={`${id}-sh`} x1="0" x2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity=".8" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          )}
          <clipPath id={`${id}-clip`}><path d="M1 21 L11 5 L16 13 L19.5 8 L31 21 Z" /></clipPath>
        </defs>
        {/* Tahquitz peak + wing swoosh */}
        <path d="M1 21 L11 5 L16 13 L19.5 8 L31 21 Z" fill={`url(#${id})`} />
        <motion.path d="M0 19 Q14 12 32 15" stroke={`url(#${id})`} strokeWidth="1.6" fill="none" strokeLinecap="round"
          animate={tier === 'business' && !asleep ? { pathLength: [0.2, 1, 1], opacity: [0.4, 1, 0.4] } : { pathLength: 1 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
        {tier === 'business' && !asleep && (
          <g clipPath={`url(#${id}-clip)`}>
            <motion.rect y="0" width="10" height="24" fill={`url(#${id}-sh)`} animate={{ x: [-12, 34] }} transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }} />
          </g>
        )}
        {mood === 'night' && !mono && !asleep && [[4, 3], [26, 4], [29, 9]].map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r=".9" fill="white" animate={{ opacity: [0.1, 1, 0.1] }} transition={{ duration: 2.4, delay: i * 0.7, repeat: Infinity }} />
        ))}
      </svg>
      )}
      <span className="relative text-[7px] font-semibold tracking-[.25em] mt-0.5 uppercase whitespace-nowrap" style={{ color: mono ? '#fff' : `hsl(${s.a} 60% ${s.l + 10}%)`, transition: 'color 1.5s' }}>{theme.airline}</span>
    </motion.div>
  );
}

/* ---------- Realistic music visualizer (smoothed spectrum, beat-weighted) ---------- */
function MusicBars({ playing, hue, gradient }: { playing: boolean; hue: number; gradient: boolean }) {
  const N = 28;
  const [lv, setLv] = useState<number[]>(() => Array(N).fill(0.05));
  const ph = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      ph.current += 0.09;
      const t = ph.current;
      const beat = Math.exp(-(((performance.now() - start) % 600) / 600) * 6);
      const env = 0.6 + 0.25 * Math.sin(t * 0.33) + 0.1 * Math.sin(t * 1.4);
      setLv((p) => p.map((v, i) => {
        if (!playing) return v * 0.85;
        const f = i / N;
        const tgt = Math.min(1, env * (1 - f * 0.65) * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * (1.2 + f * 3) + i * 0.8))) * (0.85 + Math.random() * 0.3) + (f < 0.25 ? beat * 0.35 : 0));
        return v + (tgt - v) * (tgt > v ? 0.5 : 0.16);
      }));
    }, 80);
    return () => clearInterval(id);
  }, [playing]);
  return (
    <div className="flex items-end gap-[2px] h-9 mt-2">
      {lv.map((v, i) => (
        <div key={i} className="flex-1 rounded-full" style={{ height: `${Math.max(6, v * 100)}%`, transition: 'height 80ms linear',
          background: gradient ? `linear-gradient(to top, hsl(${hue + (i / N) * 150} 85% 62%), hsl(${hue + (i / N) * 150 + 40} 85% 75% / .35))` : `hsl(${hue} 55% 72% / .6)` }} />
      ))}
    </div>
  );
}

/* =========================================================
   Engine
   ========================================================= */
function useHandset(lib: Library, initial: Item) {
  const [playing, setPlaying] = useState<Item>(initial);
  const [pos, setPos] = useState(initial.kind === 'Music' ? 52 : 2710);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(6);
  const [menu, setMenu] = useState(false);
  const [cat, setCat] = useState(0);
  const [idx, setIdx] = useState(0);
  const [osd, setOsd] = useState<{ k: OsdK; n: number } | null>(null);
  const [call, setCall] = useState(false);
  const [light, setLight] = useState(false);
  const [asleep, setAsleep] = useState(false);
  const [sleepStep, setSleepStep] = useState(0);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const osdT = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setPos((p) => (p + 1) % playing.duration), 1000);
    return () => clearInterval(id);
  }, [isPlaying, playing]);

  const flash = (k: OsdK) => {
    setOsd({ k, n: Date.now() });
    if (osdT.current) clearTimeout(osdT.current);
    osdT.current = setTimeout(() => setOsd(null), 1500);
  };
  const bumpIdle = () => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => setMenu(false), 9000);
  };
  const wakeRef = useRef<() => boolean>(() => false);
  const [dimmed, setDimmed] = useState(false);
  const dimRef = useRef(false);
  const dimT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touch = () => {
    if (dimT.current) clearTimeout(dimT.current);
    dimT.current = setTimeout(() => { dimRef.current = true; setDimmed(true); }, 10000); // backlight timeout: 10s after last interaction
  };
  useEffect(() => { touch(); return () => { if (dimT.current) clearTimeout(dimT.current); }; }, []);
  const wake = () => {
    touch();
    if (asleep) { setAsleep(false); return true; }
    if (dimRef.current) { dimRef.current = false; setDimmed(false); return true; } // first press only wakes
    return false;
  };
  wakeRef.current = wake;

  const vol = (d: 1 | -1) => {
    if (wake()) return;
    if (menu) { bumpIdle(); setCat((c) => (c - d + KINDS.length) % KINDS.length); setIdx(0); return; }
    setVolume((v) => Math.max(0, Math.min(10, v + d))); flash('vol');
  };
  const scrub = (d: 1 | -1) => {
    if (wake()) return;
    if (menu) { bumpIdle(); const n = Math.max(1, lib[KINDS[cat]].length); setIdx((i) => (i + d + n) % n); return; }
    const step = playing.kind === 'Music' ? 10 : 30;
    setPos((p) => Math.max(0, Math.min(playing.duration - 1, p + d * step))); flash('seek');
  };
  const orb = () => {
    if (wake()) return;
    if (menu) { const it = lib[KINDS[cat]][idx]; if (!it) return; setPlaying(it); setPos(0); setIsPlaying(true); setMenu(false); flash('sent'); return; }
    setIsPlaying((x) => !x); flash('play');
  };
  const menuKey = () => {
    if (wake()) return;
    if (!menu) { setCat(KINDS.indexOf(playing.kind)); setIdx(Math.max(0, lib[playing.kind].findIndex((x) => x.title === playing.title))); bumpIdle(); }
    setMenu((m) => !m);
  };
  const lightKey = () => { if (wake()) return; setLight((l) => !l); flash('light'); };
  const powerTap = () => { if (wake()) return; setSleepStep((s) => (s + 1) % SLEEP_STEPS.length); flash('sleep'); };
  const powerHold = () => setAsleep((a) => !a);

  return {
    playing, pos, isPlaying, volume, menu, cat, idx, osd, call, light, asleep, sleepStep, dimmed,
    vol, scrub, orb, menuKey, lightKey, powerTap, powerHold, wake, toggleCall: () => { wake(); setCall((c) => !c); },
  };
}
type H = ReturnType<typeof useHandset>;

/* =========================================================
   Business: living gradient mesh
   ========================================================= */
function GradientMesh({ hue, intensity = 1 }: { hue: number; intensity?: number }) {
  const blobs = [
    { h: hue, x: ['-20%', '30%', '-10%'], y: ['-10%', '20%', '-10%'], d: 14, s: '90%' },
    { h: hue + 60, x: ['40%', '0%', '40%'], y: ['30%', '60%', '30%'], d: 18, s: '80%' },
    { h: hue + 150, x: ['10%', '50%', '10%'], y: ['70%', '40%', '70%'], d: 22, s: '85%' },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {blobs.map((b, i) => (
        <motion.div key={i} className="absolute w-[140%] aspect-square rounded-full blur-3xl"
          animate={{ x: b.x, y: b.y }} transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(circle, hsl(${b.h} 75% 55% / ${0.45 * intensity}), transparent 60%)`, transition: 'background 1.5s' }} />
      ))}
    </div>
  );
}

/* =========================================================
   Shaped glass key (generic)
   ========================================================= */
function Glass({ tier, hue, shape, style, children, onPress, onHold, label, under, dim = false }: {
  tier: Tier; hue: number; shape: 'orb' | 'blade' | 'pill' | 'squircle'; style: React.CSSProperties;
  children?: React.ReactNode; onPress: (e: React.PointerEvent<HTMLButtonElement>) => void; onHold?: () => void; label: string; under?: React.ReactNode; dim?: boolean;
}) {
  const [flash, setFlash] = useState<{ n: number; x: number; y: number } | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const radius = shape === 'orb' ? '9999px' : shape === 'pill' ? '9999px' : shape === 'blade' ? '26px' : '18px';

  const down = (e: React.PointerEvent<HTMLButtonElement>) => {
    held.current = false;
    if (onHold) t.current = setTimeout(() => { held.current = true; onHold(); }, 600);
    const r = e.currentTarget.getBoundingClientRect();
    setFlash({ n: Date.now(), x: e.clientX - r.left, y: e.clientY - r.top });
  };
  const up = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (t.current) clearTimeout(t.current);
    if (!held.current) onPress(e);
  };

  const inner = (
    <motion.button aria-label={label} whileTap={{ scale: shape === 'blade' ? 0.97 : 0.92 }}
      onPointerDown={down} onPointerUp={up} onPointerLeave={() => t.current && clearTimeout(t.current)}
      className="relative w-full h-full flex items-center justify-center text-white select-none overflow-hidden"
      style={{ borderRadius: radius,
        background: tier === 'economy' ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.05)',
        boxShadow: tier === 'economy' ? 'inset 0 0 0 1.5px rgba(255,255,255,.35)' : 'inset 0 1px 1px rgba(255,255,255,.5), inset 0 0 0 1px rgba(255,255,255,.18), 0 8px 16px rgba(0,0,0,.45)' }}>
      {under}
      {/* press ripple from the exact contact point */}
      <AnimatePresence>
        {flash && (
          <motion.span key={flash.n} className="absolute rounded-full pointer-events-none"
            style={{ left: flash.x - 40, top: flash.y - 40, width: 80, height: 80,
              background: tier === 'economy' ? 'rgba(255,255,255,.5)' : `radial-gradient(circle, hsl(${hue} 80% 75%), hsl(${hue + 60} 80% 60% / 0) 70%)` }}
            initial={{ scale: 0.2, opacity: 0.9 }} animate={{ scale: tier === 'economy' ? 1.2 : 2.2, opacity: 0 }} transition={{ duration: tier === 'economy' ? 0.25 : 0.6 }} />
        )}
      </AnimatePresence>
      {tier !== 'economy' && <span className="absolute inset-x-[18%] top-[5%] h-[30%] rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />}
      <span className="relative flex flex-col items-center justify-center w-full h-full transition-opacity duration-700" style={{ opacity: dim ? 0.25 : 1 }}>{children}</span>
    </motion.button>
  );

  // Business: animated conic gradient rim around every key
  if (tier === 'business') {
    return (
      <div className="absolute p-[1.5px] overflow-hidden" style={{ ...style, borderRadius: radius }}>
        <motion.div className="absolute -inset-[60%]" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ background: `conic-gradient(from 0deg, hsl(${hue} 85% 65%), hsl(${hue + 60} 85% 65%), hsl(${hue + 150} 85% 65%), hsl(${hue} 85% 65%))`, opacity: 0.75 }} />
        <div className="relative w-full h-full bg-black/55 backdrop-blur-sm" style={{ borderRadius: radius }}>{inner}</div>
      </div>
    );
  }
  return <div className="absolute" style={style}>{inner}</div>;
}

/* =========================================================
   One handset
   ========================================================= */
export function Handset({ tier, label, tagline, mood, theme, lib }: { tier: Tier; label: string; tagline: string; mood: Mood; theme: Theme; lib: Library }) {
  const h = useHandset(lib, (tier === 'economy' ? lib.Movies[0] : lib.Music[tier === 'business' ? 1 : 0]) ?? lib.Music[0] ?? lib.Movies[0] ?? LIBRARY.Music[0]);
  const m = resolveMood(mood);
  // Liquid volume: remember direction of last change so the surface can slosh
  const prevVol = useRef(h.volume);
  const [slosh, setSlosh] = useState({ d: 0, n: 0 });
  useEffect(() => {
    if (h.volume !== prevVol.current) { setSlosh({ d: Math.sign(h.volume - prevVol.current), n: Date.now() }); prevVol.current = h.volume; }
  }, [h.volume]);
  const hue = theme.followArt ? h.playing.hue : hexHue(theme.primary);
  // Cabin mood re-tints the living gradient (Business) and the whole panel
  const meshHue = m === 'day' ? hue : MOOD_STYLE[m].a;
  const moodFilter = m === 'night' ? 'brightness(.82) saturate(.9)' : m === 'dark' ? 'brightness(.55) sepia(.55) hue-rotate(-25deg) saturate(1.6)' : m === 'sunset' ? 'saturate(1.15)' : 'none';
  const pct = h.pos / h.playing.duration;
  const chapter = h.playing.chapters[Math.min(h.playing.chapters.length - 1, Math.floor(pct * h.playing.chapters.length))];
  const list = lib[KINDS[h.cat]];
  const item = list[h.idx] ?? { kind: KINDS[h.cat], title: 'Nothing here yet', sub: 'Add titles in Developer mode', art: '', hue: 220, duration: 1, chapters: [''] };
  const pwrT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pwrHeld = useRef(false);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    const act: Record<string, () => void> = {
      arrowup: () => h.vol(1), arrowdown: () => h.vol(-1), arrowleft: () => h.scrub(-1), arrowright: () => h.scrub(1),
      enter: h.orb, ' ': h.orb, m: h.menuKey, l: h.lightKey, c: h.toggleCall, p: h.powerTap, s: h.powerHold,
    };
    if (act[k]) { act[k](); e.preventDefault(); }
  }, [h]);

  const gradText = tier === 'business'
    ? { backgroundImage: `linear-gradient(90deg, #fff, hsl(${hue + 40} 90% 85%), hsl(${hue} 90% 80%))`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } as React.CSSProperties
    : {};
  const accent = tier === 'economy' ? '#fff' : `hsl(${hue} 65% 72%)`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-center">
        <p className="text-sm font-semibold text-white tracking-wide">{label}</p>
        <p className="text-[11px] text-white/45">{tagline}</p>
      </div>

      <div className="relative mt-3" style={{ width: 200, height: 500 }}>
        {/* POWER / SLEEP — mechanical, top edge */}
        <motion.button aria-label="Power / sleep" whileTap={{ y: 2 }}
          onPointerDown={() => { pwrHeld.current = false; pwrT.current = setTimeout(() => { pwrHeld.current = true; h.powerHold(); }, 700); }}
          onPointerUp={() => { if (pwrT.current) clearTimeout(pwrT.current); if (!pwrHeld.current) h.powerTap(); }}
          className={`absolute left-1/2 -translate-x-1/2 -top-[8px] w-[46px] h-[9px] rounded-t-md border border-black/60 z-10
            ${h.asleep ? 'bg-amber-300/80 shadow-[0_0_10px_rgba(252,211,77,.7)]' : 'bg-gradient-to-r from-[#3a3d44] via-[#55585f] to-[#3a3d44]'}`} />
        <span className="absolute left-1/2 -translate-x-1/2 -top-6 text-[9px] text-white/40 uppercase tracking-widest whitespace-nowrap">Power · hold = sleep</span>

        {/* CALL — mechanical, right edge */}
        <motion.button aria-label="Call attendant" whileTap={{ x: -3 }} onClick={h.toggleCall}
          className={`absolute -right-[8px] top-[110px] w-[9px] h-[56px] rounded-r-md border border-black/60 z-10
            ${h.call ? 'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,.9)]' : 'bg-gradient-to-b from-[#3a3d44] via-[#55585f] to-[#3a3d44]'}`} />
        <span className="absolute -right-[22px] top-[118px] text-[9px] text-white/40 uppercase tracking-widest [writing-mode:vertical-rl]">Call</span>

        {/* Cord */}
        <svg className="absolute left-1/2 -translate-x-1/2 top-full" width="40" height="70" viewBox="0 0 40 70">
          <path d="M20 0 C 5 10, 35 15, 20 25 C 5 35, 35 40, 20 50 C 5 60, 35 65, 20 70" stroke="#2a2c31" strokeWidth="5" fill="none" />
        </svg>

        {/* BODY */}
        <div tabIndex={0} onKeyDown={onKey} style={{ filter: moodFilter, transition: 'filter 1.5s', fontFamily: theme.font }}
          className="relative w-full h-full rounded-[32px] overflow-hidden bg-black ring-[5px] ring-[#1c1d21] shadow-[0_25px_50px_rgba(0,0,0,.7)] outline-none focus-visible:ring-sky-500/60">

          {/* Backgrounds */}
          {tier === 'premium' && <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, hsl(${hue} 35% 17%), #050507 72%)`, transition: 'background 1.5s' }} />}
          {tier === 'business' && (
            <>
              <GradientMesh hue={meshHue} intensity={h.asleep ? 0.25 : h.dimmed ? 0.45 : 1} />
              <AnimatePresence>
                {!h.menu && (
                  <motion.img key={h.playing.art} src={h.playing.art} alt="" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: h.dimmed ? 0.1 : 0.45, scale: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }} className="absolute inset-x-0 top-0 w-full h-[58%] object-cover mix-blend-luminosity"
                    style={{ maskImage: 'linear-gradient(black 40%, transparent)' }} />
                )}
              </AnimatePresence>
            </>
          )}
          {h.light && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-x-0 top-0 h-24 pointer-events-none"
            style={{ background: tier === 'economy' ? 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.18), transparent 70%)' : `radial-gradient(ellipse at 50% 0%, hsl(${hue} 70% 75% / .3), transparent 70%)` }} />}
          {/* Cabin mood wash */}
          <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: m === 'day' ? 0 : 1 }} transition={{ duration: 1.5 }}
            style={{ background: m === 'sunset' ? 'linear-gradient(180deg, rgba(255,120,60,.22), rgba(255,60,140,.12) 60%, transparent)'
              : m === 'night' ? 'linear-gradient(180deg, rgba(40,50,140,.35), rgba(10,10,40,.25))' : m === 'dark' ? 'rgba(60,0,0,.25)' : 'transparent', mixBlendMode: 'screen' }} />

          {/* ---------- DISPLAY ZONE ---------- */}
          <div id={`now-playing-${tier}`} onPointerDown={() => h.wake()} className="absolute inset-x-0 top-0 h-[272px] px-4 pt-4 flex flex-col cursor-pointer"
            style={{ opacity: h.dimmed ? 0.2 : 1, transition: h.dimmed ? 'opacity .9s ease' : 'opacity .25s ease' }}>
            <div className="flex justify-between items-center text-[10px] text-white/50 uppercase tracking-widest">
              <span>32C</span>
              <span className="flex items-center gap-1.5">
                {SLEEP_STEPS[h.sleepStep] > 0 && <span>☾ {SLEEP_STEPS[h.sleepStep]}m</span>}
                {h.light && <span style={{ color: accent }}>●</span>}
                <span>{h.menu ? 'Browse' : 'Seatback'}</span>
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!h.menu ? (
                <motion.div key={'now' + h.playing.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col justify-end pb-1">
                  {tier === 'economy' && <p className="text-3xl mb-2">{KIND_ICON[h.playing.kind]}</p>}
                  {tier === 'premium' && <img src={h.playing.art} alt="" className="w-20 h-20 rounded-xl object-cover mb-3 shadow-lg" />}
                  {tier === 'business' && (
                    <AnimatePresence mode="wait">
                      <motion.p key={chapter} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] uppercase tracking-[.2em] mb-1 font-medium" style={{ color: accent }}>
                        {h.playing.kind === 'Music' ? chapter : `Ch · ${chapter}`}
                      </motion.p>
                    </AnimatePresence>
                  )}
                  <p className="text-[23px] font-semibold text-white leading-tight" style={gradText}>{h.playing.title}</p>
                  <p className="text-[13px] text-white/60 mt-0.5">{h.playing.sub}</p>

                  {tier === 'economy' ? (
                    <p className="text-[14px] text-white/80 mt-3 font-mono">{fmt(h.pos)} / {fmt(h.playing.duration)}</p>
                  ) : (
                    <div className="mt-3">
                      <div className="relative h-[5px] rounded-full bg-white/15 overflow-hidden">
                        {tier === 'business' && h.playing.chapters.map((_, i) => i > 0 && (
                          <span key={i} className="absolute inset-y-0 w-[2px] bg-black/70 z-10" style={{ left: `${(i / h.playing.chapters.length) * 100}%` }} />
                        ))}
                        <motion.div className="absolute inset-y-0 left-0 rounded-full" animate={{ width: `${pct * 100}%` }} transition={{ ease: 'linear', duration: 1 }}
                          style={{ background: tier === 'business' ? `linear-gradient(90deg, hsl(${hue} 85% 65%), hsl(${hue + 60} 85% 70%), hsl(${hue + 150} 85% 70%))` : accent,
                            backgroundSize: '200% 100%' }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-white/55 font-mono mt-1"><span>{fmt(h.pos)}</span><span>-{fmt(h.playing.duration - h.pos)}</span></div>
                      {h.playing.kind === 'Music' && <MusicBars playing={h.isPlaying} hue={hue} gradient={tier === 'business'} />}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col pt-2 min-h-0">
                  {/* Category stack (driven by the volume blade in menu) */}
                  <div className="flex gap-3 mb-2">
                    {KINDS.map((k, i) => (
                      <motion.span key={k} animate={{ opacity: i === h.cat ? 1 : 0.35 }} className="text-[14px] font-semibold text-white relative">
                        {k}
                        {i === h.cat && <motion.span layoutId={`cat-${tier}`} className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full" style={{ background: accent }} />}
                      </motion.span>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div key={KINDS[h.cat] + h.idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}
                      className="flex-1 flex flex-col min-h-0">
                      {tier === 'economy' ? (
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-[24px] font-semibold text-white leading-tight">{item.title}</p>
                          <p className="text-[14px] text-white/60">{item.sub}</p>
                        </div>
                      ) : (
                        <>
                          <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden">
                            {item.art ? <img src={item.art} alt="" className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, hsl(${item.hue} 50% 30%), #050507)` }} />}
                            {tier === 'business' && <motion.div className="absolute inset-0" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 5, repeat: Infinity }}
                              style={{ background: `linear-gradient(160deg, transparent 40%, hsl(${item.hue} 80% 50% / .5))` }} />}
                          </div>
                          <p className="text-[18px] font-semibold text-white leading-tight mt-2 truncate" style={gradText}>{item.title}</p>
                          <p className="text-[12px] text-white/60 truncate">{item.sub}</p>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  <div className="flex justify-center gap-1.5 pt-1.5">
                    {list.map((_, i) => <motion.span key={i} className="h-1.5 rounded-full" style={{ background: accent }} animate={{ width: i === h.idx ? 14 : 6, opacity: i === h.idx ? 1 : 0.3 }} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ---------- KEY ZONE ---------- */}
          {/* Lower-left ancillary: MENU (context: Back) */}
          <Glass tier={tier} hue={hue} shape="squircle" label={h.menu ? 'Back' : 'Menu'} onPress={h.menuKey}
            style={{ left: 10, top: 300, width: 46, height: 62 }}>
            <AnimatePresence mode="wait">
              <motion.span key={String(h.menu)} initial={{ opacity: 0, rotate: -30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} className="text-[20px] leading-none">{h.menu ? '↩' : '☰'}</motion.span>
            </AnimatePresence>
            <span className="text-[9px] text-white/60 mt-1">{h.menu ? 'Back' : 'Menu'}</span>
          </Glass>

          {/* Lower-left ancillary: LIGHT */}
          {/* Light key: "on" uses the same accent language as every other key (no off-palette yellow) */}
          <Glass tier={tier} hue={hue} shape="squircle" label="Reading light" onPress={h.lightKey} dim={h.dimmed}
            style={{ left: 10, top: 372, width: 46, height: 62 }}
            under={h.light && tier !== 'economy' ? <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
              style={{ background: tier === 'business'
                ? `radial-gradient(circle at 50% 38%, hsl(${hue} 85% 72% / .55), hsl(${hue + 60} 80% 60% / .18) 55%, transparent 78%)`
                : `radial-gradient(circle at 50% 38%, ${accent.replace(')', ' / .45)')}, transparent 72%)` }} /> : undefined}>
            <svg viewBox="-12 -12 24 24" width="30" height="30" className="overflow-visible"
              style={{ filter: h.light && tier !== 'economy' ? `drop-shadow(0 0 5px ${accent})` : 'none', transition: 'filter .4s' }}>
              {/* rays: fade + extend in once, then hold still */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.line key={i} x1="0" x2="0" stroke={h.light ? accent : 'rgba(255,255,255,.6)'} strokeWidth="1.3" strokeLinecap="round" transform={`rotate(${i * 45})`}
                  initial={false} animate={h.light ? { y1: -8.5, y2: -11, opacity: 1 } : { y1: -8.5, y2: -8.5, opacity: 0 }} transition={{ duration: 0.35, delay: h.light ? i * 0.03 : 0 }} />
              ))}
              <path d="M0 -6.5 a4.6 4.6 0 0 1 2.9 8.2 c-.6.5-.9 1.1-.9 1.8 v.8 h-4 v-.8 c0-.7-.3-1.3-.9-1.8 A4.6 4.6 0 0 1 0 -6.5z"
                fill={h.light ? (tier === 'economy' ? '#fff' : accent) : 'none'} fillOpacity={h.light ? 0.85 : 0} stroke={h.light ? accent : 'rgba(255,255,255,.6)'} strokeWidth="1.2" />
              <path d="M-1.8 5.6 h3.6 M-1.3 7.2 h2.6" stroke={h.light ? accent : 'rgba(255,255,255,.6)'} strokeWidth="1.1" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] mt-0.5" style={{ color: h.light ? accent : 'rgba(255,255,255,.6)' }}>{h.light ? 'On' : 'Light'}</span>
          </Glass>

          {/* Airline mark (display-rendered, mood-reactive) */}
          <AirlineLogo tier={tier} mood={m} asleep={h.asleep} light={h.light} theme={theme} />

          {/* ORB: play / pause / select */}
          <Glass tier={tier} hue={hue} shape="orb" label={h.menu ? 'Play on screen' : 'Play / Pause'} onPress={h.orb} dim={h.dimmed}
            style={{ left: 64, top: 296, width: 74, height: 74 }}
            under={tier === 'business' ? (
              <>
                {/* static glow (no constant spin); fades with backlight */}
                <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: h.dimmed ? 0.2 : 1,
                  background: `radial-gradient(circle at 35% 30%, hsl(${hue} 80% 55% / .35), transparent 60%), radial-gradient(circle at 70% 75%, hsl(${hue + 150} 80% 55% / .3), transparent 60%)` }} />
                <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full -rotate-90">
                  <motion.circle cx="20" cy="20" r="18" stroke="white" strokeOpacity=".85" strokeWidth="1.2" fill="none" strokeLinecap="round"
                    animate={{ pathLength: pct }} transition={{ ease: 'linear', duration: 1 }} />
                </svg>
              </>
            ) : tier === 'premium' ? (
              <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full -rotate-90">
                <motion.circle cx="20" cy="20" r="18" stroke={accent} strokeWidth="1.2" fill="none" animate={{ pathLength: pct }} transition={{ ease: 'linear', duration: 1 }} />
              </svg>
            ) : undefined}>
            <AnimatePresence mode="wait">
              <motion.span key={h.menu ? 'sel' : String(h.isPlaying)} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                className="text-[24px] leading-none font-semibold">{h.menu ? '▶' : h.isPlaying ? '❚❚' : '▶'}</motion.span>
            </AnimatePresence>
          </Glass>

          {/* SCRUB pill: two-half rocker */}
          <Glass tier={tier} hue={hue} shape="pill" label="Scrub back / forward"
            onPress={(e) => { const r = e.currentTarget.getBoundingClientRect(); h.scrub(e.clientX - r.left < r.width / 2 ? -1 : 1); }}
            style={{ left: 62, top: 384, width: 78, height: 44 }}
            under={tier === 'business' ? <motion.div className="absolute inset-0" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: `linear-gradient(90deg, transparent, hsl(${hue + 60} 80% 70% / .25), transparent)` }} /> : undefined}>
            <span className="flex w-full justify-between px-3 items-center">
              <span className="text-[20px] leading-none">{h.menu ? '‹' : '«'}</span>
              <span className="w-px h-4 bg-white/25" />
              <span className="text-[20px] leading-none">{h.menu ? '›' : '»'}</span>
            </span>
          </Glass>
          <span className="absolute left-[62px] w-[78px] top-[432px] text-center text-[9px] text-white/45">{h.menu ? 'Browse' : h.playing.kind === 'Music' ? '10 sec' : '30 sec'}</span>

          {/* VOLUME BLADE — lower right, under the thumb */}
          <Glass tier={tier} hue={hue} shape="blade" label={h.menu ? 'Category up / down' : 'Volume up / down'}
            onPress={(e) => { const r = e.currentTarget.getBoundingClientRect(); h.vol(e.clientY - r.top < r.height / 2 ? 1 : -1); }}
            style={{ left: 146, top: 288, width: 44, height: 196 }}
            under={!h.menu ? (
              <motion.div className="absolute inset-x-0 bottom-0" animate={{ height: `${h.volume * 10}%` }}
                transition={tier === 'economy' ? { duration: 0.15 } : { type: 'spring', stiffness: 90, damping: 7, mass: 0.9 }}
                style={{ background: tier === 'economy' ? 'rgba(255,255,255,.22)'
                  : tier === 'premium' ? `linear-gradient(to top, hsl(${hue} 60% 50% / .8), hsl(${hue} 65% 68% / .35))`
                  : `linear-gradient(to top, hsl(${hue} 85% 55%), hsl(${hue + 60} 85% 62%), hsl(${hue + 150} 85% 70% / .6))` }}>
                {tier !== 'economy' && (
                  /* surface: two offset waves that slosh toward the direction of change */
                  <motion.div key={slosh.n} className="absolute -top-[9px] left-0 w-full h-[12px] overflow-visible"
                    initial={{ skewY: slosh.d * -14, y: slosh.d * -4 }} animate={{ skewY: [slosh.d * -14, slosh.d * 9, slosh.d * -4, 0], y: [slosh.d * -4, slosh.d * 2, 0] }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}>
                    <motion.svg viewBox="0 0 44 10" preserveAspectRatio="none" className="absolute inset-0 w-[200%] h-full"
                      animate={{ x: ['0%', '-50%'] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}>
                      <path d="M0 5 Q5.5 0 11 5 T22 5 T33 5 T44 5 V10 H0Z" fill={tier === 'business' ? `hsl(${hue + 150} 85% 70% / .65)` : `hsl(${hue} 65% 68% / .5)`} />
                    </motion.svg>
                    <motion.svg viewBox="0 0 44 10" preserveAspectRatio="none" className="absolute inset-0 w-[200%] h-full"
                      animate={{ x: ['-50%', '0%'] }} transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}>
                      <path d="M0 6 Q5.5 2 11 6 T22 6 T33 6 T44 6 V10 H0Z" fill={tier === 'business' ? `hsl(${hue + 60} 85% 65% / .55)` : `hsl(${hue} 60% 55% / .45)`} />
                    </motion.svg>
                  </motion.div>
                )}
                {tier === 'business' && Array.from({ length: 6 }).map((_, i) => (
                  <motion.span key={i} className="absolute bottom-0 rounded-full bg-white/60" style={{ left: `${15 + ((i * 29) % 70)}%`, width: 2 + (i % 3), height: 2 + (i % 3) }}
                    animate={{ y: [0, -120], opacity: [0, 0.8, 0], x: [0, i % 2 ? 3 : -3, 0] }} transition={{ duration: 2.5 + (i % 3), delay: i * 0.6, repeat: Infinity, ease: 'easeOut' }} />
                ))}
              </motion.div>
            ) : undefined}>
            <span className="absolute top-3 text-[20px] leading-none">{h.menu ? '▲' : '+'}</span>
            {!h.menu && <span className="text-[16px] font-bold tabular-nums">{h.volume}</span>}
            {h.menu && <span className="text-[9px] text-white/60 [writing-mode:vertical-rl]">Category</span>}
            <span className="absolute bottom-3 text-[20px] leading-none">{h.menu ? '▼' : '−'}</span>
          </Glass>

          {/* ---------- OSDs ---------- */}
          <AnimatePresence>
            {h.osd && !h.asleep && (
              <motion.div key={h.osd.k + h.osd.n} initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                className={`absolute inset-x-3 top-[150px] rounded-2xl px-4 py-3 overflow-hidden ${tier === 'economy' ? 'bg-white text-black' : 'bg-black/70 backdrop-blur-md border border-white/10 text-white'}`}>
                {tier === 'business' && <GradientMesh hue={hue} intensity={0.6} />}
                <div className="relative">
                  {h.osd.k === 'vol' && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] uppercase tracking-widest opacity-60">Volume</span>
                      <motion.span key={h.volume} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[28px] font-bold tabular-nums">{h.volume}</motion.span>
                    </div>
                  )}
                  {h.osd.k === 'seek' && <p className="text-[20px] font-semibold text-center tabular-nums">{fmt(h.pos)}</p>}
                  {h.osd.k === 'play' && <p className="text-[18px] font-semibold text-center">{h.isPlaying ? '▶ Playing' : '❚❚ Paused'}</p>}
                  {h.osd.k === 'sent' && <p className="text-[15px] font-semibold text-center">Playing on your screen</p>}
                  {h.osd.k === 'light' && <p className="text-[17px] font-semibold text-center">Reading light {h.light ? 'on' : 'off'}</p>}
                  {h.osd.k === 'sleep' && (
                    <div className="text-center">
                      <p className="text-[12px] uppercase tracking-widest opacity-60">Sleep timer</p>
                      <div className="flex gap-1 mt-1.5">
                        {SLEEP_STEPS.map((m, i) => (
                          <span key={m} className={`flex-1 py-1 rounded-md text-[13px] font-semibold ${i === h.sleepStep ? (tier === 'economy' ? 'bg-black text-white' : 'bg-white text-black') : 'opacity-40'}`}>{m ? `${m}m` : 'Off'}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---------- Call ---------- */}
          <AnimatePresence>
            {h.call && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}
                className={`absolute inset-x-3 top-3 rounded-full pl-3 pr-4 py-2 flex items-center gap-2.5 z-20 ${tier === 'economy' ? 'bg-white text-black' : 'bg-black/55 backdrop-blur-md text-white border border-white/10'}`}>
                <span className="relative flex w-2.5 h-2.5">
                  {tier !== 'economy' && <motion.span className="absolute inset-0 rounded-full" style={{ background: accent }} animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }} />}
                  <span className="relative w-2.5 h-2.5 rounded-full" style={{ background: tier === 'economy' ? '#000' : accent }} />
                </span>
                <p className="text-[12px] font-medium leading-tight truncate">
                  Crew called <span className="opacity-60">· {tier === 'business' ? 'Sarah, ~1 min' : 'side key cancels'}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---------- Sleep (screen off) ---------- */}
          <AnimatePresence>
            {h.asleep && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
                className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center text-white/60">
                <p className="text-[34px] font-light tabular-nums">{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                <p className="text-[11px] uppercase tracking-widest mt-1">Sleeping · press any key</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const LS_THEME = 'meridian.theme.v1';
const LS_LIB = 'meridian.library.v1';
const TIER_META: Record<Tier, { label: string; tagline: string }> = {
  economy: { label: 'Economy', tagline: 'Max legibility · zero graphics · low power' },
  premium: { label: 'Premium Economy', tagline: 'Artwork · tint · animated feedback' },
  business: { label: 'Business', tagline: 'Living gradients on every surface' },
};

export default function HandsetCompact() {
  const [mood, setMood] = useState<Mood>('auto');
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [lib, setLib] = useState<Library>(LIBRARY);
  const [dev, setDev] = useState(false);
  const [kiosk, setKiosk] = useState<Tier | null>(null);
  const [scale, setScale] = useState(1);
  const loaded = useRef(false);

  // Load persisted config + kiosk param (client only)
  useEffect(() => {
    try {
      const t = localStorage.getItem(LS_THEME); if (t) setTheme({ ...DEFAULT_THEME, ...JSON.parse(t) });
      const l = localStorage.getItem(LS_LIB); if (l) setLib({ ...LIBRARY, ...JSON.parse(l) });
    } catch { /* ignore corrupt storage */ }
    const q = new URLSearchParams(window.location.search);
    const k = q.get('kiosk') as Tier | null;
    if (k && k in TIER_META) setKiosk(k);
    const md = q.get('mood') as Mood | null; if (md) setMood(md);
    if (q.get('dev') === '1') setDev(true);
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(LS_THEME, JSON.stringify(theme)); } catch { /* quota */ }
  }, [theme]);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(LS_LIB, JSON.stringify(lib)); } catch { /* quota */ }
  }, [lib]);
  useEffect(() => {
    if (!kiosk) return;
    const fit = () => setScale(Math.min(window.innerWidth / 216, window.innerHeight / 520));
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [kiosk]);

  const cssVars = { '--meridian-primary': theme.primary, '--meridian-secondary': theme.secondary, '--meridian-font': theme.font } as React.CSSProperties;

  // Hardware kiosk: one handset, edge to edge, no chrome. e.g. /demo?simulate=true&device=handset&kiosk=business
  if (kiosk) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden" style={cssVars}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center' }} className="[&>div>div:first-child]:hidden">
          <Handset tier={kiosk} {...TIER_META[kiosk]} mood={mood} theme={theme} lib={lib} />
        </div>
      </div>
    );
  }

  const opts: [Mood, string][] = [['auto', 'Auto (clock)'], ['day', '☀ Day'], ['sunset', '🌅 Sunset'], ['night', '🌙 Night'], ['dark', '🔴 Cabin dark']];
  return (
    <div className="w-full h-full flex" style={cssVars}>
      <div className="flex-1 min-w-0 h-full overflow-auto flex flex-col items-center pt-16 pb-24 gap-6">
        <div className="text-center max-w-2xl px-4">
          <h2 className="text-lg font-semibold text-white">Meridian handset · one SKU, three cabins</h2>
          <p className="text-[12px] text-white/50 mt-1 leading-relaxed">
            Volume Blade under the right thumb · Orb + Scrub rocker centre · Menu &amp; Light lower-left · Power on top · Call on the side.
            Tap the now-playing area to wake the backlight.
            <br />Keyboard: ↑↓ volume · ←→ scrub · Enter orb · <b className="text-white/80">M</b> menu · <b className="text-white/80">L</b> light · <b className="text-white/80">P</b> sleep timer · <b className="text-white/80">S</b> sleep · <b className="text-white/80">C</b> call
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 mt-3">
            <div className="inline-flex items-center gap-1 rounded-full bg-black/40 border border-white/10 p-1">
              <span className="text-[10px] uppercase tracking-widest text-white/40 px-2">Cabin mood</span>
              {opts.map(([v, l]) => (
                <button key={v} id={`mood-${v}`} onClick={() => setMood(v)}
                  className={`px-3 py-1.5 rounded-full text-[11px] ${mood === v ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>{l}</button>
              ))}
            </div>
            <button id="dev-mode-toggle" onClick={() => setDev((d) => !d)}
              className={`px-4 py-2 rounded-full text-[11px] font-mono border transition ${dev ? 'bg-white text-black border-white' : 'text-white/80 border-white/20 hover:border-white/50'}`}>
              {'</>'} Developer
            </button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-20 px-6 pt-4">
          {(Object.keys(TIER_META) as Tier[]).map((t) => (
            <Handset key={t} tier={t} {...TIER_META[t]} mood={mood} theme={theme} lib={lib} />
          ))}
        </div>
      </div>
      <AnimatePresence>
        {dev && (
          <motion.aside key="dev" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
            className="w-[440px] shrink-0 h-full border-l border-white/10 bg-[#0b0c10]/95 backdrop-blur-xl">
            <DevPanel theme={theme} setTheme={setTheme} lib={lib} setLib={setLib} mood={mood}
              onReset={() => { setTheme(DEFAULT_THEME); setLib(LIBRARY); }} onClose={() => setDev(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
