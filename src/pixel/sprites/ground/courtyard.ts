/**
 * The courtyard behind the moon gate: a shikumen yard shared by three row houses, swept every morning,
 * never quite dry in the corners. Five materials, all quieter and greyer than the town lanes:
 *
 * - `brick-paving`: grey 青砖 laid in basket weave (pairs of bricks turning by the square), the
 *   courtyard's own pattern, unlike the lanes' brown herringbone.
 * - `courtyard-stone`: big granite slabs, worn pale where the bicycles stand; one has the drain.
 * - `moss-earth`: the damp packed earth of the beds and corners, moss on it and a few stones.
 * - `threshold-stone`: the long single granite sills of the hall approach, laid end to end in two rows
 *   per tile; variants differ only in where the joints fall, so sills of random length run across tiles.
 * - `worn-stone`: cobbles polished by a century of feet, with last night's puddles.
 *
 * Every pattern sits on a fixed lattice that repeats every 32 px, and anything that crosses a tile
 * edge is drawn the same in every variant, so any mix tiles. Edges (`ground/edge-moss-…`,
 * `edge-brick-paving-…`, `edge-cobble-…`, `edge-sill-…`) are overlays; the placement rules are in
 * `src/pixel/town/ground-courtyard-legend.ts`. The scene weights a and b heavily, c and d rarely.
 */
import { defineSprites, hash, type Color, type Legend, type Px, type SpriteDef } from "../../kit/index.ts";
import { T, inBlob, jitter, mod, sided, stamp, tile, wrap, type Corner, type Side } from "./_helpers.ts";

const L: Legend = {
  a: "stone1", b: "stone2", c: "stone3", d: "stone4", e: "stone5",
  g: "leaf2", G: "leaf3", M: "leaf1", m: "jade2", k: "jade3",
  i: "steel1", I: "steel2", j: "steel3", J: "steel4",
  o: "oak1", O: "oak2", q: "oak3", Q: "oak4", r: "brown2", t: "bamboo1",
  u: "blue4", U: "blue5", w: "white", R: "tan2", x: "tan1",
};

// ── brick-paving: grey basket weave ─────────────────────────────────────────

type Brick = { id: number; joint: boolean };
/** 8 px squares in a checker, each two 8×4 bricks lying down or two 4×8 bricks on edge. Joints right and bottom. */
function basketAt(x: number, y: number): Brick {
  const si = Math.floor(x / 8), sj = Math.floor(y / 8), lying = (si + sj) % 2 === 0;
  const idx = lying ? Math.floor((y % 8) / 4) : Math.floor((x % 8) / 4);
  const joint = lying ? x % 8 === 7 || y % 4 === 3 : x % 4 === 3 || y % 8 === 7;
  return { id: (si * 4 + sj) * 2 + idx, joint };
}
const BRICK_FACES: readonly [Color, number][] = [["stone3", 0.55], ["steel3", 0.75], ["cream1", 0.9], ["stone2", 1]];
const faceOf = (r: number) => BRICK_FACES.find(([, upTo]) => r < upTo)![0];

function basket(p: Px, seed: number, face?: (id: number) => Color | undefined) {
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const b = basketAt(x, y);
    p.px(x, y, b.joint ? "stone1" : face?.(b.id) ?? faceOf(hash(b.id, 3, seed)));
  }
}

/** Moss in joints inside a soft blob. */
function mossJoints(p: Px, cx: number, cy: number, rx: number, ry: number, seed: number, joint: Color = "stone1") {
  p.each((x, y, c) => (c === joint && inBlob(x, y, cx, cy, rx, ry) && hash(x >> 1, y >> 1, seed) < 0.6 ? (hash(x, y, seed + 1) < 0.2 ? "leaf2" : "jade2") : undefined));
}

// ── courtyard-stone: big granite slabs ──────────────────────────────────────

/**
 * Big granite slabs, a tile deep, laid in courses: every course's bed joint is on row 31, and a slab
 * ends at x 15 or x 31 depending on the variant, so slabs run 16, 32 or 48 px and more along a course
 * and no grid shows. Warm grey granite, darker than the sills, top lip catching the sun and the lower
 * lip settled, worn paler where feet and wheels pass, flecked in pairs.
 */
function slab(p: Px, seed: number, ends: readonly number[]) {
  p.rect(0, 0, T, T, "stone1");
  for (let j = 0; j < T - 1; j++) for (let x = 0; x < T; x++) {
    if (ends.includes(x)) continue;
    const start = ends.includes(mod(x - 1));
    let c: Color = "stone3";
    if (j === 0 && hash(x >> 2, 1, 7) > 0.3) c = "stone4";
    else if (start && j < T - 3) c = "stone4";
    else if (j === T - 2) c = "stone2";
    else if (ends.includes(x + 1) && hash(j >> 2, 2, 7) > 0.35) c = "stone2";
    p.px(x, j, c);
  }
  for (let k = 0; k < 8; k++) {
    const fx = 4 + Math.floor(hash(k, 3, seed) * 23), fy = 6 + Math.floor(hash(k, 4, seed) * 18);
    if (!ends.some((e) => Math.abs(e - fx) < 2 || Math.abs(e - fx - 1) < 2)) p.px(fx, fy, "stone4").px(fx + 1, fy, "stone4");
  }
  for (let k = 0; k < 9; k++) {
    const fx = 2 + Math.floor(hash(k, 5, seed) * 27), fy = 2 + Math.floor(hash(k, 6, seed) * 26);
    if (ends.includes(fx) || ends.includes(fx + 1)) continue;
    const c: Color = k % 3 === 0 ? "steel3" : "stone2";
    p.px(fx, fy, c).px(fx + 1, fy, c);
  }
}

// ── moss-earth ──────────────────────────────────────────────────────────────

function earth(p: Px, seed: number, moss: number) {
  p.rect(0, 0, T, T, "bamboo1");
  for (const [x, y, r] of jitter(8, seed, 1)) {
    if (r < 0.4) stamp(p, x, y, ["rr.", ".rr"], { r: "wood2" });
    else if (r < 0.6) stamp(p, x, y, [".t", "tt"], { t: "stone2" });
  }
  // Moss: soft cushions on a coarse jittered grid, bigger and more of them as `moss` rises, dark at the
  // rim, lit on the upper left; small clumps between them. Cushions wrap at the tile edge.
  for (const [cx, cy, r] of jitter(16, seed + 9, 2)) {
    if (r > moss) continue;
    const rx = 3 + (moss - r) * 6, ry = rx * 0.7;
    for (let y = Math.floor(cy - ry - 2); y <= cy + ry + 2; y++) for (let x = Math.floor(cx - rx - 2); x <= cx + rx + 2; x++) {
      const d = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 + (hash(mod(x) >> 1, mod(y) >> 1, seed + 19) - 0.5) * 0.6;
      if (d > 1) continue;
      const lit = (x - cx) / rx + (y - cy) / ry < -0.6;
      wrap(p, x, y, d > 0.75 ? "leaf1" : lit ? (hash(x, y, seed) < 0.4 ? "leaf3" : "leaf2") : hash(x, y, seed + 2) < 0.2 ? "jade2" : "leaf2");
    }
  }
  for (const [x, y, r] of jitter(8, seed + 21, 1)) {
    if (r > moss * 0.6) continue;
    stamp(p, x - 1, y - 1, [".gg.", "MgGM", ".MM."], L);
  }
  // Pebbles half sunk in the earth, a shadow under each.
  for (const [x, y, r] of jitter(16, seed + 17, 3)) if (r < 0.6) stamp(p, x, y, r < 0.3 ? [".dd", "dcc", ".bb"] : ["dc", "bb"], L);
}

// ── threshold-stone: long sills ─────────────────────────────────────────────

/** Two rows of sills, 15 tall. A row's sill ends at x 31 only if `joints` says so; otherwise it runs on into the next tile. */
function sills(p: Px, seed: number, joints: readonly [boolean, boolean]) {
  for (let row = 0; row < 2; row++) {
    const y0 = row * 16;
    for (let x = 0; x < T; x++) {
      const end = joints[row] && x === T - 1;
      for (let j = 0; j < 16; j++) {
        let c: Color = "stone4";
        if (j === 15 || end) c = "stone2";
        else if (j === 0) c = hash(x >> 3, row, 7) > 0.3 ? "stone5" : "stone4";
        else if (j === 14) c = "stone3";
        else if (joints[row] && x === T - 2) c = "stone3";
        else if (joints[row] && x === 0 && j < 14) c = "stone5";
        p.px(x, y0 + j, c);
      }
    }
    // Polished in a long band down the middle of each sill where feet slide, and a few flecks.
    for (let x = 1; x < T - 2; x++) if (hash(x >> 1, row, seed + 11) < 0.35) p.px(x, y0 + 6 + (hash(x, row, seed) < 0.5 ? 0 : 1), "stone5");
    for (let k = 0; k < 4; k++) {
      const fx = 2 + Math.floor(hash(k, row, seed + 13) * 26), fy = y0 + 3 + Math.floor(hash(k, row + 2, seed + 13) * 9);
      p.px(fx, fy, "steel3").px(fx + 1, fy, "steel3");
    }
  }
}

// ── worn-stone: cobbles ─────────────────────────────────────────────────────

/** Four rows of cobbles, 8 tall with the joint; each row's cobble widths and offset are fixed for every variant. */
const COBBLE_ROWS: readonly { offset: number; widths: readonly number[] }[] = [
  { offset: 0, widths: [7, 9, 8, 8] },
  { offset: 4, widths: [8, 7, 9, 8] },
  { offset: 2, widths: [9, 8, 7, 8] },
  { offset: 6, widths: [8, 8, 9, 7] },
];
type Cobble = { row: number; index: number; x: number; w: number; shared: boolean };
const COBBLES: Cobble[] = COBBLE_ROWS.flatMap((r, row) => {
  let x = r.offset;
  return r.widths.map((w, index) => { const c = { row, index, x, w, shared: x + w > T }; x += w; return c; });
});
const COBBLE_FACES: readonly [Color, number][] = [["stone3", 0.68], ["stone4", 0.86], ["cream2", 0.94], ["stone2", 1]];

/**
 * Lay the cobbles. `wet(x, y)` marks puddle pixels: there faces reflect the sky and joints go dark and
 * blue. Each cobble is a rounded block with a polished highlight on its upper left and a shaded base.
 */
function cobbles(p: Px, seed: number, opts: { wet?: (x: number, y: number) => boolean; jointMoss?: number } = {}) {
  p.rect(0, 0, T, T, "stone1");
  for (const cb of COBBLES) {
    const s = cb.shared ? 600 : seed;
    const face = COBBLE_FACES.find(([, upTo]) => hash(cb.index, cb.row, s) < upTo)![0];
    const shade: Color = face === "stone4" ? "stone3" : face === "cream2" ? "cream1" : "stone2";
    const y0 = cb.row * 8;
    for (let j = 0; j < 7; j++) for (let i = 0; i < cb.w - 1; i++) {
      const corner = (i === 0 || i === cb.w - 2) && (j === 0 || j === 6);
      if (corner) continue;
      let c: Color = face;
      if (j >= 5 && !(j === 5 && (i === 0 || i === cb.w - 2))) c = shade;
      else if (j === 1 && i >= 1 && i <= 2) c = "stone5";
      else if (j === 0 && i === 1) c = face === "stone2" ? "stone3" : "stone5";
      p.px(mod(cb.x + i), y0 + j, c);
    }
  }
  if (opts.jointMoss) mossJoints(p, 10, 22, 11, 8, seed + 31);
  if (opts.wet) {
    const wet = opts.wet;
    p.each((x, y, c) => {
      if (!wet(x, y)) return undefined;
      if (c === "stone1" || c === "jade2" || c === "leaf2") return "steel2";
      if (c === "stone5") return "blue5";
      return y % 8 >= 5 ? "steel3" : hash(x >> 1, y, 5) < 0.3 ? "blue4" : "steel4";
    });
    // The puddle's rim: wet dark stone just outside it.
    p.each((x, y, c) => (!wet(x, y) && (wet(x + 1, y) || wet(x - 1, y) || wet(x, y + 1) || wet(x, y - 1)) && c !== "stone1" ? "stone2" : undefined));
  }
}

// ── edges ───────────────────────────────────────────────────────────────────

/** How far an edge reaches at each point along it: `base` at both ends so runs join. */
function reach(a: number, seed: number, base: number, swing: number): number {
  const ends = Math.min(a, T - 1 - a);
  const wave = Math.sin((a + seed * 7) * 0.5) * swing + Math.sin((a + seed * 3) * 1.4) * swing * 0.5;
  const raw = base + Math.max(0, wave + swing * 0.6);
  return Math.round(ends < 4 ? base + (raw - base) * (ends / 4) : raw);
}

/** Moss and earth creeping onto the paving from a bed on that side: a soil lip, moss clumps riding on it. */
function mossFray(p: Px, side: Side, seed: number) {
  p.faded(0.3, () => sided(p, side, (plot) => { for (let a = 0; a < T; a++) plot(a, reach(a, seed, 3, 1.6), "ink2"); }));
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) {
      const r = reach(a, seed, 3, 1.6);
      for (let d = 0; d < r; d++) plot(a, d, d === r - 1 ? "wood2" : hash(a >> 1, d, seed) < 0.3 ? "wood2" : "bamboo1");
    }
    for (let k = 0; k < 5; k++) {
      const a = 2 + Math.floor(hash(k, 1, seed) * 27), r = reach(a, seed, 3, 1.6);
      plot(a, r - 2, "leaf1"); plot(a + 1, r - 2, "leaf2"); plot(a, r - 1, "leaf2"); plot(a + 1, r - 1, "leaf3"); plot(a + 2, r - 1, "leaf1");
      if (k % 2) { plot(a + 1, r, "jade2"); plot(a + 2, r, "leaf1"); }
    }
  });
}

function mossCorner(p: Px, corner: Corner) {
  const fx = (x: number) => (corner.endsWith("w") ? x : T - 1 - x);
  const fy = (y: number) => (corner.startsWith("n") ? y : T - 1 - y);
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (x + y <= 4) p.px(fx(x), fy(y), x + y === 4 ? "wood2" : "bamboo1");
  p.px(fx(1), fy(1), "leaf2").px(fx(2), fy(1), "leaf3").px(fx(1), fy(2), "leaf1");
}

/** A soldier course of grey brick along the side, bricks on end, joints on their right and bottom. */
function brickHeader(p: Px, side: Side) {
  for (let k = 0; k < 8; k++) {
    const face = faceOf(hash(k, side.charCodeAt(0), 41));
    const [x, y, w, h] = side === "n" ? [k * 4, 0, 4, 8] : side === "s" ? [k * 4, 24, 4, 8] : side === "w" ? [0, k * 4, 8, 4] : [24, k * 4, 8, 4];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.px(x + i, y + j, i === w - 1 || j === h - 1 ? "stone1" : face);
  }
}
function brickCorner(p: Px, corner: Corner) {
  const x = corner.endsWith("w") ? 0 : 24, y = corner.startsWith("n") ? 0 : 24;
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) p.px(x + i, y + j, i === 7 || j === 7 ? "stone1" : "stone3");
}

/** Where the cobbles stop against the slabs: a band of long granite edging setts laid flush, 5 deep. */
function cobbleEdge(p: Px, side: Side) {
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) {
      const joint = a % 16 === 15;
      plot(a, 0, "stone2");
      for (let d = 1; d < 5; d++) plot(a, d, joint ? "stone2" : d === 1 ? "stone5" : "stone4");
      plot(a, 5, "stone1");
    }
  });
}
function cobbleCorner(p: Px, corner: Corner) {
  const x0 = corner.endsWith("w") ? 0 : T - 6, y0 = corner.startsWith("n") ? 0 : T - 6;
  for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
    const outer = corner.endsWith("w") ? i === 0 : i === 5;
    const top = corner.startsWith("n") ? j === 0 : j === 5;
    const inner = corner.endsWith("w") ? i === 5 : i === 0;
    const innerY = corner.startsWith("n") ? j === 5 : j === 0;
    p.px(x0 + i, y0 + j, outer || top ? "stone2" : inner || innerY ? "stone1" : j === (corner.startsWith("n") ? 1 : 1) ? "stone5" : "stone4");
  }
}

/**
 * The sills' own edge: the hall approach is a low platform of sills, so to the south its front face
 * shows (shaded, a shadow at its foot); to the north and sides a dark joint and a lit or shaded arris.
 */
function sillEdge(p: Px, side: Side) {
  if (side === "s") {
    for (let x = 0; x < T; x++) {
      p.px(x, 26, "stone5");
      p.px(x, 27, "stone3").px(x, 28, "stone3").px(x, 29, "stone2").px(x, 30, "stone2");
      p.px(x, 31, "stone1");
    }
    for (let x = 15; x < T; x += 16) for (let y = 27; y < 31; y++) p.px(x, y, "stone1");
  } else if (side === "n") {
    for (let x = 0; x < T; x++) p.px(x, 0, "stone2").px(x, 1, "stone5");
  } else {
    const at = side === "w" ? 0 : T - 1, next = side === "w" ? 1 : T - 2;
    for (let y = 0; y < T; y++) { p.px(at, y, "stone2"); p.px(next, y, side === "w" ? "stone5" : "stone3"); }
  }
}
function sillCorner(p: Px, corner: Corner) {
  // Only the south corners need closing: the front face turns the corner and the arris meets it.
  if (corner.startsWith("n")) { const x = corner === "nw" ? 0 : T - 1; p.px(x, 0, "stone2").px(x, 1, "stone2"); return; }
  const x0 = corner === "sw" ? 0 : T - 2;
  for (let y = 26; y < T; y++) for (let x = x0; x < x0 + 2; x++) p.px(x, y, y === T - 1 ? "stone1" : y === 26 ? "stone4" : "stone2");
}

// ── sprites ─────────────────────────────────────────────────────────────────

const sprites: Record<string, SpriteDef> = {
  // brick-paving
  /** Grey basket weave. */
  "ground/brick-paving-a": tile((p) => basket(p, 1)),
  /** Grey basket weave, two bricks worn smooth and pale by the bicycle stand. */
  "ground/brick-paving-b": tile((p) => basket(p, 2, (id) => (id === 13 || id === 14 ? "stone4" : undefined))),
  /** The shady side: moss along the joints and a tuft where four squares meet. */
  "ground/brick-paving-c": tile((p) => {
    basket(p, 3);
    mossJoints(p, 14, 18, 13, 10, 33);
    stamp(p, 14, 14, [".G.", "gMg"], L, false);
  }),
  /**
   * One cracked brick replaced with a red one from somewhere else, the only red in the yard, and a
   * sunk brick holding a thumbprint of last night's rain.
   */
  "ground/brick-paving-d": tile((p) => {
    basket(p, 4, (id) => (id === 10 ? "tan2" : id === 21 ? "stone2" : undefined));
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const b = basketAt(x, y);
      if (b.id === 21 && !b.joint && inBlob(x, y, x - (x % 8) + 4, y - (y % 4) + 1.5, 3, 1.5)) p.px(x, y, hash(x, y, 4) < 0.2 ? "blue5" : "blue4");
    }
  }),

  // courtyard-stone
  /** A slab course whose slab ends at the tile's east edge. */
  "ground/courtyard-stone-a": tile((p) => slab(p, 1, [31])),
  /** A slab course whose slab ends mid-tile. */
  "ground/courtyard-stone-b": tile((p) => slab(p, 2, [15])),
  /**
   * The yard's drain: a shallow channel cut in the top slab, its upper wall in shadow and its floor
   * damp, running into a cast-iron grate with a rust stain weeping from it.
   */
  "ground/courtyard-stone-c": tile((p) => {
    slab(p, 3, [31]);
    for (let x = 3; x < 19; x++) { p.px(x, 13, "stone1").px(x, 14, "stone2").px(x, 15, x % 5 === 0 ? "jade2" : "stone2").px(x, 16, "stone4"); }
    stamp(p, 19, 11, [
      "aaaaaaaaa",
      "aIjIjIjIa",
      "aiaiaiaia",
      "aIjIjIjIa",
      "aiaiaiaia",
      "aIjIjIjIa",
      "aiaiaiaia",
      "aaaaaaaaa",
    ], L, false);
    stamp(p, 22, 19, ["xx", ".x"], L, false);
  }),
  /** Where the big glazed water jar stood for forty years before it cracked: a pale ring, moss in the joint below. */
  "ground/courtyard-stone-d": tile((p) => {
    slab(p, 4, [15]);
    p.each((x, y, c) => (c && x > 16 && inBlob(x, y, 24, 14, 6, 5) && !inBlob(x, y, 24, 14, 4.5, 3.6) ? "stone2" : undefined));
    p.each((x, y, c) => (c === "stone1" && (y === T - 1 || x === 15) && hash((x + y) >> 1, 0, 44) < 0.5 ? "jade2" : undefined));
  }),

  // moss-earth
  /** Damp packed earth, a little moss. */
  "ground/moss-earth-a": tile((p) => earth(p, 1, 0.4)),
  /** Damp earth, mossier. */
  "ground/moss-earth-b": tile((p) => earth(p, 2, 0.7)),
  /** A carpet of moss with earth showing through, where the eaves drip all winter. */
  "ground/moss-earth-c": tile((p) => earth(p, 3, 1)),
  /** Earth and stones, and a wooden clothes peg dropped from the laundry poles overhead. */
  "ground/moss-earth-d": tile((p) => {
    earth(p, 4, 0.2);
    stamp(p, 12, 13, [
      "QQQq.....",
      "qqqqjjo..",
      "..ooQQQq.",
      "....oqqqo",
    ], L, false);
  }),

  // threshold-stone
  /** Long sills: the top row's sill ends here, the bottom row's runs on. */
  "ground/threshold-stone-a": tile((p) => sills(p, 1, [true, false])),
  /** Long sills: the bottom row's sill ends here, the top row's runs on. */
  "ground/threshold-stone-b": tile((p) => sills(p, 2, [false, true])),
  /** Both sills end here; the top one cracked clean through long ago and is held with two iron cramps. */
  "ground/threshold-stone-c": tile((p) => {
    sills(p, 3, [true, true]);
    for (let y = 1; y < 14; y++) p.px(17 + (y % 4 === 0 ? 1 : 0), y, "stone2");
    stamp(p, 14, 3, ["iiiiiiii", "jIIIIIIi"], L, false);
    stamp(p, 14, 10, ["iiiiiiii", "jIIIIIIi"], L, false);
  }),
  /** Both sills run on through the tile, the top one dished pale where everyone steps. */
  "ground/threshold-stone-d": tile((p) => {
    sills(p, 4, [false, false]);
    p.each((x, y, c) => (c === "stone4" && inBlob(x, y, 15, 7, 12, 4) && hash(x >> 1, y >> 1, 35) < 0.35 ? "stone5" : undefined));
  }),

  // worn-stone
  /** Cobbles polished by feet. */
  "ground/worn-stone-a": tile((p) => cobbles(p, 1)),
  /** Cobbles, moss creeping along the joints. */
  "ground/worn-stone-b": tile((p) => cobbles(p, 2, { jointMoss: 1 })),
  /** Last night's rain in a dip in the cobbles: the sky in it, the joints dark. */
  "ground/worn-stone-c": tile((p) => cobbles(p, 3, { wet: (x, y) => inBlob(x, y, 15, 15, 10 + Math.sin(y * 0.8) * 1.2, 6.5) })),
  /** A smaller puddle, two lobes, where the drainpipe empties. */
  "ground/worn-stone-d": tile((p) => cobbles(p, 4, { wet: (x, y) => inBlob(x, y, 11, 18, 6, 4) || inBlob(x, y, 19, 21, 5, 3.2) })),
};

const SIDES: readonly Side[] = ["n", "s", "w", "e"];
const CORNERS: readonly Corner[] = ["nw", "ne", "sw", "se"];
for (const side of SIDES) {
  /** On paving, stone or sills: moss and earth creeping in from a bed on this side. */
  sprites[`ground/edge-moss-${side}-a`] = tile((p) => mossFray(p, side, 1));
  sprites[`ground/edge-moss-${side}-b`] = tile((p) => mossFray(p, side, 2));
  /** On brick paving: a soldier course where it stops against stone on this side. */
  sprites[`ground/edge-brick-paving-${side}`] = tile((p) => brickHeader(p, side));
  /** On cobbles: granite edging setts where they stop against slabs on this side. */
  sprites[`ground/edge-cobble-${side}`] = tile((p) => cobbleEdge(p, side));
  /** On threshold stone: the platform's edge on this side (its front face, to the south). */
  sprites[`ground/edge-sill-${side}`] = tile((p) => sillEdge(p, side));
}
for (const corner of CORNERS) {
  sprites[`ground/edge-moss-${corner}`] = tile((p) => mossCorner(p, corner));
  sprites[`ground/edge-brick-paving-${corner}`] = tile((p) => brickCorner(p, corner));
  sprites[`ground/edge-cobble-${corner}`] = tile((p) => cobbleCorner(p, corner));
  sprites[`ground/edge-sill-${corner}`] = tile((p) => sillCorner(p, corner));
}

export default defineSprites(sprites);
