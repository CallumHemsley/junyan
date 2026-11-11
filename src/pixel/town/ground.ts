/**
 * An outdoor map's ground as tile layers, built from the map's terrain rects (the town's by default).
 * Owned by the ground worker (ticket 0163); the outdoor scenes (tickets 0174, 0176) only call
 * `groundLayers(map)` and must not depend on its insides. Other maps' materials draw with the town's
 * tiles through `MATERIAL_ALIASES` (`ground-grid.ts`) until they get their own.
 *
 * Layers, in draw order:
 * 1. `ground`: one base tile per cell, the variant picked by hash with plain variants weighted heavier and
 *    rare ones never side by side. Water cells are left empty here.
 * 2. `ground-edge-N`: overlays where materials meet (kerbs, header courses, grass fraying, the canal
 *    coping), as many layers as the busiest cell needs.
 * 3. `ground-water`, then `ground-water-edge-N`: the animated canal and the wall and bank overlays on it.
 *    Water comes last so everything before it bakes into the renderer's static floor cache.
 */
import type { TileLayer } from "../engine/index.ts";
import { groundMaterials, type GroundMap, type Material } from "./ground-grid.ts";
import { GROUND_SPECS, specGroundLayers } from "./ground-spec.ts";

type Variant = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
const SEED = 163;

/**
 * Placement noise, 0..1. The kit's `hash` is fine inside a sprite but shows diagonal streaks when fed
 * neighbouring tile coordinates, so placement uses a full avalanche mix.
 */
function hash(x: number, y: number, seed: number): number {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul((y | 0) + 0x3c6ef372, 0x165667b1) ^ Math.imul(seed | 0, 0x85ebca6b);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12; h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/**
 * Relative weights of the four variants per material. Paving's d (the manhole) and paving's h (weeds by
 * the verge) are placed separately.
 */
const WEIGHTS: Record<Material, Partial<Record<Variant, number>>> = {
  grass: { a: 8, b: 8, c: 2, d: 1 },
  paving: { a: 9, b: 3, c: 1, d: 0, e: 3, f: 0.8, g: 0.4 },
  road: { a: 8, b: 1.2, c: 1, d: 0.15 },
  brick: { a: 8, b: 4, c: 2, d: 0.8 },
  stone: { a: 4, b: 4, c: 2, d: 1 },
  water: { a: 4, b: 4, c: 1, d: 1 },
};
const RARE: readonly Variant[] = ["c", "d", "f", "g", "h"];

const HARD: readonly Material[] = ["paving", "road", "brick", "stone"];
/** Ground a brick lane's header course stops against. */
const HEADER_STOP: readonly Material[] = ["paving", "stone", "road"];
/** Ground a road's kerb stands against. */
const KERB_STOP: readonly Material[] = ["paving", "brick", "stone"];

const OFFSETS = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0], nw: [-1, -1], ne: [1, -1], sw: [-1, 1], se: [1, 1] } as const;
type Dir = keyof typeof OFFSETS;
const SIDES = ["n", "s", "w", "e"] as const;
const CORNERS = ["nw", "ne", "sw", "se"] as const;

function pickVariant(material: Material, x: number, y: number, left: string | null, up: string | null): Variant {
  const weights = WEIGHTS[material];
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = hash(x, y, SEED) * total;
  let pick: Variant = "a";
  for (const [v, wt] of Object.entries(weights) as [Variant, number][]) { if (r < wt) { pick = v; break; } r -= wt; }
  const id = `ground/${material}-${pick}`;
  if (RARE.includes(pick) && (left === id || up === id)) pick = hash(x, y, SEED + 1) < 0.55 ? "a" : "b";
  return pick;
}

/** Manholes: only deep inside paving, never two within 14 tiles. */
function manholes(grid: Material[][]): Set<string> {
  const out = new Set<string>(), placed: [number, number][] = [];
  for (let y = 1; y < grid.length - 1; y++) for (let x = 1; x < grid[0].length - 1; x++) {
    let inside = true;
    for (let dy = -1; dy <= 1 && inside; dy++) for (let dx = -1; dx <= 1; dx++) if (grid[y + dy][x + dx] !== "paving") { inside = false; break; }
    if (!inside || hash(x, y, SEED + 7) > 0.025) continue;
    if (placed.some(([px, py]) => Math.abs(px - x) < 14 && Math.abs(py - y) < 14)) continue;
    placed.push([x, y]);
    out.add(`${x},${y}`);
  }
  return out;
}

/** Paving by a verge, where nobody walks, sometimes has weeds and moss in its joints. */
function weedy(grid: Material[][], x: number, y: number): boolean {
  if (grid[y][x] !== "paving" || hash(x, y, SEED + 40) > 0.3) return false;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (grid[y + dy]?.[x + dx] === "grass") return true;
  return false;
}

/**
 * Wear along the road by lane position, for a run of road cells from kerb to kerb: a wheel track in each
 * lane, nearer the kerb in the outer cells, and the crown paler either side of the middle.
 */
function roadWear(grid: Material[][], x: number, y: number): string[] {
  let top = y, bottom = y;
  while (grid[top - 1]?.[x] === "road") top--;
  while (grid[bottom + 1]?.[x] === "road") bottom++;
  const i = y - top, n = bottom - top + 1;
  if (n < 2) return [];
  const out: string[] = [];
  const mid = (n - 1) / 2;
  if (i === 0 || (n >= 4 && i === n - 2)) out.push("ground/road-track-n");
  if (i === n - 1 || (n >= 4 && i === 1)) out.push("ground/road-track-s");
  if (i === Math.floor(mid) && n % 2 === 0) out.push("ground/road-crown-s");
  if (i === Math.ceil(mid) && n % 2 === 0) out.push("ground/road-crown-n");
  return out;
}

/** Smooth value noise over tile coordinates: lattice values every `scale` tiles, smoothstepped between. */
function valueNoise(x: number, y: number, scale: number, seed: number): number {
  const fx = x / scale, fy = y / scale, i = Math.floor(fx), j = Math.floor(fy);
  const s = (t: number) => t * t * (3 - 2 * t);
  const u = s(fx - i), v = s(fy - j);
  const a = hash(i, j, seed), b = hash(i + 1, j, seed), c = hash(i, j + 1, seed), d = hash(i + 1, j + 1, seed);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/**
 * The grass's tone bands, decided per tile corner so bands span many tiles and their edges meet:
 * worn along every pavement (and a little further where the noise is low, like short cuts), shade
 * where the noise is high and no path is near.
 */
function toneCorners(grid: Material[][]) {
  const h = grid.length, w = grid[0].length;
  const hardNear = (cx: number, cy: number, r: number) => {
    for (let y = cy - r; y < cy + r; y++) for (let x = cx - r; x < cx + r; x++)
      if (x >= 0 && y >= 0 && x < w && y < h && HARD.includes(grid[y][x])) return true;
    return false;
  };
  const worn: boolean[][] = [], shade: boolean[][] = [];
  for (let cy = 0; cy <= h; cy++) {
    worn.push([]); shade.push([]);
    for (let cx = 0; cx <= w; cx++) {
      const n = 0.65 * valueNoise(cx, cy, 7, SEED + 20) + 0.35 * valueNoise(cx, cy, 3, SEED + 21);
      const near1 = hardNear(cx, cy, 1), near2 = hardNear(cx, cy, 2);
      const isWorn = near1 || (near2 && n < 0.48) || n < 0.2;
      worn[cy].push(isWorn);
      shade[cy].push(!isWorn && !near2 && n > 0.6);
    }
  }
  return { worn, shade };
}

/** The overlays a cell needs, in draw order: kerbs, header courses, coping, grass, then corner pieces. */
export function edgesOf(grid: Material[][], x: number, y: number, tones?: ReturnType<typeof toneCorners>): string[] {
  const h = grid.length, w = grid[0].length, m = grid[y][x];
  const at = (d: Dir): Material => {
    const [dx, dy] = OFFSETS[d], nx = x + dx, ny = y + dy;
    return nx < 0 || ny < 0 || nx >= w || ny >= h ? m : grid[ny][nx];
  };
  const ab = (d: string) => (hash(x, y, SEED + d.charCodeAt(0)) < 0.72 ? "a" : "b");
  const out: string[] = [];

  if (m === "water") {
    for (const s of ["n", "w", "e"] as const) if (at(s) !== "water") out.push(`ground/edge-water-${s}`);
    return out;
  }
  if (m === "grass" && tones) for (const [name, band] of [["worn", tones.worn], ["shade", tones.shade]] as const) {
    const bits = [band[y][x], band[y][x + 1], band[y + 1][x], band[y + 1][x + 1]].map((b) => (b ? "1" : "0")).join("");
    if (bits === "0000") continue;
    out.push(`ground/grass-${name}-${bits}${bits === "1111" && hash(x, y, SEED + 30) < 0.5 ? "b" : ""}`);
  }
  if (m === "road") out.push(...roadWear(grid, x, y));
  if (m === "road") for (const s of SIDES) {
    if (!KERB_STOP.includes(at(s))) continue;
    out.push(s === "n" || s === "s" ? `ground/edge-kerb-${s}-${ab(s)}` : `ground/edge-kerb-${s}`);
  }
  if (m === "brick") for (const s of SIDES) if (HEADER_STOP.includes(at(s))) out.push(`ground/edge-header-${s}`);
  for (const s of ["e", "w", "s"] as const) if (at(s) === "water") out.push(`ground/edge-coping-${s}`);
  if (HARD.includes(m)) for (const s of SIDES) if (at(s) === "grass") out.push(`ground/edge-grass-${s}-${ab(s)}`);

  for (const c of CORNERS) {
    const v = c[0] as "n" | "s", hz = c[1] as "w" | "e";
    if (m === "brick") {
      const inner = HEADER_STOP.includes(at(v)) && HEADER_STOP.includes(at(hz));
      const outer = HEADER_STOP.includes(at(c)) && at(v) === "brick" && at(hz) === "brick";
      if (inner || outer) out.push(`ground/edge-header-${c}`);
    }
    if (m === "road" && KERB_STOP.includes(at(v)) && KERB_STOP.includes(at(hz))) out.push(`ground/edge-kerb-${c}`);
    if (HARD.includes(m) && at(c) === "grass" && at(v) !== "grass" && at(hz) !== "grass") out.push(`ground/edge-grass-${c}`);
    if ((c === "se" || c === "sw") && at(c) === "water" && at(v) !== "water" && at(hz) !== "water") out.push(`ground/edge-coping-${c}`);
  }
  return out;
}

const KEYS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&*+-/:;<=>?@^_~";

/** Turn a grid of sprite ids (or null) into a tile layer with its own legend. */
function layerOf(name: string, cells: (string | null)[][]): TileLayer {
  const legend: Record<string, string> = {}, keyOf = new Map<string, string>();
  const rows = cells.map((row) => row.map((id) => {
    if (!id) return ".";
    let key = keyOf.get(id);
    if (!key) {
      if (keyOf.size >= KEYS.length) throw new Error(`groundLayers: layer ${name} needs more than ${KEYS.length} sprites`);
      key = KEYS[keyOf.size];
      keyOf.set(id, key);
      legend[key] = id;
    }
    return key;
  }).join(""));
  return { name, rows, legend };
}

/** Spread per-cell overlay lists across as many layers as the busiest cell needs. */
function stacked(prefix: string, lists: string[][][]): TileLayer[] {
  const depth = Math.max(0, ...lists.flat().map((l) => l.length));
  return Array.from({ length: depth }, (_, k) => layerOf(`${prefix}-${k + 1}`, lists.map((row) => row.map((l) => l[k] ?? null))));
}

export function groundLayers(map?: GroundMap): TileLayer[] {
  // Maps with their own tile table (the courtyard) use it; the rest use the town tiles via aliases.
  const table = map && "id" in map ? GROUND_SPECS[(map as GroundMap & { id: string }).id] : undefined;
  if (map && table) return specGroundLayers(map, table.specs, table.fill);
  const grid = groundMaterials(map);
  const holes = manholes(grid);
  const base: (string | null)[][] = grid.map((row) => row.map(() => null));
  const water: (string | null)[][] = grid.map((row) => row.map(() => null));
  grid.forEach((row, y) => row.forEach((m, x) => {
    const target = m === "water" ? water : base;
    target[y][x] = holes.has(`${x},${y}`) ? "ground/paving-d" : weedy(grid, x, y) ? "ground/paving-h"
      : `ground/${m}-${pickVariant(m, x, y, target[y][x - 1] ?? null, target[y - 1]?.[x] ?? null)}`;
  }));
  const tones = toneCorners(grid);
  const edges = grid.map((row, y) => row.map((m, x) => (m === "water" ? [] : edgesOf(grid, x, y, tones))));
  const waterEdges = grid.map((row, y) => row.map((m, x) => (m === "water" ? edgesOf(grid, x, y) : [])));
  return [
    layerOf("ground", base),
    ...stacked("ground-edge", edges),
    layerOf("ground-water", water),
    ...stacked("ground-water-edge", waterEdges),
  ];
}
