/**
 * Reference sprites by the art director. They fix scale, shading language and finish level,
 * and the amount of character every object is expected to carry.
 * Domain sprites replace these; do not use `ex/…` ids in scenes once a real one exists.
 */
import { defineSprites, hash, type Px, type Color } from "../../kit/index.ts";

/**
 * Four 8px floorboards per 32px tile, running left to right.
 * `joints[i]` is the butt-joint x of board i, or -1 for a board that runs through.
 * `tones[i]` nudges a whole board: 0 normal, 1 a paler board, -1 an older, darker one.
 */
function floorboards(p: Px, seed: number, joints: readonly number[], tones: readonly number[] = [0, 0, 0, 0]) {
  for (let board = 0; board < 4; board++) {
    const top = board * 8, tone = tones[board];
    const base: Color = tone < 0 ? "oak3" : "oak4", light: Color = tone < 0 ? "oak4" : "oak5", dark: Color = tone < 0 ? "oak2" : "oak3";
    p.rect(0, top, 32, 8, base);
    if (tone > 0) for (let x = 0; x < 32; x++) if (hash(x >> 3, board, seed + 3) > 0.3) p.px(x, top + 2, light).px(x, top + 3, light);
    // The seam: a dark line, with a broken highlight on the lip of the board below it.
    p.hline(0, top + 7, 32, dark);
    for (let x = 0; x < 32; x++) if (hash(x >> 2, board, seed) > 0.5) p.px(x, top, light);
    const joint = joints[board];
    if (joint >= 0) {
      p.vline(joint, top, 7, dark);
      // A nail head either side of the joint.
      p.px(joint - 2, top + 3, "oak2").px(joint + 2, top + 3, "oak2");
    }
    // Grain: long quiet streaks that follow the board.
    for (let streak = 0; streak < 3; streak++) {
      const x = 1 + Math.floor(hash(streak, board, seed + 7) * 20), y = top + 2 + Math.floor(hash(streak, board, seed + 11) * 4);
      const length = 4 + Math.floor(hash(streak, board, seed + 13) * 7);
      p.hline(x, y, Math.min(length, 31 - x), hash(streak, board, seed + 17) > 0.6 ? light : dark);
    }
  }
}

export default defineSprites({
  "ex/floor-wood-a": { w: 32, h: 32, layer: "floor", draw: (p) => floorboards(p, 1, [11, -1, 24, -1]) },
  "ex/floor-wood-b": { w: 32, h: 32, layer: "floor", draw: (p) => floorboards(p, 2, [-1, 6, -1, 19], [0, 1, 0, 0]) },
  "ex/floor-wood-c": {
    w: 32, h: 32, layer: "floor",
    draw: (p) => {
      floorboards(p, 3, [-1, -1, 14, -1], [0, 0, 0, -1]);
      // A knot with the grain bending round it.
      p.rows(19, 9, ["..llll..", ".dkkkkl.", "dkKddkkl", ".dkkkkd.", "..dddd.."], { k: "oak3", K: "oak2", d: "oak3", l: "oak5" });
      p.px(22, 11, "oak1").px(21, 11, "oak2");
    },
  },
  "ex/floor-wood-d": {
    w: 32, h: 32, layer: "floor",
    draw: (p) => {
      floorboards(p, 4, [27, -1, -1, 9], [1, 0, 0, 0]);
      // A pale path worn by years of feet, and an old dark ring where a bucket stood.
      p.over(() => {
        for (const [x, y, n] of [[6, 10, 9], [4, 11, 13], [7, 12, 8], [12, 18, 10], [10, 19, 13], [14, 20, 7]] as const) p.hline(x, y, n, "oak5");
        p.rows(20, 24, [".rrrr.", "r....r", "r....r", ".rrr.."], { r: "oak3" });
      });
    },
  },

  /** One 32px-wide slice of the back wall, three tiles tall: cap, plaster, painted jade dado, skirting. */
  "ex/wall": {
    w: 32, h: 96, layer: "floor",
    draw: (p) => {
      // Cap and cornice.
      p.rect(0, 0, 32, 6, "wood1").hline(0, 6, 32, "wood2").hline(0, 7, 32, "wood4").hline(0, 8, 32, "wood3").hline(0, 9, 32, "wood2");
      // Plaster, with the cornice's shadow falling on it.
      p.rect(0, 10, 32, 52, "cream4");
      p.hline(0, 10, 32, "cream2").hline(0, 11, 32, "cream3").hline(0, 12, 32, "cream3").dither(0, 13, 32, 1, "cream3");
      // Trowel marks and worn patches: soft clusters, never single-pixel noise.
      for (let i = 0; i < 7; i++) {
        const x = Math.floor(hash(i, 0, 5) * 24), y = 17 + Math.floor(hash(i, 1, 5) * 38), tone: Color = i % 3 === 0 ? "cream5" : "cream3";
        p.hline(x + 1, y, 5, tone).hline(x, y + 1, 7, tone).hline(x + 2, y + 2, 4, tone);
      }
      // A hairline crack wandering down from the cornice.
      p.rows(22, 13, ["c", "c", ".c", ".c", ".c", "..c", "..c", ".c", ".c", "..c"], { c: "cream2" });
      // Dado rail.
      p.hline(0, 62, 32, "jade6").hline(0, 63, 32, "jade5").hline(0, 64, 32, "jade3").hline(0, 65, 32, "jade1");
      // Painted tongue-and-groove boards.
      p.rect(0, 66, 32, 22, "jade3").hline(0, 66, 32, "jade2");
      for (let x = 0; x < 32; x += 8) p.vline(x + 7, 67, 21, "jade2").vline(x, 67, 21, "jade4");
      p.over(() => {
        // Sun-faded upper boards, grime gathering toward the floor.
        for (let x = 0; x < 32; x += 8) p.vline(x + 2, 68, 6 + Math.floor(hash(x, 0, 9) * 6), "jade4");
        p.dither(0, 84, 32, 4, "jade2", "checker");
        // Paint chipped back to bare wood where chair backs knock the wall.
        p.rows(11, 74, [".ww.", "wWWw", ".wW.", "..w."], { w: "wood4", W: "wood5" });
        p.rows(25, 79, ["ww.", "wWw", ".w."], { w: "wood4", W: "wood5" });
      });
      // Skirting board.
      p.hline(0, 88, 32, "wood5").rect(0, 89, 32, 3, "wood4").rect(0, 92, 32, 3, "wood3").hline(0, 95, 32, "wood1");
      p.over(() => p.hline(3, 90, 9, "wood5").hline(18, 91, 6, "wood5").hline(9, 93, 12, "wood2"));
    },
  },

  /**
   * An old square dining table, two tiles wide. It has had a life: a tea ring, knife scratches,
   * a drawer that no longer shuts, a folded card under the short leg.
   * The anchor is the front edge of the legs. Plates sit on the top between y = 6 and y = 28.
   */
  "ex/table": {
    w: 64, h: 57, anchor: [32, 55], foot: [-30, -26, 60, 24], shadow: { rx: 33, ry: 9, dy: -2 },
    draw: (p) => {
      // Top: three boards, lit from the upper left.
      p.rect(3, 1, 58, 1, "wood5").rect(2, 2, 60, 1, "wood4").rect(1, 3, 62, 30, "wood4");
      p.hline(4, 1, 30, "wood6").hline(3, 2, 12, "wood6").vline(1, 4, 24, "wood5");
      for (const y of [12, 22]) p.hline(2, y, 60, "wood3").hline(2, y + 1, 60, "wood5");
      p.over(() => {
        // Grain.
        for (const [x, y, n] of [[7, 5, 12], [26, 6, 18], [48, 4, 9], [12, 9, 22], [40, 9, 14], [5, 16, 15], [30, 17, 9], [46, 19, 12], [9, 26, 20], [36, 27, 16], [22, 30, 11], [50, 30, 8]] as const) p.hline(x, y, n, y % 3 ? "wood5" : "wood3");
        // The middle of the top, rubbed pale by ten thousand elbows.
        for (const [x, y, n] of [[20, 14, 16], [18, 15, 22], [22, 18, 18], [24, 19, 12]] as const) p.hline(x, y, n, "wood5");
        // A tea ring and two knife scratches.
        p.rows(42, 13, ["..rrrr..", ".r....r.", "r......r", "r......r", ".r....r.", "..rrr..."], { r: "wood3" });
        p.line(10, 24, 17, 28, "wood3").line(13, 23, 19, 26, "wood3");
        // Right and bottom edges fall into shade.
        p.vline(62, 4, 28, "wood3").hline(3, 32, 58, "wood3");
        // Pegs at the corners.
        for (const [x, y] of [[4, 5], [58, 5], [4, 29], [58, 29]] as const) p.px(x, y, "wood2").px(x + 1, y, "wood5");
      });
      // The edge of the top catches the light, then turns under.
      p.hline(1, 33, 62, "wood5").rect(1, 34, 62, 2, "wood3").hline(1, 36, 62, "wood2");
      // Recessed apron with a drawer left a little open.
      p.rect(5, 37, 54, 7, "wood2").hline(5, 43, 54, "wood1");
      p.rect(21, 38, 23, 6, "wood3").hline(21, 38, 23, "wood4").hline(21, 44, 23, "wood1").vline(43, 39, 5, "wood2");
      p.rect(30, 40, 4, 2, "gold3").hline(30, 40, 3, "gold5").hline(31, 42, 3, "gold1");
      // Front legs, slightly turned at the ankle.
      for (const x of [3, 54]) {
        p.rect(x, 37, 7, 17, "wood3").vline(x, 38, 15, "wood4").vline(x + 1, 38, 14, "wood4").rect(x + 5, 37, 2, 17, "wood2");
        p.hline(x, 49, 7, "wood2").hline(x, 50, 7, "wood4");
      }
      p.outline("wood1");
      // The folded card that stops the wobble.
      p.rect(53, 54, 10, 2, "cream4").hline(53, 55, 10, "cream2").px(62, 54, "cream2");
    },
  },

  /**
   * A turned wooden stool with a tied-on cushion somebody's grandmother sewed.
   * A seated person's anchor goes at this stool's anchor, 4px up.
   */
  "ex/stool": {
    w: 28, h: 31, anchor: [14, 30], foot: [-10, -12, 20, 11], shadow: { rx: 13, ry: 5, dy: -1 },
    draw: (p) => {
      // Back legs, then front legs splayed a pixel outward, and the stretcher between them.
      for (const x of [8, 18]) p.rect(x, 14, 2, 11, "wood2");
      p.rect(7, 21, 14, 2, "wood2").hline(7, 21, 14, "wood3");
      for (const [x, flip] of [[3, 0], [22, 1]] as const) {
        p.rect(x, 14, 3, 9, "wood3").rect(flip ? x + 1 : x - 1, 23, 3, 6, "wood3");
        p.vline(flip ? x + 2 : x, 14, 9, flip ? "wood2" : "wood4").vline(flip ? x + 3 : x - 1, 23, 6, flip ? "wood2" : "wood4");
        p.hline(flip ? x + 1 : x - 1, 26, 3, "wood2");
      }
      // Seat: a thick turned disc.
      p.ellipse(14, 12, 13, 7, "wood2");
      p.ellipse(14, 9, 13, 7, "wood4");
      p.over(() => p.hline(4, 15, 9, "wood3").hline(6, 16, 12, "wood3"));
      // Cushion: blue check, flattened in the middle, with ties.
      p.ellipse(14, 8, 10, 5, "blue3");
      p.over(() => {
        for (let x = 5; x < 24; x += 4) p.vline(x, 3, 11, "blue5");
        for (const y of [5, 8, 11]) p.hline(4, y, 20, "blue5");
        for (let x = 5; x < 24; x += 4) for (const y of [5, 8, 11]) p.px(x, y, "blue6");
        p.hline(16, 11, 7, "blue2").hline(19, 10, 4, "blue2").px(22, 9, "blue2");
      });
      p.rows(8, 4, ["..llll", ".l....", "l....."], { l: "blue5" });
      p.rows(1, 12, ["c.", ".c", "cc"], { c: "cream4" });
      p.rows(25, 12, [".c", "c.", "cc"], { c: "cream3" });
      p.outline("wood1");
    },
  },

  /**
   * The waiter, facing the camera, standing. Proportion and finish reference for every character:
   * a big head, a readable face, and things that say who this is: the cowlick that never lies flat,
   * a pencil behind the ear, an order pad in the apron pocket, rolled sleeves.
   */
  "ex/waiter": {
    w: 32, h: 64, anchor: [16, 62], foot: [-8, -8, 16, 8], shadow: { rx: 11, ry: 4 },
    draw: (p) => {
      // The left half; the figure is mirrored, then the asymmetries are drawn on top.
      const half = [
        "................", // 0
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "................",
        "..........oooooo", // 8
        "........oohhhhhh",
        ".......ohhhHHHHh",
        "......ohhHHHHhhh",
        ".....ohhHHHhhhhh",
        ".....ohhHhhhhhhh",
        "....ohhhhhhhhhhh",
        "....ohhhhhhhhhhh",
        "....ohhhhhhhhhhh", // 16
        "....ohhhhhdhhhhd",
        "....ohhhhdssdhds",
        "....ohhhdsSSsdsS",
        "....ohhdsSSSSSSS",
        "....ohdsSSSSSSSS",
        "....ohdsSdddSSSS",
        "...oohksSSSSSSSS",
        "...oskksSSeeSSSS", // 24
        "...oskksSSeeSSSS",
        "...ooksSSSeeSSSS",
        "....oksbbSSSSSSk",
        "....oksbbSSSSSmS",
        ".....oksSSSSSSSm",
        "......oksSSSSSSS",
        ".......ookssssss",
        ".........okkssss", // 32
        ".......ooocCkkss",
        "......occcjcCkks",
        ".....occccjccccc",
        ".....occcjjjjjjj",
        "....occCcJaaaaaa",
        "....occCcJaaaaaa",
        "....ocCCcJaaaaaa",
        "....oxxxxJaaaaaa", // 40
        "....osskoJaaaaaa",
        "....osskoJaaaaaa",
        "....osSkoJaaaaaa",
        "....osSsoJaaaaaa",
        ".....oooJaaaaaaa",
        "......oJaaaaaaaa",
        "......oJaaaaaaaa",
        "......oJaaaaaaaa", // 48
        "......oJAaaaaaaa",
        "......oJAAaaaaaa",
        "......oJJJJJJJJJ",
        ".......opPPPPPpo",
        ".......opPPPPPpo",
        ".......opPPPPPpo",
        ".......opPPPPppo",
        ".......opPPPPppo", // 56
        ".......oppPPPppo",
        "......oouuUUuuuo",
        "......ouUUUUuuuo",
        "......occccccccx",
        "......oooooooooo",
        "................",
        "................",
      ];
      if (half.length !== 64) throw new Error(`waiter has ${half.length} rows`);
      for (const row of half) if (row.length !== 16) throw new Error(`waiter row "${row}" is ${row.length} wide`);
      const legend = {
        o: "ink", d: "hair1", h: "hair2", H: "hair3", s: "skin3", S: "skin4", k: "skin2", e: "ink", b: "blush", m: "skin1",
        c: "cream5", C: "cream3", x: "cream2", a: "jade4", A: "jade3", j: "jade5", J: "jade2", p: "blue1", P: "blue2", u: "wood2", U: "wood3",
      } as const;
      p.rows(0, 0, half, legend).mirrorX();

      p.over(() => {
        // The sun is upper left, so the right-hand side of everything sits in shade.
        p.swap({ hair3: "hair2" }, [16, 8, 16, 10]);
        p.swap({ hair2: "hair1" }, [24, 12, 4, 16]);
        p.swap({ skin4: "skin3", skin3: "skin2" }, [21, 20, 4, 12]);
        p.swap({ cream5: "cream3", cream3: "cream2" }, [22, 33, 6, 8]);
        p.swap({ jade4: "jade3", jade5: "jade4" }, [19, 37, 4, 15]);
        p.swap({ blue2: "blue1" }, [21, 52, 4, 6]);
        // A catch-light in each eye, on the sun side.
        p.px(10, 24, "white").px(19, 24, "white");
        // Apron pocket with the order pad and a stub of pencil sticking out.
        p.rect(17, 43, 6, 1, "jade2").vline(17, 43, 6, "jade2").vline(22, 43, 6, "jade2").hline(17, 48, 6, "jade2");
        p.rect(18, 41, 3, 3, "cream5").hline(18, 42, 3, "cream3").vline(21, 40, 3, "gold3").px(21, 40, "red3");
        // A tea towel tucked in the waistband.
        p.rect(9, 45, 3, 4, "cream5").vline(11, 45, 4, "cream3").hline(9, 47, 3, "blue4");
      });
      // The cowlick that never lies flat.
      p.rows(15, 4, ["...oo.", "..ohho", ".ohHo.", ".ohho.", "ohHho."], { o: "ink", h: "hair2", H: "hair3" });
      // A pencil behind the right ear.
      p.rows(25, 20, ["y.", "y.", ".y", ".g"], { y: "gold4", g: "gold2" });
    },
  },
});
