'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Lightweight track shape so this file doesn't import the handset (avoids cycles) */
export type MiniTrack = { title: string; artist: string; genre: string; cover: string };

type ExploreProps = {
  hue: number;
  tracks: MiniTrack[];
  liked: Set<number>;
  currentIdx: number;
  goTo: (i: number) => void;
  onAnnounce: () => void;
  wakeUp: number | null;
  setWakeUp: (m: number | null) => void;
  together: string | null;
  setTogether: (seat: string | null) => void;
};

const APPS = [
  { id: 'sound', label: 'Soundscapes', icon: '🌧️', desc: 'Sleep sounds' },
  { id: 'trivia', label: 'Music Trivia', icon: '🎯', desc: 'Hard-key friendly' },
  { id: 'window', label: 'Window View', icon: '🗺️', desc: 'What\'s below' },
  { id: 'order', label: 'Order', icon: '🥂', desc: 'Snacks & drinks' },
  { id: 'wake', label: 'Wake-up', icon: '⏰', desc: 'Before landing' },
  { id: 'together', label: 'Listen Together', icon: '🎧', desc: 'Sync with a seat' },
  { id: 'foryou', label: 'For You', icon: '✨', desc: 'Picks from your ♥' },
  { id: 'announce', label: 'Crew PA', icon: '📢', desc: 'Demo announcement' },
] as const;
type AppId = typeof APPS[number]['id'];

const Back = ({ onClick, title }: { onClick: () => void; title: string }) => (
  <div className="flex items-center gap-2 mb-2">
    <button onClick={onClick} className="w-6 h-6 rounded-full bg-white/10 text-white text-xs flex items-center justify-center hover:bg-white/20">‹</button>
    <span className="text-[10px] uppercase tracking-[.25em] text-white/60">{title}</span>
  </div>
);

export default function Explore(props: ExploreProps) {
  const [app, setApp] = useState<AppId | null>(null);
  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {!app ? (
          <motion.div key="grid" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            className="grid grid-cols-4 gap-2 h-full content-center">
            {APPS.map((a, i) => (
              <motion.button key={a.id} id={`explore-${a.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => (a.id === 'announce' ? props.onAnnounce() : setApp(a.id))}
                className="rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] p-2 text-left">
                <div className="text-lg leading-none">{a.icon}</div>
                <p className="text-[10px] text-white font-medium mt-1.5 truncate">{a.label}</p>
                <p className="text-[8px] text-white/40 truncate">{a.desc}</p>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div key={app} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
            <Back onClick={() => setApp(null)} title={APPS.find((a) => a.id === app)!.label} />
            <div className="flex-1 min-h-0">
              {app === 'sound' && <Soundscapes hue={props.hue} />}
              {app === 'trivia' && <Trivia hue={props.hue} />}
              {app === 'window' && <WindowView />}
              {app === 'order' && <Order hue={props.hue} />}
              {app === 'wake' && <WakeUp {...props} />}
              {app === 'together' && <Together {...props} />}
              {app === 'foryou' && <ForYou {...props} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- 1. Soundscapes ---------------- */
const SCAPES = [
  { id: 'rain', label: 'Rain', hue: 210 }, { id: 'ocean', label: 'Ocean', hue: 190 },
  { id: 'hum', label: 'Cabin Hum', hue: 260 }, { id: 'forest', label: 'Forest', hue: 130 },
];
function Soundscapes({ hue }: { hue: number }) {
  const [sel, setSel] = useState<string | null>(null);
  const [fade, setFade] = useState(30);
  const s = SCAPES.find((x) => x.id === sel);
  return (
    <div className="h-full flex gap-3">
      <div className="relative flex-1 rounded-xl overflow-hidden border border-white/10"
        style={{ background: s ? `linear-gradient(180deg, hsl(${s.hue} 40% 18%), hsl(${s.hue} 40% 8%))` : 'rgba(255,255,255,.04)' }}>
        {s?.id === 'rain' && Array.from({ length: 30 }).map((_, i) => (
          <motion.span key={i} className="absolute w-px h-3 bg-white/40" style={{ left: `${(i * 37) % 100}%` }}
            animate={{ y: ['-10%', '110%'] }} transition={{ duration: 0.9 + (i % 5) * 0.15, repeat: Infinity, delay: (i % 7) * 0.13, ease: 'linear' }} initial={{ top: '-10%' }} />
        ))}
        {s?.id === 'ocean' && [0, 1, 2].map((i) => (
          <motion.div key={i} className="absolute inset-x-[-20%] h-1/2 rounded-[50%] border-t border-white/20" style={{ bottom: `${-25 + i * 12}%` }}
            animate={{ x: ['-5%', '5%', '-5%'] }} transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
        {s?.id === 'hum' && (
          <motion.div className="absolute inset-0 m-auto w-24 h-24 rounded-full" style={{ background: `radial-gradient(circle, hsl(260 50% 60% / .4), transparent 70%)` }}
            animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 5, repeat: Infinity }} />
        )}
        {s?.id === 'forest' && Array.from({ length: 12 }).map((_, i) => (
          <motion.span key={i} className="absolute w-1 h-1 rounded-full bg-lime-200" style={{ left: `${(i * 23) % 95}%`, top: `${(i * 41) % 90}%` }}
            animate={{ opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }} />
        ))}
        <p className="absolute bottom-2 left-3 text-[10px] text-white/70">{s ? `${s.label} · fades out in ${fade} min` : 'Pick a soundscape'}</p>
      </div>
      <div className="w-32 flex flex-col gap-1">
        {SCAPES.map((x) => (
          <button key={x.id} onClick={() => setSel(sel === x.id ? null : x.id)}
            className={`py-1 rounded-md text-[10px] border ${sel === x.id ? 'bg-white text-black border-white' : 'bg-white/[0.06] border-white/10 text-white/70'}`}>{x.label}</button>
        ))}
        <div className="flex gap-1 mt-1">
          {[15, 30, 60].map((m) => (
            <button key={m} onClick={() => setFade(m)} className={`flex-1 py-0.5 rounded text-[9px] ${fade === m ? 'text-black' : 'text-white/60 bg-white/[0.06]'}`}
              style={fade === m ? { background: `hsl(${hue} 50% 75%)` } : {}}>{m}m</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 2. Music trivia ---------------- */
const QUIZ = [
  { q: 'Which instrument has 88 keys?', a: ['Organ', 'Piano', 'Harpsichord', 'Accordion'], c: 1 },
  { q: 'What does BPM stand for?', a: ['Bass Per Measure', 'Beats Per Minute', 'Bars Per Melody', 'Bands Per Mix'], c: 1 },
  { q: '"Kind of Blue" is a landmark album in which genre?', a: ['Blues', 'Rock', 'Jazz', 'Soul'], c: 2 },
  { q: 'How many strings on a standard violin?', a: ['4', '5', '6', '3'], c: 0 },
  { q: 'Which city is the birthplace of Motown?', a: ['Chicago', 'Memphis', 'Detroit', 'Nashville'], c: 2 },
];
function Trivia({ hue }: { hue: number }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const done = i >= QUIZ.length;
  const q = QUIZ[i];
  const choose = (n: number) => {
    if (pick !== null) return;
    setPick(n);
    if (n === q.c) setScore((s) => s + 1);
    setTimeout(() => { setPick(null); setI((x) => x + 1); }, 1100);
  };
  if (done) return (
    <div className="h-full flex flex-col items-center justify-center text-white">
      <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-3xl font-bold">{score}/{QUIZ.length}</motion.p>
      <p className="text-[10px] text-white/50 mt-1">Seat 4A ranks #3 on this flight</p>
      <button onClick={() => { setI(0); setScore(0); }} className="mt-3 px-3 py-1 rounded-full bg-white text-black text-[10px]">Play again</button>
    </div>
  );
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between text-[9px] text-white/40 mb-1"><span>Q{i + 1}/{QUIZ.length}</span><span>Score {score}</span></div>
      <AnimatePresence mode="wait">
        <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-white mb-2">{q.q}</motion.p>
      </AnimatePresence>
      <div className="grid grid-cols-2 gap-1.5">
        {q.a.map((a, n) => {
          const state = pick === null ? '' : n === q.c ? 'bg-emerald-500/70 border-emerald-300' : n === pick ? 'bg-rose-500/60 border-rose-300' : 'opacity-40';
          return (
            <motion.button key={a} whileTap={{ scale: 0.95 }} onClick={() => choose(n)} animate={pick === n && n !== q.c ? { x: [0, -4, 4, 0] } : {}}
              className={`py-1.5 rounded-lg border border-white/10 bg-white/[0.06] text-[11px] text-white ${state}`}>{a}</motion.button>
          );
        })}
      </div>
      <div className="mt-auto h-1 rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full" style={{ background: `hsl(${hue} 50% 70%)` }} animate={{ width: `${(i / QUIZ.length) * 100}%` }} />
      </div>
    </div>
  );
}

/* ---------------- 3. Window view ---------------- */
const BELOW = [
  { place: 'Pacific Ocean — Hawaiian Ridge', fact: 'The ocean below is about 5,000 m deep — deeper than the Alps are tall.', alt: '38,000 ft', temp: '-56°C' },
  { place: 'International Date Line', fact: 'You\'re about to skip tomorrow\'s… or today\'s date. Time zones get weird here.', alt: '39,000 ft', temp: '-58°C' },
  { place: 'Aleutian Islands, Alaska', fact: 'A chain of 69 volcanic islands — 40+ are active volcanoes.', alt: '40,000 ft', temp: '-60°C' },
];
function WindowView() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % BELOW.length), 7000); return () => clearInterval(id); }, []);
  const b = BELOW[i];
  return (
    <div className="h-full flex gap-3">
      <div className="relative w-36 rounded-[40%] overflow-hidden border-4 border-white/15 bg-gradient-to-b from-sky-400/40 via-sky-700/40 to-blue-950">
        {[0, 1, 2, 3].map((k) => (
          <motion.div key={k} className="absolute h-3 w-16 rounded-full bg-white/50 blur-sm" style={{ top: `${30 + k * 15}%` }}
            animate={{ x: ['120%', '-120%'] }} transition={{ duration: 6 + k * 2, repeat: Infinity, ease: 'linear', delay: k }} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex-1 text-white">
          <p className="text-[9px] uppercase tracking-widest text-white/40">Now flying over</p>
          <p className="text-sm font-semibold">{b.place}</p>
          <p className="text-[11px] text-white/70 mt-1 leading-snug">{b.fact}</p>
          <div className="flex gap-3 mt-2 text-[10px] text-white/50"><span>⬆ {b.alt}</span><span>🌡 {b.temp}</span><span>💨 890 km/h</span></div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------------- 4. Order ---------------- */
const MENU = [
  { n: 'Sparkling Water', e: '💧' }, { n: 'Champagne', e: '🥂' }, { n: 'Green Tea', e: '🍵' },
  { n: 'Cheese Plate', e: '🧀' }, { n: 'Dark Chocolate', e: '🍫' }, { n: 'Fresh Fruit', e: '🍓' },
];
const STEPS = ['Received', 'Preparing', 'On the way', 'Delivered'];
function Order({ hue }: { hue: number }) {
  const [cart, setCart] = useState<string[]>([]);
  const [step, setStep] = useState<number | null>(null);
  useEffect(() => {
    if (step === null || step >= STEPS.length - 1) return;
    const id = setTimeout(() => setStep((s) => (s ?? 0) + 1), 2500);
    return () => clearTimeout(id);
  }, [step]);
  if (step !== null) return (
    <div className="h-full flex flex-col justify-center text-white">
      <p className="text-[10px] text-white/50 mb-3">{cart.join(' · ')}</p>
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <motion.div className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px]"
                animate={{ background: i <= step ? `hsl(${hue} 50% 70%)` : 'rgba(255,255,255,.05)', scale: i === step ? [1, 1.2, 1] : 1, color: i <= step ? '#000' : '#fff' }}
                transition={{ scale: { repeat: i === step && step < 3 ? Infinity : 0, duration: 1.2 } }}>{i < step ? '✓' : i + 1}</motion.div>
              <span className="text-[8px] mt-1 text-white/60 whitespace-nowrap">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px mx-1 mb-3 bg-white/10 relative"><motion.div className="absolute inset-y-0 left-0" style={{ background: `hsl(${hue} 50% 70%)` }} animate={{ width: i < step ? '100%' : '0%' }} /></div>}
          </React.Fragment>
        ))}
      </div>
      {step === 3 && <button onClick={() => { setStep(null); setCart([]); }} className="mt-3 self-center text-[10px] px-3 py-1 rounded-full bg-white/10">Order more</button>}
    </div>
  );
  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-3 gap-1.5">
        {MENU.map((m) => {
          const n = cart.filter((c) => c === m.n).length;
          return (
            <motion.button key={m.n} whileTap={{ scale: 0.94 }} onClick={() => setCart((c) => [...c, m.n])}
              className="relative rounded-lg bg-white/[0.06] border border-white/10 py-1.5 text-white text-[10px]">
              <span className="text-base">{m.e}</span><br />{m.n}
              {n > 0 && <motion.span key={n} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold">{n}</motion.span>}
            </motion.button>
          );
        })}
      </div>
      <button disabled={!cart.length} onClick={() => setStep(0)}
        className="mt-auto py-1.5 rounded-lg text-[11px] font-medium text-black disabled:opacity-30" style={{ background: `hsl(${hue} 50% 78%)` }}>
        Send to crew {cart.length ? `(${cart.length})` : ''}
      </button>
    </div>
  );
}

/* ---------------- 5. Wake-up ---------------- */
function WakeUp({ hue, wakeUp, setWakeUp }: ExploreProps) {
  return (
    <div className="h-full flex flex-col justify-between text-white">
      <p className="text-[11px] text-white/70">We'll gently raise your volume and warm your seat light before landing.</p>
      <div className="flex gap-1.5">
        {[null, 30, 45, 60, 90].map((m) => (
          <button key={String(m)} onClick={() => setWakeUp(m)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] border ${wakeUp === m ? 'bg-white text-black border-white' : 'bg-white/[0.06] border-white/10 text-white/70'}`}>
            {m === null ? 'Off' : `${m} min`}
          </button>
        ))}
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-widest text-white/40 mb-1">Preview: sunrise ramp</p>
        <div className="flex items-end gap-[3px] h-10">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div key={i} className="flex-1 rounded-t" initial={{ height: 0 }} animate={{ height: wakeUp ? `${10 + (i / 23) * 90}%` : '6%' }}
              transition={{ delay: i * 0.03 }} style={{ background: `linear-gradient(to top, hsl(${20 + i} 80% 60% / .7), hsl(${hue} 50% 80% / .3))` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- 6. Listen together ---------------- */
function Together({ together, setTogether }: ExploreProps) {
  const [react, setReact] = useState<{ e: string; k: number }[]>([]);
  const send = (e: string) => { const k = Date.now(); setReact((r) => [...r, { e, k }]); setTimeout(() => setReact((r) => r.filter((x) => x.k !== k)), 1600); };
  if (!together) return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-white">
      <p className="text-[11px] text-white/60">Invite a companion's seat to hear the same track in sync.</p>
      <div className="flex gap-1.5">
        {['4B', '5A', '5B', '3A'].map((s) => (
          <button key={s} onClick={() => setTogether(s)} className="px-3 py-1.5 rounded-lg bg-white/[0.08] border border-white/10 text-xs hover:bg-white/15">Seat {s}</button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="relative h-full flex flex-col items-center justify-center text-white">
      <div className="flex items-center gap-4">
        {['4A', together].map((s, i) => (
          <motion.div key={s} className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs"
            animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.1 }}>{s}</motion.div>
        ))}
      </div>
      <p className="text-[10px] text-emerald-300 mt-2">● In sync with Seat {together}</p>
      <div className="flex gap-2 mt-2">
        {['❤️', '🔥', '😂', '👏'].map((e) => <motion.button key={e} whileTap={{ scale: 1.4 }} onClick={() => send(e)} className="text-lg">{e}</motion.button>)}
      </div>
      <button onClick={() => setTogether(null)} className="mt-2 text-[9px] text-white/40 underline">Leave session</button>
      {react.map((r) => (
        <motion.span key={r.k} className="absolute bottom-6 text-2xl pointer-events-none" initial={{ y: 0, opacity: 1, x: (r.k % 60) - 30 }} animate={{ y: -80, opacity: 0 }} transition={{ duration: 1.5 }}>{r.e}</motion.span>
      ))}
    </div>
  );
}

/* ---------------- 7. For you ---------------- */
function ForYou({ tracks, liked, currentIdx, goTo }: ExploreProps) {
  const seed = liked.size ? [...liked][liked.size - 1] : currentIdx;
  const recs = tracks.map((t, i) => ({ t, i })).filter((x) => x.i !== seed);
  return (
    <div className="h-full flex flex-col">
      <p className="text-[10px] text-white/50 mb-2">Because you {liked.size ? 'saved' : 'are playing'} <span className="text-white">{tracks[seed].title}</span></p>
      <div className="flex gap-2">
        {recs.map(({ t, i }, n) => (
          <motion.button key={i} onClick={() => goTo(i)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: n * 0.08 }}
            whileHover={{ y: -3 }} className="flex-1 text-left">
            <img src={t.cover} alt="" className="w-full aspect-square rounded-lg object-cover" />
            <p className="text-[10px] text-white truncate mt-1">{t.title}</p>
            <p className="text-[8px] text-white/45 truncate">{t.artist}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
