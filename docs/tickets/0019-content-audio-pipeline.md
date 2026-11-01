---
id: 19
title: Build reusable offline character audio generation
status: done
priority: high
type: feature
created: 2026-11-01
---

## Why

Callum requested all four auditioned voices in the game, personalities fitted to those voices, and a reusable system for future content.

## Done when

- Four regulars have stable voice identities and distinct authored greetings, orders and reactions.
- Local audio generation reads content plus declarative voice presets, reuses unchanged audio, and records provenance.
- New characters and lines can be added through documented content without editing UI or generation logic.
- Applicable content, rules and browser checks pass. Pronunciation quality remains explicitly pending native review.

## Notes

- Owner: Codex Sol 6.1 medium audio-pipeline worker; parent ticket 0018.
- Branch: `t3/0019-content-audio-pipeline`; worktree: `/Users/callumhemsley/.t3/worktrees/junyan/t3-5423ee33`; no dev server or port.
- Worker scope: `scripts/content-audio.py`, `docs/content-audio.md`, this ticket only. Parent owns content, voice presets, schema and UI.
- Implemented stdlib-only plan/self-check, lazy engine imports, content-addressed PCM16 assets, digest/byte/signal-checked cache, bounded retries, merged provenance and atomic successful-only reference updates. Usage: `python3 scripts/content-audio.py --plan`; separate engine environments run `--engine qwen|kokoro --write-content`.
- Mocked `python3 -S scripts/content-audio.py --self-check` passes, including full-preset/version/pronunciation invalidation, matching-digest corrupt WAV rejection and concurrent parent-edit protection. `git diff --check` passes.
- Real engine smoke: five offline-cache PCM16 assets covering all four auditioned voices (`多谢`); one Uncle_Fu take retried. Stdlib-only replay reuses all five with zero pending. Isolated fixtures/manifests/logs are under worker `output/content-audio-smoke/`; reused completed workers' Python environments/model caches read-only, no production content or other worktree edits.
- Parent integration complete: all 67 real game clips synthesized and referenced, zero pending; stdlib-only verified cache replay, 38 unit/content checks and 7 desktop/phone browser tests pass. Native exact-text/pronunciation review remains pending.
- Pronunciation investigation: Misaki's auditioned legacy Chinese frontend has no contextual sandhi. Direct phoneme input is feasible, but joined authored pinyin has no lexical-versus-surface distinction; speculative overrides are deliberately disabled to avoid double sandhi. Native exact-text/pronunciation listening review remains pending.
