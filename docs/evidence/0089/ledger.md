# Restaurant art evidence

Objective ACTIVE. Restore a rich breakfast restaurant inside the full large connected immersive Mandarin pixel life-sim. An isolated art preview does not satisfy acceptance. Foundation integration, production desktop and phone traversal, character motion, front and behind furniture proof and independent review remain required. No native goal tool is available in this session.

Owner is `/root/restaurant_world_art`. Branch is `codex/0089-restaurant-world-art`. Worktree is `/workspace/junyan-0089`. Vite port is strictly 5493. Only the assigned restaurant art, ticket and evidence paths are writable production scope. Runtime is the attached authorized managed Linux cloud. No audio, deployment, shared map or shared renderer changes.

## Workflow checkpoint

1. `how` over the affected subsystem. Completed by inspecting foundation render-contract, restaurant map, legacy scene and authoritative contracts. Renderer sorts individual objects with actor ground positions. Static map defines furniture. GameState owns customers, tray and served count. Content owns appearances and meals.
2. `architect` for parallel design exploration. Two local structures considered. Painting the legacy scene into a single plate would retain detail but cannot sort actors correctly. Individual prop draws plus a pure state projection fits the implemented production contract. Selected the latter. No nested agents were spawned because this is an isolated one-writer delegated task with independent review owned by the coordinator.
3. Write the throughput checkpoint as four todo items.
   - Blocking first steps. Read contracts and baseline captures before art. Publish typed API and buildable first unit.
   - Independent workstreams. Not applicable inside this narrow lease. Foundation can wire projection while the art owner improves drawings.
   - Shared mutable state. Foundation alone edits registration, map, player renderer and rules. Art reads passed geometry and state.
   - Smallest safe decomposition. One art writer avoids concurrent changes to this small module. Independent visual review remains separate.
4. Delegate code-writing to a subagent using your configured feature model. Owned directly under the feature playbook's delegated-agent exception. Human model selection remains GPT-6.1 Sol medium.
5. Verify on the matching surface. Pending production integration. Isolated preview next.
6. Rebase into small, ordered commits. First unit is types, projection, authored static props and meals. Build passed before publication.
7. If the design is contested, `interrogate` before shipping. Not contested. No model panel claimed.
8. Run Opening a PR. Pending buildable publication.

## API reference

Module `src/world/art/restaurant/index.ts` exports the following functions.

```ts
drawMap(ctx, map, view): void
renderObjects(map, view): RestaurantObject[]
projectRestaurant(state, content, map, departedCharacterIds?: readonly string[]): RestaurantProjection
restaurantObjects(map, view, projection): RestaurantObject[]
```

`state` is `Pick<GameState, 'customers' | 'tray' | 'served'>`. `content` is `Pick<Content, 'orders' | 'characters' | 'foods'>`. The map and view are structural readonly-compatible subsets of foundation WorldMapDefinition and WorldRenderView. Art does not import missing foundation files into the coordinator base.

Foundation registers drawMap and renderObjects. On each authoritative frame it computes projectRestaurant(gameState, content, restaurantMap). It adds restaurantObjects to the same shared object list. It renders projection.customers through the shared character compositor using each descriptor's characterId, appearance, phase, seated flag, ground position and facing. Projection.tray contains food kinds in original tray order for the shared player carrying pose. Projection.served mirrors the authoritative tally without deriving a replacement.

Explicit stable table bindings are exported as RESTAURANT_TABLES. Tables 1, 2, 3, 4 bind to table-5-9, table-17-9, table-5-14, table-17-14. Seat positions derive from those props, never incidental array order. Meals appear for checkout and served phases as in the accepted legacy scene. Quantities stay authoritative in the DOM receipt. Scene food shows one representative per food kind as the legacy scene does.

Static prop IDs replace the foundation fallback counter, four tables and plant. Rear wall sections are individual objects. No tall scenery is drawn by drawMap. No baked text, animation loop, random source, listener, save or hidden game rule is added.

## Initial verification

Inspected coordinator `docs/world-program/runtime-e627/desktop.png`, phone.png and `/tmp/junyan-baseline-desktop.png`. The runtime captures lack the accepted windows, kitchen detail, tiled floor, stools and customers.

Passed `node node_modules/typescript/bin/tsc -b && node node_modules/vite/bin/vite.js build`. Uses read-only symlink to the already installed coordinator node_modules. No install or lockfile claim. Vite reports 7.3.7. Rollup emitted existing Zod comment annotation warnings and the existing bundle-size advisory.

An initial standalone tsc command omitted strict mode and reported unrelated inferred Zod optional-property errors. The repository tsconfig build passed. No production files outside the lease were changed.

## Next actions

Publish first unit. Add reproducible preview using actual foundation projection and shared actor scale. Inspect desktop and phone captures, refine materials and warm light, then request integration and independent review. Active work must continue through integrated defects.

## Projection review correction

Coordinator found that Order.customer holds a Chinese display name, while Character.id is canonical. Fixed lookup to Character.name and retained canonical descriptor IDs. Added two tests with real createGame/content. Both pass. They check all four seats under reversed prop order, canonical characters, checkout/served meals, tray ordering, tally and no state mutation. Legacy scene and its tests explicitly use representative distinct food kinds, so the new projection retains that accepted quantity behavior.

Shared lighting callback is now optional on the structural view for old isolated previews. All non-emissive polygon, box, bowl and floor fleck colors pass through shadeColor when supplied. Production host must supply it. No callback modifies inherited alpha. Steam remains an emissive translucent detail and shares the supplied elapsedMs/reducedMotion clock.

First preview captures used /usr/bin/chromium because Playwright's managed executable was absent. `node docs/evidence/0089/capture.mjs` produced desktop, phone, kitchen and reduced-motion PNGs with no page errors. The preview copies the e627 restaurant map and uses actual foundation camera scales 24 desktop and 18 phone plus the same production legacy actor sprite crop/factor. It does not reproduce production collision or its occlusion compositor. It is evidence for art refinement only. Inspection found a meal/table equal-depth tie, fixed by placing meal objects .01 beyond their table support depth. Material detail and warm-light polish continue.

Vite is running as exec session 49941 on strict port 5493. No standalone preview acceptance is claimed.

## Material and per-object refinement

Counter geometry is now six individually sorted three-unit sections. The first retains `counter` to suppress the generic fallback, and the remaining IDs are counter.section.3 through counter.section.15. Individual kitchen fixtures have separate support objects. Wall sections have local occlusion bounds. Two ceiling lamps have their own narrow bounds and explicit overhead depth. Warm lamp pools use inherited alpha and fixed emissive color. Static materials use the shared shadeColor callback. Reduced motion freezes steam at time zero while retaining its visible wisps.

Added deterministic one-pixel plaster and wood variation, less repetitive jar groups, a folded cloth, a kitchen pot and a blank ledger with pencil. No text is painted. Desk and kitchen food remain original geometry. The assigned map and all colliders are unchanged.

`node node_modules/vitest/vitest.mjs run` passed 27 files and 310 tests. `node node_modules/typescript/bin/tsc -b` and `node node_modules/vite/bin/vite.js build` passed. Refreshed four browser captures have no page errors. Installed runtime reports Node 24.22.1, TypeScript 5.9.3, Vite 7.3.7, Vitest 3.2.7 and Playwright 1.64.1. This is use of the installed environment, not a frozen dependency install.

Draft PR is https://github.com/CallumHemsley/junyan/pull/35 against the coordinator branch. Opened with GitHub connector. No merge. Current independent and production gates remain unverified. Foundation is wiring the projection while art refinement continues.

## Served food readability

Restored seven distinct served-food drawings, including a tall soy-milk cup and straw, dumplings with folds, a pleated bun, sliced bread, egg, youtiao and porridge. Empty waiting bowls now belong to the state-derived table setting and disappear when the delivered meal replaces them, as in the legacy scene. Food is drawn after its table using explicit support depth.

`node docs/evidence/0089/check-food.mjs` captured the same table with each real projected food kind and asserted seven distinct browser raster hashes. Inspected bun, milk and dumpling crop captures at actual production scale. Refreshed desktop, phone, kitchen and reduced-motion captures. TypeScript build passed again. This verifies distinct art output; shared renderer motion and integrated service acceptance remain pending.

## Purposeful working-room polish

Coordinator reviewed desktop.png and requested less sterile working detail. Added irregular wear at the threshold, service approach and stool feet. Contact shadows now preserve floor texture. Windows have different cool panes and angled daylight reflections, with faint corresponding floor light. Countertop groups now include stacked and staggered bowls, a utensil cup, rolling pin, folded and hanging striped cloth, ladle, plate stack and oil bottle. All remain original noncolliding drawings inside the existing geometry.

Inspection caught neighboring cabinet segments covering raised fixtures. Each kitchen fixture now sorts just beyond the last cabinet support its footprint spans. It retains its own stable ID and actual position. No map, collision or actor scale changed. Non-emissive paints call shared shadeColor once; explicit glows keep raw colors and inherited alpha.

After cloud recovery local HEAD was confirmed as 3acb275 matching GitHub. No unpublished source remained. Prior Vite process died with the connection. New strict-port preview process is exec session 19754 on port 5493.

`node docs/evidence/0089/capture.mjs` refreshed four actual-scale captures, checked no page errors and compared supplied-time steam. Normal time 0 and 1200ms differ. Reduced-motion frames at those times are byte-identical. This checks art behavior from the host clock only, not production player motion. TypeScript and both projection tests pass. Independent production review remains pending.


## Authoritative departure adapter

Coordinator approved one optional pure input after identifying the shared presence gap. Exact exported signature is now:

```ts
projectRestaurant(
  state: Pick<GameState, 'customers' | 'tray' | 'served'>,
  content: Pick<Content, 'orders' | 'characters' | 'foods'>,
  map: RestaurantMap,
  departedCharacterIds: readonly string[] = [],
): RestaurantProjection
```

The array contains canonical Character.id values, such as lin-jie, validated and persisted per day by foundation. The default retains every seated descriptor, including served customers. Supplied identities filter only customers. Meals, tray and served remain derived from the original authoritative state. restaurantObjects now renders a table setting whenever either its customer or its meal remains, so departure does not erase delivered food. No state, reducer, event, acknowledgment inference or save field is added here.

Existing reduceGame pay semantics set customer phase served, feedback thanks and receipt. App renders the receipt and the character thanks line while served, with 继续招呼 calling close. Payment, speech completion and the served phase alone do not identify explicit acknowledgment. Foundation owns the Continue acknowledgment hook, per-day persistence and a global life exclusion list from the same projected seated customer descriptors, regardless of current map. Production head 23be251 still lacks this art integration.

A new real-content test drives successful payment through reduceGame. It verifies that the paid actor remains seated before acknowledgment, explicit canonical departure omits only that actor, the meal and its table-setting draw object remain, receipt/state are unmodified and a later default call still retains all actors. All three projection tests pass. Repository TypeScript and Vite production builds pass. The build retains the previously recorded Zod annotation and bundle-size advisories. No new screenshots are required for this optional-input behavior; production presence and integrated review remain unverified.

## Production e02 seating correction

Root and parent reproduced nearly hidden restaurant patrons in actual e02 production. Read its shared sampler/adapter and inspected the supplied screenshot. Built the owned seat-proof harness with exact e02 modules, then acquired character owner b1fcbca's explicit seatHeight contract. Compared front/side/rear at production 24/18 scales, standing player and all regulars, and actual e02 door/bed/workbench. Whole-cast calibration candidates are evidence-only, not approved production multipliers.

Selected the bounded physical attachment first. Exported RESTAURANT_FURNITURE_PROFILE retains tabletop 1.44 and stool .77. All owned seat/table/meal height references now consume it. Projection emits exact rear stool center and seatHeight .77. Foundation must pass this into b1fcbca sampleActor with posture sit and preserve ordinary ground depth. No actor z lift, sorting override, collider/service change or shared adapter edit was introduced. The elder remains a cast-readability review concern until integrated scale/pose evaluation. See seat-study.md for exact sources, commands, comparisons, measurements and limits.

Three real-content projection tests, repository TypeScript and Vite production build pass for this unit. Existing Zod annotation and bundle advisories remain. Prove It Works changed verification to the real shared sampler rather than the earlier legacy crop. Explain the Number kept hip-contact error and visibility counts tied to the exact pose, pixel band and production scale. No final visual PASS is claimed.

## Shared calibration recommendation

Re-inspected published 1x/1.2/1.35 grids against all five human identities and the stool, table, door, bed and workbench, plus elder phone references. Recommend a bounded shared trial at 15 native pixels/world unit, equivalent to 1.2, with one conversion across sampling, drawing, contacts, attachments, worldCommands and visual bounds. This is not an approved multiplier or production source change. Exact recommendation and remaining integrated acceptance are in calibration-recommendation.md. The d196bed seat seam stays available at current scale. No sprites, audio or furniture changed in this recommendation unit.
