# Whole-app restoration profile: 1cf3532

Reviewer: `/root/review_evidence_integrity`. Exact source: `1cf3532e9b40cbdd99d51ee860562e8f292a1d4e`. **Instrumented production build**, isolated `/workspace/junyan-exit-audit`, Chromium at 1280×720, no CPU throttling; Node 22.23.4. This is a bounded cloud timing sample, not a native-device performance claim or completed world-program verdict.

Ordinary fresh opening, five seconds idle, 1.5 seconds ArrowUp plus 0.5 seconds settling, and reload used no save injection. Movement reached (6.6971, 11.6971) from (12,17); reload retained that position. Apartment profiling then deliberately unloaded the app and wrote a declared save fixture: neighbourhood.location apartment; world.mapId apartment; position (17.5,13.5); activeActivity apartment; activeAnchorId apartment.furnish; empty returnPositions. This is **not ordinary apartment arrival/travel proof**. It used the real apartment UI to accept the starter and click cream/blue six times, then reloaded. Fixture position remained stable. Final run had no captured page errors or caught test errors.

## Measured App-body restoreWorld cost

Milliseconds are inclusive instrumentation timings, with browser clock quantization around 0.1 ms. Nested function timings must not be added together. One completed final sample per phase; earlier bounded restaurant runs gave similar costs.

| Phase | Calls | Total ms | p95 ms | Max ms |
|---|---:|---:|---:|---:|
| opening | 39 | 1.3 | 0.1 | 0.3 |
| restaurant-idle-5s | 5 | 1.5 | 0.1 | 1.2 |
| restaurant-keyboard-2s | 91 | 7.3 | 0.2 | 0.2 |
| restaurant-reload-2s | 3 | 0.6 | 0.2 | 0.2 |
| declared-apartment-active-anchor-fixture | 4 | 1.3 | 0.4 | 0.4 |
| apartment-six-restyles | 10 | 3.3 | 0.4 | 0.5 |
| apartment-reload-2s | 4 | 2.0 | 0.5 | 1.0 |

Movement caused 91 App-body validations in two seconds (about 45.5/s; the final half-second was settling). Including reducer/other callers, restoreWorld ran 183 times, totaling 16.0 ms; App-body restoration accounted for 7.3 ms. App.maps ran 91 times, totaling 0.5 ms. Idle produced five App validations in five seconds. Six restyle clicks produced ten App validations, totaling 3.3 ms. These samples do not demonstrate a frame-budget defect.

No exitComponent invocation was recorded in any final phase: these positions used the direct reachable-exit fast path. Consequently this does **not** bound flood-fill cost, disconnected-position recovery, long returnPositions histories, furnished collision rebuilds, or distant/occluded world positions. The colour switches do not change placement geometry. The existing WeakMap caches for apartment placements, garden, and cats are relevant; a fresh registry wrapper does not imply fresh maps or fresh flood fills.

## Recommendation

Do not block the namespace migration or declare a whole-app performance regression from the render call site alone. Keep the separate empty-support API correctness fix independent. Before considering caching or moving validation, obtain profiles where exitComponent actually runs and where furniture placement changes collision geometry. A memo keyed on moving world state would still invalidate every movement; any future optimization must preserve load recovery, structural collision edits, return-position sanitation, and safe post-edit movement.

## Reproduction and limits

Apply `profile-instrumentation.patch` only in a disposable checkout of the pinned source. Copy `profile.spec.ts` and `profile.config.ts` into its `audit/` directory (their imports/testDir assume that location). Build with Node22 running `node_modules/vite/bin/vite.js build`; serve with `vite preview --host 127.0.0.1 --port 5501`; run Node22 `node_modules/@playwright/test/cli.js test --config audit/profile.config.ts`. Exact final harness and raw samples are retained beside this report. The script writes `/tmp/exit-wholeapp-profile.json`.

Instrumentation wraps App maps/restore and the underlying maps/restore/connectivity/component functions using performance.now; read-only navigation helpers are exposed on globalThis. Those helpers do not dispatch game actions. No production branch source was edited. Build succeeded; final Playwright run: one passed in 21.4 seconds. This harness catches traversal/profile errors into JSON, so the test runner status alone is insufficient: the retained final JSON has an empty errors array.

Earlier ordinary apartment navigation attempts were interrupted/stalled and are excluded from the apartment claim. The historical pointer helper did not establish a route from the post-movement/reload position. A later pre-reload keyboard attempt reached town but was stopped when scope changed to the authorized fixture. These are harness observations, not independently isolated production defects.
