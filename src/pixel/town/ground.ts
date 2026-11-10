/**
 * The town's ground as tile layers, built from the map's terrain rects. Owned by the ground worker
 * (ticket 0163); the town scene (ticket 0174) only calls `groundLayers()` and must not depend on its insides.
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
import { groundMaterials, type Material } from "./ground-grid.ts";

type Variant = "a" | "b" | "c" | "d";
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
 * Relative weights of the four variants per material. Paving's d (the manhole) and road's c (the trench,
 * one column per stretch of road) are placed separately.
 */
const WEIGHTS: Record<Material, Record<Variant, number>> = {
  grass: { a: 8, b: 8, c: 2, d: 1 },
  paving: { a: 8, b: 5, c: 2, d: 0 },
  road: { a: 8, b: 1.4, c: 0, d: 0.35 },
  brick: { a: 8, b: 4, c: 2, d: 0.8 },
  stone: { a: 4, b: 4, c: 2, d: 1 },
  water: { a: 4, b: 4, c: 1, d: 1 },
};
const RARE: readonly Variant[] = ["c", "d"];

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
  for (const v of ["a", "b", "c", "d"] as const) { if (r < weights[v]) { pick = v; break; } r -= weights[v]; }
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

/** Trenches: in each east–west stretch of road at least 8 wide, one column of road-c from kerb to kerb. */
function trenches(grid: Material[][]): Set<string> {
  const out = new Set<string>();
  const w = grid[0].length;
  const rows = grid.map((row, y) => (row.includes("road") ? y : -1)).filter((y) => y >= 0);
  if (!rows.length) return out;
  const y0 = rows[0];
  for (let x = 0; x < w;) {
    if (grid[y0][x] !== "road") { x++; continue; }
    let end = x;
    while (end < w && grid[y0][end] === "road") end++;
    if (end - x >= 8) {
      const col = x + 2 + Math.floor(hash(x, end, SEED + 9) * (end - x - 4));
      for (const y of rows) if (grid[y][col] === "road") out.add(`${col},${y}`);
    }
    x = end;
  }
  return out;
}

/** The overlays a cell needs, in draw order: kerbs, header courses, coping, grass, then corner pieces. */
export function edgesOf(grid: Material[][], x: number, y: number): string[] {
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

export function groundLayers(): TileLayer[] {
  const grid = groundMaterials();
  const holes = manholes(grid), trench = trenches(grid);
  const base: (string | null)[][] = grid.map((row) => row.map(() => null));
  const water: (string | null)[][] = grid.map((row) => row.map(() => null));
  grid.forEach((row, y) => row.forEach((m, x) => {
    const target = m === "water" ? water : base;
    target[y][x] = holes.has(`${x},${y}`) ? "ground/paving-d" : trench.has(`${x},${y}`) ? "ground/road-c"
      : `ground/${m}-${pickVariant(m, x, y, target[y][x - 1] ?? null, target[y - 1]?.[x] ?? null)}`;
  }));
  const edges = grid.map((row, y) => row.map((m, x) => (m === "water" ? [] : edgesOf(grid, x, y))));
  const waterEdges = grid.map((row, y) => row.map((m, x) => (m === "water" ? edgesOf(grid, x, y) : [])));
  return [
    layerOf("ground", base),
    ...stacked("ground-edge", edges),
    layerOf("ground-water", water),
    ...stacked("ground-water-edge", waterEdges),
  ];
}
