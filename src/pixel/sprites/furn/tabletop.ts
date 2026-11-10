/**
 * Small things that live on the dining tables. Each anchor is where the piece stands on the
 * table top (bottom centre, on its outline row), so place it at a point inside a table's top.
 *
 * Depth: a table-top piece must be drawn after the table it stands on, whatever its anchor y.
 * The scene should sort it with its table; `_scene.ts` in this folder renders compositions that
 * way (see the 0153 ticket notes).
 */
import { defineSprites, Px, type Legend } from "../../kit/index.ts";
import { grid } from "./_helpers.ts";

const S: Legend = { "1": "steel1", "2": "steel2", "3": "steel3", "4": "steel4", "5": "steel5", "6": "steel6" };
const BW: Legend = { w: "white", "6": "blue6", "5": "blue5", "4": "blue4", "3": "blue3", "2": "blue2", "1": "blue1" };

/** The dented steel chopstick tin with its mismatched chopsticks. 12×22. */
function tin(): Px {
  const p = new Px(12, 22);
  // Chopsticks: bamboo, one red lacquer with a gold band, one black, one jade plastic, one leaning.
  grid(p, 1, 0, 10, [
    "..B....k..",
    "..b..r.k..",
    "..b..R.g.B",
    "..bB.r.k.b",
    "..bb.rjk.b",
    "..bbjrjkbb",
    "..bbjrjkb.",
    "..bbjrjkb.",
    "..bbjrjkb.",
  ], { B: "bamboo5", b: "bamboo4", r: "rose3", R: "gold4", k: "ink2", g: "gold3", j: "jade4" });
  // Rim: the back lip, the dark inside, the bright front lip.
  p.hline(2, 9, 8, "steel5").hline(2, 10, 1, "steel1").hline(9, 10, 1, "steel1");
  p.hline(1, 11, 10, "steel6").px(10, 11, "steel4");
  // Body: a highlight stripe, a warm reflection of the table, rolled ridges, the dent.
  grid(p, 1, 12, 10, [
    "3655444332",
    "3444333322",
    "4655444332",
    "4655444332",
    "4654444322",
    "4655444332",
    "3444333322",
    "3555444322",
  ], S);
  p.rows(7, 12, ["23", ".6"], S).px(7, 11, "steel4");
  p.hline(2, 20, 8, "steel2");
  return p.outline("steel1");
}

/** Black vinegar: a glass bottle two-thirds full, a white pourer cap, a dried drip down the shoulder. 9×24. */
function vinegar(capColor: "cream" | "jade" = "cream"): Px {
  const p = new Px(9, 24);
  const cap = capColor === "cream" ? { a: "cream5", b: "cream4", c: "cream3" } : { a: "jade5", b: "jade4", c: "jade3" };
  grid(p, 2, 1, 5, ["...a.", "..aa.", "abbbc", "aabbc", "bcccc"], cap as Legend);
  // Empty glass above the level: translucent.
  p.faded(0.55, () => {
    p.rect(3, 6, 3, 3, "blue6").rect(2, 9, 5, 1, "blue6").rect(1, 10, 7, 3, "blue6");
    p.vline(5, 6, 3, "steel5").vline(7, 10, 3, "steel5");
  });
  p.px(3, 7, "white").px(2, 10, "white").px(2, 11, "white");
  // The vinegar: a lit meniscus, dark body, a gleam, a thick glass base.
  p.hline(1, 13, 7, "rose3");
  grid(p, 1, 14, 7, ["s2111kk", "s2111kk", "w211kkk", "s211kkk", "s211kkk", "s211kkk", "s2111kk", "2111kkk"], { s: "steel4", w: "white", "2": "rose2", "1": "rose1", k: "ink2" });
  p.hline(1, 22, 7, "ink2").px(2, 22, "steel3");
  // The drip, run down from the pourer and dried on the shoulder.
  p.px(6, 6, "rose1").px(6, 7, "rose1").px(6, 8, "rose2").px(7, 10, "rose1").px(7, 11, "rose1").px(7, 12, "rose2");
  return p.outline("ink");
}

/** A squat jar of chili oil: clear red oil over settled flakes and seeds, a steel spoon, a smear on the rim. 12×15. */
function chili(): Px {
  const p = new Px(12, 15);
  grid(p, 1, 0, 10, [
    "........5.",
    ".......54.",
    "......54..",
    "......4...",
    ".6666644..",
    "6oOoo4o666",
    "wwwwwww6w6",
  ], { ...S, "6": "blue6", w: "white", o: "red4", O: "orange2" });
  grid(p, 1, 7, 10, [
    "w54455544r",
    "w44544454r",
    "w33233323r",
    "3323g3g332",
    "3g3233232g",
    "2222122221",
    "6666666666",
  ], { w: "white", "5": "orange2", "4": "red4", "3": "red3", "2": "red2", "1": "red1", g: "gold4", r: "red3", "6": "blue5" });
  p.px(8, 7, "red3").px(8, 8, "red3").px(9, 8, "white");
  return p.outline("red1");
}

/** The pink plastic napkin box: a tissue pulled up through the slot, the back corner dented in. 16×14. */
function napkins(): Px {
  const p = new Px(16, 14);
  grid(p, 1, 0, 14, [
    ".....ww.......",
    "....wWWw......",
    "...wwfWww.....",
    "...wfwwfwf....",
    "5555wffwf55554",
    "5553311133dd44",
    "5555555555dd44",
    "33333333333332",
    "3w33333333w332",
    "33333333333322",
    "33333333333322",
    "22222222222222",
  ], { w: "white", W: "cream5", f: "cream4", "5": "pink3", "4": "pink2", "3": "pink2", "2": "pink1", "1": "pink1", d: "pink1" });
  return p.outline("plum1");
}

export default defineSprites({
  /** The chopstick tin, dented when it fell off table 3, holding whatever chopsticks came back from the wash. */
  "furn/chopstick-tin": { w: 12, h: 22, anchor: [6, 21], shadow: { rx: 5, ry: 2 }, draw: (p) => { p.blit(tin(), 0, 0); } },

  /** Black vinegar from Zhenjiang, refilled from the big jug in the kitchen, so the shoulder is never quite clean. */
  "furn/vinegar-bottle": { w: 9, h: 24, anchor: [4, 23], shadow: { rx: 4, ry: 1 }, draw: (p) => { p.blit(vinegar(), 0, 0); } },

  /** The owner's wife's own chili oil, made on Sundays: one of the room's few reds. */
  "furn/chili-jar": { w: 12, h: 15, anchor: [6, 14], shadow: { rx: 5, ry: 2 }, draw: (p) => { p.blit(chili(), 0, 0); } },

  /** The pink plastic napkin box from the wholesale market, a tissue always pulled up ready; somebody sat a bag on it and dented the back corner. Blank, no print. */
  "furn/napkin-box": { w: 16, h: 14, anchor: [8, 13], shadow: { rx: 7, ry: 2 }, draw: (p) => { p.blit(napkins(), 0, 0); } },

  /**
   * The blue-and-white teapot with a band of cloud scrolls, its spout chipped to the pale body
   * years ago. It still pours fine.
   */
  "furn/teapot": {
    w: 16, h: 14, anchor: [8, 13], shadow: { rx: 6, ry: 2 },
    draw: (p) => {
      // Spout, handle, body, lid and knob.
      grid(p, 0, 3, 4, ["c...", "w6..", "w6..", ".w6.", ".66.", "..65"], { ...BW, c: "cream2" });
      grid(p, 12, 5, 4, [".55.", "5..5", "...5", "...5", "..55", ".5.."], BW);
      p.ellipse(8, 9, 5.5, 4.5, "blue6");
      p.ellipse(8, 4.5, 3.5, 1.5, "blue6").px(7, 1, "blue3").px(8, 1, "blue3").hline(7, 2, 2, "blue4");
      p.over(() => {
        p.hline(5, 5, 6, "blue3").hline(5, 4, 5, "white").px(6, 3, "white");
        p.hline(4, 6, 3, "white").hline(3, 7, 2, "white").px(3, 8, "white");
        for (let y = 6; y < 14; y++) p.px(12, y, "blue5").px(13, y, "blue5");
        // A band of cloud scrolls round the belly.
        grid(p, 3, 9, 11, ["2.22.2.22.2", "22.222.22.2", ".2..2.2..2."], { "2": "blue2" });
        p.hline(4, 12, 9, "blue4").hline(5, 13, 7, "blue3");
      });
      p.outline("blue1");
    },
  },

  /** A teacup with oolong in it, the blue band slightly smudged where it was fired. */
  "furn/teacup": {
    w: 8, h: 9, anchor: [4, 8], shadow: { rx: 3, ry: 1 },
    draw: (p) => {
      grid(p, 0, 1, 8, ["..wwww..", ".wtTttw.", ".wwwwww.", ".2w22w2.", ".w66655.", "..6655..", "..2222.."], { ...BW, t: "bamboo2", T: "bamboo4" });
      p.outline("blue1");
    },
  },

  /** An empty teacup with a chip out of the rim and a tea line inside where it stood half full. */
  "furn/teacup-empty": {
    w: 8, h: 9, anchor: [4, 8], shadow: { rx: 3, ry: 1 },
    draw: (p) => {
      grid(p, 0, 1, 8, ["..ww.c..", ".w55tcw.", ".wwwwww.", ".2w22w2.", ".w66655.", "..6655..", "..2222.."], { ...BW, t: "tan3", c: "cream2" });
      p.outline("blue1");
    },
  },

  /** A bamboo-section cup of toothpicks; one has been dropped beside it. */
  "furn/toothpick-pot": {
    w: 12, h: 13, anchor: [5, 12], shadow: { rx: 4, ry: 1 },
    draw: (p) => {
      grid(p, 0, 0, 12, [
        "..t.t.......",
        "..t.t.t.....",
        ".t.ttt.t....",
        "..tttttt....",
        ".54444443...",
        ".44444443...",
        ".54444443...",
        ".11111111...",
        ".54444432...",
        ".53444432...",
        ".54444332...",
        ".33333322ttt",
      ], { t: "cream5", "5": "bamboo5", "4": "bamboo4", "3": "bamboo3", "2": "bamboo2", "1": "bamboo2" });
      p.outline("bamboo1");
    },
  },

  /**
   * A little tea-wood menu stand holding a blank card, the card's corner soft from being picked up
   * and a soy thumbprint on it. Overlay area for DOM text: x 3–10, y 3–11 (8×9).
   */
  "furn/menu-stand": {
    w: 14, h: 18, anchor: [7, 17], shadow: { rx: 6, ry: 2 },
    draw: (p) => {
      p.rect(2, 1, 10, 13, "cream5").hline(2, 1, 10, "white").vline(11, 1, 13, "cream3").hline(2, 13, 10, "cream4");
      p.hline(3, 2, 8, "jade5").hline(3, 12, 8, "jade5");
      p.px(11, 1, null).px(10, 1, "cream4").px(11, 2, "cream3");
      p.rows(9, 9, [".t", "tt"], { t: "cream3" });
      grid(p, 0, 13, 14, [".55444444443..", "53333222333332", "33322222222222", ".222222222222."], { "5": "wood5", "4": "wood4", "3": "wood3", "2": "wood2" });
      p.outline("wood1");
    },
  },

  /** Table 1's setting: tin, vinegar and chili jar on the small bamboo tray the owner carved a notch into. */
  "furn/condiment-set-1": {
    w: 30, h: 30, anchor: [15, 29], shadow: { rx: 13, ry: 3, dy: -1 },
    draw: (p) => {
      grid(p, 0, 20, 30, [
        "..bbbbbbbbbbbbbbbbbbbbbbbbbb..",
        ".b55555555555555555555555554b.",
        ".b44444444444444444444444443b.",
        ".b44444444444444444444444443b.",
        ".b44444444444444444444444443b.",
        ".5555555555555555555555555553.",
        ".3333333333333333333333333322.",
        ".2222222222222222222222222222.",
        "..............................",
      ], { b: "bamboo3", "5": "bamboo5", "4": "bamboo4", "3": "bamboo3", "2": "bamboo2" });
      p.rows(14, 25, ["2.2", ".2."], { "2": "bamboo2" });
      p.blit(tin(), 2, 0).blit(vinegar(), 13, 0).blit(chili(), 17, 10);
      p.outline("bamboo1");
    },
  },

  /** Table 2's setting: the napkin box, the chili jar and the toothpick pot, no tray, as the owner's wife likes it. */
  "furn/condiment-set-2": {
    w: 32, h: 24, anchor: [16, 23], shadow: { rx: 14, ry: 3, dy: -1 },
    draw: (p) => {
      p.blit(napkins(), 0, 5);
      const pick = new Px(12, 13);
      grid(pick, 0, 0, 12, [
        "..t.t.......", "..t.t.t.....", ".t.ttt.t....", "..tttttt....", ".54444443...", ".44444443...",
        ".54444443...", ".11111111...", ".54444432...", ".53444432...", ".54444332...", ".33333322ttt",
      ], { t: "cream5", "5": "bamboo5", "4": "bamboo4", "3": "bamboo3", "2": "bamboo2", "1": "bamboo2" });
      pick.outline("bamboo1");
      p.blit(chili(), 13, 9).blit(pick, 20, 11);
    },
  },

  /** Table 3's setting: a chrome wire caddy, chipped where it meets the formica, with vinegar, soy and chili. */
  "furn/condiment-set-3": {
    w: 30, h: 30, anchor: [15, 29], shadow: { rx: 13, ry: 3, dy: -1 },
    draw: (p) => {
      // The handle loop and the back wire, behind the bottles.
      grid(p, 10, 0, 10, ["..555555..", ".5......4.", "5........4", "5........4", "5........3", "4........3"], S);
      p.vline(10, 6, 20, "steel4").vline(19, 6, 20, "steel3").hline(1, 17, 28, "steel3");
      p.blit(vinegar(), 2, 4).blit(vinegar("jade"), 9, 4).blit(chili(), 17, 13);
      // The front wires and stays, in front of everything, and the base.
      p.hline(1, 21, 28, "steel5").hline(1, 22, 28, "steel2");
      for (const x of [1, 10, 19, 28]) p.vline(x, 17, 10, "steel4");
      p.rect(1, 26, 28, 2, "steel4").hline(1, 26, 28, "steel6").hline(1, 27, 28, "steel2");
      p.px(25, 27, "orange1").px(26, 27, "gold1");
      p.outline("steel1");
    },
  },
});
