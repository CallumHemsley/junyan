---
id: 42
title: Keep acknowledged progress through immediate reloads
status: done
priority: high
type: bug
created: 2026-11-02
---

## Why

0040 reproduced a non-test phone data-loss race: fresh seed 42, visit table 1, wait more than 600 ms, tap 包子, immediately reload. The card says 记在本子里, but the journal is empty because the IndexedDB save is debounced 350 ms.

## Done when

- An acknowledged lookup survives immediate reload in a real non-test browser.
- Recovery does not depend on an asynchronous unload/pagehide transaction.
- Existing validation, IndexedDB saves, audio and modal focus remain intact.

## Notes

- Number 0042 explicitly reserved by the parent for this extension of 0037. Same worker, branch, worktree and strict ports 5224/5225. Own `src/App.tsx`, `e2e/overnight-keyboard.spec.ts` and this ticket only; do not edit 0033's `src/save.ts`.
- Existing `validateSavedGame` export can validate a synchronous recovery checkpoint; no save-module API change is needed.

### Reproduction and correction

- Independently reproduced on non-test phone Chromium: both normal writes and deliberately aborted IndexedDB writes lost 包子 after immediate reload (`output/playwright/0037/baseline-reload.log`, `baseline-reload-results/`). No `window.__TEST__` hooks are present in these sessions.
- App now checkpoints substantive reducer results synchronously in localStorage before acknowledging them in React. Movement does not write a checkpoint on every animation frame. IndexedDB remains the regular debounced save destination; recovery uses the existing complete-state validator and falls back to IndexedDB for malformed/invalid checkpoints.
- After IndexedDB commits, only a checkpoint exactly matching that saved snapshot is cleared, so an older asynchronous completion cannot erase a newer action. If a synchronous checkpoint write fails, discard the obsolete checkpoint where storage permits and show the existing save warning; otherwise that obsolete recovery state could mask a later successful IndexedDB save. This additional quota-path defect was reproduced before correction (`baseline-quota.log`).
- No unload/pagehide flush is used. If storage itself is denied/full, immediate durability cannot be promised; the existing visible save warning reports that limitation. No new backend, schema, dependency, save-module API or audio behavior is introduced.

### Regression evidence

- Final result: **PASS (implementation verification)**. All ten new non-test save/recovery cases pass across desktop and phone within the final selected suite (92 passed, 2 unrelated autoplay-policy skips). Units remain 88/88 and the production build passes. Independent cross-review remains required before integration.
- Real non-test desktop and phone sessions immediately reload after the first lookup, then repeat a lookup and immediately reload again; the journal retains 包子 and its lookup count of two. The same journey passes with every IndexedDB write deliberately aborted.
- Invalid JSON and invalid-schema recovery records both fall back to a valid existing IndexedDB save. Successful commits clear the matching checkpoint. A simulated localStorage quota failure must not allow an obsolete checkpoint to override a newer IndexedDB commit.
- Commands, strict-port harness, final validation results and review gaps are recorded in [[0037-keyboard-usability]].
