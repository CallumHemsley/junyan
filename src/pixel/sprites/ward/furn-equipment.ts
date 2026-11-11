/**
 * The ward's equipment: the drip stand and the heart monitor beside the elder's bed (both
 * animated, slowly), and the room's wheelchair, folding screen, wash basin and pedal bin.
 * Old, kept going, a little loved: tape on things, chips, small mends.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { CHROME, grid, vTube } from "./_furn.ts";

/** A five-star castor base seen from the front: the pole's foot at (cx, y). */
function starBase(p: Px, cx: number, y: number, reach: number) {
  // Back legs, short and in shade, then the side legs, then the leg that comes toward us.
  p.line(cx - 1, y, cx - reach + 3, y + 2, "steel3").line(cx + 1, y, cx + reach - 3, y + 2, "steel2");
  p.line(cx - 1, y + 1, cx - reach, y + 4, "steel4").line(cx - 1, y + 2, cx - reach, y + 5, "steel2");
  p.line(cx + 1, y + 1, cx + reach, y + 4, "steel4").line(cx + 1, y + 2, cx + reach, y + 5, "steel2");
  p.vline(cx, y, 6, "steel5").vline(cx + 1, y, 6, "steel3");
  p.rect(cx - 1, y - 1, 4, 3, "steel3").hline(cx - 1, y - 1, 4, "steel5");
  const wheel = (x: number, wy: number) => grid(p, x - 1, wy, 3, ["kKk", "kkk"], { k: "stone1", K: "steel3" });
  wheel(cx - reach + 3, y + 3);
  wheel(cx + reach - 3, y + 3);
  wheel(cx - reach, y + 6);
  wheel(cx + reach, y + 6);
  wheel(cx + 1, y + 6);
}

/**
 * `ward/iv-stand`: a chrome drip stand on a five-star base. An old-style glass bottle hangs upside
 * down in its wire cradle, label blank, with a slow drip in the chamber (8 frames, 4 fps); the line
 * loops down and away to the left, toward the bed beside it, through a blue roller clamp. The elder
 * uses the stand's other hook for his string bag with his enamel mug in it.
 */
function ivStand(p: Px, frame: number) {
  starBase(p, 11, 80, 10);
  vTube(p, 11, 6, 75, CHROME, 2);
  // A strip of white tape round the pole marks the nurse's height setting.
  p.rect(11, 44, 2, 2, "white").px(12, 45, "steel5");
  // The crossbar and its two curled hooks.
  p.hline(4, 6, 16, "steel5").hline(4, 7, 16, "steel3");
  grid(p, 2, 3, 3, [".e.", "e.e", "e.."], { e: "steel4" });
  grid(p, 19, 3, 3, [".e.", "e.e", "..e"], { e: "steel4" });
  p.rect(10, 4, 4, 2, "steel4").hline(10, 4, 4, "steel6");
  // The wire cradle, then the inverted glass bottle: base up, neck and stopper down.
  p.line(3, 6, 2, 10, "steel3").line(3, 6, 9, 10, "steel3");
  p.faded(0.85, (q) => {
    q.rect(2, 10, 8, 13, "blue6");
    q.rect(3, 22, 6, 1, "blue6").rect(4, 23, 4, 2, "blue6");
  });
  // The solution, the bottle's air bubble at the top, glass highlights, the blank label.
  p.faded(0.9, (q) => q.rect(2, 15, 8, 8, "blue5").rect(4, 23, 4, 1, "blue5"));
  p.vline(2, 11, 11, "white").vline(3, 11, 3, "white").vline(9, 11, 12, "steel4");
  p.rect(4, 13, 5, 6, "cream5").hline(4, 18, 5, "cream4").vline(8, 13, 6, "cream4");
  p.hline(2, 10, 8, "steel5").hline(2, 22, 8, "steel3");
  // Rubber stopper with its wire band.
  grid(p, 4, 25, 4, ["oOOo", ".oo."], { o: "orange1", O: "oak2" });
  // The drip chamber: clear plastic, half full, a drop forming, falling and landing.
  p.faded(0.7, (q) => q.rect(5, 27, 3, 8, "steel6"));
  p.faded(0.85, (q) => q.rect(5, 32, 3, 3, "blue5"));
  p.vline(5, 27, 8, "steel4").vline(7, 27, 8, "steel3");
  const f = frame % 8;
  if (f < 4) p.px(6, 27, f < 2 ? "blue4" : "blue3");
  if (f >= 2 && f < 4) p.px(6, 28, "blue4");
  if (f === 4 || f === 5) p.px(6, 29 + (f - 4), "blue3").px(6, 28 + (f - 4), "blue5");
  if (f === 6) p.px(5, 31, "white").px(7, 31, "white").px(6, 32, "blue3");
  if (f === 7) p.px(6, 31, "blue6");
  // The line: down from the chamber, a soft loop, a roller clamp, then off to the left.
  const tube: readonly [number, number][] = [[6, 35], [6, 42], [5, 48], [4, 53], [3, 56], [1, 57], [0, 56]];
  for (let i = 0; i + 1 < tube.length; i++) p.line(tube[i][0], tube[i][1], tube[i + 1][0], tube[i + 1][1], "steel5");
  p.line(7, 36, 7, 42, "steel3");
  grid(p, 5, 43, 3, ["bBb", "bWb", "bbb"], { b: "blue3", B: "blue4", W: "white" });
  // The elder's string bag on the right hook, his blue-rimmed enamel mug in it.
  p.line(20, 6, 19, 9, "bamboo2").line(20, 6, 23, 9, "bamboo2");
  grid(p, 16, 9, 8, [
    "..b..b..",
    ".bBBBBb.",
    ".bWWWWbe",
    ".WbWWbWe",
    ".bWWWwbe",
    ".WbWwbW.",
    "..bwwb..",
    "...bb...",
  ], { b: "bamboo2", B: "blue2", W: "cream5", w: "cream4", e: "cream3" });
  p.outline("steel2");
}

/** The monitor's pulse, one beat every nine pixels: offsets from the baseline (up is negative). */
const BEAT = [0, 0, -1, 0, 0, -5, 2, 0, -1] as const;

/**
 * `ward/monitor`: a beige 1990s heart monitor on a wheeled stand. The dark screen shows only a
 * green pulse line, redrawn left to right by a bright sweep (18 frames, 9 fps, one beat about every
 * second); no digits, no labels. The casing has yellowed, a nurse's strip of tape holds a blank note
 * to its top, two knobs, a speaker grille, the leads coiled in the wire basket below.
 */
function monitor(p: Px, frame: number) {
  // The stand: pole, wire basket of coiled leads, castor base.
  starBase(p, 15, 62, 11);
  vTube(p, 15, 27, 36, CHROME, 2);
  p.rect(9, 40, 14, 7, "steel3");
  grid(p, 9, 40, 14, [
    "e.e.e.e.e.e.e.",
    "egggGggggGgge.",
    ".gGgggGggggg.e",
    "eggggggGgggge.",
    ".e.e.e.e.e.e.e",
    "eeeeeeeeeeeee.",
    ".3333333333333",
  ], { e: "steel4", g: "stone2", G: "stone3", "3": "steel2" });
  // The leads, one looping down out of the basket toward the bed on the left.
  p.line(9, 44, 4, 50, "stone2").line(4, 50, 1, 49, "stone2");
  // The casing: its top, then the front face.
  p.rect(1, 3, 30, 4, "cream4");
  p.hline(2, 2, 28, "cream5").hline(1, 3, 22, "cream5");
  p.rect(1, 7, 30, 20, "stone4");
  p.vline(1, 7, 20, "stone5").hline(1, 7, 30, "cream4").vline(30, 7, 20, "stone3").hline(1, 26, 30, "stone2");
  // The nurse's taped note on top, blank.
  p.rect(18, 1, 8, 4, "white").hline(18, 4, 8, "cream4").rect(19, 0, 2, 2, "cream3").rect(24, 0, 2, 2, "cream3");
  // Screen bezel and the dark glass.
  p.rect(3, 9, 21, 15, "stone3").hline(3, 9, 21, "stone2").vline(3, 9, 15, "stone2").hline(4, 23, 20, "stone5").vline(23, 10, 14, "stone5");
  p.rect(4, 10, 19, 13, "jade1");
  p.px(4, 10, "stone3").px(22, 10, "stone3").px(4, 22, "stone3").px(22, 22, "stone3");
  p.hline(5, 11, 6, "jade2").px(5, 12, "jade2");
  // The trace: old line dim, fresh line bright, a dark gap just ahead of the sweep.
  const head = frame % 18;
  let prev = 16;
  for (let i = 0; i < 18; i++) {
    const x = 4 + i, y = 16 + BEAT[(i + 4) % 9];
    const age = (head - i + 18) % 18;
    if (age === 17 || age === 16) { prev = y; continue; }
    const c: Color = age === 0 ? "leaf5" : age < 6 ? "leaf4" : age < 12 ? "jade4" : "jade3";
    for (let yy = Math.min(prev, y); yy <= Math.max(prev, y); yy++) p.px(x, yy, c);
    prev = y;
  }
  // A dim second trace below: breathing, a slow wave.
  for (let i = 0; i < 18; i++) p.px(4 + i, 20 + (Math.floor((i + head) / 3) % 4 === 0 ? -1 : 0), "jade2");
  // Knobs, a green power lamp, the speaker grille.
  grid(p, 25, 10, 5, [".ee..", "eWe3.", ".33..", ".....", ".ee..", "eWe3.", ".33.."], { e: "steel5", W: "white", "3": "steel2" });
  p.px(28, 11, "leaf4");
  for (const y of [19, 21, 23]) p.hline(25, y, 4, "stone2");
  p.outline("stone1");
}

/**
 * `ward/wheelchair`, parked facing right: the ward's old chrome chair, big wheel near, the far wheel
 * showing behind it, jade vinyl sling and arms. Someone left a folded hospital blanket on the seat;
 * the left grip is long gone and wrapped in white tape.
 */
function wheelchair(p: Px) {
  const ring = (cx: number, cy: number, r: number, c: Color, t = 1) => {
    for (let y = Math.floor(cy - r - 1); y <= cy + r + 1; y++) for (let x = Math.floor(cx - r - 1); x <= cx + r + 1; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d <= r && d > r - t) p.px(x, y, c);
    }
  };
  // The far wheel, set back and up, in shade.
  ring(18, 24, 13.5, "stone2", 2);
  // Frame: back post with its push handle, the seat rail, the leg hanger to the footplate.
  vTube(p, 7, 3, 24, CHROME, 2);
  p.hline(2, 3, 6, "steel4").hline(2, 4, 6, "steel2");
  p.rect(1, 2, 3, 3, "white").px(1, 4, "cream4").px(3, 2, "cream5");
  // The backrest sling, seen almost edge-on.
  p.rect(9, 5, 3, 18, "jade2").vline(9, 5, 18, "jade3");
  // The seat, a sagging sling with the folded blanket on it.
  p.rect(9, 21, 20, 4, "jade2").hline(9, 21, 20, "jade3");
  grid(p, 11, 15, 16, [
    "................",
    "..55555555555...",
    ".5bbBbbbBbbbb5..",
    ".bjbbbbjbbbbbb4.",
    ".bbbBbbbbBbbbb4.",
    ".4444444444444..",
  ], { "5": "blue6", b: "blue5", B: "blue4", j: "jade5", "4": "blue3" });
  p.hline(8, 25, 22, "steel4").hline(8, 26, 22, "steel2");
  p.line(28, 26, 33, 36, "steel4").line(29, 26, 34, 36, "steel2");
  grid(p, 31, 36, 8, ["eeeeeee3", "33333333"], { e: "steel5", "3": "steel2" });
  // The near wheel: tyre, rim, push-rim, spokes and hub.
  ring(17, 28, 13.5, "stone1", 2);
  ring(17, 28, 11.5, "steel4");
  ring(17, 28, 10, "steel5");
  for (let a = 0; a < 12; a++) {
    const t = (a / 12) * Math.PI * 2;
    p.line(17, 28, Math.round(17 + Math.cos(t) * 9), Math.round(28 + Math.sin(t) * 9), a % 3 === 0 ? "steel4" : "steel3");
  }
  grid(p, 15, 26, 4, [".ee.", "eWe3", "e3e3", ".33."], { e: "steel5", W: "white", "3": "steel2" });
  // The tyre's lit upper-left arc.
  p.over(() => {
    for (let a = 0; a < 40; a++) {
      const t = Math.PI * (1.05 + (a / 40) * 0.5);
      p.px(Math.floor(17 + Math.cos(t) * 13), Math.floor(28 + Math.sin(t) * 13), "stone3");
    }
  });
  // The armrest over the wheel's top, padded jade on a chrome loop.
  p.rect(10, 13, 16, 3, "jade3").hline(10, 13, 16, "jade4").hline(10, 15, 16, "jade2");
  p.vline(24, 16, 9, "steel4").vline(25, 16, 9, "steel2");
  // The small front castor.
  grid(p, 31, 38, 5, [".ee..", ".e3..", "kkkk.", "kKkk.", ".kk.."], { e: "steel4", "3": "steel2", k: "stone1", K: "steel3" });
  p.outline("steel1");
}

/**
 * `ward/screen`: a three-leaf folding privacy screen on castors, chrome frames and gathered pale
 * curtain. It stands in a shallow zig-zag: the left leaf turned toward the window and lit, the
 * right leaf turned away into shade. The middle leaf's cloth is newer and whiter than the others,
 * replaced after a tear; the left leaf has a small darn.
 */
function screen(p: Px) {
  /** One leaf from x0 to x1, its top and bottom at the two ends (they recede when it turns). */
  const leaf = (x0: number, x1: number, top0: number, top1: number, bot0: number, bot1: number, light: number, cloth: Color) => {
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / (x1 - x0), top = Math.round(top0 + (top1 - top0) * t), bot = Math.round(bot0 + (bot1 - bot0) * t);
      // Gathered folds: a soft wave of light across the leaf.
      const wave = (x - x0) % 4;
      let c: Color = cloth;
      const lvl = light + (wave === 0 ? 1 : wave === 3 ? -1 : 0);
      if (lvl >= 1) c = cloth === "jade6" ? "blue6" : "white";
      if (lvl <= -1) c = cloth === "jade6" ? "jade5" : "cream4";
      if (lvl <= -2) c = cloth === "jade6" ? "jade4" : "cream3";
      p.vline(x, top + 3, bot - top - 6, c);
      // Rods top and bottom where the cloth is gathered.
      p.px(x, top + 1, "steel5").px(x, top + 2, "steel3");
      p.px(x, bot - 3, "steel4").px(x, bot - 2, "steel2");
    }
  };
  const post = (x: number, top: number, bot: number) => {
    vTube(p, x, top, bot - top, CHROME, 2);
    p.px(x, top - 1, "steel5").px(x + 1, top - 1, "steel4");
    grid(p, x - 1, bot, 4, [".ee.", "kkkk", ".kk."], { e: "steel3", k: "stone1" });
  };
  leaf(3, 20, 6, 9, 63, 67, 0, "jade6");
  leaf(22, 41, 9, 9, 67, 67, 0, "cream5");
  leaf(43, 60, 9, 6, 67, 63, -1, "jade6");
  post(1, 6, 63);
  post(20, 9, 67);
  post(41, 9, 67);
  post(60, 6, 63);
  // The patch sewn over a tear on the left leaf.
  grid(p, 7, 45, 6, ["5j5j5j", "j6666d", "566664", "j6666d", "5dd4dd"], { j: "jade4", "5": "jade5", "6": "blue6", d: "jade4", "4": "jade5" });
  p.outline("steel2");
}

/**
 * `ward/basin`: a wall-hung white wash basin under a patch of white tiles (layer `floor`, as wall
 * pieces are; anchor at the bottom of its waste pipe). One old brass-and-chrome tap with a wheel
 * handle has dripped long enough to leave a rust streak in the bowl. A cake of yellow soap sits in
 * a wire dish screwed to the wall; the rim is chipped at the front right.
 */
function basin(p: Px) {
  // The splashback: four rows of white tiles in grey grout.
  p.rect(2, 0, 28, 14, "stone4");
  for (let y = 0; y < 14; y += 7) for (let x = 2; x < 30; x += 7) {
    p.rect(x, y, 6, 6, "cream5").hline(x, y, 6, "white").vline(x, y, 6, "white").px(x + 5, y + 5, "cream4");
  }
  // The bowl: a rounded rim seen from above, the hollow inside lit on its far right wall, the
  // curved front apron below.
  p.rect(3, 13, 26, 12, "white");
  p.hline(4, 12, 24, "white").px(3, 13, "cream5").px(28, 13, "cream5").vline(28, 14, 11, "cream5");
  p.ellipse(16, 19, 11, 5, "cream4");
  p.ellipse(15, 18.5, 9.5, 3.5, "cream5");
  p.ellipse(17, 19.5, 8, 3, "cream4");
  p.over(() => {
    for (let x = 5; x < 12; x++) p.px(x, 17 + (x < 8 ? 1 : 0), "cream3");
    p.hline(10, 23, 12, "cream5");
  });
  // The rust streak from the tap down to the plughole.
  p.vline(16, 16, 3, "oak4").px(16, 17, "oak3").px(17, 19, "oak3");
  grid(p, 15, 20, 3, ["eke", ".e."], { e: "steel4", k: "steel1" });
  p.rect(3, 25, 26, 5, "cream5");
  p.hline(3, 25, 26, "white").hline(4, 29, 24, "cream3").vline(28, 25, 5, "cream4").vline(3, 25, 4, "white");
  p.px(3, 29, null).px(28, 29, null).hline(4, 30, 24, "cream3");
  p.px(3, 30, null).px(28, 30, null).hline(5, 30, 22, "cream3");
  // The chip on the front right of the rim.
  p.rect(23, 25, 3, 2, "stone4").px(24, 25, "stone3");
  // The tap: out of the wall, a wheel handle on top, the spout bending down over the bowl.
  grid(p, 12, 3, 9, [
    "..GGGGG..",
    ".GgGgGgG.",
    "..ggggg..",
    "....e....",
    "...eWe3..",
    "..eWWee3.",
    "..e3333e.",
    "......e3.",
    "......e3.",
    ".......3.",
  ], { G: "steel5", g: "steel3", e: "steel4", W: "white", "3": "steel2" });
  // The soap dish on its wire bracket at the right, the cake of yellow soap worn to a lozenge.
  grid(p, 26, 8, 6, [".gGGg.", "gGGGgg", "e3e3e3", ".eeee."], { g: "gold3", G: "gold4", e: "steel4", "3": "steel2" });
  // The waste pipe and its trap, running back into the wall.
  vTube(p, 15, 31, 9, CHROME, 2);
  p.rect(14, 37, 4, 3, "steel4").hline(14, 37, 4, "steel5").hline(14, 39, 4, "steel2");
  p.vline(15, 40, 4, "steel3").vline(16, 40, 4, "steel2");
  // A hairline shadow on the wall below and right, as wall pieces have.
  p.outline("stone2", { sides: ["bottom", "right"] });
}

/**
 * `ward/bin`: a cream enamel pedal bin with a domed chrome lid. The lid doesn't quite shut over an
 * orange peel; there is a dent in its side from a trolley, and the pedal is worn bright.
 */
function bin(p: Px) {
  // The body: an enamel cylinder lit on the left.
  p.rect(2, 6, 12, 15, "cream4");
  p.vline(2, 6, 15, "cream5").vline(3, 6, 15, "white").vline(12, 6, 15, "cream3").vline(13, 6, 15, "cream2");
  p.hline(2, 20, 12, "cream3");
  p.hline(2, 9, 12, "jade4").hline(2, 10, 12, "jade3");
  // The trolley's dent.
  grid(p, 8, 13, 3, [".3.", "35.", ".3."], { "3": "cream3", "5": "cream5" });
  // The base rim, the pedal.
  p.rect(2, 21, 12, 2, "steel3").hline(2, 21, 12, "steel4");
  grid(p, 4, 21, 8, ["..WWWW..", ".eeeeee."], { W: "white", e: "steel4" });
  // The lid, lifted a crack over an orange peel.
  grid(p, 1, 0, 14, [
    "....oOO.......",
    "...ooOoo......",
    "..eeeWWWeeee..",
    ".eWWWeeeeeee3.",
    "eWeeeeeeeee333",
    "33333333333333",
  ], { e: "steel5", W: "white", "3": "steel3", o: "orange2", O: "orange3" });
  p.hline(2, 6, 12, "steel2");
  p.outline("steel2");
}

export default defineSprites({
  "ward/iv-stand": { w: 24, h: 88, anchor: [12, 86], foot: [-6, -5, 12, 5], shadow: { rx: 10, ry: 3, dy: -2 }, frames: 8, fps: 4, draw: ivStand },
  "ward/monitor": { w: 32, h: 72, anchor: [16, 70], foot: [-8, -5, 16, 5], shadow: { rx: 11, ry: 3, dy: -2 }, frames: 18, fps: 9, draw: monitor },
  "ward/wheelchair": { w: 40, h: 44, anchor: [20, 42], foot: [-18, -10, 36, 10], shadow: { rx: 18, ry: 4, dy: -1 }, draw: wheelchair },
  "ward/screen": { w: 64, h: 72, anchor: [32, 70], foot: [-30, -8, 60, 8], shadow: { rx: 30, ry: 4, dy: -3 }, draw: screen },
  "ward/basin": { w: 32, h: 44, anchor: [16, 43], layer: "floor", draw: basin },
  "ward/bin": { w: 16, h: 24, anchor: [8, 23], foot: [-6, -4, 12, 4], shadow: { rx: 7, ry: 2, dy: -1 }, draw: bin },
});

