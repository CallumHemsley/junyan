/**
 * Things that lie flat in the courtyard (map layer `ground`, sprite layer `floor`): the well head, mats,
 * the cats' bowl, fallen leaves, damp paw prints, wet paving by the basins and the stone runoff gutter.
 * One sprite per prop, footprint-sized, anchored on the footprint's bottom-centre. Floor art takes no
 * contact shadow and no hard outline; damp and shade are translucent so the paving shows through.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { litterOf } from "../plant/courtyard.ts";
import { noise2 } from "../plant/_helpers.ts";
import { art, autoOutline, cylinder, seedOf, townFrame } from "./_helpers.ts";

type Draw = (p: Px, f: ReturnType<typeof townFrame>, prop: MapProp) => void;

function flat(name: string, rise: number, draw: Draw): [string, SpriteDef][] {
  return mapProps("all", name).map((prop) => {
    const f = townFrame(prop, rise);
    return [propSpriteId(prop.map, prop.id), { w: f.w, h: f.h, anchor: f.anchor, layer: "floor", draw: (p: Px) => draw(p, f, prop) }];
  });
}

/** An irregular blob: distance inside an ellipse (1 at its edge), its edge wandering with smooth noise. */
function blob(x: number, y: number, cx: number, cy: number, rx: number, ry: number, seed: number, wander = 0.25): number {
  return Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry) + (noise2(x, y, seed, 9, 6) - 0.5) * wander * 2 + (noise2(x, y, seed + 3, 4, 3) - 0.5) * wander * 0.6;
}

// ── the well ───────────────────────────────────────────────────────────────────

/**
 * The yard's old well, capped since the water mains came in 1965 but never filled: a granite curb worn
 * into rope grooves along its lip, a lid of pine boards with an iron ring, and the wooden bucket still
 * kept beside it on its coiled rope, for washing the paving and watering the beds. It stands low, a
 * hand's height, so it can lie on the floor layer.
 */
const drawWell: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, seed = seedOf(prop.id);
  const cx = Math.round(W / 2) - 5, cy = G - 36, rx = 24, ry = 16;
  // Moss round the foot, the curb's front face, then its lit top.
  for (let k = 0; k < 10; k++) {
    const a = Math.PI * (0.1 + k * 0.09);
    art(p, Math.round(cx + Math.cos(a) * (rx + 1)) - 1, Math.round(cy + 9 + Math.sin(a) * (ry - 1)), ["mM", "m."], { m: "leaf2", M: "leaf3" });
  }
  p.ellipse(cx, cy + 10, rx, ry, "stone2");
  p.ellipse(cx, cy + 8, rx, ry, "stone3");
  // The curb is four dressed blocks: their joints show on its front face.
  for (const k of [-2, 0, 2]) { const x = Math.round(cx + k * 9); p.vline(x, cy + ry - 1 - Math.abs(k), 9, "stone2"); p.vline(x + 1, cy + ry - Math.abs(k), 8, "stone4"); }
  p.ellipse(cx, cy, rx, ry, "stone4");
  p.ellipse(cx - 1, cy - 1, rx - 2, ry - 2, "stone5");
  p.over(() => p.speckle(cx - rx, cy - ry, rx * 2, ry * 2 + 8, "stone3", 0.05, seed));
  // Rope grooves worn into the lip.
  for (const a of [1.25, 1.55, 1.85]) { const x = Math.round(cx + Math.cos(Math.PI * a) * (rx - 1)), y = Math.round(cy + Math.sin(Math.PI * a) * (ry - 1)); p.px(x, y, "stone2").px(x + 1, y, "stone2"); }
  // The lid: pine boards inside the curb, a cleat across them, an iron ring.
  const lrx = 16, lry = 10;
  p.ellipse(cx, cy + 1, lrx + 1, lry + 1, "stone1");
  p.ellipse(cx, cy, lrx, lry, "oak3");
  p.clip(cx - lrx, cy - lry, lrx * 2, lry * 2, (q) => q.over(() => {
    // Boards running east-west, two cleats across them, grain streaks.
    for (let j = 0; j < lry * 2; j += 4) { q.hline(0, j, lrx * 2, "oak2"); q.hline(0, j + 1, lrx * 2, "oak4"); }
    for (const x of [8, lrx * 2 - 10]) { q.rect(x, 0, 3, lry * 2, "oak3"); q.vline(x, 0, lry * 2, "oak4"); q.vline(x + 2, 0, lry * 2, "oak1"); }
    q.hline(13, 6, 5, "oak2").hline(4, 14, 3, "oak2");
  }));
  art(p, cx - 3, cy - 1, [".sss.", "s...s", ".sSs."], { s: "steel1", S: "steel4" });
  // The bucket beside it and the rope from its bail, coiled on the stone.
  const bx = W - 18, by = G - 22;
  cylinder(p, bx, by, 13, 12, ["wood1", "oak2", "oak3", "oak4", "oak5"], (j) => (j > 8 ? 1 : 0));
  p.over(() => { p.hline(bx, by + 2, 13, "steel2"); p.hline(bx, by + 9, 13, "steel2"); });
  p.ellipse(bx + 6.5, by, 6.5, 2.5, "oak4");
  p.ellipse(bx + 6.5, by, 5, 1.5, "wood1");
  art(p, bx + 1, by - 6, ["...sss...", ".ss...ss.", "s.......s", "s.......s"], { s: "steel3" });
  p.line(bx + 6, by - 6, cx + 15, cy - 6, "cream2");
  for (let k = 0; k < 3; k++) p.ellipse(cx + 15, cy - 6 + k, 4 - k, 2, k === 1 ? "cream3" : "cream2");
  p.ellipse(cx + 15, cy - 5, 1.5, 0.8, "stone4");
  autoOutline(p, { map: { stone: "stone1", oak: "wood1", wood: "wood1", steel: "steel1", cream: "stone1", leaf: "leaf1" } });
};

// ── mats ───────────────────────────────────────────────────────────────────────

/**
 * The cats' straw mat (草席) in the sun by the north house, an old summer sleeping mat cut down, its blue
 * cloth binding frayed through at one corner, grey and ginger hairs on it and a bottle cap to bat about.
 */
const drawWovenMat: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, D = f.depth;
  const x0 = 2, y0 = G - D + 4, w = W - 4, h = D - 6;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const warp = i % 6 === 0;
    p.px(x0 + i, y0 + j, warp ? "bamboo2" : j % 2 ? "bamboo3" : (i + j) % 7 === 0 ? "bamboo5" : "bamboo4");
  }
  // The blue binding on the short ends, frayed through at the bottom right.
  p.rect(x0, y0, 2, h, "blue3").vline(x0, y0, h, "blue4");
  p.rect(x0 + w - 2, y0, 2, h - 4, "blue2");
  art(p, x0 + w - 2, y0 + h - 4, ["b.", ".b", "s.", ".s"], { b: "blue2", s: "bamboo3" });
  // Hairs and a sun-pale patch where the cats lie, and the bottle cap.
  p.over(() => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++)
      if (Math.hypot((i - w * 0.45) / (w * 0.22), (j - h * 0.5) / (h * 0.32)) < 1 && (i + j) % 2 === 0) p.px(x0 + i, y0 + j, "bamboo5");
    for (let k = 0; k < 9; k++) {
      const hx = x0 + 6 + Math.floor(hash(k, 1, seedOf(prop.id)) * (w - 12)), hy = y0 + 3 + Math.floor(hash(k, 2, seedOf(prop.id)) * (h - 6));
      p.line(hx, hy, hx + 1, hy + (k % 2), k % 3 ? "grey2" : "orange2");
    }
  });
  art(p, x0 + w - 12, y0 + 4, [".ss.", "sSSs", ".ss."], { s: "steel3", S: "steel5" });
  // A thin dark edge on the bottom and right, as the mat's thickness.
  p.outline("bamboo1", { sides: ["top", "left"] });
};

/** The coir mat inside the moon-gate entrance: a dark border with a lattice of interlocked squares, worn pale down the middle. */
const drawEntryMat: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, D = f.depth, seed = seedOf(prop.id);
  const x0 = 2, y0 = G - D + 3, w = W - 4, h = D - 4;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const border = i < 3 || j < 3 || i >= w - 3 || j >= h - 3;
    const lattice = !border && ((i - 3) % 8 === 0 || (j - 3) % 6 === 0) && i > 5 && i < w - 6 && j > 4 && j < h - 5;
    const worn = Math.abs(i - w / 2) < w * 0.14 && !border;
    let c: Color = border ? "brown2" : lattice ? "oak2" : hash(i, j, seed) < 0.3 ? "oak3" : "oak4";
    if (worn && !lattice) c = hash(i, j, seed + 1) < 0.4 ? "oak4" : "oak5";
    p.px(x0 + i, y0 + j, c);
  }
  p.outline("brown1", { sides: ["top", "left"] });
};

/**
 * The black cat's resting mat in the shade of the south house: a quilted cushion from somebody's old
 * sofa, faded indigo with cream stitching, pressed into a round dent and furred with black hairs.
 */
const drawRestingMat: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, D = f.depth, seed = seedOf(prop.id);
  const x0 = 2, y0 = G - D + 3, w = W - 4, h = D - 7;
  p.rect(x0, y0 + 3, w, h, "blue2");
  p.rect(x0, y0, w, h, "blue3").hline(x0, y0, w, "blue4").vline(x0, y0, h, "blue4");
  p.over(() => {
    for (let i = 6; i < w; i += 8) for (let j = 1; j < h - 1; j += 2) p.px(x0 + i, y0 + j, "cream3");
    for (let j = 5; j < h; j += 7) for (let i = 1; i < w - 1; i += 2) p.px(x0 + i, y0 + j, "cream3");
    p.ellipse(x0 + w / 2, y0 + h / 2, w * 0.3, h * 0.34, "blue2");
    p.ellipse(x0 + w / 2 - 1, y0 + h / 2 - 1, w * 0.18, h * 0.2, "blue1");
    for (let k = 0; k < 10; k++) {
      const hx = x0 + w / 2 - 8 + Math.floor(hash(k, 1, seed) * 16), hy = y0 + h / 2 - 4 + Math.floor(hash(k, 2, seed) * 8);
      p.px(hx, hy, "hair1");
    }
  });
  autoOutline(p, { map: { blue: "blue1" } });
};

/** The cats' bowl by the bicycle shed: white enamel with a blue rim, chipped, rice and a fish tail in it. */
const drawBowl: Draw = (p, f) => {
  const G = f.gy, W = f.w, cx = W / 2, cy = G - 5;
  p.ellipse(cx, cy + 1.5, W / 2 - 1, 4, "steel4");
  p.ellipse(cx, cy, W / 2 - 1, 4, "blue3");
  p.ellipse(cx, cy, W / 2 - 2, 3, "white");
  p.ellipse(cx, cy + 0.5, W / 2 - 3.5, 2, "cream4");
  art(p, Math.round(cx) - 2, Math.round(cy) - 1, ["sS.", ".ss"], { s: "steel3", S: "steel5" });
  p.px(2, Math.round(cy), "ink");
  autoOutline(p, { map: { blue: "blue1", steel: "steel1", white: "blue1", cream: "blue1" } });
};

// ── leaves, prints, damp, gutter ───────────────────────────────────────────────

/** The nearest courtyard tree on the same map, whose leaves these are. */
function nearestTree(prop: MapProp): MapProp | undefined {
  let best: MapProp | undefined, d = Infinity;
  for (const t of mapProps(prop.map, "courtyard-tree")) {
    const dd = Math.hypot(t.position.x - prop.position.x, t.position.y - prop.position.y);
    if (dd < d) { d = dd; best = t; }
  }
  return best;
}

const LEAF_SHAPES = [[".l.", "lmd", ".d."], ["ll.", "lmd", ".dd"], [".ll", "lmm", "dd."], ["l.", "md"]];

/** Leaves blown into a drift: the nearest tree's, a few curled darker, a stem or two, thickest in the middle. */
const drawLeaves: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, D = f.depth, seed = seedOf(prop.id);
  const tree = nearestTree(prop);
  const [d, m, l] = tree ? litterOf(tree) : (["oak2", "oak3", "bamboo4"] as const);
  const n = 10 + prop.variant * 3;
  for (let k = 0; k < n; k++) {
    // Gaussian-ish: two hashes averaged, so the drift is thick in the middle and thin at its ends.
    const u = (hash(k, 1, seed) + hash(k, 2, seed)) / 2, v = (hash(k, 3, seed) + hash(k, 4, seed)) / 2;
    const x = Math.round(2 + u * (W - 6)), y = Math.round(G - D + 2 + v * (D - 5));
    const curled = hash(k, 5, seed) < 0.25;
    art(p, x, y, LEAF_SHAPES[Math.floor(hash(k, 6, seed) * LEAF_SHAPES.length)], curled ? { l: m, m: d, d: "wood1" } : { l, m, d });
  }
};

/** A cat's damp prints crossing the yard from the water basin, walking east: two prints, staggered by variant. */
const drawPaws: Draw = (p, f, prop) => {
  const G = f.gy, D = f.depth;
  // A cat's print pointing east: the pad, then four toes in an arc ahead of it.
  const print = ["..o.", "oo.o", "oo.o", "..o."];
  const spotsAt = prop.variant % 2 ? [[1, 0], [8, 4]] : [[2, 4], [9, 0]];
  p.faded(0.38, () => { for (const [x, y] of spotsAt) art(p, x, G - D + 1 + y, print, { o: "stone1" }); });
};

/** Paving darkened by spilled washing water, drying from its edges, a puddle or two catching the sky. */
const drawDamp: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, D = f.depth, seed = seedOf(prop.id);
  const cx = W / 2, cy = G - D / 2;
  for (let y = G - D + 1; y <= G; y++) for (let x = 0; x < W; x++) {
    const b = blob(x, y, cx, cy, W / 2 - 2, D / 2 - 2, seed, 0.4);
    if (b > 1) continue;
    p.faded(b < 0.7 ? 0.24 : 0.13, () => p.px(x, y, "blue1"));
  }
  for (let k = 0; k < 2; k++) {
    const px = cx + (hash(k, 1, seed) - 0.5) * W * 0.4, py = cy + (hash(k, 2, seed) - 0.5) * D * 0.3, prx = 5 + hash(k, 3, seed) * 5, pry = 2 + hash(k, 4, seed) * 2;
    for (let y = Math.floor(py - pry); y <= py + pry; y++) for (let x = Math.floor(px - prx); x <= px + prx; x++)
      if (blob(x, y, px, py, prx, pry, seed + k, 0.3) <= 1) p.faded(0.32, () => p.px(x, y, "blue4"));
    p.faded(0.6, () => p.hline(Math.round(px - prx / 2), Math.round(py - pry / 2), Math.max(2, Math.round(prx / 2)), "blue6"));
  }
};

/** The stone runoff gutter from the washing corner: a granite channel with a groove, a thread of water and moss in its joints. */
const drawRunoff: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, D = f.depth, seed = seedOf(prop.id);
  const y0 = G - D + 1;
  p.rect(0, y0, W, D, "stone3");
  p.vline(0, y0, D, "stone4").vline(W - 1, y0, D, "stone2");
  p.rect(1, y0, W - 2, D, "stone2");
  p.vline(2, y0, D, "stone1");
  for (let y = y0; y < G; y++) if (hash(1, Math.floor(y / 5), seed) < 0.75) p.faded(0.6, () => p.px(Math.min(W - 2, 3), y, "blue3"));
  for (let y = y0 + 10; y < G; y += 16) { p.hline(0, y, W, "stone1"); p.px(1, y + 1, "leaf2"); p.px(W - 2, y - 1, "leaf3"); }
};

export default defineSprites(Object.fromEntries([
  ...flat("well-cover", 10, drawWell),
  ...flat("woven-mat", 0, drawWovenMat),
  ...flat("entry-mat", 0, drawEntryMat),
  ...flat("resting-mat", 2, drawRestingMat),
  ...flat("bowl", 2, drawBowl),
  ...flat("fallen-leaves", 0, drawLeaves),
  ...flat("pawprints", 0, drawPaws),
  ...flat("damp-paving", 0, drawDamp),
  ...flat("runoff-channel", 0, drawRunoff),
]));
