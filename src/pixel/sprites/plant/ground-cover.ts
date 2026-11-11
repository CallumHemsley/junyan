/**
 * What lies on the ground in the park and by the river, one sprite per prop as `<map>/<id>`:
 * `woodland-floor` (floor layer: leaf litter under each grove, moss, mushrooms, a fallen branch),
 * `harvest-floor` (floor layer: the orchard's worked soil with straw and windfalls), `seedling-bed`
 * (a raised bed of winter greens) and `rock` (scholar's rocks in the park, boulders on the bank).
 * Floor patches fade out at a ragged edge so they never show a box.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, outdoorMap, propSpriteId, type MapProp } from "../../world/maps.ts";
import { groundMaterials, type Material } from "../../town/ground-grid.ts";
import { art, autoOutline, noise2, stamp } from "./_helpers.ts";

const idSeed = (id: string) => { let s = 0; for (const ch of id) s = (s * 31 + ch.charCodeAt(0)) | 0; return (s >>> 0) % 100000; };

/** Fallen leaf shapes (digits are tones, 1 dark) and a dropped seed ball. */
const LEAVES: readonly (readonly string[])[] = [[".3.3", "3332", ".221"], ["33.", "322", ".21"], [".33.", "3322", ".11."], ["3.3", ".32", "..1"]];
/** Litter colour sets, three tones each: camphor green-brown, plane ochre, ginkgo gold, maple rose. */
const LITTER: readonly (readonly Color[])[] = [
  ["oak1", "oak3", "bamboo4"], ["bamboo1", "bamboo3", "bamboo4"], ["gold1", "gold3", "gold4"], ["rose1", "rose3", "orange2"], ["wood2", "oak2", "oak3"], ["leaf1", "leaf2", "bamboo3"],
];

const grids = new Map<string, Material[][]>();
/**
 * What the ground is under a pixel of a floor patch: litter and moss stay off water and thin out on
 * paths, so a grove's floor never spills into the pond.
 */
function groundAt(prop: MapProp, x: number, y: number): Material {
  let grid = grids.get(prop.map);
  if (!grid) grids.set(prop.map, grid = groundMaterials(outdoorMap(prop.map)));
  const tx = Math.floor(prop.position.x + x / 32), ty = Math.floor(prop.position.y + y / 32);
  return grid[ty]?.[tx] ?? "grass";
}
/** How much litter a ground takes: none on water, a little on paving and stone. */
const settle = (m: Material) => (m === "water" ? 0 : m === "grass" ? 1 : 0.25);

/** 0 outside the patch's ragged edge, rising to 1 in its heart. */
function patchDensity(x: number, y: number, w: number, h: number, seed: number) {
  const u = (x + 0.5 - w / 2) / (w / 2), v = (y + 0.5 - h / 2) / (h / 2);
  const d = Math.hypot(u, v) + (noise2(x, y, seed, 18, 14) - 0.5) * 0.7;
  return Math.max(0, Math.min(1, (1 - d) * 2.2));
}

/**
 * Under a grove: drifts of fallen leaves in the grove's colours, thick in the middle and thinning to
 * single leaves at the edge, moss in damp hollows, a ring of mushrooms, twigs, and in some groves a
 * fallen branch going soft with moss.
 */
function drawWoodlandFloor(p: Px, prop: MapProp, w: number, h: number) {
  const seed = idSeed(prop.id);
  // Moss cushions first, in the hollows the noise picks.
  for (let y = 0; y < h; y += 2) for (let x = (y >> 1) % 2; x < w; x += 2) {
    const dens = patchDensity(x, y, w, h, seed);
    if (dens <= 0 || noise2(x, y, seed + 7, 14, 10) < 0.66 + (1 - dens) * 0.2 || groundAt(prop, x, y) !== "grass") continue;
    art(p, x, y, ["Mm", "mg"], { M: hash(x, y, seed) < 0.3 ? "leaf4" : "leaf3", m: "leaf2", g: "jade2" });
  }
  // Litter: leaves stamped where the drift is thick enough.
  const sets = [LITTER[prop.variant % LITTER.length], LITTER[(prop.variant + 2) % LITTER.length], LITTER[4]];
  const n = Math.round((w * h) / 16);
  for (let k = 0; k < n; k++) {
    const x = Math.floor(hash(k, 1, seed) * w), y = Math.floor(hash(k, 2, seed) * h);
    // Leaves gather in drifts (against roots, in hollows), not an even sprinkle.
    const drift = Math.max(0, (noise2(x, y, seed + 11, 26, 18) - 0.42) * 2.4);
    if (hash(k, 3, seed) > patchDensity(x, y, w, h, seed) * Math.min(1, drift + 0.08) * settle(groundAt(prop, x + 2, y + 1))) continue;
    const ramp = sets[Math.floor(hash(k, 4, seed) * 2.6)] ?? sets[2];
    stamp(p, x, y, LEAVES[k % LEAVES.length], ramp, { flipX: hash(k, 5, seed) < 0.5 });
  }
  // Twigs.
  for (let k = 0; k < Math.round(w / 30); k++) {
    const x = Math.round(w * (0.2 + hash(k, 6, seed) * 0.6)), y = Math.round(h * (0.2 + hash(k, 7, seed) * 0.6));
    if (groundAt(prop, x, y) !== "grass") continue;
    p.line(x, y, x + 5 + Math.round(hash(k, 8, seed) * 5), y + Math.round((hash(k, 9, seed) - 0.5) * 4), "wood2");
  }
  // A fallen branch in about half the groves, mossy along its top.
  const bx = Math.round(w * 0.25), by = Math.round(h * (0.55 + hash(seed, 2, 3) * 0.2)), blen = Math.round(w * 0.3);
  if (hash(seed, 1, 3) < 0.5 && groundAt(prop, bx, by) === "grass" && groundAt(prop, bx + blen, by) === "grass") {
    const x0 = bx, y0 = by, len = blen;
    for (let i = 0; i < len; i++) {
      const y = y0 + Math.round(i * 0.15);
      p.px(x0 + i, y - 1, i % 5 < 3 ? "leaf2" : "wood3").px(x0 + i, y, "wood2").px(x0 + i, y + 1, "wood1");
    }
    art(p, x0 + len - 2, y0 + Math.round(len * 0.15) - 1, ["cc", "Cc", "cc"], { c: "oak3", C: "oak4" });
  }
  // A fairy ring of mushrooms, brown caps lit on top, pale stems.
  const mx = Math.round(w * (0.3 + hash(seed, 4, 3) * 0.4)), my = Math.round(h * (0.3 + hash(seed, 5, 3) * 0.4));
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + hash(k, 10, seed);
    if (groundAt(prop, Math.round(mx + Math.cos(a) * 7), Math.round(my + Math.sin(a) * 4)) !== "grass") continue;
    art(p, Math.round(mx + Math.cos(a) * 7), Math.round(my + Math.sin(a) * 4), [".bB.", "bbBb", ".ss."], k === 2 ? { b: "cream3", B: "cream4", s: "cream5" } : { b: "brown2", B: "brown3", s: "cream4" });
  }
  autoOutline(p, { map: { oak: "wood1", bamboo: "wood1", gold: "wood1", rose: "rose1", orange: "brown1", wood: "wood1", leaf: "leaf1", jade: "jade1", brown: "wood1", cream: "wood1" }, sides: ["bottom", "right"] });
}

/** The orchard's worked soil: dug rows, straw mulch, windfall persimmons, a few leaves. */
function drawHarvestFloor(p: Px, prop: MapProp, w: number, h: number) {
  const seed = idSeed(prop.id);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dens = patchDensity(x, y, w, h, seed);
    if (dens <= 0.15 || (dens < 0.4 && hash(x >> 1, y >> 1, seed) > dens * 2.2) || groundAt(prop, x, y) !== "grass") continue;
    // Grass grows back in the corners nobody digs.
    if (noise2(x, y, seed + 5, 16, 12) > 0.72) continue;
    // Furrows eight px apart: a lit ridge, soil, a shaded trough.
    const row = (y + Math.round(noise2(x, 0, seed, 40, 1) * 4)) % 8;
    p.px(x, y, row === 0 ? "brown3" : row === 6 ? "brown1" : "brown2");
  }
  p.over(() => {
    // Straw laid along the rows.
    for (let k = 0; k < Math.round((w * h) / 140); k++) {
      const x = Math.floor(hash(k, 1, seed) * w), y = Math.floor(hash(k, 2, seed) * h);
      p.line(x, y, x + 3 + Math.round(hash(k, 3, seed) * 3), y + (hash(k, 4, seed) < 0.5 ? 0 : 1), hash(k, 5, seed) < 0.5 ? "bamboo4" : "bamboo3");
    }
    for (let k = 0; k < Math.round((w * h) / 400); k++) {
      const x = Math.floor(hash(k, 6, seed) * w), y = Math.floor(hash(k, 7, seed) * h);
      if (k % 3) stamp(p, x, y, LEAVES[k % LEAVES.length], LITTER[k % 2 ? 1 : 4]);
      else art(p, x, y, [".k.", "oOo", "ooq"], { k: "leaf1", o: "orange2", O: "orange3", q: "orange1" });
    }
  });
}

/**
 * A raised bed of winter greens behind a plank edge: rows of bok choy and seedlings, a few gaps
 * where the snails got in, a split bamboo cane and a blue enamel watering can left at the end.
 */
function drawSeedlingBed(p: Px, prop: MapProp, w: number, h: number) {
  const seed = idSeed(prop.id);
  const front = 7;
  p.rect(0, 0, w, h - front, "wood3");
  p.rect(3, 3, w - 6, h - front - 4, "brown2").hline(3, 3, w - 6, "wood1").vline(3, 3, h - front - 4, "brown1");
  for (let y = 6; y < h - front - 2; y += 3) for (let x = 5; x < w - 5; x++) if ((x + y) % 3 === 0) p.px(x, y, "brown3");
  // Plank edge: the front face, grain and nail heads.
  p.rect(0, h - front, w, front, "wood2").hline(0, h - front, w, "wood4").hline(0, h - 1, w, "wood1");
  for (let x = 0; x < w; x += 24) { p.vline(x, h - front, front, "wood1"); p.px(x + 2, h - front + 2, "steel3"); }
  for (let x = 4; x < w; x += 7) p.hline(x, h - front + 3 + (x % 2), 4, "wood3");
  p.hline(0, 0, w, "wood4").vline(0, 0, h - front, "wood4").vline(w - 1, 0, h - front, "wood1");
  // Rows of greens.
  for (let row = 0, y = 7; y < h - front - 6; row++, y += 9) for (let x = 8; x < w - 10; x += 9) {
    if (hash(x, y, seed) < 0.12) continue;
    if (row % 2) art(p, x, y, ["g.g", ".G."], { g: "leaf4", G: "leaf3" });
    else art(p, x - 1, y - 2, [".HJ.", "HjJh", "jJJh", ".ww."], { H: "leaf4", h: "leaf3", J: "jade5", j: "jade4", w: "cream5" });
  }
  // The can.
  art(p, w - 14, h - front - 10, ["..bbbb..", ".bBBBBb.", "sbBBBBbS", ".bbbbbb.", ".bkbbbb.", "..bbbb.."], { b: "blue2", B: "blue3", s: "blue3", S: "steel3", k: "ink2" });
  autoOutline(p, { map: { wood: "wood1", blue: "blue1", leaf: "leaf1", jade: "jade1" } });
}

// ── rocks ──────────────────────────────────────────────────────────────────────

type RockKind = "taihu" | "flat" | "boulder";
/**
 * A rock: a lumpy body from overlapping ovals, lit from the upper left, with cracks and lichen.
 * Taihu stone (太湖石, the scholar's rock) is tall, blue-grey and holed right through; the reading
 * stone is flat-topped and worn smooth where people sit; river boulders are rounded, mossy on top
 * and stained dark where the water rises.
 */
function drawRock(p: Px, prop: MapProp, kind: RockKind, w: number, h: number) {
  const seed = idSeed(prop.id);
  const tones: readonly Color[] = kind === "taihu" ? ["steel1", "steel2", "steel3", "steel4", "steel5"] : ["stone1", "stone2", "stone3", "stone4", "stone5"];
  const lobes: { x: number; y: number; rx: number; ry: number }[] = [];
  // Taihu: a tall, twisting, top-heavy mass of uneven lobes, narrow at the waist.
  if (kind === "taihu") for (let k = 0; k < 14; k++) {
    const t = hash(k, 3, seed);
    const waist = 1 - 0.4 * Math.sin(t * Math.PI);
    const rx = w * (0.1 + hash(k, 2, seed) * 0.14) * (1.25 - waist * 0.4 + t * 0.25);
    lobes.push({ x: w * (0.5 + (hash(k, 1, seed) - 0.5) * 0.42 * waist + Math.sin(t * 5 + seed) * 0.06), y: h - 8 - t * (h - 20), rx, ry: rx * (0.6 + hash(k, 4, seed) * 0.4) });
  }
  else if (kind === "flat") lobes.push({ x: w / 2, y: h - 9, rx: w / 2 - 2, ry: 7 }, { x: w * 0.4, y: h - 12, rx: w * 0.35, ry: 6 });
  else for (let k = 0; k < 3; k++) lobes.push({ x: w * (0.35 + k * 0.15), y: h - 9 - (k === 1 ? 4 : 0), rx: w * (0.25 + hash(k, 3, seed) * 0.1), ry: h * 0.28 });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let best = Infinity, lobe = lobes[0];
    for (const l of lobes) { const d = Math.hypot((x + 0.5 - l.x) / l.rx, (y + 0.5 - l.y) / l.ry); if (d < best) { best = d; lobe = l; } }
    if (best > 1) continue;
    const nx = (x + 0.5 - lobe.x) / lobe.rx, ny = (y + 0.5 - lobe.y) / lobe.ry;
    const light = -0.6 * nx - 0.8 * ny + 0.3 + (noise2(x, y, seed, 5, 4) - 0.5) * 0.5;
    p.px(x, y, tones[Math.max(0, Math.min(4, Math.round(2 + light * 1.6)))]);
  }
  p.over(() => {
    if (kind === "taihu") {
      // The holes, dark through, each with a lit lower lip.
      for (let k = 0; k < 7; k++) {
        const cx = Math.round(w * (0.3 + hash(k, 5, seed) * 0.4)), cy = Math.round(8 + hash(k, 6, seed) * (h - 22));
        const rx = 1.5 + hash(k, 7, seed) * 3, ry = 1.5 + hash(k, 8, seed) * 2.5;
        if (!p.solid(cx - Math.ceil(rx) - 1, cy) || !p.solid(cx + Math.ceil(rx) + 1, cy)) continue;
        p.ellipse(cx, cy + 1, rx + 1, ry + 1, "steel2");
        p.ellipse(cx, cy, rx, ry, "ink");
        p.ellipse(cx + 0.5, cy - 0.5, Math.max(0.8, rx - 1.2), Math.max(0.8, ry - 1.2), "steel1");
        p.hline(cx - Math.floor(rx / 2), Math.round(cy + ry + 1), Math.max(1, Math.round(rx)), "steel5");
      }
    } else {
      // Moss on the top, cracks, and the reading stone's polished seat.
      for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (p.solid(x, y) && !p.solid(x, y - 2) && noise2(x, y, seed + 3, 4, 3) > 0.55) p.px(x, y, hash(x, y, seed) < 0.4 ? "leaf3" : "leaf2");
      if (kind === "flat") p.ellipse(w * 0.45, h - 13, w * 0.2, 2.5, "stone5");
      if (kind === "boulder") for (let x = 0; x < w; x++) for (let y = h - 6; y < h; y++) if (p.get(x, y) && hash(x, y, seed) < 0.7) p.px(x, y, y > h - 3 ? "jade1" : "stone1");
    }
    for (let k = 0; k < 2; k++) {
      const x = Math.round(w * (0.3 + hash(k, 9, seed) * 0.4)), y = Math.round(h * (0.4 + hash(k, 10, seed) * 0.3));
      p.line(x, y, x + 2, y + 4, tones[0]).line(x + 2, y + 4, x + 1, y + 7, tones[0]);
    }
    // Lichen.
    for (let k = 0; k < 5; k++) art(p, Math.round(hash(k, 11, seed) * w), Math.round(hash(k, 12, seed) * h), ["lL", "l."], { l: "cream3", L: "jade5" });
  });
  autoOutline(p, { map: { steel: "steel1", stone: "stone1", leaf: "leaf1", jade: "jade1", cream: "stone1", ink: "ink" } });
}

function floorDef(prop: MapProp, draw: (p: Px, prop: MapProp, w: number, h: number) => void): SpriteDef {
  const { w, h } = footprintPx(prop);
  return { w, h, anchor: [Math.round(w / 2), h - 1], layer: "floor", draw: (p) => draw(p, prop, w, h) };
}

function rockDef(prop: MapProp): SpriteDef {
  const { w, h: fh } = footprintPx(prop);
  const kind: RockKind = /ridge/.test(prop.id) ? "taihu" : /reading/.test(prop.id) ? "flat" : "boulder";
  // A taihu stone stands taller than its footprint; the others sit within it.
  const h = kind === "taihu" ? fh + 48 : fh;
  return { w, h, anchor: [Math.round(w / 2), h - 1], draw: (p) => drawRock(p, prop, kind, w, h) };
}

export default defineSprites(Object.fromEntries([
  ...mapProps("all", "woodland-floor").map((prop) => [propSpriteId(prop.map, prop.id), floorDef(prop, drawWoodlandFloor)]),
  ...mapProps("all", "harvest-floor").map((prop) => [propSpriteId(prop.map, prop.id), floorDef(prop, drawHarvestFloor)]),
  ...mapProps("all", "seedling-bed").map((prop) => {
    const { w, h } = footprintPx(prop);
    return [propSpriteId(prop.map, prop.id), { w, h, anchor: [Math.round(w / 2), h - 1], draw: (p: Px) => drawSeedlingBed(p, prop, w, h) } satisfies SpriteDef];
  }),
  ...mapProps("all", "rock").map((prop) => [propSpriteId(prop.map, prop.id), rockDef(prop)]),
]));
