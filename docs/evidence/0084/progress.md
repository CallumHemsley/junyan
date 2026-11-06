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

## Long route and lighting preparation

Actual App desktop pointer travel reached moon bridge, old ferry, lower crossing and fishing jetty in one continuous 42-second canvas recording (`walk/desktop-river-route.webm`). `walk/evidence.json` records endpoints and pointer segment counts. The earlier async wait loop was insufficient as a harness observation; explicit save polling established actual progress. No production movement defect is inferred from that harness issue.

The extended park pointer route reached orchard basket and bamboo court, then failed a detour toward the pavilion at target (45.7126,14.6850). Its failure screenshot is retained in `walk-park/`. The park route is not accepted as complete. Shared-footprint landmark tests still pass; the real traversal failure needs diagnosis on the current foundation, which has now published asynchronous detour navigation at `74a5213`.

Lighting contract v1.1 read. Primitive helper now accepts an optional pure color callback and preserves inherited alpha; runtime material wiring awaits acquisition of the foundation's published `shadeColor` type (now available at `74a5213`). No independent clock, tint or shader field was introduced. Next: merge the published foundation, wire the callback through every landscape material fill/stroke, then capture identical morning/evening map/camera with particles off.

Draft review PR: https://github.com/CallumHemsley/junyan/pull/34. Base foundation already contains the earlier park/river data and art, so this PR is the boundary/persistence follow-up, not the entire initial landscape diff. No merge or independent PASS claimed.

## Spatial composition revision — review still required

Root rejected the e6402f6 entry view as a schematic arboretum. The new source removes the uniform whole-map scatter and broad rectangular woodland bands. Authored grove groups now combine mature camphor-like canopies, asymmetric understorey, ginkgo/cypress/fruit silhouettes, rooted moss/leaf floors, ferns, bamboo and flower clumps, with smaller clearings between. Deliberate large-tree groups frame the pavilion, pond deck, ridge approach and bridge reveal. Main paths are narrower and have broken worn margins. Tree collision now follows a small explicit trunk footprint rather than canopy width; mature canopy occlusion remains independent. Bridge collision holes now match the visible narrower deck. All twelve shared-schema/geometry checks pass after the first composition revision; the final framing groups are being checked and captured.

Foundation 74a5213 and its published shadeColor type are incorporated unchanged. Landscape now explicitly routes every non-emissive material fill/stroke, including tiny pixel details, through view.shadeColor. Primitive helpers preserve inherited Canvas alpha. The module does not rely on the foundation's transitional whole-context proxy and creates no new clock/tint/shader field.

Current integrated foundation rules suite: 40 files and 380 tests passed before this composition revision. TypeScript and the twelve landscape checks passed for the lighting consumer. Actual App park traversal then reached orchard, bamboo court, pavilion, pond deck and ridge in an 80-second continuous recording; source/camera/actor came from foundation 74a5213. The earlier park failure is retained as superseded evidence. Composition changes require a fresh route rerun before acceptance.

Same-camera production material proof uses park (53,21), valid morning/evening day saves, reduced motion to suppress particles, then lit captures. Exact visible wood, foliage and masonry pixel colors differ between phases on desktop and phone. The material script now asserts actual visible pixels, not just shader return values. Updated captures for the composition revision are in progress. Goal ACTIVE; no visual PASS or merge acceptance claimed.
