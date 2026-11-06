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
