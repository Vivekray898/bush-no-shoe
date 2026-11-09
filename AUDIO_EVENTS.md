# Bush Shoe Throw — 2008: audio events (DRAFT — lock picture timing first, then build the mix)

Mix standard (skill): music +3 dB, SFX -6 dB, voice unchanged, 48 kHz, exact length, master to -15 LUFS, true peak <= -1 dBTP.
Score: original march-style, ducked under speech (use templates/audio/music.py + instruments.py + dsp.py primitives; do NOT copy the bridge's timeline.py/mix.py section map — write a new bush timeline/mix in ~/workspace/bush-shoe-short/audio/).

## SFX events (times = from words.json once known; estimates from SHOT_PLAN.md)
- Room tone / press murmur under setting (low, constant, ducked under voice).
- Chair scrape + footsteps as al-Zaidi stands (~11.6-13 s).
- Shout: no voice SFX — the narrator reads the quote; add a short crowd gasp under "you dog!".
- Shoe 1 whoosh (throw -> duck), then a soft thud as it passes / hits wall (~17-18 s).
- Shoe 2 whoosh, Bush duck, flag flap + pole wobble thump when the shoe hits the flag (~24-26 s).
- Guards: footsteps + door, low, under consequence (~39-41 s).
- Callback: light march bloom under "size 10 shoe" joke; a small shoe-tap / cash-register-free joke cue is NOT wanted — keep it musical only (a short rising march phrase).
- No gunshots, no explosions, no crowd booing track. Keep it deadpan, like the bridge short.

## Music map (march, original, synthesized)
- Hook + setting: march, steady, medium.
- Throws: march stops dead for the duck beats (silence is the joke), resumes after "it only hit a flag".
- Explanation (dodgeball): lighter, bouncier march variation.
- Consequence: march quieter, lower.
- Callback: march blooms, ends on a tidy final chord with the last word.

## Files (to be built by the sound agent AFTER picture lock)
- ~/workspace/bush-shoe-short/audio/timeline_bush.py (shot/beat times from words.json)
- ~/workspace/bush-shoe-short/audio/mix_bush.py (or adapted mix.py) -> mix.wav (48 kHz, exact length) + stem_voice/music/sfx.wav + cues.md
- Final mux: ffmpeg -i <silent video> -i mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac (or libopus as needed) -> out/bush-shoe/video.mp4
