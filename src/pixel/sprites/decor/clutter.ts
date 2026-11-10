/**
 * Small appliances and clutter: the things the owners accumulated. Floor and table-top objects
 * are depth-sorted (layer `object`) and anchor at the middle of where they touch their surface;
 * the rug is floor art anchored at its bottom-centre.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { art, autoOutline, cylinder } from "./_helpers.ts";

// ── thermoses ────────────────────────────────────────────────────────────────

/** A flower, five petals round a heart, painted on enamel. `P`/`p` petal light/shade, `c` heart. */
const PEONY = [".pPp.", "pPcPp", ".pPp."];
const PEONY_SMALL = ["pP", "Pp"];
const LEAFLET = ["g.", ".g"];

/** The tall body of a Chinese vacuum flask: enamel shell, painted bands, a wire handle. */
function flaskBody(p: Px, shell: readonly Color[], band: readonly Color[]) {
  // Shoulder cap and neck ring.
  art(p, 2, 3, [
    "..sSSSSsq..",
    ".sSSSSSSsqq",
  ], { s: "steel4", S: "steel5", q: "steel3" });
  cylinder(p, 1, 5, 12, 2, band);
  cylinder(p, 1, 7, 12, 15, shell);
  cylinder(p, 1, 22, 12, 2, band);
  // Base ring, a little narrower, and the foot.
  cylinder(p, 2, 24, 10, 2, ["steel1", "steel2", "steel3", "steel4", "steel5"]);
  p.hline(3, 26, 8, "steel2");
  // Wire handle on the right, standing proud of the shell.
  art(p, 12, 8, [".s", "s.", "s.", "s.", "s.", "s.", "s.", "s.", ".s"], { s: "steel3" });
  p.px(12, 8, "steel2").px(12, 16, "steel2");
}

// ── lucky cat ────────────────────────────────────────────────────────────────

const PORCELAIN = {
  o: "ink2", W: "white", w: "cream5", c: "cream4", C: "cream3", G: "gold4", g: "gold3", Y: "gold2",
  k: "ink", s: "white", n: "pink2", P: "pink3", r: "red3", R: "red4", h: "steel3", m: "red2",
} as const;

// ── rug ──────────────────────────────────────────────────────────────────────

/** One repeat of the runner's woven lattice: indigo diamonds on cream, rose at the crossings. */
function rugField(x: number, y: number): Color {
  const u = ((x % 12) + 12) % 12, v = ((y % 8) + 8) % 8;
  const dx = Math.abs(u - 6) / 6, dy = Math.abs(v - 4) / 4, d = dx + dy;
  if (d < 0.2) return "rose3";
  if (d > 0.82 && d < 1.05) return "blue2";
  if (d > 0.45 && d < 0.6) return "blue3";
  return (x + y) % 2 ? "cream4" : "cream3";
}

export default defineSprites({
  /**
   * The cream thermos with pink peonies, filled with hot water at six every morning. The cork is
   * swollen and dark from years of steam, the enamel has a dent near the base and has chipped to
   * bare steel where it is set down on the counter.
   */
  "decor/thermos-a": {
    w: 15, h: 28, anchor: [7, 27], foot: [-6, -3, 12, 3], shadow: { rx: 6, ry: 2, dy: -1 },
    draw: (p) => {
      art(p, 4, 0, [".cCc.", "cCCcd", ".ccd."], { C: "oak4", c: "oak3", d: "oak2" });
      flaskBody(p, ["cream1", "cream2", "cream4", "cream5", "white"], ["jade1", "jade2", "jade3", "jade4", "jade5"]);
      p.over(() => {
        const ink = { P: "pink3", p: "pink2", c: "gold4", g: "leaf3" } as const;
        const shade = { P: "pink2", p: "pink1", c: "gold3", g: "leaf2" } as const;
        art(p, 2, 9, PEONY, ink);
        art(p, 4, 12, LEAFLET, ink);
        art(p, 6, 14, PEONY, ink);
        art(p, 3, 17, PEONY_SMALL, ink);
        art(p, 9, 11, PEONY_SMALL, shade);
        art(p, 10, 17, PEONY, shade);
        art(p, 8, 19, LEAFLET, shade);
        art(p, 1, 13, ["g", "g"], ink);
        // The dent catches a sliver of light on its lower lip.
        art(p, 8, 19, ["cc.", "c.W", ".WW"], { c: "cream2", W: "white" });
        // Chips at the base showing steel.
        art(p, 3, 22, ["ss.", ".s."], { s: "steel3" });
        art(p, 10, 23, ["s"], { s: "steel2" });
      });
      autoOutline(p, { map: { cream: "ink2" } });
    },
  },

  /**
   * The blue thermos with white plum blossom, the older of the pair. Its cork lives on a string
   * tied round the neck, and it is always left open, breathing a thread of steam.
   */
  "decor/thermos-b": {
    w: 16, h: 32, anchor: [7, 31], foot: [-6, -3, 12, 3], shadow: { rx: 6, ry: 2, dy: -1 },
    draw: (p) => {
      p.clip(0, 4, 16, 28, (q) => {
        flaskBody(q, ["blue1", "blue2", "blue3", "blue4", "blue5"], ["steel2", "steel3", "steel4", "steel5", "steel6"]);
        // The open mouth.
        art(q, 5, 2, ["kkk"], { k: "ink" });
        q.over(() => {
          const ink = { P: "white", p: "cream4", c: "pink2", g: "blue1" } as const;
          const shade = { P: "cream4", p: "cream2", c: "pink1", g: "blue1" } as const;
          // A plum branch running up the shell.
          art(q, 2, 9, ["g...", ".g..", ".gg.", "..g.", "..gg", "...g", "..g.", ".g..", "..g.", "...g", "...g"], ink);
          art(q, 1, 8, PEONY, ink);
          art(q, 4, 12, PEONY, ink);
          art(q, 6, 16, PEONY_SMALL, ink);
          art(q, 3, 17, PEONY, ink);
          art(q, 8, 10, PEONY, shade);
          art(q, 9, 15, PEONY_SMALL, shade);
          art(q, 8, 19, PEONY, shade);
          // Worn pale where hands grip it.
          art(q, 2, 20, ["bb", "b."], { b: "blue4" });
        });
        autoOutline(q, { map: { blue: "blue1" } });
        // The cork, swinging on its string against the shell.
        art(q, 11, 4, ["n.", ".n", ".n", ".n", "n.", "n.", ".cC", "cCc", "cCd", ".d."], { n: "cream2", c: "oak3", C: "oak4", d: "oak2" });
      });
      // A thread of steam.
      p.faded(0.5, () => art(p, 5, 0, [".w..", "w...", ".w..", "..w.", ".w..", "w..."], { w: "white" }));
    },
  },

  /**
   * The lucky cat by the till, a gift from the supplier. Its paw has beckoned since the opening;
   * the gold on its left ear has been worn back to white by years of the owner's thumb. It holds
   * a blank gold coin. Four frames at 3 fps: the raised paw beckons down and back up.
   */
  "decor/lucky-cat": {
    w: 22, h: 28, anchor: [10, 27], foot: [-8, -3, 16, 3], shadow: { rx: 8, ry: 2, dy: -1 },
    frames: 4, fps: 3,
    draw: (p, frame) => {
      art(p, 1, 2, [
        "..o..........o....",
        ".oGo........oWo...",
        ".oGgo......oWgWo..",
        "oWGgWoooooooWWWWo.",
        "oWWWWWWWWWWWWWWWo.",
        "oWWWWWWWWWWWWWWco.",
        "oWWWkWWWWWWkWWWco.",
        "oWWkWkWWWWkWkWWco.",
        "hhPWWWWnnWWWWPhho.",
        "oWWWWWWmmWWWWWWco.",
        "hhWWWWWWWWWWWWhho.",
        ".ooWWWWWWWWWWcoo..",
        "..orRRRRYRRrrro...",
        "..oWWWWWGWWWWco...",
        ".oWWWWWWYWWWWcco..",
        ".oWWWWWWWWWWWcco..",
        "oWWoooooWWWWWccco.",
        "oWoGGGGGoWWWWccco.",
        "oWoGYYgGoWWWWccco.",
        "oWoGYggGoWWWWccco.",
        "oWWoWWWoWWWWcccco.",
        "oWwWwWwWWWWWccCCo.",
        ".owwwWWWWWWccCCo..",
        "..orrrrrrrrrrrmo..",
        "..oRRRRrrrrrrrmo..",
        "...oooooooooooo...",
      ], PORCELAIN);
      // A painted plum blossom on the belly, half rubbed away.
      art(p, 11, 21, [".P.", "PnP", ".P."], PORCELAIN);
      // The beckoning paw, raised on its right side: up, folding, folded, folding.
      const paws = [
        [".ooo..", "oWWWo.", "oWPWco", "oWWWco", ".oWcco", ".oWco.", ".oWco.", ".oWco.", "oWWco.", "oWcco."],
        ["......", ".ooo..", "oWWWo.", "oWWWco", "ocWcco", ".oWco.", ".oWco.", ".oWco.", "oWWco.", "oWcco."],
        ["......", "......", ".ooo..", "oWWWo.", "occcco", ".oooo.", ".oWco.", ".oWco.", "oWWco.", "oWcco."],
        ["......", ".ooo..", "oWWWo.", "oWWWco", "ocWcco", ".oWco.", ".oWco.", ".oWco.", "oWWco.", "oWcco."],
      ];
      art(p, 15, 4, paws[frame], PORCELAIN);
    },
  },

  /**
   * The radio, older than the shop, tuned to the morning opera. The aerial was bent in a move
   * and never straightened; a strip of tape holds the cracked corner of the case.
   */
  "decor/radio": {
    w: 30, h: 30, anchor: [14, 29], foot: [-13, -6, 26, 6], shadow: { rx: 13, ry: 3, dy: -1 },
    draw: (p) => {
      // Bent telescopic aerial.
      art(p, 20, 0, [
        "s.....",
        ".s....",
        "..s...",
        "..s...",
        "...s..",
        "...s..",
        "...Ss.",
        "....S.",
        "....S.",
        "....S.",
        "...xX.",
      ], { s: "steel4", S: "steel5", x: "steel2", X: "steel3" });
      // Top face, foreshortened, then the front.
      art(p, 1, 10, [
        ".bbbbbbbbbbbbbbbbbbbbbbbbbb.",
        "bBBBBBBBBBBBBBBBBBBBBBBBBbbb",
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      ], { b: "wood3", B: "wood5" });
      p.rect(1, 13, 28, 14, "wood3").vline(1, 13, 14, "wood4").vline(28, 13, 14, "wood2").hline(1, 26, 28, "wood2");
      p.over(() => {
        for (const [x, y, n] of [[4, 14, 6], [17, 15, 8], [6, 25, 9]] as const) p.hline(x, y, n, "wood4");
      });
      // Cloth speaker grille, woven.
      p.rect(3, 14, 13, 11, "bamboo2");
      for (let y = 14; y < 25; y++) for (let x = 3; x < 16; x++) if ((x + y) % 2 === 0) p.px(x, y, y < 18 ? "bamboo4" : "bamboo3");
      p.frame(3, 14, 13, 11, "wood2").hline(3, 14, 13, "wood1");
      // Brass trim bars over the grille.
      for (const y of [17, 21]) p.hline(4, y, 11, "gold3").px(4, y, "gold4").px(14, y, "gold2");
      // Dial window: a lit cream strip with ruled ticks and a red needle; two knobs below.
      p.rect(18, 15, 9, 5, "cream4").hline(18, 15, 9, "cream5").frame(17, 14, 11, 7, "gold2");
      for (let x = 19; x < 26; x += 2) p.px(x, 17, "wood2").px(x, 18, "cream2");
      p.vline(23, 16, 3, "red3");
      for (const kx of [18, 24]) art(p, kx, 21, [".kk.", "kKKk", "kkkk", ".kk."], { k: "wood1", K: "steel3" });
      p.px(19, 22, "steel5").px(25, 22, "steel5");
      // Little feet.
      p.rect(3, 27, 3, 1, "wood1").rect(24, 27, 3, 1, "wood1");
      autoOutline(p);
      // Tape over the cracked corner, and the crack it hides.
      art(p, 24, 10, ["..tT", ".tTT", "tTTt", "tTt.", ".t.."], { t: "cream3", T: "cream4" });
      p.line(27, 15, 28, 18, "wood1");
    },
  },

  /**
   * An aluminium kettle with a black bakelite handle. The bottom is sooted from the gas ring, the
   * side has a dent, and the whistle cap hangs open on the spout.
   */
  "decor/kettle": {
    w: 24, h: 22, anchor: [11, 21], foot: [-9, -4, 18, 4], shadow: { rx: 9, ry: 3, dy: -1 },
    draw: (p) => {
      const ALU: Color[] = ["steel1", "steel2", "steel3", "steel4", "steel5", "steel6"];
      // Body: a squat dome.
      for (let y = 7; y < 21; y++) for (let x = 2; x < 20; x++) {
        const u = (x + 0.5 - 11) / 9, v = (y + 0.5 - 16) / 9;
        if (u * u + v * v > 1 || y > 20) continue;
        const l = -0.55 * u - 0.5 * v + 0.4;
        p.px(x, y, ALU[Math.max(0, Math.min(5, Math.floor(l * 3.2 + 2.6)))]);
      }
      // Reflections of the room: a window square and the warm floor.
      art(p, 5, 10, ["ww.", "w..", "..."], { w: "white" });
      p.hline(4, 18, 14, "oak3").hline(6, 19, 10, "oak2");
      // Soot creeping up from the base.
      p.over(() => {
        p.hline(3, 20, 16, "steel1");
        for (const [x, n] of [[4, 2], [9, 3], [14, 2]] as const) p.hline(x, 19, n, "steel1");
      });
      // Dent.
      art(p, 14, 12, [".2.", "2.4", ".44"], { 2: "steel2", 4: "steel5" });
      // Lid and knob.
      art(p, 6, 5, ["..kkkk..", ".sSSSSs.", "sSSSSSss"], { k: "ink2", s: "steel3", S: "steel5" });
      // Spout with its whistle cap flipped up.
      art(p, 18, 9, ["...sc", "..ss.", ".ss..", "ss..."], { s: "steel3", c: "steel4" });
      art(p, 21, 6, ["kk", "k."], { k: "ink2" });
      // Bakelite handle arcing over the lid.
      art(p, 3, 0, [
        "...kkkkkkkk...",
        "..kKKKKKKKkk..",
        ".kk.......kk..",
        ".k.........k..",
        ".k.........k..",
      ], { k: "ink", K: "ink2" });
      autoOutline(p);
    },
  },

  /**
   * A sorghum broom and a tin dustpan leaning on the wall by the back door. The broom has worn
   * down at a slant from years of the same right-handed sweep, and its binding has been redone
   * with red string.
   */
  "decor/broom": {
    w: 26, h: 50, anchor: [12, 49], foot: [-10, -4, 20, 4], shadow: { rx: 11, ry: 3, dy: -1 },
    draw: (p) => {
      // Broom handle: bamboo, leaning a little left against the wall.
      for (let y = 0; y < 30; y++) {
        const x = 12 - Math.round((30 - y) * 0.12);
        p.px(x, y, "bamboo4").px(x + 1, y, "bamboo2");
        if (y % 9 === 4) p.px(x, y, "bamboo3").px(x + 1, y, "bamboo1");
      }
      // The bristle head: a fan of sorghum straw, cut at a slant.
      for (let y = 28; y < 48; y++) {
        const half = Math.min(8, 1 + Math.floor((y - 28) * 0.6));
        for (let dx = -half; dx <= half; dx++) {
          const x = 13 + dx;
          const cut = 47 - Math.round((dx + 8) * 0.25);
          if (y > cut) continue;
          const c: Color = dx < -half + 2 ? "bamboo5" : (dx + y) % 3 === 0 ? "bamboo2" : dx > half - 2 ? "bamboo2" : (dx * 7 + y) % 5 === 0 ? "bamboo5" : "bamboo4";
          p.px(x, y, c);
        }
      }
      // Bindings: red string over old wire.
      for (const y of [31, 35]) p.hline(10, y, 7, "red3").px(10, y, "red4").px(16, y, "red2");
      p.hline(9, 39, 9, "steel3");
      // The dustpan, tilted against the broom: a flared tin scoop, a little dust still in it.
      art(p, 0, 34, [
        ".........hh..",
        "........hHh..",
        ".......hHh...",
        "......hHh....",
        "...sssssss...",
        "..sSSSSSSSs..",
        "..s3333333s..",
        ".s333.3333ss.",
        ".s33333d33ss.",
        "s3333.33333ss",
        "S5555555555Ss",
        "sssssssssssss",
      ], { s: "steel2", S: "steel5", 3: "steel4", 5: "steel5", h: "jade3", H: "jade4", d: "stone2" });
      p.px(5, 41, "stone3").px(6, 43, "stone2").px(9, 41, "stone3");
      autoOutline(p);
    },
  },

  /**
   * The mop in its bucket. The bucket is blue plastic with a crack mended with tape; the handle
   * snapped years ago and was replaced with a loop of rope. The string mop is grey and sodden,
   * slumped over the rim with strands hanging down the side and dripping into a ring of water.
   */
  "decor/mop-bucket": {
    w: 30, h: 52, anchor: [14, 49], foot: [-12, -6, 24, 6], shadow: { rx: 12, ry: 3, dy: -1 },
    draw: (p) => {
      // Wooden handle leaning back against the wall, a string loop at the top for the hook.
      for (let y = 1; y < 33; y++) {
        const x = 21 - Math.round(y * 0.3);
        p.px(x, y, "wood4").px(x + 1, y, "wood3");
        if (y % 11 === 5) p.px(x, y, "wood5");
      }
      art(p, 20, 0, [".cc.", "c..c", "cc.."], { c: "cream2" });
      // Bucket: rim, dark water, tapering body.
      art(p, 3, 34, [
        "..bbbbbbbbbbbbbbbbbb..",
        ".bBBBBBBBBBBBBBBBBBBbb",
        "bBwwwWwwwwwwwwwwwwwBbb",
        "bbbbbbbbbbbbbbbbbbbbbb",
      ], { b: "blue3", B: "blue4", w: "blue1", W: "blue4" });
      cylinder(p, 3, 38, 22, 10, ["blue1", "blue2", "blue3", "blue4", "blue5"], (r) => (r >= 6 ? Math.floor((r - 5) / 2) : 0));
      p.over(() => {
        for (const y of [41, 45]) p.hline(3, y, 22, "blue2");
        // The crack, taped over.
        art(p, 18, 39, [".TTt", "TTTt", "TtTt", ".Tt."], { T: "cream4", t: "cream3" });
        p.px(17, 43, "blue1").px(17, 44, "blue1");
      });
      // Rope handle, the replacement, slack against the front.
      art(p, 2, 36, ["r....................r", ".r..................r.", "..rr..............rr..", "....rrrrrrrrrrrrrr...."], { r: "bamboo3" });
      autoOutline(p);
      // The sodden mop head: a heap of grey string in the bucket, slumped over the front rim,
      // strands hanging down the side, darker where wet, a drip forming at the longest.
      art(p, 3, 27, [
        ".......dgGGgd......",
        ".....dgGG5GGgGd....",
        "...dgGG5GGgGGgGgd..",
        "..dgGgGGgGGgGgGgGd.",
        ".dgGgGgGgGgGgGgGgd.",
        "dgGgGgdgGgGgdGgGgd.",
        "dgGd.gGdgGd.gGdgd..",
        "dgd.dgdgdgd.dGd.d..",
        "dg..dgd.dgd..gd....",
        "dg...gd..gd..gd....",
        ".g...gd..g...g.....",
        ".d...gd..d...d.....",
        ".d....d......d.....",
        "......d............",
        "......b............",
      ], { g: "stone3", G: "stone4", 5: "stone5", d: "stone2", b: "blue4" });
      p.faded(0.7, () => p.px(9, 44, "blue5"));
      // The ring of water it always leaves, showing round the base.
      p.under(() => {
        p.faded(0.45, () => p.ellipse(13, 49.5, 13, 2.5, "blue3"));
        p.faded(0.6, () => { p.hline(1, 49, 4, "blue5"); p.hline(21, 51, 4, "blue4"); });
      });
    },
  },

  /**
   * A wooden crate of soy sauce from the wholesaler, one bottle short. The labels are blank
   * paper (any brand is DOM text), one has come unstuck, and the crate's slat is split.
   */
  "decor/crate-bottles": {
    w: 32, h: 34, anchor: [16, 33], foot: [-15, -12, 30, 12], shadow: { rx: 15, ry: 4, dy: -2 },
    draw: (p) => {
      // Bottles in two rows: back row higher, front row partly hidden by the crate's front.
      // A soy bottle: dark glass with a highlight down its left, a gold cap, a blank paper label.
      const bottle = (x: number, y: number, label: boolean, unstuck = false) => {
        art(p, x, y, [
          ".gG.",
          ".gg.",
          ".hk.",
          ".hk.",
          "hHkk",
          "hHkk",
          "hHkk",
          "hHkk",
          "hHkk",
          "hHkk",
          "hHkk",
          "hHkk",
          "hHkk",
          "hHkk",
          "hkkk",
        ], { g: "gold2", G: "gold4", h: "rose2", H: "red4", k: "rose1" });
        if (label) art(p, x, y + 7, unstuck ? ["wCc.", "rrc.", "wCcc", "wC.."] : ["wCCc", "rrrr", "wCCc", "wCCc"], { w: "cream5", C: "cream4", c: "cream3", r: "red3" });
      };
      for (const x of [5, 10, 15, 20]) bottle(x, 0, true);
      for (const [x, i] of [[3, 0], [8, 1], [13, 2], [23, 3]] as const) bottle(x, 4, true, i === 1);
      // The empty slot shows the divider inside.
      p.rect(18, 15, 4, 3, "oak1");
      // The crate: top rails, then two front slats with the gap between.
      art(p, 1, 15, [
        "aAAAAAAAAAAAAAAAAAAAAAAAAAAAa",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaab",
      ], { A: "oak5", a: "oak3", b: "oak2" });
      for (const [y, h] of [[17, 7], [25, 7]] as const) {
        p.rect(1, y, 29, h, "oak4").hline(1, y, 29, "oak5").hline(1, y + h - 1, 29, "oak2");
        p.over(() => {
          for (const [gx, gy, n] of [[4, y + 2, 7], [15, y + 3, 9], [8, y + 4, 5], [22, y + 2, 5]] as const) p.hline(gx, gy, n, "oak3");
        });
      }
      // The gap between the slats shows the bottles inside, in shadow.
      p.rect(4, 24, 23, 1, "wood1");
      for (const x of [6, 11, 16, 24]) p.px(x, 24, "rose2");
      // A hand-hold cut through the top slat.
      art(p, 12, 19, [".kkkkk.", "kkkkkkk", ".KKKKK."], { k: "wood1", K: "oak2" });
      // Corner posts with nail heads.
      for (const x of [1, 27]) {
        p.rect(x, 17, 3, 15, "oak3").vline(x, 17, 15, "oak4");
        p.px(x + 1, 19, "steel2").px(x + 1, 29, "steel2");
      }
      // The split in the lower slat.
      p.line(10, 27, 18, 29, "oak1").line(11, 27, 19, 29, "oak5");
      autoOutline(p, { map: { rose: "rose1", oak: "wood1" } });
    },
  },

  /**
   * Cardboard boxes of paper bowls and napkins, stacked by the kitchen door. The bottom one has
   * been kicked in at a corner and stood in a puddle; the top one was dumped on it twisted, with a
   * flap open, the box cutter and a ball of string left on it, and a strip of tape torn and hanging.
   */
  "decor/boxes": {
    w: 36, h: 44, anchor: [16, 43], foot: [-15, -12, 30, 12], shadow: { rx: 16, ry: 4, dy: -2 },
    draw: (p) => {
      // ── the bottom box, square on ──
      const bx = 1, by = 20, bw = 30, top = 7, front = 16;
      p.rect(bx, by, bw, top, "oak4").hline(bx, by, bw, "oak5").vline(bx, by, top, "oak5");
      p.vline(bx + 15, by, top, "oak3");
      p.rect(bx, by + top, bw, front, "oak3");
      // The fold where the top flaps bend over: a lit lip and the shadow under it.
      p.hline(bx, by + top, bw, "oak4").hline(bx, by + top + 1, bw, "oak2").hline(bx + 1, by + top + 2, bw - 2, "oak2");
      p.vline(bx + bw - 1, by + top, front, "oak2");
      // Corrugation showing at the cut edges.
      for (let y = by + top + 1; y < by + top + front; y++) { p.px(bx, y, y % 2 ? "oak4" : "oak2"); p.px(bx + bw - 1, y, y % 2 ? "oak3" : "oak1"); }
      for (let x = bx + 1; x < bx + bw - 1; x++) p.px(x, by, x % 2 ? "oak5" : "oak4");
      // Fibre grain on the front.
      p.over(() => { for (const [x, y, n] of [[4, 31, 9], [17, 33, 10], [7, 36, 12], [20, 38, 6]] as const) p.hline(x, y, n, "oak4"); });
      // "This way up" arrows (pictograms), the hand-hold slot.
      art(p, 4, 30, [".d...d.", "ddd.ddd", ".d...d.", ".d...d."], { d: "oak2" });
      art(p, 22, 31, [".kkkk.", "kkkkkk", ".KKKK."], { k: "oak1", K: "oak2" });
      // Packing tape over the top seam, torn off the front: a strip hangs loose and curls.
      p.rect(bx + 14, by, 3, top, "bamboo4").vline(bx + 14, by, top, "bamboo5");
      art(p, bx + 14, by + top, ["ttT", "tT.", "tT.", ".tT", ".tT", "..t", ".tT", "tT.", "t.."], { t: "bamboo4", T: "bamboo3" });
      p.over(() => p.vline(bx + 17, by + top + 1, 8, "oak2"));
      // The corner that stood in water: wrinkled, darker, its edge warped.
      p.over(() => {
        art(p, 1, 34, ["dd.....", ".ddd.d.", "DD..dd.", "..DDD.d", "dd..DD.", "DDDDDDD", "......."], { d: "oak2", D: "oak1" });
        p.hline(8, 42, 22, "oak2");
      });
      p.px(1, 42, null).px(2, 42, null);
      // The kicked-in corner on the right.
      art(p, 26, 22, ["....d", "...dD", "..dcd", ".dcdc"], { d: "oak2", D: "oak1", c: "oak4" });

      // ── the top box, dumped twisted on the stack ──
      const A: [number, number] = [6, 7], B: [number, number] = [25, 3], C: [number, number] = [28, 9], D: [number, number] = [9, 13];
      const drop = 11;
      const D2: [number, number] = [D[0], D[1] + drop], C2: [number, number] = [C[0], C[1] + drop], A2: [number, number] = [A[0], A[1] + drop];
      // Its shadow falls on the bottom box's top.
      p.poly([[10, 22], [30, 18], [31, 22], [12, 27]], "oak3");
      // Left side face in shadow, the front face, the lit top.
      p.poly([A, D, D2, A2], "oak2");
      p.poly([D, C, C2, D2], "oak3");
      p.poly([A, B, C, D], "oak4");
      // Edges: the lit lip of the top, the dark corner where front meets side.
      p.line(A[0], A[1], B[0], B[1], "oak5").line(A[0], A[1], D[0], D[1], "oak5").line(D[0], D[1], C[0], C[1], "oak5");
      p.line(D[0], D[1] + 1, C[0], C[1] + 1, "oak2");
      p.line(D[0], D[1] + 1, D2[0], D2[1], "oak1");
      // The seam of its flaps and the tape over it, skewed with the box.
      p.line(10, 10, 27, 6, "oak3");
      p.line(14, 5, 17, 12, "bamboo4").line(15, 5, 18, 12, "bamboo5").line(16, 5, 19, 12, "bamboo4");
      // Grain on its front.
      p.over(() => { p.line(12, 18, 22, 16, "oak4"); p.line(14, 21, 25, 19, "oak4"); });
      // Where it sits on the box below, a dark contact edge; its far edge in shade.
      p.line(A2[0], A2[1], D2[0], D2[1], "wood1").line(D2[0], D2[1], C2[0], C2[1], "wood1").line(C[0], C[1] + 1, C2[0], C2[1], "oak1");
      p.line(D2[0] + 1, D2[1] - 1, C2[0] - 1, C2[1] - 1, "oak2");
      // The box cutter left on top.
      art(p, 20, 4, ["....s", "...sY", "..yY.", ".yYy.", "yYy..", "yy..."], { y: "gold3", Y: "gold5", s: "steel5" });
      autoOutline(p, { map: { oak: "wood1", bamboo: "wood1", gold: "wood1" } });
    },
  },

  /**
   * The owner's old cloth shoes, black cotton uppers on layered white soles, left by the door to be
   * slipped on for the yard. He walks on the backs, so both heels are trodden flat; the left toe is
   * fraying. Floor art.
   */
  "decor/slippers": {
    w: 22, h: 14, layer: "floor",
    draw: (p) => {
      // One shoe from above: the trodden-flat heel showing its lining, the dark opening, the black
      // cotton vamp with its centre seam, and the white layered sole round the toe.
      const shoe = (x: number, y: number, flip: boolean, fray: boolean) => {
        const rows = [
          "..sssss..",
          ".sLLLLLs.",
          ".sliiils.",
          "sKiiiiiKs",
          "sKkiiiKKs",
          "sKkkhKKKs",
          "sKkKhKKKs",
          "sKkKhKKKs",
          ".sKkhKKs.",
          ".SKKhKKS.",
          ".sSSSSSs.",
          "..sSSSs..",
        ];
        art(p, x, y, flip ? rows.map((r) => [...r].reverse().join("")) : rows, { s: "cream2", S: "cream4", L: "cream3", l: "cream2", K: "hair2", k: "hair3", i: "ink", h: "hair1" });
        if (fray) art(p, x + 3, y + 9, ["c.c"], { c: "cream3" });
      };
      shoe(1, 0, false, true);
      // The right one, kicked off a little forward and askew.
      shoe(11, 2, true, false);
      autoOutline(p, { map: { cream: "ink2", hair: "ink" } });
    },
  },

  /**
   * A navy umbrella left furled in the corner after the morning shower, leaning on its bamboo
   * crook, dripping into a little puddle. Four frames at 3 fps: a drop gathers at the tip, falls
   * and rings the puddle.
   */
  "decor/umbrella-wet": {
    w: 18, h: 46, anchor: [9, 43], foot: [-4, -2, 8, 2], frames: 4, fps: 3,
    draw: (p, frame) => {
      // Bamboo crook handle at the top, leaning right against the wall.
      art(p, 8, 1, [
        "..bbbb..",
        ".bB..bb.",
        ".b....b.",
        "......b.",
        "......bB",
        "......b.",
      ], { b: "bamboo2", B: "bamboo4" });
      // Shaft.
      p.vline(14, 7, 10, "steel3");
      // Furled canopy: folds of wet nylon, a strap and snap round the middle.
      art(p, 8, 17, [
        ".....fF.",
        "....fFFf",
        "....fFHf",
        "...fFHFf",
        "...fFHff",
        "..fFHFff",
        "..fFHFff",
        "..fFHFf.",
        ".fFHFff.",
        ".fFHFff.",
        ".fFHFff.",
        ".tTTTtt.",
        ".tTgTtt.",
        "fFHFff..",
        "fFHFff..",
        "fFHFff..",
        "fFHFf...",
        "fFHFf...",
        ".fHFf...",
        ".fFf....",
        ".fFf....",
        "..ff....",
        "..ff....",
        "..ss....",
        "..S.....",
      ], { f: "blue1", F: "blue2", H: "blue3", t: "blue1", T: "blue2", g: "steel5", s: "steel3", S: "steel5" });
      // Beads of water on the fabric.
      for (const [x, y] of [[12, 21], [11, 27], [10, 33], [12, 35]] as const) p.px(x, y, "blue5");
      autoOutline(p, { map: { blue: "blue1", bamboo: "wood1", steel: "steel1" } });
      // The drip.
      // The puddle, translucent, with a pale sheen, round the tip.
      p.under(() => {
        p.faded(0.45, () => p.ellipse(9, 43.5, 8, 2.5, "blue3"));
        p.faded(0.7, () => p.hline(3, 43, 4, "blue5"));
      });
      const tipX = 8, tipY = 37;
      if (frame === 0) p.faded(0.8, () => p.px(tipX, tipY, "blue5"));
      if (frame === 1) p.faded(0.8, () => art(p, tipX, tipY, ["w", "w"], { w: "blue5" }));
      if (frame === 2) p.faded(0.8, () => p.px(tipX - 1, tipY + 4, "blue5"));
      if (frame === 3) p.faded(0.7, () => art(p, tipX - 4, 43, ["w...w", ".www."], { w: "blue5" }));
    },
  },

  /**
   * The runner inside the door: a woven indigo-and-cream rug that has been there longer than the
   * menu. The middle is worn pale by feet, the fringe is matted, one corner curls up, and there is
   * a tea stain nobody could shift. Floor art, 96×32.
   */
  "decor/rug-runner": {
    w: 96, h: 32, layer: "floor",
    draw: (p) => {
      const L = 5, R = 90;
      for (let y = 2; y < 30; y++) for (let x = L; x <= R; x++) {
        const border = y < 5 || y > 26 || x < L + 4 || x > R - 4;
        const stripe = y === 6 || y === 25 || x === L + 5 || x === R - 5;
        let c: Color = border ? ((x + y) % 4 < 2 ? "blue2" : "blue1") : stripe ? "rose3" : rugField(x - L - 6, y - 7);
        if (border && (y === 3 || y === 28)) c = (x % 4 < 2) ? "cream3" : "blue2";
        p.px(x, y, c);
      }
      // Worn path: the pattern fades toward the cream warp where feet go.
      p.over(() => {
        for (let y = 8; y < 24; y++) for (let x = 30; x < 70; x++) {
          const wear = Math.abs(x - 50) / 20 + Math.abs(y - 16) / 10;
          if (wear < 1 && (x + y * 3) % 3 !== 0) p.swap({ blue2: "blue4", blue3: "blue4", cream3: "cream4", rose3: "rose4" }, [x, y, 1, 1]);
        }
      });
      // Fringe at both ends, matted into clumps.
      for (let y = 3; y < 29; y++) {
        if (y % 3 === 0) continue;
        const n = 2 + ((y * 7) % 3);
        p.hline(L - n, y, n, "cream3").px(L - n, y, "cream2");
        p.hline(R + 1, y, n, "cream3").px(R + n, y, "cream2");
      }
      // A tea stain.
      p.over(() => art(p, 70, 18, [".ss.", "s..s", "s..s", ".ss."], { s: "oak2" }));
      // The curled corner: the back of the weave turns up, plain and pale.
      art(p, R - 6, 23, [
        "......c",
        ".....cC",
        "....cCC",
        "...cCCC",
        "..cCCCc",
        ".cCCCc.",
        "ccccc..",
      ], { c: "cream2", C: "cream4" });
      p.rect(R + 1, 23, 5, 7, null);
    },
  },
});
