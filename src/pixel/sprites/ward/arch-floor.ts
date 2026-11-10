/**
 * The ward floor: grey-cream terrazzo cast in one-metre panels between brass strips, waxed every
 * Friday for forty years, with a darker green terrazzo border band where it meets the walls.
 * Tiles anchor at their top-left corner; every variant tiles with every other (the strips sit on each
 * tile's top row and left column).
 *
 * Suggested mix: a ×4, b ×3, c ×2, then d, crack and patch once each. `path-h`/`path-v`/`path-x` are
 * the scuffed track from the door to the beds; `damp-a`/`damp-b` sit in a small cluster where the
 * cleaner has just mopped. `edge-*` frame the room like the bistro's border: `n` along the back wall,
 * `w`/`e` the side walls, `s` the front, corners `nw`/`ne`/`sw`/`se`.
 */
import { defineSprites, hash, Px, type Color } from "../../kit/index.ts";
import { BAND, block, strips, terrazzo, tile } from "./_arch.ts";

/** Wet terrazzo darkens a step; the wax keeps it from going patchy. */
const WET: Partial<Record<Color, Color>> = {
  stone5: "stone4", stone4: "stone3", stone3: "stone2", white: "stone5", cream5: "stone5", cream4: "stone4",
  cream3: "cream2", jade5: "jade4", jade4: "jade3", bamboo3: "bamboo2", bamboo4: "bamboo3",
};
/** Where the polish is walked off: paler, matte, the chips worn down into the ground. */
const WORN: Partial<Record<Color, Color>> = { stone5: "cream4", stone4: "cream4", stone3: "stone5", jade5: "cream4", white: "cream5", cream5: "cream4" };

/**
 * A worn track running east–west through the middle of the tile, rows about 7–24, with ragged edges,
 * two broken lines of grey rubber from the bed and trolley wheels and a black heel scuff or two.
 */
function trackH(p: Px, seed: number) {
  for (let x = 0; x < 32; x++) {
    const top = 8 + Math.floor(hash((x >> 3) & 3, 1, seed) * 2), bottom = 23 - Math.floor(hash((x >> 3) & 3, 2, seed) * 2);
    for (let y = top; y <= bottom; y++) {
      const c = p.get(x, y) as Color;
      if (WORN[c]) p.px(x, y, WORN[c]!);
    }
  }
  // Wheel lines: long, faint, broken where the wheels lifted over a chip.
  for (const [row, s] of [[12, 3], [19, 5]] as const) for (let x = 1; x < 32; x++) {
    if (hash(x >> 3, row, seed + s) > 0.25) p.px(x, row, "stone4");
  }
}

/**
 * A swathe of wet floor left by one swing of a string mop: a curving band, solid in the middle and
 * striated at its edges where the strings dragged, tapering where the mop lifted. `curve(x)` is the
 * centre line; `half` the half-width. The window shines along its upper rim in short runs.
 */
function swathe(p: Px, curve: (x: number) => number, half: number, x0 = 3, x1 = 29) {
  const wet = new Px(32, 32);
  for (let x = x0; x < x1; x++) {
    const t = (x - x0) / (x1 - x0 - 1);
    const h = Math.max(1, Math.round(half * Math.min(1, t * 4, (1 - t) * 4)));
    const c = curve(x);
    for (let y = 2; y < 30; y++) {
      const d = Math.abs(y + 0.5 - c);
      if (d > h) continue;
      // Strings: the outer rows of the band are parallel streaks, every other row.
      if (d > h - 2.5 && Math.round(y - c) % 2 === 0) continue;
      wet.px(x, y, "white");
    }
  }
  p.each((x, y, c) => (wet.solid(x, y) && c && WET[c as Color] ? WET[c as Color] : undefined));
  for (let x = x0 + 4; x < x1 - 4; x++) {
    const y = Math.round(curve(x) - half + 2);
    if (wet.solid(x, y) && hash(x >> 2, 3, half) > 0.35) p.px(x, y, "white");
  }
}

/**
 * A wet patch where the mop has worked back and forth: a scalloped blob of darker floor holding a
 * reflection of the window stretched into streaks.
 */
function puddle(p: Px) {
  const wet = new Px(32, 32);
  for (let y = 4; y < 29; y++) for (let x = 3; x < 29; x++) {
    const dx = (x + 0.5 - 16) / 13, dy = (y + 0.5 - 17) / 9.5;
    const scallop = 0.09 * Math.sin(Math.atan2(dy, dx) * 7 + 1);
    const r = Math.sqrt(dx * dx + dy * dy) + scallop;
    if (r > 1 || (r > 0.88 && (x + y) % 2)) continue;
    wet.px(x, y, "white");
  }
  p.each((x, y, c) => (wet.solid(x, y) && c && WET[c as Color] ? WET[c as Color] : undefined));
  // The window, stretched down the wet floor into three broken bright streaks, one per bay.
  block(p, 11, 10, [
    "W...b...W",
    "W...W...W",
    "b...W...W",
    "W...C...b",
    "C.......W",
    "........C",
  ], { W: "white", C: "cream5", b: "blue6" }, "reflection");
}

/** A tile with the green band along the given sides (`n`: wall to the north …) and terrazzo inside. */
function edge(p: Px, sides: readonly ("n" | "s" | "w" | "e")[], seed: number) {
  const band = new Px(32, 32);
  terrazzo(band, seed + 50, BAND);
  terrazzo(p, seed);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const depth = Math.min(...sides.map((s) => (s === "n" ? y : s === "s" ? 31 - y : s === "w" ? x : 31 - x)));
    if (depth < 7) p.px(x, y, band.get(x, y));
    else if (depth === 7) p.px(x, y, "jade3");
  }
  // The band's brass strip glints where it is stepped over most, near the middle of each run.
  for (const s of sides) {
    const glint = (i: number) => (s === "n" ? [i, 7] : s === "s" ? [i, 24] : s === "w" ? [7, i] : [24, i]) as [number, number];
    for (const i of [14, 15]) { const [x, y] = glint(i); if (p.get(x, y) === "jade3") p.px(x, y, "bamboo4"); }
  }
}

const transposed = (draw: (p: Px) => void) => (p: Px) => {
  const q = new Px(32, 32);
  draw(q);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) p.px(x, y, q.get(y, x));
};

export default defineSprites({
  /** The quiet panel. The workhorse. */
  "ward/floor-a": tile((p) => terrazzo(p, 1)),
  "ward/floor-b": tile((p) => terrazzo(p, 2)),
  "ward/floor-c": tile((p) => terrazzo(p, 3)),

  /** The panel with the big white marble chip that every child on the ward has stood on for luck. */
  "ward/floor-d": tile((p) => {
    terrazzo(p, 4);
    p.rect(13, 15, 8, 6, "stone5");
    block(p, 14, 16, [".WWWW.", "WWCWWt", "WCWWtt", ".Wttt."], { W: "white", C: "cream5", t: "stone4" }, "lucky-chip");
  }),

  /**
   * The building settled; the crack ran across the panel and stopped at the brass strip, exactly as the
   * strips are there to make it. Someone grouted it dark years ago.
   */
  "ward/floor-crack": tile((p) => {
    terrazzo(p, 5);
    block(p, 1, 8, [
      "ss..............................",
      "..sS............................",
      "....sSs.........................",
      ".......sSSs.....................",
      "..........sSs........ss.........",
      "............sSSs...sS..sss......",
      "...............sSSS.......sS....",
      "..........................sSSss.",
      "..............................s.",
    ].map((r) => r.slice(0, 31)), { s: "stone3", S: "stone2" }, "crack");
  }),

  /**
   * Where the old radiator pipe came up through the floor: cut out and filled with plain cement that
   * never matched, trowel marks still in it, a ring where the pipe collar was.
   */
  "ward/floor-patch": tile((p) => {
    terrazzo(p, 6);
    p.rect(9, 10, 14, 10, "stone4");
    p.hline(9, 10, 14, "stone5").vline(9, 10, 10, "stone5").hline(9, 19, 14, "stone3").vline(22, 11, 9, "stone3");
    block(p, 11, 12, ["..ttt.....", ".t...tt...", "t......tt.", "........t."], { t: "stone5" }, "trowel");
    block(p, 17, 14, [".ss.", "s..s", ".ss."], { s: "stone3" }, "collar-ring");
  }),

  /** The scuffed track from the door to the beds, running east–west. */
  "ward/floor-path-h": tile((p) => {
    terrazzo(p, 7);
    trackH(p, 7);
    block(p, 22, 15, [".SS", "S.."], { S: "stone2" }, "heel-scuff");
    strips(p);
    // Where the wheels cross it, the strip is polished back to brass.
    p.px(0, 12, "bamboo4").px(0, 19, "bamboo4");
  }),

  /** The same track running north–south. */
  "ward/floor-path-v": tile((p) => {
    transposed((q) => { terrazzo(q, 8); trackH(q, 8); block(q, 9, 13, ["SS.", "..S"], { S: "stone2" }, "heel-scuff"); })(p);
    strips(p);
  }),

  /** Where the track turns: worn both ways, the wheel marks crossing. */
  "ward/floor-path-x": tile((p) => {
    terrazzo(p, 9);
    trackH(p, 9);
    transposed((q) => { q.each((x, y) => p.get(y, x)); trackH(q, 19); })(p);
    strips(p);
  }),

  /** Just mopped and still standing wet: the window caught in it. */
  "ward/floor-damp-a": tile((p) => {
    terrazzo(p, 10);
    puddle(p);
    strips(p);
  }),

  /** One long swing of the string mop across the panel, its strings combed into the edges. */
  "ward/floor-damp-b": tile((p) => {
    terrazzo(p, 11);
    swathe(p, (x) => 16 + 5 * Math.sin((x - 3) / 26 * Math.PI * 1.6 - 0.6), 7);
    strips(p);
  }),

  "ward/floor-edge-n": tile((p) => edge(p, ["n"], 21)),
  "ward/floor-edge-s": tile((p) => edge(p, ["s"], 22)),
  "ward/floor-edge-w": tile((p) => edge(p, ["w"], 23)),
  "ward/floor-edge-e": tile((p) => edge(p, ["e"], 24)),
  "ward/floor-edge-nw": tile((p) => edge(p, ["n", "w"], 25)),
  "ward/floor-edge-ne": tile((p) => edge(p, ["n", "e"], 26)),
  "ward/floor-edge-sw": tile((p) => edge(p, ["s", "w"], 27)),
  "ward/floor-edge-se": tile((p) => edge(p, ["s", "e"], 28)),
});
