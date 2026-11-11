/**
 * The reading room's floor (ticket 0204). Placed by `src/pixel/town/ground-reading-room-legend.ts`.
 *
 * - `reading-parquet`: basket-weave parquet (拼花地板) as old French Concession flats have it: 16 px
 *   squares of four oak and walnut fingers, alternately east–west and north–south, waxed honey for
 *   decades. Every square sits inside a tile, so tiles join on a joint and any variant meets any other.
 *   Variants: a and b re-tone the fingers; c has a finger replaced in paler new oak; d a dark ring where
 *   an ink bottle once tipped.
 * - `reading-outside`: the dark of the building beyond the room's walls.
 * - `reading-worn-<bits>`: the band where wax is worn pale along walked paths, translucent over the
 *   parquet, its edge following the corners in the band (nw, ne, sw, se).
 * - `edge-reading-parquet-<side>`: the dark border board where the parquet stops.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { T, inBlob, sided, stamp, tile, type Side } from "./_helpers.ts";

const VARIANTS = ["a", "b", "c", "d"] as const;
const sprites: Record<string, SpriteDef> = {};

/** Finger tones and their lit arris, by family: honey oak, darker walnut. */
const FINGERS: readonly Color[] = ["oak3", "oak3", "wood4", "oak3", "oak4"];
const LIT: Partial<Record<Color, Color>> = { oak3: "oak4", oak5: "cream4" };

function parquet(p: Px, v: string): void {
  const seed = v.charCodeAt(0);
  for (let cy = 0; cy < 2; cy++) for (let cx = 0; cx < 2; cx++) {
    const across = (cx + cy) % 2 === 0;
    for (let f = 0; f < 4; f++) {
      let tone = FINGERS[Math.floor(hash(cx * 4 + f, cy, seed) * FINGERS.length)];
      if (v === "c" && cx === 1 && cy === 0 && f === 2) tone = "oak5";
      for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) {
        const x = cx * 16 + (across ? i : f * 4 + j), y = cy * 16 + (across ? f * 4 + j : i);
        const joint = j === 3 || (across ? x % 16 === 0 : y % 16 === 0);
        // Joints between squares are a step darker than those between fingers.
        const square = across ? x % 16 === 0 : y % 16 === 0;
        const lit = j === 0;
        p.px(x, y, joint ? (square ? "wood3" : "oak2") : lit ? LIT[tone] ?? tone : tone);
      }
      // A grain streak along each finger, clear of its ends.
      const g = 3 + Math.floor(hash(f, cx + cy * 2, seed + 3) * 8);
      for (let k = 0; k < 4; k++) {
        const i = g + k, x = cx * 16 + (across ? i : f * 4 + 1), y = cy * 16 + (across ? f * 4 + 2 : i);
        if (i < 15 && hash(k, f, seed + cx) < 0.7) p.px(x, y, tone === "wood4" ? "wood3" : "oak2");
      }
    }
  }
  if (v === "d") for (let y = 4; y < 28; y++) for (let x = 4; x < 28; x++) {
    const d = Math.hypot(x + 0.5 - 18, (y + 0.5 - 14) * 1.25);
    if (d > 4.6 && d < 5.6 && hash(x, y, 9) < 0.7) p.px(x, y, "wood3");
  }
}

function outside(p: Px, v: string): void {
  p.rect(0, 0, T, T, "wood1");
  // Floorboards beyond, barely there in the dark.
  for (let y = 7; y < T; y += 8) p.hline(0, y, T, "ink2");
  if (v === "b") stamp(p, 9, 12, ["ab", "bb"], { a: "wood1", b: "ink" }, false);
}

/** Where the parquet stops: a dark walnut border board, its inner arris lit. */
function edge(p: Px, side: Side): void {
  sided(p, side, (plot) => {
    for (let a = 0; a < T; a++) {
      plot(a, 0, "ink2");
      for (let d = 1; d < 5; d++) plot(a, d, d === 4 ? "wood3" : hash(a >> 3, d, 6) > 0.85 ? "wood1" : "wood2");
      plot(a, 5, "wood1");
    }
  });
}

/** Worn wax over the corners in the band: a translucent pale sheen, ragged where it fades, a few scuffs. */
function worn(p: Px, bits: string, alt: boolean): void {
  const [nw, ne, sw, se] = [...bits].map(Number);
  const seed = parseInt(bits, 2) + (alt ? 17 : 0);
  p.faded(0.13, () => {
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const u = (x + 0.5) / T, v = (y + 0.5) / T;
      const m = nw * (1 - u) * (1 - v) + ne * u * (1 - v) + sw * (1 - u) * v + se * u * v;
      if (m + (hash(x >> 2, y >> 2, seed) - 0.5) * 0.35 > 0.5) p.px(x, y, "cream5");
    }
  });
  if (bits === "1111") p.faded(0.45, () => {
    for (const [x, y] of alt ? [[8, 21], [22, 9]] : [[13, 13]]) if (inBlob(x, y, x, y, 3, 1)) p.hline(x - 2, y, 5, "wood2");
  });
}

for (const v of VARIANTS) sprites[`ground/reading-parquet-${v}`] = tile((p) => parquet(p, v));
sprites["ground/reading-outside-a"] = tile((p) => outside(p, "a"));
sprites["ground/reading-outside-b"] = tile((p) => outside(p, "b"));
for (const side of ["n", "s", "w", "e"] as const) sprites[`ground/edge-reading-parquet-${side}`] = tile((p) => edge(p, side));
for (let n = 1; n < 16; n++) {
  const bits = n.toString(2).padStart(4, "0");
  sprites[`ground/reading-worn-${bits}`] = tile((p) => worn(p, bits, false));
}
sprites["ground/reading-worn-1111b"] = tile((p) => worn(p, "1111", true));

export default defineSprites(sprites);
