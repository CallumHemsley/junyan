---
id: 39
title: Audit renderer motion and character readability
status: todo
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
- Scope: Read-only product review. Own only ticket and docs/reviews/0039-render-review.md. Preserve accepted art and ZhangLaoshi exactly.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Browser ports: 5232 dev, 5233 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.
