/**
 * The courtyard's ground (ticket 0178) as data for the generalised `groundLayers`: for each terrain
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
 * - `bands` (optional): tone bands laid over many tiles, drawn after the base and before the edges. For
 *   each grid corner (cx, cy), 0..width × 0..height, call `inBand(ctx)` with a `BandContext` for that
 *   corner; a cell of this material then takes `${prefix}-${bits}`, bits being its nw, ne, sw, se corners
 *   ("1" in the band), nothing for "0000", and `${prefix}-1111b` instead of `-1111` on alternate cells
 *   by hash. `bandCorners(grid, band)` below is a reference implementation of the corner pass.
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

/** What a band's predicate may ask about one grid corner. */
export type BandContext = {
  /** True if any cell within `distance` cells of the corner (the 2d × 2d block around it) is one of `materials`. */
  near(materials: readonly string[], distance: number): boolean;
  /** True if the corner is within `distance` of the map's edge. */
  mapEdge(distance: number): boolean;
  /** Smooth value noise in 0..1 at the corner, lattice every `scale` tiles. */
  noise(scale: number, seed: number): number;
};

export type GroundBand = { prefix: string; inBand(c: BandContext): boolean };

export type GroundMaterialSpec = {
  base: readonly (readonly [string, number])[];
  bands?: readonly GroundBand[];
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

const OTHERS_THAN = (m: string) => ["brick-paving", "courtyard-stone", "moss-earth", "threshold-stone", "worn-stone"].filter((x) => x !== m);

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
    base: [["ground/moss-earth-a", 8], ["ground/moss-earth-b", 8], ["ground/moss-earth-c", 1], ["ground/moss-earth-d", 0.5]],
    bands: [
      // Damp ground: broad darker, greener patches so open earth is never one flat tone.
      { prefix: "ground/moss-earth-damp", inBand: (c) => c.noise(5, 15) > 0.52 },
      // Bare earth trodden pale beside the paths, in patches.
      { prefix: "ground/moss-earth-bare", inBand: (c) => c.near(["worn-stone", "brick-paving", "courtyard-stone"], 1) && c.noise(5, 11) < 0.42 },
      // Moss in the shade: by the walls at the map's edge, around the sill platform, and in a few damp hollows.
      { prefix: "ground/moss-earth-moss", inBand: (c) => !c.near(["worn-stone", "brick-paving", "courtyard-stone"], 1)
          && (c.mapEdge(2) && c.noise(4, 12) > 0.3 || c.near(["threshold-stone"], 2) && c.noise(4, 13) > 0.35 || c.noise(6, 14) > 0.7) },
    ],
    edges: [],
  },
  "threshold-stone": {
    base: [["ground/threshold-stone-a", 3], ["ground/threshold-stone-b", 3], ["ground/threshold-stone-c", 0.6], ["ground/threshold-stone-d", 5]],
    edges: [
      {
        against: OTHERS_THAN("threshold-stone"),
        sides: { ...sidesOf("ground/edge-sill"), s: ["ground/edge-sill-s", "ground/edge-sill-s", "ground/edge-sill-s-b", "ground/edge-sill-s-c"] },
        corners: { ids: cornersOf("ground/edge-sill"), when: "inner" },
      },
      MOSS,
    ],
  },
  "worn-stone": {
    base: [["ground/worn-stone-a", 8], ["ground/worn-stone-b", 6], ["ground/worn-stone-c", 0.4], ["ground/worn-stone-d", 0.5]],
    bands: [
      // The worn path down the middle of every lane: corners at least two cells from anything but cobbles.
      { prefix: "ground/worn-stone-path", inBand: (c) => !c.near(OTHERS_THAN("worn-stone"), 2) },
    ],
    edges: [
      // Moss only in the joints along a lane's edges.
      { against: OTHERS_THAN("worn-stone"), sides: sidesOf("ground/edge-cobble-moss") },
      { against: ["courtyard-stone"], sides: sidesOf("ground/edge-cobble"), corners: { ids: cornersOf("ground/edge-cobble"), when: "both" } },
      MOSS,
    ],
  },
};

function hash(x: number, y: number, seed: number): number {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul((y | 0) + 0x3c6ef372, 0x165667b1) ^ Math.imul(seed | 0, 0x85ebca6b);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12; h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

function valueNoise(x: number, y: number, scale: number, seed: number): number {
  const fx = x / scale, fy = y / scale, i = Math.floor(fx), j = Math.floor(fy);
  const s = (t: number) => t * t * (3 - 2 * t);
  const u = s(fx - i), v = s(fy - j);
  return hash(i, j, seed) * (1 - u) * (1 - v) + hash(i + 1, j, seed) * u * (1 - v) + hash(i, j + 1, seed) * (1 - u) * v + hash(i + 1, j + 1, seed) * u * v;
}

/** Reference corner pass for a band: `[cy][cx]` for cx in 0..width, cy in 0..height. */
export function bandCorners(grid: readonly (readonly string[])[], band: GroundBand): boolean[][] {
  const h = grid.length, w = grid[0].length;
  return Array.from({ length: h + 1 }, (_, cy) => Array.from({ length: w + 1 }, (_, cx) => band.inBand({
    near: (materials, d) => {
      for (let y = cy - d; y < cy + d; y++) for (let x = cx - d; x < cx + d; x++)
        if (x >= 0 && y >= 0 && x < w && y < h && materials.includes(grid[y][x])) return true;
      return false;
    },
    mapEdge: (d) => cx < d || cy < d || cx > w - d || cy > h - d,
    noise: (scale, seed) => valueNoise(cx, cy, scale, seed),
  })));
}

/** Every sprite id the table refers to, for tests and atlas checks. */
export function courtyardGroundIds(): string[] {
  const ids = new Set<string>();
  for (const spec of Object.values(COURTYARD_GROUND)) {
    for (const [id] of spec.base) ids.add(id);
    for (const band of spec.bands ?? []) {
      for (let m = 1; m < 16; m++) ids.add(`${band.prefix}-${m.toString(2).padStart(4, "0")}`);
      ids.add(`${band.prefix}-1111b`);
    }
    for (const rule of spec.edges) {
      for (const list of Object.values(rule.sides)) for (const id of list) ids.add(id);
      if (rule.corners) for (const id of Object.values(rule.corners.ids)) ids.add(id);
    }
  }
  return [...ids].sort();
}

export { HARD as COURTYARD_HARD_MATERIALS };
