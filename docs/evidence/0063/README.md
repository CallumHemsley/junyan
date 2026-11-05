# 0063 evidence and append-only decisions

## 2026-11-05 — starting at 66ac123

Owner: Codex cloud agent 0063. Branch `codex/0063-restaurant-background-sounds`, checkout `/workspace/junyan-0063`, strict ports 5414/5415.

Read AGENTS, ticket workflow, assigned ticket, accepted decisions 0001–0004, build recommendation, design system/tokens/mockup brief, foreground playback and offline build code. No bundled pstack found under /workspace or /opt; using the supplied harness-adapted poteto/autopilot discipline.

Current surface has foreground speech only. The offline plugin precaches every dist file and uses scope-relative URLs; new public assets need no cache/schema/dependency change. Shared App.tsx/styles/playback lease belongs to 0061 and is untouched.

Compared shapes: a WebAudio scheduler offers randomized separate events but introduces context/timer ownership; one long native looping media element preserves offline decoding and one playback owner with less state. Choose one 73-second original prepared mix with irregular event spacing. Native codec loop boundary is not guaranteed sample-exact; quiet matched endpoints reduce the seam, which still needs listening verification.

State shape: `{restaurant, visible, unlocked, muted, level, speaking}`. Playback intent requires restaurant + visible + user gesture + nonzero unmuted level. A pending/playing flag prevents duplicate play calls; a generation invalidates stale promise settlements; policy/load failure blocks automatic retries until a new gesture. Speech ducking scales ambience only and never touches foreground playback.

Original procedural non-speech sound design will use filtered noise for quiet steam/preparation, inharmonic decays for ceramic cup contacts and modulated noise/bubbles for pouring. No samples, copied music, external service, speech, dependencies or schema changes. These are intended auditory metaphors, not claimed field recordings. Subjective resemblance and mix approval remain unverified: this agent cannot perceive audio, and must not substitute waveform checks for listening.

## 2026-11-05 — standalone checkpoint

Original Ogg is 339,123 bytes, 73 seconds mono 24 kHz. Implemented controller and six meaningful lifecycle/ownership tests. `node_modules/.bin/vitest run`: 12 files / 175 tests pass, including 13 unchanged foreground playback tests. First TypeScript run caught an overly broad fixture preload string; fixed to literal type. `pnpm_config_verify_deps_before_run=false pnpm build`: PASS (TypeScript + Vite; pre-existing third-party Zod annotation warnings). Plain pnpm initially tried automatic reinstallation and stopped at its esbuild script approval gate; frozen install populated dependencies, then per-command pnpm dependency-check override allowed scripts. No scripts approved; no dependency/lockfile/config change retained.

App.tsx, shared styles, and playback.ts untouched. Ambience is not yet audible in the game; controls, persisted preference, visibility/page lifecycle wiring and real speech ducking integration await root's 0061 lease release. No listening, screenshots or game journey claimed at this checkpoint. Ticket remains doing; not ready to merge.

## 2026-11-05 — actual browser and asset iteration

The first optional regression launch failed before gameplay because Playwright's bundled ffmpeg was absent; disabled optional video capture in the ticket-local config and used system Chromium with `--mute-audio`. The initial ticket-local config also needed explicit repository cwd. No shared config changed. Final existing journey/audio/offline run: **23 passed, 2 skipped**, desktop and phone. The two expired-gesture policy tests skip under the repository's existing browser activation condition; they are not claimed as passes. The journey used actual DOM clicks/keyboard through the complete opening, wrong bedside food/recovery, all four restaurant customers, change, journal and day progression; save/reload tests passed. Deterministic test hooks provide seeded data/skip only in auxiliary regression scenarios; this is automated play, not a human playtest or subjective listening.

Command: `pnpm_config_verify_deps_before_run=false JUNYAN_DEV_PORT=5414 JUNYAN_PREVIEW_PORT=5415 pnpm exec playwright test --config docs/evidence/0063/playwright.config.ts e2e/waiter.spec.ts e2e/audio.spec.ts e2e/offline.spec.ts`. Portable test lines in `journey-results.txt`. Full suite result in `unit-results.txt`; production build in `build-results.txt`.

Standalone real-media driver first exposed an actual encoding concern: Ogg's native metadata (also after canplaythrough) reported **66.770208 seconds** offline for a source and ffmpeg decode of **73 seconds**, despite fetching all 339,123 bytes. Compared changing the global service worker's Range handling against changing this ticket's encoding. Choose the narrower asset-only MP3 fix: 48 kbit/s mono with duration header, **438,572 bytes**, native offline duration **73 seconds**. Removed trial Ogg. This supersedes the initial Ogg decision above and avoids uncertain loop timing without touching leased/shared files. The 99,449-byte increase is justified by actual browser evidence.

`node docs/evidence/0063/browser-check.mjs`: **19 checks PASS** with actual MP3 decoding/playback after a real browser gesture, native pause/resume across supplied visibility/restaurant/mute/zero-level states, one reused element/five deliberate starts, native speech-state gain .042, disposal, subpath production service-worker offline fetch/decode, reduced-motion baseline overflow checks and no console/page errors. See `browser-results.json`. The driver supplies lifecycle and speech flags directly: it proves the controller boundary, NOT in-game integration. An early driver attempted to place its probe behind the hospital modal and could not click it; corrected to an isolated same-origin probe document, without altering app UI.

Inspected actual captured desktop and phone restaurant and journal images, and both reduced-motion restaurant images in `screenshots/`: coherent existing neutral palette and readable DOM overlays, no horizontal overflow or clipped primary control. These are explicitly BASELINE images: they show no ambience control or integrated soundscape. Phone journal scrolls inside its dialog, as expected. Existing waiter journey asserts a clean console. No subjective audio capture/listening, human approval or independent patch/product review has occurred. The original final MP3 itself is the reviewable audio artifact, not a claimed recorded listening session.

Pending integration contract: `INTEGRATION.md`. Root still owns releasing 0061's App/styles/playback lease. Required visible controls, saved ambience preferences, document lifecycle wiring, real speech ownership ducking and ordinary-session mix audition remain blocking. No merge performed.

## 2026-11-05 — product-quality gate (checkpoint is BLOCKED)

The actual baseline opening and a complete four-customer day were played automatically on phone and desktop through DOM actions, including change/journal/persistence. Normal restaurant/journal, reduced-motion restaurant and retained opening/request screenshots were actually inspected. This remains a short vertical slice, not a release-quality Steam-game assessment; enjoyment/retention claims would be hypotheses without human playtests.

| Scoped dimension | Current checkpoint assessment | What prevents 10 |
| --- | --- | --- |
| Naturalness / presentation | Not scored: relevant, but auditory perception is unavailable | No actual listening of synthesized textures, seams, speech balance or repetition. A numerical score would fabricate evidence. |
| Immersion | 0/10 for the currently exposed change | Asset/controller are standalone; the actual restaurant experience has no new audible layer yet. Future benefit is untested. |
| Usability | 0/10 for the currently exposed change | No in-game ambience controls or saved ambience preference yet; shared-file lease is still held. Controller boundary mechanics passed real-media tests. |
| Contribution to fun / interest | 0/10 for the currently exposed change | Nothing is exposed to ordinary gameplay yet; potential atmosphere is a hypothesis until integration and listening/playtesting. |

These intentionally incomplete-checkpoint scores are not ratings of an auditioned final mix, and are not independent approval. Applicable dimensions cannot honestly clear the requested 8/10 gate yet. No N/A used: all four dimensions matter to the finished feature. Concrete blockers are integration/controls/preferences and inability to evaluate subjective auditory quality here; there are no known remaining failures in the independently exercised controller boundary. Ogg timing defect was fixed by asset encoding. No new broader product issue is asserted from this scoped baseline review. Root must arrange exact-patch and independent product review; Callum's ordinary-session listening review remains required. Do not merge this checkpoint.

Final focused controller/foreground regression: 19/19 PASS (`final-focused-results.txt`); final `pnpm build` PASS after removing trial Ogg. Final portable native/offline driver: 19/19 PASS (`browser-results.json`); MP3 duration exactly 73 seconds. Final source change after full suite/journey was the asset extension/encoding only; no rules/UI/playback behavior changed. Essential compact captures live under `screenshots/`, audio under `public/audio/ambience/breakfast.mp3`; no video or recorded listening session is claimed.

## 2026-11-05 — integration proposal prepared, lease still intact

Fetched origin/main at **85a0120** read-only for context. Added `integration-proposal.patch` as an **unapplied** concrete App/optional speech-observer/scoped controls/preferences integration proposal, with explicit StrictMode/document lifecycle handling and Chinese/44px controls. Static typecheck of scratch main + proposal passed; proposed preference/speech ownership plus existing foreground playback tests: **15/15 PASS**, captured in `proposal-test-results.txt`. No App.tsx, style.css or playback.ts production changes applied in this branch. This does not authorize integration or replace post-integration gameplay/quality checks; refresh against 0061's exact accepted patch once root releases the lease.

`LISTENING.md` supplies actual palette timeline, intended gains, comparison questions and the precise subjective limitation. Realistic café sound has NOT been established. Low default amplitude and synthesized tonal cup/pour character are explicit listening risks, not waived defects or claimed quality passes. Root can offer the committed MP3 for the user's audible comparison. The checkpoint remains BLOCKED from READY and merge.
