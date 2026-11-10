/**
 * Bistro pieces for the back wall and the front door: the long mirror, the globe lamps, the tall menu
 * board, and the edge of the striped awning seen over the door from inside.
 * Wall pieces anchor at the wall's foot (place them at (x, 96) on a wall starting at y = 0).
 */
import { defineSprites, hash, type Color, type Legend, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

/**
 * The long bevelled mirror, 96×40, in a gilt frame gone brown in the hollows. It has hung over the
 * banquette since the thirties: the silvering has foxed into dark spots at the corners, and it holds a
 * soft, cool reflection of the room opposite (plaster, the dark wainscot, the bright glazed door, a
 * globe lamp). Frame top on wall row 16.
 */
function mirror(p: Px) {
  const w = 96, h = 40;
  // Gilt frame: lit top and left edges, shaded bottom and right, a bright bead inside.
  p.rect(0, 0, w, h, "gold2");
  p.hline(0, 0, w, "gold3").vline(0, 0, h, "gold3").hline(1, 1, w - 2, "gold2").vline(1, 1, h - 2, "gold2");
  p.hline(0, h - 1, w, "gold1").vline(w - 1, 0, h, "gold1").hline(1, h - 2, w - 2, "gold1").vline(w - 2, 1, h - 2, "gold1");
  p.hline(3, 3, w - 6, "gold1").vline(3, 3, h - 6, "gold1").hline(3, h - 4, w - 6, "gold3").vline(w - 4, 3, h - 6, "gold3");
  for (let x = 2; x < w - 2; x++) if (hash(x >> 3, 2, 5) > 0.6) p.px(x, 1, "gold4");
  // Glass: the room opposite, reflected soft and cool. Bands top to bottom: cornice, plaster, wainscot.
  const gx = 4, gy = 4, gw = w - 8, gh = h - 8;
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    let c: Color = y < 3 ? "stone4" : y < 20 ? "stone5" : y < 22 ? "stone4" : "stone3";
    // The glazed street door, bright, and the frame of it.
    if (x >= 52 && x < 66 && y >= 6 && y < gh) c = y < 8 || x === 52 || x === 65 || x === 58 || x === 59 ? "stone4" : "cream5";
    // A globe lamp's glow and the soft dark shape of the hat stand.
    if (((x + 0.5 - 24) / 3) ** 2 + ((y + 0.5 - 10) / 3) ** 2 <= 1) c = "cream5";
    if (x >= 34 && x < 36 && y >= 9) c = "stone3";
    if (x >= 32 && x < 38 && y >= 8 && y < 10) c = "stone3";
    p.px(gx + x, gy + y, c);
  }
  // A long soft sheen across the glass, the mark of a good old mirror.
  for (let i = 0; i < 18; i++) p.px(gx + 8 + i, gy + 20 - i, "steel6").px(gx + 9 + i, gy + 20 - i, "steel6");
  for (let i = 0; i < 10; i++) p.px(gx + 70 + i, gy + 24 - i, "steel6");
  // Bevel: a bright band along the top and left of the glass, a darker one bottom and right.
  p.hline(gx, gy, gw, "white").vline(gx, gy, gh, "white").hline(gx + 1, gy + 1, gw - 2, "steel5").vline(gx + 1, gy + 1, gh - 2, "steel5");
  p.hline(gx, gy + gh - 1, gw, "steel3").vline(gx + gw - 1, gy, gh, "steel3");
  // Foxing: the silvering failed in dark ragged spots, heaviest at the corners.
  const spots: readonly (readonly [number, number])[] = [[6, 6], [9, 8], [7, 27], [12, 29], [84, 6], [80, 8], [86, 27], [44, 29]];
  for (const [x, y] of spots) block(p, x, y, hash(x, y, 3) > 0.5 ? [".s.", "sSs", ".s."] : ["ss.", "sSs"], { s: "stone3", S: "stone1" }, "foxing");
  // Corner rosettes on the frame.
  for (const [x, y] of [[0, 0], [w - 5, 0], [0, h - 5], [w - 5, h - 5]] as const) block(p, x, y, [".lll.", "lLmLl", "lmdml", "lLmLl", ".lll."], { l: "gold3", L: "gold4", m: "gold2", d: "gold1" }, "rosette");
}

/**
 * A frosted glass globe on a brass bracket, 16×24. The arm is a little bent from a ladder, so the
 * globe sits a pixel off true. Globe top on wall row 14.
 */
function lampGlobe(p: Px) {
  // Soft glow round the globe: the lamp is lit for the dark early opening.
  p.faded(0.25, () => p.ellipse(8, 6, 8, 6.5, "gold5"));
  // Globe.
  p.ellipse(8, 6, 5.5, 5.5, "cream4");
  p.ellipse(7, 5, 4, 4, "cream5");
  p.ellipse(6.5, 4.5, 2, 2, "white");
  block(p, 3, 1, ["..ccccc...", ".c.......c"], { c: "cream4" }, "rim");
  p.px(12, 8, "cream3").px(11, 10, "cream3").px(12, 9, "cream3").px(10, 11, "cream3");
  // Gallery cup under the globe, the bent arm, the wall plate.
  block(p, 4, 11, ["glllllg", ".gdddg."], { g: "gold2", l: "gold4", d: "gold1" }, "cup");
  block(p, 6, 13, ["..lg..", "..lg..", "...lg.", "...lg.", "...lg.", "..lg..", "..lg..", ".lllg.", "lgggdl", "lgddgd", "lgggdd", ".dddd."], { l: "gold3", g: "gold2", d: "gold1" }, "arm");
}

/**
 * A tall blackboard menu in an ebonised frame, 30×44, with a chalk ledge and a stub of chalk. It is
 * blank: the day's menu is DOM text over the board. Overlay rectangle: x 4–25, y 4–37 (22×34).
 * Frame top on wall row 14.
 */
function menuBoard(p: Px) {
  p.rect(0, 0, 30, 41, "wood1");
  p.hline(0, 0, 30, "wood3").vline(0, 0, 41, "wood3").hline(1, 1, 28, "wood2").vline(1, 1, 39, "wood2");
  p.rect(3, 3, 24, 36, "steel1");
  p.hline(3, 3, 24, "ink").vline(3, 3, 36, "ink");
  // Yesterday's menu wiped off in big swirls: a chalk haze (dither is right for dust), nothing legible.
  const haze = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
  for (let y = 4; y < 38; y++) for (let x = 4; x < 26; x++) {
    if ((haze(x, y, 13, 14, 9, 7) || haze(x, y, 17, 29, 8, 6)) && (x + y) % 2 === 0) p.px(x, y, "steel2");
  }
  // Chalk ledge with a stub of chalk and the dust under it.
  p.rect(0, 41, 30, 2, "wood2").hline(0, 41, 30, "wood3").hline(0, 43, 30, "wood1");
  p.hline(20, 40, 3, "white").px(23, 40, "cream4").hline(18, 42, 7, "cream3");
  // Brass hanging hook at the top.
  block(p, 13, 0, [".gg.", "g..g"], { g: "gold3" }, "hook");
}

/**
 * The scalloped edge of the striped awning over the street door, seen from inside against the bright
 * street, 64×12: cream and bottle-green canvas glowing with the light behind it, bound along the
 * scallops, one scallop torn and stitched. Layer `over`: it hangs above everyone.
 */
function awning(p: Px) {
  const stripe = (x: number) => ((x >> 3) % 2 === 0 ? ["cream4", "cream5", "cream3"] : ["jade3", "jade4", "jade2"]) as [Color, Color, Color];
  for (let x = 0; x < 64; x++) {
    const [face, lit, shade] = stripe(x), u = x % 8;
    // Valance band rows 0–5: the canvas lit where the sun comes through, folds at the stripe joins.
    for (let y = 0; y < 6; y++) p.px(x, y, u === 0 ? shade : y < 2 ? lit : face);
    // Scallops: a half-round tongue per stripe hanging below the band.
    const depth = [6, 5, 4, 2][Math.min(3, Math.abs(u - 3.5) > 3 ? 3 : Math.abs(u - 3.5) > 2 ? 2 : Math.abs(u - 3.5) > 1 ? 1 : 0)];
    for (let y = 6; y < 6 + depth; y++) p.px(x, y, y === 5 + depth ? shade : face);
  }
  // Binding tape along the top, and the stitched tear.
  p.hline(0, 0, 64, "jade2");
  block(p, 41, 4, ["k.k", ".k.", "k.k"], { k: "cream2" }, "stitches");
}

const LEGEND: Legend = {};
void LEGEND;

export default defineSprites({
  "wall/mirror-long": { w: 96, h: 40, anchor: [48, 80], layer: "floor", draw: mirror },
  "wall/lamp-globe": { w: 16, h: 25, anchor: [8, 82], layer: "floor", draw: lampGlobe },
  "wall/menu-board-tall": { w: 30, h: 44, anchor: [15, 82], layer: "floor", draw: menuBoard },
  "wall/awning-edge": { w: 64, h: 12, anchor: [32, 12], layer: "over", draw: awning },
});
