---
id: 40
title: Break the core learning game journeys
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

- Owner: independent Codex review worker; branch `t3/review-core-learning-game` (initially `t3/15b4a382`); worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-15b4a382`.
- Started 2026-11-02; reviewing baseline `21a4faa` / product `5dfad15`. Own ports 5236 (dev) and 5237 (preview), both strict. Product remains read-only.
- Review result: **ISSUES**. Report: `docs/reviews/0040-adversarial-review.md`. Proven immediate-reload lookup loss was sent early to the parent, repeated twice in production phone UI, and assigned to the 0037 App writer. No product fixes made here.
- Real no-hook desktop/phone paths served four customers with change, rejected wrong food and partial day-two quantity, recovered from full trays, exercised nested lookups and reloads, and served day two offline in production Chromium. Silent-PCM WebKit phone also served three customers and reloaded successfully.
- Verification: 88 unit tests and build passed; existing silent Chromium suite 71 passed / 2 dedicated-policy skips. Local reproducible user-path script, screenshot pairs, JSON and traces retained under `output/0040/`; only report/ticket committed. Reused installed root dependencies without installing packages.
- Learned: a test that waits for IndexedDB before reload misses the visible word-card promise during the 350ms save debounce. Findings remain against the exact baseline, not later writer fixes.

- Baseline: `5dfad15`.
- Scope: Read-only product review. Own only ticket and docs/reviews/0040-adversarial-review.md. Exercise service, recall, learning, reload and interruptions.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Browser ports: 5236 dev, 5237 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.
