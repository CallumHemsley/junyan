# Bounded canopy-overlap guard proposal

Status: SOURCE-ONLY PROPOSAL. No application edits, build, runtime test, image decoding or performance measurement in this review. The apparent foreground-tree fade in the landscape old-ferry capture remains a visual observation/hypothesis, not a confirmed integrated defect. A paired runtime check is required after a coherent composition is published.

## Exact source evidence

- Integration `e002c755fc5fe0785469735a629aedba1f3e6212`: `src/world/occlusion.ts:2-9` asks whether a filled world prism intersects five fixed player samples at Z .4/.9/1.4/1.9/2.2. It receives no camera, actor sample, absolute support height, or visible foliage geometry. `src/world/painter.ts:69-71` applies alpha .45 to a custom object when this predicate is true. This explains a mechanism for over-broad fade eligibility; it does not independently reproduce the old-ferry observation.
- Integration `painter.ts:32-34,66` samples and draws the player; line 66 supplies `atFeet(view,surfaceHeight(map.id,playerPosition))`. `src/world/surfaces.ts:21-22` substitutes absolute foot Z only when project is called without explicit Z. `src/world/maps/residential/elevation.ts:4-16` owns half-open treads and landing heights up to 4.8. Camera projection already incorporates focusZ (`camera.ts:3-5`). Never add tread height a second time or infer it from camera focus.
- Landscape `400abbfb72d3e687e0883888cbace25f4b6021dd`: `src/world/art/landscape/draw.ts:13-17` exports `landscapeFoliageBounds(prop)` using `foliageBounds` and species size; `index.ts:128-130` converts this screen-oriented envelope back into a filled world prism. `index.ts:136-137` already uses the projected envelope for culling. `draw.ts:53-55` uses `round(project(prop.position,0))`, then unit/18; `draw.ts:35-36` applies species size. `foliage.ts:43-50` bounds are conservative whole-sprite envelopes, including trunk down to maxY=4, not opaque leaf coverage. Willow artwork intentionally has sky slits (`foliage.ts:101-115`).
- Actor `4aad008970091fbd7e834b8d520f3cba4c7defaf` (resolved from the character branch): `src/world/characters/calibration.mjs:4` sets 15 native pixels per world unit. `adapter.ts:56-59` draws with sample.pixelsPerWorldUnit; `adapter.ts:67-74` exports `projectActorBounds` with the same conversion and rounded endpoints. `adapter.ts:40-45` paints opaque spans from sample.drawCommands. `index.ts:62-75` constructs those spans from the sampled frame; this already excludes transparent sprite pixels. Ground/foot shadows are separate and must not trigger canopy fade.

## Ownership and smallest useful seam

Foundation owns `src/world/render-contract.ts`, `occlusion.ts`, `painter.ts` and shared tests. Landscape owns `src/world/art/landscape/{index,draw,foliage}.ts` and species coverage metadata. Characters owns `src/world/characters/adapter.ts` and actor coverage helpers. Coordinator activated viewport lease 0093 at 25bea1f on exact base 38361754979f953bd18e8fa5f2348cac3b207faa. Per the corrected parent relay, 0093 freezes WorldViewport.tsx/world.css and owns new pure target-selection/place-label helpers; it does not freeze foundation-owned occlusion.ts, painter.ts or render-contract.ts. Foundation can coordinate this proposal in those separately owned files without waiting for 0093 handback or interrupting critical fourth-receipt work. 0093 must not edit painter.ts, occlusion.ts, surfaces, actor files or maps. The parent independently read the coordinator ledger at 25bea1f, confirming activation and the acknowledged exact base 38361754979f953bd18e8fa5f2348cac3b207faa; the central docs/tickets/world/0093-target-cue-integration.md remains reservation history, while the active ticket copy is on the child branch, and only WorldViewport.tsx/world.css are frozen. Review supplies this proposal and later independent paired evidence, never implementation fixes.

Keep existing map colliders and painter ordering. Do not shrink colliders globally, draw all actors last, move trees, or add a second renderer. Preserve the existing .45 fade factor for eligible objects and one-shot compositing of the foliage group; multiply inherited alpha by .45 within save/restore rather than causing overlapping leaf rectangles to accumulate transparency.

A foundation-owned additive, optional render contract is sufficient (names are proposed, not current exports):

```ts
type ScreenBounds = { x:number; y:number; width:number; height:number };
type ScreenCoverage = {
  bounds: ScreenBounds;
  rows: readonly { y:number; intervals: readonly [number,number][] }[];
};
// Integer logical-canvas pixel coverage; all intervals are half-open.
// Rows contain sorted, disjoint opaque intervals, not RGBA pixels.
type PlayerOcclusionTarget = {
  position: Point;
  footZ: number;
  depth: number;
  coverage: ScreenCoverage;
};
// Optional member of WorldRenderObject, only for authored canopy objects.
// Bounds is cheap; coverage is obtained lazily only after depth/AABB rejection.
type ProjectedCanopy = {
  bounds(view: WorldRenderView): ScreenBounds;
  coverage(view: WorldRenderView): ScreenCoverage;
};
```

A compact typed-array equivalent is acceptable and likely preferable. Do not impose these object allocations per pixel/frame. The foundation can instead accept a lazy `overlaps(targetCoverage,view)` callback with the same precise coverage contract; the important seam is owner-supplied coverage tied to actual drawing, not a foundation guess about tree dimensions. Non-foliage objects retain their existing occlusion path in this bounded change. Trees with the new coverage must never fall back to prism-only fading when the projected check says no.

## Decision sequence per canopy

1. Sample the player once for this rendered frame and reuse that exact sample for drawing and occlusion. Construct `feetView = atFeet(view,surfaceHeight(map.id,playerPosition))`. Compute `projectActorBounds(feetView,sample,playerPosition)` once. Derive actor opaque rows from sample.drawCommands with the exact rounded span endpoints used by paintActorCanvas. Exclude shadow and contact-shadow pixels. Include the sampled held object because the same sample draws it. Cache native bounds/row unions per immutable sample/frame key including calibration, posture and held-object state; do not call sampleActor separately per tree.
2. Require the canopy to be painted after the player by the actual stable painter comparator/order. Use explicit object.depth when supplied and the existing position.x+position.y fallback; handle equal-depth ties according to the actual draw sequence, not an invented epsilon. A tree painted behind the actor does not obscure it and must not fade merely because envelopes intersect.
3. Project the existing `landscapeFoliageBounds` envelope using the same rounded tree anchor and unit/18 scale as drawLandscapeProp. Its returned bounds already include species size; do not multiply that size twice. Keep all values in logical canvas pixels, not CSS pixels or DPR pixels. Treat the current min/max envelope as conservative; resolve inclusive max conventions (foliageGroup allocates max-min+1) and outward round for rejection. A disjoint envelope rejects immediately. Envelope intersection is only a candidate, never sufficient evidence of visible canopy overlap.
4. For candidates, intersect the actual sampled actor opaque rows with the current opaque leaf/bough rows. Use sorted row intervals/two pointers, clipped to the intersecting bounds. Stop on the first positive-area pixel intersection. Two AABBs that touch edges, or overlap solely in a willow slit/under-canopy air, must return false. Do not count the tree's cast/contact shadow or bare trunk as canopy. A deliberately opaque bough may be included only if it belongs to the authored canopy mask; document that choice.
5. Fade only when the depth/order and actual opaque-canopy intersection both pass. Restore the context after this object's single composite. Preserve other objects, actors, masks and alpha values unchanged.

A corrected conservative world-prism broadphase may remain before the screen checks, but only if it cannot reject a genuine projected overlap. The current five Z samples are not such a proof at calibration 15 or absolute tread Z. If retained, derive the actor vertical interval from the calibrated sample and footZ, account for the object's support/base Z, and validate against the full projected fixtures. It is safer for this bounded guard to omit that optional rejection for coverage-equipped trees than to retain a false-negative filter. Depth order remains required.

## Producing real coverage without framebuffer reads

Landscape should make its existing authored rectangle/limb/tuft emission reusable for both painting and coverage. A tagged native command stream or shared rectangle-emission callback can record the leaf rectangles actually issued by drawFoliage; merge them into row intervals once. Reuse identical rounding, seed, species and willow bend logic. Do not hand-maintain a second approximate canopy polygon or turn foliageBounds into a solid rectangle.

The foliage cache at draw.ts:24-36 quantizes willow drawing to `floor(elapsedMs/150)*150`; coverage must use that same sampled time, not raw elapsedMs. Geometry coverage is palette-independent and should not be duplicated for morning/evening colors. Cache per species, seed/variant, actual geometry phase, reduced-motion state and art version with a bounded eviction policy consistent with the existing 128-entry sprite cache. Since raw phase grows forever, do not create an unbounded elapsed-time cache. A cache entry may contain both grouped sprite and tagged leaf rows, or parallel bounded entries with identical geometry keys.

Projection must match nearest-neighbour drawing: tree anchor is rounded first; native mask is scaled by species size and unit/18 through drawImage. Actor spans round each transformed edge separately. Use the same helpers for draw and coverage transforms, including pixel-center sampling/zero-width spans at fractional scales. This avoids a one-pixel fade halo. No getImageData, readPixels, toDataURL, image decoding, framebuffer scan, full-screen mask, or per-frame native sprite rasterization on the hot path.

Expected algorithmic bound: one actor sample/bounds transform per frame; cheap depth/AABB checks per visible foliage object; lazy clipped row intersection only for overlapping candidates, exiting on the first overlap. This is a design bound, not measured performance. Instrument candidate count, narrowphase count and rows/intervals visited in test/debug evidence, without shipping a product-facing debug panel.

## Required paired verification after implementation

Tests belong to owners; this review has not run them.

- For camphor, fruit and willow, pair one actor pose visibly behind opaque leaves (fade .45) with an immediately adjacent pose outside the drawn canopy (no fade), keeping the same tree, camera, lighting and depth order. Include the old-ferry composition that prompted the hypothesis. Record world position, footZ, sample frame ID/ppu, tree species/variant, elapsed phase, logical projected bounds and overlap decision with both screenshots.
- Add an AABB-overlap/leaf-gap negative fixture, especially a willow sky slit and the trunk-only/under-canopy region. This distinguishes real coverage from a rectangular proxy. Pair with a one-pixel positive leaf intersection and an edge-touch/no-intersection case. A transparent actor margin overlapping leaves must not trigger fade.
- Repeat at desktop and phone camera scales with fractional origins, camera offsets, focusZ, CSS resizing and DPR 1/3. Include actor calibration 15 as the acceptance target and a legacy 18 comparison to prove the predicate derives dimensions instead of hard-coding height. Pixel-frame placement and collision radius must remain unchanged.
- Elevated fixture: player on actual lower tread, 2.4 landing and 4.8 landing, using the owner surfaceHeight and atFeet path. Same world X/Y with different absolute support Z should yield the correct projected overlap. Verify no double elevation and no use of camera focusZ as actor footZ. Ground landscape trees use explicit Z=0; future raised foliage must carry its own absolute baseZ explicitly.
- Verify walk/idle directions, carried tray and reduced motion with exact sampled player geometry. For willow, choose two adjacent quantized frames where a hanging-leaf edge changes overlap and a reduced-motion frame; mask and visible artwork must agree.
- Test true painter order: tree after actor and overlapping => fade; identical projection with tree before actor => no fade; equal-depth tie follows stable ordering. Other actor/object depth remains unchanged; actors are not drawn last.
- Alpha tests compare the single group composite at inherited alpha 1 and .56, giving .45 and .252 when eligible; outside-canopy stays at the inherited alpha. Overlapping leaf tufts must not accumulate dark transparency and subsequent objects must see restored context state.
- Independently check the real whole-app paired captures only after all pinned actor/landscape/foundation revisions compose. Re-run the existing controlled performance method after the separate performance window closes, with the same route/device/heads and instrumentation disabled in the measured run. Verify no additional actor sampling per tree, no framebuffer read, bounded mask cache and no canvas/draw-count explosion. Do not claim a frame-time budget or performance PASS from this proposal.

## Ready handoff

Foundation should publish the optional coverage seam and implement order/overlap/alpha orchestration in its owned files. Landscape supplies tagged native leaf spans and matching projected bounds through its owned renderObjects adapter. Characters reuses projectActorBounds and supplies transformed opaque rows using its existing calibrated draw transform. Coordinator serializes those leases. Review then independently compares the promised behind-canopy and outside-canopy runtime pair and reports evidence against exact integrated heads.
