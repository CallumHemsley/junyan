---
id: 24
title: Design warmer characters from 3d.internet.dev references
status: done
priority: high
type: feature
created: 2026-11-01
---

## Why

Callum's first public playtest requests reliable first-dialogue audio, better character design and correct tray occlusion, plus a usability break review.

## Done when

- Requested behavior is verified against a repeatable reproduction or inspected render, with appropriate regression coverage.
- Applicable rules/browser checks pass; visual changes are inspected at phone and desktop sizes.
- Evidence, limitations and review findings are recorded before integration/publication.

## Notes

- Design writer: Sol 6.1 high, branch `t3/character-art-direction`, worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-1ac9f2b2`. Offscreen renderer verification, no Vite server or port used. Production renderer belongs to ticket 0022's writer.

- Reserved centrally by parent on `codex/0018-character-voices`; writer must record own branch, worktree and strict port.
- Owner: Sol 6.1 high character designer.
- User asks inspect https://3d.internet.dev/, redesign characters to be more personable and consider an autonomous background chef. Produce concrete direction and reusable render candidate outside production renderer ownership; coordinate with visual orchestrator for Sol medium integration. Keep looping on visual quality, actual engine required.
- Design handoff completed 2026-11-01: [[design/character-direction]] contains original geometry, exact proportions/palette/local axes, primitive API, tray attachment, chef prop contact, licensing checks and integration constraints. Parent inspected and accepted V3; production implementation and integrated QA remain ticket 0022's responsibility.
- Shared ignored candidates/evidence: `/Users/callumhemsley/Personal/junyan/output/playwright/character-design/`, mirrored in this worktree. Includes `candidate-geometry.mjs`, native/3× eight-direction loaded/empty tray sheets, seated cast, full restaurant phone/desktop scale outputs and chef contact sequence.
- Verified using the actual Pixel Plays rasterizer in offscreen Node; repeat-frame byte equality and exactly two chef hands at five timestamps pass. No browser/audio playback, dependencies, game rules, schema or production renderer edits. No full-game tests are claimed for this documentation-only change.
- Learned: tiny eyes need an explicit forward cheek plane and open forehead; distinct hair silhouettes outperform added detail; keep the authored sage/blue/ochre/plum identities; animated limbs must replace their default pose inside the same arm loop, not overlay it. Final integration must retain existing eating/served arm intent.
