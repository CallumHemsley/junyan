# Workshop builder: active objective

Status: ACTIVE. Native create_goal and cross-thread send tools are unavailable; no platform goal registration is claimed.

Build a richly dressed, walkable workshop and covered entry directly connected to town. Preserve all existing reversible lamp/toy rules, callbacks, voices, gifts, journal and saves. Separate repair benches must be reachable on foot, with contextual controls and safe returns. Meaningful circulation, player-scale object detail, window light and foreground occlusion must survive actual phone/desktop traversal and independent review. An isolated preview does not complete this objective.

- Worker thread: 01a1ae20-69b1-74c6-855c-c2e228970064, host durable.
- Cloud environment: ccarenv_b64_Y2NhcmVudl9iOGNmMDc5Zjk0ZjQ4MTkxOWEzZjUzNzg4MDNhNmJlYw.
- Ticket/branch: 0082 / codex/0082-workshop. Checkout /workspace/junyan. Strict Vite port 5484.
- Contract: v1, centrally published at fb167fd5047010beaac7809b4d6a41a804b7fb42.
- Ownership: src/world/maps/workshop/*, src/world/art/workshop/*, src/features/repairs/*, this evidence directory and ticket.
- Baseline: 8cd5bc2. Existing repair/neighbourhood tests: 33 passing before implementation.

## Layout choice

Compared a single central table with two work islands. The central table repeats the original single-bench miniature and prevents believable separate jobs. Two islands preserve a broad central aisle and branching perimeter routes. Rear storage, left window bench, foreground joinery/sewing and a covered delivery yard give the player reasons to explore beyond an interaction point.

The map is 30 by 29 tiles, with an authored 26 by 19 interior and 26 by 6 entry yard. Actual reachable floor area and route lengths remain to be measured by foundation's footprint-aware navigator. Dimensions alone are not proof.

## Foundation integration requests

1. Import mapDefinitions from src/world/maps/workshop/index.ts and validate through the one shared schema.
2. Town exit targets workshop/from-town; workshop/to-town targets town/from-workshop. Spawn (15,25) is outside exit rect y26..27 to prevent bounce-back.
3. Two repairs anchors: interactionId repair-lamp and repair-toy. Entering should dispatch the existing {type:'switch',job:'lamp'|'toy'} before opening controls. Close restores approach position. Reducers and save schemas remain unchanged.
4. Artwork will export a pure adapter under src/world/art/workshop; awaiting foundation's exact draw-command API. Occluders declare geometry/height/fade; shared renderer owns player-depth implementation.
5. Render returned-object shelf from repairs.completed. Repair bench object state uses repairs.jobs.lamp/toy without changing either state.

## Throughput checkpoint

- Blocking: central ownership acquired; exact renderer adapter and foundation navigator still pending.
- Independent: local map, props and artwork can progress without shared writes.
- Shared mutable state: only foundation edits schema/registry/save/App/renderer and contextual activity wiring.
- Smallest safe decomposition: one workshop writer; independent Astra review supplied by program.

## Verification and next actions

Completed: current main fetched; required guidance/decisions/tokens and actual repair feature inspected; baseline 33 tests pass. Pstack read from configured cursor/plugins source in cloud, including poteto-mode, prototype, feature, autopilot-full, shipping and principles Experience First, Model the Domain, Prove It Works. Native cloud tools replace harness commands; no gh.

Pending: detailed artwork, shared schema/nav validation, actual keyboard/touch entry/exit and both activities, save/reload, inspected phone/desktop screenshots, motion/camera/console evidence and independent review. Keep objective ACTIVE until integrated proof exists.

## Buildable checkpoint: exact drawing API and depth

The branch incorporates foundation's published API commits through e6270d0 as upstream merges, without changing foundation-owned files. Workshop commits can be selected by path/commit at integration; do not replace foundation files from this branch.

Production `src/world/art/workshop/index.ts` exports `drawMap` (ground only), `renderObjects` (one matching ID per authored prop, interleaved by the shared compositor), and `createWorkshopArt(repairs)` (the same module with explicit authoritative repair state injected). It imports the real foundation types. No independent production input/frame/save loop exists. The isolated `preview.html` exercises legacy raster art; `walk.html` consumes shared geometry/camera to prove circulation. Neither establishes integrated completion.

Integration: foundation may call `createWorkshopArt(game.neighbourhood.repairs)` in its compositor to display actual returned objects and bench states. The default named exports still draw an initial room. Do not infer repaired state from local clocks. For entering a bench, `repairActionForWorldAnchor(interactionId)` from `src/features/repairs/world.ts` returns the existing switch action. Dispatch that through the existing feature boundary before opening. `Repairs` accepts optional `contextualJob` to suppress cross-bench job tabs when opened from a physical bench; foundation passes the matching job after applying the switch. Existing legacy use remains compatible.

Shared-schema/collision tests: 3 authored-map checks passed, including both benches, town safe arrival/exit, NPC routes and foreground station approach paths. Original repair/neighbourhood/save checks: 85 passed (88 including map tests). TypeScript passed. Two desktop/phone isolated walking runs reached five landmarks each and returned to entry with no page errors; keyboard moved from (15,25) into the interior. Actual screen clicks/touch ground mapping and production save/reload still require integrated proof.

Inspected raster desktop lamp and phone entry screenshots, then exact Canvas adapter desktop lamp and phone lamp screenshots. The first phone adapter preview used a fixed 720 logical width and looked too small; harness now uses its CSS viewport width and production-like 18px phone tile scale. Final depth/scale recaptures pending. The initial raster capture had one missing favicon request on desktop; added an inline empty favicon, rerun pending. Browser video install was denied by configured network policy; used already installed /usr/bin/ffmpeg through Playwright's local cache executable path. No network bypass or dependency change.

Remaining gates: production town graph, both contextual jobs, actual shelf state injection, save/reload and gifts, original full journey, final phone/desktop depth captures, motion inspection and independent Astra review. Objective remains ACTIVE.

## Production checkpoint at f493451

Full objective remains ACTIVE. Draft PR: https://github.com/CallumHemsley/junyan/pull/31, based on the foundation branch. No merge or complete-goal claim.

Current branch incorporates foundation 74a5213. Foundation's physical anchor binding and explicit saved repair-state injection are now present. Both real production bench interactions select their correct job. The view exposes `presentation="controls"` (also selected when contextualJob is passed) and never mounts the old RepairScene in that presentation.

Actual normal-mode production proof, on desktop and phone, now covers floor-pointer approaches, both complete reversible repair journeys, close/reload at the same approach, two completed jobs retained, and repeat-and-reload of BOTH jobs with unfinished active objects retained on their actual benches. The proof begins from a disclosed legacy repairs save, so it does not prove the opening-to-town journey. See production-proof.mjs, production-results.json and production-repeat-{lamp,toy} captures. IndexedDB observations were polled separately from visible UI state; the successful runs settle and remain closed after reload. No save-loss bug is claimed from earlier stale reads.

Reciprocal production door proof uses an actual completed-repair save generated by the UI proof. Mouse and touch leave workshop through to-town, reload in town and return through the actual reciprocal entrance, retaining both completions and per-map safe positions. See town-door-results.json, production-town-arrival/door-return captures and production-video. Motion contact sheet inspected. The first door fixture manually combined completed jobs with an incompatible intro feedback and was correctly reset by validation; that invalid fixture was replaced by the actual valid UI save. It is not a product save-loss finding.

Shared navigation measurement: approximately 463 reachable tile-squared from the safe entrance on a 0.5-tile center lattice, 40 props, nine authored landmarks and two real repair anchors. This is a sampled navigable-floor estimate, not an exact geometric area. Entry-to-lamp route is about 16 tiles; entry-to-display approach about 24 tiles. See reachability.json and measure.mjs.

Verification: full integrated suite 380 passed and production build passed on the material-adapter checkpoint. After the reviewed repeat-art fix, TypeScript and 18 focused repair/circulation/bench-rendering tests passed, including two new behavioral repeat occupancy regressions. Tracked public/audio bytes match baseline main (git diff --quiet). No voices/content/reducer changes were authored.

## Independent focused Astra review

Read-only cloud helper `/root/workshop_review`, GPT-6 Astra medium, independently inspected owned source and real screenshots/scripts/results. It found P2: repeated jobs were hidden because completed persists. Fixed at f493451 by projecting bench occupancy from jobs[job] nullness; returned shelves still follow completed. The helper re-read the fix and regression and confirmed that finding resolved, with no additional confirmed defect in those changes. It did not rerun tests, hear voices, play videos or prove gift claiming. This is a focused code/visual review, not the program's final experience verdict. No native Comment Sicko harness was claimed.

Additional accepted observations: floor light patches now multiply inherited alpha; chair/thread box inherit supporting bench depth and fading metadata; primitive face contrast is authored before the atmosphere callback rather than treating solar exposure as face brightness. Contact shadows preserve alpha through save/restore.

## Open upstream findings and remaining gates

1. Interior morning/evening shading is visually too similar: sampleAtmosphere replaces phase ambient with the constant [.92,.89,.83]. Workshop explicitly consumes shadeColor for every non-emissive primitive/floor/shadow. Same-map/camera material-only captures report the difference separately from effects; do not treat many changed pixels of tiny RGB delta as strong visual acceptance. Atmospheric task lights use the standard lamp prop kind and central phase-driven emitter handling. Await atmosphere's corrected interior light, then recapture. No competing clock or full-screen tint added.
2. Expanded real phone depth proof intermittently stops at an intermediate waypoint: target (8,10.8), from approximately (8,6.8), actual stop (11,10.5). Exact click and state are retained in phone-depth-failure.json/png. A previous stable run completed the lamp front/behind/beside routes on both viewports; the expanded foreground run succeeded on desktop but exposed this phone stall. Foundation controller may clear remaining path for an epsilon-length waypoint delta. This is an upstream request, not a patched or accepted movement PASS.
3. Foreground joinery/attached-chair captures are available on desktop; final phone expansion awaits the route stall correction. Existing lamp-bench depth results alone do not prove every foreground fade.
4. Full original opening/service/change/journal/offline/audio journey, final contextual HUD review, gift claim/idempotence in real UI, and program-wide independent Astra experience acceptance remain central gates. Focused review has not declared them passed.

Next: provide the fixed workshop tip and evidence to foundation/reviewer, verify the route stall and phase correction on their new executable head, rerun foreground/repeat proof if integration changes, and address concrete independent experience findings. Keep 0082 doing until those gates are satisfied.

### Confirmed waypoint reproduction

`waypoint-repro.mjs` evaluates the viewport's exact waypoint/move/clear sequence with shared geometry and this authored map. At 20ms, 33.333ms and 40ms injected frame steps, it reproduces the same stop at (11,10.5): a residual delta around 1e-14 (or 1e-12) shifts the intermediate node, then moving=false clears the still-valid remaining route. Shared canWalk confirms the final segment is clear. At 16ms and 16.667ms the same route reaches the target. The issue is thus frame-step dependent controller epsilon handling, not insufficient workshop clearance. See waypoint-reproduction.json. Foundation was asked to snap/skip reached nodes before testing displacement and retain remaining nodes on a non-blocked snap.

### Stool gift and exact evidence labels

The actual production gift claim now passes on desktop and phone: one repairs.stool in apartment.owned, one claimedGiftIds entry, no claim control after reload, same world approach position and no page errors. This closes the workshop's focused gift-claim/idempotence proof gap; it does not prove apartment placement or the full original game journey. See gift-proof.mjs, gift-results.json and gift-claimed screenshots.

Production video manifest labels the successful desktop and phone recordings separately from the retained failed-invalid-fixture run. The timed contact sheet now includes the return as well as departure. Same-camera lighting screenshots were refreshed after the material face-contrast fix. No phase-contrast acceptance claim: the upstream fixed interior ambient remains visible as a weak difference.

The focused Astra reviewer re-read f493451 and confirmed its accepted P2 resolved; actual normal-UI repeat/reload captures for both jobs are now also present on both viewports. Phone expanded foreground depth remains blocked by the reproduced shared waypoint controller issue. The prior depth-results.json is the successful lamp-only run; expanded joinery desktop captures and phone failure are labeled separately in progress until the shared fix permits an end-to-end recapture.
