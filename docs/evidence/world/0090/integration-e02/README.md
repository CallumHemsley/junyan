# Actual e02 production UI audit

Head e02a747. Server `http://127.0.0.1:5497/junyan/`. The shared assembly was read only and was not rebuilt. Tests and evidence live in the owned 0090 worktree. The browser context is disposable and separate from other reviewers.

Run `node node_modules/@playwright/test/cli.js test --config docs/evidence/world/0090/integration-e02/audit.config.ts`. The test completes the normal hospital opening, dismisses help, and walks from the restaurant entrance to table 3 using pointer ground coordinates. It reads saved state only to calculate coordinates. It uses visible floor waypoints to reach the kitchen. No debug hooks, state setters, declared-arrival fixtures or direct save writes are used.

The ordinary journey passed in 27.1 seconds with no page errors. Table 3 opens its current order. Word lookup opens the existing card; Escape closes that card, preserves the interaction and returns token focus. Journal and tray modals open. Kitchen pickup increments the real tray. At 390×664 the player, selected table and kitchen counter are visibly clear above the contextual panel.

## Confirmed defects

1. Footer action foreground is almost invisible. In `src/App.tsx` the service and carry controls use `.primary`. `src/style.css:295` gives that class a light foreground. `src/world/ui/contextual.css:31` overrides its background with `surface-control` but leaves that foreground. `390-table-open.png` and `390-kitchen-open.png` show the resulting pale arrow. The owned fix is commit 9116478. It is not present in this e02 assembly. Separate before/after harness evidence reproduces the same CSS cascade and verifies the fix.
2. At 320×320 the kitchen panel is 128px tall and its central scroll viewport is only 16px tall for 496px of content. `320-short-kitchen.png` and `320-short-pickup-attempt.png` show food art clipped into a strip with labels absent. A pointer pickup can still succeed after automated scrolling, so this is a visual and touch usability defect rather than a failed reducer callback. The effective visible target height is smaller than 44px. The narrow-width rule at the end of contextual.css overrides the short-landscape height allowance. Shared world.css also imposes a 440px minimum world height on the 320px viewport; the page scrolls and the actor can be clipped above the viewport. These need a coordinated short-screen layout fix.

The test runner passes because it verifies the ordinary actions and records the short defect rather than asserting visual acceptance. This is not whole-game completion. Travel to other maps and feature behavior remain under the other reviewers' scope.

## Audit setup corrections

The first run used an exact accessible-name selector for `开门迎客` that excluded the decorative arrow from the production name. The audit now uses its label as a regular expression. A subsequent run read the save before the first world clock/save cycle; the audit now waits for that ordinary persistence cycle. The first kitchen click targeted an offscreen point; the final audit uses visible intermediate floor waypoints. None of these setup failures are recorded as product defects.
