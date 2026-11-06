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
