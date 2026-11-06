# Independent foundation seam defects

ISSUES at exact head `9f144d512cfc0e74cfd7c1c9f43b75f7bf954a6c`. Review-only synthetic boundary fixtures execute the actual geometry and validation source via TypeScript transpilation. No application edits and no integrated user-input reproduction claimed. `results.json` records source hashes and outputs. Generated geometry.mjs/validation.mjs are evidence copies, not application alternatives.

Run from repository root with existing dependencies:

```
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/0088/seam/probe.mjs
```

- P2 geometry.ts:9-10. Four-corner coverage accepts standing and walking across a 0.02-tile uncovered strip between two walkable rectangles. Confirmed stand=true and walk=true; both should reject uncovered ground. Missing test: holes/seams in rectangle-union walkability with a nonzero footprint.
- P2 validation.ts:14. Exact-center pathfinding rejects an anchor on a solid bench even when a valid approach is inside its interaction radius. Confirmed approachStand=true and nearbyCount=1 but validator reports unreachable. Missing test: solid prop with reachable interaction radius. Impact is false rejection of legitimate authored activities.
- P2 API boundary geometry.ts:18-20. NaN endpoint makes steps NaN, skips sweep and returns true. No normal-input exploit or browser symptom established. Missing test: nonfinite endpoints at canWalk/reducer boundary.
- Verification gap: reciprocal entrance must be outside return trigger. Existing cannot-bounce fixture has no destination return exit, so it cannot prove this gate. Add real paired doors and invalid overlapping arrival fixture.

Camera inverse algebra has no proven source defect in this pass. Depth ordering requires runtime interleaving proof, not approval from the existence of a drawMap callback. Coordinator PR27 comment6672879426 carries these findings for foundation.
