/**
 * The reading room's floor (ticket 0204) as a tile table for `specGroundLayers`, in the same
 * `GroundMaterialSpec` format as the courtyard's (see `ground-courtyard-legend.ts`). Sprites:
 * `src/pixel/sprites/ground/reading-room.ts`.
 *
 * Materials: `timber` (the room's old basket-weave parquet, honey and walnut, waxed for decades) and
 * `reading-outside` (the dark of the building beyond the room's walls, the fill).
 *
 * Bands: `ground/reading-worn-<bits>`, the wax worn pale along the paths people walk: in from the hall
 * door, along the row in front of the work bays, and down the gap between the two bays. Edges: the
 * parquet ends in a dark border board against the outside.
 */
import type { GroundBand, GroundEdgeRule, GroundMaterialSpec } from "./ground-courtyard-legend.ts";

const SIDES = ["n", "s", "w", "e"] as const;
const sidesOf = (prefix: string) => Object.fromEntries(SIDES.map((s) => [s, [`${prefix}-${s}`]])) as unknown as GroundEdgeRule["sides"];

export const READING_ROOM_FILL = "reading-outside";

/** The walked paths, on the room's plan (grid corners, tiles). A little noise frays their edges. */
const WORN: GroundBand = {
  prefix: "ground/reading-worn",
  inBand: (c) => {
    const fray = (c.noise(3, 41) - 0.5) * 0.9;
    const entry = c.x >= 13 - fray && c.x <= 15 + fray && c.y >= 11 && c.y <= 17;
    const front = c.y >= 10.5 - fray && c.y <= 11.5 + fray && c.x >= 4 && c.x <= 23;
    const gap = c.x >= 12 + fray && c.x <= 13 - fray && c.y >= 4 && c.y <= 11;
    return entry || front || gap;
  },
};

export const READING_ROOM_GROUND: Readonly<Record<string, GroundMaterialSpec>> = {
  timber: {
    base: [["ground/reading-parquet-a", 8], ["ground/reading-parquet-b", 8], ["ground/reading-parquet-c", 1.5], ["ground/reading-parquet-d", 0.3]],
    bands: [WORN],
    edges: [{ against: [READING_ROOM_FILL], sides: sidesOf("ground/edge-reading-parquet") }],
  },
  [READING_ROOM_FILL]: {
    base: [["ground/reading-outside-a", 8], ["ground/reading-outside-b", 2]],
    edges: [],
  },
};
