# Independent live review — ISSUES

Reviewed immutable head `3c0389431fbca3cf6b4c094b6158b2569ce5ff75` against `8cd5bc209b7dc2d91cc0f765991de313f813f4eb` in `/private/tmp/junyan-0077-live-review`. Read-only tracked source: `git diff --exit-code` passed. Applicable AGENTS, ticket/plan, accepted decisions, research/design notes, full runtime changes, and pstack Prove It Works/Experience First read. No runtime correctness defect identified in the exercised new UI. Browser verification at this head is not green because of the following test defects.

## Findings

1. **[P1] Wait for the real table dialog before delivery.** `e2e/progression.spec.ts:16` uses a broad `上菜` button match immediately after initiating travel. It matches the existing HUD navigation action `1桌 · 上菜` while walking rather than the delivery action. The test then waits indefinitely for `+1块` (line 18) and times out at 180 seconds. Independently reproduced with the same UI controls: after this click, state was still `phase: ordered`, tray `['bun']`, and body text showed `走过去…`. Scope delivery to the table dialog; the existing waiter/neighbourhood helper already demonstrates the required wait. This currently prevents the new purchase/reload journey from reaching its assertions.
2. **[P1] Exercise persistence outside test mode.** `e2e/progression.spec.ts:29` enters `?test=1`, then lines 49–52 expect a reload to preserve purchases/placement. `src/App.tsx:113,150,192` intentionally disable normal persistence/load in test mode. Correct the fixture to normal mode, retaining state observation through real IndexedDB. This became visible after the writer independently fixed finding 1; code inspection confirms the contradiction. This report does not claim the original reload assertions passed.
3. **[P2] Exclude cross-feature progression from the restaurant-only snapshot.** `e2e/neighbourhood.spec.ts:68–70` excludes neighbourhood and journal but retains the newly introduced progression aggregate. At line 177 the actual snapshot includes legitimate apartment/cat/repair/garden evidence while the expected initial restaurant snapshot has no progression. Desktop consistently timed out with that exact object difference. Exclude progression from this narrowly named snapshot and assert it separately if wanted; preserve the restaurant-isolation assertions.

These were forwarded to the root/writer during review. Root reports corrections are underway; this review is scoped to the original SHA and is not approval of a later head.

## Direct evidence

- Ran a 33-case selected Playwright batch at strict dev/preview ports 5281/5282. Sixteen cases completed without failure before intentional interruption: desktop normal opening → all four orders → change → journal → next day, desktop keyboard walking, desktop looked-up-word reload; desktop production restaurant/audio offline; all seven desktop save tests; two legacy/malformed neighbourhood persistence tests on each viewport; desktop unavailable-feature-audio recovery.
- Desktop progression failed finding 1, desktop full neighbourhood failed finding 3. Two neighbourhood-offline invocations failed their explicit configuration guard because this first batch used the normal config instead of `JUNYAN_NEIGHBOURHOOD_PREVIEW=1` with `playwright.neighbourhood.config.ts`. Those two are reviewer invocation errors, not product findings. The rest were interrupted/not run after root requested avoiding another obsolete 180-second failure. Final corrected-head verification must run the correct production neighbourhood offline gate.
- Separate isolated Chromium scripts used real UI controls, no hook dispatch. On desktop and phone: visit home → follow `repairs.toy` invitation → open cover → connect lead → replace cell → close cover → test → return → receive a different `cats.reunion` invitation → follow to courtyard. Both destinations had correct location focus; console/page errors were empty.
- Separate phone UI journey served all four customers, collected exactly 10块, bought blue vase for 8块, selected it in inventory, used the accessible floor grid, and placed it at row 2/column 4. UI showed 2块, owned purchase disabled, inventory `屋里`, and the rendered blue vase visibly in the room. Screenshot personally inspected.
- Phone/desktop screenshots show scene first, shop/recommendation below. The new panels extend scrolling but do not displace or overlay the room. New names and invitations are tappable Mandarin tokens with no default pinyin/English. Purchase prices/balance and owned status are legible. All new CSS button minimum sizes are 44px; viewport images show no horizontal overflow. The original same-location invitation remains visible after arrival; root/writer elected to hide it as polish.
- The docs' absolute statement that rearranging an already placed item earns no practice credit needs clarification: after storing/undoing and replacing on a later day the reducer can record supported exposure, with no independent success or money. Root agreed this is acceptable later exposure, with wording to distinguish same-day repetition from later-day practice.

## Artifacts

All under `/private/tmp/junyan-0077-live-review/output/playwright/`:
- `live-phone-purchase.png` — visible placed vase, inventory, 2块 wallet and owned state; inspected.
- `live-phone-home-first.png`, `live-desktop-home-first.png` — scene/shop hierarchy; inspected.
- `live-phone-follow.png`, `live-desktop-follow.png` — recommendation reaches toy bench; inspected.
- `live-phone-varied.png` — second recommendation reaches courtyard; inspected.
- `live-desktop-varied.png` — captured before canvas finished drawing; not evidence of a renderer defect.

Repro scripts: `/private/tmp/junyan-0077-live-review/live-review.mjs` and `buy-review.mjs` (untracked reviewer artifacts). Failure traces remain in that worktree's `test-results/`. Test servers from this review batch were interrupted; no source edits or commits made.

Required remaining gate: correct the three test issues, verify the final immutable head with the full new normal-mode purchase/placement/reload/next-day journey on both sizes, rerun neighbourhood isolation and correct production offline configuration. Human delayed-retention/enjoyment claims remain appropriately unproven; automated UI/state checks do not establish them.
