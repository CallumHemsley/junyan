# Rooftop garden evidence

Full objective remains **ACTIVE**. This is a reviewable rooftop implementation, not completion of the connected-world program or an independent visual PASS.

Owner is builder6, requested GPT-6.1 Sol medium. Thread `01a1ae20-85bf-7293-b853-cd8a6ebb7057`, attached managed cloud runtime `ccarenv_b64_Y2NhcmVudl9hZTI5NjBjNTFmNWM4MTkxODdjNzdiMTVhMzc3NjQxMw`, checkout `/workspace/junyan`, branch `codex/0083-rooftop`, strict port5485. Ticket0083 and goal.md are the durable objective. Native create_goal and cross-thread send were unavailable; no native registration is claimed. PR https://github.com/CallumHemsley/junyan/pull/32. Coordinator owns landing.

Product source proved here is `e1e3fa3b520dd3fab21246f7860dbbd24524ae14`, incorporating foundation23be251. Later evidence/helper-only commits do not change that product patch. Shared files were consumed from foundation commits; this writer edits only allocated rooftop map/art, garden feature, own ticket/evidence paths. No new dependencies, audio, renderer loops, clocks or save schemas.

The roof has a service landing, working reciprocal stairs, water tank/basin/pipes/drains, tool/potting corner, trellis and herb routes, three actual saved pots across six sites, orchard, skyline lookout and vine-covered seating terrace. Authored silhouettes distinguish herb blades, flowers, vines and trees. Varied rooflines recede behind the parapet. Existing growth/care/drooping/shade positions drive scenery; pot/shade feet drive collision. Existing tidying removes two real crate footprints. Shared material shading applies to all rooftop fills/strokes and preserves inherited occlusion alpha. One object entry per prop lets the shared compositor interleave actors.

## Current proof

- Full current Vitest suite386/386 passes in `unit-final.log`. Focused garden/map/art checks19/19 include all720 legal pot/shade configurations, shared schema/pathfinding, per-object uniqueness and other-map isolation. The earlier park graph failure disappeared after consuming its owner's updated dependency; this writer did not edit it.
- Production build passes in `build-final.log`; the shared bundle-size advisory remains visible.
- Unmodified existing garden browser journeys4/4 pass on desktop/phone through `legacy.config.ts`, covering care mistakes, confirmation focus, recovery, growth, movement, shade, gift, rain advice and reload. `legacy-results.json` retains the actual run.
- `runtime/proof.json` records actual App keyboard, ground click and phone touch-pad/tap travel to garden, water, trellis, lookout and terrace; garden activity opens and reload retains the world position. Both page-error arrays are empty. These are valid seeded legacy garden starts, not proof of the normal opening/service journey. [Desktop motion](runtime/desktop-traversal.mp4), [phone motion](runtime/phone-traversal.mp4), and inspected [desktop strip](runtime/desktop-motion-strip.png) / [phone strip](runtime/phone-motion-strip.png).
- `stairs/proof.json` records real rooftop→residential-stairs→rooftop triggers and reload on desktop/phone, without menu navigation. [Desktop stairs](stairs/desktop-stairs.mp4), [phone stairs](stairs/phone-stairs.mp4). The wider town/courtyard route belongs to global verification.
- `controls-proof.json` proves bound climber watering/moving leaves flower/tree unchanged, omits the legacy canvas and generic selector, provides six44px placement targets, and moves the stable plant anchor with its site on both sizes. This controls harness does not claim foundation has wired the binding yet.
- `materials/proof.json` records the SAME actual App map/camera under valid morning/evening service fixtures. Roof, wood, foliage and stone samples change. No rooftop particle hooks are present; reduced motion freezes incidental motion. [Morning](materials/morning-desktop.png), [evening](materials/evening-desktop.png). No fullscreen wash or alternate day clock.
- `layout-metrics.json` uses actual shared geometry at radius.22 and half-tile sampling. Initial connected surface estimate is978.25 tile², with62 props including clutter and eight reachable named landmarks. The lookout's smoothed route is39.14 units from the landing. Bounds48×36 are not used as quality evidence. There is one existing garden activity, with three stable per-plant bindings rather than invented additional activities.

## Performance limits

`performance/results.json` is a five-run cloud Chromium production-preview observation at390×844 during actual movement. Median background draw cadence22.09/s, range21.79–22.20/s; one60ms long task total; no page errors. RAF median16.7ms while only66–67 actual canvas background draws occurred per roughly3-second run. Separate `profile.json` / `profile-top.json` show substantial idle time and Canvas fill as the largest individual non-idle native sample. The shared viewport's30fps scheduling deserves foundation review. This is not a performance PASS, a speedup claim or real-phone hardware proof. Development observations are retained separately. No frame budget was raised.

## Failed attempts and remaining work

Early pointer drivers assumed a centered/full-resolution camera and read only the temporary checkpoint. They caused bad routes, including unintended actual stair travel. Driver now uses foundation's clamped camera, logical-to-CSS canvas conversion, dynamic map and both save layers. One concurrent exact-head refresh saw an action-button click timeout; isolated repetition passed on both sizes. Vite logs also show generated legacy trace HTML triggering page reloads. Future trace output is outside the watched source tree. The failed bounded-state JSON and initial failed recording are retained; no save-loss or product-pointer bug is claimed from those drivers.

Foundation0078 must append `projectGarden(state).anchors` and pass `Garden presentation="controls" plantId={validatedPlantId}` from stable interaction IDs `garden.flower|climber|tree`. Generic garden/water entry passes no plant ID and does not water. Current source exports the tested seam; no shared integration edit by this owner.

Life0087 still needs nonverbal seated-player behavior at `rooftop.sit` (35,29.5) and lookout behavior at `rooftop.lookout` (44,12). Current hooks support inspection, not a claimed finished sitting interaction. Independent Astra art/experience review is outstanding. Return findings to this writer; goal stays active until integration and review fixes are proven. Normal opening/service/change/journal and all-place journey remain global gates.

Earlier `baseline-*`, first-pass screenshots and `v2-*` show the rejected pale/repeated planting and the next art iteration. Current production material/runtime captures supersede them. The visual target has not been downgraded to those early studies.

Reproduce on the owned strict dev port with the committed proof scripts. `encode-videos.sh` converts actual recordings to the retained MP4s. `performance.mjs` supports `PROOF_RELEASE=1` with its committed valid fixture and the production preview on5485. Stop the dev server before reusing that same port; never touch another worker's listener or local preview5474.
