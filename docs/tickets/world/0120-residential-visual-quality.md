---
id: 120
title: Review and improve residential and rooftop visual craft
status: done
priority: high
type: feature
created: 2026-11-06
---

## Why

The user wants multiple levels reviewed and improved in parallel. Homes, circulation and rooftop should feel materially authored and inhabited at actual play scale, with coherent physical support.

## Done when

- Review actual hall, stairs, apartment and rooftop at desktop/phone, including elevated movement and actual furniture/garden states.
- Implement the two highest-impact compatible visual improvements using purposeful materials, value/light hierarchy and grounded construction; keep identities and real support geometry coherent.
- Preserve stair heights/treads, furniture inventory/placement/collision, garden projection, doors, saves, Mandarin DOM text and reduced motion. No fake occupancy or decorative geometry that implies a false route.
- Independent source and harsh actual before/after review verify changes; relevant rules, navigation and browser checks pass without claiming AAA from local gains.

## Notes

- Owner: Codex residential quality worker. Port 5580 (dev), 5581 (preview). Review underway 2026-11-06.
- Centrally reserved by root. Branch codex/0120-residential-visual-quality; worktree /private/tmp/junyan-world-residential-quality.
- Lease art/residential and art/rooftop only initially. Propose shared lighting, map, actor or elevation changes before editing. Other workers own restaurant/town/landscape; root owns workshop/courtyard/reading integration. Ports5580/5581 strict.
- All detailed plans, new native captures, traces and reports stay private under /private/tmp/junyan-world-private-qa/0120; no public raw QA or merges before independent gates.

- Candidate: timber uses continuous staggered boards; residential local ground now paints floors before supported mats/props. Only zero-height plane paint bypasses cube subdivision; solid/tread behavior is unchanged. Removed permanent sunlight confetti rather than adding baked light. Roof foliage uses joined broad facets and paving has quieter mineral values. No maps, elevation, actors, schemas, gameplay or dependencies changed.
- Actual native baseline/candidate reviewed at 1440×1000 and 390×844: hall, lower stairs, home landing, sparse/furnished apartment and initial/mature roof. Fixtures validated through save plus feature schemas; matching records retain seed42 and 42000ms life clock. Raw evidence remains private under the allocated QA directory.
- Independent visual/source acceptance and final verification are pending. Local material gains do not resolve the wider cutaway composition / blank-wall / renderer quality ceiling.
- Verification: 685/685 Vitest tests pass (`--maxWorkers=2`), production build passes, native full-world physical door/stair journey passes on desktop and phone (2/2, 5.5 minutes), 14 matching native comparison fixtures have no console errors. First unconstrained suite hit an existing character-readability timeout; its focused retry and final complete suite passed. Independent acceptance remains outstanding.
- Independent round016 found a stair-well floor overrun caused by splitting elevated floors and ground props. Fixed by retaining their original joint elevation sort for residential-stairs only; flat rooms keep floor-before-mat ordering. The actual painter boundary assertion failed with dark well colour before the fix and passes with the pale landing colour. Focused art/elevation/surface/furniture checks pass23/23; build passes. Six native rechecks have matching validated states: four stair images are byte-identical to baseline; two furnished-apartment images are byte-identical to the accepted candidate. Fresh independent visual recheck remains pending.

- Main-only release127: independently accepted bounded art/source gains ported without the reading-room chapter or experimental renderer. Exact release passes645 rules tests/99files, types/build,12 desktop/phone service/save/navigation journeys and two production offline checks. Phone and desktop native affected scenes inspected. This completes the scoped repair, while broader authored-world and character quality work remains active.
