/**
 * The residential hall's and the apartment's floors (ticket 0202) as a tile table for
 * `specGroundLayers`, in the `GroundMaterialSpec` format of `ground-courtyard-legend.ts`. Sprites:
 * `src/pixel/sprites/ground/residential.ts`.
 *
 * Materials: `terrazzo` (the hall's 1930s floor and the apartment's entry), `timber` (parquet laid in a
 * basket weave), `woven` (rush matting: the hall runner and the door mats), `glazed-tile` (kitchen and
 * bathroom). Edges: a brass strip where terrazzo meets another floor, a marble lip round the glazed
 * tile, a cloth binding round the matting (corners where two sides meet). Timber takes nothing.
 */
import type { GroundEdgeRule, GroundMaterialSpec } from "./ground-courtyard-legend.ts";

const SIDES = ["n", "s", "w", "e"] as const;
const CORNERS = ["nw", "ne", "sw", "se"] as const;
const sidesOf = (prefix: string) => Object.fromEntries(SIDES.map((s) => [s, [`${prefix}-${s}`]])) as unknown as GroundEdgeRule["sides"];
const cornersOf = (prefix: string) => Object.fromEntries(CORNERS.map((c) => [c, `${prefix}-${c}`])) as unknown as NonNullable<GroundEdgeRule["corners"]>["ids"];

/** What lies past the rooms' walls: dark, unseen. */
export const RESIDENTIAL_FILL = "residential-dark";

export const RESIDENTIAL_GROUND: Readonly<Record<string, GroundMaterialSpec>> = {
  [RESIDENTIAL_FILL]: { base: [["ground/residential-dark-a", 8], ["ground/residential-dark-b", 1]], edges: [] },
  terrazzo: {
    base: [["ground/terrazzo-a", 8], ["ground/terrazzo-b", 8], ["ground/terrazzo-c", 1], ["ground/terrazzo-d", 1]],
    edges: [{ against: ["timber", "glazed-tile"], sides: sidesOf("ground/edge-terrazzo") }],
  },
  timber: {
    base: [["ground/timber-a", 8], ["ground/timber-b", 8], ["ground/timber-c", 1.5], ["ground/timber-d", 1]],
    edges: [],
  },
  woven: {
    base: [["ground/woven-a", 8], ["ground/woven-b", 3]],
    edges: [{ against: ["terrazzo", "timber", "glazed-tile"], sides: sidesOf("ground/edge-woven"), corners: { ids: cornersOf("ground/edge-woven"), when: "inner" } }],
  },
  "glazed-tile": {
    base: [["ground/glazed-tile-a", 8], ["ground/glazed-tile-b", 4], ["ground/glazed-tile-c", 1], ["ground/glazed-tile-d", 1]],
    edges: [{ against: ["terrazzo", "timber"], sides: sidesOf("ground/edge-glazed-tile") }],
  },
};
