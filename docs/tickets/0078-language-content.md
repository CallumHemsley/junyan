---
id: 78
title: Separate language policy from content contracts
status: doing
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
