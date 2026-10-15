'use client';

import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Type-only imports keep this file free of a runtime import cycle with HandsetCompact.
import type { Theme, Library, Item, Kind, Mood, Tier } from './HandsetCompact';

const KINDS: Kind[] = ['Movies', 'TV', 'Music'];
const TIERS: Tier[] = ['economy', 'premium', 'business'];
const FONTS = [
  ['Inter', 'Inter, system-ui, sans-serif'],
  ['SF / System', '-apple-system, BlinkMacSystemFont, system-ui, sans-serif'],
  ['Outfit', 'Outfit, Inter, system-ui, sans-serif'],
  ['Roboto', 'Roboto, system-ui, sans-serif'],
  ['Serif (Georgia)', 'Georgia, "Times New Roman", serif'],
  ['Mono', 'ui-monospace, Menlo, monospace'],
] as const;

/* ---------------- helpers ---------------- */
const hexOk = (h: string) => /^#[0-9a-f]{6}$/i.test(h);
const hexHue = (hex: string) => {
  if (!hexOk(hex)) return 200;
  const [r, g, b] = (hex.slice(1).match(/.{2}/g) as string[]).map((x) => parseInt(x, 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  const hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round(hh * 60 + 360) % 360;
};
const rgbHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const bytes = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`);
const fmtDur = (s: number) => {
  if (!isFinite(s)) return '—';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60);
  return h ? `${h}h ${m}m` : `${m}:${String(x).padStart(2, '0')}`;
};
const download = (name: string, text: string, type = 'application/json') => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

/** Load an image src, downscale to <= max px, return a persistable JPEG data URL + dominant hex. */
function processImage(src: string, max = 480): Promise<{ dataUrl: string; w: number; h: number; dominant: string }> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0, c.width, c.height);
      // dominant colour: average of saturated pixels on a 24px thumbnail
      const t = document.createElement('canvas'); t.width = t.height = 24;
      const tc = t.getContext('2d')!; tc.drawImage(img, 0, 0, 24, 24);
      const d = tc.getImageData(0, 0, 24, 24).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
        if (mx - mn > 30 && mx > 40) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
      }
      if (!n) n = 1;
      res({ dataUrl: c.toDataURL('image/jpeg', 0.82), w: img.naturalWidth, h: img.naturalHeight, dominant: rgbHex(r / n, g / n, b / n) });
    };
    img.onerror = () => rej(new Error('Could not decode image'));
    img.src = src;
  });
}

/** Minimal ID3v2.3/2.4 reader: text frames + embedded cover art (APIC). */
function readID3(buf: ArrayBuffer): { tags: Record<string, string>; cover?: Blob; version?: string } {
  const u = new Uint8Array(buf);
  if (u.length < 10 || u[0] !== 0x49 || u[1] !== 0x44 || u[2] !== 0x33) return { tags: {} };
  const ver = u[3];
  const ss = (p: number) => (u[p] << 21) | (u[p + 1] << 14) | (u[p + 2] << 7) | u[p + 3];
  const be = (p: number) => ((u[p] << 24) >>> 0) + (u[p + 1] << 16) + (u[p + 2] << 8) + u[p + 3];
  const end = Math.min(u.length, 10 + ss(6));
  const dec = (enc: number, b: Uint8Array) => {
    const label = enc === 1 ? 'utf-16' : enc === 2 ? 'utf-16be' : enc === 3 ? 'utf-8' : 'latin1';
    return new TextDecoder(label).decode(b).replace(/\0+$/g, '').replace(/\0/g, ' / ').trim();
  };
  const tags: Record<string, string> = {}; let cover: Blob | undefined;
  let p = 10;
  if (u[5] & 0x40) p += ver === 4 ? ss(10) : be(10) + 4; // extended header
  while (p + 10 < end) {
    const id = String.fromCharCode(u[p], u[p + 1], u[p + 2], u[p + 3]);
    if (!/^[A-Z0-9]{4}$/.test(id)) break;
    const size = ver === 4 ? ss(p + 4) : be(p + 4);
    if (size <= 0 || p + 10 + size > u.length) break;
    const data = u.subarray(p + 10, p + 10 + size);
    if (id[0] === 'T' && id !== 'TXXX') tags[id] = dec(data[0], data.subarray(1));
    if (id === 'APIC' && !cover) {
      const enc = data[0]; let i = 1;
      while (data[i] !== 0 && i < data.length) i++;
      const mime = new TextDecoder('latin1').decode(data.subarray(1, i)) || 'image/jpeg';
      i += 2; // null + picture type
      if (enc === 1 || enc === 2) { while (i + 1 < data.length && !(data[i] === 0 && data[i + 1] === 0)) i += 2; i += 2; }
      else { while (i < data.length && data[i] !== 0) i++; i += 1; }
      cover = new Blob([data.slice(i)], { type: mime.includes('/') ? mime : `image/${mime.toLowerCase()}` });
    }
    p += 10 + size;
  }
  return { tags, cover, version: `ID3v2.${ver}` };
}

type MediaMeta = {
  file: { name: string; type: string; size: number; lastModified: number };
  rows: [string, string][];
  draft: Item;
};

async function ingest(file: File): Promise<MediaMeta> {
  const url = URL.createObjectURL(file);
  const rows: [string, string][] = [
    ['File', file.name], ['MIME', file.type || 'unknown'], ['Size', bytes(file.size)],
    ['Modified', new Date(file.lastModified).toLocaleString()],
  ];
  const base = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  let draft: Item = { kind: 'Movies', title: base, sub: '', art: '', hue: 220, duration: 1, chapters: ['Start'] };
  try {
    if (file.type.startsWith('image/')) {
      const im = await processImage(url);
      rows.push(['Dimensions', `${im.w} × ${im.h}`], ['Aspect', (im.w / im.h).toFixed(3)], ['Dominant colour', im.dominant], ['Derived hue', `${hexHue(im.dominant)}°`]);
      draft = { ...draft, art: im.dataUrl, hue: hexHue(im.dominant), sub: 'Poster' };
    } else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      const isVideo = file.type.startsWith('video/');
      const el = document.createElement(isVideo ? 'video' : 'audio') as HTMLVideoElement;
      el.preload = 'metadata'; el.muted = true; el.src = url;
      await new Promise<void>((res, rej) => { el.onloadedmetadata = () => res(); el.onerror = () => rej(new Error('Browser cannot decode this codec')); });
      const dur = el.duration;
      rows.push(['Duration', fmtDur(dur)], ['Seconds', dur.toFixed(2)]);
      draft = { ...draft, duration: Math.max(1, Math.round(dur)), kind: isVideo ? (dur > 3600 ? 'Movies' : 'TV') : 'Music' };
      if (isVideo) {
        rows.push(['Resolution', `${el.videoWidth} × ${el.videoHeight}`]);
        el.currentTime = Math.min(dur * 0.2, 30);
        await new Promise<void>((res) => { el.onseeked = () => res(); setTimeout(res, 3000); });
        const c = document.createElement('canvas');
        const k = Math.min(1, 480 / Math.max(el.videoWidth || 1, el.videoHeight || 1));
        c.width = Math.max(1, el.videoWidth * k); c.height = Math.max(1, el.videoHeight * k);
        c.getContext('2d')!.drawImage(el, 0, 0, c.width, c.height);
        const im = await processImage(c.toDataURL('image/jpeg', 0.85));
        rows.push(['Poster frame', `@ ${fmtDur(el.currentTime)}`], ['Dominant colour', im.dominant]);
        draft = { ...draft, art: im.dataUrl, hue: hexHue(im.dominant), sub: `${isVideo ? 'Video' : ''} · ${fmtDur(dur)}`,
          chapters: Array.from({ length: Math.max(2, Math.min(8, Math.round(dur / 600))) }, (_, i) => `Chapter ${i + 1}`) };
      } else {
        const head = await file.slice(0, Math.min(file.size, 8 * 1048576)).arrayBuffer();
        const id3 = readID3(head);
        if (id3.version) rows.push(['Tag', id3.version]);
        const t = id3.tags;
        const map: [string, string][] = [['TIT2', 'Title'], ['TPE1', 'Artist'], ['TALB', 'Album'], ['TYER', 'Year'], ['TDRC', 'Year'], ['TCON', 'Genre'], ['TRCK', 'Track'], ['TBPM', 'BPM']];
        map.forEach(([k, l]) => t[k] && rows.push([l, t[k]]));
        draft = { ...draft, title: t.TIT2 || base, sub: [t.TPE1, t.TALB].filter(Boolean).join(' · ') || 'Unknown artist', chapters: ['Intro', 'Verse', 'Chorus', 'Outro'] };
        if (id3.cover) {
          const im = await processImage(URL.createObjectURL(id3.cover));
          rows.push(['Cover art', `${im.w} × ${im.h} (${id3.cover.type})`], ['Dominant colour', im.dominant]);
          draft = { ...draft, art: im.dataUrl, hue: hexHue(im.dominant) };
        } else rows.push(['Cover art', 'none embedded']);
      }
    } else {
      rows.push(['Note', 'Unsupported type — use image, audio or video']);
    }
  } catch (e) {
    rows.push(['Error', (e as Error).message]);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  return { file: { name: file.name, type: file.type, size: file.size, lastModified: file.lastModified }, rows, draft };
}

/* ---------------- small UI atoms ---------------- */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">{label}</span>
    {children}
  </label>
);
const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-white/40 font-mono';
const Btn = ({ children, onClick, id, primary }: { children: React.ReactNode; onClick: () => void; id?: string; primary?: boolean }) => (
  <button id={id} onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${primary ? 'bg-white text-black hover:bg-white/90' : 'bg-white/5 text-white/80 border border-white/10 hover:border-white/40'}`}>{children}</button>
);
function Code({ text, name, type }: { text: string; name: string; type?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-black/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
        <span className="text-[10px] font-mono text-white/50">{name}</span>
        <span className="flex gap-1.5">
          <button className="text-[10px] text-white/60 hover:text-white" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>{copied ? '✓ Copied' : 'Copy'}</button>
          <button className="text-[10px] text-white/60 hover:text-white" onClick={() => download(name, text, type)}>Download</button>
        </span>
      </div>
      <pre className="p-3 text-[10.5px] leading-relaxed text-emerald-200/90 font-mono overflow-auto max-h-64 whitespace-pre">{text}</pre>
    </div>
  );
}

/* ---------------- integrations (Go Live) ---------------- */
type IntKey = 'media' | 'player' | 'lights' | 'call' | 'cabin' | 'telemetry' | 'seatId';
const INTEGRATIONS: { k: IntKey; n: string; label: string; system: string; drives: string; hook: string; ph: string }[] = [
  { k: 'media', n: '1', label: 'Media catalog API', system: 'IFE content server / head-end (movies, TV, music, artwork)', drives: 'Menu lists, titles, artwork, durations', hook: 'getCatalog()', ph: 'https://ife.local/api/v1/catalog' },
  { k: 'player', n: '2', label: 'Seatback player API', system: 'This seat\'s monitor (e.g. Rave / Panasonic / Thales seat-box)', drives: 'Orb play/pause, scrub, volume blade, "Play on screen"', hook: 'play() · seek() · setVolume() · onPlayerState()', ph: 'https://seatbox.local/player' },
  { k: 'lights', n: '3', label: 'Reading light API', system: 'Seat lighting controller', drives: 'Light key on/off', hook: 'setReadingLight()', ph: 'https://seatbox.local/light' },
  { k: 'call', n: '4', label: 'Attendant call API', system: 'Cabin call system (chime + call light)', drives: 'Side Call key, crew status pill', hook: 'setAttendantCall()', ph: 'https://seatbox.local/call' },
  { k: 'cabin', n: '5', label: 'Cabin state / PA interrupt', system: 'Aircraft cabin system via IFE head-end (e.g. Boeing CSS, Airbus CIDS) — PA, mood lighting, seatbelt sign, flight phase', drives: 'Auto-pause on PA, cabin mood (day / night / dark), sleep dimming', hook: 'onCabinState()', ph: 'wss://ife.local/cabin' },
  { k: 'telemetry', n: '6', label: 'Telemetry (optional)', system: 'Airline analytics / MRO health', drives: 'Key usage, faults, cord health', hook: 'log()', ph: 'https://ops.airline.com/meridian' },
  { k: 'seatId', n: '•', label: 'Seat ID', system: 'Assigned per handset at install', drives: 'Routes every call to the right seat', hook: 'all calls', ph: '32C' },
];
const LS_INT = 'meridian.integrations.v1';
const KIT = [
  { f: 'meridianAdapters.ts.txt', what: 'The ONE file a developer edits to go live. Media, player, lights, call, cabin/PA, telemetry — mock included.', tag: 'Edit this' },
  { f: 'HandsetCompact.tsx.txt', what: 'Complete handset UI: 3 cabin tiers, glass keys, liquid volume, music bars, backlight, airline logo.', tag: 'Use as-is' },
  { f: 'HandsetDevPanel.tsx.txt', what: 'This Developer mode: brand editor, real-file metadata reader (ID3, video, image), exporter.', tag: 'Use as-is' },
  { f: 'volume-blade.html', what: 'Business liquid volume blade, standalone. No framework, ~3 KB. Open in any browser.', tag: 'Demo' },
  { f: 'README.txt', what: '5-step go-live guide and file map.', tag: 'Start here' },
];

/* ---------------- panel ---------------- */
type Tab = 'Go Live' | 'Brand' | 'Content' | 'Media' | 'Code' | 'Export' | 'Hardware';

export default function DevPanel({ theme, setTheme, lib, setLib, mood, onReset, onClose }: {
  theme: Theme; setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  lib: Library; setLib: React.Dispatch<React.SetStateAction<Library>>;
  mood: Mood; onReset: () => void; onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>('Brand');
  const [ints, setInts] = useState<Record<IntKey, string>>(() => {
    const empty = { media: '', player: '', lights: '', call: '', cabin: '', telemetry: '', seatId: '' };
    if (typeof window === 'undefined') return empty;
    try { return { ...empty, ...JSON.parse(localStorage.getItem(LS_INT) || '{}') }; } catch { return empty; }
  });
  const setInt = (k: IntKey, v: string) => setInts((s) => { const n = { ...s, [k]: v }; try { localStorage.setItem(LS_INT, JSON.stringify(n)); } catch { /* quota */ } return n; });
  const liveCount = INTEGRATIONS.filter((i) => i.k !== 'seatId' && i.k !== 'telemetry' && ints[i.k]).length;
  const [logoMeta, setLogoMeta] = useState<[string, string][] | null>(null);
  const [media, setMedia] = useState<MediaMeta[]>([]);
  const [busy, setBusy] = useState(false);
  const [kindTab, setKindTab] = useState<Kind>('Movies');
  const [importErr, setImportErr] = useState('');
  const logoIn = useRef<HTMLInputElement>(null);
  const mediaIn = useRef<HTMLInputElement>(null);
  const importIn = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Theme>(k: K, v: Theme[K]) => setTheme((t) => ({ ...t, [k]: v }));
  const updItem = (kind: Kind, i: number, patch: Partial<Item>) =>
    setLib((l) => ({ ...l, [kind]: l[kind].map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
  const moveItem = (kind: Kind, i: number, d: -1 | 1) => setLib((l) => {
    const a = [...l[kind]]; const j = i + d; if (j < 0 || j >= a.length) return l;
    [a[i], a[j]] = [a[j], a[i]]; return { ...l, [kind]: a };
  });

  const onLogo = async (f?: File) => {
    if (!f) return;
    const isSvg = f.type === 'image/svg+xml';
    const meta: [string, string][] = [['File', f.name], ['MIME', f.type], ['Size', bytes(f.size)]];
    if (isSvg) {
      const txt = await f.text();
      const vb = txt.match(/viewBox="([^"]+)"/)?.[1];
      meta.push(['viewBox', vb ?? '—'], ['Format', 'Vector (scales to any display)']);
      set('logoUrl', `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(txt)))}`);
    } else {
      const im = await processImage(URL.createObjectURL(f), 256);
      meta.push(['Source', `${im.w} × ${im.h}`], ['Stored', '≤256px JPEG'], ['Dominant colour', im.dominant]);
      if (im.w < 128) meta.push(['⚠', 'Under 128px — will look soft on a 2× panel']);
      // keep transparency for PNG/WebP
      if (f.type === 'image/png' || f.type === 'image/webp') {
        const r = new FileReader(); r.onload = () => set('logoUrl', r.result as string); r.readAsDataURL(f);
      } else set('logoUrl', im.dataUrl);
    }
    setLogoMeta(meta);
  };

  const onMedia = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const out: MediaMeta[] = [];
    for (const f of Array.from(files)) out.push(await ingest(f));
    setMedia((m) => [...out, ...m]); setBusy(false);
  };

  const config = useMemo(() => ({
    $schema: 'https://tahquitz.aero/schemas/meridian-handset.v1.json',
    version: 1, generated: new Date().toISOString(),
    theme, defaultMood: mood,
    tiers: { economy: { gradients: false, artwork: false, maxFps: 15 }, premium: { gradients: false, artwork: true, maxFps: 30 }, business: { gradients: true, artwork: true, maxFps: 60 } },
    backlight: { dimAfterMs: 10000, dimLevel: 0.2, wakeOn: ['anyKey', 'nowPlayingTap'] },
    integrations: { ...ints, adapter: Object.values(ints).some(Boolean) ? 'http' : 'mock' },
    library: lib,
  }), [theme, lib, mood, ints]);

  const css = `/* Meridian handset design tokens — drop into any stylesheet */
:root {
  --meridian-primary: ${theme.primary};
  --meridian-secondary: ${theme.secondary};
  --meridian-primary-hue: ${hexHue(theme.primary)};
  --meridian-secondary-hue: ${hexHue(theme.secondary)};
  --meridian-accent: hsl(var(--meridian-primary-hue) 65% 72%);
  --meridian-font: ${theme.font};
  --meridian-radius-key: 18px;
  --meridian-radius-orb: 9999px;
  --meridian-backlight-dim: 0.2;
  --meridian-backlight-timeout: 10s;
}
[data-tier="business"] {
  --meridian-gradient: linear-gradient(90deg,
    hsl(var(--meridian-primary-hue) 85% 65%),
    hsl(calc(var(--meridian-primary-hue) + 60) 85% 70%),
    hsl(calc(var(--meridian-primary-hue) + 150) 85% 70%));
}
[data-tier="economy"] { --meridian-accent: #fff; }`;

  const usage = `import HandsetCompact, { Handset, LIBRARY } from '@/components/dashboard/HandsetCompact';
import config from './meridian.config.json';

// Single handset, e.g. for the embedded device build
<Handset
  tier="business"
  label="Business" tagline=""
  mood={config.defaultMood}
  theme={config.theme}
  lib={config.library}
/>

// Full-screen on real hardware (no chrome, auto-scaled):
//   /demo?simulate=true&device=handset&kiosk=business&mood=night`;

  const onImport = async (f?: File) => {
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      if (j.theme) setTheme((t) => ({ ...t, ...j.theme }));
      if (j.library) setLib(j.library);
      setImportErr('Imported ✓');
    } catch (e) { setImportErr(`Import failed: ${(e as Error).message}`); }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="h-full flex flex-col text-white">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <p className="font-mono text-[13px] font-semibold">{'</>'} Developer mode</p>
          <p className="text-[10px] text-white/40">Live edits · saved to this browser · exportable</p>
        </div>
        <div className="flex gap-1.5">
          <Btn id="dev-reset" onClick={() => { if (confirm('Reset theme and library to defaults?')) { onReset(); setLogoMeta(null); } }}>Reset</Btn>
          <Btn id="dev-close" onClick={onClose}>✕</Btn>
        </div>
      </div>
      <div className="flex gap-1 px-5 border-b border-white/10">
        {(['Brand', 'Content', 'Media', 'Code', 'Export', 'Hardware', 'Go Live'] as Tab[]).map((t) => (
          <button key={t} id={`dev-tab-${t.toLowerCase().replace(' ', '-')}`} onClick={() => setTab(t)}
            className={`relative px-2 py-2 text-[11px] whitespace-nowrap ${tab === t ? 'text-white' : 'text-white/45 hover:text-white/80'}`}>
            {t}
            {tab === t && <motion.span layoutId="devtab" className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full" style={{ background: theme.primary }} />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-4">

            {tab === 'Go Live' && (<>
              <div className="rounded-2xl p-4 border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 0% 0%, ${theme.primary}, transparent 60%), radial-gradient(circle at 100% 100%, ${theme.secondary}, transparent 60%)` }} />
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Developer handoff</p>
                  <p className="text-[15px] font-semibold leading-snug mt-0.5">Design is approved and the code is done. Here&apos;s everything engineering needs.</p>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[['Done', 'UI, animations, 3 tiers'], ['Config', 'brand + content as JSON'], ['1 file', 'left to wire']].map(([a, b]) => (
                      <div key={a} className="rounded-xl bg-black/40 p-2.5 text-center"><p className="text-[16px] font-bold">{a}</p><p className="text-[9.5px] text-white/55 leading-tight">{b}</p></div>
                    ))}
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mt-3 mb-1">The developer receives</p>
                  <ul className="space-y-1 text-[11px] text-white/80">
                    <li>📦 <b>Source code</b>: the files running in this demo (Code tab).</li>
                    <li>🎨 <b>meridian.config.json</b>: this airline&apos;s colours, logo, font and content (Export tab).</li>
                    <li>🔌 <b>meridianAdapters.ts</b>: the only file to edit, with a slot for each aircraft system below.</li>
                    <li>⌨️ <b>Key map + kiosk URLs</b>: how the physical keys and display load (Hardware tab).</li>
                  </ul>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mt-3 mb-1">Still to do (engineering)</p>
                  <ul className="space-y-1 text-[11px] text-white/80">
                    <li>☐ Link each system below to the aircraft&apos;s real API</li>
                    <li>☐ Load onto the handset and test on the real panel</li>
                    <li>☐ Airline / aircraft certification</li>
                  </ul>
                  <div className="flex gap-1.5 mt-3">
                    <Btn primary id="dev-handoff-config" onClick={() => download('meridian.config.json', JSON.stringify(config, null, 2))}>Download handoff config</Btn>
                    <a href="/handset/kit/README.txt" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-[11px] bg-white/5 text-white/80 border border-white/10 hover:border-white/40">Open README</a>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-white/40">Aircraft integration map</p>
                <span className="text-[10px] font-mono text-white/60">{liveCount}/5 core systems connected</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden -mt-2">
                <motion.div className="h-full rounded-full" animate={{ width: `${(liveCount / 5) * 100}%` }} style={{ background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})` }} />
              </div>
              {INTEGRATIONS.map((i) => (
                <div key={i.k} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 shrink-0 rounded-full bg-white/10 text-[11px] font-bold flex items-center justify-center">{i.n}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-semibold">{i.label}</p>
                        <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full ${ints[i.k] ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-white/50'}`}>{ints[i.k] ? '● Linked' : '○ Using mock'}</span>
                      </div>
                      <p className="text-[10px] text-white/50 mt-0.5">From: {i.system}</p>
                      <p className="text-[10px] text-white/50">Drives: {i.drives}</p>
                      <input id={`dev-int-${i.k}`} className={`${inputCls} mt-2`} placeholder={i.ph} value={ints[i.k]} onChange={(e) => setInt(i.k, e.target.value)} spellCheck={false} />
                      <p className="text-[9.5px] text-white/35 font-mono mt-1">Code hook: meridianAdapters.ts → {i.hook}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Live on a plane in 5 steps</p>
                <ol className="space-y-2 text-[11px] text-white/80">
                  {[
                    ['Brand it', 'Brand tab — colours, logo, name.', 'Brand'],
                    ['Load content', 'Media tab (files) or link the catalog API above.', 'Media'],
                    ['Link systems', 'Fill the endpoints above. Developer swaps mock → httpAdapter (one line).', 'Code'],
                    ['Export + load', 'Download config, open the kiosk URL on the handset, import once.', 'Hardware'],
                    ['Validate + certify', 'Test on the target panel, then airline / aircraft approval.', 'Hardware'],
                  ].map(([a, b, t], idx) => (
                    <li key={a} className="flex gap-2">
                      <span className="w-5 h-5 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center text-black" style={{ background: theme.primary }}>{idx + 1}</span>
                      <span className="flex-1"><b>{a}</b> — {b}</span>
                      <button className="text-[10px] text-white/50 hover:text-white" onClick={() => setTab(t as Tab)}>Open →</button>
                    </li>
                  ))}
                </ol>
              </div>
              <p className="text-[9.5px] text-white/35 leading-relaxed">
                Example system names are illustrative. Actual endpoints, message formats and PA-interrupt behaviour come from the IFE vendor&apos;s and airframer&apos;s interface documents (ICDs) for each aircraft; certification is still required.
              </p>
            </>)}

            {tab === 'Code' && (<>
              <p className="text-[11px] text-white/55">The actual source running on this page — regenerated on every deploy. Open, read, download.</p>
              {KIT.map((k) => (
                <div key={k.f} className="rounded-xl border border-white/10 bg-white/[.03] p-3 flex gap-3 items-start">
                  <span className="text-[18px] leading-none mt-0.5">{k.f.endsWith('.html') ? '◧' : '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-mono font-semibold truncate">{k.f}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: k.tag === 'Edit this' ? theme.primary : 'rgba(255,255,255,.1)', color: k.tag === 'Edit this' ? '#000' : 'rgba(255,255,255,.7)' }}>{k.tag}</span>
                    </div>
                    <p className="text-[10.5px] text-white/55 mt-0.5">{k.what}</p>
                    <div className="flex gap-1.5 mt-2">
                      <a href={`/handset/kit/${k.f}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-[11px] bg-white text-black font-medium">Open</a>
                      <a href={`/handset/kit/${k.f}`} download className="px-3 py-1.5 rounded-lg text-[11px] bg-white/5 border border-white/10 text-white/80">Download</a>
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Where things live</p>
                <table className="w-full text-[10.5px]">
                  <tbody className="text-white/75">
                    {[
                      ['Business liquid volume', 'HandsetCompact → VOLUME BLADE'],
                      ['Music visualizer', 'HandsetCompact → MusicBars'],
                      ['Living gradient', 'HandsetCompact → GradientMesh'],
                      ['Glass keys + ripple', 'HandsetCompact → Glass'],
                      ['Backlight 10 s / wake', 'HandsetCompact → useHandset → touch / wake'],
                      ['Airline logo by mood', 'HandsetCompact → AirlineLogo'],
                      ['Colours / font tokens', 'Export → meridian.tokens.css'],
                      ['Aircraft APIs', 'meridianAdapters.ts'],
                    ].map(([a, b]) => (
                      <tr key={a} className="border-t border-white/5"><td className="py-1 pr-2">{a}</td><td className="py-1 font-mono text-emerald-200/80">{b}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[9.5px] text-white/35">Rename .tsx.txt → .tsx to use in a React/Next.js app (needs react, framer-motion, tailwindcss).</p>
            </>)}

            {tab === 'Brand' && (<>
              {(['primary', 'secondary'] as const).map((k) => (
                <Field key={k} label={`${k} colour`}>
                  <div className="flex gap-2 items-center">
                    <input type="color" id={`dev-${k}-picker`} value={hexOk(theme[k]) ? theme[k] : '#000000'} onChange={(e) => set(k, e.target.value)}
                      className="w-10 h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
                    <input id={`dev-${k}-hex`} className={inputCls} value={theme[k]} onChange={(e) => set(k, e.target.value)} spellCheck={false} />
                    <span className="text-[10px] text-white/40 w-12 text-right font-mono">{hexOk(theme[k]) ? `${hexHue(theme[k])}°` : 'invalid'}</span>
                  </div>
                </Field>
              ))}
              <div className="h-3 rounded-full" style={{ background: `linear-gradient(90deg, hsl(${hexHue(theme.primary)} 85% 65%), hsl(${hexHue(theme.primary) + 60} 85% 70%), hsl(${hexHue(theme.primary) + 150} 85% 70%))` }} />
              <label className="flex items-center gap-2 text-[12px] text-white/80">
                <input id="dev-follow-art" type="checkbox" checked={theme.followArt} onChange={(e) => set('followArt', e.target.checked)} />
                Tint UI from current artwork (uncheck to lock to brand colours)
              </label>
              {theme.followArt && <p className="text-[10px] text-amber-200/70 -mt-2">Colour edits apply to the logo/keys only when artwork tint is off.</p>}
              <Field label="Airline name (logo wordmark)">
                <input id="dev-airline" className={inputCls} value={theme.airline} maxLength={14} onChange={(e) => set('airline', e.target.value)} />
              </Field>
              <Field label="Typeface">
                <select id="dev-font" className={inputCls} value={theme.font} onChange={(e) => set('font', e.target.value)}>
                  {FONTS.map(([l, v]) => <option key={l} value={v} className="bg-black">{l}</option>)}
                </select>
              </Field>
              <Field label="Logo (SVG preferred · PNG/WebP keep transparency)">
                <div className="flex gap-2 items-center">
                  <div className="w-16 h-12 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden">
                    {theme.logoUrl ? <img src={theme.logoUrl} alt="logo" className="max-w-full max-h-full object-contain" /> : <span className="text-[9px] text-white/30">default</span>}
                  </div>
                  <Btn id="dev-logo-upload" primary onClick={() => logoIn.current?.click()}>Upload logo</Btn>
                  {theme.logoUrl && <Btn onClick={() => { set('logoUrl', null); setLogoMeta(null); }}>Remove</Btn>}
                  <input ref={logoIn} type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" hidden onChange={(e) => onLogo(e.target.files?.[0])} />
                </div>
              </Field>
              {logoMeta && <MetaTable rows={logoMeta} />}
            </>)}

            {tab === 'Content' && (<>
              <div className="flex gap-1">
                {KINDS.map((k) => (
                  <button key={k} onClick={() => setKindTab(k)} className={`px-3 py-1 rounded-full text-[11px] ${kindTab === k ? 'bg-white text-black' : 'bg-white/5 text-white/70'}`}>{k} · {lib[k].length}</button>
                ))}
              </div>
              {lib[kindTab].map((it, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3 flex gap-3">
                  <label className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-black/50 cursor-pointer relative group" title="Replace artwork">
                    {it.art ? <img src={it.art} alt="" className="w-full h-full object-cover" /> : <span className="absolute inset-0" style={{ background: `hsl(${it.hue} 50% 30%)` }} />}
                    <span className="absolute inset-0 bg-black/60 text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100">Replace</span>
                    <input type="file" accept="image/*" hidden onChange={async (e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                      const im = await processImage(URL.createObjectURL(f));
                      updItem(kindTab, i, { art: im.dataUrl, hue: hexHue(im.dominant) });
                    }} />
                  </label>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <input className={inputCls} value={it.title} onChange={(e) => updItem(kindTab, i, { title: e.target.value })} />
                    <input className={inputCls} value={it.sub} onChange={(e) => updItem(kindTab, i, { sub: e.target.value })} />
                    <div className="flex gap-1.5">
                      <input className={inputCls} title="Duration (seconds)" type="number" min={1} value={it.duration} onChange={(e) => updItem(kindTab, i, { duration: Math.max(1, +e.target.value || 1) })} />
                      <input className={inputCls} title="Chapters, comma separated" value={it.chapters.join(', ')} onChange={(e) => updItem(kindTab, i, { chapters: e.target.value.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12) || ['Start'] })} />
                    </div>
                    <div className="flex gap-1.5 text-[10px]">
                      <button className="text-white/50 hover:text-white" onClick={() => moveItem(kindTab, i, -1)}>↑</button>
                      <button className="text-white/50 hover:text-white" onClick={() => moveItem(kindTab, i, 1)}>↓</button>
                      <span className="text-white/30 font-mono">{fmtDur(it.duration)} · hue {it.hue}°</span>
                      <button className="ml-auto text-rose-300/70 hover:text-rose-300" onClick={() => setLib((l) => ({ ...l, [kindTab]: l[kindTab].filter((_, j) => j !== i) }))}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              <Btn id="dev-add-item" onClick={() => setLib((l) => ({ ...l, [kindTab]: [...l[kindTab], { kind: kindTab, title: 'New title', sub: 'Subtitle', art: '', hue: 220, duration: kindTab === 'Music' ? 210 : 3600, chapters: ['Start', 'Middle', 'End'] }] }))}>+ Add {kindTab.replace(/s$/, '')}</Btn>
              <p className="text-[10px] text-white/35">Tip: use the Media tab to create entries straight from real files.</p>
            </>)}

            {tab === 'Media' && (<>
              <div id="dev-media-drop" onClick={() => mediaIn.current?.click()}
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onMedia(e.dataTransfer.files); }}
                className="rounded-2xl border-2 border-dashed border-white/15 hover:border-white/40 transition p-6 text-center cursor-pointer">
                <p className="text-[13px] font-medium">{busy ? 'Reading files…' : 'Drop audio, video or images'}</p>
                <p className="text-[10px] text-white/40 mt-1">MP3 (ID3 tags + cover art) · MP4/MOV/WebM (duration, resolution, poster frame) · JPG/PNG (size, dominant colour)</p>
                <p className="text-[10px] text-white/30 mt-1">Processed locally in the browser — nothing is uploaded.</p>
                <input ref={mediaIn} type="file" multiple accept="audio/*,video/*,image/*" hidden onChange={(e) => onMedia(e.target.files)} />
              </div>
              {media.map((m, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/[.03] p-3 space-y-2">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/50 shrink-0">
                      {m.draft.art ? <img src={m.draft.art} alt="" className="w-full h-full object-cover" /> : <span className="block w-full h-full" style={{ background: `hsl(${m.draft.hue} 40% 25%)` }} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold truncate">{m.draft.title}</p>
                      <p className="text-[11px] text-white/50 truncate">{m.draft.sub}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {KINDS.map((k) => (
                          <Btn key={k} primary={m.draft.kind === k} onClick={() => setMedia((all) => all.map((x, j) => j === i ? { ...x, draft: { ...x.draft, kind: k } } : x))}>{k}</Btn>
                        ))}
                      </div>
                    </div>
                  </div>
                  <MetaTable rows={m.rows} />
                  <div className="flex gap-1.5">
                    <Btn primary onClick={() => { setLib((l) => ({ ...l, [m.draft.kind]: [m.draft, ...l[m.draft.kind]] })); setMedia((all) => all.filter((_, j) => j !== i)); }}>Add to {m.draft.kind} (first slot)</Btn>
                    <Btn onClick={() => download(`${m.file.name}.meta.json`, JSON.stringify({ file: m.file, metadata: Object.fromEntries(m.rows), item: { ...m.draft, art: m.draft.art ? '(data url)' : '' } }, null, 2))}>Metadata JSON</Btn>
                    <Btn onClick={() => setMedia((all) => all.filter((_, j) => j !== i))}>Dismiss</Btn>
                  </div>
                </div>
              ))}
            </>)}

            {tab === 'Export' && (<>
              <p className="text-[11px] text-white/50">Everything on the handsets is driven by this config. Edit anything in the other tabs and these update live.</p>
              <Code name="meridian.tokens.css" text={css} type="text/css" />
              <Code name="meridian.config.json" text={JSON.stringify(config, (k, v) => (typeof v === 'string' && v.startsWith('data:') ? `${v.slice(0, 40)}…(${bytes(v.length)})` : v), 2)} />
              <div className="flex flex-wrap gap-1.5">
                <Btn primary id="dev-download-full" onClick={() => download('meridian.config.json', JSON.stringify(config, null, 2))}>Download full config (with images)</Btn>
                <Btn id="dev-import" onClick={() => importIn.current?.click()}>Import config…</Btn>
                <input ref={importIn} type="file" accept="application/json,.json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
                {importErr && <span className="text-[10px] text-white/60 self-center">{importErr}</span>}
              </div>
              <Code name="usage.tsx" text={usage} type="text/plain" />
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Reusable assets</p>
                <ul className="text-[11px] text-white/70 space-y-1 list-disc pl-4">
                  <li><b>HandsetCompact.tsx</b> — engine (useHandset), Glass key, GradientMesh, MusicBars, AirlineLogo</li>
                  <li><b>HandsetDevPanel.tsx</b> — this tool (ID3 reader, poster-frame grabber, colour extraction)</li>
                  <li><b>/public/handset/*.jpg</b> — demo artwork ({Object.values(lib).flat().filter((x) => x.art.startsWith('/')).length} referenced)</li>
                  <li>Design tokens CSS above · config JSON schema v1</li>
                </ul>
              </div>
            </>)}

            {tab === 'Hardware' && (<>
              <div className="rounded-xl border border-white/10 p-3 space-y-1.5">
                <p className="text-[10px] uppercase tracking-widest text-white/40">Load on a device</p>
                {TIERS.map((t) => {
                  const u = `${origin}/demo?simulate=true&device=handset&kiosk=${t}&mood=auto`;
                  return (
                    <div key={t} className="flex items-center gap-2">
                      <span className="w-20 text-[11px] capitalize">{t}</span>
                      <code className="flex-1 truncate text-[10px] text-emerald-200/80">{u}</code>
                      <Btn onClick={() => navigator.clipboard.writeText(u)}>Copy</Btn>
                      <Btn onClick={() => window.open(u, '_blank')}>Open</Btn>
                    </div>
                  );
                })}
                <p className="text-[10px] text-white/40 pt-1">Kiosk mode renders one handset full-screen, auto-scaled, no chrome. Config is read from this browser&apos;s storage — on the device, use Import config once, or bake the JSON into the build.</p>
              </div>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <p className="text-[10px] uppercase tracking-widest text-white/40 p-3 pb-2">Key map (USB HID keyboard → firmware)</p>
                <table className="w-full text-[11px]">
                  <thead className="text-white/40"><tr><th className="text-left px-3 py-1 font-normal">Physical key</th><th className="text-left font-normal">Event.key</th><th className="text-left font-normal">HID usage</th></tr></thead>
                  <tbody className="font-mono text-white/80">
                    {[['Volume blade ▲', 'ArrowUp', '0x52'], ['Volume blade ▼', 'ArrowDown', '0x51'], ['Scrub ‹', 'ArrowLeft', '0x50'], ['Scrub ›', 'ArrowRight', '0x4F'], ['Orb', 'Enter', '0x28'], ['Menu', 'm', '0x10'], ['Light', 'l', '0x0F'], ['Power tap', 'p', '0x13'], ['Power hold', 's', '0x16'], ['Call (side)', 'c', '0x06']].map(([a, b, c]) => (
                      <tr key={a} className="border-t border-white/5"><td className="px-3 py-1 font-sans">{a}</td><td>{b}</td><td>{c}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border border-white/10 p-3 text-[11px] text-white/70 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Reference target</p>
                <p>Display: 2″×5″ IPS/OLED, 400×1000 px (2× of the 200×500 layout), ≥500 nits.</p>
                <p>Runtime: Chromium kiosk / WPE WebKit on ARM SoC (e.g. i.MX 8M Mini), 1 GB RAM.</p>
                <p>Frame budget: Economy 15 fps (static), Premium 30 fps, Business 60 fps.</p>
                <p>Backlight: dim to 20% after 10 s idle; any key or now-playing tap restores 100%.</p>
                <p>Cord: USB-C (power + HID + optional audio) to seat box; seatback link via the seat box&apos;s IFE API.</p>
                <p className="text-white/40">Not tested on physical hardware yet — validate frame rate and contrast on the actual panel.</p>
              </div>
            </>)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetaTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full text-[10.5px] rounded-lg overflow-hidden">
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={i} className="border-t border-white/5">
            <td className="py-1 pr-3 text-white/40 whitespace-nowrap align-top">{k}</td>
            <td className="py-1 text-white/85 font-mono break-all">
              {/^#[0-9a-f]{6}$/i.test(v) && <span className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5 align-middle" style={{ background: v }} />}{v}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
