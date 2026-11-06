# Atmosphere integration v1

Foundation adapter read at 2532c61. The actual foundation render-contract.ts is merged and its WorldRenderView type is imported by canvas.ts, including projection with a separate z argument.

Imports:

```ts
import { sampleAtmosphere, shadeAtmosphereColor } from './atmosphere';
import { atmosphereHooksForMap } from './atmosphere/map-hooks';
import { drawAtmosphere } from './atmosphere/canvas';
```

Compile hooks once per validated map with atmosphereHooksForMap(map, overrides). It recognizes water terrain; tree, willow, bamboo, grass, reeds, flowers, planter and plant props; window and warm-window props; lamp, lantern and street-lamp props. Overrides add authored light anchors or particle fields without shared map-schema changes. Unknown kinds have no effect. Map owners can supply exact canopy height and window positions with overrides. Do not infer furniture collision here.

Sample once per host frame with {mapId,day,timeOfDay,elapsedMs,seed,reducedMotion}. Named phases are morning/noon/evening/night. The central example requires numeric timeOfDay, which this module interprets as supplied normalized authoritative day progress: 0 morning, .4 noon, .75 evening, 1 night. This is a proposed interpretation for foundation to confirm. No day or elapsed clock is advanced. Pass the host's suspended animation elapsed time, not Date.now. The sampler contains no RAF/listeners and reduces animation to a stable frame under reducedMotion.

Supply the camera's visible world rectangle as the third argument for water and hook culling. There is a 2048 polygon hard cap. The cap is a last guard; culling is still necessary on broad maps. Keep authored hook density bounded. If the cap becomes visible, inspect scene coverage and adjust, rather than raising it without profiling.

Apply shadeAtmosphereColor to scene palette values before painting terrain and props. Exposure is 0..1 for local direct sun. It retains different material colors; no full-screen sepia or blur. drawAtmosphere(ctx,frame,view) draws water/shadows in ground pass and local light pools/highlights/foliage in foreground; objects pass is empty. Ground pass must follow terrain but precede bridge/deck ground props, so water cannot overpaint a crossing. Foreground leaves need each map owner's occlusion review. World coordinates project to logical pixels; no extra DPR scaling.

No weather is invented because existing game state has no weather contract. No audio changes. Light and particles never cover DOM dialogue. Interiors use stable warm ambient color while local lamps follow supplied day conditions.

Proof scope: the isolated study establishes visible day differences, pixel readability, camera-aware rendering and motion only. It does not establish integrated traversal, activity persistence, hidden-tab host timing, save/reload or full-world acceptance. Those remain ACTIVE with foundation and reviewer 0088.
