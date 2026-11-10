/**
 * The doorway and what lies around it: the step in the gap of the front wall, the mat inside it,
 * and the void outside the room.
 */
import { defineSprites, type Legend, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

const STONE: Legend = {
  W: "white", C: "cream5", c: "cream4", k: "cream3",
  a: "oak2", b: "oak3", o: "oak4", l: "oak5", w: "cream4",
  1: "stone1", 2: "stone2", 3: "stone3", 4: "stone4", 5: "stone5",
  f: "leaf3", F: "leaf2", r: "orange2", R: "orange1", s: "steel3",
};

/**
 * The doorway, two tiles wide, filling the gap between `wall/cap-door-left` and `-right`.
 * The marble sill the glazed double doors close onto, with a screwed brass kick strip polished bright
 * in the middle by ninety years of feet; a granite step worn pale and cracked at one end; then the
 * street pavement in full morning sun, brighter the further out it is.
 * Anchors at its top-left; place it on the front-wall row.
 */
function doorThreshold(p: Px) {
  // Granite step (rows 5–13), two slabs, the nose lit (14), the riser in shade (15–18).
  p.hline(0, 5, 64, "stone5").rect(0, 6, 64, 8, "stone4").hline(0, 14, 64, "stone5");
  p.rect(0, 15, 64, 3, "stone2").hline(0, 18, 64, "stone1");
  p.vline(31, 5, 10, "stone3").vline(32, 6, 8, "stone5");
  // Speckled granite: small clusters, never single pixels.
  for (const [x, y] of [[5, 8], [13, 11], [22, 7], [41, 12], [50, 8], [57, 11], [9, 12], [46, 6]] as const) p.px(x, y, "stone3").px(x + 1, y, "stone3");
  // The polished hollow worn in the middle.
  block(p, 14, 7, [
    "......55555555555..55555555......",
    "...5555555cccc555555555cc555555..",
    ".555555ccccccccc555555ccccc55555.",
    "..55555555cccc5555555555c5555555.",
    "....555555555555555555555555.....",
  ], STONE, "hollow");
  // A crack across the left slab and a corner knocked off the right one.
  block(p, 3, 6, ["3...", ".3..", ".33.", "...3", "...3", "..3.", "..3."], STONE, "crack");
  block(p, 58, 13, ["...44", "..222", ".2222", "22222", "11111"], STONE, "chip");
  // Marble sill under the double doors (rows 0–2), veined, and the brass kick strip (3–5) the doors
  // close on, dull except where feet have polished it.
  p.hline(0, 0, 64, "stone3").hline(0, 1, 64, "white").hline(0, 2, 64, "cream5");
  for (const [x, n] of [[6, 5], [24, 3], [40, 6], [55, 4]] as const) p.hline(x, 2, n, "stone5");
  p.px(12, 1, "stone5").px(13, 2, "stone4").px(47, 1, "stone5");
  p.hline(0, 3, 64, "gold3").hline(0, 4, 64, "gold2").hline(0, 5, 64, "gold1");
  p.hline(20, 3, 24, "gold4").hline(24, 4, 16, "gold3");
  for (const x of [4, 31, 58]) p.px(x, 4, "gold4").px(x + 1, 4, "gold1");
  // The street: big paving slabs, in the door's shade at first, then full sun.
  p.rect(0, 19, 64, 13, "cream4");
  p.rect(0, 19, 64, 2, "stone4").hline(0, 21, 64, "cream3");
  p.rect(0, 26, 64, 6, "cream5").hline(0, 30, 64, "white").hline(0, 31, 64, "white");
  for (const x of [11, 35, 58]) p.vline(x, 19, 7, "stone4");
  for (const x of [23, 47]) p.vline(x, 26, 6, "cream3");
  p.hline(0, 25, 64, "stone4").hline(0, 26, 64, "cream4");
  for (let x = 0; x < 64; x++) if ((x + 1) % 3) p.px(x, 29, "white");
  // A ginkgo leaf blown up against the step.
  block(p, 41, 21, [".ff.", "fFfr", ".fr.", "..R."], STONE, "leaf");
}

/**
 * The coir doormat inside the door: a jade-dyed stripe in its border, its middle trodden bald and
 * pale, its ends fraying, and the top-right corner lifted where it has curled for years: its lit top
 * edge rises off the floor and shows the dark rubber underside.
 * Lies on the floor: layer `floor`, anchor at the middle of its front edge. 60×28; the mat itself
 * occupies rows 4–27, the rows above are room for the lifted corner.
 */
function mat(p: Px) {
  const L = 2, R = 57, T = 4, B = 25;
  // Woven field in two close tones: a quiet two-by-two basket weave.
  for (let y = T; y <= B; y++) for (let x = L; x <= R; x++) {
    const across = (((x - L) >> 1) + ((y - T) >> 1)) % 2 === 0;
    p.px(x, y, across === ((y - T) % 2 === 0) ? "bamboo3" : "bamboo4");
  }
  // Bald middle: the weave pressed flat and bleached where every customer wipes their feet.
  const bald = (x: number, y: number, rx: number, ry: number) => ((x + 0.5 - 29) / rx) ** 2 + ((y + 0.5 - 15) / ry) ** 2 <= 1;
  p.each((x, y, c) => {
    if (bald(x, y, 11, 5)) return c === "bamboo3" ? "bamboo4" : c === "bamboo4" ? "bamboo5" : undefined;
    if (bald(x, y, 16, 7.5) && (x + y) % 2 === 0) return c === "bamboo3" ? "bamboo4" : undefined;
    return undefined;
  });
  // Border: dark binding, then the jade stripe.
  p.frame(L, T, R - L + 1, B - T + 1, "bamboo1");
  p.hline(L + 2, T + 2, R - L - 3, "jade3").hline(L + 2, B - 2, R - L - 3, "jade2");
  p.vline(L + 2, T + 2, B - T - 3, "jade3").vline(R - 2, T + 2, B - T - 3, "jade2");
  // Thickness: the front edge of the mat.
  p.hline(L, B + 1, R - L + 1, "bamboo1").hline(L + 1, B + 2, R - L - 1, "bamboo2");
  // Frayed ends: fibres working loose on both short sides.
  for (let y = T + 1; y < B; y += 2) {
    if (y % 4 !== 3) p.px(L - 1, y, "bamboo3");
    if (y % 6 === 1) p.px(L - 2, y, "bamboo2");
    if (y % 4 !== 1) p.px(R + 1, y, "bamboo3");
    if (y % 6 === 3) p.px(R + 2, y, "bamboo2");
  }
  // The lifted corner: erase the flat corner, then draw it raised. Its lit coir top edge curls up and
  // over; beneath, the rubber underside faces us in shade, darkest where it meets the floor.
  for (let y = T; y < T + 7; y++) for (let x = R - 8 + (y - T); x <= R; x++) p.px(x, y, null);
  // The raised flap: hinged on the fold from (R-8, T) to (R, T+8), its tip lifted to the top of the canvas.
  p.poly([[R - 8, T], [R + 1, 0], [R + 1, T + 9]], "stone2");
  p.poly([[R - 8, T], [R + 1, T + 3], [R + 1, T + 9]], "stone1");
  p.line(R - 8, T, R, 0, "bamboo4").line(R - 7, T, R, 1, "stone3");
  p.px(R, 0, "bamboo5").px(R - 1, 0, "bamboo5").vline(R, 1, T + 7, "bamboo1");
  // Where the fold meets the floor: the flattened coir of the crease.
  p.line(R - 8, T + 1, R - 1, T + 8, "bamboo2");
}

export default defineSprites({
  "tile/door-threshold": { w: 64, h: 32, anchor: [0, 0], layer: "floor", draw: doorThreshold },
  "tile/mat": { w: 60, h: 28, anchor: [30, 27], layer: "floor", draw: mat },
  /** Outside the room. */
  "tile/void": { w: 32, h: 32, anchor: [0, 0], layer: "floor", draw: (p) => p.rect(0, 0, 32, 32, "ink") },
});
