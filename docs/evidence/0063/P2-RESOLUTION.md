# P2 settings containment resolution

The review finding applies to earlier head **180bde4**, not verified runtime **77795742da738de2b93506b73a9f40d98717a243**. At the earlier head, `.ambience-settings` positioned the popup relative to the first toolbar item: on 320px, left ≈−70, so controls were off-screen despite no document horizontal overflow. Before capture: `screenshots/narrow-320-before.png`.

Final CSS `src/audio/ambience-controls.css:1` positions **the containing toolbar** (`.topbar nav:has(> .ambience-settings)`) instead; `.ambience-settings` is static and popup `right:0; top:100%` therefore anchors to the toolbar edge. At 320px the measured popup is x=58, right=308, y=56, bottom=182. No application code changed after 7779574 for this supplementary response.

Existing regression: `e2e/ambience.spec.ts:231`, "narrow phone settings keep every control inside screen gutters", sets **320×740** and asserts x≥12/right≤308. Final combined result log `final-combined-browser-results.txt:42` (desktop) and `:90` (phone) records both passes. Captures: `screenshots/desktop-integrated-narrow-320.png` (320×740 CSS/device px at DPR 1), `screenshots/phone-integrated-narrow-320.png` (960×2220 image px at DPR 3, same 320×740 CSS viewport). These were part of the 81-pass/2-skip combined run on 7779574.

Supplement requested by root: `node docs/evidence/0063/short-viewport-check.mjs`. Actual silent native Chromium against the unchanged 7779574 runtime on strict port 5414, screenshots actually inspected:

| CSS viewport | Popup bounds | Target sizes | Result |
| --- | --- | --- | --- |
| 320×320 | x=58–308, y=56–182 | checkbox label 216×44; range ≈172×44 | PASS, clean console/page errors |
| 568×320 | x=306–556, y=56–182 | checkbox label 216×44; range ≈172×44 | PASS, clean console/page errors |

`short-viewport-results.json` records raw bounds, actual viewport dimensions and error arrays. `screenshots/short-320x320.png` and `screenshots/short-568x320.png` capture only the actual short viewport (not full document), with the popup and its controls fully visible without scrolling. Vertical scrolling of the game below the popup remains ordinary page behavior, not popup clipping.

This is additional runtime evidence, not the earlier reviewer's mock/static inspection and not root's final independent verification. Source hashes in `verified-source-sha256.json` still match all application/test/asset files. The new handoff commit adds only this supplement/evidence; subjective listening and root exact-patch/product acceptance remain pending. No merge or lease release claimed.
