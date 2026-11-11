---
title: Pixel art contracts for the hospital ward and the town
created: 2026-11-10
status: active
tags: [design, pixel-art, contracts]
---

# Pixel art contracts: hospital ward and town

The style rules are in [[design/pixel-art]], and they all still apply: 32px tiles, the locked palette, light from the upper left, three-quarter top-down view, and "nothing generic". This note fixes the **ids, sizes and anchors** that parallel workers share, so the art and the scenes can be built at the same time. If you need a change here, ask the orchestrator. Never change this note on your own.

## Setting

- **Town.** A lane neighbourhood (弄堂) in Shanghai's former French Concession, the same world as the bistro interior:
  - plane trees, shikumen stone-gate houses, Art Deco shopfronts, brick lanes, a canal;
  - modern daily life laid over 1930s buildings: bicycles, laundry on bamboo poles, plastic stools, AC units, utility wires, scooters.
- **Hospital ward.** A small, warm, slightly old Chinese hospital ward on a morning:
  - two beds, striped pyjamas, a thermos, oranges from visitors;
  - jade wainscot walls, morning light through the window.
  - It is a gentle place, not a clinical one.
- **Text.** No text in any sprite, in any script: signs, menus, clocks, charts and screens are blank or abstract. Text is DOM, placed by marks.
- **Red** stays rare, and **vermilion** is reserved for words.

## Town (map: `src/world/maps/town/map.json`, 80×64 tiles)

Map units are pixel tiles. The gameplay coordinates are fixed, so art fits the map and the map never moves.

### Props

Every town prop gets **one sprite per instance**:
- **Id:** `town/<prop id without "town.">`. For example, `town.hedge-0` becomes `town/hedge-0` and `town.restaurant` becomes `town/restaurant`.
- **Defining them:** use the helpers in `src/pixel/town/map.ts` (`townProps(kind…)`, `townSpriteId`, `footprintPx`, `openingsOn`) and iterate over the map. Write a reusable draw function per kind, parameterised by footprint size and `variant`, then emit one sprite per instance.
- **Anchor:** the bottom-centre of the footprint, `anchor: [round(width*32/2), spriteHeight - 1]`, and the scene places it at `[x + width/2, y + height]`.
- **Size:** a sprite may rise above its footprint (walls, roofs, trees, lamps) but never hangs below it or spills sideways past it. A building sprite fills exactly its footprint width.
- **Shadow:** set `shadow` for free-standing things. Buildings cast no contact-shadow ellipse.
- **Layer:** `object` unless it is flat on the ground (mats, drains, gutters, flowerbed soil: `floor`).

### Buildings

A building's footprint is its whole plot seen from above:
- the front facade occupies the **bottom** 3–5 tiles of the footprint (one or two storeys);
- the roof's top face fills the rest above it;
- doors sit on the bottom edge where `openingsOn(prop)` says (footprint-relative art px `x0..x1`); `town.restaurant` must have its door at those pixels.
- **Shop signs** are blank boards. The scene adds `sign/<prop id>` marks for DOM text.

### Ground

- **Tiles:** `ground/<material>-<a..d>` for `grass`, `paving`, `road`, `brick`, `stone`, `water` (water animates).
- **Edges and kerbs:** `ground/edge-…`, as the ground worker defines them.
- **Layers:** `src/pixel/town/ground.ts` exports `groundLayers(): TileLayer[]`, which the town scene calls. Only the ground worker edits that file.

### Kind owners (one worker per kind)

| Owner | Kinds |
| --- | --- |
| Lane buildings (0164) | `building-residence`, `building-row`, `building-utility`, `steps`, `open-door-leaf`, `threshold-mat` |
| Shopfronts (0165) | `building-restaurant`, `building-tea`, `building-workshop`, `building-shop`, `building-shutter`, `awning` |
| Street furniture (0166) | `street-lamp`, `bollard`, `bench`, `bicycle`, `drain`, `gutter`, `utility-pole`, `pipes`, `milestone`, `fence`, `gate`, `closed-gate` |
| Market and life (0167) | `market-stall`, `baskets`, `crates`, `laundry`, `stone-table`, `delivery-ledge`, `rest-bag`, `planter` |
| Plants (0168) | `tree`, `hedge`, `flowerbed` |

Each owner may also add unattached extras in its own domain folder, for the scene to scatter (for example `street/ac-unit`, `life/scooter`, `plant/weeds-a`).

### Town cast (0170)

- **Courier:** `char/courier`, for the `resident-courier` hook.
- **Birds:** `critter/sparrow`, `critter/pigeon` (`idle`, `peck`, `hop`, `fly` actions, down/left/right).
- **Cat:** an optional street cat, `critter/cat-tabby`.
- The regulars `char/lin-jie`, `char/zhang-laoshi`, `char/xiao-zhou` and `char/player` already exist.

## Hospital ward (scene `ward`, composed by the orchestrator)

### Architecture (0171)

`ward/` tiles and wall pieces:
- floor (terrazzo or worn linoleum)
- back wall slices: cream plaster over a jade wainscot
- a window with morning light and a half-drawn blind
- the ward door
- a curtain rail with privacy curtains
- a radiator, a nurse-call panel, a wall clock with no numerals, and a blank notice board

### Furniture and equipment (0172)

`ward/`:
- **Beds:** two hospital beds (a tidy one for the player, a lived-in one for the elder), each in a flat and a raised-backrest version.
- **Next to the beds:** bedside cabinets with tops that food can sit on, and an overbed table.
- **Equipment:** an IV drip stand (animated drip) and a heart monitor with an animated pulse line and no digits.
- **Visitor things:** a visitor chair, a thermos, a vase of flowers, a bag of oranges, slippers.
- **Room:** a wheelchair, a folding screen, a wash basin, a bin.

**Bed geometry**, shared with the cast worker:
- **Bed frame:** `ward/bed-<player|elder>-<flat|raised>` is 48×96 (1.5×3 tiles), with `anchor: [24, 94]` at the bottom-centre of the foot end. The head end is at the top.
- **Flat bed:** the pillow is centred at (24, 24), and the mattress top face spans y 18–74.
- **Raised bed:** the backrest is a sloped face from y 4 to y 40, with the pillow against it centred at (24, 20).
- **Blankets:** `ward/blanket-<player|elder>-<lying|sitting>` use the same 48×96 canvas and anchor. They are drawn over the occupant, so the scene sorts them just in front. Lying, the blanket covers y 34–76; sitting, it covers y 44–76.

### Cast (0169)

The cast is drawn with the character rig (`src/pixel/sprites/char/`, `defineCharacter`):
- `char/doctor`: a white coat, stethoscope, clipboard and glasses.
- `char/nurse`: a white uniform and a nurse's cap.
- `char/aunt`: 小姨, about 45, warm and practical, visiting with a soup thermos and a handbag.
- `char/elder`: 老爷爷, blue-and-white striped pyjamas.
- `char/patient`: the player's face and hair (`char/player`) in striped pyjamas.

Each character has `idle` and `walk` in all facings.

There are two in-bed actions, both facing down only. Both are 32×64 with `anchor: [16, 62]`, and the composer offsets them onto the bed:
- `lie`: the head on the pillow seen from above and in front, shoulders and arms over the blanket, nothing below the chest.
- `sit-bed`: upright against the backrest, visible down to the waist, hands in the lap.

The elder and the patient need both. The visitors don't.

The ward foods (豆浆 milk, 鸡蛋 egg, 馒头 bread) reuse the existing `food/` sprites.
