# Bush Shoe Throw — 2008 - soundtrack cue sheet

All sound is original: synthesized in numpy/scipy by `sfx_gen.py` / `instruments.py` (copied verbatim from the claude-animated-shorts templates), placed by `sfx_bush.py` / `music_bush.py`, mixed by `mix_bush.py`.
Voice = `voice/voice_48k.wav` (Kokoro hm_omega), gain only (no EQ, no compression, no pitch).

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,220,800 samples = 67.100 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems at mix gain (they sum to the mix before the master limiter) |

## Master loudness (own BS.1770-4 meter)
- Integrated **-15.0 LUFS**, true peak **-1.2 dBTP**, LRA 3.1 LU, max momentary -9.5 LUFS, max short-term -13.1 LUFS
- Stems: voice -14.9 LUFS, music -24.7 LUFS, sfx -41.1 LUFS (master gain +2.88 dB, same gain on every stem)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 1.27 dB, active (>0.1 dB) on 0.95 % of samples, >0.5 dB on 0.23 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -15.0 LUFS
    Threshold: -25.3 LUFS
  Loudness range:
    LRA:         3.1 LU
    Threshold: -35.4 LUFS
    LRA low:   -17.0 LUFS
    LRA high:  -13.9 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | time s | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| hook (P1) | 0.00-4.68 | -13.9 | -27.7 | -45.0 | -27.6 | 13.7 | 13.1 | 7.9 |
| setting (P2) | 5.74-16.28 | -15.0 | -23.9 | -44.2 | -23.9 | 8.9 | 8.8 | 4.1 |
| throw 1 (P3) | 17.18-26.56 | -15.0 | -24.4 | -37.2 | -24.5 | 9.5 | 9.7 | 7.8 |
| throw 2 (P4) | 27.66-36.70 | -15.1 | - | -38.7 | -38.7 | 23.6 | 28.4 | 19.2 |
| deadpan (P5) | 37.74-42.20 | -13.9 | - | -44.9 | -44.9 | 31.0 | 31.2 | 26.9 |
| explanation (P6) | 43.58-50.34 | -14.5 | -25.7 | -44.4 | -25.6 | 11.1 | 11.2 | 7.3 |
| consequence (P7) | 51.58-56.76 | -14.2 | -28.3 | -37.7 | -27.8 | 13.5 | 13.2 | 9.6 |
| callback (P8) | 57.92-66.58 | -14.8 | -24.3 | -44.9 | -24.2 | 9.5 | 9.1 | 5.3 |

## Music map (original march, Bb major, 120 bpm: quarter note = 0.5 s)
Music target per section, LU under the voice (after a -3 dB speech duck keyed from words.json): hook -9.5, explain -10.5, consequence -13.0, callback -9.0. Applied section gains (dB): hook -7.0, silence +0.0, explain -7.9, consequence -5.0, callback -5.5.

Rides (music only, dB): 4.24-4.68 s -2.0, 54.44-55.50 s -2.0 - so the punch words stay on top and the band blooms in the gaps after them.

| time s | frame | music |
|---|---|---|
| 0.00 | 0 | hook: theme A1-A2 light (glock + fife, tuba on 1/3, horns on 2/4, light snare) |
| 4.00 | 120 | full band: theme A3-A8 (cymbal on the downbeat of bar 3) |
| 16.00 | 480 | theme A1-A4 again under the setting (Baghdad, last press conference) |
| 24.20 | 726 | snare roll crescendo into the DEAD STOP at 24.90, just before 'he throws' |
| 24.90 | 747 | DEAD STOP: silence is the joke - no music through throw 1, throw 2, the flag hit, 'Luckily / Unluckily' |
| 42.50 | 1275 | explanation: bouncier march (tuba octave eighths, light snare), theme A1-A4 under the dodgeball analogy |
| 50.50 | 1515 | consequence: quieter, lower - theme A1-A2 on low fife + soft horns, no snare, low Bb pad under 'jailed for nine months' |
| 56.90 | 1707 | callback: march blooms, full band, theme A5-A8 under Bush's joke |
| 61.74 | 1852 | bloom: rising glock run (Bb-D-F-Bb) + soft cymbal under 'size 10 shoe' |
| 66.30 | 1989 | final Bb chord on 'world.' (66.32-66.58): brass stab + timpani + cymbal + high glock, rings out |

## SFX events
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive - 6 dB (standard mix rule) + distance/intensity offsets. BEDS are integrated loudness, not reduced. 'mix LUFS' = the event's max momentary loudness in the final mix (voice stem = -14.9 LUFS integrated). Room reverb is a short indoor IR (RT60 0.7 s), not the bridge's valley reverb.

| # | time s | frame | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.000 | 0.0 | murmur (bed, integrated) | press room: ~14 journalists murmuring under the whole short (ducked under voice) | -30 | -30.0 | -44.9 | +0.00 |
| 2 | 20.100 | 603.0 | chair_scrape | al-Zaidi pushes his chair back as he stands (wood creak + floor scuff) | -12 | -18.0 | -32.9 | -0.30 |
| 3 | 20.550 | 616.5 | footstep | al-Zaidi steps forward 1/2 as he rises | -16 | -22.0 | -36.9 | -0.30 |
| 4 | 20.950 | 628.5 | footstep | al-Zaidi steps forward 2/2 as he rises | -16 | -22.0 | -36.9 | -0.30 |
| 5 | 24.080 | 722.4 | gasp | press corps gasps under 'you dog!': inhale + three soft 'oh's (no shouting, no booing) | -10 | -16.0 | -30.9 | +0.00 |
| 6 | 25.000 | 750.0 | whoosh1 | shoe 1 whoosh: throw -> duck (peak mid-flight) | -8 | -14.0 | -28.9 | +0.20 |
| 7 | 26.300 | 789.0 | thud1 | soft thud as shoe 1 passes Bush and hits the wall behind the podium | -12 | -18.0 | -32.9 | +0.30 |
| 8 | 28.260 | 847.8 | whoosh2 | shoe 2 whoosh: throw -> second shout (peak mid-flight) | -8 | -14.0 | -28.9 | -0.20 |
| 9 | 34.900 | 1047.0 | flag_hit | shoe 2 hits the American flag: cloth flap + pole wobble thump + pole creak | -10 | -16.0 | -30.9 | -0.50 |
| 10 | 52.300 | 1569.0 | guard_step | guard footstep 1/4, closing in on al-Zaidi | -14 | -20.0 | -34.9 | -0.25 |
| 11 | 52.720 | 1581.6 | guard_step | guard footstep 2/4, closing in on al-Zaidi | -14 | -20.0 | -34.9 | +0.25 |
| 12 | 53.150 | 1594.5 | guard_step | guard footstep 3/4, closing in on al-Zaidi | -14 | -20.0 | -34.9 | -0.25 |
| 13 | 53.580 | 1607.4 | guard_step | guard footstep 4/4, closing in on al-Zaidi | -14 | -20.0 | -34.9 | +0.25 |
| 14 | 53.900 | 1617.0 | door | door closes softly as al-Zaidi is led out ('taken away' ends 53.82) | -14 | -20.0 | -34.9 | +0.40 |
