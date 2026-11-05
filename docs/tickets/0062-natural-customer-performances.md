---
id: 62
title: Make all four restaurant customers sound and behave naturally
status: doing
priority: medium
type: bug
created: 2026-11-05
---

## Why

Callum likes that the four customers have different voices, but their performances do not yet feel like real people in a café. Review the whole cast in the restaurant context and improve the unnatural delivery while preserving each customer's distinct identity.

## Done when

- [ ] Listen to greetings, orders, wrong-order reactions and thanks for all four regulars: 林姐, 小李, 张老师 and 小周. Review their visible reactions alongside the speech and record concrete examples of what feels unnatural for each person.
- [ ] Refine the affected performances for conversational pacing, believable emphasis and restrained reactions, consistent with each character's personality. Keep four recognizably different voices, clear Mandarin and comfortably audible speech.
- [ ] Compare before and after samples in the playable restaurant, including transitions between customers. Callum reviews all four and confirms they feel more like people ordering in a café.
- [ ] Generate changed clips through the offline pipeline, update content paths and the manifest, and retain unchanged assets where possible. Check replay and offline playback; coordinate loudness changes with ticket 0057.
- [ ] Run relevant rules/content, audio, offline and Playwright journey checks; inspect phone and desktop screenshots and a short video with sound, and confirm a clean console. Record listening findings, commands and results in Notes.

## Notes

- Reported by Callum on 2026-11-05. This captures a cast-wide realism concern; specific causes and affected takes remain to be verified.
- Current cast: 林姐 / `serena` (warm neighbour), 小李 / `yunxi` (brisk office worker), 张老师 / `uncle-fu` (mellow retired teacher), 小周 / `xiaobei` (bright student). See `docs/characters.md`, `src/content/content.json`, `src/content/voices.json` and [[tickets/0018-character-voices]].
- Pointers: `docs/content-audio.md`, `scripts/content-audio.py`, `src/scene/renderer.js` and [[tickets/0024-personable-character-direction]]. Review delivery before deciding whether any voice needs replacing.
- Serialize shared content, voice-preset and manifest edits with [[tickets/0057-relevel-restaurant-audio]], [[tickets/0058-doctor-opening-voice]] and [[tickets/0060-subdue-grandpa-opening-performance]]. Hospital performances remain in their own tickets.

- 2026-11-05: Owner Codex cloud 0062; branch `codex/0062-natural-customer-performances`; isolated checkout `/workspace/junyan-0062`; strict ports 5412/5413. Prepared 24-reference baseline audition pack and Mac generation handoff; production shared files untouched. Evidence and append-only decisions: [[evidence/0062/customer-performance]]. Real synthesis/listening and ownership release remain blocked; no completion or subjective approval claimed.
