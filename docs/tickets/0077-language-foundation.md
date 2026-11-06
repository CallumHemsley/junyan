---
id: 77
title: Prepare multilingual architecture and verify integration
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

- Owner: Codex orchestrator.
- Branch: codex/0077-language-foundation.
- Worktree: /private/tmp/junyan-0077-languages.
- Port: 5300; strictPort required.
- Reserved centrally before parallel work. User authorizes implementation, review and merge.
- Completed with three parallel GPT-6.1 Sol writers and independent UI/save, content/features, live browser and fix reviews.
- Node 22.23.4 verification: 332 unit tests, production build, 48 selected browser cases across development and production runners; independent six-case journey and two reduced-motion reruns passed.
- Review found and fixed repairs speaker metadata validation before merge. Existing authored JSON, audio assets and Mandarin save keys are unchanged.
- Learned: preserve authoring formats at the load boundary, use stable IDs for recovery, and include the production preview environment when running the offline gate.
- Guide: [[adding-a-language]]. Evidence: [[evidence/0077/README]].
