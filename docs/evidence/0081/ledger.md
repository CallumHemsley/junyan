# Residential world objective

Status ACTIVE. Native create_goal is unavailable. This is a durable objective record, not platform goal registration.

Own residential building interior maps through independent integrated verification. Deliver walkable entrance foyer, halls, landings, actual stairs joining street, apartment and roof, distinctive neighbour thresholds and the player's home. Interiors need architectural scale, varied materials, furnished personal detail, occlusion and window light. Integrate all freely placed furniture and earned gifts into the walkable apartment while preserving editing, undo and compatible saves. Furniture changes must never trap the player. Preserve existing audio, dialogue and original activities. No new audio or English UI.

Worker `01a1ae1f-60be-71ac-b17f-c10bb16c706b`, durable cloud. Ticket 0081. Branch codex/0081-residential. Checkout /workspace/junyan. Strict port 5483. Baseline main 8cd5bc209b7dc2d91cc0f765991de313f813f4eb. Central contract/allocation fb167fd, version 1.

## Checkpoint

- Blocking first steps. Allocation acquired. Foundation's exact executable schema/draw adapter remains pending. Author JSON-compatible map payloads now.
- Independent workstreams. This builder owns residential maps/art and apartment feature only. Foundation owns registry, shared renderer, save and application.
- Shared mutable state. Preserve apartment's 6 by 5 saved placement grid. Convert through one local geometry adapter; no second furniture state.
- Smallest safe decomposition. One residential writer. Independent Astra review remains separate. First unit is map graph and reachable routes, then art, then furniture safety, then integrated browser evidence.

## Decisions and evidence

Compared linear gallery with switchback landing in isolated cloud pixel studies. `layout-comparison.png` is inspected developer concept art, not a game screenshot. `layout-reachability.json` records prototype flood-fill results. Choose switchback for readable branches and floor identity. Existing apartment uses a protected bottom/right route; preserve its save shape and express furniture geometry in world units.

Pstack poteto-mode, feature, how, architect, Model the Domain and Experience First read from configured cursor/plugins source. Applied Model the Domain through explicit map graph and furniture transform. Applied Experience First through layout comparison. No missing tool or native goal claimed.

## Integration requests

Foundation should import mapDefinitions from src/world/maps/residential. Publish exact art adapter. Furniture needs dynamic colliders derived from current apartment state and safe relocation after place/store/undo/reload. Safe relocation must choose the exit-connected component, not merely any unoccupied cell. Existing apartment reducer and save validator remain authoritative.

## Remaining proof

All integrated acceptance remains pending. Need shared schema validation, reciprocal external portals, actual keyboard/touch stair traversal, correct return spawn/camera picking, real furniture editing/undo/save/reload, existing activity regression, inspected desktop/phone scenes, motion recording, console/focus/reduced-motion checks and independent review. No quality PASS.

## Published work and review response

Initial map unit 8770653. Furniture/art unit fedf388. Inspected adapter preview 190a9c0. Source includes the published foundation implementation as ancestry for real schema/render API verification. All residential code writes remain in assigned paths.

Root reviewed the preview and rejected its sparse model-room appearance. Added headboard slats, bedding folds, chair backs, tabletop books and ceramics, sofa cushions, curtain folds, trim, shelves and entry detail outside valid furniture cells. Updated art uses per-object depth entries. Active work continues; no visual acceptance or integrated gameplay PASS.

Focused verification on 2026-11-06 ran 18 tests across residential map routes, apartment reducer and world furniture adapter. TypeScript build passes. Muted cloud Chromium captured desktop and phone views of all three maps with zero page errors. Inspected apartment, foyer and stair captures against the baseline tiny apartment. Static captures remain limited to art proof.

## Shared viewport route proof

`local-traversal.json` records the actual shared WorldViewport and reduceWorld through hall to stairs to apartment and back. Desktop and touch phone each reached 14 destinations. Both also moved by keyboard. No page errors. `traverse.mjs` reruns the proof on strict port 5483 with muted cloud Chromium. The owned traversal controller has no movement, input, drawing or save implementation; it uses foundation's component and reducer unchanged. Two WebM recordings retain actual walking. Playwright's ffmpeg download was denied by network policy; the existing cloud /usr/bin/ffmpeg supplied recording instead.

Inspected both phone return/apartment screenshots and desktop apartment. They reveal two unresolved foundation integration defects: the painter currently receives no apartment state, so no saved furniture appears, and the camera at the entrance leaves excessive empty space. These captures prove local walking only. They do not prove full external graph, furniture editing, save/reload or final visual quality. Added sceneMode=world in the owned editor for shared integration. The full objective stays ACTIVE.

## Current integrated checks and open findings

Foundation now wires saved furniture solids and art. Normal-app saved-arrival fixture proof (`production-proof.json`, `production-proof.mjs`) placed and moved the table through real DOM controls, undid the move, reloaded and retained its exact placement and journal entry on desktop and phone. Table placement changes the rendered canvas. First probe read before the 350ms IndexedDB debounce; the corrected probe waits for persistence. This is a focused fixture-based persistence proof, not the full opening-to-home journey. Screenshots were inspected. The empty old scene box and phone panel clipping remain visible shared UI defects until sceneMode is forwarded or the new contextual UI replaces it.

Explicit material calls now use the published shadeColor callback from foundation 74a5213. Contact shadows multiply inherited alpha. No residential time or shader field exists. Production morning/evening captures use the same map, camera and the actual saved placements recorded by the normal UI proof. Particles are disabled through reduced motion for material comparisons. Final lit frames re-enable effects. The captures reveal weak interior phase contrast because the shared atmosphere implementation hardcodes the same interior ambient vector for every phase. Do not label lighting accepted. `lighting-proof.json` retains pixel samples and zero page errors.

All 21 focused residential/apartment tests and TypeScript pass. Retained route video metadata confirms a real 20.04-second desktop VP9 recording, 960 by 900. A decoded walking frame was inspected.

The stair route remains visually flat in the shared player renderer. Proposed one pure surfaceHeight(mapId,point) seam to foundation/coordinator before altering shared rendering. Actual elevated treads, actor foot height and camera continuity remain open scope, along with independent art/experience review and full external route traversal.

## Fixed-edge refinement and focused independent review

Root's sparse-room critique remains open. The next pass changes the checkerboard wood into staggered planks, recesses window glass, varies book spines and plant silhouettes, and adds bathroom basin/towel/threshold details. All new fixed solids stay outside the placement region. Production normal-UI captures are refreshed with the actual saved bed/table layout; these are the current actor/camera, not a whole-room fit introduced by this owner.

Read-only helper /root/residential_review found two weak assertions and a structural render issue. Fixed all three. The gift test confirms all three gifts actually placed. The route test now uses every legal single-item placement/rotation and the foundation collider/pathfinder to preserve the protected strips and home exit route. Each custom depth item now renders its actual supplied prop directly; it does not scan the map-wide prop collection. No comments or suppressions needed removal. This narrow code review is not the required independent Astra art/experience acceptance.

The ground pass still rebuilds authored geometry each frame. Performance is unproven and should be profiled in the final integrated viewport before accepting it. Further optimization requires actual measurements. Native platform goal remains unavailable; objective stays ACTIVE in this committed record and ticket.

## Reproduced shared navigation safety gap

`trap-repro.mjs` reproduces the current production pure functions with valid apartment reducer actions. Place table at saved cell (2,0), repaired stool at (2,2), then cushion at (3,1). A player at world (9,7) stands on free floor before and after the last placement. Before placement a route to the home exit exists. Afterwards the pocket is enclosed and no exit path exists. Foundation safeAfterEdit returns (9,7) unchanged because it checks only canStand first. `trap-repro.json` records the placements, validator success, before/after path results and returned position.

This is a production-function safety reproduction, not an ordinary-UI editing reproduction. Current activity entry freezes the player at the furnishing anchor outside the placement region. The gap still affects the promised general post-edit/restore safety guarantee and future world-floor editing; restore must also reject disconnected positions. Foundation owns the fix and must check the exit-connected component. Do not mark the no-trapping gate complete from overlap-only checks.

## Ordinary-input desktop regression

The adapted foundation journey passed at this checkout in 5.4 minutes. It played the ordinary opening, served three real restaurant tables with change, looked up a word, then walked restaurant to town, courtyard, residential hall, stairs, apartment, roof, workshop, park and riverbank, and returned to the restaurant. It used real pointer and keyboard input, state reads only, no save injection and no internal dispatch. Reload preserved the exact position, served=3 and 17 journal entries. Page errors were empty. `regression/desktop-journey-proof.json`, `desktop-results.json`, arrival screenshots and compact `desktop-journey.mp4` retain the evidence. The full trace remains on disk in ignored temporary artifacts. No independent visual acceptance is implied.

The integrated Vitest suite passed 388 tests in 43 files once on this source, logged in regression/unit-suite.log. Focused residential checks remain 24. The first phone journey probe used the wrong camera size and failed; it is preserved as phone-coordinate-probe-failure.json/md. Production renders a half-size canvas, so its actual canvas dimensions must feed projection and pointer scaling. The corrected phone touch journey is running. Do not report that initial harness failure as a product defect.

## Agreed stair art handoff

After coordinator's minimal surface seam was agreed, replaced the continuous-ramp proposal with one piecewise-constant tread/landing table. surfaceLevels and surfaceHeight now derive from it. Floor top geometry uses the same exact heights. Raised windows, props, wall sections, rail endpoints and contact shadows add support height once. view.project remains absolute. Both callback exports are available from the leased map module and art module. Inspected fresh desktop/phone raised-landings art studies; no page errors. Foundation's actor/camera/picking consumption and new production ascent/descent remain required. Earlier successful ordinary journeys used the prior flat rendering.

The corrected phone ordinary-input journey passed in 6.2 minutes before the stair art mutation. It completed all areas, including apartment and roof, and retained reload continuity. Phone arrival screenshots were inspected. The first coordinate-probe failure remains separate, with its cause corrected in the proof helper.

## Retained phone ordinary-input proof

Phone full-route run passed in 6.2 minutes. It used the same opening/service/change/journal and full area order as desktop, with actual touchscreen taps for walking. After returning to restaurant, reload retained exactly (11.352290188433289,17.35229018843327), served=3 and 17 journal entries. Page errors were empty. `regression/phone-journey-proof.json`, `phone-results.json`, arrival screenshots, a compact H.264 recording, metadata and decoded contact sheet retain the result. Phone home/stair arrivals and decoded frames were inspected. This is the pre-elevation checkpoint and must not be used as raised-stair proof.

The per-map dispatch guard check also passes: residential makes no drawing calls on the unowned restaurant map. The narrow read-only review fixes remain included. Current full-scope acceptance is pending shared height integration, post-edit exit connectivity, current art/HUD assembly proof, performance and independent visual review. PR38 remains open against foundation; no merge was attempted.
