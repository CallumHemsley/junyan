/**
 * The shuttered shops (`building-shutter`).
 *
 * - `town/west-store` (384×96): a long single-storey row of three lock-up bays, a hardware and
 *   sundries business that opens when the owner has finished breakfast. The left shutter is half up
 *   on brooms, buckets and coils of hose; the middle is down and padlocked; the right is hauled a
 *   little higher, a stool propping nothing. A lean-to of pantiles over the top.
 *   Sign field: the painted band x 10..374, rows 32..39.
 * - `town/river-store` (288×192): closed for good. The shutter has been down for years: rust in
 *   runs, layers of torn notices (blank), a chain and padlock, weeds at its foot. Upstairs the
 *   shutters hang off their hinges, one window is bricked up, a buddleia grows from the cornice, the
 *   sign has gone and left its ghost and its brackets. On the roof a blue tarp is weighted with bricks
 *   over a hole where tiles slid off.
 *   Sign field (the ghost of the old board): x 52..236, rows 98..109.
 */
import { defineSprites, hash, type Color, type Px } from "../../kit/index.ts";
import type { TownProp } from "../../town/map.ts";
import { laneShutter } from "./_lane-shop.ts";
import { block, darkRoom, downpipe, greyBrick, pantileRoof, perProp, plotFoot, rollerShutter, signboard, step, stucco, tarp, tileSkirt, zrect } from "./_front.ts";

// ── west store ─────────────────────────────────────────────────────────────

function westStore(p: Px, w: number, H: number) {
  const F = 72;
  tileSkirt(p, 0, 0, w, H - F + 1, 71);
  stucco(p, 0, H - F, w, F, 72);
  zrect(p, H, 0, 0, w, 4, "stone3");
  zrect(p, H, 0, 3, w, 4, "stone4");
  // Sign band along the top.
  signboard(p, 8, H - 70, w - 16, 12, "painted", 7);
  zrect(p, H, 0, 58, w, 59, "cream2");
  // Three bays between stucco piers.
  const bays: [number, number, number][] = [[10, 116, 0.5], [134, 116, 1], [258, 116, 0.38]];
  bays.forEach(([x, bw, down], k) => {
    const top = H - 56, h = 52;
    darkRoom(p, x, top + 7, bw, h - 7);
    goods(p, x, H, bw, k);
    rollerShutter(p, x, top, bw, h, down, 70 + k, 0.35 + k * 0.1);
    if (k === 1) {
      // Hasp and padlock at the foot, a chalk tally the owner keeps of something (just strokes).
      block(p, x + bw / 2 - 3, H - 10, [".aa.", "a..a", "bbbb", "bccb", "bbbb"], { a: "steel4", b: "gold2", c: "gold4" }, "padlock");
      for (let i = 0; i < 4; i++) p.vline(x + 12 + i * 3, H - 30, 5, "cream4");
      p.line(x + 10, H - 26, x + 22, H - 30, "cream4");
    }
  });
  // Piers.
  for (const px0 of [0, 126, 250, 376]) {
    zrect(p, H, px0, 0, 8, 58, "cream3");
    zrect(p, H, px0, 0, 1, 58, "cream4");
    zrect(p, H, px0 + 7, 0, 1, 58, "cream1");
    zrect(p, H, px0, 0, 8, 6, "stone3");
  }
  // An old enamel number plate and a gas meter on the middle pier.
  p.rect(128, H - 50, 5, 4, "blue2").rect(129, H - 49, 3, 2, "white");
  block(p, 252, H - 40, ["aaaa", "abba", "acca", "abba", "aaaa", ".d..", ".d.."], { a: "steel1", b: "gold3", c: "white", d: "steel2" }, "meter");
  downpipe(p, w - 6, H - F + 2, H - 1);
}

/** What shows under a raised shutter: the sundries on display. */
function goods(p: Px, x: number, H: number, bw: number, k: number) {
  if (k === 0) {
    // Brooms and mops leaning, a tower of blue buckets, a coil of hose.
    for (let i = 0; i < 4; i++) {
      p.line(x + 10 + i * 6, H - 6, x + 14 + i * 6, H - 40, "bamboo3");
      block(p, x + 7 + i * 6, H - 9, ["abbba", "abbba", "acaca"], { a: "bamboo1", b: "bamboo4", c: "bamboo2" }, "broom");
    }
    for (let j = 0; j < 4; j++) p.rect(x + 50 - j, H - 8 - j * 5, 16 + 2 * j, 5, j % 2 ? "blue3" : "blue4").hline(x + 50 - j, H - 8 - j * 5, 16 + 2 * j, "blue5");
    p.ellipse(x + 90, H - 12, 9, 7, "jade3");
    p.ellipse(x + 90, H - 12, 6, 4, "ink");
    p.ellipse(x + 90, H - 12, 7.5, 5.5, "jade2");
    p.ellipse(x + 90, H - 12, 5, 3, "ink2");
  } else if (k === 2) {
    // Enamel basins stacked, a wok hung up, a red plastic stool (the store's one red thing).
    for (let j = 0; j < 4; j++) p.rect(x + 12 - j, H - 6 - j * 3, 22 + 2 * j, 3, "white").hline(x + 12 - j, H - 4 - j * 3, 22 + 2 * j, "blue3");
    p.ellipse(x + 60, H - 24, 9, 4, "steel1");
    p.ellipse(x + 60, H - 25, 7, 2.5, "steel3");
    block(p, x + 84, H - 14, ["aaaaaaaaaa", "abbbbbbbba", ".b......b.", ".b......b.", ".bb....bb."], { a: "red2", b: "red3" }, "stool");
  }
}

// ── river store ─────────────────────────────────────────────────────────────

function riverStore(p: Px, w: number, H: number) {
  const F = 128;
  pantileRoof(p, 0, 0, w, H - F + 1, { ridge: 16, seed: 81 });
  // A hole where tiles slid off, the battens showing, half covered by a blue tarp held with bricks.
  for (let j = 30; j < 52; j++) for (let i = 160; i < 196; i++) p.px(i, j, (i % 6 < 2) ? "wood2" : "ink");
  tarp(p, 174, 24, 46, 24, 3);
  // Roof weeds: a clump of grass and a young paper mulberry in the gutter of the slid tiles.
  block(p, 128, 40, ["..m...n..", ".mnm.mnm.", "mnlmnmlnm", ".lmlmlml.", "..l.l.l.."], { l: "leaf1", m: "leaf2", n: "leaf3" }, "roof-grass");
  block(p, 92, 30, ["...nn.mm...", "..nmnnmnm..", ".mnmlnmnmn.", "..mnmlmnm..", "....l.l....", ".....l.....", ".....l....."], { l: "wood2", m: "leaf2", n: "leaf3" }, "sapling");
  // Upper storey: grey brick, one window bricked up, the other with broken louvred shutters.
  greyBrick(p, 0, H - F, w, F - 80, 82);
  zrect(p, H, 0, 124, w, 128, "stone4");
  zrect(p, H, 0, 127, w, 128, "stone5");
  zrect(p, H, 0, 124, w, 125, "stone2");
  // Bricked-up window: newer, redder-grey brick in the old opening.
  const bx = 40;
  zrect(p, H, bx - 3, 88, 62, 120, "stone4");
  greyBrick(p, bx, H - 118, 56, 28, 85, { body: "cream2", lit: "cream3", dark: "stone2", mortar: "stone5" });
  zrect(p, H, bx - 4, 86, 64, 89, "stone5");
  // The other window: dark, glass gone in one pane, a shutter hanging by one hinge.
  const wx = 190;
  zrect(p, H, wx, 90, 56, 120, "ink2");
  p.rect(wx + 4, H - 116, 22, 24, "steel2");
  p.line(wx + 6, H - 112, wx + 20, H - 98, "steel4");
  zrect(p, H, wx - 4, 86, 64, 89, "stone5");
  block(p, wx - 18, H - 120, [
    "aaaaaaaaaaaa......",
    "abbbbbbbbbbba.....",
    ".abbbbbbbbbbba....",
    ".acccccccccccca...",
    "..abbbbbbbbbbbba..",
    "..accccccccccccca.",
    "...abbbbbbbbbbbbba",
    "...acccccccccccca.",
    "....abbbbbbbbbba..",
    "....acccccccccca..",
    ".....abbbbbbbba...",
    ".....aaaaaaaaaa...",
  ], { a: "jade1", b: "jade3", c: "jade2" }, "shutter");
  block(p, wx + 56, H - 120, ["aaaaaaaa", "abbbbbba", "acccccca", "abbbbbba", "acccccca", "abbbbbba", "acccccca", "abbbbbba", "acccccca", "abbbbbba", "acccccca", "aaaaaaaa"], { a: "jade1", b: "jade4", c: "jade2" }, "shutter-r");
  // A buddleia sprouting from the cornice.
  block(p, 128, H - 140, ["...p.mp....", "..pmnmp.p..", ".mnmlnmnpm.", "..mnlnmn...", "....ll.....", "....l......", "...ll......"], { p: "plum3", m: "leaf2", n: "leaf3", l: "wood2" }, "buddleia");
  // Ghost of the sign and its rusted brackets.
  zrect(p, H, 0, 80, w, 98, "stone3");
  zrect(p, H, 0, 97, w, 98, "stone4");
  zrect(p, H, 0, 80, w, 81, "stone1");
  signboard(p, 50, H - 96, 188, 14, "painted", 9);
  for (const sx of [56, 228]) p.rect(sx, H - 97, 3, 3, "orange1").px(sx + 1, H - 95, "wood3");
  for (let i = 0; i < 40; i += 4) if (hash(i, 6, 9) < 0.5) p.px(70 + i * 4, H - 82, "cream5");
  // The ground floor: the shutter down for good across the whole front.
  zrect(p, H, 0, 0, w, 80, "stone2");
  rollerShutter(p, 14, H - 78, w - 28, 76, 1, 88, 0.95);
  // Torn notices pasted over each other, all blank, all faded.
  const papers: [number, number, number, number, Color][] = [[40, 24, 18, 22, "cream3"], [52, 30, 16, 20, "blue5"], [118, 20, 22, 16, "cream4"], [124, 32, 14, 18, "pink3"], [200, 26, 18, 24, "cream3"], [232, 18, 14, 14, "jade5"]];
  for (const [x, z, pw, ph, c] of papers) {
    zrect(p, H, x, z, pw, z + ph, c);
    zrect(p, H, x, z + ph - 1, pw, z + ph, step(c, 1));
    for (let i = 0; i < pw; i += 2) if (hash(x + i, z, 4) < 0.5) zrect(p, H, x + i, z, 2, z + 1 + Math.floor(hash(i, x, 5) * 4), "stone3");
    zrect(p, H, x + pw - 3, z + ph - 3, 3, z + ph, "steel4");
  }
  // The "to let" slip: a crisp white rectangle, newer than everything else.
  zrect(p, H, 150, 40, 14, 58, "white");
  zrect(p, H, 150, 40, 14, 41, "cream4");
  // Chain and padlock.
  for (let i = 0; i < 20; i++) p.px(134 + i, H - 12 + Math.round(Math.sin(i / 3) * 1.5), i % 2 ? "steel4" : "steel2");
  block(p, 142, H - 10, [".aa.", "a..a", "bbbb", "bccb", "bbbb"], { a: "steel3", b: "orange1", c: "wood3" }, "padlock");
  // Weeds at the foot of the shutter and in the gutter, pigeon marks under the ledge.
  // Weeds along the foot of the shutter: grass clumps, a dandelion in flower, a dock leaf.
  const WL = { l: "leaf1", m: "leaf2", n: "leaf3", o: "leaf4", y: "gold4", Y: "gold3" } as const;
  const weeds = [
    ["..n...n.", ".nm..nm.", ".mn.nmo.", "nmlnmlmn", "mlmlmlml", ".l.l.l.."],
    ["...yy...", "..yYYy..", "...yy...", "...m....", "..nm..n.", ".nmlnmm.", "nmlmlmln", ".l.l.l.."],
    [".nnn....", "noonn...", "nonmmn..", ".nmmlmn.", "..mlmlm.", "...l.l.."],
  ];
  for (let i = 4; i < w - 10; i += 13) if (hash(i, 8, 8) < 0.7) {
    const wd = weeds[Math.floor(hash(i, 9, 8) * weeds.length)];
    block(p, i, H - wd.length, wd, WL, "weed");
  }
  for (let i = 0; i < w; i += 5) if (hash(i, 9, 8) < 0.3) p.px(i, H - 78, "white").px(i + 1, H - 77, "cream4");
  downpipe(p, 2, H - F + 2, H - 1);
  zrect(p, H, w - 1, 0, 1, F, "stone1");
}

export default defineSprites(perProp("building-shutter", (prop: TownProp, w, h) => ({
  foot: plotFoot(w, h),
  draw: (p) => {
    if (prop.id === "town.west-store") westStore(p, w, h);
    else if (prop.id === "town.river-store") riverStore(p, w, h);
    // Every other lock-up is generated from its id, variant and footprint.
    else laneShutter(p, prop, w, h, 0);
  },
})));
