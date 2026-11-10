/**
 * Things the regulars set down beside their stools while they eat. Place them on the floor next
 * to the stool; each is anchored at the middle of its base.
 */
import { defineSprites } from "../../kit/index.ts";

export default defineSprites({
  /**
   * 林姐's market bag, slumped where she set it down: cream cloth with two blue stripes, the
   * handles flopped over, scallions and a bundle of greens poking out the top.
   */
  "char/lin-jie/bag": {
    w: 16, h: 20, anchor: [8, 19], foot: [-5, -3, 10, 3], shadow: { rx: 7, ry: 2 },
    draw: (p) => {
      p.rows(0, 0, [
        "......l..G......",
        ".....lG.Gg......",
        "......GgGg.l....",
        ".....gGgg.lG....",
        "....ngGggGgg....",
        "...nnnggggnn....",
        "..WWwwwwwwwwc...",
        "..WWWwwwwwwwc...",
        "..WWwwwwwwwwwc..",
        "..bbBbbbbbbbbB..",
        "..WWwwwwwwwwwc..",
        "..WWwwwwwwwwwc..",
        "..bbBbbbbbbbbB..",
        "..WWwwwwwwwwwc..",
        "..WWwwwwwwwwwc..",
        "..Wwwwwwwwwwwc..",
        "..wwwwwwwwwwcc..",
        "...cccccccccc...",
        "................",
        "................",
      ], { w: "cream4", W: "cream5", c: "cream2", b: "blue3", B: "blue2", g: "leaf3", G: "leaf4", l: "leaf5", n: "cream5" });
      // A handle flopped over the front.
      p.rows(3, 6, ["..cc....", ".c..c...", "c....c..", "......c."], { c: "cream3" });
      p.outline("ink");
    },
  },

  /**
   * 小周's backpack, dumped on the floor: ochre canvas, a front pocket half unzipped with a pen
   * sticking out, straps sprawled, the little pink charm lying on the floor beside it.
   */
  "char/xiao-zhou/backpack": {
    w: 22, h: 22, anchor: [11, 21], foot: [-8, -4, 16, 4], shadow: { rx: 9, ry: 3 },
    draw: (p) => {
      p.rows(0, 0, [
        "......................",
        ".......ooooooo........",
        ".....oGGGGGGGGo.......",
        "....oGllllllllGo......",
        "....GGGGGGGGGGGGo.....",
        "....GGGGGGGGGGGGo.....",
        "....GoooooooooooGo....",
        "....GGGGGGGGGGGGGo....",
        "...GGGllllllllllGo....",
        "...GGGlbGGGGGGGGGo....",
        "...GGGlbGGGGGGzGGo....",
        "...GGGGGGGGGGGGGGo....",
        "...GGGGGGGGGGGGGGGo...",
        "...GGGGGGGGGGGGGGGo...",
        "...GGGGGGGGGGGGGGGo...",
        "..GoGGGGGGGGGGGGGGo...",
        "..Go.oooooooooooooo...",
        ".Go.............Go....",
        "Go...............Go.p.",
        "o.................opP.",
        "....................P.",
        "......................",
      ], { G: "gold2", o: "gold1", l: "gold4", b: "blue2", z: "steel4", p: "pink2", P: "pink1" });
      p.outline("ink");
    },
  },
});
