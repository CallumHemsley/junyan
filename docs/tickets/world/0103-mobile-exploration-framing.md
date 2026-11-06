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
- The retained-scale `explorationCamera` wrapper keeps the explicit-scale camera and projection inverse unchanged, and reserves a bounded portrait ground window above controls. Production rendering and pointer journeys use the same wrapper; portrait exploration retains scale 11 and desktop framing is unchanged.
- Independent review found a useful riverbank route-context improvement at retained scale. Larger zoom variants lost context and were rejected. The rooftop still wastes height on its facade and crowds the player with foliage; this ticket remains doing for that unresolved composition.
- Focused checks cover stable follow, every stair support with phone panel reserves, inverse picking and desktop framing. Actual keyboard, canvas pointer/touch travel and rooftop panel reopen checks have passing runs. Stills establish neither movement quality nor fun; reading-room integration and cross-review remain root-owned.
- Integration returned a small-room regression: universal bounded follow left empty cutaway above a room that already fit. Fitting projected ground now keeps the original full-height camera; an open panel can still require bounded local follow. This uses map dimensions, not a map ID, and retains the outdoor policy.
