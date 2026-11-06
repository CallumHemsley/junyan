---
id: 96
title: Verify world overlays and keyboard journeys
status: done
priority: high
type: chore
created: 2026-11-06
---

## Why

World travel replaces table dialogs and location tabs. Preserve the existing interface, focus and service assertions through actual physical input.

## Done when

The seven assigned browser specs use current world controls, retain their gameplay and accessibility assertions, and pass on desktop and phone. Cross-review resolves defects before integration. Shared journey helpers remain owned by world/0095.

## Notes

- Owner: Codex garden/UI worker. Branch `codex/0096-world-ui-browser-tests`, worktree `/private/tmp/junyan-world-ui-tests`, strict development port 5520 and preview port 5521.
- Exclusive source: `e2e/calm-ui.spec.ts`, `startup-focus.spec.ts`, `overlay-focus.spec.ts`, `overnight-keyboard.spec.ts`, `learning-help.spec.ts`, `scene-scheduling.spec.ts`, `cumulative-earnings.spec.ts`, and this ticket. Shared helpers and production fixes stayed with their owners.
- Normal play now uses physical world anchors, contextual controls and journal/tray pockets with read-only state observation. Keyboard service uses Tab, held arrows and Enter. Explicit database-fault fixtures retain fault identity; the stale native read is released only after the real new-word lookup. Preserved focus sharing/relookup, receipts, lifetime earnings, offline help/audio, 44px targets, viewport fit, persistence and strict idle/offscreen rendering checks.
- Verification: all-enabled desktop/phone run on `3785cc8` passed 74/76; only the two animated-to-reduced cases failed because equivalent life metadata had different field order after restoration. Coordinator fix `7863d78` canonicalizes that comparison and adds a real create/restore/clock regression. All four strict scheduling cases then passed (4/4, 26.5s), without tolerance or initialization waits. Combined coverage completes all 76 requested cases. Production preview rebuild passed; desktop/phone screenshots inspected; console assertions clean. Raw QA remains exclusively in `/private/tmp/junyan-world-private-qa/ui-tests`, with none published or committed.
- Cross-review: initial migration `80dae81` passed independent Sol High review; coordinator independently reviewed follow-up `3785cc8` and accepted final coverage. Learned: restored opener focus requires Tab back to the world before arrow movement, summary wrapping must include current progression controls, and physical travel must not let a delayed-read fixture finish before its intended race.
