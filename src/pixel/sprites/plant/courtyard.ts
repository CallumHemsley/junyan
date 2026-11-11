/**
 * The courtyard's six trees, one sprite per `courtyard-tree` prop (`courtyard/<id>`), and under each its
 * dappled floor shade (`courtyard/<id>-shade`, placed at the same anchor; see `shadeSpriteId`).
 *
 * The footprint is the tree's little bed; the crown rises far above it and spreads past it. Crowns sway
 * four frames at 2 fps, the top a pixel each way; trunks never move. It is autumn in the yard: the
 * osmanthus is in flower and scents the whole lane, the persimmon is hung with fruit and losing leaves,
 * the pomegranate has split its last fruit, the loquat is putting out its buff winter flowers.
 *
 * Trees bigger than this map knows (a new `courtyard-tree` on another map) get a species from their id.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import {
  CAMPHOR_CLUSTERS, PLANE_CLUSTERS, art, autoOutline, camphorBark, canopy, crownClumps, figBark, kerbPit, limb,
  massClumps, noise2, planeBark, punchGaps, roots, type Bark, type Ellipse, type Foliage,
} from "./_helpers.ts";

const SWAY = [0, 1, 0, -1];
const OUTLINE = { bamboo: "wood1", cream: "stone1", stone: "stone1", jade: "jade1", leaf: "leaf1", brown: "wood1", wood: "wood1", orange: "brown1", gold: "wood1", rose: "rose1", red: "red1", steel: "steel1", oak: "wood1", white: "stone1", plum: "plum1" } as const;

// ── leaves ─────────────────────────────────────────────────────────────────────

/** Big glossy ovals, longer than wide: magnolia and loquat. */
const BIG_OVALS: readonly (readonly string[])[] = [
  ["..33..", ".3332.", "333222", ".22221", "..211."],
  [".33...", "33322.", ".32221", "..2211"],
  ["...33.", ".33322", "332221", ".2211."],
];
/** Persimmon: broad soft ovals. */
const PERSIMMON_LEAVES: readonly (readonly string[])[] = [[".33.", "3332", "3222", ".21."], ["33..", "3322", ".221"], [".3.", "332", "221", ".1."]];
/** Pomegranate: small narrow leaves in tufts. */
const POME_LEAVES: readonly (readonly string[])[] = [["3.3", "323", ".2."], ["33.", ".32", "..1"], [".3", "32", "2.", "1."]];

type Species = "osmanthus" | "persimmon" | "pomegranate" | "magnolia" | "plane" | "loquat";
type Base = "brick" | "kerb" | "pebble" | "mossy";

type Spec = {
  species: Species;
  /** Crown width and trunk height below the fork, art px; lean of the fork from the base, px. */
  crown: number; ratio: number; trunk: number; lean: number; masses: number;
  foliage: Foliage; bark: (seed: number, top: number, bottom: number) => Bark; trunkW: number; base: Base;
  /** Ramp for the few fallen leaves on its bed and in the yard, three tones dark to light. */
  litter: readonly [Color, Color, Color];
  story: string;
};

const SPECS: Record<Species, Spec> = {
  osmanthus: {
    species: "osmanthus", crown: 100, ratio: 0.74, trunk: 30, lean: -2, masses: 5, trunkW: 7, base: "brick",
    foliage: { ramp: ["jade1", "jade1", "jade2", "leaf2", "jade3", "leaf3", "leaf4"], leaves: CAMPHOR_CLUSTERS, step: [4, 3] },
    bark: (seed) => figBark(seed), litter: ["jade2", "jade3", "gold4"],
    story: "Granny Shen's sweet osmanthus (桂花), planted the year she married into the house; in flower now, she shakes the blossom onto a sheet to make syrup",
  },
  persimmon: {
    species: "persimmon", crown: 118, ratio: 0.62, trunk: 46, lean: 4, masses: 6, trunkW: 9, base: "kerb",
    foliage: {
      ramp: ["jade1", "leaf1", "leaf2", "leaf3", "bamboo3", "leaf4", "gold4"], leaves: PERSIMMON_LEAVES, step: [4, 3],
      odd: { ramp: ["orange1", "orange1", "orange2", "orange2", "orange3", "gold4"], chance: 0.22 },
    },
    bark: (seed) => camphorBark(seed), litter: ["orange1", "orange2", "orange3"],
    story: "the persimmon (柿子) the whole yard picks from, half its leaves turned and fallen; the top fruit are left for the birds, and a bamboo picking pole with a wire hook leans on it",
  },
  pomegranate: {
    species: "pomegranate", crown: 86, ratio: 0.66, trunk: 24, lean: 2, masses: 5, trunkW: 5, base: "brick",
    foliage: { ramp: ["leaf1", "leaf1", "leaf2", "leaf3", "leaf3", "leaf4", "leaf5"], leaves: POME_LEAVES, step: [3, 3], odd: { ramp: ["bamboo2", "bamboo3", "bamboo4", "gold3", "gold4", "gold5"], chance: 0.12 } },
    bark: (seed) => figBark(seed + 4), litter: ["bamboo2", "bamboo4", "gold4"],
    story: "a pomegranate (石榴) for many children, the Wangs' wedding gift; multi-stemmed and twisted, its last fruit split open on the branch",
  },
  magnolia: {
    species: "magnolia", crown: 108, ratio: 0.8, trunk: 34, lean: -1, masses: 6, trunkW: 9, base: "pebble",
    foliage: {
      ramp: ["jade1", "jade1", "jade1", "jade2", "leaf2", "jade3", "leaf3"], leaves: BIG_OVALS, step: [5, 4], outlineLeaves: true,
      odd: { ramp: ["brown1", "brown2", "brown2", "brown3", "oak3", "oak4"], chance: 0.07 },
    },
    bark: (seed) => figBark(seed + 9), litter: ["brown2", "brown3", "oak3"],
    story: "a southern magnolia (广玉兰), the Shanghai city flower's big cousin: glossy leaves with rust-felted undersides that crackle underfoot, two late white flowers and a seed cone",
  },
  plane: {
    species: "plane", crown: 124, ratio: 0.6, trunk: 58, lean: 5, masses: 5, trunkW: 10, base: "kerb",
    foliage: { ramp: ["jade1", "leaf1", "jade2", "leaf2", "leaf3", "leaf4", "leaf5"], leaves: PLANE_CLUSTERS, step: [5, 4], odd: { ramp: ["oak1", "bamboo2", "bamboo3", "bamboo4", "gold4"], chance: 0.06 } },
    bark: (seed, top, bottom) => planeBark(seed, top, bottom), litter: ["oak2", "oak3", "bamboo4"],
    story: "a self-sown plane that came up between the paving stones thirty years ago and was let be; the yard's tallest thing, it shades the north-east roofs",
  },
  loquat: {
    species: "loquat", crown: 104, ratio: 0.7, trunk: 38, lean: -3, masses: 5, trunkW: 8, base: "mossy",
    foliage: {
      ramp: ["jade1", "jade1", "jade2", "jade3", "leaf3", "jade4", "leaf4"], leaves: BIG_OVALS, step: [5, 4], outlineLeaves: true,
      odd: { ramp: ["stone2", "stone3", "stone3", "stone4", "cream4", "cream5"], chance: 0.05 },
    },
    bark: (seed) => camphorBark(seed + 2), litter: ["jade2", "jade3", "stone4"],
    story: "a loquat (枇杷) grown from a stone someone spat out in 1998; in buff, furry flower now, fruit in May, and the leaves dried for cough tea",
  },
};

/** Who each courtyard tree is. */
const TREES: Record<string, Species> = {
  "courtyard.tree-0": "osmanthus",
  "courtyard.tree-1": "persimmon",
  "courtyard.tree-2": "pomegranate",
  "courtyard.tree-3": "magnolia",
  "courtyard.tree-4": "plane",
  "courtyard.tree-5": "loquat",
};
const ORDER: readonly Species[] = ["osmanthus", "persimmon", "pomegranate", "magnolia", "plane", "loquat"];

function seedOf(id: string): number {
  let n = 7;
  for (let i = 0; i < id.length; i++) n = (Math.imul(n, 31) + id.charCodeAt(i)) | 0;
  return n >>> 0;
}

/** The species of a courtyard tree: its own, or one picked from its id. */
export function speciesOf(prop: MapProp): Species {
  return TREES[prop.id] ?? ORDER[seedOf(prop.id) % ORDER.length];
}

/** The litter ramp of a tree (for fallen leaves under it). */
export const litterOf = (prop: MapProp) => SPECS[speciesOf(prop)].litter;

// ── layout ─────────────────────────────────────────────────────────────────────

type Layout = { spec: Spec; seed: number; fpx: number; W: number; H: number; ax: number; baseY: number; forkX: number; forkY: number; crown: Ellipse; masses: Ellipse[]; gaps: Ellipse[] };

/** Masses round a dome, low on one side over the top to low on the other, and one in the heart. */
function domeMasses(crown: Ellipse, n: number, seed: number): Ellipse[] {
  const { x, y, rx, ry } = crown;
  const h = (k: number, s: number) => hash(k, s, seed);
  const out: Ellipse[] = [];
  for (let k = 0; k < n; k++) {
    const a = Math.PI * (1.06 + (0.88 * (k + (h(k, 1) - 0.5) * 0.5)) / (n - 1));
    const size = 0.42 + h(k, 2) * 0.16;
    const mrx = rx * size, mry = ry * size * 1.12;
    out.push({ x: x + Math.cos(a) * (rx - mrx) * 0.98, y: y + Math.sin(a) * (ry - mry) * 0.95 + ry * 0.08, rx: mrx, ry: mry });
  }
  out.push({ x: x + (h(7, 3) - 0.5) * rx * 0.2, y: y - ry * 0.1, rx: rx * 0.5, ry: ry * 0.55 });
  for (const side of [-1, 1]) out.push({ x: x + side * rx * 0.6, y: y + ry * 0.42, rx: rx * 0.34, ry: ry * 0.4 });
  return out;
}

function layout(prop: MapProp): Layout {
  const spec = SPECS[speciesOf(prop)];
  const seed = seedOf(prop.id);
  const fpx = Math.round(prop.width * 32);
  const ry = Math.round((spec.crown * spec.ratio) / 2);
  const W = spec.crown + 16 + 2 * Math.abs(spec.lean);
  const ax = Math.round(W / 2);
  const crown = { x: ax + spec.lean, y: 4 + ry, rx: spec.crown / 2 - 2, ry };
  const forkY = 4 + ry * 2 - Math.round(ry * 0.22);
  const baseY = forkY + spec.trunk;
  const H = baseY + Math.round(fpx / 2) + 1;
  const masses = domeMasses(crown, spec.masses, seed);
  const gaps: Ellipse[] = [];
  masses.slice(0, spec.masses).forEach((m, i) => {
    if (hash(i, 11, seed) < 0.6) return;
    const gx = m.x + (hash(i, 12, seed) - 0.5) * m.rx * 0.6, gy = m.y + hash(i, 13, seed) * m.ry * 0.3;
    const grx = 2 + hash(i, 14, seed) * 2, gry = 1.5 + hash(i, 15, seed);
    gaps.push({ x: gx, y: gy, rx: grx, ry: gry }, { x: gx + grx * 0.8, y: gy + gry * 0.7, rx: grx * 0.6, ry: gry * 0.8 });
  });
  return { spec, seed, fpx, W, H, ax, baseY, forkX: ax + spec.lean, forkY, crown, masses, gaps };
}

// ── beds ───────────────────────────────────────────────────────────────────────

/** The tree's bed in its footprint: a ring of old bricks, a granite kerb, pebbles, or a mossy brick ring. */
function bed(p: Px, L: Layout): void {
  const { ax, baseY, fpx, seed, spec } = L;
  const s = fpx - 4, x = ax - Math.round(s / 2), y = L.H - Math.round(fpx / 2) - Math.round(s / 2);
  if (spec.base === "kerb" || spec.base === "pebble") kerbPit(p, x, y, s, seed, spec.base === "pebble" ? "pebble" : "soil");
  else {
    const bx = Math.round(s / 2), by = Math.round(s / 4) + 1, cy = baseY + 2;
    p.ellipse(ax, cy, bx, by, "brown2");
    p.over(() => { p.speckle(ax - bx, cy - by, bx * 2, by * 2, "brown3", 0.14, seed); p.speckle(ax - bx, cy - by, bx * 2, by * 2, "wood1", 0.06, seed + 1); });
    for (let k = 0; k < 9; k++) {
      if (k === 6 && spec.base === "brick") continue; // one brick long gone
      const a = Math.PI * (k / 8);
      const ex = Math.round(ax - Math.cos(a) * bx), ey = Math.round(cy + Math.sin(a) * by);
      art(p, ex - 2, ey - 1, ["rRRr", "qqqq"], spec.base === "mossy" && k % 3 === 0 ? { r: "leaf2", R: "leaf3", q: "rose2" } : { r: "rose3", R: "rose4", q: "rose2" });
    }
  }
  // A few of its own leaves dropped on the bed.
  const [d, m, l] = spec.litter;
  for (let k = 0; k < 3; k++) {
    const lx = ax - 12 + Math.floor(hash(k, 4, seed) * 22), ly = baseY - 2 + Math.floor(hash(k, 5, seed) * 6);
    art(p, lx, ly, [".l.", "lmd", ".d."], { l, m, d });
  }
}

// ── fruit, flowers and details ─────────────────────────────────────────────────

/** Points spread over the lower, front half of the masses, for fruit and flowers. */
function spots(L: Layout, n: number, salt: number): [number, number][] {
  const out: [number, number][] = [];
  const outer = L.masses.slice(0, L.spec.masses).concat(L.masses.slice(-2));
  for (let k = 0; k < n; k++) {
    const m = outer[Math.floor(hash(k, salt, L.seed) * outer.length)];
    const a = Math.PI * (0.1 + hash(k, salt + 1, L.seed) * 0.8), d = 0.35 + hash(k, salt + 2, L.seed) * 0.5;
    out.push([Math.round(m.x + Math.cos(a) * m.rx * d * (hash(k, salt + 3, L.seed) < 0.5 ? -1 : 1)), Math.round(m.y + Math.sin(a) * m.ry * d * 0.9 - m.ry * 0.25)]);
  }
  return out;
}

function details(p: Px, L: Layout, dx: number): void {
  const sway = (y: number) => (y < L.crown.y ? dx : 0);
  const sp = L.spec.species;
  if (sp === "osmanthus") {
    // Tiny cream-gold flower clusters crowded along the twigs under the leaves.
    for (const [x, y] of spots(L, 26, 20)) art(p, x + sway(y), y, hash(x, y, L.seed) < 0.5 ? ["g.c", ".G."] : ["cg", "g."], { g: "gold4", G: "gold5", c: "cream5" });
  }
  if (sp === "persimmon") {
    for (const [x, y] of spots(L, 15, 30)) art(p, x + sway(y), y, [".ss.", "oOOo", "oOoo", ".od."], { s: "leaf1", o: "orange2", O: "orange3", d: "orange1" });
    // One pecked by a bird, its flesh showing.
    const [bx, by] = spots(L, 1, 37)[0];
    art(p, bx + sway(by), by - 4, [".ss.", "oGGo", "ogdo", ".od."], { s: "leaf1", o: "orange2", G: "gold4", g: "gold3", d: "orange1" });
  }
  if (sp === "pomegranate") {
    for (const [x, y] of spots(L, 7, 40)) art(p, x + sway(y), y, [".c.", "rRr", "rrq", ".q."], { c: "rose2", r: "rose3", R: "rose4", q: "rose2" });
    const [sx, sy] = spots(L, 1, 47)[0];
    art(p, sx + sway(sy), sy - 3, [".c..", "rRrr", "rpPr", "rPpq", ".qq."], { c: "rose2", r: "rose3", R: "rose4", q: "rose2", p: "red3", P: "pink3" });
  }
  if (sp === "magnolia") {
    // Two late white flowers, cupped, and a rusty seed cone.
    for (const [x, y] of spots(L, 2, 50)) art(p, x + sway(y) - 2, y - 2, [".wWw.", "wWWWc", "cWgWc", ".ccc."], { w: "cream5", W: "white", c: "cream3", g: "gold4" });
    const [cx, cy] = spots(L, 1, 57)[0];
    art(p, cx + sway(cy), cy, [".b.", "bRb", "bRb", ".b."], { b: "brown2", R: "rose3" });
  }
  if (sp === "loquat") {
    // Buff, felted flower panicles at the branch tips, held above the leaves.
    for (const [x, y] of spots(L, 9, 60)) art(p, x + sway(y) - 1, y - 6, [".c.", "cCc", "cbc", ".b.", ".s."], { c: "cream3", C: "cream4", b: "bamboo3", s: "jade2" });
  }
}

/** The persimmon's picking pole: bamboo with a wire hook at the top, leaning on the trunk. */
function pickingPole(p: Px, L: Layout): void {
  const x0 = L.ax + 16, y0 = L.baseY + 4, x1 = L.forkX + 26, y1 = L.crown.y + Math.round(L.crown.ry * 0.5);
  p.line(x0, y0, x1, y1, "bamboo3");
  p.line(x0 + 1, y0, x1 + 1, y1, "bamboo2");
  art(p, x1 - 1, y1 - 4, [".s.", "s.s", "..s", ".s."], { s: "steel3" });
}

/** The osmanthus's sheet: an old cotton sheet spread on the bed to catch the falling blossom. */
function blossomSheet(p: Px, L: Layout): void {
  const y = L.baseY + 5;
  art(p, L.ax + 6, y, [
    "cCCCCCCCc",
    "CgCCCgCCc",
    "CCCgCCCgc",
    ".cccccccc",
  ], { c: "cream3", C: "cream4", g: "gold4" });
}

// ── the tree ───────────────────────────────────────────────────────────────────

function drawTree(p: Px, frame: number, L: Layout): void {
  const { spec, seed, ax, baseY, forkX, forkY, crown, masses } = L;
  const dx = SWAY[frame];
  const bark = spec.bark(seed, crown.y, baseY);
  const underside = crown.y + crown.ry;
  bed(p, L);
  if (spec.species === "osmanthus") blossomSheet(p, L);
  // The shaded inside of the crown, seen through the gaps between limbs.
  const r = spec.species === "pomegranate" ? 9 : 11 + spec.crown / 24;
  canopy(p, crownClumps({ x: crown.x, y: crown.y, rx: crown.rx * 0.66, ry: crown.ry * 0.66 }, r, seed + 40).map((c) => ({ ...c, shift: -3, sway: 0, group: 99 })), spec.foliage, crown, { seed: seed + 40 });
  const multi = spec.species === "pomegranate" || spec.species === "osmanthus";
  const lw = Math.max(3, Math.round(spec.trunkW * 0.6));
  masses.forEach((m, i) => {
    const tx = Math.round(forkX + (m.x - forkX) * 0.6), ty = Math.round(m.y + m.ry * 0.3);
    if (Math.abs(m.x - forkX) < crown.rx * 0.22) return;
    if (multi) {
      // Several stems from near the ground, twisting up to their masses.
      limb(p, ax + Math.sign(tx - ax) * 2, baseY, tx, ty, lw, Math.max(2, lw - 2), bark, { bend: Math.sign(tx - ax) * -4 + (i % 2 ? 3 : -3), seed: seed + i + 1, flare: 1, shadeAbove: underside - 2 });
    } else {
      limb(p, forkX + Math.sign(tx - forkX) * 2, forkY + 3, tx, ty, lw, Math.max(2, lw - 3), bark, { bend: Math.sign(tx - forkX) * -3, seed: seed + i + 1, shadeAbove: underside - 2 });
    }
  });
  limb(p, ax, baseY, forkX, forkY, spec.trunkW, spec.trunkW - 3, bark, { seed, flare: multi ? 2 : 5, bend: -(forkX - ax) * 0.4, shadeAbove: underside + 6 });
  if (!multi) roots(p, ax, baseY, [[-8, 2], [8, 3], [-3, 4]], bark, seed);
  if (spec.species === "persimmon") pickingPole(p, L);
  canopy(p, massClumps(crown, masses, r, seed), spec.foliage, crown, { seed: seed + 3, dx });
  details(p, L, dx);
  autoOutline(p, { map: OUTLINE });
  punchGaps(p, L.gaps, "jade1");
}

// ── dappled shade ──────────────────────────────────────────────────────────────

/** The crown's shade on the paving, cast down and right by the morning sun, with sun-flecks; translucent plum. */
function shadeDef(prop: MapProp): SpriteDef {
  const L = layout(prop);
  const shiftX = Math.round(L.crown.rx * 0.34), shiftY = 8;
  const blobs = L.masses.map((m) => ({ x: m.x + shiftX, y: L.baseY + shiftY + (m.y - L.crown.y) * 0.32, rx: m.rx * 0.98, ry: m.ry * 0.46 }));
  const x0 = Math.floor(Math.min(...blobs.map((b) => b.x - b.rx * 1.15))) - 2, x1 = Math.ceil(Math.max(...blobs.map((b) => b.x + b.rx * 1.15))) + 2;
  const y0 = Math.floor(Math.min(...blobs.map((b) => b.y - b.ry * 1.15))) - 2, y1 = Math.ceil(Math.max(L.H, ...blobs.map((b) => b.y + b.ry * 1.15))) + 2;
  const w = x1 - x0, h = y1 - y0;
  return {
    w, h, layer: "floor", anchor: [L.ax - x0, L.H - 1 - y0],
    draw: (p) => {
      const flecks: Ellipse[] = [];
      const area = blobs.reduce((s, b) => s + b.rx * b.ry, 0);
      for (let k = 0; k < Math.round(area / 240); k++) {
        const b = blobs[Math.floor(hash(k, 1, L.seed) * blobs.length)];
        const a = hash(k, 2, L.seed) * Math.PI * 2, d = Math.sqrt(hash(k, 3, L.seed)) * 0.85;
        flecks.push({ x: b.x + Math.cos(a) * b.rx * d, y: b.y + Math.sin(a) * b.ry * d, rx: 1.5 + hash(k, 4, L.seed) * 2, ry: 1 + hash(k, 5, L.seed) });
      }
      const inFleck = (x: number, y: number) => flecks.find((f) => ((x + 0.5 - f.x) / f.rx) ** 2 + ((y + 0.5 - f.y) / f.ry) ** 2 <= 1);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const x = i + x0, y = j + y0;
        let d = Infinity;
        for (const b of blobs) d = Math.min(d, Math.hypot((x + 0.5 - b.x) / b.rx, (y + 0.5 - b.y) / b.ry));
        d += (noise2(x, y, L.seed, 7, 4) - 0.5) * 0.34;
        if (d > 1.08) continue;
        const f = inFleck(x, y), core = d < 0.86;
        if (f && (!core || Math.max(f.rx, f.ry) > 2.6)) continue;
        p.faded(core && !f ? 0.3 : 0.16, () => p.px(i, j, "plum1"));
      }
    },
  };
}

function treeDef(prop: MapProp): SpriteDef {
  const L = layout(prop);
  return {
    w: L.W, h: L.H, frames: SWAY.length, fps: 2, anchor: [L.ax, L.H - 1],
    foot: [-Math.round(L.fpx / 4), -Math.round(L.fpx * 0.75), Math.round(L.fpx / 2), Math.round(L.fpx / 2)],
    draw: (p, frame) => drawTree(p, frame, L),
  };
}

/** The story line of a courtyard tree, for tools and reviewers. */
export const storyOf = (prop: MapProp) => SPECS[speciesOf(prop)].story;

export default defineSprites(Object.fromEntries(mapProps("all", "courtyard-tree").flatMap((prop) => [
  [propSpriteId(prop.map, prop.id), treeDef(prop)],
  [`${propSpriteId(prop.map, prop.id)}-shade`, shadeDef(prop)],
])));

