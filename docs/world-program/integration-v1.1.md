# Integration seam v1.1

Coordinator decision for foundation 0078 and owners 0079–0087. This refines the v1 runtime adapters without changing map JSON version or existing feature save schemas. Foundation is the only production contract writer. Owners implement their side in their leased paths.

## Per-object drawing

Use the implemented optional named export `renderObjects(map, view): WorldRenderObject[]` at foundation head `e6270d0`. This supersedes the earlier unimplemented name `renderObjects`. Export it beside the existing `drawMap`. Each object has a stable `id`, world ground `position`, optional explicit numeric `depth`, optional world-space `occlusion`, and `draw(ctx, view)` callback. The callback draws only that object, has no loop/listener/state mutation, and uses the same logical pixels as `view.project`.

```ts
type WorldRenderObject = {
  id: string;
  position: { x: number; y: number };
  depth?: number;
  occlusion?: {
    rect: { x: number; y: number; width: number; height: number };
    height: number;
    fadeWhenPlayerBehind: boolean;
  };
  draw(ctx: CanvasRenderingContext2D, view: WorldRenderView): void;
};
```

Foundation draws ground once, collects map objects plus player and NPC draw objects into ONE array, sorts ascending by `depth ?? position.x + position.y` and stable `id`, then draws that array. Actor position is the ground contact point. Props use their actual ground support point, with optional depth for authored ordering. Use the matching map prop ID to replace its generic fallback. Each tall wall, tree, building facade or furniture item is separate. Long/wrapping buildings must split into facade/corner/roof sections when a single sort point cannot represent walking around them. Roofs and tree canopies that can hide actors belong in this array, not an unconditional final foreground pass. Foreground after this array is reserved for intentional screen effects such as rain and non-occluding dust.

A map with `renderObjects` must not also draw its object/occluding-foreground layers from `drawMap`; foundation calls its `drawMap` for ground only. For a module without `renderObjects`, foundation retains the old three-pass call as a temporary compatibility fallback. Do not call an old whole-map objects function once per prop. Final acceptance requires `renderObjects` for every populated map, or independently demonstrated equivalent depth-correct rendering. The fallback is not an accepted completion path. The implementation at e6270d0 still invokes objects/foreground for all modules; owners with renderObjects must keep those old layers empty for the same geometry, and foundation must prevent duplicate tall-object rendering.

For a fading authored occluder, the owner supplies the world-space `occlusion.rect` and `height` for that individual object. Foundation projects all footprint corners at ground and height to derive screen bounds. Foundation applies alpha 0.45 only when that object is sorted after the player and its bounds intersect the player's rendered body bounds. Alpha is restored around each item with save/restore. Objects without fading metadata remain opaque. Collision never changes when art fades. Owners split overly broad bounds that would fade an entire street.

Required proof uses the real renderer: walk in front of, behind and beside a building, tree and furniture item; show an NPC crossing the same geometry; inspect phone and desktop plus reduced motion. A sorting-unit test alone does not prove occlusion.

## Canonical actors

Foundation normalizes legacy hook aliases at the registry boundary before life compilation or actor sampling:

| Incoming alias | Canonical actor |
|---|---|
| `cats.white` | `white-cat` |
| `cats.black` | `black-cat` |
| `sparrow` | `bird` |
| `backpack` | `xiao-zhou` |
| `glasses` | `zhang-laoshi` |

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

## Exact-head implementation findings

At e6270d0 the compositor uses only player/object x+y order to fade, ignoring the supplied occlusion rectangle and height. Foundation must use the projected overlap condition above; otherwise unrelated buildings fade merely because they are deeper in the map. The sort currently lacks the stable-ID tie break, and the actor list currently contains only the player. Add NPC objects to this same list when integrating life. These are concrete gaps in the current implementation, not a competing adapter.

## Physical restaurant targets and HUD ownership

Foundation must bind restaurant activities to real map anchors before the contextual UI is considered integrated. Add table interactions with stable IDs `service.table.1` through `service.table.4` and a kitchen interaction `service.kitchen`. The map owner chooses approach points outside table/counter colliders, within a reachable interaction radius. Preserve the existing restaurant table-number mapping in one explicit projection shared with artist 0089. Generic `service` remains only a temporary entry fallback, not the finished table interaction.

Resolve the binding into a discriminated presentation target (`table` with table number, `kitchen`, `repair` with job, `cat` with target, `garden` with plant or overview, `apartment` with item or overview). The active ActivityBinding remains the authoritative selected map anchor; presentation derives from it. Do not derive a target from whichever panel last rendered. Existing feature state/reducers still decide allowed actions and progression.

UI owner 0090 exports typed presentational components under `src/world/ui/*`. Foundation supplies only the current target's dialogue, available actions and read-only view data, plus existing lookup/replay/journal/tray/action callbacks. A table shows that customer's current dialogue and relevant order/deliver/change actions. Kitchen shows food pickup and tray return. Do not mount all four table controls, kitchen, journal and an entire legacy feature page simultaneously in one panel.

Keep a compact persistent journal/tray affordance outside the contextual panel. Opening the tray or journal is an explicit player choice. On phone, contextual content may scroll within an accessible region but its action footer and close control must remain reachable; no overflow clipping or CSS-hiding controls. Opening/closing preserves the visible map and returns focus to the invoking anchor. UI owner does not duplicate reducer rules or write shared styles/App. Foundation alone wires the components and maps world actions to existing domain actions.

## One material-lighting seam

Foundation adds optional `shadeColor(base, exposure = 1): string` to `WorldRenderView`. `base` is an RGB triple or a #RRGGBB material color. The returned CSS color is computed through atmosphere's existing `shadeAtmosphereColor(baseRGB, frame.light, exposure)`. Alpha remains the caller's Canvas alpha; material shading must not reset per-object occlusion alpha. Foundation samples one atmosphere frame for the authoritative named day phase and supplies one cached shader for that phase/interior-light state. No artist computes an independent day clock.

Every map art helper routes non-emissive terrain, walls, roof, wood, foliage and furniture fill/stroke material colors through this callback. The generic foundation painter does the same. Optional callback absence is identity shading for isolated old harness compatibility; production always supplies it. Color constants may remain authored; they are inputs, not final painted output. Do not merely overlay a fullscreen tint, darken the canvas with CSS, or add particles while leaving all base materials at noon colors. Preserve material-specific base colors and local exposure/highlight values. Emissive windows/lamps use explicit emissive colors plus atmosphere's phase-dependent lamp strength rather than double-shading the glow.

Atmosphere owner may export a pure adapter that parses #RRGGBB and calls its existing shade function, but foundation owns the WorldRenderView field and runtime wiring. All owners use this one callback name. A compiled material-color consumer and captures of the SAME actual map/camera under morning/evening with particles disabled must prove that wood, foliage and masonry pixels change while remaining distinct. Re-enable local light overlays for final captures. Component timing alone does not prove integrated lighting.

## Minimal stair surface seam

Residential owns one authored piecewise-constant surface table for its stair treads and landings. It exports `surfaceHeight(mapId, point): number` and `surfaceLevels(mapId): readonly number[]` from its leased map module. Heights are absolute world Z tile units, finite and nonnegative; unraised ground is 0. `surfaceLevels` is the unique height set from the SAME table, including 0. Tread artwork uses this table too; no second staircase height calculation. Foundation registers these optional callbacks for residential maps and defaults other maps to height 0. No change to 2D collision or feature save ownership.

Keep `view.project(point, z)` as an ABSOLUTE height projection. Never silently add surfaceHeight inside that function. Stair art already supplying tread Z must not receive a second offset. Actor and NPC draw adapters explicitly project their feet at surfaceHeight(mapId, position); their local body offsets are relative to those feet. Furniture/props resting on a raised landing explicitly add the surface height once to their own local geometry. Existing flat-map art remains unchanged.

Foundation extends Camera with optional `focusZ` defaulting to 0. Forward projection becomes `screenY = viewportHeight/2 + ((x-focus.x)+(y-focus.y))*scale/2 - (z-focusZ)*scale`. Camera framing follows the player's sampled surface height, with any visual smoothing applied to camera state only. Logical player position and height sampler stay deterministic. Actor depth keys include the actual feet position and use the shared compositor; split stair rails/treads where a single object would obscure an entire flight.

For inverse picking add `unprojectAtHeight(screen, camera, z)`. Undo the vertical term `(z-focusZ)*scale` before the existing isometric inverse. Enumerate `surfaceLevels(mapId)`, compute the candidate ground point at each height, and retain only candidates whose sampled surfaceHeight matches that candidate height and which lie on the authored map surface. Choose the highest visible surface candidate; do not solve by repeatedly adding height to the flat inverse. On this single-surface stair model, no 3D physics or new navigation graph is needed. Pathfinding remains over x/y; rendered feet sample height along that path. Foundation must test pixel/world round trips on every tread and both landing boundaries at scrolled camera positions and phone scale.

Required integrated proof is an ordinary-input ascent and descent with feet attached to treads, NPC feet on the same surface, visible camera framing, click/touch destination alignment, safe landings and unchanged apartment/roof transitions. A portal transition alone does not prove visible stairs. The first implementation can use discrete treads with small rises; do not add unsupported ramps or stacked walkable floors to this contract.

## World life must be playable

Life acceptance requires actual consumers for `nearbyLife`, `interactLife` and `drawLifeReactions`, nested validated life state/save, authoritative catHabitat projections, and active-restaurant-regular exclusions. Decorative `sampleLife` routes alone do not pass. Nonhuman actors need readable species-specific silhouettes and motion at production scale, not generic two-rectangle icons. Exercise one ordinary-control affordance/reaction and repeat visit with save/reload, plus cats during a real clue and suppressed duplicate restaurant residents. The independent reviewer must inspect the integrated head, not the life harness.
