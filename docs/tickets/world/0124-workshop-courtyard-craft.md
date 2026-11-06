---
id: 124
title: Improve workshop and courtyard material and composition quality
status: done
priority: high
type: feature
created: 2026-11-06
---

## Why

User requests parallel area reviews and materially higher game craft after reporting the graphics regression.

## Done when

Inspect real desktop and phone gameplay in workshop and courtyard, including morning/night and reduced motion. Propose and implement two highest-impact compatible material/light/construction improvements in art/workshop and art/courtyard. Preserve map geometry, interaction locations, supported props, feature states, vocabulary and camera. No decorative noise or fake occupancy; no shared renderer edits without root agreement.

Independent source and harsh native visual review required. Keep every new capture, trace, experiment report and timing file private under /private/tmp/junyan-world-private-qa/0124. Relevant rules, types/build and actual interaction checks must pass before integration. Bounded gains are not overall AAA acceptance.

## Notes

- Centrally reserved by root. One writer per dedicated branch/worktree. No merges or publishing raw QA.
- Branch codex/0124-workshop-courtyard-craft; worktree /private/tmp/junyan-world-workshop-courtyard-craft; ports 5592/5593, strict.

- Owner: workshop/courtyard writer. Candidate implements warm staggered workshop plank joints, bench apron/edge construction, removes permanent floor light patches, and gives existing courtyard house roofs muted courses/ridge/eaves. Scope stays within leased art and focused tests; no map, actor, camera, feature or shared-renderer edits.
- Node 22 full rules (108 files / 696 tests), TypeScript, Vite build and 10 desktop/phone opening/service/change/journal/input/save browser cases pass. 12 actual lamp/toy/cat interaction cases across morning/night and desktop/phone pass, browser errors 0. 20 native before/final fixture records match. Independent harsh visual/source gates pending; private QA remains under 0124.

- Main-only release127: independently accepted bounded art/source gains ported without the reading-room chapter or experimental renderer. Exact release passes645 rules tests/99files, types/build,12 desktop/phone service/save/navigation journeys and two production offline checks. Phone and desktop native affected scenes inspected. This completes the scoped repair, while broader authored-world and character quality work remains active.
