/**
 * The rooftop garden's small things: border pots, the tap and its terrazzo basin, the compost bins, the
 * timber trellis planters, the tea table under the pergola, a sundial, and the care corner's tray, sack
 * and spilled soil, with the hose, the wash bowl and the tools left out. One sprite per prop of each
 * kind (`<map>/<id>`), footprint-sized, anchored on the footprint's bottom-centre. Autumn, a soft morning.
 */
import { defineSprites, hash, type Px, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { mound, sticker } from "../plant/_helpers.ts";
import { chilli, choy, rows, scallions, trellis } from "./_beds.ts";
import { art, autoOutline, cylinder, pot, seedOf, townFoot, townFrame, weaveAt, type Ramp } from "./_helpers.ts";

type Frame = ReturnType<typeof townFrame>;
type Draw = (p: Px, f: Frame, prop: MapProp, index: number) => void;

/** One sprite per prop of `kind` on any map, `rise` px above its footprint. */
function kind(name: string, rise: (prop: MapProp) => number, draw: Draw, options: { solid?: boolean; shadow?: boolean; floor?: boolean } = {}): [string, SpriteDef][] {
  return mapProps("all", name).map((prop, index) => {
    const f = townFrame(prop, rise(prop));
    return [propSpriteId(prop.map, prop.id), {
      w: f.w, h: f.h, anchor: f.anchor,
      ...(options.floor ? { layer: "floor" as const } : {}),
      ...(options.solid === false || options.floor ? {} : { foot: townFoot(prop) }),
      ...(options.shadow === false || options.floor ? {} : { shadow: { rx: Math.max(3, Math.round(f.w / 2) - 2), ry: Math.max(2, Math.round(f.depth / 5)), dy: -Math.round(f.depth / 3) } }),
      draw: (p: Px) => draw(p, f, prop, index),
    }];
  });
}

const CELADON: Ramp = ["jade2", "jade3", "jade4", "jade5", "jade6"];
const TERRACOTTA: Ramp = ["rose1", "rose2", "rose3", "rose4", "red5"];
const CONCRETE: Ramp = ["stone1", "stone2", "stone3", "stone4", "stone5"];
const OUTLINE = { rose: "rose1", red: "rose1", jade: "jade1", stone: "stone1", steel: "steel1", oak: "wood1", wood: "wood1", bamboo: "wood1", gold: "wood1", cream: "stone1", white: "stone1", blue: "blue1", brown: "wood1", leaf: "leaf1", orange: "brown1", plum: "plum1", pink: "plum1" } as const;

// ── border pots ────────────────────────────────────────────────────────────────

/**
 * Big pots along the parapets, each a different neighbour's. Variant 0: a celadon jar of silver grass
 * in plume (or, the second one, a dwarf bamboo). Variant 1: a terracotta pot with a camellia in fat bud
 * (or a gold chrysanthemum). Variant 2: a weathered concrete pot with rosemary spilling over (or
 * succulents and a fallen plane leaf).
 */
const drawBorderPot: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, seed = seedOf(prop.id);
  const second = Number(prop.id.match(/(\d+)$/)?.[1] ?? 0) >= 3;
  const v = prop.variant % 3;
  const s = pot(p, 3, G - 19, W - 6, 20, v === 0 ? CELADON : v === 1 ? TERRACOTTA : CONCRETE, { belly: v === 2 ? 0 : 2 });
  if (v === 2) p.over(() => { p.speckle(3, G - 16, W - 6, 16, "stone2", 0.06, seed); p.line(8, G - 12, 10, G - 4, "stone2"); });
  autoOutline(p, { map: OUTLINE });
  const cx = Math.round(s.cx), cy = Math.round(s.cy);
  sticker(p, 0, 0, W, f.h - 2, (q) => {
    if (v === 0 && !second) {
      for (let k = 0; k < 9; k++) {
        const lean = Math.round((k - 4) * 2.2), h = 26 + Math.floor(hash(k, 1, seed) * 8);
        q.line(cx + (k % 3) - 1, cy, cx + lean, cy - h, k % 2 ? "leaf2" : "leaf3");
      }
      for (const [dx, h] of [[-6, 34], [1, 38], [6, 33]] as const) art(q, cx + dx - 1, cy - h, [".c.", "cCc", "cCc", ".c.", ".c."], { c: "cream3", C: "cream5" });
    } else if (v === 0) {
      for (let k = 0; k < 5; k++) q.line(cx - 4 + k * 2, cy, cx - 6 + k * 3, cy - 18 - (k % 2) * 6, "jade3");
      for (let k = 0; k < 10; k++) art(q, cx - 9 + Math.floor(hash(k, 2, seed) * 17), cy - 24 + Math.floor(hash(k, 3, seed) * 18), ["gg.", ".Gg"], { g: "leaf3", G: "leaf4" });
    } else if (v === 1) {
      mound(q, cx, cy - 8, 9, 8, ["jade1", "jade1", "jade2", "leaf2", "leaf3"], seed, [["33", "21"], [".3", "32"]], [3, 2]);
      for (let k = 0; k < 6; k++) art(q, cx - 7 + Math.floor(hash(k, 4, seed) * 13), cy - 14 + Math.floor(hash(k, 5, seed) * 10), second ? [".y.", "yYy", ".y."] : ["pP", "gp"], second ? { y: "gold3", Y: "gold4" } : { p: "pink2", P: "pink3", g: "leaf2" });
    } else if (!second) {
      mound(q, cx, cy - 4, 9, 4, ["leaf1", "leaf1", "jade2", "jade3", "jade4"], seed, [["3", "2"], ["33", "2."]], [2, 2]);
      for (const dx of [-9, 7]) q.line(cx + dx, cy - 2, cx + dx + (dx < 0 ? -1 : 1), cy + 8, "jade3");
      art(q, cx + 2, cy - 7, ["b.b", ".b."], { b: "blue4" });
    } else {
      for (const [dx, dy] of [[-5, -3], [1, -4], [5, -2], [-2, 0]] as const) art(q, cx + dx - 2, cy + dy - 2, [".454.", "45354", ".444."].map((r) => r.replace(/5/g, "c").replace(/4/g, "b").replace(/3/g, "a")), { a: "jade3", b: "jade4", c: "jade5" });
      art(q, cx + 3, cy + 1, ["o.o", "oOo", ".d."], { o: "oak3", O: "oak4", d: "oak2" });
    }
  });
};

// ── the tap basin ──────────────────────────────────────────────────────────────

/**
 * The roof tap over a terrazzo basin (水池) as old as the building: grey chips in cream, a rounded lip
 * polished by forty years of hands, a brass tap on a galvanised riser with a green hose pushed onto it,
 * a bar of laundry soap and a scrubbing brush on the ledge, a drip falling.
 */
const drawBasin: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, seed = seedOf(prop.id);
  const bx = 6, bw = W - 12, top = G - 34, front = G - 14;
  // Riser at the back, the tap's spout reaching over the basin.
  p.rect(Math.round(W / 2) - 1, top - 22, 3, 24, "steel3").vline(Math.round(W / 2) - 1, top - 22, 24, "steel4").vline(Math.round(W / 2) + 1, top - 22, 24, "steel2");
  art(p, Math.round(W / 2) - 4, top - 14, ["..gGg..", ".gGGGgg", "...g..g", "......g"], { g: "gold2", G: "gold4" });
  p.rect(Math.round(W / 2) - 2, top - 17, 5, 3, "gold3").hline(Math.round(W / 2) - 2, top - 17, 5, "gold4");
  // The basin: top lip, the sunk bowl, the front face, short brick piers.
  p.rect(bx, top, bw, front - top, "stone4");
  p.hline(bx, top, bw, "stone5").vline(bx, top, front - top, "stone5");
  p.rect(bx + 4, top + 3, bw - 8, front - top - 7, "stone2");
  p.rect(bx + 5, top + 4, bw - 10, front - top - 9, "stone3");
  p.faded(0.5, () => p.ellipse(bx + bw / 2, front - 6, 4, 1.5, "blue3"));
  p.ellipse(bx + bw / 2, front - 6, 1.5, 1, "stone1");
  p.rect(bx, front, bw, 8, "stone3").hline(bx, front, bw, "stone4").vline(bx + bw - 1, front, 8, "stone2");
  p.over(() => { for (const c of ["stone2", "stone5", "steel3"] as const) p.speckle(bx, top, bw, front - top + 8, c, 0.06, seed + c.length); });
  for (const x of [bx + 3, bx + bw - 10]) for (let j = 0; j < 6; j++) p.hline(x, front + 8 + j, 7, j % 3 === 2 ? "stone3" : "rose3");
  // Soap and brush on the lip, a drip under the spout.
  art(p, bx + 2, top - 1, ["gGGg", "gggd"], { g: "gold3", G: "gold4", d: "gold2" });
  art(p, bx + bw - 12, top, ["wwwwww", "bbbbbb", ".b..b."], { w: "oak4", b: "bamboo3" });
  p.faded(0.7, () => p.px(Math.round(W / 2) + 2, top - 6, "blue5"));
  // The hose pushed onto the tap, dropping behind the basin.
  p.line(Math.round(W / 2) + 2, top - 10, W - 4, top - 2, "jade3").line(W - 4, top - 2, W - 3, front + 6, "jade3");
  autoOutline(p, { map: OUTLINE });
};

// ── compost ────────────────────────────────────────────────────────────────────

/**
 * Two slatted bins of old pallet wood, the left one full (peelings, tea leaves, plane leaves) and steaming
 * a little in the cool morning, the right half dug out; a corrugated lid leant against them, a fork stuck in.
 */
const drawCompost: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, seed = seedOf(prop.id);
  const bw = Math.floor((W - 6) / 2);
  for (const [i, x] of [[0, 2], [1, 4 + bw]] as const) {
    const top = G - 36;
    // The heap inside, rising over the back rail on the full bin.
    const heap = i === 0 ? 8 : 2;
    p.rect(x + 2, top - heap, bw - 4, heap + 4, "brown2");
    p.over(() => {
      p.speckle(x + 2, top - heap, bw - 4, heap + 4, "brown3", 0.2, seed + i);
      for (let k = 0; k < 7; k++) {
        const lx = x + 3 + Math.floor(hash(k, i, seed) * (bw - 8)), ly = top - heap + Math.floor(hash(i, k, seed) * (heap + 2));
        art(p, lx, ly, [["oO"], ["gG"], ["yy"], ["c."]][k % 4], { o: "orange2", O: "orange3", g: "leaf3", G: "leaf4", y: "gold3", c: "cream4" });
      }
    });
    // Slats: four boards with gaps, corner posts.
    for (let s = 0; s < 5; s++) { const y = top + 2 + s * 7; p.rect(x, y, bw, 5, "oak3").hline(x, y, bw, "oak4").hline(x, y + 4, bw, "oak2"); }
    p.rect(x, top, 3, 37, "oak2").rect(x + bw - 3, top, 3, 37, "wood2");
    p.over(() => p.hline(x + 6, top + 10, 8, "leaf2"));
  }
  // The fork in the right bin, the lid leaning on the left.
  p.line(4 + bw + 14, G - 52, 4 + bw + 18, G - 36, "wood3");
  art(p, 4 + bw + 12, G - 56, ["s.s.s", "s.s.s", "sssss", "..s.."], { s: "steel3" });
  for (let k = 0; k < 6; k++) p.line(1 + k * 2, G - 30, 4 + k * 2, G, k % 2 ? "steel3" : "steel4");
  autoOutline(p, { map: OUTLINE });
};

// ── trellis planters ───────────────────────────────────────────────────────────

/**
 * Long timber planters along the north parapet and the south wall, built by Old Gu from scaffold boards
 * and lined with plastic, with bamboo trellises: bitter melon and long beans on the north one, morning
 * glory on the south. Scallions along the front edge for the kitchen.
 */
const drawTrellisBed: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, seed = seedOf(prop.id);
  const wall = 12, top = G - f.depth + 1 - wall, front = G - wall + 1;
  // The box: a lit top rail, soil, the plank front with its seams and screw heads.
  p.rect(0, top, W, front - top, "oak3").hline(0, top, W, "oak5").vline(0, top, front - top, "oak4");
  p.rect(3, top + 2, W - 6, front - top - 4, "brown2");
  p.over(() => p.speckle(3, top + 3, W - 6, front - top - 5, "brown3", 0.16, seed));
  for (let j = 0; j < wall; j++) for (let x = 0; x < W; x++) {
    const plank = Math.floor(j / 4), seam = j % 4 === 3;
    p.px(x, front + j, seam ? "oak1" : hash(Math.floor(x / 40), plank, seed) < 0.5 ? "oak3" : "oak4");
  }
  for (let x = 6; x < W; x += 40) for (const j of [1, 5, 9]) p.px(x, front + j, "steel2");
  p.hline(0, front, W, "oak5").vline(W - 1, front, wall, "oak1");
  p.over(() => { for (let x = 0; x < W; x++) if (hash(x, 4, seed) < 0.12) p.vline(x, G - 2, 3, "oak2"); });
  autoOutline(p, { map: OUTLINE });
  const south = prop.variant % 3 === 2;
  const soilY = top + 3;
  trellis(p, 6, W - 8, soilY + 2, south ? 30 : 40, south ? "beans" : "loofah", seed);
  if (south) {
    // Morning glory over the beans: blue trumpets open in the morning, a white one.
    for (let k = 0; k < Math.round(W / 8); k++) {
      const x = 6 + Math.floor(hash(k, 1, seed) * (W - 14)), y = soilY - 6 - Math.floor(hash(k, 2, seed) * 22);
      art(p, x, y, [".b.", "bWb", ".b."], { b: k % 4 ? "blue3" : "plum3", W: k % 5 ? "blue5" : "white" });
    }
  }
  // Kitchen rows under the trellis, back to front: chillies, bok choy, scallions along the front edge.
  rows(p, { x: 3, y: soilY + 8, w: W - 6, h: Math.max(8, front - soilY - 12) }, south ? [
    { plant: (q, x, b, k) => choy(q, x, b, k % 2 === 0), dx: 11 },
  ] : [
    { plant: (q, x, b, k) => chilli(q, x, b, seed + k), dx: 16 },
    { plant: (q, x, b, k) => choy(q, x, b, k % 2 === 0), dx: 11 },
  ]);
  for (let x = 8; x < W - 6; x += 9) scallions(p, x + Math.floor(hash(x, 7, seed) * 3), front - 1, seed + x);
};

// ── the tea table ──────────────────────────────────────────────────────────────

/**
 * The tea corner under the pergola: a low square elm table, its top ringed by years of cups, a bamboo
 * tea tray on it with a purple-clay teapot, three small white cups (one tipped over to drain), a tin of
 * tea; a red-and-green flowered enamel thermos on the floor, a low bamboo stool either side.
 */
const drawTeaTable: Draw = (p, f) => {
  const G = f.gy, W = f.w, cx = Math.round(W / 2);
  // Low bamboo stools either side, set back a little.
  for (const sx of [0, W - 16]) {
    p.rect(sx + 1, G - 26, 15, 6, "bamboo4").hline(sx + 1, G - 26, 15, "bamboo5");
    for (let i = 1; i < 15; i += 3) p.vline(sx + 1 + i, G - 25, 5, "bamboo3");
    p.rect(sx + 1, G - 20, 15, 2, "bamboo2");
    for (const lx of [sx + 2, sx + 13]) p.vline(lx, G - 18, 12, "bamboo2");
    p.hline(sx + 2, G - 11, 12, "bamboo3");
  }
  // The table: a thick elm top lit from the upper left, an apron with a cloud cut, square legs.
  const tx = 11, tw = W - 22, top = G - 40;
  for (const lx of [tx + 2, tx + tw - 5]) { p.rect(lx, top + 14, 3, 25, "wood3"); p.vline(lx + 2, top + 14, 25, "wood2"); }
  p.hline(tx + 4, G - 6, tw - 8, "wood2");
  p.rect(tx, top, tw, 12, "wood4").hline(tx, top, tw, "wood5").vline(tx, top, 12, "wood5");
  p.rect(tx, top + 12, tw, 4, "wood3").hline(tx, top + 15, tw, "wood2");
  art(p, cx - 4, top + 14, ["..kkkk..", ".k....k."], { k: "wood2" });
  p.over(() => { p.ellipse(tx + 6, top + 9, 2.5, 1.2, "wood3"); p.ellipse(tx + tw - 7, top + 3, 2, 1, "wood3"); p.hline(tx + 14, top + 2, 7, "wood3"); });
  // The bamboo tea tray with its slats, the purple-clay pot, cups, the tea tin.
  const ty = top + 2;
  p.rect(tx + 5, ty, tw - 15, 8, "bamboo3");
  for (let i = 0; i < tw - 15; i += 2) p.vline(tx + 5 + i, ty, 8, "bamboo4");
  p.hline(tx + 5, ty + 7, tw - 15, "bamboo1");
  art(p, tx + 6, ty - 7, [
    "....kk.....",
    "...kKKk....",
    ".kkKrrkk.h.",
    "kkrKrrrrkhh",
    ".krrrrrrk.h",
    "..krrrrk..h",
    "...kkkk.hh.",
  ], { k: "rose1", K: "rose2", r: "wood2", h: "rose1" });
  for (const [x, y, tipped] of [[tx + 18, ty + 1, false], [tx + 22, ty + 3, false], [tx + 26, ty + 1, true]] as const)
    art(p, x, y, tipped ? ["wwc", "wcc"] : ["wWw", "wcw", ".c."], { w: "white", W: "gold4", c: "cream3" });
  art(p, tx + tw - 8, ty - 5, ["sSs", "sss", "sjs", "sjs", "sss"], { s: "steel3", S: "steel5", j: "jade3" });
  // The flowered enamel thermos by the table leg.
  cylinder(p, cx + 4, G - 14, 7, 14, ["cream2", "cream3", "cream4", "cream5", "white"]);
  p.over(() => { p.px(cx + 5, G - 9, "pink2").px(cx + 8, G - 7, "pink2").px(cx + 6, G - 8, "leaf3"); p.hline(cx + 4, G - 13, 7, "jade3"); p.hline(cx + 4, G - 2, 7, "jade3"); });
  art(p, cx + 5, G - 16, ["ooooo", ".ooo."], { o: "oak3" });
  autoOutline(p, { map: OUTLINE });
};

// ── the sundial ────────────────────────────────────────────────────────────────

/**
 * An equatorial sundial (日晷) in miniature, as at the Forbidden City: a stone disc tilted to the sky on
 * a short pedestal, ringed with cut hour marks (no numerals), a bronze gnomon through its centre whose
 * shadow lies on the disc's upper face this morning.
 */
const drawSunClock: Draw = (p, f) => {
  const G = f.gy, W = f.w, cx = Math.round(W / 2);
  // A square plinth and a column, then the slanted cradle that holds the dial.
  p.rect(cx - 8, G - 6, 16, 6, "stone3").hline(cx - 8, G - 6, 16, "stone4").vline(cx + 7, G - 6, 6, "stone2");
  p.rect(cx - 4, G - 14, 8, 8, "stone3").vline(cx - 4, G - 14, 8, "stone4").vline(cx + 3, G - 14, 8, "stone2");
  p.poly([[cx - 6, G - 14], [cx + 6, G - 14], [cx + 4, G - 19], [cx - 4, G - 19]], "stone2");
  // The dial, tipped up to face the southern sky: its rim, its face, hour lines from the centre.
  const dy = G - 27;
  p.ellipse(cx, dy + 1.5, 11, 9, "stone2");
  p.ellipse(cx, dy, 11, 9, "stone4");
  p.ellipse(cx - 0.5, dy - 0.5, 9.5, 7.5, "stone5");
  for (let k = 0; k < 12; k++) {
    const a = Math.PI * (0.05 + (k / 11) * 0.9);
    p.line(cx, dy, Math.round(cx - Math.cos(a) * 8), Math.round(dy - Math.sin(a) * 6.5), "stone3");
  }
  p.ellipse(cx, dy, 2, 1.6, "stone4");
  // The gnomon, a bronze rod through the centre, and its morning shadow on the dial.
  p.line(cx, dy, cx + 6, dy - 4, "stone2");
  p.line(cx - 3, dy + 4, cx + 3, dy - 6, "gold2");
  p.px(cx + 3, dy - 6, "gold4").px(cx + 1, dy - 2, "gold4");
  autoOutline(p, { map: OUTLINE });
};

// ── small things ───────────────────────────────────────────────────────────────

/** The wash bowl under the airing line: white enamel with a blue rim and a painted peony, a cloth soaking. */
const drawWashBowl: Draw = (p, f) => {
  const G = f.gy, W = f.w, cx = W / 2, cy = G - 7;
  p.ellipse(cx, cy + 2, W / 2 - 1, 6, "steel4");
  p.ellipse(cx, cy, W / 2 - 1, 6, "blue3");
  p.ellipse(cx, cy, W / 2 - 2, 5, "white");
  p.ellipse(cx, cy + 0.5, W / 2 - 4, 3.5, "blue5");
  art(p, Math.round(cx) - 2, Math.round(cy) - 1, [".pP", "pPp", ".g."], { p: "pink2", P: "pink3", g: "leaf3" });
  art(p, Math.round(cx) + 2, Math.round(cy) - 2, ["ccC", "cCc", ".cc"], { c: "steel3", C: "steel4" });
  p.px(3, Math.round(cy), "ink");
  autoOutline(p, { map: OUTLINE });
};

/** The hose, green garden hose coiled in loose loops on the paving, its brass nozzle, a drip at the end. */
const drawHose: Draw = (p, f) => {
  const G = f.gy, W = f.w, cx = W / 2;
  for (let k = 3; k >= 0; k--) {
    const rx = W / 2 - 3 - k * 2.5, ry = 8 - k * 1.5, cy = G - 9 - k;
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      const x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * ry);
      p.px(x, y, Math.sin(a) < -0.3 ? "jade4" : Math.cos(a) > 0.5 ? "jade2" : "jade3");
      p.px(x, y + 1, "jade2");
    }
  }
  art(p, W - 8, G - 3, ["jjgG", "..gg"], { j: "jade3", g: "gold2", G: "gold4" });
  p.faded(0.5, () => p.px(W - 3, G - 1, "blue4"));
  autoOutline(p, { map: OUTLINE });
};

/** Tools left out after the morning's work: a trowel, a hand fork, secateurs, white cotton gloves with blue cuffs, a ball of twine. */
const drawTools: Draw = (p, f) => {
  const G = f.gy;
  art(p, 2, G - 12, ["....ss", "...sSs", "..sSs.", ".ws...", "ww....", "w....."], { s: "steel3", S: "steel5", w: "wood3" });
  art(p, 12, G - 14, ["s.s.s", "s.s.s", "sssss", "..w..", "..w..", "..w.."], { s: "steel3", w: "wood3" });
  art(p, 20, G - 7, ["rr..", ".rrs", "rr.S"], { r: "jade3", s: "steel4", S: "steel5" });
  art(p, 4, G - 5, ["cccC.", "cCCCc", "bbcc.", ".bb.."], { c: "cream4", C: "white", b: "blue3" });
  art(p, 22, G - 14, [".ttt", "tTtt", "tttt", ".tt."], { t: "bamboo3", T: "bamboo4" });
  autoOutline(p, { map: OUTLINE });
};

/** The care tray: a shallow timber potting tray of compost with a row of seedling plugs, a dibber and a stack of tiny pots. */
const drawCareTray: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, seed = seedOf(prop.id);
  p.rect(1, G - 13, W - 2, 8, "brown2").frame(1, G - 13, W - 2, 8, "oak3");
  p.hline(1, G - 13, W - 2, "oak5");
  p.over(() => p.speckle(2, G - 12, W - 4, 6, "brown3", 0.2, seed));
  p.rect(1, G - 5, W - 2, 5, "oak3").hline(1, G - 5, W - 2, "oak4").vline(W - 2, G - 5, 5, "oak2");
  for (let x = 5; x < W - 12; x += 4) art(p, x, G - 13, ["g.g", ".g."], { g: "leaf4" });
  for (let k = 0; k < 3; k++) art(p, W - 10, G - 18 + k * 2, ["rRRRr", ".rrr."], { r: "rose3", R: "rose4" });
  p.line(3, G - 15, 9, G - 11, "wood4");
  autoOutline(p, { map: OUTLINE });
};

/** A sack of potting compost, woven cream polypropylene rolled down at the mouth, a tin scoop stuck in it. */
const drawSack: Draw = (p, f) => {
  const G = f.gy, W = f.w;
  for (let j = 0; j < 14; j++) for (let i = 0; i < W - 2; i++) p.px(1 + i, G - 13 + j, weaveAt(i, j, W - 2, ["cream1", "cream2", "cream3", "cream4", "cream5"]));
  p.rect(2, G - 16, W - 4, 4, "cream4").hline(2, G - 16, W - 4, "cream5");
  p.ellipse(W / 2, G - 15, W / 2 - 3, 2, "brown1");
  p.ellipse(W / 2, G - 15.5, W / 2 - 4, 1.4, "brown2");
  art(p, Math.round(W / 2), G - 20, ["ss", "sS", "s."], { s: "steel3", S: "steel5" });
  autoOutline(p, { map: OUTLINE });
};

/** Compost spilled from the sack and trodden about: crumbs and a smear on the paving, translucent at its edges. */
const drawSpill: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, D = f.depth, seed = seedOf(prop.id);
  for (let y = G - D + 1; y <= G; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot((x + 0.5 - W * 0.6) / (W * 0.4), (y + 0.5 - (G - D / 2)) / (D * 0.38));
    if (d < 0.7 && hash(x, y, seed) < 0.6) p.faded(0.55, () => p.px(x, y, "brown2"));
    else if (d < 1.15 && hash(x, y, seed + 1) < 0.12) p.px(x, y, hash(x, y, seed + 2) < 0.5 ? "brown2" : "brown3");
  }
  art(p, 4, G - 5, ["b.b", ".b."], { b: "brown2" });
};

export default defineSprites(Object.fromEntries([
  ...kind("border-pot", () => 40, drawBorderPot),
  ...kind("basin", () => 24, drawBasin),
  ...kind("compost", () => 22, drawCompost),
  ...kind("trellis-bed", () => 12 + 46, drawTrellisBed),
  ...kind("tea-table", () => 8, drawTeaTable),
  ...kind("sun-clock", () => 4, drawSunClock),
  ...kind("wash-bowl", () => 2, drawWashBowl),
  ...kind("hose", () => 2, drawHose),
  ...kind("tools", () => 6, drawTools),
  ...kind("potting-tray", () => 8, drawCareTray),
  ...kind("soil-sack", () => 6, drawSack),
  ...kind("soil-spill", () => 0, drawSpill, { floor: true }),
]));
