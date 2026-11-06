---
id: 116
title: Keep an active reader out of another place at the same time
status: doing
priority: high
type: feature
created: 2026-11-06
---

## Why

The saved reading-use visit persists across map changes. Investigate whether Lin still appears at her existing town hook while this explicit visit owns her location, and fix only a reproduced inconsistency.

## Done when

- Reproduce or disprove the active-visit identity conflict against actual life consumers and saved state, before product edits.
- If reproduced, one explicit reading-use visit owns Lin presence while active; preserve restaurant retention/release, home fallback, return/replay, next-day reset and unrelated residents.
- Use a narrow pure shared presence decision consumed consistently by both life paths; no new roster, global travel framework, actor cloning, forced teleport or invented schedule.
- Cover active/inactive/corrupt/restored visit plus cross-map contexts and ordinary leave/reentry behavior, with independent source review and honest visual/motion limits.

## Notes

- Centrally reserved by root. Branch codex/0116-reading-resident-presence; worktree /private/tmp/junyan-world-reading-presence.
- Propose exact seam before editing. Likely life-context/bridge/scene/presence selector plus tests, no room map/UI/camera edits. Ports5574/5575 strict.
- Detailed plans and all new raw QA remain private under /private/tmp/junyan-world-private-qa/0116. No publication or merge before independent gates.

- Owner: Codex writer; branch `codex/0116-reading-resident-presence`; worktree `/private/tmp/junyan-world-reading-presence`; strict verification port 5574 (5575 reserved).
- Reproduced a JSON-restored active reading visit while both life paths also rendered Lin at `town.market-tender`. A shared pure exclusion now gives the valid explicit visit ownership outside the room, preserving restaurant priority and existing fallback. The room and exclusion share finite/current-clock pose validity.
- Verification: 685 rules tests and build passed; desktop/phone ordinary furniture completion, room/hall/town leaving and reentry, reload, return-before-replay and restored return passed with clean console. Browser proof declares prior breakfast acknowledgment as a saved fixture; it does not claim a full-service journey. Screenshots at both widths inspected; static frames do not establish continuous motion quality.
- Root independently reviewed the final source, focused matrix and browser proof; no actionable defect found. Keep doing until the parent integrated checks pass. Detailed plans and raw QA remain private.
