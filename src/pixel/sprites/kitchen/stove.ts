/**
 * The stove line against the back wall: the steamer range, the wok for 油条, the soy-milk vat.
 * Each stands on the floor with its anchor at the base of its front face.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { STEEL, eachColumn, layer, steamerLid, steamerTier, stopAt } from "./_helpers.ts";

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

export default defineSprites({
  /**
   * The hero piece: a tiled range with a steel deck, a boiler pot, three bamboo steamer tiers and a
   * domed woven lid. Coals flicker in the firebox. Put `fx/steam-a` over the lid.
   */
  "kitchen/stove-steamers": {
    w: 32, h: 44, anchor: [16, 43], foot: [-15, -14, 30, 14], shadow: { rx: 16, ry: 3, dy: -1 },
    frames: 3, fps: 5,
    draw: (p, frame) => {
      // Range: dark iron deck over tiled cladding, a rolled steel lip, recessed kick.
      p.rect(1, 19, 30, 13, "steel3");
      p.hline(1, 19, 30, "steel4").vline(1, 20, 12, "steel4").vline(30, 20, 12, "steel2");
      p.hline(2, 20, 6, "steel5");
      p.hline(1, 32, 30, "steel6").hline(1, 33, 30, "steel4").hline(1, 34, 30, "steel2");
      p.px(30, 32, "steel4").px(30, 33, "steel3");
      tiles(p, 1, 35, 30, 7);
      p.vline(1, 35, 7, "cream5").vline(30, 35, 7, "cream2");
      p.hline(1, 42, 30, "stone1");
      // Soot breathed onto the tiles above the firebox.
      p.rows(12, 35, ["..cc.c..", ".c.cc..c"], { c: "cream3" });
      firebox(p, 12, 37, frame);
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
});
