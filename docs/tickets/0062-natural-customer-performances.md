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
- 2026-11-05 follow-up: 10 browser checks passed across phone/desktop and normal/reduced motion, including full opening/four-customer day/change/journal, persistence and supplementary production offline/audio loading. Inspected actual screenshots and sampled muted video frames. Added explicit isolated punctuation fixtures and verified 24 changed line identities with unchanged cast/dictionary assets. Evidence includes scores and precise remaining listening/runtime limits; still doing/BLOCKED for completion.
- Root reports real four-voice punctuation thanks probes generated successfully; acceptance/listening pending. 0066 exclusively owns contracts/schema/word traversal; a precise optional-Line-text, token-equivalence and provenance-test handoff is appended to evidence. Cloud does not have root's temporary Mac/Kokoro runtime paths. No production changes authorized yet.
- Received support probes at immutable `bf90baa2d266d59368829573c3d4f73c2c0fe05b`; owned comparison exporter verifies all four real candidate/baseline pairs and produces manual responsive playback. Inspected comparison screenshots, checked media decoding, no listening claim. Real isolated candidate files now available; no support-branch merge or truncated fixture import.
- User directly accepted all four revised thanks samples. Same-cast punctuation direction selected; remaining 20 final lines not yet user-reviewed. Immediate isolated 0066 bridge handoff: [[evidence/0062/foundation-bridge-handoff]]. Production awaits current-main doctor import, explicit lease and final artifacts; preserve shared Help greeting references.
- Full24 support set `64edaa7` technically staged without production writes:24targetlines/4acceptedthanksunchanged/126cached/0pending, old clips retained. Root ASR did NOT clear all24: HOLD `zhang-retry` for possible omitted 再看看 clause; short greeting/retry transcriptions uncertain. Staging cannot be promoted until clearance, updated main doctor+bridge and explicit lease.
- Resolved root selection:23punctuationchanges; reject new `zhang-retry`71cc826b for possible missing clause, keep original retry/audio/no-text unchanged. Updated dry-run importer proves original object preserved/rejectedWAVabsent and125cached/0pending. Short Kokoro ASR ambiguities also occur on baseline; no all24-ASR-pass claim. Await revised package/raw proof and lease.
