/**
 * The courtyard's ground (ticket 0177) as data for the generalised `groundLayers`: for each terrain
 * material in `src/world/maps/courtyard/map.json`, its base tile variants and the edge overlays it takes
 * where it meets other materials. The sprites are in `src/pixel/sprites/ground/courtyard.ts`.
 *
 * How to read a `GroundMaterialSpec`:
 *
 * - `base`: `[spriteId, weight]` pairs. Pick one per cell by a placement hash, weighted. Rare variants
 *   (weight ≤ 1) should not be placed next to the same variant.
 * - `edges`: rules, in draw order, for overlays on a cell of this material. For each rule and each side
 *   (`n`, `s`, `w`, `e`) whose neighbour's material is in `against`, draw one of `sides[side]` (pick by
 *   hash when there are several). A neighbour off the map counts as the cell's own material.
 * - `corners` (optional): `ids[corner]` is drawn after all side overlays, at a corner whose diagonal
 *   and orthogonal neighbours match `when`:
 *     - `"outer"`: the diagonal neighbour is in `against` and neither orthogonal one is (a run's end);
 *     - `"inner"`: both orthogonal neighbours are in `against` (where two runs cross);
 *     - `"both"`: either.
 * - All edge overlays are transparent outside their strip and go on layers after the base layer.
 *
 * Ownership: moss and earth fray onto every hard material; brick paving takes a soldier course against
 * stone; cobbles take granite edging setts against the slabs; the threshold sills (a low platform) draw
 * their own edge against everything else, a front face to the south.
 */
export type GroundSide = "n" | "s" | "w" | "e";
export type GroundCorner = "nw" | "ne" | "sw" | "se";

export type GroundEdgeRule = {
  against: readonly string[];
  sides: Readonly<Record<GroundSide, readonly string[]>>;
  corners?: { ids: Readonly<Record<GroundCorner, string>>; when: "outer" | "inner" | "both" };
};

export type GroundMaterialSpec = {
  base: readonly (readonly [string, number])[];
  edges: readonly GroundEdgeRule[];
};

const SIDES = ["n", "s", "w", "e"] as const;
const CORNERS = ["nw", "ne", "sw", "se"] as const;

const sidesOf = (prefix: string, variants: readonly string[] = [""]): Record<GroundSide, readonly string[]> =>
  ({ n: variants.map((v) => `${prefix}-n${v}`), s: variants.map((v) => `${prefix}-s${v}`), w: variants.map((v) => `${prefix}-w${v}`), e: variants.map((v) => `${prefix}-e${v}`) });
const cornersOf = (prefix: string): Record<GroundCorner, string> =>
  Object.fromEntries(CORNERS.map((c) => [c, `${prefix}-${c}`])) as Record<GroundCorner, string>;

const STONES = ["courtyard-stone", "worn-stone", "threshold-stone"] as const;
const HARD = ["brick-paving", ...STONES] as const;

/** Moss and earth creeping onto any hard cell from a bed beside it. Always drawn last. */
const MOSS: GroundEdgeRule = {
  against: ["moss-earth"],
  sides: sidesOf("ground/edge-moss", ["-a", "-a", "-b"]),
  corners: { ids: cornersOf("ground/edge-moss"), when: "outer" },
};

export const COURTYARD_GROUND: Readonly<Record<string, GroundMaterialSpec>> = {
  "brick-paving": {
    base: [["ground/brick-paving-a", 8], ["ground/brick-paving-b", 5], ["ground/brick-paving-c", 1.5], ["ground/brick-paving-d", 0.6]],
    edges: [
      { against: STONES, sides: sidesOf("ground/edge-brick-paving"), corners: { ids: cornersOf("ground/edge-brick-paving"), when: "both" } },
      MOSS,
    ],
  },
  "courtyard-stone": {
    base: [["ground/courtyard-stone-a", 6], ["ground/courtyard-stone-b", 5], ["ground/courtyard-stone-c", 0.12], ["ground/courtyard-stone-d", 0.5]],
    edges: [MOSS],
  },
  "moss-earth": {
    base: [["ground/moss-earth-a", 6], ["ground/moss-earth-b", 6], ["ground/moss-earth-c", 3], ["ground/moss-earth-d", 0.6]],
    edges: [],
  },
  "threshold-stone": {
    base: [["ground/threshold-stone-a", 3], ["ground/threshold-stone-b", 3], ["ground/threshold-stone-c", 0.6], ["ground/threshold-stone-d", 5]],
    edges: [
      { against: ["brick-paving", "courtyard-stone", "worn-stone", "moss-earth"], sides: sidesOf("ground/edge-sill"), corners: { ids: cornersOf("ground/edge-sill"), when: "inner" } },
      MOSS,
    ],
  },
  "worn-stone": {
    base: [["ground/worn-stone-a", 9], ["ground/worn-stone-b", 2], ["ground/worn-stone-c", 0.4], ["ground/worn-stone-d", 0.5]],
    edges: [
      { against: ["courtyard-stone"], sides: sidesOf("ground/edge-cobble"), corners: { ids: cornersOf("ground/edge-cobble"), when: "both" } },
      MOSS,
    ],
  },
};

/** Every sprite id the table refers to, for tests and atlas checks. */
export function courtyardGroundIds(): string[] {
  const ids = new Set<string>();
  for (const spec of Object.values(COURTYARD_GROUND)) {
    for (const [id] of spec.base) ids.add(id);
    for (const rule of spec.edges) {
      for (const list of Object.values(rule.sides)) for (const id of list) ids.add(id);
      if (rule.corners) for (const id of Object.values(rule.corners.ids)) ids.add(id);
    }
  }
  return [...ids].sort();
}

export { HARD as COURTYARD_HARD_MATERIALS };
