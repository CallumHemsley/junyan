/**
 * Ground for maps that ship their own tile table (a `GroundMaterialSpec` per terrain material, see
 * `ground-courtyard-legend.ts`): a base layer picked by a weighted placement hash, then the material's
 * tone bands and edge overlays on as many layers as the busiest cell needs. Deterministic.
 *
 * Maps without a table keep the town's builder in `ground.ts` (through `MATERIAL_ALIASES`).
 */
import type { TileLayer } from "../engine/index.ts";
import type { GroundMap } from "./ground-grid.ts";
import { tileSpan } from "./ground-grid.ts";
import { COURTYARD_GROUND, bandCorners, type GroundMaterialSpec } from "./ground-courtyard-legend.ts";
import { ROOFTOP_FILL, ROOFTOP_GROUND } from "./ground-rooftop-legend.ts";
import { WORKSHOP_FILL, WORKSHOP_GROUND } from "./ground-workshop-legend.ts";
import { RESIDENTIAL_FILL, RESIDENTIAL_GROUND } from "./ground-residential-legend.ts";
import { READING_ROOM_FILL, READING_ROOM_GROUND } from "./ground-reading-room-legend.ts";

/** Ground tables by map id, with the material used where no terrain rect covers a cell. */
export const GROUND_SPECS: Readonly<Record<string, { specs: Readonly<Record<string, GroundMaterialSpec>>; fill: string }>> = {
  courtyard: { specs: COURTYARD_GROUND, fill: "moss-earth" },
  rooftop: { specs: ROOFTOP_GROUND, fill: ROOFTOP_FILL },
  workshop: { specs: WORKSHOP_GROUND, fill: WORKSHOP_FILL },
  "residential-hall": { specs: RESIDENTIAL_GROUND, fill: RESIDENTIAL_FILL },
  apartment: { specs: RESIDENTIAL_GROUND, fill: RESIDENTIAL_FILL },
  "reading-room": { specs: READING_ROOM_GROUND, fill: READING_ROOM_FILL },
};

/** A well-mixed placement hash in 0..1 (the kit's `hash` streaks diagonally when picking per tile). */
function placement(x: number, y: number, seed: number): number {
  let v = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul((y | 0) + 0x3c6ef372, 0x165667b1) ^ Math.imul(seed | 0, 0x85ebca6b);
  v ^= v >>> 15; v = Math.imul(v, 0x2c1b3c6d); v ^= v >>> 12; v = Math.imul(v, 0x297a2d39); v ^= v >>> 15;
  return (v >>> 0) / 4294967296;
}

const OFFSET = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0], nw: [-1, -1], ne: [1, -1], sw: [-1, 1], se: [1, 1] } as const;
const KEYS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&*+-/:;<=>?@^_~";

function layer(name: string, cells: readonly (readonly (string | null)[])[]): TileLayer {
  const legend: Record<string, string> = {};
  const keyOf = new Map<string, string>();
  const rows = cells.map((row) => row.map((id) => {
    if (!id) return ".";
    let key = keyOf.get(id);
    if (!key) {
      if (keyOf.size >= KEYS.length) throw new Error(`Ground layer ${name} needs more than ${KEYS.length} distinct tiles`);
      key = KEYS[keyOf.size];
      keyOf.set(id, key);
      legend[key] = id;
    }
    return key;
  }).join(""));
  return { name, rows, legend };
}

/** The material of every cell: the table's fill, then each terrain rect in map order. */
export function specMaterials(map: GroundMap, fill: string): string[][] {
  const { width: W, height: H } = map.bounds;
  const grid = Array.from({ length: H }, () => Array.from({ length: W }, () => fill));
  for (const t of map.terrain) {
    const [x0, x1] = tileSpan(t.rect.x, t.rect.width), [y0, y1] = tileSpan(t.rect.y, t.rect.height);
    for (let y = Math.max(0, y0); y < Math.min(H, y1); y++) for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) grid[y][x] = t.material;
  }
  return grid;
}

export function specGroundLayers(map: GroundMap, specs: Readonly<Record<string, GroundMaterialSpec>>, fill: string): TileLayer[] {
  const grid = specMaterials(map, fill);
  const H = grid.length, W = grid[0]?.length ?? 0;
  const bandGrids = new Map<object, boolean[][]>();
  for (const spec of Object.values(specs)) for (const band of spec.bands ?? []) bandGrids.set(band, bandCorners(grid, band));
  const base: string[][] = [];
  const overlays: string[][][] = [];
  for (let y = 0; y < H; y++) {
    base.push([]);
    overlays.push([]);
    for (let x = 0; x < W; x++) {
      const material = grid[y][x];
      const spec = specs[material] ?? specs[fill];
      const at = (d: keyof typeof OFFSET) => grid[y + OFFSET[d][1]]?.[x + OFFSET[d][0]] ?? material;
      const total = spec.base.reduce((sum, [, w]) => sum + w, 0);
      let roll = placement(x, y, 177) * total;
      let pick = spec.base[0][0];
      for (const [id, w] of spec.base) { if (roll < w) { pick = id; break; } roll -= w; }
      const rare = (spec.base.find(([id]) => id === pick)?.[1] ?? 2) <= 1;
      if (rare && (base[y][x - 1] === pick || base[y - 1]?.[x] === pick)) pick = spec.base[0][0];
      base[y].push(pick);
      const cell: string[] = [], corners: string[] = [];
      for (const band of spec.bands ?? []) {
        const g = bandGrids.get(band)!;
        const bits = [g[y][x], g[y][x + 1], g[y + 1][x], g[y + 1][x + 1]].map((v) => (v ? "1" : "0")).join("");
        if (bits !== "0000") cell.push(`${band.prefix}-${bits}${bits === "1111" && placement(x, y, 31) < 0.5 ? "b" : ""}`);
      }
      for (const rule of spec.edges) {
        for (const side of ["n", "s", "w", "e"] as const) if (rule.against.includes(at(side))) {
          const ids = rule.sides[side];
          cell.push(ids[Math.floor(placement(x, y, side.charCodeAt(0)) * ids.length)]);
        }
        if (rule.corners) for (const c of ["nw", "ne", "sw", "se"] as const) {
          const a = rule.against.includes(at(c[0] as "n")), b = rule.against.includes(at(c[1] as "w")), d = rule.against.includes(at(c));
          const outer = d && !a && !b, inner = a && b;
          if ((rule.corners.when !== "inner" && outer) || (rule.corners.when !== "outer" && inner)) corners.push(rule.corners.ids[c]);
        }
      }
      overlays[y].push([...cell, ...corners]);
    }
  }
  const depth = Math.max(0, ...overlays.flat().map((l) => l.length));
  return [layer("ground", base), ...Array.from({ length: depth }, (_, k) => layer(`ground-edge-${k}`, overlays.map((row) => row.map((l) => l[k] ?? null))))];
}
