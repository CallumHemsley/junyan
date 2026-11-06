# Seating and town catalog addendum — e02a747

Exact reviewed head: `e02a747c3b4d4fc6a476ea744ecb6bdc1a738132`. Date: 2026-11-06 UTC. Source inspection and small in-memory probes only; no production edits, checkout, application build, or browser changes.

**The buried customers have a reproducible seat/scale/depth mismatch. The second player-like town figure is an intentional aunt resident rendered with the player fallback artwork.** These are concrete correction targets for the existing visual packages, not new approval or a full-game PASS.

## Integrated visual evidence

The [ordinary service receipt](integrated-e02a747/desktop-journey-02-receipt-seated-1.png) shows the player beside table 1 while its served customer remains mostly a head behind the table. The other seated customers exhibit the same issue, with the grey-haired customer reduced almost to a head strip. This supplements the earlier labelled [phone restaurant fixture](integrated-e02a747/phone-morning-restaurant.png); the defect is not confined to an injected arrival.

Receipt SHA-256: `e5a2cde22b8e04961cc8b509878edba9e068f8ba30df0c4cd43dab4796153c10`. The receipt image establishes visible seated presentation during ordinary service, not a completed journey. [Desktop town fixture](integrated-e02a747/desktop-morning-town.png), SHA-256 `363b42f9bf4ce2391a8f015fdbfa9a2e507036efa539efefde70c9c1f5f7394b`, contains the player at the restaurant entrance and the matching-looking resident to the right.

All source line references below refer to **e02a747**, regardless of the reviewer's working-tree branch.

## 1. Production seating chain and actual world units

| Stage | Exact source | Finding |
|---|---|---|
| Table geometry | `src/world/restaurant.ts:5,10` | Each dining table has a 2 × 2 footprint and matching table collider. |
| Customer position | `src/world/art/restaurant/projection.ts:44–48` | Every customer is fixed at table centre x and `prop.y − .6`, facing south. No seat ID, pelvis attachment, or seat elevation is emitted. |
| Table/stool art | `src/world/art/restaurant/index.ts:47–58` | Tabletop spans z 1.27–1.44; leg height 1.32. Rear stool spans y `table.y − .85` to `table.y − .19`, z .62–.77. Front stool starts at `table.y + depth + .22`. |
| Production actor scale | `src/world/characters/adapter.ts:55–58`; `src/world/camera.ts:3–5` | Canvas pixel scale is camera scale / 18. One native sprite vertical pixel therefore equals 1/18 world-height unit in this production path. |
| Sit pose | `src/world/characters/artwork.mjs:13–20,51–66,172` | Sit lowers head and shoulders by 5 native pixels, sets hip y31, retains foot contact around y37–38 and anchor y38. It does not attach the pelvis to a seat. |
| Actor draw call | `src/world/painter.ts:72` | Calls `sampleActor(...posture:"sit")` then `drawActor(...customer.position)`; no z or seat geometry is supplied. |
| Production adapter | `src/world/characters/adapter.ts:55–58` | Accepts x/y only and calls `view.project(position)` without z. The separate `paintActor` surface API at lines12–24 accepts z, but **is not the production draw path**. Its different elevation conversion cannot be assumed to repair this. |

For table 1, the prop origin is (4,8). Customer foot-origin is **(5,7.4,0)**. The rear stool's seat centre is **(5,7.48,.77)**. Horizontal attachment is close; vertical attachment is missing.

With the current canvas mapping, seated pelvis y31 lies **(38−31)/18 = .389** above the foot-origin. It is therefore approximately **.381 world units below the stool top**. Typical seated shoulder y23 lies at .833, substantially below the 1.44 tabletop. Sitting is drawn as a shortened/lowered standing body with almost the same feet, so a simple global lift is not a complete anatomical fix.

An in-memory probe of the exact character source at south facing, reduced motion, elapsed 700 ms measured:

| Actor | Pose | Topmost opaque pixel y | Top above foot-origin |
|---|---|---:|---:|
| player | stand | 3 | 1.944 |
| lin-jie | sit | 5 | 1.833 |
| xiao-li | sit | 7 | 1.722 |
| zhang-laoshi | sit | 10 | 1.556 |
| xiao-zhou | sit | 7 | 1.722 |

These are world-height conversions of sprite pixels, **not measured visible clearance above the table in screen space**; ground-plane projection and occlusion also contribute. Nevertheless, the table is about 74% of standing-player height, and the older customer's highest opaque pixel is only .116 world units above tabletop height. The screenshot's tiny exposed grey head is consistent with this mismatch.

### Depth/occlusion issue

`restaurant/index.ts:146–151` returns **one object for the table and both stools**, positioned for depth at `(table.x + width/2, table.y + depth)`. The customer depth is its foot-origin x+y. For every table this furniture object draws **2.6 depth units after** the rear customer:

| Table | Customer x/y | Customer depth | Combined table/stool depth |
|---|---|---:|---:|
| 1 | 5, 7.4 | 12.4 | 15 |
| 2 | 17, 7.4 | 24.4 | 27 |
| 3 | 5, 12.4 | 17.4 | 20 |
| 4 | 17, 12.4 | 29.4 | 32 |

The painter sorts these objects by x+y at `painter.ts:66–76`. Thus the rear stool also paints after the actor, despite supporting that actor. There is no actor/furniture fragment interleave. Furniture fade at lines68–69 depends on **the player's** position, not the seated customer's visibility; it is not a seat-attachment solution.

### Owned correction targets

- **0085 characters — pose and attachment contract.** Define standing foot origin, seated pelvis attachment, foot contacts, hands and facing-dependent seat offsets in shared world units. Draw an actual bent seated silhouette from front, side/quarter and rear; keep torso length and hand reach believable. Update production `drawActor`, not just the unused surface API or sprite harness. Raised body rendering must not raise the floor/contact shadow with it.
- **0089 restaurant — furniture and seat definitions.** Publish seat x/y/z, facing and tabletop height from the same geometry used to paint the stool/table. Agree dining heights against the current approximately 1.94-unit standing reference; reduce the oversized table/stool or coordinate a revised common scale. Replace the independent `−.6`, `−.85`, `.62`, `.77`, `1.44` assumptions with shared metrics. Update food/table-setting z values (currently bowl 1.46 and food 1.55 at lines224,229) with the tabletop. Split rear/front stools and appropriate table parts into objects with correct depth/attachment relationships.
- **0078 foundation — integration and preserved occlusion.** Carry the seat attachment through projection → actor sample/draw; preserve player collision, service anchors and grounded shadows. Keep foreground tabletop/edge occlusion where physically correct. Do **not** move all patrons to the end of the draw list, remove table occlusion, or apply an arbitrary screen-space lift: those hide the symptom while breaking front/behind behavior.

A lift of .77 alone would put the existing pelvis at 1.159; even the mathematically smaller .381 lift would make some heads higher than the standing reference without fixing the compressed torso. This requires coordinated pose and furniture work, not a constant-only patch.

**Required integrated recheck:** all four customers during ordinary ordering/service/receipt, player passing front/side/behind the table and stools, near/far seats or a declared orientation fixture for seated front/side/rear, and explicit departure. Verify hands meet the tabletop, pelvis meets the seat, feet/shadows remain grounded, near objects still occlude correctly, and interaction/collision anchors remain usable on phone and desktop. A sprite sheet alone cannot close this finding.

## 2. Town aunt is intentional life content with missing visual catalog coverage

The exact town map declares `town.morning-walk`, `characterId:"aunt"`, at (35.5,31.5), with a route through (42.5,31.5), (42.5,14), (45,10): `src/world/maps/town/map.json:4124–4148`. The life registry explicitly supports aunt as a resident with speed .8 and working rest posture: `life/profiles.ts:10–12`. The route compiler therefore correctly accepts her; arbitrary unknown profile IDs would instead be rejected at `life/routes.ts:23–27`.

However, the **art** catalog in `characters/index.ts:34,46–47` reads only `content.characters`. That array contains exactly:

| ID | Appearance accessory | Shirt RGB |
|---|---|---|
| lin-jie | bun | 142,157,119 |
| xiao-li | tie | 81,108,132 |
| zhang-laoshi | glasses | 193,158,85 |
| xiao-zhou | backpack | 135,116,150 |

Aunt exists in `content.opening.cast` as 小姨 with voice metadata, **without an appearance**. That opening cast is not used by the character art resolver. Player is also absent from `content.characters`, relying intentionally on artwork defaults.

For aunt, `cast.get("aunt")` therefore returns undefined. `artwork.mjs:6–9` defaults to cream shirt, brown hair, dark trousers and `accessory:"player"`, including the player's apron at lines97–101. There is no explicit aunt artwork or unknown-ID diagnostic in this path.

The exact-source probe produced **identical full RGBA buffers** for `player`, `aunt`, and `unknown-id` under the same standing south pose:

`SHA-256 7ba7d4bec01d246cc17f1a1db19adacf4b660767ea4182105a94e0a6a29761a2`.

The exact town route compiler accepted seven declared hooks with zero diagnostics. With the morning fixture's day 1 / seed 955863294 and its four restaurant occupants excluded, the only sampled town resident at 700 ms was:

`town.morning-walk / aunt / position(42.38362,24.24446) / south / walk`.

The player is rendered separately at the fixture entrance (34,30.4) via `painter.ts:31–33`. This explains the two similar figures: **one player, one intended aunt NPC with fallback art**, not a duplicate player entity. The sampled 700 ms is a source probe; the screenshot's exact animation timestamp was not recorded and is not asserted to be precisely 700 ms.

### Owned correction targets

- **0085 characters:** make player appearance explicit, add a distinct approved aunt appearance, and validate that every resident ID passed to `sampleActor` resolves deliberately. Unknown visual IDs should not silently masquerade as the player.
- **0087 world-life, with 0079 town:** validate resident-profile → visual-catalog coverage for all published hooks, retaining the intentional aunt route. Do not delete the resident to remove the duplicate appearance. Wildlife remains on its separate renderer.
- **0078 foundation:** consume both changes together and recheck actual town pixels/motion with player and aunt in the same frame. Preserve restaurant-presence exclusion, whose separate role is preventing an already-seated customer from simultaneously walking outside.

Probe method: exact Git blobs were loaded and TypeScript transpiled only in memory; the content import used the exact JSON character array. No generated application build, source mutation, or server run was performed. These findings identify correction targets; they do not assert a fix has landed.

