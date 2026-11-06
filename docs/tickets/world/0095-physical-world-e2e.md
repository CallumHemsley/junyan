---
id: 95
title: Migrate browser journeys to physical world controls
status: doing
priority: high
type: chore
created: 2026-11-06
---

## Why

Existing browser journeys still target removed table lists and location tabs.

## Done when

- Shared helpers walk through real doors and approach physical activity anchors.
- Existing serving, learning, activity, purchase, reload and offline assertions remain covered.
- Generated browser evidence stays outside tracked source pending public QA approval.

## Notes

- Owner: Codex local e2e worker. Branch: `codex/0095-physical-world-e2e`.
- Worktree: `/private/tmp/junyan-world-e2e`; dev port 5508, preview port 5509 (strict).
- Node v22.23.4 verified. Parent owns integration and cross-review.
- Private evidence: `/private/tmp/junyan-world-private-qa/e2e`.
