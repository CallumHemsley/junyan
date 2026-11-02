# 0046 — independent startup and focus recheck

## Verdict

**PASS for the requested0045 correction.** No actionable defect was established in the exact App change. The original native queued-open failure and actual WebKit opener-focus loss reproduce on the baseline, while the candidate passes the four-cell recovery suite. This is independent review evidence, **not** the parent's combined integration gate or authorization to merge/publish.

What this change does: a validated synchronous checkpoint restores immediately instead of waiting for IndexedDB. Without one, startup waits up to1500ms, then permits fresh play with the save warning and ignores late startup results. Focus/click capture remembers the real background opener before it becomes inert.

## Identity and scope

- Date:2026-11-02. Candidate/source parent: `3a74ba96a78183e10291fcaafc509c865c1fbda3`, supplied from `codex/0045-startup-and-focus`. Comparison baseline: `3158cc242f59803ad5b5a6a427838b86cfe53ad9`. Reviewer checkout: `/Users/callumhemsley/.t3/worktrees/junyan/t3-19696937`, branch `t3/startup-focus-recheck`.
- Reviewed `git diff 3158cc2 3a74ba9 -- src/App.tsx` and connected startup, dispatch/checkpoint, save, walking, modal, word-card and keyboard paths. The App diff is29insertions/17deletions; rules, save service and audio implementation are unchanged. The independently accepted immediate-reload correction is treated as existing baseline behavior, not a new reviewer-authored fix.
- Read AGENTS,0045/0046, ticket conventions, build recommendation stack/art, accepted decisions0001–0003, design system/tokens, chosen Morning Steam desktop/phone markup, character direction, and0044's report. Read pstack0.15.32 `principle-prove-it-works` and `principle-test-behavior-not-implementation`.
- Only this report and ticket0046 are tracked review changes. No product/test/config/dependency edits, other-worker checkout changes, children, push, deploy or AWS. The baseline was an unchanged `git archive 3158cc2` under this review's `/tmp` directory, not another worker checkout. Its App SHA-256 matches `git show 3158cc2:src/App.tsx`: `f6ef9fce31da5575f6fbc16aa0457bbb6bfd30ef77ff55c90c19ce31adc60606`.

## Findings and correctness checks

**No must-fix or should-fix product finding.** The following are verified behavior and explicit limits, not hypothetical defects.

### Startup and generation fencing

`src/App.tsx:111` reads and schema-validates the checkpoint before starting any load. At `src/App.tsx:122`, a valid checkpoint installs state and readiness immediately; there is no pending startup read to cancel in that branch. Malformed JSON and denied localStorage reads enter the existing warning path; schema-invalid snapshots are not installed. Native-browser checks cover malformed `{`, schema-invalid `{}`, an invalid position, denied reads with usable IndexedDB, and a valid checkpoint with every IndexedDB open denied, in both development and production across all four cells.

At `src/App.tsx:128`, `cancelled` fences an obsolete effect instance; `settled` fences both duplicate completions and results arriving after the deadline. Cleanup clears the timer at `src/App.tsx:140`. State is only installed by the winning completion. Normal readiness causes a render before user actions; `stateRef` follows that render. The existing save effect at `src/App.tsx:145` stays readiness-gated and only removes a checkpoint matching the snapshot actually saved.

The committed late-read test delays delivery of a **real native transaction's completion**, not a fabricated game-state promise. All four production cells retain the newly learned word after the late old result arrives. An additional development check seeds progress through the UI, lets StrictMode's first native read complete2500ms late while its second read succeeds, learns the word again, and verifies `听过 2 次` after that obsolete completion. All four cells pass; no game hooks or focus setters are used by these additional probes. `src/save.ts` still closes connections when the underlying load eventually settles; the App fence does not claim to abort native requests.

### Explicit timeout tradeoff — not lossless recovery

`src/App.tsx:138` implements an availability policy, not a recovery guarantee: without a valid checkpoint, a saved game that cannot return within1500ms is abandoned for this mount. The warning appears and late snapshots cannot replace newer play.

**The old durable record can also be overwritten.** After fresh startup, the unchanged350ms save debounce can persist that fresh state, even before further gameplay. I verified this directly in all four cells: learn 包子, wait for its native IndexedDB save and checkpoint removal, delay the next real read's completion2500ms, reload, observe the warning and empty journal, then read the actual database record and confirm its journal is `{}`. Late completion does not restore the old journal. This matches the task's explicit fresh-start tradeoff; it must not be described as preserving all old saves, or merely ignoring old bytes temporarily. The1500ms number is a chosen policy threshold, not a measured upper bound on every user's storage latency.

### Background opener and nested focus

`src/App.tsx:410` captures focus/click targets belonging to `.topbar` controls or `main button`, using `closest` so clicks on child content still identify the actual control. Capture runs before the action makes that background inert. Dialog-internal focus is outside those selectors, so nested word cards and replacement panels do not overwrite the remembered background opener.

At `src/App.tsx:236`, each outer dialog effect retains that remembered element rather than inspecting `document.activeElement` after inert changes. Cleanup only focuses a connected, non-inert element. The separate word-card effect at `src/App.tsx:245` still restores its own immediate trigger. Walking and table-to-kitchen transitions retain the background opener.

Candidate evidence is real keyboard navigation: Tab in Chromium; Option/Alt+Tab in WebKit; Enter activation; two Escape dismissals. Each of the four cells completes eight table/word/table/background cycles, then keyboard table-to-kitchen closure and Help closure. Assertions check actual active-element focus, not only modal visibility. There are no `.focus()` calls in the recovery test driver and no `window.__TEST__` game-state injection.

## Baseline discrimination

Built an unchanged3158cc2 archive in `/tmp`, sharing only the review's installed dependency directory read-only, with an isolated Vite cache. Ran the **same candidate test file**, restricted to queued-checkpoint and keyboard cases, against that baseline on the same strict5256/5257 ports after candidate servers stopped.

- **Native queue:4/4 baseline failures.** The holder page opens and retains a real connection, requests a real database deletion, and waits for its native `blocked` event. The game learns 包子 and immediately reloads while that deletion is blocked. On the baseline the subsequent open queues behind deletion, so 开门迎客 remains unavailable past the asserted three seconds despite a valid checkpoint. No fake `indexedDB.open` or synthetic `onblocked` notification drives this reproduction.
- **Keyboard: Chromium desktop/phone pass; WebKit desktop passes this particular run; WebKit phone fails opener return.** Overall baseline result:5failed/3passed in37.9s. This preserves the intermittent nature of the prior finding rather than claiming deterministic failure in every WebKit context.
- A separate native WebKit observer using only keyboard activation records the active element immediately after dismissal. Its first desktop/phone pass restored all16cycles; its next fresh desktop attempt records **BODY, no label, `openerFocused:false` on cycle0**. Both observations are retained. This independently establishes actual BODY loss, not an inference from an inactive locator.

The parent-supplied `output/verification/0045/baseline.log`, source metadata and baseline-artifact inventory were also inspected read-only. They corroborate the original two-engine queue failures and WebKit desktop focus failure, but do not substitute for the executions above.

## Executed verification

Evidence root: ignored `output/verification/0046/`. Live evidence and temporary verification drivers stayed at `/tmp/junyan-0046-recheck-3a74ba9` until every owned server stopped; only then were artifacts copied into the checkout. No evidence HTML/config/screenshot writes occurred inside Vite's watched tree during browser verification.

| Check | Result | Evidence |
| --- | --- | --- |
| `pnpm test` |110/110,6files | `units.log` |
| `pnpm build` |PASS | `build.log` |
| Unchanged recovery spec, all4engine/viewport projects |16/16,63.0s | `recovery.log`, `recovery.json`, `recovery-results/` |
| Additional checkpoint/denial/StrictMode/timeout probes, all4cells |48/48,117.7s | `extra.spec.ts`, `extra.log`, `extra.json` |
| Affected Chromium desktop/phone regressions |57passed,2skipped,240.1s | `regression.log`, `regression.json`, `regression-results/`, `output/playwright/` |
| Exact baseline negative control |5failed/3passed,37.9s | `baseline.log`, `baseline.json`, `baseline-results/` |

Affected regressions are `overlay-focus`, `overnight-keyboard`, `waiter`, `save`, `offline`, and `overnight-offline`. They cover full customer/service/change/journal journeys, save corruption, immediate reload with native and aborted writes, nested focus, cancellation, and service-worker offline reload. The fresh offline checks compare all85audio files with repository bytes. The two skipped rebuilt-release cases are explicit opt-ins requiring port5217; I did not enable them or use that port. Existing hook-assisted setup in some broader regressions is not presented as the no-hook startup/focus proof.

The external recovery wrapper preserves all four projects from `playwright.recovery.config.ts` and changes only verification plumbing: strict server commands, external logs/caches/artifacts, and `serviceWorkers:'block'` so WebKit WAV routing cannot be bypassed by a service-worker response. It does not change product or test assertions. A preliminary16-pass run without that additional service-worker block is retained as `recovery-initial.log` but is superseded and not counted as silence-certified evidence. The service-worker regressions run separately in launch-muted Chromium with workers enabled. WAV fixtures use valid silent PCM; no stored WAV or system volume was changed.

Phone/desktop screenshots from both engines were opened and inspected: the restored journal contains 包子, final Help focus is visible, Mandarin DOM text remains legible, the accepted restaurant/cast remain intact, and the phone layout does not overflow. These are regression observations, not a new art approval. All48additional probes assert no page errors or console errors; affected suites also retain their existing clean-console assertions. The committed recovery keyboard case itself checks page errors, not all console messages; it is not misreported as a broader diagnostic assertion.

## Setup, reproduction and limits

- Node22.23.4, pnpm10.34.8, Playwright1.64.1. `pnpm install --offline --frozen-lockfile` reuses109local-cache packages without manifest/lockfile changes. The ignored esbuild build-script notice and Rollup third-party annotation warnings are retained; successful units/build demonstrate that they did not prevent these checks.
- All servers run from this checkout or this review's exact `/tmp` baseline archive, never from the project root or another worker checkout. Ports5256dev/5257preview only, `strictPort`, `reuseExistingServer:false`; `JUNYAN_DEV_PORT=5256 JUNYAN_PREVIEW_PORT=5257`. Both ports were confirmed free before evidence copy. The first standalone baseline observer attempt found its already-stopped server and failed to connect; the subsequent owned baseline preview executions supply the reported focus observations.
- Rerun with the retained external config, for example: `JUNYAN_DEV_PORT=5256 JUNYAN_PREVIEW_PORT=5257 ./node_modules/.bin/playwright test --config /tmp/junyan-0046-recheck-3a74ba9/playwright.config.mts`. Run from the `/tmp` evidence directory using the absolute local executable to keep older specs' relative screenshot paths outside Vite. Build this checkout first. The extra/regression/baseline configs and observer are retained alongside their results; their absolute paths intentionally identify this review environment.
- Not certified: hardware Safari/iOS, Firefox, audible Mandarin quality, arbitrarily slow devices, hostile process/OS termination, long-term multi-tab write-conflict policy, or preserving inaccessible durable progress after the accepted timeout. No standalone cancellation/unmount browser case beyond StrictMode is claimed; cleanup was also inspected directly. The parent's independent full suite remains the combined gate.
- The review-only receipt contains exactly ticket0046 and this report; its SHA is returned in the handback. Protected source/content/test/config/dependency paths match3a74ba9 (`source-identity.log`).
