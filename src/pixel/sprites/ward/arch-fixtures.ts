/**
 * Things fixed to the ward's back wall. Wall-mounted pieces anchor at the wall's foot like the window:
 * place them at (x, 96) on a wall that starts at y = 0 and their top lands on the row given below.
 * They are `floor` layer (painted on the wall), with a hairline shadow on the bottom and right only.
 * The radiator (62×24) stands on the floor against the wall and is depth-sorted with people: place its
 * anchor 4px below the wall's foot, at (x, 100).
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { WALL, block, fromTop } from "./_arch.ts";

// ── radiator ─────────────────────────────────────────────────────────────────

/**
 * A cast-iron column radiator from when the wing had steam, fourteen sections, painted cream over the
 * old silver so many times the edges are soft; the valve is painted solid and has not turned since the
 * nineties. Orange peel dries on top (the elder's: he makes 陈皮 tea from it), and a striped towel
 * hangs over the right end.
 */
function radiator(p: Px) {
  const top = 2, bottom = 18, x0 = 6, n = 13;
  for (let i = 0; i < n; i++) {
    const x = x0 + i * 4;
    // Column top seen from above, then the face: lit left, body, a groove where it meets the next one.
    p.hline(x, 0, 3, "cream5").px(x + 3, 0, "cream3");
    p.px(x, 1, "cream5").px(x + 1, 1, "cream4").px(x + 2, 1, "cream4").px(x + 3, 1, "cream2");
    for (let y = top; y <= bottom; y++) {
      p.px(x, y, "cream5").px(x + 1, y, "cream4").px(x + 2, y, "cream3");
      // The groove where two sections meet, darkest between the hubs where it opens to the wall.
      p.px(x + 3, y, y >= 6 && y <= 14 ? "cream1" : "cream2");
    }
    // The hubs: a lit band across each section top and bottom, so the block reads as one casting.
    p.px(x, 4, "white").px(x + 1, 4, "cream5").px(x, 16, "cream5");
    p.px(x, bottom + 1, "cream3").px(x + 1, bottom + 1, "cream3").px(x + 2, bottom + 1, "cream2").px(x + 3, bottom + 1, "cream1");
    // The old silver paint showing through where it has chipped on a lit edge.
    if (i % 5 === 2) p.px(x, 8 + i, "steel4").px(x, 9 + i, "steel5");
  }
  p.vline(x0 + n * 4 - 1, 0, bottom + 2, "cream1");
  // Legs at either end, and the feed pipe and painted-over valve on the left.
  block(p, x0 + 1, 20, ["KK", "KK", "mm", "mm"], WALL, "leg-l");
  block(p, x0 + n * 4 - 4, 20, ["KK", "KK", "mm", "mm"], WALL, "leg-r");
  block(p, 0, 4, [
    ".kCk.",
    "kCcck",
    ".kck.",
    "..c..",
    ".Ccc.",
  ], WALL, "valve");
  for (let y = 9; y < 24; y++) p.px(1, y, "cream5").px(2, y, "cream4").px(3, y, "cream3");
  p.hline(1, 13, 5, "cream4").hline(1, 14, 5, "cream3");
  // Orange peel drying on top in curled strips.
  block(p, 14, 0, [".oO..", "oOOo.", "..oo."], { o: "orange3", O: "orange2" }, "peel-1");
  block(p, 23, 0, ["oo..", ".OOo"], { o: "orange3", O: "orange2" }, "peel-2");
  block(p, 33, 0, ["..oo", "oOO.", ".o.."], { o: "orange3", O: "orange2" }, "peel-3");
  // The towel over the right end: white cotton, two blue stripes, a fringe.
  block(p, 44, 0, [
    "..WWWWWWWWW..",
    ".WWWWWWWWWWCk",
    "WCWWWWWWWWWCk",
    "WCWWWWWWWWWCk",
    "WCWWWWWWWWCkk",
    "bbbbbbbbbbBk.",
    "WCWWWWWWWWCk.",
    "bbbbbbbbbbBk.",
    "WCWWWWWWWCkk.",
    "WCWWWWWWWCk..",
    "kCkCkCkCkCk..",
    "k.k.k.k.k.k..",
  ], { ...WALL, b: "blue4", B: "blue3" }, "towel");
}

// ── nurse call ───────────────────────────────────────────────────────────────

/**
 * The nurse-call panel: a cream plastic box with the big call button (the one red thing on the ward),
 * a small green reset and an amber lamp; its coiled cord sprung out of shape from being stretched to
 * the pillow, and the pendant hanging at the end of it with its own button. Top on wall row 42.
 */
function nurseCall(p: Px) {
  block(p, 1, 0, [
    "CWWWWWWWWWC.",
    "WWWWWWWWWWck",
    "WWkrrrkWWWck",
    "WWrRrrrWyWck",
    "WWrrrrrWWWck",
    "WWkrrrkWhWck",
    "WWWWWWWWWWck",
    "WWWWEEEWWWck",
    "WWWWEiEWWWck",
    "CccccccccccK",
    ".kkkkkkkkkkK",
  ], { ...WALL, r: "red3", R: "red4", y: "gold4", h: "jade3" }, "panel");
  // The coiled cord: loose rings, stretched wider apart at the bottom where it has been pulled.
  const rings = [12, 14, 16, 18, 20, 23, 26, 29, 32];
  rings.forEach((y, i) => {
    const x = 6 + (i > 5 ? 1 : 0);
    block(p, x, y, [".CC.", "C..k", ".kk."], WALL, "ring");
  });
  block(p, 6, 35, [
    "..kC..",
    ".CWWk.",
    ".WrRk.",
    ".WrrK.",
    ".WWWk.",
    ".WWWk.",
    ".CWWk.",
    ".WWWK.",
    ".kkkK.",
    "..KK..",
  ], { ...WALL, r: "red3", R: "red4" }, "pendant");
}

// ── clock ────────────────────────────────────────────────────────────────────

/**
 * The ward clock: a jade plastic rim gone paler on the side that faces the window, a white face with
 * ticks and no numerals, black hands at twenty past seven (fixed; the clock is right, it is
 * morning), a thin second hand that steps once a second, and a strip of tape mending a crack in the
 * rim from the time it fell. Top on wall row 16.
 */
const SIZE = 23, C = 11.5;
function polar(deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [Math.floor(C + Math.sin(a) * r), Math.floor(C - Math.cos(a) * r)];
}
function hand(p: Px, deg: number, r: number, c: Color) {
  for (let i = 1; i <= r * 2; i++) { const [x, y] = polar(deg, i / 2); p.px(x, y, c); }
}
function clock(p: Px, frame: number) {
  // Hairline shadow down and right, then the rim, then the face.
  p.ellipse(C + 1, C + 1, 11.5, 11.5, "cream2");
  p.ellipse(C, C, 11.5, 11.5, "jade2");
  p.ellipse(C, C, 10.5, 10.5, "jade3");
  p.each((x, y, c) => (c === "jade3" && x + y < 20 ? "jade4" : c === "jade2" && x + y < 14 ? "jade3" : undefined));
  p.ellipse(C, C, 9.5, 9.5, "white");
  p.each((x, y, c) => (c === "white" && x + y > 27 ? "cream5" : undefined));
  for (let h = 0; h < 12; h++) {
    const major = h % 3 === 0;
    const [x, y] = polar(h * 30, 8.4);
    p.px(x, y, major ? "ink2" : "stone3");
    if (major) { const [x2, y2] = polar(h * 30, 7.4); p.px(x2, y2, "ink2"); }
  }
  hand(p, 220, 4.6, "ink2");
  hand(p, 120, 7, "ink2");
  hand(p, frame * 6, 7.6, "steel3");
  p.px(11, 11, "jade2");
  // Glass glint, top left.
  p.faded(0.7, () => { for (const [x, y] of [[5, 7], [6, 6], [7, 5], [8, 4]] as const) p.px(x, y, "white"); });
  // The mended crack: yellowed tape across the rim at the bottom left.
  block(p, 4, 18, ["yy.", "yYy", ".yY"], WALL, "tape");
}

// ── noticeboard ──────────────────────────────────────────────────────────────

/**
 * The ward noticeboard: cork in a cheap aluminium frame. A blank white card at top left (room for DOM
 * text), a ruled card below it, a child's drawing of a house, a sun and two people, one tall and one
 * small, pinned up for the elder by his granddaughter and curling at one corner. Below, the paler
 * ghost of a notice that came down, and two pins left in empty cork. Top on wall row 16.
 *
 * Blank card face for a DOM mark: sprite px x 7–20, y 6–14 (14×9).
 */
function noticeboard(p: Px) {
  const W = 56, H = 38;
  p.rect(1, 1, W - 1, H - 1, "cream2");
  p.rect(0, 0, W - 1, H - 1, "steel4");
  p.hline(0, 0, W - 1, "steel6").vline(0, 0, H - 1, "steel6").hline(1, H - 2, W - 2, "steel3").vline(W - 2, 1, H - 2, "steel3");
  // Cork: honey ground with small clusters of darker and paler granules.
  p.rect(2, 2, W - 5, H - 5, "oak4");
  for (let y = 2; y < H - 3; y += 3) for (let x = 2 + (y % 2); x < W - 3; x += 4) {
    const c: Color = (x * 7 + y * 3) % 5 < 2 ? "oak3" : "oak5";
    p.px(x, y, c);
    if ((x + y) % 3 === 0) p.px(x + 1, y, c);
  }
  p.hline(2, 2, W - 5, "oak3").vline(2, 2, H - 5, "oak3");
  // The ghost of a notice taken down, and its empty pin holes.
  p.rect(30, 29, 18, 5, "oak5");
  p.px(38, 29, "oak2").px(31, 30, "oak2");
  // Blank card (top left), with its shadow on the cork.
  p.rect(7, 6, 15, 10, "oak3");
  p.rect(6, 5, 15, 10, "white");
  p.hline(6, 14, 15, "cream4").vline(20, 5, 10, "cream4");
  block(p, 12, 4, [".h.", "hJh", ".G."], { h: "jade4", J: "jade5", G: "jade2" }, "pin-jade");
  // Ruled card below it, its two lines abstract.
  p.rect(9, 20, 13, 10, "oak3");
  p.rect(8, 19, 13, 10, "cream5");
  p.hline(10, 22, 9, "cream3").hline(10, 25, 7, "cream3").hline(8, 28, 13, "cream4");
  block(p, 13, 18, [".b.", "bBb", ".n."], { b: "blue3", B: "blue4", n: "blue1" }, "pin-blue");
  // The child's drawing, curling at its bottom-right corner.
  p.rect(27, 5, 22, 22, "oak3");
  p.rect(26, 4, 22, 22, "white");
  block(p, 44, 22, ["...W", "..kk", ".kkK", "kkKK"], { ...WALL }, "curl");
  p.px(47, 25, null).px(46, 25, null).px(47, 24, null);
  p.px(47, 25, "oak4").px(46, 25, "oak4").px(47, 24, "oak4");
  block(p, 28, 6, [
    ".y.y...",
    "..YY.y.",
    "yYYYY..",
    ".YYYYy.",
    "y.YY...",
    "...y...",
  ], { y: "gold3", Y: "gold4" }, "sun");
  block(p, 36, 10, [
    "...OO...",
    "..OooO..",
    ".OooooO.",
    "OOOOOOOO",
    ".bbbbbb.",
    ".bWbbbb.",
    ".bWbbBb.",
    ".bbbbBb.",
  ], { O: "orange2", o: "orange3", b: "blue4", B: "blue2", W: "gold5" }, "house");
  block(p, 29, 14, [
    ".n.....",
    "nnn....",
    ".n...n.",
    "nnn.nnn",
    ".n...n.",
    "n.n.n.n",
  ], { n: "blue2" }, "people");
  p.hline(27, 21, 20, "leaf3");
  for (const x of [28, 31, 35, 40, 44]) p.px(x, 20, "leaf4");
  block(p, 36, 3, [".p.", "pPp", ".q."], { p: "pink2", P: "pink3", q: "pink1" }, "pin-pink");
  // Two pins left in the empty cork.
  block(p, 50, 29, [".g.", "gGg", ".d."], { g: "gold3", G: "gold4", d: "gold1" }, "pin-gold");
  block(p, 24, 31, [".h.", "hJh", ".G."], { h: "jade3", J: "jade4", G: "jade1" }, "pin-jade-2");
}

export default defineSprites({
  "ward/radiator": {
    w: 62, h: 24, anchor: [31, 23], foot: [-27, -4, 54, 4], shadow: { rx: 27, ry: 3 },
    draw: radiator,
  },
  "ward/nurse-call": { w: 16, h: 46, anchor: [8, fromTop(42)], layer: "floor", draw: nurseCall },
  "ward/clock": { w: SIZE + 1, h: SIZE + 1, anchor: [12, fromTop(16)], layer: "floor", frames: 60, fps: 1, draw: clock },
  "ward/noticeboard": { w: 56, h: 38, anchor: [28, fromTop(16)], layer: "floor", draw: noticeboard },
});
