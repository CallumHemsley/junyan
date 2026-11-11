/**
 * The reading room's furnishings (ticket 0204): the returns cart, the plants, the rug before the desk,
 * the two jade-and-cream tiled inlays where the work bays are, and the green-shaded standard lamp. Plus
 * the furniture the furnishing feature projects at run time (`projectReadingRoom`): each brief's reading
 * table (turned or not, `-30x15` / `-15x30`), its chair (frame = rotation), the open book on a finished
 * table, the sunlight that falls into a finished nook, and the draft ghost while placing
 * (`draft-<valid|blocked>-<w>x<h>`); see `runtimeProps` for how those ids are chosen.
 *
 * The lamp's light point (for `interiorLights`): `LAMP_LIGHT` below.
 */
import { Px, defineSprites, hash, TILE, type Color, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propAnchor, propSpriteId, type MapProp } from "../../world/maps.ts";
import { art, autoOutline, pot, seedOf, townFrame } from "./_helpers.ts";
import { mound } from "../plant/_helpers.ts";

const MAP = "reading-room";
const BRIEFS = ["window", "alcove"] as const;
const OUTLINE = { oak: "wood1", wood: "wood1", bamboo: "wood1", stone: "stone1", steel: "steel1", cream: "wood1", white: "steel1", gold: "wood1", orange: "brown1", blue: "blue1", leaf: "leaf1", jade: "jade1", rose: "rose1", brown: "wood1", plum: "plum1", pink: "plum1", red: "red1" } as const;

type Frame = ReturnType<typeof townFrame>;
type Draw = (p: Px, f: Frame, prop: MapProp) => void;

function kind(name: string, rise: number, draw: Draw, options: { floor?: boolean; shadow?: boolean } = {}): [string, SpriteDef][] {
  return mapProps(MAP, name).map((prop) => {
    const f = townFrame(prop, rise);
    return [propSpriteId(MAP, prop.id), {
      w: f.w, h: f.h, anchor: f.anchor,
      ...(options.floor ? { layer: "floor" as const } : {}),
      ...(options.shadow ? { shadow: { rx: Math.max(4, Math.round(f.w / 2) - 3), ry: Math.max(3, Math.round(f.depth / 5)), dy: -Math.round(f.depth / 3) } } : {}),
      draw: (p: Px) => draw(p, f, prop),
    }];
  });
}

/** A sprite for a run-time prop of `w`×`d` tiles, `rise` px tall above its footprint. */
function sized(w: number, d: number, rise: number, draw: (p: Px, W: number, D: number, G: number) => void, extra: Partial<SpriteDef> = {}): SpriteDef {
  const W = Math.round(w * TILE), D = Math.round(d * TILE), h = D + rise;
  return { w: W, h, anchor: [Math.round(W / 2), h - 1], draw: (p) => draw(p, W, D, h - 1), ...extra };
}

const SPINES: readonly Color[] = ["rose3", "jade3", "blue3", "gold3", "plum3", "oak4", "cream4", "steel4", "brown3"];

// ── the returns cart ───────────────────────────────────────────────────────────

/**
 * The returns cart: a walnut book trolley on four castors with two sloped tiers of returned books spine
 * up, a card box of borrowing slips (blank) at one end, and a forgotten umbrella hooked on its handle.
 */
const drawCart: Draw = (p, f, prop) => {
  const W = f.w, G = f.gy, seed = seedOf(prop.id);
  const tierY = [G - 34, G - 22];
  // Castors and the frame.
  for (const x of [4, W - 8]) { art(p, x, G - 4, [".kk.", "kssk", ".kk."], { k: "ink2", s: "steel3" }); p.vline(x + 2, G - 30, 26, "wood2"); }
  p.hline(4, G - 8, W - 8, "wood2");
  for (const [t, ty] of tierY.entries()) {
    // A sloped trough of books: their tops seen from above as a row of spines leaning back.
    p.rect(2, ty, W - 4, 3, "wood3").hline(2, ty, W - 4, "wood4");
    let x = 4, k = 0;
    while (x < W - 12) {
      const bw = 2 + Math.floor(hash(k, t, seed) * 3), bh = 7 + Math.floor(hash(t, k, seed) * 4);
      const c = SPINES[Math.floor(hash(k, t + 5, seed) * SPINES.length)];
      p.rect(x, ty - bh, bw, bh, c);
      p.vline(x, ty - bh, bh, (c === "cream4" ? "cream5" : c));
      p.px(x, ty - bh + 2, "gold4");
      x += bw + (hash(k, 9, seed) < 0.1 ? 2 : 0); k++;
    }
    p.rect(2, ty + 3, W - 4, 4, "wood2").hline(2, ty + 6, W - 4, "wood1");
  }
  // The slip box at the east end and the umbrella on the handle.
  p.rect(W - 12, tierY[0] - 9, 9, 9, "oak4").hline(W - 12, tierY[0] - 9, 9, "oak5");
  for (let y = tierY[0] - 8; y < tierY[0] - 1; y += 2) p.hline(W - 11, y, 7, "cream4");
  p.line(1, G - 40, 1, G - 6, "steel3");
  art(p, 0, G - 30, ["bb.", "bBb", "bBb", "bBb", "bBb", ".b.", ".b."], { b: "plum2", B: "plum3" });
  autoOutline(p, { map: OUTLINE });
};

// ── plants ─────────────────────────────────────────────────────────────────────

/**
 * Variant 0: a big Swiss-cheese plant (龟背竹) in a celadon pot by the cart, its holed leaves reaching out.
 * Variant 1: a jasmine in a blue-and-white pot on a little stand by the broad window, in flower.
 */
const drawPlant: Draw = (p, f, prop) => {
  const W = f.w, G = f.gy, cx = Math.round(W / 2), seed = seedOf(prop.id);
  if (prop.variant % 2 === 1) {
    p.rect(cx - 7, G - 14, 14, 3, "wood3").hline(cx - 7, G - 14, 14, "wood4");
    for (const x of [cx - 6, cx + 5]) p.vline(x, G - 11, 11, "wood2");
    const s = pot(p, cx - 7, G - 26, 14, 12, ["cream2", "cream3", "cream4", "cream5", "white"], { belly: 1 });
    p.over(() => { p.hline(cx - 7, G - 20, 14, "blue3"); for (const x of [cx - 4, cx + 2]) art(p, x, G - 18, [".b.", "bBb"], { b: "blue3", B: "blue2" }); });
    mound(p, s.cx, s.cy - 6, 9, 7, ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4"], seed, [["3", "2"], ["33", "2."]], [2, 2]);
    for (let k = 0; k < 7; k++) art(p, Math.round(s.cx - 8 + hash(k, 1, seed) * 15), Math.round(s.cy - 12 + hash(k, 2, seed) * 10), [".w.", "wyw", ".w."], { w: "white", y: "gold4" });
  } else {
    const s = pot(p, cx - 10, G - 20, 20, 20, ["jade2", "jade3", "jade4", "jade5", "jade6"], { belly: 2 });
    // Leaves on stalks fanning out: big rounded blades split with holes.
    const leaves: [number, number, boolean][] = [[-14, -34, true], [8, -38, false], [-4, -46, true], [14, -26, false], [-16, -20, true], [2, -28, false]];
    for (const [dx, dy, flip] of leaves) {
      const lx = Math.round(s.cx + dx), ly = Math.round(s.cy + dy);
      p.line(Math.round(s.cx), Math.round(s.cy), lx + 5, ly + 6, "leaf2");
      const rows = [
        "...gggggg...",
        ".ggGGGgggg..",
        "gGGG.GGggg.g",
        "gGGGGGGg.ggg",
        "gGG.GGGgggg.",
        ".gGGGGggg.g.",
        "..gggggg....",
      ];
      art(p, lx, ly, flip ? rows.map((r) => [...r].reverse().join("")) : rows, { g: "leaf2", G: "leaf3" });
    }
  }
  autoOutline(p, { map: OUTLINE });
};

// ── floors: the rug and the inlays ─────────────────────────────────────────────

/** The rug before the project desk: indigo with a cream key-fret border and a medallion, a corner turned up. */
const drawMat: Draw = (p, f) => {
  const W = f.w, D = f.depth, G = f.gy, y0 = G - D + 1;
  for (let y = 0; y < D; y++) for (let x = 0; x < W; x++) {
    const bx = Math.min(x, W - 1 - x), by = Math.min(y, D - 1 - y), b = Math.min(bx, by);
    let c: Color = "blue2";
    if (b < 2) c = "blue1";
    else if (b < 7) c = ((x + y) % 6 < 3) !== ((b === 3 || b === 5)) ? "cream4" : "blue2";
    else if (Math.hypot((x - W / 2) / 12, (y - D / 2) / 7) < 1) c = Math.hypot((x - W / 2) / 12, (y - D / 2) / 7) < 0.45 ? "cream4" : Math.abs(Math.hypot((x - W / 2) / 12, (y - D / 2) / 7) - 0.75) < 0.12 ? "gold3" : "blue3";
    else if ((x + y) % 8 === 0) c = "blue3";
    p.px(x, y0 + y, c);
  }
  art(p, W - 8, y0, ["cccccccc", ".ccCCCcc", "..ccCCcc", "...cccCc", "....cccc", ".....ccc"], { c: "cream3", C: "cream4" });
};

/**
 * The tiled inlays where the two work bays are: jade and cream encaustic tiles in a lattice of eight-
 * point stars inside a border of jade, laid when the building was new, a few tiles cracked and one
 * replaced in plain grey. Variant 1 (the alcove) sets the stars on a jade field instead of cream.
 */
const drawInlay: Draw = (p, f, prop) => {
  const W = f.w, D = f.depth, G = f.gy, y0 = G - D + 1, seed = seedOf(prop.id);
  const alt = prop.variant % 2 === 1;
  const field: Color = alt ? "jade5" : "cream4", joint: Color = alt ? "jade4" : "cream3", motif: Color = alt ? "cream4" : "jade3", heart: Color = alt ? "jade3" : "gold3";
  for (let y = 0; y < D; y++) for (let x = 0; x < W; x++) {
    const b = Math.min(x, y, W - 1 - x, D - 1 - y);
    let c: Color;
    if (b < 3) c = b === 0 ? "jade1" : "jade2";
    else if (b === 3) c = "cream5";
    else if (b < 7) c = (x + y) % 4 < 2 ? "jade3" : "jade2";
    else if (b === 7) c = "cream5";
    else {
      // 16 px tiles, a small four-petal rosette at each tile's corners where four tiles meet.
      const u = (x - 8) % 16, v = (y - 8) % 16;
      const du = Math.min(u, 16 - u), dv = Math.min(v, 16 - v);
      c = u === 0 || v === 0 ? joint : field;
      if (du + dv <= 3 && (du === 0 || dv === 0)) c = du + dv === 0 ? heart : motif;
      else if (du === 1 && dv === 1) c = motif;
    }
    p.px(x, y0 + y, c);
  }
  // A cracked tile, a replaced one in plain grey.
  const tx = 8 + 16 * (1 + Math.floor(hash(1, 1, seed) * 4)), ty = 8 + 16 * (1 + Math.floor(hash(1, 2, seed) * 3));
  p.rect(tx + 1, y0 + ty + 1, 15, 15, "stone4");
  p.line(tx + 20, y0 + ty + 20, tx + 28, y0 + ty + 26, "stone3");
};

// ── the standard lamp ──────────────────────────────────────────────────────────

/** Where the lamp's bulb shines from, above its anchor: tiles up from the foot (the shade's mouth). */
const LAMP_BULB = 66 / TILE;

/**
 * The standard lamp by the project desk: a brass column on a round weighted foot, a green glass shade
 * (the classic banker's green) with a cream lining glowing under it, a pull chain, a brass tassel.
 */
const drawLamp: Draw = (p, f) => {
  const W = f.w, G = f.gy, cx = Math.round(W / 2);
  p.ellipse(cx, G - 2, 8, 3, "gold1");
  p.ellipse(cx, G - 3, 8, 3, "gold3");
  p.ellipse(cx - 1, G - 3.5, 5, 1.5, "gold4");
  p.vline(cx, G - 68, 66, "gold2").vline(cx - 1, G - 68, 66, "gold4");
  for (const y of [G - 30, G - 52]) p.hline(cx - 2, y, 4, "gold3");
  art(p, cx - 10, G - 80, [
    "......jjjjjjj.......",
    "....jjJJJJJjjjj.....",
    "...jJJJJJJjjjjjj....",
    "..jJJJJJJjjjjjjjj...",
    ".jJJJJJjjjjjjjjjjj..",
    "jjjjjjjjjjjjjjjjjjj.",
    ".gggYYYYYYYYYYggg...",
  ], { j: "jade2", J: "jade4", g: "gold3", Y: "gold5" });
  p.vline(cx + 6, G - 73, 8, "gold3").px(cx + 6, G - 65, "gold4");
  autoOutline(p, { map: OUTLINE });
};

/** The lamp's light point, tile units (screen position, as `interiorLights` wants it). */
export const LAMP_LIGHT: Readonly<Record<string, readonly [number, number]>> = Object.fromEntries(
  mapProps(MAP, "reading-lamp").map((p) => { const [x, y] = propAnchor(p); return [p.id, [x, y - LAMP_BULB] as const]; }),
);

// ── run-time furniture ─────────────────────────────────────────────────────────

/** Table height, art px; the open book sits on it. */
const TABLE_H = 22;

/**
 * A reading table: an old elm library table with a green leather top worn pale at the elbows, square
 * legs, a drawer; turned (`d > w`) it runs north–south and shows its narrow end.
 */
function table(p: Px, W: number, D: number, G: number): void {
  const top = G - D + 1 - TABLE_H, front = G - TABLE_H + 1;
  p.rect(0, top, W, front - top, "wood3");
  p.rect(3, top + 3, W - 6, front - top - 6, "jade2");
  p.over(() => { p.rect(4, top + 4, W - 8, 2, "jade3"); p.ellipse(W / 2, front - 8, Math.max(4, W / 5), 3, "jade3"); });
  p.frame(3, top + 3, W - 6, front - top - 6, "gold2");
  p.hline(0, top, W, "wood4").vline(0, top, front - top, "wood4");
  p.rect(0, front, W, 4, "wood2").hline(0, front, W, "wood4");
  if (W > 40) p.rect(W / 2 - 8, front + 1, 16, 3, "wood1").px(W / 2, front + 2, "gold3");
  for (const x of [1, W - 5]) { p.rect(x, front + 4, 4, TABLE_H - 4, "wood2"); p.vline(x, front + 4, TABLE_H - 4, "wood3"); }
  autoOutline(p, { map: OUTLINE });
}

/** A reading chair: a bentwood armchair with a cane seat; frame 0 faces the window (its back to us), frame 1 faces west. */
function chair(p: Px, W: number, D: number, G: number, frame: number): void {
  const cx = Math.round(W / 2), seat = G - 16;
  p.ellipse(cx, seat, 11, 6, "wood2");
  p.ellipse(cx, seat - 1, 9.5, 5, "bamboo3");
  p.over(() => { for (let x = cx - 9; x < cx + 9; x += 2) p.vline(x, seat - 5, 10, "bamboo4"); });
  for (const [x, back] of [[cx - 9, true], [cx + 8, true], [cx - 7, false], [cx + 6, false]] as const) p.line(x, seat + (back ? 0 : 2), x + (x < cx ? -1 : 1), G, "wood2");
  if (frame % 2 === 0) {
    // Back to us: the bent hoop of the backrest across the front of the seat.
    for (let a = Math.PI; a <= Math.PI * 2; a += 0.05) p.px(Math.round(cx + Math.cos(a) * 10), Math.round(seat + 2 + Math.sin(a) * 16), "wood3");
    p.vline(cx - 3, seat - 12, 14, "wood3").vline(cx + 2, seat - 12, 14, "wood3");
  } else {
    // Facing west: the backrest seen edge-on at the east side, the arm curving round.
    for (let y = seat - 20; y < seat + 2; y++) p.px(cx + 9 - Math.round((seat - y) / 10), y, "wood3");
    for (let a = Math.PI * 0.9; a <= Math.PI * 1.6; a += 0.05) p.px(Math.round(cx + Math.cos(a) * 9), Math.round(seat - 4 + Math.sin(a) * 5), "wood3");
  }
  void D;
  autoOutline(p, { map: OUTLINE });
}

/** An open book left on a finished table, a ribbon marker trailing, lifted onto the table top. */
function openBook(p: Px, W: number, D: number, G: number): void {
  const base = G - Math.round(D / 2) - TABLE_H, cx = Math.round(W / 2);
  art(p, cx - 9, base - 6, [
    ".wwwwwww.wwwwwww.",
    "wlllllllwllllllw.",
    "wwwwwwwwkwwwwwww.",
    "wlllllllwllllllw.",
    "wwwwwwwwkwwwwwwwr",
    ".ccccccc.ccccccc.r",
  ], { w: "white", l: "cream3", k: "cream2", c: "cream2", r: "rose3" });
  autoOutline(p, { map: OUTLINE });
}

/** The morning light that falls into a finished nook: a translucent warm slant with the window's bars in it. */
function sunlight(p: Px, W: number, D: number, G: number): void {
  const y0 = G - D + 1;
  p.faded(0.2, () => {
    for (let y = 0; y < D; y++) {
      const shift = Math.round(y * 0.35);
      for (let x = 0; x < W - 12; x++) {
        const xx = x + shift;
        if (xx >= W) continue;
        const bar = x % 12 === 0 || y % 16 === 0;
        if (!bar) p.px(xx, y0 + y, "gold5");
      }
    }
  });
}

/** The draft ghost while placing: a translucent tint with a dashed rim, jade where it fits, rose where it does not. */
function draft(p: Px, W: number, D: number, G: number, valid: boolean): void {
  const y0 = G - D + 1, tint: Color = valid ? "jade4" : "rose4", rim: Color = valid ? "jade6" : "red5";
  p.faded(0.32, () => p.rect(1, y0 + 1, W - 2, D - 2, tint));
  p.faded(0.85, () => {
    for (let x = 0; x < W; x++) if (x % 6 < 4) { p.px(x, y0, rim); p.px(x, G, rim); }
    for (let y = y0; y <= G; y++) if ((y - y0) % 6 < 4) { p.px(0, y, rim); p.px(W - 1, y, rim); }
  });
}

const CELL = 1.5;
const runtime: Record<string, SpriteDef> = {};
for (const brief of BRIEFS) {
  const id = (s: string) => `${MAP}/${brief}.${s}`;
  runtime[id("table-30x15")] = sized(2 * CELL, CELL, 10, (q, W, D, G) => table(q, W, D, G));
  runtime[id("table-15x30")] = sized(CELL, 2 * CELL, 10, (q, W, D, G) => table(q, W, D, G));
  runtime[id("table")] = runtime[id("table-30x15")];
  runtime[id("chair")] = sized(CELL, CELL, 26, (q, W, D, G) => chair(q, W, D, G, 0), { frames: 2, draw: (q, frame) => { const W = Math.round(CELL * TILE), D = W; chair(q, W, D, D + 26 - 1, frame); } });
  runtime[id("table.book")] = sized(0.8, 0.65, TABLE_H + 10, (q, W, D, G) => openBook(q, W, D, G));
  runtime[id("sunlight")] = { ...sized(2.8, 4.2, 0, (q, W, D, G) => sunlight(q, W, D, G)), layer: "floor" };
}
for (const valid of [true, false]) for (const [w, d] of [[2 * CELL, CELL], [CELL, 2 * CELL], [CELL, CELL]] as const) {
  const sprite = sized(w, d, 0, (q, W, D, G) => draft(q, W, D, G, valid));
  runtime[`${MAP}/draft-${valid ? "valid" : "blocked"}-${Math.round(w * 10)}x${Math.round(d * 10)}`] = { ...sprite, layer: "floor" };
}
runtime[`${MAP}/draft`] = { ...sized(CELL, CELL, 0, (q, W, D, G) => draft(q, W, D, G, true)), layer: "floor" };

export default defineSprites(Object.fromEntries([
  ...kind("reading-cart", 40, drawCart, { shadow: true }),
  ...kind("reading-plant", 50, drawPlant, { shadow: true }),
  ...kind("reading-mat", 0, drawMat, { floor: true }),
  ...kind("reading-inlay", 0, drawInlay, { floor: true }),
  ...kind("reading-lamp", 82, drawLamp, { shadow: true }),
  ...Object.entries(runtime),
]));

