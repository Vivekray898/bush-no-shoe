// The whole place as one three.js scene: a Baghdad palace press-conference room — floor, walls,
// curtain backdrop, podium with microphones, two flags, rows of chairs — and the cast.
// update(id, f, camera) poses everything for shot `id` at frame f (pure function of id + f).
// Indoor: no sky shader, no fog-to-horizon — a warm wall colour instead, and the scene background is
// a warm cream in case any lens ever sees past a wall top.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { Batch, boxGeo, V, lam, buildRoom, FLAG_POLES, usFlagTex, iraqFlagTex, Kit, kitClone } from "./build";
import { LIGHTS, LightPreset } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { FPS, SHOTS, FLAG_US, FLAG_IQ, camAt, flagWobble, FOREGROUND, ShotDef, V3 } from "./story";

// ---------------- assets ----------------
const KENNEY = ["tree_oak", "tree_default", "tree_detailed", "tree_fat", "tree_cone", "tree-high-round", "tree", "plant_bushLarge", "plant_bushDetailed",
  "plant_bush", "hedge", "flower_redA", "flower_yellowA", "flower_purpleA", "grass_large", "grass", "lily_large", "lantern", "cart", "stall-red",
  "stall-green", "stall-bench", "banner-red", "banner-green", "windmill", "canoe"];
let kitP: Promise<Kit> | null = null;
export const loadKit = () => {
  if (!kitP) {
    const loader = new GLTFLoader();
    kitP = Promise.all(KENNEY.map((n) => loader.loadAsync(staticFile(`bridge/kenney/${n}.glb`)).then((g) => [n, g.scene] as const).catch(() => [n, null] as const)))
      .then((list) => Object.fromEntries(list.filter((e) => e[1]).map(([n, s]) => [n, s!])) as Kit);
  }
  return kitP;
};

type Mats = Record<string, THREE.Material>;

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight; private fill: THREE.DirectionalLight;
  private fog = new THREE.Fog("#dcc9a0", 25, 300);
  private sunCache = new Map<number, THREE.Vector3>();
  private fgs: { o: THREE.Object3D; a: number; b: number }[] = [];
  private usFlag: THREE.Mesh; private iqFlag: THREE.Mesh;
  private usBase: Float32Array; private iqBase: Float32Array;
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(kit: Kit) {
    const R = this.root;
    // ---- light rig (three lights; the two-tone uniforms are set per frame in update()) ----
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    this.fill = new THREE.DirectionalLight("#9fb8ff", 0.35);
    R.add(this.hemi, this.sun, this.sun.target, this.fill, this.fill.target);

    // ---- the room (static batch) ----
    buildRoom(R);

    // ---- flags: cloth planes hinged on their poles (geometry translated so the pole edge is at x = 0) ----
    const mkFlag = (tex: THREE.Texture, poleX: number, poleZ: number, flip: boolean) => {
      const g = new THREE.PlaneGeometry(1.5, 0.95, 12, 1);
      g.translate(flip ? -0.75 : 0.75, 0, 0); // pole edge at the origin
      const m = new THREE.Mesh(g, lam(flip ? "flagIQ" : "flagUS", () => ({ map: tex, side: THREE.DoubleSide })));
      m.position.set(poleX, 2.2, poleZ);
      // FIX1 (9 Nov 2026): flag cloths cast NO shadow. Their shadows fell on the curtain/back wall as
      // huge flat purple rectangles (the two-tone shade colour is violet) that dominated the podium
      // shots. The thin gold poles still cast their own fine shadow; the cloths read fine without one.
      m.castShadow = false; m.frustumCulled = false;
      R.add(m);
      return { mesh: m, base: (g.attributes.position.array as Float32Array).slice() };
    };
    const us = mkFlag(usFlagTex(), FLAG_POLES[0][0], FLAG_POLES[0][1], false);
    const iq = mkFlag(iraqFlagTex(), FLAG_POLES[1][0], FLAG_POLES[1][1], true);
    this.usFlag = us.mesh; this.iqFlag = iq.mesh;
    this.usBase = us.base; this.iqBase = iq.base;

    // the CAM agent's near framing objects: built once, never passed through a sight-line filter, toggled per frame
    // (FOREGROUND is empty for the press room, so this stays empty — the machinery is kept for parity.)
    for (const fg of FOREGROUND) {
      const o = kitClone(kit, fg.kit, fg.s ?? 1);
      if (!o) continue;
      o.position.set(...fg.pos); o.rotation.y = fg.yaw ?? 0; o.visible = false;
      this.fgs.push({ o, a: fg.a, b: fg.b }); R.add(o);
    }
  }

  /** camera-relative sun, frozen per shot: the shot's mean view direction turned by az toward screen right, lifted by el.
   *  Indoor override: the day preset's az 75 puts the sun BEHIND the back wall, so the wall, curtain and floor all
   *  fall in the wall's shadow and render cold violet. az 165 puts the sun over the cameras' shoulders, into the
   *  room, so the back wall, podium front and faces are lit warm. */
  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(165), el = THREE.MathUtils.degToRad(50);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** wave one flag cloth: a travelling ripple growing toward the free edge, plus a bigger swing after the hit */
  private waveFlag(mesh: THREE.Mesh, base: Float32Array, t: number, wob: number) {
    const p = mesh.geometry.attributes.position as THREE.BufferAttribute;
    const amp = 0.05 + Math.abs(wob) * 0.55;
    for (let i = 0; i < p.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1];
      const u = Math.abs(bx) / 1.5; // 0 at the pole .. 1 at the free edge
      p.setZ(i, amp * u * Math.sin(t * 5 - u * 5) + 0.03 * u * Math.sin(t * 8.5 - u * 9));
      p.setY(i, by + 0.02 * u * Math.sin(t * 4 - u * 3));
    }
    p.needsUpdate = true;
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light];
    // ---- camera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig: camera-relative sun frozen per shot, two-tone uniforms, shadow fit ----
    const sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.fill.intensity = 0; // not used by the two-tone shading
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...[0, 0, 0]); TONE.uSat.value = 1.08;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- indoor fog + background: warm wall colour, not sky blue (the day preset's fog is sky horizon blue) ----
    untone("#dcc9a0", this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog;
    scene.background = new THREE.Color("#e3d3ae");
    // ---- foreground framing objects: inside their frames AND their own shot (so a crossfade layer never shows them) ----
    for (const g of this.fgs) g.o.visible = f >= g.a && f < g.b && g.a < s.b && g.b > s.a;
    // ---- flags: gentle wave always; the US flag swings hard after shoe 2 hits it ----
    const wob = flagWobble(f);
    this.waveFlag(this.usFlag, this.usBase, t, wob);
    this.waveFlag(this.iqFlag, this.iqBase, t, 0);
    this.usFlag.rotation.y = wob * 0.4;
    this.iqFlag.rotation.y = 0;
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, t, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const tint = "#ffffff";
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      if (a.mat.emissiveMap) a.mat.emissive.set(tint);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return focus;
  }
}
