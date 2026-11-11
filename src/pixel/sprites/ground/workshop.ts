/**
 * The repair workshop's floor (ticket 0182). Placed by `src/pixel/town/ground-workshop-legend.ts`.
 *
 * - `workshop-planks`: old floorboards running east–west, oiled dark over sixty years, four boards to a
 *   tile, nail heads over the joists every 16 px, the odd short board let in where one split, sawdust in
 *   the joints by the benches, a knot, a ring where a paint tin stood.
 * - `workshop-stone`: worn granite flags at the door, 16 px slabs in staggered courses, polished pale
 *   where seventy years of feet came in.
 * - `workshop-cobbles`: the lane outside, small grey setts, moss in a joint, a puddle.
 * - `workshop-rug`: a woven indigo rug with a cream lattice and plum hearts, under each bench.
 * - `workshop-runner`: a striped jade-and-cream runner down the middle of the room.
 *
 * Seams: anything that crosses a tile edge (a board, a flag, a sett) has the same tone in every variant;
 * variants differ only inside. Edges: `ground/edge-workshop-…`.
 */
import { defineSprites, hash, Px, type Color, type SpriteDef } from "../../kit/index.ts";
import { T, inBlob, sided, stamp, tile, type Corner, type Side } from "./_helpers.ts";

const VARIANTS = ["a", "b", "c", "d"] as const;
const sprites: Record<string, SpriteDef> = {};

// ── planks ──────────────────────────────────────────────────────────────────

/** Each board's tone where it meets the next tile (the same in every variant). */
const BOARD_EDGE: readonly Color[] = ["wood3", "oak2", "wood3", "wood4"];
const BOARD_LIT: Partial<Record<Color, Color>> = { wood3: "wood4", oak2: "oak3", wood4: "wood5", rose3: "rose4" };
const BOARD_GRAIN: Partial<Record<Color, Color>> = { wood3: "wood2", oak2: "oak1", wood4: "wood3", rose3: "rose2" };

/** Short boards let in between two end joints, by variant: [board, x0, x1, tone]. */
const INSERTS: Record<string, readonly (readonly [number, number, number, Color])[]> = {
  a: [[1, 9, 22, "wood4"]],
  b: [[0, 14, 27, "oak2"], [2, 4, 15, "wood4"]],
  c: [[3, 8, 20, "wood3"]],
  d: [[1, 18, 29, "oak2"], [2, 6, 13, "wood4"]],
};

function planks(p: Px, v: string): void {
  for (let r = 0; r < 4; r++) {
    const y0 = r * 8, edge = BOARD_EDGE[r];
    p.rect(0, y0, T, 7, edge);
    p.hline(0, y0 + 7, T, "wood1");
    // The board's lit top arris, broken where it is worn.
    for (let x = 0; x < T; x++) if (hash(x >> 2, r, 3) > 0.35) p.px(x, y0, BOARD_LIT[edge] ?? edge);
    for (const [br, x0, x1, tone] of INSERTS[v]) if (br === r) {
      p.rect(x0, y0, x1 - x0, 7, tone);
      for (let x = x0; x < x1; x++) if (hash(x >> 2, r, 5) > 0.35) p.px(x, y0, BOARD_LIT[tone] ?? tone);
      p.vline(x0, y0, 7, "wood1").vline(x1, y0, 7, "wood1");
    }
    // Grain: short streaks, clear of the tile's edges.
    for (let i = 0; i < 4; i++) {
      const gx = 3 + Math.floor(hash(i, r, v.charCodeAt(0)) * 22), gy = y0 + 2 + Math.floor(hash(i, r + 9, v.charCodeAt(0)) * 4);
      const tone = p.get(gx, gy) ?? edge;
      p.hline(gx, gy, 3 + Math.floor(hash(i, r + 3, 7) * 4), BOARD_GRAIN[tone] ?? "wood2");
    }
    // Nail heads over the joists, every 16 px.
    for (const nx of [4, 20]) { p.px(nx, y0 + 2, "wood1"); p.px(nx, y0 + 5, "wood1"); p.px(nx + 1, y0 + 2, "steel3"); }
  }
  if (v === "c") {
    // Sawdust: drifts in the joints and a scatter on the boards.
    for (const [x, y] of [[6, 7], [7, 7], [8, 7], [12, 15], [13, 15], [22, 23], [23, 23], [24, 23], [25, 23]] as const) p.px(x, y, "oak5");
    stamp(p, 9, 18, [".ab.", "abba", ".b.."], { a: "oak5", b: "bamboo4" }, false);
    for (const [x, y] of [[17, 4], [26, 11], [11, 28], [20, 19]] as const) p.px(x, y, "bamboo5");
  }
  if (v === "d") {
    // A knot, and the ring where a paint tin stood.
    stamp(p, 7, 10, [".ab.", "acca", ".ab."], { a: "wood2", b: "wood3", c: "wood1" }, false);
    for (let y = 18; y < 28; y++) for (let x = 16; x < 28; x++) {
      const d = Math.hypot(x + 0.5 - 22, (y + 0.5 - 23) * 1.3);
      if (d > 4.2 && d < 5.4) p.px(x, y, "wood2");
    }
  }
}

// ── stone flags ─────────────────────────────────────────────────────────────

function flags(p: Px, v: string): void {
  const seed = v.charCodeAt(0);
  for (let course = 0; course < 2; course++) {
    const y0 = course * 16, off = course ? 8 : 0;
    for (let k = -1; k < 2; k++) {
      const x0 = k * 16 + off, crosses = x0 < 0 || x0 + 16 > T;
      const tone: Color = crosses || hash(k, course, seed) < 0.75 ? "stone4" : "stone3";
      for (let y = y0; y < y0 + 16; y++) for (let x = x0; x < x0 + 16; x++) {
        const xx = ((x % T) + T) % T;
        const jointX = x === x0, jointY = y === y0;
        p.px(xx, y, jointX || jointY ? "stone2" : (x === x0 + 1 || y === y0 + 1) ? "stone5" : tone);
      }
    }
  }
  // Polished pale where feet land, a chip, a crack.
  // Polished pale where feet land: the middle of the inner flags, one tone up, no dither.
  if (v !== "a") for (let y = 3; y < 29; y++) for (let x = 3; x < 29; x++) if (inBlob(x, y, 16, 16, 9, 7) && p.get(x, y) === "stone4") p.px(x, y, "stone5");
  if (v === "c") stamp(p, 20, 6, ["a...", ".a..", ".aa.", "...a"], { a: "stone2" }, false);
  if (v === "d") stamp(p, 6, 22, ["ab", "bb"], { a: "stone1", b: "stone2" }, false);
}

// ── cobbles ─────────────────────────────────────────────────────────────────

function cobbles(p: Px, v: string): void {
  const seed = v.charCodeAt(0);
  p.rect(0, 0, T, T, "steel1");
  for (let row = 0; row < 4; row++) {
    const y0 = row * 8, off = row % 2 ? 4 : 0;
    for (let k = -1; k < 4; k++) {
      const x0 = k * 8 + off, crosses = x0 < 0 || x0 + 8 > T;
      const tone: Color = crosses ? "stone3" : (["stone3", "steel3", "stone3", "stone2", "steel3"] as const)[Math.floor(hash(k, row, seed) * 5)];
      for (let y = y0; y < y0 + 7; y++) for (let x = x0; x < x0 + 7; x++) {
        // Rounded setts: the corners stay joint.
        const cx = x - x0, cy = y - y0;
        if ((cx === 0 || cx === 6) && (cy === 0 || cy === 6)) continue;
        const xx = ((x % T) + T) % T;
        p.px(xx, y, cy === 0 || cx === 0 ? (tone === "stone2" ? "stone3" : "stone4") : cy === 6 || cx === 6 ? "stone2" : tone);
      }
    }
  }
  if (v === "c") for (const [x, y] of [[8, 15], [16, 7], [17, 7], [12, 23], [24, 31], [20, 15]] as const) p.px(x, y, "leaf2");
  if (v === "d") p.faded(0.55, (q) => { for (let y = 8; y < 26; y++) for (let x = 6; x < 26; x++) if (inBlob(x, y, 16, 17, 9, 6)) q.px(x, y, (x + y) % 5 ? "blue3" : "blue5"); });
}

// ── rug and runner ──────────────────────────────────────────────────────────

/** The rug's field: indigo with a cream lattice every 16 px and a plum heart in each diamond. */
function rugField(p: Px, worn: boolean): void {
  p.rect(0, 0, T, T, "blue2");
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const u = x % 16, w = y % 16;
    if (Math.abs(u - w) === 0 || u + w === 15) p.px(x, y, "cream4");
    else if ((u + w) % 4 === 0 && (u - w) % 4 === 0) p.px(x, y, "blue3");
  }
  for (const [cx, cy] of [[7, 0], [7, 16], [0, 8], [16, 8]] as const) {
    stamp(p, cx - 1, cy - 1 + 8, [".a.", "aba", ".a."], { a: "plum3", b: "gold3" });
  }
  if (worn) for (let y = 6; y < 26; y++) for (let x = 6; x < 26; x++) if (inBlob(x, y, 16, 16, 10, 8) && (x * 3 + y) % 4 === 0) p.px(x, y, "blue3");
}

/** The runner: jade and cream stripes running north–south, repeating every 16 px across. */
function runnerField(p: Px, worn: boolean): void {
  const stripe: Color[] = ["cream4", "jade3", "jade3", "jade3", "jade2", "cream4", "jade4", "jade4", "jade4", "jade4", "cream4", "jade2", "jade3", "jade3", "jade3", "cream3"];
  for (let x = 0; x < T; x++) p.vline(x, 0, T, stripe[x % 16]);
  // The weave: every other row a step darker on the coloured stripes.
  for (let y = 1; y < T; y += 2) for (let x = 0; x < T; x++) { const c = p.get(x, y); if (c === "jade4") p.px(x, y, "jade3"); }
  if (worn) for (let y = 0; y < T; y += 3) for (let x = 10; x < 22; x++) if ((x + y) % 3 === 0) p.px(x, y, "cream3");
}

/** A woven border along one side: an outline, a cream line, a coloured band, fringe on the short ends. */
function border(p: Px, side: Side, band: Color, bandDark: Color, fringe: boolean): void {
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) {
      if (fringe) { if (a % 2 === 0) plot(a, 0, "cream5"); plot(a, 1, a % 2 ? "cream3" : "cream5"); }
      const o = fringe ? 2 : 0;
      plot(a, o, "ink2");
      plot(a, o + 1, "cream4");
      for (let d = o + 2; d < o + 5; d++) plot(a, d, a % 6 === 0 ? "cream4" : d === o + 4 ? bandDark : band);
      plot(a, o + 5, "cream4");
    }
  });
}

/** Where two borders meet: a little square knot in the corner. */
function borderCorner(p: Px, c: Corner, band: Color): void {
  const x0 = c.endsWith("w") ? 0 : T - 7, y0 = c.startsWith("n") ? 0 : T - 7;
  p.rect(x0, y0, 7, 7, "ink2");
  p.rect(x0 + 1, y0 + 1, 5, 5, band);
  p.rect(x0 + 2, y0 + 2, 3, 3, "gold3");
  p.px(x0 + 3, y0 + 3, "cream5");
}

// ── edges ───────────────────────────────────────────────────────────────────

/** Where the boards stop at the flags or the lane: an end board laid across, dark with oil. */
function plankEdge(p: Px, side: Side): void {
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) {
      plot(a, 0, "wood1");
      for (let d = 1; d < 5; d++) plot(a, d, d === 1 ? "wood3" : hash(a >> 2, d, 4) > 0.8 ? "wood1" : "wood2");
      plot(a, 5, "wood1");
    }
  });
}

/** The flags stand a little proud of the cobbles: a joint, then a lit arris. */
function stoneEdge(p: Px, side: Side): void {
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) { plot(a, 0, "stone1"); plot(a, 1, "stone2"); plot(a, 2, "stone5"); }
  });
}

// ── registration ────────────────────────────────────────────────────────────

for (const v of VARIANTS) {
  sprites[`ground/workshop-planks-${v}`] = tile((p) => planks(p, v));
  sprites[`ground/workshop-stone-${v}`] = tile((p) => flags(p, v));
  sprites[`ground/workshop-cobbles-${v}`] = tile((p) => cobbles(p, v));
}
sprites["ground/workshop-rug-a"] = tile((p) => rugField(p, false));
sprites["ground/workshop-rug-b"] = tile((p) => rugField(p, true));
sprites["ground/workshop-runner-a"] = tile((p) => runnerField(p, false));
sprites["ground/workshop-runner-b"] = tile((p) => runnerField(p, true));
for (const side of ["n", "s", "w", "e"] as const) {
  sprites[`ground/edge-workshop-planks-${side}`] = tile((p) => plankEdge(p, side));
  sprites[`ground/edge-workshop-stone-${side}`] = tile((p) => stoneEdge(p, side));
  sprites[`ground/edge-workshop-rug-${side}`] = tile((p) => border(p, side, "plum2", "plum1", side === "n" || side === "s"));
  sprites[`ground/edge-workshop-runner-${side}`] = tile((p) => border(p, side, "jade2", "jade1", side === "n" || side === "s"));
}
for (const c of ["nw", "ne", "sw", "se"] as const) {
  sprites[`ground/edge-workshop-rug-${c}`] = tile((p) => borderCorner(p, c, "plum2"));
  sprites[`ground/edge-workshop-runner-${c}`] = tile((p) => borderCorner(p, c, "jade2"));
}

export default defineSprites(sprites);
