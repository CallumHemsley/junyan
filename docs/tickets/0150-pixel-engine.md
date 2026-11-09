---
id: 150
title: Build the top-down pixel scene engine
status: doing
priority: high
type: feature
created: 2026-11-09
---

## Why

The new art needs a renderer: tile layers, depth-sorted sprites and actors, contact shadows, light, a camera, and a way to look at scenes in Node and the browser.

## Done when

- Pure-TypeScript compositor renders a scene and actors to an RGBA frame, deterministic and tested without DOM.
- Scene format, camera with integer zoom, collision from sprite footprints, light map.
- React view, a silent dev harness (sprite gallery and walkable scene), and a Node scene-to-PNG tool.

## Notes

- Style bible: [[design/pixel-art]]. Umbrella: ticket 0149. Proposed decision: [[decisions/0005-top-down-pixel-art]].
- Owner: Claude worker (Opus). Branch `claude/0150-pixel-engine`; worktree `/Users/callumhemsley/Personal/junyan-px-engine`. No dev server; review by Node-rendered PNG. Silent: no audio, no visible browser.
