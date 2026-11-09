// Static scenery for the Baghdad palace press-conference room: floor, walls, curtain backdrop,
// podium with microphones, flag poles, and rows of chairs. Merged batches (one mesh per material).
// No text, no labels anywhere: the flags are painted shapes only (bands, stars, stripes).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ctex } from "./paint";
import { twoTone } from "./shade";

export type Kit = Record<string, THREE.Object3D>;
export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------- materials (shared, cached) ----------------
const mats = new Map<string, THREE.Material>();
/** materials whose Strands are built as real interlocking chain links instead of a textured box tube */
const CHAIN_MATS = new WeakSet<THREE.Material>();
export const lam = (key: string, make: () => THREE.MeshLambertMaterialParameters) => {
  let m = mats.get(key) as THREE.MeshLambertMaterial | undefined;
  if (!m) {
    if (key === "chainHD") {
      const c = twoTone(new THREE.MeshPhongMaterial({ color: "#7a8490", specular: "#6c727b", shininess: 30 }));
      CHAIN_MATS.add(c);
      m = c as unknown as THREE.MeshLambertMaterial;
    } else m = twoTone(new THREE.MeshLambertMaterial(make()));
    mats.set(key, m);
  }
  return m;
};
const lamOf = new Map<string, THREE.MeshLambertMaterial>();
/** Kenney GLB materials -> Lambert, so the whole world shares one lighting model */
const toLambert = (m: THREE.Material) => {
  let l = lamOf.get(m.uuid);
  if (!l) {
    const s = m as THREE.MeshStandardMaterial;
    l = twoTone(new THREE.MeshLambertMaterial({ color: s.color?.clone() ?? new THREE.Color("#ffffff"), map: s.map ?? null, side: s.side, alphaTest: s.alphaTest }));
    lamOf.set(m.uuid, l);
  }
  return l;
};

// ---------------- geometry pieces ----------------
const f32 = (a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) => {
  const out = new Float32Array(a.count * a.itemSize);
  for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
  return new THREE.Float32BufferAttribute(out, a.itemSize);
};
/** quad a,b,c,d counter-clockwise seen from its front; uv (u0,v0) at a, (u1,v1) at c */
export const quad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, u1 = 1, v1 = 1, u0 = 0, v0 = 0) => {
  const g = new THREE.BufferGeometry();
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(d, a)).normalize();
  g.setAttribute("position", new THREE.Float32BufferAttribute([a, b, c, a, c, d].flatMap((v) => [v.x, v.y, v.z]), 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 2, 3, 4, 5].flatMap(() => [n.x, n.y, n.z]), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1], 2));
  return g;
};
export const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
  const g = new THREE.BufferGeometry();
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
  g.setAttribute("position", new THREE.Float32BufferAttribute([a, b, c].flatMap((v) => [v.x, v.y, v.z]), 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 2].flatMap(() => [n.x, n.y, n.z]), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2));
  return g;
};
/** axis box from min to max, texture tiled every `tile` metres (0 = one image per face) */
export const boxGeo = (min: THREE.Vector3, max: THREE.Vector3, tile = 0, bottom = false) => {
  const [x0, y0, z0] = [min.x, min.y, min.z], [x1, y1, z1] = [max.x, max.y, max.z];
  const t = (a: number) => (tile ? a / tile : 1);
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  const faces = [
    quad(V(x0, y0, z1), V(x1, y0, z1), V(x1, y1, z1), V(x0, y1, z1), t(w), t(h)),
    quad(V(x1, y0, z0), V(x0, y0, z0), V(x0, y1, z0), V(x1, y1, z0), t(w), t(h)),
    quad(V(x0, y0, z0), V(x0, y0, z1), V(x0, y1, z1), V(x0, y1, z0), t(d), t(h)),
    quad(V(x1, y0, z1), V(x1, y0, z0), V(x1, y1, z0), V(x1, y1, z1), t(d), t(h)),
    quad(V(x0, y1, z1), V(x1, y1, z1), V(x1, y1, z0), V(x0, y1, z0), t(w), t(d)),
  ];
  if (bottom) faces.push(quad(V(x0, y0, z0), V(x1, y0, z0), V(x1, y0, z1), V(x0, y0, z1), t(w), t(d)));
  return mergeGeometries(faces, false);
};

/** collects pieces by material and merges them into one static mesh per material */
export class Batch {
  private g = new Map<THREE.Material, THREE.BufferGeometry[]>();
  add(geo: THREE.BufferGeometry, mat: THREE.Material, m?: THREE.Matrix4) {
    const src = geo.index ? geo.toNonIndexed() : geo;
    const x = new THREE.BufferGeometry();
    x.setAttribute("position", f32(src.attributes.position));
    if (src.attributes.normal) x.setAttribute("normal", f32(src.attributes.normal)); else x.computeVertexNormals();
    x.setAttribute("uv", src.attributes.uv ? f32(src.attributes.uv) : new THREE.Float32BufferAttribute(new Float32Array(src.attributes.position.count * 2), 2));
    if (m) x.applyMatrix4(m);
    const l = this.g.get(mat);
    if (l) l.push(x); else this.g.set(mat, [x]);
  }
  addObject(o: THREE.Object3D, m: THREE.Matrix4) {
    o.updateMatrixWorld(true);
    o.traverse((c) => {
      const mesh = c as THREE.Mesh;
      if (!mesh.isMesh) return;
      this.add(mesh.geometry, toLambert(Array.isArray(mesh.material) ? mesh.material[0] : mesh.material), new THREE.Matrix4().multiplyMatrices(m, mesh.matrixWorld));
    });
  }
  build(parent: THREE.Object3D, cast = true) {
    for (const [mat, list] of this.g) {
      const mesh = new THREE.Mesh(mergeGeometries(list, false), mat);
      mesh.castShadow = cast; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false;
      parent.add(mesh);
    }
    this.g.clear();
  }
}

// ---------------- strands: box-section tube along a path, rebuilt in place ----------------
// (Kept from the bridge templates: the flag poles and microphone stems are simple boxes, but Strand stays
// available for any rope/cable dressing. Chain-link mode is unused here.)
const LNS = 16, LNR = 6;
type LinkT = { p: Float32Array; n: Float32Array; idx: number[]; pitch: number };
const linkTemplate = (h: number): LinkT => {
  const ow = h * 0.85, rb = ow * 0.14, ol = ow * 1.62, rc = ow / 2 - rb, hl = ol / 2 - rb - rc;
  const p = new Float32Array(LNS * LNR * 3), n = new Float32Array(LNS * LNR * 3), idx: number[] = [];
  for (let j = 0; j < LNS; j++) {
    const th = (2 * Math.PI * (j + 0.5)) / LNS, nx = Math.cos(th), ny = Math.sin(th);
    const cx = rc * nx + Math.sign(nx) * hl, cy = rc * ny;
    for (let k = 0; k < LNR; k++) {
      const ph = (2 * Math.PI * k) / LNR, cp = Math.cos(ph), sp = Math.sin(ph), o = (j * LNR + k) * 3;
      p[o] = cx + rb * cp * nx; p[o + 1] = cy + rb * cp * ny; p[o + 2] = rb * sp;
      n[o] = cp * nx; n[o + 1] = cp * ny; n[o + 2] = sp;
      const a = j * LNR + k, b = j * LNR + ((k + 1) % LNR), c = ((j + 1) % LNS) * LNR + ((k + 1) % LNR), d = ((j + 1) % LNS) * LNR + k;
      idx.push(a, d, c, a, c, b);
    }
  }
  return { p, n, idx, pitch: ol - 4 * rb };
};

export class Strand {
  mesh: THREE.Mesh;
  private pos: Float32Array; private nor: Float32Array; private uv: Float32Array;
  private lt: LinkT | null = null; private maxLinks = 0;
  constructor(public n: number, public w: number, public h: number, mat: THREE.Material, public tile = 1, cast = true) {
    const g = new THREE.BufferGeometry();
    if (CHAIN_MATS.has(mat)) {
      const lt = (this.lt = linkTemplate(h)), nv = LNS * LNR;
      this.maxLinks = 440;
      this.pos = new Float32Array(this.maxLinks * nv * 3); this.nor = new Float32Array(this.maxLinks * nv * 3); this.uv = new Float32Array(this.maxLinks * nv * 2);
      const idx = new Uint32Array(this.maxLinks * lt.idx.length);
      for (let l = 0; l < this.maxLinks; l++) for (let i = 0; i < lt.idx.length; i++) idx[l * lt.idx.length + i] = lt.idx[i] + l * nv;
      g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
      g.setAttribute("normal", new THREE.BufferAttribute(this.nor, 3));
      g.setAttribute("uv", new THREE.BufferAttribute(this.uv, 2));
      g.setIndex(new THREE.BufferAttribute(idx, 1));
      g.setDrawRange(0, 0);
    } else {
      this.pos = new Float32Array(n * 12); this.nor = new Float32Array(n * 12); this.uv = new Float32Array(n * 8);
      g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
      g.setAttribute("normal", new THREE.BufferAttribute(this.nor, 3));
      g.setAttribute("uv", new THREE.BufferAttribute(this.uv, 2));
      const idx: number[] = [];
      for (let i = 0; i < n - 1; i++) for (let k = 0; k < 4; k++) {
        const a = i * 4 + k, b = i * 4 + ((k + 1) % 4), c = (i + 1) * 4 + ((k + 1) % 4), d = (i + 1) * 4 + k;
        idx.push(a, b, c, a, c, d);
      }
      g.setIndex(idx);
    }
    this.mesh = new THREE.Mesh(g, mat);
    this.mesh.frustumCulled = false; this.mesh.castShadow = cast; this.mesh.receiveShadow = true;
  }
  private T = new THREE.Vector3(); private S = new THREE.Vector3(); private N = new THREE.Vector3();
  private setLinks(pts: THREE.Vector3[], lt: LinkT) {
    const { T, S, N } = this, nv = LNS * LNR;
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const total = cum[cum.length - 1], count = Math.max(0, Math.min(this.maxLinks, Math.floor(total / lt.pitch)));
    const s0 = (total - (count - 1) * lt.pitch) / 2;
    let seg = 1;
    for (let l = 0; l < count; l++) {
      const s = s0 + l * lt.pitch;
      while (seg < pts.length - 1 && cum[seg] < s) seg++;
      const a = pts[seg - 1], b = pts[seg], u = (s - cum[seg - 1]) / Math.max(1e-6, cum[seg] - cum[seg - 1]);
      const px = a.x + (b.x - a.x) * u, py = a.y + (b.y - a.y) * u, pz = a.z + (b.z - a.z) * u;
      T.subVectors(b, a).normalize();
      S.set(-T.z, 0, T.x);
      if (S.lengthSq() < 1e-6) S.set(1, 0, 0);
      S.normalize(); N.crossVectors(S, T).normalize();
      const odd = l % 2 === 1;
      const yx = odd ? S.x : N.x, yy = odd ? S.y : N.y, yz = odd ? S.z : N.z;
      const zx = odd ? -N.x : S.x, zy = odd ? -N.y : S.y, zz = odd ? -N.z : S.z;
      const base = l * nv * 3;
      for (let v = 0; v < nv * 3; v += 3) {
        const x = lt.p[v], y = lt.p[v + 1], z = lt.p[v + 2], o = base + v;
        this.pos[o] = px + T.x * x + yx * y + zx * z;
        this.pos[o + 1] = py + T.y * x + yy * y + zy * z;
        this.pos[o + 2] = pz + T.z * x + yz * y + zz * z;
        const nx = lt.n[v], ny = lt.n[v + 1], nz = lt.n[v + 2];
        this.nor[o] = T.x * nx + yx * ny + zx * nz;
        this.nor[o + 1] = T.y * nx + yy * ny + zy * nz;
        this.nor[o + 2] = T.z * nx + yz * ny + zz * nz;
      }
    }
    const g = this.mesh.geometry;
    g.setDrawRange(0, count * lt.idx.length);
    g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true;
  }
  set(pts: THREE.Vector3[]) {
    if (this.lt) { this.setLinks(pts, this.lt); return; }
    const { T, S, N } = this;
    let len = 0;
    for (let i = 0; i < this.n; i++) {
      const p = pts[Math.min(i, pts.length - 1)];
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      T.subVectors(b, a).normalize();
      S.crossVectors(T, V(0, 1, 0));
      if (S.lengthSq() < 1e-6) S.set(1, 0, 0);
      S.normalize(); N.crossVectors(S, T).normalize();
      if (i) len += p.distanceTo(pts[Math.min(i - 1, pts.length - 1)]);
      for (let k = 0; k < 4; k++) {
        const sx = k === 0 || k === 3 ? -1 : 1, sy = k < 2 ? -1 : 1, j = (i * 4 + k) * 3;
        this.pos[j] = p.x + S.x * sx * this.w / 2 + N.x * sy * this.h / 2;
        this.pos[j + 1] = p.y + S.y * sx * this.w / 2 + N.y * sy * this.h / 2;
        this.pos[j + 2] = p.z + S.z * sx * this.w / 2 + N.z * sy * this.h / 2;
        const nx = S.x * sx + N.x * sy, ny = S.y * sx + N.y * sy, nz = S.z * sx + N.z * sy, nl = Math.hypot(nx, ny, nz);
        this.nor[j] = nx / nl; this.nor[j + 1] = ny / nl; this.nor[j + 2] = nz / nl;
        this.uv[(i * 4 + k) * 2] = k / 4; this.uv[(i * 4 + k) * 2 + 1] = len / this.tile;
      }
    }
    const g = this.mesh.geometry;
    g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true; g.attributes.uv.needsUpdate = true;
  }
}

// ---------------- Kenney props (kept for the FOREGROUND machinery; the kit is empty, so this returns null) ----------------
const boxes = new Map<THREE.Object3D, THREE.Box3>();
/** a Kenney model as its own object (two-tone materials), base at y = 0, scaled to height h (no sight-line test:
 *  used for the CAM agent's FOREGROUND framing objects, which are meant to stand in front of the lens) */
export const kitClone = (kit: Kit, name: string, h: number): THREE.Object3D | null => {
  const o = kit[name];
  if (!o) return null;
  let box = boxes.get(o);
  if (!box) { box = new THREE.Box3().setFromObject(o); boxes.set(o, box); }
  const c = o.clone(true), s = h / Math.max(0.01, box.max.y - box.min.y);
  c.traverse((x) => {
    const m = x as THREE.Mesh;
    if (m.isMesh) { m.material = toLambert(Array.isArray(m.material) ? m.material[0] : m.material); m.castShadow = false; m.receiveShadow = true; }
  });
  const g = new THREE.Group();
  c.position.y = -box.min.y * s; c.scale.setScalar(s);
  g.add(c);
  return g;
};

// ---------------- flags (painted shapes only — NO readable text anywhere) ----------------
/** US flag: 13 red/white stripes + blue canton with white stars (dots at this size). */
export const usFlagTex = () => ctex("flagUS", 390, 200, (g) => {
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#f4f0e6" : "#b22234"; g.fillRect(0, (i * 200) / 13, 390, 200 / 13 + 1); }
  g.fillStyle = "#3c3b6e"; g.fillRect(0, 0, 156, (7 * 200) / 13);
  g.fillStyle = "#ffffff";
  for (let r = 0; r < 9; r++) {
    const n = r % 2 ? 5 : 6, y = ((r + 0.5) * (7 * 200) / 13) / 9;
    for (let c = 0; c < n; c++) {
      const x = ((c + (r % 2 ? 1 : 0.5)) * 156) / 6;
      g.beginPath(); g.arc(x, y, 3.2, 0, Math.PI * 2); g.fill();
    }
  }
  g.fillStyle = "rgba(120,100,90,0.10)"; g.fillRect(0, 190, 390, 10); // soft hem shade
});
/** Iraq flag: red / white / black horizontal bands with a green band in the white band.
 *  Bands only — the real flag's takbir text is deliberately NOT drawn (no readable text in the video). */
export const iraqFlagTex = () => ctex("flagIQ", 390, 200, (g) => {
  g.fillStyle = "#ce1126"; g.fillRect(0, 0, 390, 200 / 3);
  g.fillStyle = "#f4f0e6"; g.fillRect(0, 200 / 3, 390, 200 / 3);
  g.fillStyle = "#1a1a1a"; g.fillRect(0, (2 * 200) / 3, 390, 200 / 3);
  g.fillStyle = "#007a3d"; g.fillRect(60, 200 / 3 + 22, 270, 22); // green band, no letters
  g.fillStyle = "rgba(120,100,90,0.10)"; g.fillRect(0, 190, 390, 10);
});

// ---------------- the press room ----------------
export const ROWS_Z = [0.2, 1.8, 3.4, 5.0];
export const COLS_X = [-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6];
export const FLAG_POLES: [number, number][] = [[-1.7, -5.3], [1.7, -5.3]]; // [x, z] of the two flag poles

/** Build the room into `root`: floor + carpet, back + side walls (8 m tall so no lens ever sees over them),
 *  curtain backdrop, podium with microphones, flag poles, rows of chairs. Flag cloths are separate meshes
 *  (world.ts waves them); this returns nothing — the poles are at FLAG_POLES. */
export const buildRoom = (root: THREE.Object3D) => {
  const b = new Batch();
  const floorM = lam("floorWood", () => ({ color: "#b98a5a" }));
  const carpetM = lam("carpet", () => ({ color: "#7e2a24" }));
  const wallM = lam("wallCream", () => ({ color: "#e8d9b8" }));
  const wallSideM = lam("wallCreamSide", () => ({ color: "#ddcba6" }));
  const wainsM = lam("wainscot", () => ({ color: "#7a5238" }));
  const curtainM = lam("curtain", () => ({ color: "#7e2a26" }));
  const podiumM = lam("podiumWood", () => ({ color: "#6e4b33" }));
  const podiumTopM = lam("podiumTop", () => ({ color: "#8a5f3f" }));
  const micM = lam("micMetal", () => ({ color: "#3a3a40" }));
  const goldM = lam("gold", () => ({ color: "#c9a24e" }));
  const chairM = lam("chairRed", () => ({ color: "#75322c" }));
  const chairLegM = lam("chairLeg", () => ({ color: "#4a3426" }));

  // floor (z -6 .. 12, x -8 .. 8) + red carpet runner down the centre aisle
  b.add(boxGeo(V(-8, -0.1, -6), V(8, 0, 12), 0, true), floorM);
  b.add(boxGeo(V(-1.6, 0, -3.8), V(1.6, 0.03, 6.5)), carpetM);
  // back wall (z = -6) + side walls (x = +-8), 8 m tall; wainscot strip along the back wall
  b.add(boxGeo(V(-8, 0, -6.3), V(8, 8, -6)), wallM);
  b.add(boxGeo(V(-8.3, 0, -6), V(-8, 8, 12)), wallSideM);
  b.add(boxGeo(V(8, 0, -6), V(8.3, 8, 12)), wallSideM);
  b.add(boxGeo(V(-8, 0, -5.98), V(8, 1.1, -5.9)), wainsM);
  // curtain backdrop behind the podium + flags (x -3.5 .. 3.5, up to 3.4 m), with a top valance
  b.add(boxGeo(V(-3.5, 0, -5.96), V(3.5, 3.4, -5.88)), curtainM);
  b.add(boxGeo(V(-3.6, 3.2, -5.96), V(3.6, 3.55, -5.86)), lam("curtainDark", () => ({ color: "#6b211d" })));
  // wall panels flanking the curtain (thin proud boxes, so the back wall is not one flat slab)
  for (const x of [-5.6, 5.6]) b.add(boxGeo(V(x - 1.1, 1.4, -5.97), V(x + 1.1, 4.6, -5.9)), lam("panel", () => ({ color: "#dfcda4" })));
  // podium: body + top slab, front face toward the press (+z). 1.0 m tall (not 1.15): Bush's head + shoulders
  // must read over it from the setting / deadpan cameras, which sit only a few metres away.
  b.add(boxGeo(V(-0.8, 0, -4.6), V(0.8, 1.0, -3.9)), podiumM);
  b.add(boxGeo(V(-0.9, 1.0, -4.7), V(0.9, 1.08, -3.8)), podiumTopM);
  // two microphones on the podium top: thin stems + small head boxes, angled toward Bush.
  // Wider apart (±0.45) and shorter than the first passes: at ±0.25 / ±0.38 their heads sat at Bush's ear level
  // and read as black earmuffs flanking his face in the close-ups. Now they sit below chin level.
  for (const [x, tilt] of [[-0.45, 0.18], [0.45, -0.18]] as const) {
    const m = new THREE.Matrix4().makeRotationZ(tilt).setPosition(x, 1.08, -4.15);
    b.add(boxGeo(V(-0.02, 0, -0.02), V(0.02, 0.26, 0.02)), micM, m);
    const hm = new THREE.Matrix4().makeRotationZ(tilt).setPosition(x + tilt * 0.26, 1.08 + 0.26, -4.15);
    b.add(boxGeo(V(-0.035, 0, -0.035), V(0.035, 0.06, 0.035)), micM, hm);
  }
  // flag poles: gold, 2.7 m, with a finial ball; cloths are added by world.ts
  for (const [x, z] of FLAG_POLES) {
    b.add(boxGeo(V(x - 0.03, 0, z - 0.03), V(x + 0.03, 2.7, z + 0.03)), goldM);
    const ball = new THREE.SphereGeometry(0.07, 10, 8);
    b.add(ball, goldM, new THREE.Matrix4().makeTranslation(x, 2.76, z));
  }
  // chairs: 4 rows x 7, seat + back + 4 legs each (seat top 0.45 m)
  for (const z of ROWS_Z) for (const x of COLS_X) {
    b.add(boxGeo(V(x - 0.24, 0.42, z - 0.2), V(x + 0.24, 0.47, z + 0.2)), chairM); // seat
    b.add(boxGeo(V(x - 0.24, 0.47, z - 0.24), V(x + 0.24, 0.95, z - 0.18)), chairM); // back
    for (const [dx, dz] of [[-0.2, -0.16], [0.2, -0.16], [-0.2, 0.16], [0.2, 0.16]] as const)
      b.add(boxGeo(V(x + dx - 0.025, 0, z + dz - 0.025), V(x + dx + 0.025, 0.42, z + dz + 0.025)), chairLegM);
  }
  b.build(root);
};
