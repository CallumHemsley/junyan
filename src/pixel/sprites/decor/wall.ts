/**
 * Wall decor for the 52px plaster band of the back wall (y 10–61 of `wall/…`). All are layer
 * `floor`. The anchor is the nail or hook, so place the anchor where the nail goes in the wall.
 * Each piece casts a hairline shadow on its bottom and right edges only. No text anywhere: the
 * boards are blank and their overlay rectangles are given in their doc comments, in sprite pixels.
 */
import { Px, defineSprites, type Color } from "../../kit/index.ts";
import { art, wallEdge } from "./_helpers.ts";

const NAIL = { n: "steel2", N: "steel4" } as const;

/** A ring of wood lit from the upper left: lighter on the top-left arc, darker bottom-right. */
function woodRing(p: Px, cx: number, cy: number, r: number, inner: number) {
  for (let y = Math.floor(cy - r); y < Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x < Math.ceil(cx + r); x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
    if (d > r || d < inner) continue;
    const lit = (-dx - dy) / d;
    const outer = d > r - 1.2;
    p.px(x, y, outer ? (lit > 0.3 ? "wood4" : "wood2") : lit > 0.55 ? "wood6" : lit > 0 ? "wood5" : lit > -0.6 ? "wood4" : "wood3");
  }
}

/** A rectangular moulded frame: lit top and left, shaded bottom and right. */
function frameBox(p: Px, x: number, y: number, w: number, h: number, ramp: readonly [Color, Color, Color, Color], t = 2) {
  const [dark, mid, light, high] = ramp;
  p.rect(x, y, w, h, mid);
  p.rect(x, y, w, 1, high).rect(x, y, 1, h, high);
  p.rect(x + w - 1, y, 1, h, dark).rect(x, y + h - 1, w, 1, dark);
  if (t > 1) p.rect(x + 1, y + 1, w - 2, 1, light).rect(x + 1, y + 1, 1, h - 2, light);
  p.rect(x + t, y + t, w - 2 * t, h - 2 * t, dark);
}

export default defineSprites({
  /**
   * The wall clock above the kitchen door, a wedding present. It has hung slightly crooked since
   * the earthquake of '99 and runs four minutes fast on purpose. It reads five past seven.
   */
  "decor/clock": {
    w: 28, h: 30, anchor: [14, 1], layer: "floor",
    draw: (p) => {
      art(p, 13, 0, ["nN"], NAIL);
      const cx = 14, cy = 16, tilt = (7 * Math.PI) / 180;
      woodRing(p, cx, cy, 13, 10);
      // Face, cream, with the glass's reflection on its upper left.
      p.ellipse(cx, cy, 10, 10, "cream5");
      p.over(() => {
        for (let y = 6; y < 26; y++) for (let x = 4; x < 24; x++) {
          const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
          if (d > 8.6 && d <= 10) p.px(x, y, "cream4");
        }
      });
      // Ticks, rotated with the crooked case: long at the quarters.
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + tilt, major = i % 3 === 0;
        for (let r = major ? 6.6 : 7.6; r <= 8.6; r += 0.5) p.px(Math.floor(cx + Math.sin(a) * r), Math.floor(cy - Math.cos(a) * r), major ? "wood1" : "cream1");
      }
      // Hands: hour toward seven, minute toward one, a brass seconds hand.
      const hand = (turns: number, len: number, c: Color) => {
        const a = turns * Math.PI * 2 + tilt;
        p.line(cx, cy, Math.round(cx + Math.sin(a) * len), Math.round(cy - Math.cos(a) * len), c);
      };
      hand(7.08 / 12, 4.5, "ink");
      hand(5 / 60, 7.5, "ink");
      hand(38 / 60, 7, "gold2");
      art(p, cx - 1, cy - 1, ["kk", "kg"], { k: "ink", g: "gold3" });
      p.faded(0.55, () => art(p, 7, 9, ["..ww", ".w..", "w...", "w..."], { w: "white" }));
      wallEdge(p);
    },
  },

  /**
   * A tear-off day calendar from the rice wholesaler, red header with a gold rule. Nobody has torn
   * it for three days: the stubs of older pages are ragged at the top, the current page's corner
   * has curled, and a page half-torn yesterday hangs crooked behind. DOM overlay rectangle for the
   * date: x 4–19, y 12–25 (16×14). The page's two ruled marks sit below it.
   */
  "decor/calendar": {
    w: 24, h: 34, anchor: [12, 1], layer: "floor",
    draw: (p) => {
      art(p, 11, 0, ["nN"], NAIL);
      // Hanging loop.
      art(p, 9, 1, ["..ss..", ".s..s.", "s....s"], { s: "red2" });
      // Backing card behind the pad, showing at the edges.
      p.rect(1, 4, 22, 29, "cream2");
      // Red header block with a gold rule and a gold roundel (no characters).
      p.rect(1, 4, 22, 7, "red3").hline(1, 4, 22, "red4").hline(1, 10, 22, "red2").vline(22, 4, 7, "red2");
      p.hline(2, 9, 20, "gold3");
      art(p, 10, 5, [".gg.", "gGgg", ".gg."], { g: "gold3", G: "gold5" });
      // Torn stubs of the pages already gone.
      art(p, 2, 11, ["wvwvvwvwvwvwvvwvwvwv", "v.v..v.v..v.v.v..v.v"], { w: "cream4", v: "cream3" });
      // Yesterday's page, half-torn and hanging askew behind.
      p.poly([[3, 12], [22, 13], [21, 31], [2, 30]], "cream3");
      // Today's page (three days ago, in truth).
      p.rect(2, 13, 20, 18, "cream5").vline(2, 13, 18, "white").hline(2, 30, 20, "cream4");
      art(p, 6, 27, ["llllllllllll", "............", "llllllll...."], { l: "cream2" });
      // The thickness of the pad below the page.
      p.hline(2, 31, 20, "cream3").hline(2, 32, 20, "cream2");
      // The curled corner, showing the back of the paper.
      art(p, 17, 26, ["....c", "...cC", "..cCC", ".cCCc", "cCcc."], { c: "cream3", C: "cream4" });
      p.rect(20, 26, 2, 3, null).px(21, 29, null);
      wallEdge(p);
    },
  },

  /**
   * The red paper diamond pasted on the wall at New Year. Instead of a character it carries a gold
   * knotwork flower. Months of sun have faded it to a softer red at the top; the lower corner has
   * come unstuck and curls, and an old strip of tape holds the upper corner.
   */
  "decor/paper-diamond": {
    w: 28, h: 28, anchor: [14, 0], layer: "floor",
    draw: (p) => {
      p.poly([[14, 0], [28, 14], [14, 28], [0, 14]], "red3");
      // Faded upper half, sun-bleached.
      p.over(() => p.poly([[14, 0], [24, 10], [4, 10]], "red4"));
      p.over(() => p.poly([[14, 2], [26, 14], [14, 26], [2, 14]], "red3"));
      p.over(() => p.poly([[14, 2], [22, 10], [6, 10]], "red4"));
      // Gold inner border.
      for (let i = 0; i <= 10; i++) {
        p.px(14 + i, 4 + i, "gold3").px(14 - i, 4 + i, "gold4").px(14 + i, 24 - i, "gold2").px(14 - i, 24 - i, "gold3");
      }
      // Knotwork flower: four looped petals round a round heart.
      art(p, 8, 8, [
        "...gGGg.....",
        "..g....g....",
        "..g.gg.g....",
        ".ggggggggg..",
        "g..g.YY.g..g",
        "g.Gg.YY.g.Gg",
        ".ggggggggg..",
        "..g.gg.g....",
        "..g....g....",
        "...gGGg.....",
      ].map((r) => r.padEnd(12, ".")), { g: "gold3", G: "gold4", Y: "gold5" });
      // Tape on the top corner.
      p.faded(0.7, () => p.rect(11, 0, 6, 3, "cream4"));
      // The unstuck bottom corner, curling to show the paler back.
      p.rect(11, 24, 6, 4, null);
      art(p, 11, 22, ["..rr..", ".rRRr.", "rRccRr", ".cCCc.", "..cc.."], { r: "red2", R: "red3", c: "red5", C: "cream3" });
      wallEdge(p);
    },
  },

  /**
   * A hanging scroll the owner's father painted: misty mountains, a crooked pine, a boat the size of
   * a grain of rice. No calligraphy. A brown water stain has crept up from the bottom roller since
   * the pipe above leaked.
   */
  "decor/scroll-landscape": {
    w: 28, h: 50, anchor: [14, 0], layer: "floor",
    draw: (p) => {
      art(p, 13, 0, ["nN"], NAIL);
      // Cord.
      p.line(13, 1, 6, 4, "wood2").line(14, 1, 21, 4, "wood2");
      // Top rod.
      p.rect(3, 4, 22, 2, "wood3").hline(3, 4, 22, "wood5").px(2, 4, "wood2").px(25, 4, "wood2");
      // Silk mount, a celadon brocade with a faint diamond weave.
      p.rect(3, 6, 22, 38, "jade4");
      p.over(() => {
        for (let y = 6; y < 44; y++) for (let x = 3; x < 25; x++) if ((x + y) % 4 === 0 && (x - y + 40) % 4 === 0) p.px(x, y, "jade5");
        p.vline(24, 6, 38, "jade3");
      });
      // The painting, on cream paper.
      p.rect(6, 9, 16, 32, "cream5");
      // Far mountains in pale ink, nearer ones darker, mist between.
      p.poly([[6, 22], [10, 14], [13, 18], [17, 11], [22, 19], [22, 24], [6, 24]], "stone5");
      p.poly([[6, 28], [8, 23], [11, 26], [15, 20], [19, 25], [22, 23], [22, 30], [6, 30]], "stone4");
      p.over(() => { p.hline(6, 21, 16, "cream5"); p.hline(9, 22, 10, "cream5"); p.hline(6, 27, 9, "cream5"); });
      p.poly([[6, 36], [9, 31], [12, 33], [14, 30], [17, 34], [22, 32], [22, 41], [6, 41]], "stone3");
      art(p, 14, 11, ["s", ".s"], { s: "stone3" });
      // The pine, leaning out from the near rock.
      art(p, 7, 27, [
        "..ddd....",
        ".dDDDdd..",
        "....t.dd.",
        "..ddtdd..",
        ".dDDtDDd.",
        "....t....",
        "...t.....",
        "...t.....",
      ], { d: "leaf1", D: "jade2", t: "wood2" });
      // The tiny boat on the water and its ripple.
      art(p, 16, 35, [".s.", "kkk", ".ll"], { s: "cream3", k: "ink2", l: "stone4" });
      // A red seal, lower left.
      p.rect(7, 38, 2, 2, "red3");
      // Water stain spreading up from the bottom.
      p.over(() => {
        for (const [x, y, n] of [[6, 40, 16], [7, 39, 13], [9, 38, 9], [11, 37, 4]] as const) p.hline(x, y, n, "cream3");
        art(p, 8, 36, ["...bb.....", ".bb..bbb..", "b.......bb"], { b: "oak3" });
      });
      // Bottom roller with knobs.
      p.rect(3, 44, 22, 3, "wood3").hline(3, 44, 22, "wood4").hline(3, 46, 22, "wood2");
      art(p, 0, 43, ["kk", "KKk", "Kkk", "kk"], { k: "wood2", K: "wood4" });
      art(p, 25, 43, ["kk.", "KKk", "Kkk", "kk."], { k: "wood2", K: "wood4" });
      wallEdge(p);
    },
  },

  /**
   * The family photographs: the owners' wedding in a gilt frame, their daughter at four in a white
   * one, and the shop on opening day in sepia. The daughter's frame hangs lower than the others and
   * a little crooked, where she straightened it herself. Shapes only, no faces drawn in detail.
   */
  "decor/photo-frames": {
    w: 50, h: 34, anchor: [25, 0], layer: "floor",
    draw: (p) => {
      // Wedding: gilt frame, two figures before a red backdrop.
      art(p, 8, 0, ["nN"], NAIL);
      frameBox(p, 1, 2, 17, 21, ["gold1", "gold3", "gold4", "gold5"]);
      p.rect(4, 5, 11, 15, "rose2");
      p.rect(4, 15, 11, 5, "rose1");
      art(p, 5, 7, [
        ".hh...hh.",
        ".ss..hss.",
        ".ss...ss.",
        "kkkk.wwww",
        "kkkk.wwWw",
        "kckk.wwww",
        "kkkkwwwww",
        "kkkkwwwww",
        "kk.k.wwww",
        "kk.kwwwww",
      ], { h: "hair1", s: "skin3", k: "ink2", c: "cream5", w: "cream5", W: "pink3" });
      // Opening day: dark wood frame, sepia shopfront with a lantern and two people at the door.
      art(p, 34, 0, ["nN"], NAIL);
      frameBox(p, 21, 2, 27, 18, ["wood1", "wood2", "wood3", "wood4"]);
      p.rect(24, 5, 21, 12, "oak4");
      p.rect(24, 5, 21, 3, "oak5");
      p.rect(26, 9, 17, 8, "oak2").rect(31, 11, 7, 6, "oak1");
      p.rect(27, 8, 15, 2, "oak3");
      art(p, 28, 10, ["o", "O"], { o: "oak3", O: "oak2" });
      art(p, 32, 12, [".h..h.", ".s..s.", "kkk.kk", "kkk.kk", "k.k.kk"], { h: "oak1", s: "oak4", k: "wood2" });
      p.hline(24, 16, 21, "oak3");
      // The daughter at four: white frame, hanging lower and crooked.
      art(p, 23, 19, ["nN"], NAIL);
      const kid = (q: Px) => {
        frameBox(q, 0, 0, 13, 13, ["cream1", "cream4", "cream5", "white"]);
        q.rect(2, 2, 9, 9, "blue4");
        q.rect(2, 8, 9, 3, "leaf3");
        art(q, 3, 3, [".hhh.", "hsssh", ".sss.", ".rrr.", "rrrrr", ".s.s."], { h: "hair1", s: "skin4", r: "red4" });
      };
      const small = new Px(13, 13);
      kid(small);
      // Rotate a few degrees by shearing rows: the frame leans right.
      for (let y = 0; y < 13; y++) for (let x = 0; x < 13; x++) {
        const c = small.get(x, y);
        if (c) p.px(17 + x + Math.floor((12 - y) / 7), 21 + y + Math.floor(x / 7), c);
      }
      wallEdge(p);
    },
  },

  /**
   * The oscillating wall fan, cream plastic gone yellow at the motor. Someone tied a strip of paper
   * to the grille to see that it is running. Three frames at 8 fps: the blur turns, the paper flutters.
   * Anchored at the screw in the middle of its wall bracket.
   */
  "decor/wall-fan": {
    w: 32, h: 34, anchor: [16, 30], layer: "floor", frames: 3, fps: 8,
    draw: (p, frame) => {
      // Wall bracket and the neck, jade-painted metal.
      art(p, 12, 27, [".jJJJjj.", "jJjjjjjk", "jJjjjjjk", "jjjjjjkk", ".kkkkkk."], { J: "jade5", j: "jade3", k: "jade2" });
      p.px(15, 29, "steel5").px(16, 29, "steel2");
      p.rect(15, 22, 2, 5, "jade3").vline(15, 22, 5, "jade4").vline(16, 22, 5, "jade2");
      // Motor housing behind the cage: a jade enamel dome, lit upper left, chipped at the rim.
      const cx = 16, cy = 13, R = 11;
      for (let y = 4; y < 23; y++) for (let x = 7; x < 26; x++) {
        const u = (x + 0.5 - cx) / 8, v = (y + 0.5 - cy - 1) / 7.5, d = u * u + v * v;
        if (d > 1) continue;
        const l = -0.5 * u - 0.5 * v + 0.5 * Math.sqrt(1 - d);
        p.px(x, y, l > 0.62 ? "jade5" : l > 0.3 ? "jade4" : l > 0 ? "jade3" : "jade2");
      }
      // Blur of the blades: three dark sectors that turn, a faint disc between them.
      for (let y = 1; y < 26; y++) for (let x = 4; x < 28; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
        if (d > R - 0.5 || d < 3) continue;
        const a = (((Math.atan2(dy, dx) / (Math.PI * 2) + 1 + frame / 9) % (1 / 3)) * 3);
        if (a < 0.28) p.faded(d > 7.5 ? 0.75 : 0.55, () => p.px(x, y, d > 7.5 ? "steel3" : "steel1"));
        else if (a < 0.45) p.faded(d > 7.5 ? 0.35 : 0.25, () => p.px(x, y, d > 7.5 ? "steel4" : "steel1"));
      }
      // The wire cage: a rim, one inner ring and eight spokes, lit at the upper left.
      for (let y = 0; y < 27; y++) for (let x = 3; x < 29; x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy);
        const lit = -dx - dy > 0;
        if (Math.abs(d - (R + 0.5)) < 0.62) p.px(x, y, lit ? "steel4" : "steel1");
        else if (Math.abs(d - 6.5) < 0.42) p.px(x, y, lit ? "steel3" : "steel2");
      }
      for (let k = 0; k < 8; k++) {
        const t = (k * Math.PI) / 4 + Math.PI / 8;
        p.line(Math.round(cx - 0.5 + Math.cos(t) * 3.5), Math.round(cy - 0.5 + Math.sin(t) * 3.5), Math.round(cx - 0.5 + Math.cos(t) * 11), Math.round(cy - 0.5 + Math.sin(t) * 11), k < 2 || k > 5 ? "steel2" : "steel3");
      }
      // Hub badge: a cream roundel in a steel ring.
      p.ellipse(16, 13, 3, 3, "steel2");
      p.ellipse(16, 13, 2, 2, "cream4");
      p.px(15, 12, "white").px(17, 14, "cream2");
      // The paper strip, fluttering out to the right from the cage.
      const strips = [["ww..", ".wWw", "...w"], ["www.", "..Ww", "...."], [".w..", "w.ww", "...W"]];
      art(p, 26, 10, strips[frame], { w: "cream5", W: "cream3" });
      wallEdge(p);
    },
  },

  /**
   * The business licence in a black frame, hung where an inspector can see it. Ruled lines and an
   * official red seal; the paper has slipped inside the frame and sits a little crooked.
   */
  "decor/certificate": {
    w: 28, h: 24, anchor: [14, 0], layer: "floor",
    draw: (p) => {
      art(p, 13, 0, ["nN"], NAIL);
      p.line(13, 1, 4, 3, "steel3").line(14, 1, 23, 3, "steel3");
      frameBox(p, 0, 3, 28, 20, ["ink", "ink2", "steel2", "steel3"]);
      // Paper, slipped a pixel down at the right.
      p.poly([[3, 6], [25, 6], [25, 21], [3, 20]], "cream4");
      p.hline(3, 6, 22, "cream5");
      // Emblem and ruled lines.
      art(p, 12, 7, [".gg.", "gGGg", ".gg."], { g: "gold2", G: "gold4" });
      for (const [y, x0, x1] of [[11, 6, 22], [13, 6, 22], [15, 6, 19], [17, 6, 14]] as const)
        for (let x = x0; x < x1; x++) p.px(x, y + Math.floor((x - 3) / 16), x % 5 === 4 ? "cream4" : "cream2");
      // The red seal.
      art(p, 18, 15, [".rr.", "rRrr", "rrRr", ".rr."], { r: "red3", R: "red4" });
      // Glass glare.
      p.faded(0.45, () => p.line(4, 19, 10, 7, "white"));
      wallEdge(p);
    },
  },

  /**
   * A little key board by the back door: four brass hooks, the shop keys on a red lucky knot, the
   * padlock key, and a bottle opener on a loop of string.
   */
  "decor/key-hooks": {
    w: 28, h: 18, anchor: [14, 1], layer: "floor",
    draw: (p) => {
      p.rect(1, 1, 26, 6, "wood3").hline(1, 1, 26, "wood5").vline(1, 1, 6, "wood4").hline(1, 6, 26, "wood2");
      p.over(() => { p.hline(4, 3, 8, "wood4"); p.hline(15, 4, 7, "wood2"); });
      for (const x of [4, 10, 16, 22]) art(p, x, 3, ["g.", "g.", "gg", ".G"], { g: "gold3", G: "gold2" });
      p.px(2, 2, "steel4").px(25, 2, "steel4");
      // Shop keys on a red knot.
      art(p, 3, 7, [".r.", "rRr", ".r.", ".s.", "sSs", ".s.", ".s.", ".ss"], { r: "red3", R: "red4", s: "steel3", S: "steel5" });
      art(p, 5, 9, ["s.", "Ss", ".s", ".s", "ss"], { s: "steel2", S: "steel4" });
      // Padlock key.
      art(p, 16, 7, ["gg", "gG", ".g", ".g", ".gg"], { g: "gold2", G: "gold4" });
      // Bottle opener on string.
      art(p, 22, 7, [".c", "c.", ".c", "sss", "sSs", "s.s", ".s."], { c: "cream2", s: "steel3", S: "steel5" });
      wallEdge(p);
    },
  },

  /**
   * The shop's signboard: one plank of tea wood with a carved, gilded border and cloud scrolls at
   * the corners, oiled every New Year. The gilt has rubbed off the lower left corner where the
   * ladder leans. Blank for the DOM name: overlay rectangle x 12–83, y 8–23 (72×16).
   */
  "decor/shop-sign": {
    w: 96, h: 32, anchor: [48, 0], layer: "floor",
    draw: (p) => {
      // The plank and its bevelled edge.
      p.rect(0, 1, 96, 30, "wood3").hline(0, 1, 96, "wood5").vline(0, 1, 30, "wood4").hline(0, 30, 96, "wood1").vline(95, 1, 30, "wood2");
      // Carved gilt border.
      p.frame(4, 4, 88, 24, "gold3").frame(5, 5, 86, 22, "wood1");
      p.hline(4, 4, 88, "gold4").vline(4, 4, 24, "gold4").hline(4, 27, 88, "gold2").vline(91, 4, 24, "gold2");
      // The inner panel: dark lacquered wood, calm for the overlay text, with a soft grain.
      p.rect(6, 6, 84, 20, "wood2");
      p.over(() => {
        for (const [x, y, n] of [[10, 9, 20], [40, 11, 26], [16, 20, 30], [60, 22, 18], [70, 8, 14]] as const) p.hline(x, y, n, "wood1");
        p.hline(6, 6, 84, "wood3");
      });
      // Cloud scrolls at the corners, gilt.
      const cloud = ["..gg..", ".g..g.", "g.gg.g", "g.g..g", ".g.gg.", "..g..."];
      art(p, 7, 7, cloud, { g: "gold4" });
      for (const [x, y] of [[83, 7], [83, 19], [7, 19]] as const)
        art(p, x, y, cloud.map((r) => (x > 40 ? [...r].reverse().join("") : r)), { g: "gold3" });
      // Gilt rubbed back to wood at the lower left.
      p.over(() => {
        p.hline(4, 27, 9, "wood4").vline(4, 22, 6, "wood4");
        art(p, 7, 19, ["......", "......", "w.....", ".w....", "ww....", "......"], { w: "wood3" });
      });
      // Wood grain on the frame.
      p.over(() => { p.hline(20, 2, 30, "wood4"); p.hline(60, 29, 20, "wood2"); p.hline(70, 2, 16, "wood4"); });
      // Two brass hanging rings at the top.
      for (const x of [16, 79]) art(p, x, 0, [".g.", "g.g"], { g: "gold3" });
      wallEdge(p);
    },
  },

  /**
   * The specials chalkboard, hung on a string from a nail. Old menus ghost through as smudges;
   * the owner's daughter has drawn a little chalk cat in the corner. Chalk and a felt eraser sit on
   * the tray. Blank for the DOM menu: overlay rectangle x 6–41, y 8–32 (36×25).
   */
  "decor/chalkboard": {
    w: 48, h: 42, anchor: [24, 0], layer: "floor",
    draw: (p) => {
      art(p, 23, 0, ["nN"], NAIL);
      p.line(23, 1, 6, 5, "bamboo3").line(24, 1, 41, 5, "bamboo3");
      frameBox(p, 1, 4, 46, 33, ["wood1", "wood3", "wood4", "wood5"], 3);
      p.rect(4, 7, 40, 27, "jade1");
      p.over(() => {
        // Ghosts of old menus wiped with a damp cloth.
        for (const [x, y, n] of [[7, 10, 18], [9, 14, 24], [8, 18, 14], [12, 23, 22], [7, 28, 16]] as const) p.hline(x, y, n, "jade2");
        for (const [x, y, n] of [[30, 11, 9], [26, 19, 12], [31, 27, 8]] as const) p.hline(x, y, n, "steel1");
        // The chalk cat, bottom right.
        art(p, 35, 26, ["c...c..", "cc.cc..", "c.c.c..", "ccccc.c", ".ccc..c", ".c.c.c."], { c: "steel4" });
      });
      // Chalk tray, a stub of chalk and the eraser.
      p.rect(3, 37, 42, 2, "wood4").hline(3, 37, 42, "wood5").hline(3, 39, 42, "wood2");
      art(p, 8, 35, ["ccC"], { c: "white", C: "cream3" });
      art(p, 30, 34, ["wwwwww", "kkkkkk", "kkkkkk"], { w: "cream3", k: "wood1" });
      wallEdge(p);
    },
  },
});
