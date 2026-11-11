/**
 * The town's clipped hedges, one sprite per `hedge` prop (`town/<id>`), each exactly as wide as its
 * footprint. A hedge is a box of small leaves: the clipped top fills the footprint's depth, raised
 * by the hedge's height, and the front face shows below it, so the sprite rises above the
 * footprint by the hedge's height and never spills past it. Long north–south hedges show a long
 * top and a short front at their south end.
 *
 * Two kinds: dark boxwood (黄杨) round the gardens, and lighter privet (女贞) along the lanes,
 * one of them in flower. Each hedge has its own history: the gap a short cut has worn, the dead
 * patch where somebody's mop water goes, the cat's hole, the shuttlecock nobody could reach.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, townProps, townSpriteId, type TownProp } from "../../town/map.ts";
import { TUFTS, art, autoOutline, clamp, leafFace, noise2, wobble } from "./_helpers.ts";

const BOX: Color[] = ["jade1", "jade2", "jade3", "leaf2", "leaf3", "leaf4"];
const PRIVET: Color[] = ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
const DEAD: Color[] = ["wood1", "wood2", "wood3", "oak1", "oak2", "oak3"];
/** Privet's leaves are bigger and looser than box: longer tufts. */
const PRIVET_TUFTS: readonly (readonly string[])[] = [[".3322.", "333222", "322221", ".2211."], [".332..", "333222", ".22221", "..211."], ...TUFTS];

type Feature = "gap" | "dead" | "hole" | "sprigs" | "shuttlecock" | "mitten" | "bloom" | "kerb" | "leaves";
type HedgeSpec = { species: "box" | "privet"; features: readonly (readonly [Feature, number])[] };

/** Feature positions are fractions along the hedge's length (west→east, or north→south). */
const HEDGES: Record<string, HedgeSpec> = {
  "town.hedge-0": { species: "privet", features: [["gap", 0.3], ["hole", 0.62], ["sprigs", 0.15], ["shuttlecock", 0.82], ["leaves", 0.95]] },
  "town.hedge-1": { species: "privet", features: [["dead", 0.42], ["gap", 0.76], ["sprigs", 0.2]] },
  "town.hedge-2": { species: "box", features: [["gap", 0.35], ["hole", 1], ["kerb", 0]] },
  "town.hedge-3": { species: "box", features: [["dead", 0.22], ["leaves", 0.7]] },
  "town.hedge-4": { species: "privet", features: [["bloom", 0], ["hole", 0.35], ["gap", 0.72], ["kerb", 0]] },
  "town.hedge-5": { species: "box", features: [["gap", 0.2], ["hole", 0.41], ["dead", 0.56], ["mitten", 0.86], ["kerb", 0]] },
  "town.hedge-6": { species: "privet", features: [["sprigs", 0.5], ["leaves", 0.3]] },
  "town.hedge-7": { species: "box", features: [["hole", 0.5], ["sprigs", 0.2]] },
  "town.hedge-8": { species: "privet", features: [["dead", 0.3], ["gap", 0.62], ["sprigs", 0.85], ["kerb", 0], ["leaves", 0.1]] },
  "town.hedge-9": { species: "box", features: [["gap", 0.5]] },
  "town.hedge-10": { species: "privet", features: [["dead", 0.7], ["sprigs", 0.3]] },
  "town.hedge-11": { species: "box", features: [["gap", 0.28], ["dead", 0.8], ["leaves", 0.5]] },
};

const TOP_MARGIN = 6; // headroom for untrimmed shoots
const FRONT = 22; // the hedge's height: its front face

function dims(prop: TownProp) {
  const { w, h: fh } = footprintPx(prop);
  const top = Math.max(14, fh - 10);
  return { w, fh, top, h: TOP_MARGIN + top + FRONT };
}

function drawHedge(p: Px, prop: TownProp, spec: HedgeSpec) {
  const { w, top } = dims(prop);
  const seed = Math.round(prop.position.x * 13 + prop.position.y * 29);
  const vertical = prop.height > prop.width;
  const length = vertical ? top : w;
  const ramp = spec.species === "box" ? BOX : PRIVET;
  const leaves = spec.species === "box" ? TUFTS : PRIVET_TUFTS;
  const at = (kind: Feature) => spec.features.filter(([k]) => k === kind).map(([, f]) => Math.round(f * length));
  const kerb = at("kerb").length > 0;
  const y0 = TOP_MARGIN, yf = y0 + top, yb = yf + FRONT - (kerb ? 3 : 0); // top face, front face, base
  const gaps = at("gap"), deads = at("dead");
  const along = (x: number, y: number) => (vertical ? y - y0 : x);
  const near = (list: number[], x: number, y: number, r: number) => list.some((g) => Math.abs(along(x, y) - g) < r);
  const shade = (x: number, y: number) => (near(gaps, x, y, 5) ? -0.35 : near(gaps, x, y, 8) ? -0.15 : 0);
  // Ends: the west/north end catches the sun, the east/south end is in shade.
  const ends = (x: number) => (x < 3 ? 0.14 : x > w - 4 ? -0.2 : 0);
  // The clipped top: lit, unevenly cut, its sunny front shoulder brightest.
  const backEdge = (x: number) => Math.round(wobble(x, seed, 18) * 2);
  const topLight = (x: number, y: number) => {
    const d = y - y0;
    const shoulder = d >= top - 3 ? 0.2 : 0;
    const side = vertical ? (x < 4 ? 0.18 : x > w - 5 ? -0.28 : 0) : ends(x);
    // Soft lumps where the shears went shallow or deep.
    const lump = (wobble(along(x, y), seed + 3, 14) - 0.5) * 0.18 + (wobble((vertical ? x : y) * 3 + along(x, y) * 0.37, seed + 9, 9) - 0.5) * 0.2;
    return (spec.species === "box" ? 0.52 : 0.46) + shoulder + side + lump + shade(x, y) - (d < 3 ? 0.1 : 0);
  };
  leafFace(p, 0, y0, w, top, ramp, topLight, seed, leaves, [4, 3]);
  // Round the corners and wobble the back edge.
  for (let x = 0; x < w; x++) for (let k = 0; k < backEdge(x); k++) p.px(x, y0 + k, null);
  for (const [cx, rows] of [[0, [3, 1, 1]], [w - 1, [3, 1, 1]]] as const) rows.forEach((n, j) => { for (let i = 0; i < n; i++) p.px(cx === 0 ? i : w - 1 - i, y0 + j, null); });
  // The front face: a step darker, darkening to the base.
  const frontLight = (x: number, y: number) => (spec.species === "box" ? 0.36 : 0.28) - ((y - yf) / FRONT) * 0.3 + ends(x) + shade(x, y) * 1.4;
  leafFace(p, 0, yf, w, yb - yf, ramp, frontLight, seed + 11, leaves, [4, 3]);
  // The shear line: the front shoulder catches the sun, the face under it falls into shade.
  for (let x = 1; x < w - 1; x++) if (hash(x, 9, seed) < 0.8) p.px(x, yf, ramp[Math.min(ramp.length - 1, 4 + (x < 4 ? 1 : 0))]);
  // Leggy base: dark hollow under the leaves with the woody stems showing.
  p.rect(1, yb - 3, w - 2, 3, ramp[0]);
  for (let x = 3; x < w - 3; x += 5 + Math.floor(hash(x, 0, seed) * 6)) {
    p.vline(x, yb - 3, 3, hash(x, 1, seed) < 0.6 ? "wood1" : "wood2");
    if (hash(x, 2, seed) < 0.4) p.px(x + 1, yb - 4, "wood1");
  }
  for (let x = 2; x < w - 2; x++) if (hash(x, 3, seed) < 0.35) p.px(x, yb - 4, ramp[1]);
  p.px(0, yb - 1, null).px(w - 1, yb - 1, null);

  // Gaps: where people have pushed through, the hedge thins to twigs.
  for (const g of gaps) {
    if (vertical) {
      // Seen from above: a ragged hollow across the top with twigs crossing it.
      for (let y = y0 + g - 8; y < y0 + g + 8; y++) for (let x = 1; x < w - 1; x++) {
        const edge = Math.abs(y - y0 - g) * 0.8 + wobble(x * 2, seed + g, 4) * 3 + Math.abs(x - w / 2) * 0.25;
        if (edge < 4.5) p.px(x, y, ramp[0]);
        else if (edge < 6.5) p.px(x, y, ramp[1]);
        else if (edge < 7.5) p.px(x, y, ramp[2]);
      }
      p.line(2, y0 + g - 2, w - 4, y0 + g + 1, "wood2").line(4, y0 + g + 2, w - 6, y0 + g - 1, "wood3");
    } else {
      // Seen from the front: the top dips where people push through, the face thins to a twiggy
      // hollow, and the leaves either side are bruised a shade darker.
      const half = 6;
      for (let x = g - half; x < g + half; x++) {
        const dip = Math.round(3 * (1 - Math.abs(x - g + 0.5) / half));
        for (let k = 0; k < dip; k++) p.px(x, y0 + backEdge(x) + k, null);
        for (let y = yf - 4 + Math.abs(x - g); y < yb; y++) {
          const c = hash(x, y, seed + 7);
          if (Math.abs(x - g + 0.5) > half - 1.5) { if (c < 0.5) p.px(x, y, ramp[1]); continue; }
          p.px(x, y, c < 0.12 ? "wood2" : c < 0.8 ? ramp[0] : ramp[1]);
        }
      }
      p.line(g - 4, yb - 1, g + 1, yf + 1, "wood2").line(g + 4, yb - 1, g, yf + 4, "wood3").line(g - 1, yb - 2, g + 3, yf + 6, "wood1");
    }
  }
  // Dead patches: a bite of brown leaves and bare twigs.
  for (const d of deads) {
    const half = 15 + Math.floor(hash(d, 0, seed) * 7);
    // A ragged bite: a blotchy edge from 2-D noise, green tufts surviving inside it, widest on the
    // top and thinning down the front. On a long north–south top it eats in from the shady east side.
    const inside = (x: number, y: number) => {
      const depth = vertical ? Math.max(0, w * 0.3 - x) * 1.2 : Math.max(0, y - yf) * 0.5;
      const ragged = (noise2(x, y, seed + d, 5, 4) - 0.5) * 12 + (hash(x >> 1, y >> 1, seed + d) - 0.5) * 3;
      const survivor = noise2(x, y, seed + d + 1, 4, 3) > 0.78;
      return !survivor && Math.abs(along(x, y) - d) + depth + ragged < half;
    };
    const dead = new Map<string, Color>();
    const scratch = p.clone();
    leafFace(scratch, 0, y0, w, yb - y0, DEAD, (x, y) => (y < yf ? topLight(x, y) : frontLight(x, y)) * 0.8, seed + 31, leaves, [4, 3]);
    for (let y = y0; y < yb; y++) for (let x = 0; x < w; x++) if (p.solid(x, y) && inside(x, y)) dead.set(`${x},${y}`, scratch.get(x, y) ?? "oak2");
    for (const [k, c] of dead) { const [x, y] = k.split(",").map(Number); p.px(x, y, c); }
    for (let k = 0; k < 4; k++) {
      const tx = vertical ? 3 + Math.floor(hash(k, d, seed) * (w - 6)) : d - half + 3 + Math.floor(hash(k, d, seed) * (half * 2 - 6));
      const ty = vertical ? y0 + d - half + 3 + Math.floor(hash(d, k, seed) * (half * 2 - 6)) : y0 + 3 + Math.floor(hash(d, k, seed) * (top - 4));
      art(p, tx, ty, ["w.w", ".w.", ".w."], { w: "wood2" });
    }
  }
  // Untrimmed shoots poking up past the shears.
  for (const s of at("sprigs")) for (let k = 0; k < 3; k++) {
    const x = vertical ? 3 + k * 4 : s + k * 5 - 5, y = vertical ? y0 + s + k * 6 : y0 + backEdge(s + k * 5 - 5) + 1;
    const tall = 3 + Math.floor(hash(k, s, seed) * 4);
    p.vline(x, y - tall, tall, ramp[2]);
    art(p, x - 1, y - tall - 1, ["3.4", ".4."], { 3: ramp[3], 4: ramp[4] });
  }
  // The cat's hole, low in the front, the soil in front of it worn bare.
  for (const h of at("hole")) {
    const x = vertical ? Math.round(w / 2) - 5 : clamp(h - 5, 1, w - 11);
    art(p, x - 1, yb - 11, [
      "....ooooo....",
      "..ooKKKKKoo..",
      ".oKKKkkkKKKo.",
      ".oKkkkkkkkKo.",
      "oKKkkkkkkkKKo",
      "oKkkkkkkkkkKo",
      "oKkkkkkkkkkKo",
      "oKkkkkkkkkkKo",
      "wKkkkkkkkkkKw",
      "Kkkkkkkkkkkkk",
      "Kkkkkkkkkkkkk",
    ], { o: ramp[1], K: "ink2", k: "ink", w: "wood2" });
    // Snapped twigs round the rim and a tuft of ginger fur caught on one.
    art(p, x + 1, yb - 11, ["w........w", ".w......w.", "..........", "o........."], { w: "wood3", o: "orange2" });
  }
  // Privet in flower: creamy sprays on the top and the upper front.
  if (at("bloom").length) for (let y = y0; y < yf + 8; y += 3) for (let x = 2; x < w - 3; x += 4) {
    if (hash(x, y, seed + 51) > 0.18) continue;
    const ox = x + Math.floor(hash(y, x, seed) * 3);
    art(p, ox, y, ["wW", "Ww", ".c"], { w: "cream5", W: "white", c: "cream3" });
  }
  // Fallen plane leaves on the top.
  for (const l of at("leaves")) for (let k = 0; k < 3; k++) {
    const x = vertical ? 3 + Math.floor(hash(k, l, seed) * (w - 8)) : clamp(l + k * 7 - 7, 1, w - 6);
    const y = vertical ? y0 + clamp(l + k * 9 - 9, 2, top - 5) : y0 + 3 + Math.floor(hash(l, k, seed) * (top - 7));
    art(p, x, y, [".a.a", "aaAb", ".bb."], { a: k === 1 ? "bamboo3" : "oak3", A: k === 1 ? "bamboo4" : "oak4", b: "oak2" });
  }
  // A shuttlecock lodged on top since the summer.
  for (const s of at("shuttlecock")) art(p, s, y0 + Math.round(top / 2) - 1, ["ww...", "wWWbo", "ww..O"], { w: "white", W: "cream4", b: "blue3", o: "oak4", O: "oak3" });
  // A child's knitted mitten someone found and set on top where its owner would see it.
  for (const m of at("mitten")) art(p, m, y0 + Math.round(top / 2) - 3, [".pp..", "pPPp.", "pPPPp", "pPPpq", "cCc.."], { p: "pink2", P: "pink3", q: "pink1", c: "cream5", C: "white" });
  // A low granite kerb along the lane.
  if (kerb) {
    p.hline(0, yb, w, "stone5").rect(0, yb + 1, w, 2, "stone3");
    for (let x = 23; x < w; x += 24 + Math.floor(hash(x, 0, seed) * 8)) p.vline(x, yb, 3, "stone2");
    p.px(w - 1, yb + 1, "stone2").px(w - 1, yb + 2, "stone2");
  }
  autoOutline(p, { map: { leaf: "leaf1", jade: "jade1", oak: "wood1", bamboo: "wood1", wood: "wood1", stone: "stone1" } });
}

function hedgeDef(prop: TownProp): SpriteDef {
  const { w, h, fh } = dims(prop);
  const spec = HEDGES[prop.id] ?? { species: "box", features: [] };
  return {
    w, h, anchor: [Math.round(w / 2), h - 1],
    foot: [-Math.round(w / 2), -fh, w, fh],
    shadow: { rx: Math.max(6, Math.round(w / 2)), ry: 4, dy: -2 },
    draw: (p) => drawHedge(p, prop, spec),
  };
}

export default defineSprites(Object.fromEntries(townProps("hedge").map((prop) => [townSpriteId(prop.id), hedgeDef(prop)])));
