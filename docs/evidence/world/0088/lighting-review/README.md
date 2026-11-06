# Independent lighting review — 74a5213

Exact source head: `74a52137814f8ed8c4a2b7f9c9f74089e4f6a15f`. No application changes; no integration checkout changes; no screenshot claim. `repro.cjs` extracts exact Git source and uses TypeScript's transpiler, then executes the production pure functions in Node. The atmosphere renderer receives a recording canvas-shaped context through the actual production proxy. Its captured style assignments prove the second transform, but do not measure final browser-composited pixels.

Run from repository root:

```sh
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/world/0088/lighting-review/repro.cjs
```

## P1: material result depends on previous draw order

`src/world/lighting.ts:8` returns strings found in an output set before consulting the input/exposure cache. With ambient `[.5,.5,.5]`, sun strength zero, inputs `#404040`, `#808080`, `#404040` produce `#202020`, `#404040`, `#404040`. The repeated input changes output. The shader cache at lines 3–5 retains that contaminated set across frames sharing a light state.

Exposure is also ignored on a collision: ambient .5, sun white, strength .5; shading `#404040` at exposure 1 produces `#909090`. Subsequently shading material `#909090` at exposure 0 returns `#909090`, while its correct ambient-only result is `#484848`.

Missing regression: same-material repeated output invariance before/after other material values that happen to produce that input; exposures 0 and 1 must stay distinct. Include equivalent RGB and hexadecimal material representations and warmed-cache calls.

## P1: global context proxy transforms already-lit effects and emissive colours

`src/world/painter.ts:33` replaces the context for the entire frame with `shadedContext`, so atmosphere draws at line 48 and object/foreground passes inherit it. `src/world/atmosphere/canvas.ts:13` supplies RGB strings, which are re-shaded by `lighting.ts:20`. They do not even benefit from the output-string heuristic, since shader outputs are hexadecimal.

Actual executed assignments for the lamp RGB `[255,224,153]` (authored in atmosphere/index.ts:146): morning `#f2dc9d`, evening `#d2bc90`, night `#8d9588`. The intended warm emissive source `#ffe099` is changed, most severely at night. Opacity separately already encodes lamp strength.

Actual executed assignments for grass already shaded at exposure .7 by atmosphere/index.ts:156: morning `[133,162,99]` becomes `#8ea76d`; evening `[119,139,92]` becomes `#78805f`; night `[75,107,83]` becomes `#304d50`. This is a second material lighting pass, not just a colour representation conversion.

Missing regression: call the actual atmosphere renderer through the production rendering boundary and assert effect/emissive RGB remains intact, alongside ordinary material shade application exactly once. Cover morning/evening/night and explicitly lit foliage, water/reflections and lamp particles. Final acceptance still requires actual integrated daytime/evening/local-light screenshots.

Writer action: use one explicit material callback in owned colour helpers and pass an unmodified context to already-lit atmosphere/effect drawing. Any temporary compatibility boundary must be explicit; colour values cannot encode provenance. Re-run the exact-source probes after the writer publishes its fix.
