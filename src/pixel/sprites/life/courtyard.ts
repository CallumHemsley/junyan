/**
 * The courtyard's yard things: what the neighbours of a shikumen yard leave out between chores. One
 * sprite per prop of each kind (`<map>/<id>`), sized to its footprint and anchored on its bottom-centre.
 * A kind's look follows its `variant`; the doc comment of each says whose it is.
 */
import { defineSprites, hash, type Px, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import {
  STONE, art, autoOutline, basket, cylinder, drumStool, garlic, scallion, seedOf, townFoot, townFrame, weaveAt, woodCrate,
} from "./_helpers.ts";

type Draw = (p: Px, f: ReturnType<typeof townFrame>, prop: MapProp) => void;

/** One sprite per prop of `kind`, `rise` px above the footprint, drawn by `draw`, with a contact shadow unless `flat`. */
function kind(name: string, rise: (prop: MapProp) => number, draw: Draw, options: { solid?: boolean; shadow?: boolean } = {}): [string, SpriteDef][] {
  return mapProps("all", name).map((prop) => {
    const f = townFrame(prop, rise(prop));
    return [propSpriteId(prop.map, prop.id), {
      w: f.w, h: f.h, anchor: f.anchor,
      ...(options.solid === false ? {} : { foot: townFoot(prop) }),
      ...(options.shadow === false ? {} : { shadow: { rx: Math.max(3, Math.round(f.w / 2) - 2), ry: Math.max(2, Math.round(f.depth / 4)), dy: -Math.round(f.depth / 3) } }),
      draw: (p: Px) => draw(p, f, prop),
    }];
  });
}

// ── baskets ────────────────────────────────────────────────────────────────────

/**
 * Variant 0: the wicker basket off Old Gu's bicycle, unhooked and set down by the shed with this
 * morning's leeks and a rolled newspaper (blank) in it; its wire hooks stick up at the back.
 * Variant 1: the kitchen's bamboo basket set on a wooden crate, a napa cabbage and garlic in it.
 */
const drawBasket: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w;
  if (prop.variant % 2 === 0) {
    // Wire hooks at the back.
    art(p, 4, G - 22, ["s......s", "s......s", ".s....s."], { s: "steel3" });
    for (const [x, lean, top] of [[6, -1, G - 26], [8, 1, G - 24], [10, 2, G - 27]] as const) scallion(p, x, G - 12, top, lean, true);
    art(p, 12, G - 22, ["..cc", ".cCc", "cCc.", "cc.."], { c: "cream3", C: "cream5" });
    // A squarish wicker body: rim, then weave, darker at its foot.
    const bw = W - 2, top = G - 13;
    p.rect(1, top, bw, 3, "bamboo4").hline(1, top, bw, "bamboo5");
    p.rect(3, top + 1, bw - 4, 1, "bamboo1");
    for (let j = 0; j < 10; j++) for (let i = 0; i < bw; i++) p.px(1 + i, top + 3 + j, j === 9 ? "bamboo1" : weaveAt(i, j, bw));
    autoOutline(p, { map: { bamboo: "wood1", cream: "ink2", steel: "steel1" } });
    return;
  }
  woodCrate(p, 1, G - 11, W - 2, 3, 9, { slats: 2, seed: seedOf(prop.id) });
  const b = basket(p, 3, G - 18, W - 6, 6, 8, { taper: 2 });
  // The cabbage, crinkled and pale, and two heads of garlic.
  art(p, 8, b.top - 9, [
    "...gggg...",
    ".gGGgGGg..",
    "gGwGGGwGg.",
    "gwWwGGwWGg",
    "gwWWwgwWWg",
    ".wWWWwWWw.",
  ], { g: "leaf3", G: "leaf4", w: "cream4", W: "cream5" });
  garlic(p, 19, b.top - 4);
  garlic(p, 22, b.top - 3);
  b.front();
  autoOutline(p, { map: { bamboo: "wood1", oak: "wood1", cream: "ink2", leaf: "leaf1" } });
};

// ── bucket ─────────────────────────────────────────────────────────────────────

/**
 * The laundry corner's galvanised bucket, dented on one side, half full of rinse water with a gourd
 * ladle (瓢) floating in it. Its handle rests to the right.
 */
const drawBucket: Draw = (p, f) => {
  const G = f.gy, W = f.w;
  cylinder(p, 1, G - 13, W - 2, 13, ["steel1", "steel2", "steel3", "steel4", "steel5", "steel6"], (j) => (j > 9 ? 1 : 0));
  p.over(() => { p.hline(1, G - 9, W - 2, "steel2"); p.hline(1, G - 8, W - 2, "steel5"); p.hline(1, G - 3, W - 2, "steel2"); });
  // The dent, catching light on its lower lip.
  art(p, W - 7, G - 7, ["dd.", "d.l", ".ll"], { d: "steel2", l: "steel5" });
  p.ellipse(W / 2, G - 13, W / 2 - 1, 3, "steel4");
  p.ellipse(W / 2, G - 13, W / 2 - 2, 2, "blue3");
  p.hline(Math.round(W / 2) - 4, G - 14, 4, "blue5");
  // The gourd ladle afloat.
  art(p, 4, G - 16, [".bb..", "bBBbh", ".bbhh"], { b: "bamboo3", B: "bamboo5", h: "bamboo2" });
  // Handle lying over the rim.
  p.line(W - 2, G - 13, W - 1, G - 18, "steel3");
  autoOutline(p, { map: { steel: "steel1", blue: "steel1", bamboo: "wood1" } });
};

// ── stools ─────────────────────────────────────────────────────────────────────

/**
 * Variant 0: the laundry stool, a low pine 小板凳 its seat woven of plastic cord in faded blue, one
 * strand snapped and tucked under. Variant 1: drum stools of the stone table's set, granite.
 */
const drawStool: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w;
  if (prop.variant % 2 === 1) {
    drumStool(p, 2, G - 13, W - 4, 13, STONE, seedOf(prop.id) % 97);
    autoOutline(p, { map: { stone: "stone1" } });
    return;
  }
  // Legs splayed, a stretcher, then the corded seat lit from the upper left.
  for (const x of [2, W - 5]) { p.line(x + 1, G - 8, x, G, "oak3"); p.line(x + 2, G - 8, x + 1, G, "oak2"); }
  p.hline(3, G - 3, W - 6, "oak2");
  p.rect(1, G - 13, W - 2, 5, "oak4").hline(1, G - 13, W - 2, "oak5").hline(1, G - 9, W - 2, "oak2");
  for (let i = 3; i < W - 3; i++) for (let j = 0; j < 3; j++) p.px(i, G - 12 + j, (i + j) % 3 === 0 ? "blue2" : (i + j) % 3 === 1 ? "blue4" : "blue3");
  p.px(W - 6, G - 11, "oak4").px(W - 6, G - 10, "blue2");
  autoOutline(p, { map: { oak: "wood1", blue: "blue1" } });
};

// ── wash basins ────────────────────────────────────────────────────────────────

/**
 * Variant 0: the yard's washing station, a big aluminium basin on a low pine stand, sheets soaking in
 * suds, a ribbed wooden washboard leaning in it, a bar of yellow laundry soap on the rim.
 * Variant 1: the cats' enamel basin in the sun, cream with a blue rim and a red-finned carp painted on
 * its floor, showing through the water; chipped to black iron at the lip.
 */
const drawBasin: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w;
  if (prop.variant % 2 === 1) {
    const cx = W / 2, cy = G - 7;
    p.ellipse(cx, cy + 2, W / 2 - 1, 6, "blue2");
    p.ellipse(cx, cy, W / 2 - 1, 6, "blue3");
    p.ellipse(cx, cy, W / 2 - 2, 5, "cream4");
    p.ellipse(cx, cy + 0.5, W / 2 - 4, 3.5, "blue5");
    art(p, Math.round(cx) - 4, Math.round(cy) - 1, [".ooo.r", "oOOooR", ".ooo.r"], { o: "orange2", O: "orange3", r: "red3", R: "red4" });
    p.hline(Math.round(cx) - 6, Math.round(cy) - 2, 3, "white");
    p.px(3, Math.round(cy), "ink").px(4, Math.round(cy) - 1, "ink");
    autoOutline(p, { map: { blue: "blue1", cream: "blue1" } });
    return;
  }
  // The stand.
  for (const x of [3, W - 6]) p.rect(x, G - 9, 3, 9, "oak3").vline(x + 2, G - 9, 9, "oak2");
  p.rect(1, G - 11, W - 2, 3, "oak4").hline(1, G - 11, W - 2, "oak5").hline(1, G - 9, W - 2, "oak2");
  // The basin: a shallow aluminium bowl with a rolled rim.
  const cx = W / 2, cy = G - 18;
  p.ellipse(cx, cy + 4, W / 2 - 2, 6, "steel3");
  p.ellipse(cx, cy + 5, W / 2 - 4, 5, "steel2");
  p.ellipse(cx, cy, W / 2 - 1, 7, "steel5");
  p.ellipse(cx, cy, W / 2 - 3, 5.5, "steel3");
  p.ellipse(cx, cy + 0.5, W / 2 - 4, 4.5, "blue5");
  // Sheets soaking, bunched, and suds.
  art(p, Math.round(cx) - 12, Math.round(cy) - 3, [
    "..ccC.....WW.",
    ".cCCCc..WwwW.",
    "cCcccCcwWWwWw",
    ".ccPpcc.www..",
    "..cppc.......",
  ], { c: "cream4", C: "cream5", P: "pink3", p: "pink2", W: "white", w: "steel6" });
  // The washboard leaning in, ribbed.
  const bx = Math.round(cx) + 5;
  p.rect(bx, cy - 14, 9, 16, "oak4").vline(bx, cy - 14, 16, "oak5").vline(bx + 8, cy - 14, 16, "oak2");
  for (let y = cy - 11; y < cy + 1; y += 2) p.hline(bx + 1, y, 7, "oak2");
  p.hline(bx, cy - 14, 9, "oak5");
  // Laundry soap on the rim.
  art(p, 4, Math.round(cy) - 4, ["gGGg", "gggd"], { g: "gold3", G: "gold4", d: "gold2" });
  autoOutline(p, { map: { steel: "steel1", oak: "wood1", cream: "steel2", white: "steel2", gold: "wood1", pink: "plum1", blue: "steel1" } });
};

// ── the water jar ──────────────────────────────────────────────────────────────

/**
 * The rain jar (水缸) under the downpipe: a big brown-glazed stoneware jar older than anyone in the
 * yard, a crack bound with an iron hoop, rainwater to the brim, half of a split-board lid laid across
 * it, a gourd ladle floating and a single fallen persimmon leaf.
 */
const drawJar: Draw = (p, f) => {
  const G = f.gy, W = f.w;
  const glaze = ["wood1", "wood2", "wood3", "wood4", "gold2"] as const;
  // A jar's profile: a rolled mouth, the widest shoulder a third of the way down, tapering to a narrow foot.
  const bodyH = 24, top = G - bodyH;
  cylinder(p, 0, top, W, bodyH, glaze, (j) => {
    const t = j / (bodyH - 1);
    return Math.round(t < 0.3 ? (0.3 - t) * 6 : (t - 0.3) * 7.5);
  });
  p.over(() => {
    // An iron hoop over the old crack, and the glaze's long highlight down the shoulder.
    p.hline(0, G - 12, W, "steel2").hline(0, G - 11, W, "steel3");
    p.line(10, top + 4, 12, G - 13, "wood1");
    p.vline(7, top + 4, 9, "gold3").vline(7, top + 6, 4, "gold4");
    // Glaze stops short of the foot: bare buff clay.
    p.hline(0, G - 1, W, "oak3").hline(0, G, W, "oak2");
  });
  const cx = W / 2, cy = top;
  p.ellipse(cx, cy, W / 2 - 2, 4.5, "wood3");
  p.ellipse(cx, cy - 0.5, W / 2 - 3, 3.5, "wood4");
  p.ellipse(cx, cy, W / 2 - 4, 3, "wood1");
  p.ellipse(cx, cy + 0.5, W / 2 - 5, 2.2, "blue2");
  p.hline(Math.round(cx) - 5, Math.round(cy) - 1, 4, "blue4");
  // Half a split-board lid across the back of the mouth.
  p.rect(5, cy - 6, W - 10, 3, "oak4").hline(5, cy - 6, W - 10, "oak5").hline(5, cy - 4, W - 10, "oak2");
  p.vline(Math.round(W / 2), cy - 6, 3, "oak2");
  art(p, Math.round(cx) + 2, Math.round(cy) - 1, [".bb.", "bBBh", ".bh."], { b: "bamboo3", B: "bamboo5", h: "bamboo2" });
  art(p, Math.round(cx) - 7, Math.round(cy), ["oO", ".o"], { o: "orange2", O: "orange3" });
  autoOutline(p, { map: { wood: "wood1", oak: "wood1", bamboo: "wood1", blue: "wood1", orange: "brown1", steel: "steel1", gold: "wood1" } });
};

// ── bird bath ──────────────────────────────────────────────────────────────────

/**
 * An old stone rice mortar (石臼) found when the east house was rebuilt, set on a granite block and
 * kept full of water for the sparrows: moss in the chisel marks, a feather on the water.
 */
const drawBirdBath: Draw = (p, f) => {
  const G = f.gy, W = f.w, cx = Math.round(W / 2);
  p.rect(cx - 8, G - 8, 16, 8, "stone3").hline(cx - 8, G - 8, 16, "stone4").vline(cx + 7, G - 8, 8, "stone2").hline(cx - 8, G, 16, "stone2");
  cylinder(p, cx - 12, G - 20, 24, 12, ["stone1", "stone2", "stone3", "stone4", "stone5"], (j) => (j > 8 ? j - 8 : 0));
  p.over(() => { p.speckle(cx - 12, G - 20, 24, 12, "stone2", 0.08, 5); p.hline(cx - 11, G - 15, 22, "stone2"); });
  p.ellipse(cx, G - 21, 12, 5, "stone4");
  p.ellipse(cx - 0.5, G - 21.5, 11, 4, "stone5");
  p.ellipse(cx, G - 21, 9, 3.5, "stone2");
  p.ellipse(cx, G - 20.5, 8, 2.8, "blue4");
  p.hline(cx - 5, G - 22, 4, "blue6");
  art(p, cx + 2, G - 21, ["wW.", ".ww"], { w: "cream4", W: "white" });
  art(p, cx - 12, G - 14, ["m.", "mM", ".m"], { m: "leaf2", M: "leaf3" });
  art(p, cx + 8, G - 6, ["mM", "m."], { m: "leaf2", M: "leaf3" });
  autoOutline(p, { map: { stone: "stone1", leaf: "leaf1", blue: "stone1", cream: "stone1", white: "stone1" } });
};

// ── watering can ───────────────────────────────────────────────────────────────

/** Granny Shen's watering can: green-painted tin gone to rust at the seams, a long spout with a brass rose. */
const drawCan: Draw = (p, f) => {
  const G = f.gy, W = f.w;
  cylinder(p, 3, G - 11, 11, 11, ["jade1", "jade2", "jade3", "jade4", "jade5"]);
  p.ellipse(8.5, G - 11, 5.5, 2, "jade4");
  p.ellipse(8.5, G - 11, 4, 1.2, "jade1");
  p.over(() => { p.hline(3, G - 1, 11, "orange1"); p.px(12, G - 6, "orange1"); });
  // Handle over the top and the spout out to the right.
  art(p, 4, G - 17, ["..jjjj.", ".j....j", "j......", "j......"], { j: "jade2" });
  p.line(13, G - 4, W - 3, G - 12, "jade3").line(13, G - 3, W - 3, G - 11, "jade2");
  art(p, W - 4, G - 14, ["gg", "gG", "g."], { g: "gold2", G: "gold4" });
  autoOutline(p, { map: { jade: "jade1", gold: "wood1", orange: "brown1" } });
};

// ── folding board and sorting basket ───────────────────────────────────────────

/**
 * The folding board by the washing lines: an old pine table top on crossed legs, where whoever brings
 * the washing in folds it. A stack of folded towels, a shirt half folded, a tin of pegs.
 */
const drawFoldingBoard: Draw = (p, f) => {
  const G = f.gy, W = f.w;
  // Crossed legs.
  p.line(3, G - 10, W - 5, G, "oak2").line(W - 4, G - 10, 4, G, "oak3");
  p.line(4, G - 10, W - 4, G, "oak2").line(W - 5, G - 10, 3, G, "oak3");
  // The top.
  p.rect(0, G - 17, W, 6, "oak4").hline(0, G - 17, W, "oak5").hline(0, G - 12, W, "oak2").rect(0, G - 11, W, 2, "oak3");
  p.over(() => { p.hline(5, G - 15, 8, "oak3"); p.hline(18, G - 14, 10, "oak3"); });
  // Folded towels, stacked.
  art(p, 3, G - 22, [
    "pppppppppd",
    "PPPPPPPPPd",
    "bbbbbbbbbd",
    "BBBBBBBBBd",
    "cccccccccd",
    "CCCCCCCCCd",
  ], { p: "pink2", P: "pink3", b: "blue3", B: "blue4", c: "cream3", C: "cream5", d: "steel2" });
  // A shirt half folded, a sleeve hanging over the edge.
  art(p, 15, G - 19, ["sSSSSSSs..", "sSSSSSSSSs", "sssssssS.s", ".......s..", ".......s.."], { s: "blue4", S: "blue5" });
  // The peg tin.
  art(p, W - 8, G - 22, [".r.y.", "jJJJj", "jjjjj", "jjjjj"], { r: "pink2", y: "gold4", j: "steel3", J: "steel5" });
  autoOutline(p, { map: { oak: "wood1", pink: "plum1", blue: "blue1", cream: "ink2", steel: "steel1", gold: "wood1" } });
};

/** The sorting basket: a flat round bamboo basket of odd socks waiting for their pairs, and loose pegs. */
const drawSortingBasket: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w;
  const b = basket(p, 1, G - 12, W - 2, 6, 7, { taper: 1 });
  const colours = [["steel3", "steel4"], ["blue1", "blue2"], ["cream4", "white"], ["gold3", "gold4"], ["jade3", "jade4"], ["plum2", "plum3"]] as const;
  for (let k = 0; k < 6; k++) {
    const [a, c] = colours[Math.floor(hash(k, 3, seedOf(prop.id)) * colours.length)];
    const x = 4 + k * 3, y = b.top - 4 + (k % 2);
    art(p, x, y, ["ac.", "ac.", "acc"], { a, c });
  }
  for (const [x, y, c] of [[6, b.top - 1, "oak4"], [13, b.top - 2, "pink2"], [17, b.top, "jade4"]] as const) art(p, x, y, ["kk."], { k: c });
  b.front();
  autoOutline(p, { map: { bamboo: "wood1", steel: "steel1", blue: "blue1", cream: "ink2", white: "ink2", gold: "wood1", jade: "jade1", plum: "plum1", oak: "wood1", pink: "plum1" } });
};

// ── broom ──────────────────────────────────────────────────────────────────────

/** The yard broom by the central house's door: bamboo twigs bound to a bamboo handle with wire, stood on its head, worn short on one side. */
const drawBroom: Draw = (p, f) => {
  const G = f.gy, W = f.w, cx = Math.round(W / 2);
  // Handle.
  p.vline(cx, 0, G - 14, "bamboo3").vline(cx + 1, 0, G - 14, "bamboo2");
  for (let y = 6; y < G - 16; y += 11) p.px(cx, y, "bamboo5").px(cx + 1, y, "bamboo1");
  // Binding.
  p.rect(cx - 2, G - 16, 6, 3, "steel3").hline(cx - 2, G - 16, 6, "steel5");
  // Twigs fanning to the ground, the right side worn shorter.
  for (let i = -8; i <= 8; i++) {
    const x1 = cx + i, y1 = G - (i > 3 ? 2 : 0);
    p.line(cx + Math.round(i / 3), G - 13, x1, y1, i < -2 ? "bamboo4" : i < 3 ? "bamboo3" : "bamboo2");
  }
  for (const i of [-6, -1, 5]) p.px(cx + i, G - (i > 3 ? 2 : 0), "bamboo1");
  autoOutline(p, { map: { bamboo: "wood1", steel: "steel1" } });
};

export default defineSprites(Object.fromEntries([
  ...kind("basket", (p) => (p.variant % 2 ? 22 : 16), drawBasket),
  ...kind("bucket", () => 10, drawBucket),
  ...kind("stool", (p) => (p.variant % 2 ? 6 : 4), drawStool),
  ...kind("wash-basin", (p) => (p.variant % 2 ? 2 : 22), drawBasin),
  ...kind("water-jar", () => 24, drawJar),
  ...kind("bird-bath", () => 6, drawBirdBath),
  ...kind("watering-can", () => 6, drawCan),
  ...kind("folding-board", () => 12, drawFoldingBoard),
  ...kind("sorting-basket", () => 4, drawSortingBasket),
  ...kind("broom", () => 40, drawBroom, { shadow: false }),
]));

