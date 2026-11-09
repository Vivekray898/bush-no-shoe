# Bush Shoe Throw — 2008

A ~60-second vertical cartoon 3D short (three.js inside Remotion) about
Iraqi journalist Muntadhar al-Zaidi throwing both shoes at President
George W. Bush in Baghdad on 14 December 2008. Bush ducked twice; the
second shoe hit the US flag behind him.

Style: 2D bean-head cartoon cards with ink outlines in a colourful 3D
world, gliding cameras, English narration, no captions or labels in the
video. Based on the `claude-animated-shorts` skill (bridge template).

## What's in here

- `src/` — Remotion project. Composition `BushShoeShort`, 1080x1920,
  30 fps, 2034 frames (67.802 s).
- `voice/words.json` — word timings for the narration.
- `audio/mix.wav` — finished 67.802 s mix (ElevenLabs Brian voice +
  march music + SFX), 48 kHz stereo. **Download this file separately
  if it is missing from the repo — GitHub's file API used for this
  upload cannot carry binary audio, so it may be supplied as a separate
  download.**
- `SCRIPT.md` — approved script + verified facts.
- `NOTES.md`, `ADAPTATION.md`, `SHOT_PLAN.md`, `AUDIO_EVENTS.md`,
  `audio/MIX_NOTES.md`, `audio/cues.md` — build notes.
- `FIXES.md` — scene fixes applied 9 Nov 2026 (see below).
- `RETIME.md` — picture re-timed to the ElevenLabs voice, 9 Nov 2026
  (see below).

## Scene fixes — 9 Nov 2026

The press-room scene was fixed for four visual gaps found in the
first rendered video. The fixes themselves changed no timing: script,
TOTAL = 2013 frames and every shot beat were unchanged by them, so the
Kokoro voice and `audio/mix.wav` stayed in sync at the time. The
picture has since been re-timed to the new ElevenLabs voice — see
"Re-time" below. Full detail in `FIXES.md`.

1. **Empty cream wall** — back wall now has a cornice + dentil blocks,
   a pelmet above the red curtain, a gold medallion, four framed
   abstract portraits (no text) and sconces; side walls have pilasters,
   portraits and gold-framed dark-wood panels. Wide cameras pulled
   back 0.4 m so the decor is in frame.
2. **Purple flag shadows** — flag cloth no longer casts shadows; the
   big purple blocks behind the flags are gone (poles still cast).
3. **Half-cut characters** — press columns narrowed, guards moved
   inward (±2.4 → ±2.0), near-cull raised to 2.8 m, nearest row keeps
   only its centre three members, shot 4 fov widened (44→48 / 42→46).
4. **Flat red room** — carpet pattern/border stripes, podium front
   panel + gold trim + disc, mic base discs, chair cushions and rails.

Verified with three look-check rounds of stills (frames 70, 300, 600,
770, 950, 1200, 1400, 1600, 1900) and `npx tsc --noEmit` (clean).
Known remaining imperfections (see `FIXES.md`): the consequence
shot still has plain cream wall across the top ~1/3, Maliki is
half-cut at the right edge of the shoe close-up, and the replay shoe
reads small/dark against the US flag.

## Re-time — 9 Nov 2026

The narration was re-recorded with ElevenLabs voice "Brian" (free
plan). The new voice is 67.802 s, so the picture was re-timed from
TOTAL = 2013 frames (Kokoro, 67.10 s) to **TOTAL = 2034 frames** —
every shot cut, camera key, duck, shoe flight and flag-hit beat moved
to the new word timings, and `audio/mix.wav` was rebuilt around the
new voice (−15.00 LUFS, −1.20 dBTP). Picture and audio are in sync
again. Full old → new table in `RETIME.md`. The old Kokoro mix and
voice are kept as fallback in the main project folder (`audio/` and
`voice/`) but are NOT in this export — this export is the ElevenLabs
version only.

## Render on your machine

```bash
npm install
npx remotion browser ensure
npx tsc --noEmit
```

1080p (fastest, what was rendering on the build machine):

```bash
npx remotion render src/index.ts BushShoeShort out/video_1080p.mp4 --codec h264 --crf 16 --scale 1
```

2K (1440x2560) — use the exact 4/3 scale, NOT 1.3333:

```bash
npx remotion render src/index.ts BushShoeShort out/video_2k.mp4 --codec h264 --crf 16 --scale 1.3333333333333333
```

`--scale 1.3333` fails: 1920 × 1.3333 = 2559.936 px, not an integer,
and Remotion rejects it.

Then add the sound (Remotion writes a silent audio track):

```bash
ffmpeg -i out/video_1080p.mp4 -i audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -shortest out/bush-shoe-final.mp4
```

## Speed warning

On a machine with no GPU (software SwiftShader rendering) this is
VERY slow — about 12 seconds per frame at 1080p, roughly 6–7 hours
for all 2034 frames. On a machine with a real GPU it should be far
faster. Stills can be checked first with:

```bash
node scripts/stills.mjs stills/frame 100,1000 0.5
```

Set `TEMP` / `TMPDIR` to a folder with plenty of space before
rendering — Remotion copies large bundles into temp and does not
clean them up.
