/**
 * The town's trees, one sprite per `tree` prop (`town/<id>`). The footprint is the trunk's base
 * (its grate or pit); the crown rises far above and spreads past it, as a tree's does. The anchor
 * is the footprint's bottom-centre. Crowns sway gently (four frames at 2 fps, the top moving a
 * pixel each way); trunks never move.
 *
 * Trees cast no contact-shadow ellipse. Each has a separate floor sprite, `town/<id>-shade`: the
 * crown's dappled shade, cast down and right of the trunk by the morning sun, translucent, with
 * sun-flecks. Place it exactly as the tree, its anchor on `propAnchor(prop)`.
 *
 * Most are London planes (法国梧桐), the French Concession's signature: jigsaw bark in grey, olive
 * and cream, pale upper limbs, broad clustered crowns. The junction tree is an old camphor (樟树),
 * the south garden tree a fig.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import {
  CAMPHOR_CLUSTERS, FIG_LEAVES, PLANE_CLUSTERS, art, autoOutline, camphorBark, canopy, crownClumps, figBark,
  ironGrate, kerbPit, limb, massClumps, noise2, planeBark, punchGaps, roots, WOODLAND_MAPS, type Ellipse, type Foliage,
} from "./_helpers.ts";

const SWAY = [0, 1, 0, -1];
const OUTLINE = { bamboo: "stone1", cream: "stone1", stone: "stone1", jade: "jade1", leaf: "leaf1", brown: "wood1", wood: "wood1" } as const;

/** Plane ramps, dark to light; the last tone is the sunlit rim only. One tree yellower, one bluer. */
const PLANE_RAMPS = {
  green: ["jade1", "leaf1", "jade2", "leaf2", "leaf3", "leaf4", "leaf5"],
  yellow: ["jade1", "leaf1", "leaf2", "leaf3", "leaf4", "leaf4", "leaf5"],
  blue: ["jade1", "jade1", "jade2", "jade3", "leaf3", "jade4", "leaf4"],
} as const satisfies Record<string, readonly Color[]>;
const plane = (hue: keyof typeof PLANE_RAMPS): Foliage => ({
  ramp: PLANE_RAMPS[hue],
  leaves: PLANE_CLUSTERS,
  step: [5, 4],
  odd: { ramp: ["oak1", "bamboo2", "bamboo3", "bamboo4", "gold4"], chance: 0.02 },
});

type Detail = "tag" | "limewash" | "stub" | "birdcage" | "tripod" | "ivy" | "moss" | "knot" | "wire" | "pollard";
/** `crown` is the crown's width and `trunk` the trunk's height below the main fork, in tiles. */
type PlaneSpec = { lean: number; crown: number; trunk: number; hue: keyof typeof PLANE_RAMPS; base: "iron" | "kerb" | "pebble"; details: readonly Detail[]; story: string };

/**
 * Who each plane is. `lean` tilts the trunk toward the light in the gap it grew into (px at the fork).
 */
const PLANES: Record<string, PlaneSpec> = {
  "town.park-sentinel": { lean: 4, crown: 8, trunk: 3.6, hue: "green", base: "kerb", details: ["tag", "knot"], story: "the oldest plane in the park, with a blank council tag nailed on long ago" },
  "town.courtyard-left": { lean: -3, crown: 7, trunk: 3.2, hue: "green", base: "iron", details: ["limewash"], story: "lime-washed to knee height every winter against borers" },
  "town.courtyard-right": { lean: 3, crown: 6, trunk: 3, hue: "green", base: "iron", details: ["stub"], story: "lost a limb to a typhoon; the sawn stub still shows pale" },
  "town.east-lane": { lean: 6, crown: 6.5, trunk: 3.6, hue: "yellow", base: "pebble", details: ["wire"], story: "leans into the lane; an old clothesline hook is grown into it" },
  "town.river-view": { lean: 7, crown: 7.5, trunk: 3.3, hue: "blue", base: "kerb", details: ["moss"], story: "leans toward the river, mossy on its damp north side" },
  "town.tea-garden": { lean: -2, crown: 6.5, trunk: 3, hue: "yellow", base: "iron", details: ["birdcage"], story: "an old man hangs his songbird's cage on the low limb every morning" },
  "town.west-shade": { lean: -5, crown: 8, trunk: 3.5, hue: "green", base: "iron", details: ["knot", "limewash"], story: "the widest shade on the west lane, a knot hole sparrows use" },
  "town.market-tree": { lean: 1, crown: 3.6, trunk: 1.7, hue: "green", base: "kerb", details: ["tripod"], story: "a young replacement, still braced by three bamboo poles" },
  "town.east-corner": { lean: -3, crown: 5.5, trunk: 3.3, hue: "green", base: "pebble", details: ["pollard", "stub"], story: "pollarded hard last winter: knuckled fists and new shoots" },
  "town.south-grove": { lean: 2, crown: 7, trunk: 3.4, hue: "blue", base: "kerb", details: ["ivy"], story: "ivy has climbed it to the first fork" },
};

const HUES = ["green", "green", "yellow", "blue"] as const;
const BASES = ["iron", "kerb", "pebble"] as const;

/**
 * Who a plane is: its own spec, or for a tree this file does not know (a new map's, a new lane's) a
 * plain, deterministic plane picked from its id, so a new tree never throws.
 */
function planeSpec(prop: MapProp): PlaneSpec {
  const known = PLANES[prop.id];
  if (known) return known;
  let seed = 0;
  for (const ch of prop.id) seed = (seed * 31 + ch.charCodeAt(0)) | 0;
  const pick = (k: number) => hash(k, 5, seed);
  return {
    lean: Math.round((pick(1) - 0.5) * 10), crown: 5 + Math.round(pick(2) * 5) / 2, trunk: 3 + Math.round(pick(3) * 6) / 10,
    hue: HUES[Math.floor(pick(4) * HUES.length)], base: BASES[Math.floor(pick(5) * BASES.length)], details: [], story: "a plane like any on the lanes",
  };
}

type Layout = {
  kind: "plane" | "camphor" | "fig"; seed: number; young: boolean; fpx: number; W: number; H: number; ax: number;
  baseY: number; forkX: number; forkY: number; crown: Ellipse; masses: Ellipse[]; gaps: Ellipse[];
};

/**
 * Where everything goes, shared by the tree and its shade so they always agree. The crown sits at
 * the top of the canvas, the main fork just inside its underside, the trunk below it, and the
 * footprint (grate or pit) at the bottom with the trunk standing in its middle.
 */
function layout(prop: MapProp): Layout {
  const kind = prop.id === "town.junction" ? "camphor" : prop.id === "town.south-fig" ? "fig" : "plane";
  const spec = planeSpec(prop);
  const seed = Math.round(prop.position.x * 31 + prop.position.y * 17);
  const young = kind === "plane" && spec.crown < 4.5;
  const crownW = kind === "camphor" ? 304 : kind === "fig" ? 116 : Math.round(spec.crown * 32);
  const ratio = kind === "camphor" ? 0.56 : kind === "fig" ? 0.58 : young ? 0.66 : 0.6;
  const trunk = kind === "camphor" ? 76 : kind === "fig" ? 34 : Math.round(spec.trunk * 32);
  const lean = Math.round((kind === "plane" ? spec.lean : kind === "camphor" ? -2 : 0) * crownW / 128);
  const fpx = Math.round(prop.width * 32);
  const ry = Math.round((crownW * ratio) / 2);
  const W = crownW + 16 + 2 * Math.abs(lean);
  const ax = Math.round(W / 2);
  const crown = { x: ax + lean, y: 4 + ry, rx: crownW / 2 - 2, ry };
  const forkY = 4 + ry * 2 - Math.round(ry * (kind === "camphor" ? 0.3 : 0.2));
  const baseY = forkY + trunk;
  const H = baseY + Math.round(fpx / 2) + 1;
  const masses = kind === "camphor"
    ? [...planeMasses(crown, false, seed, 7), { x: crown.x - crown.rx * 0.72, y: crown.y + ry * 0.38, rx: crown.rx * 0.3, ry: ry * 0.42 }, { x: crown.x + crown.rx * 0.74, y: crown.y + ry * 0.32, rx: crown.rx * 0.28, ry: ry * 0.44 }]
    : planeMasses(crown, young, kind === "fig" ? seed + 3 : seed);
  // A few see-through gaps, in the body of the outer masses, never at the rim.
  const gaps: Ellipse[] = [];
  if (!young) masses.slice(0, -1).forEach((m, i) => {
    if (hash(i, 11, seed) < (kind === "camphor" ? 0.6 : 0.62)) return;
    // Two overlapping ovals, so a gap is ragged, not a porthole.
    const gx = m.x + (hash(i, 12, seed) - 0.5) * m.rx * 0.6, gy = m.y + hash(i, 13, seed) * m.ry * 0.35;
    const grx = 2.5 + hash(i, 14, seed) * 2.5, gry = 1.8 + hash(i, 15, seed) * 1.2;
    gaps.push({ x: gx, y: gy, rx: grx, ry: gry }, { x: gx + grx * 0.8, y: gy + gry * 0.7, rx: grx * 0.6, ry: gry * 0.8 });
  });
  return { kind, seed, young, fpx, W, H, ax, baseY, forkX: ax + lean, forkY, crown, masses, gaps };
}

function drawBase(p: Px, kind: "iron" | "kerb" | "pebble", ax: number, H: number, fpx: number, hole: number, seed: number) {
  // A real pit is about a metre and a half square, whatever room the map leaves round it.
  const s = Math.min(fpx - 4, 42);
  const x = ax - Math.round(s / 2), y = H - Math.round(fpx / 2) - Math.round(s / 2);
  if (kind === "iron") ironGrate(p, x, y, s, hole, seed);
  else kerbPit(p, x, y, s, seed, kind === "pebble" ? "pebble" : "soil");
  // A few plane leaves caught on it, and on the iron, a coin somebody dropped.
  for (let k = 0; k < 3; k++) {
    const lx = x + 3 + Math.floor(hash(k, 4, seed) * (s - 9)), ly = y + 3 + Math.floor(hash(k, 5, seed) * (s - 8));
    art(p, lx, ly, [".a.a", "aaAb", ".bb."], { a: k === 1 ? "bamboo3" : "oak3", A: "oak4", b: "oak2" });
  }
  if (kind === "iron") art(p, x + s - 9, y + s - 7, ["cg", "gG"], { c: "gold4", g: "gold2", G: "gold1" });
}

/**
 * A plane's crown: masses round a dome, from low on one side over the top to low on the other,
 * then one or two hanging lower at the sides, leaving the middle of the underside open so the
 * fork and limbs show. Count, size and spacing come from `seed`, so no two crowns match.
 */
function planeMasses(crown: Ellipse, young: boolean, seed: number, count?: number): Ellipse[] {
  const { x, y, rx, ry } = crown;
  const h = (k: number, s: number) => hash(k, s, seed);
  const n = count ?? (young ? 3 : 5 + Math.floor(h(0, 9) * 2));
  const out: Ellipse[] = [];
  for (let k = 0; k < n; k++) {
    const a = Math.PI * (1.08 + (0.84 * (k + (h(k, 1) - 0.5) * 0.5)) / (n - 1));
    const size = (young ? 0.55 : 0.4) + h(k, 2) * 0.16;
    const mrx = rx * size, mry = ry * size * 1.15;
    const cx = x + Math.cos(a) * (rx - mrx) * 0.98, cy = y + Math.sin(a) * (ry - mry) * 0.95 + ry * 0.08;
    out.push({ x: cx, y: cy, rx: mrx, ry: mry });
  }
  // A heavier mass fills the crown's heart, so it reads as one tree and not a ring.
  out.push({ x: x + (h(7, 3) - 0.5) * rx * 0.2, y: y - ry * 0.15, rx: rx * 0.45, ry: ry * 0.5 });
  if (!young) for (const side of [-1, 1]) {
    if (h(side + 3, 4) < 0.25) continue;
    const size = 0.3 + h(side + 3, 5) * 0.12;
    out.push({ x: x + side * rx * (0.62 + h(side + 3, 6) * 0.1), y: y + ry * (0.35 + h(side + 3, 7) * 0.15), rx: rx * size, ry: ry * size * 1.2 });
  }
  return out;
}

function drawPlane(p: Px, frame: number, prop: MapProp, spec: PlaneSpec) {
  const L = layout(prop);
  const { seed, young, fpx, H, ax, baseY, forkX, forkY, crown, masses } = L;
  const foliage = plane(spec.hue);
  const bark = planeBark(seed, crown.y, baseY);
  const w0 = young ? 7 : Math.round(10 + crown.rx / 13);
  const dx = SWAY[frame];
  const underside = crown.y + crown.ry;
  drawBase(p, spec.base, ax, H, fpx, Math.round(w0 / 2) + 2, seed);
  if (!young) roots(p, ax, baseY, [[-11, 2], [10, 3], [-5, 4], [13, 0]], bark, seed);

  // The shaded inside of the crown, seen through the cavities behind the limbs.
  const r = young ? 10 : 12 + crown.rx / 18;
  canopy(p, crownClumps({ x: crown.x, y: crown.y, rx: crown.rx * 0.66, ry: crown.ry * 0.66 }, r, seed + 40).map((c) => ({ ...c, shift: -3, sway: 0, group: 99 })), foliage, crown, { seed: seed + 40 });

  // Trunk and limbs: the trunk forks into a limb per mass, paling as they climb.
  const lw = Math.round(w0 * 0.58);
  masses.forEach((m, i) => {
    // Limbs climb steeply toward the inner side of their mass, as a plane's do.
    const tx = Math.round(forkX + (m.x - forkX) * 0.6), ty = Math.round(m.y + m.ry * 0.3);
    if (Math.abs(m.x - forkX) < crown.rx * 0.25) return; // the heart mass sits right on the fork
    const w = m.rx > crown.rx * 0.45 ? lw : lw - 1;
    limb(p, forkX + Math.sign(tx - forkX) * 2, forkY + 3, tx, ty, w, Math.max(2, w - 4), bark, { bend: Math.sign(tx - forkX) * -3, seed: seed + i + 1, shadeAbove: underside - 2 });
  });
  limb(p, ax, baseY, forkX, forkY, w0, w0 - 3, bark, { seed, flare: young ? 2 : 7, bend: -(forkX - ax) * 0.4, shadeAbove: underside + 8 });
  if (spec.details.includes("pollard")) {
    // Knuckles where the limbs are cut back each winter.
    for (const m of masses.slice(3)) {
      const kx = Math.round((m.x + forkX) / 2), ky = Math.round((m.y + m.ry * 0.2 + forkY) / 2);
      art(p, kx - 3, ky - 2, [".cCc.", "cCCcb", "sccbb", ".sbb."], { c: "cream4", C: "cream5", b: "stone3", s: "stone2" });
    }
  }
  canopy(p, massClumps(crown, masses, r, seed), foliage, crown, { seed: seed + 3, dx });

  const trunkMid = Math.round((baseY + forkY) / 2);
  const tx = (y: number) => Math.round(ax + (forkX - ax) * ((baseY - y) / (baseY - forkY)));
  for (const d of spec.details) {
    if (d === "limewash") {
      // Lime wash to knee height: chalky white, flaking at the top edge, grey where it wore thin.
      p.over(() => {
        for (let y = baseY - 15; y <= baseY; y++) for (let x = tx(y) - w0; x <= tx(y) + w0; x++) {
          const c = p.get(x, y);
          if (!c || !/^(stone|bamboo|cream|jade)/.test(c)) continue;
          if (y < baseY - 12 && hash(x, y >> 1, seed) < 0.5) continue;
          const u = x - (tx(y) - w0 / 2);
          p.px(x, y, u < 3 ? "white" : u < w0 * 0.65 ? "cream5" : "stone4");
        }
      });
    }
    if (d === "tag") art(p, tx(trunkMid) - 3, trunkMid - 6, ["kkkkkk", "kJJJjk", "kJjjjk", "kjjjik", "kkkkkk"], { k: "jade1", J: "jade4", j: "jade3", i: "jade2" });
    if (d === "knot") art(p, tx(trunkMid + 8) + 1, trunkMid + 2, [".ss.", "sKks", "skKs", ".sl."], { s: "stone2", K: "ink", k: "ink2", l: "stone3" });
    if (d === "stub") {
      const sx = tx(forkY + 8) + Math.round(w0 / 2) - 1, sy = forkY + 6;
      art(p, sx, sy, ["bbB.", "ccbB", "cCcbW", "ccbW.", "bbW.."], { b: "stone2", B: "stone3", c: "oak4", C: "oak5", W: "stone1" });
    }
    if (d === "wire") art(p, tx(trunkMid) + Math.round(w0 / 2) - 2, trunkMid - 3, ["ss..", "sOs.", ".sOs", "..so", "...o"], { s: "steel2", O: "orange1", o: "orange1" });
    if (d === "moss") p.over(() => {
      for (let y = forkY; y <= baseY; y++) for (let k = 0; k < 4; k++) {
        const x = tx(y) + Math.round(w0 / 2) - 1 - k;
        if (hash(x, y >> 1, seed + 7) < 0.55 - k * 0.12) p.px(x, y, k === 0 ? "leaf2" : "leaf3");
      }
    });
    if (d === "ivy") {
      // Ivy climbing the trunk to the fork: heart leaves alternating sides of a dark stem.
      for (let y = baseY - 2; y > forkY - 2; y -= 3) {
        const x = tx(y) + (((baseY - y) / 3) % 2 ? 1 : -4);
        art(p, x, y, ["g.g", "GgG", ".g."], { g: "leaf2", G: "leaf3" });
        if (hash(x, y, seed) < 0.3) p.px(x + 1, y, "leaf4");
      }
    }
    if (d === "tripod") {
      // Three bamboo braces lashed to the trunk with a strip of inner tube.
      const ty = baseY - 26;
      for (const [fx, fy] of [[-15, 2], [14, 3], [3, -9]] as const) {
        p.line(ax + fx, baseY + fy, tx(ty) + Math.sign(fx), ty, "bamboo3");
        p.line(ax + fx + 1, baseY + fy, tx(ty) + Math.sign(fx) + 1, ty, "bamboo2");
      }
      p.hline(tx(ty) - 4, ty + 1, 9, "ink2").hline(tx(ty) - 4, ty + 2, 9, "steel1");
    }
    if (d === "birdcage") {
      // A domed bamboo birdcage, its blue cloth cover folded back, hung from the low left limb.
      const m = masses.reduce((a, b) => (b.x < a.x ? b : a));
      const cx = Math.round(m.x + m.rx * 0.3), cy = Math.round(m.y + m.ry) + 2;
      p.vline(cx + 4, cy - 7, 7, "steel3");
      art(p, cx, cy, [
        "...bb...",
        "..bBBb..",
        ".bBBBBb.",
        "bBbBbBbb",
        "BqBYBqBb",
        "BqByyqBb",
        "BqBqBqBb",
        "BBBBBBBb",
        "uuuuuuub",
        ".bbbbbb.",
      ], { b: "bamboo2", B: "bamboo4", q: "steel2", Y: "gold4", y: "gold3", u: "blue3" });
    }
  }
  autoOutline(p, { map: OUTLINE });
  punchGaps(p, L.gaps, "jade1");
}

// ── the camphor ───────────────────────────────────────────────────────────────

const CAMPHOR_FOLIAGE: Foliage = {
  ramp: ["jade1", "jade1", "jade2", "leaf2", "jade3", "leaf3", "leaf4"],
  leaves: CAMPHOR_CLUSTERS,
  step: [4, 3],
  odd: { ramp: ["leaf2", "leaf3", "leaf3", "leaf4", "leaf4", "leaf5"], chance: 0.02 },
};

/**
 * The junction camphor (樟树), older than the lane and the biggest thing in it: a broad dark
 * evergreen dome over the whole junction. Its trunk is heavy and fissured into plates, wrapped in
 * straw rope against the winter (no red ribbon); one root has surfaced over the stone ring and
 * been sat smooth by forty years of people waiting for the bus.
 */
function drawCamphor(p: Px, frame: number, prop: MapProp) {
  const L = layout(prop);
  const { seed, fpx, ax, baseY, forkX, forkY, crown, masses } = L;
  const bark = camphorBark(seed);
  const w0 = 30;
  const dx = SWAY[frame];
  const underside = crown.y + crown.ry;
  // The stone ring: granite blocks round a raised soil bed, its front face showing.
  const rx = Math.round(fpx / 2) - 1, ry = Math.round(fpx / 2) - 8;
  const cy = baseY + 1;
  p.ellipse(ax, cy + 3, rx, ry, "stone2");
  p.ellipse(ax, cy, rx, ry, "stone4");
  p.ellipse(ax, cy - 1, rx - 1, ry - 1, "stone5");
  p.ellipse(ax, cy, rx - 3, ry - 3, "stone3");
  p.ellipse(ax, cy, rx - 4, ry - 4, "brown2");
  p.over(() => p.speckle(ax - rx + 4, cy - ry + 4, rx * 2 - 8, ry * 2 - 8, "brown3", 0.12, seed));
  for (let x = ax - rx + 3; x < ax + rx - 2; x += 7) p.vline(x, cy + ry - 1, 3, "stone1");
  for (let k = 0; k < 6; k++) { const a = Math.PI * (1.15 + k * 0.14); p.px(Math.round(ax + Math.cos(a) * (rx - 2)), Math.round(cy + Math.sin(a) * (ry - 1)), "stone3"); }
  art(p, ax - rx + 4, cy + ry, ["mM.m", ".mm."], { m: "leaf2", M: "leaf3" });

  const r = 18;
  canopy(p, crownClumps({ x: crown.x, y: crown.y, rx: crown.rx * 0.72, ry: crown.ry * 0.7 }, r, seed + 40).map((c) => ({ ...c, shift: -3, sway: 0, group: 99 })), CAMPHOR_FOLIAGE, crown, { seed: seed + 40 });
  // Great low limbs spreading wide, one per mass, then the trunk.
  masses.forEach((m, i) => {
    const tx = Math.round(forkX + (m.x - forkX) * 0.7), ty = Math.round(m.y + m.ry * 0.3);
    if (Math.abs(m.x - forkX) < crown.rx * 0.18) return;
    const w = m.rx > crown.rx * 0.38 ? 15 : 12;
    limb(p, forkX + Math.sign(tx - forkX) * 6, forkY + 8, tx, ty, w, 4, bark, { bend: Math.sign(tx - forkX) * -8, seed: seed + i, shadeAbove: underside });
  });
  limb(p, ax, baseY, forkX, forkY, w0, w0 - 6, bark, { seed, flare: 14, bend: 4, shadeAbove: underside + 6 });
  // Buttress roots running out over the ring.
  roots(p, ax, baseY, [[-20, 2], [-12, 5], [17, 4]], bark, seed + 2);
  // The straw-rope wrap, coiled from the ring to the knee: diagonal lays and a frayed end.
  const wrapTop = baseY - 24, wrapBottom = baseY - 7;
  p.over(() => {
    for (let y = wrapTop; y <= wrapBottom; y++) for (let x = ax - 26; x <= ax + 26; x++) {
      const c = p.get(x, y);
      if (!c || !/^(wood|stone|brown|ink)/.test(c)) continue;
      const u = x - (ax - w0 / 2 - 4);
      const lay = (x + y * 2) % 5;
      const lit = u < 7 ? 1 : u > w0 ? -1 : 0;
      const tones: Color[] = ["bamboo1", "bamboo2", "bamboo3", "bamboo4", "bamboo5"];
      p.px(x, y, tones[Math.max(0, Math.min(4, (lay === 0 ? 1 : lay >= 3 ? 3 : 2) + lit + (y === wrapTop || y === wrapBottom ? -1 : 0)))]);
    }
  });
  art(p, ax + 12, wrapBottom - 1, ["b.", "bB", ".b", "b."], { b: "bamboo2", B: "bamboo3" });
  // The sat-smooth root, curling out to the front right over the ring, polished pale on top.
  art(p, ax + 6, baseY - 5, [
    "..wwwww.........",
    ".wWLLLLww.......",
    "wWLLLLLLLww.....",
    "dwWLLLLLLLLwww..",
    ".ddwwWLLLLLLLLww",
    "...dddwwwwwwwWwd",
    "......ddddddddd.",
  ], { w: "wood3", W: "wood4", L: "oak4", d: "wood1" });
  canopy(p, massClumps(crown, masses, r, seed, 0.85), CAMPHOR_FOLIAGE, crown, { seed: seed + 5, dx });
  autoOutline(p, { map: OUTLINE });
  punchGaps(p, L.gaps, "jade1");
}

// ── the fig ───────────────────────────────────────────────────────────────────

const FIG_FOLIAGE: Foliage = {
  ramp: ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4", "leaf4", "leaf5"],
  leaves: FIG_LEAVES,
  step: [6, 4],
  outlineLeaves: true,
};

/**
 * A garden fig in a bed of old bricks at the end of the south lane, planted by someone's
 * grandmother: low, multi-stemmed, smooth grey bark, big three-lobed leaves and green figs
 * turning purple. One heavy limb is propped on a forked bamboo pole.
 */
function drawFig(p: Px, frame: number, prop: MapProp) {
  const L = layout(prop);
  const { seed, fpx, ax, baseY, crown, masses } = L;
  const bark = figBark(seed);
  const dx = SWAY[frame];
  // Bed: dark garden soil in a ring of old bricks, one missing, and a windfall fig.
  const bx = Math.round(fpx / 2) - 6, by = Math.round(fpx / 4) - 2, bcy = baseY + 2;
  p.ellipse(ax, bcy, bx, by, "brown2");
  p.over(() => { p.speckle(ax - bx, bcy - by, bx * 2, by * 2, "brown3", 0.14, seed); p.speckle(ax - bx, bcy - by, bx * 2, by * 2, "wood1", 0.06, seed + 1); });
  for (let k = 0; k < 11; k++) {
    if (k === 7) continue;
    const a = Math.PI * (k / 10);
    const ex = Math.round(ax - Math.cos(a) * bx), ey = Math.round(bcy + Math.sin(a) * by);
    art(p, ex - 2, ey - 1, ["rRRr", "qqqq"], { r: "rose3", R: "rose4", q: "rose2" });
  }
  art(p, ax + 10, bcy + 2, [".p.", "pPp", ".p."], { p: "plum2", P: "plum3" });

  const { x, y, rx: Rx, ry: Ry } = crown;
  canopy(p, crownClumps({ x, y, rx: Rx * 0.6, ry: Ry * 0.6 }, 12, seed + 40).map((c) => ({ ...c, shift: -3, sway: 0, group: 99 })), FIG_FOLIAGE, crown, { seed: seed + 40 });
  // Three stems from the ground, spreading low.
  const stemTo = [masses[0], masses[Math.floor(masses.length / 2)], masses[masses.length - 2]];
  stemTo.forEach((m, i) => limb(p, ax + (i - 1) * 4, baseY, Math.round(ax + (m.x - ax) * 0.75), Math.round(m.y + m.ry * 0.3), 6 - (i === 1 ? 1 : 0), 3, bark, { bend: (i - 1) * 6, seed: seed + i, flare: 2, shadeAbove: crown.y + crown.ry }));
  // The prop: a forked bamboo pole under the left limb.
  const px0 = ax - 22, py0 = baseY + 2, py1 = Math.round(masses[0].y + masses[0].ry) - 4;
  p.vline(px0, py1, py0 - py1, "bamboo3").vline(px0 + 1, py1, py0 - py1, "bamboo2");
  for (let yy = py1 + 6; yy < py0; yy += 9) p.hline(px0, yy, 2, "bamboo1");
  art(p, px0 - 2, py1 - 3, ["b...b", ".b.b.", "..B.."], { b: "bamboo3", B: "bamboo2" });
  canopy(p, massClumps(crown, masses, 14, seed, 0.75), FIG_FOLIAGE, crown, { seed: seed + 9, dx });
  // Figs in the leaf axils: green, a few blushing purple.
  for (let k = 0; k < 10; k++) {
    const fx = Math.round(x - Rx * 0.75 + hash(k, 1, seed) * Rx * 1.5);
    const fy = Math.round(y - Ry * 0.4 + hash(k, 2, seed) * Ry * 1.1);
    const ripe = k % 3 === 0;
    art(p, fx, fy, [".s.", "fFf", "fff", ".f."], ripe ? { s: "leaf2", F: "plum4", f: "plum2" } : { s: "leaf2", F: "jade5", f: "jade3" });
  }
  autoOutline(p, { map: { ...OUTLINE, steel: "steel1", plum: "plum1" } });
  punchGaps(p, L.gaps, "leaf1");
}

// ── dappled shade ─────────────────────────────────────────────────────────────

/**
 * The crown's shade on the ground: each leaf mass cast down and right by the morning sun and
 * flattened onto the paving, a ragged edge, a lighter fringe, and sun-flecks where light gets
 * through. Translucent plum, so the ground's own colour shows through it.
 */
function shadeGeometry(L: Layout) {
  const shiftX = Math.round(L.crown.rx * 0.34), shiftY = 8;
  const blobs = L.masses.map((m) => ({ x: m.x + shiftX, y: L.baseY + shiftY + (m.y - L.crown.y) * 0.32, rx: m.rx * 0.98, ry: m.ry * 0.46 }));
  const x0 = Math.floor(Math.min(...blobs.map((b) => b.x - b.rx * 1.15))) - 2, x1 = Math.ceil(Math.max(...blobs.map((b) => b.x + b.rx * 1.15))) + 2;
  const y0 = Math.floor(Math.min(...blobs.map((b) => b.y - b.ry * 1.15))) - 2, y1 = Math.ceil(Math.max(L.H, ...blobs.map((b) => b.y + b.ry * 1.15))) + 2;
  return { blobs, x0, y0, w: x1 - x0, h: y1 - y0 };
}

function shadeDef(prop: MapProp): SpriteDef {
  const L = layout(prop);
  const { blobs, x0, y0, w, h } = shadeGeometry(L);
  return {
    w, h, layer: "floor",
    // The same ground point as the tree: the footprint's bottom-centre.
    anchor: [L.ax - x0, L.H - 1 - y0],
    draw: (p) => {
      const flecks: Ellipse[] = [];
      const area = blobs.reduce((s, b) => s + b.rx * b.ry, 0);
      for (let k = 0; k < Math.round(area / 260); k++) {
        const b = blobs[Math.floor(hash(k, 1, L.seed) * blobs.length)];
        const a = hash(k, 2, L.seed) * Math.PI * 2, d = Math.sqrt(hash(k, 3, L.seed)) * 0.85;
        flecks.push({ x: b.x + Math.cos(a) * b.rx * d, y: b.y + Math.sin(a) * b.ry * d, rx: 1.5 + hash(k, 4, L.seed) * 2.5, ry: 1 + hash(k, 5, L.seed) * 1.2 });
      }
      const inFleck = (x: number, y: number) => flecks.find((f) => ((x + 0.5 - f.x) / f.rx) ** 2 + ((y + 0.5 - f.y) / f.ry) ** 2 <= 1);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const x = i + x0, y = j + y0;
        let d = Infinity;
        for (const b of blobs) d = Math.min(d, Math.hypot((x + 0.5 - b.x) / b.rx, (y + 0.5 - b.y) / b.ry));
        d += (noise2(x, y, L.seed, 7, 4) - 0.5) * 0.34;
        if (d > 1.08) continue;
        const f = inFleck(x, y);
        const core = d < 0.86;
        if (f && (!core || Math.max(f.rx, f.ry) > 2.6)) continue; // full sun
        p.faded(core && !f ? 0.32 : 0.17, () => p.px(i, j, "plum1"));
      }
    },
  };
}

// ── emit one sprite per tree prop, plus its shade ──────────────────────────────

function treeDef(prop: MapProp): SpriteDef {
  const draw = prop.id === "town.junction" ? drawCamphor : prop.id === "town.south-fig" ? drawFig : null;
  const { W, H, ax, fpx } = layout(prop);
  const spec = planeSpec(prop);
  return {
    w: W, h: H, frames: 4, fps: 2,
    anchor: [ax, H - 1],
    // Only the trunk is solid; the map footprint keeps people off the grate.
    foot: [-Math.round(fpx / 4), -Math.round(fpx * 0.75), Math.round(fpx / 2), Math.round(fpx / 2)],
    draw: (p, frame) => (draw ? draw(p, frame, prop) : drawPlane(p, frame, prop, spec)),
  };
}

/** A tree and its shade for each prop, by sprite id. */
export const treeSprites = (props: readonly MapProp[]): Record<string, SpriteDef> => Object.fromEntries(props.flatMap((prop) => [
  [propSpriteId(prop.map, prop.id), treeDef(prop)],
  [`${propSpriteId(prop.map, prop.id)}-shade`, shadeDef(prop)],
]));

// Woodland maps' trees are drawn by `woods.ts`.
export default defineSprites(treeSprites(mapProps("all", "tree").filter((p) => !WOODLAND_MAPS.has(p.map))));
