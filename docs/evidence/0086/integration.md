# Atmosphere integration v1

Foundation adapter read at 2532c61. The actual foundation render-contract.ts is merged and its WorldRenderView type is imported by canvas.ts, including projection with a separate z argument.

Imports:

```ts
import { sampleAtmosphere, shadeAtmosphereColor } from './atmosphere';
import { atmosphereHooksForMap } from './atmosphere/map-hooks';
import { drawAtmosphere, renderAtmosphereObjects } from './atmosphere/canvas';
```

Compile hooks once per validated map with atmosphereHooksForMap(map, overrides). It recognizes water terrain; tree, willow, bamboo, grass, reeds, flowers, planter and plant props; window and warm-window props; lamp, lantern and street-lamp props. Overrides add authored light anchors or particle fields without shared map-schema changes. Unknown kinds have no effect. Map owners can supply exact canopy height and window positions with overrides. Do not infer furniture collision here.

Sample once per host frame with {mapId,day,timeOfDay,elapsedMs,seed,reducedMotion}. Named phases are morning/noon/evening/night. Coordinator decision 14f3634 makes these named phases canonical. Foundation derives the named phase from authoritative restaurant progression through its documented conversion. Numeric interpolation is an optional atmosphere-study API only: 0 morning, .4 noon, .75 evening, 1 night. Production callers use the named union. No day or elapsed clock is advanced. Pass the host's suspended animation elapsed time, not Date.now. The sampler contains no RAF/listeners and reduces animation to a stable frame under reducedMotion.

Supply the camera's visible world rectangle as the third argument for water and hook culling. There is a 2048 polygon hard cap. The cap is a last guard; culling is still necessary on broad maps. Keep authored hook density bounded. If the cap becomes visible, inspect scene coverage and adjust, rather than raising it without profiling.

Apply shadeAtmosphereColor to scene palette values before painting terrain and props. Exposure is 0..1 for local direct sun. It retains different material colors; no full-screen sepia or blur. drawAtmosphere(ctx,frame,view) draws water/shadows in ground pass and local light pools/particles in foreground. Append renderAtmosphereObjects(frame) to the host depth queue for canopy glints and window highlights; drawAtmosphere objects pass is empty. Auto canopy entries sort immediately after their parent prop; artist overrides can supply exact depth. Only willows and one in four other auto foliage hooks sway. No per-tile shimmer or outlines are added. Ground pass must follow terrain but precede bridge/deck ground props, so water cannot overpaint a crossing. Depth-grouped leaves and window highlights need each map owner's occlusion review. World coordinates project to logical pixels; no extra DPR scaling.

No weather is invented because existing game state has no weather contract. No audio changes. Light and particles never cover DOM dialogue. Interiors use stable warm ambient color while local lamps follow supplied day conditions.

Proof scope: the isolated study establishes visible day differences, pixel readability, camera-aware rendering and motion only. It does not establish integrated traversal, activity persistence, hidden-tab host timing, save/reload or full-world acceptance. Those remain ACTIVE with foundation and reviewer 0088.

Authored reflections: hooks.reflections accepts {id,position,width,height,color} entries positioned on water. Each silhouette uses at most 12 clipped pixel bands. It remains recognizable without motion. Reflections only tint water they overlap; they never draw over banks or deck props.


Material lighting seam (added after integration review of foundation 1450bf6):

```ts
import {createAtmosphereMaterialContext} from './atmosphere/materials';
const materialCtx = createAtmosphereMaterialContext(ctx, atmosphere.light);
// Pass materialCtx to existing art ground callbacks and object.draw callbacks.
// Use raw ctx for drawAtmosphere, renderAtmosphereObjects and emissive highlights.
```

This opt-in context adapter transforms existing hex and rgb/rgba fillStyle and strokeStyle assignments before native Canvas2D paints them. It changes material pigments, preserving alpha, geometry, paths, clipping and native save/restore. Methods bind to the real context so native Canvas brand checks work. There is no loop, offscreen world copy, full-screen filter or overlay. Cache the adapter per context and named phase/interior light settings; its bounded colour cache avoids repeated parsing. Do not wrap an already wrapped context or shade the same material palette twice.

The RGB shading multiplies incident light by each material channel, so dark ink remains dark and jade/roof/wall hues remain distinct. It does not add warm fog to every colour. Local lamps/reflections retain their separately sampled emissive colours. Explicit shadeAtmosphereColor remains available for artists who prefer to shade their palette directly. CSS gradients/patterns, named CSS colours and drawImage textures pass through; current reviewed residential/courtyard/workshop production art uses supported solid CSS colours. Future gradient/image art needs an explicit palette adapter, not a filter fallback.

Foundation 1450bf6 review findings to resolve in its owned files: replace numeric timeOfDay input with canonical named phase; compile atmosphere hooks once per registered map; pass the visible world rectangle; draw water/shadows before bridge/deck ground props, rather than after every artist ground pass; send the material context to actual scenery callbacks and fallback painter primitives. Object atmosphere callbacks must continue using the raw context, with inherited occlusion alpha multiplied. The existing shared painter has not yet adopted this material adapter, so actual production day-light mood remains unverified.
