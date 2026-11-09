/**
 * Dining tables in tea wood. Every table's anchor is the front edge of its front legs, on the
 * floor. Tops keep their middle calm so plates (about 10×7) sit on clear wood.
 */
import { defineSprites, type Paint, type Px } from "../../kit/index.ts";
import { leg, oval, streaks } from "./_helpers.ts";

/** The slab, front lip and apron shared by the 32×28 square tables. Planks are drawn per variant. */
function squareBody(p: Px) {
  p.rect(2, 1, 28, 1, "wood5");
  p.rect(1, 2, 30, 13, "wood4");
  // Front face of the slab: a lit worn corner line, the face, its underside.
  p.hline(1, 15, 30, "wood3").hline(1, 16, 30, "wood2");
  // Recessed apron in the shade of the top, with small shaped brackets into the legs.
  p.rect(3, 17, 26, 3, "wood2").hline(3, 17, 26, "wood1");
  p.rows(5, 20, ["22", "2."], { "2": "wood2" }).rows(25, 20, ["22", ".2"], { "2": "wood2" });
  leg(p, 2, 17, 9);
  leg(p, 27, 17, 9);
}

/** Light from the upper left: lit back and left edges, shaded right edge. */
function squareEdges(p: Px) {
  p.over(() => {
    p.vline(1, 2, 13, "wood5").vline(30, 2, 13, "wood3");
    p.hline(3, 2, 7, "wood6").px(2, 3, "wood6").px(2, 4, "wood6");
  });
}

export default defineSprites({
  /**
   * Square table, three planks running across. Story: a dark tea ring at the back right where the
   * pot always goes, and a chip knocked out of the front edge. Plate room: x 6–24, y 7–13.
   */
  "furn/table-square-a": {
    w: 32, h: 28, anchor: [16, 26], foot: [-15, -13, 30, 12], shadow: { rx: 17, ry: 5, dy: -1 },
    draw: (p) => {
      squareBody(p);
      // Seams of three unequal planks; each seam broken once where the boards sit flush.
      p.hline(2, 6, 17, "wood3").hline(21, 6, 9, "wood3");
      p.hline(2, 11, 11, "wood3").hline(14, 11, 16, "wood3");
      p.vline(19, 7, 4, "wood3").px(20, 7, "wood5");
      streaks(p, [
        [5, 3, 5, "wood5"], [14, 4, 3, "wood3"], [11, 2, 4, "wood5"],
        [3, 8, 4, "wood5"], [8, 9, 2, "wood3"], [22, 8, 5, "wood5"], [25, 9, 2, "wood3"],
        [4, 13, 6, "wood5"], [17, 13, 3, "wood3"], [23, 12, 4, "wood5"],
      ]);
      squareEdges(p);
      // Tea ring, not quite closed.
      p.rows(21, 2, [".333.", "3...3", "3...3", ".33.."], { "3": "wood3" });
      p.px(22, 3, "wood5");
      // Worn front edge where forearms rest, and a chip with raw pale wood.
      p.hline(6, 14, 4, "wood5").hline(20, 14, 5, "wood5");
      p.rows(11, 14, ["3.", "65"], { "3": "wood3", "6": "wood6", "5": "wood5" });
      p.outline("wood1");
    },
  },

  /**
   * Square table, four boards running front to back. Story: knife scratches at the left end and a
   * split right leg bound with two wraps of wire. Plate room: x 9–22, y 4–13.
   */
  "furn/table-square-b": {
    w: 32, h: 28, anchor: [16, 26], foot: [-15, -13, 30, 12], shadow: { rx: 17, ry: 5, dy: -1 },
    draw: (p) => {
      squareBody(p);
      for (const x of [8, 16, 24]) p.vline(x, 1, 14, "wood3").px(x, 15, "wood2").px(x + 1, 2, "wood5");
      p.over(() => {
        for (const [x, y, n, c] of [
          [4, 6, 3, "wood5"], [6, 10, 2, "wood3"], [11, 3, 3, "wood5"], [13, 8, 2, "wood3"], [10, 11, 3, "wood5"],
          [19, 5, 3, "wood5"], [21, 10, 2, "wood3"], [18, 12, 2, "wood5"], [27, 4, 2, "wood3"], [26, 8, 3, "wood5"],
        ] as const) p.vline(x, y, n, c);
      });
      squareEdges(p);
      // Knife scratches.
      p.line(3, 9, 5, 11, "wood6").line(4, 8, 6, 10, "wood5").line(25, 11, 27, 12, "wood5");
      p.hline(12, 14, 3, "wood5");
      // The split right leg: a crack and two wire wraps that stand proud of the wood.
      p.rows(27, 18, ["..1", ".1.", ".1.", "1..", "...", ".1."], { "1": "wood1" });
      for (const [y, end] of [[19, ""], [23, "2"]] as const) p.rows(27, y, ["453" + end], { "5": "steel5", "4": "steel4", "3": "steel3", "2": "steel2" });
      p.outline("wood1");
    },
  },

  /**
   * Square table, two wide planks held by breadboard ends with pegs. Story: a knot, a pale patch
   * rubbed by elbows, a footrest rail worn bright in the middle, and a folded paper shim under the
   * wobbly left leg. Plate room: x 6–25, y 3–13.
   */
  "furn/table-square-c": {
    w: 32, h: 28, anchor: [16, 26], foot: [-15, -13, 30, 12], shadow: { rx: 17, ry: 5, dy: -1 },
    draw: (p) => {
      squareBody(p);
      // Breadboard ends: cross-grain strips with peg heads.
      p.vline(4, 1, 14, "wood3").vline(27, 1, 14, "wood3");
      p.over(() => {
        p.vline(2, 4, 3, "wood5").vline(3, 9, 2, "wood3").vline(29, 3, 3, "wood5").vline(28, 10, 3, "wood3");
        for (const x of [2, 29]) for (const y of [5, 11]) p.px(x, y, "wood2").px(x - 1 + (x === 2 ? 0 : 1), y - 1, "wood5");
      });
      p.hline(5, 8, 22, "wood3");
      streaks(p, [
        [7, 3, 4, "wood5"], [17, 4, 5, "wood5"], [13, 6, 3, "wood3"], [22, 6, 3, "wood3"],
        [6, 10, 3, "wood3"], [9, 11, 5, "wood5"], [20, 10, 4, "wood5"], [24, 12, 2, "wood3"],
      ]);
      squareEdges(p);
      // Knot with its grain swirling round it.
      p.rows(20, 2, [".33.", "3223", ".35."], { "3": "wood3", "2": "wood2", "5": "wood5" });
      // Elbow-polished patch at the front.
      p.rows(12, 12, [".55555.", "5555555"], { "5": "wood5" }).hline(14, 13, 3, "wood6");
      // Footrest rail between the front legs, worn bright where shoes rest.
      p.hline(5, 23, 22, "wood3").hline(5, 24, 22, "wood2").hline(11, 23, 9, "wood4").hline(13, 23, 4, "wood5");
      // Shortened left leg on a folded paper shim.
      p.hline(2, 25, 3, null).rows(1, 25, [".442"], { "4": "cream4", "2": "cream2" });
      p.outline("wood1");
    },
  },

  /**
   * Two-seater, 20 wide. Story: a little chopstick drawer in the apron with a brass pull, and a
   * hairline crack running in from the right edge. Plate room: x 4–14, y 3–9.
   */
  "furn/table-small": {
    w: 20, h: 23, anchor: [10, 21], foot: [-9, -9, 18, 8], shadow: { rx: 11, ry: 4, dy: -1 },
    draw: (p) => {
      p.rect(2, 1, 16, 1, "wood5").rect(1, 2, 18, 8, "wood4");
      p.hline(1, 10, 18, "wood3").hline(1, 11, 18, "wood2");
      p.hline(1, 5, 18, "wood3").px(11, 5, "wood4");
      streaks(p, [[3, 3, 4, "wood5"], [10, 2, 3, "wood5"], [13, 3, 2, "wood3"], [4, 7, 3, "wood3"], [9, 8, 5, "wood5"]]);
      p.over(() => p.vline(1, 2, 8, "wood5").vline(18, 2, 8, "wood3").hline(3, 2, 5, "wood6").px(2, 3, "wood6"));
      // Hairline crack.
      p.rows(13, 6, ["...33", ".33..", "3...."], { "3": "wood2" });
      p.hline(4, 9, 3, "wood5");
      // Apron with a shallow drawer.
      p.rect(3, 12, 14, 3, "wood2").hline(4, 14, 12, "wood1");
      p.rect(6, 12, 8, 2, "wood3").hline(6, 12, 8, "wood4").vline(13, 12, 2, "wood2");
      p.rows(9, 12, ["gG"], { g: "gold4", G: "gold2" });
      leg(p, 2, 12, 9);
      leg(p, 15, 12, 9);
      p.outline("wood1");
    },
  },

  /**
   * Round family table on a turned pedestal, 32 across. Story: a pale heat ring where a hot pot
   * was set down without a mat. Plate room: the whole middle, x 6–25, y 4–15.
   */
  "furn/table-round": {
    w: 32, h: 33, anchor: [16, 31], foot: [-14, -12, 28, 11], shadow: { rx: 15, ry: 5, dy: -2 },
    draw: (p) => {
      // Turned pedestal on a domed foot; the top overhangs it.
      p.rows(5, 19, [
        ".......22222222.......",
        "........433322........",
        "........443322........",
        ".......54433322.......",
        ".......54433322.......",
        "........443322........",
        "........443322........",
        ".......54433322.......",
        "........443322........",
        ".......54433322.......",
        "....55544443333222....",
        "..555444444333333222..",
        ".23333333333222222222.",
      ], { "2": "wood2", "3": "wood3", "4": "wood4", "5": "wood5" });
      // Top: a hand-tuned oval with a two-row rim showing below its front curve.
      const top = oval([5, 8, 10, 12, 13, 14, 15, 15], 1, 1);
      top.fill(p, "wood2", 0, 2);
      top.fill(p, "wood3", 0, 1);
      top.fill(p, "wood4");
      const onTop = (x: number, y: number, c: Paint) => { if (top.inside(x, y)) p.px(x, y, c); };
      // Planks across, each seam broken once.
      for (let x = 0; x < 32; x++) {
        if (x !== 11) onTop(x, 6, "wood3");
        if (x !== 22) onTop(x, 12, "wood3");
      }
      for (const [x, y, n, c] of [[6, 3, 5, "wood5"], [17, 2, 4, "wood5"], [21, 4, 3, "wood3"], [3, 8, 4, "wood5"], [12, 9, 2, "wood3"], [23, 9, 4, "wood5"], [6, 14, 5, "wood5"], [18, 15, 3, "wood3"], [13, 4, 2, "wood3"]] as const)
        for (let i = 0; i < n; i++) onTop(x + i, y, c);
      // Lit upper-left rim of the top, shaded right side.
      for (let y = 0; y < 18; y++) for (let x = 0; x < 32; x++) {
        if (top.inside(x, y) && !top.inside(x, y, 1, 1) && x < 21 && y < 12) p.px(x, y, "wood5");
        if (top.inside(x, y) && !top.inside(x, y, -1, -1) && x > 20 && y < 12) p.px(x, y, "wood3");
      }
      p.hline(9, 2, 5, "wood6").hline(5, 3, 2, "wood6");
      // Heat ring.
      p.rows(18, 7, [".555.", "5...5", ".55.5"], { "5": "wood5" });
      p.outline("wood1");
    },
  },
});
