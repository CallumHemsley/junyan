/**
 * Wall fittings on the kitchen side of the back wall (layer `floor`, drawn on the wall). Each gets
 * the wall-mounted hairline: a dark edge on its bottom and right only. Anchor is the bottom-centre
 * of the art; place it on the wall at the height you want (the wall's plaster runs y = 10..61).
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { bowlStack, layer } from "./_helpers.ts";

/** The wall-mounted hairline shadow: the darkest of the local ramp on bottom and right. */
function hairline(p: Px, c: "wood1" | "steel1" | "ink2") {
  p.outline(c, { sides: ["bottom", "right"] });
}

/** A tea-wood wall shelf board 64 wide at row y with two carved brackets. */
function shelfBoard(p: Px, y: number) {
  p.rect(1, y, 62, 2, "wood5").hline(1, y, 62, "wood6").rect(1, y + 2, 62, 2, "wood3").hline(1, y + 3, 62, "wood2");
  p.over(() => p.hline(8, y + 1, 12, "wood4").hline(34, y + 1, 9, "wood4").hline(50, y + 2, 6, "wood4"));
  for (const bx of [7, 52]) p.rows(bx, y + 4, ["wwwwww", ".WWWWd", "..WWd.", "...Wd.", "....d."], { w: "wood3", W: "wood4", d: "wood2" });
}

export default defineSprites({
  /**
   * The range hood: brushed steel, a dent from a ladder, grease gathered on the lip, and a blank
   * square of faded red paper the cook's mother pasted up for luck, its corner lifting.
   */
  "kitchen/hood": {
    w: 64, h: 32, anchor: [32, 31], layer: "floor",
    draw: (p) => {
      // Duct and canopy, flaring from the ceiling.
      p.rect(24, 0, 16, 7, "steel4").vline(24, 0, 7, "steel5").vline(38, 0, 7, "steel3").vline(39, 0, 7, "steel2");
      p.hline(24, 3, 16, "steel3").hline(24, 4, 16, "steel5");
      p.poly([[23, 7], [41, 7], [62, 24], [2, 24]], "steel4");
      p.over(() => {
        // The sloped face is lit along its upper-left, dimmer to the right.
        p.poly([[23, 7], [30, 7], [12, 24], [2, 24]], "steel5");
        p.poly([[24, 7], [27, 7], [8, 22], [5, 22]], "steel6");
        p.poly([[38, 7], [41, 7], [62, 24], [54, 24]], "steel3");
        // Brushed streaks and the warm room reflected low in the steel.
        for (const [x, y, n] of [[20, 12, 14], [30, 15, 12], [14, 18, 9], [36, 20, 13], [24, 21, 6]] as const) p.hline(x, y, n, "steel5");
        p.hline(10, 22, 40, "cream2").hline(16, 23, 26, "oak3");
        // A dent from a ladder.
        p.rows(42, 12, [".33.", "3226", ".66."], { 3: "steel3", 2: "steel2", 6: "steel6" });
      });
      // Front lip and grease filter.
      p.rect(1, 24, 62, 6, "steel3").hline(1, 24, 62, "steel6").hline(1, 25, 62, "steel4");
      p.rect(4, 26, 56, 3, "steel2");
      p.dither(4, 26, 56, 3, "steel3", "checker");
      p.hline(1, 29, 62, "steel2");
      // Old grease run along the lip.
      p.rows(18, 29, ["gggg..g", ".g...gg", ".g....g"], { g: "gold1" }).rows(44, 29, ["gg", ".g"], { g: "oak3" });
      // The red paper square, faded to rose, a corner peeling.
      p.rows(13, 10, [
        "rrrrrrr.",
        "rRRRRRrw",
        "rRRRRRrw",
        "rRRRRRr.",
        "rRRRRRr.",
        "rrrrrrr.",
      ], { r: "rose3", R: "rose4", w: "cream4" });
      hairline(p, "steel1");
    },
  },

  /**
   * The crockery shelf: rice bowls stacked crooked with the chipped one second from the top, plates
   * leaning on edge, the floral thermos everyone in the family has dropped once, and a teapot with
   * a mended lid knob.
   */
  "kitchen/shelf-bowls": {
    w: 64, h: 28, anchor: [32, 27], layer: "floor",
    draw: (p) => {
      shelfBoard(p, 18);
      // Two plates on edge, leaning against the wall, the back one peeping out.
      for (const [cx, cy, back] of [[9.5, 11, 1], [7, 12, 0]] as const) {
        p.ellipse(cx, cy, 6.5, 6.5, "blue1");
        p.ellipse(cx, cy, 5.5, 5.5, back ? "cream4" : "white");
        p.ellipse(cx, cy, 4.5, 4.5, "blue3");
        p.ellipse(cx, cy, 3.5, 3.5, back ? "cream4" : "white");
        if (!back) p.rows(Math.floor(cx) - 2, Math.floor(cy) - 1, [".b.b", "bbbb", ".b.b"], { b: "blue3" }).px(Math.floor(cx) - 3, Math.floor(cy) - 4, "white");
      }
      p.px(3, 9, "cream5").px(4, 8, "cream5");
      // Bowls, the chipped one second from the top.
      bowlStack(p, 15, 2, 4, 1);
      // A squat teapot whose knob was glued back on, the seam showing.
      p.rows(31, 6, [
        ".......oo......",
        "......oWWo.....",
        ".....oooooo....",
        "....oWWWWWWo.oo",
        "oo.oWWWWWWWsoso",
        "oWooWbbWbbWsoso",
        ".oWWWWbbbWWsso.",
        "..ooWWWWWWWsoo.",
        "....oWWWWWso...",
        "....osssssso...",
        ".....oooooo....",
      ], { o: "blue1", W: "white", b: "blue3", s: "cream3" });
      p.px(38, 7, "cream2").px(39, 7, "cream2");
      // Floral thermos: pink enamel, a dented shoulder, a cork-coloured cup for a lid.
      p.rows(48, 0, [
        "..oooooo..",
        ".oGGGGggo.",
        ".oggggggo.",
        "..oddddo..",
        ".oPPpppPo.",
        "oPPwPpppPo",
        "oPwYwpppPo",
        "oPPwPpPppo",
        "oPPpppwPpo",
        "oPPppwYwpo",
        "oPwPppwPpo",
        "oPwYwpppPo",
        "oPPwPpppPo",
        "oPPpppppPo",
        "oPPppppppo",
        "oPPPPPPPPo",
        ".oooooooo.",
      ], { o: "pink1", G: "oak4", g: "oak3", d: "steel2", P: "pink3", p: "pink2", w: "white", Y: "gold4" });
      p.px(55, 5, "pink2").px(56, 5, "pink1");
      // A squat teapot whose knob was glued back on, the seam showing.
      p.rows(37, 10, [
        "....oo....",
        "...oWWo...",
        "..oooooo..",
        "ooWWWWWWo.",
        "oWWbWWbWWoo",
        ".oWWWWWWso.",
        "..osssso...",
      ], { o: "blue1", W: "white", b: "blue3", s: "cream3" });
      p.px(41, 10, "cream2");
      hairline(p, "wood1");
    },
  },

  /**
   * The dry-goods shelf: every jar a different jar. Pickled mustard greens in a glass jar, dried
   * chilies, star anise in a clay crock with a cloth tied over, rock sugar in a bottle, two tea tins
   * (one jade, one with the gilt worn off), and the corner of the radio that plays opera all morning.
   */
  "kitchen/shelf-jars": {
    w: 64, h: 28, anchor: [32, 27], layer: "floor",
    draw: (p) => {
      shelfBoard(p, 18);
      // Pickles: a glass jar, green leaves pressed against the glass, a tin lid.
      p.rows(1, 3, [
        ".ssssssss.",
        "sSSSSSSSSs",
        ".gggggggg.",
        "gWllLlllbg",
        "gWlLllLlbg",
        "glLlllLLbg",
        "gWlllLllbg",
        "gWLlllllbg",
        "glllLlllbg",
        "gWlLlllLbg",
        "gllllLllbg",
        "gWlllllLbg",
        "gllLlllllg",
        "gbbbbbbbbg",
        ".gggggggg.",
      ], { s: "steel3", S: "steel5", g: "jade3", W: "jade6", l: "leaf3", L: "leaf2", b: "jade4" });
      // Dried chilies in a tall jar — the one bright red thing on the wall.
      p.rows(12, 5, [
        ".wwwwww.",
        "wWWWWWWw",
        ".gggggg.",
        "gWrRrrbg",
        "grrRrRbg",
        "gWRrrrbg",
        "grrrRrbg",
        "gWrRrRbg",
        "grRrrrbg",
        "gbbbbbbg",
        ".gggggg.",
        "........",
        "........",
      ], { w: "wood3", W: "wood5", g: "steel3", r: "red3", R: "red2", b: "blue6" });
      // Star anise in a brown crock, cloth tied over the mouth with string.
      p.rows(21, 7, [
        "..cccccc..",
        ".cCCCCCCc.",
        "..ssssss..",
        ".bBBBBBbb.",
        "bBrBBBBBbb",
        "bBBBBBBBbb",
        "bBBBBrBBbb",
        "bBBBBBBBbb",
        ".bBBBBBbb.",
        "..bbbbbb..",
      ], { c: "cream3", C: "cream5", s: "cream2", b: "wood2", B: "wood3", r: "wood4" });
      // Rock sugar: a bottle of white crystals.
      p.rows(32, 2, [
        "...oo...",
        "...WW...",
        "..oWWo..",
        ".oWwWWo.",
        "oWwWWwWo",
        "oWWwWWWo",
        "owWWwWwo",
        "oWwWWWWo",
        "oWWwWwWo",
        "owWWWwWo",
        "oWwWwWWo",
        "oWWWWWWo",
        "oWwWWwWo",
        "oWWWWWWo",
        "oooooooo",
        "........",
      ], { o: "steel3", W: "white", w: "blue6" });
      // Tea tins: a jade one with a cream band, a gold one worn to the tin at the edges.
      p.rows(41, 6, [
        "jjjjjjj",
        "JJJJJJj",
        "jjjjjjj",
        "jJJJJJj",
        "ccccccc",
        "cWWWWWc",
        "ccccccc",
        "jJJJJJj",
        "jJJJJJj",
        "jJJJJJj",
        "jjjjjjj",
      ], { j: "jade2", J: "jade4", c: "cream3", W: "cream5" });
      p.rows(49, 8, [
        "sgggggs",
        "gGGGGGg",
        "ggggggs",
        "gGGGGgs",
        "gGgGGgs",
        "gGGGGgs",
        "gGGgGgs",
        "gGGGGgs",
        "sggggss",
      ], { g: "gold2", G: "gold3", s: "steel4" });
      // The radio's corner, its speaker cloth and a knob.
      p.rows(57, 4, [
        "ooooooo",
        "rRRRRRR",
        "rCcCcCc",
        "rcCcCcC",
        "rCcCcCc",
        "rcCcCcC",
        "rCcCcCc",
        "rRRRRRR",
        "rRgGRRR",
        "rRggRRR",
        "rRRRRRR",
        "rrrrrrr",
        "ooooooo",
        "ooooooo",
      ], { o: "wood1", r: "wood2", R: "wood3", c: "cream3", C: "cream4", g: "gold2", G: "gold4" });
      hairline(p, "wood1");
    },
  },

  /**
   * The utensil rail: a steel bar on two brackets, S-hooks holding a ladle, the cleaver (hung by the
   * hole in its blade, edge bright from the stone), a bamboo-handled spider strainer, a whisk with a
   * bent wire, and the wok spatula, its handle wound with string.
   */
  "kitchen/utensil-rail": {
    w: 48, h: 24, anchor: [24, 23], layer: "floor",
    draw: (p) => {
      const r = layer(p, (q) => {
        q.hline(1, 1, 46, "steel5").hline(1, 2, 46, "steel3");
        q.rows(2, 0, ["ss", "s.", "s."], { s: "steel2" }).rows(44, 0, ["ss", ".s", ".s"], { s: "steel2" });
        // Ladle.
        q.rows(4, 2, ["s", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], { s: "steel2", S: "steel4" });
        q.rows(1, 14, [".ssss.", "sSSSSs", "sS66Ss", ".ssss."], { s: "steel3", S: "steel4", 6: "steel6" });
        // Cleaver.
        q.rows(10, 2, [
          "...s....",
          "..sss...",
          "sSSSSSSs",
          "s6SoS6Ss",
          "s6SSSSSs",
          "s6SSSSSs",
          "s6SSSSSs",
          "s6SSSSSs",
          "s6SSSSSs",
          "s66666ss",
          "..wWWw..",
          "..wWWw..",
          "..wwWw..",
          "..wWWw..",
          "..wWww..",
          "...ww...",
        ], { s: "steel2", S: "steel4", 6: "steel6", o: "ink2", w: "wood2", W: "wood4" });
        // Spider strainer: bamboo handle, a woven wire basket.
        q.rows(20, 2, ["s", "b", "B", "b", "B", "b", "B", "b", "B"], { s: "steel2", b: "bamboo3", B: "bamboo4" });
        q.ellipse(20.5, 15, 5, 4, "steel2");
        q.dither(16, 11, 10, 8, "steel4", "checker");
        q.ellipse(20.5, 15, 5, 4, null);
        q.ellipse(20.5, 15, 5, 4, "steel2");
        q.ellipse(20.5, 15, 4, 3, "steel3");
        q.over(() => q.dither(16, 11, 10, 8, "steel5", "checker"));
        // Whisk, one wire bent out of line.
        q.rows(26, 2, [
          "..s..",
          "..w..",
          "..W..",
          "..w..",
          "..W..",
          ".sSs.",
          ".sSs.",
          "s.S.s",
          "s.S.s.s",
          "s.S.s.s",
          "s.S.ss.",
          ".sSs...",
          "..s....",
        ], { s: "steel4", S: "steel5", w: "wood3", W: "wood4" });
        // Wok spatula, handle wound with string.
        q.rows(36, 2, [
          ".s.",
          ".c.",
          ".C.",
          ".c.",
          ".C.",
          ".w.",
          ".W.",
          ".s.",
          ".s.",
          ".s.",
          "sSSs",
          "s66Ss",
          "s6SSs",
          "s6SSs",
          ".ssss",
        ], { s: "steel2", S: "steel4", 6: "steel6", c: "cream3", C: "cream5", w: "wood3", W: "wood4" });
        q.hline(1, 1, 46, "steel5").hline(1, 2, 46, "steel3");
      });
      p.blit(r, 0, 0);
      hairline(p, "steel1");
    },
  },

  /**
   * Menu plaque A: a dark-stained camphor board with a bevelled border, hung by a cord from one
   * nail and hanging a degree crooked. Blank: the DOM overlay goes in x 6..33, y 9..20 (28×12).
   */
  "kitchen/menu-plaque-a": {
    w: 40, h: 24, anchor: [20, 23], layer: "floor",
    draw: (p) => {
      // Cord from the nail to two eyelets.
      p.px(20, 0, "steel2").px(20, 1, "steel4");
      p.line(19, 2, 6, 6, "cream2").line(21, 2, 33, 6, "cream2");
      p.rect(1, 6, 38, 17, "wood2");
      p.hline(1, 6, 38, "wood4").vline(1, 7, 15, "wood3").hline(1, 22, 38, "wood1").vline(38, 7, 15, "wood1");
      p.rect(4, 8, 32, 13, "wood3");
      p.hline(4, 8, 32, "wood1").vline(4, 9, 12, "wood1").hline(5, 20, 31, "wood4").vline(35, 9, 11, "wood4");
      p.rect(6, 9, 28, 11, "wood3");
      p.over(() => p.hline(8, 11, 12, "wood4").hline(18, 15, 14, "wood2").hline(7, 18, 9, "wood4"));
      for (const x of [6, 33]) p.px(x, 6, "gold4").px(x, 7, "gold2");
      hairline(p, "wood1");
    },
  },
  /**
   * Menu plaque B: a paler cedar board with rounded corners on two brass screws, one corner chipped
   * where a broom handle caught it. Blank: the DOM overlay goes in x 6..33, y 6..17 (28×12).
   */
  "kitchen/menu-plaque-b": {
    w: 40, h: 24, anchor: [20, 23], layer: "floor",
    draw: (p) => {
      p.rect(2, 2, 36, 19, "oak3");
      p.rect(1, 3, 38, 17, "oak3");
      p.hline(2, 2, 36, "oak5").vline(1, 3, 17, "oak4").hline(2, 20, 36, "oak1").vline(38, 3, 17, "oak2");
      p.rect(4, 5, 32, 14, "oak4");
      p.over(() => {
        for (const [x, y, n] of [[6, 7, 14], [20, 10, 12], [5, 13, 9], [16, 16, 15], [27, 6, 7]] as const) p.hline(x, y, n, y % 2 ? "oak3" : "oak5");
      });
      for (const x of [5, 34]) p.rows(x, 3, ["gG", "Gd"], { g: "gold5", G: "gold3", d: "gold1" });
      // The chipped corner, bare pale wood.
      p.rows(34, 18, ["..wo", ".wwo", "woo."], { w: "oak5", o: "oak1" });
      p.px(38, 19, null).px(37, 20, null);
      hairline(p, "wood1");
    },
  },
});
