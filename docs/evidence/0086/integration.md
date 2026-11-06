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


Transitional material-study adapter (added after integration review of foundation 1450bf6; not the final production path):

```ts
// Archived compatibility experiment only, local to materials-study.ts.
// Production: view.shadeColor = createAtmosphereColorShader(atmosphere.light);
// Each artist calls view.shadeColor once at its base-colour helper.
// Raw ctx is retained for atmosphere effects; no context wrapper is exported.
```

This opt-in context adapter transforms existing hex and rgb/rgba fillStyle and strokeStyle assignments before native Canvas2D paints them. It changes material pigments, preserving alpha, geometry, paths, clipping and native save/restore. Methods bind to the real context so native Canvas brand checks work. There is no loop, offscreen world copy, full-screen filter or overlay. The private study caches its adapter per context and named phase/interior light settings; its bounded colour cache avoids repeated parsing. Do not wrap an already wrapped context or shade the same material palette twice.

The RGB shading multiplies incident light by each material channel, so dark ink remains dark and jade/roof/wall hues remain distinct. It does not add warm fog to every colour. Local lamps/reflections retain their separately sampled emissive colours. Explicit shadeAtmosphereColor remains available for artists who prefer to shade their palette directly. CSS gradients/patterns, named CSS colours and drawImage textures pass through; current reviewed residential/courtyard/workshop production art uses supported solid CSS colours. Future gradient/image art needs an explicit palette adapter, not a filter fallback.

Foundation 1450bf6 review findings to resolve in its owned files: replace numeric timeOfDay input with canonical named phase; compile atmosphere hooks once per registered map; pass the visible world rectangle; draw water/shadows before bridge/deck ground props, rather than after every artist ground pass; send the material context to actual scenery callbacks and fallback painter primitives. Object atmosphere callbacks must continue using the raw context, with inherited occlusion alpha multiplied. The existing shared painter has not yet adopted this material adapter, so actual production day-light mood remains unverified.


Exact local emitters: each light hook accepts emitter: Point[]. Supply the actual world-space pane or lamp face polygon (including z) to tint only that face; it uses at most one translucent polygon and preserves underlying mullions. An empty array suppresses a guessed emitter while retaining its ground pool. Generic hooks cannot guarantee alignment with custom architecture. Artist API request: an optional atmosphereHooks(map) export returning owned AtmosphereHooks overrides; foundation/coordinator should approve the shared WorldArtModule property and merge its hook arrays by ID. Until that is wired, exact overrides can be passed directly as the second atmosphereHooksForMap argument. The courtyard material study supplies explicit pane geometry as a proof fixture, not a new production map contract.


Canonical final material boundary: use view.shadeColor(base, exposure) once inside each owned colour helper. createAtmosphereColorShader(light) supplies a deterministic implementation for foundation to reuse; its cache is keyed only by explicit base colour/type/exposure. It never treats a colour as previously shaded because an equal RGB value appeared as output. The scoped context adapter was removed from production materials.ts and is now private to materials-study.ts for archived compatibility studies; do not wrap the entire production context. Atmosphere drawAtmosphere/renderAtmosphereObjects, reflections, local emitters and particles use the raw Canvas2D context and ignore shadeColor, because their colours are already sampled for the current light.

Root's foundation 74a5213 defect is reproduced by reproduce-lighting.mjs and recorded in lighting-order-reproduction.json: shade('#404040') returns '#202020', shade('#808080') returns '#404040', and repeating shade('#404040') returns '#404040'. This is source-level order dependence. The shared painter also passes its whole-context proxy to atmosphere, causing a second lighting transform. Foundation exclusively owns lighting.ts/painter.ts: remove the outputs set and whole-context proxy, then use the explicit callback at fallback material helpers and artist colour helpers. No screenshot failure is claimed from this source reproduction.

`visibleAtmosphereRect(view)` from atmosphere/canvas.ts derives the padded ground rectangle from the actual host projection and viewport dimensions. Foundation can pass it as sampler argument three without adding another camera state or inverse API. It uses the three projected ground basis points and four viewport corners; the test compares against foundation's actual camera.unproject at desktop/phone sizes and a scrolled focus. Foundation 23be251 still omits this argument, so distant hook work and command-cap coverage need review until it is adopted.

Exposure migration note: the existing sampler exposure scales direct sunlight only, not ambient light. Residential's previous colour(c,.65) face-brightness factor should remain baked into its base RGB if it is meant to preserve the .65/.78 face ramp. Passing that factor as direct-sun exposure can flatten side contrast. Foundation/coordinator should resolve the callback's documented meaning; no measured callback regression is claimed yet.


Bridge protection: automatic hook compilation subtracts authored bridge/boardwalk/deck terrain rectangles from decorative water regions. This changes only atmosphere paint coverage, never collision or saved geometry. The focused test proves that a 10x2 crossing removes 20 units from a 10x8 water surface and that no water/ripple/shore command paints its interior. Correct host pass order remains preferred, but late water effects cannot erase these explicitly authored crossings.


Native production render review of foundation 23be251 plus atmosphere 90fc9f1 is captured in production/ (five maps, morning/evening/night, desktop/phone). These call the actual paintWorld and use explicit served-count fixtures; they do not establish normal-UI traversal or persistence. Inspected riverbank evening, phone courtyard night and apartment evening: crossings remain visible, but monolithic courtyard art plus generic fallback objects are both painted, and custom material colours remain largely bright at night. Artist callbacks and per-object adoption remain required. Water base strips now use one compound fill in the atmosphere adapter, avoiding anti-aliased seams between adjacent authored rectangles while preserving deck cutouts. No blur/filter is involved.
