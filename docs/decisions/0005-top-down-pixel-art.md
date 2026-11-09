---
id: 5
title: Top-down hand-finished pixel art, authored as code
status: proposed
created: 2026-11-09
tags: [decision, art, rendering]
---

Callum asked on 2026-11-09 for the graphics to be rebuilt from the ground up to Stardew Valley quality or better, starting with the cafe, and allowed discarding the existing rendering.

Proposed: replace the isometric software rasteriser of decision 3 with three-quarter top-down pixel art on a 16px tile grid. Sprites are authored as deterministic TypeScript drawing code over one locked palette (`src/pixel/kit`), baked at start-up, and composited by a pure-TypeScript renderer that runs identically in Node and the browser. The style bible is [[design/pixel-art]].

Kept from decisions 2 and 3: TypeScript, React DOM for all dialogue and Chinese text, pure rules, schema-validated content, offline audio, IndexedDB saves, deterministic test hooks, the waiter loop.

Changed: the camera (isometric to top-down, so movement keys become cardinal), the art pipeline, and the vermilion rule's reach: the UI vermilion still marks only words, while scene art may use a separate lacquer-red ramp sparingly.

Costs: every map's art is redrawn and map geometry is re-authored for the new camera, one area at a time, cafe first.
