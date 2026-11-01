---
id: 16
title: Generate local Qwen Mandarin samples
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
- Owner: Codex Sol 6.1; branch `t3/local-qwen-tts-audio`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-5d64b1e6`; port: none (offline inference).
- User steered this audition to local open-source TTS without API keys; this is an audition, not an amendment to accepted production asset decisions.
- Isolated CPython 3.12 runtime under ignored `output/qwen-venv`; public MLX 0.6B 4-bit CustomVoice checkpoint selected to share 16 GB memory safely with the parallel Kokoro audition.

## Delivered 2026-11-01

- All 20 authored Hanzi lines rendered by real local inference with both built-in voices, Serena and Uncle_Fu: **40 mono 24 kHz float32 WAV files** in `/Users/callumhemsley/Personal/junyan/output/voice-samples/qwen/`, named `T01-Serena.wav` through `T20-Uncle_Fu.wav`. No paid provider, API key, reference recording, voice cloning, pinyin input, normalization or time stretching.
- Exact checkpoint: `mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-4bit`, revision `08c72cad5e2fd0f41730c8bd1f28149585e46361`; MLX Audio 0.6.3, MLX 0.32.4, CPython 3.12.16 on Apple Silicon. `manifest.json` records text, voice, model/revision, language `Chinese`, all supplied generation options, deterministic seeds, retries, clip hashes, durations, elapsed inference time and successful-take MLX peak memory. `runtime-requirements.txt` captures the complete installed environment.
- First successful clip: T01 Serena, 2.00 seconds. Initial corpus exposed three abnormally long outputs; the final runner limits generation to 96 tokens, rejects capped/over-six-second takes and retries at most three deterministic seeds. T15 Uncle_Fu, T16 Serena and T19 Uncle_Fu each needed one retry; rejected attempts remain disclosed in the manifest. Original first-pass audio is retained only in this worktree's ignored `output/qwen-first-pass/`, not mixed into the deliverables.
- Final validation: 40/40 expected filenames, exact corpus texts/voices, SHA-256 checks, nonzero durations (1.36–4.80 seconds), finite samples, no clipping, native sample rate and successful EOS before token cap. Total final audio: 100.96 seconds; final batch inference including retries: 40.65 seconds (excludes download/loading and initial exploratory pass). Maximum successful-take MLX peak: 4.32 GB; waveform peak: 0.817. Machine-readable results: shared `validation.json`.
- Checks run: Python compilation, CLI help, audio validation self-check (one valid and seven invalid cases), full-corpus validation, resume without regenerating or changing WAVs, and `git diff --check`. No game changes, so game/browser checks were not run. **Native listening review is still pending**: technical checks do not establish pronunciation, prosody or suitability for production. Shared samples are ready for the parent audition/reviewer handoff.

## Repeat

Use a standalone/user-local Python 3.12 or 3.11; do not install into system Python. This run installed `uv` from Astral's distribution into `/tmp/junyan-uv`, then used its managed Python 3.12.

```sh
uv venv --python 3.12 output/qwen-venv
uv pip install --python output/qwen-venv/bin/python -r scripts/voice-samples/qwen-requirements.txt
output/qwen-venv/bin/python scripts/voice-samples/qwen-local.py --limit 1
output/qwen-venv/bin/python scripts/voice-samples/qwen-local.py
```

The default destination is the shared absolute folder above. Existing matching clips are hash-checked and skipped; incompatible manifests and untracked WAVs are not overwritten. To reproduce this audition's complete dependency versions, install from the delivered `runtime-requirements.txt`. Use `--output /absolute/fresh/folder` for a separate audition.

## Primary evidence

- [Official Qwen 0.6B CustomVoice card](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice): lists Serena and Uncle_Fu as Chinese speakers, with `Chinese` language selection. The card's CUDA/PyTorch quickstart is not the runtime used here.
- [Public quantized MLX checkpoint](https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-4bit/tree/08c72cad5e2fd0f41730c8bd1f28149585e46361): converted from that official checkpoint; pins the actual downloaded inference weights and speech tokenizer.
- [Actual MLX Audio implementation](https://github.com/Blaizzy/mlx-audio/blob/main/mlx_audio/tts/models/qwen3_tts/qwen3_tts.py), checked against installed 0.6.3 source: `generate_custom_voice(text, speaker, language, ...)`, explicit generation settings and built-in speaker validation. Unlike the broad model-card instruction-control claim, this implementation explicitly ignores `instruct` for 0.6B; the runner therefore passes none and retains the model's natural pace.
- [MLX Audio PyPI release](https://pypi.org/project/mlx-audio/0.6.3/): package and interpreter requirements checked before installing only into the isolated venv. No 1.7B fallback was needed.
