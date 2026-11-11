/**
 * Private drawing helpers for the town's plants (ticket 0168). Not a sprite set: the leading `_`
 * keeps the loader away. The decor domain's outline and stamp helpers are reused, not copied.
 *
 * Everything here is deterministic: texture comes from `hash()` seeded by the caller, so two trees
 * drawn with different seeds are different trees and one tree is the same tree every time.
 */
import { Px, hash, type Color, type Legend } from "../../kit/index.ts";
import { art, autoOutline, stamp } from "../decor/_helpers.ts";

export { art, autoOutline, stamp };

export type Pt = readonly [number, number];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ── canopies ──────────────────────────────────────────────────────────────────

/** One mass of foliage. `sway` (0..1) is how far it moves in the wind; the crown top moves most. */
export type Clump = {
  x: number; y: number; rx: number; ry: number; shift?: number; sway?: number; seed?: number; group?: number;
  /** The leaf mass this clump belongs to: it, not the clump, sets the big light and shade. */
  mass?: { x: number; y: number; rx: number; ry: number };
};

/**
 * A foliage texture: a leaf drawing stamped over a jittered grid. Leaf digits are relative tones,
 * 1 a step darker than the clump's tone at that point, 2 the tone itself, 3 a step lighter; the
 * clump's body under the leaves is a step darker still, so the gaps between leaves read as depth.
 */
export type Foliage = {
  /** Dark to light; the first tone is reserved for the dark seams between clumps. */
  ramp: readonly Color[];
  leaves: readonly (readonly string[])[];
  /** Grid step between leaf stamps, px. */
  step: readonly [number, number];
  /** Chance a leaf takes the off-colour ramp instead (a leaf turning, new growth). */
  odd?: { ramp: readonly Color[]; chance: number };
  /** Ring each leaf in a dark tone, for big leaves that should read one by one (fig). */
  outlineLeaves?: boolean;
};

/** Light on a sphere lit from the upper left, 0 (shade) .. 1 (full sun). */
function sphereLight(nx: number, ny: number): number {
  const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  return clamp((-0.55 * nx - 0.7 * ny + 0.45 * nz + 0.35) / 1.45, 0, 1);
}

/**
 * A leaf drawing as numbers: the digit at each pixel (relative tone), or -1 where the leaf is clear.
 * `w` is the first row's length (the leaf's width for centring and flipping, as drawn); `stride` the
 * longest row's, so a ragged row still draws all its pixels.
 */
type LeafGrid = { w: number; h: number; stride: number; tone: Int8Array };
const leafGrids = new WeakMap<readonly string[], LeafGrid>();
function leafGrid(leaf: readonly string[]): LeafGrid {
  let grid = leafGrids.get(leaf);
  if (!grid) {
    const w = leaf[0].length, h = leaf.length, stride = Math.max(...leaf.map((row) => row.length)), tone = new Int8Array(stride * h).fill(-1);
    for (let rj = 0; rj < h; rj++) for (let ri = 0; ri < leaf[rj].length; ri++) if (leaf[rj][ri] !== ".") tone[rj * stride + ri] = Number(leaf[rj][ri]);
    leafGrids.set(leaf, grid = { w, h, stride, tone });
  }
  return grid;
}

/** The clump-ownership sentinel: no clump has drawn this pixel yet. */
const NO_OWNER = -2147483648;

/**
 * Scratch grids shared by every `canopy` call, grown as needed. `owner` and `state` are valid only
 * where their generation stamp is the current call's, so nothing is cleared between calls; `cell`
 * and `final` are zeroed as they are used.
 */
let scratchGen = 0;
let scratchBuffers = makeScratch(0);
function makeScratch(size: number) {
  return {
    size,
    owner: new Int32Array(size), ownerGen: new Int32Array(size), cell: new Int16Array(size), order: new Int32Array(size),
    state: new Int8Array(size), stateGen: new Int32Array(size), final: new Int16Array(size), written: new Int32Array(size),
  };
}
function scratch(size: number) {
  if (scratchBuffers.size < size) { scratchBuffers = makeScratch(Math.ceil(size * 1.25)); scratchGen = 0; }
  if (scratchGen >= 0x7ffffff0) { scratchBuffers.ownerGen.fill(0); scratchBuffers.stateGen.fill(0); scratchGen = 0; }
  return scratchBuffers;
}

/**
 * Each clump's cells (x before its sway shift, y, colour index), in the order first set. They do not
 * depend on the wind (`dx` only shifts them), so a tree's sway frames, baked one after another,
 * share them: keyed by everything else the cells do depend on, the last few kept.
 */
type ClumpCells = { x: Int32Array; y: Int32Array; color: Int16Array };
const cellCache = new Map<string, ClumpCells[]>();
const CELL_CACHE_SIZE = 6;
function canopyKey(clumps: readonly Clump[], foliage: Foliage, crown: Ellipse, seed: number): string {
  const parts: (string | number)[] = [seed, crown.x, crown.y, crown.rx, crown.ry, foliage.ramp.join(","), foliage.step.join(","), foliage.outlineLeaves ? 1 : 0,
    foliage.odd ? `${foliage.odd.ramp.join(",")}@${foliage.odd.chance}` : "-", foliage.leaves.map((l) => l.join("/")).join("|")];
  for (const c of clumps) {
    const m = c.mass;
    parts.push(c.x, c.y, c.rx, c.ry, c.shift ?? "", c.seed ?? "", c.group ?? "", m ? `${m.x},${m.y},${m.rx},${m.ry}` : "");
  }
  return parts.join(";");
}

/**
 * Draw foliage clumps back to front. Each clump is shaded as a ball within the crown (`crown`, the
 * whole canopy's ellipse, darkens the underside and lights the upper-left), gets a scalloped rim
 * from the leaves that overhang it, and cuts a dark seam into the clumps already drawn behind it.
 * `dx` shifts clumps sideways by their `sway` for a wind frame.
 *
 * Ticket 0203 made this fast without changing a pixel: the per-clump cells and the crown's owners
 * live in typed grids over the crown's bounds (with an insertion-order list standing in for a Map's
 * order), leaf drawings are parsed once, and nothing is allocated per pixel.
 */
export function canopy(
  p: Px, clumps: readonly Clump[], foliage: Foliage,
  crown: { x: number; y: number; rx: number; ry: number }, options: { seed?: number; dx?: number } = {},
): Px {
  const { ramp, leaves, step } = foliage;
  const n = ramp.length;
  const seed = options.seed ?? 1;
  const odd = foliage.odd;
  // Colours by index: the ramp, then the off-colour ramp.
  const colors: Color[] = odd ? [...ramp, ...odd.ramp] : [...ramp];
  const grids = leaves.map(leafGrid);
  let leafW = 1, leafH = 1;
  for (const g of grids) { leafW = Math.max(leafW, g.stride); leafH = Math.max(leafH, g.h); }
  // One grid over every pixel any clump can touch: body, jittered leaves with their outlines, seams.
  const margin = 8 + Math.max(leafW, leafH);
  let X0 = Infinity, Y0 = Infinity, X1 = -Infinity, Y1 = -Infinity;
  for (const c of clumps) {
    const off = Math.round((c.sway ?? 0) * (options.dx ?? 0));
    X0 = Math.min(X0, Math.floor(c.x - c.rx) + off - margin); X1 = Math.max(X1, Math.ceil(c.x + c.rx) + off + margin);
    Y0 = Math.min(Y0, Math.floor(c.y - c.ry) - margin); Y1 = Math.max(Y1, Math.ceil(c.y + c.ry) + margin);
  }
  if (!clumps.length) return p;
  const GW = X1 - X0 + 1, GH = Y1 - Y0 + 1;
  const at = (x: number, y: number) => {
    const gx = x - X0, gy = y - Y0;
    if (gx < 0 || gy < 0 || gx >= GW || gy >= GH) throw new Error(`canopy: pixel ${x},${y} outside its grid`);
    return gy * GW + gx;
  };
  const { owner, ownerGen, cell, order, state, stateGen, final, written } = scratch(GW * GH);
  const gen = ++scratchGen;
  // Which group drew each pixel (valid where `ownerGen` is this call's): clumps of one mass melt
  // together, masses cut seams into each other.
  const ownerOf = (i: number) => (ownerGen[i] === gen ? owner[i] : NO_OWNER);
  // This clump's cells: colour index + 1 (0 = none), and the order they were first set in.
  let count = 0;
  const set = (x: number, y: number, color: number) => {
    const i = at(x, y);
    if (!cell[i]) order[count++] = i;
    cell[i] = color + 1;
  };
  const seamAt: number[] = [], seamColor: number[] = [];
  // Overdraw resolved here, each pixel written to `p` once at the end: what `p` held before
  // (-2 not looked at yet, -1 outside the clip, 0 transparent, 1 art), and the last colour written
  // (index + 1, 0 = never), with the order pixels were first written in.
  let writes = 0;
  const stateAt = (i: number) => {
    if (stateGen[i] !== gen) { stateGen[i] = gen; state[i] = p.peek((i % GW) + X0, Math.floor(i / GW) + Y0); }
    return state[i];
  };
  const write = (i: number, color: number) => {
    if (!final[i]) written[writes++] = i;
    final[i] = color + 1;
    state[i] = 1;
  };
  const mode = p.drawMode;
  // Value structure per mass: a yellow-green rim on its sunny upper left (the ramp's last tone,
  // used nowhere else), a mid body, and a dark underside; the whole crown darkens to the lower right.
  const body = n - 2; // highest tone a leaf may take away from the rim
  const toneAt = (c: Clump, x: number, y: number): number => {
    const m = c.mass ?? c;
    const mu = (x - m.x) / m.rx, mv = (y - m.y) / m.ry;
    const local = sphereLight((x - c.x) / c.rx, (y - c.y) / c.ry);
    const massL = sphereLight(mu * 0.95, mv * 0.95);
    const global = sphereLight((x - crown.x) / crown.rx * 0.9, (y - crown.y) / crown.ry * 0.9);
    let t = 0.2 * local + 0.5 * massL + 0.3 * global + (c.shift ?? 0) * 0.12;
    if (mv > 0.3) t -= (mv - 0.3) * 0.55;
    const rim = (c.shift ?? 0) >= 0 && mu * mu + mv * mv > 0.55 && mu * 0.55 + mv * 0.85 < -0.5 && global > 0.35;
    t = clamp(t, 0, 0.999);
    return rim ? n - 1 : clamp(1 + Math.floor(Math.pow(t, 1.15) * body * 1.08), 1, body);
  };
  const [sx, sy] = step;
  const cacheKey = canopyKey(clumps, foliage, crown, seed);
  const cached = cellCache.get(cacheKey);
  const recorded: ClumpCells[] = [];
  for (let ci = 0; ci < clumps.length; ci++) {
    const c = clumps[ci];
    const off = Math.round((c.sway ?? 0) * (options.dx ?? 0));
    const cs = (c.seed ?? ci * 31) + seed * 977;
    count = 0;
    const known = cached?.[ci];
    if (known) {
      // Recorded cells are already unique: no first-set check needed.
      const kx = known.x, ky = known.y, kc = known.color;
      for (let k = 0; k < kx.length; k++) { const i = at(kx[k] + off, ky[k]); order[count++] = i; cell[i] = kc[k] + 1; }
    } else {
    // Body: a step darker than the leaves, so gaps read as depth.
    for (let y = Math.floor(c.y - c.ry); y <= Math.ceil(c.y + c.ry); y++)
      for (let x = Math.floor(c.x - c.rx); x <= Math.ceil(c.x + c.rx); x++) {
        const u = (x + 0.5 - c.x) / (c.rx - 0.5), v = (y + 0.5 - c.y) / (c.ry - 0.5);
        if (u * u + v * v > 1) continue;
        set(x + off, y, Math.max(1, Math.min(body, toneAt(c, x, y)) - 1));
      }
    // Leaves on a jittered grid, local to the clump so the texture rides along when it sways.
    for (let j = -1, gy = c.y - c.ry - 2; gy <= c.y + c.ry + 1; j++, gy += sy)
      for (let gx = c.x - c.rx - 3 + ((j & 1) ? sx / 2 : 0); gx <= c.x + c.rx + 1; gx += sx) {
        const lx = Math.round(gx - c.x), ly = Math.round(gy - c.y);
        const h = hash(lx, ly, cs);
        const leaf = grids[Math.floor(hash(ly, lx, cs + 5) * grids.length)];
        const lw = leaf.w, lh = leaf.h, ls = leaf.stride, lt = leaf.tone;
        const x0 = Math.round(gx + (hash(lx, ly, cs + 1) - 0.5) * 2), y0 = Math.round(gy + (hash(lx, ly, cs + 2) - 0.5) * 2);
        const cx = x0 + lw / 2, cy = y0 + lh / 2;
        const u = (cx - c.x) / c.rx, v = (cy - c.y) / c.ry;
        if (u * u + v * v > 1.02) continue;
        const base = toneAt(c, cx, cy);
        const tone = base - (h < 0.06 ? 1 : 0);
        const cap = base === n - 1 ? n - 1 : body;
        const oddLeaf = odd && hash(lx, ly, cs + 9) < odd.chance;
        const flip = hash(lx, ly, cs + 3) < 0.5;
        if (foliage.outlineLeaves) {
          const ring = Math.max(0, Math.min(1, base - 3));
          for (let rj = -1; rj <= lh; rj++) for (let ri = -1; ri <= lw; ri++) {
            if (rj >= 0 && rj < lh && ri >= 0 && ri < lw && lt[rj * ls + ri] >= 0) continue;
            const on = (i: number, k: number) => k >= 0 && k < lh && i >= 0 && i < lw && lt[k * ls + i] >= 0;
            if (on(ri + 1, rj) || on(ri - 1, rj) || on(ri, rj + 1) || on(ri, rj - 1)) set(x0 + (flip ? lw - 1 - ri : ri) + off, y0 + rj, ring);
          }
        }
        for (let rj = 0; rj < lh; rj++) for (let ri = 0; ri < ls; ri++) {
          const d = lt[rj * ls + ri];
          if (d < 0) continue;
          const t = clamp(tone + d - 2, 1, cap);
          set(x0 + (flip ? lw - 1 - ri : ri) + off, y0 + rj, oddLeaf ? n + clamp(t - 1, 0, odd.ramp.length - 1) : t);
        }
      }
    const cells: ClumpCells = { x: new Int32Array(count), y: new Int32Array(count), color: new Int16Array(count) };
    for (let k = 0; k < count; k++) {
      const i = order[k];
      cells.x[k] = (i % GW) + X0 - off; cells.y[k] = Math.floor(i / GW) + Y0; cells.color[k] = cell[i] - 1;
    }
    recorded.push(cells);
    }
    // The seam: where this clump overlaps the ones behind, a dark rim on its lower right, a softer
    // one on its upper left. Only over existing art, so the silhouette is left to the final outline.
    const group = c.group ?? -1 - ci;
    seamAt.length = 0; seamColor.length = 0;
    for (let k = 0; k < count; k++) {
      const i = order[k];
      for (let d = 0; d < 4; d++) {
        const dx = d === 0 ? 1 : d === 2 ? -1 : 0, dy = d === 1 ? 1 : d === 3 ? -1 : 0;
        const ni = i + dy * GW + dx;
        if (!cell[ni] && ownerOf(ni) !== group) { seamAt.push(ni); seamColor.push(dx + dy > 0 ? 0 : 1); }
      }
    }
    // Seams land only on art (as `p.over` would); then the clump's cells, in the caller's mode.
    for (let k = 0; k < seamAt.length; k++) if (stateAt(seamAt[k]) === 1) write(seamAt[k], seamColor[k]);
    for (let k = 0; k < count; k++) {
      const i = order[k], st = stateAt(i);
      if (st >= 0 && (mode === "normal" || (mode === "over" ? st === 1 : st === 0))) write(i, cell[i] - 1);
      owner[i] = group;
      ownerGen[i] = gen;
      cell[i] = 0;
    }
  }
  if (!cached) {
    cellCache.set(cacheKey, recorded);
    if (cellCache.size > CELL_CACHE_SIZE) cellCache.delete(cellCache.keys().next().value!);
  }
  for (let k = 0; k < writes; k++) {
    const i = written[k];
    p.put((i % GW) + X0, Math.floor(i / GW) + Y0, colors[final[i] - 1]);
    final[i] = 0;
  }
  return p;
}

export type Ellipse = { x: number; y: number; rx: number; ry: number };

/** Smooth 2-D value noise, 0..1, with cells `sx` by `sy` px. */
export function noise2(x: number, y: number, seed: number, sx = 6, sy = 4): number {
  const fx = x / sx, fy = y / sy, ix = Math.floor(fx), iy = Math.floor(fy);
  const u = fx - ix, v = fy - iy, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
  const a = hash(ix, iy, seed), b = hash(ix + 1, iy, seed), c = hash(ix, iy + 1, seed), d = hash(ix + 1, iy + 1, seed);
  return lerp(lerp(a, b, su), lerp(c, d, su), sv);
}

/**
 * Punch see-through gaps in a finished crown: sky-and-ground holes, each with the shaded
 * undersides of the leaves above it darkened and the lit tops below it left alone.
 */
export function punchGaps(p: Px, gaps: readonly Ellipse[], dark: Color): Px {
  const hole = (x: number, y: number) => gaps.some((g) => ((x + 0.5 - g.x) / g.rx) ** 2 + ((y + 0.5 - g.y) / g.ry) ** 2 <= 1);
  const rim: [number, number][] = [];
  for (const g of gaps) for (let y = Math.floor(g.y - g.ry) - 1; y <= g.y + g.ry + 1; y++) for (let x = Math.floor(g.x - g.rx) - 1; x <= g.x + g.rx + 1; x++) {
    if (hole(x, y)) continue;
    if (hole(x, y + 1) || hole(x + 1, y) || hole(x - 1, y) || hole(x, y - 1)) rim.push([x, y]);
  }
  for (const g of gaps) for (let y = Math.floor(g.y - g.ry); y <= g.y + g.ry; y++) for (let x = Math.floor(g.x - g.rx); x <= g.x + g.rx; x++) if (hole(x, y)) p.px(x, y, null);
  p.over(() => { for (const [x, y] of rim) p.px(x, y, dark); });
  return p;
}

/**
 * A crown built of separate masses, each a cloud of clumps on the end of a limb, so the limbs show
 * in the gaps between them. Masses are drawn top first; every clump's sway is measured against the
 * whole crown, so the top of the tree moves and the underside stays put.
 */
export function massClumps(crown: Ellipse, masses: readonly Ellipse[], r: number, seed: number, squash = 0.8): Clump[] {
  return [...masses].sort((a, b) => a.y - b.y).flatMap((m, i) => crownClumps(m, Math.min(r, m.rx * 0.8, m.ry), seed + i * 7, { squash })
    .map((c) => ({ ...c, mass: m, group: i, sway: clamp((crown.y + crown.ry * 0.3 - c.y) / (crown.ry * 1.1), 0, 1) })));
}

/**
 * Lay out clumps inside a crown ellipse: rows of overlapping balls, jittered by `seed`, ordered
 * back (top) to front (bottom). `r` is the typical clump radius. Clumps near the top sway most.
 */
export function crownClumps(crown: { x: number; y: number; rx: number; ry: number }, r: number, seed: number, options: { flat?: number; squash?: number } = {}): Clump[] {
  const out: Clump[] = [];
  const squash = options.squash ?? 0.8;
  const rows = Math.max(2, Math.round((crown.ry * 2 - r * 0.6) / (r * 1.05)));
  for (let j = 0; j < rows; j++) {
    const y = crown.y - crown.ry + r * squash + (j * (crown.ry * 2 - r * squash * 2)) / Math.max(1, rows - 1);
    const v = (y - crown.y) / crown.ry;
    const half = crown.rx * Math.sqrt(Math.max(0, 1 - v * v)) - r * 0.7;
    const count = Math.max(1, Math.round((half * 2) / (r * 1.35)) + 1);
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const jx = (hash(i, j, seed) - 0.5) * r * 0.6, jy = (hash(j, i, seed + 1) - 0.5) * r * 0.5;
      const k = 0.8 + hash(i + 7, j, seed + 2) * 0.45;
      out.push({
        x: crown.x - half + t * half * 2 + jx, y: y + jy, rx: r * k, ry: r * k * squash,
        sway: clamp((crown.y + crown.ry * 0.25 - y) / (crown.ry * 1.1), 0, 1), seed: seed + i * 13 + j * 101,
      });
    }
  }
  return out.sort((a, b) => a.y - b.y || a.x - b.x);
}

// ── bark ──────────────────────────────────────────────────────────────────────

/** Three tones (shade, body, lit) per bark material. */
export type Bark = {
  materials: readonly (readonly [Color, Color, Color])[]; pick: (cell: number, y: number) => number; cell: readonly [number, number]; seams?: boolean;
  /** Deep fissures between bark plates in this colour, instead of a soft step. */
  fissure?: Color;
};

/**
 * London plane: the outer grey-brown bark flakes away in jigsaw patches, showing olive, cream and
 * a fresh greenish layer underneath. `top` (y of the crown) lets patches pale toward the crown,
 * as old plane limbs are almost white.
 */
export function planeBark(seed: number, top: number, bottom: number): Bark {
  return {
    materials: [
      ["stone1", "stone2", "stone3"], // grey-brown outer bark
      ["bamboo1", "bamboo2", "bamboo3"], // olive
      ["stone3", "stone4", "cream4"], // cream, freshly exposed
      ["jade2", "jade3", "jade4"], // green underbark, rare
    ],
    cell: [5, 7],
    seams: true,
    pick: (cell, y) => {
      const h = hash(cell, 3, seed);
      const pale = clamp((bottom - y) / Math.max(1, bottom - top), 0, 1); // 0 at the base, 1 at the crown
      if (h < 0.06) return 3;
      if (h < 0.56 - pale * 0.22) return 0;
      if (h < 0.86 - pale * 0.26) return 1;
      return 2;
    },
  };
}

/** Camphor: grey-brown bark broken by deep fissures into small, thick, slightly lifted plates. */
export function camphorBark(seed: number): Bark {
  return {
    materials: [["wood1", "wood2", "wood3"], ["brown1", "brown2", "brown3"], ["stone1", "stone2", "stone3"], ["wood2", "wood3", "wood4"]],
    cell: [4, 7],
    seams: true,
    fissure: "ink2",
    pick: (cell) => { const h = hash(cell, 9, seed); return h < 0.4 ? 0 : h < 0.72 ? 1 : h < 0.9 ? 2 : 3; },
  };
}

/** Fig: smooth pale grey, with the odd darker ring. */
export function figBark(seed: number): Bark {
  return {
    materials: [["steel2", "steel3", "steel4"], ["stone2", "stone3", "stone4"], ["stone1", "steel2", "steel3"]],
    cell: [6, 3],
    seams: true,
    pick: (cell) => { const h = hash(cell, 1, seed); return h < 0.55 ? 0 : h < 0.85 ? 1 : 2; },
  };
}

/** Voronoi cell id and edge flag for bark patches. */
function barkCell(x: number, y: number, size: readonly [number, number], seed: number): { id: number; edge: boolean; below: boolean } {
  const [cw, ch] = size;
  const gx = Math.floor(x / cw), gy = Math.floor(y / ch);
  let best = Infinity, second = Infinity, id = 0, bestY = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const cx = (gx + i + 0.15 + hash(gx + i, gy + j, seed) * 0.7) * cw, cy = (gy + j + 0.15 + hash(gy + j, gx + i, seed + 1) * 0.7) * ch;
    const d = ((x + 0.5 - cx) / cw) ** 2 + ((y + 0.5 - cy) / ch) ** 2;
    if (d < best) { second = best; best = d; id = (gx + i) * 7919 + (gy + j) * 104729; bestY = cy; }
    else if (d < second) second = d;
  }
  return { id, edge: Math.sqrt(second) - Math.sqrt(best) < 0.16, below: y + 0.5 > bestY };
}

/**
 * A limb or trunk from (x0, y0) at the bottom to (x1, y1) at the top, bending through `bend` px
 * sideways at its middle, `w0` wide at the bottom and `w1` at the top. Shaded as a cylinder lit
 * from the left. Rows are horizontal spans, so keep limbs steeper than about 40 degrees.
 */
export function limb(p: Px, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, bark: Bark, options: { bend?: number; seed?: number; flare?: number; shadeAbove?: number } = {}): Px {
  const seed = options.seed ?? 1, bend = options.bend ?? 0, flare = options.flare ?? 0;
  const shadeAbove = options.shadeAbove ?? -Infinity;
  const top = Math.round(Math.min(y0, y1)), bottom = Math.round(Math.max(y0, y1));
  for (let y = top; y <= bottom; y++) {
    const s = (y0 - y) / Math.max(1, y0 - y1); // 0 at the bottom, 1 at the top
    const cx = lerp(x0, x1, s) + bend * 4 * s * (1 - s);
    const rowsUp = y0 - y;
    const w = lerp(w0, w1, s) + (flare && rowsUp < 6 ? flare * ((6 - rowsUp) / 6) ** 2 : 0);
    const left = Math.round(cx - w / 2), width = Math.max(1, Math.round(w));
    for (let i = 0; i < width; i++) {
      const x = left + i;
      const u = (i + 0.5) / width;
      const cell = barkCell(x, y, bark.cell, seed);
      const mat = bark.materials[bark.pick(cell.id, y)];
      let level = u < 0.18 ? 2 : u < 0.62 ? 1 : 0;
      if (bark.fissure && cell.edge) {
        // A fissure: dark, but its lower lip catches light where a plate lifts.
        p.px(x, y, cell.below && u < 0.6 ? mat[Math.min(2, level + 1)] : u < 0.15 ? mat[0] : bark.fissure);
        continue;
      }
      if (bark.seams && cell.edge) level = cell.below ? Math.min(2, level + 1) : Math.max(0, level - 1);
      if (width >= 4 && i === width - 1) level = 0;
      // Inside the crown the limbs are in leaf shade.
      if (y < shadeAbove) level = Math.max(0, Math.min(1, level) - (y < shadeAbove - 6 ? 1 : 0));
      p.px(x, y, mat[level]);
    }
  }
  return p;
}

/** Vertical furrows over a trunk already drawn: broken dark streaks, for camphor and old wood. */
export function furrows(p: Px, x: number, y: number, w: number, h: number, dark: Color, seed: number): Px {
  p.over(() => {
    for (let i = 1; i < w - 1; i += 2 + Math.floor(hash(i, 0, seed) * 2))
      for (let j = 0; j < h; j++) if (hash(i, Math.floor(j / 4), seed + 1) < 0.72) p.px(x + i + (hash(i, Math.floor(j / 7), seed + 2) < 0.3 ? 1 : 0), y + j, dark);
  });
  return p;
}

// ── tree bases ────────────────────────────────────────────────────────────────

/**
 * A square cast-iron tree grate filling `size` px with the trunk opening at its centre: two halves
 * with a seam, concentric slots broken by spokes, raised bars lit on their upper-left edges, rust
 * where water sits. Drawn in the canopy's shade, so the iron stays dark.
 */
export function ironGrate(p: Px, x: number, y: number, size: number, hole: number, seed: number): Px {
  const c = size / 2;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const dx = i + 0.5 - c, dy = j + 0.5 - c;
    const r = Math.hypot(dx, dy);
    const edge = i === 0 || j === 0 || i === size - 1 || j === size - 1;
    let col: Color;
    if (r < hole) col = r < hole - 1 ? "brown1" : "ink2";
    else if (edge) col = i === size - 1 || j === size - 1 ? "steel1" : "steel3";
    else if (i === 1 || j === 1) col = "steel2";
    else {
      const ang = Math.atan2(dy, dx);
      const spoke = Math.abs(Math.sin(ang * 4)) < 0.16 + 1.2 / Math.max(r, 1);
      const ring = (r - hole) % 5;
      const slot = !spoke && ring >= 2.6 && ring < 4.2 && r < c - 2;
      const seam = Math.abs(dx) < 0.6;
      if (seam) col = "steel1";
      else if (slot) col = (r - hole) % 5 < 3.1 && dy < 0 ? "steel1" : "ink";
      else col = ring < 1 && dy < 0 ? "steel3" : ring >= 4.2 && dy > 0 ? "steel1" : "steel2";
    }
    p.px(x + i, y + j, col);
  }
  // Rust pooling in the low corners and along a cracked spoke.
  p.over(() => {
    for (let k = 0; k < 5; k++) {
      const rx = x + 2 + Math.floor(hash(k, 1, seed) * (size - 5)), ry = y + 2 + Math.floor(hash(k, 2, seed) * (size - 5));
      if (Math.hypot(rx - x - c, ry - y - c) < hole + 2) continue;
      art(p, rx, ry, ["oO", "o."], { o: "orange1", O: "rose3" });
    }
  });
  return p;
}

/** A granite kerb square round a soil pit, with moss in the joints. */
export function kerbPit(p: Px, x: number, y: number, size: number, seed: number, fill: "soil" | "pebble" = "soil"): Px {
  // Kerb: top face 3px, a 2px front lip on the near edge.
  p.rect(x, y, size, size, "stone3");
  p.rect(x, y, size, 1, "stone5").rect(x, y, 1, size, "stone5");
  p.rect(x + size - 1, y, 1, size, "stone2").rect(x, y + size - 2, size, 2, "stone2").hline(x, y + size - 1, size, "stone1");
  for (const jx of [Math.floor(size / 3), Math.floor((size * 2) / 3)]) { p.vline(x + jx, y, 3, "stone2"); p.vline(x + jx, y + size - 4, 4, "stone1"); }
  p.speckle(x + 1, y + 1, size - 2, 2, "stone4", 0.25, seed);
  // The pit.
  const ix = x + 3, iy = y + 3, iw = size - 6, ih = size - 7;
  if (fill === "soil") {
    p.rect(ix, iy, iw, ih, "brown2").hline(ix, iy, iw, "brown1").vline(ix, iy, ih, "brown1");
    p.speckle(ix + 1, iy + 1, iw - 1, ih - 1, "brown3", 0.12, seed + 4);
    p.speckle(ix + 1, iy + 1, iw - 1, ih - 1, "wood1", 0.08, seed + 5);
  } else {
    // River pebbles, each lit on its upper left with a shadow tucked under it.
    p.rect(ix, iy, iw, ih, "stone2");
    for (let j = 0; j < ih; j += 3) for (let i = ((j / 3) % 2) * 2; i < iw - 1; i += 4) {
      const pale = hash(i, j, seed);
      const ox = i + Math.floor(hash(j, i, seed) * 2);
      p.clip(ix, iy, iw, ih, () => art(p, ox, j, [".ab", "abb", "ss."], pale < 0.4 ? { a: "cream5", b: "cream4", s: "stone3" } : pale < 0.8 ? { a: "stone5", b: "stone4", s: "stone2" } : { a: "stone4", b: "stone3", s: "stone1" }));
    }
    p.hline(ix, iy, iw, "stone1").vline(ix, iy, ih, "stone1");
  }
  // Moss creeping out of the kerb joints on the shady side.
  art(p, x + size - 3, y + 4, ["m", "Mm", "m"], { m: "leaf2", M: "leaf3" });
  return p;
}

/** Surface roots spreading from a trunk base at (x, y): low, lit on top, tucked into the ground. */
export function roots(p: Px, x: number, y: number, spread: readonly (readonly [number, number])[], bark: Bark, seed: number): Px {
  for (const [dx, dy] of spread) {
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const px = Math.round(x + dx * t), py = Math.round(y + dy * t);
      const w = Math.max(1, Math.round(4 * (1 - t)));
      for (let k = 0; k < w; k++) {
        const cell = barkCell(px, py + k, bark.cell, seed);
        const mat = bark.materials[bark.pick(cell.id, py)];
        p.px(px, py - Math.floor(w / 2) + k, mat[k === 0 ? 2 : k === w - 1 ? 0 : 1]);
      }
    }
  }
  return p;
}

// ── small leaves and flowers ────────────────────────────────────────────────────

/** Plane leaves, five-lobed and broad, for canopies and the fallen-leaf scatter. */
export const PLANE_LEAVES: readonly (readonly string[])[] = [
  [".3.3.", "33322", ".222.", "..1.."],
  ["3.3..", "3332.", ".2221", "..1.."],
  [".33.", "3322", ".21."],
  ["..3.", "3332", "3222", ".21."],
];
/** Plane leaves gathered into clusters of three or four, lit on their upper left: the crown's grain. */
export const PLANE_CLUSTERS: readonly (readonly string[])[] = [
  ["..3.3..", ".33332.", "3332222", ".322221", "..2211."],
  [".3.3...", "333322.", "3322221", ".22111.", "..1...."],
  ["..33.", ".3332", "33222", ".2221", "..11."],
];
/** Camphor leaves in small dense sprays. */
export const CAMPHOR_CLUSTERS: readonly (readonly string[])[] = [[".33.", "3322", "2221", ".11."], ["33..", "3322", ".221", "..1."], [".3.", "332", "221"]];
/** Camphor: small glossy ovals, tight. */
export const CAMPHOR_LEAVES: readonly (readonly string[])[] = [["33", "22", "1."], ["3.", "32", "21"], [".3", "32", "2."]];
/** Fig: big three-lobed leaves. */
export const FIG_LEAVES: readonly (readonly string[])[] = [
  ["3..3..3", "33.33.3", "3333322", ".33222.", "..222..", "...1..."],
  [".3...3.", "333.332", ".33322.", "..222..", "...1..."],
];
/** Boxwood and privet: tiny leaves, packed. */
export const BOX_LEAVES: readonly (readonly string[])[] = [["32", "21"], ["3.", "22"], [".3", "32"], ["33", "2."]];
/** Clipped hedge surface: soft rounded tufts, each lit on its upper left, so the shear-cut face reads bumpy, not noisy. */
export const TUFTS: readonly (readonly string[])[] = [
  [".33.", "3322", "2221", ".11."],
  ["..3..", ".332.", "32221", ".221."],
  [".3.", "322", ".1."],
  [".333.", "33222", "22221", ".211."],
  ["33.", "322", "21."],
];

/** A fallen plane leaf, 8×8, lying flat: a palmate blade with a stem. `ramp` is 3 tones. */
export const FALLEN_LEAF = [
  "....3...",
  "3..333.2",
  "33.3322.",
  ".3333222",
  "33332222",
  ".322221.",
  "...1.1..",
  "....1...",
];

export type Flower = { legend: Legend; rows: readonly string[] };
/** Stamp a flower or tuft by rows, `.` empty. */
export function flower(p: Px, x: number, y: number, f: Flower, flipX = false): Px {
  const rows = flipX ? f.rows.map((r) => [...r].reverse().join("")) : f.rows;
  return p.rows(x, y, rows, f.legend);
}

/** Simple bezier-free leaf-on-stem lance for grasses: from base up toward (dx, dy). */
export function blade(p: Px, x: number, y: number, dx: number, dy: number, lit: Color, dark: Color): Px {
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    p.px(Math.round(x + dx * t * t), Math.round(y + dy * t), t > 0.5 ? lit : dark);
  }
  return p;
}

export { clamp, lerp };

// ── clipped faces (hedges) ─────────────────────────────────────────────────────

/**
 * A clipped face of small leaves: a darker body, then leaves stamped on a tight grid whose tone
 * follows `light(x, y)` (0 shade .. 1 sun, in canvas px). Used for hedge tops and fronts.
 */
export function leafFace(
  p: Px, x: number, y: number, w: number, h: number, ramp: readonly Color[], light: (x: number, y: number) => number,
  seed: number, leaves: readonly (readonly string[])[] = BOX_LEAVES, step: readonly [number, number] = [3, 2],
): Px {
  const n = ramp.length;
  const tone = (t: number) => clamp(1 + Math.floor(clamp(t, 0, 0.999) * (n - 1)), 1, n - 1);
  p.clip(x, y, w, h, () => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.px(i, j, ramp[Math.max(0, tone(light(x + i, y + j)) - 1)]);
    // Tufts on a loose grid: each row starts somewhere new, spacing and nudges vary, and they are
    // laid in a shuffled order, so overlaps never line up into a woven diagonal.
    const tufts: [number, number, number][] = [];
    for (let j = -1, gy = -1; gy < h; j++, gy += step[1]) {
      let gx = -3 + Math.floor(hash(j, y, seed + 7) * step[0]);
      while (gx < w) {
        const hx = x + gx, hy = y + gy;
        tufts.push([gx + Math.floor(hash(hx, hy, seed + 1) * 3) - 1, gy + Math.floor(hash(hx, hy, seed + 2) * 3) - 1, hash(hx, hy, seed + 3)]);
        gx += step[0] - 1 + Math.floor(hash(hx, hy, seed + 4) * 3);
      }
    }
    tufts.sort((a, b) => a[2] - b[2]);
    for (const [ox, oy, k] of tufts) {
      const hx = x + ox, hy = y + oy;
      const leaf = leaves[Math.floor(k * 997) % leaves.length];
      const flip = false; // mirrored tufts would be lit from the wrong side
      const hh = hash(hx, hy, seed);
      const t = tone(light(x + ox + 2, y + oy + 1)) + (hh < 0.06 ? -1 : 0);
      const lw = Math.max(...leaf.map((r) => r.length));
      leaf.forEach((row, rj) => { for (let ri = 0; ri < row.length; ri++) if (row[ri] !== ".") p.px(ox + (flip ? lw - 1 - ri : ri), oy + rj, ramp[clamp(t + Number(row[ri]) - 2, 1, n - 1)]); });
    }
  });
  return p;
}

/** Smooth 1-D value noise in 0..1 for slow wobbles along a hedge. */
export function wobble(t: number, seed: number, period = 24): number {
  const i = Math.floor(t / period), f = t / period - i;
  const s = f * f * (3 - 2 * f);
  return lerp(hash(i, 0, seed), hash(i + 1, 0, seed), s);
}

// ── small plants set into soil ──────────────────────────────────────────────────

const PLANT_OUTLINE = { leaf: "leaf1", jade: "jade1", orange: "brown1", gold: "wood1", pink: "plum1", plum: "plum1", cream: "leaf1", white: "leaf1", red: "red1", bamboo: "wood1", rose: "rose1" } as const;

/**
 * Draw a small plant into its own canvas, outline it in its own darkest tones, and stamp it at
 * (x, y). Plants set into soil need this: the soil round them is not transparent, so a final
 * whole-sprite outline would never find their edges.
 */
export function sticker(p: Px, x: number, y: number, w: number, h: number, draw: (q: Px) => void, map: Partial<Record<string, Color>> = {}): Px {
  const q = new Px(w + 2, h + 2);
  q.clip(1, 1, w, h, () => draw(q));
  autoOutline(q, { map: { ...PLANT_OUTLINE, ...map } });
  return p.blit(q, x - 1, y - 1);
}

/** A foliage mound: one clump of small leaves lit from the upper left. */
export function mound(p: Px, cx: number, cy: number, rx: number, ry: number, ramp: readonly Color[], seed: number, leaves: readonly (readonly string[])[] = BOX_LEAVES, step: readonly [number, number] = [3, 2]): Px {
  return canopy(p, [{ x: cx, y: cy, rx, ry, seed }], { ramp, leaves, step }, { x: cx, y: cy, rx, ry }, { seed });
}

/** A round flower head, 3×3 with a lit upper left: `tones` are [dark, mid, light, centre]. */
export function bloom(p: Px, x: number, y: number, tones: readonly [Color, Color, Color, Color]): Px {
  const [d, m, l, c] = tones;
  return p.rows(x, y, [".lm.", "lcmd", "mmdd", ".dd."], { l, m, d, c });
}

/** A five-petalled flower, 3×3: petals round a centre. */
export function star(p: Px, x: number, y: number, petal: Color, shade: Color, centre: Color): Px {
  return p.rows(x, y, [".p.", "pcs", ".s."], { p: petal, s: shade, c: centre });
}

// ── crowns and their shade, for any tree generator ─────────────────────────────

/**
 * A crown's masses round a dome, from low on one side over the top to low on the other, a heavier
 * heart mass, and (when `hang`) one or two hanging lower at the sides, leaving the middle of the
 * underside open so the fork and limbs show. Deterministic from `seed`.
 */
export function domeMasses(crown: Ellipse, seed: number, options: { count?: number; size?: number; hang?: boolean } = {}): Ellipse[] {
  const { x, y, rx, ry } = crown;
  const h = (k: number, s: number) => hash(k, s, seed);
  const n = options.count ?? 5 + Math.floor(h(0, 9) * 2);
  const base = options.size ?? 0.4;
  const out: Ellipse[] = [];
  for (let k = 0; k < n; k++) {
    const a = Math.PI * (1.08 + (0.84 * (k + (h(k, 1) - 0.5) * 0.5)) / Math.max(1, n - 1));
    const size = base + h(k, 2) * 0.16;
    const mrx = rx * size, mry = ry * size * 1.15;
    out.push({ x: x + Math.cos(a) * (rx - mrx) * 0.98, y: y + Math.sin(a) * (ry - mry) * 0.95 + ry * 0.08, rx: mrx, ry: mry });
  }
  out.push({ x: x + (h(7, 3) - 0.5) * rx * 0.2, y: y - ry * 0.15, rx: rx * 0.45, ry: ry * 0.5 });
  if (options.hang ?? true) for (const side of [-1, 1]) {
    if (h(side + 3, 4) < 0.25) continue;
    const size = 0.3 + h(side + 3, 5) * 0.12;
    out.push({ x: x + side * rx * (0.62 + h(side + 3, 6) * 0.1), y: y + ry * (0.35 + h(side + 3, 7) * 0.15), rx: rx * size, ry: ry * size * 1.2 });
  }
  return out;
}

/**
 * A crown's dappled shade on the ground: each mass cast down and right by the sun and flattened onto
 * the ground about `groundY`, a ragged edge, a lighter fringe and sun-flecks, in translucent plum.
 * Returns the canvas box (in the tree's canvas coordinates) and a draw function for it.
 */
export function dappledShade(masses: readonly Ellipse[], crown: Ellipse, groundY: number, seed: number, options: { strength?: number; reach?: number } = {}) {
  const shiftX = Math.round(crown.rx * 0.3), shiftY = 8;
  const reach = options.reach ?? 0.32;
  const blobs = masses.map((m) => ({ x: m.x + shiftX, y: groundY + shiftY + (m.y - crown.y) * reach, rx: m.rx * 0.98, ry: m.ry * 0.46 }));
  const x0 = Math.floor(Math.min(...blobs.map((b) => b.x - b.rx * 1.15))) - 2, x1 = Math.ceil(Math.max(...blobs.map((b) => b.x + b.rx * 1.15))) + 2;
  const y0 = Math.floor(Math.min(...blobs.map((b) => b.y - b.ry * 1.15))) - 2, y1 = Math.ceil(Math.max(...blobs.map((b) => b.y + b.ry * 1.15))) + 2;
  const core = options.strength ?? 0.32;
  const draw = (p: Px) => {
    const flecks: Ellipse[] = [];
    const area = blobs.reduce((s, b) => s + b.rx * b.ry, 0);
    for (let k = 0; k < Math.round(area / 260); k++) {
      const b = blobs[Math.floor(hash(k, 1, seed) * blobs.length)];
      const a = hash(k, 2, seed) * Math.PI * 2, d = Math.sqrt(hash(k, 3, seed)) * 0.85;
      flecks.push({ x: b.x + Math.cos(a) * b.rx * d, y: b.y + Math.sin(a) * b.ry * d, rx: 1.5 + hash(k, 4, seed) * 2.5, ry: 1 + hash(k, 5, seed) * 1.2 });
    }
    const inFleck = (x: number, y: number) => flecks.find((f) => ((x + 0.5 - f.x) / f.rx) ** 2 + ((y + 0.5 - f.y) / f.ry) ** 2 <= 1);
    for (let j = 0; j < y1 - y0; j++) for (let i = 0; i < x1 - x0; i++) {
      const x = i + x0, y = j + y0;
      let d = Infinity;
      for (const b of blobs) d = Math.min(d, Math.hypot((x + 0.5 - b.x) / b.rx, (y + 0.5 - b.y) / b.ry));
      d += (noise2(x, y, seed, 7, 4) - 0.5) * 0.34;
      if (d > 1.08) continue;
      const f = inFleck(x, y);
      const inner = d < 0.86;
      if (f && (!inner || Math.max(f.rx, f.ry) > 2.6)) continue;
      p.faded(inner && !f ? core : core * 0.53, () => p.px(i, j, "plum1"));
    }
  };
  return { x0, y0, w: x1 - x0, h: y1 - y0, draw };
}

/**
 * Maps whose `tree` props are woodland trees (drawn by `woods.ts`, no grates, species mixed), not the
 * town's street planes (`trees.ts`).
 */
export const WOODLAND_MAPS: ReadonlySet<string> = new Set(["park", "riverbank"]);
