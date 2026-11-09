# Bush Shoe Throw — 2008: shot plan (DRAFT, timings to be refined from voice/words.json)

Source: ~/workspace/bush-shoe-short/SCRIPT.md (approved, do not change facts/wording).
Style: claude-animated-shorts — 1080x1920, 30 fps, day light indoors (warm palace room, NOT golden hour), 2D bean-head cards, ink outlines, gliding cameras, no captions/labels, English only.
TOTAL placeholder: 2025 f (67.5 s) in scaffold — replace with real duration from voice.wav once known (expected ~1800 f / ~60 s).

REAL timings from voice/words.json (67.10 s, 188 words, TOTAL = 2013 f @ 30 fps). Every visual reaction 0-3 frames BEFORE its word:
- P1 HOOK f0-140 (0.00-4.68 s): "A journalist threw a shoe at the President of the United States. And he missed. Twice." ("Twice." 4.24-4.68 s)
- P2 SETTING f172-488 (5.74-16.28 s): "December 14, 2008. Baghdad, Iraq. President George W. Bush is at his last press conference there, standing next to Iraq's Prime Minister, Nouri al-Maliki."
- P3 THROW 1 f515-797 (17.18-26.56 s): al-Zaidi stands, shouts "This is a farewell kiss from the Iraqi people, you dog!", throws shoe 1 ("throws his shoe" 25.00-25.70 s), "Bush ducks" 26.04-26.56 s.
- P4 THROW 2 f830-1101 (27.66-36.70 s): "Al-Zaidi throws his other shoe" 28.26-29.34 s; "Bush ducks again" 31.78-32.48 s; second shoe hits the American flag behind him (by ~36.70 s).
- P5 DEADPAN f1132-1266 (37.74-42.20 s): "Luckily," 37.74-38.26 s; "Unluckily" 40.12-40.60 s; "it only hit a flag."
- P6 EXPLANATION f1307-1510 (43.58-50.34 s): dodgeball analogy ("dodgeball" 46.56-47.06 s).
- P7 CONSEQUENCE f1547-1703 (51.58-56.76 s): grabbed, "jailed for nine months" 54.44-55.50 s, shoes destroyed.
- P8 CALLBACK f1738-1997 (57.92-66.58 s): "size 10 shoe" 61.74-62.52 s; shoemaker orders; tail to f2013.

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
