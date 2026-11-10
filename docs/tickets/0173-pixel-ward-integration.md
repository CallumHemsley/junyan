---
id: 173
title: Play the hospital opening in the pixel ward
status: todo
priority: high
type: feature
created: 2026-11-10
---

## Why

The opening still renders the old ward scene.

## Done when

- `HospitalOpening` renders the pixel `ward` scene through `PixelView`, driven by `wardFrame`; DOM text and controls unchanged.
- Rules tests and the opening's Playwright journey pass; headless screenshots at phone and desktop.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
