/**
 * The park's and the riverbank's trees in autumn: every `mature-tree` and every woodland `tree` (on
 * the maps in `WOODLAND_MAPS`), one sprite each (`<map>/<id>`) and its dappled floor shade
 * (`<map>/<id>-shade`, placed at the same anchor).
 *
 * The registry narrows a landscape tree's footprint to its trunk and keeps the authored crown size as
 * `spread`, so the trunk stands on the map's trunk collider and the crown spreads `spread` tiles.
 * Species, mixed through the groves: dark evergreen camphor (樟树), London plane turning ochre a
 * mass at a time, ginkgo gone gold, maple in muted rose and orange, and in the park's working
 * orchard old persimmons hung with fruit. Crowns sway four frames at 2 fps; trunks never move.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import {
  CAMPHOR_CLUSTERS, PLANE_CLUSTERS, WOODLAND_MAPS, art, autoOutline, camphorBark, canopy, clamp, crownClumps, dappledShade,
  domeMasses, limb, massClumps, planeBark, punchGaps, roots, type Bark, type Clump, type Ellipse, type Foliage,
} from "./_helpers.ts";

const SWAY = [0, 1, 0, -1];
const OUTLINE = {
  bamboo: "wood1", cream: "stone1", stone: "stone1", steel: "steel1", jade: "jade1", leaf: "leaf1", brown: "wood1", wood: "wood1",
  oak: "wood1", gold: "wood1", orange: "brown1", rose: "rose1", red: "red1",
} as const;

type Species = "camphor" | "plane" | "ginkgo" | "maple" | "persimmon" | "elm";

/** Ginkgo: little fans. Maple: five-pointed stars. Persimmon: broad soft ovals. */
const GINKGO_FANS: readonly (readonly string[])[] = [[".333.", "33322", ".222.", "..1.."], ["33.3", "3322", ".21."], ["3.3.", "3332", ".22.", ".1.."]];
const MAPLE_STARS: readonly (readonly string[])[] = [["..3..", "33332", ".3221", "3.2.1"], [".3.3.", "33322", ".222.", ".1.1."], ["3.3", "332", "2.1"]];
const PERSIMMON_LEAVES: readonly (readonly string[])[] = [[".33.", "3332", "3222", ".21."], ["33..", "3322", ".221"], [".3.", "332", "221", ".1."]];

/** Seven tones each: the seam, five body tones dark to light, then the sunlit rim alone. */
const RAMPS = {
  camphor: ["jade1", "jade1", "jade2", "leaf2", "jade3", "leaf3", "leaf4"],
  planeGreen: ["jade1", "leaf1", "jade2", "leaf2", "leaf3", "leaf4", "leaf5"],
  planeOchre: ["wood1", "oak1", "bamboo1", "oak2", "bamboo3", "bamboo4", "gold4"],
  ginkgo: ["wood1", "oak1", "gold1", "oak2", "gold2", "gold3", "gold4"],
  ginkgoTurning: ["leaf1", "leaf1", "bamboo1", "leaf2", "bamboo3", "gold3", "gold4"],
  maple: ["rose1", "rose1", "rose2", "rose3", "orange1", "rose4", "orange2"],
  mapleDeep: ["rose1", "rose1", "red1", "rose2", "red2", "rose3", "rose4"],
  elm: ["jade1", "leaf1", "jade2", "leaf2", "jade3", "leaf3", "leaf4"],
  persimmon: ["wood1", "leaf1", "oak1", "bamboo2", "oak3", "bamboo4", "gold4"],
} as const satisfies Record<string, readonly Color[]>;

const foliage = (ramp: readonly Color[], leaves: readonly (readonly string[])[], step: readonly [number, number] = [5, 4]): Foliage => ({ ramp, leaves, step });

/** Each mass of a crown picks its colour: a plane turns patchily, a maple has one deeper mass. */
function massFoliage(species: Species, i: number, seed: number): Foliage {
  const h = hash(i, 21, seed);
  switch (species) {
    case "camphor": return foliage(RAMPS.camphor, CAMPHOR_CLUSTERS, [4, 3]);
    case "plane": return foliage(h < 0.45 ? RAMPS.planeOchre : RAMPS.planeGreen, PLANE_CLUSTERS);
    case "ginkgo": return foliage(h < 0.2 ? RAMPS.ginkgoTurning : RAMPS.ginkgo, GINKGO_FANS, [4, 3]);
    case "maple": return foliage(h < 0.15 ? RAMPS.mapleDeep : h < 0.35 ? RAMPS.planeOchre : RAMPS.maple, MAPLE_STARS, [4, 3]);
    case "persimmon": return foliage(RAMPS.persimmon, PERSIMMON_LEAVES, [5, 4]);
    case "elm": return foliage(h < 0.15 ? RAMPS.planeOchre : RAMPS.elm, PERSIMMON_LEAVES, [4, 3]);
  }
}

/** Ginkgo: grey and corky, in long furrows. Maple: smooth grey-brown with the odd ring. */
const ginkgoBark = (seed: number): Bark => ({
  materials: [["stone1", "stone2", "stone3"], ["steel1", "steel2", "steel3"], ["wood2", "stone2", "stone4"]],
  cell: [3, 9], seams: true, fissure: "ink2",
  pick: (cell) => { const h = hash(cell, 4, seed); return h < 0.55 ? 0 : h < 0.85 ? 1 : 2; },
});
const mapleBark = (seed: number): Bark => ({
  materials: [["wood2", "wood3", "stone3"], ["stone1", "stone2", "stone3"]],
  cell: [6, 4], seams: true,
  pick: (cell) => (hash(cell, 6, seed) < 0.7 ? 0 : 1),
});
function barkOf(species: Species, seed: number, top: number, bottom: number): Bark {
  if (species === "plane") return planeBark(seed, top, bottom);
  if (species === "ginkgo") return ginkgoBark(seed);
  if (species === "maple" || species === "elm") return mapleBark(seed);
  return camphorBark(seed);
}

/** Fallen leaves round the foot, in the crown's own colour. */
const LITTER: Record<Species, readonly [Color, Color, Color]> = {
  camphor: ["leaf2", "jade3", "oak2"], plane: ["oak3", "bamboo4", "oak2"], ginkgo: ["gold3", "gold4", "gold2"],
  maple: ["rose3", "orange1", "rose2"], persimmon: ["orange1", "oak3", "rose2"], elm: ["oak3", "leaf3", "oak2"],
};

const idSeed = (id: string) => { let s = 0; for (const ch of id) s = (s * 31 + ch.charCodeAt(0)) | 0; return s >>> 0; };

const MATURE_CYCLE: readonly Species[] = ["plane", "ginkgo", "camphor", "maple"];
const UNDERSTOREY: readonly Species[] = ["camphor", "camphor", "elm", "elm", "plane", "plane", "maple", "ginkgo"];

/** Which tree a prop is: its name first (the old camphor, the orchard), then a mix through the groves. */
function speciesOf(prop: MapProp): Species {
  if (/camphor/.test(prop.id)) return "camphor";
  if (/fruit/.test(prop.id)) return "persimmon";
  if (/ginkgo/.test(prop.id)) return "ginkgo";
  if (prop.kind === "mature-tree") return MATURE_CYCLE[mapProps("all", "mature-tree").indexOf(prop) % MATURE_CYCLE.length];
  return UNDERSTOREY[Math.floor(hash(idSeed(prop.id) % 100000, 3, 17) * UNDERSTOREY.length)];
}

type Layout = {
  species: Species; seed: number; mature: boolean; fpx: number; W: number; H: number; ax: number;
  baseY: number; forkX: number; forkY: number; crown: Ellipse; masses: Ellipse[]; gaps: Ellipse[];
};

const layouts = new Map<string, Layout>();
/** Where everything goes, shared by the tree and its shade. */
function layout(prop: MapProp): Layout {
  const key = `${prop.map}/${prop.id}`;
  const known = layouts.get(key);
  if (known) return known;
  const species = speciesOf(prop);
  const seed = idSeed(prop.id) % 100000;
  const mature = prop.kind === "mature-tree";
  const spread = prop.spread ?? (mature ? 7 : 4);
  const narrow = species === "ginkgo" ? 0.72 : species === "persimmon" ? 0.9 : 1;
  const crownW = Math.round(spread * 32 * narrow);
  const ratio = { camphor: 0.6, plane: 0.62, ginkgo: 0.98, maple: 0.74, persimmon: 0.72, elm: 0.7 }[species];
  const trunk = Math.round(clamp(spread * 13, 46, 92) + (mature ? 10 : 0) - (species === "persimmon" ? 16 : 0));
  const lean = Math.round((hash(1, 2, seed) - 0.5) * (mature ? 8 : 12));
  const fpx = Math.max(12, Math.round(prop.width * 32));
  const ry = Math.round((crownW * ratio) / 2);
  const W = crownW + 16 + 2 * Math.abs(lean);
  const ax = Math.round(W / 2);
  const crown = { x: ax + lean, y: 4 + ry, rx: crownW / 2 - 2, ry };
  const forkY = 4 + ry * 2 - Math.round(ry * 0.22);
  const baseY = forkY + trunk;
  const H = baseY + Math.round(fpx / 2) + 1;
  const masses = species === "ginkgo"
    ? [...domeMasses(crown, seed, { count: 5, size: 0.44, hang: false }), { x: crown.x, y: crown.y - ry * 0.5, rx: crown.rx * 0.5, ry: ry * 0.42 }]
    : domeMasses(crown, seed, { count: species === "camphor" ? 7 : undefined, hang: species !== "persimmon" });
  const gaps: Ellipse[] = [];
  if (mature || spread > 5) masses.slice(0, -1).forEach((m, i) => {
    if (hash(i, 11, seed) < 0.62) return;
    const gx = m.x + (hash(i, 12, seed) - 0.5) * m.rx * 0.6, gy = m.y + hash(i, 13, seed) * m.ry * 0.35;
    const grx = 2.5 + hash(i, 14, seed) * 2.5, gry = 1.8 + hash(i, 15, seed) * 1.2;
    gaps.push({ x: gx, y: gy, rx: grx, ry: gry }, { x: gx + grx * 0.8, y: gy + gry * 0.7, rx: grx * 0.6, ry: gry * 0.8 });
  });
  const L = { species, seed, mature, fpx, W, H, ax, baseY, forkX: ax + lean, forkY, crown, masses, gaps };
  layouts.set(key, L);
  return L;
}

function drawTree(p: Px, frame: number, prop: MapProp) {
  const L = layout(prop);
  const { species, seed, mature, ax, baseY, forkX, forkY, crown, masses } = L;
  const bark = barkOf(species, seed, crown.y, baseY);
  const w0 = Math.round(clamp(crown.rx / 6, 7, mature ? 22 : 15) + (species === "camphor" ? 4 : 0));
  const underside = crown.y + crown.ry;
  const dx = SWAY[frame];
  const r = clamp(crown.rx / 5, 9, 20);

  // Roots running into the woodland floor, moss in their crooks, the crown's own leaves fallen round.
  roots(p, ax, baseY, [[-Math.round(w0 * 0.9), 2], [Math.round(w0 * 0.8), 3], [-Math.round(w0 * 0.3), 4], [Math.round(w0 * 1.1), 0]], bark, seed);
  art(p, ax - Math.round(w0 * 0.7), baseY + 1, ["mM.", ".mm"], { m: "leaf2", M: "leaf3" });
  const [a, b, c] = LITTER[species];
  for (let k = 0; k < (mature ? 7 : 4); k++) {
    const lx = ax + Math.round((hash(k, 31, seed) - 0.5) * w0 * 3.4), ly = baseY - 1 + Math.round(hash(k, 32, seed) * Math.max(3, L.fpx / 2 - 2));
    art(p, lx, ly, [".a.a", "aaAb", ".bb."], { a: k % 3 ? a : b, A: b, b: c });
  }

  // The shaded inside of the crown behind the limbs, then limbs, trunk and the lit masses.
  const inner = massFoliage(species, 0, seed);
  canopy(p, crownClumps({ x: crown.x, y: crown.y, rx: crown.rx * 0.66, ry: crown.ry * 0.66 }, r, seed + 40).map((cl) => ({ ...cl, shift: -3, sway: 0, group: 99 })), inner, crown, { seed: seed + 40 });
  const lw = Math.max(3, Math.round(w0 * 0.58));
  masses.forEach((m, i) => {
    if (Math.abs(m.x - forkX) < crown.rx * 0.22) return;
    const tx = Math.round(forkX + (m.x - forkX) * 0.62), ty = Math.round(m.y + m.ry * 0.3);
    limb(p, forkX + Math.sign(tx - forkX) * 2, forkY + 3, tx, ty, lw, Math.max(2, lw - 4), bark, { bend: Math.sign(tx - forkX) * -3, seed: seed + i + 1, shadeAbove: underside - 2 });
  });
  limb(p, ax, baseY, forkX, forkY, w0, Math.max(4, w0 - 3), bark, { seed, flare: Math.round(w0 * 0.4), bend: -(forkX - ax) * 0.4, shadeAbove: underside + 8 });
  // Each mass in its own colour: one call per mass so a plane can turn a bough at a time.
  const clumps = massClumps(crown, masses, r, seed, species === "ginkgo" ? 0.9 : 0.8);
  const groups = new Map<number, Clump[]>();
  for (const cl of clumps) groups.set(cl.group ?? 0, [...(groups.get(cl.group ?? 0) ?? []), cl]);
  for (const [g, list] of groups) canopy(p, list, massFoliage(species, g, seed), crown, { seed: seed + 3 + g, dx });
  if (species === "persimmon") {
    // Fruit hanging on after the leaves thin: glossy orange, a dark calyx on top.
    for (let k = 0; k < 14; k++) {
      const m = masses[k % masses.length];
      const fx = Math.round(m.x + (hash(k, 41, seed) - 0.5) * m.rx * 1.4), fy = Math.round(m.y + (hash(k, 42, seed) - 0.2) * m.ry * 0.9);
      art(p, fx + (k % 2 ? dx : 0), fy, [".k.", "oOo", "ooq", ".q."], { k: "leaf1", o: "orange2", O: "orange3", q: "orange1" });
    }
  }
  autoOutline(p, { map: OUTLINE });
  punchGaps(p, L.gaps, species === "camphor" ? "jade1" : species === "plane" ? "leaf1" : "wood1");
}

function treeDef(prop: MapProp): SpriteDef {
  const L = layout(prop);
  return { w: L.W, h: L.H, frames: 4, fps: 2, anchor: [L.ax, L.H - 1], draw: (p, frame) => drawTree(p, frame, prop) };
}

function shadeDef(prop: MapProp): SpriteDef {
  const L = layout(prop);
  const shade = dappledShade(L.masses, L.crown, L.baseY, L.seed, { strength: L.species === "ginkgo" ? 0.26 : 0.32 });
  return { w: shade.w, h: shade.h, layer: "floor", anchor: [L.ax - shade.x0, L.H - 1 - shade.y0], draw: (p) => shade.draw(p) };
}

const woodland = [...mapProps("all", "mature-tree"), ...mapProps("all", "tree").filter((p) => WOODLAND_MAPS.has(p.map))];

export default defineSprites(Object.fromEntries(woodland.flatMap((prop) => [
  [propSpriteId(prop.map, prop.id), treeDef(prop)],
  [`${propSpriteId(prop.map, prop.id)}-shade`, shadeDef(prop)],
])));
