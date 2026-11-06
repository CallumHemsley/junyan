# Landscape 0084 — active

Owner: cloud builder 7, thread `01a1ae20-bd21-7127-bf23-09146cdb604d`, host durable. Branch `codex/0084-landscape`, checkout `/workspace/junyan`, strict port 5486. Native create_goal and cross-thread send unavailable. This record and ticket retain the active objective.

The full objective remains substantial surrounding outdoor landscapes: varied town-edge greenery, river/pond/bridge routes, woods and viewpoints with authored branching exploration. Completion requires integration and independent gameplay review, not this first data unit.

Contract: centrally published v1. Owns only `src/world/maps/landscape/*`, `src/world/art/landscape/*`, ticket 0084 and this evidence directory.

Throughput checkpoint:
- Blocking: acquire central ownership and contract (done); foundation executable schema/draw adapter pending.
- Independent: author park and riverbank JSON plus original art; foundation alone wires the registry and game.
- Shared state: no renderer, App, save, schema, dependency or other domain writes.
- Decomposition: one writer keeps shoreline geometry, crossings and composition consistent; independent Astra review follows integration.

First data unit: park 84×68, riverbank 96×80, seven park landmarks and eight riverside landmarks. Two shore-to-shore crossings make a river loop; orchard/bamboo/pond/ridge paths make park loops. Actual reachable area, routes and collision proof pending. Dimensions are not a quality claim.

Seams requested: foundation imports `mapDefinitions` from `src/world/maps/landscape/index.ts`; validates through its sole schema; publishes draw adapter. Town supplies reciprocal `from-park`, `from-riverbank`; courtyard supplies `from-park`. Landscape exports `from-town`, `from-courtyard` and `from-riverbank` in park; `from-town`, `from-park` in riverbank.

Next: verify footprint-safe connectivity and landmark approaches; render original landscape art at camera scale; adapt to foundation commands; capture actual keyboard/touch travel and phone/desktop views; resolve reviewer defects. No integration PASS yet.

## Typed art and route checkpoint

Foundation source through `e6270d0` is merged unchanged. Production exports now use real `DrawMap`, `WorldArtModule`, `WorldRenderObject` and `WorldRenderView` imports. `src/world/art/landscape/index.ts` exports `drawMap` (ground only) and `renderObjects` (every prop plus short bridge-rail segments). Matching authored IDs override generic fallback art. Trees carry local occlusion; no tall props are duplicated in whole-map passes.

Fixed the confirmed pond-deck and jetty collision defects by carving their boardwalk clearance from the water colliders. Twelve tests now pass using foundation schema, `canStand` and `findPath`, including both waterside approaches, every landmark/entrance, both bridges, water blocking, resident hook routes and bounds. `tsc -b` passed. Full Vitest: 28 files, 325 tests passed. This does not replace integrated original-activity browser proof.

Inspected desktop pavilion and grove, and phone bridge screenshots across the initial, refined and depth passes. The initial flat grass and pond strip seams were weak; later passes add varied ginkgo/cypress/fruit/willow silhouettes, grass detail, shoreline repair, planted shoulders and bridge rails. No claim of final experience quality. The independent reviewer must critique current `depth` renders and actual App travel.

`capture-preview.mjs depth` runs shared camera/picking/movement and the actual foundation `paintWorld` with existing character art. Its desktop/phone clips record keyboard movement across part of the upper bridge; pointer movement follows. These are isolated authoring-harness captures, not a full world journey or save proof. Earlier phone input used a mouse event; the current capture script uses a real touchscreen tap for phone reruns. No audio was generated. Native MediaRecorder records canvas motion because Playwright ffmpeg downloads were blocked by network policy; policy was preserved.

`metrics.json` comes from the rerunnable `measure-landscape.mjs`, through shared schema and geometry. It records sampled footprint-accessible area, actual landmark route lengths, art IDs and registered resident hooks. Half-tile sampling is an estimate and is not a density/quality score. Park has seven landmarks; riverbank has eight. Every prop is overridden by custom art. Both `zhang-laoshi` and `xiao-zhou` route hooks reuse existing cast IDs; world-life owner supplies behavior.

Still active: real App traversal between park and riverbank, longer bridge walks, save/reload, touch pad, occlusion captures, town/courtyard reciprocal integration, original activity journey, independent art/experience review and fixes. Landscape exploration anchor IDs are `landscape.<landmark-slug>`; foundation currently treats exploration interactions as no-ops. World-life needs to wire nonverbal feedback without new speech. Coordinator/root should relay this request.

## Actual App checkpoint

`app-traversal.mjs` now drives the actual App, not the art harness. A valid day save is seeded at park (78,10) solely to isolate this integration test, then real held keyboard input crosses the park exit into riverbank. Desktop and phone both passed. Phone also uses actual touchscreen taps on the pad and ground. Native canvas recordings, before/arrival/reload screenshots and exact saved/reloaded world records are in `app/`. Riverbank position, facing and park return position survived reload exactly; console errors were empty. The welcome panel is dismissed through its real button. The first attempt correctly failed because that panel intercepted input; the script was fixed rather than forcing the click.

Inspected actual App desktop reload and phone arrival images. Entry-edge voids were visually poor; landscape now draws a distinct, decorative misted forest outside its authored bounds. This adds no walkable area and does not alter map geometry. Foundation should still review camera framing/clamping and the inherited narrow desktop shell.

Exact remote ref verification: `git ls-remote origin refs/heads/codex/0084-landscape` returned `6e04784a1423b7b2fc167937553fe0e8d0b5eec4` before this checkpoint. The pond/jetty correction, schema checks and typed art were already present there. The root's older `14a2ce1` observation was stale. Fetch the explicit branch ref because the initial cloud remote fetch configuration tracks main only.

A longer actual-pointer river route is under investigation. The first capture loop made no progress, so it is not accepted evidence. `walk-app.mjs` is being corrected/diagnosed independently from the successful App keyboard transition and reload proof. Whole-landscape walking, full town/activity continuity, exploration responses and independent experience review remain open. Goal ACTIVE.
