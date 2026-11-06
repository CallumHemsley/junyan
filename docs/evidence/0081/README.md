# Living progression verification

Pre-integration runtime revision: `c7ceebf2bd165f291094961b04466ea919f6f03a`. The starting revision was `8cd5bc2`.

`src/progression/progression.test.ts` covers both clocks, early encounters, assistance, repeated valid outcomes, fixed semantic identities, twelve varied shifts, actionable eligibility, accounting, paid ownership recovery, and placement. Guided routines count supported exposure. Tests do not establish language retention or subjective enjoyment.

## Checks

| Check | Result |
| --- | --- |
| `pnpm test` | 325 tests passed |
| `pnpm build` | Passed. Vite reports dependency annotation and bundle-size warnings. |
| `e2e/progression.spec.ts` | Desktop and phone passed, 2 tests in 50.9 seconds |
| Existing opening, waiter, save, and restaurant offline checks | 35 tests passed in 2.0 minutes |
| Production neighbourhood offline checks | Pending |
| Independent final verification | Rules, build, and original semantic-identity reproduction passed. Browser checks running. |

Writer browser checks use `JUNYAN_DEV_PORT=5277 JUNYAN_PREVIEW_PORT=5278`. Both servers use strict ports. Normal persistence checks omit `test=1` because that mode deliberately disables saving.

```sh
pnpm test
pnpm build
JUNYAN_DEV_PORT=5277 JUNYAN_PREVIEW_PORT=5278 pnpm exec playwright test e2e/progression.spec.ts
JUNYAN_DEV_PORT=5277 JUNYAN_PREVIEW_PORT=5278 pnpm exec playwright test e2e/waiter.spec.ts e2e/opening-start.spec.ts e2e/save.spec.ts e2e/offline.spec.ts
JUNYAN_DEV_PORT=5277 JUNYAN_PREVIEW_PORT=5278 JUNYAN_NEIGHBOURHOOD_PREVIEW=1 pnpm exec playwright test --config=playwright.neighbourhood.config.ts e2e/neighbourhood-offline.spec.ts
```

## Inspected images

The writer inspected desktop and phone shop, furnished-room, and invitation images. The blue vase appears in the room. Shop names, prices, and the remaining balance are readable. The invitation opens the requested toy repair. The browser journey checks 44px touch targets, no horizontal overflow, focus after navigation, no Latin text in the new controls, and a clean console.

- [Desktop shop](desktop-shop.png) and [phone shop](phone-shop.png).
- [Desktop furnished room](desktop-furnished.png) and [phone furnished room](phone-furnished.png).
- [Desktop invitation destination](desktop-invitation.png) and [phone invitation destination](phone-invitation.png).

## Review and corrections

[Initial rules review](rules-review.md) found that adding a second meaning for 油条 renamed the original food identity. `c7ceebf` fixes this with an explicit identity registry and canonical food targets. A regression checks old-save continuity and an actual looked-up delivery with expanded content. The independent verifier reran the original reproduction successfully.

[Initial live review](live-review.md) found an existing restaurant-only snapshot helper included the new cross-feature progression field. The helper now excludes progression while the new journey independently checks its persistence. A recommendation to the current location was also redundant, so the view hides it.

The new browser test needed explicit waits for movement dialogs, normal saving mode, and the existing apartment resume behavior. Those were test-driver corrections, not claims of product failures. Both viewport journeys pass with the corrected driver.

[Writer decisions](decisions.tsv) and [coordinator decisions](root-decisions.tsv) retain the design and verification trail. The initial writer timestamp was a placeholder. An appended correction records that the exact original time was not captured.

## Boundaries

Three new furnishings and nine authored scenario kinds are a finite first slice. The implementation guide in [living progression](../../ideas/living-progression.md) describes adding content, stable identities, actual outcome evidence, and durable purchase records. It makes no claim of an unlimited curriculum or validated scheduling intervals. No AWS writes, manual deployment, live model calls, or new audio purchases were needed.

The main branch advanced to `ba4419b` during final verification. Ticket and evidence paths moved from 0077 to 0081 because another task had used 0077. These results describe `c7ceebf`; the integrated revision needs fresh verification.
