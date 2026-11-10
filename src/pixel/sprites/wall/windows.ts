/**
 * Windows in the back wall's plaster zone, and the post that breaks the long wall.
 *
 * Lattice windows are 68×42: a tea-wood architrave 64 wide, two casements of wooden lattice over
 * translucent glass with the morning sky, and a sill (rows 37–41) with something on it. They anchor
 * at the wall's foot, so place them at (x, 96) on a wall that starts at y = 0: the frame top lands on
 * wall row 13 and the sill's underside on row 54.
 */
import { defineSprites, type Color, type Legend, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

const GLASS_TOP = 4, GLASS_H = 29, CASE_W = 27;

/**
 * The morning sky through the glass, luminous: near-white toward the top-left panes where the sun is,
 * pale blue across the middle, warm cream low down where the light comes off the street. The bands run
 * diagonally and meet in a one-pixel checker, so the gradient never bands. Glass may dither.
 */
function sky(p: Px) {
  const bands: [number, Color][] = [[0, "white"], [0.3, "blue6"], [0.62, "cream5"], [0.86, "gold5"]];
  const bandAt = (t: number) => bands.reduce((i, [from], j) => (t >= from ? j : i), 0);
  for (let y = 0; y < GLASS_H; y++) for (let x = 0; x < 56; x++) {
    const t = (y / GLASS_H) * 0.75 + (x / 56) * 0.35;
    let i = bandAt(t);
    // Within a short reach of a boundary, alternate pixels take the neighbouring band.
    if (i > 0 && t - bands[i][0] < 0.035 && (x + y) % 2 === 0) i -= 1;
    p.faded(0.9, () => p.px(6 + x, GLASS_TOP + y, bands[i][1]));
  }
}

/** Something seen through the glass, drawn faint: `rows` relative to the glass's top-left. */
function beyond(p: Px, rows: readonly string[], legend: Legend, alpha = 0.6, dx = 0, dy = 0) {
  p.faded(alpha, () => block(p, 6 + dx, GLASS_TOP + dy, rows, legend, "beyond"));
}

/** Two diagonal glints on the glass, the window's own reflection of the room's light. */
function glints(p: Px) {
  p.faded(0.75, () => {
    for (let i = 0; i < 7; i++) p.px(10 + i, GLASS_TOP + 12 - i, "white").px(11 + i, GLASS_TOP + 12 - i, "white");
    for (let i = 0; i < 5; i++) p.px(41 + i, GLASS_TOP + 22 - i, "white");
  });
}

/**
 * Lattice bars from a mask (`#` bar, `.` glass) the size of one casement, shaded by which side
 * meets glass: lit above and to the left, in shade below and to the right.
 */
function lattice(p: Px, x0: number, mask: readonly string[], mend?: { x: number; y: number; w: number; h: number }) {
  const bar = (x: number, y: number) => mask[y]?.[x] === "#";
  for (let y = 0; y < mask.length; y++) for (let x = 0; x < mask[0].length; x++) {
    if (!bar(x, y)) continue;
    const mended = mend && x >= mend.x && x < mend.x + mend.w && y >= mend.y && y < mend.y + mend.h;
    let c: Color = mended ? "wood5" : "wood3";
    if (!bar(x, y - 1) && y > 0) c = mended ? "wood6" : "wood5";
    else if (!bar(x - 1, y) && x > 0) c = mended ? "wood6" : "wood4";
    else if (!bar(x, y + 1) && y < mask.length - 1) c = mended ? "wood4" : "wood2";
    else if (!bar(x + 1, y) && x < mask[0].length - 1) c = mended ? "wood4" : "wood2";
    p.px(x0 + x, GLASS_TOP + y, c);
  }
}

/** Build a casement mask from 2px bars: [x, y, w, h] rectangles inside a 27×29 casement with a 2px border. */
function mask(bars: readonly (readonly [number, number, number, number])[]): string[] {
  const g = Array.from({ length: GLASS_H }, (_, y) => Array.from({ length: CASE_W }, (_, x) => (x < 2 || x >= CASE_W - 2 || y < 2 || y >= GLASS_H - 2 ? "#" : ".")));
  for (const [x, y, w, h] of bars) for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = "#";
  return g.map((r) => r.join(""));
}

/** 步步锦-style: a central frame tied to the border by four short bars, with stepped corner bars. */
const STEP_BROCADE = mask([
  [7, 8, 13, 2], [7, 19, 13, 2], [7, 8, 2, 13], [18, 8, 2, 13],
  [2, 14, 5, 2], [20, 14, 5, 2], [12, 2, 2, 6], [12, 21, 2, 6],
  [2, 5, 6, 2], [5, 2, 2, 3], [19, 5, 6, 2], [20, 2, 2, 3],
  [2, 23, 6, 2], [5, 25, 2, 2], [19, 23, 6, 2], [20, 25, 2, 2],
]);
/** Brick lattice: offset rows of panes, like courses of brick. */
const BRICK = mask([
  [2, 9, 23, 2], [2, 18, 23, 2],
  [8, 2, 2, 7], [17, 2, 2, 7],
  [4, 11, 2, 7], [12, 11, 2, 7], [21, 11, 2, 7],
  [8, 20, 2, 7], [17, 20, 2, 7],
]);

/** Architrave: outer edge lit top and left, hairline shade bottom and right; inner edges the reverse. */
function architrave(p: Px) {
  p.rect(2, 0, 64, 37, "wood3");
  p.hline(2, 0, 64, "wood5").vline(2, 0, 37, "wood5").hline(3, 1, 62, "wood4").vline(3, 1, 35, "wood4");
  p.hline(2, 36, 64, "wood1").vline(65, 0, 37, "wood1").vline(64, 1, 35, "wood2");
  p.hline(5, 3, 58, "wood2").vline(5, 3, 31, "wood2").hline(5, 33, 58, "wood4").vline(62, 3, 31, "wood4");
  // Grain on the rails.
  for (const [x, y, n] of [[9, 2, 14], [38, 1, 18], [12, 35, 20], [44, 34, 9]] as const) p.hline(x, y, n, y < 3 ? "wood4" : "wood2");
  for (const [x, y, n] of [[4, 8, 9], [63, 14, 11]] as const) p.vline(x, y, n, x < 10 ? "wood4" : "wood2");
}

/** Sill (rows 37–41): lit top edge, top surface, front face, underside. */
function sill(p: Px) {
  p.hline(0, 37, 68, "wood5").rect(0, 38, 68, 2, "wood4").hline(0, 40, 68, "wood2").hline(0, 41, 68, "wood1");
  p.hline(5, 38, 16, "wood5").hline(40, 39, 12, "wood3");
  p.px(0, 37, "wood4").px(67, 37, "wood3").px(67, 38, "wood3").px(67, 40, "wood1");
}

function meetingStile(p: Px) {
  p.vline(33, GLASS_TOP, GLASS_H, "wood4").vline(34, GLASS_TOP, GLASS_H, "wood2");
  block(p, 32, GLASS_TOP + 13, [".gg.", "gGGd", ".dd."], { g: "gold4", G: "gold3", d: "gold1" }, "latch");
}

const ITEMS: Legend = {
  r: "red3", b: "blue3", B: "blue2", w: "white", W: "cream5", k: "cream3",
  y: "bamboo4", Y: "bamboo3", u: "bamboo2", s: "steel4", S: "steel3", t: "steel2", T: "steel1",
  g: "leaf4", G: "leaf3", h: "leaf2", j: "jade4", J: "jade3", q: "jade5", c: "cream4", e: "wood5", E: "wood6",
};

const windowDef = (draw: (p: Px) => void) => ({ w: 68, h: 42, anchor: [34, 83] as const, layer: "floor" as const, draw });

export default defineSprites({
  /**
   * The east dining window. Step-brocade lattice, a neighbour's tiled roof and a camphor branch beyond.
   * On the sill: the chopsticks drying in a blue-and-white jar after the morning wash, and a tin of
   * spring onion roots the owner keeps regrowing in water.
   */
  "wall/window-lattice": windowDef((p) => {
    architrave(p);
    sky(p);
    beyond(p, [
      "..............................................hhh.....",
      "...........................................hhhhhhhh...",
      "............................................hhhhhhhhhh",
      "..............................................hh..hhhh",
    ], { h: "leaf2" }, 0.75, 2, 0);
    beyond(p, [
      "....................bbbbbbbbbbbbbbbb....................",
      "................bbbbbbbbbbbbbbbbbbbbbbbb................",
      "..........bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..........",
      "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
      "bBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbBbB",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ], { b: "blue3", B: "blue2" }, 0.8, 0, 23);
    glints(p);
    lattice(p, 6, STEP_BROCADE);
    lattice(p, 35, STEP_BROCADE.map((r) => [...r].reverse().join("")));
    meetingStile(p);
    sill(p);
    // Spring onion roots regrowing in a tin.
    block(p, 9, 28, [
      ".g.G..",
      ".gG.g.",
      "..gGg.",
      ".GgG..",
      "..GG..",
      "...h..",
      "TsssST",
      "TsSStT",
      "TssStT",
      "TsSttT",
      ".TTTT.",
    ], ITEMS, "spring-onions");
    // Chopsticks drying in a blue-and-white jar.
    block(p, 51, 21, [
      "r..r..r.",
      "y..y..Y.",
      "y..y.Y..",
      ".y.y.Y..",
      ".y.yY..r",
      ".y.yY.Y.",
      "..yyYY..",
      "..yyYY..",
      "..yyY...",
      ".BwwwwB.",
      "BwwbbwkB",
      "BwbwwbkB",
      "BwwbbwkB",
      "BwwwwkkB",
      "BWwwwkkB",
      ".BBBBBB.",
    ], ITEMS, "chopstick-jar");
  }),

  /**
   * The west dining window. Brick lattice with one bar snapped and mended in pale new pine, lashed with
   * cotton; a neighbour's laundry on a bamboo pole outside. On the sill: a folded tea towel, and the
   * pale, sun-bleached patch where the shop cat sleeps every morning.
   */
  "wall/window-lattice-b": windowDef((p) => {
    architrave(p);
    sky(p);
    // A neighbour's laundry on a bamboo pole: a blue work shirt, jade trousers, a pink towel.
    beyond(p, [
      "uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu",
      "..q..qq..q..............jj..jj..........pppppp..........",
      ".qqqqqqqqqq.............jjjjjj..........pppppp..........",
      "qqqqqqqqqqqq............jjjjjj..........PPPPPP..........",
      "qq.qqqqqq.qq............jjjjjj..........pppppp..........",
      "....qqqqqq..............jj..jj..........pppppp..........",
      "....qqqqqq..............jj..jj..........pppppp..........",
      "....QQQQQQ..............jj..jj..........................",
      "........................JJ..JJ..........................",
    ], { u: "bamboo2", q: "blue3", Q: "blue2", j: "jade3", J: "jade2", p: "pink2", P: "pink1" }, 0.85, 0, 6);
    glints(p);
    lattice(p, 6, BRICK, { x: 12, y: 11, w: 2, h: 7 });
    lattice(p, 35, BRICK.map((r) => [...r].reverse().join("")));
    // Cotton lashings at each end of the mended bar.
    p.px(18, GLASS_TOP + 11, "cream5").px(19, GLASS_TOP + 11, "cream3").px(18, GLASS_TOP + 17, "cream5").px(19, GLASS_TOP + 17, "cream3");
    meetingStile(p);
    sill(p);
    // The cat's patch: the varnish bleached away in a soft oval.
    for (let x = 9; x < 31; x++) {
      const edge = x < 12 || x > 27;
      p.px(x, 38, edge ? "wood5" : "wood6").px(x, 39, edge ? "wood4" : "wood5");
      if (!edge && x > 13 && x < 26) p.px(x, 37, "wood6");
    }
    // A folded tea towel, white with a jade stripe.
    block(p, 43, 31, [
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
