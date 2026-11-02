# Serving a day

## Sub-features

- Approach a table, hear its greeting/order and select kitchen items.
- Return to deliver the tray, count change and receive the customer's reaction.
- Serve four tables, see `今日小结`, choose `明天见` and advance the level/day.

## How to get to it (user POV)

Choose `开门迎客`, click a numbered table, choose `去厨房`, tap `拿` food buttons, `端好了，去上菜`, the same table and `上菜`. Count `+1块`, choose `递上找零` and `继续招呼`.

## Driving it with Playwright

After cleanup: `pnpm exec playwright test e2e/waiter.spec.ts --grep 'collect, recall, deliver'`. This core journey uses real clicks to serve all four tables; read-only test hooks identify deterministic seeded orders and assert day 2/level 2. It checks the real canvas, receipt/reaction, journal and focus-trapped tally. Inspect desktop/phone restaurant and journal PNGs in `output/playwright/`, plus traces on failure. The other walking spec uses a setup dispatch and is not equivalent to a complete user journey.

## Gotchas

`?test=1&seed=42` bypasses saves; this journey cannot prove persistence. The explicit one-word proof uses normal mode separately. Do not invent an order or skip change if a precondition differs; report the actual order/state and failing selector.
