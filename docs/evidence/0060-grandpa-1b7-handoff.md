# 0060 — two-line 1.7B Grandpa audition handoff

Prepared 2026-11-05. **Not generated, listened to, or approved in cloud.** Production audio/content remain under 0058 ownership; visual fix remains draft with ticket incomplete.

Root reports actual `1b7/custom_voice` verified/loadable in the existing Mac environment at revision `f35faf19b0cc2160865af64ecf0f22f83d335135`, cache `/tmp/junyan-supported-models`. Doctor probes demonstrate loadability, not approval of Grandpa or a production casting choice. The preparer requires an explicit model repository ID so root can supply the repository verified in that cache. Cloud plan verification used `mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit`; it performs no model access and does not independently establish that repository's cache availability.

## Choice and comparison

| Role | Exact authored text | Why this sample |
| --- | --- | --- |
| `elder-milk` | 早上好，年轻人。请给我一杯豆浆。 | Longer request tests ordinary phrasing, pauses, clear Mandarin and low energy. |
| `elder-egg-thanks` | 谢谢，谢谢！ | Repeated/exclamatory thanks is the strongest script-level excitement risk; test restrained warmth without changing script. |

The owned preparer is `scripts/0060-prepare-grandpa-audition.py`. It reads live baseline content/voices, copies all cached audio/manifest, retains a complete baseline content copy, makes an **offline-only audio fixture** containing all non-elder content plus the two selected elder lines, and creates the unique preset `hospital-elder-1b7-conversational-audition`. This fixture is not schema-valid gameplay content and must never replace production content. Both selected line objects, including tokens/pinyin/text, are copied verbatim. Restaurant consumers and dictionary voice remain unchanged.

Preset changes only model/revision/instructions, preserving Uncle_Fu, Chinese, speed 1, -20 dBFS active RMS / -1 dBFS peak ceiling. Instruction:

> 用普通日常交谈的语气轻声说话，语调平缓，语速从容，停顿自然，吐字清楚。像在病床上休息的人一样，不要兴奋，不要表演，不要耳语，不要颤抖或喘息。

This asks for ordinary, gentle, clear speech rather than theatrical frailty. Useful compliance must be heard, not assumed. One candidate/two clips only; no six-line regeneration and no instruction-only 0.6B variant.

## Deterministic preparation and Mac generation

From this ticket checkout, using the **exact parent-verified repository ID**:

```sh
python3 scripts/0060-prepare-grandpa-audition.py \
  --model-id mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit
```

If the verified repository differs, supply its exact ID instead; stop if it is not the stated pinned 1.7B CustomVoice snapshot. Output must be a new directory under ignored `output/` (existing directories are refused). Default: `output/0060-1b7-audition`. Review `plan.jsonl` and `comparison.json` before generation. The preparer refuses a plan unless exactly two pending jobs belong solely to the new hospital preset and have exactly the selected text. Production input hashes must remain unchanged.

Set `JUNYAN_QWEN_PYTHON` to the parent's **existing verified Mac Python executable**; do not create/reinstall a runtime. Use the parent's verified cache settings (`HF_HOME=/tmp/junyan-supported-models` only if that is the actual Hub-cache root). Then:

```sh
HF_HUB_OFFLINE=1 "$JUNYAN_QWEN_PYTHON" scripts/content-audio.py \
  --content output/0060-1b7-audition/content.json \
  --voices output/0060-1b7-audition/voices.json \
  --output output/0060-1b7-audition/audio \
  --engine qwen --limit 2 --write-content
python3 scripts/content-audio.py \
  --content output/0060-1b7-audition/content.json \
  --voices output/0060-1b7-audition/voices.json \
  --output output/0060-1b7-audition/audio --plan
```

Final plan must show zero pending; a limited successful run alone is insufficient. Existing pipeline provenance records real model/revision, seeds, attempts, signal/loudness checks and package versions. Do not alter generator/version/sampling or default production paths. Mac failures remain evidence, not grounds to silently use another model or change text.

## Exact comparison outputs from verified cloud plan

Under `output/0060-1b7-audition/`:

- Old request: `old/elder-milk.wav`; candidate: `audio/line-8ec8862b2468fb7c0ce2c87d63db60df890ed2266a20dc260948a64bc40a4b62.wav`.
- Old thanks: `old/elder-egg-thanks.wav`; candidate: `audio/line-9281df2703e2bb4e7652f8ae1d580be2346f0084fb6992fccbab1abf247165ec.wav`.

Candidate paths identify pending assets, **not generated files**. Old takes are real copied PCM files. `comparison.json` includes exact authored pinyin and production source hashes. Changing the repository/preset changes candidate names; use the newly produced comparison map.

## Audition decision gate

Present old/new request and old/new thanks at the same existing target. Record who actually listened, selected/rejected take, and concrete observations: ordinary delivery, gentle low energy, natural pauses, exact text/tones, intelligibility, audible level, no trembling/wheeze/whisper caricature. Signal metrics cannot answer these questions. This cloud worker cannot hear the takes. If the user rejects these probes, do not regenerate the full corpus or import them. If chosen, coordinate the audio lease and generate all six exact-script Grandpa lines under a unique hospital-only production preset, then replay the revised scene with sound for Callum's acceptance.

## Preparation verification

`python3 scripts/0060-prepare-grandpa-audition.py --model-id mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit` passed: **2 pending, 119 cached**, both pending solely on the unique hospital preset. Exact selected IDs/text, original token/pinyin copies, original loudness/speaker/speed, and unchanged production content/voice hashes asserted. No synthesis/model import/listening. No unchanged gameplay suites rerun for this handoff-only addition.
