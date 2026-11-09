/**
 * The stove line against the back wall: one long tiled range, built in place twenty years ago and
 * patched since, carrying the steamers, the wok for 油条 and the soy-milk vat. Every piece stands on
 * the floor with its anchor at the base of its front face, and every piece's front is the same
 * 24 rows (a rolled steel lip, two courses of white tile, a sooty kick), so the line reads as one run.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { STEEL, eachColumn, layer, steamerLid, steamerTier, stopAt } from "./_helpers.ts";

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
});
