# Bush Shoe Throw — 2008: shot plan (DRAFT, timings to be refined from voice/words.json)

Source: ~/workspace/bush-shoe-short/SCRIPT.md (approved, do not change facts/wording).
Style: claude-animated-shorts — 1080x1920, 30 fps, day light indoors (warm palace room, NOT golden hour), 2D bean-head cards, ink outlines, gliding cameras, no captions/labels, English only.
TOTAL placeholder: 2025 f (67.5 s) in scaffold — replace with real duration from voice.wav once known (expected ~1800 f / ~60 s).

REAL timings from voice-elevenlabs/words.json (67.802 s, 188 words, TOTAL = 2034 f @ 30 fps). Re-timed 9 Nov 2026 from the Kokoro voice (67.10 s / 2013 f); see RETIME.md. Every visual reaction 0-3 frames BEFORE its word:
- P1 HOOK f0-137 (0.00-4.58 s): "A journalist threw a shoe at the President of the United States. And he missed. Twice." ("Twice." 4.30-4.58 s)
- P2 SETTING f160-490 (5.34-16.32 s): "December 14, 2008. Baghdad, Iraq. President George W. Bush is at his last press conference there, standing next to Iraq's Prime Minister, Nouri al-Maliki."
- P3 THROW 1 f510-806 (17.00-26.88 s): al-Zaidi stands, shouts "This is a farewell kiss from the Iraqi people, you dog!", throws shoe 1 ("throws his shoe" 24.98-25.68 s), "Bush ducks" 26.16-26.88 s.
- P4 THROW 2 f821-1109 (27.38-36.96 s): "Al-Zaidi throws his other shoe" 27.76-28.60 s; "Bush ducks again" 31.26-32.22 s; second shoe hits the American flag behind him (by ~36.96 s).
- P5 DEADPAN f1125-1279 (37.50-42.64 s): "Luckily," 37.50-37.98 s; "Unluckily" 40.10-40.66 s; "it only hit a flag."
- P6 EXPLANATION f1299-1522 (43.30-50.72 s): dodgeball analogy ("dodgeball" 46.62-47.18 s).
- P7 CONSEQUENCE f1546-1708 (51.54-56.94 s): grabbed, "jailed for nine months" 54.46-55.44 s, shoes destroyed.
- P8 CALLBACK f1708-2021 (56.94-67.38 s): "size 10 shoe" 61.80-62.80 s; shoemaker orders; tail to f2034.

## Shots (press-conference room — podium centre-back, US flag left + Iraq flag right behind Bush, al-Maliki at Bush's side, rows of seated press facing podium, al-Zaidi front row)
1. Hook wide: whole room, podium + flags + press rows, slow push-in. White flash after "Twice."
2. Setting: cut to podium MS — Bush + al-Maliki at microphones, flags behind. Push on "last press conference".
3. Front row: al-Zaidi stands up (rise over ~12 f), press heads turn. Camera low, over shoulders.
4. Throw 1: shoe arcs from front row to podium; Bush ducks (dip ~6 f, 0-3 f before "ducks"). Impact kick on the throw, 7 f decaying flip-shake.
5. Throw 2: second shoe, Bush ducks again; shoe continues past and hits US flag (flag wobbles). Wider shot so the flag hit reads.
6. Deadpan CU: Bush straightens, small grin/relief; cut to flag, then back. Roll 4 deg on "Unluckily".
7. Explanation: side view, straight flight line (shoe as a small dark card travelling level) + a dodgeball kid ducking — keep it IN the room: replay the duck in slow side view, shoe sailing over his head. No swing/park scene.
8. Consequence: guards close in on al-Zaidi, lead him out (walk cycle, escorted); empty front-row chair; then a simple cutaway — shoes gone / cell bars (keep abstract: empty chair + shoes absent).
9. Callback: podium again, Bush joking (grin), then a shoe close-up (size-10 joke lands here), final wide of the room with the flag still wobbling slightly. End on the shoe, not on a face.

## Adaptation notes for the scene agent
- Reuse from bridge templates UNCHANGED where possible: toon.ts (Pen, faces, bean heads), cardshade.ts, shade.ts, lights.ts day preset, ink.ts, lensblur.ts, grade.ts, paint.ts textures.
- Replace: build.ts town -> press room (floor, back wall, podium, flags, chairs, microphones); world.ts sky/river/bridge -> indoor room (no sky, no river, warm interior light, ceiling not visible); cast.ts soldiers/townsfolk -> Bush, al-Maliki, al-Zaidi, press crowd, guards; story.ts -> timeline above.
- Flags: US flag = stars + stripes (painted texture, NOT a label); Iraq flag = red/white/black bands + green text-like band — draw as bands only, no readable text (no labels in video). Do NOT use the bridge's St George flag.
- Characters are our own cartoon versions of real people — bean-head style, no likeness copying from the reference channel.
- Cameras: every hold creeps (push-in 0.15-0.35 %/f), cuts on big reframes, glides 18-40 f, kicks decay over 7 f on shoe impacts.
- DOF: focus on eyes of the front row / Bush; cInf 12-16 px CU, 10-12 MS, 0 wides.
