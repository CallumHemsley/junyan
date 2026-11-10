/**
 * Tall bistro windows for the back wall's plaster zone, and the kitchen's vent window.
 *
 * Bistro windows are 68×47: a frame painted bottle green, fine glazing bars, a transom (or a
 * segmental arch) at the top, luminous morning glass, a linen café curtain on a brass rod across the
 * lower half, and a dark wooden sill (rows 41–46) with something on it. They anchor at the wall's foot:
 * place them at (x, 96) on a wall that starts at y = 0, and the frame top lands on wall row 11, just
 * under the cornice, with the sill's underside on row 57, just above the wainscot rail.
 */
import { defineSprites, Px, type Color, type Legend } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

const W = 68, H = 47;
/** Glass spans x 5–62 inside the frame; the curtain rod is at row 24. */
const GX = 5, GW = 58, ROD = 24, SILL = 41;

type Shape = "transom" | "arch";
/** Top edge of the frame at column x: flat for a transom window, a segmental arch rising 7px to the middle. */
const topAt = (shape: Shape, x: number) => (shape === "transom" ? 0 : Math.round(7 - 7 * Math.sqrt(Math.max(0, 1 - ((x + 0.5 - 34) / 32) ** 2))));

/**
 * The window's plan as a grid of letters: `.` outside, `F` frame, `g` glass, `b` a fine glazing bar,
 * `T` the heavier transom or meeting rail. Frame is 3px; the casements meet at x 33–34.
 */
function plan(shape: Shape): string[][] {
  const g = Array.from({ length: SILL }, () => Array.from({ length: W }, () => "."));
  for (let x = 2; x < 66; x++) {
    const top = topAt(shape, x);
    for (let y = top; y < SILL; y++) {
      const inner = x >= GX && x < GX + GW && y >= top + 3 && y < SILL - 3;
      g[y][x] = inner ? "g" : "F";
    }
  }
  const set = (x: number, y: number, c: string) => { if (g[y]?.[x] === "g") g[y][x] = c; };
  // Transom rail at rows 12–13 (both shapes), meeting stile below it.
  for (let x = 0; x < W; x++) { set(x, 12, "T"); set(x, 13, "T"); }
  for (let y = 14; y < SILL; y++) { set(33, y, "T"); set(34, y, "T"); }
  // Fine glazing bars in the casements: one upright in each, one glazing bar across above the rod.
  for (let y = 14; y < SILL; y++) { set(18, y, "b"); set(49, y, "b"); }
  for (let x = 0; x < W; x++) set(x, 19, "b");
  if (shape === "transom") {
    // Transom lights: uprights every 8px.
    for (let x = 12; x < 62; x += 8) for (let y = 0; y < 12; y++) set(x, y, "b");
  } else {
    // Fanlight: five bars radiating from a half-round hub on the transom rail.
    const line = (x0: number, y0: number, x1: number, y1: number) => {
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let e = dx + dy;
      for (;;) {
        set(x0, y0, "b");
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * e;
        if (e2 >= dy) { e += dy; x0 += sx; }
        if (e2 <= dx) { e += dx; y0 += sy; }
      }
    };
    for (const ex of [6, 19, 47, 61]) line(ex < 34 ? 31 : 36, 9, ex, topAt(shape, ex) + 3);
    line(33, 8, 33, topAt(shape, 33) + 3);
    for (let y = 8; y < 12; y++) for (let x = 30; x < 38; x++) if (((x + 0.5 - 34) / 4) ** 2 + ((y + 0.5 - 12) / 4) ** 2 <= 1) set(x, y, "T");
  }
  return g;
}

/** Luminous morning glass on a diagonal: near-white top-left, pale blue, warm cream low down. */
function glass(p: Px, g: string[][]) {
  const bands: [number, Color][] = [[0, "white"], [0.3, "blue6"], [0.62, "cream5"], [0.86, "gold5"]];
  const bandAt = (t: number) => bands.reduce((i, [from], j) => (t >= from ? j : i), 0);
  for (let y = 0; y < SILL; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] !== "g") continue;
    const t = (y / SILL) * 0.75 + ((x - GX) / GW) * 0.35;
    let i = bandAt(t);
    if (i > 0 && t - bands[i][0] < 0.035 && (x + y) % 2 === 0) i -= 1;
    p.faded(0.9, () => p.px(x, y, bands[i][1]));
  }
}

/** Something outside, drawn faint and only on glass. `rows` are placed at (x0, y0). */
function beyond(p: Px, g: string[][], x0: number, y0: number, rows: readonly string[], legend: Legend, alpha: number) {
  p.faded(alpha, () => rows.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch !== "." && g[y0 + j]?.[x0 + i] === "g") p.px(x0 + i, y0 + j, legend[ch] as Color);
  })));
}

/** Frame and bars, painted bottle green: lit on edges facing up and left, shaded facing down and right. */
function joinery(p: Px, g: string[][], mended?: readonly [number, number, number]) {
  const at = (x: number, y: number) => g[y]?.[x] ?? ".";
  for (let y = 0; y < SILL; y++) for (let x = 0; x < W; x++) {
    const c = at(x, y);
    if (c === "F") {
      const outUp = at(x, y - 1) === "." || at(x - 1, y) === ".";
      const outDown = at(x, y + 1) === "." || at(x + 1, y) === ".";
      const inUp = at(x, y + 1) === "g" || at(x + 1, y) === "g";
      const inDown = at(x, y - 1) === "g" || at(x - 1, y) === "g";
      p.px(x, y, outUp ? "jade3" : outDown ? "jade1" : inUp ? "jade1" : inDown ? "jade3" : "jade2");
    } else if (c === "T") {
      p.px(x, y, at(x, y - 1) === "g" || at(x - 1, y) === "g" ? "jade3" : "jade1");
    } else if (c === "b") {
      const isMended = mended && x >= mended[0] && x <= mended[1] && y === mended[2];
      p.px(x, y, isMended ? "wood5" : "jade1");
    }
  }
  // A brass latch where the casements meet.
  block(p, 32, 30, [".gg.", "gGGd", ".dd."], { g: "gold4", G: "gold3", d: "gold1" }, "latch");
}

/**
 * The café curtain: unbleached linen hung from brass rings on a rod at row 24, falling in soft
 * pleats to the sill, with a band of drawn-thread lace along its hem.
 */
function curtain(p: Px) {
  // Rod with finials.
  p.hline(3, ROD, 62, "gold2").hline(4, ROD - 1, 60, "gold3").px(2, ROD, "gold1").px(65, ROD, "gold1");
  p.px(2, ROD - 1, "gold3").px(65, ROD - 1, "gold2");
  for (const x of [12, 40]) p.px(x, ROD - 1, "gold4");
  for (let x = GX; x < GX + GW; x++) {
    if (x === 33 || x === 34) continue;
    const pleat = (x - GX) % 6;
    for (let y = ROD + 1; y < SILL - 3; y++) {
      let c: Color = pleat === 0 ? "cream3" : pleat === 1 ? "cream5" : pleat === 5 ? "cream4" : "cream5";
      // Gathered at the rings: the top rows bunch into scallops.
      if (y === ROD + 1 && pleat % 3 === 1) c = "cream4";
      // Drawn-thread lace in the hem: a band of open work showing the glass behind.
      if (y === SILL - 7 || y === SILL - 5) c = (x + y) % 2 === 0 ? "white" : "cream4";
      if (y === SILL - 6) c = pleat === 0 ? "cream3" : "cream5";
      p.px(x, y, c);
    }
  }
  // Rings on the rod.
  for (let x = GX + 2; x < GX + GW; x += 6) if (x !== 33 && x !== 34) p.px(x, ROD + 1, "gold2");
}

/** Dark wooden sill (rows 41–46): lit top edge, top surface, front face, underside. */
function sill(p: Px) {
  p.hline(0, SILL, W, "wood4").rect(0, SILL + 1, W, 2, "wood3").hline(0, SILL + 3, W, "wood2").hline(0, SILL + 4, W, "wood1").hline(1, SILL + 5, W - 2, "wood1");
  p.hline(5, SILL + 1, 16, "wood4").hline(40, SILL + 2, 12, "wood2");
  p.px(0, SILL, "wood3").px(W - 1, SILL, "wood2");
}

const ITEMS: Legend = {
  r: "red3", b: "blue3", B: "blue2", w: "white", W: "cream5", k: "cream3",
  y: "bamboo4", Y: "bamboo3", u: "bamboo2", s: "steel4", S: "steel3", t: "steel2", T: "steel1",
  g: "leaf4", G: "leaf3", h: "leaf2", j: "jade4", J: "jade3", q: "jade5", c: "cream4", e: "wood5", E: "wood6",
};

const windowDef = (draw: (p: Px) => void) => ({ w: W, h: H, anchor: [34, 85] as const, layer: "floor" as const, draw });

export default defineSprites({
  /**
   * The east dining window: transom lights over two casements. Outside, a neighbour's tiled roof and a
   * plane-tree branch, the Concession's trees. On the sill: chopsticks drying in a blue-and-white jar
   * after the morning wash, and a tin of spring onion roots the owner keeps regrowing in water.
   */
  "wall/window-lattice": windowDef((p) => {
    const g = plan("transom");
    glass(p, g);
    beyond(p, g, 44, 3, [
      "..hhh.............",
      "hhhhhhhh..........",
      ".hhhhhhhhhh.......",
      "...hh..hhhhh......",
    ], { h: "leaf2" }, 0.75);
    beyond(p, g, 5, 15, [
      "....................bbbbbbbbbbbbbbbbbb....................",
      "...............bbbbbbbbbbbbbbbbbbbbbbbbbbbb...............",
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "bBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbB",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ], { b: "blue3", B: "blue2" }, 0.8);
    joinery(p, g);
    curtain(p);
    sill(p);
    block(p, 9, 30, [
      ".g.G..",
      ".gG.g.",
      "..gGg.",
      ".GgG..",
      "..GG..",
      "TsssST",
      "TsSStT",
      "TssStT",
      "TsSttT",
      ".TTTT.",
    ], ITEMS, "spring-onions");
    block(p, 51, 26, [
      "r..r..r.",
      "y..y..Y.",
      ".y.y.Y..",
      ".y.yY..r",
      "..yyYY..",
      "..yyY...",
      ".BwwwwB.",
      "BwwbbwkB",
      "BwbwwbkB",
      "BwwbbwkB",
      "BWwwwkkB",
      ".BBBBBB.",
    ], ITEMS, "chopstick-jar");
  }),

  /**
   * The west dining window, under a segmental arch with a radiating fanlight. One glazing bar snapped
   * and was mended in pale new pine, never painted. A neighbour's laundry on a bamboo pole outside.
   * On the sill: a folded tea towel and the sun-bleached patch where the shop cat sleeps every morning.
   */
  "wall/window-lattice-b": windowDef((p) => {
    const g = plan("arch");
    glass(p, g);
    beyond(p, g, 5, 14, [
      "uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu",
      "..q..qq..q...............jj..jj..........pppppp...........",
      ".qqqqqqqqqq..............jjjjjj..........pppppp...........",
      "qqqqqqqqqqqq.............jjjjjj..........PPPPPP...........",
      "qq.qqqqqq.qq.............jjjjjj..........pppppp...........",
      "....qqqqqq...............jj..jj..........pppppp...........",
      "....QQQQQQ...............jj..jj...........................",
    ], { u: "bamboo2", q: "blue3", Q: "blue2", j: "jade3", J: "jade2", p: "pink2", P: "pink1" }, 0.85);
    joinery(p, g, [6, 17, 19]);
    // Cotton lashings at the ends of the mended bar.
    p.px(6, 19, "cream5").px(17, 19, "cream5");
    curtain(p);
    sill(p);
    for (let x = 9; x < 31; x++) {
      const edge = x < 12 || x > 27;
      p.px(x, SILL + 1, edge ? "wood3" : "wood4").px(x, SILL + 2, edge ? "wood3" : "wood4");
      if (!edge && x > 13 && x < 26) p.px(x, SILL, "wood5");
    }
    block(p, 43, 33, [
      ".WWWWWWWWWWW.",
      "WWWWWWWWWWWWk",
      "JJJJJJJJJJJJk",
      "WWWWWWWWWWWWk",
      "kkkkkkkkkkkkk",
      "WWWWWWWWWWWWk",
      "qqqqqqqqqqqqk",
      ".kkkkkkkkkkk.",
    ], ITEMS, "tea-towel");
  }),

  /**
   * A small high louvred vent window for the kitchen, 32×24. Grease has filmed the lower slats amber,
   * a spider has had the top corner for years, and the pull cord hangs from the opener with a knot
   * tied in it to make it reach. Anchors at the wall's foot: place at (x, 96) and its top lands on row 12.
   */
  "wall/window-vent": {
    w: 32, h: 24, anchor: [16, 84], layer: "floor",
    draw: (p) => {
      p.rect(0, 0, 30, 22, "steel3");
      p.hline(0, 0, 30, "steel5").vline(0, 0, 22, "steel5").hline(0, 21, 30, "steel1").vline(29, 0, 22, "steel1");
      p.hline(2, 2, 26, "steel2").vline(2, 2, 18, "steel2");
      // Four glass louvres, each lit along its top edge and overlapping the one below.
      for (let i = 0; i < 4; i++) {
        const y = 3 + i * 4 + (i > 1 ? 1 : 0);
        p.faded(0.75, () => p.rect(3, y, 24, 4, i < 2 ? "blue5" : "blue6"));
        p.faded(0.9, () => p.hline(3, y, 24, "white"));
        p.hline(3, y + 3, 24, "steel2");
        if (i >= 2) p.faded(0.45, () => p.rect(3, y + 1, 24, 2, "bamboo4"));
        p.px(3, y + 1, "steel4").px(26, y + 1, "steel4");
      }
      p.faded(0.75, () => p.rect(3, 20, 24, 1, "blue6"));
      // Cobweb in the top-left corner.
      p.faded(0.6, () => block(p, 3, 3, ["wwwww.", "w..w..", "w.w...", "ww....", "w....."], { w: "white" }, "web"));
      // The opener on the right and its knotted cord.
      block(p, 27, 9, ["ss", "St", "t."], { s: "steel5", S: "steel4", t: "steel2" }, "opener");
      for (let y = 12; y < 24; y++) p.px(28, y, y === 18 ? "cream3" : "cream4");
      p.px(29, 18, "cream3").px(28, 23, "cream2");
    },
  },
});
