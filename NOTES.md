# Bush Shoe Short — Remotion scaffold NOTES

Date: 2026-11-09. Scope: pure port of the bridge template + pipeline proof only.
No scene/story/world adaptation yet (press-room work is a later step).
Nothing under `~/workspace/custom-skills/` was edited; nothing in
`../voice/`, `../audio/`, `../out/`, `../qa/` or `../SCRIPT.md` was touched.

## Project layout

- `package.json` / `tsconfig.json` / `src/index.ts` / `src/Root.tsx`
- Composition `BushShoeShort`, 1080x1920, 30 fps, `durationInFrames` =
  `BUSH_SHOE_FRAMES` (= `TOTAL` = 2025, the bridge template's own total —
  kept as the placeholder until the real duration is set).
- `src/videos/bush-shoe/` — copy of `templates/bridge/`, renamed
  `Bridge.tsx` → `BushShoeShort.tsx`, `BridgeShort` → `BushShoeShort`,
  `BRIDGE_FRAMES` → `BUSH_SHOE_FRAMES`, delayRender label "bridge kit" →
  "bush-shoe kit". Verified by diff: the other 12 files
  (build, cardshade, cast, grade, ink, lensblur, lights, paint, shade,
  story, toon, world) are byte-identical to the templates.
- `public/` is empty: the Kenney GLB kit (`public/bridge/kenney/*.glb`) is
  missing, as expected. `loadKit()` catches each 404 and returns an empty
  kit; renders proceed (52 `404 .../bridge/kenney/*.glb` lines in the
  browser log are expected, not errors).
- `scripts/stills.mjs` — Linux adaptation of the template's
  `scripts/bridge-stills.mjs` (Windows Chrome path replaced; composition id
  `BushShoeShort`; `BUSH_SHOE_ENTRY` env override; `gl: "swangle"` default;
  `delayRenderTimeoutInMilliseconds: 300000`, still timeout 600000 ms
  (template's 180000 — a full-post SwiftShader frame is slow).
- `scripts/chrome-unsafe-swiftshader.sh` — wrapper adding
  `--enable-unsafe-swiftshader` (diagnostic only, not used by default).
- `src/sandboxes/` — diagnostic sandboxes from the blank-still diagnosis
  (see below) plus `src/sandboxes/stills/`, the entry used for proof stills.

## Installed versions (npm install clean, no peer conflicts)

- remotion / @remotion/cli / @remotion/three / @remotion/bundler /
  @remotion/renderer: **4.0.542**
- react **19.3.1**, react-dom **19.3.1**
- @react-three/fiber **9.8.2**, @react-three/postprocessing **3.2.2**
- three **0.180.0** (downgraded from 0.187.0 during diagnosis — see below;
  kept because the proof stills were produced with it; postprocessing's
  peer range is >=0.168 <0.188)
- postprocessing **6.39.6**, typescript **5.9.3**
- node v24.22.1, npm 10.9.4

## Browser

- `npx remotion browser ensure` installed Chrome Headless Shell
  **158.0.8127.2** at
  `node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell`
  (first attempt failed transiently: remotion.media sent no data for 20 s;
  retry succeeded). `--version` confirms `Chromium 158.0.8127.2`.
- GL backend: `gl: "swangle"` (SwiftShader-on-ANGLE; this VM has no GPU).
  `gl: "angle"` fails: `THREE.WebGLRenderer: Error creating WebGL context`
  (Chrome 158 needs `--enable-unsafe-swiftshader` for the software
  fallback, which Remotion 4.0.542 only adds with V5 breaking changes).
  `gl: "swiftshader"` fails the same way.
- The environment's full browser `/opt/meta-chromium/chrome` ("Muse
  Browser 157.0.8103.41") is NOT usable: it refuses to launch outside its
  managed harness ("Hatch WebGL domain policy is required for browser
  startup").

## Temp dir

`TEMP`/`TMPDIR`/`REMOTION_TMP` =
`~/workspace/bush-shoe-short/remotion-tmp` (never /tmp). It now holds
~931 MB of `remotion-webpack-bundle-*` / `puppeteer_dev_chrome_profile-*`
folders — normal per the skill's disk gotcha; sweep when the project is
done and nothing is rendering.

## Checks

- `npx tsc --noEmit` — **PASS** (exit 0). Note: it initially failed on 2
  errors in scratch diag sandboxes (`EffectComposer` without children);
  fixed by passing `{null}` children in those diag files only.
- Proof stills (scale 0.5, JPEG q88, 540x960), both visually verified as
  real renders (not blank):
  - `stills-test/frame100.jpg` — **94,919 bytes** (shot 1: marching
    soldiers on the bridge deck, ink outlines + DOF visible). 88.4 s.
  - `stills-test/frame1000.jpg` — **46,171 bytes** (shot 8: chain/anchor
    close-up, ink + DOF-blurred town). 76.0 s.
  - Command: `BUSH_SHOE_ENTRY=src/sandboxes/stills/index.tsx node
    scripts/stills.mjs stills-test/frame 100,1000 0.5` (run as two
    separate calls; env `TEMP/TMPDIR/REMOTION_TMP` set to remotion-tmp).
  - Diagnostic stills in `stills-test/` (`diag-*`, `gl-*`) are the
    evidence trail for the blank-still diagnosis below.

## Blocker found and worked around: the one-advance blank-still race

Rendering the unmodified entry (`src/index.ts`) produced a blank
pale-blue frame (3,820 bytes, just the `#cfe3f2` background div), with no
browser errors. Diagnosis, step by step (evidence stills in
`stills-test/`):

1. Plain div composition renders fine (`diag-div-100.jpg`) — the
   screenshot mechanism works.
2. Minimal R3F scene renders (`diag-r3f-100.jpg`) — WebGL/SwiftShader
   works.
3. The bridge `World` alone in a plain `ThreeCanvas` renders beautifully
   (`diag-world-100.jpg`, 140,833 bytes) — world, camera and characters
   are fine; the missing Kenney kit is harmless.
4. Post-off, MSAA-0, empty-composer and even a 90 s wait all still blank
   — not the post effects, not MSAA, not a timing race.
5. Minimal scene + empty `EffectComposer` is blank, but renders correctly
   after a second manual `advance()` (`diag-composer2-100.jpg`).
6. Root cause: `@react-three/postprocessing` v3 creates its
   `EffectComposer` in a `useEffect` (after mount), while
   `@remotion/three`'s `ManualFrameRenderer` advances the R3F loop only
   once per still — and that advance runs before the composer exists, so
   its `useFrame` no-ops while its priority-1 subscription suppresses
   R3F's default render. The composer, scene and WebGL all work; the
   captured frame is just taken before the composer exists.
7. Ruled out: `three` 0.187 → 0.180 changes nothing; `frameBufferType`
   `UnsignedByteType` changes nothing; `gl: "angle"` +
   `--enable-unsafe-swiftshader` and `gl: "swiftshader"` don't help.

Workaround (proof stills only): `src/sandboxes/stills/` is a
byte-identical copy of the ported component (imports repointed) plus a
`ReAdvance` child inside the `ThreeCanvas` that calls `advance()` once
more 2 s after mount, held by a `delayRender` handle. It changes no
scene, camera or post code — the pixels are the template's own frame
output. **Open item for the next step:** video renders should be
unaffected beyond frame 0 (the composer exists from frame 1 on), but
verify frame 0 when the first video render runs; a durable fix would be
to create the composer synchronously (or otherwise force an advance
after mount) in the ported component — do NOT do that silently during
the press-room adaptation, flag it as its own change.

## Known warnings (non-blocking)

- `THREE.Clock: This module has been deprecated. Please use THREE.Timer
  instead.` (three 0.180, template code — harmless for now).
- `THREE.WebGLShadowMap: PCFSoftShadowMap has been removed. Using
  PCFShadowMap instead.` (three 0.180).
- `Automatic fallback to software WebGL has been deprecated. Please use
  the --enable-unsafe-swiftshader flag...` (headless shell + swangle;
  rendering still works).
- Full-post SwiftShader stills take ~75–90 s each at scale 0.5
  (1080x1920 buffer; R3F clamps dpr ≥ 1). A 2K video render will be slow;
  budget accordingly.
