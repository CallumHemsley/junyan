# Offline character speech

Game clips are generated locally from `src/content/content.json` and the pinned
presets in `src/content/voices.json`. Each character has a stable voice for full
orders, greetings, thanks and corrections. Word lookups share Serena's voice.

Use the reusable pipeline documented in [`docs/content-audio.md`](../../docs/content-audio.md).
The pipeline writes content-addressed mono PCM16 24 kHz WAVs and a provenance
manifest. It verifies cached files and regenerates only missing or changed clips.
No runtime generation, paid API, key or voice cloning is involved.

Whole-line input is the concatenated authored Hanzi. Pinyin on word cards records
dictionary tones; connected speech can apply tone sandhi. All Chinese dialogue
stays tappable DOM text. Native pronunciation review remains pending, especially
Kokoro polyphones and tone sandhi. These clips are not yet approved teaching audio.

`饺子` is ordered by the bowl; one game item is one bowl. `bread` denotes 馒头,
while `milk` denotes 豆浆. Glosses and pinyin appear only on lookup.
