---
id: 68
title: Build the recurring neighbourhood cats slice
status: doing
priority: high
type: feature
created: 2026-11-05
---

## Why

Let the player meet individual cats, infer Mandarin clues from their behaviour, earn trust, and reunite a resident with her companion. The courtyard extends the apartment-building ensemble while preserving the hospital and breakfast restaurant.

## Done when

- [ ] The courtyard shows a white cat under a recognisable bicycle and a black cat beside a bench, with distinct silhouettes and contextual DOM targets.
- [ ] Either cat can be inspected first. Distinct patient actions produce visible trust consequences. Wrong-cat and impatient actions recover gently without hunger, punishment or quiz gates.
- [ ] The white cat follows an observable route to a resident reunion. `gifts(state)` yields `cats.cushion` only after earned completion and repeated actions cannot duplicate trust or rewards.
- [ ] Three bounded repeat encounters use deterministic restaurant-day routines/weather. Active encounter facts survive reload and cannot reroll or dead-end across a day change.
- [ ] `initialState`, `reduce`, `validate`, `gifts`, default React view, `words` and `lines` match the published central contract. Pure rules cover invalid actions/saves, repeated actions, story prerequisites and day boundaries.
- [ ] Every line uses schema-validated presegmented Mandarin, tappable real DOM text, accurate offline voice clips and replay. Lookup and successful recovery reach the shared journal. Pinyin stays tap-only; no English returns after opening.
- [ ] Pixel/isometric art matches current renderer patterns. Controls support touch and keyboard, visible focus, 44px targets and reduced motion. Hidden tabs suspend animation. No placeholders, silent dialogue or missing assets remain.
- [ ] Build and rule tests pass. The existing hospital to three customers to change to journal journey remains green. Cats completion, wrong-cat recovery, repeats, shared navigation, apartment gift, save/reload/migration, offline audio and clean console have actual evidence.
- [ ] Phone and desktop screenshots are inspected and actual voices listened to. Independent reviewer reports defects without edits. Writer resolves findings; material fixes receive fresh review.
- [ ] A PR and verification evidence reach the central apartment lead. Coordinated merge and post-merge checks complete before status becomes done.

## Dependencies and ownership

Depends on 0065 contract. Integrated completion depends on 0066 and existing shared-file lease handoffs. Lead writes the initial plan and ticket before the implementation owner takes exclusive writes.

Allowed files: `src/features/cats/**`, `public/audio/cats/**`, `e2e/cats.spec.ts`, `docs/plans/neighbourhood-cats.md`, `evidence/0068/**`, this ticket. No shared schemas, App, save, content registry, renderer, dependency or lockfile edits. Request central integration changes through the lead.

Branch `codex/0068-neighbourhood-cats`. Cloud checkout `/workspace/cats-0068`. Dev port `5468`, preview port `5568`, both strict with server reuse disabled. Existing Playwright configuration accepts `JUNYAN_DEV_PORT` and `JUNYAN_PREVIEW_PORT`. Use only GitHub connector operations and git push. No gh, local-device work or manual deployment.

## Notes

Detailed design: [[plans/neighbourhood-cats]]. Estimated effort: 1–2 engineering days plus review and voice access. The human granted merge authority after the initial coordination ledger; the central apartment lead alone serializes landing. Draft-only language in the initial ticket is superseded. Quality and real evidence remain conditions of merge.

Planning workers `/root/cats_design_a` and `/root/cats_design_b` used requested GPT-6.1 Sol medium with read-only cloud access. Implementation owner will record worker ID, commits, checks and remaining blockers here. Do not mark missing checks passed or status done on a feature-only test page.

Known dependency: Qwen synthesis imports Apple MLX. Linux voice generation and listening need verification, and the shared journal/fresh-word view prop needs central agreement.
