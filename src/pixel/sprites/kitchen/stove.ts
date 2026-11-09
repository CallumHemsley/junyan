/**
 * The stove line against the back wall: the steamer range, the wok for 油条, the soy-milk vat.
 * Each stands on the floor with its anchor at the base of its front face.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { STEEL, STEEL_DULL, cylinderBand, eachColumn, layer, steamerLid, steamerTier, stopAt } from "./_helpers.ts";

/** Glowing coals in an arched firebox, 8×6 at (x, y). Three flicker frames. */
function firebox(p: Px, x: number, y: number, frame: number) {
  const flames = [
    ["..oooo..", ".oRRRRo.", "oRrOrrRo", "orOYOOro", "oOYYYOOo", "oOOYOOro"],
    ["..oooo..", ".oRRRRo.", "oRrrOrRo", "orOOYOro", "oOOYYYOo", "orOOYOOo"],
    ["..oooo..", ".oRRRRo.", "oRrOrrRo", "orOYYOro", "oOYYOOOo", "oOOOYOro"],
  ];
  p.rows(x, y, flames[frame % 3], { o: "stone1", R: "red1", r: "red2", O: "orange2", Y: "gold4" });
}

/** White glazed tile cladding with grout, rows y..y+h-1 across x..x+w-1. */
function tiles(p: Px, x: number, y: number, w: number, h: number) {
  p.rect(x, y, w, h, "cream4");
  for (let i = x; i < x + w; i++) p.px(i, y, "cream5");
  for (let row = 0; row < h; row += 4) {
    if (row) p.hline(x, y + row, w, "stone4");
    const shift = (row / 4) % 2 ? 3 : 0;
    for (let i = x + shift; i < x + w; i += 6) p.vline(i, y + row + (row ? 1 : 0), 3, "stone4");
  }
}

/** A 油条 frying, lying east–west: two fused strands, the lit one on top, 9×4 at (x, y). */
function floatingStick(p: Px, x: number, y: number, flip = false) {
  const art = [
    ".ooooooo.",
    "oHhhHhhho",
    "omgmmmgmo",
    ".ooooooo.",
  ];
  p.rows(x, y, flip ? art.map((r) => [...r].reverse().join("")) : art, { o: "gold1", H: "gold5", h: "gold4", m: "gold3", g: "gold2" });
}

/** A finished 油条 standing to drain: two fused strands, blistered edges, golden brown. */
function standingStick(p: Px, x: number, top: number, bottom: number, seed: number) {
  for (let y = top; y < bottom; y++) {
    const k = y - top + seed;
    p.px(x, y, k % 4 === 1 ? "orange3" : "gold4").px(x + 1, y, k % 3 === 0 ? "orange2" : "orange3").px(x + 2, y, "orange2");
    if (k % 4 === 0) p.px(x - 1, y, "gold3");
    if (k % 5 === 2) p.px(x + 3, y, "orange2");
  }
  p.px(x, top, "gold3").px(x + 1, top, "gold4").px(x + 2, top, null);
}

/** Bubbling in the oil: each site cycles seed → bead → ring → gone over four frames. */
function bubbles(p: Px, frame: number, sites: readonly (readonly [number, number, number])[]) {
  for (const [x, y, phase] of sites) {
    const stage = (frame + phase) % 4;
    if (stage === 0) p.px(x, y, "gold3");
    if (stage === 1) p.px(x, y, "gold5").px(x, y + 1, "gold3");
    if (stage === 2) p.rows(x - 1, y - 1, [".h.", "h.h", ".h."], { h: "gold4" });
  }
}

/**
 * The tiled range every cooking piece stands on, so the line reads as one run: a dark iron deck from
 * row `deck` to h-13, a rolled steel lip, seven rows of white tile, a recessed kick, firebox at `fireX`.
 * The front face is the same height everywhere (12 rows), so neighbouring pieces line up.
 */
function range(p: Px, w: number, h: number, deck: number, fireX: number, frame: number) {
  const lip = h - 12, right = w - 2;
  p.rect(1, deck, w - 2, lip - deck, "steel3");
  p.hline(1, deck, w - 2, "steel4").vline(1, deck + 1, lip - deck - 1, "steel4").vline(right, deck + 1, lip - deck - 1, "steel2");
  p.hline(2, deck + 1, 6, "steel5");
  p.hline(1, lip, w - 2, "steel6").hline(1, lip + 1, w - 2, "steel4").hline(1, lip + 2, w - 2, "steel2");
  p.px(right, lip, "steel4").px(right, lip + 1, "steel3");
  tiles(p, 1, lip + 3, w - 2, 7);
  p.vline(1, lip + 3, 7, "cream5").vline(right, lip + 3, 7, "cream2");
  p.hline(1, h - 2, w - 2, "stone1");
  // Soot breathed onto the tiles above the firebox.
  p.rows(fireX, lip + 3, ["..cc.c..", ".c.cc..c"], { c: "cream3" });
  firebox(p, fireX, lip + 5, frame);
}

export default defineSprites({
  /**
   * The hero piece: a tiled range with a steel deck, a boiler pot, three bamboo steamer tiers and a
   * domed woven lid. Coals flicker in the firebox. Put `fx/steam-a` over the lid.
   */
  "kitchen/stove-steamers": {
    w: 32, h: 44, anchor: [16, 43], foot: [-15, -14, 30, 14], shadow: { rx: 16, ry: 3, dy: -1 },
    frames: 3, fps: 5,
    draw: (p, frame) => {
      range(p, 32, 44, 19, 12, frame);
      // A cotton towel hung over the deck lip, blue stripes near its hem.
      p.rows(23, 31, ["wwwww", "Wwwws", "wwwws", "bbbbs", "wwwws", "bbbbs", "wwwWs", "w.wW."], {
        w: "cream5", W: "cream4", b: "blue4", s: "cream3",
      });
      p.outline("steel1");

      // The boiler pan set into the deck: dark water inside, a bright rolled rim at the front.
      p.ellipse(16, 25, 13.5, 6, "steel2");
      eachColumn(16, 13.5, 6, (x, u, off) => {
        p.px(x, 25 + off - 1, stopAt(u, STEEL));
        p.px(x, 25 + off, "steel1");
        p.px(x, 25 - off, u < 0 ? "steel4" : "steel3");
      });

      // Three tiers and the lid, outlined together in bamboo.
      const stack = layer(p, (q) => {
        steamerTier(q, 16, 11, 5, 19, 5, -0.6);
        steamerTier(q, 16, 11, 5, 14, 5, 0.3);
        steamerTier(q, 16, 11, 5, 9, 5, -0.15);
        steamerLid(q, 16, 11.5, 5, 7, 1);
        q.outline("bamboo1");
      });
      p.blit(stack, 0, 0);
    },
  },

  /**
   * A big wok of hot oil with two 油条 frying, long chopsticks, and a wire rack of finished sticks
   * draining on the right. The oil bubbles over four frames; the firebox flickers with it.
   */
  "kitchen/wok-station": {
    w: 32, h: 40, anchor: [16, 39], foot: [-15, -14, 30, 14], shadow: { rx: 16, ry: 3, dy: -1 },
    frames: 4, fps: 6,
    draw: (p, frame) => {
      range(p, 32, 40, 15, 8, frame % 3);
      p.outline("steel1");

      // The wok: seasoned black steel sunk in the deck, a bright rolled rim, two ear handles.
      p.rows(0, 19, ["oo", "os", "oo"], { o: "steel1", s: "steel4" });
      p.rows(23, 19, ["oo", "so", "oo"], { o: "steel1", s: "steel3" });
      p.ellipse(12.5, 21, 11, 5.6, "steel1");
      p.ellipse(12.5, 21, 10, 4.6, "ink2");
      // Sheen on the far inner wall, where the window light lands.
      p.rows(5, 17, [".sssss...ss", "ss.....s"], { s: "steel2" });
      // The oil pool: deep amber, darker where it shelves to the wall.
      p.ellipse(12.5, 22.4, 7.6, 3, "gold1");
      p.ellipse(12.5, 22.2, 6.8, 2.4, "gold2");
      p.rows(7, 20, ["ggg"], { g: "gold3" });
      // Rim: lit on the far-left arc, shaded to the right.
      eachColumn(12.5, 11, 5.6, (x, u, off) => {
        p.px(x, Math.round(21 - off), u < -0.25 ? "steel6" : u < 0.45 ? "steel4" : "steel3");
        p.px(x, Math.round(21 + off) - 1, u < -0.3 ? "steel4" : u < 0.4 ? "steel3" : "steel2");
      });
      // Two sticks frying, bobbing a pixel out of step.
      const bob = [0, 0, 1, 1][frame], bob2 = [1, 0, 0, 1][frame];
      floatingStick(p, 6, 19 + bob);
      floatingStick(p, 11, 21 + bob2, true);
      bubbles(p, frame, [[6, 24, 0], [9, 24, 2], [17, 20, 1], [19, 22, 3], [14, 25, 0], [5, 22, 3], [11, 25, 1], [18, 24, 2]]);

      // Long cooking chopsticks, tips in the oil, handles up to the right.
      p.line(9, 21, 20, 9, "bamboo4").line(10, 21, 21, 9, "bamboo2").line(11, 21, 22, 10, "bamboo1");
      p.px(20, 9, "bamboo5").px(21, 9, "bamboo3");

      // Draining rack: finished sticks standing in a wire basket.
      const rack = layer(p, (q) => {
        standingStick(q, 24, 9, 26, 0);
        standingStick(q, 27, 11, 26, 2);
        q.outline("orange1");
        q.rect(23, 18, 8, 1, "steel5").rect(23, 26, 8, 1, "steel3");
        for (const x of [23, 25, 27, 29, 30]) q.vline(x, 19, 7, x === 23 ? "steel5" : "steel4");
        q.vline(30, 19, 7, "steel2");
      });
      rack.outline("steel1", { sides: ["left", "right", "bottom"] });
      p.blit(rack, 0, 0);
    },
  },

  /**
   * A tall steel vat of soy milk on an iron burner stand: a ladle resting in it, a brass tap low on
   * the front with a bead of milk, a dried dribble under the rim. Blue flame flickers below.
   * Put `fx/steam-small` on the rim at (8, 6).
   */
  "kitchen/soymilk-pot": {
    w: 22, h: 42, anchor: [11, 41], foot: [-9, -7, 18, 7], shadow: { rx: 9, ry: 2 },
    frames: 3, fps: 6,
    draw: (p, frame) => {
      // Burner stand: an iron ring on three legs, gas flame between.
      const stand = layer(p, (q) => {
        q.ellipse(11, 34, 8.5, 3, "steel2");
        q.ellipse(11, 33.5, 7.5, 2.4, "steel1");
        for (const x of [3, 10, 18]) q.rect(x, 35, 2, 6, "steel2").vline(x, 35, 6, "steel3");
        q.outline("steel1");
      });
      p.blit(stand, 0, 0);
      const flames = [["b.B.b.B.b", "BdBBdBBdB"], [".bB.Bb.B.", "dBBdBBdBB"], ["b.Bb.B.bB", "BBdBBdBdB"]];
      p.rows(7, 35, flames[frame], { b: "blue5", B: "blue4", d: "blue3" });

      const vat = layer(p, (q) => {
        // Body, two rolled bands, ear handles.
        cylinderBand(q, 11, 8, 3.5, 8, 31, STEEL_DULL);
        eachColumn(11, 8, 3.5, (x, u, off) => {
          for (const band of [13, 27]) {
            q.px(x, band + off, u < 0.2 ? "steel6" : "steel4");
            q.px(x, band + off + 1, u < 0.6 ? "steel3" : "steel2");
          }
          q.px(x, 30 + off, "steel2");
        });
        q.rows(1, 14, ["ss", "s.", "ss"], { s: "steel4" }).rows(19, 14, ["ss", ".s", "ss"], { s: "steel2" });
        // Mouth: rolled rim round a surface of soy milk with a wrinkled skin.
        q.ellipse(11, 8, 8, 3.5, "steel5");
        q.ellipse(11, 8.3, 7, 2.7, "cream4");
        q.rows(6, 6, ["..cccc....", ".c5555cc..", "c55c555c..", ".c55555cc.", "..ccc.c..."], { c: "cream3", 5: "cream5" });
        eachColumn(11, 8, 3.5, (x, u, off) => q.px(x, 8 - off, u < 0 ? "steel6" : "steel4"));
        q.px(17, 8, "steel3").px(18, 8, "steel3");
        // A dried dribble down the front from the rim.
        q.vline(7, 12, 1, "cream3").vline(7, 15, 3, "cream3").px(7, 18, "cream2");
        // Brass tap low on the front, a bead of milk at its spout.
        q.rows(13, 23, ["gGG", "gGG.", ".Gd", "..w"], { g: "gold4", G: "gold2", d: "gold1", w: "cream5" });
        q.outline("steel1");
      });
      p.blit(vat, 0, 0);
      // The ladle: a long steel handle resting on the rim, its bowl sunk in the milk.
      const ladle = layer(p, (q) => {
        q.line(13, 7, 20, 0, "steel5").line(14, 7, 21, 0, "steel3");
        q.rows(19, 0, ["dd", "d."], { d: "wood3" });
        q.outline("steel1", { sides: ["right", "bottom"] });
      });
      p.blit(ladle, 0, 0);
      p.rows(11, 8, ["ss.", ".s"], { s: "steel4" });
    },
  },
});
