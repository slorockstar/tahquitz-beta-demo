/* =========================================================
   MERIDIAN HANDSET — AIRCRAFT INTEGRATION ADAPTERS
   ---------------------------------------------------------
   This is the ONLY file a developer needs to touch to make the
   handset live on an aircraft. The UI never talks to hardware
   directly; it calls these functions. Each one ships with a
   working mock so the demo runs with zero backend.

   To go live: replace each `mock` body with a call to your
   system, or set the endpoint in Developer mode → Go Live and
   use the provided `httpAdapter`.
   ========================================================= */

export type MediaItem = { id: string; kind: 'Movies' | 'TV' | 'Music'; title: string; sub: string; art: string; duration: number; chapters: string[] };
export type PlayerState = { itemId: string; positionSec: number; playing: boolean; volume: number /* 0-10 */ };
export type CabinState = { phase: 'boarding' | 'taxi' | 'cruise' | 'descent'; lightsDimmed: boolean; seatbeltSign: boolean; paActive: boolean };

export interface MeridianAdapters {
  /** 1. MEDIA CATALOG — IFE content server (e.g. seat-box / head-end media API). */
  getCatalog(): Promise<MediaItem[]>;
  /** 2. SEATBACK PLAYER — send commands to this seat's monitor. */
  play(itemId: string): Promise<void>;
  setPlaying(playing: boolean): Promise<void>;
  seek(positionSec: number): Promise<void>;
  setVolume(level: number): Promise<void>;
  onPlayerState(cb: (s: PlayerState) => void): () => void;
  /** 3. READING LIGHT — seat lighting controller. */
  setReadingLight(on: boolean): Promise<void>;
  /** 4. ATTENDANT CALL — cabin call system (chime + call light). */
  setAttendantCall(active: boolean): Promise<void>;
  /** 5. CABIN STATE — PA announcements, mood lighting, seatbelt sign, flight phase.
   *  When paActive = true the handset must duck/pause audio (regulatory). */
  onCabinState(cb: (s: CabinState) => void): () => void;
  /** 6. TELEMETRY — key presses, errors, battery/cord health (optional). */
  log(event: string, data?: Record<string, unknown>): void;
}

/* ---------- Mock: used by the demo, no backend required ---------- */
export const mockAdapters: MeridianAdapters = {
  async getCatalog() { return []; },
  async play() {}, async setPlaying() {}, async seek() {}, async setVolume() {},
  onPlayerState() { return () => {}; },
  async setReadingLight() {},
  async setAttendantCall() {},
  onCabinState(cb) { cb({ phase: 'cruise', lightsDimmed: false, seatbeltSign: false, paActive: false }); return () => {}; },
  log(e, d) { if (typeof console !== 'undefined') console.debug('[meridian]', e, d ?? ''); },
};

/* ---------- Generic HTTP/WebSocket adapter: fill endpoints, done ---------- */
export type Endpoints = { media: string; player: string; lights: string; call: string; cabin: string; telemetry: string; seatId: string };

export function httpAdapter(ep: Endpoints): MeridianAdapters {
  const post = (url: string, body: unknown) =>
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seat: ep.seatId, ...(body as object) }) }).then(() => undefined);
  const stream = <T,>(url: string, cb: (x: T) => void) => {
    if (!url) return () => {};
    const ws = new WebSocket(url.replace(/^http/, 'ws') + `?seat=${encodeURIComponent(ep.seatId)}`);
    ws.onmessage = (m) => { try { cb(JSON.parse(m.data)); } catch { /* ignore */ } };
    return () => ws.close();
  };
  return {
    getCatalog: () => fetch(ep.media).then((r) => r.json()),
    play: (itemId) => post(`${ep.player}/play`, { itemId }),
    setPlaying: (playing) => post(`${ep.player}/state`, { playing }),
    seek: (positionSec) => post(`${ep.player}/seek`, { positionSec }),
    setVolume: (level) => post(`${ep.player}/volume`, { level }),
    onPlayerState: (cb) => stream(`${ep.player}/events`, cb),
    setReadingLight: (on) => post(ep.lights, { on }),
    setAttendantCall: (active) => post(ep.call, { active }),
    onCabinState: (cb) => stream(ep.cabin, cb),
    log: (event, data) => { if (ep.telemetry) navigator.sendBeacon?.(ep.telemetry, JSON.stringify({ seat: ep.seatId, event, data, t: Date.now() })); },
  };
}
