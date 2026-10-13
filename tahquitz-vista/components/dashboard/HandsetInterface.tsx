'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Explore from './HandsetExtras';
import HandsetCompact from './HandsetCompact';

/* =========================================================
   Demo catalogue (fictional artists, generated cover art)
   ========================================================= */
type Section = { start: number; label: string; energy: number };
type Lyric = { t: number; line: string };
type Track = {
  title: string; artist: string; album: string; year: number; genre: string;
  bpm: number; keySig: string; format: string; cover: string; hue: number; duration: number;
  sections: Section[]; lyrics: Lyric[]; bio: string; listeners: string; credits: string[]; trivia: string;
};

const TRACKS: Track[] = [
  {
    title: 'Blue Hour at FL410', artist: 'The Ellison Quartet', album: 'Midnight Altitude', year: 2024, genre: 'Modal Jazz',
    bpm: 92, keySig: 'D Dorian', format: 'FLAC 24/96', cover: '/handset/midnight_altitude.jpg', hue: 222, duration: 318,
    sections: [
      { start: 0, label: 'Intro', energy: 0.3 }, { start: 24, label: 'Head', energy: 0.55 }, { start: 88, label: 'Sax Solo', energy: 0.8 },
      { start: 170, label: 'Piano Solo', energy: 0.6 }, { start: 240, label: 'Head Out', energy: 0.55 }, { start: 292, label: 'Outro', energy: 0.25 },
    ],
    lyrics: [{ t: 0, line: '♪ Instrumental ♪' }],
    bio: 'A Chicago-born quartet known for late-night modal sessions recorded live to tape. Midnight Altitude was tracked in a single overnight take.',
    listeners: '1.2M monthly listeners', credits: ['Marcus Ellison — Tenor Sax', 'June Park — Piano', 'Theo Reyes — Upright Bass', 'Sam Okafor — Drums'],
    trivia: 'The drummer played with brushes for the entire album to keep it "cabin quiet".',
  },
  {
    title: 'Velvet Horizon', artist: 'Amara Sol', album: 'Velvet Horizon', year: 2023, genre: 'Neo-Soul',
    bpm: 78, keySig: 'A♭ Major', format: 'FLAC 24/48', cover: '/handset/velvet_horizon.jpg', hue: 28, duration: 236,
    sections: [
      { start: 0, label: 'Intro', energy: 0.25 }, { start: 14, label: 'Verse 1', energy: 0.45 }, { start: 52, label: 'Chorus', energy: 0.75 },
      { start: 84, label: 'Verse 2', energy: 0.5 }, { start: 120, label: 'Chorus', energy: 0.8 }, { start: 152, label: 'Bridge', energy: 0.4 },
      { start: 180, label: 'Final Chorus', energy: 0.9 }, { start: 218, label: 'Outro', energy: 0.3 },
    ],
    lyrics: [
      { t: 0, line: '♪' }, { t: 14, line: 'Desert light is fading slow' }, { t: 22, line: 'Painting gold on all I know' },
      { t: 30, line: 'Every mile we leave behind' }, { t: 40, line: 'Softens edges in my mind' },
      { t: 52, line: 'Take me to the velvet horizon' }, { t: 60, line: 'Where the sky and I collide' }, { t: 68, line: 'Hold me through the long night flying' },
      { t: 76, line: 'Wake me on the other side' }, { t: 84, line: 'Window seat and city glow' }, { t: 94, line: 'Thirty thousand feet below' },
      { t: 104, line: 'Whisper names I used to call' }, { t: 112, line: 'Clouds are catching every fall' },
      { t: 120, line: 'Take me to the velvet horizon' }, { t: 128, line: 'Where the sky and I collide' }, { t: 136, line: 'Hold me through the long night flying' },
      { t: 144, line: 'Wake me on the other side' }, { t: 152, line: 'And if the morning never comes…' }, { t: 166, line: 'I\'ll keep chasing every sun' },
      { t: 180, line: 'Take me to the velvet horizon' }, { t: 190, line: 'Where the sky and I collide' }, { t: 200, line: 'Hold me through the long night flying' },
      { t: 210, line: 'Wake me on the other side' }, { t: 218, line: '♪' },
    ],
    bio: 'Lisbon-raised vocalist blending analog soul with desert-rock textures. Her debut was written almost entirely on long-haul flights.',
    listeners: '4.8M monthly listeners', credits: ['Amara Sol — Vocals, Rhodes', 'Diego Mar — Guitar', 'Produced by Kinfolk Room'],
    trivia: 'The bridge vocal was recorded in one take at 3 a.m. in a hotel bathroom.',
  },
  {
    title: 'Neon Meridian', artist: 'Kōdo Drift', album: 'Meridian', year: 2025, genre: 'Synthwave',
    bpm: 108, keySig: 'F♯ Minor', format: 'FLAC 24/96', cover: '/handset/neon_meridian.jpg', hue: 300, duration: 284,
    sections: [
      { start: 0, label: 'Intro', energy: 0.35 }, { start: 30, label: 'Build', energy: 0.6 }, { start: 66, label: 'Drop', energy: 0.9 },
      { start: 130, label: 'Breakdown', energy: 0.35 }, { start: 168, label: 'Build', energy: 0.65 }, { start: 196, label: 'Drop', energy: 0.95 },
      { start: 256, label: 'Outro', energy: 0.3 },
    ],
    lyrics: [
      { t: 0, line: '♪' }, { t: 30, line: 'Signal in the static' }, { t: 44, line: 'Crossing every line' }, { t: 66, line: '♪ ♪ ♪' },
      { t: 130, line: 'Somewhere past the meridian' }, { t: 146, line: 'Time forgets its name' }, { t: 168, line: 'Signal in the static' }, { t: 196, line: '♪ ♪ ♪' },
    ],
    bio: 'Tokyo-based producer duo crafting retro-futurist synth scores. Every track is built on hardware synths from 1982–1989.',
    listeners: '2.3M monthly listeners', credits: ['Ren Aoki — Synths', 'Mika Hale — Drum Machines', 'Mastered at Studio Oriental'],
    trivia: 'The arpeggio is played on a Juno-60 found in a Shibuya pawn shop.',
  },
  {
    title: 'Still Waters', artist: 'Halvorsen Orchestra', album: 'Still Waters (Original Score)', year: 2022, genre: 'Cinematic',
    bpm: 64, keySig: 'E Minor', format: 'FLAC 24/192', cover: '/handset/still_waters.jpg', hue: 182, duration: 352,
    sections: [
      { start: 0, label: 'Dawn', energy: 0.2 }, { start: 48, label: 'Strings Rise', energy: 0.5 }, { start: 120, label: 'Theme', energy: 0.75 },
      { start: 200, label: 'Crescendo', energy: 0.95 }, { start: 268, label: 'Reflection', energy: 0.4 }, { start: 320, label: 'Coda', energy: 0.15 },
    ],
    lyrics: [{ t: 0, line: '♪ Instrumental ♪' }],
    bio: 'A 70-piece Oslo ensemble led by composer Ingrid Halvorsen. Still Waters scored the award-winning documentary of the same name.',
    listeners: '980K monthly listeners', credits: ['Ingrid Halvorsen — Composer, Conductor', 'Oslo Philharmonic Strings', 'Recorded at Sentralen Hall'],
    trivia: 'Recommended by our crew as the best track for sleeping on long-hauls.',
  },
];

const SOURCES = ['Cabin Audio', 'Moving Map', 'Movie Ch. 1', 'Satellite Radio'];
const TABS = ['Now Playing', 'Lyrics', 'Artist', 'Up Next', 'Flight', 'Explore'] as const;
type Tab = typeof TABS[number];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const sectionAt = (t: Track, pos: number) => [...t.sections].reverse().find((s) => pos >= s.start) ?? t.sections[0];

type OSD = { kind: 'volume' | 'track' | 'play' | 'call' | 'source'; key: number } | null;

/* =========================================================
   Playback state
   ========================================================= */
function usePlayback() {
  const [trackIdx, setTrackIdx] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [position, setPosition] = useState(46);
  const [volume, setVolume] = useState(55);
  const [callActive, setCallActive] = useState(false);
  const [source, setSource] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [shuffle, setShuffle] = useState(false);
  const [sleepAt, setSleepAt] = useState<number | null>(null); // epoch ms
  const track = TRACKS[trackIdx];

  const goTo = (i: number) => { setTrackIdx((i + TRACKS.length) % TRACKS.length); setPosition(0); };
  const next = () => goTo(shuffle ? Math.floor(Math.random() * TRACKS.length) : trackIdx + 1);
  const prev = () => (position > 3 ? setPosition(0) : goTo(trackIdx - 1));

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      if (sleepAt && Date.now() >= sleepAt) { setIsPlaying(false); setSleepAt(null); return; }
      setPosition((p) => {
        if (p + 1 >= track.duration) { setTrackIdx((i) => (i + 1) % TRACKS.length); return 0; }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, track.duration, sleepAt]);

  const toggleLike = () => setLiked((s) => { const n = new Set(s); n.has(trackIdx) ? n.delete(trackIdx) : n.add(trackIdx); return n; });

  return {
    track, trackIdx, isPlaying, setIsPlaying, position, seek: setPosition, volume, setVolume, next, prev, goTo,
    callActive, setCallActive, source, setSource, liked, toggleLike, shuffle, setShuffle, sleepAt, setSleepAt,
  };
}
type Playback = ReturnType<typeof usePlayback>;

/* =========================================================
   Visualizer — follows the song's structure + tempo
   ========================================================= */
function Visualizer({ playing, hue, energy, bpm, bars = 40, className = '' }: {
  playing: boolean; hue: number; energy: number; bpm: number; bars?: number; className?: string;
}) {
  const [levels, setLevels] = useState<number[]>(() => Array(bars).fill(0.05));
  const phase = useRef(0);
  const energyRef = useRef(energy);
  energyRef.current = energy;
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      phase.current += 0.09;
      const t = phase.current;
      const beatLen = 60000 / bpm;
      const beatPhase = ((performance.now() - start) % beatLen) / beatLen;
      const kick = Math.exp(-beatPhase * 6); // decays after each beat
      const e = energyRef.current;
      setLevels((prev) => prev.map((v, i) => {
        if (!playing) return v * 0.85;
        const f = i / bars;
        const spectral = 1 - f * 0.7;
        const shimmer = 0.5 + 0.5 * Math.sin(t * (1.1 + f * 3.2) + i * 0.8);
        const bass = f < 0.2 ? kick * 0.45 : kick * 0.08;
        const target = Math.min(1, Math.min(1, e * 1.35) * spectral * (0.45 + 0.55 * shimmer) * (0.85 + Math.random() * 0.3) + bass * e);
        return v + (target - v) * (target > v ? 0.5 : 0.16);
      }));
    }, 80);
    return () => clearInterval(id);
  }, [playing, bars, bpm]);

  return (
    <div className={`flex items-end gap-[2px] ${className}`}>
      {levels.map((v, i) => (
        <div key={i} className="flex-1 rounded-full"
          style={{ height: `${Math.max(4, v * 100)}%`, transition: 'height 80ms linear',
            background: `linear-gradient(to top, hsl(${hue} 45% 72% / .6), hsl(${hue} 45% 88% / .18))` }} />
      ))}
    </div>
  );
}

/* =========================================================
   Scrubbable progress bar with song-section markers
   ========================================================= */
function ProgressBar({ p, hue }: { p: Playback; hue: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const d = p.track.duration;
  const toSec = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    return Math.round(Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * d);
  };
  const pct = (p.position / d) * 100;

  return (
    <div>
      <div ref={ref} id="handset-progress" role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={d} aria-valuenow={p.position}
        className="relative h-5 flex items-center cursor-pointer group select-none"
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); setDrag(true); p.seek(toSec(e.clientX)); }}
        onPointerMove={(e) => { const s = toSec(e.clientX); setHover(s); if (drag) p.seek(s); }}
        onPointerUp={() => setDrag(false)}
        onPointerLeave={() => { setHover(null); }}>
        <div className="relative w-full h-1.5 group-hover:h-2 transition-all rounded-full bg-white/10 overflow-hidden">
          {/* section tint segments */}
          {p.track.sections.map((s, i) => {
            const end = p.track.sections[i + 1]?.start ?? d;
            return <div key={i} className="absolute inset-y-0 border-r border-black/40"
              style={{ left: `${(s.start / d) * 100}%`, width: `${((end - s.start) / d) * 100}%`, background: `rgba(255,255,255,${s.energy * 0.08})` }} />;
          })}
          <motion.div className="absolute inset-y-0 left-0 rounded-full" initial={false}
            animate={{ width: `${pct}%` }} transition={drag ? { duration: 0 } : { ease: 'linear', duration: 1 }}
            style={{ background: `linear-gradient(90deg, hsl(${hue} 50% 70%), hsl(${hue + 30} 50% 85%))` }} />
        </div>
        <motion.div className="absolute w-3 h-3 -ml-1.5 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity"
          initial={false} animate={{ left: `${pct}%`, scale: drag ? 1.4 : 1 }} transition={drag ? { duration: 0 } : { ease: 'linear', duration: 1 }} />
        {hover !== null && (
          <div className="absolute -top-6 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white font-mono whitespace-nowrap pointer-events-none"
            style={{ left: `${(hover / d) * 100}%` }}>
            {fmt(hover)} · {sectionAt(p.track, hover).label}
          </div>
        )}
      </div>
      <div className="flex justify-between text-[10px] text-white/45 font-mono">
        <span>{fmt(p.position)}</span><span>-{fmt(d - p.position)}</span>
      </div>
    </div>
  );
}

/* =========================================================
   Screen panels
   ========================================================= */
function NowPlaying({ p, hue, portrait = false }: { p: Playback; hue: number; portrait?: boolean }) {
  const sec = sectionAt(p.track, p.position);
  const liked = p.liked.has(p.trackIdx);
  return (
    <AnimatePresence mode="wait">
      <motion.div key={p.trackIdx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.35 }} className={`flex h-full ${portrait ? 'flex-col items-center justify-center text-center gap-3' : 'items-center gap-4'}`}>
        <motion.div className={`relative ${portrait ? 'w-48 h-48' : 'w-28 h-28'} flex-shrink-0 rounded-xl overflow-hidden`}
          style={{ boxShadow: `0 12px 30px hsl(${hue} 60% 20% / .7), 0 0 0 1px rgba(255,255,255,.08)` }}
          animate={{ scale: p.isPlaying ? 1 : 0.94 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
          <motion.img src={p.track.cover} alt={`${p.track.album} cover`} className="w-full h-full object-cover"
            animate={{ scale: p.isPlaying ? [1, 1.06, 1] : 1 }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/15" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.p key={sec.label} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-[9px] uppercase tracking-[.3em]" style={{ color: `hsl(${hue} 60% 75%)` }}>{sec.label}</motion.p>
          </AnimatePresence>
          <h3 className="text-lg font-semibold text-white truncate leading-tight mt-0.5">{p.track.title}</h3>
          <p className="text-xs text-white/60 truncate">{p.track.artist}</p>
          <p className="text-[10px] text-white/35 truncate">{p.track.album} · {p.track.year}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {[p.track.genre, `${p.track.bpm} BPM`, p.track.keySig, p.track.format].map((c) => (
              <span key={c} className="px-1.5 py-0.5 rounded bg-white/[0.07] border border-white/10 text-[9px] text-white/60">{c}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <motion.button id="handset-like" whileTap={{ scale: 0.8 }} onClick={p.toggleLike} aria-label="Save to My Flight Mix"
            className="w-8 h-8 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center">
            <motion.svg width="14" height="14" viewBox="0 0 24 24" animate={{ scale: liked ? [1, 1.4, 1] : 1 }}
              fill={liked ? '#fb7185' : 'none'} stroke={liked ? '#fb7185' : 'white'} strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
            </motion.svg>
          </motion.button>
          <motion.button id="handset-shuffle" whileTap={{ scale: 0.8 }} onClick={() => p.setShuffle(!p.shuffle)} aria-label="Shuffle"
            className={`w-8 h-8 rounded-full border flex items-center justify-center ${p.shuffle ? 'bg-white text-black border-white' : 'bg-white/[0.07] border-white/10 text-white'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Lyrics({ p, hue }: { p: Playback; hue: number }) {
  const lines = p.track.lyrics;
  const idx = Math.max(0, lines.findLastIndex((l) => p.position >= l.t));
  const LINE_H = 26;
  return (
    <div className="relative h-full overflow-hidden" style={{ maskImage: 'linear-gradient(transparent, black 30%, black 70%, transparent)' }}>
      <motion.div animate={{ y: `calc(50% - ${idx * LINE_H + LINE_H / 2}px)` }} transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        className="absolute inset-x-0 top-0">
        {lines.map((l, i) => (
          <motion.button key={i} onClick={() => p.seek(l.t)} style={{ height: LINE_H }}
            animate={{ opacity: i === idx ? 1 : Math.abs(i - idx) === 1 ? 0.45 : 0.2, scale: i === idx ? 1.04 : 1, color: i === idx ? `hsl(${hue} 60% 88%)` : '#fff' }}
            className="block w-full text-center text-[15px] font-medium origin-center hover:opacity-80">
            {l.line}
          </motion.button>
        ))}
      </motion.div>
      <span className="absolute bottom-0 right-0 text-[8px] uppercase tracking-widest text-white/30">Tap a line to jump</span>
    </div>
  );
}

function Artist({ p, hue }: { p: Playback; hue: number }) {
  return (
    <div className="h-full overflow-y-auto pr-1 text-white/80 text-[11px] leading-relaxed space-y-2 [scrollbar-width:none]">
      <div className="flex items-center gap-3">
        <img src={p.track.cover} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
        <div>
          <p className="text-sm font-semibold text-white">{p.track.artist}</p>
          <p className="text-[10px]" style={{ color: `hsl(${hue} 60% 75%)` }}>{p.track.listeners}</p>
        </div>
      </div>
      <p>{p.track.bio}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-white/55">
        {p.track.credits.map((c) => <span key={c} className="truncate">• {c}</span>)}
      </div>
      <p className="text-[10px] italic text-white/50">💡 {p.track.trivia}</p>
    </div>
  );
}

function UpNext({ p }: { p: Playback }) {
  const order = TRACKS.map((_, i) => (p.trackIdx + i) % TRACKS.length);
  return (
    <div className="h-full overflow-y-auto space-y-1 [scrollbar-width:none]">
      {order.map((i, n) => {
        const t = TRACKS[i];
        return (
          <motion.button key={i} layout onClick={() => p.goTo(i)} whileHover={{ x: 3 }}
            className={`w-full flex items-center gap-2.5 p-1.5 rounded-lg text-left ${n === 0 ? 'bg-white/10' : 'hover:bg-white/5'}`}>
            <img src={t.cover} alt="" className="w-8 h-8 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-white truncate">{t.title}</p>
              <p className="text-[9px] text-white/45 truncate">{t.artist} · {t.genre}</p>
            </div>
            <span className="text-[9px] text-white/40 font-mono">{n === 0 ? 'NOW' : fmt(t.duration)}</span>
            {p.liked.has(i) && <span className="text-rose-400 text-[10px]">♥</span>}
          </motion.button>
        );
      })}
    </div>
  );
}

function Flight({ p, hue }: { p: Playback; hue: number }) {
  const [now, setNow] = useState(0);
  useEffect(() => { const id = setInterval(() => setNow((n) => n + 1), 1000); return () => clearInterval(id); }, []);
  const total = 11 * 3600 + 20 * 60;
  const elapsed = 4 * 3600 + 12 * 60 + now;
  const remain = total - elapsed;
  const prog = elapsed / total;
  const albums = Math.floor(remain / 2700);
  const sleepLeft = p.sleepAt ? Math.max(0, Math.round((p.sleepAt - Date.now()) / 60000)) : null;
  const tz = new Date(Date.now() + 16 * 3600000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="h-full flex flex-col justify-between text-white">
      <div>
        <div className="flex justify-between items-end text-[10px] text-white/50 uppercase tracking-widest">
          <span><b className="text-white text-base tracking-normal">LAX</b> Los Angeles</span>
          <span className="text-right">Tokyo <b className="text-white text-base tracking-normal">HND</b></span>
        </div>
        <div className="relative h-6 mt-1">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path d="M2 18 Q50 -6 98 18" stroke="rgba(255,255,255,.2)" strokeWidth=".6" strokeDasharray="1.5 1.5" fill="none" />
            <motion.path d="M2 18 Q50 -6 98 18" stroke={`hsl(${hue} 60% 75%)`} strokeWidth=".9" fill="none" initial={false} animate={{ pathLength: prog }} />
          </svg>
          <motion.div className="absolute top-0 text-xs -ml-1.5" animate={{ left: `${prog * 96 + 2}%`, top: `${Math.abs(prog - 0.5) * 50}%` }}>✈︎</motion.div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-1 text-center">
          {[['Time left', `${Math.floor(remain / 3600)}h ${Math.floor((remain % 3600) / 60)}m`], ['Tokyo time', tz], ['Albums left', `~${albums}`]].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white/[0.06] border border-white/10 py-1">
              <p className="text-sm font-semibold tabular-nums">{v}</p>
              <p className="text-[8px] uppercase tracking-widest text-white/45">{k}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-widest text-white/45 mb-1">Sleep timer {sleepLeft !== null && <span className="text-white">· {sleepLeft} min</span>}</p>
        <div className="flex gap-1">
          {[['Off', 0], ['15m', 15], ['30m', 30], ['1h', 60], ['Landing', remain / 60 - 40]].map(([l, m]) => {
            const active = (m === 0 && !p.sleepAt) || (p.sleepAt && sleepLeft !== null && Math.abs(sleepLeft - (m as number)) < 1);
            return (
              <motion.button key={l as string} whileTap={{ scale: 0.9 }} onClick={() => p.setSleepAt(m ? Date.now() + (m as number) * 60000 : null)}
                className={`flex-1 py-1 rounded-md text-[10px] border ${active ? 'bg-white text-black border-white' : 'bg-white/[0.06] border-white/10 text-white/70'}`}>{l}</motion.button>
            );
          })}
        </div>
        <p className="text-[9px] text-white/40 mt-1.5">🌙 Jet-lag tip: it's evening in Tokyo — try sleeping for the next 5 hours.</p>
      </div>
    </div>
  );
}

/* =========================================================
   Clear-glass physical key over the display
   ========================================================= */
function HardKey({ onPress, children, label, glow = 'rgba(255,255,255,.6)', id, wide = false, under }: {
  onPress: () => void; children: React.ReactNode; label: string; glow?: string; id: string; wide?: boolean; under?: React.ReactNode;
}) {
  const [flash, setFlash] = useState(0);
  return (
    <motion.button id={id} aria-label={label} whileTap={{ scale: 0.93, y: 1 }}
      onClick={() => { setFlash((f) => f + 1); onPress(); }}
      className={`relative ${wide ? 'w-[136px]' : 'w-16'} h-16 rounded-2xl flex items-center justify-center text-white
        bg-white/[0.04] border border-white/25 backdrop-blur-[1px]
        shadow-[0_8px_18px_rgba(0,0,0,.45),inset_0_1px_1px_rgba(255,255,255,.55),inset_0_-2px_6px_rgba(255,255,255,.08)]`}>
      <div className="absolute inset-[3px] rounded-[13px] overflow-hidden pointer-events-none">
        {under}
        <AnimatePresence>
          {flash > 0 && (
            <motion.span key={flash} className="absolute inset-0"
              initial={{ opacity: 0.9, scale: 0.2 }} animate={{ opacity: 0, scale: 1.6 }} transition={{ duration: 0.55 }}
              style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }} />
          )}
        </AnimatePresence>
      </div>
      <span className="absolute inset-x-2 top-1 h-1/3 rounded-t-xl bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
      <span className="relative drop-shadow-[0_0_6px_rgba(255,255,255,.6)]">{children}</span>
    </motion.button>
  );
}

const Icon = {
  prev: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4" /><rect x="5" y="5" width="2" height="14" /></svg>,
  next: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20" /><rect x="17" y="5" width="2" height="14" /></svg>,
  play: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20" /></svg>,
  pause: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
  plus: <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" fill="none"><path d="M12 5v14M5 12h14" /></svg>,
  minus: <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" fill="none"><path d="M5 12h14" /></svg>,
  bell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  src: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="13" rx="2" /><path d="M17 2l-5 5-5-5" /></svg>,
};

/* =========================================================
   HARD KEY VARIANT
   ========================================================= */
function HardKeyHandset({ portrait = false }: { portrait?: boolean }) {
  const p = usePlayback();
  const [tab, setTab] = useState<Tab>('Now Playing');
  const [osd, setOsd] = useState<OSD>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [announcing, setAnnouncing] = useState(false);
  const [wakeUp, setWakeUp] = useState<number | null>(null);
  const [together, setTogether] = useState<string | null>(null);
  const announce = () => { setAnnouncing(true); setTimeout(() => setAnnouncing(false), 6000); };
  // A realistic surprise: the crew makes a PA about a minute into the demo
  useEffect(() => { const id = setTimeout(announce, 60000); return () => clearTimeout(id); }, []);

  const show = (kind: NonNullable<OSD>['kind']) => {
    setOsd({ kind, key: Date.now() });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOsd(null), 1600);
  };

  const pct = (p.position / p.track.duration) * 100;
  const hue = p.track.hue;
  const sec = sectionAt(p.track, p.position);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 pt-14 overflow-hidden">
      <motion.div layout transition={{ type: 'spring', stiffness: 160, damping: 24 }}
        className={`relative overflow-hidden bg-black ring-[6px] ring-[#1b1c20] shadow-[0_30px_60px_rgba(0,0,0,.7)] grid
          ${portrait ? 'h-full max-h-[820px] aspect-[9/17] rounded-[44px] p-4 gap-4' : 'w-full max-w-[900px] aspect-[2.1/1] rounded-[36px] p-5 gap-5'}`}
        style={portrait
          // Right-handed thumb: pivot sits bottom-right. Play/skip in the natural arc,
          // volume as a vertical strip on the right edge, Call top-left of the key zone (deliberate reach = fewer accidental calls).
          ? { gridTemplateAreas: '"screen screen" "transport vol"', gridTemplateColumns: '1fr auto', gridTemplateRows: '1fr auto' }
          : { gridTemplateAreas: '"vol screen transport"', gridTemplateColumns: 'auto minmax(0,1fr) auto', gridTemplateRows: '1fr' }}>
        {/* Ambient backdrop tinted by the album art */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, hsl(${hue} 35% 14%), hsl(${hue + 40} 30% 10%) 55%, hsl(${hue - 30} 30% 12%))`, transition: 'background 2s ease' }} />
        <AnimatePresence>
          <motion.img key={p.track.cover} src={p.track.cover} alt="" aria-hidden
            initial={{ opacity: 0 }} animate={{ opacity: 0.22 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover blur-3xl scale-125 pointer-events-none" />
        </AnimatePresence>
        <motion.div className="absolute w-[70%] h-[140%] -top-[20%] -left-[10%] rounded-full blur-3xl pointer-events-none"
          animate={{ x: ['0%', '15%', '0%'], y: ['0%', '8%', '0%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(circle, hsl(${hue} 55% 45% / ${p.isPlaying ? 0.3 : 0.15}), transparent 65%)` }} />
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        {p.callActive && (
          <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: [0, 0.35, 0] }} transition={{ duration: 1.4, repeat: Infinity }}
            style={{ background: 'radial-gradient(circle at 85% 80%, rgba(56,189,248,.9), transparent 60%)' }} />
        )}
        <div className="absolute inset-0 pointer-events-none rounded-[36px] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent z-30" />

        {/* Left keys: volume */}
        <div className="relative z-10 flex flex-col justify-center items-center gap-2" style={{ gridArea: 'vol' }}>
          <HardKey id="hk-vol-up" label="Volume up" glow={`hsl(${hue} 60% 70%)`} onPress={() => { p.setVolume((v) => Math.min(100, v + 5)); show('volume'); }}
            under={<motion.div className="absolute inset-x-0 bottom-0" animate={{ height: `${Math.max(0, p.volume - 50) * 2}%` }}
              style={{ background: `linear-gradient(to top, hsl(${hue} 50% 60% / .7), hsl(${hue} 50% 75% / .35))` }} />}>{Icon.plus}</HardKey>
          <div className="flex flex-col-reverse gap-[3px] w-6 py-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div key={i} className="h-1.5 rounded-full mx-auto"
                animate={{ background: i < p.volume / 10 ? `hsl(${hue} 50% ${60 + i * 3}%)` : 'rgba(255,255,255,.1)', width: i < p.volume / 10 ? '100%' : '55%' }} />
            ))}
          </div>
          <HardKey id="hk-vol-down" label="Volume down" glow={`hsl(${hue} 60% 70%)`} onPress={() => { p.setVolume((v) => Math.max(0, v - 5)); show('volume'); }}
            under={<motion.div className="absolute inset-x-0 bottom-0" animate={{ height: `${Math.min(50, p.volume) * 2}%` }}
              style={{ background: `linear-gradient(to top, hsl(${hue} 50% 60% / .7), hsl(${hue} 50% 70% / .35))` }} />}>{Icon.minus}</HardKey>
        </div>

        {/* Center display */}
        <div className="relative z-10 min-w-0 min-h-0 rounded-2xl overflow-hidden" style={{ gridArea: 'screen' }}>
          <div className="relative h-full flex flex-col p-3 gap-2">
            {/* Tab bar */}
            <div className={`flex ${portrait ? 'flex-col-reverse items-stretch' : 'items-center justify-between'} gap-2`}>
              <div className="flex gap-0.5 rounded-full bg-black/30 p-1 overflow-x-auto [scrollbar-width:none]">
                {TABS.map((t) => (
                  <button key={t} id={`handset-tab-${t.replace(' ', '-').toLowerCase()}`} onClick={() => setTab(t)}
                    className="relative px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider rounded-full whitespace-nowrap">
                    {tab === t && <motion.span layoutId="handset-tab-pill" className="absolute inset-0 rounded-full bg-white/90" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                    <span className={`relative ${tab === t ? 'text-black' : 'text-white/55'}`}>{t}</span>
                  </button>
                ))}
              </div>
              <span className="text-[9px] uppercase tracking-[.2em] text-white/40 whitespace-nowrap">
                {together && <span className="text-emerald-300 mr-1">● {together}</span>}
                {wakeUp && <span className="mr-1">⏰</span>}
                {SOURCES[p.source]} · 4A
              </span>
            </div>

            {/* Panel */}
            <div className="relative flex-1 min-h-0">
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }} className="absolute inset-0">
                  {tab === 'Now Playing' && <NowPlaying p={p} hue={hue} portrait={portrait} />}
                  {tab === 'Lyrics' && <Lyrics p={p} hue={hue} />}
                  {tab === 'Artist' && <Artist p={p} hue={hue} />}
                  {tab === 'Up Next' && <UpNext p={p} />}
                  {tab === 'Flight' && <Flight p={p} hue={hue} />}
                  {tab === 'Explore' && (
                    <Explore hue={hue} tracks={TRACKS} liked={p.liked} currentIdx={p.trackIdx} goTo={(i) => { p.goTo(i); setTab('Now Playing'); }}
                      onAnnounce={announce} wakeUp={wakeUp} setWakeUp={setWakeUp} together={together} setTogether={setTogether} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mini now-playing strip when not on Now Playing */}
            {tab !== 'Now Playing' && (
              <div className="flex items-center gap-2 text-[10px] text-white/70">
                <img src={p.track.cover} alt="" className="w-5 h-5 rounded object-cover" />
                <span className="truncate">{p.track.title} — {p.track.artist}</span>
                <span className="ml-auto text-white/40 uppercase tracking-widest text-[8px]">{sec.label}</span>
              </div>
            )}

            <Visualizer playing={p.isPlaying} hue={hue} energy={announcing ? sec.energy * 0.25 : sec.energy} bpm={p.track.bpm} className={portrait ? 'h-20' : 'h-12'} />
            <ProgressBar p={p} hue={hue} />
          </div>

          {/* Crew announcement: music ducks, banner slides down */}
          <AnimatePresence>
            {announcing && (
              <motion.div initial={{ y: '-110%' }} animate={{ y: 0 }} exit={{ y: '-110%' }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="absolute top-2 inset-x-2 z-20 rounded-xl bg-amber-400/90 text-black px-3 py-2 flex items-center gap-3 shadow-xl">
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>📢</motion.span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold">Cabin Announcement</p>
                  <p className="text-[10px] truncate">We're beginning our dinner service. Your music is lowered and will resume shortly.</p>
                </div>
                <div className="flex items-end gap-[2px] h-4">
                  {[0, 1, 2, 3].map((i) => <motion.span key={i} className="w-[3px] bg-black/70 rounded" animate={{ height: ['30%', '100%', '40%'] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* On-screen display overlays */}
          <AnimatePresence>
            {osd && (
              <motion.div key={osd.kind} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                className={`absolute inset-0 flex items-center justify-center pointer-events-none ${osd.kind === 'volume' ? 'bg-black/25' : 'bg-black/50 backdrop-blur-sm'}`}>
                {osd.kind === 'volume' && (
                  <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                    className="w-[85%] rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 px-5 py-4">
                    <div className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-[.3em] text-white/60">
                      <span>Headphone Volume</span>
                      <motion.span key={p.volume} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="text-white text-sm font-semibold tracking-normal tabular-nums">{p.volume}</motion.span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4l5-4v14l-5-4H4z" /></svg>
                      <div className="relative flex-1 h-2 rounded-full bg-white/15">
                        <motion.div className="absolute inset-y-0 left-0 rounded-full" initial={false} animate={{ width: `${p.volume}%` }}
                          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                          style={{ background: `linear-gradient(90deg, hsl(${hue} 50% 65%), hsl(${hue} 40% 88%))` }} />
                        <motion.div className="absolute top-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,.15),0_2px_6px_rgba(0,0,0,.4)]"
                          initial={false} animate={{ left: `${p.volume}%` }} transition={{ type: 'spring', stiffness: 220, damping: 24 }} />
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" /><path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" /></svg>
                    </div>
                  </motion.div>
                )}
                {osd.kind === 'track' && (
                  <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4">
                    <img src={p.track.cover} alt="" className="w-20 h-20 rounded-lg object-cover shadow-2xl" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[.3em] text-white/50">Track {p.trackIdx + 1} / {TRACKS.length}</p>
                      <p className="text-xl font-semibold text-white mt-1">{p.track.title}</p>
                      <p className="text-xs text-white/60">{p.track.artist}</p>
                    </div>
                  </motion.div>
                )}
                {osd.kind === 'play' && (
                  <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1.3, opacity: 1 }} className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-white">
                    {p.isPlaying ? Icon.play : Icon.pause}
                  </motion.div>
                )}
                {osd.kind === 'source' && (
                  <div className="flex flex-col gap-1">
                    {SOURCES.map((s, i) => (
                      <motion.div key={s} animate={{ x: i === p.source ? 8 : 0, opacity: i === p.source ? 1 : 0.35 }}
                        className="text-sm text-white uppercase tracking-widest">{i === p.source ? '▸ ' : ''}{s}</motion.div>
                    ))}
                  </div>
                )}
                {osd.kind === 'call' && (
                  <div className="relative flex flex-col items-center">
                    {[0, 1, 2].map((r) => (
                      <motion.span key={r} className="absolute w-16 h-16 rounded-full border-2 border-sky-400"
                        animate={{ scale: [1, 2.6], opacity: [0.8, 0] }} transition={{ duration: 1.5, delay: r * 0.4, repeat: Infinity }} />
                    ))}
                    <div className="w-16 h-16 rounded-full bg-sky-500/30 flex items-center justify-center text-sky-300">{Icon.bell}</div>
                    <p className="mt-4 text-xs uppercase tracking-[.3em] text-sky-300">{p.callActive ? 'Attendant Called' : 'Call Cancelled'}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transport + call keys */}
        <div className="relative z-10 grid gap-3 self-center justify-self-center" style={{
          gridArea: 'transport',
          gridTemplateAreas: portrait ? '"call call src" "prev play next"' : '"prev next" "play src" "call call"',
        }}>
          <div style={{ gridArea: 'prev' }}><HardKey id="hk-prev" label="Previous" onPress={() => { p.prev(); show('track'); }}>{Icon.prev}</HardKey></div>
          <div style={{ gridArea: 'next' }}><HardKey id="hk-next" label="Next" onPress={() => { p.next(); show('track'); }}>{Icon.next}</HardKey></div>
          <div style={{ gridArea: 'play' }}>
            <HardKey id="hk-play" label="Play/Pause" glow={`hsl(${hue} 60% 75%)`} onPress={() => { p.setIsPlaying((v) => !v); show('play'); }}
              under={<>
                <img src={p.track.cover} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="20" cy="20" r="17" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none" />
                  <motion.circle cx="20" cy="20" r="17" stroke={`hsl(${hue} 60% 80%)`} strokeWidth="2" fill="none" strokeLinecap="round"
                    animate={{ pathLength: pct / 100 }} transition={{ ease: 'linear', duration: 1 }} />
                </svg>
              </>}>
              {p.isPlaying ? Icon.pause : Icon.play}
            </HardKey>
          </div>
          <div style={{ gridArea: 'src' }}>
            <HardKey id="hk-source" label="Source" onPress={() => { p.setSource((s) => (s + 1) % SOURCES.length); show('source'); }}
              under={<div className="absolute bottom-1.5 inset-x-0 flex justify-center gap-1">
                {SOURCES.map((_, i) => <motion.span key={i} className="h-1 rounded-full bg-white" animate={{ width: i === p.source ? 10 : 4, opacity: i === p.source ? 1 : 0.3 }} />)}
              </div>}>{Icon.src}</HardKey>
          </div>
          <div style={{ gridArea: 'call' }}>
          <HardKey id="hk-call" label="Call attendant" wide glow="rgba(56,189,248,.9)" onPress={() => { p.setCallActive((c) => !c); show('call'); }}
            under={p.callActive ? <>
              <motion.div className="absolute inset-0 bg-sky-500/40" animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />
              {[0, 1].map((r) => (
                <motion.span key={r} className="absolute left-1/2 top-1/2 w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-sky-200"
                  animate={{ scale: [0.6, 3], opacity: [0.9, 0] }} transition={{ duration: 1.4, delay: r * 0.7, repeat: Infinity }} />
              ))}
            </> : <div className="absolute inset-0 bg-sky-500/10" />}>
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest">{Icon.bell}{p.callActive ? 'Calling' : 'Call'}</span>
          </HardKey>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
   TOUCH VARIANT
   ========================================================= */
function TouchHandset() {
  const p = usePlayback();
  const sec = sectionAt(p.track, p.position);
  return (
    <div className="w-full h-full bg-transparent flex items-center justify-between p-6 overflow-hidden">
      <div className="flex flex-col justify-between h-full w-2/3 pr-6">
        <div className="flex items-center gap-4">
          <img src={p.track.cover} alt={p.track.album} className="w-20 h-20 rounded-lg object-cover shadow-xl" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">{p.track.title}</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{p.track.artist} · {p.track.album}</p>
          </div>
        </div>
        <Visualizer playing={p.isPlaying} hue={p.track.hue} energy={sec.energy} bpm={p.track.bpm} className="h-10 my-3" />
        <ProgressBar p={p} hue={p.track.hue} />
        <div className="flex items-center gap-8 mt-4">
          <button id="touch-prev" onClick={p.prev} className="text-gray-400 hover:text-white">{Icon.prev}</button>
          <motion.button id="touch-play" whileTap={{ scale: 0.9 }} onClick={() => p.setIsPlaying(!p.isPlaying)}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center">
            {p.isPlaying ? Icon.pause : Icon.play}
          </motion.button>
          <button id="touch-next" onClick={p.next} className="text-gray-400 hover:text-white">{Icon.next}</button>
        </div>
      </div>
      <div className="w-1/3 h-full border-l border-white/10 pl-6 flex flex-col justify-between items-center">
        <input id="touch-volume" type="range" min={0} max={100} value={p.volume} onChange={(e) => p.setVolume(+e.target.value)}
          className="flex-1 accent-white" style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties} />
        <span className="text-[10px] font-bold text-white mt-2">{p.volume}</span>
        <button id="touch-call" onClick={() => p.setCallActive(!p.callActive)}
          className={`w-full mt-4 py-3 border rounded-xl flex items-center justify-center transition-colors ${p.callActive ? 'bg-sky-500/30 border-sky-400 text-sky-300 animate-pulse' : 'bg-blue-900/30 border-blue-500/30 text-blue-400'}`}>
          {Icon.bell}
        </button>
      </div>
    </div>
  );
}

export default function HandsetInterface() {
  const [variant, setVariant] = useState<'compact' | 'hardkey' | 'touch'>('compact');
  const [orient, setOrient] = useState<'auto' | 'landscape' | 'portrait'>('auto');
  const [devicePortrait, setDevicePortrait] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const on = () => setDevicePortrait(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const portrait = orient === 'portrait' || (orient === 'auto' && devicePortrait);

  const Seg = <T extends string>({ value, set, opts }: { value: T; set: (v: T) => void; opts: [T, string][] }) => (
    <div className="flex rounded-full bg-black/50 backdrop-blur border border-white/15 p-1">
      {opts.map(([v, l]) => (
        <button key={v} id={`handset-opt-${v}`} onClick={() => set(v)}
          className="relative px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider">
          {value === v && <motion.span layoutId={`seg-${opts[0][0]}`} className="absolute inset-0 rounded-full bg-white" />}
          <span className={`relative ${value === v ? 'text-black' : 'text-white/70'}`}>{l}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative w-full h-full">
      <HandsetCompact />
    </div>
  );
}
