---
id: 22
title: Improve waiter proportions and facing-relative carried objects
status: doing
priority: high
type: bug
created: 2026-11-01
---

## Why

Callum's first public playtest requests reliable first-dialogue audio, better character design and correct tray occlusion, plus a usability break review.

## Done when

- Requested behavior is verified against a repeatable reproduction or inspected render, with appropriate regression coverage.
- Applicable rules/browser checks pass; visual changes are inspected at phone and desktop sizes.
- Evidence, limitations and review findings are recorded before integration/publication.

## Notes

- Implementation owner: Sol 6.1 medium, sole production writer. Branch `t3/facing-relative-waiter-tray`, isolated worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-884fae7a`, base `536f9d9`. Dev port `5182`, preview `5186`, both strict; local-only work, no push/PR/deploy.
- Root cause: waiter body rotated while tray and food used fixed world coordinates. Hands, apron, box tray, rim and six food slots now share the figure's forward/side/up transform. Original Pixel Plays sphere/capsule/box/shadow/depth rasterization remains; partial rear occlusion is real depth buffering, never a whole-tray visibility switch.
- Consumed the final ticket 0024 V3 `candidate-geometry.mjs` from the parent's `output/playwright/character-design/`, accepted by parent and Astra. Compact connected carrying anatomy, warm forward-only faces, Lin's high bun, student's long ponytail/backpack, office tie and elder's silver side-part retain authored sage/blue/ochre/plum identities. Preserved ordered versus checkout/served arm intent through a common arm loop; greeting yields to eating. Optional chef deliberately omitted; final two-hand override API retained and regression-tested, not overlaid extra arms.
- Final checks on 2026-11-01: `pnpm test` passed all 45 tests (10 renderer); `pnpm build` passed. `pnpm exec playwright test --config src/scene/playwright.visual.config.ts` rebuilt production and passed all eight desktop/phone checks: serve four regulars, change, journal/progression, walking, saved vocabulary, playable empty/full trays, zero overflow and reduced-motion full-canvas freeze across 45 frames. Console/page-error assertions passed. Only existing upstream Zod/Rollup annotation warnings appeared.
- Geometry regressions cover rigid rotation across eight yaws, connected elbows/hands supporting the tray, six distinct food slots, compact proportions, front-only eyes, ordered versus eating/served hands without food differences, exactly two hands under pose overrides, partial rear-food depth occlusion, supplied-time walking and independent renderer instances. Reduced motion remains controlled by the existing scene wrapper; Chinese dialogue/labels remain DOM text.
- Final ignored evidence directory: `/Users/callumhemsley/.t3/worktrees/junyan/t3-884fae7a/output/playwright/0022-v3-integrated/`. Inspected `waiter-directions.png` (32 actual-engine frames: eight directions times empty/full/two walking phases), `cast-contact-sheet.png` (five characters standing/seated front/back), and `phone-playable-{empty,full}.png` / `desktop-playable-{empty,full}.png` at natural playable scale. Reproduce engine sheets with `node src/scene/render-evidence.mjs output/playwright/0022-v3-integrated`.
- Silent actual-app demo: `waiter-loaded-walk-silent.mp4` in that evidence directory, 15.44 seconds at 1200x1000, showing six-item tray movement away/toward and all four seated regulars. `ffprobe` confirms video only, no audio stream; metadata and clean-console result are in `demo-verification.json`. Reproduce with the worktree's strict dev server running: `SCENE_DEMO_URL=http://127.0.0.1:5182 node src/scene/record-demo.mjs` (requires local ffmpeg/ffprobe). Setup uses legal test-hook actions; recorded movement uses actual canvas clicks and normal scene interpolation.
- Every capture/test Chromium launch explicitly includes `--mute-audio`; no global/system volume changes or weakened real audio assertions. Scoped checked-in Playwright config starts only strict ports 5182/5186, with explicit worktree cwd. Shared configuration is untouched. Offline test excluded because its source hardcodes another worktree's preview port; no claim of offline validation.
- Integration baseline remains `536f9d9`; parent reports `cb01704` containing unrelated UI/save work, not merged here. Scope contains renderer, declarations, scene tests/helpers and this ticket only. No App/audio/UI/schema/dependency/lockfile/launch configuration writes. First-pass evidence remains separately under `output/playwright/0022-first-pass/` for comparison.
- Verification complete and scoped commit ready for parent review/cherry-pick; status remains **doing** until independent integrated-renderer review is accepted and any resulting fixes are resolved. V3 direction acceptance is not represented as completed production cross-review. No push/PR/merge/deploy.
