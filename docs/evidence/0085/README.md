# Character work, ticket 0085

Status **ACTIVE**, candidate module, integration unverified. Worker `01a1ae20-a104-7194-a9ec-12689dfeb07f` in managed cloud, branch `codex/0085-characters`, port 5487. Native goal mutation unavailable; persistent objective recorded in the ticket.

## API proposal for foundation

`src/world/characters/index.ts` exports `sampleActor(input)` accepting the contract v1 actor fields. Optional `distanceTravelled` makes gait advance from actual movement rather than a clock, preventing continued walking when collision stops the player. Optional world `yaw` supports eight directional views. Four cardinal facing values follow the current isometric camera. Optional `posture` selects sit, crouch, work or reaction; `carrying` selects attached tray artwork. Inputs contain all time. No timers, DOM, listeners, storage or audio live in the sampler.

Output contains named `frameId`, RGBA pixels, foot and held-object attachment points, and coalesced native-pixel runs relative to the feet. `adapter.ts` offers an isolated adapter for current Pixel Plays projection through supplied `project`, depth-tested `pixel` and optional `shadow` callbacks. Each pixel projects its own world-relative elevation for foreground occlusion. Native scale is 18 pixels per tile. The canvas adapter is for local fixtures only. Foundation owns the exact production adapter, registration and all shared renderer edits.

The legacy hospital and service renderer are unchanged. This candidate is not proof of their integration or original-activity regression.

## Evidence and known limits

- Initial inspected original direction sheet `prototype-directions.png` exposed weak diagonals and gait. It is retained as the rejected first iteration.
- First full suite attempt retained 308 legacy test passes but the new test had syntax errors. Those were corrected.
- Scoped actor suite now passes 5 behavior tests. It checks cast distinction, all eight directional images, movement-to-camera mapping, planted feet, distance-driven gait, blink, held-object variation, reduced motion, contextual images and depth-sampling calls.
- `pnpm build` passes. Existing bundle-size and upstream Zod annotation warnings remain.
- Native-scale motion, touch, phone/desktop screenshots and actual production occlusion are still to verify. No quality PASS is claimed.
- Existing cast colors and accessories are read from approved content. No copied sprites or new audio.

## Next actions

Inspect the improved candidate in the native raster fixture, correct pose/feet defects, record keyboard and touch motion. Consume 0078's exact production adapter when published. Request independent review and fix findings after integration. Keep the full objective active.

## Executable foundation handoff, revision 2

The module now imports the real `WorldRenderView` and `WorldDrawCommand` from `src/world/render-contract.ts`, supplied by foundation's branch. `sampleActor` returns `worldCommands` as relative world polygons in addition to native `drawCommands` pixel runs. Translate each polygon point by the actor position before passing it to foundation `drawCommands`. This uses contract v1's isometric projection. Native scale is 18 projected pixels per ground-axis unit. The preferred crisp adapter is exported as `drawActor(ctx, view, sample, position)`. Call it once in `objects`, sorted with scenery by actor ground depth. It projects through the real view, derives scale and snaps every pixel rectangle edge, preserving sharp edges and avoiding fractional-size scan lines. It owns no loop. `paintActor` additionally demonstrates genuine per-pixel depth testing with the legacy rasterizer for the comparison fixture.

Actor additions are optional inputs, not shared save/schema changes. `posture` can be stand/sit/crouch/work/react. `heldObject` can be tray/watering-can/tool. Use these for existing Lin Jie gardening and Lin Jie/Xiao Zhou repairs contexts; they do not create new cast identities or new speech. Explicit yaw follows `(cos(yaw),sin(yaw))` ground direction. North, east, south, west resolve to sprite directions 3,1,7,5 respectively for the existing camera. Reduced motion freezes incidental motion and gait while preserving explicit posture, direction and held objects. Distance-based gait should be used for moving actors; elapsed-time fallback is provided for fixtures or callers without travelled distance.

The initial repeated silhouettes were rejected by root review. Revision 2 replaces them with three-quarter contour changes, offset shoulders and layered near/far arms. The teacher is shorter and stooped with slower elapsed-time cadence; Lin Jie has a fuller cardigan; Xiao Li is taller and tidy; Xiao Zhou is slender with a side ponytail and backpack. Idle acting is a brief hand adjustment and blink, not perpetual bobbing. Rear held objects compose behind opaque body pixels.

## Verification checkpoint, 2026-11-06

- Revision 2 cloud Chromium fixture passed desktop 1280x900 and phone 390x844 keyboard movement, pointer/touch movement, reduced-motion pixel equality and clean console checks. `fixture-results.json` records actual positions. Motion recordings are `desktop-motion.webm` and `phone-motion.webm`. Their extracted motion strips were inspected. The recordings contain video only, confirmed with ffprobe; no audio generation or system-volume changes.
- Full suite passed 318 tests before adding the actual-raster occlusion test. The scoped character suite now passes 6 tests, including actual Pixel Plays foreground box occlusion with visible head and hidden lower body. Build passes.
- Original waiter Playwright checks passed all three desktop cases and phone movement/reload. Phone full journey was interrupted during overlapping source/build work, returning to the opening while waiting for the kitchen. It passed on an unchanged-checkout isolated rerun in 33.3 seconds. The interruption is retained as an inconclusive run, not silently counted as a pass.
- Draft PR https://github.com/CallumHemsley/junyan/pull/30 targets foundation. This is a reviewable integration candidate, not a completion claim.
- Foundation dependency was merged through `e6270d0` to consume the real per-object compositor type. `actorObject(id, sample, position)` now returns a real `WorldRenderObject` with grounded depth. Call `sampleActor` once for that actor and pass the result to this factory. `drawActor` intentionally does not filter `view.pass`, because foundation's sorted-object callbacks currently receive its original view. The caller places the object into the sorted actor/object list.

Production camera scales 18/24, phone DPR 1/2, residents with held objects, actual authored scenery crossings and independent experience review remain OPEN. Foundation is the only production wiring owner. No shared renderer, App, save or content file has been edited by 0085. Foundation changes appear only through dependency merges.

## Camera adapter matrix

`camera-results.json` and `camera-{18,24}-dpr-{1,2}.png` record the exact foundation camera projection at both production zooms with DPR-scaled backing surfaces. All four images were inspected. The held watering can, pixel edges and foot anchor remain coherent. This is a controlled adapter check, not a claim that production scenery crossings have passed. Contact shadows now include individual planted feet. `revised-directions-2x.png` is the revised native cast sheet.

## First production motion checkpoint

Foundation production integration `1450bf6` is now consumed on this branch. `production/results.json`, three actual viewport recordings and start/walk/scenery screenshots cover desktop and phone browser contexts with real devicePixelRatio 1 and 2. Keyboard motion moved the player more than one world unit in every case. Consoles were clean. The real restaurant table occludes the lower body in the inspected desktop and phone images. The compositor intentionally renders at half CSS resolution with DPR-independent native backing; results record that observed size rather than assuming a different DPR policy.

A real integration defect remains. Rightward keyboard movement changes world x positively and y negatively, while saved four-way facing resolves north and the actor shows its rear three-quarter view. Production only passes cardinal facing. The actor sampler already supports exact yaw. Foundation must pass movement yaw and retain it while idle; this request is posted on PR30. Production NPC contextual work passes posture but does not yet supply held objects. These are open integration findings, not an art redesign request.

The requested single material-lighting seam was read from coordinator integration-v1.1. At observed foundation `c4ec7ed`, WorldRenderView still lacks shadeColor. The actor consumer will use the exact published callback once foundation supplies the type. No independent clock or competing shader was introduced. Morning/evening production material proof is pending that seam.

## Explicit material consumer, foundation74a5213

The real optional WorldRenderView.shadeColor type was acquired from foundation74a5213. drawActor now explicitly routes all owned pixel colors and contact-shadow colors through it. Absence is identity only for old fixtures. Canvas alpha is inherited and multiplied only for actor shadows, then restored. World polygon commands emit authored #RRGGBB colors, compatible with the shared shader input.

The public drawActor material test verifies that every fill uses the supplied callback and that inherited alpha .45 remains .45 after drawing. All 7 actor checks pass. Current integrated full suite passes **381 tests in 40 files**, including the previously failing park graph test after the landscape owner's dependency update. Build passes.

`lighting/` contains inspected same-map/same-camera morning and evening captures from the actual production paintWorld courtyard renderer. The supplied game.served values 0 and 3 select foundation's authoritative morning/evening phase; no new clock is introduced. Reduced motion suppresses particles, actor time/position/camera are identical, and the actor-region hashes differ. These are explicit consumer evidence. The foundation74a5213 context proxy/output-color heuristic has been returned by root and still appears in this dependency source, so final whole-scene lighting acceptance remains OPEN until foundation replaces it.

Remaining integration findings are movement yaw, contextual held objects and independent whole-experience review. No final quality PASS is claimed. Goal ACTIVE.

Initial PR30 was merged at9b99e3e. Follow-up material and real-production evidence is in draft PR37 https://github.com/CallumHemsley/junyan/pull/37 at846dd6a. Do not attribute later evidence or lighting changes to the earlier merged diff. Root/foundation have the explicit yaw, held-object and proxy findings. Preview5487 remains available in managed cloud. Objective ACTIVE pending integration fixes and independent verdict.

## Identity and physical seat correction

Root reproduced courtyard characterId aunt falling through the old sampler to the player palette. catalog.ts now explicitly lists player, four regulars, courtyard aunt and five canonical background IDs. Aunt uses the accepted cats scene palette shirt[145,151,132], hair[82,70,59], dark trousers, shoulder-length bob and cream wrap apron. Hospital/feature scenes and voices remain unchanged. supportsActor, actorCatalog, supportedActorIds, diagnoseActorIds and trySampleActor are exported; unsupported human IDs return a typed diagnostic through trySampleActor, while strict sampleActor throws UnsupportedActorError. It never silently clones the player. Foundation must consume this preflight/diagnostic path when drawing emitted humans.

The restaurant contact investigation found stool seat .77, table top1.44 in the actual art source. Unbound sit pelvis is only~.39 world units. The optional owned ActorInput.seatHeight now anchors the seated pelvis in world units, bends knees and retains foot contacts at ground. Extra pixel headroom changes no world height. It does not modify restaurant scale, projection, shared painter, sorting or service rules; foundation/restaurant owners must supply actual seat height and centre. Default/unbound and original player/four regulars remain exact in the existing1440case proof. Eighteen scoped actor tests and build pass. Actual integrated attachment/appearance recheck remains open.
