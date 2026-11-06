# Living progression verification

Verified runtime revision: `c544efacd5d5cdfc57ebbc2155a3518e0031fa8f`, integrated with main `ba4419beec7dc8f4a820536fc9d48fc0d97f5e97`. The original starting revision was `8cd5bc2`.

`src/progression/progression.test.ts` covers both clocks, early encounters, assistance, repeated valid outcomes, fixed semantic identities, twelve varied shifts, actionable eligibility, accounting, paid ownership recovery, and placement. Guided routines count supported exposure. Tests do not establish language retention or subjective enjoyment.

## Checks

| Check | Result |
| --- | --- |
| `pnpm test` | 353 tests passed in 30 files |
| `pnpm build` | Passed. Vite reports dependency annotation and bundle-size warnings. |
| Progression, opening, waiter, save, and restaurant offline browser checks | 37 tests passed in 2.7 minutes |
| Independent integrated rules verification | Passed, including 7,500 real reducer/save roundtrips and display-renaming and language-slot probes |
| Independent integrated live and production neighbourhood offline checks | 6 normal cases passed; phone offline passed; initial desktop audio timeout, then four unchanged desktop passes |
| Project Node 22.23.4 verification | 353 tests and production build passed; both normal IndexedDB progression browser journeys passed (52.0s) |

Writer and independent live checks used Node 26.12.1 and pnpm 10.34.8. The coordinator repeated [all tests and build](node22-checks.txt) and [both new browser journeys](node22-browser.txt) under Node 22.23.4 on strict ports 5293/5294; both environments passed. Writer browser checks use `JUNYAN_DEV_PORT=5277 JUNYAN_PREVIEW_PORT=5278`. Both servers use strict ports. Normal persistence checks omit `test=1` because that mode deliberately disables saving. The purchase journey waits for the checkpoint to clear before reloading, so restoration must use IndexedDB. [Captured writer checks](writer-checks.txt) record the commands and results.

```sh
pnpm test
pnpm build
JUNYAN_DEV_PORT=5277 JUNYAN_PREVIEW_PORT=5278 pnpm exec playwright test e2e/progression.spec.ts
JUNYAN_DEV_PORT=5277 JUNYAN_PREVIEW_PORT=5278 pnpm exec playwright test e2e/waiter.spec.ts e2e/opening-start.spec.ts e2e/save.spec.ts e2e/offline.spec.ts
JUNYAN_DEV_PORT=5277 JUNYAN_PREVIEW_PORT=5278 JUNYAN_NEIGHBOURHOOD_PREVIEW=1 pnpm exec playwright test --config=playwright.neighbourhood.config.ts e2e/neighbourhood-offline.spec.ts
```

## Inspected images

The writer inspected desktop and phone shop, furnished-room, and invitation images. The integrated journey recaptured all six images byte-identically to the inspected files. The blue vase appears in the room. Shop names, prices, and the remaining balance are readable. The invitation opens the requested toy repair. The browser journey checks 44px touch targets, no horizontal overflow, focus after navigation, no Latin text in the new controls, and a clean console.

- [Desktop shop](desktop-shop.png) and [phone shop](phone-shop.png).
- [Desktop furnished room](desktop-furnished.png) and [phone furnished room](phone-furnished.png).
- [Desktop invitation destination](desktop-invitation.png) and [phone invitation destination](phone-invitation.png).

## Review and corrections

[Integrated rules review](integrated-rules-review.md) reports no actionable defect at `c544efa`. It verifies all 267 word identities under display renaming, twenty parallel shifts with renamed words, 72 varied order transitions, language-specific production save/load calls, repeated actions, clock rollback, and paid ownership recovery. Trailing spaces in the copied pre-integration log were removed when it was replaced with the final writer receipts.

[Integrated live review](integrated-live-review.md) reports PASS with an explicit intermittent-check note. The initial desktop production offline run timed out waiting for native audio playback after apartment reload; cached audio returned HTTP 200, and no console error or missing cache file was established. Four unchanged desktop reruns passed. The unchanged main comparison also [passed](baseline-offline.txt). The cause remains unknown and is tracked in [ticket 0082](../../tickets/0082-investigate-offline-speech-probe.md). The original predicate remains unchanged. Machine-readable [first run](offline-first-results.json), [first rerun](offline-desktop-rerun-results.json), and [three repeats](offline-desktop-repeat3-results.json) preserve the outcomes. The live reviewer also completed [independent normal-mode invitation, repair, and IndexedDB checks](extra-results.json) on both viewports.

[Initial rules review](rules-review.md) found that adding a second meaning for 油条 renamed the original food identity. `c7ceebf` fixes this with an explicit identity registry and canonical food targets. A regression checks old-save continuity and an actual looked-up delivery with expanded content. The independent verifier reran the original reproduction successfully.

[Initial live review](live-review.md) found an existing restaurant-only snapshot helper included the new cross-feature progression field. The helper now excludes progression while the new journey independently checks its persistence. A recommendation to the current location was also redundant, so the view hides it.

The new browser test needed explicit waits for movement dialogs, normal saving mode, and the existing apartment resume behavior. Those were test-driver corrections, not claims of product failures. Both viewport journeys pass with the corrected driver.

[Writer decisions](decisions.tsv) and [coordinator decisions](root-decisions.tsv) retain the design and verification trail. The initial writer timestamp was a placeholder. An appended correction records that the exact original time was not captured.

## Boundaries

Three new furnishings and nine authored scenario kinds are a finite first slice. The implementation guide in [living progression](../../ideas/living-progression.md) describes adding content, stable identities, actual outcome evidence, and durable purchase records. It makes no claim of an unlimited curriculum or validated scheduling intervals. No AWS writes, manual deployment, live model calls, or new audio purchases were needed.

The main branch advanced to `ba4419b` during final verification. Ticket and evidence paths moved from 0077 to 0081 because another task had used 0077. The initial rules and live reports describe `c7ceebf` and remain historical. The current gates above describe the integrated revision. Catalog labels and targets now use word IDs, WordLine supplies spacing, progressionUi owns chrome, and the merged shared apartment recovery and language-scoped storage remain intact.
