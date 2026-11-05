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
- [x] Provide a discoverable way to mute or adjust ambience independently of speech. Start audio after a user gesture, respect the player's setting, and stop or suspend it when leaving the restaurant or hiding the app; returning does not create duplicate playback.
- [x] Commit offline-ready assets with documented source, licence and any attribution. Verify the soundscape works offline and does not introduce intelligible English chatter or other speech that distracts from learning.
- [ ] Callum reviews the mix through an ordinary restaurant session. Run relevant playback/lifecycle and offline checks plus the Playwright journey; inspect controls at phone and desktop widths, confirm a clean console, and record asset size and listening results in Notes.

## Notes

- Requested by Callum on 2026-11-05 alongside [[tickets/0062-natural-customer-performances]]. Ambience and customer delivery should be reviewed together, but each ticket has its own outcome.
- Starting points: `src/audio/playback.ts`, `src/App.tsx`, `scripts/offline.ts`, [[tickets/0034-audio-lifecycle]] and [[tickets/0035-offline-release]]. The current restaurant is a Chinese breakfast setting; choose sounds that suit what the player sees.
- Keep generation and asset acquisition offline; no live audio service is needed. Do not reuse separately licensed Pixel Plays music (decision 0003).

- Owner: Codex cloud agent, ticket 0063. Branch: `codex/0063-restaurant-background-sounds`; isolated checkout: `/workspace/junyan-0063`; strict dev/preview ports: 5414/5415. Evidence: `docs/evidence/0063/README.md`. Shared App/styles/playback integration remains leased to 0061; standalone checkpoint first.
- Standalone checkpoint published in draft PR #17. Controller, original CC0 73-second MP3 (438,572 bytes), reproducible generator and portable evidence committed. Full suite 175 tests pass; final focused playback 19 tests pass; build passes; existing silent desktop/phone opening + four-customer day/audio/offline regressions 23 passed, 2 skipped; standalone real-media/offline driver 19 checks pass. See evidence for exact commands, screenshots and limits. Ogg trial replaced after a proven offline native-duration discrepancy. BLOCKED from READY pending 0061 integration lease release, controls/preferences/speech wiring, actual listening and independent review. No merge.

- Production integration is now complete on reviewed main 5c90ba4, preserving 0061 direct word-switch behavior. Independent settings persist outside game/schema storage; trusted click/key unlock, native retry, lifecycle pause/resume and current-speech ducking are wired. No dependencies/schema/shared style.css changes. Final combined verification: 178 unit tests pass, build passes, 81 browser checks pass / 2 existing dedicated-policy skips; real full opening and four-customer days/change/journal played automatically on phone and desktop, layouts inspected in both motion modes plus 320px containment. See `docs/evidence/0063/FINAL.md`.
- Measured source/controller double attenuation corrected with source gain ×8: actual decoded raw RMS −30.55 / peak −8.52 dBFS, zero clipped samples; default active pour ≈−36.76, ducked ≈−48.24 against −20 speech reference. `MIX.md` records exact windows/range/limits. Original 73-second MP3 remains 438,572 bytes.
- Audible human-review artifact: `public/audio/ambience/breakfast.mp3`; unlistened 42-second speech-only/default/max offline comparison: `docs/evidence/0063/listening-comparison.mp3`. These are not claimed listening results or a browser capture. Subjective realistic texture/seam/balance and Callum's ordinary-session review remain blocking; ticket stays doing, not done. Root exact-patch/product review and subsequent lease handoff to 0066 remain pending. Future location gating documented in own `INTEGRATION.md`; no neighbourhood routes implemented.

- 2026-11-05 root relayed direct user listening acceptance **“Works at this level”** for a 20-second representative mix at actual .1575 default / .042 ducked gain during two shipped LinJie lines. Preserve exact default level .35 and calibrated source; no further speculative mix changes. Scope/provenance in `docs/evidence/0063/USER-LISTENING.md`. This is not a claim of full73s loop/day listening. Root final native/visual and independent exact-patch/product gates still pending; no merge, done status or lease handoff claimed.
