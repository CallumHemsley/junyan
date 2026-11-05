---
id: 63
title: Add a subtle restaurant soundscape
status: doing
priority: medium
type: feature
created: 2026-11-05
---

## Why

Callum wants background sounds that make the café/canteen feel occupied and alive, suggesting coffee sounds as an example. A quiet layer of believable room and food-preparation sounds should make the breakfast restaurant more atmospheric while leaving Mandarin dialogue easy to hear.

## Done when

- [ ] Audition a small sound palette in the existing scene, such as cups set down, pouring drinks, gentle kitchen preparation and soft room tone. Include the suggested coffee/preparation texture where it fits the setting; select a restrained mix rather than adding every example.
- [ ] Add a seamless ambient bed and/or occasional background sounds with natural spacing and no obvious repetitive loop. Keep speech and word pronunciation prominent, lowering background volume during playback where needed.
- [ ] Provide a discoverable way to mute or adjust ambience independently of speech. Start audio after a user gesture, respect the player's setting, and stop or suspend it when leaving the restaurant or hiding the app; returning does not create duplicate playback.
- [ ] Commit offline-ready assets with documented source, licence and any attribution. Verify the soundscape works offline and does not introduce intelligible English chatter or other speech that distracts from learning.
- [ ] Callum reviews the mix through an ordinary restaurant session. Run relevant playback/lifecycle and offline checks plus the Playwright journey; inspect controls at phone and desktop widths, confirm a clean console, and record asset size and listening results in Notes.

## Notes

- Requested by Callum on 2026-11-05 alongside [[tickets/0062-natural-customer-performances]]. Ambience and customer delivery should be reviewed together, but each ticket has its own outcome.
- Starting points: `src/audio/playback.ts`, `src/App.tsx`, `scripts/offline.ts`, [[tickets/0034-audio-lifecycle]] and [[tickets/0035-offline-release]]. The current restaurant is a Chinese breakfast setting; choose sounds that suit what the player sees.
- Keep generation and asset acquisition offline; no live audio service is needed. Do not reuse separately licensed Pixel Plays music (decision 0003).

- Owner: Codex cloud agent, ticket 0063. Branch: `codex/0063-restaurant-background-sounds`; isolated checkout: `/workspace/junyan-0063`; strict dev/preview ports: 5414/5415. Evidence: `docs/evidence/0063/README.md`. Shared App/styles/playback integration remains leased to 0061; standalone checkpoint first.
- Standalone checkpoint published in draft PR #17. Controller, original CC0 73-second MP3 (438,572 bytes), reproducible generator and portable evidence committed. Full suite 175 tests pass; final focused playback 19 tests pass; build passes; existing silent desktop/phone opening + four-customer day/audio/offline regressions 23 passed, 2 skipped; standalone real-media/offline driver 19 checks pass. See evidence for exact commands, screenshots and limits. Ogg trial replaced after a proven offline native-duration discrepancy. BLOCKED from READY pending 0061 integration lease release, controls/preferences/speech wiring, actual listening and independent review. No merge.
