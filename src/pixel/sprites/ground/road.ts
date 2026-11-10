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

/** A wheel track along the road: a band polished paler by tyres, its edges wandering but meeting every tile. */
function track(p: Px, centre: number, seed: number) {
  p.faded(0.12, () => {
    for (let x = 0; x < T; x++) {
      const top = centre - 2 + Math.round(Math.sin((x / T) * Math.PI * 2 + seed) * 0.8);
      const bottom = centre + 2 + Math.round(Math.sin((x / T) * Math.PI * 4 + seed * 2) * 0.8);
      for (let y = top; y <= bottom; y++) if (y !== top && y !== bottom || hash(x >> 1, y, seed) < 0.5) p.px(x, y, "steel5");
    }
  });
}

/** The crown: the middle of the road a touch paler and drier, fading toward the kerbs. */
function crown(p: Px, toward: "n" | "s") {
  for (let y = 0; y < T; y++) {
    const d = toward === "s" ? y : T - 1 - y;
    const alpha = Math.max(0, (d - 12) / 20) * 0.08;
    if (alpha <= 0) continue;
    p.faded(alpha, () => p.hline(0, y, T, "steel4"));
  }
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
   * A crack that forked as it ran, sealed in two passes of tar by different crews, a few loose chips of
   * aggregate kicked out beside it.
   */
  "ground/road-c": tile((p) => {
    asphalt(p, 3);
    snake(p, [[5, 20], [10, 18], [15, 19], [19, 15]]);
    snake(p, [[15, 19], [20, 21], [25, 20]]);
    stamp(p, 9, 23, ["j..k", "...j"], L, false);
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

  // ── overlays along the road's length, placed by the scene by lane position ──
  /** Overlay: a wheel track in the upper half of a road cell. */
  "ground/road-track-n": tile((p) => track(p, 9, 1)),
  /** Overlay: a wheel track in the lower half of a road cell. */
  "ground/road-track-s": tile((p) => track(p, 23, 2)),
  /** Overlay: the crown, palest at the cell's south edge (the cell north of the road's middle). */
  "ground/road-crown-s": tile((p) => crown(p, "s")),
  /** Overlay: the crown, palest at the cell's north edge (the cell south of the road's middle). */
  "ground/road-crown-n": tile((p) => crown(p, "n")),
});
