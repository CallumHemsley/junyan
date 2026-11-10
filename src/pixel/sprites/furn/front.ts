/**
 * Front-of-house furniture: the bistro dresser (id `furn/sideboard`), the water dispenser, and the things by the door.
 * Anchors are the front of the base on the floor.
 */
import { defineSprites, Px, type Legend } from "../../kit/index.ts";
import { each, grid, roundCorners } from "./_helpers.ts";

const S: Legend = { "1": "steel1", "2": "steel2", "3": "steel3", "4": "steel4", "5": "steel5", "6": "steel6" };
const BW: Legend = { w: "white", "6": "blue6", "5": "blue5", "4": "blue4", "3": "blue3", "2": "blue2", "1": "blue1" };
const W: Legend = { "1": "wood1", "2": "wood2", "3": "wood3", "4": "wood4", "5": "wood5", "6": "wood6" };

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
   * The bistro dresser: dark stained wood, a marble top, glass-fronted doors above, bought with
   * the marble tables and now full of the shop's Chinese crockery: plates standing on edge, rice
   * bowls in stacks, the good teapot, a big blue-and-white jar. One pane has a crack across it
   * that nobody has had replaced; the brass pulls are polished pale by hands.
   */
  "furn/sideboard": {
    w: 64, h: 86, anchor: [32, 84], foot: [-31, -14, 62, 13], shadow: { rx: 33, ry: 6, dy: -2 },
    draw: (p) => {
      // Cornice.
      p.rect(0, 0, 64, 6, "wood2").hline(1, 0, 62, "wood3").hline(0, 1, 64, "wood4").hline(0, 4, 64, "wood3").hline(0, 5, 64, "wood1");
      p.over(() => p.hline(3, 1, 20, "wood5"));
      // Hutch carcass with two glazed doors.
      p.rect(3, 6, 58, 37, "wood2").vline(3, 6, 37, "wood3").vline(60, 6, 37, "wood1");
      for (const dx of [6, 33]) {
        p.rect(dx, 7, 25, 34, "wood2").hline(dx, 7, 25, "wood3").vline(dx, 7, 34, "wood3").vline(dx + 24, 7, 34, "wood1").hline(dx, 40, 25, "wood1");
        // The cabinet's dark inside, shelves, and what stands on them.
        p.rect(dx + 2, 9, 21, 30, "wood1");
        for (const y of [19, 29]) p.hline(dx + 2, y, 21, "wood3").hline(dx + 2, y + 1, 21, "wood2");
      }
      // Left door: plates on edge, a teapot; bowls; the big jar.
      for (const x of [9, 13, 17]) grid(p, x, 10, 5, [".www.", "w656w", "w525w", "w656w", "w656w", "w525w", "w656w", ".w55.", "..5.."], BW);
      grid(p, 23, 13, 7, ["..33...", ".w665..", "6w66653", ".66655.", "..555.."], BW);
      for (const x of [8, 16, 23]) grid(p, x, 23, 6, [".wwww.", "w6666w", "w2w2w5", "w6666w", ".5555.", ".wwww.", "w2w2w5"], BW);
      grid(p, 10, 30, 12, ["...wwwwww...", "..w666665...", ".w66666665..", ".w62w2w265..", ".w66666665..", ".w62222265..", "..w666665...", "...555555..."], BW);
      // Right door: cups on hooks, a stack of saucers, a bamboo steamer.
      for (const x of [36, 41, 46, 51]) grid(p, x, 11, 4, ["..1.", "ww1.", "w65.", "w65.", ".5.."], { ...BW, "1": "gold3" });
      p.hline(35, 11, 21, "gold2");
      grid(p, 36, 23, 18, ["wwwwwwwwwwwww.....", "6666666666665.....", "wwwwwwwwwwwww.....", "6666666666665.....", "wwwwwwwwwwwww.....", "5555555555555....."], BW);
      grid(p, 37, 31, 18, ["..bbbbbbbbbbbb....", ".b5454545454543...", "b44444444444443...", "b3b3b3b3b3b3b32...", "b44444444444443...", ".b3333333333332...", "..222222222222...."], { b: "bamboo2", "5": "bamboo5", "4": "bamboo4", "3": "bamboo3", "2": "bamboo1" });
      // Glazing bars, then the glass: two soft sheens per door, and the crack.
      for (const dx of [6, 33]) {
        p.rect(dx + 12, 9, 1, 30, "wood3");
        p.hline(dx + 2, 19, 21, "wood3").hline(dx + 2, 29, 21, "wood3");
        p.faded(0.18, () => each(dx + 2, 9, 21, 30, (x, y) => { const u = x - dx - (y - 9) * 0.6; if ((u > 2 && u < 5) || (u > 7 && u < 8)) p.px(x, y, "white"); }));
      }
      p.faded(0.9, () => p.line(45, 21, 50, 25, "white").line(50, 25, 55, 24, "white").line(50, 25, 51, 28, "white"));
      for (const x of [29, 34]) grid(p, x, 23, 2, ["g5", "gg"], { g: "gold2", "5": "gold5" });
      // The marble top of the base, in front of the hutch.
      p.rect(1, 43, 62, 7, "cream5").hline(1, 43, 62, "stone4").hline(2, 44, 25, "white").vline(1, 44, 6, "white");
      p.over(() => { p.line(6, 48, 14, 46, "stone4"); p.line(14, 46, 22, 47, "stone3"); p.line(40, 45, 52, 48, "stone4"); });
      p.hline(1, 50, 62, "cream4").hline(1, 51, 62, "stone4").hline(1, 52, 62, "stone3");
      // On it: a stack of rice bowls and the tea caddy.
      grid(p, 6, 36, 12, ["..wwwwwwww..", ".w66666666w.", ".w2w2w2w25w.", "..w666665w..", ".w66666666w.", ".w2w2w2w25w.", "..w666665w..", ".w66666666w.", ".w2w2w2w25w.", "..w666665w..", "...555555..."], BW);
      grid(p, 47, 38, 8, ["..3333..", ".w6665..", "w666665.", "w626265.", "w666665.", "w626265.", "w666665.", ".w5555..", "........", "........", "........"], BW);
      // The base: two drawers with brass cup pulls, two panelled doors, the plinth.
      p.rect(1, 53, 62, 27, "wood2").vline(1, 53, 27, "wood3").vline(62, 53, 27, "wood1");
      for (const dx of [3, 33]) {
        p.rect(dx, 54, 28, 7, "wood2").hline(dx, 54, 28, "wood3").vline(dx, 54, 7, "wood3").hline(dx, 60, 28, "wood1").vline(dx + 27, 54, 7, "wood1");
        grid(p, dx + 11, 56, 6, [".gggg.", "g5444g", ".gggg."], { g: "gold2", "5": "gold5", "4": "gold3" });
        p.rect(dx, 62, 28, 16, "wood2").hline(dx, 62, 28, "wood3").vline(dx, 62, 16, "wood3").hline(dx, 77, 28, "wood1").vline(dx + 27, 62, 16, "wood1");
        p.rect(dx + 3, 65, 22, 10, "wood3").hline(dx + 3, 65, 22, "wood1").vline(dx + 3, 65, 10, "wood1").hline(dx + 4, 74, 21, "wood4").vline(dx + 24, 66, 9, "wood4");
        p.over(() => p.hline(dx + 6, 68, 10, "wood4").hline(dx + 8, 71, 12, "wood2"));
      }
      for (const x of [28, 35]) grid(p, x, 68, 2, ["g5", "gg", ".g"], { g: "gold2", "5": "gold5" });
      p.rect(0, 79, 64, 5, "wood1").hline(0, 79, 64, "wood2").hline(2, 80, 60, "wood3");
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
   * jacket hangs by its hood, old Mr Liu's tweed flat cap beside it; the hook that broke was replaced with a
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
      p.outline("wood1");
      // The navy padded jacket, hung by its hood on the right hook: quilted, zipped, sleeves down.
      const j = new Px(20, 28);
      for (const x of [0, 17]) {
        j.rect(x, 8, 3, 15, "blue3").vline(x, 8, 15, x ? "blue3" : "blue4").vline(x + 2, 8, 15, x ? "blue2" : "blue3");
        j.rect(x, 21, 3, 2, "blue2").px(x + 1, 22, "blue1");
        // One fold where the sleeve bends.
        j.px(x, 14, "blue2").px(x + 1, 15, "blue2").px(x + 2, 16, "blue2").px(x + 1, 14, "blue4");
      }
      j.rect(3, 6, 14, 19, "blue3").vline(3, 7, 17, "blue4").vline(16, 7, 18, "blue2").px(3, 6, null).px(16, 6, null);
      for (const y of [11, 15, 19, 23]) j.hline(4, y, 12, "blue2").hline(4, y - 1, 12, "blue4");
      for (const x of [0, 17]) for (const y of [12, 17]) j.hline(x, y, 3, "blue2");
      j.vline(10, 8, 17, "steel4").rect(10, 13, 1, 2, "steel6").px(11, 14, "steel3");
      j.hline(5, 20, 4, "blue1").hline(4, 24, 12, "blue2");
      // The hood, its dark opening, and the drawstrings.
      j.ellipse(10.5, 3.5, 5, 3.5, "blue3");
      j.over(() => j.hline(7, 1, 5, "blue4").hline(6, 2, 2, "blue4"));
      j.ellipse(10.5, 4.5, 3, 1.8, "blue1").hline(9, 3, 3, "blue2");
      j.vline(8, 7, 4, "cream5").vline(13, 7, 3, "cream5").px(8, 11, "cream3").px(13, 10, "cream3");
      j.outline("blue1");
      p.blit(j, 12, 10);
    },
  },

  /**
   * A blue-and-white umbrella pot by the door, a wave scroll and one loose brushed band on it, with two umbrellas:
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
        "w6w666226622666655",
        "w6w222222222222255",
        "w6w222222222222255",
        "w6w662262226226655",
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
