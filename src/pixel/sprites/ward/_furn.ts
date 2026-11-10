/**
 * Private helpers for the ward's furniture and equipment (ticket 0172). Not a sprite set.
 *
 * The ward is a small, slightly old Chinese hospital room on a morning: white-enamelled steel beds,
 * cream panels, a tea-wood bedside cabinet, hospital-issue blankets. Metal here is enamel or chrome;
 * both are tubes lit on their upper-left edge.
 */
import { type Color, type Legend, type Px } from "../../kit/index.ts";
import { grid as furnGrid } from "../furn/_helpers.ts";

export { each, oval, ovalHalves, roundCorners } from "../furn/_helpers.ts";

/** `rows()` that checks every row is `w` wide, so hand-placed art cannot drift. */
export const grid = furnGrid;

/** A metal finish as light-to-dark roles, plus its outline colour. */
export type Metal = { hi: Color; lit: Color; base: Color; shade: Color; deep: Color; line: Color };
/** White stove enamel on the bed frames, drip stand and basin brackets. */
export const ENAMEL: Metal = { hi: "white", lit: "steel6", base: "steel5", shade: "steel4", deep: "steel3", line: "steel2" };
/** Chrome: taps, castor forks, wheelchair tubes. */
export const CHROME: Metal = { hi: "white", lit: "steel5", base: "steel4", shade: "steel3", deep: "steel2", line: "steel1" };

/** A horizontal tube, `thick` 2 or 3 px: lit top, body, shaded underside. */
export function hTube(p: Px, x: number, y: number, len: number, m: Metal, thick = 3): void {
  if (thick >= 3) p.hline(x, y, len, m.lit).hline(x, y + 1, len, m.base).hline(x, y + 2, len, m.deep);
  else p.hline(x, y, len, m.lit).hline(x, y + 1, len, m.shade);
}

/** A vertical tube, `thick` 2 or 3 px: lit on its screen-left, shaded on the right. */
export function vTube(p: Px, x: number, y: number, len: number, m: Metal, thick = 3): void {
  if (thick >= 3) p.vline(x, y, len, m.lit).vline(x + 1, y, len, m.base).vline(x + 2, y, len, m.deep);
  else p.vline(x, y, len, m.lit).vline(x + 1, y, len, m.shade);
}

/** Crisp white cotton: sheets, pillowcases, the turned-down top sheet. */
export const SHEET: Legend = { W: "white", "5": "cream5", "4": "cream4", "3": "cream3", "2": "cream2" };

/** One step darker or lighter inside the ward's cloth ramps, for lighting patterned cloth. */
export const CLOTH_DOWN: Partial<Record<Color, Color>> = {
  white: "cream5", cream5: "cream4", cream4: "cream3", cream3: "cream2",
  blue6: "blue5", blue5: "blue4", blue4: "blue3", jade6: "jade5", jade5: "jade4", jade4: "jade3", jade3: "jade2",
  steel6: "steel5", steel5: "steel4",
};
export const CLOTH_UP: Partial<Record<Color, Color>> = {
  cream5: "white", cream4: "cream5", cream3: "cream4", blue6: "white", blue5: "blue6", blue4: "blue5",
  jade6: "blue6", jade5: "jade6", jade4: "jade5", jade3: "jade4", steel5: "steel6", steel4: "steel5",
};

/** Step a colour `level` times up (positive) or down (negative) through the cloth ramps. */
export function step(c: Color, level: number): Color {
  let out = c;
  for (let i = 0; i < Math.abs(level); i++) out = (level > 0 ? CLOTH_UP[out] : CLOTH_DOWN[out]) ?? out;
  return out;
}

/**
 * The shared bed geometry from `docs/design/pixel-contracts.md`, in canvas pixels of the 48×96 bed.
 * The cast worker draws `lie` and `sit-bed` against the same numbers.
 */
export const BED = {
  w: 48, h: 96, anchor: [24, 94] as const,
  /** The mattress's top face (flat bed), and its left and right edges. */
  mattressTop: 18, mattressBottom: 74, mattressLeft: 4, mattressRight: 43,
  pillowFlat: [24, 24] as const,
  /** Raised: the sloped backrest face, and the pillow propped against it. */
  backrestTop: 4, backrestBottom: 40, pillowRaised: [24, 20] as const,
  blanketLying: [34, 76] as const,
  blanketSitting: [44, 76] as const,
};

/**
 * The bedside cabinet's top (`ward/cabinet`, 44×58, anchor [22, 57]), in pixels relative to its anchor.
 * The top face spans dx −20…+19, dy −55…−33. `slots` are where three foods' own anchors go (their
 * bottom-centre pixel, as `food/*` sprites define it), sized for `food/milk` (20 wide), `food/bread`
 * (24) and `food/egg` (22): two at the back, one in front, overlapping a little the way things crowd
 * a bedside top. Sort foods with the cabinet: `sortY` = the cabinet's anchor y plus 1–3 px, back
 * slots first, so the front food draws over the back two.
 */
export const CABINET_TOP = {
  rect: [-20, -55, 40, 23] as const,
  centre: [0, -44] as const,
  slots: [
    { dx: -10, dy: -45, sortDy: 1, fits: "food/milk" },
    { dx: 9, dy: -44, sortDy: 2, fits: "food/bread" },
    { dx: 0, dy: -35, sortDy: 3, fits: "food/egg" },
  ],
} as const;
