# Independent connected-world review

Status **ACTIVE / ISSUES**. Ticket 0088 remains doing. Owner 01a1ae1f-27e8-72f0-8ffc-26564922f069. No native goal tool exists; this is the durable objective. Keep reviewing successive integrated builds until the full large, beautiful, connected life-sim world withstands independent play and parent audit. Do not close after one tranche. No audio generation, implementation edits or independent merges.

## Baseline identity and evidence

Product main `8cd5bc209b7dc2d91cc0f765991de313f813f4eb`. Capture checkout `5132785601e5f2e688f6158d00109869c90ed218` adds coordinator documentation only. Contract reviewed at `056a5e63f956747058ca2e5996ddca3b6d1e6f83`. See manifest.json for artifact hashes. Node 22 existing toolchain; TypeScript and Vite production build pass, with pre-existing Zod annotation and large bundle warnings. No dependency install or frozen-install claim.

Run from repository root:

```
PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers /workspace/.junyan-tools/node_modules/node/bin/node node_modules/@playwright/test/cli.js test --config docs/evidence/0088/baseline.config.ts
```

2/2 production journeys passed in 28 seconds. Normal hospital opening, five actual menu destinations, arrow inputs, rooftop reload, no console/page errors. No debug setters or save seeding. These checks document the baseline; they do not prove world walking or complete activity regression. Ten full-page screenshots inspected. Desktop 1440x1000, phone 390x664 CSS pixels with device scale 3. Observations JSON records measured canvas/document bounds. Videos under results are launch-muted WebM, not an audio listening or complete gameplay review. Their durations are 12.84 and 13.68 seconds; they include opening and menu changes, not a connected-world tour.

Capture setup failures were infrastructure, not application defects: first default cache lacked ffmpeg; existing /workspace/.junyan-tools/browsers supplies it. An attempted download was denied by network policy; no bypass. Second preview omitted --base /junyan/, so application assets did not load. Corrected review config matches repository preview setup. Historical failed runner JSON is retained under docs/evidence/0088/results.json inside this evidence directory's nested docs folder; successful results.json is authoritative.

## Independent findings and writer routing

| Priority | Evidence / impact | Writer / missing proof |
|---|---|---|
| P1 | src/neighbourhood/Neighbourhood.tsx:13-16 and src/neighbourhood/state.ts:51-55 directly swap places. Runtime menu clicks confirm isolated destinations. No walkable street/door/stair connections. | 0078. Record normal-control outward-and-return traversal through all places. |
| P1 | src/scene/renderer.js:26-37 fixes projection and bounds; src/App.tsx:337-374 disables walking outside restaurant. All five rendered canvases measure 360x280 intrinsic pixels. | 0078. Continuous held input, scrolling camera, edge/pointer round trips, swept footprint collisions. |
| P1 | src/save.ts:15-18 bounds sole player position to restaurant; neighbourhood/contracts.ts:25-33 has no per-map return positions. | 0078. Compatible migration and reload at every entrance, landing, activity and exterior landmark. |
| P1 evidence gap | e2e/neighbourhood.spec.ts:31-34 navigates by menu buttons. Those valuable activity regressions cannot demonstrate world traversal. | 0078 + review. New integrated ordinary-control journey and measured reachable content. |
| P2 visual | All inspected images show detached cutaway floors surrounded by beige panels. Courtyard and workshop desktop layouts leave most lower viewport empty. Phone canvas heights 264-283 CSS px occupy only 40-43% of 664px viewport; apartment document is 856px tall. | 0078 + map owners. World-focused play area, contextual DOM controls, preserved readable learning UI. |

Confirmed P2 checkpoint rollback. Independent normal-UI desktop and phone reproduction moved within 52ms/38ms after return. IndexedDB saved {6.45,2.95}, stale checkpoint retained {6,2.5}, reload rewrote IndexedDB to {6,2.5}. See save-repro/README.md, full store snapshots and intentionally failing 2/2 regression. Foundation owns correction; unrelated progress loss is not claimed.

## Visual critique and prioritized targets

The baseline has coherent cream/jade/wood/ink color, readable isometric furniture, recognizable food service and distinct activity props. Preserve those strengths. The apartment is deliberately sparse before furnishing; this initial screenshot alone does not prove lack of activity depth. The courtyard has a clear bicycle/bench/door composition but no surrounding neighbourhood. Workshop's large lamp communicates the task, yet reads as an object vignette. Rooftop offers skyline context but repeats near-identical tower blocks and leaves much floor empty. These are observed composition limits, not approval to add random clutter.

Prioritize a traversable street-to-interior sequence with visible architectural continuity, then authored river/park loops and inhabited landmarks. Interiors need meaningful routes and destinations, rather than oversized empty floors. Give regions distinct silhouettes/materials and transitions, layer foreground/background depth without hiding the player, and add residents and ambient motion with a reason to return. UI should reveal the immediate activity while the world remains the primary experience. Ten isolated polished components do not satisfy this target.

## Review rubric and executable route protocol

Primary visual reference: https://www.stardewvalley.net/media/ and its official screenshot/trailer. Reference is for density, readable landmarks, character and exploration ambition; no proprietary assets or copied layout. Junyan retains its original Mandarin setting and tokens. No asserted Stardew map statistics.

Scores use 0 absent, 1 inadequate, 2 partial, 3 convincing, 4 polished, or unverified. Scores never override a failed functional gate. Baseline snapshot EXPERIENCE for connected-world ambition is 1/4, a qualitative judgment from actual captures and limited navigation, not a retention measure. Component visual craft 2/4; world connectivity 0/4; exploration breadth 0/4; world-focused composition 1/4. Sustained life, performance, full activity continuity and time variants remain unverified.

For each new integrated SHA:

1. Record exact source/build hashes, browser/device/viewport, test URL, process owner, seed and initial save provenance. Build and serve on reviewer-owned strict port.
2. Play normal opening once. Walk restaurant -> town -> courtyard -> residential hall -> stairs -> apartment -> stairs -> rooftop -> stairs -> town -> workshop -> town -> riverbank -> park -> courtyard -> town -> restaurant. Adjust route only to actual graph, logging every edge. No debug teleport or menu substitute. Record uncut video and route time excluding dialogue pauses separately from total time.
3. At every region record reachable bounds/floor area, distinct landmarks, accessible entrances, meaningful interactions and dead ends. Measure shortest functional route and exploration route separately. Empty dimensions and clone-stamped props do not count as breadth.
4. Test held keyboard and touch movement, diagonal corners, wall sliding, release/blur, NPC crossings, occlusion, screen edges, pointer mapping after camera scroll/resize and all door thresholds. Verify safe arrivals outside exit triggers.
5. Enter each real activity through proximity, perform a meaningful action, return, and reload. Compare map/player/facing/return points plus orders/day/journal/gifts/activity state. Exercise legacy and corrupt saves separately with explicitly labeled seeded fixtures.
6. Inspect desktop and phone landmarks across available day/light/weather variants. Check silhouette, palette, material variety, density, depth, repetition and UI occlusion. Review motion footage; record NPC traffic and repeated visits. Reduced motion must retain readability; hidden tabs suspend decorative work.
7. Run original opening/service/change/journal and native existing-audio/offline regressions. Check focus, Chinese DOM token taps, replay, 44px controls, console and measured frame behavior. No generated audio.
8. File each defect with exact head, file/line, impact, normal-control repro, screenshot/video timestamp, missing regression test and writer. Recheck corrected integrated head independently; preserve failure evidence. New integrations invalidate any blanket earlier PASS.

## Contract review at 056a5e6

Ownership boundaries are coherent for a documentation proposal. No blocking ownership collision found. This is not implemented API acceptance.

- P2: example-module.ts:45 and contract-v1.md:59 leave timeOfDay number units/range undefined. Foundation and atmosphere should publish one clock conversion and morning/dusk/reload fixtures.
- P2: contract-v1.md:29 says IDs namespaced by map while line 43 prescribes local from-town/to-town identifiers. Clarify entrance/exit uniqueness is map-local, and references resolve by targetMapId plus targetEntranceId. Validate two maps legitimately sharing from-town.
- Production adapter remains pending under line 63. Require concrete imports, draw outputs, origin/depth semantics and a compiled consumer before art integration. Example placeholder actors/interaction IDs are not executable acceptance.

## Coverage and next actions

Completed independent source slices: art/composition/world-life structural audit; movement/camera/save/UI structural audit. Completed actual baseline normal-opening/menu/reload captures on desktop and phone. Contract proposal independently reviewed. Save-race reproduced independently on desktop and phone; 2/2 regression assertions fail as retained defect evidence. No full integrated-world head is available in this review yet.

Next: publish baseline, relay contract clarifications to coordinator/foundation/atmosphere, return confirmed save defect to foundation, then acquire the first published integrated walking head. Dispatch independent runtime art, movement/collision, world-life, touch/accessibility and regression/performance coverage against that exact head. Do not treat individual producer reports as acceptance.

Pstack Prove It Works required actual runtime evidence instead of producer claims. Experience First preserves the full requested exploration target rather than shrinking it to a convenient hub. Swarm guidance supplies exact-head independent coverage and aggregation. No native platform goal registration was claimed.

Baseline Playwright traces remain in this cloud checkout and are not included in the branch; published screenshots, videos, JSON and rerunnable specs provide the durable evidence. The save-repro sub-review began while the parent advanced documentation commits; production src and built JS hashes stayed at baseline throughout.

## Contract clarification recheck at 14f3634

Read the actual updated contract and example. Entrance/exit IDs are now explicitly map-local with pair resolution. timeOfDay is now morning/noon/evening/night, elapsedMs is animation milliseconds, and required authoritative-clock conversion fixtures are explicit. Both documentation ambiguities are resolved; production conversion and geometry behavior still require independent checks. Contextual activity embedding now explicitly forbids replacing the world with a legacy diorama or nesting that scene in a panel. This is aligned with the acceptance target. The latest coordinator branch was merged without production changes or conflicts.

Baseline plus save evidence published in draft PR https://github.com/CallumHemsley/junyan/pull/28 and relayed in coordinator PR 27 comment 6672824756. Review server ports 5490 and 5491 have no remaining listeners. Next concrete integration review is waiting on foundation runnable viewport, while published schema/camera/render interfaces are under an independent static pass.

## Foundation seam review at 9f144d5

Independent source review plus parent actual-source TypeScript-transpiled probes confirm three boundary defects: walkable-union gaps accepted by corner-only footprint checks; valid radius-based anchors rejected when their centers are solid; NaN endpoint accepted by canWalk. Full scope and missing tests in seam/README.md with source hashes/results. These are synthetic API fixtures, not claims of observed integrated player failure. Root/coordinator informed through PR27 comment6672879426. Actual large-map pathfinding measurements are in progress; no performance issue is asserted from BFS complexity alone. Object/actor occlusion must still be reviewed in the production viewport.

## Measured pathfinding at geometry 9f144d5 / town 3747266

Actual town geometry in an isolated phone-sized browser click harness produced far-river detour search median144.9ms (range142.3–198ms,n7), with handler-to-RAF median146.7ms. Courtyard and tea detour medians105.5/108.4ms. Direct path0.7ms; invalid building target <=0.1ms is early rejection. 24long tasks104–199ms included warmups. All35measured routes/no-routes were expected and segment-valid under the same module; not an independent collision proof. Separate CPU profile identifies repeated collider scans in swept checks as limiter. Actual town standing-grid scan found one component, so no fabricated disconnected target. Full method, timings, fixture/source hashes and script in pathfinding/README.md. These are not physical-phone or production-viewport latency claims. Root/coordinator informed via PR27 comment6672944543; repeat on integrated real camera/input before final severity.

## Production viewport e6270d0

Built exact e6270d095dead66ccb1d6fe9fb1815bbee86d702 in isolated detached checkout. 2/2 normal-opening held-walk/contextual-service/close/reload journeys pass with saved positions equal and no page errors. Another2/2 observation runs verify real native phone touch-pad hold and desktop key movement to map edge. Inspected entry/walk/activity/edge captures. Edge screenshots confirm large lower-frame void; DOM confirms location label DIV has no token controls and pointer-events:none. Report in viewport-e6270d0/README.md. This head contains restaurant placeholder only; no multi-region or custom-object depth acceptance. Full art quality remains inadequate. Foundation is already revising framing. Need next published integrated head, actual large-map click paths, custom object/actor overlap and full activity interactions. Checkpoint cost measurement pending separately.

## Checkpoint performance observation at e6270d0

No frame stall observed in phone-sized cloud Chromium. Five alternating two-second held-movement samples per load confirmed median121 native synchronous writes for both ordinary2026-byte/4word and diagnostic20553-byte/267registered-word saves. Full-journal native setItem median10.0ms total (8.0–13.2), stringify8.1ms (7.2–8.5), maximumRAFgap16.8ms and zero>50ms gaps. All persistence/journal/error assertions pass. Diagnostic journal is explicitly seeded; first ordinary sample follows normal opening. Observational wrappers preserve native calls. Other cloud browser work was concurrent. No claim about physical phones, full populated worlds or all checkpoint race orderings. Report/profile/raw observations in checkpoint-perf/README.md. Source concern about per-frame writes is confirmed; a performance defect is NOT established by these measurements. Repeat on integrated dense maps before acceptance.

## Integrated c4ec7ed and lighting 74a5213

Desktop normal-input route through all ten maps and 17 physical exits passed, 148903ms summed transition duration; table/kitchen reachable. Confirmed table Go to kitchen button inert due selected-anchor guard, while actual physical kitchen works. Full activity/visual acceptance OPEN; inspected town/courtyard/park composition remains inadequate. See integrated-c4ec7ed/README.md. Coordinator relay6673162995.

Independent exact-source lighting execution at74a5213 confirms order-dependent identical material output and global proxy double-shading atmosphere/emissives; not screenshot pixel claims. See lighting-review/README.md with executable reproduction and exact outputs. Coordinator relay6673181044. Requested next-head worker request races/inverse picking/resize elapsed checks queued. Goal ACTIVE.

## Activity obstruction and new23be251 checkpoint

c4ec normal-input activity run completed3 service/change cycles and journal, then cats-white click intercepted by cats-black in collapsed contextual controls. Failed-run evidence published7d8fd0e; no forced action or later activity PASS. New23be251 production build passes. Exact-source lighting probe resolves order/exposure and tested raw-atmosphere boundary; owner callback adoption still absent. Worker desktop/phone observations establish tested final-click arrival, keyboard cancellation and steady inverse picking, with limits in worker-23be251/README.md. Full goal ACTIVE; source-only edit recovery and independent Astra visual review ongoing, unaffected activity coverage running.
