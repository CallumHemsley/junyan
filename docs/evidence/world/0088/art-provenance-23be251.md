# Published-owner provenance versus integration 23be251

Status: **source provenance only; no visual verdict, restoration, merge or application edit**. Integration is frozen at `23be251185d989f7b97d36391a8f6478344b1a3b`. Foundation remains the integration writer. The running browser/build was not switched.

Fetch facts: initial ten owner branches plus coordinator fetched successfully from `https://github.com/CallumHemsley/junyan.git`; fetch began about 2026-11-06T00:39:28Z and was observed complete by 00:42:43Z. Additional 0089/0090 fetch completed and was observed by 00:43:31Z. Report source snapshot collected 2026-11-06T00:44:51+00:00. “Current” below means these fetched refs, not a promise that upstream has not advanced afterward.

Additional owners are included because fetched central ledger `1cc4d95444b0f6f333fcc92952fdfdd4b4b9cbc7`, `docs/world-program/ledger.md:137` and `:147`, explicitly allocates `codex/0089-restaurant-world-art` to `src/world/art/restaurant/*` and `codex/0090-contextual-world-ui` to `src/world/ui/*`. No allocation is inferred from a branch name.

Method: `git rev-parse <head>:<path>`, `git ls-tree -r <head> -- <directory>`, and `git show <head>:<path>` against immutable heads. Directory hashes are Git **tree** IDs: equality proves the complete tracked subtree matches, including file names, modes and blob content. File hashes are Git **blob** IDs. ABSENT means no object at that exact path. A matching entrypoint does not imply its imported implementation or whole directory matches. Different blobs do not establish ancestry, the cherry-pick used, or whether one branch independently reimplemented another; that history was not audited. A tree can differ only because tests or harnesses changed, so runtime blob rows are shown separately.

## Owner snapshot

| Owner | Fetched branch | Exact owner head | Comparison with consumed integration |
|---|---|---|---|
| 0078 Foundation | `codex/0078-world-foundation` | `0974efd785864c9ccafefb62db771618e671d56e` | Entire `src/world` tree matches current foundation; foundation therefore still carries the same owner-module snapshot. Selected integration files shown below also compared. This is not a match to the independent owners. |
| 0079 Town | `codex/0079-town-street` | `f26160db824009f8008392f9c6e9e57a47eaa7ba` | Town map payload differs. Town art directory exists in integration only as `variants.json`; runtime `index.ts` absent. |
| 0080 Courtyard / cats | `codex/0080-courtyard` | `7341f313334738db025df990bffad157f50e52cf` | Map/habitat and art differ. Consumed art exposes `drawMap`/`drawCat`; current owner adds guarded `renderObjects` and guarded ground rendering. |
| 0081 Residential | `codex/0081-residential` | `8ebffb19c0d4c2ccc6fc20758b9e38c9886c0ad3` | All three map payloads and residential art differ; runtime entrypoint exists in both. Current elevation module absent from integration. |
| 0082 Workshop | `codex/0082-workshop` | `d772aa19624e296d90cde59181182560427825d3` | Workshop map, art entrypoint and paint implementation differ; stateful factory consumed, but current owner blobs are not identical. |
| 0083 Rooftop / garden | `codex/0083-rooftop` | `e1e3fa3b520dd3fab21246f7860dbbd24524ae14` | Rooftop map/projector differs; entire rooftop art directory absent from integration. |
| 0084 Landscape | `codex/0084-landscape` | `9860cd757c989f2ff6ceae188445773a09ebf907` | Both landscape map payloads and both art implementation files differ; runtime entrypoint exists in both. |
| 0085 Characters | `codex/0085-characters` | `85d6d6e0f5c7cb37b427afba2c691e7e881bc4fb` | `index.ts` matches, but adapter and full character directory differ. Entrypoint equality is not whole-module equality. |
| 0086 Atmosphere | `codex/0086-atmosphere` | `7f394f02fe3f4cb5316215140e8c18b822fb4fe4` | Atmosphere sampling, canvas and hook implementations differ; current materials module absent from integration. |
| 0087 World life | `codex/0087-world-life` | `137a652ac800da91e4332a0450dae5e2ca0ed195` | Life entrypoint and multiple runtime implementations differ; current presence/habitat/object modules are absent from integration. |
| 0089 Restaurant art — additional allocation | `codex/0089-restaurant-world-art` | `f3c4030c18787e4638639075e6c67a11cd542304` | Entire restaurant art directory absent from integration; owner publishes runtime art plus state projection. |
| 0090 Contextual UI — additional allocation | `codex/0090-contextual-world-ui` | `85e00ababde761eab0986024c6f2d7e7570b642b` | Entire contextual UI directory absent from integration; owner publishes shell, pocket, table and kitchen controls. |

## Actual consumer wiring at 23be251

| Consumer | Exact source evidence | What is consumed |
|---|---|---|
| Map registry | `src/world/registry.ts:15–16` | Eager `./maps/*/index.ts` glob; consumes each `mapDefinitions` plus foundation `restaurantMap`. All six map directories below register the nine non-restaurant maps. |
| Art modules | `src/world/painter.ts:15`, `45–50`, `70–72` | Eager `./art/*/index.ts` glob. Exact tree contains courtyard, landscape, residential and workshop entrypoints only. Calls `drawMap` passes and `renderObjects` when exported. |
| Stateful workshop | `painter.ts:10`, `45–46` | Excludes static workshop from glob list, then calls `createWorkshopArt(game.neighbourhood.repairs)`. |
| Residential furniture | `painter.ts:9`, `48`, `50`; `dynamic.ts:1`, `10` | Explicit `drawFurniture`, `renderFurnitureObjects`, and feature-owned `furnitureColliders`. |
| Rooftop projection | `src/world/dynamic.ts:2`, `11` | Calls map-owned `projectGarden`, appends generated props/colliders/occluders. Map projection exists while rooftop-specific art is absent. |
| Characters | `painter.ts:4`, `28–30`, `69` | `sampleActor` and re-exported `drawActor`; actual adapter blob matters even when index matches. |
| Atmosphere | `painter.ts:6–8`, `33–34`, `49–50`, `73`, `77–78` | `sampleAtmosphere`, `atmosphereHooksForMap`, `drawAtmosphere`, `renderAtmosphereObjects`; foundation `colorShader` supplies material shading. |
| World life | `painter.ts:1`, `68–74`; `src/world/life-bridge.ts:1–3`, `11–29` | `drawLifeActor`, `drawLifeReactions`, compile/sample/interact/restore, navigation, and courtyard `catHabitat`; current owner-only exports are not automatically adopted. |
| Draw-order implication | `painter.ts:50–59`, `70–71` | Generic fallback excluded only for IDs returned by `renderObjects`. Consumed courtyard exports no `renderObjects`, so its bulk object pass precedes generic fallback. Current owner guarded object-queue version is not the consumed blob. |
| Missing restaurant/UI consumers | `src/world/art/restaurant` and `src/world/ui` absent | No owner 0089/0090 files can be imported from those paths in this integration. |

## 0078 Foundation

Owner `0974efd785864c9ccafefb62db771618e671d56e`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world` | `92923aece88e5672a9fc753be4b515ff2ca9c782` | `92923aece88e5672a9fc753be4b515ff2ca9c782` | MATCH; 92 same, 0 differing, 0 owner-only, 0 integration-only files |

The whole `src/world` comparison intentionally includes delegated directories as an **integration snapshot**, not a claim that foundation owns those files. The selected blobs below are integration seams; the entire App/save/config ownership lease was not exhaustively audited.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/painter.ts` | `4c2017e1bcdfbe5e424479a66f36304779bf3315` | `4c2017e1bcdfbe5e424479a66f36304779bf3315` | MATCH |
| `src/world/registry.ts` | `7030d813f250c56f2cf8e265371e5a3e9a556789` | `7030d813f250c56f2cf8e265371e5a3e9a556789` | MATCH |
| `src/world/restaurant.ts` | `d3f64821bbd04deb10c60d22a040f4af601b760d` | `d3f64821bbd04deb10c60d22a040f4af601b760d` | MATCH |
| `src/world/dynamic.ts` | `23fb7f9df1caf0fe52bd80909604016f7fa0efdf` | `23fb7f9df1caf0fe52bd80909604016f7fa0efdf` | MATCH |
| `src/world/life-bridge.ts` | `7a5c049bf6d8ea1ea262c7120aa5a0cd2d88e0c5` | `7a5c049bf6d8ea1ea262c7120aa5a0cd2d88e0c5` | MATCH |
| `src/world/WorldViewport.tsx` | `5d7a9712eebf60431138ff8bbb4aaf500a8484ae` | `5d7a9712eebf60431138ff8bbb4aaf500a8484ae` | MATCH |
| `src/world/render-contract.ts` | `fed4b821cc42f4c84ab25b7e31c90c7e7e0f71ba` | `fed4b821cc42f4c84ab25b7e31c90c7e7e0f71ba` | MATCH |
| `src/App.tsx` | `c03ac95d4b4ad523e5246da0197391b61bf4d507` | `c03ac95d4b4ad523e5246da0197391b61bf4d507` | MATCH |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/painter.ts` | `export function drawPlayer(ctx:CanvasRenderingContext2D,view:WorldRenderView,p:Point,facing:Facing,moving:boolean,_scale:number) {`<br>`export function paintWorld(ctx:CanvasRenderingContext2D,map:WorldMapDefinition,view:WorldRenderView,facing:Facing,moving:boolean,scale:number,game?:GameState,world?:WorldState) {` | `export function drawPlayer(ctx:CanvasRenderingContext2D,view:WorldRenderView,p:Point,facing:Facing,moving:boolean,_scale:number) {`<br>`export function paintWorld(ctx:CanvasRenderingContext2D,map:WorldMapDefinition,view:WorldRenderView,facing:Facing,moving:boolean,scale:number,game?:GameState,world?:WorldState) {` |
| `src/world/registry.ts` | `export function createMapRegistry(definitions:unknown[]):MapRegistry {`<br>`export const worldMaps=createMapRegistry([restaurantMap,...Object.values(modules).flatMap(module=>module.mapDefinitions??[])]);` | `export function createMapRegistry(definitions:unknown[]):MapRegistry {`<br>`export const worldMaps=createMapRegistry([restaurantMap,...Object.values(modules).flatMap(module=>module.mapDefinitions??[])]);` |
| `src/world/restaurant.ts` | `export const restaurantMap:WorldMapDefinition={` | `export const restaurantMap:WorldMapDefinition={` |

## 0079 Town

Owner `f26160db824009f8008392f9c6e9e57a47eaa7ba`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/maps/town` | `96b97be7501f589b4887485750d4ce74f4b27d84` | `8ba8172b373a2247dafabf3ac40e978cbc4d2a1f` | DIFFER; 2 same, 2 differing, 1 owner-only, 0 integration-only files |
| `src/world/art/town` | `835a12d781ebac86c322336a34b3bcfdf583ee67` | `bb62d38adb7fecdac9b30616fe63bc524b13d1f7` | DIFFER; 0 same, 1 differing, 3 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/art/town/index.ts` | `ABSENT` | `ea5960a135f245c5087cf8ab3080aa666031fab3` | ABSENT in integration |
| `src/world/art/town/variants.json` | `68cdc9a8dfd02d455bfbb88f3a6dd83621e18aa0` | `5290e188ae48a8cd3b41e6edf66875c1a0a727e2` | DIFFER |
| `src/world/maps/town/index.ts` | `dcb02cdc71d427a3bb70d5561f0bdb048960a758` | `dcb02cdc71d427a3bb70d5561f0bdb048960a758` | MATCH |
| `src/world/maps/town/map.json` | `4398757dbf2e66f392da2fa472ca3b5e3e0523c1` | `c708943ab4c4661ea0d82abb6aeff5c49feb0621` | DIFFER |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/art/town/index.ts` | ABSENT | `export function drawProp(ctx: CanvasRenderingContext2D, prop: Prop, view: WorldRenderView) {`<br>`export const drawMap: DrawMap = (ctx, map, view) => {`<br>`export function renderObjects(map: WorldMapDefinition, _view: WorldRenderView): WorldRenderObject[] {` |
| `src/world/maps/town/index.ts` | `export const mapDefinitions = [definition];` | `export const mapDefinitions = [definition];` |

## 0080 Courtyard / cats

Owner `7341f313334738db025df990bffad157f50e52cf`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/maps/courtyard` | `51a60f43b047d6dd70d1d6298cb9b98f57b986ae` | `9cfd8983898588cf2c977e19b3567f5286a5f722` | DIFFER; 0 same, 4 differing, 0 owner-only, 0 integration-only files |
| `src/world/art/courtyard` | `13499d0afe3cce89bac0b58ad06620dea7687923` | `032e6a30a08b413413d44422962b0113afc8e2cb` | DIFFER; 0 same, 1 differing, 1 owner-only, 0 integration-only files |
| `src/features/cats` | `89cedfc2987e93950bbf13a1e55a9cdebe2b7474` | `b5cd38f1601df8233b7a0bb56201178808c9551f` | DIFFER; 9 same, 2 differing, 1 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/art/courtyard/index.ts` | `250ee1001011db24c5b5ff1461c4bf66ad8634ab` | `e5b2faef7e7821929293addca24b76544726a719` | DIFFER |
| `src/world/maps/courtyard/habitat.ts` | `ab71b7010d2d56c6856685daf2473e3f65327478` | `6d8e98357adf8e8a90ca515370213d8fbe853bf0` | DIFFER |
| `src/world/maps/courtyard/index.ts` | `d458e1af18a596d9224c4fa0d862aa7530c546fc` | `c03fa2c5893af1cd6a41cd6d064d368564190702` | DIFFER |
| `src/world/maps/courtyard/map.json` | `55eae9cc7b04381fe0e5845e39e5556588082fbc` | `95004a1de8cf06cdc787f0dd1ec130342f7cc5ee` | DIFFER |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/art/courtyard/index.ts` | `export const drawMap: DrawMap = (ctx, map, view) => {`<br>`export function drawCat(ctx: CanvasRenderingContext2D, view: CourtyardView, point: Point, black: boolean, relaxed: boolean) {` | `export const drawMap: DrawMap = (ctx, map, view) => {`<br>`export function renderObjects(map: Parameters<DrawMap>[1], _view: WorldRenderView): WorldRenderObject[] {`<br>`export function drawCat(ctx: CanvasRenderingContext2D, view: CourtyardView, point: Point, black: boolean, relaxed: boolean) {` |
| `src/world/maps/courtyard/index.ts` | `export const mapDefinitions = [definition];`<br>`export { definition as courtyardMap };`<br>`export { catHabitat } from './habitat';` | `export const mapDefinitions = [definition];`<br>`export { definition as courtyardMap };`<br>`export { catHabitat, courtyardForCats } from './habitat';` |

Current owner guard verified at `src/world/art/courtyard/index.ts:269` (`map.id !== courtyard` or non-ground pass returns) and `:337` (`renderObjects` returns empty outside courtyard). Consumed `drawMap` begins at `:47` without this map guard; consumed file has no `renderObjects` export.

## 0081 Residential

Owner `8ebffb19c0d4c2ccc6fc20758b9e38c9886c0ad3`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/maps/residential` | `34561c6b6bf3665ebc836f48653787946e32048e` | `dfea843763fba543dce7c3e640021e21b93102b5` | DIFFER; 2 same, 3 differing, 2 owner-only, 0 integration-only files |
| `src/world/art/residential` | `86fcd5aa3073aaea0135ec2f0bd87dc5ae8a2e4f` | `bafbcf89e9792b2d52c897f0429289a2655bcc8c` | DIFFER; 2 same, 1 differing, 5 owner-only, 0 integration-only files |
| `src/features/apartment` | `31eda7bcc5bb5458e1e1befa78f0ddc64c9df135` | `54b0382d7e86d5e0cbedcf32696b7ec5bdaf454b` | DIFFER; 13 same, 2 differing, 0 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/art/residential/index.ts` | `a40bab53db398f6f0c791ae69f2f7871f9ec6925` | `b7a440d783deba6a9f646afb8059dcb33b32dc64` | DIFFER |
| `src/world/maps/residential/apartment.json` | `aa24ff77394fe45d688447f6217f41e5f3263e1b` | `1b2d0b287ec8768945e462ef7000c8bffa4c0148` | DIFFER |
| `src/world/maps/residential/elevation.ts` | `ABSENT` | `d391270ce4a83f27dfc941b87365d6ca9d1f3cbd` | ABSENT in integration |
| `src/world/maps/residential/index.ts` | `08abe3953cb14d1eb7d61a6626b36369453d5bc7` | `08abe3953cb14d1eb7d61a6626b36369453d5bc7` | MATCH |
| `src/world/maps/residential/residential-hall.json` | `986433298000462ea2f23286b3822a9735eb6c4a` | `c6baa6db2d09f40465a8dcb1ab28cea25586ac0d` | DIFFER |
| `src/world/maps/residential/residential-stairs.json` | `3c33f21d6549f96964ffd95146cdf6d7f56be2d7` | `28f06afcfdcd91e63f4a03ccfbb64537d01a62e6` | DIFFER |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/art/residential/index.ts` | `export function drawResidentialFloor(api: ResidentialArtApi, mapId: string) {`<br>`export function drawResidentialProps(api: ResidentialArtApi, mapId: string, layer?: string, only?: string[]) {`<br>`export function drawApartmentFurniture(api: ResidentialArtApi, state: State) {`<br>`export const drawMap: DrawMap = (ctx, map, view) => {`<br>`export function renderObjects(map: Parameters<DrawMap>[1], _view: WorldRenderView): WorldRenderObject[] {`<br>`export function drawFurniture(ctx: CanvasRenderingContext2D, state: State, view: WorldRenderView) {`<br>`export function renderFurnitureObjects(state: State): WorldRenderObject[] {` | `export function drawResidentialFloor(api: ResidentialArtApi, mapId: string) {`<br>`export function drawResidentialProps(api: ResidentialArtApi, mapId: string, layer?: string) {`<br>`export function drawApartmentFurniture(api: ResidentialArtApi, state: State) {`<br>`export const drawMap: DrawMap = (ctx, map, view) => {`<br>`export function renderObjects(map: Parameters<DrawMap>[1], _view: WorldRenderView): WorldRenderObject[] {`<br>`export function drawFurniture(ctx: CanvasRenderingContext2D, state: State, view: WorldRenderView) {`<br>`export function renderFurnitureObjects(state: State): WorldRenderObject[] {`<br>`export { surfaceHeight } from '../../maps/residential/elevation';` |
| `src/world/maps/residential/index.ts` | `export const mapDefinitions = [hall, stairs, apartment];` | `export const mapDefinitions = [hall, stairs, apartment];` |

## 0082 Workshop

Owner `d772aa19624e296d90cde59181182560427825d3`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/maps/workshop` | `f95d0a69dc7a2b81b40bdf57634b329ae4e07fc6` | `7af1057c7e63b94fcf02ba086c48a4f6d75151d2` | DIFFER; 2 same, 1 differing, 0 owner-only, 0 integration-only files |
| `src/world/art/workshop` | `1a0f61f53894bdb8bbe7ed606a68e9b36ac0a2ed` | `2b53ffcdb4a360d38ee01d3c175c71772a68c961` | DIFFER; 5 same, 2 differing, 3 owner-only, 0 integration-only files |
| `src/features/repairs` | `8a8efba8bd629a9996dd5c9f0f301ce839732202` | `31bb39068b8444789d2de1839e1f95ffa69a0ef9` | DIFFER; 7 same, 2 differing, 0 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/art/workshop/index.ts` | `4152a7dbae026cac065d6c1bddcf973206604fde` | `aaf8a2117e264b16f6d027fec6e6a2b49abbd66a` | DIFFER |
| `src/world/art/workshop/paint.ts` | `6bad67b6facb810d61e68da4f1bfba5e21184c34` | `dc0f6b8514200a7725d435c150664dd8b3cf631f` | DIFFER |
| `src/world/maps/workshop/index.ts` | `a5872de5fb7e499145270c9fceec53475b86a51b` | `a5872de5fb7e499145270c9fceec53475b86a51b` | MATCH |
| `src/world/maps/workshop/map.json` | `d1a44b9cfe8013d00bd6eb9d2bc5d14d84fcc773` | `b9eb4070ebd767d4c87a1ebac706e12e703f2f28` | DIFFER |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/art/workshop/index.ts` | `export const drawMap: DrawMap = (ctx,map,view) => paint(ctx,map,view);`<br>`export function renderObjects(map: WorldMapDefinition, _view: WorldRenderView, repairs?: State): WorldRenderObject[] {`<br>`export function createWorkshopArt(repairs: State): WorldArtModule {` | `export const drawMap: DrawMap = (ctx,map,view) => paint(ctx,map,view);`<br>`export function renderObjects(map: WorldMapDefinition, view: WorldRenderView, repairs?: State): WorldRenderObject[] {`<br>`export function createWorkshopArt(repairs: State): WorldArtModule {` |
| `src/world/maps/workshop/index.ts` | `export const mapDefinitions = [definition];`<br>`export const workshopDefinition = definition;` | `export const mapDefinitions = [definition];`<br>`export const workshopDefinition = definition;` |

## 0083 Rooftop / garden

Owner `e1e3fa3b520dd3fab21246f7860dbbd24524ae14`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/maps/rooftop` | `7d3db5ca2a41c6c85d27dd5ab02988a4c316515a` | `85222472d3722f15d94114a5d0886ade35b66388` | DIFFER; 0 same, 3 differing, 0 owner-only, 0 integration-only files |
| `src/world/art/rooftop` | `ABSENT` | `c67396f33ac69ad3168a2dc3aa0f2f8c7328d6d7` | DIFFER; 0 same, 0 differing, 4 owner-only, 0 integration-only files |
| `src/features/garden` | `079f9c31d337da4f6b9aea386dfde98d4979b064` | `031d0c551dd2058646a63f02e72765d751094121` | DIFFER; 10 same, 3 differing, 0 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/art/rooftop/index.ts` | `ABSENT` | `bee3a8a0425dbfaa550825b6b1436bfca396aacc` | ABSENT in integration |
| `src/world/maps/rooftop/index.ts` | `4dbc87b7e1dcbe08855d1fac3d839dd3c67f0482` | `71ac7c16342989428fb6cc14a35abd95b36148fd` | DIFFER |
| `src/world/maps/rooftop/map.json` | `745164a36cd226f5b8d027320b0aec47e45aa9c7` | `afb5998e29899500fec1960eb0c88c126cc8e104` | DIFFER |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/art/rooftop/index.ts` | ABSENT | `export const drawMap: DrawMap = (ctx, map, view) => {`<br>`export function renderObjects(map: WorldMapDefinition, _view: WorldRenderView): WorldRenderObject[] {` |
| `src/world/maps/rooftop/index.ts` | `export const mapDefinitions = [definition];`<br>`export const rooftopMap = definition;`<br>`export const gardenSites: Record<Site, {x: number; y: number}> = {`<br>`export function projectGarden(state: State) {`<br>`export function rooftopForGarden(state: State) {` | `export const rooftopMap = definition;`<br>`export const gardenSites: Record<Site, {x: number; y: number}> = {`<br>`export function projectGarden(state: State) {`<br>`export function rooftopForGarden(state: State) {`<br>`export const mapDefinitions = [definition];` |

Current owner rooftop guard verified at `src/world/art/rooftop/index.ts:276` and `:281`; both runtime exports are absent from consumed integration because the complete art directory is absent. The previously mentioned `801c7c0` is not used as a current-head assertion; fetched owner head above is authoritative for this snapshot.

## 0084 Landscape

Owner `9860cd757c989f2ff6ceae188445773a09ebf907`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/maps/landscape` | `b61f320b0763aa55b57787ed6122ae27d5e03917` | `e0613c16e57dcb4727182787a1734a5f3d0f84d8` | DIFFER; 1 same, 4 differing, 0 owner-only, 0 integration-only files |
| `src/world/art/landscape` | `649fb70bdcad2130e960bbfc4604eec8d0c2a130` | `544feeaf68af69a6b1367e3daee353a5194422bb` | DIFFER; 2 same, 2 differing, 0 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/art/landscape/draw.ts` | `edfdb3d3ff47be1ad3fa7e35dbccc29dfb122a7b` | `f41bf48e7131810d2b83cb684153ed85d2b0f762` | DIFFER |
| `src/world/art/landscape/index.ts` | `4caac9cdd0004cd7a5b722354cc56d054e629e19` | `2f8b18d98991f4d742b5c2ca35261dd870594c3c` | DIFFER |
| `src/world/maps/landscape/index.ts` | `05887e8c96668d624dd4994b49edf4d9665c8f4f` | `05887e8c96668d624dd4994b49edf4d9665c8f4f` | MATCH |
| `src/world/maps/landscape/park.json` | `a86ec62d1983499bce8b8f597ea6f5f97b1c45a6` | `e8a8cece8b9a1aad97b464b2c8ef1527e697e73a` | DIFFER |
| `src/world/maps/landscape/riverbank.json` | `e0484aaa9eb71e2333d61d45f33cf1256feed33b` | `5a2efa4df8da7e4cd24edabf4073af04dcd0ec95` | DIFFER |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/art/landscape/index.ts` | `export const drawMap: DrawMap = (ctx, map, view) => {`<br>`export const renderObjects: NonNullable<WorldArtModule['renderObjects']> = (map, view) => {` | `export const drawMap: DrawMap = (ctx, map, view) => {`<br>`export const renderObjects: NonNullable<WorldArtModule['renderObjects']> = (map, view) => {` |
| `src/world/maps/landscape/index.ts` | `export const mapDefinitions = [park, riverbank];` | `export const mapDefinitions = [park, riverbank];` |

## 0085 Characters

Owner `85d6d6e0f5c7cb37b427afba2c691e7e881bc4fb`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/characters` | `5e988e346cafdfc5742acf88ef42889ae94be10e` | `f5f7f453669d9158bad25478e0969355e4a57889` | DIFFER; 6 same, 4 differing, 4 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/characters/adapter.ts` | `f98d8b24ba8d5cdc364e923308fce74da8c81b8a` | `7e43a1ab7f5c030d260eb4fb8b6f9556d778f7ce` | DIFFER |
| `src/world/characters/artwork.mjs` | `c1d0dea498b54f7a565ab7140cefc0df31b0dd6e` | `c1d0dea498b54f7a565ab7140cefc0df31b0dd6e` | MATCH |
| `src/world/characters/index.ts` | `f4bb96212061e10fa4f53eb065ca6f7e177ddf4f` | `f4bb96212061e10fa4f53eb065ca6f7e177ddf4f` | MATCH |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/characters/index.ts` | `export function directionFromYaw(yaw:number):number {`<br>`export function sampleActor(input:ActorInput):ActorSample {`<br>`export {drawActor,actorCommands,actorObject} from './adapter';` | `export function directionFromYaw(yaw:number):number {`<br>`export function sampleActor(input:ActorInput):ActorSample {`<br>`export {drawActor,actorCommands,actorObject} from './adapter';` |

## 0086 Atmosphere

Owner `7f394f02fe3f4cb5316215140e8c18b822fb4fe4`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/atmosphere` | `f37f3998a1e2b5152d8a6790efef14d27de55d7c` | `3e84bea91e1d5ed8aa8c4112321d26289f9a32b8` | DIFFER; 1 same, 7 differing, 7 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/atmosphere/canvas.ts` | `10232be4fa3e669bd5fb7cacd5fd291d7bb75105` | `382e69f4f7675a64d1b36ebff21978b38fd0d7ce` | DIFFER |
| `src/world/atmosphere/index.ts` | `8630ae6b5032385b65d920f923d565e48ddb197f` | `4c1537b18edaa7e5b025690fbde1d8bb4d2fb97c` | DIFFER |
| `src/world/atmosphere/map-hooks.ts` | `b3e696c447d273530bec8b5e1beb13aa568795d4` | `e8fe9c6c89534438c5af069aa0e58ce384066661` | DIFFER |
| `src/world/atmosphere/materials.ts` | `ABSENT` | `a5413b9af9358bfad5f58c444be32d517e220e9a` | ABSENT in integration |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/atmosphere/index.ts` | `export const MAX_ATMOSPHERE_COMMANDS = 2048;`<br>`export function sampleDayLight(timeOfDay: DayPhase &#124; number): LightState {`<br>`export function shadeAtmosphereColor(color: RGB, light: LightState, exposure=1): RGB {`<br>`export function sampleAtmosphere(input: AtmosphereInput, hooks: AtmosphereHooks = {}, viewport?: Rect): AtmosphereFrame {` | `export const MAX_ATMOSPHERE_COMMANDS = 2048;`<br>`export function sampleDayLight(timeOfDay: DayPhase &#124; number): LightState {`<br>`export function shadeAtmosphereColor(color: RGB, light: LightState, exposure=1): RGB {`<br>`export function sampleAtmosphere(input: AtmosphereInput, hooks: AtmosphereHooks = {}, viewport?: Rect): AtmosphereFrame {` |

## 0087 World life

Owner `137a652ac800da91e4332a0450dae5e2ca0ed195`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/life` | `a12fc0dd08fe983e782a616fcd835c230dcc3efe` | `db6c57a39abeeba9588597af7aeffc638dc0f3f5` | DIFFER; 4 same, 11 differing, 11 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/life/LifePrompt.tsx` | `ABSENT` | `0d01cfa955512b2fdf30338e92ad0aa3ac426525` | ABSENT in integration |
| `src/world/life/habitats.ts` | `ABSENT` | `3cfb2707662e7581bc84f76d32bc1f6c2fc001b9` | ABSENT in integration |
| `src/world/life/index.ts` | `7b643aedda6cb912c58f4c99c5c4fe0045e4e0fa` | `2d403fae36a7d95a4a855f28a2725cec0888f1e3` | DIFFER |
| `src/world/life/interactions.ts` | `3e3a378bc5027a08544391a19f293c71381c1d27` | `f8693a34e97d58f970f3ae526b1916bc099b2b83` | DIFFER |
| `src/world/life/model.ts` | `9cc113b8133c96b360b859350515f4eac879f8c5` | `c9f6b508eb6dee5f2ef53f45c6f2d0f48440dccc` | DIFFER |
| `src/world/life/navigation.ts` | `35295f23906092fe383aa04560886963e7357a6e` | `ab804a2626c48a90a9a91992b118478f471f2c9c` | DIFFER |
| `src/world/life/objects.ts` | `ABSENT` | `b636eca56b1550deaf97ca978d44fbdfb35eddf3` | ABSENT in integration |
| `src/world/life/presence.ts` | `ABSENT` | `e4323890a0b91668bcb458044d2e051a5c5a3a83` | ABSENT in integration |
| `src/world/life/profiles.ts` | `5ed08e7cd3872b7ab3e3b5fe5bb07c9c3d19d48f` | `5ed08e7cd3872b7ab3e3b5fe5bb07c9c3d19d48f` | MATCH |
| `src/world/life/prompt.css` | `ABSENT` | `f00f39ca32178afb197a3b7fc9878f8facf60625` | ABSENT in integration |
| `src/world/life/render.ts` | `2edb20386e240740f163da006060822ee5dc59b5` | `17c879fce391d53a5432d7c9368f2c0897810252` | DIFFER |
| `src/world/life/routes.ts` | `dd0d3d8507597675f70883472abe6df29f65dbca` | `0d9ad28b9b8df67716ffbb9205dfbfd2909bf416` | DIFFER |
| `src/world/life/routines.json` | `ABSENT` | `b5a519d73dcb13b60157478ff3bb18361938ec5e` | ABSENT in integration |
| `src/world/life/routines.ts` | `ABSENT` | `49e71afa190794924975181c5be96c51579b0449` | ABSENT in integration |
| `src/world/life/sample.ts` | `6b20c88cc63296431349db4e648ebfc39483a3ac` | `edd0fca9f32f2ec1d7489e0e30de8133ec3783c4` | DIFFER |
| `src/world/life/visibility.ts` | `c8bb97f2541c40e698207685db67faaf56cee898` | `b5ccece7c74447726ab2d19db90fee0fb9a107c1` | DIFFER |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/life/index.ts` | `export { compileLife, entranceExclusions } from './routes';`<br>`export { sampleLife } from './sample';`<br>`export { profiles } from './profiles';`<br>`export { nearbyLife, interactLife, initialLifeState, restoreLife, reduceLife, lifeStateSchema } from './interactions';`<br>`export { drawLifeActor, drawLifeReactions } from './render';`<br>`export { navigationFor } from './navigation';` | `export { compileLife, entranceExclusions } from './routes';`<br>`export { sampleLife } from './sample';`<br>`export { profiles } from './profiles';`<br>`export { nearbyLife, interactLife, initialLifeState, advanceLife, restoreLife, reduceLife, lifeStateSchema } from './interactions';`<br>`export { drawLifeActor, drawLifeReactions } from './render';`<br>`export { navigationFor } from './navigation';`<br>`export { courtyardHabitats } from './habitats';`<br>`export { lifeObjects } from './objects';`<br>`export { restaurantPresence, releaseServedCustomer } from './presence';` |

## 0089 Restaurant art — additional allocation

Owner `f3c4030c18787e4638639075e6c67a11cd542304`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/art/restaurant` | `ABSENT` | `e3ab0a56e9654e7add734b816789a32a2c59a6c9` | DIFFER; 0 same, 0 differing, 6 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/art/restaurant/food.ts` | `ABSENT` | `e3124bc55dd2f93fcc1dbdda396375f2ab4a45f3` | ABSENT in integration |
| `src/world/art/restaurant/index.ts` | `ABSENT` | `7e73ee85c810e09728924a5b97dc71b2a0de7bd0` | ABSENT in integration |
| `src/world/art/restaurant/primitives.ts` | `ABSENT` | `6803e4405043ff0a4a3e312fe2e7c85204fd0cf5` | ABSENT in integration |
| `src/world/art/restaurant/projection.ts` | `ABSENT` | `667ea74f98dd9d6b81ff867c70a5c2983322526c` | ABSENT in integration |
| `src/world/art/restaurant/types.ts` | `ABSENT` | `ae95658c7d32275a2939f14e520fc8c2f4a4be80` | ABSENT in integration |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/art/restaurant/index.ts` | ABSENT | `export { projectRestaurant, RESTAURANT_TABLES } from './projection';`<br>`export function drawMap(ctx: CanvasRenderingContext2D, map: RestaurantMap, v: RestaurantView) {`<br>`export function renderObjects(map: RestaurantMap, _view: RestaurantView): RestaurantObject[] {`<br>`export function restaurantObjects(map: RestaurantMap, _view: RestaurantView, projection: RestaurantProjection): RestaurantObject[] {` |

## 0090 Contextual UI — additional allocation

Owner `85e00ababde761eab0986024c6f2d7e7570b642b`; integration `23be251185d989f7b97d36391a8f6478344b1a3b`.

| Compared scope | Integration tree/object | Owner tree/object | Whole-scope result |
|---|---|---|---|
| `src/world/ui` | `ABSENT` | `1ccd500c52e24181f795ba4f61ab291117ea0ed4` | DIFFER; 0 same, 0 differing, 7 owner-only, 0 integration-only files |

The following runtime map/art/module blobs are compared individually. Feature directories above receive a complete tree comparison, not a claim that every feature export is invoked. Tests, authoring scripts and harnesses are covered by tree IDs but omitted from this runtime table.

| Runtime path | Integration blob | Owner blob | Result |
|---|---|---|---|
| `src/world/ui/ContextualInteraction.tsx` | `ABSENT` | `861ef1072bca5d84e1f091fc03e609ecd575328f` | ABSENT in integration |
| `src/world/ui/RestaurantControls.tsx` | `ABSENT` | `421875d73191ff726faf03c2c14eaeca4331746e` | ABSENT in integration |
| `src/world/ui/contextual.css` | `ABSENT` | `015291ecd55e5cafb1c79a3bdbb6e8d7ba520e5c` | ABSENT in integration |
| `src/world/ui/index.ts` | `ABSENT` | `90a2a69715c67506ac598ad18ebab09bc94c91dc` | ABSENT in integration |

| Entrypoint runtime exports (source declarations) | Consumed integration | Current owner |
|---|---|---|
| `src/world/ui/index.ts` | ABSENT | `export { ContextualInteraction, WorldPocketBar } from "./ContextualInteraction";`<br>`export { RestaurantTableControls, KitchenControls } from "./RestaurantControls";` |

## Handoff boundary

This table establishes which published files are present, absent or different and which entrypoints the exact integration calls. It does not establish that replacing directories wholesale is compatible or that current owner art passes runtime review. Foundation 0078 must choose and integrate a complete-art checkpoint, resolve interface/state/render-order seams, and publish its exact head. Independent visual/activity review should then use that published head. No application restoration, checkout switch, build or browser action was performed for this report.
