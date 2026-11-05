# Mix calibration: measured audibility, listening still required

Final candidate: `public/audio/ambience/breakfast.mp3`, 73 s, 438,572 bytes. Original CC0 synthesized non-speech design. Root supplied established speech active RMS reference **−20 dBFS**; this is a level reference, not a claim of identical loudness for every voice/device.

Reproduce from repository root:

```sh
python3 scripts/ambience-0063.py
python3 scripts/ambience-0063-levels.py --label calibrated-source-gain-8 --output docs/evidence/0063/mix-after.json
```

The analysis decodes actual MP3 samples to float PCM with ffmpeg. RMS is measured over explicitly named event windows, plus strongest 50 ms energy and sample peaks. Whole-file mean includes intentionally quiet gaps and must not substitute for active-event measurement. `mix-before.json` preserves the first published candidate; `mix-after.json` records the calibration.

The first candidate stacked low source amplitude with controller attenuation. Pour bodies at default were −54.8/−55.0 dBFS, cup contact −57.6, preparation −67.3, quiet room −70.5. Even at the top of the control, pouring was −45.7 dBFS. These are numerical evidence of an unnecessarily restricted range, not proof that a particular human could not hear it.

Compared removing controller gain against calibrating the source. Removing only the .45 multiplier adds 6.9 dB and still leaves pour bodies about 28 dB below the speech reference at default; it also makes UI gain depend on changing low source amplitudes. Chose **source gain ×8 (+18.06 dB)** once before encoding: use existing unused peak headroom while preserving irregular dynamics, independent player level and 11.48 dB speech ducking. Generator rejects source clipping instead of silently limiting it. The decoded MP3 has **zero clipped samples** and **−8.52 dBFS peak**; whole-file raw RMS **−30.55 dBFS**, default **−46.60** (before −48.61 raw / −64.66 default). No compression or speech changes.

| Region (RMS dBFS) | Raw | Default .1575 | Default ducked .042 | Maximum .45 | Maximum ducked .12 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Quiet room, 0.5–2.5 s | −36.40 | −52.45 | −63.93 | −43.34 | −54.82 |
| Cup contact, 3.1–3.2 s | −23.54 | −39.60 | −51.08 | −30.48 | −41.96 |
| Pour body, 8–9.5 s | −20.70 | −36.76 | −48.24 | −27.64 | −39.12 |
| Preparation, 12.7–13.9 s | −33.25 | −49.31 | −60.79 | −40.19 | −51.67 |
| Later pour, 34–36 s | −20.87 | −36.92 | −48.40 | −27.81 | −39.29 |

Strongest 50 ms window: raw −19.26, default about −35.31, default ducked −46.80 dBFS. Thus default active pours/contact are roughly 17–20 dB below the −20 speech reference, and 28–31 dB below it while ducked. At the top of the control, active pours still duck to about −39 dBFS, about 19 dB below the reference. The room and preparation remain quieter than the discrete cups/pours. Level zero and mute pause playback independently of speech.

This establishes a defensible, adjustable engineering starting range, **not an approved mix**. Sample peaks/RMS do not establish perceptual masking, realism, spectral harshness, physical playback volume, fatigue, loop seamlessness or enjoyment. No actual listening or user approval has occurred here. Root should preview the calibrated asset at the exact final commit, compare real foreground lines with ambience off/default/high, and listen through a full ordinary restaurant day and repeated loop boundaries. If synthetic cups/pours do not sound realistic, replace/refine the sound design within this ticket rather than using level measurements as acceptance.

## 2026-11-05 user acceptance update

Root relayed the direct user response **“Works at this level”** after a 20-second preview simulation using the calibrated asset at actual default .1575 and ducked .042 gain during two shipped LinJie lines. Preserve exact level .35 and calibrated source. This supersedes earlier pending-level-listening statements only within that representative excerpt's scope; it does not claim full 73-second loop/day listening, this worker's perception or final approval. See USER-LISTENING.md. No further mix changes made; root native/visual/exact-review gates remain pending.
