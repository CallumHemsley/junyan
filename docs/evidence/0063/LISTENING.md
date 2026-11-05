# Listening handoff: no subjective pass yet

Candidate: `public/audio/ambience/breakfast.mp3`, original CC0 synthesized non-speech palette, 73 seconds / 438,572 bytes. Generator: `scripts/ambience-0063.py`. It contains intended steam/preparation texture, ceramic contacts around 3/16/29/44/60/68 seconds and pours around 7/33/63 seconds. These names describe synthesis intent, not an auditory judgment that they sound realistic.

The integrated default applies gain .1575; speech-state gain is .042. Raw-file preview is therefore louder than intended in-game playback. The first candidate was excessively attenuated by source and controller gain together. The calibrated source is now +18.06 dB, with raw RMS −30.55 / peak −8.52 dBFS, zero decoded clipped samples, default active pours about −36.8 dBFS and ducked pours about −48.2 against the −20 speech reference. See MIX.md and before/after JSON. Numerical levels still do not prove audibility on a particular device or a well-balanced mix. Do not approve naturalness, immersion or seamlessness from file existence, waveform, duration or automated native playback.

Root can expose the committed MP3 as an audible preview. Ask the user to compare (1) restaurant silence, (2) raw palette to identify implausible sounds, (3) the proposed default level behind actual Mandarin lines/word playback, and (4) two complete loop boundaries. Do cups sound like small ceramic contacts rather than musical notes? Does pouring suggest a real drink rather than synthetic chirps? Does preparation feel plausible for soy milk/tea/steamers rather than an unrelated coffee machine? Is the quiet bed audible without competing with speech? Does it become tiring over one full four-customer day?

Record actual listener, device/output, level, A/B conditions, timestamp and concrete observations before tuning or accepting. No listening session, subjective quality score, human approval, realistic-café claim or recorded comparison is claimed by this worker. If the user rejects the synthetic palette, acquire licence-clean real sources within the same ticket scope; do not keep it merely because playback tests pass.

## Reproducible comparison for a listener

`docs/evidence/0063/listening-comparison.mp3` is a **42-second offline A/B/C render**, not a browser capture or claimed listening session:

- 0–14 seconds: the existing restaurant line only.
- 14–28 seconds: the same line plus default ambience, including actual speech ducking gains.
- 28–42 seconds: the same line plus maximum ambience, including ducking.

Within each section the identical unaltered voice clip starts at 4 and 9 seconds. The original ambience timeline restarts at each section so cups/pours can be compared consistently. `listening-comparison.json` records source paths/hashes, section timing, gains and limitations. Regenerate with `python3 scripts/ambience-0063-preview.py`. The speech retains its existing source terms; the composite is not labelled CC0 as a whole. Use the 73-second raw asset separately for full-loop-boundary listening. No one has listened to or approved this render in this worker's evidence.

## 2026-11-05 user acceptance update

Root relayed the direct user response **“Works at this level”** after a 20-second preview simulation using the calibrated asset at actual default .1575 and ducked .042 gain during two shipped LinJie lines. Preserve exact level .35 and calibrated source. This supersedes earlier pending-level-listening statements only within that representative excerpt's scope; it does not claim full 73-second loop/day listening, this worker's perception or final approval. See USER-LISTENING.md. No further mix changes made; root native/visual/exact-review gates remain pending.
