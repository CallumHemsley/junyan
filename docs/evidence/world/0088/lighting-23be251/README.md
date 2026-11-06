# Lighting fix recheck — 23be251

Exact head: `23be251185d989f7b97d36391a8f6478344b1a3b`. Previous failing evidence at `../lighting-review` remains unchanged. No application edits, checkout changes, browser run or final composited-pixel claim.

Run from repository root:

```sh
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/world/0088/lighting-23be251/repro.cjs
```

## Narrow fixes verified

The executable exact-source probe exits zero. The original order sequence now yields `#202020`, `#404040`, `#202020`. Exposure-zero material `#909090` now correctly yields `#484848`. Hex, RGB tuple and CSS RGB forms of the same material agree. `lighting.ts` no longer contains the output-colour set or context proxy.

Source `painter.ts:34` supplies an explicit `view.shadeColor` callback without replacing the context. Executing `drawAtmosphereLayer` with that raw context preserves lamp source `rgb(255,224,153)` and already-shaded grass in all three phases:

| Phase | Grass command and written style | Material #404040 callback result |
| --- | --- | --- |
| Morning | rgb(133,162,99) | #55544d |
| Evening | rgb(119,139,92) | #544c48 |
| Night | rgb(75,107,83) | #2b3340 |

This closes the reproduced colour-provenance heuristic defect and the tested raw atmosphere assignment boundary. It does not establish full integrated lighting acceptance.

## Open: owner material callback adoption absent in this exact integration

`git grep -n shadeColor 23be251 -- src/world` finds only foundation floor/box use (`painter.ts:20,25`), callback construction (`:34`) and the contract type. None of the four imported art adapters or actor adapters calls it at this head.

Concrete unchanged material paths:

- Courtyard `art/courtyard/index.ts:15,33`: fills/strokes use raw colour.
- Landscape `art/landscape/index.ts:5,18,36,39`: terrain/material surfaces use fixed colours, overwriting some foundation-shaded floors with phase-independent colours.
- Residential `art/residential/index.ts:285–287,303,310,316`: `colour` applies only fixed face-light multipliers, with no day-state callback.
- Workshop `art/workshop/index.ts:8,13,20–22,27–32`: fixed `css` face multipliers, no day callback.
- Residents/player `characters/adapter.ts:33,48–51`: draw commands are written as raw RGB; `view` supplies scale/projection but not material lighting.
- Wildlife `life/render.ts:6,20–46`: `LifeView` omits shadeColor and fur/feather colours remain fixed.
- Foundation fallback tree canopy `painter.ts:58` still writes unshaded greens while its trunk goes through the box helper.

These are source-confirmed adoption gaps, not claims of a measured screenshot failure. Preserve intentional unshaded emissive/effect drawing; do not reinstate the global proxy to mask missing material callbacks. Next checks: owners adopt one explicit callback in material helpers; compare actual same-scene morning/evening/night screenshots, including resident skin/clothes, trees, exterior facades, landscape terrain and local lamps; verify each material transforms once while effect colours remain intact.
