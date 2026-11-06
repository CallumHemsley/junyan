# Independent assembly verification — e02a747

Exact integration: `e02a747c3b4d4fc6a476ea744ecb6bdc1a738132`. Scope: manifest content, owner directory/blob identity, actual dispatch and fallback suppression. **Assembly checks verified; visual/gameplay acceptance remains open. Full goal ACTIVE.** The older c4ec7ed visual score is historical evidence and is not assigned to this new head.

Collected 2026-11-06T00:58:37+00:00. Read immutable objects with `git show`, `git ls-tree` and `git rev-parse`. No application edits, checkout switch, production build, server or browser action. Only this reviewer report is written. Parent owns fresh captures.

## Manifest result

Manifest `docs/evidence/world/0078/assembly-provenance.json`: blob `cbe6176a52d60cfe765ba3f7cf01d801ab16db33`; byte SHA-256 `9a681711f0cdd5e4e0e5e238f168f0704f69ad6486ca513027183ec78349f9ce`.

Independently recomputed SHA-256 from every exact integration file: **176/176 match**. Compared manifest file sets with actual recursive lease contents, checked file blobs against the recorded consumed heads, and compared whole directory trees: **21/21 trees match**, no missing/extra files and no differing owner blobs. All 11 records have equal publishedHead and consumedHead strings. This proves identity to those recorded immutable heads, not that their branches remain the latest upstream tips now. The earlier independent provenance snapshot corroborates those published heads.

| Owner branch | Recorded consumed head | Files checked | Manifest / whole lease result |
|---|---|---:|---|
| `codex/0079-town-street` | `f26160db824009f8008392f9c6e9e57a47eaa7ba` | 9 | MATCH, including all imported implementation files in lease |
| `codex/0080-courtyard` | `7341f313334738db025df990bffad157f50e52cf` | 18 | MATCH, including all imported implementation files in lease |
| `codex/0081-residential` | `8ebffb19c0d4c2ccc6fc20758b9e38c9886c0ad3` | 30 | MATCH, including all imported implementation files in lease |
| `codex/0082-workshop` | `d772aa19624e296d90cde59181182560427825d3` | 22 | MATCH, including all imported implementation files in lease |
| `codex/0083-rooftop` | `e1e3fa3b520dd3fab21246f7860dbbd24524ae14` | 20 | MATCH, including all imported implementation files in lease |
| `codex/0084-landscape` | `9860cd757c989f2ff6ceae188445773a09ebf907` | 9 | MATCH, including all imported implementation files in lease |
| `codex/0085-characters` | `85d6d6e0f5c7cb37b427afba2c691e7e881bc4fb` | 14 | MATCH, including all imported implementation files in lease |
| `codex/0086-atmosphere` | `7f394f02fe3f4cb5316215140e8c18b822fb4fe4` | 15 | MATCH, including all imported implementation files in lease |
| `codex/0087-world-life` | `137a652ac800da91e4332a0450dae5e2ca0ed195` | 26 | MATCH, including all imported implementation files in lease |
| `codex/0089-restaurant-world-art` | `f3c4030c18787e4638639075e6c67a11cd542304` | 6 | MATCH, including all imported implementation files in lease |
| `codex/0090-contextual-world-ui` | `85e00ababde761eab0986024c6f2d7e7570b642b` | 7 | MATCH, including all imported implementation files in lease |

The manifest method sentence about how files were restored is not independently proven as a historical operation. The exact byte/tree identity and lease boundaries are proven. Shared integration files are foundation-authored glue outside these owner leases; this review does not certify their entire behavior merely because owner assets match.

## Exact complete-tree and entrypoint identities

| Leased directory | Integration = recorded-owner tree ID | Runtime entrypoint blob, when present |
|---|---|---|
| `src/world/maps/town` | `8ba8172b373a2247dafabf3ac40e978cbc4d2a1f` | `src/world/maps/town/index.ts`: `dcb02cdc71d427a3bb70d5561f0bdb048960a758` |
| `src/world/art/town` | `bb62d38adb7fecdac9b30616fe63bc524b13d1f7` | `src/world/art/town/index.ts`: `ea5960a135f245c5087cf8ab3080aa666031fab3` |
| `src/world/maps/courtyard` | `9cfd8983898588cf2c977e19b3567f5286a5f722` | `src/world/maps/courtyard/index.ts`: `c03fa2c5893af1cd6a41cd6d064d368564190702` |
| `src/world/art/courtyard` | `032e6a30a08b413413d44422962b0113afc8e2cb` | `src/world/art/courtyard/index.ts`: `e5b2faef7e7821929293addca24b76544726a719` |
| `src/features/cats` | `b5cd38f1601df8233b7a0bb56201178808c9551f` | `src/features/cats/index.tsx`: `721cfbbf6128f9fe42305b3ed1bd1cf40d067f05` |
| `src/world/maps/residential` | `dfea843763fba543dce7c3e640021e21b93102b5` | `src/world/maps/residential/index.ts`: `08abe3953cb14d1eb7d61a6626b36369453d5bc7` |
| `src/world/art/residential` | `bafbcf89e9792b2d52c897f0429289a2655bcc8c` | `src/world/art/residential/index.ts`: `b7a440d783deba6a9f646afb8059dcb33b32dc64` |
| `src/features/apartment` | `54b0382d7e86d5e0cbedcf32696b7ec5bdaf454b` | `src/features/apartment/index.tsx`: `2ff73eb63d942589b0cf0bd19138f6dd3f336c3f` |
| `src/world/maps/workshop` | `7af1057c7e63b94fcf02ba086c48a4f6d75151d2` | `src/world/maps/workshop/index.ts`: `a5872de5fb7e499145270c9fceec53475b86a51b` |
| `src/world/art/workshop` | `2b53ffcdb4a360d38ee01d3c175c71772a68c961` | `src/world/art/workshop/index.ts`: `aaf8a2117e264b16f6d027fec6e6a2b49abbd66a` |
| `src/features/repairs` | `31bb39068b8444789d2de1839e1f95ffa69a0ef9` | `src/features/repairs/index.tsx`: `5bc226fe1bb3673851f3c912ea0fc491bc8196c3` |
| `src/world/maps/rooftop` | `85222472d3722f15d94114a5d0886ade35b66388` | `src/world/maps/rooftop/index.ts`: `71ac7c16342989428fb6cc14a35abd95b36148fd` |
| `src/world/art/rooftop` | `c67396f33ac69ad3168a2dc3aa0f2f8c7328d6d7` | `src/world/art/rooftop/index.ts`: `bee3a8a0425dbfaa550825b6b1436bfca396aacc` |
| `src/features/garden` | `031d0c551dd2058646a63f02e72765d751094121` | `src/features/garden/index.tsx`: `621c0bd181227f29e8c87f2105342a2bb66b6490` |
| `src/world/maps/landscape` | `e0613c16e57dcb4727182787a1734a5f3d0f84d8` | `src/world/maps/landscape/index.ts`: `05887e8c96668d624dd4994b49edf4d9665c8f4f` |
| `src/world/art/landscape` | `544feeaf68af69a6b1367e3daee353a5194422bb` | `src/world/art/landscape/index.ts`: `2f8b18d98991f4d742b5c2ca35261dd870594c3c` |
| `src/world/characters` | `f5f7f453669d9158bad25478e0969355e4a57889` | `src/world/characters/index.ts`: `f4bb96212061e10fa4f53eb065ca6f7e177ddf4f` |
| `src/world/atmosphere` | `3e84bea91e1d5ed8aa8c4112321d26289f9a32b8` | `src/world/atmosphere/index.ts`: `4c1537b18edaa7e5b025690fbde1d8bb4d2fb97c` |
| `src/world/life` | `db6c57a39abeeba9588597af7aeffc638dc0f3f5` | `src/world/life/index.ts`: `2d403fae36a7d95a4a855f28a2725cec0888f1e3` |
| `src/world/art/restaurant` | `e3ab0a56e9654e7add734b816789a32a2c59a6c9` | `src/world/art/restaurant/index.ts`: `7e73ee85c810e09728924a5b97dc71b2a0de7bd0` |
| `src/world/ui` | `1ccd500c52e24181f795ba4f61ab291117ea0ed4` | `src/world/ui/index.ts`: `90a2a69715c67506ac598ad18ebab09bc94c91dc` |

## Dispatch verified from the consumed source

`src/world/art-registry.ts:2–7` now declares an explicit owner-to-map mapping before selecting modules. Its blob is `45f2d63e9e01950002c60f7bbb3b6850133d6a47`. Seven real `src/world/art/*/index.ts` files are present.

| Map(s) | Selected module | Defensive owner guards in consumed file |
|---|---|---|
| town | `src/world/art/town/index.ts` | drawMap:328; renderObjects:380 |
| courtyard | `src/world/art/courtyard/index.ts` | drawMap:269 (ground only); renderObjects:337 |
| residential-hall, residential-stairs, apartment | `src/world/art/residential/index.ts` | drawMap:358; renderObjects:366; membership in residential mapDefinitions |
| workshop | `src/world/art/workshop/index.ts` | paint:44; renderObjects:75 |
| rooftop | `src/world/art/rooftop/index.ts` | drawMap:276; renderObjects:281 |
| park, riverbank | `src/world/art/landscape/index.ts` | drawMap:11; renderObjects:82 |
| restaurant | `src/world/art/restaurant/index.ts` | drawMap:10 (ground only); renderObjects:132 |

Independent executable probe: transpiled the exact registry source **in memory**, replacing only the Vite eager glob with seven sentinel objects named from the exact Git tree; executed the unchanged selector. All ten expected mappings returned exactly one correct owner; an unknown map returned zero. `artCoverage()` returned 1 for each of the ten destinations. This probes selector behavior and path coverage, not browser loading, module drawing or production rendering. Existing author registry tests were read but their reported result was not used as proof.

## Fallback and stateful wiring verified

Consumed `src/world/painter.ts` blob: `35afe53261fd8cb83b35ef875cc5fe756fadbec9`.

| Seam | Consumed source | Finding / limit |
|---|---|---|
| Owner selection | `painter.ts:38–39` | Uses selectArtModules for the current map. Replaces static workshop module with createWorkshopArt only for workshop and valid neighbourhood state. |
| Generic ground suppression | `painter.ts:41` | Iterates no generic terrain whenever an authored module is selected. The old courtyard-overwrites-other-map route is blocked by both dispatch and owner guard. |
| Generic prop suppression | `painter.ts:54–56` | Iterates no generic map.props whenever an authored module is selected. Generic cuboids cannot overpaint an authored map through this fallback. For maps without an authored module, fallback still filters custom IDs. |
| Object queue | `painter.ts:54,66–76` | Collects owner renderObjects, atmosphere objects, restaurant state objects and apartment furniture, then depth-sorts with player/residents. Correct per-object depth and full silhouette coverage still require pixels/motion. |
| Restaurant art / patrons | `painter.ts:2,50,54,72; restaurant-view.ts:6–8` | Stateful restaurantPresentation feeds restaurantObjects and seated customer actors; restaurant-specific static module is also selected. Runtime state continuity, meals and departures need independent play. |
| Residential furniture | `painter.ts:13,52,54` | Explicit drawFurniture ground pass and renderFurnitureObjects remain wired to authoritative apartment state. |
| Owner module coverage obligation | `painter.ts:41,56` | Suppression is map-wide, not per successfully painted prop. One selected module disables all generic terrain/props; unsupported owner prop kinds would therefore be invisible rather than generic. No claim of complete visible prop coverage without captures. |
| Contextual HUD actually consumed | `src/App.tsx:1,462–478` | Imports and renders WorldPocketBar, ContextualInteraction, RestaurantTableControls and KitchenControls from restored owner0090 module. The files are not merely present. Phone layout, token/focus behavior and feature actions remain runtime gates. |
| Raised stairs and daily background residents | `Later acceptance gates` | Owner files being present does not establish full raised-surface player projection or background-resident behavior. These remain open and are not closed by this assembly check. |

## Handoff for fresh visual review

No manifest mismatch or missing owner entrypoint was found at this head. The previous integration omissions for town, rooftop, restaurant art and contextual UI are resolved **at source assembly level**. The old generic-overdraw mechanism is removed from authored maps **at source level**. These narrow findings do not confer an experience PASS.

Await new exact-head desktop/phone captures and retained traversal/activity video. Review actual architecture/landscape/materials, scale and acting, dense readable detail, camera edges, HUD occlusion, meaningful destinations and repeat visits from those pixels. Fresh findings replace the earlier head-specific visual assessment; no score is carried forward. Full activity continuity, persistence, day/light variants, raised stairs and resident routines remain independent gates. No production restoration or fix is performed by this reviewer.
