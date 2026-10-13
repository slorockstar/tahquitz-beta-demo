'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* =========================================================
   Compact 2″×5″ corded handset — one SKU, three cabin tiers.
   Full-face non-touch display, 5 clear glass keys (diamond + centre)
   whose legends are drawn by the display underneath, plus a
   recessed mechanical CALL button on the side edge.
   The handset is a remote for the seatback monitor.
   ========================================================= */

type Tier = 'economy' | 'premium' | 'business';
type Kind = 'Movies' | 'TV' | 'Music';
type Item = { kind: Kind; title: string; sub: string; art: string; hue: number; duration: number; chapters: string[] };

const LIBRARY: Record<Kind, Item[]> = {
  Movies: [
    { kind: 'Movies', title: 'Last Light', sub: 'Sci-Fi · 2h 18m · PG-13', art: '/handset/last_light.jpg', hue: 28, duration: 8280, chapters: ['Launch', 'Drift', 'Ice Ridge', 'Signal', 'Sunrise'] },
    { kind: 'Movies', title: 'Harbor Lights', sub: 'Romance · 1h 52m · PG', art: '/handset/harbor_lights.jpg', hue: 340, duration: 6720, chapters: ['Arrival', 'The Tram', 'Rain', 'Fado Night', 'Goodbye?'] },
  ],
  TV: [
    { kind: 'TV', title: 'Deep Blue', sub: 'S1 · E3 “The Breach” · 52m', art: '/handset/deep_blue_tv.jpg', hue: 205, duration: 3120, chapters: ['Cold Open', 'Migration', 'The Breach', 'Below'] },
    { kind: 'TV', title: 'Still Waters', sub: 'Docuseries · E1 · 48m', art: '/handset/still_waters.jpg', hue: 182, duration: 2880, chapters: ['Dawn', 'Fjords', 'Reflection'] },
  ],
  Music: [
    { kind: 'Music', title: 'Velvet Horizon', sub: 'Amara Sol', art: '/handset/velvet_horizon.jpg', hue: 28, duration: 236, chapters: ['Verse', 'Chorus', 'Bridge', 'Chorus'] },
    { kind: 'Music', title: 'Neon Meridian', sub: 'Kōdo Drift', art: '/handset/neon_meridian.jpg', hue: 300, duration: 284, chapters: ['Intro', 'Build', 'Drop', 'Outro'] },
    { kind: 'Music', title: 'Blue Hour at FL410', sub: 'The Ellison Quartet', art: '/handset/midnight_altitude.jpg', hue: 222, duration: 318, chapters: ['Head', 'Sax Solo', 'Piano Solo', 'Outro'] },
  ],
};
const KINDS: Kind[] = ['Movies', 'TV', 'Music'];
const fmt = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60);
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
};

type Key = 'up' | 'down' | 'left' | 'right' | 'ok';
type Mode = 'now' | 'browse';
type Legend = Record<Key, { icon: string; label: string }>;

const KIND_ICON: Record<Kind, string> = { Movies: '🎬', TV: '📺', Music: '♪' };

/* ---------------- Engine (one per handset) ---------------- */
function useHandset() {
  const [playing, setPlaying] = useState<Item>(LIBRARY.Movies[0]);
  const [pos, setPos] = useState(2710);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(6); // 0..10 steps — big, countable steps for a tiny screen
  const [mode, setMode] = useState<Mode>('now');
  const [cat, setCat] = useState(0);
  const [idx, setIdx] = useState(0);
  const [osd, setOsd] = useState<{ k: 'vol' | 'seek' | 'play' | 'sent'; n: number } | null>(null);
  const [call, setCall] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const osdT = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setPos((p) => (p + 1) % playing.duration), 1000);
    return () => clearInterval(id);
  }, [isPlaying, playing]);

  const flash = (k: 'vol' | 'seek' | 'play' | 'sent') => {
    setOsd({ k, n: Date.now() });
    if (osdT.current) clearTimeout(osdT.current);
    osdT.current = setTimeout(() => setOsd(null), 1400);
  };
  const bumpIdle = () => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => setMode('now'), 9000); // browse auto-returns to Now Playing
  };

  const press = (k: Key) => {
    if (mode === 'now') {
      if (k === 'up') { setVolume((v) => Math.min(10, v + 1)); flash('vol'); }
      if (k === 'down') { setVolume((v) => Math.max(0, v - 1)); flash('vol'); }
      if (k === 'left') { setPos((p) => Math.max(0, p - (playing.kind === 'Music' ? 10 : 30))); flash('seek'); }
      if (k === 'right') { setPos((p) => Math.min(playing.duration - 1, p + (playing.kind === 'Music' ? 10 : 30))); flash('seek'); }
      if (k === 'ok') { setIsPlaying((x) => !x); flash('play'); }
    } else {
      bumpIdle();
      const list = LIBRARY[KINDS[cat]];
      if (k === 'left') setIdx((i) => (i - 1 + list.length) % list.length);
      if (k === 'right') setIdx((i) => (i + 1) % list.length);
      if (k === 'up') { setCat((c) => (c - 1 + KINDS.length) % KINDS.length); setIdx(0); }
      if (k === 'down') { setCat((c) => (c + 1) % KINDS.length); setIdx(0); }
      if (k === 'ok') { setPlaying(list[idx]); setPos(0); setIsPlaying(true); setMode('now'); flash('sent'); }
    }
  };
  const hold = () => {
    setMode((m) => (m === 'now' ? 'browse' : 'now'));
    const c = KINDS.indexOf(playing.kind);
    setCat(c); setIdx(Math.max(0, LIBRARY[playing.kind].findIndex((x) => x.title === playing.title)));
    bumpIdle();
  };
  const toggleCall = () => setCall((c) => !c);

  const legend: Legend = mode === 'now'
    ? { up: { icon: '+', label: 'Vol' }, down: { icon: '−', label: 'Vol' }, left: { icon: '«', label: playing.kind === 'Music' ? '10s' : '30s' }, right: { icon: '»', label: playing.kind === 'Music' ? '10s' : '30s' }, ok: { icon: isPlaying ? '❚❚' : '▶', label: 'Hold: Menu' } }
    : { up: { icon: '▲', label: 'Category' }, down: { icon: '▼', label: 'Category' }, left: { icon: '‹', label: 'Prev' }, right: { icon: '›', label: 'Next' }, ok: { icon: '▶', label: 'Play · Hold: Back' } };

  return { playing, pos, isPlaying, volume, mode, cat, idx, osd, call, press, hold, toggleCall, legend };
}
type H = ReturnType<typeof useHandset>;

/* ---------------- Glass key ---------------- */
function GlassKey({ k, h, tier, hue, style }: { k: Key; h: H; tier: Tier; hue: number; style: React.CSSProperties }) {
  const [flash, setFlash] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const L = h.legend[k];
  const down = () => {
    held.current = false;
    if (k === 'ok') timer.current = setTimeout(() => { held.current = true; h.hold(); setFlash((f) => f + 1); }, 550);
  };
  const up = () => {
    if (timer.current) clearTimeout(timer.current);
    if (!held.current) { h.press(k); setFlash((f) => f + 1); }
  };
  const isOk = k === 'ok';
  const glass = tier === 'economy'
    ? 'border-white/30 bg-white/[0.03]'
    : 'border-white/25 bg-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,.5),0_6px_12px_rgba(0,0,0,.45)]';

  return (
    <motion.button aria-label={`${L.icon} ${L.label}`} whileTap={{ scale: 0.92 }}
      onPointerDown={down} onPointerUp={up} onPointerLeave={() => timer.current && clearTimeout(timer.current)}
      className={`absolute rounded-[22%] border flex flex-col items-center justify-center text-white select-none ${glass}`} style={style}>
      {/* Pixels under the glass */}
      <div className="absolute inset-[3px] rounded-[20%] overflow-hidden pointer-events-none">
        {tier === 'business' && (k === 'up' || k === 'down') && h.mode === 'now' && (
          <motion.div className="absolute inset-x-0 bottom-0" animate={{ height: `${h.volume * 10}%` }}
            style={{ background: `linear-gradient(to top, hsl(${hue} 55% 55% / .55), transparent)` }} />
        )}
        {tier === 'business' && isOk && (
          <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="20" cy="20" r="17" stroke="rgba(255,255,255,.12)" strokeWidth="2" fill="none" />
            <motion.circle cx="20" cy="20" r="17" stroke={`hsl(${hue} 60% 75%)`} strokeWidth="2" fill="none" strokeLinecap="round"
              animate={{ pathLength: h.pos / h.playing.duration }} transition={{ ease: 'linear', duration: 1 }} />
          </svg>
        )}
        {tier !== 'economy' && (
          <AnimatePresence>
            {flash > 0 && (
              <motion.span key={flash} className="absolute inset-0" initial={{ opacity: 0.85, scale: 0.3 }} animate={{ opacity: 0, scale: 1.6 }} transition={{ duration: 0.5 }}
                style={{ background: `radial-gradient(circle, hsl(${hue} 60% 75%), transparent 70%)` }} />
            )}
          </AnimatePresence>
        )}
        {tier === 'economy' && flash > 0 && (
          <motion.span key={flash} className="absolute inset-0 bg-white" initial={{ opacity: 0.35 }} animate={{ opacity: 0 }} transition={{ duration: 0.25 }} />
        )}
      </div>
      {tier !== 'economy' && <span className="absolute inset-x-[15%] top-[6%] h-1/3 rounded-t-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />}
      <AnimatePresence mode="wait">
        <motion.span key={L.icon} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.15 }}
          className={`relative font-semibold leading-none ${isOk ? 'text-[22px]' : 'text-[24px]'}`}>{L.icon}</motion.span>
      </AnimatePresence>
      {isOk && <span className="relative text-[9px] text-white/60 mt-1 tracking-wide whitespace-nowrap">{L.label}</span>}
    </motion.button>
  );
}

/* ---------------- One handset ---------------- */
function Handset({ tier, label, tagline }: { tier: Tier; label: string; tagline: string }) {
  const h = useHandset();
  const hue = h.playing.hue;
  const ref = useRef<HTMLDivElement>(null);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    const map: Record<string, Key> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'ok', ' ': 'ok' };
    if (e.key === 'm' || e.key === 'M') { h.hold(); e.preventDefault(); return; }
    if (e.key === 'c' || e.key === 'C') { h.toggleCall(); return; }
    if (map[e.key]) { h.press(map[e.key]); e.preventDefault(); }
  }, [h]);

  const pct = h.pos / h.playing.duration;
  const chapter = h.playing.chapters[Math.min(h.playing.chapters.length - 1, Math.floor(pct * h.playing.chapters.length))];
  const browseList = LIBRARY[KINDS[h.cat]];
  const browseItem = browseList[h.idx];

  // Key geometry: 2″×5″ body → 200×500 px. Key zone is the bottom ~42%.
  const K = 54, C = 70;
  const keyPos: Record<Key, React.CSSProperties> = {
    up: { width: K, height: K, left: 100 - K / 2, top: 288 },
    left: { width: K, height: K, left: 8, top: 354 },
    ok: { width: C, height: C, left: 100 - C / 2, top: 346 },
    right: { width: K, height: K, left: 200 - 8 - K, top: 354 },
    down: { width: K, height: K, left: 100 - K / 2, top: 420 },
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-center">
        <p className="text-sm font-semibold text-white tracking-wide">{label}</p>
        <p className="text-[11px] text-white/45">{tagline}</p>
      </div>

      <div className="relative" style={{ width: 200, height: 500 }}>
        {/* Side mechanical CALL button (right edge, recessed) */}
        <motion.button aria-label="Call attendant" whileTap={{ x: -3 }} onClick={h.toggleCall}
          className={`absolute -right-[7px] top-[120px] w-[9px] h-[54px] rounded-r-md border border-black/60 z-10 ${h.call ? 'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,.9)]' : 'bg-gradient-to-b from-[#4a4d55] to-[#26282d]'}`} />
        <span className="absolute -right-[46px] top-[138px] text-[9px] text-white/40 uppercase tracking-widest rotate-90 origin-left">Call</span>

        {/* Cord */}
        <svg className="absolute left-1/2 -translate-x-1/2 top-full" width="40" height="70" viewBox="0 0 40 70">
          <path d="M20 0 C 5 10, 35 15, 20 25 C 5 35, 35 40, 20 50 C 5 60, 35 65, 20 70" stroke="#2a2c31" strokeWidth="5" fill="none" />
        </svg>

        {/* Body */}
        <div ref={ref} tabIndex={0} onKeyDown={onKey}
          className="relative w-full h-full rounded-[30px] overflow-hidden bg-black ring-[5px] ring-[#1c1d21] shadow-[0_25px_50px_rgba(0,0,0,.7)] outline-none focus-visible:ring-sky-500/70">

          {/* -------- Backgrounds per tier -------- */}
          {tier === 'premium' && (
            <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, hsl(${hue} 35% 16%), #050507 70%)`, transition: 'background 1.5s' }} />
          )}
          {tier === 'business' && (
            <>
              <AnimatePresence>
                <motion.img key={h.playing.art} src={h.playing.art} alt="" initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
                  className="absolute inset-0 w-full h-[60%] object-cover" />
              </AnimatePresence>
              <motion.div className="absolute inset-0" animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 10, repeat: Infinity }}
                style={{ background: `linear-gradient(180deg, transparent 0%, hsl(${hue} 30% 8% / .7) 35%, #050507 58%)` }} />
            </>
          )}

          {/* -------- Info zone (top ~58%) -------- */}
          <div className="absolute inset-x-0 top-0 h-[284px] px-4 pt-4 flex flex-col">
            <div className="flex justify-between text-[10px] text-white/45 uppercase tracking-widest">
              <span>Seat 32C</span>
              <span>{h.mode === 'browse' ? 'Menu' : 'On your screen'}</span>
            </div>

            <AnimatePresence mode="wait">
              {h.mode === 'now' ? (
                <motion.div key={'now' + h.playing.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex-1 flex flex-col justify-end pb-2">
                  {tier === 'premium' && (
                    <img src={h.playing.art} alt="" className="w-20 h-20 rounded-lg object-cover mb-3 shadow-lg" />
                  )}
                  {tier === 'economy' && <p className="text-3xl mb-2">{KIND_ICON[h.playing.kind]}</p>}
                  {tier === 'business' && (
                    <AnimatePresence mode="wait">
                      <motion.p key={chapter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] uppercase tracking-[.2em] mb-1" style={{ color: `hsl(${hue} 60% 78%)` }}>
                        {h.playing.kind === 'Music' ? chapter : `Chapter · ${chapter}`}
                      </motion.p>
                    </AnimatePresence>
                  )}
                  <p className="text-[22px] font-semibold text-white leading-tight">{h.playing.title}</p>
                  <p className="text-[13px] text-white/60 mt-0.5">{h.playing.sub}</p>

                  {/* Progress */}
                  {tier === 'economy' ? (
                    <p className="text-[13px] text-white/70 mt-3 font-mono">{fmt(h.pos)} / {fmt(h.playing.duration)}</p>
                  ) : (
                    <div className="mt-3">
                      <div className="relative h-1.5 rounded-full bg-white/15 overflow-hidden">
                        {tier === 'business' && h.playing.chapters.map((_, i) => i > 0 && (
                          <span key={i} className="absolute inset-y-0 w-px bg-black/60" style={{ left: `${(i / h.playing.chapters.length) * 100}%` }} />
                        ))}
                        <motion.div className="absolute inset-y-0 left-0 rounded-full" animate={{ width: `${pct * 100}%` }} transition={{ ease: 'linear', duration: 1 }}
                          style={{ background: `hsl(${hue} 55% 72%)` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-white/50 font-mono mt-1"><span>{fmt(h.pos)}</span><span>-{fmt(h.playing.duration - h.pos)}</span></div>
                    </div>
                  )}

                  {/* Business-only: live visualizer for music / waveform for video */}
                  {tier === 'business' && h.isPlaying && (
                    <div className="flex items-end gap-[2px] h-6 mt-2">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <motion.span key={i} className="flex-1 rounded-full" style={{ background: `hsl(${hue} 45% 75% / .5)` }}
                          animate={{ height: ['20%', `${35 + ((i * 37) % 60)}%`, `${15 + ((i * 53) % 45)}%`] }}
                          transition={{ duration: 0.6 + (i % 5) * 0.12, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="browse" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex-1 flex flex-col pt-2">
                  {/* Category stepper: ▲▼ */}
                  <div className="flex items-center gap-2 mb-2">
                    {KINDS.map((k, i) => (
                      <motion.span key={k} animate={{ opacity: i === h.cat ? 1 : 0.35, scale: i === h.cat ? 1 : 0.92 }}
                        className={`text-[13px] font-semibold ${i === h.cat ? 'text-white' : 'text-white/60'}`}>{k}</motion.span>
                    ))}
                  </div>
                  {/* One big item at a time: ◀▶ */}
                  <AnimatePresence mode="wait">
                    <motion.div key={KINDS[h.cat] + h.idx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
                      className="flex-1 flex flex-col">
                      {tier === 'economy' ? (
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-[22px] font-semibold text-white leading-tight">{browseItem.title}</p>
                          <p className="text-[13px] text-white/60">{browseItem.sub}</p>
                        </div>
                      ) : (
                        <>
                          <img src={browseItem.art} alt="" className={`w-full ${tier === 'business' ? 'h-[150px]' : 'h-[120px]'} object-cover rounded-xl`} />
                          <p className="text-[18px] font-semibold text-white leading-tight mt-2 truncate">{browseItem.title}</p>
                          <p className="text-[12px] text-white/60 truncate">{browseItem.sub}</p>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  <div className="flex justify-center gap-1.5 pb-1">
                    {browseList.map((_, i) => <motion.span key={i} className="h-1.5 rounded-full bg-white" animate={{ width: i === h.idx ? 14 : 6, opacity: i === h.idx ? 1 : 0.3 }} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* -------- Key zone divider -------- */}
          <div className="absolute inset-x-6 top-[284px] h-px bg-white/10" />

          {/* -------- 5 glass keys -------- */}
          {(Object.keys(keyPos) as Key[]).map((k) => <GlassKey key={k} k={k} h={h} tier={tier} hue={hue} style={keyPos[k]} />)}

          {/* -------- OSDs (big, legible) -------- */}
          <AnimatePresence>
            {h.osd && (
              <motion.div key={h.osd.k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`absolute inset-x-3 top-[150px] rounded-2xl px-4 py-3 ${tier === 'economy' ? 'bg-white text-black' : 'bg-black/70 backdrop-blur-md border border-white/10 text-white'}`}>
                {h.osd.k === 'vol' && (
                  <>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[12px] uppercase tracking-widest opacity-60">Volume</span>
                      <motion.span key={h.volume} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[26px] font-bold tabular-nums">{h.volume}</motion.span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <motion.span key={i} className="flex-1 h-3 rounded-sm" animate={{
                          background: i < h.volume ? (tier === 'economy' ? '#000' : `hsl(${hue} 55% ${60 + i * 2}%)`) : (tier === 'economy' ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.12)'),
                          scaleY: i === h.volume - 1 && tier !== 'economy' ? [1.6, 1] : 1,
                        }} />
                      ))}
                    </div>
                  </>
                )}
                {h.osd.k === 'seek' && <p className="text-[18px] font-semibold text-center tabular-nums">{fmt(h.pos)}</p>}
                {h.osd.k === 'play' && <p className="text-[18px] font-semibold text-center">{h.isPlaying ? '▶ Playing' : '❚❚ Paused'}</p>}
                {h.osd.k === 'sent' && <p className="text-[15px] font-semibold text-center">Now playing on your screen</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* -------- Call overlay -------- */}
          <AnimatePresence>
            {h.call && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`absolute inset-x-3 top-3 rounded-2xl px-4 py-3 flex items-center gap-3 ${tier === 'economy' ? 'bg-sky-400 text-black' : 'bg-sky-500/85 text-white'}`}>
                <div className="relative w-8 h-8 flex items-center justify-center">
                  {tier !== 'economy' && [0, 1].map((r) => (
                    <motion.span key={r} className="absolute inset-0 rounded-full border-2 border-white" animate={{ scale: [1, 2.2], opacity: [0.8, 0] }} transition={{ duration: 1.4, delay: r * 0.7, repeat: Infinity }} />
                  ))}
                  <span className="text-lg">🔔</span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold leading-tight">Crew called</p>
                  <p className="text-[11px] opacity-80">{tier === 'business' ? 'Sarah is on her way · ~1 min' : 'Press side button to cancel'}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function HandsetCompact() {
  return (
    <div className="w-full h-full overflow-auto flex flex-col items-center pt-16 pb-24 gap-6">
      <div className="text-center max-w-xl px-4">
        <h2 className="text-lg font-semibold text-white">One handset. Three cabins.</h2>
        <p className="text-[12px] text-white/50 mt-1">
          Same 2″×5″ hardware, 5 glass keys + side Call. The cabin tier is a software skin.
          Hold <b className="text-white/80">●</b> for the menu. Keyboard: arrows, Enter, <b className="text-white/80">M</b> menu, <b className="text-white/80">C</b> call.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-16 px-6">
        <Handset tier="economy" label="Economy" tagline="Max legibility · no graphics" />
        <Handset tier="premium" label="Premium Economy" tagline="Artwork · tint · animated feedback" />
        <Handset tier="business" label="Business" tagline="Full-bleed art · live keys · visualizer" />
      </div>
    </div>
  );
}
