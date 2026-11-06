---
id: 110
title: Make the visible residence doorway usable by pointer
status: doing
priority: high
type: bug
created: 2026-11-06
---

## Why

Ordinary-input play found that clicking the open residence door face did not route to its working ground threshold. The doorway works from its landing, but silent elevation-dependent picking weakens discovery of the connected home areas. A pathfinding defect is not established.

## Done when

- Reproduce the actual projected-door click and distinguish art picking from an unreachable destination.
- Resolve visible doorway selection to an authored reachable threshold, or provide a restrained useful route cue, using existing movement and collision rules.
- Cover desktop and touch, ordinary ground selection and occlusion; no teleporting, fabricated walkable floor, or invisible hot spot unrelated to the rendered opening.
- Independent review and relevant rules/browser checks pass. All new raw QA stays private.

## Notes

- Owner: root. Branch: codex/0110-doorway-discovery. Worktree: /private/tmp/junyan-world-doorway-discovery. Reserved port: 5562 (strict).
- Initial evidence: private normal-input gameplay audit at frozen 13b80620. First task is diagnosis; no claim of a confirmed pathfinding bug.
