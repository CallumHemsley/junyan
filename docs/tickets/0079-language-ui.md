---
id: 79
title: Extract language presentation and interface copy
status: done
priority: high
type: chore
created: 2026-11-06
---

## Why

Make additional learning languages an authored content task rather than a rewrite, while preserving Mandarin gameplay.

## Done when

- Language-specific assumptions live at explicit boundaries; stable IDs drive rules.
- Current Mandarin behavior and saved progress remain intact.
- Focused behavioral checks, existing tests and build pass; integration is independently reviewed.

## Notes

- Owner: Codex GPT-6.1 Sol worker.
- Branch: codex/0079-language-ui.
- Worktree: /private/tmp/junyan-0079-language-ui.
- Port: 5304; strictPort required.
- Reserved centrally before parallel work. User authorizes implementation, review and merge.
- Extracted root game, hospital, ambience and restaurant scene copy into `src/language/ui.ts`, including labels, money, days, counts and document title.
- `WordLine` renders authored tokens through the active language policy. `WordToken` displays neutral text. Pronunciation is optional and remains available only in the lookup card.
- Set document language and direction from the active policy. Mandarin keeps its existing labels, spacing, audio and save keys.
- Verified with `pnpm exec vitest run src/language/ui.test.ts`. All five tests pass, including real French word and dialogue rendering with accents, spaces, apostrophes and punctuation.
- Integration build, journey screenshots and independent review belong to ticket 0077 after the parallel slices merge.
- Learned that the presentation seam needs both token spacing and an interface catalog. Renaming the word properties alone would retain Mandarin sentence and formatting assumptions.
