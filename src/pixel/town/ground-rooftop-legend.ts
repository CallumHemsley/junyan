/**
 * The rooftop garden's ground (ticket 0188) as a tile table for `specGroundLayers`, in the same
 * `GroundMaterialSpec` format as the courtyard's (see `ground-courtyard-legend.ts` for how bases, bands
 * and edge rules are read). Sprites: `src/pixel/sprites/ground/rooftop.ts`.
 *
 * Materials: `roof-tile` (the main deck), `roof-concrete` (poured bays round the tank and stairhead),
 * `roof-brick` (quarry-tile walkways), `roof-wood` (decking under the pergola) and `roof-below`, the fill
 * past the parapets: the neighbours' pantiles a storey down.
 *
 * Ownership of edges: concrete seals its own joint against other paving; walkways take an edging course
 * against the deck; the decking draws its own edge (a front board to the south); the roofs below take
 * the deck's drop shadow. Roof tiles take nothing; the others meet them.
 */
import type { GroundEdgeRule, GroundMaterialSpec } from "./ground-courtyard-legend.ts";

const SIDES = ["n", "s", "w", "e"] as const;
const CORNERS = ["nw", "ne", "sw", "se"] as const;
const sidesOf = (prefix: string) => Object.fromEntries(SIDES.map((s) => [s, [`${prefix}-${s}`]])) as unknown as GroundEdgeRule["sides"];
const cornersOf = (prefix: string) => Object.fromEntries(CORNERS.map((c) => [c, `${prefix}-${c}`])) as unknown as NonNullable<GroundEdgeRule["corners"]>["ids"];

const DECK = ["roof-tile", "roof-concrete", "roof-brick", "roof-wood"] as const;
const others = (m: string) => DECK.filter((d) => d !== m);

export const ROOFTOP_FILL = "roof-below";

export const ROOFTOP_GROUND: Readonly<Record<string, GroundMaterialSpec>> = {
  "roof-tile": {
    base: [["ground/roof-tile-a", 8], ["ground/roof-tile-b", 8], ["ground/roof-tile-c", 0.8], ["ground/roof-tile-d", 0.5]],
    bands: [
      // Sun-faded patches across the open deck.
      { prefix: "ground/roof-tile-faded", inBand: (c) => c.noise(6, 21) > 0.6 },
      // Damp and moss along the parapet foot, where the sun rarely reaches the joints.
      { prefix: "ground/roof-tile-moss", inBand: (c) => c.near([ROOFTOP_FILL], 1) && c.noise(3, 22) > 0.35 },
    ],
    edges: [],
  },
  "roof-concrete": {
    base: [["ground/roof-concrete-a", 8], ["ground/roof-concrete-b", 8], ["ground/roof-concrete-c", 1], ["ground/roof-concrete-d", 0.3]],
    bands: [{ prefix: "ground/roof-concrete-stain", inBand: (c) => c.noise(4, 23) > 0.62 }],
    edges: [{ against: others("roof-concrete"), sides: sidesOf("ground/edge-roof-concrete") }],
  },
  "roof-brick": {
    base: [["ground/roof-brick-a", 8], ["ground/roof-brick-b", 8], ["ground/roof-brick-c", 0.8], ["ground/roof-brick-d", 0.6]],
    edges: [{ against: ["roof-tile", "roof-concrete"], sides: sidesOf("ground/edge-roof-brick"), corners: { ids: cornersOf("ground/edge-roof-brick"), when: "both" } }],
  },
  "roof-wood": {
    base: [["ground/roof-wood-a", 8], ["ground/roof-wood-b", 8], ["ground/roof-wood-c", 1], ["ground/roof-wood-d", 0.8]],
    edges: [{ against: [...others("roof-wood"), ROOFTOP_FILL], sides: sidesOf("ground/edge-roof-wood"), corners: { ids: cornersOf("ground/edge-roof-wood"), when: "inner" } }],
  },
  [ROOFTOP_FILL]: {
    base: [["ground/roof-below-a", 8], ["ground/roof-below-b", 8], ["ground/roof-below-c", 1], ["ground/roof-below-d", 0.4]],
    edges: [{ against: DECK, sides: sidesOf("ground/edge-roof-below"), corners: { ids: cornersOf("ground/edge-roof-below"), when: "outer" } }],
  },
};
