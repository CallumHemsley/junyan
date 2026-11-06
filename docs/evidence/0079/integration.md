# Town integration

Status ACTIVE. Import `mapDefinitions` from `src/world/maps/town/index.ts`. Map ID is `town`, contract v1. Bounds are 80 by 64 units. The authored footprint proof uses a radius of 0.3 and half-unit samples. It found 1852.25 square units of connected sampled floor; this is an authoring estimate, not foundation-runtime acceptance.

All six required exits use the central naming convention and target `from-town`. Entrances are `from-restaurant`, `from-residential-hall`, `from-courtyard`, `from-workshop`, `from-park`, `from-riverbank`. Arrival points lie outside all exit triggers. NPC routes and every entrance, exit, landmark and exploration anchor pass the standalone footprint proof. `python src/world/maps/town/reachability.py` reruns it. Foundation must validate with the shared Zod schema, production collision and graph rules.

The map includes fifteen building footprints and connected main, residential, market, narrow north and service routes. Restaurant and workshop doors have pavement landings. Residential steps lead to its actual entrance. Northern moon gate connects courtyard. Park leaves west; river path leaves east. Other shops have closed shutters. No extra apparent accessible door is added.

Art will export `drawMap(ctx,map,view)` using foundation's adapter proposal in `docs/evidence/0078/adapter-v1.md`. No input, frame loop, persistence, text, new audio or engine dependency lives in town art. Foundation owns registry and invocation. Town props use position as the footprint's minimum x/y, width/height as ground dimensions. Their variant names are indexed in `src/world/art/town/variants.json`.

Exploration interactions are nonverbal hooks. `town.rest`, `town.observe-market`, `town.look-river` and `town.observe-laundry` require life owner integration. They must not invent unvoiced dialogue. Town npcHooks use current ensemble silhouette kinds for visual authoring; life owner resolves final existing character IDs.

Still required before ticket completion: actual integrated keyboard/touch walking, door travel and safe return, camera coordinate correctness, save/reload and existing activity continuity, inspected phone/desktop screenshots, traversal video, console checks and independent Astra review. This layout proof is not a gameplay PASS.
