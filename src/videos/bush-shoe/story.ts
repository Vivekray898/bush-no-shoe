// Timeline of the bush-shoe short: shots timed to the voice words (~/bush-shoe-short/voice/words.json),
// 67.802 s, 188 words, TOTAL = 2034 f @ 30 fps. Re-timed 9 Nov 2026 from the Kokoro voice
// (67.10 s / 2013 f) to the ElevenLabs Brian voice; old -> new table in RETIME.md. Camera grammar
// from the skill: continuous slow push-ins;
// symmetric smootherstep glides 18-40 f; big reframes are cuts; impacts are 7-frame kicks that flip sign
// every frame; no hand-held float. Every visual reaction lands 0-3 frames BEFORE its word.
export const FPS = 30;
export const TOTAL = 2034;
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
// FIX2: Maliki moved 1.05 -> 1.35 — at 1.05 the podium's right corner (x 0.9) cut him in half in the
// podium MS (screenshot 2: left half hidden behind the podium edge). At 1.35 he clears the corner.
export const MALIKI_AT: V3 = [1.35, 0, -4.9];
export const ZAIDI_AT: V3 = [1.2, 0, 0.2];
export const FLAG_US: V3 = [-1.7, 0, -5.3];
export const FLAG_IQ: V3 = [1.7, 0, -5.3];
// FIX1 (9 Nov 2026): guards pulled in from +-2.4 to +-2.0 and outer press columns from +-3.6 to +-3.0 —
// both were half-cut at the frame edges of the wide shots. 1.2 is kept so al-Zaidi's chair stays at x = 1.2.
// (build.ts COLS_X was narrowed identically; chairs, press and al-Zaidi's seat all stay aligned.)
export const GUARD_L: V3 = [-2.0, 0, -3.4];
export const GUARD_R: V3 = [2.0, 0, -3.4];
export const ROWS_Z = [0.2, 1.8, 3.4, 5.0];
export const COLS_X = [-3.0, -2.0, -1.2, 0, 1.2, 2.0, 3.0];
// Bush's head height (eyes) and the podium top, for DOF focus points
// FIX2: eyes 1.55 -> 1.45 — Bush's figure is 1.68 m at scale 1.0 (was 1.48 m at 0.88), eyes at ~1.44 m.
export const BUSH_EYES: V3 = [0, 1.45, -4.9];
export const SHOE_REST: V3 = [0.3, 0.1, -3.6]; // shoe 1 lying on the floor after throw 1

// ---------------- word-timed beats (from words.json; frames @ 30 fps) ----------------
// "Twice." 4.30-4.58 s -> f129-137; flash right after it.
// al-Zaidi "stands" 19.96 s -> f599; throw 1 "throws" 24.98 s -> f749; "Bush ducks" 26.56 s -> f797.
// throw 2 "throws" 27.76 s -> f833; "Bush ducks again" 31.56 s -> f947; shoe hits the flag ~"flag" 35.98 s -> f1079.
// "Luckily," 37.50 s -> f1125; "Unluckily" 40.10 s -> f1203; "dodgeball" 46.62 s -> f1399;
// "jailed for nine months" 54.46 s -> f1634; "size 10 shoe" 61.80 s -> f1854.
export const DUCK1_F = 797, DUCK2_F = 947, REPLAY_DUCK_F = 1442;
export const FLAG_HIT_F = 1079;
export const STAND_F = 599;

/** Bush's duck dip (metres down): starts 2 f before the "ducks" word, down and back up over 10 f. */
export const duckDip = (f: number, f0: number) => {
  const n = f - f0;
  if (n < -2 || n > 8) return 0;
  return 0.35 * Math.sin(Math.PI * clamp01((n + 2) / 10));
};
/** al-Zaidi's stand-up: 0 seated .. 1 standing, over ~12 f from f596 (3 f before "stands"). */
export const zaidiStandU = (f: number) => smooth((f - 596) / 12);

const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
/** shoe 1: straight line from al-Zaidi's hand (he has stepped forward to z 0.7) to the podium, f749-797. */
export const shoe1At = (f: number): { pos: V3; rot: number } | null => {
  if (f < 749 || f > 798) return null;
  const u = (f - 749) / 48;
  return { pos: lerp3([1.2, 1.5, 0.7], [0.1, 1.6, -4.3], u), rot: u * 4 };
};
/** shoe 2: hand -> past Bush (at the f947 duck) -> US flag (hit ~f1079). */
export const shoe2At = (f: number): { pos: V3; rot: number } | null => {
  if (f < 840 || f > 1081) return null;
  if (f <= 949) { const u = (f - 840) / 109; return { pos: lerp3([1.2, 1.5, 0.7], [0, 1.65, -4.4], u), rot: u * 5 }; }
  const u = (f - 949) / 132;
  return { pos: lerp3([0, 1.65, -4.4], [-1.7, 2.2, -5.25], u), rot: 5 + u * 3 };
};
/** explanation replay (shot 7): the shoe sails level past Bush in side view, f1382-1451. Starts mid-room
 *  (z -2.0) so it is already in frame when the analogy starts. */
export const replayShoeAt = (f: number): { pos: V3; rot: number } | null => {
  if (f < 1382 || f > 1451) return null;
  const u = (f - 1382) / 69;
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
  { id: 1, a: 0, b: 149, light: "day", crowd: "press", tau: (t) => t },      // hook wide
  { id: 2, a: 149, b: 500, light: "day", crowd: "press", tau: (t) => t },    // setting: podium MS
  { id: 3, a: 500, b: 814, light: "day", crowd: "press", tau: (t) => t },    // throw 1 (stand f599, throw f749, duck f797)
  { id: 4, a: 814, b: 1117, light: "day", crowd: "press", tau: (t) => t },   // throw 2 (duck f947, flag hit f1079)
  { id: 5, a: 1117, b: 1289, light: "day", crowd: "press", tau: (t) => t },  // deadpan (Luckily f1125, Unluckily f1203)
  { id: 6, a: 1289, b: 1534, light: "day", crowd: "press", tau: (t) => t },  // explanation: dodgeball replay
  { id: 7, a: 1534, b: 1708, light: "day", crowd: "press", tau: (t) => t },  // consequence: guards lead him out
  { id: 8, a: 1708, b: 1907, light: "day", crowd: "press", tau: (t) => t },  // callback: size-10 joke, shoe CU
  { id: 9, a: 1907, b: TOTAL, light: "day", crowd: "press", tau: (t) => t }, // final wide, tail to f2034
];
/** hard cuts only in this short (no place/time crossfades); a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = {};
export const FLASH_AT = 137;

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
// shot 1 (hook wide): high wide from behind the press rows, slow push-in. FIX1: pulled back 0.4 m and
// look raised to y 1.2 — the outer press members were half-cut at the edges, and the upper wall (now
// decorated with cornice/portraits/sconces) is worth showing instead of cropping it out.
// FIX2 round 2: push rates halved (0.0025/0.002 -> 0.0012/0.001). The fast push carried the camera from
// z 10.2 to ~z 5.8 by the end of the shot, so the near rows ended up under/behind the lens and the far
// rows' outer columns drifted to the frame edges, where the edge cull removed them — the wides came out
// nearly empty (r1_70 / r1_2033). A slow push keeps the crowd in frame.
const S1a = (f: number) => dolly([0, 3.1, 10.2], [0, 1.2, -3.5], pushK(f, 0, 0.0012), { fov: 46 });
const S1b = (f: number) => dolly([0, 2.9, 9.0], [0, 1.2, -3.8], pushK(f, 52, 0.001), { fov: 46 });
// shot 2 (setting): podium MS — Bush + al-Maliki at the microphones, flags behind.
// FIX2: pulled right back and widened (was z 2.8/1.8, fov 30/28): at fov 30 the visible half-width at the
// flags was only ~1.2 m, so BOTH flags were half-cut at the frame edges (screenshot 2) and Bush was a small
// head over a huge podium. Now z 4.0/3.4, fov 48: half-width ~2.2 m at the flags (they span +-1.7 m),
// centred on x 0, and with Bush at scale 1.0 his head AND shoulders read over the 1.0 m podium.
// FIX2 round 2: fov 46 -> 48 and push rates slowed (0.002/0.0018 -> 0.0015/0.001) — at f300 the first
// version's push had already carried the camera to z ~1.7, where the half-width at the flags is only
// ~1.67 m, so the US pole was just-cut at the left edge again (r1_300). The slower push keeps the poles
// in frame through the whole shot.
const S2a = (f: number) => dolly([0.2, 2.5, 4.0], [0, 1.45, -4.9], pushK(f, 149, 0.0015), { fov: 48 });
const S2b = (f: number) => dolly([0.2, 2.4, 3.4], [0, 1.5, -4.9], pushK(f, 315, 0.001), { fov: 48 });
// shot 3 (throw 1): 3/4 from the right, high over the press rows, al-Zaidi + podium both in frame; cut closer
// for the throw. The cut is a ZOOM, not a dolly: dollying in from the side pushed al-Zaidi (close to the lens,
// far off the look axis) to the frame edge in the r4/r5 stills. A zoom keeps his screen position and just
// makes the throw bigger.
const S3a = (f: number) => dolly([3.2, 2.6, 7.0], [0.4, 1.2, -2.0], pushK(f, 500, 0.002), { fov: 44 });
const S3b = (f: number) => zoom([3.2, 2.6, 7.0], [0.4, 1.2, -2.0], 40, pushK(f, 693, 0.002));
// shot 4 (throw 2): wider, straight down the room so the flag hit reads
// FIX1: pulled back 0.4 m (same reason as shot 1 — edge figures were half-cut).
// FIX2: fov widened 44->48 / 42->46 — in the r1 f950 still the guards at +-2.0 were still half-cut
// at the extreme left/right edges; the wider lens gives them margin without moving them (they must
// stay wide of Maliki at x 1.05).
const S4a = (f: number) => dolly([0, 2.4, 8.4], [0, 1.6, -4.6], pushK(f, 814, 0.0018), { fov: 48 });
const S4b = (f: number) => dolly([0, 2.2, 7.4], [-0.3, 1.7, -4.8], pushK(f, 944, 0.002), { fov: 46 });
// shot 5 (deadpan): Bush CU, cut to the flag on "Unluckily" (roll 4 deg), cut back to Bush
const S5a = (f: number) => dolly([0.4, 2.0, -1.0], [0, 1.5, -4.9], pushK(f, 1117, 0.003), { fov: 30 });
const S5b = (f: number) => dolly([-1.7, 2.4, -2.8], [-1.7, 2.2, -5.3], pushK(f, 1203, 0.002), { fov: 30, roll: 0.07 });
const S5c = (f: number) => dolly([-0.3, 2.0, -1.2], [0, 1.5, -4.9], pushK(f, 1246, 0.003), { fov: 30 });
// shot 6 (explanation): the replayed shoe sails level past Bush as he dips. A true side view does not work here:
// the shoe's path (along z at x = 0) is nearly radial from any +x camera, so the shoe is out of frame for most
// of its flight and the podium guard blocks Bush. A 3/4 front view keeps the whole line in frame and the shoe
// centred on Bush at the dip (f1442). The replay starts mid-room (z -2.0) so it is already in frame at "dodgeball".
const S6a = (f: number) => dolly([3.0, 1.8, 3.0], [0, 1.4, -4.6], pushK(f, 1289, 0.002), { fov: 40 });
const S6b = (f: number) => dolly([2.6, 1.8, 2.2], [0, 1.4, -4.7], pushK(f, 1401, 0.002), { fov: 38 });
// shot 7 (consequence): guards close in on al-Zaidi, then follow the escort out. Tighter and lower than the
// first pass (which left the group small under a big blank wall).
// FIX2: look lowered to y 0.85 — the r1 f1600 still showed a big blank cream side wall above the group
// (the side-wall portraits added in build.ts fill the top, and the lower look shows less of it).
const S7a = (f: number) => dolly([-3.2, 1.9, 3.6], [1.2, 0.85, 0.6], pushK(f, 1534, 0.002), { fov: 40 });
const S7b = (f: number) => dolly([-2.4, 1.9, 4.2], [1.8, 0.85, 2.0], pushK(f, 1641, 0.002), { fov: 40 });
// shot 8 (callback): podium again, Bush joking; cut to the shoe CU on "size 10"
// FIX2: was z 1.2, fov 32 — at fov 32 the half-width at the flags is ~1.05 m against flags at +-1.7 m,
// so the flags were cut and Maliki (now at x 1.35) half-cut, same maths as shot 2. Now z 3.6, fov 48
// (half-width ~2.0 m), centred on x 0, matching shot 2's framing.
// FIX2 round 2: fov 44 -> 48, push rate 0.0025 -> 0.0015 — same pole-cut reason as shot 2 (r1_300).
const S8a = (f: number) => dolly([0.2, 2.3, 3.6], [0, 1.45, -4.9], pushK(f, 1708, 0.0015), { fov: 48 });
const S8b = (f: number) => dolly([1.6, 1.6, 0.8], [0.2, 0.35, -3.8], pushK(f, 1854, 0.002), { fov: 38 });
// shot 9 (final wide): the whole room, flag still wobbling slightly
// FIX1: pulled back 0.4 m, look raised to y 1.2 (same as shot 1).
// FIX2 round 2: push rate 0.002 -> 0.001 — same empty-wide reason as shot 1 (r1_2033).
const S9a = (f: number) => dolly([0, 3.1, 9.6], [0, 1.2, -3.5], pushK(f, 1907, 0.001), { fov: 46 });

const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0, s: S1a },
    { f: 52, dur: 40, s: S1b },
  ],
  2: [
    { f: 149, s: S2a },
    { f: 315, dur: 30, s: S2b },
  ],
  3: [
    { f: 500, s: S3a }, // cut on the paragraph break
    { f: 693, cut: true, s: S3b }, // cut closer for the shout + throw
  ],
  4: [
    { f: 814, s: S4a }, // cut on the paragraph break
    { f: 944, dur: 30, s: S4b }, // centred on 959, closer for the second duck
  ],
  5: [
    { f: 1117, s: S5a }, // cut on the paragraph break
    { f: 1203, cut: true, s: S5b }, // cut to the flag on "Unluckily", roll 4 deg
    { f: 1246, cut: true, s: S5c }, // cut back to Bush
  ],
  6: [
    { f: 1287, s: S6a }, // cut on the paragraph break
    { f: 1401, dur: 30, s: S6b }, // centred on 1416, closer for the replayed duck
  ],
  7: [
    { f: 1534, s: S7a }, // cut on the paragraph break
    { f: 1641, dur: 30, s: S7b }, // follow the escort out
  ],
  8: [
    { f: 1708, s: S8a }, // cut on the paragraph break
    { f: 1854, cut: true, s: S8b }, // cut to the shoe CU on "size 10"
  ],
  9: [{ f: 1907, s: S9a }],
};

// impact kicks: the image offset flips sign every frame (~3 px at 720p per unit), decays to 0 in
// 7 f, roll +-0.23 deg per unit; they start on the first frame at/after the event. No hand-held float.
// Events (seconds): throw 1 (24.98), duck 1 (26.56), throw 2 (27.76), duck 2 (31.56), flag hit (35.98).
const KICKS: [number, number][] = [[24.98, 0.6], [26.56, 0.7], [27.76, 0.6], [31.56, 0.7], [35.98, 0.9]];
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
  { f: 149, cInf: 10, focus: () => BUSH_EYES }, // setting MS, Bush's eyes
  { f: 500, cInf: 12, focus: () => [ZAIDI_AT[0], 1.3, ZAIDI_AT[2]] }, // throw 1: al-Zaidi sharp
  { f: 693, dur: 30, cInf: 12, focus: () => [ZAIDI_AT[0], 1.4, ZAIDI_AT[2]] },
  { f: 814, cInf: 10, focus: () => BUSH_EYES }, // throw 2: Bush sharp
  { f: 1117, cInf: 14, focus: () => BUSH_EYES }, // deadpan CU
  { f: 1203, cInf: 12, focus: () => [FLAG_US[0], 2.2, FLAG_US[2]] }, // the flag
  { f: 1246, cInf: 14, focus: () => BUSH_EYES },
  { f: 1289, cInf: 10, focus: () => BUSH_EYES }, // explanation side view
  { f: 1534, cInf: 8, focus: () => [ZAIDI_AT[0], 1.0, ZAIDI_AT[2]] }, // consequence
  { f: 1708, cInf: 12, focus: () => BUSH_EYES }, // callback
  { f: 1854, cInf: 14, focus: () => SHOE_REST }, // shoe CU
  { f: 1907, cInf: 0 }, // final wide: sharp
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
