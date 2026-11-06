# Workshop re-verification on e02a747

Status: requested workshop re-verification PASS at the recorded positions and flows. The full workshop/program objective remains ACTIVE for broader experience acceptance; interior phase lighting remains a visual review item.

Checkpoint: `e02a747c3b4d4fc6a476ea744ecb6bdc1a738132`. Cloud builder branch `codex/0082-workshop`, merge head `36b052122ded669b880c686b8dc6f5e58853280a`. `git diff --quiet e02a747 -- src public index.html package.json pnpm-lock.yaml` passed. No production source changes were made for this re-verification.

The original failure and copied-old-controller reproduction remain in the parent evidence directory as historical artifacts. **The old phone waypoint blocker is RESOLVED for the actual recorded route at this checkpoint.** Do not run the old copied-controller reproduction as a test of the new controller; current production consumes `advanceRoute`.

## Actual production results

- `depth-proof.mjs` / `depth-results.json`: six positions per viewport, using real mouse input on desktop and touchscreen taps on phone. Both reach lamp-bench beside `(11.5,8.8)`, behind `(8,6.8)`, front `(8,10.8)`, and joinery behind `(8,14.5)`, beside `(11.5,17)`, front `(8,18.8)`. The exact formerly stalled behind-to-front route reaches its target on the first click. No retries, setter movement or widened colliders. No console or page errors recorded.
- `production-proof.mjs` / `production-results.json`: actual floor approaches, correct physical job selection, complete lamp and toy repair, close/reload at the approach, preserved restaurant day/customers, both completed jobs retained, then repeat and partial-progress reload for BOTH jobs. Lamp reload retains seated/off fitting; toy reload retains an open cover. Completion state remains intact and actual world objects are visible on their benches. Current `.world-context` HUD is tested, with no legacy scene canvas. Part controls do not overlap and measure 44px high on both viewports.
- `gift-proof.mjs` / `gift-results.json`: normal UI claim from the actual completed-repair save, reload, one `repairs.stool` in apartment ownership, one claimed marker, no duplicate claim control, same approach position. Desktop mouse and phone touch both pass.

These proofs disclose their initial save setup. They establish workshop interactions, movement and persistence, not a new normal opening-to-workshop journey or all program destinations. They use reduced motion deliberately; global motion/voice quality is not inferred from these checks.

## Independent focused review

Read-only Astra helper `/root/workshop_review` independently inspected source, scripts, result JSON and eleven fresh screenshots. It confirmed that the old waypoint concern is superseded for these routes, the player remains readable at the sampled front/side/behind positions, local foreground fading does not fade the whole room, repeat objects are visible, current HUD targets remain separate and gift idempotence is recorded. No concrete current defect found in the bounded review.

The helper did not rerun scripts/tests, play video, listen to voices or inspect every possible occlusion position. This is not a program-wide acceptance verdict. No renderer, schema, save, HUD consumer, clock or audio changes were authored by this builder.

## Checks and inspection

TypeScript passed. `vitest run src/world/locomotion.test.ts src/world/art/workshop/paint.test.ts src/world/maps/workshop/map.test.ts src/features/repairs/rules.test.ts`: 23 tests passed. The locomotion cases cover all five reported frame intervals.

Builder inspected fresh phone lamp front, phone joinery behind and phone repeated-toy screenshots, plus desktop repeat-lamp. Astra's independent inspection covered the matching desktop/phone depth, repeated jobs, completed repair and gift captures. Full error arrays and target states are in JSON. Video dimensions/duration and source provenance are recorded in `provenance.json`; depth videos retain real traversal for further review.

Re-run from `/workspace/junyan` with the owned strict port 5484:

```sh
node docs/evidence/world/0082/e02a747/depth-proof.mjs
node docs/evidence/world/0082/e02a747/production-proof.mjs
node docs/evidence/world/0082/e02a747/gift-proof.mjs
```

Keep source stable during a run. The gift script consumes the new production result; depth starts from the preserved earlier valid workshop save. Vite and Chromium run only in the attached managed cloud environment.
