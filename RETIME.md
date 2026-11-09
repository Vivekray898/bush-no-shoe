# Bush Shoe Throw — picture re-time to the ElevenLabs voice (9 Nov 2026)

## Why

The narration was re-recorded with ElevenLabs voice "Brian"
(`voice-elevenlabs/voice.mp3`, 1043 chars, `eleven_multilingual_v2`).
The new voice is **67.802 s = 2034 frames @ 30 fps**; the old Kokoro
voice was 67.10 s = 2013 frames. Key beats moved by up to ~0.5 s, so the
picture (TOTAL, shot cuts, camera keys, duck/shoe/flag timing) had to
move with it, or the last ~0.7 s of narration and the final chord would
have run past the end of the picture. The old Kokoro mix and voice are
kept as fallback in `audio/` and `voice/`; the new mix is in `audio-el/`.

Source of truth: `voice-elevenlabs/words.json` (188 words, duration
67.802 s) and `audio-el/timeline_bush.py` (BEATS). Every visual reaction
still lands 0–3 frames BEFORE its word.

## Rule used

- Shot boundaries = midpoint between the previous paragraph's last-word
  end and the next paragraph's first-word start (rounded), exactly the
  rule the original timing followed.
- **One exception:** P7 ends and P8 starts on the same frame
  ("destroyed." ends 56.94 s, "Bush" starts 56.94 s — zero gap), so
  shot 8 cuts at f1708, on the word boundary itself.
- Camera keys, DOF entries, kicks and cast windows were re-anchored to
  the same words they were anchored to before (e.g. S1b = "President"
  +10 f, S2b = P2 "Bush" −10 f, S3b = "dog!" −23 f, S4b = duck2 −3 f,
  S5c = P5 "it" −6 f, S9 = shoe CU +53 f). No geometry, lighting, colour
  or scene-fix content changed — only timing numbers moved.

## Old → new

| item | Kokoro (old) | ElevenLabs (new) |
|---|---|---|
| TOTAL | 2013 f (67.10 s) | **2034 f (67.802 s)** |
| FLASH_AT ("Twice." ends) | 140 | **137** |
| STAND_F ("stands") | 607 | **599** |
| DUCK1_F ("ducks" 1) | 781 | **797** |
| DUCK2_F ("ducks" 2) | 953 | **947** |
| FLAG_HIT_F ("flag") | 1070 | **1079** |
| REPLAY_DUCK_F ("drop") | 1441 | **1442** |

### Shots (a–b, frames)

| shot | old | new |
|---|---|---|
| 1 hook wide | 0–156 | **0–149** |
| 2 setting | 156–501 | **149–500** |
| 3 throw 1 | 501–814 | **500–814** |
| 4 throw 2 | 814–1117 | **814–1117** |
| 5 deadpan | 1117–1287 | **1117–1289** |
| 6 explanation | 1287–1529 | **1289–1534** |
| 7 consequence | 1529–1721 | **1534–1708** |
| 8 callback | 1721–1905 | **1708–1907** |
| 9 final wide | 1905–2013 | **1907–2034** |

### Key beats (word start, frames)

| beat | old | new |
|---|---|---|
| "Twice." | 127 | **129** |
| "stands" | 607 | **599** |
| throw 1 "throws" | 750 | **749** |
| duck 1 "ducks" | 781 | **797** |
| throw 2 "throws" | 848 | **833** |
| duck 2 "ducks" | 953 | **947** |
| flag hit ("flag") | 1070 | **1079** |
| "Luckily," | 1132 | **1125** |
| "Unluckily" | 1204 | **1203** |
| "dodgeball" | 1397 | **1399** |
| "grabbed" | 1568 | **1565** |
| "jailed" | 1633 | **1634** |
| "size 10 shoe" | 1852 | **1854** |
| "world." | 1997 | **2014** |

### Shoe flights and cast windows (story.ts / cast.ts)

- shoe 1: f750–782 (30 f) → **f749–798 (48 f)** — longer because Brian
  pauses longer between the throw and the duck.
- shoe 2: f855–1072 → **f840–1081** (leg 1 to f949, leg 2 to f1081).
- replay shoe: f1380–1450 → **f1382–1451**.
- al-Zaidi stand-up starts f596 (was f604); seated while f < 599.
- Shouting window f685–735 → **f677–728**; throwing windows
  f745–762 / f843–860 → **f744–761 / f828–845**.
- Press look-at-al-Zaidi from f605 → **f597**; gasp windows
  f748–800 / f846–905 → **f747–816 / f831–890**; grin from f1721 → **f1708**.
- Guards close in f1550–1620 → **f1547–1617**, hold to f1651, escort
  from f1651 (was f1650), gone by f1709 (was f1704).
- Shoe 1 rests on the floor from f790 → **f806**; flag-hit burst
  f1070 → **f1079**; Bush "relief" expression from f>1000 → **f>994**;
  al-Zaidi "nervous" from f1100 → **f1109**.
- KICKS (seconds): [25.0, 26.04, 28.26, 31.78, 35.66] →
  **[24.98, 26.56, 27.76, 31.56, 35.98]**.

## What else changed

- `notes/SHOT_PLAN.md` and `remotion/ADAPTATION.md` timing sections
  updated to the new numbers (same edits applied to the copies in
  `github-export/`).
- `FIXES.md` still describes the scene fixes in Kokoro-timing frames
  (stands f607, etc.) — it is a historical record of that step; the
  code has moved on, the fixes themselves are unchanged.
- `notes/AUDIO_EVENTS.md` is a pre-build draft with rough estimates
  (~11–13 s etc.) and was left untouched — it was never authoritative.

## Verification

- `npx tsc --noEmit` — **exit 0**.
- Grep of `story.ts` / `cast.ts` for old frame constants (2013, 781,
  953, 1070, 607, 1852, 1905, 1721, 501, 700, 950, 1204, 1236, 1640,
  156, 320, 748, 790, 605, 1650, 1704, 1550, 1620, …) — only hits are
  intentional: the history note in the `story.ts` header, the "r1 f950
  still" reference in a FIX2 comment, and design-unit dimensions
  (600×1000) in `cast.ts`.
- Stills rendered with the ReAdvance sandbox entry
  (`BUSH_SHOE_ENTRY=src/sandboxes/stills/index.tsx`, scale 0.5) into
  `remotion/stills-retime/` — all 11 real renders (39–76 KB, no blank
  frames; the plain entry still renders blank pale-blue on this VM, see
  NOTES.md). Checked by eye:
  - `rt_599.jpg` — al-Zaidi mid-stand, press turning to him.
  - `rt_749.jpg` — throw 1: shoe in the air by Bush's head, press gasping.
  - `rt_797.jpg` — duck 1: Bush down behind the podium, shoe flying past.
  - `rt_833.jpg` — throw 2 wide: al-Zaidi standing, guards whole at edges.
  - `rt_947.jpg` — duck 2: Bush down again, shoe mid-air over the podium.
  - `rt_1079.jpg` — flag hit: shoe touching the US flag, Bush back up.
  - `rt_1125.jpg` — "Luckily,": Bush close-up, grinning.
  - `rt_1399.jpg` — dodgeball replay: shoe sailing past ducking Bush.
  - `rt_1634.jpg` — "jailed": al-Zaidi nervous, guards closing in.
  - `rt_1854.jpg` — "size 10": shoe close-up on the floor, Bush grinning.
  - `rt_2033.jpg` — final wide: whole room, shoe resting on the floor.
- Scene fixes from FIXES.md still visible in the stills (cornice /
  medallion / dentils, no purple flag shadows, whole guards). Remaining
  known imperfections (unchanged from FIXES.md): the consequence shot's
  top is still mostly plain cream (now broken by a pilaster/panel),
  Maliki is half-cut at the right edge of the shoe close-up, and the
  replay shoe reads small/dark against the US flag.

## Obsolete

- The paused VM 1080p render (418/2013 frames) renders the OLD timing —
  do not resume it; a fresh render must use TOTAL 2034.
- The user's Mac render (67.1 s, 2013 f) is the old Kokoro version.
