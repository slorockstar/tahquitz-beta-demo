'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Track = { artist: string; title: string; duration: number; hue: number };

const TRACKS: Track[] = [
  { artist: 'Miles Davis', title: 'So What', duration: 562, hue: 210 },
  { artist: 'Nina Simone', title: 'Feeling Good', duration: 173, hue: 280 },
  { artist: 'Daft Punk', title: 'Veridis Quo', duration: 345, hue: 330 },
  { artist: 'Hans Zimmer', title: 'Time', duration: 275, hue: 30 },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

type OSD = { kind: 'volume' | 'track' | 'play' | 'call' | 'source'; key: number } | null;

/* ---------- Shared playback state ---------- */
function usePlayback() {
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [position, setPosition] = useState(42);
  const [volume, setVolume] = useState(55);
  const [callActive, setCallActive] = useState(false);
  const [source, setSource] = useState(0);
  const track = TRACKS[trackIdx];

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setPosition((p) => {
        if (p + 1 >= track.duration) {
          setTrackIdx((i) => (i + 1) % TRACKS.length);
          return 0;
        }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, track.duration]);

  const next = () => { setTrackIdx((i) => (i + 1) % TRACKS.length); setPosition(0); };
  const prev = () => {
    if (position > 3) setPosition(0);
    else { setTrackIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length); setPosition(0); }
  };

  return { track, trackIdx, isPlaying, setIsPlaying, position, volume, setVolume, next, prev, callActive, setCallActive, source, setSource };
}

const SOURCES = ['Cabin Audio', 'Moving Map', 'Movie Ch. 1', 'Satellite Radio'];

/* ---------- Audio visualizer ---------- */
function Visualizer({ playing, hue, bars = 40, className = '' }: { playing: boolean; hue: number; bars?: number; className?: string }) {
  const [levels, setLevels] = useState<number[]>(() => Array(bars).fill(0.05));
  const phase = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      phase.current += 0.09;
      const t = phase.current;
      // Slow "phrase" envelope so loudness swells and relaxes like real music
      const envelope = 0.55 + 0.25 * Math.sin(t * 0.35) + 0.12 * Math.sin(t * 1.3);
      setLevels((prev) => prev.map((v, i) => {
        if (!playing) return v * 0.85;
        const f = i / bars;
        const spectral = 1 - f * 0.75; // bass heavier than treble
        const motion = 0.5 + 0.5 * Math.sin(t * (1.2 + f * 3) + i * 0.7);
        const target = Math.min(1, envelope * spectral * (0.35 + 0.65 * motion) * (0.85 + Math.random() * 0.3));
        return v + (target - v) * (target > v ? 0.45 : 0.18); // fast attack, slow release
      }));
    }, 90);
    return () => clearInterval(id);
  }, [playing, bars]);

  return (
    <div className={`flex items-end gap-[2px] ${className}`}>
      {levels.map((v, i) => (
        <div key={i} className="flex-1 rounded-full"
          style={{ height: `${Math.max(4, v * 100)}%`, transition: 'height 90ms linear',
            background: `linear-gradient(to top, hsl(${hue} 45% 70% / .55), hsl(${hue} 45% 85% / .2))` }} />
      ))}
    </div>
  );
}

/* ---------- Clear-glass physical key over the display ---------- */
function HardKey({ onPress, children, label, glow = 'rgba(255,255,255,.6)', id, wide = false, under }: {
  onPress: () => void; children: React.ReactNode; label: string; glow?: string; id: string; wide?: boolean; under?: React.ReactNode;
}) {
  const [flash, setFlash] = useState(0);
  return (
    <motion.button
      id={id}
      aria-label={label}
      whileTap={{ scale: 0.93, y: 1 }}
      onClick={() => { setFlash((f) => f + 1); onPress(); }}
      className={`relative ${wide ? 'w-[136px]' : 'w-16'} h-16 rounded-2xl flex items-center justify-center text-white
        bg-white/[0.04] border border-white/25 backdrop-blur-[1px]
        shadow-[0_8px_18px_rgba(0,0,0,.45),inset_0_1px_1px_rgba(255,255,255,.55),inset_0_-2px_6px_rgba(255,255,255,.08)]`}
    >
      {/* Pixels on the screen beneath the glass */}
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
      {/* Glass caustics */}
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

/* ---------- HARD KEY VARIANT ---------- */
function HardKeyHandset() {
  const p = usePlayback();
  const [osd, setOsd] = useState<OSD>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (kind: NonNullable<OSD>['kind']) => {
    setOsd({ kind, key: Date.now() });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOsd(null), 1600);
  };

  const pct = (p.position / p.track.duration) * 100;
  const hue = p.track.hue;

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
      {/* Handset: one edge-to-edge display under a glass face */}
      <div className="relative w-full max-w-[780px] aspect-[2.1/1] rounded-[36px] p-5 overflow-hidden bg-black
        ring-[6px] ring-[#1b1c20] shadow-[0_30px_60px_rgba(0,0,0,.7)] flex gap-5">
        {/* Soft ambient gradient backdrop */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, hsl(${hue} 35% 14%), hsl(${hue + 40} 30% 10%) 55%, hsl(${hue - 30} 30% 12%))`, transition: 'background 2s ease' }} />
        <motion.div className="absolute w-[70%] h-[140%] -top-[20%] -left-[10%] rounded-full blur-3xl pointer-events-none"
          animate={{ x: ['0%', '15%', '0%'], y: ['0%', '8%', '0%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(circle, hsl(${hue} 55% 45% / ${p.isPlaying ? 0.35 : 0.18}), transparent 65%)`, transition: 'background 2s ease' }} />
        <motion.div className="absolute w-[60%] h-[130%] -bottom-[30%] -right-[10%] rounded-full blur-3xl pointer-events-none"
          animate={{ x: ['0%', '-12%', '0%'], y: ['0%', '-6%', '0%'] }} transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: `radial-gradient(circle, hsl(${hue + 50} 50% 50% / ${p.isPlaying ? 0.28 : 0.14}), transparent 65%)`, transition: 'background 2s ease' }} />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        {p.callActive && (
          <motion.div className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0, 0.35, 0] }} transition={{ duration: 1.4, repeat: Infinity }}
            style={{ background: 'radial-gradient(circle at 85% 80%, rgba(56,189,248,.9), transparent 60%)' }} />
        )}
        <div className="absolute inset-0 pointer-events-none rounded-[36px] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent z-30" />

        {/* Left key column: volume */}
        <div className="relative z-10 flex flex-col justify-center items-center gap-2">
          <HardKey id="hk-vol-up" label="Volume up" glow={`hsl(${hue} 90% 65%)`} onPress={() => { p.setVolume((v) => Math.min(100, v + 5)); show('volume'); }}
            under={<motion.div className="absolute inset-x-0 bottom-0" animate={{ height: `${Math.max(0, p.volume - 50) * 2}%` }}
              style={{ background: `linear-gradient(to top, hsl(${hue} 90% 55% / .8), hsl(${hue + 40} 90% 65% / .5))` }} />}>{Icon.plus}</HardKey>
          {/* On-screen volume ladder between the keys */}
          <div className="flex flex-col-reverse gap-[3px] w-6 py-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div key={i} className="h-1.5 rounded-full"
                animate={{ background: i < p.volume / 10 ? `hsl(${hue + i * 6} 90% 62%)` : 'rgba(255,255,255,.1)', width: i < p.volume / 10 ? '100%' : '55%' }}
                style={{ marginInline: 'auto' }} />
            ))}
          </div>
          <HardKey id="hk-vol-down" label="Volume down" glow={`hsl(${hue} 90% 65%)`} onPress={() => { p.setVolume((v) => Math.max(0, v - 5)); show('volume'); }}
            under={<motion.div className="absolute inset-x-0 bottom-0" animate={{ height: `${Math.min(50, p.volume) * 2}%` }}
              style={{ background: `linear-gradient(to top, hsl(${hue} 90% 55% / .8), hsl(${hue + 20} 90% 60% / .5))` }} />}>{Icon.minus}</HardKey>
        </div>

        {/* Screen behind smoked glass */}
        <div className="relative z-10 flex-1 rounded-2xl overflow-hidden">

          {/* Content */}
          <div className="relative h-full flex flex-col justify-between p-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[.25em] text-white/50">
              <span>{SOURCES[p.source]}</span>
              <span className="flex items-center gap-2">
                <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: `hsl(${hue} 90% 60%)` }}
                  animate={{ opacity: p.isPlaying ? [1, 0.4, 1] : 0.3 }} transition={{ duration: 3, repeat: Infinity }} />
                Jack 1 · Seat 4A
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={p.trackIdx} initial={{ opacity: 0, x: 30, filter: 'blur(6px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -30, filter: 'blur(6px)' }} transition={{ duration: 0.35 }} className="flex items-center gap-4">
                <motion.div className="w-14 h-14 rounded-full flex-shrink-0 border border-white/10"
                  style={{ background: `radial-gradient(circle, #111 18%, hsl(${hue} 70% 45%) 20%, #0a0a0a 60%, hsl(${hue + 40} 60% 30%) 100%)` }}
                  animate={{ rotate: p.isPlaying ? 360 : 0 }} transition={{ duration: 12, repeat: p.isPlaying ? Infinity : 0, ease: 'linear' }} />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{p.track.title}</h3>
                  <p className="text-xs text-white/50 uppercase tracking-widest">{p.track.artist}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <Visualizer playing={p.isPlaying} hue={hue} className="h-10" />

            {/* Track bar */}
            <div>
              <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: `linear-gradient(90deg, hsl(${hue} 50% 70%), hsl(${hue + 30} 50% 80%))` }}
                  animate={{ width: `${pct}%` }} transition={{ ease: 'linear', duration: 1 }} />
              </div>
              <div className="flex justify-between text-[10px] text-white/40 mt-1 font-mono">
                <span>{fmt(p.position)}</span><span>-{fmt(p.track.duration - p.position)}</span>
              </div>
            </div>
          </div>

          {/* On-screen display overlays */}
          <AnimatePresence>
            {osd && (
              <motion.div key={osd.kind} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`absolute inset-0 flex items-center justify-center ${osd.kind === 'volume' ? 'bg-black/25' : 'bg-black/50 backdrop-blur-sm'}`}>
                {osd.kind === 'volume' && (
                  <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                    className="w-[85%] rounded-2xl bg-black/45 backdrop-blur-md border border-white/10 px-5 py-4">
                    <div className="flex items-center justify-between mb-3 text-[10px] uppercase tracking-[.3em] text-white/60">
                      <span>Headphone Volume</span>
                      <motion.span key={p.volume} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="text-white text-sm font-semibold tracking-normal tabular-nums">{p.volume}</motion.span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 9h4l5-4v14l-5-4H4z" /></svg>
                      <div className="relative flex-1 h-2 rounded-full bg-white/15">
                        <motion.div className="absolute inset-y-0 left-0 rounded-full"
                          initial={false} animate={{ width: `${p.volume}%` }} transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                          style={{ background: `linear-gradient(90deg, hsl(${hue} 50% 65%), hsl(${hue} 40% 88%))` }} />
                        <motion.div className="absolute top-1/2 w-4 h-4 -mt-2 -ml-2 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,.15),0_2px_6px_rgba(0,0,0,.4)]"
                          initial={false} animate={{ left: `${p.volume}%`, scale: [1.25, 1] }} transition={{ type: 'spring', stiffness: 220, damping: 24 }} />
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" /><path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" /></svg>
                    </div>
                  </motion.div>
                )}
                {osd.kind === 'track' && (
                  <motion.div initial={{ x: 40 }} animate={{ x: 0 }} className="text-center">
                    <p className="text-[10px] uppercase tracking-[.3em] text-white/50">Track {p.trackIdx + 1} / {TRACKS.length}</p>
                    <p className="text-2xl font-semibold text-white mt-1">{p.track.title}</p>
                  </motion.div>
                )}
                {osd.kind === 'play' && (
                  <motion.div initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1.4, rotate: 0 }} className="text-white">
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

          {/* Glass reflection */}
        </div>

        {/* Right key cluster: transport + call */}
        <div className="relative z-10 flex flex-col justify-center gap-3">
          <div className="flex gap-3">
            <HardKey id="hk-prev" label="Previous" onPress={() => { p.prev(); show('track'); }}>{Icon.prev}</HardKey>
            <HardKey id="hk-next" label="Next" onPress={() => { p.next(); show('track'); }}>{Icon.next}</HardKey>
          </div>
          <div className="flex gap-3">
            <HardKey id="hk-play" label="Play/Pause" glow={`hsl(${hue} 60% 75%)`} onPress={() => { p.setIsPlaying((v) => !v); show('play'); }}
              under={<>
                <motion.div className="absolute inset-0" animate={{ opacity: p.isPlaying ? [0.15, 0.3, 0.15] : 0.05 }} transition={{ duration: 4, repeat: Infinity }}
                  style={{ background: `radial-gradient(circle, hsl(${hue} 50% 60%), transparent 70%)` }} />
                <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="20" cy="20" r="17" stroke="rgba(255,255,255,.12)" strokeWidth="2" fill="none" />
                  <motion.circle cx="20" cy="20" r="17" stroke={`hsl(${hue} 90% 65%)`} strokeWidth="2" fill="none" strokeLinecap="round"
                    animate={{ pathLength: pct / 100 }} transition={{ ease: 'linear', duration: 1 }} />
                </svg>
              </>}>
              {p.isPlaying ? Icon.pause : Icon.play}
            </HardKey>
            <HardKey id="hk-source" label="Source" onPress={() => { p.setSource((s) => (s + 1) % SOURCES.length); show('source'); }}
              under={<div className="absolute bottom-1.5 inset-x-0 flex justify-center gap-1">
                {SOURCES.map((_, i) => <motion.span key={i} className="h-1 rounded-full bg-white" animate={{ width: i === p.source ? 10 : 4, opacity: i === p.source ? 1 : 0.3 }} />)}
              </div>}>{Icon.src}</HardKey>
          </div>
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
    </div>
  );
}

/* ---------- TOUCH VARIANT (original, animated) ---------- */
function TouchHandset() {
  const p = usePlayback();
  const pct = (p.position / p.track.duration) * 100;
  return (
    <div className="w-full h-full bg-transparent flex items-center justify-between p-6 overflow-hidden">
      <div className="flex flex-col justify-between h-full w-2/3 pr-6">
        <div className="flex items-center gap-4">
          <motion.div className="w-16 h-16 rounded-full flex-shrink-0"
            style={{ background: `radial-gradient(circle, #111 18%, hsl(${p.track.hue} 70% 45%) 20%, #0a0a0a 65%)` }}
            animate={{ rotate: p.isPlaying ? 360 : 0 }} transition={{ duration: 4, repeat: p.isPlaying ? Infinity : 0, ease: 'linear' }} />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">{p.track.artist}</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{p.track.title}</p>
          </div>
        </div>
        <Visualizer playing={p.isPlaying} hue={p.track.hue} className="h-10 my-3" />
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-white" animate={{ width: `${pct}%` }} transition={{ ease: 'linear', duration: 1 }} />
        </div>
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
  const [variant, setVariant] = useState<'hardkey' | 'touch'>('hardkey');
  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 right-2 z-20 flex rounded-full bg-black/40 border border-white/10 p-0.5 text-[10px] uppercase tracking-widest">
        {(['hardkey', 'touch'] as const).map((v) => (
          <button key={v} id={`handset-variant-${v}`} onClick={() => setVariant(v)}
            className={`px-3 py-1 rounded-full transition-colors ${variant === v ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>
            {v === 'hardkey' ? 'Hard Keys' : 'Touch'}
          </button>
        ))}
      </div>
      {variant === 'hardkey' ? <HardKeyHandset /> : <TouchHandset />}
    </div>
  );
}
