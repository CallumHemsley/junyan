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
