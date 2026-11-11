---
title: Pixel art style bible
created: 2026-11-09
status: draft
tags: [design, art, pixel]
---

# Pixel art style bible

The bar is Stardew Valley or better: hand-finished, warm, dense with small true details, readable at a glance. This document is binding for every sprite. The reference sprites live in `src/pixel/sprites/exemplar/exemplar.ts`; render them first, then beat them.

## Nothing generic

Callum's first note on the first reference image, at half today's resolution: **"I want more detail. It's too generic. Give me some personality on the characters, as well as the chairs, tables etc."** That note now governs everything. We doubled the resolution to make room for it; use the room.

- **Draw a specific thing, not a category.** Not "a table": the corner table whose drawer never shuts, with a tea ring and a folded card under the short leg. Not "a stool": the one with the blue check cushion somebody's grandmother tied on. Before drawing, decide who owns it, how old it is, what happened to it and what it is made of, and put the answers in the sprite's doc comment in a line or two.
- **No two alike.** Four tables are four different tables. Seats are mismatched the way a real shop's are: a turned stool, a bamboo one, a repainted chair, a plastic one. Variants differ in design, not in one moved pixel.
- **Spend the pixels.** Wood has grain, joinery, pegs and worn edges. Cloth has a weave or a print and folds. Metal has dents and a reflection of the room. Painted things chip to show what is underneath. Ceramic has a glaze highlight and a pattern. A flat fill wider than about eight pixels is unfinished unless it is deliberately calm ground.
- **People are people.** Each character is recognisable from any side by silhouette, and carries at least three things that say who they are: a hair shape, a signature object, a way of standing or sitting. Faces have brows, a mouth with an expression, cheeks, ears. Clothes have collars, buttons, pockets, hems, creases, patterns.
- **Layer the detail.** Read first as a clear silhouette and three big tones; reward a closer look with the small true things. Detail must never turn into noise: if it does not read at 3× zoom as *something*, it is clutter.

## References

Callum's references (2026-11-11). Each one names the trait we take, not the whole game.

- **Eastward: colour and light.** Saturated warm light against cool, *coloured* shadows (teal, plum; never neutral grey). Highlights glow. Every time of day has a mood: morning gold, evening amber with long violet shadows, night deep blue with warm windows. Environments are dense with small true detail.
- **Sea of Stars: characters and animation.** More frames where it matters (walk 6–8, idles with a habit), squash and stretch on steps and gestures, secondary motion (hair, hems, held things lag and settle), expressive faces.
- **Kynseed: hair.** Hair is soft clumps with a gentle gradient, a few bright strand highlights and a lumpy silhouette, never a flat helmet.
- **Stardew Valley: readability.** The cosy, readable baseline: clear silhouettes, warm palette, nothing fighting the player.
- **Coffee Talk: long dialogue.** For long conversations, large character portraits beside the text in a calm visual-novel frame, with expressions that change per line; the world stays visible behind, dimmed.
- **Owlboy: high-res pixel art.** Pixel density, smooth ramps and rich shading where the camera is close. That density belongs in the dialogue portraits and close-ups. The world keeps its 32px tile so it stays readable at play zoom.

## How art is made here

Art is code. A sprite is a function that draws palette colours into a `Px` canvas (`src/pixel/kit`). There are no image files: the game bakes sprites at start-up, and Node renders the same code to PNG so you can look at it.

```bash
# every sprite whose id contains "furn/", 8× zoom, on a neutral ground
node src/pixel/tools/sheet.ts furn/ --scale 5
# in context, true relative scale, with contact shadows
node src/pixel/tools/compose.ts --size 352x240 --floor ex/floor-wood-a,ex/floor-wood-b,ex/floor-wood-c,ex/floor-wood-d --wall ex/wall \
  "ex/table@112,176" "ex/stool@56,180" "ex/waiter@190,224" --scale 3 --out output/pixel/try.png
```

Then open the PNG with the Read tool and look at it. **Looking is the job.** Nobody ships a sprite they have not viewed at 5× or more and at 2–3×, alone and composed on the floor next to the waiter and a table.

The loop for every sprite: block the silhouette → form shading → material texture → story detail → outline → look → fix what is wrong → look again. Expect four or more passes on anything that matters. When a piece is weak, redraw it; do not polish a bad silhouette.

Use primitives (`rect`, `ellipse`, `poly`, `line`) for big forms and `rows()` (hand-placed pixels, one character per pixel) for everything small, organic or characterful: faces, hands, food, leaves, handles, corners. Most good sprites end with hand-placed pixels.

## The camera

Three-quarter top-down, like Stardew Valley. The camera looks north and slightly down.

- You see the **top** and the **front (south) face** of every object. Never the sides, never diagonals, never isometric.
- Tops are foreshortened to about 60–70% of their true depth. Front faces are drawn at full height.
- The back wall of a room is drawn face-on, three tiles (96px) tall. Side and front walls show only their caps.
- Things further north are drawn first; an object hides what stands behind it.

## Scale

| Thing | Size in art pixels |
| --- | --- |
| World tile | 32 × 32 |
| Person | 32 × 64 frame, feet near the bottom, about 54 tall; head about 22 wide and 24 tall with hair (see `ex/waiter`) |
| Dining table (seats 2–4) | about 64 × 57 (see `ex/table`) |
| Stool | about 28 × 31 (see `ex/stool`) |
| Counter | 32 wide modules; about 22 of top over a 30 front = about 52 tall |
| Tall appliance, shelf unit | 32–64 wide, 72–88 tall |
| Back wall | 96 tall: 10 cap and cornice, 52 plaster, 26 dado, 8 skirting (see `ex/wall`) |
| Plate or bowl on a table | about 20 × 14 |
| Food hero icon (interface) | 48 × 48 |

A standing person's waist is level with a table top. Counters come to mid-chest. Check new work against `ex/waiter` in a compose render.

## Light

Morning sun from the **upper left**.

- Top faces are the lightest plane, front faces a step or two darker, undersides and right edges darkest.
- Put a highlight along top and left edges, a shade along bottom and right edges.
- Step along a ramp to shade. The ramps already shift hue (shadows cooler and plum, lights warmer and yellow). Never darken by mixing in grey or black.
- Each material uses three to five tones. Fewer looks flat; more looks muddy.
- **Do not draw ground shadows.** Declare `shadow` on the sprite and the renderer draws a soft contact shadow. Do draw occlusion inside the object (under a table top, inside a bowl).
- **The renderer grades every frame per day phase** (`src/pixel/engine/grade.ts`, ticket 0180, the Eastward pass): shade pushed towards teal or plum, highlights towards gold, a saturation lift in the mids, ambient that darkens towards a coloured floor instead of black, long violet contact shadows at evening, and a warm halo round small glows after dark. Draw for a bright, clear midday and do not pre-tint sprites for a mood; judge art with `render-scene --no-grade` as well as graded. The grade never carries a colour towards the UI vermilion.

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
9. **Readable in play.** The game shows art at about 2× zoom on a desktop (a tile is roughly 64 screen pixels); a one-pixel detail must carry by contrast or be two pixels.

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
    w: 28, h: 31,
    anchor: [14, 30],             // the pixel that touches the ground at the object's position
    foot: [-10, -12, 20, 11],     // solid footprint, px relative to the anchor: [dx, dy, w, h]
    shadow: { rx: 13, ry: 5 },    // contact shadow ellipse centred on the anchor
    draw: (p) => { /* … */ },
  },
});
```

- Ids are `domain/name`: `tile/`, `wall/`, `kitchen/`, `furn/`, `decor/`, `food/`, `char/`, `fx/`.
- One file per small family, in `src/pixel/sprites/<domain>/`. Files starting with `_` are private helpers and are not loaded as sprite sets.
- `layer: "floor"` for anything flat that people walk over or that is painted on a wall (tiles, rugs, windows, shelves, wall decor). Default `object` is depth-sorted against people. `over` hangs above everyone (lantern, lamp shade, door lintel).
- Animated sprites set `frames` and `fps`; `draw(p, frame)` draws one frame. Loops must be seamless. Idle life is slow: 2–6 fps.
- Tiles are 32×32 and must repeat seamlessly; check with `sheet.ts --tile`.
- Translucent pixels (glass, steam, light) use `p.faded(alpha, …)`. Solid art never does.
- Sprites are deterministic. Use `hash()` for placement variety, never `Math.random` or time.

### Characters

Ids are `char/<who>/<action>-<dir>` with `dir` in `down | up | left | right`.

| Action | Frames | Notes |
| --- | --- | --- |
| `idle` | 2–4 at 2–3 fps | a breath; a blink or a small habit is welcome |
| `walk` | 4 or 6, a full cycle in about 0.6 s | contact, (down,) pass, contact, (down,) pass; arms counter-swing, a head bob |
| `sit` | 1–2 | seated on a stool; legs foreshortened |
| `carry-idle`, `carry-walk` | as above | waiter only: both hands on the tray; the food on it is drawn separately from game state (`food/tray-*`, placed by `trayActors` in `src/world/pixel/cafe.ts`) |

Frames are 32×64 with anchor `[16, 62]`, `foot: [-8, -8, 16, 8]`, `shadow: { rx: 11, ry: 4 }`. `left` may be the mirror of `right` unless the character is asymmetric. Proportions follow `ex/waiter`: a big head (about 22 wide, 24 tall with hair), eyes two wide and three tall with a catch-light, a body about 20 wide with the arms, short legs.

## The room everyone is drawing for

早安小馆, a neighbourhood breakfast shop at about seven in the morning, in an old **Shanghai French Concession** building. Callum's note, 2026-11-10: "I'd like the cafe to have a French bistro style to it." So: a 1930s Shanghai bistro that serves Chinese breakfast. Paris bones, Shanghai life: the architecture and furniture speak bistro, the food, the people, the clutter and the habits are a Chinese neighbourhood breakfast shop. About 18 tiles wide and 10 deep.

- **Back wall** (north): cream plaster over dark-stained **wood panelling** (raised panels, a moulded rail); a long **bevelled mirror** in a gilt frame on the dining side with a few faded spots in the silvering; two tall arched or transomed windows with fine glazing bars; **globe lamps** on brass brackets; a tall blank menu board in a black frame. On the kitchen side: white **metro tiles** with a black trim course, shelves of bowls and jars, a range hood.
- **Floor**: dining room in small **black-and-white (cream and ink) hexagon or octagon-and-dot mosaic**, with a border band where it meets the walls, worn and a little yellowed, a few tiles cracked or replaced; the kitchen floor in plainer square tiles.
- **Service counter**: a bistro bar: **dark polished wood** front with raised panels and a **brass foot rail**, a **zinc or white marble top**; on it the Chinese breakfast business (steamers, tea eggs, a cash box, the lucky cat) plus a brass bell and a stack of saucers.
- **Kitchen** (north-east, behind the counter): unchanged in spirit. Bamboo steamers, the wok, the soy-milk vat, sink and fridge.
- **Dining room**: **round marble-topped bistro tables on black cast-iron pedestal bases**, a long **banquette** in worn oxblood or bottle-green leather along one wall with small tables in front, and **bentwood chairs** (the classic curved-back café chair) in four facings, mismatched with the odd Chinese stool that has crept in. Table settings stay Chinese: chopstick tins, vinegar, chili oil, a blue-and-white teapot.
- **Front** (south): the wall cap with a glazed double door, a striped awning edge seen from inside, daylight spilling in; a hat stand, an umbrella stand.
- **Life**: potted palms and ferns in brass and ceramic pots, a ceiling fan's shadow, a gramophone or old radio, a blank enamel advertising sign, a cat asleep in a sun patch, a wall calendar, red paper accents kept rare.

Colour: keep the warm palette; the bistro adds deep wood (`wood1`–`wood3`, `rose1`–`rose3`), brass (`gold1`–`gold4`), marble and zinc (`cream5`/`white`/`stone4`–`stone5`, `steel3`–`steel6`), bottle green (`jade1`–`jade3`) and oxblood (`rose2`–`rose3`). The vermilion rule still holds: red stays rare.

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
