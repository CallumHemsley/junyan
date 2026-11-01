---
id: 18
title: Cast four voices as distinct recurring characters
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

- Owner: Codex orchestrator. Branch `codex/0018-character-voices`. Parent ticket 0018.
- Root worktree `/Users/callumhemsley/Personal/junyan`; Vite port 5173 with strictPort. Worker uses no dev server.

## Delivered 2026-11-01

- Cast Serena as 林姐 (warm adult neighbour), Yunxi as 小李 (brisk office worker), Uncle_Fu as 张老师 (older retired teacher), and Xiaobei as 小周 (lively young adult student). Each has a unique greeting, order wording, thanks and retry line, plus data-driven scene and sidebar appearance.
- Character profiles and pinned voice presets are schema-validated JSON. The actual Pixel Plays rasterizer remains in use, with Chinese dialogue rendered as tappable DOM words. Stable order IDs preserve saved progress.
- Integrated the reusable pipeline from ticket 0019 and generated 67 local PCM16 mono 24 kHz WAVs (136.41 seconds): 26 full lines and 41 shared word lookups. Prototype Tingting audio/generator removed. Provenance and byte hashes are committed with content; native pronunciation review remains pending.
- Fixed the journal's vocabulary enumeration to include character-only greetings and reactions; regression test plus save/reload browser journey verify it.
- Verification: 38 Vitest checks, all 7 Playwright desktop/phone journeys, production build, all four voices plus dictionary audio cached offline, screenshots inspected, clean browser console. Stdlib-only pipeline replay: zero generation, 67 cached, zero pending.
- Cast notes: `docs/characters.md`. Extension instructions: `docs/content-audio.md`. Demo and review outcome recorded below once complete. No push, PR or deployment requested.
