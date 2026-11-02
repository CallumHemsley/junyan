---
id: 39
title: Audit renderer motion and character readability
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
- Scope: Read-only product review. Own only ticket and docs/reviews/0039-render-review.md. Preserve accepted art and ZhangLaoshi exactly.
- Owner, branch, worktree, port and verification to be recorded by the assigned worker.
- Owner: independent Codex review sub-agent; branch `t3/0039-render-review`; worktree `/Users/callumhemsley/.t3/worktrees/junyan/t3-3282c862`; dev `5232`, preview `5233` (strict). Exact review baseline `21a4faaa8887dc8091f8d34ee70ad462ea472096`, product `5dfad159c8d3544efccdbaf6500b54f4d3562062`.
- Completed independent review: `docs/reviews/0039-render-review.md`. Verdict **ISSUES**: static reduced-motion/offscreen scenes keep rasterizing; parent received early reproduction and owns the correction. No product edits. No additional proven defects.
- Verification: 88 unit tests/build pass; 8 muted Chromium desktop/phone journey+scene tests and 3 WebKit silent-PCM journey tests pass. Inspected fresh five-character/eight-yaw pose sheets and real phone/desktop/phase renders; 40 exact ZhangLaoshi geometry/RGBA comparisons pass. Unmount stops drawing; offscreen does not. Learned: identical screenshots alone cannot prove a renderer stopped doing work. Review artifacts remain under ignored `output/playwright/0039/`.
- Browser ports: 5232 dev, 5233 preview. Strict port binding required.
- All browser runs must be silent. Chromium uses `--mute-audio`. WebKit uses the repository's valid silent PCM response fixture. Never change system volume.
- Preserve actual Pixel Plays engine, approved characters, Mandarin-only visible content, 85 WAVs, and calm UI. No dependencies, schema, lockfile, AWS, push or deployment changes in workers.
