/**
 * The hospital ward of the opening (decision 0004): a small, warm, slightly old two-bed ward on a
 * morning. PLACEHOLDER LAYOUT built from the cafe's sprites; the real `ward/*` art is drawn to the
 * ids in `docs/design/pixel-contracts.md` and the orchestrator recomposes the visuals later.
 *
 * 14×9 tiles. The back wall fills rows 0–2 with the window centred over the bedside cabinet; the
 * floor is rows 3–7; row 8 is the front wall's cap with the ward door at columns 10–11. The two
 * beds stand head to the wall, the player's on the left, the old man's (老爷爷) on the right.
 *
 * The beds, blankets, the people in them, visitors and the foods are NOT scene props: the game
 * places them at run time from `wardFrame` (`src/world/pixel/ward.ts`), because they change with
 * the story (a flat bed is raised when its occupant sits up, foods leave the cabinet).
 *
 * ## Marks: the contract with the game
 *
 * The game reads only these marks. Keep the names stable; move the points freely when the room is
 * recomposed. Points are tile units (see `engine/types.ts`).
 *
 * | Mark | Meaning |
 * | --- | --- |
 * | `bed/player`, `bed/elder` | Where each bed stands: the bed sprite's anchor, the bottom-centre of the foot end (`ward/bed-*` anchor `[24, 94]`). The bed frame, its blanket and its occupant are all placed from this point with the contract's bed geometry. |
 * | `cabinet` | The bedside cabinet's anchor (bottom-centre). Foods on it sort just in front of it. |
 * | `food/milk`, `food/egg`, `food/bread` | Where each food (`food/<id>`, the content's ward tray) stands on the cabinet top: the food sprite's anchor, its bottom-centre. |
 * | `held` | The food the player holds out, in the hands of the player sitting up in bed: the food sprite's anchor. |
 * | `stand/doctor`, `stand/nurse`, `stand/aunt` | Where each visitor stands while present, with `facing` (the way they look). Feet, like any actor. |
 * | `door` | The ward door, for arrivals and departures (feet, facing into the room). |
 * | `view` | The rectangle (`at` top-left, `size`) the opening's fixed camera always keeps in view; it fits it at the largest integer zoom. Its aspect matches the opening's desktop world panel (6 : 5); phones' 3 : 2 panel fits it by height. It frames the beds, the cabinet, the window and the visitors' marks; the rest of the room shows when the panel has space. |
 */
import { TILE } from "../kit/index.ts";
import { defineScene } from "../engine/index.ts";
import type { Prop, Vec } from "../engine/index.ts";

/** Art pixels to tile units. */
const px = (x: number, y: number): Vec => [x / TILE, y / TILE];

/** The two beds' anchors (foot-end bottom-centre) and the cabinet between their heads. */
const BED_PLAYER: Vec = [5.35, 6.55];
const BED_ELDER: Vec = [8.65, 6.55];
const CABINET: Vec = [7, 4.75];

/**
 * Stand-in furniture and decor, from the cafe's sprites, until the `ward/*` art lands: a drawer
 * table for the bedside cabinet, a water dispenser, a visitor's folding chair, the clock, a plant.
 */
const props: Prop[] = [
  // Back wall: the window over the cabinet, the clock over the player's bed.
  { sprite: "wall/window-lattice", at: px(224, 96) },
  { sprite: "decor/clock", at: [BED_PLAYER[0], 0.95] },
  { sprite: "decor/certificate", at: [BED_ELDER[0], 1.05] },
  // The bedside cabinet between the beds' heads.
  { id: "cabinet", sprite: "furn/table-small", at: CABINET },
  // The old man's side: a thermos on the floor by his bed, a visitor's chair, water, a plant.
  { sprite: "decor/thermos-b", at: [9.75, 4.4] },
  { sprite: "furn/chair-folding-left", at: [10.25, 6.1] },
  { sprite: "furn/water-dispenser", at: [11.95, 3.95] },
  { sprite: "decor/plant-snake", at: [12.55, 4.05] },
  // The player's side: a bin, slippers at the foot of the bed.
  { sprite: "furn/bin", at: [4.0, 4.2] },
  { sprite: "decor/slippers", at: [4.4, 6.95], solid: false },
  { sprite: "tile/mat", at: px(352, 262) },
];

export default defineScene({
  id: "ward",
  size: [14, 9],
  background: "ink",
  legend: {
    "[": "wall/cap-corner-tl", "]": "wall/cap-corner-tr",
    a: "wall/back-a", b: "wall/back-b", c: "wall/back-c", d: "wall/back-d", f: "wall/back-f", h: "wall/back-h",
    E: "wall/back-end-left", R: "wall/back-end-right",
    "(": ["wall/cap-left", "wall/cap-left", "wall/cap-left-b", "wall/cap-left-c"],
    ")": ["wall/cap-right", "wall/cap-right", "wall/cap-right-b", "wall/cap-right-c"],
    "{": "wall/cap-corner-bl", "}": "wall/cap-corner-br", "<": "wall/cap-door-left", ">": "wall/cap-door-right",
    _: ["wall/cap-front", "wall/cap-front", "wall/cap-front-b", "wall/cap-front-c"],
    D: "tile/door-threshold",
  },
  layers: [
    { name: "wall", rows: ["[EabafbcabdhR]"] },
    {
      name: "floor", origin: [1, 3], seed: 11,
      // Worn two-tone linoleum (the kitchen's tiles stand in for it).
      legend: { k: ["tile/floor-kitchen-a", "tile/floor-kitchen-a", "tile/floor-kitchen-a", "tile/floor-kitchen-g", "tile/floor-kitchen-g", "tile/floor-kitchen-a", "tile/floor-kitchen-g", "tile/floor-kitchen-d", "tile/floor-kitchen-d", "tile/floor-kitchen-c"] },
      rows: Array.from({ length: 5 }, () => "kkkkkkkkkkkk"),
    },
    {
      name: "caps", origin: [0, 1],
      rows: [
        ...Array.from({ length: 7 }, () => "(............)"),
        "{________<D.>}",
      ],
    },
  ],
  props,
  lights: [
    // Morning sun through the window, falling across the cabinet onto the old man's bed.
    { kind: "shaft", from: [6.05, 3.0], width: 1.9, length: 3.6, slant: 0.5, strength: 0.45, panes: [3, 2], motes: 6 },
    // Daylight from the corridor at the door, and the room's warm fill.
    { kind: "glow", at: [11, 8.6], radius: 2.6, color: "cream5", strength: 0.35 },
    { kind: "glow", at: [7, 5], radius: 6, color: "gold5", strength: 0.12 },
  ],
  walkable: [1, 3.1, 12, 4.9],
  marks: {
    "bed/player": { at: BED_PLAYER },
    "bed/elder": { at: BED_ELDER },
    cabinet: { at: CABINET },
    // On the cabinet's top (rows dy −43…−25 of the stand-in): the bowl at the back left, the bread
    // at the back right, the eggs in front.
    "food/milk": { at: [CABINET[0] - 9 / TILE, CABINET[1] - 32 / TILE] },
    "food/bread": { at: [CABINET[0] + 9 / TILE, CABINET[1] - 33 / TILE] },
    "food/egg": { at: [CABINET[0], CABINET[1] - 27 / TILE] },
    // In the lap of the player sitting up (the sitting blanket's top edge is bed row 44), held out
    // a little toward the old man.
    held: { at: [BED_PLAYER[0] + 13 / TILE, BED_PLAYER[1] - 46 / TILE] },
    "stand/doctor": { at: [3.85, 6.0], facing: "right" },
    // Between the beds' feet, below the cabinet.
    "stand/nurse": { at: [7, 7.05], facing: "up" },
    "stand/aunt": { at: [3.85, 6.35], facing: "right" },
    door: { at: [11, 8.7], facing: "up" },
    // 8.25 tiles across: whole zoom 2 on a 528px-wide desktop panel at dpr 1; zoom 3 on a phone's
    // wider 3 : 2 panel, which then also shows more of the room on either side.
    view: { at: [2.875, 0.3], size: [8.25, 8.25 * 5 / 6] },
  },
});
