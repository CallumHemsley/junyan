/**
 * Street pieces flat on the ground (ticket 0166), all `layer: "floor"`: the drain grates and
 * long stone gutters from the town map, plus scatterable extras: a water meter cover and a manhole.
 * North–south runs are the same drawing laid on its side.
 */
import { defineSprites, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, townProps, townSpriteId, type TownProp } from "../../town/map.ts";
import { art, grate, gutter, seedOf, strip } from "./_helpers.ts";

function floorPiece(prop: TownProp, draw: (q: import("../../kit/index.ts").Px, len: number, depth: number, seed: number) => void): SpriteDef {
  const { w, h } = footprintPx(prop);
  const vertical = h > w;
  const seed = seedOf(prop.id);
  return {
    w, h, anchor: [Math.round(w / 2), h - 1], layer: "floor",
    draw: (p) => { strip(p, vertical ? h : w, vertical ? w : h, vertical, (q) => draw(q, vertical ? h : w, vertical ? w : h, seed)); },
  };
}

const sprites: Record<string, SpriteDef> = {};
for (const prop of townProps("drain")) {
  sprites[townSpriteId(prop.id)] = floorPiece(prop, (q, len, depth, seed) => {
    grate(q, len, depth, seed);
    // What the morning dropped: a plane leaf caught across the bars, a bottle cap, a youtiao bag.
    const x = 6 + (seed % Math.max(1, len - 20));
    if (seed % 3 === 0) art(q, x, 2, [".oO", "oOo", "Oo."], { o: "oak2", O: "oak4" });
    if (seed % 3 === 1) art(q, x, 3, ["sS", "Ss"], { s: "gold2", S: "gold4" });
    if (seed % 3 === 2) art(q, x, 2, ["wwW", "wWw"], { w: "cream4", W: "white" });
  });
}
for (const prop of townProps("gutter")) sprites[townSpriteId(prop.id)] = floorPiece(prop, gutter);

/** A square cast-iron water meter cover, a raised diamond pattern, the hinge rusted. 14×10. */
sprites["street/water-meter"] = {
  w: 14, h: 10, anchor: [7, 9], layer: "floor",
  draw: (p) => {
    p.rect(0, 0, 14, 10, "stone3").hline(0, 0, 14, "stone4").hline(0, 9, 14, "stone2");
    p.rect(1, 1, 12, 8, "steel2");
    for (let y = 2; y < 8; y++) for (let x = 2; x < 12; x++) if ((x + y) % 3 === 0 || (x - y + 30) % 3 === 0) p.px(x, y, "steel3");
    p.hline(1, 1, 12, "steel3").hline(1, 8, 12, "steel1").vline(12, 1, 8, "steel1");
    p.rect(5, 4, 4, 2, "steel1").hline(5, 4, 4, "steel4");
    p.px(2, 8, "orange1").px(3, 8, "rose2").px(11, 1, "orange1");
  },
};

/** A round manhole cover, foreshortened: concentric rings, two pick holes, polished by tyres. 28×18. */
sprites["street/manhole"] = {
  w: 28, h: 18, anchor: [14, 17], layer: "floor",
  draw: (p) => {
    p.ellipse(14, 9, 14, 9, "stone2");
    p.ellipse(14, 9, 12.5, 7.8, "steel2");
    p.ellipse(14, 9, 10, 6, "steel3");
    p.ellipse(14, 9, 8.5, 5, "steel2");
    p.ellipse(14, 9, 6, 3.4, "steel3");
    p.ellipse(14, 9, 3, 1.8, "steel2");
    p.over(() => {
      // Tyre-polished arc on the lit side, and a rust crescent in the shade.
      for (let a = 3.6; a < 4.9; a += 0.05) p.px(Math.round(14 + Math.cos(a) * 10.8), Math.round(9 + Math.sin(a) * 6.6), "steel5");
      for (let a = 0.3; a < 1.4; a += 0.06) p.px(Math.round(14 + Math.cos(a) * 12), Math.round(9 + Math.sin(a) * 7.4), "orange1");
    });
    p.px(9, 9, "ink").px(19, 9, "ink");
  },
};

export default defineSprites(sprites);
