# Bush Shoe Throw — 2008: mix notes (ElevenLabs rebuild)

Rebuilt 2026-11-09 from a copy of `../audio/` — the original Kokoro mix in
`../audio/` was NOT touched (its mix.wav is still the 12:50 file, 67.100 s).
Voice is now ElevenLabs "Brian" (nPczCjzI2devNBz1zQrb), model
eleven_multilingual_v2, 1043 chars. Word timings from
`../voice-elevenlabs/words.json` (188 words, Whisper-aligned).

## What changed vs the original mix

- Voice: `../voice-elevenlabs/voice_48k.wav` — mp3 converted to 48 kHz mono
  WAV with ffmpeg (no speed/pitch change), 3,254,509 samples = 67.802271 s.
  Raw voice: -20.49 LUFS (as stereo), true peak -3.62 dBTP.
- DUR 67.100 -> 67.802271 s (3,254,509 samples). All beats re-computed from
  the new words.json (see table below). MUSIC_CUT stays 24.90 ("he" still
  starts 24.90); MUSIC_RESUME moved 42.50 -> 42.90 because the old resume
  crossed the new "flag." (42.40-42.64). New resume sits in the gap
  (flag. ends 42.64, "A" starts 43.30). Explanation section moved with it
  (42.90-50.90), consequence 50.90-56.90, callback 56.90-67.802271.
- Music: final chord moved 66.30 -> 67.14 ("world." starts 67.14), roll
  65.90-66.28 -> 66.74-67.12, bloom under "size 10 shoe" 61.74 -> 61.80,
  end fade 66.95 -> 67.65.
- SFX: chair scrape 20.10 -> 19.82, footsteps 20.55/20.95 -> 20.27/20.67,
  gasp 24.08 -> 23.86, thud1 26.30 -> 26.82, whoosh2 28.26 -> 27.76,
  flag hit 34.90 -> 35.26, guard steps 52.30/52.72/53.15/53.58 ->
  52.20/52.62/53.05/53.48, door 53.90 -> 53.66. Whoosh1 stays 25.00
  (throws starts 24.98, delta 0.02 s).
- Mix script: DIPS "Twice." (4.30-4.58), "jailed for nine months"
  (54.46-55.44); REPORT section boundaries re-computed from the new
  paragraph ends (see cues.md).
- Run with system `python3` (numpy 1.26.4 / scipy 1.11.4) — the tools venv
  python has no scipy.

## Beat times: old (Kokoro) vs new (ElevenLabs)

| beat | old s | new s | delta |
|---|---|---|---|
| Twice. | 4.24-4.68 | 4.30-4.58 | +0.06 |
| December 14, 2008. | 5.74-7.72 | 5.34-6.98 | -0.40 |
| stands | 20.24 | 19.96 | -0.28 |
| dog! | 24.10 | 23.88 | -0.22 |
| throws (1) | 25.00 | 24.98 | -0.02 |
| ducks (1) | 26.04 | 26.56 | +0.52 |
| throws (2) | 28.26 | 27.76 | -0.50 |
| ducks again | 31.78 | 31.56 | -0.22 |
| hits the flag | 34.88 | 35.24 | +0.36 |
| Luckily, | 37.74 | 37.50 | -0.24 |
| Unluckily | 40.12 | 40.10 | -0.02 |
| dodgeball | 46.56 | 46.62 | +0.06 |
| grabbed | 52.28 | 52.18 | -0.10 |
| jailed | 54.44 | 54.46 | +0.02 |
| size 10 shoe | 61.74 | 61.80 | +0.06 |
| world. | 66.32-66.58 | 67.14-67.38 | +0.82 |

Most beats are within ~0.3 s of the old ones; the tail drifts later
(world. +0.82 s) because the new narration is 0.70 s longer overall.

## Score (original, Bb major, 120 bpm)

- Hook + setting (0.00-24.90): steady march, theme bars 1-8 then 1-4; snare roll into the cut.
- DEAD STOP 24.90-42.90: no music through both throws, the flag hit, "Luckily / Unluckily".
  Verified: music stem is digitally silent (-50 dB) 25.32-42.90 (17.58 s).
- Explanation (42.90-50.90): bouncier variation — tuba octave eighths, light snare.
- Consequence (50.90-56.90): quieter, lower — low fife + soft horns, no snare, low Bb pad.
- Callback (56.90-67.802): full band blooms; rising glock run + soft cymbal under "size 10 shoe"
  (61.80); final Bb chord (brass stab + timpani + cymbal + high glock) on "world." (67.14).
- Ducking: -3 dB under speech keyed to words.json spans. Section targets (LU under voice, after ducking):
  hook -9.5, explain -10.5, consequence -13.0, callback -9.0. Two rides: "Twice." (4.30-4.58)
  and "jailed for nine months" (54.46-55.44), -2 dB.

## SFX (all synthesized; 14 cues — see cues.md)

Murmur bed (14 journalists + room tone, whole short, -30 LU); chair scrape + 2 footsteps as
al-Zaidi stands (19.82-20.67); crowd gasp under "you dog!" (23.86); shoe whooshes (25.00, 27.76);
soft thud as shoe 1 passes (26.82); flag flap + pole wobble thump (35.26); 4 guard footsteps +
soft door close (52.20-53.66). Events placed at naive -6 dB (standard); beds not reduced.
Spot-checked in stem_sfx.wav: every event window sits ~10-13 dB above the murmur floor
(gasp +12.6, whoosh1 +9.5, thud1 +13.0, whoosh2 +9.3, flag +11.2, guard +9.9, door +11.5).

## Whisper flags — human listen needed (not verified by ear)

Whisper heard these differently from the script. Most are likely Whisper
mishearing unfamiliar names (same pattern as the Kokoro check), but one
could be a real TTS difference:
- "facts" -> Whisper heard "fact" (segment 59.48-62.8: "If you want the
  fact, he said, it's a size 10 shoe."). The script says "facts". If
  ElevenLabs really said "fact", that changes the quote — listen and,
  if wrong, re-render that line.
- Names: "Nouri al-Maliki" heard as "Nouriel Maliki"; "Muntadhar
  al-Zaidi" heard as "Muntadar Al-Zadeh" / "Al-Zadeh" (every occurrence).
  Likely Whisper errors on unfamiliar names; a human listen is worthwhile.
- "ducks" heard correctly BOTH times ("Bush ducks.", "Bush ducks
  again.") — the Kokoro flag is resolved for this voice.

## Measured (own BS.1770-4 meter + ffmpeg ebur128 cross-check, both agree)

- mix.wav: **-15.00 LUFS integrated** (target -15), **true peak -1.20 dBTP** (<= -1), LRA 2.3 LU,
  max momentary -10.2 LUFS, max short-term -13.4 LUFS. Master gain +5.62 dB; limiter ceiling -1.2 dBTP,
  max gain reduction 3.63 dB, active (>0.1 dB) on 7.87 % of samples, >0.5 dB on 2.65 %.
- ffmpeg ebur128: I -15.0 LUFS, LRA 2.3 LU, peak -1.2 dBFS.
- Duration: **67.802 s exactly** (3,254,509 samples), 48 kHz, stereo, 24-bit — mix + all 3 stems
  (ffprobe-verified). Voice stem -14.87 LUFS, music -24.71 LUFS, sfx -41.06 LUFS at mix gain.
- Voice on top: speech median margin (voice - bed, 400 ms windows on spoken words) 9.4-30.5 LU
  per section, p10 5.0-27.4 LU — voice stays clearly on top everywhere, widest in the silent
  deadpan section (30.5 LU). Lowest p10 is callback (5.0 LU), still clearly positive.
- Mix silencedetect (-50 dB, min 1.0 s): no silence >1 s — no unintended gaps.
- Music stem silencedetect: one 17.58 s silence 25.32-42.90 (the dead stop, as designed).

## Limiter note — heavier than the original

The original mix needed max gain reduction 1.27 dB, active on 0.95 % of
samples. This one needs 3.63 dB max, active on 7.87 %. Cause: the
ElevenLabs voice stem peaks at +2.0 dBFS at mix gain (peaky, more
dynamic than Kokoro), so the limiter works harder after the +5.62 dB
master gain. Final true peak still meets spec (-1.20 dBTP), and no
audible pumping was measured — but if the voice sounds squeezed on a
listen, the fix is to lower the voice stem a couple of dB before the
master gain rather than pushing the limiter harder.

## Picture timing warning

This mix is 67.802 s = 2034 frames @ 30 fps. The picture (remotion/
story.ts) was timed to the Kokoro voice: TOTAL 2013 frames = 67.10 s.
If this mix is used for the video, story.ts must be re-timed to 2034
frames and the shot/duck/flag beats moved to the new times in
timeline_bush.py — otherwise the last ~0.7 s of narration (and the
final chord on "world.") will run past the end of the picture.

## Render cost

Full render 193 s (voice load instant, music build ~33 s, SFX murmur bed
~140 s, master + measure ~15 s). Stems cached in `_cache/`
(music_raw.npy, sfx.npy) so a re-mix after a level tweak is fast.
