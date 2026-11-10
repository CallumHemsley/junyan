/**
 * Backless seats: stools and the bench. Each doc comment gives the seated person's anchor: where
 * the character's own anchor (their foot pixel, `[16, 62]` in a 32×64 frame) goes relative to the
 * seat's anchor. Draw the sitter after their seat. "Hips" is the centre of the seat surface.
 */
import { defineSprites, Px, type Color, type Legend } from "../../kit/index.ts";
import { boards, each, grid, oval, ovalHalves, peg, roundCorners, topEdges } from "./_helpers.ts";

const W: Legend = { "1": "wood1", "2": "wood2", "3": "wood3", "4": "wood4", "5": "wood5", "6": "wood6" };
const BAM: Legend = { "1": "bamboo1", "2": "bamboo2", "3": "bamboo3", "4": "bamboo4", "5": "bamboo5" };
const BLUE: Legend = { "1": "blue1", "2": "blue2", "3": "blue3", "4": "blue4", "5": "blue5", "6": "blue6" };
const TO_JADE: Partial<Record<Color, Color>> = { blue1: "jade1", blue2: "jade2", blue3: "jade3", blue4: "jade4", blue5: "jade5", blue6: "jade6" };

/** A turned leg, 5 wide, with two bead rings; `right` puts it in shade. */
function turnedLeg(p: Px, x: number, y: number, right: boolean) {
  const rows = [
    ".432.", ".432.", "44322", ".432.", ".432.", ".432.", "44322", "54322", ".432.", ".432.", ".432.", ".332.", "44322", ".322.", ".332.", ".222.",
  ];
  grid(p, x, y, 5, right ? rows.map((r) => r.replace(/4/g, "3").replace(/5/g, "4")) : rows, W);
}

/** The plastic stool, 28×30 at (0, y), drawn in blue. */
function plasticStool(p: Px, y = 0) {
  // Rolled lip, skirt, the arch and the splayed legs with their moulded ribs.
  grid(p, 0, y + 11, 28, [
    ".44444444444444444444444443.",
    ".33333333333333333333333332.",
    ".22222222222222222222222222.",
    ".43333333333333333333333322.",
    ".433332222222222222222333 2.".replace(" ", "2"),
    ".43332111111111111111123332.",
    ".4332211.............122332.",
    ".43322.................2332.",
    ".43422.................2432.",
    ".43422.................2432.",
    ".43422.................2432.",
    ".43422.................2432.",
    "443422.................24322",
    "443422.................24322",
    "4434222...............224322",
    "4333222...............222322",
    "3222221...............122222",
    "33333.................333322",
  ], BLUE);
  // The lid: sun-faded, an embossed ring round the hand-hold slot.
  p.rect(2, y + 1, 24, 10, "blue4").rect(1, y + 2, 26, 8, "blue4");
  roundCorners(p, 1, y + 1, 26, 10, 4);
  p.over(() => {
    p.rect(3, y + 1, 18, 5, "blue5").rect(2, y + 2, 12, 6, "blue5");
    p.hline(5, y + 1, 12, "blue6").hline(3, y + 2, 5, "blue6").vline(1, y + 3, 5, "blue5");
    p.vline(26, y + 3, 6, "blue3").hline(4, y + 10, 21, "blue3");
  });
  grid(p, 7, y + 3, 14, [
    "...44444444...",
    ".44........44.",
    "4...111111...4",
    "4...222222...4",
    ".44........44.",
    "...55555555...",
  ], BLUE);
}

/** The bench's folded newspaper: ruled lines and a picture block, never text. */
function newspaper(p: Px, x: number, y: number) {
  grid(p, x, y, 16, [
    "..cccccccccccccw",
    ".cwwwwwwwwwwwwwc",
    "cwkkkkkk.lll.llc",
    "cw.......lll.llc",
    "cwgggg.l.......c",
    "cwgggg.l.llllllc",
    "cwgggg.l.......c",
    "cw.....l.llll.lc",
    "cwlll.ll.......c",
    "ccccccccccccccc.",
    "2222222222222222",
  ], { c: "cream3", w: "cream5", k: "ink2", l: "cream2", g: "stone3", "2": "wood2" });
}

export default defineSprites({
  /**
   * The turned stool by the door with a plum cushion cut from an old cheongsam; one tie has come
   * undone and dangles down the leg. Sitter anchor (0, -4); hips (0, -21).
   */
  "furn/stool-turned": {
    w: 28, h: 31, anchor: [14, 30], foot: [-10, -12, 20, 11], shadow: { rx: 13, ry: 5, dy: -1 },
    draw: (p) => {
      for (const x of [8, 18]) p.rect(x, 14, 2, 10, "wood2").px(x, 18, "wood1");
      p.rect(6, 20, 16, 2, "wood2").hline(6, 20, 16, "wood3").hline(9, 20, 6, "wood4");
      turnedLeg(p, 2, 13, false);
      turnedLeg(p, 21, 13, true);
      // Seat: a thick turned disc with a groove round its edge.
      p.ellipse(14, 12, 13, 6.5, "wood2");
      p.ellipse(14, 11, 13, 6.5, "wood3");
      p.ellipse(14, 9, 13, 6.5, "wood4");
      p.over(() => { p.hline(3, 14, 8, "wood4").hline(16, 15, 6, "wood2"); p.hline(5, 3, 7, "wood5").hline(3, 5, 3, "wood5"); });
      // Cushion: plum with cream blossoms, a tufted button, piping, and the ties.
      const cushion = oval(ovalHalves(22, 12), 3, 2);
      cushion.fill(p, "plum2", 0, 1);
      cushion.fill(p, "plum3");
      p.over(() => {
        each(3, 2, 22, 12, (x, y) => {
          if (!cushion.inside(x, y)) return;
          if (!cushion.inside(x - 1, y - 1) && x < 14) p.px(x, y, "plum4");
          if (!cushion.inside(x + 1, y + 1) && x > 12) p.px(x, y, "plum2");
        });
        for (const [x, y] of [[6, 5], [12, 3], [19, 4], [9, 9], [17, 8], [22, 9]] as const) {
          grid(p, x - 1, y - 1, 3, [".c.", "cgc", ".c."], { c: "cream4", g: "gold3" });
        }
        // Tufting: a button and the creases pulling toward it.
        p.px(13, 7, "plum1").px(14, 7, "plum4").px(11, 7, "plum2").px(16, 8, "plum2").px(13, 5, "plum2").px(14, 10, "plum2");
      });
      // The tied bow at the back left, and the undone tie hanging over the right edge.
      grid(p, 2, 10, 4, [".pp.", "pPpp", ".p.p", "..p."], { p: "plum2", P: "plum4" });
      grid(p, 23, 10, 3, [".p.", "pP.", ".p.", "..p", "..p", ".p.", ".p.", "..p", "..p", "..q"], { p: "plum3", P: "plum4", q: "plum2" });
      p.outline("wood1");
    },
  },

  /**
   * A bamboo stool from the market in the next street: poles with knuckled nodes, rattan lashing
   * at every joint and a basket-woven split-bamboo seat. One strip has snapped and sticks up at
   * the front right. Hands have darkened the front rail. Sitter anchor (0, -4); hips (0, -21).
   */
  "furn/stool-bamboo": {
    w: 28, h: 30, anchor: [14, 29], foot: [-10, -11, 20, 10], shadow: { rx: 13, ry: 5, dy: -1 },
    draw: (p) => {
      // Back legs and the low stretcher.
      for (const x of [7, 19]) p.rect(x, 15, 2, 9, "bamboo2").hline(x, 19, 2, "bamboo1");
      p.rect(5, 22, 18, 2, "bamboo3").hline(5, 22, 18, "bamboo4").hline(5, 23, 18, "bamboo2").vline(13, 22, 2, "bamboo1").px(14, 22, "bamboo5");
      // Front poles: each node a knuckle that swells a pixel past the pole.
      for (const [x, right] of [[2, false], [23, true]] as const) {
        p.rect(x, 15, 3, 13, right ? "bamboo3" : "bamboo4").vline(x, 15, 13, right ? "bamboo3" : "bamboo5").vline(x + 2, 15, 13, right ? "bamboo1" : "bamboo2");
        for (const ny of [19, 25]) p.hline(x - 1, ny, 5, "bamboo1").hline(x - 1, ny + 1, 5, right ? "bamboo3" : "bamboo5").px(x + 3, ny + 1, "bamboo2");
        p.hline(x, 28, 3, "bamboo2");
      }
      // The weave: three-pixel strips going over and under, a dark gap between them.
      p.rect(1, 3, 26, 9, "bamboo2");
      roundCorners(p, 1, 3, 26, 9, 2, "tl tr");
      each(2, 3, 24, 9, (x, y) => {
        const lx = (x - 2) % 4, ly = (y - 3) % 3, cx = Math.floor((x - 2) / 4), cy = Math.floor((y - 3) / 3);
        let c: Color;
        if ((cx + cy) % 2 === 0) c = ly === 0 ? "bamboo5" : ly === 1 ? "bamboo4" : "bamboo2";
        else c = lx === 3 ? "bamboo1" : lx === 2 ? "bamboo3" : "bamboo4";
        p.px(x, y, c);
      });
      p.over(() => { p.vline(1, 5, 6, "bamboo4"); p.vline(26, 5, 6, "bamboo2"); });
      // Seat frame: a round pole along the front, darkened by hands in the middle, with a node.
      p.rect(1, 12, 26, 3, "bamboo3").hline(1, 12, 26, "bamboo5").hline(1, 14, 26, "bamboo2");
      p.hline(9, 13, 9, "bamboo2").hline(10, 12, 7, "bamboo3");
      p.vline(19, 12, 3, "bamboo1").px(20, 12, "bamboo5");
      // Rattan lashing wrapped round the front joints, standing proud of the poles.
      for (const x of [1, 22]) grid(p, x, 11, 5, [".151.", "15151", "51515", "15151", ".515."], { "1": "bamboo1", "5": "bamboo4" });
      // The snapped strip sticking up out of the weave: a two-pixel break in the silhouette.
      grid(p, 18, 0, 4, ["..54", ".54.", "543.", "43.."], BAM);
      p.outline("bamboo1");
    },
  },

  /**
   * The classic stackable stool every breakfast shop owns, in faded blue. The lid has bleached in
   * the window, and the left leg has gone white where it was bent once too often.
   * Sitter anchor (0, -4); hips (0, -23).
   */
  "furn/stool-plastic": {
    w: 28, h: 30, anchor: [14, 29], foot: [-10, -11, 20, 10], shadow: { rx: 13, ry: 5, dy: -1 },
    draw: (p) => {
      plasticStool(p);
      grid(p, 2, 20, 4, ["..6.", ".6..", ".56.", "..6."], BLUE);
      p.outline("blue1");
    },
  },

  /**
   * The jade one of the same stools, older: a piece snapped out of the lip at the front right,
   * and a ring of grime round the slot. Sitter anchor (0, -4); hips (0, -23).
   */
  "furn/stool-plastic-jade": {
    w: 28, h: 30, anchor: [14, 29], foot: [-10, -11, 20, 10], shadow: { rx: 13, ry: 5, dy: -1 },
    draw: (p) => {
      plasticStool(p);
      p.rect(20, 11, 4, 2, null).rows(19, 11, ["3....3", "32222."], BLUE);
      p.over(() => p.hline(11, 7, 6, "blue3"));
      p.outline("blue1");
      p.swap(TO_JADE);
    },
  },

  /** Four plastic stools nested in the corner, jade on blue on jade on blue, waiting for a rush. Not a seat. */
  "furn/stool-stack": {
    w: 28, h: 40, anchor: [14, 39], foot: [-10, -11, 20, 10], shadow: { rx: 13, ry: 5, dy: -1 },
    draw: (p) => {
      // Draw from the bottom stool up, each one three pixels higher and on top.
      for (let i = 0; i < 4; i++) {
        const s = new Px(28, 30);
        plasticStool(s);
        s.outline("blue1");
        p.blit(s, 0, 10 - i * 3, { map: i % 2 ? TO_JADE : {} });
      }
    },
  },

  /**
   * A plain square tea-wood stool: a thick slab seat with chamfered edges, the four legs
   * through-tenoned and wedged so their end grain shows on top. The last of a set of four. The
   * shop cat sharpens its claws on the left leg. Sitter anchor (0, -4); hips (0, -22).
   */
  "furn/stool-square": {
    w: 26, h: 31, anchor: [13, 30], foot: [-10, -11, 20, 10], shadow: { rx: 12, ry: 5, dy: -1 },
    draw: (p) => {
      // Back legs, the apron rail and the front stretcher.
      for (const x of [7, 17]) p.rect(x, 15, 2, 10, "wood2");
      p.rect(2, 15, 22, 2, "wood2").hline(2, 15, 22, "wood1");
      p.rect(6, 23, 14, 2, "wood3").hline(6, 23, 14, "wood4").hline(6, 24, 14, "wood2");
      // Front legs, six wide.
      p.rect(1, 15, 6, 15, "wood3").vline(1, 16, 13, "wood4").vline(2, 16, 13, "wood4").vline(6, 15, 15, "wood2");
      p.rect(19, 15, 6, 15, "wood3").vline(23, 15, 15, "wood2").vline(24, 15, 15, "wood2");
      p.hline(1, 29, 6, "wood2").hline(19, 29, 6, "wood2");
      // Slab seat with grain, a lit chamfer round the top, then the front chamfer and face.
      p.rect(1, 2, 24, 10, "wood4");
      boards(p, 1, 2, 24, 10, { dir: "h", seams: [], seed: 72, density: 2.2 });
      p.over(() => { p.hline(2, 2, 22, "wood5").vline(1, 3, 8, "wood5").hline(3, 2, 8, "wood6").vline(24, 3, 9, "wood3"); });
      roundCorners(p, 1, 2, 24, 10, 1, "tl tr");
      p.hline(1, 12, 24, "wood5").rect(1, 13, 24, 1, "wood3").hline(1, 14, 24, "wood2");
      // Wedged through-tenons: end grain with a pale wedge line.
      for (const [x, y] of [[2, 3], [20, 3], [2, 8], [20, 8]] as const) grid(p, x, y, 4, ["3223", "2552", "3223"], { "3": "wood3", "2": "wood2", "5": "wood5" });
      // Three pale claw scores down the left leg.
      for (let i = 0; i < 3; i++) grid(p, 1 + i * 2, 18 + i, 2, ["6.", "6.", "56", ".5", ".5"], { "5": "wood5", "6": "wood6" });
      p.outline("wood1");
    },
  },

  /**
   * The owner's daughter's little stool, painted sunflower yellow with a blue flower. She is eight
   * and too big for it now, but her star sticker is still on the seat and the paint has worn to
   * bare wood on the edges. Sitter anchor (0, -3); hips (0, -15). Child height.
   */
  "furn/stool-child": {
    w: 22, h: 22, anchor: [11, 21], foot: [-8, -8, 16, 7], shadow: { rx: 10, ry: 4, dy: -1 },
    draw: (p) => {
      // Splayed legs.
      grid(p, 1, 11, 20, [
        ".4432..........3322.",
        ".4432..........3322.",
        ".4432..........3322.",
        "4432............3322",
        "4432............3322",
        "4422............2222",
        "w43..............322",
        "433..............322",
        "222..............222",
      ], { "4": "gold4", "3": "gold3", "2": "gold2", w: "wood4" });
      // Top and edge.
      p.rect(1, 1, 20, 7, "gold4").rect(2, 1, 18, 1, "gold5");
      roundCorners(p, 1, 1, 20, 7, 2, "tl tr");
      p.over(() => { p.hline(3, 2, 9, "gold5").vline(1, 3, 4, "gold5").vline(20, 3, 4, "gold3"); });
      p.hline(1, 8, 20, "gold5").rect(1, 9, 20, 2, "gold3").hline(1, 11, 20, "gold2");
      // Paint worn to bare wood on the front edge and corners.
      p.rows(4, 8, ["ww..", ".W.."], { w: "wood5", W: "wood4" }).rows(15, 8, ["www", ".W."], { w: "wood5", W: "wood4" }).rows(1, 1, [".w", "w."], { w: "wood5" });
      // The blue flower on the front, and the star sticker on the seat.
      grid(p, 9, 9, 5, [".3.3.", "33g33", ".3.3."], { "3": "blue3", g: "white" });
      grid(p, 12, 2, 5, ["..s..", "sssss", ".sss.", ".s.s."], { s: "white" });
      p.px(14, 3, "gold5");
      p.outline("gold1");
    },
  },

  /**
   * The long bench under the window, one thick plank on pegged trestle ends. The seven o'clock
   * regular leaves his folded newspaper on it every morning; a soy milk cup has left a ring at the
   * other end. Two sitters: anchors (-14, -4) and (+14, -4); hips (±14, -20).
   */
  "furn/bench": {
    w: 62, h: 29, anchor: [31, 28], foot: [-29, -10, 58, 9], shadow: { rx: 31, ry: 5, dy: -2 },
    draw: (p) => {
      // Trestle ends, splayed, with a through-tenon peg, and the stretcher between them.
      p.rect(8, 18, 46, 3, "wood2").hline(8, 18, 46, "wood3");
      for (const [x, right] of [[3, false], [51, true]] as const) {
        const rows = right
          ? ["3332222.", "3332222.", ".3332222", ".3332222", ".3332222", ".3332222", ".3332222", ".3332222", "..3332222".slice(0, 8), "..333222", "..222222", "..333322"]
          : [".4443322", ".4443322", "4443322.", "4443322.", "4443322.", "4443322.", "4443322.", "4443322.", "444332..", "444332..", "222222..", "433332.."];
        grid(p, x, 15, 8, rows, W);
        peg(p, x + 3, 18);
      }
      // The plank: top, its lit edge, the front face.
      p.rect(2, 1, 58, 1, "wood5").rect(1, 2, 60, 9, "wood4");
      boards(p, 1, 1, 60, 10, { dir: "h", seams: [], seed: 81, density: 1.4 });
      topEdges(p, 1, 1, 60, 10);
      p.over(() => { for (const [x, y, n] of [[34, 6, 14], [32, 7, 18], [36, 8, 9]] as const) p.hline(x, y, n, "wood5"); });
      p.hline(1, 11, 60, "wood5").rect(1, 12, 60, 2, "wood3").hline(1, 14, 60, "wood2");
      // The soy milk ring, and the newspaper.
      p.over(() => grid(p, 48, 3, 8, ["..3333..", ".3....3.", ".3....3.", "..333..."], { "3": "wood3" }));
      newspaper(p, 6, 0);
      p.outline("wood1");
    },
  },
});

