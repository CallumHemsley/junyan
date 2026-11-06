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
