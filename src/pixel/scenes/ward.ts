/**
 * The hospital ward of the opening (decision 0004): a small, warm, slightly old two-bed ward on a
 * morning. Cream plaster over a jade wainscot, terrazzo underfoot, sun through the one window
 * falling across the bedside cabinet. The player's bed is on the left, the old man's (老爷爷) on
 * the right, each under its own oxygen-and-sockets rail; the cabinet stands between their heads.
 *
 * 14×9 tiles. Back wall rows 0–2 (door at the far left, clock, the two service rails, the window
 * over the cabinet, the noticeboard); floor rows 3–7 with the terrazzo's green border band; row 8
 * the front wall's cap.
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
 * | `food/milk`, `food/egg`, `food/bread` | Where each food (`food/<id>`, the content's ward tray) stands on the cabinet top: the food sprite's anchor, its bottom-centre (`CABINET_TOP` in `sprites/ward/_furn.ts`). |
 * | `held` | The food the player holds out, in the hands of the player sitting up in bed: the food sprite's anchor. |
 * | `stand/doctor`, `stand/nurse`, `stand/aunt` | Where each visitor stands while present, with `facing` (the way they look). Feet, like any actor. The doctor and the nurse are present together; the aunt comes later, alone. |
 * | `door` | The ward door, for arrivals and departures (feet, facing into the room). |
 * | `view` | The rectangle (`at` top-left, `size`) the opening's fixed camera always keeps in view; it fits it at the largest integer zoom. Its aspect matches the opening's desktop world panel (6 : 5); phones' 3 : 2 panel fits it by height. |
 */
import { TILE } from "../kit/index.ts";
import { defineScene } from "../engine/index.ts";
import type { Prop, Vec } from "../engine/index.ts";

/** Art pixels to tile units. */
const px = (x: number, y: number): Vec => [x / TILE, y / TILE];

/** The two beds' anchors (foot-end bottom-centre), each centred under its service rail pair. */
const BED_PLAYER: Vec = [5, 6.6];
const BED_ELDER: Vec = [10, 6.6];
/** The bedside cabinet between the beds' heads, under the window. */
const CABINET: Vec = [7.5, 4.3];
/** `CABINET_TOP` slots from `sprites/ward/_furn.ts`, art px from the cabinet's anchor. */
const onCabinet = (dx: number, dy: number): Vec => [CABINET[0] + dx / TILE, CABINET[1] + dy / TILE];

/** Things standing on the overbed table by the old man's bed (its clear top is dx −18…16, dy −55…−45). */
const TABLE: Vec = [11.55, 6.5];
const onTable = (dx: number, dy: number, sprite: string, rank: number): Prop => ({
  sprite, at: [TABLE[0] + dx / TILE, TABLE[1] + dy / TILE], solid: false, sortY: TABLE[1] + rank / TILE,
});

const props: Prop[] = [
  // Back wall: the door at the far left, the clock, the nurse call by the player's head, the
  // window over the cabinet with the radiator under it, the noticeboard at the right.
  { sprite: "ward/door", at: px(56, 96) },
  { sprite: "ward/clock", at: px(102, 96) },
  { sprite: "ward/nurse-call", at: px(184, 96) },
  { sprite: "ward/window", at: px(240, 96) },
  { sprite: "ward/radiator", at: px(240, 101) },
  { sprite: "ward/noticeboard", at: px(372, 96) },
  // Curtains pushed back against the wall at each bay's outer side.
  { sprite: "ward/curtain-side-gathered", at: px(116, 99) },
  { sprite: "ward/curtain-side-gathered", at: px(364, 99), flipX: true },
  // Between the beds' heads: the cabinet (foods are placed by the game), the elder's thermos on the floor.
  { id: "cabinet", sprite: "ward/cabinet", at: CABINET },
  { sprite: "ward/thermos", at: [6.5, 4.4] },
  // The old man's side: the drip and the old monitor by his head, his overbed table with the
  // oranges his daughter brought and a few flowers, a visitor's chair.
  { sprite: "ward/monitor", at: [11.3, 4.0] },
  { sprite: "ward/iv-stand", at: [8.85, 4.75] },
  { sprite: "ward/overbed-table", at: TABLE },
  onTable(-8, -47, "ward/flowers", 1),
  onTable(8, -46, "ward/oranges", 2),
  { sprite: "ward/visitor-chair", at: [12.35, 7.3] },
  // The player's side: slippers by the bed, a bin by the door, the folded wheelchair waiting in the corner.
  { sprite: "ward/slippers", at: [5.95, 7.15], solid: false },
  { sprite: "ward/bin", at: [3.3, 3.8] },
  { sprite: "ward/wheelchair", at: [2.0, 7.55] },
];

export default defineScene({
  id: "ward",
  size: [14, 9],
  background: "ink",
  legend: {
    "[": "ward/cap-corner-tl", "]": "ward/cap-corner-tr",
    a: "ward/wall-a", b: "ward/wall-b", c: "ward/wall-c", d: "ward/wall-d", s: "ward/wall-scuff", p: "ward/wall-peel",
    O: "ward/wall-oxygen", S: "ward/wall-sockets", Q: "ward/wall-oxygen-b", T: "ward/wall-sockets-b",
    E: "ward/wall-end-left", R: "ward/wall-end-right",
    "(": ["ward/cap-left", "ward/cap-left", "ward/cap-left-b", "ward/cap-left-c"],
    ")": ["ward/cap-right", "ward/cap-right", "ward/cap-right-b", "ward/cap-right-c"],
    "{": "ward/cap-corner-bl", "}": "ward/cap-corner-br",
    _: ["ward/cap-front", "ward/cap-front", "ward/cap-front-b", "ward/cap-front-c"],
  },
  layers: [
    // Service rails over cols 4–5 (player) and 9–10 (elder); the window covers cols 6–8.
    { name: "wall", rows: ["[EcaOSbabQTpR]"] },
    {
      name: "floor", origin: [1, 3], seed: 5,
      legend: {
        "1": "ward/floor-edge-nw", "2": "ward/floor-edge-ne", "3": "ward/floor-edge-sw", "4": "ward/floor-edge-se",
        N: "ward/floor-edge-n", Z: "ward/floor-edge-s", L: "ward/floor-edge-w", G: "ward/floor-edge-e",
        f: ["ward/floor-a", "ward/floor-a", "ward/floor-a", "ward/floor-a", "ward/floor-b", "ward/floor-b", "ward/floor-b", "ward/floor-c", "ward/floor-c"],
        v: "ward/floor-path-v", h: "ward/floor-path-h", x: "ward/floor-path-x",
        m: "ward/floor-damp-a", M: "ward/floor-damp-b",
        D: "ward/floor-d", C: "ward/floor-crack", P: "ward/floor-patch",
      },
      rows: [
        "1NNNNNNNNNN2",
        "LvffffmMfffG",
        "LvfffDfffCfG",
        "LxhhhhhhhhfG",
        "3ZZZZZZZZZZ4",
      ],
    },
    {
      name: "caps", origin: [0, 1],
      rows: [
        ...Array.from({ length: 7 }, () => "(............)"),
        "{____________}",
      ],
    },
  ],
  props,
  lights: [
    // Morning sun through the window (glass x 5–90 of the 96 px window at x 192), across the cabinet.
    { kind: "shaft", from: [197 / TILE, 3.0], width: 2.65, length: 4, slant: 0.5, strength: 0.5, panes: [3, 2], motes: 6 },
    // Cool corridor light at the door, and the room's warm fill.
    { kind: "glow", at: [1.75, 3.3], radius: 2, color: "blue6", strength: 0.25 },
    { kind: "glow", at: [7.5, 5], radius: 6, color: "gold5", strength: 0.1 },
  ],
  walkable: [1, 3.1, 12, 4.9],
  marks: {
    "bed/player": { at: BED_PLAYER },
    "bed/elder": { at: BED_ELDER },
    cabinet: { at: CABINET },
    "food/milk": { at: onCabinet(-10, -45) },
    "food/bread": { at: onCabinet(9, -44) },
    "food/egg": { at: onCabinet(0, -35) },
    // In the lap of the player sitting up (the sitting blanket's top edge is bed row 44), held out
    // a little toward the old man.
    held: { at: [BED_PLAYER[0] + 12 / TILE, BED_PLAYER[1] - 47 / TILE] },
    // The doctor at the player's left, the nurse between the beds; later the aunt between the beds.
    "stand/doctor": { at: [3.95, 6.0], facing: "right" },
    "stand/nurse": { at: [6.65, 6.35], facing: "left" },
    "stand/aunt": { at: [6.65, 6.2], facing: "left" },
    door: { at: [1.75, 3.25], facing: "down" },
    // 8.25 tiles across: whole zoom 2 on a 528px-wide desktop panel at dpr 1; zoom 3 on a phone's
    // wider 3 : 2 panel, which then also shows more of the room on either side.
    view: { at: [3.3, 0.6], size: [8.25, 8.25 * 5 / 6] },
  },
});
