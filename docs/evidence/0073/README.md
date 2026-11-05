# Neighbourhood voice completion

The neighbourhood adapter keeps the feature JSON and every authored audio URL unchanged. Apartment, cats and garden use the existing Serena narrator preset. Repairs routes 林姐 to Serena and 小周 to Xiaobei. Every dictionary tap uses the existing Serena word preset.

The adapter consumes the raw feature JSON, including all nested line tokens and repairs character lines. Garden's runtime labels reference registered dictionary words and need no additional invented full-line assets. Each feature owns its own manifest. Accepted restaurant and hospital files, presets and shared manifest remain unchanged.

## Repeat the checks

```sh
python3 scripts/content-audio.py --self-check
python3 scripts/neighbourhood-audio.py --self-check
python3 scripts/neighbourhood-audio.py --plan
python3 scripts/neighbourhood-audio-audit.py
```

The plan and audit import no model packages. The audit checks exact authored Hanzi and punctuation, full approved preset, pronunciation metadata, content identity, WAV byte hash, mono PCM16 at 24 kHz, clipping, duration and non-silent signal. It includes every nested reference. Missing provenance fails even when a WAV decodes.

Generation uses the existing pinned offline Qwen and Kokoro environments, one synthesis process at a time. Full-preset and authored-pinyin identity matches can reuse a genuine prior clip. Reused provenance names the exact source filename. A rejected hash is refused by every feature cache and audit, and a requested retake expands to all feature copies of that hash. Rejected WAVs and provenance are archived before replacement. No model settings or acceptance limits are relaxed. A bounded retry round selects the next disjoint window of eight seeds, records its actual seeds and preserves the original default window. The maximum is three windows. Accepted existing assets remain cached.

## Listening limits

No audio-perception tool is available to this worker. No claim of listening, native Mandarin approval, tone accuracy or naturalness is made. The local Whisper-small CPU script screens full lines with only Chinese/task hints, never the expected text. Its exact input byte hashes and recognized strings are recorded. ASR differences require inspection, and traditional-character variants or isolated homophones do not prove a bad take. This screen does not approve pronunciation or tone.

The parent integration worker owns browser playback, playable demos and independent review. This ticket remains doing until the agreed review and demonstration gates are recorded.

## Final technical result

All 313 referenced assets pass the final plan and provenance/signal audit. New feature files total 278. Apartment has 47, cats 85, repairs 64 and garden 82. Twenty are exact-identity reuse copies, with their source recorded. No content JSON, accepted preset, restaurant/hospital WAV or shared manifest changed.

The first Qwen pass accepted 245 new clips and reused 20. Its attempted counter was 246 because the dictionary word 一下 failed eight seeds. That word passed the next bounded window. The Kokoro environment initially looked in the default cache and failed; the existing pinned cache at `/private/tmp/junyan-0062-models`, selected with `HF_HUB_CACHE`, generated all 12 Xiaobei lines offline. Raw logs retain both runs.

Fourteen full/label/action clips received one conservative alternate seed window after the first ASR screen. The gift line received the final allowed window after its second transcript was still strongly different. Its final SHA-256 is `971dfc1ae522c0e8347cc7c94aec1985540b393a079ded55b42d353fa2b00dbb`, and the final local transcript is 这个给你. Fifteen replaced WAVs and their provenance are archived. Their hashes cannot pass the feature audit under another filename.

`asr-final.json` covers all 87 authored full/label/action clips. The final apartment rerun replaces the older apartment receipts, and every receipt hash was checked against current bytes. Strong first-pass differences in the welcome, gift, cat doorway/labels and garden growth/maturity lines improved after bounded retakes. Some orthographic and phonetic ambiguities remain, including 阴凉/音量, 灯泡/登泡, 盖/該 and 选空位/先空位. They are preserved in the raw transcripts. These are not native tone or pronunciation judgements, and an ASR match is not listening approval.

`representative-speech.wav` contains eight original line/word excerpts across the four features, separated by 350 ms gaps. Its JSON lists source hashes and segment times. This is an actual speech playback artifact; this worker has not claimed to hear it.

Independent tooling review of `67b212b` passed according to the parent coordinator. The parent owns the independent review receipt, audible browser/video demos and integration. This audio branch is ready for that integration.
