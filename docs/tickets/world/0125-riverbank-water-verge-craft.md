---
id: 125
title: Improve riverbank water and shoreline material craft
status: done
priority: high
type: feature
created: 2026-11-06
---

## Why

Independent outdoor review found earlier tree/roof gains did not materially improve the riverbank. The user requests parallel improvements across levels.

## Done when

- Inspect real riverbank and park desktop/phone gameplay at morning and night, including washing bank and crossings.
- Propose and implement two highest-impact authored water/shoreline/verge improvements with coherent scale, lighting and material transitions, avoiding uniform noisy specks or fake walkability.
- Preserve exact terrain/collider geometry, routes, deck/bridge support, props, interaction anchors, state, vocabulary and reduced motion. Shared pipeline or map changes require root coordination.
- Independent source and harsh native before/after review plus relevant tests, types/build and actual physical route checks pass. Bounded visual gains do not constitute overall AAA acceptance.

## Notes

- Centrally reserved by root. Owner: riverbank quality worker; branch codex/0125-riverbank-water-verge-craft; worktree /private/tmp/junyan-world-riverbank-water-craft; ports5594/5595 strict.
- Lease art/landscape/index.ts and ground.ts, narrow focused tests and this ticket. Other workers own actors and workshop/courtyard. Propose draw.ts/foliage or shared renderer edits before touching them.
- First send exact two improvements from actual native screenshots/source before edits. All new raw captures, traces and reports private under /private/tmp/junyan-world-private-qa/0125. No push/merge or public raw QA.

- Owner: Codex writer; branch `codex/0125-riverbank-water-verge-craft`; worktree `/private/tmp/junyan-world-riverbank-water-craft`; strict dev/preview ports 5594/5595.
- Scope approved by root after source/native inspection: `art/landscape/index.ts`, `ground.ts`, narrow regression tests and this ticket. No map data or shared API changes. Root additionally approved the existing riverbank-only `{water:[]}` hook override in `painter.ts`: late generic water otherwise replaced the authored river. Park retains its existing atmospheric water.
- Raw QA: `/private/tmp/junyan-world-private-qa/0125/`.

- Implemented bank-following deep/shallows material bands, damp shore transitions and sparse current ribbons from the unchanged river strips. Normal ribbons move subtly from injected elapsed time; reduced motion forces phase zero. Body/bank contours stay fixed.
- Root source review caught the first static-water regression; restored authored ripple motion and added normal-change/reduced-freeze/one-time-shading/mask/actual-compositor tests. `painter.ts` river-only existing water override is root-approved; foliage, lights, casts and deck shadow exclusions remain present, park untouched.
- Verification: final bounded full rules 108 files/697 tests pass; TypeScript and production build pass (existing chunk warning). Unbounded final run hit the pre-existing 5s actor-readability timeout under simultaneous browser load; bounded complete rerun passes. Earlier full suite also passed.
- Existing waiter suite 10/10 desktop/phone checks passed; required opening/service/change/journal journeys repeated after motion restoration, 2/2 pass. Both bridges keyboard-crossed and returned at desktop/phone with reduced and normal motion; all sampled real positions and segments radius-safe, console clean.
- Native evidence: `clock-before/` baseline archive af546662 and `review-final/`, 24 matched saved-state/camera/wall-clock native pairs (1440×1000, 390×844; morning/evening/night; washing/crossing/ferry + park control). Pixel gate: all six park frames identical; all 18 river differences confined to wet/shore mask with 4 CSS px raster tolerance; every deck interior unchanged. One actor frame repeated once for exact baseline performance clock, both attempts retained privately. Original inherited camera metadata/late mount attempts are superseded and retained, not acceptance evidence.
- Actual App temporal evidence: 9 original frames per normal/reduced × morning/night × desktop/phone, normal interior-water pixel change and exact reduced-motion water freeze in all four phase/width pairs. Private viewer and source/capture SHA-256 manifests accompany evidence.
- Writer implementation complete. Independent source/harsh visual gates remain with root; this ticket remains doing until those gates resolve. No claim of overall AAA quality; no push or merge.

- Main-only release127: independently accepted bounded art/source gains ported without the reading-room chapter or experimental renderer. Exact release passes645 rules tests/99files, types/build,12 desktop/phone service/save/navigation journeys and two production offline checks. Phone and desktop native affected scenes inspected. This completes the scoped repair, while broader authored-world and character quality work remains active.
