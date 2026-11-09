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
  30 fps, 2013 frames (67.1 s).
- `voice/words.json` — word timings for the narration.
- `audio/mix.wav` — finished 67.1 s mix (voice + march music + SFX),
  48 kHz stereo. **Download this file separately if it is missing from
  the repo — GitHub's file API used for this upload cannot carry binary
  audio, so it may be supplied as a separate download.**
- `SCRIPT.md` — approved script + verified facts.
- `NOTES.md`, `ADAPTATION.md`, `SHOT_PLAN.md`, `AUDIO_EVENTS.md`,
  `audio/MIX_NOTES.md`, `audio/cues.md` — build notes.

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
for all 2013 frames. On a machine with a real GPU it should be far
faster. Stills can be checked first with:

```bash
node scripts/stills.mjs stills/frame 100,1000 0.5
```

Set `TEMP` / `TMPDIR` to a folder with plenty of space before
rendering — Remotion copies large bundles into temp and does not
clean them up.
