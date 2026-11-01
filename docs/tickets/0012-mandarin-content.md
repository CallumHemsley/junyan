---
id: 12
title: Provide validated Mandarin waiter content and offline audio
status: done
priority: high
type: feature
created: 2026-11-01
---

## Why
Keep language learning central as orders grow harder.

## Done when
Validated segmented JSON supplies food words, voiced orders at three levels, word audio and reactions.

## Notes
Owner: Sol 6.1 medium implementation worker. Branch: `t3/0012-content-audio`.
Worktree: `/Users/callumhemsley/.t3/worktrees/junyan/t3-68c4fa0b`. Port: 5176.

Completed: exported `content: Content` and `contentSchema` from `src/content/index.ts`.
Authored pre-segmented JSON for seven foods, twelve orders (four per level), fixed
regular/table assignments, and 多谢 / 再试试 reactions. Level 1 uses one item,
level 2 introduces doubles or pairs, level 3 requests three kinds within six items.
Integer prices and 5/10/20 payments cover each order with nonnegative change.

Generated 34 local mono AAC/M4A clips with installed macOS Tingting, covering every
word and full line. Reproduce with `node scripts/make-audio.mjs`. No exact older
recordings matched the new text, so all clips were generated offline. Learned:
`say --file-format=m4af` alone writes PCM; `--data-format=aac` is required for
browser-friendly AAC. See `public/audio/README.md` for provenance and limitations.

Verification: seven Vitest tests pass; TypeScript passes with
`pnpm exec tsc --noEmit --incremental false`; every clip decoded to nonempty mono
PCM via `afconvert`; `git diff --check` passes. Production build reaches Vite but
cannot resolve the scaffold's missing `src/main.tsx`. Playwright journey,
phone/desktop screenshots and browser console checks await parent UI integration.
Audio is prototype quality, uses one shared voice, and needs native-speaker review.
No shared contracts, dependencies, lockfiles or UI files changed.
