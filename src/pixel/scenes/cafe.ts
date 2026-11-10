/**
 * 早安小馆, the breakfast shop, at about seven in the morning.
 *
 * 22×14 tiles. The back wall fills rows 0–2; the floor is rows 3–12; row 13 is the front wall's cap
 * with the street door at columns 10–11. The kitchen is the north-east corner (columns 12–20,
 * rows 3–6), fenced by an L-shaped counter: its leg runs down column 11 and its long run along row 7.
 * The waiter collects food on the dining side of the long run.
 */
import { TILE } from "../kit/index.ts";
import { defineScene } from "../engine/index.ts";
import type { Prop, Vec } from "../engine/index.ts";

/** Art pixels to tile units. Most pieces were designed on the pixel grid, so place them in pixels. */
const px = (x: number, y: number): Vec => [x / TILE, y / TILE];
/** The centre-x of column `c`, and the y of row `r`'s last pixel row: where counter modules anchor. */
const colX = (c: number) => c * TILE + TILE / 2;
const rowBase = (r: number) => r * TILE + TILE - 1;

/** The four dining tables: where each stands, and its two seats. `seat` is where the customer sits. */
export const CAFE_TABLES = [
  { table: 1, at: [3.4, 6.0], stools: [[2.0, 5.85], [4.8, 5.85]], seat: { at: [2.0, 5.85], facing: "right" } },
  { table: 2, at: [7.9, 6.3], stools: [[7.9, 4.95], [7.9, 7.35]], seat: { at: [7.9, 4.95], facing: "down" } },
  { table: 3, at: [4.2, 11.0], stools: [[2.8, 10.85], [5.6, 10.85]], seat: { at: [5.6, 10.85], facing: "left" } },
  { table: 4, at: [15.2, 11.5], stools: [[15.2, 10.15], [15.2, 12.55]], seat: { at: [15.2, 10.15], facing: "down" } },
] as const;

/** Mismatched seats, two per table, in table order. */
const SEATS = ["furn/stool-turned", "furn/stool-bamboo", "furn/stool-plastic", "furn/stool-square", "furn/stool-plastic-jade", "furn/stool-bamboo", "furn/stool-turned", "furn/stool-plastic"];

/**
 * What already stands on each table: its own condiments, and the remains or tea of whoever was
 * there before. Offsets are art pixels from the table's anchor; the top surface spans dy −49…−27.
 * Customers' food is added at run time by the game.
 */
const SETTINGS: readonly (readonly [sprite: string, dx: number, dy: number])[][] = [
  [["furn/condiment-set-1", -18, -32], ["furn/teapot", 14, -36], ["furn/teacup", 22, -29]],
  [["furn/condiment-set-2", 14, -34], ["furn/teacup-empty", -14, -31]],
  [["furn/condiment-set-3", -16, -32], ["furn/menu-stand", 16, -36], ["food/bowl-empty", 4, -28]],
  [["furn/chopstick-tin", -20, -32], ["furn/vinegar-bottle", -12, -33], ["furn/chili-jar", -4, -31], ["furn/teacup-empty", 18, -30]],
];

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
  ...(["a", "b", "c", "a", "b", "a", "c", "b"] as const).map((v, i): Prop => ({ sprite: `kitchen/counter-mid-${v}`, at: px(colX(12 + i), counterY) })),
  { sprite: "kitchen/counter-right", at: px(colX(20), counterY) },
  // What stands on it.
  { sprite: "kitchen/order-spike", at: px(370, rowBase(6) + 1), solid: false },
  setOnCounter("decor/radio", 368, 172),
  onCounter("kitchen/steamer-open", 406),
  onCounter("kitchen/steamer-stack", 438),
  onCounter("kitchen/tea-egg-pot", 471),
  { sprite: "fx/steam-small", at: px(470, counterY - 51), phase: 2 },
  onCounter("kitchen/tray-stack", 508),
  onCounter("kitchen/cash-box", 544),
  setOnCounter("decor/lucky-cat", 574, 220),
  onCounter("kitchen/bowl-stack", 604),
  setOnCounter("decor/thermos-b", 630, 221),
  setOnCounter("decor/thermos-a", 646, 223),
];

const dining: Prop[] = [
  // On the dining wall: a scroll, the two windows with the day's board between them, the clock, a lantern by the post.
  { sprite: "decor/scroll-landscape", at: px(47, 12) },
  { sprite: "wall/window-lattice-b", at: px(96, 96) },
  { id: "board", sprite: "decor/chalkboard", at: px(168, 14) },
  { sprite: "wall/window-lattice", at: px(240, 96) },
  { sprite: "decor/clock", at: px(292, 16) },
  { sprite: "wall/post", at: px(352, 96) },
  { sprite: "decor/lantern-red", at: px(322, 4) },
  // Tables and their mismatched seats.
  ...CAFE_TABLES.flatMap((t): Prop[] => [
    { id: `table-${t.table}`, sprite: `furn/table-${t.table}`, at: t.at },
    ...t.stools.map((at, i): Prop => ({ sprite: SEATS[(t.table - 1) * 2 + i], at })),
    ...SETTINGS[t.table - 1].map(([sprite, dx, dy]): Prop => ({ sprite, at: [t.at[0] + dx / TILE, t.at[1] + dy / TILE], solid: false, sortY: t.at[1] + 2 / TILE })),
  ]),
  // Plants, deliveries, the broom, the runner in front of the pass.
  { sprite: "decor/plant-rubber", at: [1.65, 3.75] },
  { sprite: "decor/plant-bamboo", at: [10.45, 8.1] },
  { sprite: "decor/plant-snake", at: [1.6, 12.75] },
  { sprite: "decor/plant-money-tree", at: [20.3, 12.75] },
  { sprite: "decor/broom", at: [1.45, 8.4] },
  { sprite: "decor/crate-bottles", at: px(652, 306) },
  { sprite: "decor/boxes", at: px(614, 312) },
  { sprite: "decor/rug-runner", at: [13.6, 9.45] },
  { sprite: "furn/sideboard", at: [5.25, 3.6] },
  { sprite: "furn/water-dispenser", at: [9.15, 3.6] },
  { sprite: "furn/coat-rack", at: [1.55, 10.4] },
  { sprite: "furn/umbrella-stand", at: [13.3, 12.85] },
  { sprite: "tile/mat", at: px(352, 414) },
  { sprite: "decor/slippers", at: [12.55, 12.9], solid: false },
  { sprite: "decor/umbrella-wet", at: [13.85, 12.85] },
  { sprite: "decor/sun-catcher", at: px(240 + 26, 56) },
  // Mantou, asleep in the sun under the window.
  { id: "cat", sprite: "decor/cat-sleep", at: [6.05, 4.75], solid: false },
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
        // Oak boards: mostly quiet, with the room's history in a minority of tiles.
        w: ["tile/floor-wood-a", "tile/floor-wood-a", "tile/floor-wood-a", "tile/floor-wood-a", "tile/floor-wood-b", "tile/floor-wood-b", "tile/floor-wood-b", "tile/floor-wood-b", "tile/floor-wood-c", "tile/floor-wood-c", "tile/floor-wood-d", "tile/floor-wood-i"],
        p: "tile/floor-wood-e", q: "tile/floor-wood-f", s: "tile/floor-wood-h", m: "tile/floor-wood-g",
        k: ["tile/floor-kitchen-a", "tile/floor-kitchen-a", "tile/floor-kitchen-a", "tile/floor-kitchen-b", "tile/floor-kitchen-c", "tile/floor-kitchen-d", "tile/floor-kitchen-f"],
        x: "tile/floor-kitchen-e",
      },
      rows: [
        "wwwwwwwwwwwkkkkkkkkk",
        "wwwwswwwwwwkkkkkkkkk",
        "wwwwwwwwwwwkkkkxkkkk",
        "wwwwwwwwwwwkkkkkkkkk",
        "wwwwwwwwwwwwwwwwwwww",
        "mwwwwwwwwwwwwwwwwwww",
        "wwwwwwwwwpwwwwwwwwww",
        "wwwwwwwwwqwwwwwwwwww",
        "wwwwwwwwwpwwwwwwwwww",
        "wwwwwwwwwqwwwwwwwwww",
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
    { kind: "shaft", from: [2.1, 3.0], width: 1.9, length: 4.2, slant: 0.5, strength: 0.5, panes: [4, 2], motes: 7 },
    { kind: "shaft", from: [6.6, 3.0], width: 1.9, length: 4.2, slant: 0.5, strength: 0.5, panes: [4, 2], motes: 7 },
    // Daylight spilling in at the street door.
    { kind: "glow", at: [11, 13.4], radius: 3.4, color: "cream5", strength: 0.5, phases: ["morning", "midday"] },
    // The stove's coals, the lantern, the warm kitchen.
    { kind: "glow", at: [13, 4.3], radius: 1.8, color: "orange3", strength: 0.35, flicker: 0.3 },
    { kind: "glow", at: [10.06, 1.3], radius: 2.2, color: "red5", strength: 0.3, flicker: 0.1 },
    { kind: "glow", at: [16, 5], radius: 6, color: "gold5", strength: 0.18 },
  ],
  walkable: [1, 3.1, 20, 9.9],
  marks: {
    door: { at: [11, 12.7], facing: "up" },
    pickup: { at: [15.5, 8.5], facing: "up" },
    "sign/board": { at: px(168 - 18, 14 + 8), size: [36 / TILE, 25 / TILE] },
    ...Object.fromEntries(CAFE_TABLES.map((t) => [`seat/table-${t.table}`, t.seat])),
    ...Object.fromEntries(CAFE_TABLES.map((t) => [`table/${t.table}`, { at: t.at }])),
  },
  actors: [{ id: "waiter", sprite: "char/player", at: [17.2, 9.5], facing: "down", action: "idle" }],
});
