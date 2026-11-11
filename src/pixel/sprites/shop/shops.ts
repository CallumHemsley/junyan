/**
 * The town's four everyday shops (`building-shop`), each its own building with its own owner:
 *
 * - `town/corner-store` (320×320): 老陈's corner store, a 1930s brick house with a 1990s refit. White
 *   tiles, aluminium, a glowing drinks fridge, a PVC strip curtain for a door, a cigarette counter at
 *   the hatch, a blank lightbox. Upstairs, steel security cages full of pots and a pole of shirts;
 *   on the tiled roof a solar water heater and an aerial nobody has used since cable.
 *   Sign field: x 21..299, rows 206..219.
 * - `town/market-house` (320×128): the covered market's street end, open-fronted between timber posts,
 *   white-tiled counters, hooks, a steelyard, basins and baskets; a lean-to of pantiles over it.
 *   Sign field: x 84..236, rows 37..47.
 * - `town/south-bakery` (320×192): a White Russian bakery the neighbourhood never stopped calling
 *   "the Russian's": powder-blue shopfront, a bow window of loaves and one pink cake under glass, the
 *   oven's brick flue smoking on the roof. Sign field: x 33..287, rows 98..107.
 * - `town/bookshop` (320×256): a secondhand bookshop in a dark timber house, books in every window and
 *   overflowing the upstairs sill, a green banker's lamp, a dormer window (老虎窗) where the owner reads
 *   late. Sign field: x 114..206, rows 162..173.
 */
import { defineSprites, hash, type Color, type Legend, type Px } from "../../kit/index.ts";
import type { TownProp } from "../../town/map.ts";
import { laneShop } from "./_lane-shop.ts";
import {
  acUnit, aerial, block, boards, cable, downpipe, greyBrick, lattice, pantileRoof, perProp, plotFoot,
  roofCat, shadowWedge, signboard, sillPot, step, stucco, tileSkirt, wisp, zrect,
} from "./_front.ts";

const BOOK: Color[] = ["blue2", "jade2", "rose2", "oak4", "cream4", "plum2", "wood3", "blue3", "jade3", "gold2", "grey2", "cream3"];

/** A shelf of books on a line at row `y`: spines of varied height and colour, a gap or a leaning one. */
function books(p: Px, x: number, y: number, w: number, seed: number, maxH = 9) {
  let i = 0;
  while (i < w) {
    const r = hash(x + i, y, seed);
    const bw = r < 0.3 ? 2 : 3;
    if (r > 0.94) { i += 3; continue; }
    const bh = maxH - Math.floor(hash(i, y, seed + 1) * 4);
    const c = BOOK[Math.floor(hash(i, seed, 2) * BOOK.length)];
    p.rect(x + i, y - bh, Math.min(bw, w - i), bh, c);
    p.vline(x + i, y - bh, bh, step(c, 1));
    if (bh > 6) p.hline(x + i, y - bh + 2, Math.min(bw, w - i), step(c, -1));
    i += bw;
  }
}

/** A window of small panes in a dark timber frame, `cols` × `rows` panes; returns the glass rect. */
function paneWindow(p: Px, x: number, y: number, w: number, h: number, cols: number, rows: number, frame: [Color, Color, Color] = ["wood1", "wood2", "wood4"]) {
  const [d, m, l] = frame;
  for (let i = 0; i <= cols; i++) {
    const bx = x + Math.round((i * (w - 2)) / cols);
    p.rect(bx, y, 2, h, m).vline(bx, y, h, l);
  }
  for (let j = 0; j <= rows; j++) {
    const by = y + Math.round((j * (h - 2)) / rows);
    p.rect(x, by, w, 2, m).hline(x, by, w, l);
  }
  p.frame(x - 1, y - 1, w + 2, h + 2, d);
}

// ── corner store ────────────────────────────────────────────────────────────

function cornerStore(p: Px, w: number, H: number) {
  const F = 144;
  pantileRoof(p, 0, 0, w, H - F + 1, { ridge: 54, seed: 31 });
  // Solar water heater on the near slope: a rack of black vacuum tubes under a white tank.
  const sx = 34, sy = 104;
  p.rect(sx - 2, sy - 10, 104, 8, "steel6").hline(sx - 2, sy - 10, 104, "white").hline(sx - 2, sy - 3, 104, "steel3");
  p.ellipse(sx - 2, sy - 6, 2, 4, "steel4").ellipse(sx + 102, sy - 6, 2, 4, "steel3");
  for (let i = 0; i < 100; i += 4) {
    p.rect(sx + i, sy - 2, 3, 40, "blue1").vline(sx + i, sy - 2, 40, "steel2").px(sx + i + 1, sy + 4, "blue3");
  }
  p.hline(sx - 2, sy + 38, 104, "steel3").hline(sx - 2, sy + 39, 104, "steel1");
  for (const lx of [sx, sx + 98]) p.rect(lx, sy + 38, 3, 8, "steel2");
  cable(p, sx + 104, sy - 6, 190, 160, 6, "ink2");
  // The dead aerial on the ridge, a plastic bag snagged on it, and a satellite dish at real size.
  aerial(p, 226, 56);
  block(p, 218, 32, ["..aa.", ".abba", "abbba", ".abb.", "..a.."], { a: "steel5", b: "white" }, "bag");
  satelliteDish(p, 246, 108);
  // Facade: grey brick upper storey over a white-tiled ground floor.
  greyBrick(p, 0, H - F, w, F - 76, 32);
  // Cornice and a cream string course.
  zrect(p, H, 0, 138, w, 144, "cream3");
  zrect(p, H, 0, 143, w, 144, "cream5");
  zrect(p, H, 0, 138, w, 139, "cream1");
  zrect(p, H, 0, 96, w, 99, "cream3");
  zrect(p, H, 0, 98, w, 99, "cream4");
  // Upstairs: two windows behind security cages crowded with pots; a pole of shirts.
  for (const [x, story] of [[40, 0], [196, 1]] as const) cagedWindow(p, H, x, 104, story);
  acUnit(p, 150, H - 118, 9, 12);
  // Lightbox sign.
  signboard(p, 18, H - 97, 284, 20, "light");
  zrect(p, H, 0, 76, w, 78, "steel2");
  // Ground floor in small white tiles.
  for (let j = 0; j < 76; j++) for (let i = 0; i < w; i++) {
    const grout = j % 6 === 5 || i % 6 === 5;
    zrect(p, H, i, j, 1, j + 1, grout ? "steel4" : j < 12 && hash(i >> 2, j >> 2, 5) < 0.3 ? "steel5" : "steel6");
  }
  // Left: the shop window, shelves packed to the glass, the drinks fridge glowing at the back.
  const wx = 10, wz = 10, ww = 140, wh = 60;
  zrect(p, H, wx, wz, ww, wz + wh, "ink2");
  p.rect(wx + 98, H - wz - wh + 4, 38, wh - 6, "white");
  for (let j = 0; j < 4; j++) {
    const by = H - wz - wh + 16 + j * 13;
    p.hline(wx + 98, by, 38, "steel4");
    for (let i = 0; i < 36; i += 3) p.rect(wx + 99 + i, by - 7, 2, 7, (["jade3", "orange2", "blue3", "cream3", "gold3", "steel4"] as Color[])[Math.floor(hash(i, j, 4) * 6)]).px(wx + 99 + i, by - 8, "steel3");
  }
  for (let j = 0; j < 4; j++) {
    const by = H - wz - 6 - j * 14;
    p.hline(wx + 2, by, 94, "steel4").hline(wx + 2, by + 1, 94, "steel2");
    let i = 0;
    while (i < 92) {
      const bw = 5 + Math.floor(hash(i, j, 9) * 6), bh = 6 + Math.floor(hash(j, i, 9) * 5);
      const c = (["jade4", "orange3", "blue4", "cream4", "plum3", "gold4", "leaf4", "pink3"] as Color[])[Math.floor(hash(i, j, 10) * 8)];
      p.rect(wx + 3 + i, by - bh, Math.min(bw - 1, 93 - i), bh, c).hline(wx + 3 + i, by - bh, Math.min(bw - 1, 93 - i), step(c, 1)).vline(wx + 2 + i + Math.min(bw - 1, 93 - i), by - bh, bh, step(c, -1));
      i += bw;
    }
  }
  // Aluminium frame, a reflection, and a faded promo sticker (blank).
  p.frame(wx - 2, H - wz - wh - 2, ww + 4, wh + 4, "steel5").frame(wx - 1, H - wz - wh - 1, ww + 2, wh + 2, "steel3");
  p.vline(wx + 70, H - wz - wh, wh, "steel4");
  p.line(wx + 10, H - wz - 6, wx + 40, H - wz - wh + 4, "steel6");
  p.rect(wx + 50, H - wz - 30, 14, 14, "orange3").frame(wx + 50, H - wz - 30, 14, 14, "orange2").px(wx + 63, H - wz - 30, "steel6");
  // The door: a PVC strip curtain, strips scuffed and kinked.
  const dx = 160, dw = 40;
  zrect(p, H, dx, 0, dw, 70, "ink");
  for (let i = 0; i < dw; i += 5) {
    const kink = hash(i, 3, 3) < 0.4 ? 1 : 0;
    for (let j = 1; j < 70; j++) zrect(p, H, dx + i + (j < 10 ? kink : 0), j, 4, j + 1, j > 62 ? "steel6" : i % 10 === 0 ? "blue6" : "steel5");
    zrect(p, H, dx + i + 3, 1, 1, 70, "steel3");
  }
  p.rect(dx - 2, H - 72, dw + 4, 3, "steel3").hline(dx - 2, H - 72, dw + 4, "steel5");
  // Right: the counter hatch with the cigarette cabinet and a till.
  const hx = 212, hw = 96;
  zrect(p, H, hx, 26, hw, 70, "wood1");
  zrect(p, H, hx, 26, hw, 40, "steel5");
  zrect(p, H, hx + 2, 28, hw - 4, 38, "blue6");
  for (let i = 0; i < hw - 8; i += 6) zrect(p, H, hx + 4 + i, 29, 4, 36, (["blue3", "gold3", "white", "jade3", "steel4"] as Color[])[Math.floor(hash(i, 7, 7) * 5)]);
  zrect(p, H, hx, 39, hw, 40, "steel6");
  block(p, hx + 60, H - 52, ["aaaaaaaaaa", "abbbbbbbba", "abccccccba", "abbbbbbbba", "aaaaaaaaaa"], { a: "steel1", b: "steel3", c: "jade5" }, "till");
  // A fly-swat on a nail and a stack of red-and-white boxes would be cliché; here a radio and a fan.
  block(p, hx + 12, H - 58, [".aaa.", "abbba", "abcba", "abbba", ".aaa.", "..d..", ".ddd."], { a: "steel3", b: "steel5", c: "steel2", d: "steel3" }, "fan");
  p.frame(hx - 2, H - 72, hw + 4, 48, "steel4");
  zrect(p, H, hx, 0, hw, 26, "steel6");
  zrect(p, H, hx, 25, hw, 26, "steel4");
  // Bottom edge grime, a hosepipe tap, a doorbell button.
  zrect(p, H, 0, 0, w, 2, "steel3");
  p.rect(206, H - 20, 3, 4, "steel2").px(207, H - 21, "steel5");
  downpipe(p, 2, H - F + 4, H - 1);
  zrect(p, H, w - 1, 0, 1, F, "stone1");
}

/** A satellite dish on a bracket bolted to the slope: a 26 × 22 pale bowl, its arm and LNB. */
function satelliteDish(p: Px, x: number, y: number) {
  shadowWedge(p, x + 6, y + 20, 18, 7);
  p.ellipse(x + 12, y + 10, 12, 10, "steel3");
  p.ellipse(x + 12, y + 10, 11, 9, "steel5");
  p.ellipse(x + 10, y + 8, 8, 6, "steel6");
  p.ellipse(x + 14, y + 12, 5, 4, "steel4");
  p.px(x + 5, y + 4, "white").px(x + 6, y + 3, "white");
  // The feed arm reaching out to the LNB, and its mast.
  p.line(x + 12, y + 18, x + 20, y + 4, "steel2");
  p.rect(x + 19, y + 2, 4, 3, "steel1").px(x + 19, y + 2, "steel4");
  p.rect(x + 11, y + 19, 3, 6, "steel2").vline(x + 11, y + 19, 6, "steel4");
  p.rect(x + 8, y + 24, 9, 2, "steel1");
  // A streak of rust from the bolt.
  p.vline(x + 13, y + 26, 3, "orange1");
}

function cagedWindow(p: Px, H: number, x: number, z: number, story: number) {
  const w = 84, h = 30, y = H - z - h;
  // The window itself: aluminium, sky in the glass, a curtain.
  p.rect(x, y, w, h, "steel4");
  p.rect(x + 2, y + 2, w - 4, h - 4, "blue4");
  p.rect(x + 2, y + 2, w - 4, 6, "blue5");
  p.rect(x + w / 2, y + 2, w / 2 - 2, h - 4, story ? "plum3" : "cream4");
  for (let i = x + w / 2 + 2; i < x + w - 2; i += 4) p.vline(i, y + 2, h - 4, story ? "plum2" : "cream3");
  p.vline(x + w / 2, y, h, "steel3");
  // The cage: a steel box seen from above and in front, bars every 4 px, a floor of mesh.
  const cy = y - 6, ch = h + 10;
  p.rect(x - 4, cy, w + 8, 4, "steel3").hline(x - 4, cy, w + 8, "steel5");
  for (let i = 0; i <= w + 8; i += 4) p.vline(x - 4 + i, cy + 4, ch - 4, "steel2");
  p.hline(x - 4, cy + 4 + Math.floor((ch - 4) / 2), w + 8, "steel3");
  p.rect(x - 4, cy + ch, w + 8, 3, "steel2").hline(x - 4, cy + ch, w + 8, "steel4");
  // Rust where the bars meet the floor of the cage.
  for (let i = 0; i < w + 8; i += 4) if (hash(i, x, 2) < 0.4) p.px(x - 4 + i, cy + ch - 1, "orange1");
  // What lives in the cage.
  if (story === 0) {
    sillPot(p, x + 2, cy + ch - 3, "geranium");
    sillPot(p, x + 18, cy + ch - 3, "scallion");
    sillPot(p, x + 60, cy + ch - 3, "cactus");
    block(p, x + 36, cy + ch - 9, ["aaaaaaaa", "abbbbbba", "abbbbbba", "aaaaaaaa"], { a: "steel4", b: "steel6" }, "box");
  } else {
    sillPot(p, x + 6, cy + ch - 3, "fern");
    // A bamboo pole of shirts poking out to the right.
    p.hline(x + 30, cy + 8, w + 22, "bamboo3").hline(x + 30, cy + 9, w + 22, "bamboo2");
    const L: Legend = { a: "blue3", b: "blue4", c: "cream4", d: "cream5", e: "plum3", f: "plum4" };
    block(p, x + 66, cy + 10, ["aaabbbaaa", "aabbbbbaa", ".abbbbba.", ".abbbbba.", ".abbbbba.", ".aaaaaaa."], L, "shirt");
    block(p, x + 84, cy + 10, ["ccdddcc", "ccddddc", ".cdddc.", ".cdddc.", ".ccccc."], L, "vest");
    block(p, x + 96, cy + 10, ["eee", "efe", "efe", "eee"], L, "sock");
  }
}

// ── market house ────────────────────────────────────────────────────────────

function marketHouse(p: Px, w: number, H: number) {
  const F = 96;
  tileSkirt(p, 0, 0, w, H - F + 1, 41);
  // Lintel beam and the long blank board.
  zrect(p, H, 0, 74, w, 96, "wood2");
  zrect(p, H, 0, 95, w, 96, "wood4");
  zrect(p, H, 0, 74, w, 76, "wood1");
  signboard(p, 80, H - 94, 160, 18, "wood");
  // Bays: dim hall, hooks and lamps under the lintel, white-tiled counters.
  zrect(p, H, 0, 0, w, 74, "ink2");
  for (let j = 0; j < 30; j++) zrect(p, H, 0, 44 + j, w, 45 + j, j > 24 ? "ink" : "ink2");
  zrect(p, H, 0, 0, w, 8, "stone2");
  // Wet floor sheen.
  for (let i = 0; i < w; i += 9) if (hash(i, 2, 4) < 0.5) zrect(p, H, i, 2, 5, 3, "steel3");
  const posts = [0, 78, 158, 238, 314];
  posts.forEach((px0, k) => {
    if (k === posts.length - 1) return;
    const x0 = px0 + 6, x1 = posts[k + 1];
    counter(p, H, x0 + 4, x1 - x0 - 8, k);
    // Fluorescent tube under the beam.
    p.rect(x0 + 10, H - 72, 30, 2, "white").hline(x0 + 10, H - 70, 30, "steel3").px(x0 + 9, H - 72, "steel2").px(x0 + 40, H - 72, "steel2");
    // Hooks along a rail.
    p.hline(x0, H - 67, x1 - x0, "steel3");
    for (let i = x0 + 4; i < x1 - 2; i += 8) p.px(i, H - 66, "steel4").px(i + 1, H - 65, "steel4");
  });
  // Bay contents: a steelyard with its weight, garlic braids, bamboo baskets, a stack of blue basins.
  block(p, 30, H - 66, [
    "..a.......",
    "..a.......",
    "bbbbbbbbbb",
    "c.a......d",
    "c.a.....ddd",
    "c.a......d",
    "eee.......",
    "eee.......",
  ].map((r) => r.padEnd(11, ".")), { a: "steel3", b: "wood4", c: "steel2", d: "steel1", e: "bamboo3" }, "steelyard");
  for (let k = 0; k < 3; k++) block(p, 100 + k * 9, H - 65, ["a..", "bcb", "cbc", "bcb", "cbc", ".b."], { a: "bamboo2", b: "cream4", c: "cream5" }, "garlic");
  for (const [bx, by] of [[176, H - 66], [196, H - 64], [214, H - 66]] as const) block(p, bx, by, ["...a....", ".abbbba.", "abcbcbca", "acbcbcba", ".abbbba.", "..aaaa.."], { a: "bamboo1", b: "bamboo3", c: "bamboo4" }, "basket");
  for (let k = 0; k < 4; k++) p.rect(262 - k, H - 30 - k * 2, 22 + 2 * k, 2, k % 2 ? "blue4" : "blue3");
  p.hline(258, H - 38, 30, "blue5");
  // Timber posts with stone feet, notched and scarred.
  for (const px0 of posts) {
    zrect(p, H, px0, 0, 6, 76, "wood3");
    zrect(p, H, px0, 0, 1, 76, "wood5");
    zrect(p, H, px0 + 5, 0, 1, 76, "wood1");
    zrect(p, H, px0, 0, 6, 6, "stone3");
    zrect(p, H, px0, 5, 6, 6, "stone4");
    for (let j = 18; j < 70; j += 13) if (hash(px0, j, 2) < 0.5) p.hline(px0 + 1, H - j, 3, "wood2");
  }
  // A paper notice on one post, blank, its corner curling.
  p.rect(159, H - 52, 6, 9, "cream5").px(164, H - 44, "cream3");
}

function counter(p: Px, H: number, x: number, w: number, k: number) {
  // Concrete counter faced in white tile, a stone top, wet.
  for (let j = 0; j < 22; j++) for (let i = 0; i < w; i++) zrect(p, H, x + i, 6 + j, 1, 7 + j, j % 5 === 4 || i % 5 === 4 ? "steel4" : "steel6");
  zrect(p, H, x - 1, 28, w + 2, 32, "stone4");
  zrect(p, H, x - 1, 31, w + 2, 32, "stone5");
  zrect(p, H, x - 1, 28, w + 2, 29, "stone2");
  // On the counter: a chopping block, an enamel tray, a plastic bucket of water.
  if (k === 0) { p.ellipse(x + 14, H - 33, 8, 3, "oak3"); p.ellipse(x + 14, H - 33, 6, 2, "oak4"); p.rect(x + 8, H - 36, 3, 2, "steel4"); }
  if (k === 1) { p.rect(x + 30, H - 35, 18, 3, "white").frame(x + 30, H - 35, 18, 3, "blue3"); }
  if (k === 2) { block(p, x + 20, H - 40, ["aaaaaaa", "abbbbba", ".abbba.", ".aaaaa."], { a: "jade2", b: "jade4" }, "bucket"); }
  if (k === 3) { p.rect(x + 8, H - 34, 10, 2, "leaf3").rect(x + 20, H - 35, 8, 3, "orange3").px(x + 22, H - 36, "leaf3"); }
}

// ── bakery ──────────────────────────────────────────────────────────────────

function bakery(p: Px, w: number, H: number, frame: number) {
  const F = 128;
  pantileRoof(p, 0, 0, w, H - F + 1, { ridge: 14, seed: 52 });
  // Upper storey: cream render, two arched windows with lace, a box of geraniums.
  stucco(p, 0, H - F, w, 32, 51);
  for (const x of [52, 212]) {
    const y = H - 124;
    p.rect(x, y + 4, 56, 20, "blue4");
    p.ellipse(x + 28, y + 5, 28, 5, "blue4");
    p.rect(x + 3, y + 7, 50, 17, "white");
    for (let i = x + 4; i < x + 52; i += 3) p.vline(i, y + 8, 15, "cream4");
    p.hline(x + 3, y + 22, 50, "cream3");
    p.vline(x + 28, y + 2, 22, "blue2");
    p.rect(x - 3, y + 24, 62, 3, "cream5").hline(x - 3, y + 27, 62, "cream1");
  }
  for (let i = 0; i < 52; i += 4) block(p, 214 + i, H - 102, [".s.", "srs", ".m."], { s: "pink3", r: "pink2", m: "leaf3" }, "geranium");
  p.rect(212, H - 98, 56, 4, "blue3").hline(212, H - 98, 56, "blue4");
  // Cornice with dentils.
  zrect(p, H, 0, 124, w, 128, "cream4");
  zrect(p, H, 0, 127, w, 128, "cream5");
  for (let i = 2; i < w; i += 5) zrect(p, H, i, 122, 3, 124, "cream2");
  // Fascia and the enamel sign.
  zrect(p, H, 0, 80, w, 96, "blue3");
  zrect(p, H, 0, 95, w, 96, "blue4");
  zrect(p, H, 0, 80, w, 82, "blue1");
  signboard(p, 30, H - 95, 260, 14, "enamel");
  // Powder-blue shopfront.
  zrect(p, H, 0, 0, w, 80, "blue4");
  zrect(p, H, 0, 0, w, 4, "stone3");
  zrect(p, H, 0, 3, w, 4, "stone4");
  // Bow window: a curved sill, three shelves of bread, the cake under its dome.
  const bx = 16, bw = 186;
  zrect(p, H, bx, 4, bw, 18, "blue3");
  for (let i = bx + 4; i < bx + bw - 4; i += 31) { zrect(p, H, i, 7, 25, 16, "blue4"); zrect(p, H, i, 15, 25, 16, "blue5"); zrect(p, H, i + 24, 7, 1, 16, "blue2"); }
  zrect(p, H, bx - 3, 18, bw + 6, 21, "cream4");
  zrect(p, H, bx - 3, 20, bw + 6, 21, "cream5");
  const gy = H - 74, gh = 53;
  p.rect(bx, gy, bw, gh, "cream3");
  p.rect(bx, gy, bw, 8, "cream2");
  for (const sy of [gy + 20, gy + 36, gy + gh - 2]) p.hline(bx, sy, bw, "wood3").hline(bx, sy + 1, bw, "wood1");
  breads(p, bx + 4, gy + 20, bw - 8, 1);
  breads(p, bx + 4, gy + 36, bw - 8, 2);
  breads(p, bx + 4, gy + gh - 2, bw - 50, 3);
  // The cake on its own glass stand at the end of the window: three pink tiers, cream piping, a
  // glass dome catching the light. Big enough to see from across the street.
  const kx = bx + bw - 38, kb = gy + gh - 2;
  p.rect(kx - 2, gy + 9, 38, gh - 11, "cream3");
  p.rect(kx - 2, gy + 9, 38, 3, "cream2");
  const tiers: [number, number, Color, Color][] = [[30, 7, "pink2", "pink3"], [22, 7, "pink2", "pink3"], [14, 6, "pink1", "pink2"]];
  let ty = kb - 4;
  p.rect(kx + 2, kb - 4, 30, 2, "steel5").rect(kx + 14, kb - 2, 6, 2, "steel4").hline(kx + 10, kb - 1, 14, "steel3");
  for (const [tw, th, side, top] of tiers) {
    const tx = kx + 17 - tw / 2;
    p.rect(tx, ty - th, tw, th, side).hline(tx, ty - th, tw, top).vline(tx, ty - th, th, top).vline(tx + tw - 1, ty - th, th, "pink1");
    for (let i = 1; i < tw - 1; i += 3) p.px(tx + i, ty - th + 1, "cream5").px(tx + i + 1, ty - 1, "cream5");
    ty -= th;
  }
  p.rect(kx + 15, ty - 3, 4, 3, "white").px(kx + 16, ty - 4, "leaf3");
  // The dome: an outline of pale glass with two highlights.
  for (let a2 = 0; a2 <= 180; a2 += 2) {
    const r2 = (a2 * Math.PI) / 180;
    p.px(Math.round(kx + 17 - Math.cos(r2) * 17), Math.round(kb - 4 - Math.sin(r2) * 28), a2 < 90 ? "white" : "steel5");
  }
  p.line(kx + 5, kb - 16, kx + 8, kb - 25, "white");
  // Glazing bars curving with the bow, glints.
  for (let i = bx; i <= bx + bw; i += 31) p.vline(i, gy, gh, "blue2").vline(i + 1, gy, gh, "blue5");
  p.frame(bx - 2, gy - 2, bw + 4, gh + 4, "blue2");
  p.hline(bx - 2, gy - 2, bw + 4, "blue5");
  for (let j = 0; j < 12; j++) p.px(bx + 8 + j, gy + 14 - j, "white");
  // The door: half glass with lace, a brass bell on a spring, flour on the step.
  const dx = 218, dw = 38;
  zrect(p, H, dx - 3, 0, dw + 6, 76, "blue2");
  zrect(p, H, dx, 3, dw, 74, "blue4");
  zrect(p, H, dx, 3, 1, 74, "blue5");
  zrect(p, H, dx + dw - 1, 3, 1, 74, "blue2");
  p.rect(dx + 4, H - 70, dw - 8, 30, "white");
  for (let i = dx + 5; i < dx + dw - 4; i += 3) p.vline(i, H - 69, 28, "cream4");
  p.hline(dx + 4, H - 45, dw - 8, "cream3");
  zrect(p, H, dx + 4, 8, dw - 8, 34, "blue3");
  zrect(p, H, dx + 5, 9, dw - 10, 33, "blue4");
  p.rect(dx + dw - 7, H - 40, 2, 4, "gold3").px(dx + dw - 7, H - 40, "gold5");
  p.px(dx + 3, H - 76, "gold1").rect(dx + 2, H - 75, 3, 3, "gold3").px(dx + 3, H - 72, "gold2");
  zrect(p, H, dx - 3, 0, dw + 6, 3, "stone4");
  for (let i = 0; i < 14; i++) if (hash(i, 1, 3) < 0.6) p.px(dx + 10 + i, H - 2 - (i % 3 === 0 ? 1 : 0), "cream5");
  // Right of the door: a narrow window with a bread slicer and a hanging string of bagel-rings (сушки).
  const rx = 266;
  p.rect(rx, H - 70, 40, 46, "cream3").rect(rx, H - 70, 40, 6, "cream2");
  p.frame(rx - 2, H - 72, 44, 50, "blue2");
  for (let k = 0; k < 6; k++) p.ellipse(rx + 8 + k * 5, H - 60 + (k % 2), 2.5, 2.5, "oak4").px(rx + 8 + k * 5, H - 60 + (k % 2), "cream3");
  p.hline(rx + 4, H - 64, 32, "bamboo3");
  block(p, rx + 10, H - 42, ["aaaaaaaaaaaa", "abbbbbbbbbba", "abcdcdcdcdba", "abbbbbbbbbba", "aaaaaaaaaaaa", ".e........e."], { a: "steel2", b: "steel4", c: "oak4", d: "oak3", e: "steel1" }, "slicer");
  zrect(p, H, rx - 2, 4, 44, 22, "blue3");
  // The oven flue on the roof, smoking.
  const fx = 258, fy = 38;
  shadowWedge(p, fx + 14, fy + 4, 8, 20);
  p.rect(fx, fy, 16, 24, "stone3");
  for (let j = fy + 3; j < fy + 24; j += 4) p.hline(fx, j, 16, "stone4");
  for (let j = fy + 1; j < fy + 24; j += 8) p.vline(fx + 8, j, 3, "stone4");
  p.vline(fx, fy, 24, "stone4").vline(fx + 15, fy, 24, "stone1");
  p.rect(fx - 2, fy - 3, 20, 4, "stone4").hline(fx - 2, fy - 3, 20, "stone5").hline(fx - 2, fy + 1, 20, "stone2");
  p.rect(fx + 4, fy - 4, 8, 2, "ink").rect(fx + 3, fy - 2, 10, 1, "stone1");
  for (let j = fy + 2; j < fy + 16; j++) p.px(fx + 5 + (j % 3 === 0 ? 1 : 0), j, "stone2");
  wisp(p, fx + 8, fy - 5, frame, 4, 34, true, 4, 1.6);
  wisp(p, fx + 6, fy - 4, (frame + 2) % 4, 4, 26, true, 7, 1.2);
  // The baker's cat, on the ridge by the warm flue.
  roofCat(p, fx - 26, 6);
  zrect(p, H, w - 1, 0, 1, F, "cream1");
}

function breads(p: Px, x: number, y: number, w: number, kind: number) {
  const L: Legend = { a: "oak1", b: "oak2", c: "oak3", d: "oak4", e: "oak5", f: "gold4", g: "gold3", h: "cream4", i: "brown2", j: "brown3" };
  const loaf = ["..abbbba..", ".bcdddccb.", "bcdedcdccb", "bccdcdccbb", ".bbbbbbbb."];
  const rye = ["..aiiia..", ".ijjjjji.", "ijjhjjhji", "ijjjjjjji", ".iiiiiii."];
  const bun = [".bcc.", "bdeec", "bcddc", ".bbb."];
  const plait = ["..ggg.ggg..", ".gfffgfffg.", "gfgffgffgfg", ".ggg.gg.gg."];
  let i = 0, n = 0;
  while (i < w - 12) {
    const shape = kind === 1 ? (n % 3 === 2 ? rye : loaf) : kind === 2 ? (n % 2 ? plait : bun) : (n % 2 ? bun : loaf);
    block(p, x + i, y - shape.length, shape, L, "bread");
    i += shape[0].length + 2 + Math.floor(hash(n, kind, 3) * 3);
    n++;
  }
}

// ── bookshop ────────────────────────────────────────────────────────────────

function bookshop(p: Px, w: number, H: number) {
  const F = 144;
  pantileRoof(p, 0, 0, w, H - F + 1, { ridge: 30, seed: 63 });
  dormer(p, 132, 42);
  chilliTray(p, 214, 60);
  // Upper storey: dark boards, sliding lattice windows, books on the sill.
  boards(p, 0, H - F, w, 52, 61, 7);
  zrect(p, H, 0, 140, w, 144, "wood2");
  zrect(p, H, 0, 143, w, 144, "wood4");
  for (const [x, ww] of [[14, 120], [186, 120]] as const) {
    zrect(p, H, x - 3, 104, ww + 6, 136, "wood1");
    lattice(p, x, H - 134, ww, 28, x, false);
  }
  // The right window slid open: the dark room, a stack of books and a bonsai pine on the sill.
  p.rect(246, H - 134, 58, 28, "ink2");
  p.rect(250, H - 128, 20, 18, "wood1");
  books(p, 250, H - 107, 22, 8, 8);
  books(p, 276, H - 107, 14, 9, 6);
  block(p, 288, H - 120, ["..mm.mm..", ".mnnmnnm.", "mnmmnmnm.", "...ll....", "...l.....", ".aaaaaa..", ".abbbba..", "..aaaa..."], { m: "leaf1", n: "leaf2", l: "wood2", a: "blue2", b: "white" }, "bonsai");
  // Sill shelf across both windows.
  zrect(p, H, 0, 100, w, 104, "wood3");
  zrect(p, H, 0, 103, w, 104, "wood5");
  zrect(p, H, 0, 100, w, 101, "wood1");
  books(p, 20, H - 104, 60, 3, 7);
  // Fascia and sign.
  zrect(p, H, 0, 80, w, 100, "wood1");
  zrect(p, H, 0, 99, w, 100, "wood3");
  signboard(p, 110, H - 98, 100, 16, "wood");
  // Ground floor: dark oiled timber, two small-paned windows full of books, the door between.
  zrect(p, H, 0, 0, w, 80, "wood2");
  for (let i = 0; i < w; i += 40) { zrect(p, H, i, 0, 1, 80, "wood1"); zrect(p, H, i + 1, 0, 1, 80, "wood3"); }
  zrect(p, H, 0, 0, w, 4, "stone3");
  zrect(p, H, 0, 3, w, 4, "stone4");
  for (const [x, ww, lamp] of [[12, 116, true], [180, 128, false]] as const) {
    const gy = H - 74, gh = 54;
    p.rect(x, gy, ww, gh, "wood1");
    p.rect(x, gy, ww, 10, "ink2");
    // Shelves of spines, and stacks lying flat in the front.
    for (const sy of [gy + 18, gy + 34, gy + 50]) { p.hline(x, sy, ww, "wood3"); books(p, x + 1, sy, ww - 2, sy + x, 10); }
    for (let k = 0; k < 4; k++) {
      const sx = x + 6 + k * (ww / 4);
      for (let j = 0; j < 3 + (k % 2); j++) { const c = BOOK[(k * 3 + j) % BOOK.length]; p.rect(sx + (j % 2), gy + gh - 3 - j * 3, 16, 3, c).hline(sx + (j % 2), gy + gh - 3 - j * 3, 16, step(c, 1)).px(sx + 15 + (j % 2), gy + gh - 2 - j * 3, "cream5"); }
    }
    if (lamp) {
      // The green banker's lamp, lit.
      block(p, x + 80, gy + 36, ["..aaaaaaa..", ".abbbbbbba.", "accccccccca", "...ddddd...", "....e......", "....e......", "..fffff...."].map((r) => r.slice(0, 11)), { a: "jade1", b: "jade3", c: "jade4", d: "gold5", e: "gold2", f: "gold1" }, "lamp");
      p.rect(x + 82, gy + 40, 7, 1, "gold4");
    } else {
      // A globe on its stand.
      p.ellipse(x + 96, gy + 40, 6, 6, "blue3");
      p.ellipse(x + 95, gy + 39, 4, 4, "blue4");
      p.rect(x + 93, gy + 38, 3, 2, "leaf3").px(x + 98, gy + 42, "leaf3");
      p.vline(x + 96, gy + 46, 4, "gold2");
    }
    paneWindow(p, x, gy, ww, gh, Math.round(ww / 16), 3);
    zrect(p, H, x - 3, 18, ww + 6, 21, "wood4");
    zrect(p, H, x - 3, 20, ww + 6, 21, "wood5");
    zrect(p, H, x, 4, ww, 18, "wood1");
    for (let i = x + 6; i < x + ww - 6; i += 20) { zrect(p, H, i, 7, 14, 15, "wood3"); zrect(p, H, i, 14, 14, 15, "wood4"); }
  }
  // The door: glass over a panel, a green curtain inside, a brass bell, a worn step.
  const dx = 138, dw = 34;
  zrect(p, H, dx - 2, 0, dw + 4, 78, "wood1");
  zrect(p, H, dx, 3, dw, 76, "wood3");
  p.rect(dx + 4, H - 72, dw - 8, 34, "jade2");
  for (let i = dx + 5; i < dx + dw - 4; i += 3) p.vline(i, H - 71, 32, "jade3");
  p.rect(dx + 4, H - 72, dw - 8, 3, "jade1");
  paneWindow(p, dx + 4, H - 72, dw - 8, 34, 2, 3, ["wood1", "wood2", "wood4"]);
  zrect(p, H, dx + 4, 8, dw - 8, 34, "wood2");
  zrect(p, H, dx + 5, 9, dw - 10, 33, "wood3");
  p.rect(dx + dw - 8, H - 40, 3, 3, "gold3").px(dx + dw - 8, H - 40, "gold5");
  zrect(p, H, dx - 4, 0, dw + 8, 3, "stone4");
  zrect(p, H, dx + 8, 2, 18, 3, "stone5");
  // A brass bell on a curled bracket over the door.
  block(p, dx + dw - 2, H - 84, ["aaa..", "...a.", "..bbb", ".bccb", ".bbbb", "..d.."], { a: "gold1", b: "gold2", c: "gold4", d: "gold1" }, "bell");
  zrect(p, H, w - 1, 0, 1, F, "wood1");
  zrect(p, H, 0, 0, 1, F, "wood1");
}

/** A flat bamboo tray of chillies drying in the sun on the slope, 36 × 16 from (x, y). */
function chilliTray(p: Px, x: number, y: number) {
  shadowWedge(p, x + 6, y + 15, 30, 6);
  // A woven bamboo winnowing tray: a dark bound rim, rings of weave, a lit near edge.
  p.ellipse(x + 18, y + 8, 18, 8, "bamboo1");
  p.ellipse(x + 18, y + 7.5, 16.5, 7, "bamboo2");
  p.ellipse(x + 18, y + 7.5, 15, 6, "bamboo4");
  for (const [rx, ry] of [[11, 4.3], [7, 2.7]] as const) for (let a = 0; a < 360; a += 4) {
    const t = (a * Math.PI) / 180;
    p.px(Math.round(x + 18 + Math.cos(t) * rx), Math.round(y + 7.5 + Math.sin(t) * ry), "bamboo3");
  }
  // Chillies laid out in loose rows, long pods with green stalks, a couple still green.
  const pods: [number, number, boolean][] = [[6, 4, true], [12, 3, false], [19, 3, true], [26, 4, false], [5, 8, false], [11, 7, true], [18, 7, false], [24, 8, true], [29, 7, false], [9, 11, true], [16, 11, false], [23, 11, true]];
  pods.forEach(([px0, py0, right], n) => {
    const green = n === 4 || n === 10;
    const body: Color = green ? "leaf3" : "red3", dark: Color = green ? "leaf2" : "red2";
    const d = right ? 1 : -1;
    p.px(x + px0, y + py0, "leaf2");
    p.px(x + px0 + d, y + py0, body).px(x + px0 + 2 * d, y + py0, body).px(x + px0 + 3 * d, y + py0 + 1, dark).px(x + px0 + 4 * d, y + py0 + 1, dark);
    if (!green) p.px(x + px0 + d, y + py0 - 1, "red4");
  });
}

/** The 老虎窗: a little gabled dormer sticking out of the slope, its window lit warm. */
function dormer(p: Px, x: number, y: number) {
  const w = 56;
  // Its pantile roof: two slopes to a ridge, seen from above-front.
  for (let j = 0; j < 22; j++) {
    const half = Math.round(4 + (j / 22) * (w / 2 - 2));
    for (let i = -half; i < half; i++) {
      const k = (i + 60) % 5;
      p.px(x + w / 2 + i, y + j, j % 5 === 4 ? "stone1" : i < 0 ? (k < 2 ? "stone5" : "stone4") : k < 2 ? "stone3" : "stone2");
    }
  }
  p.vline(x + w / 2, y, 22, "stone2");
  // Plaster gable face and its window.
  p.rect(x + 2, y + 22, w - 4, 28, "cream3");
  p.hline(x + 2, y + 22, w - 4, "ink2").hline(x + 2, y + 23, w - 4, "cream1");
  p.vline(x + w - 3, y + 22, 28, "cream1");
  p.rect(x + 14, y + 27, 28, 18, "wood2");
  p.rect(x + 16, y + 29, 24, 14, "gold4");
  p.rect(x + 16, y + 29, 24, 4, "gold5");
  p.vline(x + 28, y + 29, 14, "wood2").hline(x + 16, y + 36, 24, "wood2");
  p.rect(x + 17, y + 37, 6, 5, "gold3");
  books(p, x + 30, y + 43, 9, 4, 5);
  p.rect(x + 12, y + 45, 32, 2, "cream5").hline(x + 12, y + 47, 32, "cream1");
  // Flashing where it meets the main roof, and its shadow on the slope.
  p.hline(x, y + 50, w, "stone1").hline(x, y + 51, w, "stone2");
  for (let j = y + 22; j < y + 52; j++) p.px(x + w, j, step(p.get(x + w, j) ?? "stone2", -1)).px(x + w + 1, j, step(p.get(x + w + 1, j) ?? "stone2", -1));
}

const LANDMARKS = ["town.corner-store", "town.market-house", "town.south-bakery", "town.bookshop"];

export default defineSprites(perProp("building-shop", (prop: TownProp, w, h) => {
  const id = prop.id;
  if (id === "town.south-bakery") return { frames: 4, fps: 3, foot: plotFoot(w, h), draw: (p, f) => bakery(p, w, h, f) };
  // Every shop that is not a named landmark is generated from its id, variant and footprint.
  if (!LANDMARKS.includes(id)) return { frames: 4, fps: 4, foot: plotFoot(w, h), draw: (p, f) => laneShop(p, prop, w, h, f) };
  return {
    foot: plotFoot(w, h),
    draw: (p) => {
      if (id === "town.corner-store") cornerStore(p, w, h);
      else if (id === "town.market-house") marketHouse(p, w, h);
      else bookshop(p, w, h);
    },
  };
}));
