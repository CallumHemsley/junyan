# Independent source review: PASS+NOTES

Candidate: `ba1fb5bea14f24300ec82fa4bbc833930601a2f0`.
Verified ancestor and comparison base: `dd3cc114b7c3151d103d0408b39e6ca305365122` via `git merge-base`.
During review parent advanced checkout to `99ccbdaae56f678a2bec383a95baf2c2b9cbf86e`; `git diff ba1fb5b..99ccbda -- src` was empty. Reviewed application source remained exact candidate source. No implementation authored by this reviewer. No edits to integration source, tests, docs or tracked assets. All review tools/artifacts live here. Existing untracked node_modules symlink predated review.

## Verdict

No reproducible code defect found in reviewed application, feature reducers, save/recovery boundary or controls. No blocking source findings to return to writer. Real voice/offline acceptance remains required after the independently generated clips arrive. This verdict does not accept missing feature audio or imply listening occurred.

## Direct verification

1. `review.cjs`: real Chrome, muted native audio, strict Vite port 5475. Played mandatory opening through real controls, without skip, seeded scene or reducer dispatch. Played apartment starter and arrow-key furniture placement; full cats crouch/wait/approach/follow/reunion using Enter; both repair jobs entirely using keyboard; two gift receipts; real reload. Desktop 1440×1000 and phone 390×844 captures, no horizontal document overflow in four routes. Native pageerror event list empty. Expected absent feature speech produced visible failure notices, which are not newly reported defects.
2. `deeper.cjs`: explicitly seeded the valid row produced by the first script to resume that completed opening/features session. On phone, watered remaining garden plants, served four restaurant customers through real table/kitchen/food/change controls, returned home from day end without advancing time, advanced only via restaurant, observed three growth increments, claimed garden gift, reloaded with no repeated receipt. Immediate reload after selecting furniture preserved draft. A valid old row without neighbourhood skipped opening; separately corrupt apartment/cats payloads reset those features while retaining restaurant progress and all three gift ownership records.
3. `learning.cjs`: phone real controls verified invalid blocked apartment placement adds no recovery; tapped a cats word, read pinyin in its card, closed with Enter, verified focus returned to the triggering token, opened shared journal and found that word. This targeted case intentionally used dev test start to avoid replaying the already-verified opening.
4. Independent reducer validation checks: enumerated 2,717 reachable repair states and validated each. Deterministic seeded sequences executed 10,000 actions each for apartment, cats and garden while advancing authoritative day, validating every resulting state. No invalid generated state. JSON results retained in `reducer-audit.json` and `random-audit.json`.
5. Existing targeted Vitest checks independently executed: neighbourhood integration/state, saves and all four feature rule suites. 7 files, 135 tests passed. Inspected source changes to App/opening/game/save/recovery, registry/contracts/transitions, views and reducers. Baseline restaurant/ward scene, accepted original content/voice preset and audio files had no changes against main. Scoped scan found no application TODO/FIXME/placeholder path, type/lint suppression or misleading constraint comment requiring a finding.

## Visual inspection

Viewed fresh desktop apartment/cats/repairs/garden and phone apartment/cats/repairs/garden images using view_image. Pixel scenes are consistent with the accepted renderer, labels remain DOM text, and controls fit phone width. An immediate post-navigation/resizing cats screenshot caught the first animation frame before rendering; `phone-cats-stable.png`, captured after the first paint, was freshly inspected and shows the complete courtyard. Use that stable capture as phone cats evidence.

## Limits / final acceptance still due

Actual feature speech was not available for this run and was not substituted by this reviewer; native audio stayed muted. No claim of actual listening, pronunciation QA, full production service-worker/offline acceptance, full build or full regression-suite completion. Those remain the parent/integration writer's final gate after voices land. No speculative refactor or UI polish request is being treated as a code blocker.

Re-run scripts with local server 5475 and installed Chrome. They write only here. Stop the review's local server after use.
