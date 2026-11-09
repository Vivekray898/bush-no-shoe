// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing, so seated press rows share canvases. Characters are yaw-only
// billboards shaded by cardShade() (scene tint, bright floor, side gradient toward the sun, painted crescent in
// the drawing); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, fxBurst, fxBlob, fxShadow, fxContact, SKINS,
  Outfit, Expr, FrontOpts, SideOpts,
} from "./toon";
import {
  FPS, SHOTS, BUSH_AT, MALIKI_AT, ZAIDI_AT, GUARD_L, GUARD_R, ROWS_Z, COLS_X, SHOE_REST,
  DUCK1_F, DUCK2_F, REPLAY_DUCK_F, duckDip, zaidiStandU, shoe1At, shoe2At, replayShoeAt, V3,
  smooth, clamp01,
} from "./story";
import { LIGHTS } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false;
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
/** head-shape seed: 7 shapes, so the press still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h;
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- outfits (our own cartoon versions of the real people; bean-head style) ----------------
export const BUSH: Outfit = { jacket: "#2f3038", pants: "#2f3038", boots: "#1c1c20", hat: "hair", hair: "#c8c8c8" };
export const MALIKI: Outfit = { jacket: "#3a3a42", pants: "#3a3a42", boots: "#1c1c20", hat: "hair", hair: "#2a201a", moustache: "#2a201a" };
export const ZAIDI: Outfit = { jacket: "#e8e2d4", pants: "#4a4a52", boots: "#2a2a30", hat: "hair", hair: "#1e1a16" };
export const GUARD: Outfit = { jacket: "#1f2026", pants: "#1f2026", boots: "#141416", hat: "hair", hair: "#14100c" };
const PRESS_JACKETS = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9", "#6a6a72", "#a0522d"];
const PRESS_HAIR = ["#1e1a16", "#4a3426", "#6a6a6a", "#2a201a"];
const pressOutfit = (v: number): Outfit => ({
  jacket: PRESS_JACKETS[v % PRESS_JACKETS.length], pants: "#3b3f52", boots: "#4a3426",
  hat: "hair", hair: PRESS_HAIR[v % PRESS_HAIR.length], skin: SKINS[v % SKINS.length],
});

// ---------------- the shoe (a flying prop: a small dark card) ----------------
/** side profile of a dark dress shoe on a 300 x 200 canvas, sole at y = 172 */
const drawShoe = (p: Pen) => {
  p.poly([[30, 150], [58, 88], [150, 68], [258, 108], [270, 150]], "#2a2a30", 8); // upper
  p.poly([[20, 150], [280, 150], [280, 172], [20, 172]], "#141416", 7); // sole
  p.poly([[24, 150], [52, 150], [52, 172], [24, 172]], "#1e1e22", 5); // heel
  p.stroke([[118, 86], [138, 94]], 5, "#e8e2d4"); // lace ticks
  p.stroke([[148, 82], [168, 90]], 5, "#e8e2d4");
  p.stroke([[178, 84], [196, 94]], 5, "#e8e2d4");
};
const shoeFx = (out: Stage, at: { pos: V3; rot: number }) => {
  out.fx.push({ key: "shoe", cw: 300, ch: 200, draw: drawShoe, x: at.pos[0], y: at.pos[1], z: at.pos[2], w: 0.5, h: 0.33, rot: at.rot });
};

// ---------------- crowd by shot ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };

/** Bush at the podium: neutral, ducking (quick dip 2 f before each "ducks"), grinning in the deadpan + callback. */
const bush = (cam: CamInfo, f: number, t: number, id: number, out: Stage) => {
  const dip = Math.max(duckDip(f, DUCK1_F), duckDip(f, DUCK2_F), id === 6 ? duckDip(f, REPLAY_DUCK_F) : 0);
  const ducking = dip > 0.02;
  const expr: Expr = ducking ? "shock" : id === 5 || id >= 8 ? "grin" : id === 4 && f > 994 ? "relief" : "neutral";
  const fo: FrontOpts = { mode: "stand", expr, blink: lidAt(t, 1), tilt: (dip / 0.35) * 0.12 };
  out.places.push(person(cam, { i: 1, o: BUSH, okey: "bush" }, BUSH_AT[0], BUSH_AT[1] - dip, BUSH_AT[2],
    { side: false, mirror: false }, fo, {}, 0.88));
  blob(out, BUSH_AT[0], 0, BUSH_AT[2], 0.88);
};

/** al-Maliki at Bush's side: steady, stern; glances at Bush on the ducks. */
const maliki = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const ducking = duckDip(f, DUCK1_F) > 0.02 || duckDip(f, DUCK2_F) > 0.02;
  const fo: FrontOpts = { mode: "stand", expr: ducking ? "shock" : "stern", look: ducking ? -1 : 0, blink: lidAt(t, 2) };
  out.places.push(person(cam, { i: 2, o: MALIKI, okey: "maliki" }, MALIKI_AT[0], MALIKI_AT[1], MALIKI_AT[2],
    { side: false, mirror: false }, fo, {}, 0.88));
  blob(out, MALIKI_AT[0], 0, MALIKI_AT[2], 0.88);
};

/** al-Zaidi, front row: sits until f599, stands up over ~12 f, shouts, throws both shoes, then is led out. */
const zaidi = (cam: CamInfo, f: number, t: number, id: number, out: Stage) => {
  if (id >= 8) return; // led away: his front-row chair sits empty in the callback + final wide
  const [zx, zy, zz] = ZAIDI_AT;
  // escort out (shot 7): walks with the guards toward the back of the room from f1651, gone by f1709.
  // He starts from his stepped-forward spot (1.2, 0.75), not the chair.
  if (f >= 1651) {
    const u = smooth((f - 1651) / 57);
    const x = zx + (2.8 - zx) * u, z = 0.75 + (5.6 - 0.75) * u;
    const phase = q(((f - 1651) / 30) % 1, 120);
    out.places.push(person(cam, { i: 3, o: ZAIDI, okey: "zaidi" }, x, zy, z,
      viewOf(cam, x, z, 0.4, 1), { mode: "stroll", phase, expr: "nervous", blink: lidAt(t, 3) },
      { mode: "march", phase, expr: "nervous", stride: 0.8 }));
    blob(out, x, 0, z, 0.8);
    return;
  }
  if (f < 599) {
    out.places.push(person(cam, { i: 3, o: ZAIDI, okey: "zaidi" }, zx, zy, zz,
      { side: false, mirror: false }, { mode: "sit", expr: "neutral", blink: lidAt(t, 3) }, {}, 0.8));
    blob(out, zx, 0, zz, 0.8);
    return;
  }
  const u = zaidiStandU(f);
  // he steps FORWARD out of his chair as he stands (z 0.2 -> 0.75): standing in the chair's footprint read as
  // standing ON the chair in the r3 consequence stills.
  const zx2 = zx, zz2 = zz + 0.55 * u;
  const shouting = f >= 677 && f < 728;
  const throwing = (f >= 744 && f < 761) || (f >= 828 && f < 845);
  const expr: Expr = shouting ? "shock" : throwing ? "grin" : f >= 1109 ? "nervous" : "neutral";
  const fo: FrontOpts = {
    mode: "stand", expr, blink: lidAt(t, 3),
    wave: throwing ? 1 : undefined, // right arm up on the throws
  };
  out.places.push(person(cam, { i: 3, o: ZAIDI, okey: "zaidi" }, zx2, zy - 0.25 * (1 - u), zz2,
    { side: false, mirror: false }, fo, {}, 0.8));
  blob(out, zx2, 0, zz2, 0.8);
};

/** the seated press: rows of journalists facing the podium. Heads turn toward al-Zaidi once he stands;
 *  front row gasps on the throws; a few grin in the callback. */
const press = (cam: CamInfo, f: number, t: number, out: Stage) => {
  let i = 10;
  for (const z of ROWS_Z) for (const x of COLS_X) {
    if (z === ROWS_Z[0] && x === ZAIDI_AT[0]) { i++; continue; } // al-Zaidi's chair: drawn separately
    // FIX2: the nearest row (z = 5.0, closest to the wide cameras) leaves only its centre three members
    // (|x| < 2.0); their chairs stay, empty, instead of half a head at the frame edge.
    // Honest note: a fresh re-render of f600 with this rule in place was byte-identical to the r1 still,
    // so the outer nearest-row members were already out of frame / near-culled in these shots — the
    // blurred heads that remain at the bottom corners are foreground depth framing (near members at
    // z 3.4, recognised heads, heavily DOF-blurred), not half-cut standing figures. Kept as a guard.
    if (z === ROWS_Z[ROWS_Z.length - 1] && Math.abs(x) >= 2.0) { i++; continue; }
    // FIX1: a press member closer than ~2.8 m to the lens becomes a huge cut-off blob / half a person
    // at the frame edge (r1 shot-3, and the half-cut foreground heads in the user's rendered video):
    // leave that seat empty for this frame instead of drawing half a person. Was 2.3 m.
    if (cam.pos.distanceTo(tmp.set(x, 1.2, z)) < 2.8) { i++; continue; }
    const o = pressOutfit(i);
    const frontRow = z === ROWS_Z[0];
    const look = f >= 597 ? (x < ZAIDI_AT[0] ? 1 : x > ZAIDI_AT[0] ? -1 : 0) : 0;
    const gasp = (f >= 747 && f < 816) || (f >= 831 && f < 890);
    const expr: Expr = gasp ? (frontRow ? "shock" : "nervous") : f >= 1708 && i % 5 === 0 ? "grin" : "neutral";
    out.places.push(person(cam, { i, o, okey: `press${i % 8}` }, x, 0, z,
      { side: false, mirror: false }, { mode: "sit", expr, look, blink: lidAt(t, i) }, {}, 0.8));
    blob(out, x, 0, z, 0.8, 0.8);
    i++;
  }
};

/** guards: stand by the podium, close in during the consequence, escort al-Zaidi out. */
const guards = (cam: CamInfo, f: number, t: number, id: number, out: Stage) => {
  if (id >= 8) return; // left with al-Zaidi
  // Flank spots wide of al-Zaidi (x 0.2 / 2.2 in the first pass put the left guard's head directly above
  // al-Zaidi's in the consequence camera — a two-headed figure in the r3/r4 stills).
  const spots: [V3, V3][] = [
    [GUARD_L, [-0.8, 0, 1.4]],
    [GUARD_R, [2.8, 0, 1.4]],
  ];
  spots.forEach(([home, flank], gi) => {
    const i = 50 + gi;
    let x = home[0], z = home[2], mode: "stand" | "stroll" = "stand", phase = 0;
    if (f >= 1547 && f < 1617) {
      const u = smooth((f - 1547) / 70);
      x = home[0] + (flank[0] - home[0]) * u; z = home[2] + (flank[2] - home[2]) * u;
      mode = "stroll"; phase = q(((f - 1547) / 30) % 1, 120);
    } else if (f >= 1617 && f < 1651) { x = flank[0]; z = flank[2]; }
    else if (f >= 1651) {
      const u = smooth((f - 1651) / 57);
      x = flank[0] + (2.8 + (gi ? 0.7 : -0.7) - flank[0]) * u;
      z = flank[2] + (5.6 - flank[2]) * u;
      mode = "stroll"; phase = q(((f - 1651) / 30) % 1, 120);
    }
    const view = viewOf(cam, x, z, 0.4, 1);
    out.places.push(person(cam, { i, o: GUARD, okey: "guard" }, x, 0, z, view,
      { mode, phase, expr: "stern", blink: lidAt(t, i) },
      { mode: mode === "stroll" ? "march" : "stand", phase, expr: "stern", stride: 0.8 }));
    blob(out, x, 0, z, 0.85);
  });
};

/** the flying shoes + the burst on the flag hit + the resting shoe. */
const shoes = (f: number, id: number, out: Stage) => {
  const s1 = shoe1At(f), s2 = shoe2At(f), sr = id === 6 ? replayShoeAt(f) : null;
  if (s1) shoeFx(out, s1);
  if (s2) shoeFx(out, s2);
  if (sr) shoeFx(out, sr);
  // shoe 1 rests on the floor by the podium from just after throw 1 (the callback ends on it)
  if (f >= 806 && id !== 6) {
    out.fx.push({ key: "shoeRest", cw: 300, ch: 200, draw: drawShoe, x: SHOE_REST[0], y: SHOE_REST[1] + 0.05, z: SHOE_REST[2], w: 0.5, h: 0.33, rot: -0.35 });
  }
  // impact burst where shoe 2 hits the flag
  if (f >= 1079 && f < 1079 + 14) {
    const u = (f - 1079) / 14;
    out.fx.push({ key: `burst${q(u, 30)}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q(u, 30)), x: -1.7, y: 2.2, z: -5.2, w: 0.9, h: 0.9 });
  }
};

/** everything with a face in shot `id` at time t */
export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light;
  findSun(cam, SUN);
  const f = Math.round(t * FPS);
  bush(cam, f, t, id, out);
  maliki(cam, t, f, out);
  zaidi(cam, f, t, id, out);
  press(cam, f, t, out);
  guards(cam, f, t, id, out);
  shoes(f, id, out);
  return out;
};

export { FPS };
