---
id: 45
title: Bound startup recovery and retain modal openers
status: doing
priority: high
type: bug
created: 2026-11-02
---

## Why

Independent0044 review proved that a real queued IndexedDB open can prevent checkpoint restoration indefinitely, and WebKit sometimes captures BODY after modal background becomes inert.

## Done when

Reproduce both before fixing; playable startup has a bounded fallback with late-load fencing; a valid checkpoint restores without waiting for IndexedDB. Real keyboard opener focus survives nested word/table and kitchen closure on Chromium/WebKit. Unit/build/journeys and independent cross-review pass.

## Notes

- Owner: parent, branch codex/0045-startup-and-focus, root checkout; ports5244/5245 strict.
- All Chromium muted; WebKit valid silent PCM responses. No WAVs/system volume/dependencies/renderer/rules changes.
- Baseline3158cc2 includes independently accepted0037/0042 behavior plus0044 findings. No publication until combined gate passes.

- Baseline proof: three failures (Chromium/WebKit valid-checkpoint queued open, WebKit opener restoration), one Chromium focus pass; real queued deletion/retained connection, actual keyboard controls. Baseline artifacts retained separately at output/verification/0045/baseline-artifacts/.
- Fix: restore validated checkpoints immediately; otherwise bound startup to1500ms, retain the existing save warning on fallback and fence all late reads. Capture background opener on focus/click before inert changes and preserve it across walks/replacement panels.
- Tradeoff: when there is no checkpoint and IndexedDB cannot return within1500ms, play starts fresh with the save warning. The inaccessible old snapshot is ignored for this mount rather than overwriting later play; no promise of salvaging inaccessible bytes. Pending IDB operations still close naturally if they eventually settle.
- Candidate proof:110unit tests/build pass;16/16 real Chromium/WebKit desktop/phone checks pass, including eight nested keyboard cycles per context, kitchen/Help closure, checkpoint/no-checkpoint native queues, and delayed native read-completion delivery. Screenshots inspected. Normal-browser regression command retained as playwright.recovery.config.ts. Silence uses launch-muted Chromium and valid PCM responses in WebKit; no stored audio edits.
- Source/test candidate awaits0046 independent review; no push/deployment.
