/**
 * The rest of the kitchen: the prep table, the sink, the fridge and what sits on the floor.
 * Anchors are at the front edge of the feet.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { STEEL_DULL, bowlStack, cylinderBand, layer } from "./_helpers.ts";

/** A folded 饺子 lying on its side, pleats along the top edge, 9×5 at (x, y). */
function dumpling(p: Px, x: number, y: number) {
  p.rows(x, y, [
    ".o.o.o.o.",
    "oWsWsWsWo",
    "oWWWWWWco",
    ".occcccc.",
    "..ooooo..",
  ], { o: "cream2", W: "white", s: "cream4", c: "cream4" });
}

export default defineSprites({
  /**
   * The prep table, where dumplings are folded at five every morning: an old oak kneading board,
   * dished in the middle from years of rolling, dusted with flour and swiped with fingers; a ball
   * of dough under a cloth corner; the rolling pin with its handles worn dark; a bowl of pork and
   * scallion filling; a floured tray of finished dumplings in a row, one lopsided (the waiter's).
   */
  "kitchen/prep-table": {
    w: 64, h: 58, anchor: [32, 56], foot: [-30, -26, 60, 24], shadow: { rx: 33, ry: 8, dy: -2 },
    draw: (p) => {
      // Table: a tea-wood top, edge, apron, square legs with a low stretcher.
      p.rect(1, 2, 62, 29, "wood4").hline(2, 1, 60, "wood5").vline(1, 3, 27, "wood5");
      p.over(() => p.vline(62, 3, 28, "wood3"));
      p.hline(1, 31, 62, "wood5").rect(1, 32, 62, 2, "wood3").hline(1, 34, 62, "wood2");
      p.rect(5, 35, 54, 6, "wood2").hline(5, 40, 54, "wood1");
      for (const x of [3, 54]) {
        p.rect(x, 35, 7, 20, "wood3").vline(x, 36, 18, "wood4").rect(x + 5, 35, 2, 20, "wood2");
      }
      p.rect(10, 48, 44, 3, "wood2").hline(10, 48, 44, "wood3");
      // Under the stretcher, a sack of flour slumped on the floor.
      p.rows(18, 45, [
        "..ccccccccc..",
        ".cwWWWWWWWwc.",
        "cwWWwWWWWWWwc",
        "cwWWWWWWbbbbc",
        "cWWWWWWWWWWsc",
      ], { c: "cream2", w: "cream4", W: "cream5", b: "blue4", s: "cream3" });
      p.outline("wood1");

      // The kneading board, pale oak, dished in the middle, dusted with flour.
      p.rect(4, 4, 38, 24, "oak4").hline(5, 3, 36, "oak5").vline(4, 4, 23, "oak5").hline(4, 28, 38, "oak2").vline(42, 4, 25, "oak2");
      p.over(() => p.hline(4, 27, 38, "oak3"));
      p.over(() => {
        for (const [x, y, n] of [[8, 6, 12], [22, 9, 15], [6, 14, 6], [28, 20, 10], [10, 24, 16]] as const) p.hline(x, y, n, "oak3");
        // Flour, thrown and spread, with finger-swipes through it.
        for (const [x, y, n] of [[10, 8, 9], [8, 9, 14], [9, 10, 17], [12, 11, 14], [7, 12, 18], [9, 13, 20], [12, 14, 15], [10, 15, 18], [14, 16, 12], [11, 17, 9], [26, 20, 6], [24, 21, 9], [27, 22, 5]] as const)
          p.hline(x, y, n, "cream4");
        for (const [x, y, n] of [[12, 10, 6], [11, 12, 9], [14, 14, 7], [25, 21, 4]] as const) p.hline(x, y, n, "cream5");
        p.line(18, 9, 22, 16, "oak4").line(20, 9, 24, 16, "oak4");
      });
      // The dough ball, a corner of damp cloth over it.
      p.rows(26, 6, [
        "....oooooo....",
        "..ooWWWWWWoo..",
        ".oWWWWWWWWsso.",
        "oWWWWwwWWWWsso",
        "oWWwWWWWWWssso",
        "obbbbbbsssssso",
        ".obbbbbbBbbso.",
        "..obbbbbBbbo..",
        "...ooooooooo..",
      ], { o: "cream2", W: "cream5", w: "white", s: "cream4", b: "jade5", B: "jade4" });
      // The rolling pin, handles worn dark.
      p.rows(7, 19, [
        "oo...............oo",
        "wdooooooooooooooodw",
        "wdlLLLLLLLLLLLLLldw",
        "oddkkkkkkkkkkkkkddo",
        ".o.ooooooooooooo.o.",
      ], { o: "wood1", w: "wood3", d: "wood2", l: "oak4", L: "oak5", k: "oak3" });
      // A bowl of pork and scallion filling.
      p.rows(45, 3, [
        "...oooooooooo...",
        ".ooWWWWWWWWWWoo.",
        "oWWppGppPpGppWWo",
        "oWpPpppGppPppsWo",
        "oWWpGppPppGpWsso",
        "ocWWWWWWWWWWWsso",
        "ocwbwwbbwwbbwbso",
        ".ocwbbwwbbwwbso.",
        "..ocwwwwwwwwso..",
        "...ooooooooo....",
      ], { o: "blue1", W: "white", w: "cream5", c: "cream4", s: "cream3", b: "blue3", p: "pink2", P: "pink1", G: "leaf3" });
      // A floured tray of dumplings, one lopsided.
      p.rect(44, 15, 18, 13, "steel3").hline(44, 15, 18, "steel5").rect(45, 16, 16, 11, "steel4");
      p.over(() => p.hline(46, 17, 12, "cream4").hline(47, 22, 10, "cream4"));
      dumpling(p, 45, 16);
      dumpling(p, 52, 16);
      dumpling(p, 45, 21);
      p.rows(52, 21, ["..o.o.o..", ".oWsWsWo.", "oWWWWWco.", ".occccc..", "..oooo..."], { o: "cream2", W: "white", s: "cream4", c: "cream4" });
    },
  },

  /**
   * The sink: a steel tub on legs hidden by a gathered curtain the cook sewed from an old blue
   * check tablecloth; a brass tap that drips; a bowl soaking; a dish rack of blue-and-white bowls
   * on the drainboard, one with a chip turned to the back; a sponge and a cake of soap.
   */
  "kitchen/sink": {
    w: 64, h: 72, anchor: [32, 71], foot: [-31, -24, 62, 24], shadow: { rx: 32, ry: 6, dy: -2 },
    frames: 2, fps: 2,
    draw: (p, frame) => {
      // Splash upstand, steel deck with a basin and a ribbed drainboard, rolled front rim.
      p.rect(1, 26, 62, 4, "steel4").hline(1, 26, 62, "steel6").hline(1, 29, 62, "steel2");
      p.rect(1, 30, 62, 16, "steel4").hline(1, 30, 62, "steel5").vline(1, 31, 15, "steel5").vline(62, 31, 15, "steel3");
      p.rect(4, 32, 30, 12, "steel2").hline(4, 32, 30, "steel1").vline(4, 32, 12, "steel1").hline(5, 43, 29, "steel5").vline(33, 33, 11, "steel5");
      // Grey water and a bowl soaking in it.
      p.rect(6, 36, 27, 7, "blue2");
      p.over(() => p.hline(8, 37, 10, "blue3").hline(20, 40, 8, "blue3").hline(10, 41, 5, "steel4"));
      p.rows(16, 34, ["..oooooo..", ".oWbWWbWo.", "oWWWWWWWso", ".ossssso.."], { o: "blue1", W: "white", b: "blue3", s: "cream3" });
      for (let x = 37; x < 61; x += 3) p.vline(x, 32, 12, "steel3").vline(x + 1, 32, 12, "steel5");
      p.hline(1, 46, 62, "steel6").hline(1, 47, 62, "steel4").hline(1, 48, 62, "steel2");
      // The curtain: blue check, gathered on a wire, hem a little ragged.
      p.rect(1, 49, 62, 20, "blue4");
      p.over(() => {
        for (let x = 1; x < 63; x += 4) p.vline(x, 49, 20, "blue5");
        for (let y = 51; y < 69; y += 4) p.hline(1, y, 62, "blue5");
        for (let x = 1; x < 63; x += 4) for (let y = 51; y < 69; y += 4) p.px(x, y, "blue6");
        // Folds: shade in the troughs.
        for (const x of [6, 14, 21, 29, 36, 44, 51, 58]) p.vline(x, 49, 20, "blue3").vline(x + 1, 52, 16, "blue3");
      });
      p.hline(1, 49, 62, "blue2");
      p.rows(1, 69, ["c.cc.c.cc.c.cc..c.c.cc.cc.c.c.cc.c.c.cc.c.cc.c.cc.c.cc.c.c.cc."], { c: "blue3" });
      p.outline("steel1");
      // Tap: a brass gooseneck from the upstand, a drip that falls on frame 1.
      p.rows(16, 7, [
        "..oooo..",
        ".oGggGo.",
        "oGo..oGo",
        "oGo..oGo",
        "oGo...o.",
        "oGo.....",
      ], { o: "gold1", G: "gold3", g: "gold4" });
      for (let y = 13; y < 26; y++) p.rows(16, y, ["oGgo"], { o: "gold1", G: "gold3", g: y % 3 ? "gold4" : "gold5" });
      p.rows(15, 24, ["oGGGgo", "oooooo"], { o: "gold1", G: "gold3", g: "gold4" });
      p.rows(13, 18, ["oo", "ss"], { o: "steel3", s: "steel5" });
            p.rows(22, 12, ["w"], { w: frame ? "blue5" : "blue6" });
      if (frame) p.px(22, 16, "blue5");
      // Sponge and soap on the upstand.
      p.rows(2, 24, ["ggggg", "gGGGg", "lllll"], { g: "gold4", G: "gold5", l: "leaf3" });
      p.rows(26, 25, [".ccc.", "cCCCc"], { c: "cream3", C: "cream5" });
      // Dish rack on the drainboard: a wire frame, bowls on edge, one chipped.
      const rack = layer(p, (q) => {
        for (const [x, chip] of [[37, 0], [43, 1], [49, 0], [55, 0]] as const) {
          q.ellipse(x + 4, 25, 4.5, 7, "blue1");
          q.ellipse(x + 4, 25, 3.5, 6, "white");
          q.ellipse(x + 4.5, 25, 2.5, 4.5, "cream4");
          q.vline(x + 4, 20, 10, "blue3");
          if (chip) q.px(x + 1, 21, "cream3").px(x + 1, 20, null);
        }
        q.hline(36, 32, 26, "steel4").hline(36, 18, 26, "steel5");
        for (const x of [36, 42, 48, 54, 61]) q.vline(x, 18, 15, "steel4");
      });
      rack.outline("steel1");
      p.blit(rack, 0, 0);
    },
  },

  /**
   * The fridge: a rounded mint fridge older than the waiter. The chrome lever cracked and is bound
   * in white tape, a blue check towel lives through it, a basket of eggs sits on top, and the door
   * carries magnets and a child's crayon drawing — a sun, a house, two figures — no words.
   */
  "kitchen/fridge": {
    w: 40, h: 82, anchor: [20, 80], foot: [-18, -14, 36, 14], shadow: { rx: 18, ry: 4, dy: -1 },
    draw: (p) => {
      const f = layer(p, (q) => {
        // Rounded body: the top is a lit strip, the door face runs down to the plinth.
        q.rect(1, 14, 38, 60, "jade5");
        q.ellipse(7, 14, 6, 6, "jade5").ellipse(32, 14, 7, 6, "jade5").rect(7, 8, 25, 7, "jade5");
        q.rect(1, 8, 38, 2, null);
        q.ellipse(20, 12, 19, 5, "jade6");
        q.rect(1, 12, 38, 3, "jade5");
        q.ellipse(20, 11, 19, 4, "jade6");
        q.over(() => {
          // The door face is round-shouldered: lit on the left flank, falling to shade on the right.
          q.vline(1, 13, 60, "jade6").vline(2, 13, 60, "jade6");
          q.vline(36, 13, 60, "jade4").vline(37, 13, 60, "jade3").vline(38, 13, 60, "jade3");
          q.hline(3, 15, 33, "jade6");
          // A broad soft sheen down the left of the door, a shadowed band to the right.
          q.vline(5, 18, 50, "jade6").vline(6, 20, 44, "jade6").vline(33, 18, 50, "jade4").vline(34, 18, 50, "jade4");
          // Chrome trim strip across the door.
          q.hline(2, 57, 35, "steel5").hline(2, 58, 35, "steel3");
          // Grubby finger marks round the handle.
          q.rows(26, 36, ["d.d", ".d.", "d.."], { d: "jade4" });
          // The door gap and the plinth.
          q.hline(2, 16, 36, "jade3").hline(2, 17, 36, "jade6");
          q.rect(1, 70, 38, 4, "steel3").hline(1, 70, 38, "steel5");
          q.dither(4, 71, 32, 2, "steel2", "rows");
          // Paint chipped to the grey primer on the kick corner.
          q.rows(3, 66, [".pp", "ppP", "pP."], { p: "steel4", P: "steel3" });
        });
        // Feet.
        q.rect(3, 74, 4, 4, "steel2").rect(33, 74, 4, 4, "steel2").vline(3, 74, 4, "steel4");
        q.outline("jade1");
      });
      p.blit(f, 0, 0);
      // Basket of eggs on top.
      const b = layer(p, (q) => {
        q.rows(9, 0, [
          "..ewweewwe..",
          ".eWWeWWeWWe.",
          "bbbbbbbbbbbbb",
          "bBbBbBbBbBbBb",
          "BbBbBbBbBbBbB",
          ".bbbbbbbbbbb.",
        ], { e: "cream3", w: "cream5", W: "white", b: "bamboo2", B: "bamboo4" });
        q.outline("bamboo1");
      });
      p.blit(b, 0, 7);
      // Chrome badge, blank.
      p.rows(14, 20, ["sssssssssss", "s66666666Ss", "sSSSSSSSSSs"], { s: "steel3", 6: "steel6", S: "steel4" });
      // The lever handle, bound in tape, and the towel through it.
      p.rows(31, 24, [
        ".oo.",
        "o66o",
        "o6So",
        "oWWo",
        "oWwo",
        "oWWo",
        "oWwo",
        "oWWo",
        "o6So",
        "o6So",
        "o6So",
        ".oo.",
      ], { o: "steel1", 6: "steel6", S: "steel4", W: "white", w: "cream4" });
      p.rows(27, 32, [
        ".bbbbbbbbb..",
        "bwbwbwbwbwb.",
        "bbwbwbwbwbb.",
        ".bwbwbwbwbb.",
        ".bbwbwbwbwb.",
        ".bwbwbwbwbb.",
        ".bbwbwbwbw..",
        ".bwbwbwbwb..",
        "..bbwbwbwb..",
        "..b.bwb.b...",
      ], { b: "blue3", w: "blue5" });
      // The child's drawing, held by a red magnet: a sun, a house, two figures, a wobbly ground.
      p.rows(5, 26, [
        "wwwwwwwwwwwwwwww",
        "wwyywwwwwwwwwwww",
        "wyyyywwwwwrwwwww",
        "wwyywwwwwrrrwwww",
        "wwwwwwwwrrrrrwww",
        "wwwwwwwwbwwwbwww",
        "wwwwwwwwbwbwbwww",
        "wkwwkwwwbwbwbwww",
        "kkkwkkwwbbbbbwww",
        "wkwwkwwwwwwwwwww",
        "kwkwkwwwwwwwwwww",
        "ggggggggggggggww",
        "wwwwwwwwwwwwwwww",
      ], { w: "cream5", y: "gold4", r: "red4", b: "blue3", k: "ink2", g: "leaf3" });
      p.rows(11, 24, [".rr.", "rRRr", ".rr."], { r: "red2", R: "red4" });
      // More magnets: a gold star and a little blue fish.
      p.rows(9, 46, ["..g..", ".ggg.", "ggggg", ".g.g."], { g: "gold4" });
      p.rows(18, 50, [".bbb.b", "bBbbbb", ".bbb.b"], { b: "blue3", B: "white" });
      p.rows(14, 42, [".oo.", "oRRo", ".oo."], { o: "jade3", R: "orange3" });
    },
  },

  /**
   * Flour: one sack opened and rolled down with a tin scoop stuck in it, one still tied, and a
   * powdering of flour on the floor round them. Blank printed bands, no words.
   */
  "kitchen/flour-sacks": {
    w: 36, h: 36, anchor: [18, 34], foot: [-16, -10, 32, 10], shadow: { rx: 17, ry: 4, dy: -1 },
    draw: (p) => {
      p.rows(1, 31, [".wwwWWww....wwwW......wwWw.ww.ww..", "..ww..wwWWw....wwwWWw.....ww......"], { w: "cream4", W: "cream5" });
      const s = layer(p, (q) => {
        // Back sack, tied at the neck.
        q.rows(19, 2, [
          "......ttt.......",
          ".....tTTTt......",
          "......sSs.......",
          ".....sCCCs......",
          "...ssCCCCCss....",
          ".sCCCCCCCCCCCs..",
          "sCCCCCCCCCCCCCs.",
          "sCCcCCCCCCCCCcs.",
          "sCCCCCCCCCCCCcs.",
          "sCbbbbbbbbbbbcs.",
          "sCCCCCCCCCCCCcs.",
          "sCbbbbbbbbbbbcs.",
          "sCCCCCCCCCCCcCs.",
          "sCCcCCCCCCCCccs.",
          "sCCCCCCCCCCcCcs.",
          "sCCCCCCCCCCCccs.",
          "sCCCCCCCCCCcccs.",
          "sCCCCCCCCCCCccs.",
          ".sCCCCCCCCCccs..",
          "..sssssssssss...",
        ], { t: "wood3", T: "wood4", s: "cream2", S: "cream3", C: "cream4", c: "cream3", b: "blue3" });
        // Front sack, opened and rolled down, flour heaped inside with a scoop.
        q.rows(1, 10, [
          "...rrrrrrrrrrrrr...",
          ".rRRRRRRRRRRRRRRRr.",
          "rRwwwwwwwwwwwwwwRRr",
          "rRwWWWWWWWwwssswwRr",
          "rRwWWWWWWwwwsSswwRr",
          ".rRRRRRRRRRRRsRRRr.",
          ".sCCCCCCCCCCCCCCcs.",
          "sCCCCCCCCCCCCCCCccs",
          "sCbbbbbbbbbbbbbbbcs",
          "sCCCCCCCCCCCCCCCccs",
          "sCCCCcCCCCCCCCCcccs",
          "sCCCCCCCCCCCCCCCccs",
          "sCCCCCCCCCCCCCcCccs",
          "sCCcCCCCCCCCCCCcccs",
          "sCCCCCCCCCCCCCCCccs",
          "sCCCCCCCCCCCCCCcccs",
          "sCCCCCCCCCCCCCCcccs",
          "sCCCCCCCCCCCCCCcccs",
          "sCCCCCCCCCCCCCCcccs",
          "sCCCCCCCCCCCCCCCccs",
          ".sCCCCCCCCCCCCCccs.",
          "..sssssssssssssss..",
        ], { r: "cream3", R: "cream4", w: "cream5", W: "white", s: "cream2", C: "cream4", c: "cream3", b: "blue3", S: "steel5" });
        // The scoop's handle standing out of the flour.
        q.rows(13, 4, ["..s", ".s6", "s6.", "6s."], { s: "steel3", 6: "steel5" });
        q.outline("cream1");
      });
      p.blit(s, 0, 0);
    },
  },

  /**
   * This morning's delivery: a wooden crate, its slats stamped with an old grower's mark long since
   * scrubbed blank, holding bunches of scallions and a napa cabbage; one scallion hangs over the side.
   */
  "kitchen/crate-veg": {
    w: 34, h: 32, anchor: [17, 30], foot: [-15, -10, 30, 10], shadow: { rx: 16, ry: 4, dy: -1 },
    draw: (p) => {
      const c = layer(p, (q) => {
        // Back slat and the produce.
        q.rect(2, 10, 30, 3, "oak2").hline(2, 10, 30, "oak3");
        // Scallions: long green stalks, white ends with a fringe of root.
        for (const [x, top, lean] of [[5, 0, 0], [7, 2, 1], [9, 1, 0], [11, 3, -1], [13, 0, 1], [6, 4, 1]] as const) {
          q.line(x, top, x + lean * 2, 14, "leaf3").line(x + 1, top + 1, x + 1 + lean * 2, 14, "leaf2");
          q.px(x, top, "leaf4");
        }
        // Napa cabbage: crinkled pale leaves, white ribs.
        q.rows(15, 3, [
          "....gggggg.....",
          "..ggGGgGGgg....",
          ".gGGgGGGgGGg...",
          "gGGwGGGwGGGgg..",
          "gGwGGGGGwGGGgg.",
          "gGwWGGGGwWGGGg.",
          "gwWWwGGGwWWGGgg",
          "gwWWWwGgwWWWGgg",
          ".wWWWWwgwWWWWg.",
          "..wWWWWwwWWWw..",
        ], { g: "leaf3", G: "leaf4", w: "cream4", W: "cream5" });
        // A scallion hanging over the side.
        q.line(26, 11, 32, 17, "leaf3").line(26, 12, 31, 18, "leaf2").px(32, 18, "cream5").px(33, 19, "cream3");
        // Front of the crate: three slats with gaps, nail heads, corner posts.
        q.rect(1, 13, 32, 16, "oak3");
        for (const y of [13, 19, 25]) q.rect(1, y, 32, 5, "oak4").hline(1, y, 32, "oak5").hline(1, y + 4, 32, "oak2");
        for (const y of [18, 24]) q.hline(1, y, 32, "oak1");
        q.over(() => { for (const [x, y, n] of [[6, 15, 9], [18, 21, 10], [9, 27, 7], [22, 16, 6]] as const) q.hline(x, y, n, "oak3"); });
        q.rect(1, 13, 3, 16, "oak3").vline(1, 13, 16, "oak4").rect(30, 13, 3, 16, "oak2").vline(32, 13, 16, "oak1");
        for (const y of [15, 21, 27]) q.px(2, y, "steel2").px(31, y, "steel1");
        // A scrubbed-out stamp, just a paler square.
        q.over(() => q.rect(13, 20, 8, 3, "oak5"));
        q.outline("oak1");
      });
      p.blit(c, 0, 0);
    },
  },
});
