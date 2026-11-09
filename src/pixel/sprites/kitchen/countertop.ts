/**
 * Things on the counter top. Each anchor is where it rests: put it on a counter's top surface
 * (for a counter module anchored at y, the top runs from y - 50 to y - 33; y - 40 sits mid-board).
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { bowlStack, layer, steamerLid, steamerTier } from "./_helpers.ts";

/** A plump 包子, pleats gathered to a twist on top, 9×8 at (x, y). */
function bun(p: Px, x: number, y: number) {
  p.rows(x, y, [
    "..ooooo..",
    ".oWWtWWo.",
    "oWWsWsWWo",
    "oWsWWWsco",
    "oWWWWWWco",
    "oWWWWWcco",
    ".occccco.",
    "..ooooo..",
  ], { o: "cream2", W: "white", t: "cream3", s: "cream4", c: "cream4" });
  p.px(x + 2, y + 2, "white").px(x + 3, y + 1, "cream5");
}

/** A tea egg in its cracked, marbled shell, 7×6 at (x, y). */
function teaEgg(p: Px, x: number, y: number, flip = false) {
  const art = [
    ".oooooo.",
    "oLLmdmmo",
    "oLmdmmdo",
    "omdmmdmo",
    "ommdmmDo",
    ".oDDDDo.",
    "..oooo..",
  ];
  p.rows(x, y, flip ? art.map((r) => [...r].reverse().join("")) : art, { o: "brown1", L: "tan3", m: "tan2", d: "brown2", D: "brown2" });
}

export default defineSprites({
  /**
   * The serving steamer on the counter: two tiers and a lid, the lower tier scorched dark at the
   * rim from sitting on the stove, the upper newer. Anchor at the middle of its base.
   */
  "kitchen/steamer-stack": {
    w: 28, h: 33, anchor: [14, 31], foot: [-12, -6, 24, 6], shadow: { rx: 12, ry: 3, dy: -1 },
    draw: (p) => {
      const q = layer(p, (q) => {
        steamerTier(q, 14, 12, 5.5, 18, 8, 2, -0.55, 1);
        steamerTier(q, 14, 12, 5.5, 10, 8, 1, 0.4, 4);
        steamerLid(q, 14, 12.5, 5.5, 8, 2, 1);
        q.outline("bamboo1");
      });
      p.blit(q, 0, 0);
      // Scorch on the lower tier's foot where it sat too close to the flame.
      p.rows(4, 26, ["..dd.", ".dDDd", "dDdd."], { d: "bamboo1", D: "wood1" });
    },
  },
  /**
   * An open steamer of 包子 on a paper liner, the last of the first batch; one bun has torn and
   * shows a fleck of filling. Anchor at the middle of its base.
   */
  "kitchen/steamer-open": {
    w: 28, h: 24, anchor: [14, 22], foot: [-12, -6, 24, 6], shadow: { rx: 12, ry: 3, dy: -1 },
    draw: (p) => {
      const q = layer(p, (q) => {
        q.ellipse(14, 8, 12.5, 5.5, "bamboo4");
        q.ellipse(14, 8.5, 11, 4.4, "bamboo2");
        // Slatted floor, and a round paper liner a little crumpled.
        for (let x = 4; x < 25; x += 3) q.over(() => q.vline(x, 4, 10, "bamboo1"));
        q.ellipse(14, 9, 9.5, 3.6, "cream4");
        q.over(() => q.hline(7, 7, 6, "cream5").hline(15, 11, 5, "cream3"));
        q.ellipse(14, 8, 12.5, 5.5, null);
        q.ellipse(14, 8, 12.5, 5.5, "bamboo4");
        q.ellipse(14, 8.5, 11, 4.4, "bamboo2");
        q.ellipse(14, 9, 9.5, 3.6, "cream4");
        q.over(() => q.hline(7, 7, 6, "cream5").hline(15, 11, 5, "cream3").hline(5, 9, 2, "cream3"));
        // Far rim, lit.
        q.over(() => { for (let x = 4; x < 24; x++) if (!q.solid(x, 2)) continue; });
        bun(q, 4, 2);
        bun(q, 13, 1);
        bun(q, 8, 6);
        bun(q, 16, 6);
        // The torn one: a fleck of pork and scallion through the split.
        q.rows(19, 8, ["bl", "b."], { b: "brown2", l: "leaf3" });
        steamerTier(q, 14, 12, 5.5, 8, 8, 1, 0.5, 2);
        q.outline("bamboo1");
      });
      p.blit(q, 0, 0);
    },
  },
  /**
   * The tea-egg pot: a brown-glazed clay pot, chipped at the lip to the pale clay, simmering eggs in
   * soy and tea with star anise and a strip of cinnamon bark. Put `fx/steam-small` at (12, 6).
   */
  "kitchen/tea-egg-pot": {
    w: 26, h: 22, anchor: [13, 21], foot: [-11, -6, 22, 6], shadow: { rx: 11, ry: 3, dy: -1 },
    draw: (p) => {
      const q = layer(p, (q) => {
        // Body: a squat round pot, glaze lit upper-left with a long highlight.
        q.ellipse(13, 12, 12, 8, "rose2");
        q.rect(1, 6, 24, 7, "rose2");
        q.ellipse(13, 13.5, 11, 6, "rose2");
        q.over(() => {
          q.vline(4, 9, 7, "rose3").vline(5, 8, 9, "rose4").vline(6, 9, 6, "rose3");
          q.vline(20, 9, 9, "rose1").vline(21, 8, 8, "rose1").hline(6, 18, 14, "rose1");
        });
        // Ear handles.
        q.rows(0, 7, ["rr", "r."], { r: "rose3" }).rows(24, 7, ["rr", ".r"], { r: "rose1" });
        // Mouth and broth.
        q.ellipse(13, 6, 12, 4.5, "rose3");
        q.ellipse(13, 6.3, 10.5, 3.5, "wood1");
        q.over(() => q.hline(6, 4, 5, "wood2").hline(14, 8, 4, "brown2"));
        teaEgg(q, 3, 2);
        teaEgg(q, 10, 4, true);
        teaEgg(q, 16, 1);
        // Star anise and a curl of cinnamon floating.
        q.rows(13, 2, [".b.", "bBb", ".b."], { b: "brown1", B: "brown2" });
        q.rows(8, 8, ["cccc", ".CC."], { c: "brown3", C: "brown2" });
        // Lip, lit at the back, with a chip showing pale clay.
        for (let x = 3; x < 23; x++) q.px(x, x < 13 ? 2 : 2, q.get(x, 2) === null ? null : q.get(x, 2));
        q.hline(5, 1, 16, "rose4").hline(3, 2, 2, "rose4");
        q.rows(18, 9, ["cc.", ".C."], { c: "cream3", C: "cream2" });
        q.outline("rose1");
      });
      p.blit(q, 0, 0);
    },
  },
  /**
   * The cash box: a blue biscuit tin from a long-ago New Year, its flower print worn to the tin on
   * the lid where it's opened a hundred times a day; the lid sits crooked on a banknote corner.
   */
  "kitchen/cash-box": {
    w: 26, h: 18, anchor: [13, 17], foot: [-12, -8, 24, 8], shadow: { rx: 12, ry: 3, dy: -1 },
    draw: (p) => {
      const q = layer(p, (q) => {
        // Body front band.
        q.rect(1, 9, 24, 7, "blue2");
        q.hline(1, 9, 24, "blue3").hline(1, 15, 24, "blue1");
        q.over(() => { for (let x = 3; x < 24; x += 5) q.rows(x, 11, [".w.", "wgw", ".w."], { w: "cream4", g: "gold4" }); });
        q.vline(24, 10, 5, "blue1");
        // Lid, crooked: a pixel up and to the left.
        q.rect(0, 2, 24, 8, "blue3");
        q.hline(1, 1, 22, "blue4").vline(0, 2, 7, "blue4").hline(0, 9, 24, "blue2").hline(1, 10, 23, "blue1");
        q.over(() => {
          for (const [x, y] of [[3, 3], [8, 5], [14, 3], [19, 6], [4, 7]] as const) q.rows(x, y, [".p.", "pyp", ".p."], { p: "pink3", y: "gold4" });
          // Worn to bare tin where thumbs lift it.
          q.rows(10, 6, ["..ss.", ".sSSs", "sSSs.", ".ss.."], { s: "steel4", S: "steel5" });
          q.px(23, 3, "orange1").px(22, 3, "orange1").px(23, 4, "orange1");
        });
        // A banknote corner trapped under the lid.
        q.rows(21, 8, ["jjjjj", "jJJJj", "jjjj."], { j: "jade5", J: "jade4" });
        q.outline("blue1");
      });
      p.blit(q, 0, 0);
      // Two coins left on the counter.
      p.rows(2, 15, [".gg.", "gGGd", ".dd."], { g: "gold4", G: "gold5", d: "gold2" });
    },
  },
  /** Blue-and-white rice bowls, five stacked a little crooked, the second one chipped years ago and kept anyway. */
  "kitchen/bowl-stack": {
    w: 18, h: 23, anchor: [9, 22], foot: [-7, -5, 14, 5], shadow: { rx: 7, ry: 2, dy: -1 },
    draw: (p) => { bowlStack(p, 1, 0, 5, 1); },
  },
  /**
   * Serving trays: a scratched aluminium one on top of the old lacquer tray, whose corner has
   * worn through the red to the wood.
   */
  "kitchen/tray-stack": {
    w: 30, h: 13, anchor: [15, 12], foot: [-14, -8, 28, 8], shadow: { rx: 14, ry: 3, dy: -1 },
    draw: (p) => {
      const q = layer(p, (q) => {
        // Lacquer tray underneath, a pixel lower and to the right.
        q.rect(2, 3, 27, 8, "rose2").hline(2, 10, 27, "rose1").hline(2, 9, 27, "rose3");
        q.rows(26, 8, ["ww.", ".Ww"], { w: "wood4", W: "wood5" });
        // Aluminium tray on top, its rim lit, scratched by a thousand bowls.
        q.rect(0, 1, 27, 7, "steel4");
        q.hline(1, 0, 25, "steel6").vline(0, 1, 6, "steel5").hline(0, 7, 27, "steel2").vline(26, 1, 6, "steel3");
        q.rect(2, 2, 23, 4, "steel5");
        q.over(() => q.line(5, 3, 11, 5, "steel4").line(14, 2, 20, 4, "steel4").hline(17, 5, 5, "steel6").px(8, 2, "steel6"));
        q.outline("steel1");
      });
      p.blit(q, 0, 0);
    },
  },
  /** The order spike, its walnut base worn smooth; three blank slips, one curled, one tea-stained. */
  "kitchen/order-spike": {
    w: 14, h: 24, anchor: [7, 23], foot: [-5, -4, 10, 4], shadow: { rx: 5, ry: 2, dy: -1 },
    draw: (p) => {
      const q = layer(p, (q) => {
        q.ellipse(7, 21, 6, 2.5, "wood2");
        q.ellipse(7, 20, 6, 2.5, "wood4");
        q.over(() => q.hline(3, 19, 4, "wood5"));
        q.vline(7, 1, 19, "steel4").px(7, 0, "steel6").vline(8, 3, 16, "steel2");
        // Slips skewered at angles, two abstract ruled lines each, no writing.
        q.rows(1, 13, ["wwwwwwwwwww", "wrrrrrww.ww", "wwwwwwwwwws", ".ssssssss.."], { w: "cream5", r: "cream3", s: "cream3" });
        q.rows(2, 8, ["..wwwwwwwww", ".wwrrrrwwws", "wwwwwwwwss.", "wssssss...."], { w: "cream4", r: "cream2", s: "cream2" });
        q.rows(3, 3, ["..wwwww...", ".wwrrrwwc.", "wwwwwwwcc.", "wttwwss.c."], { w: "cream5", r: "cream3", s: "cream3", c: "cream4", t: "oak4" });
        q.vline(7, 1, 18, "steel4").vline(8, 3, 14, "steel2");
        q.outline("wood1");
      });
      p.blit(q, 0, 0);
    },
  },
});
