---
id: 46
title: Independently recheck bounded startup and opener restoration
status: todo
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
