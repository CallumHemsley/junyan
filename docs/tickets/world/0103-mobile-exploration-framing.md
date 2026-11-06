---
id: 103
title: Improve mobile exploration framing
status: doing
priority: high
type: feature
created: 2026-11-06
---

## Why

Independent comparisons repeatedly find that phone views cut off the useful scene while a large foreground facade dominates. Added texture and shadow detail do not solve the composition.

## Done when

- Actual phone rooftop and riverbank exploration keep the player, nearby routes and usable objects readable, with useful scene coverage and room above controls.
- Camera movement stays stable, world picking matches the exact production camera, existing doors/stairs and interaction-panel framing work, and desktop composition does not regress.
- Keyboard, pointer and touch journeys, reduced motion, relevant camera/route checks and private before/after views support the change. A separate critic reports remaining defects honestly.

## Notes

- Centrally reserved after 0102. Owner GPT-6.1 Sol High, branch `codex/0103-camera-readability`, worktree `/private/tmp/junyan-world-camera-readability`, strict ports 5544/5545.
- Inspect actual scenes and all camera callers before choosing a small coherent framing policy. Do not guess a crop or fix one screenshot with an arbitrary screen offset; preserve a clear project/unproject/picking contract.
- Root owns integration; 0101/0102 own reading-room features and shared chapter wiring. Serialize any overlapping viewport edits with root. No map navigation, schema, actor, lighting, dependency or save edits in this ticket.
- Keep new raw captures, traces, reports and timing data private. Source and ordinary tests may be published only after cross-review.
