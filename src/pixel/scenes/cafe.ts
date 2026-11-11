/**
 * 早安小馆, the breakfast shop, at about seven in the morning: a Chinese breakfast shop in an old
 * Shanghai French Concession bistro (mosaic floor, panelled walls, a zinc bar, bentwood and marble).
 *
 * 22×14 tiles. The back wall fills rows 0–2; the floor is rows 3–12; row 13 is the front wall's cap
 * with the street door at columns 10–11. The kitchen is the north-east corner (columns 12–20,
 * rows 3–6), fenced by an L-shaped counter: its leg runs down column 11 and its long run along row 7.
 * The waiter collects food on the dining side of the long run.
 */
import { TILE } from "../kit/index.ts";
import { defineScene } from "../engine/index.ts";
import type { Actor, Prop, Vec } from "../engine/index.ts";

/** Art pixels to tile units. Most pieces were designed on the pixel grid, so place them in pixels. */
const px = (x: number, y: number): Vec => [x / TILE, y / TILE];
/** The centre-x of column `c`, and the y of row `r`'s last pixel row: where counter modules anchor. */
const colX = (c: number) => c * TILE + TILE / 2;
const rowBase = (r: number) => r * TILE + TILE - 1;

/** The four dining tables: where each stands, and its two seats. `seat` is where the customer sits. */
export const CAFE_TABLES = [
  { table: 1, at: [3.4, 6.0], stools: [[2.0, 5.85], [4.8, 5.85]], seat: { at: [2.0, 5.85], facing: "right" } },
  { table: 2, at: [7.9, 5.85], stools: [[7.9, 4.45], [7.9, 6.95]], seat: { at: [7.9, 4.45], facing: "down" } },
  { table: 3, at: [4.2, 11.0], stools: [[2.8, 10.85], [5.6, 10.85]], seat: { at: [5.6, 10.85], facing: "left" } },
  { table: 4, at: [15.2, 11.5], stools: [[15.2, 10.15], [15.2, 12.55]], seat: { at: [15.2, 10.15], facing: "down" } },
] as const;

/**
 * Seats, two per table, in table order: bentwood bistro chairs facing the table, with a couple of
 * Chinese stools that crept in over the years. Table 2's back seat is the banquette (`null` here).
 */
const SEATS: readonly (string | null)[] = [
  "furn/chair-bentwood-right", "furn/chair-bentwood-b-left",
  null, "furn/chair-bentwood-b-up",
  "furn/stool-turned", "furn/chair-bentwood-left",
  "furn/chair-bentwood-b-down", "furn/stool-plastic-jade",
];

/**
 * What already stands on each table: its own condiments, and the remains or tea of whoever was
 * there before. Offsets are art pixels from the table's anchor; the top surface spans dy −49…−27.
 * Customers' food is added at run time by the game, which leaves out the leftovers (`remains`): in the
 * game, food on a table always means an order that was served.
 */
const SETTINGS: readonly (readonly [sprite: string, dx: number, dy: number, remains?: "remains"])[][] = [
  [["furn/condiment-set-1", 8, -40], ["furn/bud-vase", -4, -38], ["furn/teapot", 20, -32], ["food/bun", -12, -30, "remains"]],
  [["furn/condiment-set-2", 18, -32], ["food/milk", -2, -29, "remains"], ["furn/teacup", -18, -31]],
  [["furn/condiment-set-3", -16, -40], ["furn/bud-vase", 18, -38], ["food/youtiao", 2, -29, "remains"], ["food/egg", -14, -28, "remains"]],
  [["furn/chopstick-tin", -22, -36], ["furn/chili-jar", -14, -34], ["food/dumpling", 4, -31, "remains"], ["food/soy-dish", 20, -30]],
];

/**
 * A customer sitting at table `table`. A sitter is drawn 4px up on the seat. Someone facing down sits
 * behind the table, so the table covers their lap; side and front sitters draw over its edge.
 */
export function seatedActor(id: string, character: string, table: 1 | 2 | 3 | 4, phase = 0): Actor {
  const t = CAFE_TABLES[table - 1];
  const facing = t.seat.facing;
  return {
    id, sprite: `char/${character}`, at: t.seat.at, facing, action: "sit", offset: [0, -4], phase,
    sortY: facing === "down" ? t.seat.at[1] + 1 / TILE : t.at[1] + 3 / TILE,
  };
}

const COUNTER_ROW = 7, LEG_COL = 11;
const counterY = rowBase(COUNTER_ROW);
/** Things standing on the long counter: their anchors sit one pixel below the counter's. */
const onCounter = (sprite: string, x: number, extra: Partial<Prop> = {}): Prop => ({ sprite, at: px(x, counterY + 1), solid: false, ...extra });
/** Decor whose anchor is its own base, set on the counter top and sorted with the counter. */
const setOnCounter = (sprite: string, x: number, y: number): Prop => ({ sprite, at: px(x, y), solid: false, sortY: (counterY + 2) / TILE });

const kitchen: Prop[] = [
  // The stove line, against the tiled wall.
  { id: "stove", sprite: "kitchen/stove-steamers", at: px(416, 127) },
  { sprite: "fx/steam-a", at: px(408, 61) },
  { sprite: "fx/steam-b", at: px(434, 74), phase: 3 },
  { id: "wok", sprite: "kitchen/wok-station", at: px(480, 127) },
  { id: "soymilk", sprite: "kitchen/soymilk-pot", at: px(533, 127) },
  { sprite: "fx/steam-small", at: px(527, 58) },
  { sprite: "kitchen/sink", at: px(586, 127) },
  { sprite: "kitchen/fridge", at: px(640, 125) },
  // On the wall above it.
  { sprite: "wall/window-vent", at: px(368, 96) },
  { sprite: "kitchen/hood", at: px(416, 40) },
  { sprite: "kitchen/shelf-jars", at: px(480, 46) },
  { sprite: "kitchen/utensil-rail", at: px(540, 38) },
  { sprite: "kitchen/shelf-bowls", at: px(590, 52) },
  { sprite: "decor/calendar", at: px(640, 8) },
  // Stores on the kitchen floor.
  { sprite: "kitchen/flour-sacks", at: px(404, 196) },
  { sprite: "kitchen/crate-veg", at: px(652, 196) },
  // The L-shaped counter: the leg down column 11, the corner, then the long run.
  { sprite: "kitchen/counter-v-top", at: px(colX(LEG_COL), rowBase(3)) },
  { sprite: "kitchen/counter-v-mid", at: px(colX(LEG_COL), rowBase(4)) },
  { sprite: "kitchen/counter-v-mid-b", at: px(colX(LEG_COL), rowBase(5)) },
  { sprite: "kitchen/counter-v-mid", at: px(colX(LEG_COL), rowBase(6)) },
  { sprite: "kitchen/counter-corner", at: px(colX(LEG_COL), counterY) },
  ...(["a", "b", "a", "a", "b", "c", "b", "a"] as const).map((v, i): Prop => ({ sprite: `kitchen/counter-mid-${v}`, at: px(colX(12 + i), counterY) })),
  { sprite: "kitchen/counter-right", at: px(colX(20), counterY) },
  // What stands on it.
  { sprite: "kitchen/order-spike", at: px(370, rowBase(6) + 1), solid: false },
  setOnCounter("decor/radio", 368, 172),
  onCounter("kitchen/steamer-open", 406),
  onCounter("kitchen/steamer-stack", 438),
  onCounter("kitchen/tea-egg-pot", 471),
  { sprite: "fx/steam-small", at: px(470, counterY - 51), phase: 2 },
  setOnCounter("decor/saucer-stack", 506, 223),
  setOnCounter("decor/bell-counter", 524, 223),
  onCounter("kitchen/cash-box", 544),
  setOnCounter("decor/lucky-cat", 574, 220),
  onCounter("kitchen/bowl-stack", 604),
  setOnCounter("decor/thermos-b", 630, 221),
  setOnCounter("decor/thermos-a", 646, 223),
];

const dining: Prop[] = [
  // The dining wall: two bistro windows, the long gilt mirror over the banquette, a globe lamp by the pilaster.
  { sprite: "wall/window-lattice-b", at: px(88, 96) },
  { sprite: "decor/sun-catcher", at: px(88 + 22, 56) },
  { sprite: "wall/window-lattice", at: px(160, 96) },
  { sprite: "wall/mirror-long", at: px(253, 96) },
  { sprite: "wall/lamp-globe", at: px(318, 96) },
  { sprite: "wall/post", at: px(352, 96) },
  // The banquette under the mirror: table 2's back seat.
  { sprite: "furn/banquette-left", at: [6.9, 4.45] },
  { sprite: "furn/banquette-mid", at: [7.9, 4.45] },
  { sprite: "furn/banquette-right", at: [8.9, 4.45] },
  // Tables and their mismatched seats.
  ...CAFE_TABLES.flatMap((t): Prop[] => [
    { id: `table-${t.table}`, sprite: `furn/table-${t.table}`, at: t.at },
    ...t.stools.flatMap((at, i): Prop[] => { const sprite = SEATS[(t.table - 1) * 2 + i]; return sprite ? [{ sprite, at }] : []; }),
    ...SETTINGS[t.table - 1].map(([sprite, dx, dy, remains], i): Prop => ({ ...(remains && { id: `remains/table-${t.table}-${i}` }), sprite, at: [t.at[0] + dx / TILE, t.at[1] + dy / TILE], solid: false, sortY: t.at[1] + 2 / TILE })),
  ]),
  // The gramophone in the corner, a palm by the bar, ferns and the owners' plants, deliveries.
  { sprite: "decor/gramophone", at: [1.75, 3.95] },
  { sprite: "decor/palm-brass", at: [10.35, 3.95] },
  { sprite: "decor/fern-stand", at: [1.6, 12.8] },
  { sprite: "decor/plant-money-tree", at: [20.3, 12.75] },
  { sprite: "decor/plant-bamboo", at: [10.45, 8.1] },
  { sprite: "decor/broom", at: [1.45, 8.4] },
  { sprite: "furn/hat-stand-bentwood", at: [1.55, 10.6] },
  { sprite: "decor/crate-bottles", at: px(652, 306) },
  { sprite: "decor/boxes", at: px(614, 312) },
  { sprite: "decor/rug-runner", at: [13.6, 9.45] },
  { sprite: "decor/ceiling-fan-shadow", at: [6.4, 8.6] },
  // By the door: the easel with the day's board, umbrellas, the owner's slippers, the mat.
  { id: "board", sprite: "decor/easel-board", at: [8.85, 12.85] },
  { sprite: "furn/umbrella-stand", at: [13.3, 12.85] },
  { sprite: "decor/umbrella-wet", at: [13.85, 12.85] },
  { sprite: "decor/slippers", at: [12.55, 12.9], solid: false },
  { sprite: "tile/mat", at: px(352, 414) },
  { sprite: "char/lin-jie/bag", at: [1.35, 6.25], solid: false },
  { sprite: "char/xiao-zhou/backpack", at: [16.1, 10.3], solid: false },
  // Mantou, asleep in the sun under the window.
  { id: "cat", sprite: "decor/cat-sleep", at: [6.7, 7.4], solid: false },
];

export default defineScene({
  id: "cafe",
  size: [22, 14],
  background: "ink",
  legend: {
    // Back wall slices, three tiles tall, and the caps that frame the room.
    "[": "wall/cap-corner-tl", "]": "wall/cap-corner-tr", E: "wall/back-end-left",
    a: "wall/back-a", b: "wall/back-b", c: "wall/back-c", d: "wall/back-d", e: "wall/back-e", f: "wall/back-f", g: "wall/back-g", h: "wall/back-h", i: "wall/back-i",
    K: "wall/back-kitchen-a", L: "wall/back-kitchen-b", M: "wall/back-kitchen-c", N: "wall/back-kitchen-d", O: "wall/back-kitchen-e", R: "wall/back-kitchen-end-right",
    "(": ["wall/cap-left", "wall/cap-left", "wall/cap-left-b", "wall/cap-left-c"],
    ")": ["wall/cap-right", "wall/cap-right", "wall/cap-right-b", "wall/cap-right-c"],
    "{": "wall/cap-corner-bl", "}": "wall/cap-corner-br", "<": "wall/cap-door-left", ">": "wall/cap-door-right",
    _: ["wall/cap-front", "wall/cap-front", "wall/cap-front-b", "wall/cap-front-c"],
    D: "tile/door-threshold",
  },
  layers: [
    { name: "wall", rows: ["[EagbabfaicKMMOOLNKLR]"] },
    {
      name: "floor", origin: [1, 3], seed: 7,
      legend: {
        // Cream mosaic: mostly quiet, with the room's history in a minority of tiles.
        w: ["tile/floor-wood-a", "tile/floor-wood-a", "tile/floor-wood-a", "tile/floor-wood-a", "tile/floor-wood-b", "tile/floor-wood-b", "tile/floor-wood-b", "tile/floor-wood-b", "tile/floor-wood-c", "tile/floor-wood-d"],
        B: "tile/floor-wood-i",
        p: "tile/floor-wood-e", q: "tile/floor-wood-f", S: "tile/floor-wood-h", m: "tile/floor-wood-g",
        k: ["tile/floor-kitchen-a", "tile/floor-kitchen-a", "tile/floor-kitchen-a", "tile/floor-kitchen-b", "tile/floor-kitchen-c", "tile/floor-kitchen-d", "tile/floor-kitchen-f"],
        x: "tile/floor-kitchen-e",
        // The border band along the walls.
        T: "tile/floor-border-corner-tl", h: "tile/floor-border-h", V: "tile/floor-border-v", E: "tile/floor-border-v-e",
        L: "tile/floor-border-corner-bl", R: "tile/floor-border-corner-br", s: "tile/floor-border-h-s",
      },
      rows: [
        "Thhhhhhhhhhkkkkkkkkk",
        "VwwwSwwwwwwkkkkkkkkk",
        "Vwwwwwwwwwwkkkkxkkkk",
        "Vwwwwwwwwwwkkkkkkkkk",
        "Vwwwwwwwwwwwwwwwwwww",
        "mwwwwwwwwwwwwwwwwwwE",
        "VwwwwwwwwpwwwwwwwwwE",
        "VwwwwwwwwqwwwwBwwwwE",
        "VwwwwwwwwpwwwwwwwwwE",
        "LssssssssqpssssssssR",
      ],
    },
    {
      name: "caps", origin: [0, 1],
      rows: [
        ...Array.from({ length: 12 }, () => "(....................)"),
        "{________<D.>________}",
      ],
    },
  ],
  props: [...dining, ...kitchen],
  lights: [
    // Morning sun through the two lattice windows.
    { kind: "shaft", from: [1.95, 3.0], width: 1.75, length: 4.2, slant: 0.5, strength: 0.5, panes: [3, 2], motes: 7 },
    { kind: "shaft", from: [4.2, 3.0], width: 1.75, length: 4.2, slant: 0.5, strength: 0.5, panes: [3, 2], motes: 7 },
    // Daylight spilling in at the street door.
    { kind: "glow", at: [11, 13.4], radius: 3.4, color: "cream5", strength: 0.5, phases: ["morning", "midday"] },
    // The stove's coals, the lantern, the warm kitchen.
    { kind: "glow", at: [13, 4.3], radius: 1.8, color: "orange3", strength: 0.35, flicker: 0.3 },
    { kind: "glow", at: [9.94, 2.4], radius: 2.0, color: "gold4", strength: 0.3, flicker: 0.05 },
    { kind: "glow", at: [16, 5], radius: 6, color: "gold5", strength: 0.18 },
    // After dark the dining room is lit by pendant lamps over the tables (above the camera) and the
    // wall globe turned up: warm pools on each table so the room never goes flat blue.
    { kind: "glow", at: [3.4, 5.4], radius: 2.4, color: "gold4", strength: 0.5, phases: ["evening", "night"] },
    { kind: "glow", at: [7.9, 5.3], radius: 2.4, color: "gold4", strength: 0.5, phases: ["evening", "night"] },
    { kind: "glow", at: [4.2, 10.4], radius: 2.4, color: "gold4", strength: 0.5, phases: ["evening", "night"] },
    { kind: "glow", at: [15.2, 10.9], radius: 2.4, color: "gold4", strength: 0.45, phases: ["evening", "night"] },
    { kind: "glow", at: [9.94, 2.6], radius: 3.2, color: "gold4", strength: 0.45, phases: ["night"] },
  ],
  walkable: [1, 3.1, 20, 9.9],
  marks: {
    door: { at: [11, 12.7], facing: "up" },
    pickup: { at: [15.5, 8.5], facing: "up" },
    "sign/board": { at: [8.85 - 10 / TILE, 12.85 - 50 / TILE], size: [20 / TILE, 28 / TILE] },
    ...Object.fromEntries(CAFE_TABLES.map((t) => [`seat/table-${t.table}`, t.seat])),
    ...Object.fromEntries(CAFE_TABLES.map((t) => [`table/${t.table}`, { at: t.at }])),
  },
  // The morning's regulars, for tools and screenshots. The game supplies its own cast from state.
  actors: [
    { id: "waiter", sprite: "char/player", at: [12.9, 9.25], facing: "left", action: "carry-idle" },
    { id: "cook", sprite: "char/cook", at: [14.2, 5.7], facing: "down", action: "work" },
    seatedActor("lin-jie", "lin-jie", 1),
    seatedActor("zhang-laoshi", "zhang-laoshi", 2, 1),
    seatedActor("xiao-li", "xiao-li", 3, 2),
    seatedActor("xiao-zhou", "xiao-zhou", 4, 3),
  ],
});
