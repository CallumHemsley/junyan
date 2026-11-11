/**
 * What visitors bring and patients keep: the thermos, a jar of flowers, a net of oranges, slippers.
 * Small, warm, specific; each sits on the cabinet, the overbed table or the floor.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { grid } from "./_furn.ts";

/**
 * `ward/thermos`: the aunt's flowered thermos for the elder's hot water, a pale jade tin shell with
 * pink peonies, brass bands, a cork stopper gone dark with steam and a wire bail handle. A strip of
 * white tape on its shoulder is for a name (blank; DOM area x 4–8, y 8–9), and its foot ring has
 * a dent from being set down too hard on the cabinet. Stands on the floor or a table top.
 */
function thermos(p: Px) {
  grid(p, 0, 0, 14, [
    ".....oOOo.....",
    "....oOOOoo....",
    "....oooooo....",
    "...gGGGGGgg...",
    "..gGgggggggg..",
    "..JJJJJjjjjd..",
    "..JWWWWWjjjd..",
    "..JWWWWWjjjd..",
    "..JJJJjjjjjd..",
    "..JJPPjjjjjd..",
    "..JPpPpjjjjd..",
    "..JPyPPjljjd..",
    "..JJPpjlLljd..",
    "..JJllljlljd..",
    "..JJlLjjjjjd..",
    "..JJjjjjPPjd..",
    "..JJjjjPpPpd..",
    "..JJjjjPPyPd..",
    "..JJjjlljPjd..",
    "..JJjlLljjjd..",
    "..JJjjljjjjd..",
    "..JJjjjjjjjd..",
    "..JJjjjjjjjd..",
    "..JJjjjjjjjd..",
    "..gGGGGGgggg..",
    "..ggGg.Ggggg..",
    "...ggggggg3...",
    "..............",
  ], {
    o: "oak2", O: "oak3", g: "gold2", G: "gold4", "3": "gold1", J: "jade6", j: "jade5", d: "jade4",
    W: "white", P: "pink3", p: "pink2", y: "gold4", l: "leaf3", L: "leaf4",
  });
  // The bail handle on its right, the dent in the foot ring.
  p.line(11, 5, 13, 8, "steel3").vline(13, 8, 12, "steel4").line(13, 20, 11, 22, "steel3");
  p.px(7, 25, "gold1");
  p.outline("jade2");
}

/**
 * `ward/flowers`: carnations, pink and white, with a spray of leaves, in a canned-peach jar from
 * the hospital shop, washed out, its paper label scraped off but for a stubborn strip. Stems show
 * through the glass and water. Fits on the cabinet or the overbed table.
 */
function flowers(p: Px) {
  // Stems and leaves first, then the blooms on top.
  for (const [x0, x1] of [[6, 4], [8, 8], [10, 12], [9, 6], [7, 10]] as const) p.line(x0, 19, x1, 9, "leaf2");
  grid(p, 1, 7, 16, [
    "................",
    ".LL..........ll.",
    "lLLl........lLl.",
    ".lll..L....lll..",
    "......Ll........",
    ".....lLl........",
  ], { L: "leaf3", l: "leaf2" });
  const bloom = (x: number, y: number, light: "pink3" | "white", mid: "pink2" | "cream4", deep: "pink1" | "cream3") =>
    grid(p, x, y, 6, [".bab..", "babbab", "aBbaBb", "bbaBbd", ".dbdd.", "..dd.."], { a: light, B: light, b: mid, d: deep });
  bloom(2, 2, "pink3", "pink2", "pink1");
  bloom(10, 3, "pink3", "pink2", "pink1");
  bloom(6, 0, "white", "cream4", "cream3");
  bloom(5, 6, "pink3", "pink2", "pink1");
  // The jar: glass over water, stems slanting through it, the screw-thread rim, a ragged scrap of
  // the old label that would not soak off.
  p.faded(0.85, (q) => q.rect(4, 18, 10, 10, "blue6"));
  p.faded(0.9, (q) => q.rect(4, 21, 10, 7, "blue5"));
  p.faded(0.7, (q) => q.line(7, 18, 6, 27, "leaf3").line(9, 18, 9, 27, "leaf3").line(11, 18, 12, 26, "leaf3"));
  p.hline(5, 16, 8, "steel4").hline(4, 17, 10, "steel5");
  p.hline(5, 21, 8, "blue6");
  p.vline(4, 18, 10, "white").vline(5, 19, 2, "white").vline(13, 18, 10, "steel3");
  grid(p, 5, 24, 8, ["44.4444.", "3444443."], { "4": "cream4", "3": "cream3" });
  p.hline(4, 28, 10, "steel3");
  p.outline("leaf1", { sides: ["top", "left", "right"] });
  p.outline("steel2", { sides: ["bottom"] });
}

/**
 * `ward/oranges`: a red string net of oranges, the visitors' gift everywhere; one has a leaf still
 * on its stalk and one has been taken out of the knot already. Stands on a top or the floor.
 */
function oranges(p: Px) {
  // Each orange lit on its upper left, its lower right rim dark where it rests on the next.
  const orange = (x: number, y: number) => grid(p, x, y, 7, [
    "..YYO..",
    ".YgYOO.",
    "YYYOOOd",
    "YOOOOOd",
    "OOOOOdd",
    ".OOOdd.",
    "..ddd..",
  ], { O: "orange2", Y: "orange3", g: "gold5", d: "orange1" });
  orange(1, 7);
  orange(14, 7);
  orange(7, 5);
  orange(4, 11);
  orange(11, 11);
  // The leaf on its stalk.
  grid(p, 9, 2, 5, ["..LL.", ".LLl.", "k.l..", ".k..."], { L: "leaf4", l: "leaf2", k: "wood2" });
  // The net: strands fanning down from the knot, and two rings round the bulge of the fruit.
  p.over(() => {
    for (const [tx, bx] of [[9, 2], [10, 7], [12, 15], [13, 20]] as const) p.line(tx, 6, bx, 17, "red3");
    for (let x = 0; x < 22; x++) {
      p.px(x, 10 + (Math.abs(x - 11) > 7 ? 1 : 0), "red2");
      p.px(x, 15 - (Math.abs(x - 11) > 8 ? 1 : 0), "red2");
    }
  });
  grid(p, 8, 0, 6, [".rrr..", "r...r.", "r...r.", ".rRr..", "..r..."], { r: "red2", R: "red3" });
  p.outline("orange1");
}

/**
 * `ward/slippers`: the elder's cloth slippers under his bed, blue check toe caps on black rubber
 * soles, the cream insoles showing because he has trodden the heels flat. Layer `floor`.
 */
function slippers(p: Px) {
  const SHOE = [
    "..kkk...",
    ".kBbBk..",
    "kBbBbBk.",
    "kbBbBbBk",
    "kBbBbBbk",
    "kbbbbbbk",
    "k1OOOO1k",
    "kOooooOk",
    "kOooooOk",
    "kOoooo1k",
    ".kbBbbk.",
    "..kkkk..",
  ];
  const shoe = (x: number, y: number, right: boolean) =>
    grid(p, x, y, 8, right ? SHOE.map((r) => [...r].reverse().join("")) : SHOE, { k: "ink", B: "blue4", b: "blue3", "1": "blue2", O: "cream4", o: "cream3" });
  // Kicked off side by side, the right one a step ahead.
  shoe(2, 1, false);
  shoe(12, 0, true);
  // A catch of light on each toe.
  p.px(4, 2, "blue5").px(14, 1, "blue5");
}

export default defineSprites({
  "ward/thermos": { w: 14, h: 28, anchor: [7, 27], foot: [-5, -3, 10, 3], shadow: { rx: 5, ry: 2, dy: -1 }, draw: thermos },
  "ward/flowers": { w: 18, h: 30, anchor: [9, 29], shadow: { rx: 5, ry: 1, dy: -1 }, draw: flowers },
  "ward/oranges": { w: 22, h: 19, anchor: [11, 18], shadow: { rx: 9, ry: 2, dy: -1 }, draw: oranges },
  "ward/slippers": { w: 22, h: 13, anchor: [11, 12], layer: "floor", draw: slippers },
});
