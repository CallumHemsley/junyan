---
id: 96
title: Verify world overlays and keyboard journeys
status: doing
priority: high
type: chore
created: 2026-11-06
---

## Why

World travel replaces table dialogs and location tabs. Preserve the existing interface, focus and service assertions through actual physical input.

## Done when

The seven assigned browser specs use current world controls, retain their gameplay and accessibility assertions, and pass on desktop and phone. Cross-review resolves defects before integration. Shared journey helpers remain owned by world/0095.

## Notes

- Reserved centrally after world/0095; owner GPT-6.1 Sol medium, branch `codex/0096-world-ui-browser-tests`, worktree `/private/tmp/junyan-world-ui-tests`, strict development port 5520 and preview port 5521.
- Exclusive paths: `e2e/calm-ui.spec.ts`, `startup-focus.spec.ts`, `overlay-focus.spec.ts`, `overnight-keyboard.spec.ts`, `learning-help.spec.ts`, `scene-scheduling.spec.ts`, `cumulative-earnings.spec.ts`, and this ticket. No production source, shared helpers, dependency or configuration edits.
- Base: world/0095 checkpoint `1826f16c423a37b672b0678c4fec08a6ba26a3a1`. New generated artifacts stay outside the repository.
- Migrated the seven specs to physical world anchors, contextual service controls and journal/tray pockets. Keyboard service uses held arrow input and Tab/Enter; game/save reads are observational. Removed legacy gameplay dispatch setup from normal receipt, food-card and day-summary journeys; database fault fixtures retain their explicit fault-test identity.
- Preserved lookup sharing and focus restoration, 44px controls, small-screen fit, receipt totals, two-day cumulative earnings, persistence/fault recovery, keyboard cancellation/modifiers, reduced-motion idle and offscreen suspension assertions. Removed HUD controls are checked through current contextual controls, pockets, summaries and authoritative saved state.
- Intermediate verification reproduced two production regressions for the coordinator: idle reduced-motion rendering still painted at 30Hz, and collapsed dialogue-history words passed `getClientRects()` yet could not receive focus, trapping reverse Tab at word-card close. Root owns production fixes. Raw QA is private under `/private/tmp/junyan-world-private-qa/ui-tests`, never repository evidence.
- Coordinator fixes through `7808f16` are present locally, with lead helper through `a8a7efb`. The exact rendering/source-word regression batch passed 12/12 on desktop/phone, including development and production nested-focus checks. Full all-enabled verification is running across 76 cases; this checkpoint does not claim ticket completion or integration acceptance.
