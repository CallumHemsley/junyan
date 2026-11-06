# Integrated live review: PASS + NOTES

Reviewed exact HEAD `c544efacd5d5cdfc57ebbc2155a3518e0031fa8f`, relative to main `ba4419beec7dc8f4a820536fc9d48fc0d97f5e97`, in the independent detached worktree `/private/tmp/junyan-0081-live-review`. No source edits or commits. Final tracked worktree status is clean; only the prearranged untracked node_modules symlink remains.

No actionable progression defect found. The normal purchase, persistence, invitation, varied activity and language-neutral rendering paths pass. One intermittent desktop offline native-playback assertion is retained below; its cause was not established as a progression defect.

## Executed checks

- `JUNYAN_DEV_PORT=5285 JUNYAN_PREVIEW_PORT=5286 pnpm exec playwright test e2e/progression.spec.ts e2e/neighbourhood.spec.ts --reporter=list`: **6 passed (2.3 minutes)**, desktop and iPhone 13 Chromium. Both configured servers use strict ports. The configuration also ran TypeScript and production Vite build successfully.
- `pnpm exec vitest run src/progression/progression.test.ts`: **19 passed**, including neutral translated shop/invitation copy and spacing with no Han leakage, ID-based evidence, twelve varied shifts, accounting, save recovery and supported routine evidence.
- Independent script `/private/tmp/junyan-0081-live-artifacts/extra.mjs`: **desktop and phone passed**. Starts normal mode, explicitly checks `__TEST__` is absent, follows the actual `repairs.toy` invitation, completes all toy repair actions, observes the recommendation change to `cats.reunion`, follows it with heading focus, waits for checkpoint clearance and reloads from IndexedDB. Stored state retains the repair completion and cats route, earnings stay zero, and no console/page errors occur. Results: `extra-results.json`.
- Production offline gate: `JUNYAN_DEV_PORT=5285 JUNYAN_PREVIEW_PORT=5286 JUNYAN_NEIGHBOURHOOD_PREVIEW=1 pnpm exec playwright test --config=playwright.neighbourhood.config.ts e2e/neighbourhood-offline.spec.ts`. **Phone passed; initial desktop failed** at the native speech predicate following offline apartment reload. Unchanged desktop-only rerun: **1 passed (14.7s overall)**. Further unchanged `--project=desktop --repeat-each=3`: **3 passed (35.7s overall)**. Latest four fresh desktop runs pass. No predicate was changed or weakened.

## Actual browser evidence

The progression journey serves all four customers through normal UI, earns 10块, buys the 8块 blue vase, shows 2块 remaining, disables duplicate/unaffordable purchases, places the vase in the room, clears the pending checkpoint before reload, restores the apartment route and identical placements from IndexedDB, and retains the room and wallet into day two. New word lookup opens and closes correctly. Visible progression buttons meet 44px targets, the document has no horizontal overflow, and console/page error arrays are empty.

The neighbourhood journey completes the real opening and all four locations, verifies native line and word speech, recovers feature words, collects gifts, saves/reloads, resumes the restaurant tray, serves the shift and advances the day. Its restaurant-only snapshot correctly excludes progression. The deliberate unavailable-audio case reports failure and recovers after a real replay.

Inspected regenerated desktop and phone shop/furnished/invitation screenshots. The vase is visibly drawn in the room; inventory ownership, price and wallet agree. Shop choices and invitations remain readable and reachable by vertical scrolling below the existing room. They do not cover the scene or action controls. No horizontal clipping of the new controls was observed. Also inspected the post-repair recommendation image, phone apartment and desktop garden, and the production offline restaurant return.

Source review confirms the merged Word `{id,text,pronunciation?}` boundary is retained, progression catalog fields reference stable IDs, labels resolve through WordLine and the selected policy, progression chrome/money live in the selected copy catalog, and the translated fixture test passes. Production remains selected Mandarin as intended. The normal-mode save helper, explicit dialog waits and restaurant-only snapshot fixes survived integration.

## Intermittent offline note

Initial failure: `e2e/neighbourhood-offline.spec.ts:34`, via `e2e/neighbourhood-audio.ts:23`, waiting for `/audio/apartment/line-window.wav` to have both a recorded `playing` promise and a ready native media element after offline reload and replay. The UI displayed the expected window line and saved furniture, with no console error in the trace. The trace records HTTP 200 cached media responses containing 99,884 bytes before reload and twice after reload; this is not evidence of a missing offline cache file. The assertion alone does not identify whether media readiness, playback cancellation, browser scheduling or the instrumentation caused the timeout. It passed unchanged four subsequent desktop runs. Root is separately comparing untouched main; this review does not claim baseline causality or a fix.

First failing trace and snapshot are preserved at:
`/private/tmp/junyan-0081-live-artifacts/offline-first-results/neighbourhood-offline-real-9105c-d-furniture-reloads-offline-desktop/trace.zip`

Machine-readable offline results:
- `/private/tmp/junyan-0081-live-artifacts/offline-first-results.json`
- `/private/tmp/junyan-0081-live-artifacts/offline-desktop-rerun-results.json`
- `/private/tmp/junyan-0081-live-artifacts/offline-desktop-repeat3-results.json`

## Artifact paths and limits

All regenerated screenshots are copied to `/private/tmp/junyan-0081-live-artifacts/` for writer use, particularly `desktop-shop.png`, `desktop-furnished.png`, `desktop-invitation.png`, `phone-shop.png`, `phone-furnished.png`, `phone-invitation.png`, both `*-after-routine.png`, and both `*-real-offline-return.png`. Extra script and JSON results are in that same directory.

Environment: Node v26.12.1, pnpm 10.34.8, installed Chromium (iPhone emulation for phone). This was not a Node 22 or physical iPhone run. Vite emits existing dependency annotation and bundle-size warnings. Diff whitespace checking reports only captured log-line trailing spaces in docs/evidence/0081/writer-checks.txt. No material defect is attributed to those notes. Automated verification does not establish subjective enjoyment or delayed language retention.
