---
id: 160
title: Make the bistro mirror and fanlight convincing
status: todo
priority: medium
type: feature
created: 2026-11-10
---

## Why

The long mirror's reflection is a literal mini-picture of the room, which reads oddly. The fanlight's rays step unevenly.

## Done when

- `wall/mirror-long` reads as aged silvered glass: a soft, suggested reflection (light bands and a few dim shapes), foxing at the edges, a gilt frame.
- The fanlight rays in `wall/windows.ts` are evenly spaced and symmetric, with clean pixel stepping.
- Size and anchors unchanged; `tsc -b` and the pixel tests pass.

## Notes

- Part of the pixel-art polish pass after ticket 0157. Style rules in `docs/design/pixel-art.md`.
