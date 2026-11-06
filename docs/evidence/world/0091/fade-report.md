# Actual actor behind each canopy — fade integration gate

**Direct inherited-alpha drawing accumulates enough opacity to defeat the intended fade.** Keep the accepted artwork;0084 should evaluate a caller-side isolated whole-object fade (or another approved equivalent) before accepting the integrated App player-behind-canopy behavior. This study changes no production source, renderer, dependencies, shadows, terrain or colliders.

Production source `foliage.ts` remains byte-identical to0c13250, SHA256 `2209e85dc883987a092488e3cae8c1f939e9ea830db1b9ad61bebc84de2b2b96`. Context `globalAlpha` is preserved correctly; it applies to each span, so repeated source-over operations produce this opacity accumulation. The earlier context-preservation check does **not** establish whole-object fade correctness.

`fade.html` / `fade.ts` use the same production1b42875 camera, ground, light and actual player. Phone CSS390×620 / backing195×310 / unit11 / display2×, no interaction-panel inset. `cameraForMap` focuses actual actor `{x:40.6,y:18.6}`; tree foot `{x:44,y:22}`. Relative actor-foot position is approximately native(0,-61), so the actual player's head/body sit behind each crown. Production `canStand` passes actor radius.22 and tree-foot radius.5; depth order actor59.2 before tree66 agrees with the existing world-depth convention. No trunk collider is enlarged.

Each alpha/species has two PNGs: `fade-{species}-{0.3|0.5}-{direct|group}.png`. Direct uses the unchanged `drawFoliage` with inherited alpha. Group draws identical foliage opaque into an evidence-only offscreen canvas, then composites that image once with requested alpha. This is a diagnostic reference, not a new production renderer or a settled production cache design. Exact source-over edge quantization can change a few low-alpha perimeter pixels; bounds/foot and artwork geometry stay the same.

Measurements isolate tree RGBA on transparent canvases and use actual actor-mask pixels with alpha>127 (150 backing pixels; contact shadows excluded). Covered-actor means average tree alpha only where a tree pixel overlaps that opaque actor mask. Player coverage is98.0%camphor,95.3%willow,96.7%fruit. Thus these are substantive canopy-over-actor comparisons rather than a player placed in a gap.

| Species | Requested alpha | Tree area above requested+1byte, direct | Mean alpha over covered actor, direct → group | Tree max alpha, direct → group |
|---|---:|---:|---:|---:|
| camphor | .3 | 72.2% | .492 → .282 | .886 → .302 |
| willow | .3 | 61.2% | .606 → .284 | .890 → .302 |
| fruit | .3 | 67.8% | .444 → .274 | .914 → .302 |
| camphor | .5 | 71.9% | .697 → .468 | .984 → .502 |
| willow | .5 | 60.0% | .788 → .472 | .984 → .502 |
| fruit | .5 | 67.3% | .641 → .455 | .992 → .502 |

Every grouped result has0 pixels above requested alpha plus one byte. Direct.3 willow's covered-actor95th-percentile alpha is.851, versus.302 grouped; direct.5 is.969 versus.502 grouped. The direct/group screenshots visibly preserve more of the player's face and clothing with group composition.

Raw measurements and camera/position/source provenance: `fade-checks.json`. Reproduce with the study Vite server on5499, then:

```sh
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/world/0091/capture-fade.mjs
```

The script asserts actual actor coverage≥80%, grouped opacity never exceeds requested+1byte, direct accumulation reproduced over≥50%of tree pixels, and no browser errors. All pass. It records foliage source SHA256. Direct component draw cost remains the separate study benchmark; it does not measure a grouped fade's App/DPR cost.0084 retains actual App integration/culling, organic cast matching, whole-App visible-tree/DPR performance and current-head acceptance. This evidence authorizes no broader visual-completion claim.
