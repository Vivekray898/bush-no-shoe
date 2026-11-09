// Timeline of the bush-shoe short: shots timed to the voice words (~/bush-shoe-short/voice/words.json),
// 67.10 s, 188 words, TOTAL = 2013 f @ 30 fps. Camera grammar from the skill: continuous slow push-ins;
// symmetric smootherstep glides 18-40 f; big reframes are cuts; impacts are 7-frame kicks that flip sign
// every frame; no hand-held float. Every visual reaction lands 0-3 frames BEFORE its word.
export const FPS = 30;
export const TOTAL = 2013;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};

// ---------------- the room (metres; floor y = 0, podium at the back, z = -4.2) ----------------
// Cameras look toward -z (the podium). Screen-right is +x. US flag on the viewer's left (-x),
// Iraq flag on the viewer's right (+x), both behind the podium.
export const PODIUM: V3 = [0, 0, -4.2];
export const BUSH_AT: V3 = [0, 0, -4.9];
export const MALIKI_AT: V3 = [1.05, 0, -4.9];
export const ZAIDI_AT: V3 = [1.2, 0, 0.2];
export const FLAG_US: V3 = [-1.7, 0, -5.3];
export const FLAG_IQ: V3 = [1.7, 0, -5.3];
export const GUARD_L: V3 = [-2.4, 0, -3.4];
export const GUARD_R: V3 = [2.4, 0, -3.4];
export const ROWS_Z = [0.2, 1.8, 3.4, 5.0];
export const COLS_X = [-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6];
// Bush's head height (eyes) and the podium top, for DOF focus points
export const BUSH_EYES: V3 = [0, 1.55, -4.9];
export const SHOE_REST: V3 = [0.3, 0.1, -3.6]; // shoe 1 lying on the floor after throw 1

// ---------------- word-timed beats (from words.json; frames @ 30 fps) ----------------
// "Twice." 4.24-4.68 s -> f127-140; flash right after it.
// al-Zaidi "stands" 20.24 s -> f607; throw 1 "throws" 25.00 s -> f750; "Bush ducks" 26.04 s -> f781.
// throw 2 "throws" 28.26 s -> f848; "Bush ducks again" 31.78 s -> f953; shoe hits the flag ~"flag" 35.66 s -> f1070.
// "Luckily," 37.74 s -> f1132; "Unluckily" 40.12 s -> f1204; "dodgeball" 46.56 s -> f1397;
// "jailed for nine months" 54.44 s -> f1633; "size 10 shoe" 61.74 s -> f1852.
export const DUCK1_F = 781, DUCK2_F = 953, REPLAY_DUCK_F = 1441;
export const FLAG_HIT_F = 1070;
export const STAND_F = 607;

/** Bush's duck dip (metres down): starts 2 f before the "ducks" word, down and back up over 10 f. */
export const duckDip = (f: number, f0: number) => {
  const n = f - f0;
  if (n < -2 || n > 8) return 0;
  return 0.35 * Math.sin(Math.PI * clamp01((n + 2) / 10));
};
/** al-Zaidi's stand-up: 0 seated .. 1 standing, over ~12 f from f604 (2 f before "stands"). */
export const zaidiStandU = (f: number) => smooth((f - 604) / 12);

const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
/** shoe 1: straight line from al-Zaidi's hand (he has stepped forward to z 0.7) to the podium, f750-780. */
export const shoe1At = (f: number): { pos: V3; rot: number } | null => {
  if (f < 750 || f > 782) return null;
  const u = (f - 750) / 30;
  return { pos: lerp3([1.2, 1.5, 0.7], [0.1, 1.6, -4.3], u), rot: u * 4 };
};
/** shoe 2: hand -> past Bush (at the f953 duck) -> US flag (hit ~f1070). */
export const shoe2At = (f: number): { pos: V3; rot: number } | null => {
  if (f < 855 || f > 1072) return null;
  if (f <= 955) { const u = (f - 855) / 100; return { pos: lerp3([1.2, 1.5, 0.7], [0, 1.65, -4.4], u), rot: u * 5 }; }
  const u = (f - 955) / 115;
  return { pos: lerp3([0, 1.65, -4.4], [-1.7, 2.2, -5.25], u), rot: 5 + u * 3 };
};
/** explanation replay (shot 7): the shoe sails level past Bush in side view, f1380-1450. Starts mid-room
 *  (z -2.0) so it is already in frame when the analogy starts. */
export const replayShoeAt = (f: number): { pos: V3; rot: number } | null => {
  if (f < 1380 || f > 1450) return null;
  const u = (f - 1380) / 70;
  return { pos: lerp3([0, 1.6, -2.0], [0, 1.6, -5.5], u), rot: u * 6 };
};
/** US flag wobble after the hit: decaying oscillation, starts at the flag-hit frame. */
export const flagWobble = (f: number) => {
  if (f < FLAG_HIT_F) return 0;
  const dt = f - FLAG_HIT_F;
  return 0.3 * Math.exp(-dt / 70) * Math.sin(dt * 0.3);
};

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type Crowd = "press" | "none";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; tau: (t: number) => number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 156, light: "day", crowd: "press", tau: (t) => t },      // hook wide
  { id: 2, a: 156, b: 501, light: "day", crowd: "press", tau: (t) => t },    // setting: podium MS
  { id: 3, a: 501, b: 814, light: "day", crowd: "press", tau: (t) => t },    // throw 1 (stand f607, throw f750, duck f781)
  { id: 4, a: 814, b: 1117, light: "day", crowd: "press", tau: (t) => t },   // throw 2 (duck f953, flag hit f1070)
  { id: 5, a: 1117, b: 1287, light: "day", crowd: "press", tau: (t) => t },  // deadpan (Luckily f1132, Unluckily f1204)
  { id: 6, a: 1287, b: 1529, light: "day", crowd: "press", tau: (t) => t },  // explanation: dodgeball replay
  { id: 7, a: 1529, b: 1721, light: "day", crowd: "press", tau: (t) => t },  // consequence: guards lead him out
  { id: 8, a: 1721, b: 1905, light: "day", crowd: "press", tau: (t) => t },  // callback: size-10 joke, shoe CU
  { id: 9, a: 1905, b: TOTAL, light: "day", crowd: "press", tau: (t) => t }, // final wide, tail to f2013
];
/** hard cuts only in this short (no place/time crossfades); a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = {};
export const FLASH_AT = 140;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** layers to draw at frame f: base shot, plus the next shot fading in during a crossfade */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- camera ----------------
// Grammar (motion.md): every move is a symmetric smootherstep glide of 18-40 f; a reframe bigger than about
// half a frame width or 40 % zoom is a hard cut on its key frame. Glides are centred on the old key frame.
// Holds push in (dolly toward the look point or a fov zoom): 0.15-0.35 %/f, ~0.6 %/f for ~35 f on punch words.
// Rolls of 4-5 deg over >= 18 f on emphasis beats. No hand-held float.
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
/** reference camera ease: symmetric smootherstep (attack = release, ~10 f each on a 23 f move) */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (with 8 f soft edges) for the first n frames */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** dolly push: camera slides toward the look point by factor k */
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** zoom push (camera stays put, for lenses next to walls): tan(fov/2) shrinks by k */
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });

// ---- framings (f -> camera); each pushes in from the frame its key starts ----
// shot 1 (hook wide): high wide from behind the press rows, slow push-in. Look slightly down (look y 1.05)
// so the top third is not dead blank wall.
const S1a = (f: number) => dolly([0, 3.1, 9.8], [0, 1.05, -3.5], pushK(f, 0, 0.0025), { fov: 46 });
const S1b = (f: number) => dolly([0, 2.9, 8.6], [0, 1.05, -3.8], pushK(f, 70, 0.002), { fov: 46 });
// shot 2 (setting): podium MS — Bush + al-Maliki at the microphones, flags behind.
// Higher, further back, narrower lens than the first pass: from low and close the podium filled the frame and
// Bush was only a head peeking over it. From here his head + shoulders read over the 1.0 m podium.
const S2a = (f: number) => dolly([0.6, 2.5, 2.8], [0.4, 1.45, -4.9], pushK(f, 156, 0.002), { fov: 30 });
const S2b = (f: number) => dolly([0.4, 2.4, 1.8], [0.4, 1.5, -4.9], pushK(f, 320, 0.0018), { fov: 28 });
// shot 3 (throw 1): 3/4 from the right, high over the press rows, al-Zaidi + podium both in frame; cut closer
// for the throw. The cut is a ZOOM, not a dolly: dollying in from the side pushed al-Zaidi (close to the lens,
// far off the look axis) to the frame edge in the r4/r5 stills. A zoom keeps his screen position and just
// makes the throw bigger.
const S3a = (f: number) => dolly([3.2, 2.6, 7.0], [0.4, 1.2, -2.0], pushK(f, 501, 0.002), { fov: 44 });
const S3b = (f: number) => zoom([3.2, 2.6, 7.0], [0.4, 1.2, -2.0], 40, pushK(f, 700, 0.002));
// shot 4 (throw 2): wider, straight down the room so the flag hit reads
const S4a = (f: number) => dolly([0, 2.4, 8.0], [0, 1.6, -4.6], pushK(f, 814, 0.0018), { fov: 44 });
const S4b = (f: number) => dolly([0, 2.2, 7.0], [-0.3, 1.7, -4.8], pushK(f, 950, 0.002), { fov: 42 });
// shot 5 (deadpan): Bush CU, cut to the flag on "Unluckily" (roll 4 deg), cut back to Bush
const S5a = (f: number) => dolly([0.4, 2.0, -1.0], [0, 1.5, -4.9], pushK(f, 1117, 0.003), { fov: 30 });
const S5b = (f: number) => dolly([-1.7, 2.4, -2.8], [-1.7, 2.2, -5.3], pushK(f, 1204, 0.002), { fov: 30, roll: 0.07 });
const S5c = (f: number) => dolly([-0.3, 2.0, -1.2], [0, 1.5, -4.9], pushK(f, 1236, 0.003), { fov: 30 });
// shot 6 (explanation): the replayed shoe sails level past Bush as he dips. A true side view does not work here:
// the shoe's path (along z at x = 0) is nearly radial from any +x camera, so the shoe is out of frame for most
// of its flight and the podium guard blocks Bush. A 3/4 front view keeps the whole line in frame and the shoe
// centred on Bush at the dip (f1441). The replay starts mid-room (z -2.0) so it is already in frame at "dodgeball".
const S6a = (f: number) => dolly([3.0, 1.8, 3.0], [0, 1.4, -4.6], pushK(f, 1287, 0.002), { fov: 40 });
const S6b = (f: number) => dolly([2.6, 1.8, 2.2], [0, 1.4, -4.7], pushK(f, 1400, 0.002), { fov: 38 });
// shot 7 (consequence): guards close in on al-Zaidi, then follow the escort out. Tighter and lower than the
// first pass (which left the group small under a big blank wall).
const S7a = (f: number) => dolly([-3.2, 1.9, 3.6], [1.2, 1.0, 0.6], pushK(f, 1529, 0.002), { fov: 40 });
const S7b = (f: number) => dolly([-2.4, 1.9, 4.2], [1.8, 1.0, 2.0], pushK(f, 1640, 0.002), { fov: 40 });
// shot 8 (callback): podium again, Bush joking; cut to the shoe CU on "size 10"
const S8a = (f: number) => dolly([0.5, 2.2, 1.2], [0, 1.45, -4.9], pushK(f, 1721, 0.0025), { fov: 32 });
const S8b = (f: number) => dolly([1.6, 1.6, 0.8], [0.2, 0.35, -3.8], pushK(f, 1852, 0.002), { fov: 38 });
// shot 9 (final wide): the whole room, flag still wobbling slightly
const S9a = (f: number) => dolly([0, 3.1, 9.2], [0, 1.05, -3.5], pushK(f, 1905, 0.002), { fov: 46 });

const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0, s: S1a },
    { f: 70, dur: 40, s: S1b },
  ],
  2: [
    { f: 156, s: S2a },
    { f: 320, dur: 30, s: S2b },
  ],
  3: [
    { f: 501, s: S3a }, // cut on the paragraph break
    { f: 700, cut: true, s: S3b }, // cut closer for the shout + throw
  ],
  4: [
    { f: 814, s: S4a }, // cut on the paragraph break
    { f: 950, dur: 30, s: S4b }, // centred on 965, closer for the second duck
  ],
  5: [
    { f: 1117, s: S5a }, // cut on the paragraph break
    { f: 1204, cut: true, s: S5b }, // cut to the flag on "Unluckily", roll 4 deg
    { f: 1236, cut: true, s: S5c }, // cut back to Bush
  ],
  6: [
    { f: 1287, s: S6a }, // cut on the paragraph break
    { f: 1400, dur: 30, s: S6b }, // centred on 1415, closer for the replayed duck
  ],
  7: [
    { f: 1529, s: S7a }, // cut on the paragraph break
    { f: 1640, dur: 30, s: S7b }, // follow the escort out
  ],
  8: [
    { f: 1721, s: S8a }, // cut on the paragraph break
    { f: 1852, cut: true, s: S8b }, // cut to the shoe CU on "size 10"
  ],
  9: [{ f: 1905, s: S9a }],
};

// impact kicks: the image offset flips sign every frame (~3 px at 720p per unit), decays to 0 in
// 7 f, roll +-0.23 deg per unit; they start on the first frame at/after the event. No hand-held float.
// Events (seconds): throw 1 (25.00), duck 1 (26.04), throw 2 (28.26), duck 2 (31.78), flag hit (35.66).
const KICKS: [number, number][] = [[25.0, 0.6], [26.04, 0.7], [28.26, 0.6], [31.78, 0.7], [35.66, 0.9]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(f / FPS);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a; // metres at the look distance for 3 px x a
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
/** frame at which the current key's move has finished (for picking billboard views per key, not per frame) */
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};

// ---------------- lens: depth of field ----------------
/** Lens blur per shot (thin lens). cInf = blur-disc radius in px at 1080x1920 for things at infinity; 0 = all sharp.
 *  Entries switch on cuts (no dur) or ramp with the camera glide they share f/dur with. focus = world point (else the
 *  camera look point). */
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 0 }, // hook wide: establishing, sharp
  { f: 156, cInf: 10, focus: () => BUSH_EYES }, // setting MS, Bush's eyes
  { f: 501, cInf: 12, focus: () => [ZAIDI_AT[0], 1.3, ZAIDI_AT[2]] }, // throw 1: al-Zaidi sharp
  { f: 700, dur: 30, cInf: 12, focus: () => [ZAIDI_AT[0], 1.4, ZAIDI_AT[2]] },
  { f: 814, cInf: 10, focus: () => BUSH_EYES }, // throw 2: Bush sharp
  { f: 1117, cInf: 14, focus: () => BUSH_EYES }, // deadpan CU
  { f: 1204, cInf: 12, focus: () => [FLAG_US[0], 2.2, FLAG_US[2]] }, // the flag
  { f: 1236, cInf: 14, focus: () => BUSH_EYES },
  { f: 1287, cInf: 10, focus: () => BUSH_EYES }, // explanation side view
  { f: 1529, cInf: 8, focus: () => [ZAIDI_AT[0], 1.0, ZAIDI_AT[2]] }, // consequence
  { f: 1721, cInf: 12, focus: () => BUSH_EYES }, // callback
  { f: 1852, cInf: 14, focus: () => SHOE_REST }, // shoe CU
  { f: 1905, cInf: 0 }, // final wide: sharp
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
/** what the lens focuses on (DOF): the DOF table's focus point, else the camera look point */
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};

/** near framing objects: none in the press room (the room is small; a foreground prop would sit < 2 m from a lens
 *  and read as a cut-off blob). Kept as an empty list so world.ts keeps its toggle machinery. */
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
