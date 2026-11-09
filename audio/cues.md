# Bush Shoe Throw — 2008 - soundtrack cue sheet

All sound is original: synthesized in numpy/scipy by `sfx_gen.py` / `instruments.py` (copied verbatim from the claude-animated-shorts templates), placed by `sfx_bush.py` / `music_bush.py`, mixed by `mix_bush.py`.
Voice = `voice-elevenlabs/voice_48k.wav` (ElevenLabs Brian, eleven_multilingual_v2), gain only (no EQ, no compression, no pitch).

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,254,509 samples = 67.802 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems at mix gain (they sum to the mix before the master limiter) |

## Master loudness (own BS.1770-4 meter)
- Integrated **-15.0 LUFS**, true peak **-1.2 dBTP**, LRA 2.3 LU, max momentary -10.2 LUFS, max short-term -13.4 LUFS
- Stems: voice -14.9 LUFS, music -24.7 LUFS, sfx -41.1 LUFS (master gain +5.62 dB, same gain on every stem)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 3.63 dB, active (>0.1 dB) on 7.87 % of samples, >0.5 dB on 2.65 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -15.0 LUFS
    Threshold: -25.2 LUFS
  Loudness range:
    LRA:         2.3 LU
    Threshold: -35.3 LUFS
    LRA low:   -16.3 LUFS
    LRA high:  -14.0 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | time s | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| hook (P1) | 0.00-4.58 | -15.3 | -27.7 | -44.6 | -27.6 | 12.3 | 12.6 | 9.4 |
| setting (P2) | 5.34-16.32 | -15.1 | -24.1 | -44.3 | -24.0 | 8.9 | 9.4 | 6.6 |
| throw 1 (P3) | 17.00-26.88 | -14.5 | -24.5 | -37.8 | -24.6 | 10.1 | 10.6 | 8.2 |
| throw 2 (P4) | 27.38-36.96 | -14.5 | - | -39.0 | -39.0 | 24.4 | 29.3 | 19.9 |
| deadpan (P5) | 37.50-42.64 | -15.0 | - | -45.0 | -45.0 | 30.1 | 30.5 | 27.4 |
| explanation (P6) | 43.30-50.72 | -14.8 | -25.5 | -44.9 | -25.4 | 10.7 | 10.4 | 8.1 |
| consequence (P7) | 51.54-56.94 | -14.6 | -28.0 | -37.8 | -27.5 | 12.9 | 13.8 | 10.0 |
| callback (P8) | 56.94-67.38 | -14.4 | -23.7 | -45.0 | -23.7 | 9.3 | 9.5 | 5.0 |

## Music map (original march, Bb major, 120 bpm: quarter note = 0.5 s)
Music target per section, LU under the voice (after a -3 dB speech duck keyed from words.json): hook -9.5, explain -10.5, consequence -13.0, callback -9.0. Applied section gains (dB): hook -9.9, silence +0.0, explain -10.5, consequence -8.0, callback -7.7.

Rides (music only, dB): 4.30-4.58 s -2.0, 54.46-55.44 s -2.0 - so the punch words stay on top and the band blooms in the gaps after them.

| time s | frame | music |
|---|---|---|
| 0.00 | 0 | hook: theme A1-A2 light (glock + fife, tuba on 1/3, horns on 2/4, light snare) |
| 4.00 | 120 | full band: theme A3-A8 (cymbal on the downbeat of bar 3) |
| 16.00 | 480 | theme A1-A4 again under the setting (Baghdad, last press conference) |
| 24.20 | 726 | snare roll crescendo into the DEAD STOP at 24.90, just before 'he throws' |
| 24.90 | 747 | DEAD STOP: silence is the joke - no music through throw 1, throw 2, the flag hit, 'Luckily / Unluckily' |
| 42.90 | 1287 | explanation: bouncier march (tuba octave eighths, light snare), theme A1-A4 under the dodgeball analogy |
| 50.50 | 1515 | consequence: quieter, lower - theme A1-A2 on low fife + soft horns, no snare, low Bb pad under 'jailed for nine months' |
| 56.90 | 1707 | callback: march blooms, full band, theme A5-A8 under Bush's joke |
| 61.80 | 1854 | bloom: rising glock run (Bb-D-F-Bb) + soft cymbal under 'size 10 shoe' |
| 67.14 | 2014 | final Bb chord on 'world.' (67.14-67.38): brass stab + timpani + cymbal + high glock, rings out |

## SFX events
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive - 6 dB (standard mix rule) + distance/intensity offsets. BEDS are integrated loudness, not reduced. 'mix LUFS' = the event's max momentary loudness in the final mix (voice stem = -14.9 LUFS integrated). Room reverb is a short indoor IR (RT60 0.7 s), not the bridge's valley reverb.

| # | time s | frame | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.000 | 0.0 | murmur (bed, integrated) | press room: ~14 journalists murmuring under the whole short (ducked under voice) | -30 | -30.0 | -44.9 | +0.00 |
| 2 | 19.820 | 594.6 | chair_scrape | al-Zaidi pushes his chair back as he stands (wood creak + floor scuff) | -12 | -18.0 | -32.9 | -0.30 |
| 3 | 20.270 | 608.1 | footstep | al-Zaidi steps forward 1/2 as he rises | -16 | -22.0 | -36.9 | -0.30 |
| 4 | 20.670 | 620.1 | footstep | al-Zaidi steps forward 2/2 as he rises | -16 | -22.0 | -36.9 | -0.30 |
| 5 | 23.860 | 715.8 | gasp | press corps gasps under 'you dog!': inhale + three soft 'oh's (no shouting, no booing) | -10 | -16.0 | -30.9 | +0.00 |
| 6 | 25.000 | 750.0 | whoosh1 | shoe 1 whoosh: throw -> duck (peak mid-flight) | -8 | -14.0 | -28.9 | +0.20 |
| 7 | 26.820 | 804.6 | thud1 | soft thud as shoe 1 passes Bush and hits the wall behind the podium | -12 | -18.0 | -32.9 | +0.30 |
| 8 | 27.760 | 832.8 | whoosh2 | shoe 2 whoosh: throw -> second shout (peak mid-flight) | -8 | -14.0 | -28.9 | -0.20 |
| 9 | 35.260 | 1057.8 | flag_hit | shoe 2 hits the American flag: cloth flap + pole wobble thump + pole creak | -10 | -16.0 | -30.9 | -0.50 |
| 10 | 52.200 | 1566.0 | guard_step | guard footstep 1/4, closing in on al-Zaidi | -14 | -20.0 | -34.9 | -0.25 |
| 11 | 52.620 | 1578.6 | guard_step | guard footstep 2/4, closing in on al-Zaidi | -14 | -20.0 | -34.9 | +0.25 |
| 12 | 53.050 | 1591.5 | guard_step | guard footstep 3/4, closing in on al-Zaidi | -14 | -20.0 | -34.9 | -0.25 |
| 13 | 53.480 | 1604.4 | guard_step | guard footstep 4/4, closing in on al-Zaidi | -14 | -20.0 | -34.9 | +0.25 |
| 14 | 53.660 | 1609.8 | door | door closes softly as al-Zaidi is led out ('taken away' ends 53.58) | -14 | -20.0 | -34.9 | +0.40 |
