---
id: 77
title: Prepare multilingual architecture and verify integration
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

- Owner: Codex orchestrator.
- Branch: codex/0077-language-foundation.
- Worktree: /private/tmp/junyan-0077-languages.
- Port: 5300; strictPort required.
- Reserved centrally before parallel work. User authorizes implementation, review and merge.
