/**
 * The town's four benches (ticket 0166), each drawn to its own footprint width and each with an
 * owner who has just stepped away:
 * - bench-0, at the camphor junction: oak slats on bottle-green scroll ends; Grandpa Lin's flowered
 *   thermos stands on it while he does his exercises round the tree.
 * - bench-1, by the market pocket: dark teak on black iron; the morning paper, folded to the
 *   crossword, weighed down with a pair of reading glasses.
 * - bench-2, on the south lane: long, slats painted green and chipped to the wood, one replaced
 *   with a raw new plank; a bamboo birdcage under its cloth, its owner gone for youtiao.
 * - bench-3, short, weathered silver slats on concrete blocks; a glass jar of green tea and a
 *   folded paper fan.
 */
import { defineSprites, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, townProps, townSpriteId } from "../../town/map.ts";
import { OAK, PAINT, TEAK, WEATHERED, art, autoOutline, bench, type Ramp } from "./_helpers.ts";

const H = 40;
const GREEN_SLATS: Ramp = ["jade1", "jade2", "jade3", "jade4", "jade5", "jade6"];

const BENCHES: { wood: Ramp; iron: Ramp; concrete?: boolean; newSlat?: number; story: string }[] = [
  { wood: OAK, iron: PAINT.green, story: "thermos" },
  { wood: TEAK, iron: PAINT.black, story: "paper" },
  { wood: GREEN_SLATS, iron: PAINT.grey, newSlat: 4, story: "birdcage" },
  { wood: WEATHERED, iron: PAINT.grey, concrete: true, story: "tea" },
];

function benchSprite(i: number, w: number): SpriteDef {
  const d = BENCHES[i % BENCHES.length];
  return {
    w, h: H, anchor: [Math.round(w / 2), H - 1],
    foot: [-Math.floor(w / 2) + 2, -9, w - 4, 9], shadow: { rx: Math.floor(w / 2) - 3, ry: 4, dy: -3 },
    draw: (p) => {
      const b = bench(p, { w, h: H, wood: d.wood, iron: d.iron, concrete: d.concrete, newSlat: d.newSlat ?? -1, seed: i * 31 + 7 });
      if (d.wood === GREEN_SLATS) {
        // Old green paint chipped back to grey wood along the slat edges where people sit.
        p.over(() => {
          for (let x = 6; x < w - 6; x += 5 + ((x * 7) % 4)) {
            const y = b.seatTop + ((x * 3) % 3) * 3;
            if (p.get(x, y)?.startsWith("jade")) p.hline(x, y, 2, "cream2").px(x + 1, y + 1, "cream1");
          }
          for (const x of [9, 23, 41, 60, 77]) if (x < w - 4) p.px(x, b.backTop + 2, "cream2").px(x + 1, b.backTop + 2, "cream1");
        });
      }
      autoOutline(p, { map: { jade: "jade1", oak: "wood1", wood: "wood1", steel: "ink", stone: "stone1", cream: "stone1" } });
      const s = b.seatTop + 5; // where things stand on the seat: their bottom row
      if (d.story === "thermos") {
        // A tall enamel thermos, cream with pink peonies, steel cup-cap; a cotton glove beside it.
        const x = Math.round(w * 0.62);
        art(p, x, s - 15, [
          ".kkkk.",
          "k5665k",
          "k4554k",
          "kkkkkk",
          "kWWWck",
          "kWpPck",
          "kWPpck",
          "kWWWck",
          "kWlWck",
          "kWWlck",
          "kWpWck",
          "kPpPck",
          "kWWWck",
          "kWWcck",
          "k3333k",
          ".kkkk.",
        ], { k: "ink2", 3: "steel3", 4: "steel4", 5: "steel5", 6: "steel6", W: "cream5", c: "cream3", p: "pink2", P: "pink3", l: "leaf3" });
        art(p, x - 9, s - 3, ["..ww..", ".wWWw.", "wWWWWw", ".wwww."], { w: "cream3", W: "cream4" });
      } else if (d.story === "paper") {
        // The folded newspaper: abstract ruled columns, no legible text; glasses folded on top.
        const x = Math.round(w * 0.28);
        art(p, x, s - 6, [
          ".kkkkkkkkkkkkk.",
          "kWWWWWWWWWWWWWk",
          "kW11W1111W111Wk",
          "kWWWWWWWWWWWWck",
          "kW1W1W111W1W1ck",
          "kWWWWWWWWWWWWck",
          ".kkkkkkkkkkkkk.",
        ], { k: "stone2", W: "cream4", c: "cream3", 1: "stone4" });
        art(p, x + 6, s - 7, ["kk.kk", "kgkgk", ".k.k."], { k: "ink", g: "blue5" });
      } else if (d.story === "birdcage") {
        // A domed bamboo birdcage, its blue cloth cover lifted on one side; a white-eye on the perch.
        const x = Math.round(w * 0.24);
        art(p, x, s - 17, [
          "......kk......",
          ".....kbbk.....",
          "...kkBBBBkk...",
          "..kBbbbbbbbk..",
          ".kBBbBbBbBbbk.",
          ".kCCCbBbBbBbk.",
          "kCCCCCbBbBbBbk",
          "kCcCCCb.b.b.bk",
          "kCCcCCbGb.b.bk",
          "kCCCcCbgGb.b.k",
          "kCcCCCbbbbbbbk",
          "kCCCCCb.b.b.bk",
          "kCCcCCb.b.b.bk",
          "kCCCCCb.b.b.bk",
          "kCCCCCbbbbbbbk",
          "kkBBBBBBBBBBkk",
          ".kbbbbbbbbbbk.",
          "..kkkkkkkkkk..",
        ], { k: "wood1", b: "bamboo3", B: "bamboo4", C: "blue2", c: "blue3", G: "leaf4", g: "cream5" });
        // The bird's white eye-ring.
        p.px(x + 8, s - 9, "white");
      } else if (d.story === "tea") {
        // A glass jar of green tea, leaves settled at the bottom, and a folded paper fan.
        const x = Math.round(w * 0.58);
        art(p, x, s - 9, [
          ".kkkk.",
          "k3443k",
          "kbbbbk",
          "kBjjbk",
          "kBjjbk",
          "kBJjbk",
          "kjJJjk",
          "kllllk",
          "kllLlk",
          ".kkkk.",
        ], { k: "jade1", 3: "steel3", 4: "steel5", b: "blue6", B: "white", j: "jade5", J: "jade4", l: "leaf2", L: "leaf3" });
        art(p, x - 14, s - 2, ["kkkkkkkkk.", "kbBbBbBbBk", ".kkkkkkkkk"], { k: "wood1", b: "cream4", B: "jade4" });
      }
    },
  };
}

const sprites: Record<string, SpriteDef> = {};
townProps("bench").forEach((prop, i) => { sprites[townSpriteId(prop.id)] = benchSprite(i, footprintPx(prop).w); });

export default defineSprites(sprites);
