# Root verification report and targeted route cleanup

Source: root's direct relay on 2026-11-05. Root ran actual muted Mac Chrome verification on runtime **77795742da738de2b93506b73a9f40d98717a243**. These are root-reported results, not a claim this worker ran the Mac environment or possesses its raw traces.

- Root **178 unit tests / build PASS**.
- Initial root browser selection: **35 passed / 3 failed out of 38**. Do not describe that initial run as green.
- Failed cases: rapid desktop word switching (`apiResponse.body` disposed), phone native ambience start/foreground case (currentTime remained zero within its assertion), and the phone full waiter journey reaching its existing 180-second limit.
- Root reran **only those three cases**, using fresh per-archive Vite caches and no concurrent local inference: **3/3 PASS in 43.3 seconds**. Initial 35 passes plus the isolated rerun cover the selected cases. No product defect was established by these failures; this does not prove a specific resource-contention cause.

This worker's controlled real-Playwright 1.64.1 diagnostic established the route ownership mechanism separately:

| Controlled sequence | Observed result |
| --- | --- |
| Close context after route.fetch, before response.body | Exact apiResponse.body: Response has been disposed |
| Cancel browser request, keep context alive | Body read succeeds |
| Await page.unrouteAll({behavior: "wait"}) before closing context | Body read/fulfill succeeds |

The rapid word-switch case starts a final delayed route near the end and can finish its UI assertions before that handler completes. The old afterEach checked console errors but did not drain page routes. Root explicitly authorized this bounded fixture cleanup: afterEach now awaits **page.unrouteAll({behavior: "wait"})**, then runs the **unchanged** console assertion. `wait` preserves route errors; it does not enable ignoreErrors or add catches. All behavior, timing, timeout and product assertions remain unchanged. This addresses teardown ownership hygiene, not a claim to fix a proven product failure or the primary cause of root's two timing failures.

Only `e2e/word-switch.spec.ts` and this ticket's evidence change. Product source, calibrated audio (SHA c0f60e4c71c3fbbfabf2863495e44749c02394d05015216da89ad95d576459f1), default level .35 and gains .1575/.042 remain exactly as user accepted. No speculative mix or product change. Focused desktop/phone word-switch regression: **10/10 PASS in 53.3 seconds**, including both rapid cancellation cases. Command: `pnpm_config_verify_deps_before_run=false JUNYAN_DEV_PORT=5414 JUNYAN_PREVIEW_PORT=5415 pnpm exec playwright test --config docs/evidence/0063/playwright.config.ts e2e/word-switch.spec.ts`. Actual output: `route-drain-word-switch-results.txt`.

The user's **“Works at this level”** acceptance remains scoped to the reported 20-second representative preview, not full 73-second loop/day listening. Root retains final delta/current-main review and central merge/lease-handoff authority. No merge is performed by this worker.
