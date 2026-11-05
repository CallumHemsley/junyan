# Ticket 0064 browser evidence

Supporting artifacts from the 2026-11-05 exploration of game commit `66ac123fa377f0cdbfb30f5c8bad07edf28790e4`. Exported unchanged from the original run; the driver alone was made portable (relative dependency import, output directory and Chromium executable selection). This is evidence for the brainstorm, not a human enjoyment test or audio audition.

- [exploration.json](exploration.json): three scene-control visits, dialog text, click-to-dialog wall times and captured console/page errors. Timings include automation/render overhead and are single-run observations, not performance benchmarks.
- [explore.mjs](explore.mjs): same rendered-control exploration, reading hooks only for the order/state. It serves three diners and revisits the first. Screenshots are not fabricated or regenerated for this export.
- [Desktop order](desktop-order.png), [kitchen](desktop-kitchen.png), [receipt](desktop-receipt.png) and [served-table revisit](desktop-revisit.png): original exploratory screenshots.
- [Desktop restaurant](desktop-restaurant.png), [phone restaurant](phone-restaurant.png), [desktop journal](desktop-journal.png) and [phone journal](phone-journal.png): original existing journey captures. Desktop viewport 1440×1000; phone viewport 390×664 CSS pixels with device scale 3. These captures support visible layout observations, not touch-user or screen-reader usability claims.

To repeat the desktop exploration from the repository root after installing the locked dependencies, run the following in separate terminals (Node 22). Use Playwright's installed Chromium, or set `CHROMIUM_PATH` to an existing executable. Generated evidence defaults to `/tmp/junyan-0064-evidence`, outside the checkout; set `EVIDENCE_OUTPUT` for another destination. The browser is muted.

```sh
pnpm dev --host 127.0.0.1 --port 5406 --strictPort
node docs/evidence/0064/explore.mjs
# System Chromium alternative:
CHROMIUM_PATH=/usr/bin/chromium node docs/evidence/0064/explore.mjs
```

Phone/desktop restaurant and journal captures originate in the existing `e2e/waiter.spec.ts` “wake in the ward” journey. With the required browsers installed:

```sh
JUNYAN_DEV_PORT=5406 JUNYAN_PREVIEW_PORT=5407 pnpm exec playwright test e2e/waiter.spec.ts -g 'wake in the ward'
```

That journey uses strict ports, no server reuse and muted audio. It covers the opening, four customers, change, journal and next day, and asserts an empty captured console/page-error list. Full generated videos and test/build logs remain cloud-local because they are unnecessary bulk for checking the brainstorm's observations; the ticket records their paths and reported check outcomes.
