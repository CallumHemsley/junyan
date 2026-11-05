# Standalone checkpoint

[Draft PR 19](https://github.com/CallumHemsley/junyan/pull/19) contains the foundation contracts. Ticket 0066 remains doing. The contracts and content enumeration lease was released. Application navigation remains blocked by the explicit 0063 lease. No placeholder views or audio files were added.

## Changes

`src/neighbourhood/contracts.ts` defines four feature IDs, location IDs, gift IDs, version-one envelope fields, and shared view callbacks. `FeatureLine.tsx` reuses DOM `WordToken` controls and replay callbacks.

`state.ts` initializes legacy saves, validates each feature independently, changes location without altering features, claims an available gift with its receipt, and restores retained gifts after apartment recovery. Its helpers have no browser or storage calls.

`content.ts` checks namespaces, exact canonical word reuse, declared tokens, duplicate IDs, and local audio paths. It preserves authored Phrase text, validates that the text matches its tokens, and enumerates referenced audio. Enumeration does not prove files exist.

## Independent review

`/root/foundation_review` independently reran ten tests at `8939b42` and found no concrete standalone defects. That code patch was rebased unchanged as `c50bfcd` onto main `8656b3c`.

`/root/registry_review` found that strict Line parsing rejected actual apartment Phrase exports with a `text` field. The first fix stripped phrase metadata and passed the reviewer retest. The coordinator then required preserving speech metadata for audio provenance. Final code `e094dfb` retains optional text and adds the released `Content.neighbourhood` bridge. Its regression proves that namespaced words can enter the existing journal and canonical hospital words remain available. A fresh exact-head review is pending.

## Commands and evidence

Run from `/workspace/junyan-foundation` with the existing dependency installation. No frozen install is claimed.

```sh
PATH=/workspace/.junyan-tools/node_modules/node/bin:$PATH pnpm --config.verify-deps-before-run=false test
PATH=/workspace/.junyan-tools/node_modules/node/bin:$PATH pnpm --config.verify-deps-before-run=false build
JUNYAN_BROWSER_PATH=/usr/bin/chromium pnpm --config.verify-deps-before-run=false exec playwright test e2e/waiter.spec.ts --config playwright.neighbourhood.config.ts --grep 'wake in the ward'
```

Node 22.23.4 passed all 188 tests and the production build. See `node22-rules.txt` and `node22-build.txt`. The build reports two existing Zod annotation warnings.

After the content bridge, the original opening, four customers, change, journal, and day-two journey passed in desktop and phone Chromium. See `baseline/results.json`. The test asserts clean console, a visible restaurant canvas, and no horizontal overflow. Restaurant and journal screenshots at both widths were visually inspected and are in `baseline/`. Playwright owned the server on strict port 5466 and cleaned it up. The recorded Vite server PID 10096 terminated after the run.

These are existing-game baseline checks. Feature visits, transitions, reload migration, gifts through the actual apartment reducer, feature lookup/replay/fog behavior, and actual feature offline audio remain incomplete.

The coordinator independently verified merged main `8656b3c` at `/workspace/junyan-main-verification` using Node 22.23.4. Its 170-test suite, TypeScript build, and Vite production build passed. This verifies the documentation merge and existing game only.

## Next steps

1. Receive the remaining App, styles, and playback handoff and stable published feature heads. Fetch current main and inspect each feature API before integrating. Apartment API `c028b77` is published and inspected; it still has 47 missing voice references.
2. Add the concrete optional envelope to GameState, preserve it through next-day and the existing pending checkpoint, and validate only the affected feature on corrupt payloads.
3. Attach the real feature bundles through the completed content bridge, connect views and shared learning callbacks, and atomically reconcile gifts.
4. Generate and verify the real feature voices. The current cloud synthesis attempt is blocked by a Hugging Face proxy 403 and cold cache; the coordinator has requested configuration access.
5. Run the complete integrated journeys, normal-mode reload and old-save migration, offline asset and voice checks, and phone and desktop visual review. Obtain independent no-edit review before the central coordinator considers merging.

## Skills

Model the Domain selected the explicit location and gift types. Boundary Discipline kept save and content validation in pure boundary helpers. Make Operations Idempotent required gift receipt and corrupt-apartment restoration regressions. Prove It Works required the original browser journey and inspected screenshots. Sequence Work into Verifiable Units split state and content into tested commits.

The installed cloud Pstack copy has `show-me-your-work`, which supplied `decisions.tsv`. No upstream visual `show-me` skill was found. Baseline screenshots provide GitHub-compatible visual evidence without claiming new-feature completion. The coordinator owns all merges and independent review dispatch. Ticket reservations 0071 and 0072 were applied from coordinator commit `b5bf994` before updating the lease record.
