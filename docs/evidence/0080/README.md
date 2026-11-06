# Courtyard and cat habitat

Persistent objective ACTIVE. Build residential courtyards, alleys and cat habitat into a lived-in connected world. This includes bicycle sheds, benches, planted edges, laundry, windows, stoops, footprints, wildlife and meaningful detours. Preserve existing cat trust, reunion, repeats, gifts, voices, restaurant day and saves. Completion requires integration and independent real-experience verification.

No native create_goal or send-to-thread tool is exposed. This committed record is the fallback. Worker `01a1ae1f-7fc4-77ff-8d9d-144d1889304e`, cloud host `durable`, branch `codex/0080-courtyard`, checkout `/workspace/junyan`, strict Vite port `5482`. Central ownership/contract base `fb167fd5047010beaac7809b4d6a41a804b7fb42`. Contract v1. No local preview is used.

## Throughput checkpoint

- Blocking first steps. Central ticket and contract acquired. Foundation's executable schema and draw-command adapter are still pending.
- Independent workstreams. Courtyard JSON, local art and habitat placement can proceed in owned paths. Foundation wires the registry, rendering and save boundary; world-life consumes habitat hooks.
- Shared mutable state. Only foundation changes schema, renderer, App and saves. This owner changes no cat progression rules.
- Smallest safe decomposition. One map writer owns all courtyard spatial composition. First publish map/anchor data and habitat selectors; then art and geometry proof; then integration and visual review.

## Layout study

`layout-study.html` and `layout-study.png` are throwaway composition alternatives, rendered in cloud Chromium and inspected. They do not use the production renderer and prove no gameplay. The linked loop is selected over sequential courts because landmarks can be approached from multiple directions. The study is sparse and its art is not an accepted production quality bar.

## Architecture

Existing `src/features/cats/rules.ts` owns scene facts and encounter anchoring. `sceneFacts(state, day)` chooses bicycle/open/path/door/window positions while retaining active encounter conditions across day changes. Existing feature state, reducers, segmented content and voices remain authoritative. New habitat sampling consumes those facts; it does not advance story or day. The map is JSON-compatible contract-v1 data. Foundation validates at the registry boundary rather than each owner inventing a schema.

## Proof and remaining work

Only scratch composition screenshots inspected so far. No production screenshot, traversal, collision, save, audio, browser journey or independent verdict is claimed. Next publish authored map and cat habitat hooks, adapt art to foundation draw commands, prove reachable geometry using the shared validator, then inspect full desktop/phone traversal and preserve the original activities.

## Integration seam

`src/world/maps/courtyard/index.ts` exports `mapDefinitions` and `courtyardMap`. One 48×38 map has reciprocal town, residential-hall and park edges per contract v1. `catHabitat(state, day)` derives actual cat placement from the authoritative feature `sceneFacts`. White cat lives beneath the bicycle frame before emerging, follows the central path after invitation, reunites at the dry doorway and visits the window nook during the route repeat. Black cat sits beside the sunny bench. Do not independently wander either cat away during an active clue.

Cat hooks use `cats.white` and `cats.black`; aunt hook uses `aunt`. These actor IDs are proposals for world-life/characters to resolve, not new content IDs. Existing cats feature interaction IDs `cats.white`, `cats.black`, `cats.bicycle`, `cats.bench`, `cats.door`, `cats.window`, `cats.aunt` mean select the corresponding existing target. `existing-cats-activity` opens the preserved activity at the bicycle court. Foundation must handle activity return at the actual approach position and use existing content/audio. No new dialogue is defined. Art adapter is pending foundation's command contract.

## Buildable art checkpoint

Production art exports `drawMap` with the real foundation `DrawMap` type from `src/world/render-contract.ts`. Imported foundation commits through `9f144d5` as a stack dependency; shared files are unmodified by this owner. World scale follows `view.project`, with no DPR multiplication or frame loop in production art. `drawCat` is an actor-art helper for world-life/foundation. Call with `catHabitat(state,day)` output, retaining current state anchoring.

37 focused tests passed (28 existing cats rules, 4 habitat, 5 foundation rules), and TypeScript passed using installed tool entrypoints. pnpm's install lifecycle gate generated an untracked workspace prompt; it was removed. Direct installed entrypoints work without dependency/lockfile changes. Shared geometry caught a boundary window approach, basket-adjacent cat route, bench-crossing black route and sparrow route across a tree. All were corrected within map ownership. Final rerun is pending.

Actual `drawMap` desktop and phone captures are stored as `desktop-bicycle.png`, `phone-bicycle.png`, `desktop-bench.png` and `desktop-arrival.png`. These use the shared camera in the owned isolated proof, not production integration. Screenshots were inspected. The house roofs/windows/laundry are clearer than the throwaway plan, but the broad paved field and blocky foliage still need refinement. The proof avatar is temporary. No integrated acceptance is claimed.

## Depth adapter and scale refinement

Foundation through `e6270d0` is a stack dependency. `renderObjects(map,view)` now returns each non-ground prop once with the matching authored prop ID and explicit depth, plus authored occlusion where available. `drawMap` draws only ground. Both exports ignore other maps, preventing cross-owner paint. Production art owns no input/loop/save. The proof now uses the actual foundation `drawPlayer`, replacing its temporary tiny avatar. Same-camera before/after desktop and phone captures show correct player/bicycle scale.

Art refinement replaces stacked square trees with varied rounded pixel crowns and visible branches, varies building heights, adds a kitchen awning and rooftop utility silhouette, and narrows paved lanes amid planted/bare-earth edges. Passable planted margins remain declared walkable; art changes do not silently change collision. Added physical cat ledge, sunny basin and kitchen doorstep details have explicit colliders. Geometry proof checks every entrance, exit, anchor and every continuous hook-route segment through the shared swept collision. No independent validator is introduced.
