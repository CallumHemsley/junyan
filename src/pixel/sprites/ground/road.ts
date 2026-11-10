/**
 * The breakfast road: old asphalt, sun-bleached to a soft blue-grey, patched by three different crews
 * over thirty years and never resurfaced. Texture is coarse aggregate in small clusters and a few long
 * tar-sealed cracks ("tar snakes"); no lane markings, no text.
 *
 * Aggregate wraps at the tile edges; cracks and patches stay inside the tile. The scene weights a and b
 * heavily, c moderately and d rarely.
 */
import { defineSprites, hash, type Legend, type Px } from "../../kit/index.ts";
import { T, inBlob, jitter, stamp, tile, wrap } from "./_helpers.ts";

const L: Legend = {
  i: "steel1", I: "steel2", j: "steel3", J: "steel4", k: "steel5",
  a: "stone1", b: "stone2", c: "stone3", n: "ink2", p: "plum1", P: "plum2", u: "blue2",
};

/**
 * Base asphalt: dark binder (steel2) worn back to show its pale aggregate, which here and there takes
 * over in two-pixel clusters, so the road reads lighter and older than its binder.
 */
function asphalt(p: Px, seed: number) {
  p.rect(0, 0, T, T, "steel2");
  for (const [x, y, r] of jitter(4, seed, 0)) {
    if (r < 0.1) { wrap(p, x, y, "steel3"); wrap(p, x + 1, y, "steel3"); }
    else if (r < 0.14) { wrap(p, x, y, "steel3"); wrap(p, x, y + 1, "steel3"); }
    else if (r < 0.18) wrap(p, x, y, "steel1");
  }
  // A few bigger chips of pale stone, worn smooth and lit on top.
  for (const [x, y, r] of jitter(16, seed + 9, 3)) if (r < 0.35) stamp(p, x, y, ["J.", "jI"], L);
}

/** A tar snake: a long crack sealed with a wobbling bead of fresher, darker tar. */
function snake(p: Px, points: readonly [number, number][]) {
  for (let s = 0; s + 1 < points.length; s++) {
    const [x0, y0] = points[s], [x1, y1] = points[s + 1];
    p.line(x0, y0, x1, y1, "steel1");
    // A second pixel on alternate runs gives the bead its thickness without a doubled line.
    p.line(x0 + 1, y0, x1 + 1, y1, "steel1");
  }
  // The sealant's sheen catches the light here and there on its upper edge.
  for (let s = 0; s + 1 < points.length; s++) {
    const [x0, y0] = points[s];
    if (s % 2 === 0) p.px(x0, y0 - 1, "steel3");
  }
}

/**
 * A patch: newer asphalt over a trench, still dark with binder, its saw-cut edge stepping where the crew
 * cut round an obstacle. Lit where the old road's lip faces the sun, a dark seam where it has sunk.
 */
function patch(p: Px, outline: readonly (readonly [number, number])[], seed: number) {
  const inside = (x: number, y: number) => probeHas(outline, x, y);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    if (!inside(x, y)) continue;
    p.px(x, y, hash(x, y, seed) < 0.04 ? "steel3" : "steel2");
    if (!inside(x, y - 1) || !inside(x - 1, y)) p.px(x, y, "steel3");
    else if (!inside(x, y + 1) || !inside(x + 1, y)) p.px(x, y, hash(x >> 1, y >> 1, seed) < 0.7 ? "steel1" : "steel2");
  }
}

/** Point-in-polygon at the pixel centre (even-odd), matching `Px.poly`. */
function probeHas(outline: readonly (readonly [number, number])[], x: number, y: number): boolean {
  let inside = false;
  const px = x + 0.5, py = y + 0.5;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const [ax, ay] = outline[i], [bx, by] = outline[j];
    if ((ay > py) !== (by > py) && px < ((bx - ax) * (py - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

export default defineSprites({
  /** Plain asphalt. */
  "ground/road-a": tile((p) => asphalt(p, 1)),

  /** Plain asphalt with one tar snake crawling across it. */
  "ground/road-b": tile((p) => {
    asphalt(p, 2);
    snake(p, [[4, 14], [9, 15], [13, 14], [18, 17], [24, 18]]);
  }),

  /**
   * The gas-main trench: a strip of newer, darker asphalt crossing the road kerb to kerb, its saw-cut
   * edges lit on the west and sunk on the east. The scene stacks it down one column of road.
   */
  "ground/road-c": tile((p) => {
    asphalt(p, 3);
    // The trench runs north–south through the whole tile, so stacked cells make one strip kerb to kerb.
    patch(p, [[10, 0], [22, 0], [22, 32], [10, 32]], 31);
    // It has sunk a little along its middle and cracked.
    stamp(p, 15, 11, ["i.", ".i", ".i", "i.", "i."], L, false);
  }),

  /**
   * A water-valve cap, a small cast-iron disc with a cross, sunk in its own ring of tar, and an old
   * oil drip from a parked tricycle, faintly plum where it catches the sky.
   */
  "ground/road-d": tile((p) => {
    asphalt(p, 4);
    p.ellipse(11, 12, 5, 5, "steel1");
    p.ellipse(11, 12, 4, 4, "steel3");
    p.each((x, y) => (inBlob(x, y, 11, 12, 4, 4) ? (x + y < 21 ? "steel4" : x + y > 24 ? "steel2" : "steel3") : undefined));
    p.hline(9, 12, 5, "steel1").vline(11, 10, 5, "steel1");
    p.px(9, 10, "steel5");
    // Oil drip: a soft blob with a rainbow-ish plum and blue rim; flat, so no shading.
    p.each((x, y) => (inBlob(x, y, 23, 25, 5, 3) ? "stone1" : undefined));
    stamp(p, 20, 24, [".pP.", "u..p"], L, false);
  }),
});
