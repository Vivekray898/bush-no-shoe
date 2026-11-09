# Bush Shoe Throw — scene adaptation: bridge/town/river → Baghdad palace press room

Adaptation of the cartoon 3D short "Bush Shoe Throw — 2008" from the bridge/town/river
scene to an indoor press-conference room. Scope: only
`remotion/src/videos/bush-shoe/` (plus `src/index.ts` / `src/Root.tsx` for the TOTAL
constant). `voice/`, `audio/`, `out/`, `qa/`, `SCRIPT.md` and `~/workspace/custom-skills/`
were not touched. No full video render yet — that is the next step after this look-check.

## Timing (verified from `voice/words.json`, 2026-11-09)
Voice 67.10 s, 188 words; **TOTAL = 2013 frames @ 30 fps**.
Key beats: "Twice." f127–140 (flash right after, FLASH_AT=140); al-Zaidi "stands" f607;
throw 1 "throws" f750; "Bush ducks" f781; throw 2 "throws" f848; "Bush ducks again" f953;
shoe hits flag ~f1070 ("flag" 35.66 s); "Luckily," f1132; "Unluckily" f1204; "dodgeball"
f1397; "jailed for nine months" f1633; "size 10 shoe" f1852.

## What changed per file

### `story.ts` (full rewrite)
- TOTAL = 2013. 9 shots, all "day" light, crowd "press": 1 hook f0–156; 2 setting
  f156–501; 3 throw 1 f501–814 (stand f607, throw f750, duck f781); 4 throw 2 f814–1117
  (duck f953, flag hit f1070); 5 deadpan f1117–1287 (Luckily f1132, Unluckily f1204);
  6 explanation f1287–1529; 7 consequence f1529–1721; 8 callback f1721–1905 (size-10
  f1852); 9 final wide f1905–2013. XFADE = {} (hard cuts only); FLASH_AT = 140.
- Kept helpers: glide, pushK, dolly, zoom, rolled, run, mix, full, camAt, kickAt,
  keyEnd, shotAt, layersAt, dofAt, focusAt. KICKS (seconds, gain): [25.0, 0.6],
  [26.04, 0.7], [28.26, 0.6], [31.78, 0.7], [35.66, 0.9].
- Room constants: PODIUM [0,0,-4.2]; BUSH_AT [0,0,-4.9]; MALIKI_AT [1.05,0,-4.9];
  ZAIDI_AT [1.2,0,0.2]; FLAG_US [-1.7,0,-5.3]; FLAG_IQ [1.7,0,-5.3]; GUARD_L/R
  [±2.4,0,-3.4]; ROWS_Z [0.2,1.8,3.4,5.0]; COLS_X [-3.6,-2.4,-1.2,0,1.2,2.4,3.6];
  BUSH_EYES [0,1.55,-4.9]; SHOE_REST [0.3,0.1,-3.6].
- Timing helpers: DUCK1_F=781, DUCK2_F=953, REPLAY_DUCK_F=1441, FLAG_HIT_F=1070,
  STAND_F=607; `duckDip(f,f0)` (0.35 m dip, starts 2 f before the word, 10 f total);
  `zaidiStandU(f)` (smooth over f604–616); `shoe1At` f750–782 (hand [1.2,1.5,0.7] →
  [0.1,1.6,-4.3]); `shoe2At` f855–1072 (hand → past Bush at f955 → US flag
  [-1.7,2.2,-5.25]); `replayShoeAt` f1380–1450 ([0,1.6,-2.0]→[0,1.6,-5.5]);
  `flagWobble(f)` decaying oscillation from f1070.
- DOF: 0 wides; 10 setting/throw 2/explanation; 12 throw 1/callback; 14 deadpan CU +
  shoe CU (f1852, focus SHOE_REST); 8 consequence. FOREGROUND = [] (empty — the room
  is small, a near prop would be a cut-off blob).

### `build.ts` (rewrite; kept Batch, Strand, boxGeo, lam, V, quad, tri, kitClone simplified to the GLB branch only)
- Deleted town/house/bridge/veg/banner/prop builders. Added `buildRoom(root)`: floor
  x±8, z -6..12; red carpet runner; back + side walls 8 m tall; wainscot; red curtain
  backdrop (x±3.5, to 3.4 m) + valance; wall panels; podium 1.0 m tall + top slab;
  two microphones (x±0.45, 0.26 m stems, 0.06 m heads — below chin level); gold flag
  poles at [-1.7,-5.3] and [1.7,-5.3] with finial balls; chairs 4 rows × 7 (seat
  0.45 m, muted red #75322c; carpet muted to #7e2a24).
- Added `usFlagTex()` (13 stripes + blue canton with white star dots) and
  `iraqFlagTex()` (red/white/black bands + green band only — **no readable text
  anywhere**, per the no-text/no-labels rule).

### `cast.ts` (rewrite; kept Pool, Actor, Fx, SU, person(), blob(), lidAt(), viewOf, light2D, findSun)
- Outfits (own cartoon versions, bean-head style via toon.ts bodyFront/bodySide,
  unchanged): BUSH (dark suit #2f3038, grey hair #c8c8c8, scale 0.88); MALIKI (dark
  suit, dark hair + moustache, stern, scale 0.88); ZAIDI (light shirt #e8e2d4, scale
  0.8); GUARD (near-black suit, scale 0.85); press (8 jacket colours, hair/skin
  variants, scale 0.8).
- Bush: neutral; "shock" + dip on ducks (duckDip, tilt up to 0.12 rad); "grin" in
  shots 5, 8, 9; "relief" in shot 4 after f1000. Maliki: stern, "shock" + look -1 on
  ducks. al-Zaidi: sits until f607; stands over ~12 f stepping forward z 0.2→0.75
  (standing in the chair footprint read as standing ON the chair); shouts f685–735;
  `wave: 1` (right arm up) on throws f745–762 and f843–860; nervous after f1100;
  escorted out f1650–1703 from (1.2, 0.75) to (2.8, 5.6), hidden in shots 8–9
  (chair empty). Guards: stand at home; close in f1550–1620 to flank spots
  [-0.8,0,1.4] / [2.8,0,1.4]; escort f1650–1703; hidden shots 8–9.
- Press: 27 seated (minus al-Zaidi's chair); heads turn toward al-Zaidi after f605;
  gasp ("shock" front row / "nervous" others) f748–800 and f846–905; some grin in
  callback. **Near-cull: press members < 2.3 m from the camera are skipped for that
  frame** (leaves an empty chair, no blob).
- Shoe Fx: `drawShoe` (dark dress shoe side profile, 300×200 canvas, 0.5×0.33 m
  card, spinning rot); shoe 1 rests on floor at SHOE_REST from f790 (except shot 6);
  impact burst fx at flag f1070–1083.
- `stage(id, t, cam)` signature (dropped the BridgeState param); exports Pool, Actor,
  Fx, stage, SU, FPS, outfits.

### `world.ts` (rewrite; kept World class + update(id, f, camera, scene) contract, loadKit as-is)
- Deleted sky/river/bridge/clouds/smoke/water/sign/swing. Indoor: `buildRoom(R)`; warm
  scene background #e3d3ae; fog warm #dcc9a0 (not the day preset's sky-blue fog); no
  sky shader, no sun disc/halo.
- **Sun override (key fix):** `shotSun` forces az 165, el 50 (sun over the cameras'
  shoulders into the room). The day preset's az 75 put the sun behind the back wall,
  so wall/curtain/floor fell in the wall's shadow and rendered cold violet.
- Flags: cloth planes (1.5×0.95, 12×1 segments) hinged on poles (US extends +x from
  pole, Iraq −x), `waveFlag` travelling ripple + US flag `rotation.y = flagWobble*0.4`
  after the hit. Kept light-rig/uniform code (TONE/CHAR from LIGHTS.day), frustum
  culling, actor/fx loops, fgs machinery (empty FOREGROUND).

### Unchanged (unless a compile error forced it)
toon.ts, ink.ts, lensblur.ts, grade.ts, shade.ts, lights.ts (day preset), cardshade.ts,
paint.ts, BushShoeShort.tsx (post chain ink → lens pre → lens main → bloom → NEUTRAL
tone map → grade, MSAA 4, grain OFF), src/index.ts, src/Root.tsx
(BUSH_SHOE_FRAMES = TOTAL auto-updates to 2013).

## What was simplified / dropped and why
- **Whole town/bridge/river/park/swing geometry deleted** — the scene is one indoor
  room; keeping it would have been dead weight and a second set of shadows to fight.
- **FOREGROUND empty** — in a small room any foreground prop sits centimetres from
  the lens and reads as a cut-off blob (caught in r1).
- **No sky, no fog-to-horizon, no sun disc** — indoors; replaced by warm wall colour
  and warm fog.
- **No readable text anywhere** — flags are bands/stars/dots only; no captions, labels
  or on-screen words (the reference frames have captions; this video must not).
- **Kenney GLB kit still missing** (`public/` empty); `loadKit()` returns an empty kit
  and renders proceed. 404s for `bridge/kenney/*.glb` are expected, not errors.
- **Explanation shot is a 3/4 front view, not a true side view** — the replay shoe's
  path (along z at x = 0) is nearly radial from any +x side camera, so the shoe is
  out of frame for most of its flight from the side, and the podium guard blocks Bush.
  The 3/4 view keeps the whole line in frame and the shoe centred on Bush at the dip.
- **S3b throw cut is a zoom, not a dolly** — dollying in from the side pushed al-Zaidi
  (close to the lens, far off the look axis) to the frame edge; a zoom keeps his screen
  position and just makes the throw bigger.

## Look-check stills (all in `~/workspace/bush-shoe-short/remotion/stills-adapt/`)
Render command (from `remotion/`):
`export TEMP=~/workspace/bush-shoe-short/remotion-tmp TMPDIR=... REMOTION_TMP=... &&
BUSH_SHOE_ENTRY=src/sandboxes/stills/index.tsx node scripts/stills.mjs stills-adapt/<prefix> <frames> 0.5`
(~22–29 s per still after bundling; the sandbox entry is needed because
@react-three/postprocessing v3 creates its EffectComposer in a useEffect, so the
unmodified entry renders blank stills — see remotion/NOTES.md "Blocker found".)

### r1 — `frame70.jpg` (57 KB), `frame300.jpg` (27 KB), `frame600.jpg` (48 KB)
Scene rendered but everything purple/violet (sun behind the wall); Bush only a head
peeking over the podium in f300; mic stems looked like giant blue sticks; f600 had a
huge grey cut-off foreground head (press member ~1.5 m from the lens).

### r2 — `r2_70.jpg`, `r2_300.jpg`, `r2_600.jpg`
Warm room fixed (red curtain, cream walls, tan floor, flags read clearly); Bush
head+shoulders visible in f300; mics still read as earmuffs; f600 foreground blob gone
after near-cull.

### r3 — `r3_70.jpg`, `r3_300.jpg`, `r3_600.jpg`, `r3_770.jpg`, `r3_950.jpg`, `r3_1200.jpg`, `r3_1400.jpg`, `r3_1600.jpg`, `r3_1850.jpg`
- f70 hook wide: reads well; top third still some blank cream wall; guards at frame
  edges half-cut (acceptable).
- f300 setting: GOOD — Bush (grey hair, neutral) + al-Maliki (moustache, stern) both
  read at the podium, flags behind; mics smaller.
- f600 front row: GOOD — al-Zaidi seated (white shirt) reads; foreground blob gone
  (one partial head at bottom-right edge, recognisable).
- f770 throw 1: GOOD — al-Zaidi standing, press member gasping (shock face), shoe
  mid-flight above the podium near Bush's head; Bush not yet ducked (correct — duck is
  f781).
- f950 throw 2: GOOD — shoe 2 directly above Bush's head just before the f953 duck;
  resting shoe 1 visible on floor; Maliki stern; foreground press softly blurred.
- f1200 deadpan: GOOD — Bush big grin CU, grey hair, flags behind; mic heads flank his
  head as small black squares (stems thin).
- f1400 explanation side view: **BROKEN** — giant out-of-focus guard head fills the
  right half of the frame (S6 camera at x≈4.5 sat ~2.5 m from the right guard at
  (2.4,-3.4), on the sight line to the podium).
- f1600 consequence: **BROKEN** — al-Zaidi reads as standing ON his chair; a guard's
  head stacked directly behind/above his (two-headed figure); lots of blank wall above
  the group; one half-cut blurred foreground head at the bottom edge.
- f1850 callback: reads fine as podium MS (Bush grinning) — but f1850 is 2 frames
  BEFORE the S8b shoe-CU cut at f1852, so it does NOT show the shoe CU. Shoe CU still
  unverified at that point.

### r4 — `r4_770.jpg`, `r4_1400.jpg`, `r4_1600.jpg`, `r4_1900.jpg`
- f770: al-Zaidi now stands in front of his chair, but the S3b dolly-in pushed him to
  the left edge, half out of frame.
- f1400: S6 reframe to front-side — podium, Bush and flags read, but the replay shoe
  is NOT in frame (at f1400 it is at z≈-1.0, ~30° off the camera axis).
- f1600: al-Zaidi in front of his chair now, but the left guard's head still stacks
  directly above his (flank spots 0.2/2.2 were still too close to him).
- f1900 shoe CU: shoe fills the frame, cut off at the right edge — too tight, no
  context (flat brown podium + red carpet only).

### r5 — `r5_770.jpg`, `r5_1400.jpg`, `r5_1600.jpg`, `r5_1900.jpg`
- f770: al-Zaidi STILL half out of frame at the left edge (the dolly's push-in rotated
  the axis away from him).
- f1400: replay shoe now visible — big black shoe mid-flight above the podium, lace
  ticks visible — but very large, dominating the left half. Acceptable, reads clearly.
- f1600: stacked-heads problem GONE — al-Zaidi nervous with guards clearly separated
  behind-right; empty chair visible; reads as guards closing in.
- f1900: shoe smaller now but the frame is ~70% empty flat colour (brown podium top
  half, red carpet bottom half) — weak as an ending shot.

### r6 — `r6_770.jpg`, `r6_1900.jpg` (final)
- f770: **GOOD** — al-Zaidi stands centre-frame in his white shirt in front of his
  chair, press gasping around him, shoe 1 visible above the podium near Bush's head,
  podium + flags behind. The S3b zoom fix worked.
- f1900: **GOOD** — shoe on the red carpet in front of the podium, Bush grinning
  behind the podium, mics and flags in frame. The callback CU works; shoe reads clearly
  as a dark dress shoe with lace ticks.

## Fixes made (chronological)
1. Sun override az 165 / el 50 (r1 violet room → warm room).
2. Podium 1.15 m → 1.0 m; Bush/Maliki scale 0.88 (head+shoulders read over the podium).
3. S2 reframed higher/further/narrower (S2a [0.6,2.5,2.8] look [0.4,1.45,-4.9] fov 30;
   S2b [0.4,2.4,1.8] look [0.4,1.5,-4.9] fov 28).
4. S1/S9 look y 1.05; S3 lenses moved behind the back row (S3a [3.2,2.6,7.0];
   S3b [4.8,2.2,5.2] → later replaced by the zoom, see 11).
5. S5/S8 cameras raised (S5a/S5c y 2.0 fov 30; S8a [0.5,2.2,1.2] fov 32); guards moved
   to ±2.4; carpet #7e2a24, chairs #75322c.
6. Mics: x ±0.45, stems 0.26 m, heads 0.06 m (below chin level).
7. Press near-cull 2.0 m → 2.3 m (foreground blob gone).
8. al-Zaidi steps forward z 0.2→0.75 as he stands; escort starts from (1.2, 0.75);
   shoe1At/shoe2At start point z 0.0 → 0.7 (his stepped-forward hand).
9. Guard flank spots → [-0.8,0,1.4] / [2.8,0,1.4] (r4 still stacked heads at 0.2/2.2).
10. S6 reframed front-side, then to 3/4 front view ([3.0,1.8,3.0] look [0,1.4,-4.6]
    fov 40; S6b [2.6,1.8,2.2] look [0,1.4,-4.7] fov 38) after the side view failed
    twice; replay shoe starts mid-room (z -2.0) so it is in frame at "dodgeball".
11. S3b changed from dolly to zoom ([3.2,2.6,7.0] look [0.4,1.2,-2.0] fov 40) after
    two dolly attempts pushed al-Zaidi to the frame edge.
12. S7 reframed ([-3.2,1.9,3.6] look [1.2,1.0,0.6]; S7b [-2.4,1.9,4.2] look
    [1.8,1.0,2.0], both fov 40).
13. S8b shoe CU pulled back/up ([1.6,1.6,0.8] look [0.2,0.35,-3.8] fov 38) so the
    podium + Bush show behind the shoe.

## Reference-frame comparison
Compared r6_770 and r3_1200 against the skill's reference frames
`~/workspace/custom-skills/claude-animated-shorts/references/frames/short01_0060.jpg`
(ship scene) and `short02_0180.jpg` (indoor counter scene). Look only — no reference
content copied.
- **Ink:** matches — thick black outlines on the bean-head characters, flat colours.
  The r3_1200 Bush grin CU is very close to the reference look (big round head, closed
  happy eyes, thick outline).
- **Colour:** matches in saturation (red curtain/carpet, flags) but my palette is
  warmer and more monochrome — the references use more colour variety (blue sea,
  green counter, purple shirt). Acceptable for a press room.
- **Depth:** references layer foreground/background (counter in front, deck lines
  leading in). My wides get depth from the chair rows, but the top third of wide shots
  is empty wall — the weakest point vs the references, whose backgrounds carry more
  texture (wallpaper, sea, props). The CU matches reference depth well (flags behind,
  podium in front).
- **Faces/expressions:** match — gasp, grin, nervous all read clearly in the same
  bean-head face system.
- **Difference by design:** the reference frames carry on-screen captions ("steer",
  "The guy"); this video has none, per the no-text rule.

## Still broken / weak / unverified
- **Weak (accepted):** top third of the wide shots (hook f70, final f1905+) is blank
  cream wall; flag shadows on the curtain read as large purple rectangles (physically
  consistent with the look's violet shadows, but prominent); guards half-cut at wide
  shot edges; a half-cut blurred foreground head remains at the bottom edge of some
  front-row shots (recognisable, not a blob).
- **Unverified:** frame 0 of the video render (the @react-three/postprocessing v3
  EffectComposer useEffect quirk — stills used the sandbox entry with the extra
  `advance()`; video renders should be unaffected beyond frame 0, but verify on the
  first video render). No full video render has been done — that is the next step.
  The duck dips, flag wobble and shoe flights have been verified only at single still
  frames (f770, f950, f1400), not as motion.
- **Verification status:** `npx tsc --noEmit` passes (exit 0, no errors) after the
  final edits. All 9 required look-check frames were rendered and inspected at least
  once: 70, 300, 600, 770, 950, 1200, 1400, 1600, 1850, plus 1900 (shoe CU).
