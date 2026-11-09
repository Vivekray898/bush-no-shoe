# Bush Shoe Throw — 2008: mix notes

## What was reused / rewritten
- Copied verbatim from `~/workspace/custom-skills/claude-animated-shorts/templates/audio/`:
  `dsp.py` (filters, envelopes, BS.1770-4 loudness, true peak, WAV I/O), `instruments.py`
  (brass, glock, fife, snare, cymbal, timpani, pad), `sfx_gen.py` (whoosh, creak, stroll_step,
  oof/whoa/babble formant voices, flag_flutter, clink, modal helpers).
- NOT reused: the bridge's `timeline.py` / `mix.py` section map (67.5 s, swing, hammer hits,
  tourists) and its `sfx.py` / `music.py` event tables. All bush files are new:
  `timeline_bush.py` (beats from voice/words.json), `music_bush.py` (own 8-bar Bb march theme,
  120 bpm), `sfx_bush.py` (own 14-cue list), `mix_bush.py` (ducking, section automation, limiter).
- Room reverb is a short indoor IR (RT60 0.7 s), not the bridge's valley reverb (1.1 s).

## Score (original, Bb major, 120 bpm)
- Hook + setting (0.00–24.90): steady march, theme bars 1–8 then 1–4; snare roll into the cut.
- DEAD STOP 24.90–42.50: no music through both throws, the flag hit, "Luckily / Unluckily".
  Verified: music stem is digitally silent (-240 dBFS) 28.3–35.8 s; silencedetect finds one
  17.20 s silence 25.30–42.50 (the 0.4 s before 25.30 is the roll's hall tail decaying below -50 dB).
- Explanation (42.50–50.50): bouncier variation — tuba octave eighths, light snare.
- Consequence (50.50–56.90): quieter, lower — low fife + soft horns, no snare, low Bb pad.
- Callback (56.90–67.10): full band blooms; rising glock run + soft cymbal under "size 10 shoe"
  (61.74); final Bb chord (brass stab + timpani + cymbal + high glock) on "world." (66.30).
- Ducking: -3 dB under speech keyed to words.json spans (not the audio envelope).
  Section targets (LU under voice, after ducking): hook -9.5, explain -10.5, consequence -13.0,
  callback -9.0. Two rides: "Twice." (4.24–4.68) and "jailed for nine months" (54.44–55.50), -2 dB.

## SFX (all synthesized; 14 cues — see cues.md)
Murmur bed (14 journalists + room tone, whole short, -30 LU); chair scrape + 2 footsteps as
al-Zaidi stands (20.10–20.95); crowd gasp under "you dog!" (24.08); shoe whooshes (25.00, 28.26);
soft thud as shoe 1 passes (26.30); flag flap + pole wobble thump (34.90); 4 guard footsteps +
soft door close (52.30–53.90). Events placed at naive -6 dB (standard); beds not reduced.
Spot-checked in stem_sfx.wav: every event window sits ~10 dB above the murmur floor (-46.7 dBFS).

## Events dropped
- None from AUDIO_EVENTS.md. Notes: the draft's "~11.6–13 s" stand, "~17–18 s" thud,
  "~24–26 s" flag and "~39–41 s" guard estimates were pre-words.json guesses; all events were
  placed at the real words.json times instead (stand 20.10, thud 26.30, flag 34.90, guards 52.30).
  No cash-register / shoe-tap joke cue (explicitly not wanted — musical bloom only).

## Measured (own BS.1770-4 meter + ffmpeg ebur128 cross-check, both agree)
- mix.wav: **-15.02 LUFS integrated** (target -15), **true peak -1.20 dBTP** (<= -1), LRA 3.1 LU,
  max momentary -9.5 LUFS, max short-term -13.1 LUFS. Master gain +2.88 dB; limiter ceiling -1.2 dBTP,
  max gain reduction 1.27 dB, active (>0.1 dB) on 0.95% of samples.
- ffmpeg ebur128: I -15.0 LUFS, LRA 3.1 LU, peak -1.2 dBFS.
- Duration: **67.100 s exactly** (3,220,800 samples), 48 kHz, stereo, 24-bit — mix + all 3 stems
  (ffprobe-verified). Voice stem -14.85 LUFS, music -24.71 LUFS, sfx -41.06 LUFS at mix gain.
- Voice on top: speech median margin (voice − bed, 400 ms windows on spoken words) 7.3–31.2 LU
  per section, p10 4.1–26.9 LU — voice stays clearly on top everywhere, widest in the silent
  deadpan section (31.2 LU).
- Mix silencedetect (-50 dB, min 1.0 s): no silence >1 s — no unintended gaps.

## Render cost
Full render 377 s (music build ~40 s, SFX murmur bed ~5 min — 14 formant voices over 67 s).
Stems cached in `_cache/` (music_raw.npy, sfx.npy) so a re-mix after a level tweak is fast.
