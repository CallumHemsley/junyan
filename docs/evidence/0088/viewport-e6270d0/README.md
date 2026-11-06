# Published viewport runtime review

Exact product head `e6270d095dead66ccb1d6fe9fb1815bbee86d702`, built in detached cloud checkout `/workspace/junyan-review-integration`. TypeScript/Vite build passes with existing annotation/chunk warnings. Source remains unmodified. This is the first published runnable viewport, containing only the placeholder restaurant; other owner maps/art are not present. It is not full integration or visual acceptance.

2/2 desktop/phone normal-opening journeys passed: held keyboard movement from spawn to service anchor, real contextual service button, world remains rendered behind activity panel, close controls, saved position and reload equality. No page errors. `walking-results.json` is authoritative. Initial review-runner error read the debounced opening save too early; retained initial-runner-error.json, corrected by waiting for initial save and acknowledging world coordinates initialize on first action. No product fix occurred. Screenshots at entry, after walking and during activity were inspected.

2/2 edge observation journeys completed. Desktop used held ArrowDown; phone used native Chromium Input.dispatchTouchEvent touchStart/touchEnd on the actual visible pad for five seconds. Both moved to the reachable southeast edge, with saved positions in *-edge.json. This establishes one held touch direction, not the complete touch/cancel/multitouch matrix. `results.json` contains this edge run, separate from walking-results.json. Videos retained; audio launch-muted, no listening claim.

## Findings

- P2 visual acceptance, WorldViewport.tsx:42 camera always focuses player. At southeast edge, inspected desktop-edge.png and phone-edge.png show roughly the lower half of the play surface as featureless green void. The camera does not reframe at map bounds. Foundation has independently acknowledged placeholder/framing work; recheck next head, do not close from author claim.
- P2 learning contract, WorldViewport.tsx:57 and world.css .world-place. Rendered location text is a DIV with no token buttons and computed pointer-events:none on both viewports. This confirms the root's untappable-label observation in actual DOM. Nearby action labels are plain strings in source; recheck segmented registered word/replay interaction in next integration. No new audio generation is required.
- Overall visuals remain blockout quality: flat oversized counter/table boxes, one stylized plant, no inhabited restaurant ensemble, large void, constrained desktop shell. Movement progress does not constitute an improvement over accepted baseline art. Preserve/reintegrate art quality while expanding exploration.
- Phone activity panel remains over the world and keeps player near its top edge; screenshot shows substantial lower-world occlusion and internal clipping of service-strip content. No complete service interaction/focus/scroll audit has run for this head; this is a required follow-up, not a confirmed inaccessible-control defect.

Occlusion.rect/height concern cannot be reproduced with custom owner objects here because no custom art modules are present. Real actor/object interleaving and local-overlap fade criteria remain unverified pending integrated maps. Per-frame checkpoint costs are being measured separately. Cross-region route, saved return points, NPC traffic, weather and production large-map click latency remain open.

Rerun from review repository root with the exact integration build available:

```
PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers /workspace/.junyan-tools/node_modules/node/bin/node node_modules/@playwright/test/cli.js test --config docs/evidence/0088/viewport-e6270d0/viewport.config.ts
```

The config owns strict port5490 and cleanup is Playwright-owned. Local trace ZIPs are retained but not published; source/scripts, JSON, screenshots and videos are published. No implementation edits.
