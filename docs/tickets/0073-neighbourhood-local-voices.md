---
id: 73
title: Finish genuine neighbourhood voices locally
status: doing
priority: high
type: feature
created: 2026-11-05
---

## Why

Callum authorized finishing the four cloud features on the laptop. Cloud model downloads prevented the real Mandarin voice assets from being generated.

## Done when

- Every apartment, cats, repairs and garden line and word references a genuine, validated offline clip generated with the existing approved voice pipeline and presets.
- Asset/text/voice provenance, cache and signal checks pass without changing accepted restaurant or hospital voices.
- Representative speech is auditioned, technical limits are recorded, and an independent reviewer checks the actual assets.
- All changes are committed for integration with 0066; no silent substitutes or browser speech synthesis.

## Notes

- Owner: local audio Sol Medium worker. Branch `codex/0073-neighbourhood-local-voices`; worktree `/private/tmp/junyan-neighbourhood-voices`; port 5473 (strict).
- Exclusive ownership: feature content JSON audio references, new feature audio assets/manifests and narrowly needed synthesis tooling. Coordinate before any shared content or preset change.
- Central reservation: 0073 voices, 0074 playable demos, 0075 independent verification. Existing 0066 remains the single shared application integration writer.

- Local pinned Qwen synthesis started successfully on the Apple M4 GPU with `HF_HUB_OFFLINE=1`. Existing Kokoro CPU environment is ready. The adapter preserves raw JSON and stable URLs, routes repairs through approved character presets and stores per-feature manifests.
- Both standard-library self-checks pass. Feature audit now requires exact text/preset/pronunciation identity, byte hashes and core signal checks. Bounded new seed windows preserve default behavior and reject known bad hashes across copied feature assets.
- Independent tooling review starts while the real batch continues. Asset completion, final ASR screening and parent-owned audible demos/review remain open. See [[evidence/0073/README]].
