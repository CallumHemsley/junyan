---
id: 46
title: Independently recheck bounded startup and opener restoration
status: done
priority: high
type: chore
created: 2026-11-02
---

## Why

The parent fixed the two concrete0044 inherited findings after independently reproducing both. Cross-review is required before merging0045.

## Done when

Review parent0045 exact App diff, prove the original native queued-open and actual WebKit keyboard-focus cases, inspect timeout generation fencing and checkpoint handling, and rerun meaningful regression checks. Report defects without editing product/tests.

## Notes

- Reviewer Sol6.1medium, managed isolated checkout, strict5256dev/5257preview ports. Record branch/worktree on start.
- No children/product edits/dependencies/push/deploy/AWS. Every Chromium muted; WebKit valid silentPCM for every playable WAV; no systemvolume or audiofile changes.
- Own only this ticket and docs/reviews/0046-startup-focus-recheck.md. Retain clear gaps, not inferred passes.
- Started at exact parent `3a74ba96a78183e10291fcaafc509c865c1fbda3`; reviewer branch `t3/startup-focus-recheck`, worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-19696937`. Review compares `3158cc2` to that parent. Runtime evidence and isolated Vite caches live at `/tmp/junyan-0046-recheck-3a74ba9`; ports 5256/5257 only.
- Result: **PASS for the requested0045 scope**, with no actionable product defect found. Report: `docs/reviews/0046-startup-focus-recheck.md`. This is not the parent's combined integration gate.
- Independently verified110unit tests/build,16native recovery checks across Chromium/WebKit desktop/phone,48additional checkpoint/denial/StrictMode/timeout checks, and57affected Chromium regressions. Two opt-in rebuilt-release checks remain skipped because they require a different exclusive port.
- Exact3158cc2 archive comparison: queued-checkpoint startup fails in all four cells; Chromium keyboard passes; WebKit focus is intermittent. Independent repeat records actual `document.activeElement.tagName === "BODY"` after keyboard dismissal on WebKit desktop. Candidate passes eight nested cycles per cell plus kitchen/Help closure without focus setters or game hooks.
- Learned: the1500ms fresh-start policy can overwrite an old durable IndexedDB save after the existing350ms save debounce. This is the explicit availability tradeoff, not a guarantee of preserving a late old snapshot; verified against native persisted journal data and documented in the report.
- All runtime output stayed outside Vite's watched root. After owned servers stopped, evidence was copied to ignored `output/verification/0046/`; phone/desktop screenshots were inspected. Only this ticket/report are tracked reviewer changes. No children, push, deploy, AWS, audio-file or volume changes.
