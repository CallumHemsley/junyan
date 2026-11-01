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
- Cast notes: `docs/characters.md`. Extension instructions: `docs/content-audio.md`. Video demo: `output/playwright/junyan-character-voices.mp4` (116.6 seconds, all four voices, complete first shift, harder day-two order, journal; 21 captured audio events, no audio errors). Desktop/phone scene and dialogue screenshots inspected. Independent Sol 6.1 medium integration review is complete; its sole finding and the final-head verification are recorded below. No merge has been performed. No push, PR or deployment requested.

## Independent review resolved 2026-11-01

- Reviewer found one P2: character-only greeting/reaction lookups were excluded from the reducer's journal vocabulary. This was already fixed in `0bce3d7` by sharing `contentWords` between the UI and reducer; final-head inspection confirms all character greeting, thanks and retry tokens are included.
- Strengthened the existing regression test to verify repeated lookup counts, injected timestamp updates and preservation into the next day for all three character-only token types. All 38 unit/content/renderer checks pass after this review follow-up.
- Reviewer reported no additional concrete rendering defect and inspected a render from the actual Pixel Plays renderer. Their review covered an earlier integration snapshot (35 passing tests and unfinished WAV validation); the final audio and browser checks recorded above were completed separately by the parent. Native Mandarin listening review remains pending.
