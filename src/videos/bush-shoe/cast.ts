// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing, so seated press rows share canvases. Characters are yaw-only
// billboards shaded by cardShade() (scene tint, bright floor, side gradient toward the sun, painted crescent in
// the drawing); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, fxBurst, fxBlob, fxContact, SKINS,
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
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3; fov: number; look: THREE.Vector3 };

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

// FIX2 (defect 4): screen-space edge cull — the skill's trap ("props closer than ~2 m to a lens become
// huge cut-off blobs at the frame edge; a foreground prop must be recognisable or gone") is NOT fixed by
// the distance cull alone: a member 3+ m away can still be half-cut at an edge, and DOF blur turns it into
// an unrecognisable blob. So a card whose projected extent crosses into the outer ~15% of the frame is
// removed entirely (the empty chair stays — an empty seat reads better than a half-head).
// (x, y, z) = card centre; halfW/halfH = card half-size in metres.
const _ecF = new THREE.Vector3(), _ecP = new THREE.Vector3();
const edgeCull = (cam: CamInfo, x: number, y: number, z: number, halfW: number, halfH: number) => {
  // FIX2 round 2: forward comes from the look target, NOT up x right — the first version ignored the
  // camera's downward pitch, so its vertical NDC was off by ~tan(pitch)/tan(fov/2) and the bottom test
  // wrongly removed whole rows in the dollying wides (r1_70 / r1_2033 came out nearly empty).
  const fwd = _ecF.subVectors(cam.look, cam.pos).normalize();
  const up = _ecP.crossVectors(cam.right, fwd).normalize();
  const vx = x - cam.pos.x, vy = y - cam.pos.y, vz = z - cam.pos.z;
  const depth = vx * fwd.x + vy * fwd.y + vz * fwd.z;
  if (depth < 0.3) return true; // behind / on top of the lens
  const tanH = Math.tan((cam.fov * Math.PI / 180) / 2), asp = 1080 / 1920;
  const nx = (vx * cam.right.x + vy * cam.right.y + vz * cam.right.z) / depth / (tanH * asp);
  const ny = (vx * up.x + vy * up.y + vz * up.z) / depth / tanH;
  const hw = halfW / depth / (tanH * asp), hh = halfH / depth / tanH;
  // FIX2 calibration: the trap is about NEAR, unrecognisable blobs — a member closer than ~6 m whose card
  // crosses the outer ~18% is removed. Farther members are small and recognisable even at the edge, so they
  // are only removed if the card actually crosses the frame edge (margin 1.0); that keeps the wide-shot
  // crowd instead of emptying the outer columns.
  // Bottom edge (round 2): test the CENTRE (ny < -0.9), not the card's lower edge — a foreground row whose
  // feet are below the frame but whose head is in it is a normal wide shot, not a half-cut blob. (The top
  // edge still tests the head: ny + hh > 0.9, because a head cut at the top IS the defect.)
  // Margin 0.65 (round 2b): the podium MS foreground head (r2_150) measured 0.67, not 0.84 as first
  // estimated (the fov widened to 48 in round 2, which shrinks the projected card). 0.65 removes him and
  // the flag-hit foreground member (0.71, r2_1079) without touching the wides (their near members measure
  // <= 0.52; the rest use the far margin) or the shot-7 seated member (0.52, far margin).
  const margin = depth < 6 ? 0.65 : 1.0;
  return Math.abs(nx) + hw > margin || ny + hh > 0.9 || ny < -0.9;
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
 *  the feet (~.5 on screen at the core) so nobody floats.
 *  FIX2 (defect 5): there used to be a soft tail stretched away from the sun as well. Round 1 shortened and
 *  lightened it, but the r1 stills proved it was not enough: in the final wide (r1_2033) big purple patches
 *  sit under chairs where NO figure is drawn at all, so the stains are not (only) the tails — but the tails
 *  are the same violet, the same direction, and they land on the same red carpet, so they go too. Indoors,
 *  on a red carpet, a long violet floor shadow reads as a stain, not as light. The tight pool alone is what
 *  stops a figure floating (per the characters report); the room's real shadows come from the light rig. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.3, 0.31, 0.42], golden: [0.32, 0.3, 0.42] };
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  // FIX2 round 2: contact pool ONLY — no tail (see the CONTACT note above).
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.5 * sc, h: 0.34 * sc, flat: true, rot });
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
  // FIX2 (defect 3): scale 0.88 -> 1.0. At 0.88 the figure is 1.48 m, chin ~1.05 m — just BELOW the 1.08 m
  // podium top, so only his head peeked over it (screenshot 2). At 1.0 he is 1.68 m, chin ~1.20 m, so head
  // AND shoulders read over the podium.
  out.places.push(person(cam, { i: 1, o: BUSH, okey: "bush" }, BUSH_AT[0], BUSH_AT[1] - dip, BUSH_AT[2],
    { side: false, mirror: false }, fo, {}, 1.0));
  blob(out, BUSH_AT[0], 0, BUSH_AT[2], 1.0);
};

/** al-Maliki at Bush's side: steady, stern; glances at Bush on the ducks. */
const maliki = (cam: CamInfo, t: number, f: number, out: Stage) => {
  const ducking = duckDip(f, DUCK1_F) > 0.02 || duckDip(f, DUCK2_F) > 0.02;
  const fo: FrontOpts = { mode: "stand", expr: ducking ? "shock" : "stern", look: ducking ? -1 : 0, blink: lidAt(t, 2) };
  // FIX2 (defect 3): scale 0.88 -> 1.0, same as Bush — head + shoulders over the podium, not just a head.
  out.places.push(person(cam, { i: 2, o: MALIKI, okey: "maliki" }, MALIKI_AT[0], MALIKI_AT[1], MALIKI_AT[2],
    { side: false, mirror: false }, fo, {}, 1.0));
  blob(out, MALIKI_AT[0], 0, MALIKI_AT[2], 1.0);
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
      { mode: "march", phase, expr: "nervous", stride: 0.8 }, 0.9));
    blob(out, x, 0, z, 0.9);
    return;
  }
  if (f < 599) {
    // FIX2 (defect 1): seated 3/4 toward the podium, not flat front-on — facing/look from the SCREEN
    // direction of Bush, so he turns toward his target from every camera, not just head-on ones.
    // FIX2 round 2b (defect 4): the seated branch had NO edge cull, so in the podium MS (r2_150) his
    // card centre sat just outside the frame and a huge DOF-blurred half-head filled the bottom-right
    // corner. Seated, he is not the subject of any shot — cull him like the press. (Standing, he IS the
    // subject of shots 3/4/6/7 and is never culled.)
    if (edgeCull(cam, zx, 0.92, zz, 0.55, 0.92)) return;
    const bx = (BUSH_AT[0] - zx) * cam.right.x + (BUSH_AT[2] - zz) * cam.right.z;
    const facing = bx < -0.05 ? -1 : bx > 0.05 ? 1 : 0;
    out.places.push(person(cam, { i: 3, o: ZAIDI, okey: "zaidi" }, zx, zy, zz,
      { side: false, mirror: false }, { mode: "sit", expr: "neutral", blink: lidAt(t, 3), facing, look: facing }, {}, 0.85));
    blob(out, zx, 0, zz, 0.85, 1);
    return;
  }
  const u = zaidiStandU(f);
  // he steps FORWARD out of his chair as he stands (z 0.2 -> 0.75): standing in the chair's footprint read as
  // standing ON the chair in the r3 consequence stills.
  const zx2 = zx, zz2 = zz + 0.55 * u;
  const shouting = f >= 677 && f < 728;
  const throwing = (f >= 744 && f < 761) || (f >= 828 && f < 845);
  const expr: Expr = shouting ? "shock" : throwing ? "grin" : f >= 1109 ? "nervous" : "neutral";
  // FIX2 (defect 1): he throws AT Bush, so he is drawn in SIDE view facing the podium (-z), never front-on
  // to the camera — bodySide + a mirror computed from where Bush actually sits ON SCREEN (viewOf's mirror
  // uses the walk direction and gets shot 4 wrong: from dead behind, Bush is screen-left of him but viewOf
  // faces him screen-right). The throw is a raised arm (toon.ts SideOpts.raise) toward Bush, not the
  // front-view wave. Scale 0.8 -> 0.9: at 0.8 he was 1.34 m standing next to 1.68 m Bush.
  const bx = (BUSH_AT[0] - zx2) * cam.right.x + (BUSH_AT[2] - zz2) * cam.right.z;
  const fo: FrontOpts = { mode: "stand", expr, blink: lidAt(t, 3) };
  const so: SideOpts = { mode: "stand", expr, blink: lidAt(t, 3), raise: throwing ? 1 : 0 };
  out.places.push(person(cam, { i: 3, o: ZAIDI, okey: "zaidi" }, zx2, zy - 0.25 * (1 - u), zz2,
    { side: true, mirror: bx < 0 }, fo, so, 0.9));
  blob(out, zx2, 0, zz2, 0.9);
};

/** the seated press: rows of journalists facing the podium. Heads turn toward al-Zaidi once he stands;
 *  front row gasps on the throws; a few grin in the callback. */
const press = (cam: CamInfo, f: number, t: number, out: Stage) => {
  let i = 10;
  for (const z of ROWS_Z) for (const x of COLS_X) {
    if (z === ROWS_Z[0] && x === ZAIDI_AT[0]) { i++; continue; } // al-Zaidi's chair: drawn separately
    // FIX2 (defect 4): the nearest row (z = 5.0, closest to the wide cameras) leaves only its centre three
    // members (|x| < 2.0); their chairs stay, empty, instead of half a head at the frame edge.
    if (z === ROWS_Z[ROWS_Z.length - 1] && Math.abs(x) >= 2.0) { i++; continue; }
    // FIX2 (defect 4): distance cull 2.8 -> 3.2 m, AND the screen-edge cull — a member 3+ m away can still
    // be half-cut at an edge, and DOF blur turns it into an unrecognisable blob (screenshot 3: the huge
    // blurred head at the left edge). The r1 note claiming those were "foreground depth framing" was
    // wrong — the user showed they read as a mess, so they are removed, not rationalised.
    if (cam.pos.distanceTo(tmp.set(x, 1.2, z)) < 3.2) { i++; continue; }
    if (edgeCull(cam, x, 0.92, z, 0.55, 0.92)) { i++; continue; } // card centre ~0.92 m, half-size 0.55 x 0.92 m
    const o = pressOutfit(i);
    const frontRow = z === ROWS_Z[0];
    // FIX2 (defect 1): 3/4 toward the action, not flat front-on — facing/look from the SCREEN direction of
    // the target (the podium, or al-Zaidi once he stands), so a member turns toward the action from every
    // camera, including the side cameras of shots 3/6/7. (The old look used world-x only, which is wrong
    // from any camera that is not dead behind the rows.)
    const tx = f >= 597 ? ZAIDI_AT[0] : 0, tz = f >= 597 ? 0.75 : -4.9;
    const sx = (tx - x) * cam.right.x + (tz - z) * cam.right.z;
    const facing = sx < -0.05 ? -1 : sx > 0.05 ? 1 : 0;
    const gasp = (f >= 747 && f < 816) || (f >= 831 && f < 890);
    const expr: Expr = gasp ? (frontRow ? "shock" : "nervous") : f >= 1708 && i % 5 === 0 ? "grin" : "neutral";
    // FIX2 (defect 2): scale 0.8 -> 0.85 — a sitter's crown is now ~0.94 m, above the lowered 0.68 m chair
    // back (was 0.88 m against a 0.95 m back: the chair was taller than the sitter, so only a head showed).
    out.places.push(person(cam, { i, o, okey: `press${i % 8}` }, x, 0, z,
      { side: false, mirror: false }, { mode: "sit", expr, look: facing, facing, blink: lidAt(t, i) }, {}, 0.85));
    blob(out, x, 0, z, 0.85, 0.8);
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
    // FIX2 (defect 4): a guard half-cut at a frame edge is removed too (they were half-cut at the edges
    // in the first render). Card centre ~1.1 m, half-size 0.65 x 1.08 m at scale 1.0.
    if (edgeCull(cam, x, 1.1, z, 0.65, 1.08)) return;
    const view = viewOf(cam, x, z, 0.4, 1);
    out.places.push(person(cam, { i, o: GUARD, okey: "guard" }, x, 0, z, view,
      { mode, phase, expr: "stern", blink: lidAt(t, i) },
      { mode: mode === "stroll" ? "march" : "stand", phase, expr: "stern", stride: 0.8 }));
    blob(out, x, 0, z, 1.0);
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
