---
id: 129
title: Restore the avatar visual heading from its saved facing
status: todo
priority: high
type: bug
created: 2026-11-06
---

## Why

Character study0123 found WorldViewport initializes actorMotion.yaw to south unconditionally. A restored north-facing world state can therefore render south until the first movement, contradicting the saved state and obscuring direction comparisons. Native and experimental backends share the issue.

## Done when

- Reproduce the saved-facing versus initial rendered-yaw disagreement without changing the saved state or moving the player.
- Initialize visual motion heading from the actual restored facing, preserve continuous heading during movement and genuine map transitions, and verify all cardinal restores plus first movement.
- Relevant pure/actual-render regression checks and independent review pass before integration. No character geometry/style change belongs in this fix.

## Notes

- Centrally reserved by root after worker0123 source/runtime evidence. Unassigned pending the reviewed main visual-release gate; do not fold an unreviewed fix into0127.
- New raw evidence remains private under /private/tmp/junyan-world-private-qa/0129.
