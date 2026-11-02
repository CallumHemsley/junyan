---
id: 33
title: Harden saved progress recovery
status: done
priority: medium
type: chore
created: 2026-11-02
---

## Why

Callum requested ten Sol 6.1 medium agents to improve Junyan using pstack, with silent verification and a consolidated morning result.

## Done when

The assigned slice has reproducible evidence, scoped changes where warranted, and an honest PASS, ISSUES or BLOCKED report. Product fixes require independent review before integration.

## Notes

- Baseline: `5dfad15`.
- Scope: Own src/save.ts and src/save.test.ts only. Preserve valid journals and historical saves.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Owner: Codex implementation sub-agent; branch `t3/save-recovery` (started as `t3/e1c689af`); worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-e1c689af`; ports 5208 dev / 5209 preview (strict).
- Starting commit: `21a4faaa8887dc8091f8d34ee70ad462ea472096`; product baseline `5dfad15`. Applying pstack behavior-only tests and direct verification; only demonstrated save bugs will be changed.
- Browser ports: 5208 dev, 5209 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.

## Result — PASS

- Starting commit: `21a4faaa8887dc8091f8d34ee70ad462ea472096`; exact product baseline: `5dfad159c8d3544efccdbaf6500b54f4d3562062`. Baseline suite reproduced: 88/88 passing. The save implementation was identical at both baselines.
- Demonstrated bug 1: a blocked IndexedDB open never settled, preventing the application's load finalizer from making saving ready. Both load and save now reject the blocked request; an eventual connection is closed instead of leaked.
- Demonstrated bug 2: a successful read request was restored before its transaction committed; a subsequent abort was ignored. A read aborted without a request error also never settled. Loading now waits for transaction completion and rejects transaction errors/aborts.
- No validator/schema changes: existing cross-field rejection remains intact. Positive regressions preserve the baseline v1 receipt/journal format, retired journal IDs, fractional timestamps, multi-day earnings, stale receipts, and the legitimate earlier-table receipt retained during another customer's wrong-change response.
- Red evidence: `output/save-recovery/red-tests.log` records four failures before the fix (two blocked-open timeouts, premature restore after read abort, and abort-without-request-error timeout).
- Focused regression: `pnpm exec vitest run src/save.test.ts` — **49/49 passed**; `output/save-recovery/focused-tests.log`.
- Full suite: `pnpm test` — **106/106 passed**; `output/save-recovery/final-tests.log`. Build: `pnpm build` — **passed**; `output/save-recovery/build.log` (non-fatal upstream Zod annotation warning).
- Browser regression: `pnpm exec playwright test --config output/save-recovery/playwright.config.ts` — **14/14 passed**, desktop and phone, Chromium `--mute-audio`, strict dev port 5208. Covers corrupt saves, valid completed-day reload, journal/earnings retention, all four customers, change, next day and journal reload; existing console/page-error assertions passed. Screenshots inspected: `output/playwright/save-desktop-restaurant.png`, `output/playwright/save-save-phone-journal-next-day.png`. Log: `output/save-recovery/browser-journeys.log`.
- Direct native IndexedDB probes: `pnpm exec playwright test --config output/save-recovery/browser-probes.config.ts` — **3/3 passed**. Aborting a real read rejects without changing the stored journal; a forced version-2 upgrade blocked by a held native version-1 connection rejects and releases its late connection (confirmed by successful deletion); denied storage leaves the UI playable with its save warning. Reproducer: `output/save-recovery/browser-probes.spec.ts`; log: `output/save-recovery/browser-probes.log`.
- Evidence/configs live under ignored `output/`, not product source. No preview server needed. Test-runner browsers and dev server stopped; ports 5208/5209 checked free. No children, push, deployment, AWS, system-volume, dependency/lockfile, content or audio changes.
- Independent review remains required before integration; this implementation worker did not launch a reviewer. Lesson: an IndexedDB request succeeding is not proof that its transaction committed.
