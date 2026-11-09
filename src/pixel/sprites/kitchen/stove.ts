/**
 * The stove line against the back wall: one long tiled range, built in place twenty years ago and
 * patched since, carrying the steamers, the wok for 油条 and the soy-milk vat. Every piece stands on
 * the floor with its anchor at the base of its front face, and every piece's front is the same
 * 24 rows (a rolled steel lip, two courses of white tile, a sooty kick), so the line reads as one run.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { STEEL, STEEL_DULL, cylinderBand, eachColumn, layer, steamerLid, steamerTier, stopAt } from "./_helpers.ts";

/** Coals in an arched firebox, 12×12 at (x, y), three flicker frames. */
function firebox(p: Px, x: number, y: number, frame: number) {
  const coals = [
    ["SrRrRoRrRS", "SRoyoRoyoS", "SoywyoywoS"],
    ["SrRRrRoRrS", "SRoRoyoRoS", "SyowyoyoyS"],
    ["SrRrRRrRrS", "SRyoRoRyoS", "SowyoywyoS"],
  ][frame % 3];
  p.rows(x, y, [
    "...SSSSSS...",
    ".SSssssssSS.",
    "SSssiiiissSS",
    "Ssiiiiiiiiss",
    "Siiiiiiiiiis",
    "Siiiirriiiis",
    "Siiirrrriiis",
    "S" + coals[0] + "s",
    "S" + coals[1] + "s",
    "S" + coals[2] + "s",
    "SgsgsgsgsgSs",
    "SSSSSSSSSSSS",
  ], { S: "stone1", s: "stone2", i: "ink2", r: "red1", R: "red3", o: "orange2", y: "gold4", w: "gold5", g: "steel1" });
}

/**
 * White glazed tiles, two courses of 8 in running bond, across x..x+w-1 from row y. Each tile has a
 * glaze highlight top-left and a shaded bottom-right corner; `odd` lists tiles that are different:
 * [course, index, kind] with kind 0 a pale blue replacement, 1 a crack, 2 a grease stain.
 */
function tiles(p: Px, x: number, y: number, w: number, odd: readonly (readonly [number, number, number])[] = []) {
  for (let course = 0; course < 2; course++) {
    const top = y + course * 8, shift = course ? 4 : 0;
    p.hline(x, top, w, "stone4");
    for (let i = 0, tx = x - 8 + shift; tx < x + w; i++, tx += 8) {
      const kind = odd.find(([c, n]) => c === course && n === i)?.[2];
      p.clip(x, top, w, 8, () => {
        p.clip(tx - x, 0, 8, 8, () => {
          p.rect(1, 1, 7, 7, kind === 0 ? "blue6" : "cream4");
          p.vline(0, 1, 7, "stone4");
          p.hline(1, 1, 4, kind === 0 ? "white" : "cream5").vline(1, 2, 2, kind === 0 ? "white" : "cream5");
          p.px(7, 7, kind === 0 ? "blue5" : "cream3").px(6, 7, kind === 0 ? "blue5" : "cream3").px(7, 6, kind === 0 ? "blue5" : "cream3");
          if (kind === 1) p.rows(2, 1, ["c...", ".c..", ".cc.", "...c", "...c", "..c."], { c: "cream2" });
          if (kind === 2) p.rows(1, 3, ["..gg..", ".gGGg.", "gGGGGg", ".gGGg.", "..g..."], { g: "cream3", G: "cream2" });
        });
      });
    }
  }
}

/**
 * The range body: a dark iron deck from row `deck` to the lip, a rolled steel lip at h-24, sixteen
 * rows of tile, a sooty kick-plate, fireboxes at `fires`. `rings` are [x, y] spots where boiled-over
 * water left white mineral rings on the deck.
 */
function range(p: Px, w: number, h: number, deck: number, fires: readonly number[], frame: number, rings: readonly (readonly [number, number])[] = [], odd: readonly (readonly [number, number, number])[] = []) {
  const lip = h - 24, right = w - 2;
  p.rect(1, deck, w - 2, lip - deck, "steel3");
  p.hline(1, deck, w - 2, "steel4").vline(1, deck + 1, lip - deck - 1, "steel4").vline(right, deck + 1, lip - deck - 1, "steel2");
  p.hline(3, deck + 1, 14, "steel5");
  // Polished where the cook's apron rubs the front edge.
  p.hline(4, lip - 1, w - 10, "steel4").hline(10, lip - 2, 16, "steel4");
  for (const [rx, ry] of rings) p.rows(rx, ry, [".ssss.", "s....s", ".ssss."], { s: "stone4" });
  // Rolled steel lip.
  p.hline(1, lip, w - 2, "steel6").hline(1, lip + 1, w - 2, "steel5").hline(1, lip + 2, w - 2, "steel3");
  p.px(right, lip, "steel4").px(right, lip + 1, "steel3").px(right, lip + 2, "steel2");
  for (const x of [9, 10, 37, 51]) p.px(x, lip, "steel5");
  tiles(p, 1, lip + 3, w - 2, odd);
  p.vline(1, lip + 4, 15, "cream5");
  // Kick-plate: soot and mop water.
  p.rect(1, h - 5, w - 2, 4, "stone2").hline(1, h - 5, w - 2, "stone1");
  p.over(() => p.hline(6, h - 3, 7, "stone3").hline(w - 20, h - 2, 9, "stone3"));
  for (const fx of fires) {
    firebox(p, fx, h - 17, frame);
    // Soot breathed up the tiles above the firebox.
    p.over(() => p.rows(fx + 1, lip + 3, ["..cc.cc...", ".cCCccCc..", "..cCcc.c..", "...c..c..."], { c: "cream3", C: "cream2" }));
  }
}

/** A 油条 frying, lying east–west: two fused strands, the lit one on top, 17×7 at (x, y). */
function floatingStick(p: Px, x: number, y: number, flip = false) {
  const art = [
    "..ooooooooooooo..",
    ".oHHhhhHHhhhHhho.",
    "oHhhmhhhhmhhhhmmo",
    "ogmgggmgggggmgggo",
    "ommmhmmmmmhmmmmgo",
    ".ommmmgmmmmmgmmo.",
    "..ooooooooooooo..",
  ];
  p.rows(x, y, flip ? art.map((r) => [...r].reverse().join("")) : art, { o: "gold1", H: "gold5", h: "gold4", m: "gold3", g: "gold2" });
}

/** A finished 油条 standing to drain: two fused strands with a groove, blistered, golden brown. */
function standingStick(p: Px, x: number, top: number, bottom: number, seed: number) {
  for (let y = top; y < bottom; y++) {
    const k = y - top + seed;
    p.px(x, y, k % 5 === 2 ? "gold3" : "gold4").px(x + 1, y, "gold4").px(x + 2, y, k % 4 === 0 ? "gold2" : "orange3");
    p.px(x + 3, y, k % 3 === 1 ? "gold4" : "gold3").px(x + 4, y, k % 5 === 0 ? "orange3" : "orange2");
    // Blisters where the dough puffed in the oil.
    if (k % 6 === 0) p.px(x - 1, y, "gold4").px(x - 1, y + 1, "gold3");
    if (k % 7 === 3) p.px(x + 5, y, "orange2").px(x + 5, y + 1, "orange2");
    if (k % 9 === 4) p.px(x + 1, y, "gold5");
  }
  p.hline(x + 1, top - 1, 3, "gold3").px(x, top, "gold3").px(x + 4, top, "orange3");
}

/** Bubbling oil: each site cycles bead → swell → ring → pop over four frames. */
function bubbles(p: Px, frame: number, sites: readonly (readonly [number, number, number])[]) {
  for (const [x, y, phase] of sites) {
    const stage = (frame + phase) % 4;
    if (stage === 0) p.px(x, y, "gold4");
    if (stage === 1) p.rows(x, y - 1, ["w.", "hh"], { w: "gold5", h: "gold4" });
    if (stage === 2) p.rows(x - 1, y - 1, [".hh.", "h..h", ".hh."], { h: "gold4" });
    if (stage === 3) p.rows(x - 1, y - 1, ["w..w", "....", ".w.."], { w: "gold3" });
  }
}

export default defineSprites({
  /**
   * The hero. Two stacks of bamboo steamers on their boiler pans: the tall one has four tiers, dark
   * with twenty years of steam, except the third, bought last spring and still pale; its lid knob
   * snapped and was re-tied with kitchen string. Behind it, a shorter stack of two. A striped towel
   * hangs over the lip; the left firebox has a cracked tile above it, and one tile is a pale blue
   * replacement. Put `fx/steam-a` on the tall lid at (24, 18) and `fx/steam-b` on the short one at (50, 32).
   */
  "kitchen/stove-steamers": {
    w: 64, h: 88, anchor: [32, 87], foot: [-31, -28, 62, 28], shadow: { rx: 32, ry: 6, dy: -2 },
    frames: 3, fps: 5,
    draw: (p, frame) => {
      range(p, 64, 88, 40, [17, 44], frame, [[50, 58], [5, 46]], [[0, 2, 1], [1, 5, 0], [1, 7, 2]]);
      // A striped cotton towel folded over the lip.
      p.rows(4, 61, [
        "cwwwwwwwc",
        "cwwwwwwwW",
        "cWWWWWWWW",
        "cwwwwwwws",
        "cbbbbbbbs",
        "cwwwwwwws",
        "cbbbbbbbs",
        "cwwwwwwws",
        "cwwwwwwWs",
        "cwwwwwWWs",
        "cwwwwwwWs",
        "cbbbbbbbs",
        "cwwwwwwWs",
        ".cwwwwWs.",
        ".c.w.w.s.",
      ], { c: "cream3", w: "cream5", W: "cream4", b: "blue4", s: "cream2" });
      // Bamboo bun tongs left on the deck.
      p.line(47, 60, 60, 57, "bamboo4").line(47, 61, 60, 58, "bamboo2").px(46, 60, "bamboo1");
      p.outline("steel1");

      // The boiler pans set into the deck: dark water, a bright rolled rim at the front.
      for (const [cx, cy, rx, ry] of [[50, 50, 13.5, 6.5], [24, 55, 21.5, 9.5]] as const) {
        p.ellipse(cx, cy, rx, ry, "steel1");
        p.ellipse(cx, cy, rx - 1, ry - 1, "steel2");
        eachColumn(cx, rx, ry, (x, u, off) => {
          p.px(x, Math.round(cy - off), u < 0 ? "steel4" : "steel3");
          p.px(x, cy + off - 2, stopAt(u, STEEL));
          p.px(x, cy + off - 1, u < 0.3 ? "steel4" : "steel3");
        });
      }

      // The short stack, behind.
      const back = layer(p, (q) => {
        steamerTier(q, 50, 12, 6, 42, 8, 1, 0.45, 2);
        steamerTier(q, 50, 12, 6, 34, 8, 2, -0.5, 5);
        steamerLid(q, 50, 12.5, 6, 32, 2, 1);
        q.outline("bamboo1");
      });
      p.blit(back, 0, 0);
      // The tall stack: old, old, new, old, and the re-tied lid.
      const tall = layer(p, (q) => {
        steamerTier(q, 24, 19, 9, 45, 9, 2, -0.62, 0);
        steamerTier(q, 24, 19, 9, 36, 9, 2, 0.3, 3);
        steamerTier(q, 24, 19, 9, 27, 9, 0, -0.2, 1);
        steamerTier(q, 24, 19, 9, 18, 9, 1, 0.55, 4);
        steamerLid(q, 24, 19.5, 9, 15, 3, 1, true);
        q.outline("bamboo1");
      });
      p.blit(tall, 0, 0);
    },
  },

  /**
   * The wok: a forty-year-old iron wok seasoned black with a blue sheen, two 油条 frying in amber
   * oil, long chopsticks resting on the rim, finished sticks draining upright in a wire rack. Behind
   * it a tiled splash-back stained amber by years of spitting oil, capped with steel. The oil
   * bubbles over four frames.
   */
  "kitchen/wok-station": {
    w: 64, h: 80, anchor: [32, 79], foot: [-31, -26, 62, 26], shadow: { rx: 32, ry: 6, dy: -2 },
    frames: 4, fps: 6,
    draw: (p, frame) => {
      // Splash-back: two courses of tile under a steel cap, spattered with old oil.
      p.rect(1, 4, 62, 3, "steel4").hline(1, 4, 62, "steel6").hline(1, 6, 62, "steel2");
      tiles(p, 1, 7, 62, [[0, 3, 2], [1, 6, 1]]);
      p.rect(1, 23, 62, 4, "cream4");
      tiles(p, 1, 23, 62, [[0, 1, 2], [0, 5, 2], [1, 3, 2]]);
      p.clip(0, 0, 64, 31, () => p.over(() => {
        // Old spits of oil: amber blots, the bigger ones run in a drip down the glaze.
        const blots = [
          [".aa.", "aAAa", "aAA.", ".aa.", "..a.", "..a."],
          ["aa.", "aAa", ".a."],
          [".a", "aA", ".a"],
          ["a"],
        ];
        for (const [x, y, k] of [[12, 11, 0], [21, 9, 1], [27, 15, 2], [8, 19, 1], [33, 20, 0], [16, 24, 2], [24, 26, 1], [38, 11, 2], [30, 9, 3], [5, 26, 3], [19, 16, 3], [35, 26, 3], [42, 22, 1], [14, 17, 3]] as const)
          p.rows(x, y, blots[k], { a: "oak4", A: "oak3" });
      }));
      range(p, 64, 80, 31, [16], frame % 3, [[52, 52]], [[0, 6, 0]]);
      p.outline("steel1");

      // The wok, sunk in the deck: black iron, a blue sheen on the far wall, ear handles.
      p.rows(1, 41, ["ooo", "oso", "o.o", "ooo"], { o: "steel1", s: "steel4" });
      p.rows(40, 41, ["ooo", "oso", "o.o", "ooo"], { o: "steel1", s: "steel3" });
      p.ellipse(22, 44, 19, 10, "steel1");
      p.ellipse(22, 44, 18, 9, "ink2");
      p.ellipse(22, 42, 15, 6, "ink");
      p.rows(9, 37, ["..bbbbbb....pp", ".bBBbb.....pPp", "bb..........p"], { b: "blue1", B: "blue2", p: "plum1", P: "plum2" });
      p.rows(27, 36, ["sss...s", "...ss"], { s: "steel2" });
      // The oil: deep amber pooled in the bowl, a window caught on its far-left.
      p.ellipse(22, 46.5, 13.5, 6, "gold1");
      p.ellipse(22, 46.5, 12.5, 5, "gold2");
      p.rows(11, 42, ["..gggggg", ".gg..GG", "gg"], { g: "gold3", G: "gold4" });
      // Rim: bright on the far-left arc, shading round to the right and front.
      eachColumn(22, 19, 10, (x, u, off) => {
        p.px(x, 44 - off, u < -0.3 ? "steel6" : u < 0.4 ? "steel4" : "steel3");
        p.px(x, 44 + off - 1, u < -0.4 ? "steel4" : u < 0.3 ? "steel3" : "steel2");
      });
      // Two sticks frying, bobbing a pixel out of step.
      const bob = [0, 0, 1, 1][frame], bob2 = [1, 0, 0, 1][frame];
      floatingStick(p, 9, 40 + bob);
      floatingStick(p, 17, 45 + bob2, true);
      bubbles(p, frame, [[11, 49, 0], [15, 50, 2], [29, 42, 1], [32, 45, 3], [26, 51, 0], [10, 46, 3], [20, 52, 1], [33, 49, 2], [8, 44, 1]]);

      // Long cooking chopsticks: tips in the oil, resting on the rim, ends up and to the right.
      p.line(18, 46, 41, 18, "bamboo4").line(19, 46, 42, 18, "bamboo3").line(20, 46, 43, 19, "bamboo1");
      p.line(21, 47, 44, 20, "bamboo4").line(22, 47, 45, 21, "bamboo2");
      p.rows(41, 16, ["rr..", ".rrr", "..r."], { r: "red2" });

      // Draining rack: finished sticks standing in a wire basket over a drip tray.
      const rack = layer(p, (q) => {
        standingStick(q, 47, 17, 50, 0);
        standingStick(q, 55, 21, 50, 5);
        q.outline("orange1");
        q.rect(44, 52, 19, 2, "steel3").hline(44, 52, 19, "steel5");
        q.hline(44, 38, 19, "steel5").hline(44, 50, 19, "steel4");
        for (const x of [44, 47, 50, 53, 56, 59, 62]) q.vline(x, 39, 11, x === 44 ? "steel5" : x === 62 ? "steel2" : "steel4");
        q.hline(44, 44, 19, "steel3");
      });
      rack.outline("steel1", { sides: ["left", "right", "bottom"] });
      p.blit(rack, 0, 0);
    },
  },

  /**
   * The soy-milk vat: a tall steel pot on an iron gas ring. A dent in its belly from the day it fell
   * off the cart; a ladle whose handle the cook wrapped in cloth tape after one burn too many; a brass
   * tap low on the front with a bead of milk; a dried dribble under the rim; an orange gas hose.
   * Put `fx/steam-small` on the rim at (14, 12).
   */
  "kitchen/soymilk-pot": {
    w: 40, h: 84, anchor: [20, 83], foot: [-17, -12, 34, 12], shadow: { rx: 17, ry: 4, dy: -1 },
    frames: 3, fps: 6,
    draw: (p, frame) => {
      // The gas hose curling away to the right.
      p.rows(29, 72, ["..oo....", ".oOOo...", "oO..Oo..", "o....Oo.", ".......Oo", "........o"], { o: "orange1", O: "orange2" });
      // Iron ring stand on three splayed legs.
      const stand = layer(p, (q) => {
        q.ellipse(20, 68, 16, 5, "steel2");
        q.ellipse(20, 67.5, 14, 3.6, "steel1");
        for (const [x, d] of [[5, -1], [19, 0], [33, 1]] as const) {
          q.rect(x, 71, 3, 7, "steel2").vline(x, 71, 7, "steel3");
          q.rect(x + d, 78, 3, 4, "steel2").vline(x + d, 78, 4, "steel3");
        }
        q.hline(5, 75, 30, "steel2");
        q.outline("steel1");
      });
      p.blit(stand, 0, 0);
      const flames = [
        ["b..B..b..B..b..B", "BbdBbBdBbBBdbBdB", "dBBdBBdBBdBBdBBd"],
        [".bB..Bb..bB..B.b", "dBbBdBBbdBbBdBBb", "BdBBdBBdBBdBBdBB"],
        ["B..b.B..b..Bb..B", "bBdBBbdBBbBdBbdB", "dBBdBBdBBdBBdBBd"],
      ][frame];
      p.rows(12, 70, flames, { b: "blue5", B: "blue4", d: "blue3" });

      const vat = layer(p, (q) => {
        cylinderBand(q, 20, 16, 7, 16, 64, STEEL_DULL);
        // Rolled bands near the top and the base.
        eachColumn(20, 16, 7, (x, u, off) => {
          for (const band of [24, 57]) {
            q.px(x, band + off, u < 0.1 ? "steel6" : u < 0.6 ? "steel5" : "steel3");
            q.px(x, band + off + 1, u < 0.5 ? "steel3" : "steel2");
          }
          q.px(x, 63 + off, "steel2");
        });
        // Brushed vertical streaks so the steel isn't a flat fill.
        q.over(() => { for (const [x, y, n] of [[8, 30, 12], [11, 36, 9], [26, 29, 14], [29, 40, 8], [15, 44, 10]] as const) q.vline(x, y, n, x < 16 ? "steel6" : "steel3"); });
        // The dent: a dark crescent, its lit lower lip catching the window.
        q.rows(21, 37, ["..333...", ".33443..", "3344443.", ".3444466", "..6666.."], { 3: "steel3", 4: "steel4", 6: "steel6" });
        // Riveted ear handles.
        q.rows(1, 28, [".sss", "s..s", "s..o", ".sss"], { s: "steel4", o: "steel2" });
        q.rows(35, 28, ["sss.", "o..s", "o..s", "sss."], { s: "steel3", o: "steel2" });
        q.px(5, 29, "steel2").px(5, 31, "steel2").px(34, 29, "steel1").px(34, 31, "steel1");
        // Mouth: rolled rim round soy milk, a wrinkled skin drawn to one side.
        q.ellipse(20, 16, 16, 7, "steel5");
        q.ellipse(20, 16.5, 14, 5.5, "cream4");
        q.ellipse(19, 16.5, 12, 4.4, "cream5");
        q.rows(10, 13, ["..cccc......", ".c....cc....", "c..cc...c...", ".cc..ccc.c..", "....c....c.."], { c: "cream3" });
        eachColumn(20, 16, 7, (x, u, off) => { q.px(x, 16 - off, u < -0.1 ? "steel6" : "steel4"); q.px(x, 16 + off - 1, "steel4"); });
        // A dried dribble down the front from the rim.
        q.vline(13, 23, 1, "cream3").vline(13, 26, 6, "cream3").px(13, 32, "cream2").px(14, 28, "cream3");
        // Brass tap low on the front, a bead of milk at its spout.
        q.rows(24, 50, ["..gg..", "gGGGGd", "gGGGGd", "..Gd..", "..Gd..", "...w..", "...w.."], { g: "gold4", G: "gold3", d: "gold1", w: "cream5" });
        q.outline("steel1");
      });
      p.blit(vat, 0, 0);
      // The ladle: steel handle on the rim, wrapped in blue cloth tape where the hand goes.
      const ladle = layer(p, (q) => {
        q.line(25, 15, 36, 2, "steel5").line(26, 15, 37, 2, "steel3");
        q.rows(32, 0, ["...wb", "..bwb", ".wbw.", "bwb..", "wb..."], { w: "blue5", b: "blue3" });
        q.outline("steel1", { sides: ["right", "bottom", "top"] });
      });
      p.blit(ladle, 0, 0);
      p.rows(20, 15, [".sss.", "s222s", ".sss."], { s: "steel4", 2: "steel3" });
    },
  },
});
