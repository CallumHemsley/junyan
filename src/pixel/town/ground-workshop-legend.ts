/**
 * The repair workshop's floor (ticket 0182) as a tile table for `specGroundLayers`, in the same
 * `GroundMaterialSpec` format as the courtyard's (see `ground-courtyard-legend.ts`). Sprites:
 * `src/pixel/sprites/ground/workshop.ts`.
 *
 * Materials: `workshop-planks` (old oiled floorboards, sawdust in the joints), `workshop-stone` (worn
 * flags at the door), `workshop-cobbles` (the lane strip outside, and the fill round the building),
 * `workshop-rug` (woven rugs under the two benches) and `workshop-runner` (the runner down the middle).
 *
 * Edges: the boards end in a dark end board against stone and cobbles; the flags have a lit lip over the
 * cobbles; the rug and the runner own their borders (corners where two sides meet).
 */
import type { GroundEdgeRule, GroundMaterialSpec } from "./ground-courtyard-legend.ts";

const SIDES = ["n", "s", "w", "e"] as const;
const CORNERS = ["nw", "ne", "sw", "se"] as const;
const sidesOf = (prefix: string) => Object.fromEntries(SIDES.map((s) => [s, [`${prefix}-${s}`]])) as unknown as GroundEdgeRule["sides"];
const cornersOf = (prefix: string) => Object.fromEntries(CORNERS.map((c) => [c, `${prefix}-${c}`])) as unknown as NonNullable<GroundEdgeRule["corners"]>["ids"];

export const WORKSHOP_FILL = "workshop-cobbles";
const FLOOR = ["workshop-planks", "workshop-stone", "workshop-cobbles"] as const;

export const WORKSHOP_GROUND: Readonly<Record<string, GroundMaterialSpec>> = {
  "workshop-planks": {
    base: [["ground/workshop-planks-a", 8], ["ground/workshop-planks-b", 8], ["ground/workshop-planks-c", 2], ["ground/workshop-planks-d", 1]],
    edges: [{ against: ["workshop-stone", "workshop-cobbles"], sides: sidesOf("ground/edge-workshop-planks") }],
  },
  "workshop-stone": {
    base: [["ground/workshop-stone-a", 8], ["ground/workshop-stone-b", 6], ["ground/workshop-stone-c", 1], ["ground/workshop-stone-d", 1]],
    edges: [{ against: ["workshop-cobbles"], sides: sidesOf("ground/edge-workshop-stone") }],
  },
  "workshop-cobbles": {
    base: [["ground/workshop-cobbles-a", 8], ["ground/workshop-cobbles-b", 8], ["ground/workshop-cobbles-c", 1.5], ["ground/workshop-cobbles-d", 0.25]],
    edges: [],
  },
  "workshop-rug": {
    base: [["ground/workshop-rug-a", 8], ["ground/workshop-rug-b", 3]],
    edges: [{ against: [...FLOOR, "workshop-runner"], sides: sidesOf("ground/edge-workshop-rug"), corners: { ids: cornersOf("ground/edge-workshop-rug"), when: "inner" } }],
  },
  "workshop-runner": {
    base: [["ground/workshop-runner-a", 8], ["ground/workshop-runner-b", 2]],
    edges: [{ against: [...FLOOR, "workshop-rug"], sides: sidesOf("ground/edge-workshop-runner"), corners: { ids: cornersOf("ground/edge-workshop-runner"), when: "inner" } }],
  },
};
