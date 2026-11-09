# Scene fixes — Bush Shoe Throw press room (9 Nov 2026)

Fixes for the four visual gaps found in the user's own rendered video
(67.1 s, 1080x1920, reviewed 9 Nov 2026). Nothing else changed: script,
story timing, TOTAL = 2013 frames, and every shot beat (stands f607,
throws f750/f848, ducks f781/f953, flag hit f1070, Luckily f1132,
dodgeball f1397, jailed f1633, size-10 f1852) are untouched, so the
existing voice (67.10 s) and audio mix stay in sync. No re-render of the
full video was done here — stills only.

## 1. Empty cream wall (top ~1/3 of wide shots) — FIXED
`src/videos/bush-shoe/build.ts`
- Back wall: cornice band (y 6.4–6.9) + dentil blocks (y 6.1–6.4) across
  the full width; pelmet band (y 3.5–4.1) with gold trim above the red
  curtain; gold medallion disc at (0, 4.7, −5.9) with a red centre.
- Four framed abstract portraits (gold frame, coloured inner panel, sun
  disc, hill triangles — no text anywhere) at x −6.3, −4.5, 4.5, 6.3,
  y 4.6–5.9, plus wall sconces at x ±4.4, y 4.4.
- Side walls: pilasters (z −2, 2, 6, both sides, y 0–6) + sconces;
  framed abstract portraits (y 4.6–5.9) and gold-framed dark-wood
  panels (y 1.6–3.4) on both side walls. The low panels matter: in the
  consequence shot the camera looks slightly down, so the top of frame
  at the far wall only reaches y ~3.8 — high portraits never appear
  there. Pilasters were darkened to cornice gold (#c9a86a) after round 2
  showed them invisible against the cream wall.
- `story.ts`: wide cameras pulled back 0.4 m and look raised slightly
  (S1a z 9.8→10.2, S1b 8.6→9.0, S4a 8.0→8.4, S4b 7.0→7.4, S9a 9.2→9.6)
  so the new decor is in frame.

**Proved by:** `stills-fix/r1_70.jpg`, `r2_70.jpg`, `r3_70.jpg` — dentils
and medallion fill the top band; `r3_1600.jpg` — gold pilaster and a
dark-wood side panel now read in the consequence shot.

## 2. Purple flag shadows — FIXED
`src/videos/bush-shoe/world.ts`
- Flag cloth meshes no longer cast shadows (`castShadow = false`; thin
  gold poles still cast). The big flat purple rectangles behind the
  US/Iraq flags are gone.
- What remains are small, plausible contact shadows: thin pole-shadow
  slivers and small chair shadows on the carpet.

**Proved by:** `stills-fix/r1_300.jpg` (close-up: clean red curtain
behind both flags, no purple at all), `r1_70.jpg`, `r1_1200.jpg`.

## 3. Half-cut characters at frame edges — MOSTLY FIXED
`src/videos/bush-shoe/story.ts`, `cast.ts`
- Press columns narrowed: COLS_X −3.6…3.6 → [−3.0, −2.0, −1.2, 0, 1.2,
  2.0, 3.0] (1.2 kept so al-Zaidi's chair stays at x 1.2).
- Guards moved inward: GUARD_L/R ±2.4 → ±2.0.
- Near-cull raised: press members closer than 2.8 m to the lens are
  left out (was 2.3 m) — empty chair instead of half a person.
- Nearest row (z 5.0) leaves only its centre three members (|x| < 2.0).
- Shot 4 fov widened (S4a 44→48, S4b 42→46) — in round 1 the guards
  were still half-cut at the extreme edges of the throw-2 shot.

**Proved by:** `stills-fix/r2_950.jpg` — both guards fully in frame
with margin; `r1_70.jpg`, `r1_600.jpg`, `r2_600.jpg` — guards fully
in frame in the wides.
**Honest note:** a fresh re-render of f600 with the nearest-row rule
in place was byte-identical to the round-1 still, so those outer
nearest-row members were already out of frame / near-culled — the
rule is kept as a guard. The blurred heads that remain at the bottom
corners of wide shots are foreground depth framing (near members at
z 3.4, recognisable heads, heavily DOF-blurred), not half-cut standing
figures. Maliki is still half-cut at the right edge of the shoe
close-up (`r2_1900.jpg`) — a CU edge crop, not the subject.

## 4. Flat red room — FIXED (restrained)
`src/videos/bush-shoe/build.ts`
- Floor: plank seams + gold carpet border stripes and cross-bands
  (visible in every wide).
- Podium: front panel + gold trim + gold disc; microphone base discs.
- Chairs: lighter-red seat cushions + dark top rails.
- No palette change, no new lights, no measurable render slowdown
  (stills still ~25–30 s each at 0.5 scale).

**Proved by:** `stills-fix/r1_70.jpg` (carpet bands, chair detail),
`r1_300.jpg` and `r2_1900.jpg` (podium panel, gold disc, mic bases).

## Verification
- `npx tsc --noEmit` — exit 0, no errors (after every round).
- Three look-check rounds, 9 key frames each round
  (70, 300, 600, 770, 950, 1200, 1400, 1600, 1900):
  - Round 1 (`stills-fix/r1_*`): fixes verified; found S4 guards
    still half-cut, S7 side wall still blank, nearest-row rule
    unproven.
  - Round 2 (`stills-fix/r2_*`): S4 fov fix verified; S7 side-wall
    portraits invisible (above the frame); nearest-row rule shown
    to have no visible effect (byte-identical f600 re-render).
  - Round 3 (`stills-fix/r3_70.jpg`, `r3_770.jpg`, `r3_950.jpg`,
    `r3_1600.jpg`): side-wall low panels + gold pilasters verified
    in the consequence shot.
- All stills are real renders (33–77 KB each, no blank/black frames).
- Backup of the pre-fix scene: `remotion/backup/bush-shoe_fix1/`.

## Still imperfect (honest)
- The consequence shot (`r3_1600.jpg`) still shows plain cream wall
  across the top ~1/3 — now broken by a gold pilaster and a dark-wood
  panel, but the upper wall is plain because the portraits sit above
  the frame in that shot.
- Maliki half-cut at the right edge of the shoe close-up
  (`r2_1900.jpg`).
- The replay shoe in `r1_1400.jpg` reads small and dark against the
  US flag (same as before these fixes; it was accepted in the earlier
  look-check rounds).
- The full video has NOT been re-rendered here — the user re-renders
  from `github-export/` on their MacBook. The paused 1080p render on
  this VM was left paused.
