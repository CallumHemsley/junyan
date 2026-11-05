# Retry fixture sequencing: no product change

## Root report

Root's combined main/doctor/props/0063 run completed **38 PASS / 2 FAIL out of 40**. Both failures were the same ambience resource-retry test on desktop and phone: the explicit retry locator waited after the error UI had disappeared. Root's trace reported one owner, only **two** native attempts (initial NotSupportedError, then playing), currentTime ≈16.45 and duration73. This is root-relayed evidence; its remote trace was not read locally by this worker. Other native/offline, five doctor offline/replay, full opening/four customers/change/journal/save and word-switch/rapid cancellation cases passed both surfaces according to root. The combined run is not described as green before this correction is applied/rechecked by root.

## Exact boundary and diagnosis

Production listens to document **click capture**, not pointerdown. Every trusted gesture calls the existing controller gesture path. Opening settings is therefore already a legitimate second retry. The old fixture treated visible error text as proof of a settled current failure, but it could still be the first attempt's error while the settings-triggered attempt was pending. Removing the abort route in that window could let attempt two succeed and remove the button before an explicit locator click began. Root's two-attempt/native-already-playing trace supports this fixture explanation, not a playback failure.

A temporary diagnostic asserted that settings opening would leave only one attempt; it failed quickly with **expected1/received2**, and native evidence recorded attempt1 NotSupportedError + attempt2 pending. The diagnostic's expectation was a probe of an incorrect assumption, not a product contract or a regression assertion to preserve. It was removed rather than changing the product to satisfy it. Actual output is retained in `retry-boundary-diagnosis.txt`, with this explanation to avoid calling that diagnostic failure a product defect.

## Minimal correction

Only the existing case in `e2e/ambience.spec.ts` changes:

1. Wait for initial native rejection.
2. Hold the second intercepted request behind a fixture gate, open settings normally, and verify the first error is visible **while attempt2 is pending**. This deliberately exposes the stale-error boundary.
3. Release/abort attempt2 in finally, then await its native rejection before removing the abort route.
4. Click 重试 normally. Require attempt3 playing, exactly three attempts and one owner; retain the existing successful foreground speech, hidden error and expected-resource-console assertions.

The gate is always released, even on an assertion failure. No force click, new timeout, ignored exception, weakened prior assertion or production/global-gesture/mix change. The new helper only waits for a native attempt's recorded rejection; it does not clear application errors or alter playback. Source/asset hashes remain unchanged from verified7779574; see `retry-sequencing-source-sha256.json`. The old full-suite manifest is historical for the original test source, not overwritten to imply the changed fixture ran in that earlier suite.

## Focused execution and review

Command (same strict ports and silent system Chromium):

```sh
pnpm_config_verify_deps_before_run=false JUNYAN_DEV_PORT=5414 JUNYAN_PREVIEW_PORT=5415 pnpm exec playwright test --config docs/evidence/0063/playwright.config.ts e2e/ambience.spec.ts --grep 'resource failure retries' --repeat-each=3
```

- Initial corrected focused pair: **2/2 PASS in15.2s**, `retry-sequencing-results.txt`.
- Three repetitions per platform: **6/6 PASS in27.4s**, `retry-sequencing-repeat-results.txt`.
- Final native observations: `retry-sequencing-observations.json`; all six have one owner, two rejected attempts then third playing, with foreground speech active and ducking intact.
- Independent focused static review found no concrete defect: gate demonstrates the stale error/pending attempt, finally releases it, waiting on rejection before unroute removes the sequencing window, and original assertions remain intact. Reviewer did not independently execute tests or inspect root's remote trace.

No full suite was rerun for this test-only delta, per root's instruction. Latest fetched origin/main is bca768d (doctor/props now landed); this held writer runtime was not changed or merged merely to fix a fixture. Root owns final combined confirmation/delta review and central merge/lease handoff. User-accepted calibrated source/default .35 and gains .1575/.042 remain unchanged. No merge or full-session listening claim.
