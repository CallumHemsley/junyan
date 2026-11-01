---
id: 17
title: Generate local Kokoro Mandarin samples
status: done
priority: medium
type: explore
created: 2026-11-01
---

## Why

Generate authentic Mandarin comparison audio locally without paid provider credentials, as requested by Callum.

## Done when

- Shared lines in `scripts/voice-samples/lines.json` are rendered with real model inference.
- WAVs and provenance identify exact model, revision, voice and generation settings.
- Native reviewers receive samples; no prototype audio is substituted.

## Notes

- Reserved centrally for a Sol 6.1 medium worker in its delegated worktree. Offline batch; no dev server.
- Parent: ticket 0008. Hardware: Apple Silicon arm64, 16 GB unified memory; at least 50 GB disk free.
- Owner: Codex Sol 6.1 medium; branch `t3/generate-kokoro-voice-samples`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-ff1c8eec`; port: none (offline batch).
- Verified official hexgrad Kokoro/Misaki model, voice and G2P documentation and MLX Audio Kokoro docs. Chosen backend: official Kokoro 0.9.4 / Torch CPU, two threads, one 82M model shared between voices; avoids Metal contention with the separate Qwen worker.
- Environment is private: Python 3.12 and uv under ignored worktree `output/`, venv `output/kokoro-venv`; no shared project dependency or system package changes.
- Delivered 2026-11-01: all 20 authored lines × `zf_xiaobei` and `zm_yunxi`, 40 real mono PCM16 / 24 kHz WAVs, to `/Users/callumhemsley/Personal/junyan/output/voice-samples/kokoro/` (`T01-zf_xiaobei.wav` through `T20-zm_yunxi.wav`). Native listening review is still pending; these are comparison candidates, not approved teaching audio.
- Generator: `scripts/voice-samples/kokoro-local.py`; isolated pinned direct dependencies: `scripts/voice-samples/kokoro-local-requirements.txt`. Uses plain corpus Chinese, `lang_code='z'`, speed `1.0`, no pronunciation markup, normalization, paid service, credentials or voice cloning. Model and both voice assets are pinned to `hexgrad/Kokoro-82M` revision `f3ff3571791e39611d31c381e3a41a3af07b4987`; weights SHA256 matches the official card (`496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4`).
- `manifest.json` in the shared delivery directory records exact model/revision, weight and voice SHA256, every text/voice/seed/settings, UTC generation timestamps, inference timings, G2P phonemes, raw/WAV metrics and all installed package versions. `validation.json` records a second, independent stdlib `wave`/`struct` decode and corpus/hash checks.
- Checks passed: generator `--self-check` (finite/silent/clipped/invalid-shape/short audio rejection plus PCM WAV round-trip), Python compilation, `uv pip check` (97 compatible packages), `git diff --check`, first real clip, full corpus, exact 40-file set and manifest/text/SHA256 consistency. All samples are finite, nonsilent and unclipped; lengths 2.075–3.450 seconds, total 106.3 seconds, maximum absolute PCM peak 0.612275. No game code changed, so game/browser suites were not run.
- Measured warm-cache full process: 16.92 seconds wall time, 13.51 seconds aggregate inference; `/usr/bin/time -l` maximum RSS 1,893,793,792 bytes (~1.76 GiB), peak memory footprint 1,820,149,968 bytes, zero swaps. The first clip had already succeeded before the full run. CPU limited to two compute threads and one interop thread; only one model loaded.
- Learning / limitations: the official [voice card](https://huggingface.co/hexgrad/Kokoro-82M/blob/f3ff3571791e39611d31c381e3a41a3af07b4987/VOICES.md) rates both presets D overall / C target quality. The [legacy Misaki Mandarin frontend](https://github.com/hexgrad/misaki/blob/main/misaki/zh.py) leaves material errors in the saved G2P input: T01 has `ni3 hao3` and `yi1 bei1`, T09 得 maps to `de2` rather than `dei3`, T10 得 to `de2` rather than neutral `de`, T15/T20 return-还 maps to `hai2` rather than `huan2`, and T17 长 maps to `zhang3` rather than `chang2`. These are frontend observations, not claims about what a native listener heard; do not mark pronunciation correct based on signal checks. No text or phonemes were repaired for this plain-text comparison.
- Official docs verified: [hexgrad model card](https://huggingface.co/hexgrad/Kokoro-82M/blob/f3ff3571791e39611d31c381e3a41a3af07b4987/README.md), [Kokoro pipeline](https://github.com/hexgrad/kokoro/blob/main/kokoro/pipeline.py), [Misaki language extras](https://github.com/hexgrad/misaki/blob/main/pyproject.toml), and [MLX Audio Kokoro](https://blaizzy.github.io/mlx-audio/models/tts/kokoro/). MLX supports the same Mandarin presets and `z` language code; the accepted lightweight CPU alternative was sufficient, with no dependency repair or model substitution required.
