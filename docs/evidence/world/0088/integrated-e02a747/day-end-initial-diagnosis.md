# Initial day-end navigation failures: reviewer input errors

Exact application head: `e02a747c3b4d4fc6a476ea744ecb6bdc1a738132`.
Independent read-only review of retained initial JSON, Playwright traces and screenshots. No application change, browser-state seeding or new browser run.

These two initial failures do **not** establish a production movement/path-worker defect. The helper projected a ground coordinate without verifying the actual hit target. DOM controls occupied both selected screen points.

| Run | Trace final ordinary mouse click | Inspected evidence | Explanation |
| --- | --- | --- | --- |
| Desktop | `mehz@2322`, time53101.812, CSS `(735,526.5)` | `desktop-day-end-16-day-two-reloaded.png`, `desktop-day-end-final.png`, `desktop-day-end-initial-final.json` | Reloaded screenshot visibly has the help modal. Its 开门迎客 button spans approximately x472–968/y509–558. The projected click hits this button and closes help, rather than submitting a ground path. The final screenshot has no modal, and saved position remains `(12,6.5)`. |
| Phone | `ixwt@1969`, time118596.717, CSS `(161.9999967,485)` | `phone-day-end-09-ended-controls.png`, `phone-day-end-final.png`, `phone-day-end-initial-final.json` | Before screenshot contains the 客人 token at this point. Screenshot pixels are 3×CSS: click maps to approximately `(486,1455)`, inside that token. Final screenshot displays its 客人/kèrén word card, and player remains `(18.5000000753,13.9999999247)`. |

Trace archives at review time: `day-end-results/day-end-fourth-customer-re-7f5c6-isible-next-day-advancement-{desktop,phone}/trace.zip`. The parent may replace runtime output during the explicitly instrumented rerun; initial results, video and state were already copied separately.

Required reviewer correction: close the actual visible help dialog after reload using normal input; before every ground click check `document.elementFromPoint(x,y)` is the canvas. If a HUD element intercepts the target, choose another reachable visible waypoint or ordinary movement key, retaining continuous traversal. Never force-click through UI, dispatch game actions or teleport to avoid a blocked route. The parent has added transparent planned-click/pointer/Worker logging for confirmation. The running test files were not changed by this diagnostic pass.

The successful initial desktop observations remain useful: four customers paid; final receipt/native replay/word card; retained seating until explicit close; ended-phase town exploration and return; kitchen anchor exposes a real next-day summary; visible 明天见 advances to day2; reload restores core state. This is not a complete day-end acceptance pass: the corrected post-reload return route still needs execution.
