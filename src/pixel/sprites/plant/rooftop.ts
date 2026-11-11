/**
 * The rooftop's tree beds (`tree-bed`), one sprite per prop (`<map>/<id>`), anchored on the footprint's
 * bottom-centre. Like the street and courtyard trees, a crown may spread past its bed; the bed itself
 * fills the footprint. Autumn on the roof:
 *
 * - `rooftop.orchard`: the brick orchard bed, a satsuma in fruit, a fig and a jujube (枣) with its last
 *   red-brown dates, marigolds underneath;
 * - `rooftop.terrace-tree`: a Japanese maple in a timber box by the terrace, turned amber and orange;
 * - `rooftop.central-shrub-island`: the stone-edged island of clipped box balls, a camellia in flower
 *   and a little black pine.
 *
 * A tree bed on another map falls back on its variant: 0 the maple, 1 the orchard, 2 the shrub island.
 */
import { Px, defineSprites, hash, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { brickBed, rows, type Frame } from "../life/_beds.ts";
import { seedOf, townFoot, townFrame } from "../life/_helpers.ts";
import {
  CAMPHOR_CLUSTERS, FIG_LEAVES, PLANE_CLUSTERS, art, autoOutline, camphorBark, canopy, crownClumps, figBark, limb, mound, sticker,
  type Foliage,
} from "./_helpers.ts";

const OUTLINE = { leaf: "leaf1", jade: "jade1", orange: "brown1", gold: "wood1", bamboo: "wood1", wood: "wood1", oak: "wood1", stone: "stone1", rose: "rose1", red: "rose1", pink: "plum1", cream: "stone1", steel: "steel1", brown: "wood1" } as const;

const CITRUS: Foliage = { ramp: ["jade1", "jade1", "jade2", "leaf2", "jade3", "leaf3", "leaf4"], leaves: CAMPHOR_CLUSTERS, step: [4, 3] };
const FIG: Foliage = { ramp: ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4", "leaf4", "leaf5"], leaves: FIG_LEAVES, step: [6, 4], outlineLeaves: true, odd: { ramp: ["bamboo2", "bamboo3", "bamboo3", "bamboo4", "gold4", "gold5"], chance: 0.15 } };
const JUJUBE: Foliage = { ramp: ["leaf1", "leaf1", "leaf2", "leaf3", "leaf3", "leaf4", "gold4"], leaves: [["3.3", "323", ".2."], ["33", "22"]], step: [3, 3], odd: { ramp: ["bamboo2", "bamboo3", "gold3", "gold3", "gold4", "gold5"], chance: 0.3 } };
const MAPLE: Foliage = {
  ramp: ["rose1", "orange1", "orange1", "orange2", "orange3", "gold3", "gold4"], leaves: [["3.3", "333", ".2."], [".3.", "323", "2.2"]], step: [3, 3],
  odd: { ramp: ["rose2", "rose3", "rose3", "rose4", "red5", "orange3"], chance: 0.18 },
};

/** A small tree: a trunk from (x, base), a crown of `r` px, its fruit drawn by `fruit`. */
function smallTree(p: Px, x: number, base: number, r: number, trunk: number, foliage: Foliage, seed: number, bark: "smooth" | "rough", fruit?: (cx: number, cy: number) => void): void {
  const cy = base - trunk - r * 0.55;
  const b = bark === "smooth" ? figBark(seed) : camphorBark(seed);
  canopy(p, crownClumps({ x, y: cy, rx: r * 0.66, ry: r * 0.5 }, r * 0.4, seed + 40).map((c) => ({ ...c, shift: -3, sway: 0, group: 99 })), foliage, { x, y: cy, rx: r, ry: r * 0.75 }, { seed: seed + 40 });
  for (const side of [-1, 1]) limb(p, x, base - trunk + 3, x + side * Math.round(r * 0.45), Math.round(cy), 4, 2, b, { bend: side * -2, seed: seed + side + 2 });
  limb(p, x, base, x, base - trunk, 6, 4, b, { seed, flare: 3 });
  canopy(p, crownClumps({ x, y: cy, rx: r, ry: r * 0.75 }, Math.max(6, r * 0.42), seed), foliage, { x, y: cy, rx: r, ry: r * 0.75 }, { seed: seed + 3 });
  fruit?.(x, cy);
}

/** Fruit spots in the lower front of a crown. */
function spots(cx: number, cy: number, r: number, n: number, seed: number): [number, number][] {
  return Array.from({ length: n }, (_, k) => {
    const a = Math.PI * (0.05 + hash(k, 1, seed) * 0.9), d = 0.3 + hash(k, 2, seed) * 0.6;
    return [Math.round(cx + Math.cos(a) * r * d * (hash(k, 3, seed) < 0.5 ? -1 : 1)), Math.round(cy - r * 0.2 + Math.sin(a) * r * 0.6 * d)];
  });
}

// ── the orchard ────────────────────────────────────────────────────────────────

/**
 * The orchard bed the residents' committee paid for in 2019: a long brick bed with a satsuma (heavy
 * with fruit, its lower branch propped), a fig losing its leaves, and a jujube with a few last dates
 * the birds have not had; marigolds and a row of strawberry runners under them.
 */
function orchard(p: Px, f: Frame, seed: number): void {
  const soil = brickBed(p, f, seed);
  autoOutline(p, { map: { rose: "rose1", steel: "rose1", stone: "rose1", leaf: "rose1", cream: "rose1" } });
  // Straw mulch rings round the trunks, marigolds and strawberry runners along the front, stepping stones between.
  const at: [number, number][] = [[Math.round(f.w * 0.25), soil.y + Math.round(soil.h * 0.42)], [Math.round(f.w * 0.72), soil.y + Math.round(soil.h * 0.36)], [Math.round(f.w * 0.5), soil.y + Math.round(soil.h * 0.72)]];
  for (const [x, y] of at) { p.ellipse(x, y, 13, 5, "bamboo3"); p.over(() => p.speckle(x - 13, y - 5, 26, 10, "bamboo4", 0.3, seed + x)); }
  for (let k = 0; k < 5; k++) { const sx = soil.x + 10 + k * Math.round((soil.w - 30) / 4), sy = soil.y + soil.h - 8 - (k % 2) * 3; p.ellipse(sx, sy, 5, 2.5, "stone3"); p.ellipse(sx - 0.5, sy - 0.5, 4, 1.8, "stone4"); }
  rows(p, { ...soil, y: soil.y + soil.h - 26, h: 22 }, [
    { plant: (q, x, b, k) => sticker(q, x - 3, b - 5, 7, 5, (s) => { mound(s, 3.5, 3, 3.5, 2.2, ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4"], seed + k); art(s, 2, 0, [".y.", "yOy"], { y: "gold3", O: "orange2" }); }), dx: 12 },
    { plant: (q, x, b, k) => sticker(q, x - 3, b - 4, 7, 4, (s) => { mound(s, 3.5, 2.5, 3.5, 1.8, ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4"], seed + k * 3); if (k % 3 === 0) s.px(3, 2, "red3"); }), dx: 10 },
  ]);
  const crowns = [34, 30, 32];
  const tree = new Px(p.w, p.h);
  // Back left the satsuma, back right the jujube, front the fig: drawn back to front.
  smallTree(tree, at[1][0], at[1][1], crowns[1], 34, JUJUBE, seed + 3, "rough", (cx, cy) => {
    for (const [x, y] of spots(cx, cy, crowns[1], 10, seed + 7)) art(tree, x, y, ["rR", "rr"], hash(x, y, seed) < 0.4 ? { r: "leaf3", R: "leaf4" } : { r: "rose2", R: "rose3" });
  });
  smallTree(tree, at[0][0], at[0][1], crowns[0], 28, CITRUS, seed + 1, "smooth", (cx, cy) => {
    for (const [x, y] of spots(cx, cy, crowns[0], 16, seed)) art(tree, x, y, [".oO", "oOo", "do."], { o: "orange2", O: "orange3", d: "orange1" });
  });
  tree.line(at[0][0] + 20, at[0][1], at[0][0] + 22, at[0][1] - 30, "bamboo3");
  smallTree(tree, at[2][0], at[2][1], crowns[2], 24, FIG, seed + 2, "smooth", (cx, cy) => {
    for (const [x, y] of spots(cx, cy, crowns[2], 7, seed + 5)) art(tree, x, y, [".s.", "fFf", ".f."], { s: "leaf2", F: "plum4", f: "plum2" });
  });
  autoOutline(tree, { map: OUTLINE });
  p.blit(tree, 0, 0);
}

// ── the terrace maple ──────────────────────────────────────────────────────────

/** The Japanese maple (鸡爪槭) by the terrace bench, in a box of grey-stained timber: amber turning to orange, a few leaves already on the gravel. */
function maple(p: Px, f: Frame, seed: number, ox: number): void {
  const G = f.gy, bw = f.depth, x0 = ox + Math.round((f.w - ox * 2 - bw) / 2);
  const top = G - bw + 6, front = G - 14;
  // A timber box stained grey-green, its top rail lit, filled with pale gravel and a cushion of moss.
  p.rect(x0, top, bw, front - top, "steel3").hline(x0, top, bw, "steel4").vline(x0, top, front - top, "steel4");
  p.rect(x0 + 3, top + 3, bw - 6, front - top - 5, "stone3");
  p.over(() => {
    for (let y = top + 3; y < front - 2; y++) for (let x = x0 + 3; x < x0 + bw - 3; x++) { const h = hash(x, y, seed); if (h < 0.35) p.px(x, y, h < 0.12 ? "stone2" : "stone4"); else if (h > 0.9) p.px(x, y, "stone5"); }
    p.ellipse(x0 + bw - 14, front - 8, 7, 3, "leaf2"); p.ellipse(x0 + bw - 15, front - 9, 5, 2, "leaf3");
  });
  for (let j = 0; j < 14; j++) p.hline(x0, front + j, bw, j % 5 === 4 ? "steel1" : j % 5 === 0 ? "steel3" : "steel2");
  p.vline(x0 + bw - 1, front, 14, "steel1");
  for (const [dx, dy] of [[8, 16], [20, 26], [40, 22], [30, 30]] as const) art(p, x0 + dx, top + dy, ["o.o", ".O.", "o.o"], { o: "orange2", O: "orange3" });
  autoOutline(p, { map: OUTLINE });
  const tree = new Px(p.w, p.h);
  const cx = Math.round(f.w / 2), base = Math.round((top + front) / 2) - 2;
  smallTree(tree, cx, base, 30, 26, MAPLE, seed, "smooth");
  autoOutline(tree, { map: { ...OUTLINE, orange: "rose1", gold: "orange1" } });
  p.blit(tree, 0, 0);
}

// ── the shrub island ───────────────────────────────────────────────────────────

/** The island bed in the middle of the roof: a kerb of granite setts round clipped box balls, a pink camellia in flower and a small black pine. */
function island(p: Px, f: Frame, seed: number): void {
  const G = f.gy, W = f.w, D = f.depth;
  const cx = W / 2, cy = G - D / 2 - 6, rx = W / 2 - 1, ry = D / 2 - 6;
  p.ellipse(cx, cy + 4, rx, ry, "stone2");
  p.ellipse(cx, cy, rx, ry, "stone4");
  p.ellipse(cx, cy, rx - 3, ry - 3, "brown2");
  p.over(() => p.speckle(Math.round(cx - rx), Math.round(cy - ry), W, D, "brown3", 0.12, seed));
  for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; p.px(Math.round(cx + Math.cos(a) * (rx - 1)), Math.round(cy + Math.sin(a) * (ry - 1)), "stone3"); }
  autoOutline(p, { map: OUTLINE });
  const plants = new Px(p.w, p.h);
  // The pine at the back, the camellia right, box balls in front.
  const px0 = Math.round(cx - rx * 0.35), py0 = Math.round(cy - 2);
  plants.line(px0, py0, px0 - 3, py0 - 16, "wood3").line(px0 + 1, py0, px0 - 2, py0 - 16, "wood2").line(px0 - 2, py0 - 10, px0 + 8, py0 - 18, "wood3");
  for (const [dx, dy, r] of [[-8, -18, 7], [8, -21, 8], [-1, -27, 6]] as const) mound(plants, px0 + dx, py0 + dy, r, r * 0.4, ["leaf1", "leaf1", "jade1", "jade2", "leaf2"], seed + dx, [["33", "21"]], [2, 2]);
  const ccx = Math.round(cx + rx * 0.45);
  mound(plants, ccx, cy - 12, 13, 12, ["jade1", "jade1", "jade2", "leaf2", "leaf3"], seed + 9, [["33", "21"], [".3", "32"]], [3, 2]);
  for (let k = 0; k < 8; k++) art(plants, ccx - 10 + Math.floor(hash(k, 1, seed) * 18), cy - 22 + Math.floor(hash(k, 2, seed) * 18), [".pP.", "pPcp", ".pp."], { p: "pink2", P: "pink3", c: "gold4" });
  for (const [dx, r] of [[-0.6, 8], [-0.1, 9], [0.25, 7]] as const) mound(plants, Math.round(cx + rx * dx), cy + ry * 0.35, r, r * 0.8, ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4"], seed + r, [["32", "21"], ["3.", "22"]], [3, 2]);
  autoOutline(plants, { map: OUTLINE });
  p.blit(plants, 0, 0);
}

// ── emit ───────────────────────────────────────────────────────────────────────

type Kind = "orchard" | "maple" | "island";
const BEDS: Record<string, Kind> = { "rooftop.orchard": "orchard", "rooftop.terrace-tree": "maple", "rooftop.central-shrub-island": "island" };
const BY_VARIANT: readonly Kind[] = ["maple", "orchard", "island"];
const RISE: Record<Kind, number> = { orchard: 12 + 60, maple: 72, island: 36 };

function bedDef(prop: MapProp): SpriteDef {
  const which = BEDS[prop.id] ?? BY_VARIANT[prop.variant % BY_VARIANT.length];
  const base = townFrame(prop, RISE[which]);
  // The maple's crown is wider than its box; the canvas widens round the footprint, the anchor stays on its centre.
  const extra = which === "maple" ? Math.max(0, 70 - base.w) / 2 : 0;
  const f: Frame = { ...base, w: base.w + extra * 2, anchor: [Math.round((base.w + extra * 2) / 2), base.h - 1] as const };
  const seed = seedOf(prop.id);
  return {
    w: f.w, h: f.h, anchor: f.anchor, foot: townFoot(prop),
    ...(which === "island" ? { shadow: { rx: Math.round(base.w / 2) - 2, ry: 6, dy: -8 } } : {}),
    draw: (p) => (which === "orchard" ? orchard(p, f, seed) : which === "maple" ? maple(p, f, seed, extra) : island(p, f, seed)),
  };
}

export default defineSprites(Object.fromEntries(mapProps("all", "tree-bed").map((p) => [propSpriteId(p.map, p.id), bedDef(p)])));
