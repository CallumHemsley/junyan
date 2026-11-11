/**
 * The town's two raised flowerbeds, one sprite per `flowerbed` prop (`town/<id>`), each exactly its
 * footprint and flat on the ground (layer `floor`, as the contract puts flowerbed soil): a brick box
 * seen from above with its south face showing, soil inside, and whatever the neighbours have
 * planted in it. Nothing rises past the footprint.
 *
 * Neither bed is a council bed any more. The market verge is the vegetable sellers': marigolds
 * round a staked tomato, scallions and chives for the stall, seedlings in a row. The workshop
 * verge is the mechanic's: hardy things, an old enamel basin of succulents, his trowel.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { art, blade, bloom, mound, star, sticker } from "./_helpers.ts";

const LEAF: Color[] = ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
const SAGE: Color[] = ["jade1", "jade2", "jade3", "jade4", "jade5", "jade6"];
const MARIGOLD: [Color, Color, Color, Color] = ["orange1", "orange2", "orange3", "gold4"];
const MARIGOLD_GOLD: [Color, Color, Color, Color] = ["gold1", "gold3", "gold4", "orange2"];

const RIM = 4, FRONT = 8, INNER = 3;

// ── plants: each draws into its own w×h canvas (see `sticker`) ────────────────────

type Plant = { w: number; h: number; draw: (q: Px, seed: number) => void };

const marigold: Plant = {
  w: 14, h: 11,
  draw: (q, s) => {
    mound(q, 7, 7, 7, 4, LEAF, s);
    const heads: [number, number][] = [[1, 2], [6, 0], [9, 3], [3, 5], [10, 7]];
    heads.forEach(([x, y], i) => bloom(q, x, y, i % 3 === 2 ? MARIGOLD_GOLD : MARIGOLD));
  },
};
const impatiens: Plant = {
  w: 13, h: 9,
  draw: (q, s) => {
    mound(q, 6.5, 5.5, 6.5, 3.5, LEAF, s);
    for (const [x, y] of [[1, 2], [5, 0], [8, 3], [3, 5], [9, 6]] as const) star(q, x, y, "pink3", "pink2", "white");
  },
};
/** Garlic chives gone to flower: a loose fan of blades, white umbels on bare stalks. */
const chives: Plant = {
  w: 13, h: 14,
  draw: (q, s) => {
    for (let i = 0; i < 6; i++) {
      const top = 5 + Math.floor(hash(i, 0, s) * 4);
      blade(q, 6, 13, (i - 2.5) * 2.2, top - 13, i % 2 ? "leaf4" : "leaf3", "leaf2");
    }
    for (const [x, y] of [[1, 0], [7, 1]] as const) {
      q.vline(x + 1, y + 3, 9 - y, "leaf3");
      art(q, x, y, [".wW", "wWw", ".c."], { w: "cream5", W: "white", c: "cream3" });
    }
  },
};
/** Purslane that came up on its own and nobody pulled: a low, sprawling, fleshy mat. */
const purslane: Plant = {
  w: 12, h: 6,
  draw: (q, s) => {
    for (let i = 0; i < 7; i++) {
      const x = 1 + Math.floor(hash(i, 1, s) * 9), y = 1 + Math.floor(hash(i, 2, s) * 3);
      art(q, x, y, ["Hg", "gr"], { H: "leaf4", g: "leaf3", r: "rose3" });
    }
  },
};
const scallions: Plant = {
  w: 18, h: 12,
  draw: (q, s) => {
    // Clumps of two or three, pulled unevenly as the stall needed them.
    for (let x = 1; x < 17; x += 3 + Math.floor(hash(x, 3, s) * 2)) {
      if (hash(x, 4, s) < 0.15) { q.px(x, 10, "cream4").px(x, 11, "cream3"); continue; }
      const top = Math.floor(hash(x, 1, s) * 6);
      const lean = hash(x, 2, s) < 0.5 ? -1 : 1;
      q.vline(x, top + 2, 8 - top, "leaf4");
      q.px(x + lean, top + 1, "leaf4").px(x + lean, top, "leaf5");
      if (top < 4) q.vline(x + 1, top + 4, 6 - top, "leaf3");
      q.px(x, 10, "cream5").px(x, 11, "white");
      if (top < 4) q.px(x + 1, 10, "cream4");
    }
  },
};
const tomato: Plant = {
  w: 18, h: 26,
  draw: (q, s) => {
    // The cane, a strip of rag tying the stem to it, the vine and its fruit.
    q.vline(8, 0, 26, "bamboo3").vline(9, 0, 26, "bamboo2");
    for (const y of [4, 12, 19]) q.vline(8, y, 1, "bamboo1");
    mound(q, 6, 6, 6, 5, LEAF, s);
    mound(q, 12, 12, 6, 5, LEAF, s + 1);
    mound(q, 6, 19, 6, 5, LEAF, s + 2);
    q.hline(7, 9, 4, "cream5").hline(7, 16, 4, "cream4");
    for (const [x, y, ripe] of [[3, 9, false], [12, 15, true], [5, 21, false], [14, 8, false]] as const)
      art(q, x, y, [".sa.", "aAab", "abbb", ".bb."], ripe ? { s: "leaf2", A: "orange3", a: "orange2", b: "orange1" } : { s: "leaf2", A: "jade5", a: "jade4", b: "jade3" });
  },
};
const seedlings: Plant = {
  w: 30, h: 4,
  draw: (q, s) => {
    for (let x = 0; x < 30; x += 4) {
      if (hash(x, 0, s) < 0.15) continue; // one didn't come up
      art(q, x, 0, ["H.H", ".g.", ".g."], { H: "leaf4", g: "leaf3" });
    }
  },
};
const lavender: Plant = {
  w: 13, h: 13,
  draw: (q, s) => {
    mound(q, 6.5, 9, 6.5, 3.5, SAGE, s);
    for (let i = 0; i < 6; i++) {
      const x = 1 + i * 2, top = Math.floor(hash(i, 0, s) * 3);
      q.vline(x, top + 4, 4, "jade3");
      art(q, x, top, ["V", "v", "V", "u"], { V: "plum4", v: "plum3", u: "plum2" });
    }
  },
};
const cosmos: Plant = {
  w: 16, h: 20,
  draw: (q, s) => {
    const heads: [number, number][] = [[2, 1], [9, 0], [12, 6], [5, 7]];
    for (const [x, y] of heads) q.line(x + 1, y + 3, 8, 19, "leaf3");
    for (let y = 8; y < 20; y += 2) { q.px(6 - (y % 4 ? 1 : 0), y, "leaf4"); q.px(10 + (y % 4 ? 1 : 0), y + 1, "leaf3"); }
    heads.forEach(([x, y], i) => art(q, x, y, [".p.", "pcp", ".q."], i === 2 ? { p: "white", c: "gold4", q: "cream3" } : { p: "pink3", c: "gold4", q: "pink2" }));
    void s;
  },
};
const grass: Plant = {
  w: 14, h: 12,
  draw: (q, s) => {
    for (let i = 0; i < 9; i++) blade(q, 7 + (i % 3) - 1, 11, Math.round((i - 4) * 1.6), -6 - Math.floor(hash(i, 0, s) * 5), i % 2 ? "leaf4" : "leaf5", "leaf2");
  },
};

/** An old enamel basin, chipped through to the iron, planted with hen-and-chicks. */
const basin: Plant = {
  w: 20, h: 13,
  draw: (q) => {
    q.ellipse(10, 6, 10, 5, "blue2");
    q.ellipse(10, 6, 9, 4, "cream4");
    q.ellipse(10, 6.5, 8, 3.5, "brown2");
    for (const [x, y] of [[3, 3], [8, 2], [12, 4], [6, 6]] as const) art(q, x, y, [".J.", "JjJ", ".j."], { J: "jade5", j: "jade4" });
    art(q, 14, 2, ["JJ", "jJ"], { J: "jade6", j: "jade4" });
    q.rect(1, 7, 18, 4, "cream4").hline(1, 7, 18, "white").hline(1, 10, 18, "cream2").vline(18, 7, 4, "cream3");
    q.hline(2, 11, 16, "blue2");
    art(q, 5, 8, ["kk.", "kKk"], { k: "ink2", K: "orange1" });
    art(q, 14, 9, ["k"], { k: "ink2" });
  },
};
const trowel: Plant = {
  w: 6, h: 12,
  draw: (q) => art(q, 0, 0, ["..ww..", "..WW..", "..wW..", "..ww..", "..kk..", ".sSss.", ".sSso.", ".sssO.", "..so..", "..oO..", "...b..", "...b.."], { w: "wood3", W: "wood4", k: "steel1", s: "steel3", S: "steel5", o: "orange1", O: "rose3", b: "brown1" }),
};
/** A terracotta pot that cracked in the frost, left lying on its side, and the shard that came off. */
const brokenPot: Plant = {
  w: 14, h: 9,
  draw: (q) => art(q, 0, 0, [
    "..rrrr........",
    ".rSRRRr.......",
    "rSRqqqRr......",
    "rRqbbbqRr.....",
    "rRqbbbbqRr....",
    ".rRqbbbqRr..aa",
    "..rRRRRRr..aRq",
    "...rrrrr....qq",
  ], { r: "rose3", R: "rose4", S: "red5", q: "rose2", b: "brown1", a: "rose4" }),
};
/** A plant label: a split bamboo stick with a blank tag (DOM text never goes here). */
const label: Plant = {
  w: 5, h: 9,
  draw: (q) => art(q, 0, 0, ["wwww.", "wWWwc", "wWWwc", "cccc.", ".b...", ".b...", ".B...", ".B...", ".B..."], { w: "cream5", W: "white", c: "cream3", b: "bamboo3", B: "bamboo2" }),
};

type Planting = readonly (readonly [Plant, number, number])[];

/** [plant, x, y] in soil coordinates, north first so the nearer plants overlap the further ones. */
const BEDS: Record<string, Planting> = {
  "town.market-verge": [
    [tomato, 2, -6], [scallions, 24, 0], [purslane, 40, 12], [chives, 4, 20], [marigold, 20, 14], [marigold, 34, 20],
    [seedlings, 22, 32], [label, 23, 39], [impatiens, 30, 40], [marigold, 1, 42], [purslane, 14, 52],
    [scallions, 3, 60], [impatiens, 24, 58], [chives, 38, 60], [marigold, 28, 74], [impatiens, 4, 76], [purslane, 18, 86],
    [chives, 6, 92], [brokenPot, 36, 98], [impatiens, 20, 96],
  ],
  "town.workshop-verge": [
    [cosmos, 2, -5], [lavender, 22, 4], [purslane, 26, 18], [grass, 4, 20], [marigold, 22, 26], [basin, 8, 46],
    [trowel, 30, 54], [chives, 4, 66], [purslane, 18, 72], [impatiens, 22, 80], [lavender, 4, 94], [marigold, 20, 102],
    [purslane, 6, 112], [grass, 24, 120], [seedlings, 6, 128], [impatiens, 4, 140], [cosmos, 22, 134], [marigold, 20, 154], [label, 6, 154],
  ],
};

function drawBed(p: Px, prop: MapProp, planting: Planting) {
  const { w, h } = footprintPx(prop);
  const seed = Math.round(prop.position.x * 11 + prop.position.y * 7);
  const top = h - FRONT; // the coping ring's outer depth
  // Coping: bricks laid along the rim, lit on their upper-left edges, a few weathered or replaced.
  const brick = (x: number, y: number, bw: number, bh: number, k: number) => {
    const h0 = hash(k, 0, seed);
    const body: Color = h0 < 0.08 ? "stone3" : h0 < 0.3 ? "rose2" : h0 > 0.85 ? "rose4" : "rose3";
    const lit: Color = body === "stone3" ? "stone4" : body === "rose4" ? "red5" : "rose4";
    p.rect(x, y, bw, bh, body).hline(x, y, bw, lit).vline(x, y, bh, lit);
    p.hline(x, y + bh - 1, bw, body === "stone3" ? "stone2" : "rose1").vline(x + bw - 1, y, bh, body === "stone3" ? "stone2" : "rose1");
  };
  p.rect(0, 0, w, top, "stone3");
  let k = 0;
  for (let x = 0; x < w; x += 8) { brick(x, 0, Math.min(8, w - x), RIM, k++); brick(x, top - RIM, Math.min(8, w - x), RIM, k++); }
  for (let y = RIM; y < top - RIM; y += 8) { brick(0, y, RIM, Math.min(8, top - RIM - y), k++); brick(w - RIM, y, RIM, Math.min(8, top - RIM - y), k++); }
  // The north wall's inner face, in shade, then the soil.
  for (let x = RIM; x < w - RIM; x++) for (let j = 0; j < INNER; j++) p.px(x, RIM + j, j === INNER - 1 ? "rose1" : (x + (j ? 4 : 0)) % 8 === 0 ? "stone2" : "rose2");
  const sx = RIM, sy = RIM + INNER, sw = w - RIM * 2, sh = top - RIM - sy;
  p.rect(sx, sy, sw, sh, "brown2");
  // Clods, each lit on top with a shadow under it, and the wall's shadow along the west and north.
  for (let y = sy + 1; y < sy + sh - 1; y += 3) for (let x = sx + ((y >> 1) % 2) * 2; x < sx + sw - 2; x += 4) {
    if (hash(x, y, seed) < 0.45) continue;
    art(p, x, y, ["Bb", "dd"], { B: "brown3", b: "brown2", d: "brown1" });
  }
  p.vline(sx, sy, sh, "brown1").vline(sx + 1, sy, sh, "wood1").hline(sx, sy, sw, "wood1");
  // The south wall's face: two courses of brick in running bond.
  for (let c = 0; c < 2; c++) {
    const y = top + c * 4;
    p.hline(0, y, w, "stone3");
    for (let x = -(c * 4); x < w; x += 8) {
      const body: Color = hash(x, c, seed + 3) < 0.25 ? "rose1" : "rose2";
      p.rect(Math.max(0, x + 1), y + 1, Math.min(7, w - x - 1, x + 8), 3, body);
      if (x + 1 >= 0) p.hline(x + 1, y + 1, 6, "rose3");
    }
  }
  p.hline(0, h - 1, w, "rose1");
  // Moss in the shady joints, and lime bloom on the face.
  art(p, w - 5, top - 10, ["m.", "Mm", ".m"], { m: "leaf2", M: "leaf3" });
  art(p, 6, top + 2, ["cc.c", ".c.."], { c: "cream3" });
  // Planting.
  planting.forEach(([plant, x, y], i) => sticker(p, sx + x, sy + y, plant.w, plant.h, (q) => plant.draw(q, seed + i * 17)));
}

function bedDef(prop: MapProp): SpriteDef {
  const { w, h } = footprintPx(prop);
  return { w, h, anchor: [Math.round(w / 2), h - 1], layer: "floor", draw: (p) => drawBed(p, prop, BEDS[prop.id] ?? []) };
}

export default defineSprites(Object.fromEntries(mapProps("all", "flowerbed").map((prop) => [propSpriteId(prop.map, prop.id), bedDef(prop)])));
