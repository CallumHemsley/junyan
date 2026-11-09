/**
 * Reference sprites by the art director. They fix scale, shading language and finish level.
 * Domain sprites replace these; do not use `ex/…` ids in scenes once a real one exists.
 */
import { defineSprites, hash, type Px } from "../../kit/index.ts";

/** Two 8px floorboards per tile, running left to right. `joints` are the butt-joint x for each board. */
function floorboards(p: Px, seed: number, joints: readonly [number, number]) {
  p.rect(0, 0, 16, 16, "oak4");
  for (let board = 0; board < 2; board++) {
    const top = board * 8;
    // A soft seam at the bottom edge and a broken highlight just under the seam above.
    p.hline(0, top + 7, 16, "oak3");
    for (let x = 0; x < 16; x++) if (hash(x >> 2, board, seed) > 0.55) p.px(x, top, "oak5");
    // A negative joint means this board runs unbroken through the tile.
    if (joints[board] >= 0) p.vline(joints[board], top, 7, "oak3");
    // Grain: a couple of short streaks per board, kept inside the tile so it repeats cleanly.
    for (let streak = 0; streak < 2; streak++) {
      const x = 1 + Math.floor(hash(streak, board, seed + 7) * 9), y = top + 2 + Math.floor(hash(streak, board, seed + 11) * 4);
      const length = 3 + Math.floor(hash(streak, board, seed + 13) * 3);
      p.hline(x, y, length, hash(streak, board, seed + 17) > 0.6 ? "oak5" : "oak3");
    }
  }
}

export default defineSprites({
  "ex/floor-wood-a": { w: 16, h: 16, layer: "floor", draw: (p) => floorboards(p, 1, [5, -1]) },
  "ex/floor-wood-b": { w: 16, h: 16, layer: "floor", draw: (p) => floorboards(p, 2, [-1, 11]) },
  "ex/floor-wood-c": {
    w: 16, h: 16, layer: "floor",
    draw: (p) => {
      floorboards(p, 3, [-1, -1]);
      // A knot.
      p.rows(10, 2, [".kk.", "kdkl", ".kk."], { k: "oak3", d: "oak2", l: "oak5" });
    },
  },

  /** One 16px-wide slice of the back wall, three tiles tall: cap, plaster, jade dado, skirting. */
  "ex/wall": {
    w: 16, h: 48, layer: "floor",
    draw: (p) => {
      p.rect(0, 0, 16, 3, "wood1").hline(0, 3, 16, "wood3").hline(0, 4, 16, "wood2");
      p.rect(0, 5, 16, 26, "cream4");
      p.hline(0, 5, 16, "cream2").hline(0, 6, 16, "cream3").dither(0, 7, 16, 1, "cream3");
      // Plaster: a few soft worn patches, never single-pixel noise.
      for (let i = 0; i < 4; i++) {
        const x = Math.floor(hash(i, 0, 5) * 13), y = 9 + Math.floor(hash(i, 1, 5) * 18);
        p.hline(x, y, 3, i % 2 ? "cream5" : "cream3").hline(x + 1, y + 1, 2, i % 2 ? "cream5" : "cream3");
      }
      // Dado rail, painted boards, skirting.
      p.hline(0, 31, 16, "jade6").hline(0, 32, 16, "jade2");
      p.rect(0, 33, 16, 11, "jade3").hline(0, 33, 16, "jade4");
      for (const x of [3, 11]) p.vline(x, 34, 10, "jade2").vline(x + 1, 34, 10, "jade4");
      p.dither(0, 42, 16, 2, "jade2", "checker");
      p.hline(0, 44, 16, "wood4").rect(0, 45, 16, 2, "wood3").hline(0, 47, 16, "wood1");
    },
  },

  /** Square dining table, two tiles wide. The anchor is the front edge of the legs. */
  "ex/table": {
    w: 32, h: 28, anchor: [16, 26], foot: [-15, -13, 30, 12], shadow: { rx: 17, ry: 5, dy: -1 },
    draw: (p) => {
      // Top, lit from the upper left.
      p.rect(2, 1, 28, 1, "wood5").rect(1, 2, 30, 13, "wood4").vline(1, 2, 12, "wood5");
      p.hline(2, 6, 28, "wood3").hline(2, 10, 28, "wood3");
      p.over(() => {
        for (const [x, y, n] of [[5, 4, 4], [17, 3, 6], [9, 8, 5], [21, 8, 3], [13, 12, 7], [24, 13, 3]] as const) p.hline(x, y, n, "wood5");
        p.hline(3, 2, 9, "wood6").hline(2, 3, 3, "wood6");
        p.vline(30, 3, 12, "wood3");
      });
      // Rim, recessed apron, front legs.
      p.rect(1, 15, 30, 1, "wood3").rect(1, 16, 30, 1, "wood2");
      p.rect(3, 17, 26, 3, "wood2").hline(3, 19, 26, "wood1");
      for (const x of [2, 27]) p.rect(x, 17, 3, 9, "wood3").vline(x + 2, 17, 9, "wood2").vline(x, 18, 7, "wood4");
      p.outline("wood1");
    },
  },

  /** Round stool. */
  "ex/stool": {
    w: 14, h: 15, anchor: [7, 14], foot: [-5, -6, 10, 6], shadow: { rx: 7, ry: 3 },
    draw: (p) => {
      for (const x of [2, 10]) p.rect(x, 7, 2, 6, "wood3").vline(x + 1, 7, 6, "wood2");
      p.hline(4, 10, 6, "wood2");
      p.ellipse(7, 6.5, 6, 3.5, "wood2");
      p.ellipse(7, 4.5, 6, 3.5, "wood4");
      p.over(() => p.hline(4, 2, 4, "wood5").hline(3, 3, 2, "wood5").hline(8, 6, 3, "wood3"));
      p.outline("wood1");
    },
  },

  /** The waiter, facing the camera, standing. Proportion reference for every character. */
  "ex/waiter": {
    w: 16, h: 32, anchor: [8, 31], foot: [-4, -4, 8, 4], shadow: { rx: 6, ry: 2 },
    draw: (p) => {
      const rows = [
        "................",
        "................",
        "................",
        ".....oooooo.....",
        "...oohhhhhhoo...",
        "..ohhHHHHhhhho..",
        ".ohhHHhhhhhhhdo.",
        ".ohhhhhhhhhhhdo.",
        ".ohhhhhhhhhhddo.",
        ".ohhhsshhhshddo.",
        ".ohsSSSssSSSsdo.",
        ".odsSSSSSSSSsdo.",
        ".odSSeSSSSeSSdo.",
        ".oosSeSSSSeSsoo.",
        "..osbSSSSSSbso..",
        "..oksSSSSSSsko..",
        "...okssssssko...",
        ".....okwwko.....",
        "....owwjjwwo....",
        "...owwajjawwo...",
        "...owWaaaaWwo...",
        "...owWaaaaWwo...",
        "...osoaaaaoso...",
        "...oooaaAaooo...",
        "....oaaaAAao....",
        "....opaaAApo....",
        "....oPPooPpo....",
        "....oPpooPpo....",
        "...ooPpooPpoo...",
        "...offFooffFo...",
        "...oooo..oooo...",
        "................",
      ];
      for (const row of rows) if (row.length !== 16) throw new Error(`waiter row "${row}" is ${row.length} wide`);
      p.rows(0, 0, rows, {
        o: "ink", d: "hair1", h: "hair2", H: "hair3", s: "skin3", S: "skin4", k: "skin2", e: "ink", b: "blush",
        w: "cream5", W: "cream3", a: "jade4", A: "jade3", j: "jade5", p: "blue1", P: "blue2", f: "wood2", F: "wood3",
      });
    },
  },
});
