# Independent cats review

The goal is a polished, playable Mandarin cats feature within the cohesive apartment game. Isolated code verdict ISSUES. Release verdict BLOCKED.

Reviewed exact head 0e07106b49fdc0420c011e319db032ee03cbc831 in /workspace/cats-0068, before and after execution. Source diff from ee9708990dd2457ffe458107e13ca68090789875 remained empty. No source edits, commits, merges or branch mutations. Assigned strict ports 5468/5568 were released with no listeners.

## P2 finding

Companion pose still depends on the literal selected target rather than the companion acted upon. src/features/cats/scene.ts line 66 accepts only selected white for whiteFriend; line 73 derives sitting from that value. rules.ts lines 129-130 permit the invitation with either white or window selected and set rested=true in either case.

Live desktop and phone reproduction in independent.spec.ts:

1. Complete the reunion on day1.
2. Start route on day3, select white, follow.
3. Select window, advance to day4, choose approach.
4. Serialize actual state into the harness URL and reload at day4.

Both paths preserve repeat={status:complete,day:3,finishedDay:4,kind:route}, rested=true, and the window cat position. With white selected, visualPose.sitting=true. With window selected, visualPose.sitting=false. Both screen sizes fail the independent expectation. Screenshots desktop-late-window.png and phone-late-window.png show the standing player. Same-day location and next-day normal door routine both pass. Rejected reunite recovers no words and the stable gift remains exactly cats.cushion.

Missing regression is the window-target invitation after follow, late completion and reload. Existing authored regression covers only white selected.

Analogous rain variants exercised white and door, each with and without an existing rested relationship. All eight action assertions pass. Both targets give space, recover cats.back, move the player farther away, and complete waiting. With prior rested=true, white-target waiting ends sitting=true while door-target waiting ends sitting=false. This is the same selection-coupling root at scene.ts66. With prior rested=false both wait paths consistently stand. Resolve semantic target aliases without making unrelated black-cat detours sit beside white.

## Checks actually run

Working directory /workspace/cats-0068. Commands use existing direct node binaries and system Chromium in cloud Linux. The temporary config in this directory uses strict assigned ports and reuseExistingServer=false. It avoids the system pnpm wrapper and places runner output here.

- node node_modules/vitest/vitest.mjs run src/features/cats. 28 tests passed in two files. unit.log.
- node node_modules/typescript/bin/tsc -b && node node_modules/vite/bin/vite.js build. Passed. build.log. Only upstream Zod annotation warnings.
- JUNYAN_DEV_PORT=5468 JUNYAN_PREVIEW_PORT=5568 JUNYAN_PREVIEW_URL=http://127.0.0.1:5568/junyan/ PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers node node_modules/@playwright/test/cli.js test --config /workspace/scratch/cats-final-review/playwright.config.mjs e2e/cats.spec.ts e2e/waiter.spec.ts. 14 passed. browser.log. Includes full ward, three customers, change, journal, progression; keyboard walking; browser saved-word reload; cats story, repeats, keyboard, lookup, recovery, replay callbacks, animation pause and reduced motion; new repeat-detour regression.
- JUNYAN_DEV_PORT=5468 JUNYAN_PREVIEW_PORT=5568 PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers node node_modules/@playwright/test/cli.js test --config /workspace/scratch/cats-final-review/independent.config.mjs. Initial four late-route cases. Two white cases pass and two window cases fail. independent.log. Traces retained under playwright/.
- Same independent command with --grep 'rain patient'. Eight passed. rain-variants.log. Includes the analogous observations above, which are logged rather than asserted as parity.

Inspected actual current-run images via view_image. phone-initial-clue, desktop-reunion, phone-window-friend, desktop-late-window, phone-late-white, desktop-rain-door-true, desktop-rain-white-true, and phone-rain-space. Cats and scene labels are distinct; controls fit the phone layout; initial word fog is expected shared learning behavior. Late window shot confirms standing pose. No new layout blocker found. Existing cats journey asserts every visible button >=43.5px, no horizontal overflow, and no browser errors. Independent late-route cases capture page errors and found none.

Existing cats tests hardcode screenshots under evidence/0068. They regenerated five tracked phone screenshots due to device rasterization differences and created four untracked rain-space/window-friend screenshots. Initial evidence/0068/playwright/ already existed. Writer/lead were notified; source remains untouched. Do not accidentally commit reviewer rasterization changes as feature changes.

## Audit and release limits

Read full completion policy, poteto-mode, adapter, Prove It Works, shipping, control-ui and no-comments. Prove It Works changed the check from trusting author logs to running the actual feature and alternate browser branches. No comments or suppressions remain in scoped cats source/e2e files, as confirmed by rg. No new delegated comment agent was created in this read-only verification lane; the prior comment assessment is parent-provided evidence. git diff --check identifies whitespace only in committed log artifacts, not application code.

Read committed decisions.tsv. It records a lead design row before the writer start, explicitly discloses that chronology, identifies the sole writer start, states the audio blocker, and names the review fixes. Source uses raw canonical shared JSON to avoid the registry cycle. Runtime content parse and canonical tests pass. The evidence README accurately distinguishes callbacks/URL restore from integrated audio/IndexedDB/offline proof. No commercial-quality or integrated-complete conclusion is justified.

Release remains blocked by absent authored cat speech clips and unavailable model access/cached model, plus central foundation App navigation, journal registration, real persisted shared save/migration, apartment gift and offline registration. Harness playback callbacks are not audible speech. URL serialization/validate is not real production persistence. This reviewer did not independently listen to nonexistent audio or verify missing integrated offline behavior. Central apartment lead alone coordinates any landing after fixes and integrated evidence.
