/**
 * The dining tables. Four tables for the four places in the room, each a different table with its
 * own history, plus a two-seater and a round family table. Every anchor is the front edge of the
 * front legs on the floor; each doc comment gives the clear plate area on the top.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { boards, bowtie, each, grid, oval, ovalHalves, peg, ROSE, roundCorners, squareLeg, TEA, topEdges } from "./_helpers.ts";

const STEEL = { "1": "steel1", "2": "steel2", "3": "steel3", "4": "steel4", "5": "steel5", "6": "steel6" } as const;

/** One step lighter or darker for a colour inside a ramp, used to light patterned surfaces. */
const LIGHTER: Partial<Record<Color, Color>> = {
  cream3: "cream4", cream4: "cream5", cream5: "white", gold5: "white", gold2: "gold3", gold3: "gold4", gold4: "gold5", jade5: "jade6", jade4: "jade5", jade6: "white",
  steel4: "steel5", steel5: "steel6", blue4: "blue5", blue3: "blue4", rose2: "rose3", rose3: "rose4", rose4: "wood5",
};
const DARKER: Partial<Record<Color, Color>> = {
  white: "cream5", cream5: "cream4", cream4: "cream3", cream3: "cream2", gold5: "gold4", gold4: "gold3", gold3: "gold2", gold2: "gold1",
  jade6: "jade5", jade5: "jade4", jade4: "jade3", blue4: "blue3", blue5: "blue4", rose4: "rose3", rose3: "rose2", rose2: "rose1",
  steel6: "steel5", steel5: "steel4",
};

export default defineSprites({
  /**
   * The two-seater by the window: a little tea-wood table with a drop leaf whose bracket snapped
   * years ago, so it hangs. The owner's daughter drew a crayon sun on it. Plates: x 4–36, y 4–20.
   */
  "furn/table-small": {
    w: 40, h: 45, anchor: [20, 43], foot: [-18, -20, 36, 18], shadow: { rx: 21, ry: 7, dy: -2 },
    draw: (p) => {
      p.rect(3, 1, 34, 1, "wood5").rect(2, 2, 36, 1, "wood4").rect(1, 3, 38, 20, "wood4");
      boards(p, 1, 1, 38, 22, { dir: "h", seams: [7, 14], seed: 51, flush: [26, 9] });
      topEdges(p, 1, 1, 38, 22);
      p.over(() => p.hline(9, 19, 7, "wood5").hline(24, 18, 6, "wood5").hline(26, 8, 4, "wood3"));
      p.hline(1, 23, 38, "wood5").rect(1, 24, 38, 2, "wood3").hline(1, 26, 38, "wood2");
      p.rect(4, 27, 32, 4, "wood2").hline(4, 27, 32, "wood1");
      squareLeg(p, 2, 27, 6, 15, TEA, 4);
      squareLeg(p, 32, 27, 6, 15, TEA, 4);
      // The hanging D-shaped leaf, its grain running across, darker toward its rounded edge.
      const leaf = oval(ovalHalves(30, 28), 5, 10);
      for (let y = 24; y < 39; y++) for (let x = 5; x < 35; x++) if (leaf.inside(x, y)) p.px(x, y, y < 27 ? "wood4" : y > 34 ? "wood2" : "wood3");
      p.over(() => {
        p.vline(5, 26, 6, "wood4").vline(6, 32, 3, "wood4");
        for (const [x, y, n, c] of [[9, 28, 10, "wood4"], [22, 30, 8, "wood2"], [10, 32, 6, "wood2"], [24, 27, 6, "wood4"], [14, 35, 9, "wood1"]] as const) p.hline(x, y, n, c);
        for (let y = 24; y < 39; y++) for (let x = 5; x < 35; x++) if (leaf.inside(x, y) && !leaf.inside(x + 1, y)) p.px(x, y, "wood2");
      });
      // Rusted hinges.
      for (const x of [10, 27]) grid(p, x, 25, 3, ["454", "323", "3o3"], { ...STEEL, o: "orange1" });
      // The crayon sun.
      grid(p, 22, 28, 7, ["o..o..o", "..yyy..", "oyYyyyo", "..yyy..", "o..o..o"], { y: "gold4", Y: "gold5", o: "orange2" });
      p.outline("wood1");
    },
  },

  /**
   * The round family table for big orders, on a turned pedestal with four splayed feet. A split
   * ran across the top one dry winter; it was mended with two butterfly keys. A pale ring where the
   * hot congee pot always goes. Plates: anywhere in x 8–56, y 5–30.
   */
  "furn/table-round": {
    w: 64, h: 64, anchor: [32, 62], foot: [-28, -26, 56, 22], shadow: { rx: 30, ry: 9, dy: -3 },
    draw: (p) => {
      // Feet first: left and right splay outward, the front one comes toward us.
      p.poly([[27, 49], [16, 55], [8, 58], [6, 61], [12, 61], [20, 59], [29, 56]], "wood3");
      p.poly([[37, 49], [48, 55], [56, 58], [58, 61], [52, 61], [44, 59], [35, 56]], "wood2");
      p.line(26, 50, 15, 56, "wood5").line(15, 56, 8, 58, "wood4");
      p.line(38, 50, 49, 56, "wood3").hline(52, 61, 6, "wood1");
      p.rect(6, 60, 7, 2, "wood2").rect(52, 60, 7, 2, "wood1");
      grid(p, 26, 48, 12, [
        "..43333222..",
        ".4433333222.",
        ".4433333222.",
        "..44333322..",
        "..44333322..",
        "..44333322..",
        "..44333322..",
        "..44333322..",
        ".5444333222.",
        ".5443333222.",
        "..22222222..",
        "..33333332..",
        ".4443333322.",
        ".4433333222.",
      ], { "5": "wood5", "4": "wood4", "3": "wood3", "2": "wood2" });
      // Turned column under the top.
      grid(p, 25, 35, 14, [
        "...22222222...",
        "...22222222...",
        "....233322....",
        "...24433322...",
        "..2544333222..",
        "..2544333222..",
        "...24433322...",
        "....443322....",
        "....443322....",
        "...54433322...",
        "...22222222...",
        "...44333322...",
        "..5443333222..",
      ], { "5": "wood5", "4": "wood4", "3": "wood3", "2": "wood2" });
      // The top: an oval with a rim showing under its front curve.
      const top = oval(ovalHalves(62, 34), 1, 1);
      top.fill(p, "wood4");
      boards(p, 1, 1, 62, 34, { dir: "h", seams: [9, 17, 26], seed: 61, flush: [40, 12, 30] });
      for (let y = 0; y < 36; y++) for (let x = 0; x < 64; x++) {
        if (!top.inside(x, y)) continue;
        if (!top.inside(x, y, 1, 1) && x < 40 && y < 22) p.px(x, y, !top.inside(x, y, 2, 2) && x < 30 && y < 10 ? "wood6" : "wood5");
        if (!top.inside(x, y, -1, -1) && x > 36 && y < 26) p.px(x, y, "wood3");
      }
      p.under(() => { top.fill(p, "wood3", 0, 1); top.fill(p, "wood3", 0, 2); top.fill(p, "wood2", 0, 3); });
      p.over(() => {
        for (let x = 0; x < 64; x++) for (let y = 34; y < 38; y++) if (!top.inside(x, y) && top.inside(x, y, 0, 1) && !top.inside(x, y - 1, 0, 1)) p.px(x, y, "wood5");
      });
      // The split and its two butterfly keys.
      grid(p, 30, 2, 4, ["2...", ".2..", ".2..", "..2.", "..2.", "..2.", ".2..", ".2..", "..2.", "..2.", "...2", "...2", "..2.", "..2.", "..2.", "...2", "...2", "..2.", "..2."], { "2": "wood2" });
      bowtie(p, 26, 5);
      bowtie(p, 27, 14);
      // The congee pot's ring.
      p.over(() => grid(p, 41, 18, 12, ["...555555...", ".55......55.", "5..........5", ".55......55.", "...55555...."], { "5": "wood5" }));
      p.outline("wood1");
    },
  },
});
