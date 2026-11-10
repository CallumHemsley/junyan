/**
 * Private helper: the lanes' herringbone brick, shared by the brick tiles and the header courses.
 *
 * Bricks are 8×4 px with the joint on their bottom row and right column, laid in 90° herringbone on a
 * 4px unit. Unit cell (i, j) belongs to brick part k = (i − j) mod 4: 0 and 1 are the two halves of a
 * horizontal brick, 3 and 2 the top and bottom of a vertical one. The pattern repeats every 8 units
 * (32 px) both ways, so every tile meets its neighbours exactly.
 */
import { hash, type Color, type Px } from "../../kit/index.ts";

export type Brick = {
  /** The brick's origin unit (top-left), wrapped into 0..7. */
  bi: number; bj: number;
  horizontal: boolean;
  /** Position inside the brick, 0..7 along x for horizontal bricks (0..3 for vertical), 0..3/0..7 along y. */
  u: number; v: number;
  /** Width and height in px including the joint. */
  w: number; h: number;
  /** True if the brick crosses a tile edge, so both tiles must agree on its look. */
  shared: boolean;
};

const m8 = (v: number) => ((v % 8) + 8) % 8;

export function brickAt(x: number, y: number): Brick {
  const i = Math.floor(x / 4), j = Math.floor(y / 4);
  const k = (((i - j) % 4) + 4) % 4;
  const oi = k === 1 ? i - 1 : i, oj = k === 2 ? j - 1 : j;
  const horizontal = k <= 1;
  const w = horizontal ? 8 : 4, h = horizontal ? 4 : 8;
  const u = x - oi * 4, v = y - oj * 4;
  const shared = oi < 0 || oj < 0 || oi * 4 + w > 32 || oj * 4 + h > 32;
  return { bi: m8(oi), bj: m8(oj), horizontal, u, v, w, h, shared };
}

export type BrickTone = { face: Color; lit: Color; dark: Color };
/**
 * Fired clay faded by ninety years of sun and soot: mostly a soft brown-red, some dark overburnt ones,
 * some bleached to a dusty mauve, and the grey 青砖 slipped in from a demolished wall. Grey joints keep
 * the red quiet.
 */
export const TONES: Record<"dusty" | "warm" | "dark" | "grey", BrickTone> = {
  dusty: { face: "cream1", lit: "cream2", dark: "stone2" },
  warm: { face: "tan2", lit: "tan3", dark: "tan1" },
  dark: { face: "wood3", lit: "tan2", dark: "wood2" },
  grey: { face: "stone3", lit: "stone4", dark: "stone2" },
};
export const JOINT: Color = "stone2";

/** Pick a brick's tone. Shared bricks use a fixed seed so both tiles draw the same brick. */
export function toneOf(b: Brick, seed: number): BrickTone {
  const r = hash(b.bi, b.bj + (b.horizontal ? 0 : 8), b.shared ? 77 : seed);
  return r < 0.18 ? TONES.dusty : r < 0.4 ? TONES.dark : TONES.warm;
}

/**
 * Paint one pixel of a brick: joints on the bottom row and right column, a lit corner at the top left,
 * and a darker heel at the lower right where years of feet have rounded it.
 */
export function brickPixel(b: Brick, tone: BrickTone): Color {
  const last = b.w - 1, bottom = b.h - 1;
  if (b.u === last || b.v === bottom) return JOINT;
  if (b.v === 0 && b.u < (b.horizontal ? 3 : 1)) return tone.lit;
  if (b.u === 0 && b.v < (b.horizontal ? 1 : 3)) return tone.lit;
  if (b.u === last - 1 && b.v === bottom - 1) return tone.dark;
  return tone.face;
}

/** Lay the whole tile. `override(b, x, y)` may change a brick's tone (a replacement, a stain). */
export function herringbone(p: Px, seed: number, override?: (b: Brick, x: number, y: number) => BrickTone | undefined): void {
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    const b = brickAt(x, y);
    const tone = override?.(b, x, y) ?? toneOf(b, seed);
    p.px(x, y, brickPixel(b, tone));
  }
}
