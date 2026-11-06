---
id: 129
title: Restore the avatar visual heading from its saved facing
status: doing
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

- Centrally reserved by root after worker0123 source/runtime evidence. Owner: avatar-heading writer. Dedicated branch codex/0129-restored-avatar-facing; worktree /private/tmp/junyan-world-restored-avatar-facing; ports5604/5605 strict. Main release127 has passed; this remains a separate fix and review.
- New raw evidence remains private under /private/tmp/junyan-world-private-qa/0129.

### Writer result

- Reproduced through the actual browser artwork caller: a stationary north-facing restored save rendered direction 7 (south), and an Enter-activated pad step retained the previous continuous diagonal direction after its saved position moved.
- Initial visual yaw is now absent until actual movement, so the existing actor sampler owns the cardinal facing conversion. Continuous motion keeps its measured bearing and travelled distance. A genuine map change clears that transient motion before sampling; the RAF also skips an old-map paint if a doorway dispatch commits the destination mid-frame. Discrete pad steps update bearing and distance from actual displacement, including blocked-step handling.
- Added actual-caller browser regression coverage for all four restored facings, moving/stopped diagonal heading and changing gait pixels, a subsequent keyboard-activated pad step, and the first sample after a physical doorway. Raw traces and full original phone/desktop frames are private; no production debug API was added.
- Final Node 22.23.4 verification: 645 unit/rules tests green; TypeScript/Vite build green; 22 desktop/phone browser checks green, including all 12 new heading cases and the full opening → four served customers → change → journal → next day journey. Full original phone/desktop screenshots inspected; console/page-error assertions clean. The existing bundle-size warning remains. Writer complete; independent review remains pending before integration, so status stays doing.
