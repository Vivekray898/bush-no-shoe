# Fix round 2 — Bush Shoe Throw short (9 Nov 2026, evening)

The user reviewed the render and said the frames are a mess and not close to the
skill's reference examples. Six defects, fixed against
`~/workspace/custom-skills/claude-animated-shorts/SKILL.md` (especially
"Readability traps the verifier caught" and the Camera/Characters look targets)
and `references/reports/characters.md` (§1.5–1.6 bodies, §2.7 side view, §2.8 shading).

Timing is UNCHANGED: TOTAL 2034 frames, all beats from
`voice-elevenlabs/words.json` (see `RETIME.md`). No script, voice, mix, TOTAL or
shot-beat change. Four look-check rounds were run (r1/r2/r3/r4 stills in
`stills-fix2/`); the rounds found and fixed two further bugs of their own
(see "What the look-check rounds caught" below).

## 1. al-Zaidi faces the audience, not Bush

**Skill rule broken:** the cast is supposed to face its target — `bodySide` +
`viewOf()` exist exactly for facing a direction (characters.md §2.7: side view,
features slide toward the facing side, nose tick, torso a narrower bean).
A man shouting and throwing AT someone, drawn front-on to the camera, reads as
addressing the audience.

**What changed** (`cast.ts`, `toon.ts`):
- `zaidi()` standing/shouting/throwing now uses `bodySide` (side view) with a
  mirror computed from where Bush actually sits ON SCREEN
  (`(BUSH − zaidi) · cam.right < 0` → mirror). `viewOf()`'s mirror was NOT used:
  it keys off the walk direction and gets shot 4 wrong (from dead behind, Bush is
  screen-left of him but `viewOf` faces him screen-right).
- New `SideOpts.raise` (`toon.ts`): the throw is a raised arm up-forward toward
  Bush (hand above shoulder height) plus a 6° lean into the throw — the old
  front-view `wave` is gone. `bodySide` had no raised-arm pose; it does now.
- Seated, he is 3/4 toward the podium (`facing`/`look` from the screen direction
  of Bush), not flat front-on.
- The press got the same treatment in reverse: their `facing`/`look` now come
  from the screen direction of the target (the podium, or al-Zaidi once he
  stands at f597), not from world-x only — the old rule was wrong from any
  camera that is not dead behind the rows.
- Scales: al-Zaidi standing 0.8 → 0.9 (at 0.8 he was 1.34 m next to 1.68 m Bush);
  seated 0.8 → 0.85; escort branch 1.0 → 0.9 so he does not jump size between shots.

**Proved by:** `stills-fix2/r2_599.jpg` (standing, profile facing left toward the
podium), `r2_749.jpg` (throw 1, arm raised toward Bush), `r2_797.jpg` (duck 1,
shoe flying over Bush's head), `r2_1634.jpg` (consequence, nervous profile).

## 2. Press are half-sunken in their chairs

**Skill rule broken:** characters.md §1.5 — sitting torso is 1.23 head-heights;
a sitter must read as SITTING ON a chair, torso/arms/lap visible, the chair
visibly UNDER them.

**Root cause (measured, not guessed):** the chair back topped at 0.95 m while a
seated press figure at scale 0.8 had its crown at ~0.88 m — the chair was
TALLER than the sitter, so only a head poked above a tall red box, and the bent
legs in `toon.ts` sit mode were hidden behind the seat box.

**What changed** (`build.ts`, `cast.ts`):
- Chair back 0.95 → 0.68 m, top rail 0.90–0.96 → 0.63–0.69 m.
- Sitter scale 0.8 → 0.85 (crown ~0.94 m, above the lowered back).

**Proved by:** `stills-fix2/r2_70.jpg` (8 members, torsos + arms visible above
the chair backs), `r2_2033.jpg` (4 members), `r2_1634.jpg` (seated member in
blue, torso and arms in the open, chair under him).

## 3. Podium closeup is a mess

**Skill rule broken:** the Camera look target — a medium shot must hold its
subjects whole: both flags in frame, the speaker's head AND shoulders over the
podium, nobody half-cut behind the podium edge, microphones attached to the
podium. The old shot broke all four at once.

**Root causes (measured):**
- At fov 30 the visible half-width at the flags was only ~1.2 m against flags
  at ±1.7 m — both flags were cut by construction.
- Bush at scale 0.88 is 1.48 m, chin ~1.05 m — just BELOW the 1.08 m podium
  top, so only his head peeked over it.
- Maliki at x 1.05 stood behind the podium's right corner (x 0.9).
- The purple vertical stripe is the flag POLES' cast shadow on the curtain: the
  sun sits behind the cameras, so a casting pole throws a thin vertical violet
  shadow onto the curtain right beside its flag. (The cloths already did not
  cast — fix round 1.)
- The microphones' stems were 0.04 m wide on 0.14 m bases — they read as floating.

**What changed** (`story.ts`, `cast.ts`, `build.ts`):
- S2a/S2b pulled back (z 4.0/3.4) and widened (fov 48, was 30/28), centred on
  x 0 — half-width ~2.2 m at the flags. S8a the same (z 3.6, fov 48, was
  z 1.2/fov 32 — the "pulled back" note in the old comment was never applied).
  Push rates slowed (S2a 0.0015, S2b 0.001, S8a 0.0015) so the dolly does not
  carry the camera past the poles by the end of the shot (r1_300 caught this:
  the US pole was just-cut at f300).
- Bush and Maliki scale 0.88 → 1.0 (Bush is 1.68 m now, chin ~1.20 m — head
  AND shoulders over the podium). `BUSH_EYES` 1.55 → 1.45 m to match.
- `MALIKI_AT` x 1.05 → 1.35, so he clears the podium's right corner.
- Flag poles moved to a separate NO-CAST batch (`nb.build(root, false)`) —
  the stripe is gone. (Gold poles still receive light; they just stop drawing it.)
- Microphones: stems ±0.03 (was ±0.02), head boxes ±0.05, base discs ±0.10,
  moved forward to z −4.05 (nearer the slab's front edge).

**Proved by:** `stills-fix2/r4_150.jpg` (podium MS: both flags + poles + finials
in frame, no stripe, Bush head + shoulders, Maliki whole, mics on the podium),
`r2_300.jpg` (same at the end of the push-in), `r2_1125.jpg` (deadpan CU),
`r2_1854.jpg` (shoe CU).

## 4. Huge blurred head at the frame edge

**Skill rule broken (quoted):** "Props or flotsam closer than ~2 m to a lens
become huge cut-off blobs at the frame edge" and "a foreground prop must be
recognisable or gone". The 2.8 m distance cull was not enough — a member 3+ m
away can still be half-cut at an edge, and DOF blur turns it into an
unrecognisable blob. (The round-1 note claiming the remaining blurred heads
were "foreground depth framing" was wrong — the user showed they read as a mess,
so they are removed, not rationalised.)

**What changed** (`cast.ts`, `world.ts`):
- New screen-space `edgeCull()`: a card whose projected extent crosses into the
  outer ~15% of the frame is removed (the empty chair stays — an empty seat
  reads better than a half-head). Applied to press members, guards, and seated
  al-Zaidi (his seated branch had NO cull at all — r2_150 caught his half-head
  at the podium MS's bottom-right corner). Standing al-Zaidi is never culled:
  he is the subject of shots 3/4/6/7.
- Calibrated, not blind: the trap is about NEAR, unrecognisable blobs, so the
  strict margin applies only under ~6 m (0.65); farther members are small and
  recognisable, so they are removed only if the card actually crosses the frame
  edge (margin 1.0). That keeps the wide-shot crowd instead of emptying the
  outer columns.
- Distance cull 2.8 → 3.2 m.
- `world.ts` now passes the real `fov` and `look` target into the cast
  (`CamInfo` gained both) so the cull uses the true camera.
- Wide dollies slowed (S1a 0.0012, S1b 0.001, S9a 0.001 — was 0.0025/0.002/
  0.002) so the wides keep a crowd: the fast push had carried the camera from
  z 10.2 to ~z 5.8, putting the near rows under/behind the lens and the far
  rows' outer columns at the edges, where the cull removed them.

**Proved by:** `stills-fix2/r4_70.jpg` and `r4_2033.jpg` (wides: 8 and 4 members,
no edge blobs), `r4_150.jpg` (podium MS: no foreground heads at all),
`r4_1079.jpg` (flag hit: no blurred foreground figure), `r2_1634.jpg`
(consequence: no edge blobs; the seated member at the right is whole).

## 5. Purple blotches on the floor/carpet

**Skill rule broken:** characters.md §2.8 / the characters report — the contact
shadow is a TIGHT pool right under the feet plus a short soft tail. What the
renders showed was purple stains across the carpet.

**Root cause (proved, not assumed):** TWO sources, and the decisive evidence is
the final wide (r1_2033): big purple patches sit under chairs where NO figure
is drawn at all, so the stains cannot be (only) the figures' blobs.
- (a) The CHAIRS' own cast shadows: long, soft, violet from the hemisphere
  light, under every chair, pointing toward the camera.
- (b) The blob TAILS: up to ~1.4 m long, 0.72 m wide, dark violet, overlapping
  across the rows. Round 1 shortened and lightened them; the r1 stills proved
  that was not enough.

**What changed** (`cast.ts`, `build.ts`):
- Blob tails REMOVED entirely — contact pool only (pool 0.5 × 0.34 m, lighter
  colour [0.30, 0.31, 0.42]). Indoors, on a red carpet, a long violet floor
  shadow reads as a stain, not as light; the tight pool alone is what stops a
  figure floating, and the room's real shadows come from the light rig.
- All chairs moved to the NO-CAST batch with the poles — they still receive
  light and shadow, they just stop drawing their own. (Their legs touch the
  floor, so they stay grounded.)

**Proved by:** `stills-fix2/r2_70.jpg`, `r2_1634.jpg`, `r2_2033.jpg`,
`r4_1079.jpg` — the carpet reads as carpet (red with gold bands) in every
shot; no purple anywhere on the floor.

## 6. Wide shot middle wall is a flat red expanse

**Skill rule broken:** the Camera/Characters look target — the wide shot must
have something to look at at every height. The top got decor in fix round 1,
but the curtain (y 0–3.4, the full width of the frame) was bare red between the
medallion and the flags.

**What changed** (`build.ts`): four framed panels on the curtain (gold frame,
darker-red inner, y 0.7–2.7, at x ±2.6/±0.9) plus five gold vertical fold
strips (y 0–3.4, at x −3.25/−1.75/0/1.75/3.25), slightly proud of the curtain
face; the flags (z −5.3) still hang in front of them.

**Proved by:** `stills-fix2/r2_70.jpg` and `r2_2033.jpg` (gold-framed panels
visible around and between the flags at every height of the wide shot).

## What the look-check rounds caught (beyond the six defects)

- **Round 1 (r1_*):** the first `edgeCull` ignored the camera's downward pitch
  (forward was computed as up × right), so its vertical NDC was wrong and the
  bottom test removed whole rows — the wides came out nearly empty (r1_70,
  r1_2033). Fixed: forward now comes from the look target, and the bottom edge
  tests the card CENTRE (ny < −0.9), not its lower edge — a foreground row whose
  feet are below the frame but whose head is in it is a normal wide shot.
- **Round 1:** the S2b push had carried the camera to z ~1.7 by f300, where the
  half-width at the flags is only ~1.67 m — the US pole was just-cut at the left
  edge again (r1_300). Fixed: fov 48 + slower pushes (see defect 3).
- **Round 2 (r2_*):** seated al-Zaidi had no edge cull, so his half-head filled
  the podium MS's bottom-right corner (r2_150). Fixed: seated branch culled
  like the press.
- **Round 2:** the podium MS foreground head (front-row centre member, 0.67)
  and the flag-hit foreground member (0.71) survived the 0.82 margin. Fixed:
  near margin 0.65 (r4_150, r4_1079 clean; wides byte-identical to r2).
- **Not a bug:** al-Zaidi is out of frame at the flag-hit moment (f1079) — the
  shot-4 dolly has carried the camera past him by then, and the shot is about
  the shoe hitting the flag. The replay shoe in shot 6 (r3_1400) is large and
  dark, and Maliki is half-cut at that shot's right edge — shot 6 was not in
  the complaint list and the camera was not reframed for it.

## Still imperfect, honestly

- The wides keep only the inner columns: the outer columns (±2.0, ±3.0) are
  empty chairs, because at the wide cameras they sit at or beyond the frame
  edge. The room reads as occupied (8 members in shot 1, 4 in shot 9), but the
  far left/right of the press area is chairs, not people.
- In shot 3 (throw 1) the press are all out of frame by the edge rule — the
  shot is al-Zaidi + empty chairs + podium. The subject reads clearly, but the
  audience reaction (the gasp) has no visible faces in that shot.
- Shot 6 (dodgeball explanation, r3_1400): the replay shoe is a big dark shape
  close to the lens, and Maliki is half-cut at the right edge. Not reframed.
- The raised throwing arm (toon.ts `raise`) reads as a dark blob above
  al-Zaidi's head at 540 px (r2_749) — the arm points up-forward toward Bush,
  but at this scale it looks a little like a cap. It reads correctly in motion
  (the shoe leaves his hand), but the single still is ambiguous.
- The medallion's white halo: in the podium MS stills (r2_150, r4_150) the gold
  medallion has a small white ring/crescent under it (its shading on the wall).
  Minor; not fixed.
- The top cream band of the wide shots is still mostly plain cream above the
  pelmet — cornice + medallion + portraits are there, but the very top ~10% is
  empty wall. Acceptable, not empty like before.

## Files changed

- `src/videos/bush-shoe/toon.ts` — `SideOpts.raise` (throwing arm + lean).
- `src/videos/bush-shoe/cast.ts` — side-view al-Zaidi + screen-side mirror;
  seated 3/4 facing; press 3/4 facing; `edgeCull()` + `CamInfo.fov/look`;
  distance cull 3.2 m; Bush/Maliki/al-Zaidi/guards scales; blob tails removed,
  pool only; guards edge-culled; seated al-Zaidi edge-culled.
- `src/videos/bush-shoe/build.ts` — chair backs 0.95 → 0.68 m; poles + chairs
  to the no-cast batch; curtain panels + fold strips; thicker mics, bigger bases.
- `src/videos/bush-shoe/story.ts` — `MALIKI_AT` x 1.35; `BUSH_EYES` y 1.45;
  S2a/S2b fov 48 + slower pushes; S8a fov 48 + slower push; S1a/S1b/S9a slower
  dollies.
- `src/videos/bush-shoe/world.ts` — passes `fov` + `look` into the cast.

`npx tsc --noEmit` exit 0 (after every round). Timing unchanged: TOTAL 2034.
