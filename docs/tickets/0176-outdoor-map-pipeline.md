---
id: 176
title: Draw any outdoor map through the pixel pipeline, starting with the courtyard
status: done
priority: high
type: feature
created: 2026-11-11
---

## Why

The town is map-driven pixel art (tickets 0174, 0175), but the pipeline is town-only: one map import, `town/` sprite ids, town-only ground and scene. The courtyard, rooftop, park and riverbank still render through the old isometric painter. Adding a map should be registration, not new code.

## Done when

- A registry of outdoor pixel maps (`src/pixel/world/maps.ts`): `mapProps(maps | "all", ...kinds)` tagged with their map, `propSpriteId(map, id)`, `propAnchor`, `footprintPx`, `openingsOn(map, prop)`; `src/pixel/town/map.ts` keeps its exports as wrappers.
- Shared kinds' generators (`src/pixel/sprites/{bldg,street,life,plant}/`) iterate every registered map; the town's sprites stay byte-identical; unknown ids fall back instead of throwing (trees).
- `groundLayers(map)` with a material alias table for the other maps' materials; the town's ground unchanged.
- A generic scene compiler and outdoor view; the courtyard registered and walked in pixel art (`isPixelMap("courtyard")`), its habitat, laundry pocket, cats and exits to the town working; new courtyard kinds draw as placeholders.
- `avatar-heading` observes the old avatar on a map the old painter still draws.
- Unit tests for the registry and the compiler, a courtyard drift test, the town tests unchanged; Playwright and renders as below.

## Notes

- Owner: Claude worker (Opus). Branch `claude/0176-outdoor-map-pipeline` from `claude/0162-pixel-hospital-town`; worktree `/Users/callumhemsley/Personal/junyan-px-0176`; Vite 5204 strict, preview 5205. Silent, headless only.
- Did not touch `src/pixel/sprites/shop/` (another worker is in it) nor `docs/design/pixel-contracts.md`.

### Progress (2026-11-11)

- **Registry** (`src/pixel/world/maps.ts`): `OUTDOOR_MAPS` (town first, then courtyard), `OUTDOOR_MAP_IDS`, `outdoorMap(id)`, `mapProps(id | ids | "all", ...kinds)` (props tagged `map`, stable objects, map by map in registry order; no kinds → every prop), `propSpriteId(map, id)` (`courtyard.planter-3` → `courtyard/planter-3`), `spriteIdOf(prop)`, `propAnchor`, `footprintPx`, `openingsOn(map, prop)`, `propsBySprite()`. `src/world/pixel/maps.ts` lists the same ids in `OUTDOOR_PIXEL_MAPS` (kept JSON-free for Node and Playwright; a test checks they agree). `src/pixel/town/map.ts` is now wrappers (`TOWN`, `townProps`, `townSpriteId`, `townAnchor`, `openingsOn(prop)`, `footprintPx`).
- **Shared kinds.** Every generator in `bldg/`, `street/`, `life/`, `plant/` iterates `mapProps("all", kind)` and emits `propSpriteId(prop.map, prop.id)`; per-map context reads the prop's own map (laundry's door spans, fences' gate spans). Town first keeps index-seeded kinds (benches, bikes, lamps, planters, crates, poles) byte-identical. Trees fall back to a deterministic plane picked from the id (`planeSpec`) instead of crashing; `treeSprites(props)` is exported for tests. The courtyard's 26 shared props (3 benches, 2 bicycles, 3 drains, 2 laundry lines, 15 planters, 1 stone table) draw with town art. None of its kinds is shop-owned.
- **Ground.** `groundMaterials(map = TOWN)` and `groundLayers(map?)`; `MATERIAL_ALIASES` maps courtyard (`brick-paving` → brick, `courtyard-stone`/`threshold-stone` → stone, `worn-stone` → paving, `moss-earth` → grass), rooftop (`roof-brick` → brick, `roof-concrete`/`roof-wood` → paving, `roof-tile` → stone) and park/riverbank (`path`/`sand` → paving, `stone-path`/`bridge` → stone, `boardwalk` → brick) onto the six `ground/*` materials; unknown materials still throw. Rooftop, park and riverbank ground compile already (tested).
- **Scene.** `src/pixel/world/scene.ts`: `compileOutdoorScene(map)` (the old town compiler, generic; map layer `foreground` sorts with people as `object`), `outdoorScene(id)` (memoised), `outdoorScenes()`; `scenes/index.ts` spreads the registry's scenes, so the courtyard scene exists by registration; `scenes/town.ts` keeps `LAMP_GLASS`, `SHOPFRONT_KINDS`, `signRect`, `shadeSpriteId(propId)`.
- **Game.** `src/world/pixel/outdoor.ts` (was `town.ts`): `liveOutdoor(id)`, `outdoorAtlasOptions`, `outdoorPhase`, `outdoorPlayer`, `outdoorActors`, `LIFE_CHARACTERS`, `lifeActor`, `occluderFade`, `placedById`; `town.ts` re-exports the town names. `OutdoorView.tsx` (was `TownView.tsx`): one renderer per map over one shared atlas, class `pixel-map pixel-outdoor pixel-<map>`; `WorldViewport` renders it, keyed by map, for every pixel map but the restaurant. `isPixelMap("courtyard")`. Placeholders (`townPlaceholder`, alias `outdoorPlaceholder`) cover every registered map's props and `<map>/` extras.
- **avatar-heading** observes the old avatar in the residential hall (entrance from the courtyard) instead of the courtyard; its doorway test walks from the pixel courtyard up through the hall's back door (pixel → isometric, as before town → courtyard) and expects the hall's west-facing entrance; it also checks the old avatar is no longer drawn in the courtyard.
- **e2e** `pixel-courtyard.spec.ts`: from the town's moon-gate lane through the gate, the arrival facing, cardinal walking, the bicycle court, fading behind the east laundry line and not in front, and back out to the town; screenshots at 1440×900@2 and 390×844@3.
- **Walk helper** (`e2e/world-journey.ts` `walkTo`): on the phone a tap beside the bottom target card was snapped onto its activate button by touch adjustment and opened the cats activity at the aunt mid-walk (the courtyard's camera now puts more taps near it). A tap point is now clear only when the canvas owns it and, on touch screens, no button is within 24 px; a shorter step toward the player is tried before the movement pad.

### Courtyard kinds still needing art (placeholders today)

34 kinds, all courtyard-only (none shop-owned; the courtyard uses no `building-*` or `awning`): `row-house` (6), `courtyard-tree` (6), `fallen-leaves` (8), `pawprints` (10), `doorstep` (5), `utility-box` (5), `raised-bed` (4), `stool` (3), `basket` (2), `boundary-wall` (2), `damp-paving` (2), `threshold-planter` (2), `wash-basin` (2), `window` (2), and one each of `bicycle-shed`, `bird-bath`, `bowl`, `broom`, `bucket`, `canopy`, `doorway`, `entry-gate`, `entry-mat`, `folding-board`, `garden-arch`, `ledge`, `resting-mat`, `runoff-channel`, `sorting-basket`, `stoop`, `water-jar`, `watering-can`, `well-cover`, `woven-mat` (79 sprite ids, listed by `render-scene.ts courtyard`).

### Checks (2026-11-11)

- `pnpm exec tsc -b` clean. `pnpm exec vitest run`: 136 files, 886 tests passed (was 133/862; new `src/pixel/world/maps.test.ts` 11, `src/pixel/world/scene.test.ts` 5, `src/world/pixel/courtyard-map.test.ts` 8; `town-map.test.ts` and `ground.test.ts` unchanged).
- Town byte-identical: every sprite in the registry fingerprinted (size, anchor, frames, pixels) before and after: 825 unchanged, 26 `courtyard/*` added, the compiled town scene JSON identical; full town renders morning and night (`--scale 1`) byte-identical (`cmp`).
- `node src/pixel/tools/render-scene.ts courtyard --scale 2 --out output/pixel/0176/courtyard-full.png`: renders; 79 placeholder ids listed.
- Headless Playwright (`--mute-audio`), Vite 5204, preview 5205, desktop and phone projects. First run (pixel-town, pixel-cafe, pixel-courtyard, avatar-heading, waiter, world-journey, neighbourhood, neighbourhood-save, neighbourhood-offline, reading-room, cats): 57 passed, 5 skipped, 2 failed (both the phone tap-onto-the-target-card race above). After the helper fix: pixel-courtyard + neighbourhood 6 passed, 2 skipped; then pixel-town, pixel-cafe, avatar-heading, waiter, world-journey, neighbourhood-save, neighbourhood-offline, reading-room, cats 53 passed, 3 skipped (the pixel specs set their own sizes and run once).
- Screenshots `output/pixel/0176/{desktop,phone}-{1-moon-gate-lane,2-courtyard-arrival,3-bicycle-court,4-behind-laundry}.png`.

### Known gaps

- The courtyard's buildings, trees, gate, walls and small things are translucent boxes until their kinds are drawn (list above); its ground uses the town's tiles through aliases.
- Both story cats draw as 花卷 the tabby (`critter/cat-tabby`): the white and black cats need `critter/cat-white` and `critter/cat-black`, and `lifeActor` a mapping for `white-cat`/`black-cat`, before the white/black clue reads on screen. The laundry neighbour (`char/resident-laundry-neighbour`) is a placeholder figure; the courtyard aunt draws as `char/aunt` (the ward's 小姨).
- The old courtyard painter's extras (pocket lighting, atmosphere, life reactions) are not drawn in pixel, as in the town.
- `src/world/pixel/maps.ts` keeps its own list of outdoor pixel map ids (a test ties it to the registry) so Node stays free of the JSON; registering a map means a line in both.
- The pixel registry imports the courtyard JSON with `type: "json"` and the app without, like the town (Vite warns at build).
- `src/pixel/town/ground*.ts` and `placeholders.ts` now serve every outdoor map but keep their `town/` paths and `town*` names (aliases `outdoorPlaceholder*` added); moving them is a rename for later.

- Done 2026-11-11. Learned: tagging each prop with its map and keeping the town first in the registry made generalising mechanical and provably safe (sprite fingerprints and render bytes unchanged); a whole map's ground, scene and placeholders follow from its JSON once materials alias onto existing tiles; and on phones the walk helper has to keep taps a finger's width away from DOM controls, since touch adjustment will otherwise press them.
