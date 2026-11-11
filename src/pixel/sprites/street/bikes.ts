/**
 * The town's parked bicycles (ticket 0166), plus a scatterable electric scooter.
 * - bike-0, outside the breakfast shop: a black Flying Pigeon roadster from the 1980s, gold
 *   pinstripes worn to ghosts; a string bag of steamed buns hangs from the bars, a flattened
 *   cardboard box is strapped to the carrier.
 * - bike-1, in the service lane: a modern share bike in blue and grey, its basket empty but for a
 *   crumpled receipt.
 * - bike-2, in the west lane: a bottle-green ladies' step-through with a woven bamboo child seat on
 *   the carrier and a cloth cushion in it.
 * - bike-3, by the canal: a rusting roadster facing left with a fishing rod lashed along the top
 *   tube and a wicker basket holding a tin bait box.
 */
import { defineSprites, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, propSpriteId } from "../../world/maps.ts";
import { PAINT, art, autoOutline, bicycle, flipInPlace, type BikeStyle, type Ramp } from "./_helpers.ts";

const H = 40;
const BIKES: { style: BikeStyle; frame: Ramp; facing: "right" | "left"; story: string }[] = [
  { style: "roadster", frame: PAINT.black, facing: "right", story: "buns" },
  { style: "share", frame: PAINT.blue, facing: "left", story: "basket" },
  { style: "stepthrough", frame: PAINT.green, facing: "right", story: "childseat" },
  { style: "roadster", frame: PAINT.black, facing: "left", story: "fishing" },
];

function bikeSprite(i: number, w: number): SpriteDef {
  const d = BIKES[i % BIKES.length];
  return {
    w, h: H, anchor: [Math.round(w / 2), H - 1],
    foot: [-Math.floor(w / 2) + 2, -6, w - 4, 6], shadow: { rx: Math.floor(w / 2) - 2, ry: 3, dy: -2 },
    draw: (p) => {
      const k = bicycle(p, { style: d.style, w, h: H, frame: d.frame, seed: i * 17 + 3 });
      const { rear, front, headTop, seatTop, rack } = k;
      if (d.story === "buns") {
        // Cardboard flattened and tied onto the carrier with rubber strap.
        art(p, rear[0] - 10, rack - 4, [
          "kkkkkkkkkkkkkkkk",
          "kCCCCCCCCCCCCCck",
          "kcccccrrcccccccK",
          "kkkkkkrrkkkkkkkk",
        ], { k: "oak1", C: "oak4", c: "oak3", K: "wood1", r: "ink2" });
        // String bag of buns hanging from the bars.
        art(p, headTop[0] - 8, headTop[1] - 4, [
          "..s....",
          ".s.s...",
          "s...s..",
          "wWwWw..",
          "WwWwWw.",
          "wWwWwW.",
          ".wWwW..",
        ], { s: "cream3", w: "cream4", W: "white" });
      } else if (d.story === "basket") {
        // A grey plastic basket on its bracket at the head tube, its floor resting on the bars.
        p.line(headTop[0] + 2, headTop[1] - 2, headTop[0] + 1, headTop[1] + 2, "steel2");
        p.line(headTop[0] + 8, headTop[1] - 2, headTop[0] + 2, headTop[1] + 3, "steel2");
        art(p, headTop[0], headTop[1] - 8, [
          "kkkkkkkkkk",
          "k66666665k",
          "k5.5.5.54k",
          "k45454544k",
          "k4.4.4.43k",
          "kkkkkkkkkk",
        ], { k: "steel1", 3: "steel3", 4: "steel4", 5: "steel5", 6: "steel6" });
        p.px(headTop[0] + 5, headTop[1] - 9, "cream5").px(headTop[0] + 6, headTop[1] - 9, "cream4");
        // The lock box on the rear wheel, with its little status light off.
        art(p, rear[0] - 3, rear[1] - 5, ["kkkkk", "k554k", "k4j3k", "kkkkk"], { k: "steel1", 3: "steel3", 4: "steel4", 5: "steel5", j: "jade4" });
      } else if (d.story === "childseat") {
        // Bamboo child seat on the carrier: woven sides, a back, a faded check cushion.
        art(p, rear[0] - 9, rack - 10, [
          "....kkkk....",
          "...kBbBbk...",
          "...kbBbBk...",
          "...kBbBbk...",
          "kkkkbBbBk...",
          "kBbkpPpPkkk.",
          "kbBkPpPpPbk.",
          "kBbbbbbbbBk.",
          "kbBbBbBbBbk.",
          "kkkkkkkkkkk.",
        ], { k: "wood1", b: "bamboo3", B: "bamboo4", p: "pink2", P: "cream4" });
      } else if (d.story === "fishing") {
        // Rust blooms on the chain guard and mudguard; a fishing rod tied along the top tube.
        p.over(() => {
          for (const [x, y] of [[rear[0] + 6, rear[1] + 1], [rear[0] + 10, rear[1] + 2], [rear[0] - 6, rear[1] - 11], [front[0] + 6, front[1] - 9]] as const)
            p.px(x, y, "orange1").px(x + 1, y, "rose2");
        });
        p.line(3, seatTop[1] - 1, w - 9, headTop[1] - 3, "bamboo3");
        p.line(3, seatTop[1], w - 9, headTop[1] - 2, "bamboo1");
        p.px(seatTop[0] - 2, seatTop[1] - 1, "ink2").px(headTop[0] - 6, headTop[1] - 2, "ink2");
        // A wicker basket on the front with a tin bait box.
        art(p, front[0] - 5, headTop[1] - 9, [
          "..kkkk...",
          "..kssk...",
          "kkkkkkkkk",
          "kBbBbBbBk",
          "kbBbBbBbk",
          "kBbBbBbBk",
          ".kkkkkkk.",
        ], { k: "wood1", b: "bamboo2", B: "bamboo3", s: "steel4" });
      }
      if (d.facing === "left") flipInPlace(p);
    },
  };
}

/**
 * An electric scooter (电瓶车) as every courier and grandmother in the lane rides: pale jade
 * bodywork scuffed at the floorboard, a quilted plaid windproof leg cover hung on the front, a
 * mirror bent where it gets knocked, a helmet on the seat. Scatterable extra, 56×38.
 */
const scooter: SpriteDef = {
  w: 56, h: 40, anchor: [28, 39], foot: [-24, -6, 48, 6], shadow: { rx: 25, ry: 3, dy: -2 },
  draw: (p) => {
    // Small fat wheels.
    for (const x of [10, 45]) {
      p.ellipse(x + 0.5, 31.5, 7, 7, "ink").ellipse(x + 0.5, 31.5, 4.5, 4.5, "steel3").ellipse(x + 0.5, 31.5, 2, 2, "steel5");
      p.px(x - 3, 27, "steel2").px(x - 4, 28, "steel2");
    }
    // Body: rear cowl over the back wheel, low floorboard, front column.
    p.poly([[3, 26], [6, 19], [24, 17], [28, 22], [26, 28], [18, 28], [14, 25], [5, 27]], "jade4");
    p.rect(18, 26, 18, 4, "jade3");
    p.hline(18, 26, 18, "jade5");
    p.poly([[33, 29], [36, 12], [42, 10], [44, 14], [41, 29]], "jade4");
    p.over(() => {
      p.line(6, 20, 23, 18, "jade6");
      p.line(37, 13, 35, 27, "jade5");
      p.hline(4, 26, 10, "jade2");
      p.vline(41, 14, 15, "jade2");
      // Scuffs on the floorboard edge.
      p.px(22, 28, "stone4").px(23, 28, "stone4").px(30, 29, "stone4");
    });
    // Seat with a helmet on it.
    art(p, 7, 13, ["..kkkkkkkkkkkk..", ".k22222222222221k", "k1111111111111111"], { k: "ink", 1: "ink2", 2: "steel1" });
    art(p, 11, 6, ["...kkkkk...", "..kWWWWwk..", ".kWWWWWwwk.", ".kWWbbbbwk.", ".kkkkkkkkk."], { k: "steel1", W: "steel6", w: "steel4", b: "blue2" });
    // Handlebar, the knocked mirror, the headlight.
    p.line(36, 9, 45, 8, "steel2").hline(34, 9, 3, "ink2");
    art(p, 42, 1, [".ss", "sSs", ".s.", ".s.", "..s", "..s", "..s"], { s: "steel2", S: "blue5" });
    art(p, 44, 11, ["kk.", "kWk", "kwk", "kk."], { k: "steel1", W: "cream5", w: "gold5" });
    // The quilted plaid leg cover, hung over the bars and tucked round the column.
    art(p, 30, 9, [
      ".kkkkkkk..",
      "kBbBnBbBk.",
      "kbBbnbBbk.",
      "knnnnnnnk.",
      "kBbBnBbBbk",
      "kbBbnbBbBk",
      "kBbBnBbBbk",
      "knnnnnnnnk",
      "kbBbnbBbBk",
      "kBbBnBbBbk",
      "kbBbnbBbBk",
      ".kkkkkkkk.",
    ], { k: "plum1", b: "plum2", B: "plum3", n: "jade2" });
    autoOutline(p, { map: { jade: "jade1", steel: "steel1", ink: "ink", cream: "stone2" } });
  },
};

const sprites: Record<string, SpriteDef> = { "street/e-scooter": scooter };
mapProps("all", "bicycle").forEach((prop, i) => { sprites[propSpriteId(prop.map, prop.id)] = bikeSprite(i, footprintPx(prop).w); });

export default defineSprites(sprites);
