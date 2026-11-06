---
id: 127
title: Release independently accepted world visual regressions to main
status: done
priority: high
type: bug
created: 2026-11-06
---

## Why

Main still contains the shared flat-face shading and sparse restaurant regressions. Reviewed visual repairs should reach the existing connected game while deeper character/prop experiments and the new reading chapter continue separately.

## Done when

- Prepare an isolated branch from actual current main containing only independently accepted compatible world-art repairs. Preserve the existing connected game, saves and Mandarin learning loop.
- Resolve any porting differences explicitly; cross-review the exact release diff, run full rules/types/build and desktop/phone opening/service/change/journal journeys, inspect native affected areas and verify actual production/offline output.
- Merge through the GitHub connector only after all findings resolve and checks pass. The release makes no overall AAA completion claim; the broader goal remains active.

## Notes

- Owner: root. Branch codex/0127-main-visual-regression-release; worktree /private/tmp/junyan-world-main-visual-release; strict ports5598/5599.
- Include only earned stable fixes; no private experimental renderer/sampler or new reading-room feature. Root will serialize any shared painter changes after0125 freeze/review.
- All new raw QA stays private under /private/tmp/junyan-world-private-qa/0127. Ordinary source, tests and concise validation summaries may be published.

- Ported accepted103 portrait exploration camera and104 player garment contrast, then118 restaurant,119 outdoor,120 residential,121 shared shader,122 bounded actor shading,124 workshop/courtyard and125 river materials. Main predates the camera helper/readability test: retained the new intentional test and camera checks, added explorationCamera, preserved main50 exit-cue handlers, and selected restaurant camera without reading-room presentationFrame dependencies. No experimental renderer/actor/bed sampler or reading-room feature is included. Exact release diff requires fresh independent review and own verification.

- Initial port verification correctly failed because restaurantCamera also depends on generic frameCamera. Added the accepted pure frame-fitting helper and types, without reading-room presentation-area wiring. Initial failed logs remain private; exact repaired source needs new independent verification.

- All exact-release gates passed:645 rules/99files, TypeScript/Vitebuild,12 desktop/phone opening/four-customer/change/journal/progression/movement/save/physical-door/stair cases,2 actual production offline/cache checks. Independent cross-review of repaired source1e0e3eff has no remaining finding. Forty native fixtures captured,20 original phone/desktop day/night images across all10maps inspected. Raw evidence private. Prepared for GitHub review/merge; deeper visual goal and0123/0126/0128 studies remain active.

- Release prepared inPR51 after all independent and runtime gates passed. The final release change completes this scoped repair; the broader graphics/world goal remains active. No new raw QA was published.
