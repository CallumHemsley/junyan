/**
 * Front-of-house furniture: the sideboard, the water dispenser, and the things by the door.
 * Anchors are the front of the base on the floor.
 */
import { defineSprites, Px, type Legend } from "../../kit/index.ts";
import { boards, grid, roundCorners, topEdges } from "./_helpers.ts";

const S: Legend = { "1": "steel1", "2": "steel2", "3": "steel3", "4": "steel4", "5": "steel5", "6": "steel6" };
const BW: Legend = { w: "white", "6": "blue6", "5": "blue5", "4": "blue4", "3": "blue3", "2": "blue2", "1": "blue1" };
const W: Legend = { "1": "wood1", "2": "wood2", "3": "wood3", "4": "wood4", "5": "wood5", "6": "wood6" };

/** A raised door panel: frame lit top and left, panel field, shade bottom and right. */
function panelDoor(p: Px, x: number, y: number, w: number, h: number) {
  p.rect(x, y, w, h, "wood3").hline(x, y, w, "wood4").vline(x, y, h, "wood4").hline(x, y + h - 1, w, "wood2").vline(x + w - 1, y, h, "wood2");
  p.rect(x + 3, y + 3, w - 6, h - 6, "wood4");
  p.hline(x + 3, y + 3, w - 6, "wood2").vline(x + 3, y + 3, h - 6, "wood2").hline(x + 4, y + h - 4, w - 7, "wood5").vline(x + w - 4, y + 4, h - 7, "wood5");
  p.over(() => p.hline(x + 6, y + 6, w - 14, "wood5").hline(x + 8, y + 9, w - 18, "wood3").hline(x + 5, y + h - 7, w - 12, "wood3"));
}

/** The big inverted water bottle, `bubble` 0–3 for the rising-bubble frames. 24×36. */
function waterBottle(bubble: number): Px {
  const p = new Px(24, 36);
  // Air in the upturned base, then water, ribs, the neck into the collar.
  p.faded(0.5, () => { p.rect(3, 1, 18, 5, "blue6"); roundCorners(p, 3, 1, 18, 5, 3, "tl tr"); });
  p.faded(0.85, () => {
    p.rect(2, 6, 20, 22, "blue4").rect(3, 28, 18, 2, "blue4").rect(7, 30, 10, 2, "blue4").rect(9, 32, 6, 3, "blue3");
    p.vline(2, 6, 22, "blue5").vline(21, 6, 22, "blue3").vline(20, 6, 22, "blue3");
    for (const y of [10, 17, 24]) p.hline(2, y, 20, "blue3").hline(3, y + 1, 18, "blue5");
  });
  p.hline(3, 6, 18, "blue5");
  p.vline(4, 3, 24, "white").vline(5, 7, 3, "white").vline(5, 14, 2, "white");
  // Bubbles rising.
  for (const [bx, by] of [[12, 26], [15, 20], [11, 13], [14, 8]] as const) {
    const y = by - bubble * 2;
    if (y > 6) p.px(bx, y, "blue6").px(bx + 1, y, "white");
  }
  return p.outline("blue1");
}

export default defineSprites({
  /**
   * The tea-wood sideboard by the counter, bought with table 1 and just as old. The middle
   * drawer of spoons and chopsticks is left ajar all day with a tea towel over it; a stack of
   * bowls and a cup of porcelain spoons wait on top; the key lives in the left door.
   */
  "furn/sideboard": {
    w: 64, h: 60, anchor: [32, 58], foot: [-31, -14, 62, 13], shadow: { rx: 33, ry: 6, dy: -2 },
    draw: (p) => {
      // Top.
      p.rect(2, 14, 60, 1, "wood5").rect(1, 15, 62, 10, "wood4");
      boards(p, 1, 14, 62, 11, { dir: "h", seams: [5], seed: 101, flush: [40] });
      topEdges(p, 1, 14, 62, 11);
      p.over(() => grid(p, 26, 17, 8, ["..3333..", ".3....3.", "..3333.."], { "3": "wood3" }));
      p.hline(1, 25, 62, "wood5").rect(1, 26, 62, 2, "wood3").hline(1, 28, 62, "wood2");
      // Carcass front.
      p.rect(1, 29, 62, 25, "wood2");
      // Drawers: left and right shut, the middle one pulled out with its contents showing.
      for (const x of [3, 43]) {
        p.rect(x, 30, 18, 7, "wood3").hline(x, 30, 18, "wood4").vline(x, 30, 7, "wood4").vline(x + 17, 30, 7, "wood2").hline(x, 36, 18, "wood2");
        grid(p, x + 7, 32, 4, ["g55g", "G44G"], { g: "gold2", G: "gold1", "5": "gold5", "4": "gold3" });
      }
      p.rect(23, 29, 18, 3, "wood1");
      grid(p, 24, 29, 16, ["c.cc.bb.bbb.cc.c", "cccccbbbbbbccccc", "...............".padEnd(16, ".")], { c: "cream5", b: "bamboo4" });
      p.rect(23, 32, 18, 7, "wood3").hline(23, 32, 18, "wood5").hline(23, 33, 18, "wood4").vline(23, 33, 6, "wood4").vline(40, 33, 6, "wood2").hline(23, 38, 18, "wood2");
      // Doors with raised panels, ring pulls, the key.
      panelDoor(p, 3, 40, 28, 13);
      panelDoor(p, 33, 40, 28, 13);
      for (const x of [27, 35]) grid(p, x, 44, 3, [".g.", "g.g", ".G."], { g: "gold3", G: "gold1" });
      grid(p, 24, 45, 3, ["gg.", "g5g", ".g.", ".j.", ".j."], { g: "gold2", "5": "gold5", j: "jade3" });
      // Plinth with bracket feet.
      p.rect(1, 54, 62, 3, "wood3").hline(1, 54, 62, "wood4").hline(1, 56, 62, "wood2");
      p.rect(1, 57, 7, 1, "wood2").rect(56, 57, 7, 1, "wood2");
      // The tea towel over the open drawer.
      grid(p, 28, 31, 8, [
        "cccccccc", "cbcccbcc", "cccccccC", "cbcccbcC", "cccccccC", "cbcccbcC", "ccccccCC", "cbcccbC.", "cccccc..", ".ccc.C..", "..c.....",
      ], { c: "cream5", C: "cream3", b: "blue4" });
      // On top: a stack of bowls, and a cup of porcelain spoons.
      grid(p, 5, 6, 16, [
        "....wwwwwwww....",
        "..ww66666666ww..",
        ".w6555555555556.",
        "w66666666666665w",
        "w2w22w2w22w2w225",
        ".w66666666666656",
        "..w2222222222256",
        "..w66666666665..",
        "...w66666666552.",
        "....w666666552..",
        ".....33333333...",
        "....w66666665...",
        ".....3333333....",
      ], BW);
      grid(p, 42, 3, 12, [
        "..w...w.....",
        ".w6..w6..w..",
        ".66.w6..w6..",
        "..6.66.w6...",
        "..66.6.66...",
        ".6666666666.",
        ".w2w2w2w225.",
        ".w666666665.",
        ".w666666665.",
        ".w2w22w2225.",
        ".w666666655.",
        "..55555555..",
      ], BW);
      p.outline("wood1");
    },
  },

  /**
   * The water dispenser by the door: a big blue bottle upturned on a cream stand. The hot tap has
   * been taped over since the heater broke; somebody left a paper cup on the drip tray; a tube of
   * paper cups hangs on the side. Bubbles rise when it pours.
   */
  "furn/water-dispenser": {
    w: 32, h: 82, anchor: [15, 80], foot: [-11, -8, 22, 8], shadow: { rx: 12, ry: 4, dy: -1 }, frames: 4, fps: 3,
    draw: (p, frame) => {
      const stand = new Px(32, 82);
      // Cabinet: collar, tap panel, drip tray recess, lower door with vents.
      stand.rect(3, 36, 22, 44, "cream4").vline(3, 36, 44, "cream5").vline(4, 36, 44, "cream5").rect(22, 36, 3, 44, "cream3").vline(24, 36, 44, "cream2");
      stand.rect(3, 34, 22, 3, "cream5").hline(3, 34, 22, "white").hline(3, 37, 22, "cream3");
      stand.rect(7, 31, 14, 3, "steel4").hline(7, 31, 14, "steel5").hline(7, 33, 14, "steel3");
      // Taps: red hot (taped over) and blue cold.
      grid(stand, 7, 42, 14, ["..r1....b1....", ".rrr1..bbb1...", "..R1....B1....", "..R.....B....."], { r: "red3", R: "red2", "1": "steel2", b: "blue3", B: "blue2" });
      stand.faded(0.8, () => stand.rect(6, 43, 6, 2, "cream5"));
      stand.hline(6, 43, 6, "white");
      // Drip tray recess and its grille, the cup left on it.
      stand.rect(6, 47, 16, 8, "cream2").hline(6, 47, 16, "cream1").rect(6, 54, 16, 2, "steel3").hline(6, 54, 16, "steel5");
      for (let x = 7; x < 22; x += 2) stand.px(x, 55, "steel2");
      grid(stand, 15, 49, 5, ["wwwww", "w666w", ".w65.", ".w65.", ".w55."], BW);
      // Lower door with vents.
      stand.rect(5, 59, 18, 19, "cream4").hline(5, 59, 18, "cream5").vline(5, 59, 19, "cream5").hline(5, 77, 18, "cream3").vline(22, 59, 19, "cream3");
      for (let y = 62; y < 68; y += 2) stand.hline(8, y, 12, "cream2");
      stand.hline(5, 78, 20, "cream2").rect(4, 79, 4, 1, "cream2").rect(20, 79, 4, 1, "cream2");
      // Scuffs where shoes kick it.
      stand.rows(8, 74, ["22.2", ".22."], { "2": "cream3" });
      // The tube of paper cups on the side.
      grid(stand, 25, 38, 5, ["sssss", "s656s", "s656s", "s656s", "s656s", "s656s", "s656s", "s656s", "s656s", "s656s", "s656s", "ssss.", ".www.", ".w5w."], { ...BW, s: "steel4" });
      stand.outline("cream1");
      p.blit(stand, 0, 0);
      p.blit(waterBottle(frame), 2, 0);
    },
  },

  /**
   * The coat rack inside the door, tea wood on three splayed feet. A delivery rider's navy padded
   * jacket and old Mr Liu's tweed flat cap hang on it; the hook that broke was replaced with a
   * bent nail.
   */
  "furn/coat-rack": {
    w: 32, h: 88, anchor: [16, 86], foot: [-6, -4, 12, 4], shadow: { rx: 10, ry: 3, dy: -1 },
    draw: (p) => {
      // Feet and pole with a turned finial and collar.
      grid(p, 4, 78, 24, [
        "..........4332..........",
        "........44433322........",
        "......444..4332.3322....",
        "....444....4332...3322..",
        "..444......4332.....3322",
        "443........4332.......32",
        "33.........3322........2",
        "...........2222.........",
      ], W);
      p.rect(14, 8, 4, 70, "wood3").vline(14, 8, 70, "wood4").vline(17, 8, 70, "wood2");
      grid(p, 13, 0, 6, ["..55..", ".5443.", ".4332.", "..32..", ".4332.", "443322", ".4332.", "..32.."], W);
      // Hooks: wooden pegs angled up, and the nail.
      grid(p, 6, 10, 20, ["4...............43..", "443............432..", ".4433........4332...", "...4333....3332.....", "......433332........"], W);
      p.rows(18, 22, ["22", "..2", "..1"], S);
      // The tweed cap on the upper left hook.
      grid(p, 2, 7, 13, [
        "....ggGgg....",
        "..gGGgGggg...",
        ".gGgggGgGgg..",
        "gggGgggggggg.",
        "kkkkkkkkkkkkg",
        ".kkk.........",
      ], { g: "grey2", G: "grey3", k: "grey1" });
      // The navy padded jacket on the right hook: quilted, hood down, a sleeve hanging forward.
      grid(p, 13, 13, 18, [
        "....ddddd.........",
        "..dd5555dd........",
        ".d55444445d.......",
        ".d444444444d......",
        "d44444444444d.....",
        "d44222242224dd....",
        "d4444443444443d...",
        "d4444443444444d...",
        "d44222243222224d..",
        "d4444443444444d4d.",
        "d4444443444444d44d",
        "d44222243222224d4d",
        "d4444443444444d44d",
        "d4444443444444d44d",
        "d44222243222224d4d",
        "d4444443444444dd4d",
        "d4444443444444d.4d",
        "d44222243222224.4d",
        "d4444443444444d.dd",
        "d4444443444444d.ss",
        "d44222243222224.ss",
        "d4444444s44444d...",
        "dddddddddddddd....",
      ], { d: "blue1", "5": "blue4", "4": "blue3", "3": "blue2", "2": "blue2", s: "grey3" });
      p.outline("wood1");
    },
  },

  /**
   * A blue-and-white umbrella pot by the door, a wave scroll and a lotus on it, with two umbrellas:
   * the owner's long plum one with a bamboo crook, and a little jade folding one a customer forgot
   * in the rain last week.
   */
  "furn/umbrella-stand": {
    w: 22, h: 50, anchor: [11, 48], foot: [-8, -5, 16, 5], shadow: { rx: 9, ry: 3, dy: -1 },
    draw: (p) => {
      // The plum umbrella: a bamboo crook, the furled canopy and its tie.
      grid(p, 2, 0, 9, ["..bbbb...", ".b5..4b..", "b5....b..", "b4....b..", ".2.....b.", ".......b.", ".......B."], { b: "bamboo4", "5": "bamboo5", "4": "bamboo3", "2": "bamboo2", B: "bamboo2" });
      grid(p, 6, 7, 7, ["..ppP..", "..pPP..", ".ppPPP.", ".pppPP.", ".ppPPPq", ".pttttq", "pppPPPq", "ppPPPPq", "pppPPPq", "ppPPPPq", "ppPPPPq", "pppPPPq", "ppqqqqq"], { p: "plum3", P: "plum2", q: "plum1", t: "plum4" });
      // The forgotten jade folding umbrella, strap undone.
      grid(p, 12, 11, 7, ["..kk...", ".kKk...", ".jjj...", "jjJjj..", "jjJJj..", "jjJJjl.", "jjJJj.l", "jjJJj.l", "jJJJj..", "jjJJj.."], { k: "ink2", K: "steel3", j: "jade4", J: "jade3", l: "jade2" });
      // The pot: a dark mouth, bands, a wave scroll, a glaze highlight down the left.
      grid(p, 2, 19, 18, [
        "..wwwwwwwwwwwwww..",
        ".w11112211111111w.",
        "w6w666666666666656",
        "w6222222222222222 5".slice(0, 17) + "5",
        "w6w666666666666655",
        "w6w.22....22....25",
        "w6w2..2..2..2..2.5",
        "w6w....22....22..5",
        "w6w666666666666655",
        "w6w666666266666655",
        "w6w666626262666655",
        "w6w666622222666655",
        "w6w666662226666655",
        "w6w666666666666655",
        "w6w666666666666655",
        "w6w666666666666655",
        "w6w666666666666655",
        "w6w333333333333355",
        "w6w666666666666655",
        "w6w666666666666655",
        "w6w666666666666655",
        "w6w222222222222255",
        "w6w666666666666655",
        "w66666666666666655",
        ".w666666666666655.",
        "..55555555555555..",
        "..33333333333333..",
      ].map((r) => r.replace(/\./g, (m, i: number) => (i > 2 && i < 17 ? "6" : m))), BW);
      p.outline("blue1");
    },
  },

  /**
   * The newspaper rack the regulars fight over: two tea-wood rails with today's papers folded over
   * them and a tray of yesterday's below. Ruled lines and picture blocks only, never text.
   */
  "furn/newspaper-rack": {
    w: 30, h: 56, anchor: [15, 54], foot: [-13, -6, 26, 6], shadow: { rx: 14, ry: 3, dy: -1 },
    draw: (p) => {
      // Uprights, rails and the bottom tray.
      for (const x of [2, 25]) p.rect(x, 4, 3, 50, "wood3").vline(x, 4, 50, "wood4").vline(x + 2, 4, 50, "wood2");
      grid(p, 1, 1, 5, [".555.", "54432", ".433."], W);
      grid(p, 24, 1, 5, [".555.", "54432", ".433."], W);
      for (const y of [8, 24]) p.rect(2, y, 26, 2, "wood4").hline(2, y, 26, "wood5").hline(2, y + 1, 26, "wood2");
      // Papers folded over the rails.
      const paper = (x: number, y: number, h: number, seed: number) => {
        p.rect(x, y, 20, h, "cream5").vline(x + 19, y, h, "cream3").hline(x, y + h - 1, 20, "cream3").vline(x, y, h, "white");
        p.hline(x + 2, y + 2, 9, "ink2").hline(x + 2, y + 3, 9, "ink2");
        for (let j = y + 6; j < y + h - 2; j += 2) {
          p.hline(x + 2, j, 7, "stone3");
          if (j < y + 6 + 6 && seed) p.rect(x + 11, y + 6, 6, 5, "stone3").hline(x + 11, y + 6, 6, "stone4");
          else p.hline(x + 11, j, 6, "stone3");
        }
      };
      paper(5, 10, 13, 1);
      paper(6, 26, 16, 0);
      p.rect(5, 9, 20, 1, "cream3");
      p.rect(6, 25, 20, 1, "cream3");
      // A page has slipped and hangs crooked.
      grid(p, 17, 37, 9, ["ccccccccc", "cllll.llc", "ccccccccC", ".cllll.lc", ".ccccccCC", "..cccccC."], { c: "cream4", C: "cream2", l: "stone3" });
      p.rect(2, 46, 26, 6, "wood3").hline(2, 46, 26, "wood5").hline(2, 47, 26, "wood4").hline(2, 51, 26, "wood2");
      p.rect(5, 44, 20, 2, "cream4").hline(5, 44, 20, "cream5").hline(7, 43, 15, "cream3");
      p.rect(2, 52, 3, 2, "wood2").rect(25, 52, 3, 2, "wood2");
      p.outline("wood1");
    },
  },

  /**
   * The steel pedal bin by the counter, dented on the side where the mop bucket hits it. The lid
   * never quite closes over the receipts and a crushed soy milk cup.
   */
  "furn/bin": {
    w: 20, h: 28, anchor: [10, 26], foot: [-8, -5, 16, 5], shadow: { rx: 8, ry: 3, dy: -1 },
    draw: (p) => {
      // The lid, propped open a little by what is inside.
      grid(p, 1, 0, 18, [
        "......cccC........",
        "....cCcwwcC.......",
        ".5555556666555....",
        "566666666666665...",
        "4555555555555554..",
        "..ww.c...........",
      ].map((r) => r.padEnd(18, ".")), { ...S, c: "cream4", C: "cream2", w: "white" });
      grid(p, 2, 5, 16, [
        "3333333333333322",
        "4655444444433322",
        "4655444444433322",
        "4655444444433322",
        "4655443344433322",
        "4655432234433322",
        "4655443344433322",
        "4655444444433322",
        "4655444444433322",
        "4655444444433322",
        "4655444444433322",
        "4655444444433322",
        "4655444444433322",
        "4655444444433322",
        "4655444444433322",
        "3444333333333222",
        "4555555555555544",
        "2222222222222222",
      ], S);
      // The pedal.
      grid(p, 6, 23, 8, ["11111111", ".555554.", ".222222."], S);
      p.outline("steel1");
    },
  },
});
