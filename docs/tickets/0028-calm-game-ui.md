---
id: 28
title: Simplify the interface around the restaurant
status: todo
priority: high
type: feature
created: 2026-11-01
---

## Why

Callum finds the information around the restaurant overwhelming and explicitly requested another implementation agent to revamp it. The restaurant and the next useful action should have a clear visual hierarchy; supporting information should be available when needed.

## Done when

- The game scene is the primary focus on desktop and phone, with substantially less repeated always-visible copy and competing panels.
- Day/progress, carried food, customers, Help and journal remain discoverable without a dashboard of equally weighted details. Recall difficulty must not be weakened by exposing orders outside their existing dialogue flow.
- Existing Mandarin-only, tap-to-learn, voiced Help, focus/overlay lifecycle, 44px controls and reduced-motion behavior are preserved.
- Real Pixel Plays rendering and the four authored voices stay in place; no game-rule, content/schema, audio playback, save or engine changes are needed for the layout revamp.
- Appropriate unit/build and muted browser journeys pass; desktop, 390px and 320px screenshots are inspected, console is clean, and keyboard/touch access to newly disclosed UI is verified.

## Notes

- Reserved centrally by parent on `codex/0018-character-voices`; owner Sol 6.1 medium implementation worker in an isolated worktree.
- Audio orchestrator is still working on playback lifecycle in `src/App.tsx`; UI ownership is limited to layout/markup/styles and disclosure state. Preserve the existing playback wrapper and effects, save loader, movement logic and fixed focus/inert/one-layer Escape behavior.
- Baseline includes tickets 0025/0026/0027 and accepted renderer 0022. Use strict isolated ports 5191 (dev) / 5192 (preview). All browser launches must be explicitly silent, without changing system volume.
- Cross-review and parent integration required before publication. Do not push, open a PR or deploy.
