# Integration seam v1.1

Coordinator decision for foundation 0078 and owners 0079–0087. This refines the v1 runtime adapters without changing map JSON version or existing feature save schemas. Foundation is the only production contract writer. Owners implement their side in their leased paths.

## Per-object drawing

Add an optional named export `collectObjects(map, view): readonly WorldRenderObject[]` beside the existing `drawMap`. Each object has a stable `id`, ground `sortPoint`, optional screen-space `occlusionBounds`, and `draw(ctx, view)` callback. The callback draws only that object, has no loop/listener/state mutation, and uses the same logical pixels as `view.project`.

```ts
type WorldRenderObject = {
  id: string;
  sortPoint: { x: number; y: number };
  occlusionBounds?: { x: number; y: number; width: number; height: number };
  draw(ctx: CanvasRenderingContext2D, view: WorldRenderView): void;
};
```

Foundation draws ground once, collects map objects plus player and NPC draw objects into ONE array, sorts ascending by `sortPoint.x + sortPoint.y` and stable `id`, then draws that array. Actor sortPoint is the ground contact point. Props use their actual ground support point. Each tall wall, tree, building facade or furniture item is separate. Long/wrapping buildings must split into facade/corner/roof sections when a single sort point cannot represent walking around them. Roofs and tree canopies that can hide actors belong in this array, not an unconditional final foreground pass. Foreground after this array is reserved for intentional screen effects such as rain and non-occluding dust.

A map with `collectObjects` must not also draw its object/occluding-foreground layers from `drawMap`; foundation calls its `drawMap` for ground only. For a module without `collectObjects`, foundation retains the old three-pass call as a temporary compatibility fallback. Do not call an old whole-map objects function once per prop. Final acceptance requires `collectObjects` for every populated map, or independently demonstrated equivalent depth-correct rendering. The fallback is not an accepted completion path.

For a fading authored occluder, the owner derives `occlusionBounds` from the projected extents of that individual object's visible geometry, including height. Foundation applies alpha 0.45 only when that object is sorted after the player and its bounds intersect the player's rendered body bounds. Alpha is restored around each item with save/restore. Objects without fading metadata remain opaque. Collision never changes when art fades. Owners split overly broad bounds that would fade an entire street.

Required proof uses the real renderer: walk in front of, behind and beside a building, tree and furniture item; show an NPC crossing the same geometry; inspect phone and desktop plus reduced motion. A sorting-unit test alone does not prove occlusion.

## Canonical actors

Foundation normalizes legacy hook aliases at the registry boundary before life compilation or actor sampling:

| Incoming alias | Canonical actor |
|---|---|
| `cats.white` | `white-cat` |
| `cats.black` | `black-cat` |
| `sparrow` | `bird` |

Existing content character IDs remain canonical. Actor IDs and interaction IDs are separate namespaces: `cats.white` as an interaction selects the white-cat target and must not be rewritten to a dialogue/content ID. Unknown hook actors produce a diagnostic and are skipped; do not render an unknown bird/cat as the human player's default sprite. Character owner supplies separate nonhuman sampling or foundation uses the explicit cat/bird renderer provided by the relevant owner.

`catHabitat(state, day)` overrides decorative cat positions during story/repeat encounters. World-life must not move those cats away from clues. Foundation suppresses duplicate regulars currently present in the restaurant. Active day, explicit play-time clock and RNG remain caller supplied.

## Selected anchors and controls

Foundation preserves an explicit activity binding in world state:

```ts
type ActivityBinding = {
  mapId: string;
  anchorId: string;
  featureId: "restaurant" | "apartment" | "cats" | "repairs" | "garden";
  interactionId: string;
};
```

On interact, resolve the actual nearby anchor against current projected map geometry, verify reachability/line of approach, store the binding, then dispatch the feature's existing selection action exactly once. On restore, validate map, anchor, feature and interaction identity against the current registry; close an invalid binding while preserving unrelated progress. For old feature-only world drafts, reopen only when exactly one valid nearby anchor maps to that feature; otherwise close safely. Do not infer the selected lamp/toy from whichever anchor happens to sort first on rerender.

| Owner | Binding behavior |
|---|---|
| Repairs 0082 | `repair-lamp` dispatches `{type:'switch',job:'lamp'}`; `repair-toy` dispatches the corresponding toy action before controls open. Existing repair state owns selected job and progress. |
| Cats 0080 | `cats.white`, `cats.black`, `cats.bicycle`, `cats.bench`, `cats.door`, `cats.window`, `cats.aunt` dispatch existing `{type:'select',target}` with the suffix. Generic activity entry preserves selection or opens target choices; it does not auto-progress story. |
| Apartment 0081 | Generic furnish anchor opens controls without auto-selecting an item. Selecting visible furniture dispatches existing select with its item ID. Convert world pointer coordinates through `furnitureCellAt`, then existing preview/place actions. Preserve undo and prevent invalid or trapped placement. |
| Garden 0083 | Generic garden/water anchors open controls without watering automatically. Individual pot anchors carry stable plant IDs. Existing water/observe/wait/move actions use that explicit plant ID; never identify plants by mutable array index or old site. |

Feature owners export controls-only rendering with their existing feature props, optionally through a backwards-compatible `presentation="controls"` prop. Foundation supplies the validated binding. The legacy default stays usable for old isolated harnesses. Production world integration never renders the legacy Scene inside the controls overlay. Close leaves player position and world camera intact and returns keyboard focus.

## State-derived maps, not copied feature state

Before collision, interaction or rendering, foundation derives the current map from its static definition plus feature-owned projections. All three consumers use the SAME projected map snapshot for that frame/action.

- Apartment uses existing `furnitureWorldRect`/`furnitureColliders`. Rugs and preview drafts stay passable; placed solid furniture affects movement. Art consumes the passed projected map or explicit authoritative placements, not a static map imported inside its draw loop.
- Courtyard uses `catHabitat` for encounter targets and visible cats; target anchors move with actual state-derived positions where appropriate.
- Rooftop uses `rooftopForGarden`/`projectGarden` for pots, shade feet, canopy occlusion and stable per-plant anchors. Existing garden state remains the only growth/care/weather authority.
- Repairs derive bench objects and returned-object shelves from existing selected job and completion state.

World-life's nested state is validated by its exported validator at foundation's save boundary. Foundation supplies footprint-aware `canStand`, swept `canWalk`, and path callbacks with explicit temporary entrance exclusions; life owns neither shared geometry nor restaurant day advancement.

After dynamic changes, retain the current valid exit-connected position where possible. Otherwise recover deterministically to the nearest safe point in the exit-connected component. Re-run this after furniture/shade changes, undo and reload. No duplicate feature state is persisted in world visuals.
