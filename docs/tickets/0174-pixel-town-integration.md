---
id: 174
title: Walk the town in pixel art
status: doing
priority: high
type: feature
created: 2026-11-10
---

## Why

The town still renders through the old isometric painter.

## Done when

- A `town` pixel scene compiled from `map.json` (ground layers, one sprite per prop, lights, marks), rendered in the game for the town map.
- Walking, exits, NPCs and DOM labels work; rules tests and the Playwright journey pass; headless screenshots at phone and desktop.

## Notes

- Contracts: `docs/design/pixel-contracts.md`. Base branch `claude/0162-pixel-hospital-town`.
- Owner: Claude worker (Opus). Branch `claude/0174-pixel-town-integration`; worktree `/Users/callumhemsley/Personal/junyan-px-0174`; Vite port 5198 strict (preview 5199 for production journeys). Silent: no audio, headless browser only.
- Merged `claude/0162-pixel-hospital-town` once more (real ground, lane houses, shopfronts, street furniture, market, trees, courier, critters, the ward); the town now renders with no placeholders.

### Progress (2026-11-10)

- **Scene.** `src/pixel/scenes/town.ts` compiles the town from `map.json`: size from the bounds, `groundLayers()` for the ground, one prop per map prop (`townSpriteId` at `townAnchor`, `solid: false`, map layer `ground` → `floor`), plus each prop's optional floor shade `town/<id>-shade` (left out until a sprite exists). Colliders are the map's own rects (`blocked`), so collision and the game rules are unchanged; `walkable` is the bounding box of the map's walkable rects. Lights: a glow on each street lamp's glass (`LAMP_GLASS` = 2.9 tiles above the anchor) and one per four tiles of frontage at the lit shopfronts, evening and night. Marks: `exit/<id>` (areas), `entrance/<id>` (facing), `anchor/<id>`, `landmark/<id>`, and `sign/<prop id>` on every shopfront (`signRect`: centred, up to four tiles wide, bottom 2.25 tiles up, 0.75 tall).
- **Missing art.** The atlas takes an explicit `placeholder` option (`createAtlas(set, { placeholder, onPlaceholder })`): an id the set lacks may draw as a flat translucent box (`placeholderSprite`); `has` stays honest (real sprites only), `find`/`get` return the box, the actor resolver uses a box for a missing character before the stand-in waiter and does not warn for it. `src/pixel/town/placeholders.ts` sizes the boxes (town props: their footprint; ground: an opaque material colour; `char/*` 20×52; `critter/*` 10×8) and lists missing ids once, batched, through `townPlaceholderOptions(report)`. The game always passes it for the town (so in-flight art never throws) and reports only in dev; the harness, `render-scene.ts` (`--strict` turns it off) and `colliders.ts` use it too. No `town/*` or `ground/*` id is registered.
- **Engine (additive).** `blit(..., opacity)`; `FrameState.fade` (opacity by prop id) and `PixelView`'s `fade` prop; `Prop.optional`; the placeholder option above. Engine tests 56 → 63.
- **Game seam.** `src/world/pixel/town.ts` (pure): `liveTown`, `townPhase` (the service light, as in the cafe), `townPlayer`, `lifeActor`/`townActors` (life poses → `char/lin-jie`, `char/zhang-laoshi`, `char/xiao-zhou`, `char/courier`, birds as `critter/pigeon` by the canal and `critter/sparrow` elsewhere with idle/peck/hop/fly), and `occluderFade`: a map occluder with `fadeWhenPlayerBehind` fades to 35 % when its drawn art sorts over the player and covers at least 40 of the player's body pixels. `TownView.tsx` is thin over `PixelView`; it samples life every 40 ms of the world's life clock and keeps the same cast while nobody moves. `PixelSurface.tsx` holds what the cafe and town views share. `isPixelMap` includes `town`; `WorldViewport` renders `TownView` for the town with the same pointer, pad, keyboard, cue and panel handling as the cafe; the camera follows the player, clamped to the map at an integer zoom (`portraitTiles: 10`).
- **Map fixes.** `town.bike-3` moved off the canal water to lean on the canal rail (x 64.6 → 62.4); `town.hedge-6` now starts below the south fig's base (y 58 → 58.8, height 5 → 4.2). Both in `map.json` and `author-map.py`, covered by a test.
- **e2e.** `world-journey.ts` reads the camera from `.pixel-map` (cafe and town). `avatar-heading` observes the isometric avatar in the courtyard now (the town no longer draws it) and its doorway test walks from the town up through the moon-gate lane into the courtyard (entrance facing north). New `e2e/pixel-town.spec.ts` leaves the restaurant, walks cardinally, crosses to the market, checks the junction tree fades while the player is behind it and not in front, re-enters the restaurant, and writes screenshots at 1440×900@2 and 390×844@3.

### Known gaps

- `town.river-rail-left` runs along `town.closed-yard-gate` (same line, y 43.2–43.55); which one should move is a design call, left as is.
- `sign/<id>` marks are the scene's own rectangle; the shopfront sprites draw their boards where `_front.ts`'s `signboard` puts them and do not export the field. Reconcile (export the field per sprite, or a shared rule) before DOM shop names are shown; no content line exists for them yet.
- The regulars are customers on day one, so life excludes them from the town then; they appear on their routes on other days. Life reactions (waves, flutters) and atmosphere are not drawn in the pixel town yet.
- `src/pixel/town/map.ts` imports `map.json` with a `type: "json"` attribute while the app imports it without; Vite warns at build. Harmless, but worth aligning.
- Base-branch test `src/world/pixel/ward.test.ts` "wardStage with today's sprites … stands existing characters in" fails since the hospital cast landed (it expects `char/patient` to be missing); not touched here.
