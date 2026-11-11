/**
 * The lane's pot plants, put out by whoever lives nearest: big glazed pots (variant 31), styrofoam
 * fish boxes growing scallions (32), and cracked pots of succulents (33). Every instance is a
 * different plant in a different pot; the variant only sets the kind of container.
 */
import { defineSprites, hash, type Color, type Px } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import {
  FOAM, LEAF, art, autoOutline, lance, pot, scallion, seedOf, stamp, townFoot, townFrame, type Ramp,
} from "./_helpers.ts";

const TERRACOTTA: Ramp = ["rose1", "rose2", "rose3", "rose4", "red5"];
const CELADON: Ramp = ["jade2", "jade3", "jade4", "jade5", "jade6"];
const COBALT: Ramp = ["blue1", "blue2", "blue3", "blue4", "blue5"];
const PICKLE: Ramp = ["wood1", "wood2", "wood3", "wood4", "gold2"];
const PORCELAIN: Ramp = ["cream2", "cream3", "cream4", "cream5", "white"];
const SUCCULENT: Ramp = ["jade2", "jade3", "jade4", "jade5", "jade6"];

/** A rounded leaf blob, for bushes: tones 1..5 on a ramp. */
const LEAF_BLOB = [".23.", "2344", "2343", ".22."];
const LEAF_SMALL = ["34", "23"];

/** A dense bush of small leaves filling an ellipse, darker inside and below, lit upper left. */
function bush(p: Px, cx: number, cy: number, rx: number, ry: number, seed: number, ramp: Ramp = LEAF): void {
  p.ellipse(cx, cy, rx, ry, ramp[0]);
  p.ellipse(cx - 0.5, cy - 0.5, rx - 1, ry - 1, ramp[1]);
  const spots: [number, number][] = [];
  for (let y = Math.floor(cy - ry); y < cy + ry - 2; y += 2)
    for (let x = Math.floor(cx - rx) + ((y & 2) ? 1 : 0); x < cx + rx - 2; x += 3) {
      const u = (x + 2 - cx) / rx, v = (y + 2 - cy) / ry;
      if (u * u + v * v < 0.9) spots.push([x, y]);
    }
  for (const [x, y] of spots) {
    const u = (x + 2 - cx) / rx, v = (y + 2 - cy) / ry;
    const lit = u + v < -0.5 ? 1 : u + v > 0.6 ? -1 : 0;
    stamp(p, x, y, hash(x, y, seed) < 0.5 ? LEAF_BLOB : LEAF_SMALL, ramp, { shift: lit });
  }
}

/** A five-petal flower, 3×3, with a heart. */
function blossom(p: Px, x: number, y: number, petal: Color, shade: Color, heart: Color): void {
  art(p, x, y, [".P.", "PhS", ".S."], { P: petal, S: shade, h: heart });
}

type Plant = (p: Px, f: ReturnType<typeof townFrame>, seed: number) => void;

// ── 31: glazed pots ────────────────────────────────────────────────────────────

/** The cobalt fish-bowl pot by the bistro corner with Mrs Shen's gardenia, in flower, scenting the whole lane. */
const gardenia: Plant = (p, f, seed) => {
  const s = pot(p, 1, f.gy - 17, 19, 18, COBALT, { belly: 2 });
  bush(p, s.cx, s.cy - 8, 10, 8, seed);
  for (const [dx, dy] of [[-6, -12], [2, -14], [5, -8], [-3, -6], [-8, -7]] as const) blossom(p, s.cx + dx, s.cy + dy, "white", "cream3", "gold4");
  // One brown, spent flower, never picked off.
  blossom(p, s.cx + 6, s.cy - 13, "oak3", "oak2", "oak1");
  // A glaze drip frozen below the rim.
  p.over(() => p.vline(5, f.gy - 12, 3, "blue5"));
};

/** A celadon crackle pot with a cymbidium orchid, its long leaves arching, tied to a chopstick stake. */
const orchid: Plant = (p, f) => {
  const s = pot(p, 2, f.gy - 15, 17, 16, CELADON, { belly: 1 });
  const bx = Math.round(s.cx), by = Math.round(s.cy);
  // The stake: a chopstick, its string tie round the flower spike.
  p.vline(bx + 3, by - 26, 26, "wood3").px(bx + 3, by - 26, "wood4");
  for (const pts of [
    [[bx, by], [bx - 5, by - 10], [bx - 10, by - 14], [bx - 11, by - 11]],
    [[bx, by], [bx - 2, by - 16], [bx - 4, by - 24], [bx - 7, by - 26]],
    [[bx + 1, by], [bx + 4, by - 12], [bx + 9, by - 18], [bx + 10, by - 15]],
    [[bx + 1, by], [bx + 3, by - 18], [bx + 6, by - 27]],
    [[bx - 1, by], [bx - 7, by - 6], [bx - 10, by - 4]],
  ] as const) lance(p, pts, { width: 2 });
  // The flower spike, pale green blooms with a plum lip.
  p.vline(bx + 2, by - 22, 16, "leaf3");
  for (const y of [by - 24, by - 19, by - 14]) art(p, bx, y, [".gg.", "gGgg", ".pg."], { g: "leaf4", G: "leaf5", p: "plum3" });
  p.px(bx + 3, by - 18, "cream3").px(bx + 2, by - 18, "cream3");
  // Crackle in the glaze.
  p.over(() => { p.line(5, f.gy - 9, 8, f.gy - 5, "jade3"); p.line(8, f.gy - 5, 7, f.gy - 2, "jade3"); p.line(13, f.gy - 10, 15, f.gy - 7, "jade3"); });
};

/** An old brown pickle jar (酱缸), its lid long lost, with a geranium in it that came from a cutting. */
const geranium: Plant = (p, f, seed) => {
  const s = pot(p, 0, f.gy - 18, 21, 19, PICKLE, { belly: 3 });
  // The jar's two loop ears.
  art(p, 0, f.gy - 14, ["k", "k"], { k: "wood2" });
  art(p, 20, f.gy - 14, ["k", "k"], { k: "wood1" });
  // Round scalloped leaves with a dark zone ring, flower heads on stalks above.
  bush(p, s.cx, s.cy - 6, 9, 6, seed, ["leaf1", "leaf2", "leaf3", "leaf4", "leaf4"]);
  for (const [dx, h] of [[-4, 12], [3, 14], [7, 10]] as const) {
    p.vline(Math.round(s.cx + dx), Math.round(s.cy - 6 - h), h - 4, "leaf2");
    art(p, Math.round(s.cx + dx) - 2, Math.round(s.cy - 9 - h), [".pP.", "pPPp", "PpPp", ".pp."], { p: "pink2", P: "pink3" });
  }
  // A dribble of old soy glaze on the jar's shoulder.
  p.over(() => { p.vline(14, f.gy - 13, 4, "wood4"); p.px(14, f.gy - 9, "gold2"); });
};

/** A blue-and-white pot with a pothos spilling over the rim and down the front, a cutting from the bistro. */
const pothos: Plant = (p, f, seed) => {
  const s = pot(p, 1, f.gy - 16, 19, 17, PORCELAIN, { belly: 2 });
  // Blue painted band and sprigs.
  p.over(() => {
    p.hline(1, f.gy - 9, 19, "blue3").hline(1, f.gy - 8, 19, "blue2");
    for (const x of [4, 10, 15]) art(p, x, f.gy - 6, [".b.", "bBb", ".b."], { b: "blue3", B: "blue2" });
    p.hline(3, f.gy - 2, 15, "blue3");
  });
  bush(p, s.cx, s.cy - 5, 8, 5, seed, ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"]);
  // Trailing vines: heart leaves down the front, one reaching the ground.
  const heart = ["4.4", "343", ".2."];
  for (const [x0, len] of [[4, 10], [14, 14], [9, 6]] as const) {
    for (let j = 0; j < len; j += 3) {
      const x = x0 + ((j / 3) % 2 ? 1 : -1);
      p.vline(x0, Math.round(s.cy) + j, 3, "leaf2");
      stamp(p, x - 1, Math.round(s.cy) + j + 1, heart, LEAF, { legend: {} });
    }
  }
};

// ── 32: styrofoam boxes ────────────────────────────────────────────────────────

/**
 * A styrofoam fish box: bright white, cool shadows, dents and a corner gnawed by something, the
 * fish market's blue stripe faded on its side. Soil to the brim. Returns the soil rectangle.
 */
function foamBox(p: Px, f: ReturnType<typeof townFrame>, seed: number) {
  const W = f.w, G = f.gy, top = 7, front = 10;
  const y = G - front - top + 1;
  p.rect(0, y, W, top, FOAM[3]).hline(0, y, W, FOAM[4]).vline(0, y, top, FOAM[4]);
  p.rect(2, y + 1, W - 4, top - 2, "brown2");
  p.hline(2, y + 1, W - 4, "brown1");
  p.over(() => p.speckle(2, y + 2, W - 4, top - 3, "brown3", 0.18, seed));
  p.rect(0, y + top, W, front, FOAM[2]).hline(0, y + top, W, FOAM[4]).vline(W - 1, y + top, front, FOAM[1]).hline(0, G, W, FOAM[1]);
  // Bead texture: a sparse pattern of pale dots, the faded blue stripe, the dents and the bite.
  p.over(() => {
    for (let j = 2; j < front - 1; j += 2) for (let i = 1 + (j % 4 ? 1 : 0); i < W - 1; i += 4) p.px(i, y + top + j, FOAM[3]);
    p.hline(2, y + top + 3, W - 4, "blue5");
    p.px(6, y + top + 6, FOAM[1]).px(7, y + top + 6, FOAM[1]).px(7, y + top + 5, FOAM[4]);
  });
  p.rect(W - 4, y, 4, 2, null).px(W - 4, y + 2, null).px(W - 5, y, null);
  p.px(W - 3, y + 2, FOAM[1]).px(W - 4, y + 3, FOAM[1]);
  return { x: 2, y: y + 1, w: W - 4, h: top - 2 };
}

/** One scallion leaf: straight from the soil, bending over near the tip toward `lean`. */
function blade(p: Px, x: number, base: number, top: number, lean: number, back: boolean): void {
  const bend = Math.round(top + (base - top) * 0.35);
  const body: Color = back ? "leaf2" : "leaf3";
  p.line(x, base, x, bend, body);
  p.line(x, bend, x + lean, top, body);
  if (!back) p.px(x, Math.round((base + bend) / 2), "leaf4").px(x, bend + 1, "leaf4");
  p.px(x + lean, top, back ? "leaf3" : "leaf4");
}

/** Grandpa Wang's scallions in their fish box, thick as a fist, pinched every morning for his noodles. */
const scallions: Plant = (p, f, seed) => {
  const soil = foamBox(p, f, seed);
  // Back row darker, front row lit; white feet showing at the soil line.
  for (let row = 0; row < 2; row++) for (let i = 0; i < 8; i++) {
    const x = soil.x + 1 + i * 2 + row, base = soil.y + 1 + row * 2;
    const top = base - 12 - Math.floor(hash(i, row, seed) * 10);
    const lean = [-2, -1, 1, 2, 0, -1, 1, 2][(i + row * 3) % 8];
    blade(p, x, base, top, lean, row === 0);
    if (row === 1) p.px(x, base - 1, "cream4");
  }
  // One stalk flopped over the rim.
  p.line(soil.x + 13, soil.y + 2, soil.x + 18, soil.y + 5, "leaf3").px(soil.x + 18, soil.y + 6, "leaf4");
};

/** The same, just harvested: a row of cut stubs, a few uncut, the kitchen scissors left on the rim. */
const cutScallions: Plant = (p, f, seed) => {
  const soil = foamBox(p, f, seed);
  for (let i = 0; i < 6; i++) {
    const x = soil.x + 1 + i * 3, base = soil.y + 3;
    if (i === 1 || i === 4) scallion(p, x, base, base - 16 - i, i === 1 ? -1 : 1);
    else { p.vline(x, base - 3, 3, "leaf3"); p.px(x, base - 3, "leaf4"); p.px(x, base - 4, "cream4"); }
  }
  // Scissors: two loops of orange plastic and a steel blade.
  art(p, soil.x + 9, soil.y - 1, [
    "oo.oo..",
    "o.oo.ss",
    "oo.oosS",
  ], { o: "orange2", s: "steel4", S: "steel5" });
};

/** Coriander gone to flower in a fish box, feathery and pale, forgotten by whoever planted it. */
const coriander: Plant = (p, f, seed) => {
  const soil = foamBox(p, f, seed);
  const sprig = [".4.", "434", ".2."];
  for (let i = 0; i < 5; i++) {
    const x = soil.x + 2 + i * 4, base = soil.y + 2, top = base - 9 - Math.floor(hash(i, 2, seed) * 6);
    const lean = i % 2 ? 1 : -1;
    p.line(x, base, x + lean, top, "leaf2");
    stamp(p, x + lean - 1, top - 1, sprig, LEAF);
    stamp(p, x - 2, Math.round((base + top) / 2), sprig, LEAF, { shift: -1 });
    stamp(p, x + 1, base - 3, sprig, LEAF);
  }
  // Two stems bolted to flower: tiny white umbels high above the leaves.
  for (const [dx, h] of [[5, 20], [13, 17]] as const) {
    const x = soil.x + dx, base = soil.y + 2;
    p.line(x, base, x + 1, base - h, "leaf3");
    art(p, x - 1, base - h - 2, ["w.w.", ".www", "..l."], { w: "white", l: "leaf3" });
  }
};

// ── 33: cracked pots ───────────────────────────────────────────────────────────

/** A terracotta pot split down the front, bound with a twist of wire, crowded with echeveria rosettes. */
const echeveria: Plant = (p, f, seed) => {
  const s = pot(p, 2, f.gy - 13, 17, 14, TERRACOTTA, { belly: 1 });
  // The crack and the wire binding.
  p.line(9, f.gy - 9, 11, f.gy - 3, "rose1").line(11, f.gy - 3, 10, f.gy, "rose1");
  p.hline(2, f.gy - 6, 17, "steel3").px(10, f.gy - 7, "steel4").px(11, f.gy - 7, "steel3");
  const rosette = [".454.", "45354", "53135", "45354", ".444."];
  for (const [dx, dy] of [[-7, -5], [-1, -6], [4, -4], [-4, -2], [1, -1]] as const)
    stamp(p, Math.round(s.cx + dx - 2), Math.round(s.cy + dy - 2), rosette, SUCCULENT, { shift: hash(dx, dy, seed) < 0.5 ? 0 : -1 });
  // Pink tips where the sun stresses the leaves.
  for (const [dx, dy] of [[-7, -7], [-1, -8], [5, -6]] as const) p.px(Math.round(s.cx + dx), Math.round(s.cy + dy), "pink2");
};

/**
 * A pot with its front broken away, the soil showing in section, and a jade plant (crassula) grown
 * woody and lopsided out of it. Someone set the broken shard back against it.
 */
const jadePlant: Plant = (p, f) => {
  const s = pot(p, 2, f.gy - 13, 17, 14, TERRACOTTA, { belly: 1 });
  // The broken-out front: soil in section, a jagged edge.
  art(p, 6, f.gy - 9, [
    "r.......r",
    "bb.r.r.bb",
    "bBbbbbbBb",
    "bbBbbBbbb",
  ], { r: "rose1", b: "brown1", B: "brown2" });
  // The trunk and branches, woody, with fat oval leaves.
  const tx = Math.round(s.cx);
  p.line(tx, Math.round(s.cy), tx - 2, Math.round(s.cy) - 10, "wood3").line(tx + 1, Math.round(s.cy), tx - 1, Math.round(s.cy) - 10, "wood2");
  p.line(tx - 1, Math.round(s.cy) - 6, tx + 6, Math.round(s.cy) - 13, "wood3");
  p.line(tx - 2, Math.round(s.cy) - 8, tx - 7, Math.round(s.cy) - 12, "wood3");
  const leaf = [".45.", "4553", "3442", ".22."];
  for (const [dx, dy] of [[-10, -16], [-6, -18], [-3, -14], [2, -19], [5, -16], [8, -13], [-9, -11], [3, -12]] as const)
    stamp(p, tx + dx, Math.round(s.cy) + dy, leaf, SUCCULENT, { outline: "jade1" });
  for (const [dx, dy] of [[-8, -15], [6, -15]] as const) p.px(tx + dx, Math.round(s.cy) + dy, "rose4");
  // The shard leaning against the foot of the pot.
  art(p, 15, f.gy - 3, ["..rR", ".rRr", "rrr."], { r: "rose3", R: "rose4" });
};

/** A cracked green-glazed pot of aloe, its spikes splayed, one snapped off for a burn last week. */
const aloe: Plant = (p, f) => {
  const s = pot(p, 2, f.gy - 13, 17, 14, ["jade1", "jade2", "jade3", "jade4", "jade5"], { belly: 1 });
  p.line(6, f.gy - 8, 7, f.gy - 2, "jade1").line(7, f.gy - 2, 6, f.gy, "jade1");
  const bx = Math.round(s.cx), by = Math.round(s.cy);
  for (const pts of [
    [[bx, by], [bx - 6, by - 10], [bx - 9, by - 13]],
    [[bx, by], [bx - 2, by - 14], [bx - 3, by - 19]],
    [[bx + 1, by], [bx + 3, by - 16], [bx + 5, by - 20]],
    [[bx + 1, by], [bx + 7, by - 9], [bx + 10, by - 11]],
    [[bx, by], [bx + 1, by - 9]],
  ] as const) lance(p, pts, { width: 3, ramp: ["jade1", "jade2", "jade3", "jade4", "jade5"] });
  // Pale spots on the leaves and the snapped stub with its dried end.
  for (const [dx, dy] of [[-4, -8], [3, -12], [-2, -12], [6, -8]] as const) p.px(bx + dx, by + dy, "jade6");
  p.px(bx + 1, by - 9, "bamboo3").px(bx + 1, by - 10, "bamboo2");
};

const PLANTS: Record<string, Plant> = {
  "town.planter-0": gardenia,
  "town.planter-3": orchid,
  "town.planter-5": geranium,
  "town.planter-8": pothos,
  "town.planter-1": scallions,
  "town.planter-6": cutScallions,
  "town.planter-9": coriander,
  "town.planter-2": echeveria,
  "town.planter-4": jadePlant,
  "town.planter-7": aloe,
};

const BY_VARIANT: Record<number, Plant[]> = { 31: [gardenia, orchid, geranium, pothos], 32: [scallions, cutScallions, coriander], 33: [echeveria, jadePlant, aloe] };

function planter(prop: MapProp, i: number) {
  const f = townFrame(prop, 26);
  const plant = PLANTS[prop.id] ?? (BY_VARIANT[prop.variant] ?? BY_VARIANT[31])[i % 3];
  return {
    w: f.w, h: f.h, anchor: f.anchor, foot: townFoot(prop), shadow: { rx: 9, ry: 3, dy: -3 },
    draw: (p: Px) => {
      plant(p, f, seedOf(prop.id));
      autoOutline(p, { map: { cream: "ink2", white: "steel2", steel: "steel2", rose: "rose1", red: "rose1", orange: "brown1" } });
    },
  };
}

export default defineSprites(Object.fromEntries(mapProps("all", "planter").map((prop, i) => [propSpriteId(prop.map, prop.id), planter(prop, i)])));
