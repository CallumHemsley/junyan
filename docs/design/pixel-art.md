---
title: Pixel art style bible
created: 2026-11-09
status: draft
tags: [design, art, pixel]
---

# Pixel art style bible

The bar is Stardew Valley or better: hand-finished, warm, dense with small true details, readable at a glance. This document is binding for every sprite. The reference sprites live in `src/pixel/sprites/exemplar/exemplar.ts`; render them first and match their finish.

## How art is made here

Art is code. A sprite is a function that draws palette colours into a `Px` canvas (`src/pixel/kit`). There are no image files: the game bakes sprites at start-up, and Node renders the same code to PNG so you can look at it.

```bash
# every sprite whose id contains "furn/", 8× zoom, on a neutral ground
node src/pixel/tools/sheet.ts furn/ --scale 8
# in context, true relative scale, with contact shadows
node src/pixel/tools/compose.ts --size 176x128 --floor ex/floor-wood-a,ex/floor-wood-b --wall ex/wall \
  "ex/table@56,96" "ex/stool@28,98" "ex/waiter@92,112" --scale 5 --out output/pixel/try.png
```

Then open the PNG with the Read tool and look at it. **Looking is the job.** Nobody ships a sprite they have not viewed at 8× and at 3×, alone and composed on the floor next to the waiter and a table.

The loop for every sprite: block the silhouette → form shading → material texture → story detail → outline → look → fix what is wrong → look again. Expect four or more passes on anything that matters. When a piece is weak, redraw it; do not polish a bad silhouette.

Use primitives (`rect`, `ellipse`, `poly`, `line`) for big forms and `rows()` (hand-placed pixels, one character per pixel) for everything small, organic or characterful: faces, hands, food, leaves, handles, corners. Most good sprites end with hand-placed pixels.

## The camera

Three-quarter top-down, like Stardew Valley. The camera looks north and slightly down.

- You see the **top** and the **front (south) face** of every object. Never the sides, never diagonals, never isometric.
- Tops are foreshortened to about 60–70% of their true depth. Front faces are drawn at full height.
- The back wall of a room is drawn face-on, three tiles (48px) tall. Side and front walls show only their caps.
- Things further north are drawn first; an object hides what stands behind it.

## Scale

| Thing | Size in art pixels |
| --- | --- |
| World tile | 16 × 16 |
| Person | 16 × 32 frame, feet near the bottom, about 28 tall |
| Dining table (seats 2–4) | 32 × 28 (see `ex/table`) |
| Stool | 14 × 15 |
| Counter | 16 wide modules; 10–11 top + 15 front = about 26 tall |
| Tall appliance, shelf unit | 16–32 wide, 36–44 tall |
| Back wall | 48 tall: 5 cap, 26 plaster, 13 dado, 4 skirting (see `ex/wall`) |
| Plate or bowl on a table | about 10 × 7 |

A standing person's waist is level with a table top. Counters come to mid-chest. Check new work against `ex/waiter` in a compose render.

## Light

Morning sun from the **upper left**.

- Top faces are the lightest plane, front faces a step or two darker, undersides and right edges darkest.
- Put a highlight along top and left edges, a shade along bottom and right edges.
- Step along a ramp to shade. The ramps already shift hue (shadows cooler and plum, lights warmer and yellow). Never darken by mixing in grey or black.
- Each material uses three to five tones. Fewer looks flat; more looks muddy.
- **Do not draw ground shadows.** Declare `shadow` on the sprite and the renderer draws a soft contact shadow. Do draw occlusion inside the object (under a table top, inside a bowl).

## Outlines

- Free-standing objects and people get a one-pixel dark outline around the silhouette: `ink` for people, the darkest step of the object's own ramp (`wood1`, `jade1`, `steel1`…) for things. Never pure black.
- Interior lines are a darker step of the local colour, not the outline colour.
- Floor and wall tiles have no outline. Wall-mounted pieces get a thin dark edge only on the bottom and right, as if casting a hairline shadow.
- No doubled outlines where two parts of one object meet.

## Pixel craft rules

1. **Every pixel deliberate.** No random single-pixel noise, no speckle used as "texture". Grain is short streaks; wear is small clusters.
2. **No pillow shading** (dark edges, light middle regardless of the light). Shade by plane and by the upper-left sun.
3. **No banding** (parallel bands hugging an outline). Break ramps with shape.
4. **No jaggies.** Curves step in consistent runs (4,2,1,1,2,4), never 3,1,2,1.
5. **Dither sparingly**, only for woven, rough or glassy materials, never on skin or smooth wood.
6. **Silhouette first.** Filled solid black, the sprite must still read as what it is.
7. **A story detail on every object.** A chipped corner, a tea stain ring, a chopstick left askew, a faded patch where a calendar hung, steam, a scuffed kick-plate. This is what makes the room feel lived in, and it is the difference between a proof of concept and Stardew.
8. **Variation.** Anything placed more than twice needs at least two variants (tiles: three or more).
9. **Readable at 1×.** The game shows art at 3–4× zoom; details smaller than 2px must carry by contrast.

## Colour

Only the names in `src/pixel/kit/palette.ts`. If a colour is truly missing, say so in your report; do not invent one.

The room is warm and light: honey oak floor, cream plaster, a painted jade dado, tea-wood furniture, bamboo, steel and porcelain in the kitchen, with blue-and-white bowls and a little lacquer red as punctuation. Furniture is darker than the floor it stands on. Keep red rare: a lantern, a chili jar, a paper square. The UI's vermilion means "new word" and must not be diluted by a red room.

## Words

**No Chinese characters and no legible text of any kind inside a sprite.** Dialogue, signs, menus and prices are real DOM text laid over the scene. Signboards, menu plaques, calendars and labels are drawn blank (or with two or three abstract ruled lines), with a clear flat area for the overlay; give that area's rectangle in the sprite's doc comment.

## Sprite contract

```ts
import { defineSprites } from "../../kit/index.ts";

export default defineSprites({
  "furn/stool": {
    w: 14, h: 15,
    anchor: [7, 14],            // the pixel that touches the ground at the object's position
    foot: [-5, -6, 10, 6],      // solid footprint, px relative to the anchor: [dx, dy, w, h]
    shadow: { rx: 7, ry: 3 },   // contact shadow ellipse centred on the anchor
    draw: (p) => { /* … */ },
  },
});
```

- Ids are `domain/name`: `tile/`, `wall/`, `kitchen/`, `furn/`, `decor/`, `food/`, `char/`, `fx/`.
- One file per small family, in `src/pixel/sprites/<domain>/`. Files starting with `_` are private helpers and are not loaded as sprite sets.
- `layer: "floor"` for anything flat that people walk over or that is painted on a wall (tiles, rugs, windows, shelves, wall decor). Default `object` is depth-sorted against people. `over` hangs above everyone (lantern, lamp shade, door lintel).
- Animated sprites set `frames` and `fps`; `draw(p, frame)` draws one frame. Loops must be seamless. Idle life is slow: 2–6 fps.
- Tiles must repeat seamlessly; check with `sheet.ts --tile`.
- Translucent pixels (glass, steam, light) use `p.faded(alpha, …)`. Solid art never does.
- Sprites are deterministic. Use `hash()` for placement variety, never `Math.random` or time.

### Characters

Ids are `char/<who>/<action>-<dir>` with `dir` in `down | up | left | right`.

| Action | Frames | Notes |
| --- | --- | --- |
| `idle` | 2 at 2 fps | a one-pixel breath |
| `walk` | 4 at 8 fps | contact, pass, contact, pass; arms counter-swing |
| `sit` | 1–2 | seated on a stool; legs foreshortened |
| `carry-idle`, `carry-walk` | as above | waiter only: both hands on a loaded tray |

`left` may be the mirror of `right` unless the character is asymmetric. Proportions follow `ex/waiter`: a big head (about 14 wide, 13 tall with hair), a two-pixel-tall eye, a body about 10 wide, short legs.

## The room everyone is drawing for

早安小馆, a neighbourhood breakfast shop at about seven in the morning. About 18 tiles wide and 13 deep.

- **Back wall** (north): cream plaster over a jade painted dado. Two wooden lattice windows on the dining side throw warm light onto the floor. On the kitchen side: shelves of bowls and jars, blank wooden menu plaques, a clock, a calendar, a range hood.
- **Kitchen** (north-east, behind a counter): a stove with stacked bamboo steamers breathing steam, a wok of oil for 油条, a tall soy-milk pot, a sink, a fridge, flour sacks. Small jade-and-cream floor tiles.
- **Service counter**: tea wood with a worn top, an L that fences off the kitchen. On it: a steamer of buns under a lid, a pot of tea eggs, a cash box, a waving lucky cat. The waiter collects food at its dining side.
- **Dining room**: honey oak boards, four square tables with stools, each with a chopstick tin, a vinegar bottle and a chili jar. Customers sit and eat here.
- **Front wall** (south): only the wall cap is visible, with a doorway gap, a worn mat and daylight spilling in from the street.
- **Life**: potted plants, a red lantern or two by the door, a thermos, a radio, a broom, a cat asleep in a sun patch.

Foods on the menu: 包子 steamed bun, 馒头 plain steamed bread, 鸡蛋 tea egg, 豆浆 soy milk, 粥 congee, 油条 fried dough stick, 饺子 dumplings.

## Kit reference

`Px` methods (all take palette colour names; pass `null` to erase):

- `px(x,y,c)`, `rect(x,y,w,h,c)`, `frame(x,y,w,h,c)`, `hline(x,y,len,c)`, `vline(x,y,len,c)`, `line(x0,y0,x1,y1,c)`
- `ellipse(cx,cy,rx,ry,c)` and `poly(points,c)`, in pixel-edge coordinates (`ellipse(8,8,8,8)` fills 16×16)
- `rows(x,y,rows,legend)`: hand-placed pixels; `.` skips; an unknown character throws
- `dither(x,y,w,h,c,pattern)`, `speckle(x,y,w,h,c,density,seed)`
- `over(fn)`: draw only on existing art (shading, grain). `under(fn)`: only on empty pixels. `clip(x,y,w,h,fn)`: local origin and clipping. `faded(alpha,fn)`: translucent.
- `outline(c,{diagonal,sides})`, `swap({from:to})`, `each(visit,region)`, `mirrorX()`, `blit(src,x,y,{flipX,map})`, `clone()`, `flippedX()`
- `get(x,y)`, `solid(x,y)`; `hash(x,y,seed)`; `ramp("wood")`

The kit and palette are shared: do not edit them. Put domain helpers in a `_helpers.ts` beside your sprites and say in your report what deserves promoting.
