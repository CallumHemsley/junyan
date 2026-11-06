---
id: 78
title: Separate language policy from content contracts
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
- Branch: codex/0078-language-content.
- Worktree: /private/tmp/junyan-0078-language-content.
- Port: 5302; strictPort required.
- Reserved centrally before parallel work. User authorizes implementation, review and merge.
- Runtime words use `text` and optional `pronunciation`. Mandarin authoring keys stay at the loader boundary, preserving existing audio tooling and saved word IDs.
- Language policy owns script validation, provider language names and token presentation. Parsed packs always receive the selected policy ID.
- Added an authored French fixture that validates accents and apostrophes, preserves spaced tokens, completes the opening and serves four customers with change and journal recovery through the existing pure rules.
- Added `docs/adding-a-language.md` covering content, voices, feature and UI catalogs, static metadata and verification. Fixture audio is explicitly test-only.
- Verification before integration: 45 content and multilingual tests passed. Mandarin audio file and manifest checks remain green. Parent owns final integrated build, browser checks and independent review.
- Learned: adapting the authored JSON once avoids regenerating audio or migrating vocabulary IDs. A pack needs coordinated copy, features and metadata as well as a neutral schema.
