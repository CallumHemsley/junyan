# Residential integration v1

Map exports are `mapDefinitions` in `src/world/maps/residential/index.ts`. The single registry validates the three payloads. The map graph follows central entrance IDs. All arrivals stand outside trigger rectangles.

Art imports real `DrawMap`, `WorldRenderView` and `WorldRenderObject`. `drawMap` draws ground and foreground only. `renderObjects` returns individually sorted static props. Long walls use segment entries so windows and actors interleave. The first segment retains the authored prop ID to override generic fallback. No owner frame loop or production input handler exists.

The apartment remains the existing saved 6 by 5 grid. `furnitureRegion` maps it to world origin (4,4), two tiles per cell. `furnitureWorldRect` handles rotated footprints. `furnitureColliders(home)` emits committed solid placements only, with IDs `apartment.furniture.<itemId>`. Rugs and unconfirmed drafts do not collide. `furnitureCellAt(worldPoint)` returns the editor cell or null. Static props never occupy this placement region.

Foundation wiring requires these stateful calls.

1. Add `furnitureColliders(state.neighbourhood.apartment)` to the validated apartment map's collision list for movement, pathfinding, portal arrival and save restoration. Keep the original map immutable.
2. Call `drawFurniture(ctx, home, view)` during the apartment ground pass. It draws saved rugs only.
3. Add `renderFurnitureObjects(home)` to the apartment compositor's object list. It draws saved solid furniture and gifts individually. Do not call the old whole-furniture objects pass.
4. After place, store, undo, rug change or restored furniture, retain the world position if safe and exit-connected. Otherwise choose a deterministic position in the exit-connected region. A free cell in an isolated pocket is not safe. The protected strip maps to x=14..16 and y=12..14.
5. Route world floor taps through `furnitureCellAt`, then dispatch the existing preview/place actions. The existing reducer handles validation, undo and audio notices.

`harness.html` is a static art study using the real production adapters, the existing character rasteriser and an explicit sample furniture layout. It has no travel or save code. Its screenshots are not production movement, editing or reload proof. Production art consumes actual home state via the calls above.

Current tests use the foundation schema, collision function and pathfinder for all entrances, local portal pairs, every landmark and all standable cell centres. Apartment tests preserve current reducer behavior and exercise world-cell round trips, draft separation, rotation, rugs, undo and save validation.
