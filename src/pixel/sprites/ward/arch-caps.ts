/**
 * The ward's side and front wall caps, seen from above, as 32×32 tiles: the cut top of a plastered
 * brick wall. A dark cement edge outside, a grey cement core, and on the inner edge the cream face's
 * lip catching the sun before a dark crease against the floor. Outside is void (`ink`). Quiet and
 * darker than the room, they frame the picture, like `wall/cap-*` in the bistro.
 *
 * Side caps fill the inner 16px of their tile; the front cap fills the top 10 rows. Corners mitre the
 * profiles: `tl`/`tr` meet the back wall's own cap (rows 0–5 of every `ward/wall-*` slice), `bl`/`br`
 * turn the side caps into the front cap. Tiles anchor at their top-left.
 */
import { defineSprites, Px, type Color } from "../../kit/index.ts";
import { BACK_PROFILE, CAP, FRONT_PROFILE, SIDE_PROFILE, block, capTexture, tile } from "./_arch.ts";

const paint = (letter: string) => CAP[letter] as Color;
const mirrored = (draw: (p: Px) => void) => (p: Px) => { const q = new Px(32, 32); draw(q); p.blit(q, 0, 0, { flipX: true }); };

function sideCap(p: Px, seed: number) {
  p.rect(0, 0, 16, 32, "ink");
  for (let y = 0; y < 32; y++) for (let i = 0; i < 16; i++) p.px(16 + i, y, paint(capTexture(SIDE_PROFILE[i], y, i, seed)));
}
function frontCap(p: Px, seed: number) {
  p.rect(0, 10, 32, 22, "ink");
  for (let x = 0; x < 32; x++) for (let y = 0; y < 10; y++) p.px(x, y, paint(capTexture(FRONT_PROFILE[y], x, y, seed)));
}

const LEFT = [
  (p: Px) => sideCap(p, 1),
  /** A hairline crack across the cement skim, and the expansion joint where the eighties wing meets the old block. */
  (p: Px) => {
    sideCap(p, 2);
    for (let i = 1; i < 13; i++) p.px(16 + i, 14, "stone1");
    for (let i = 1; i < 13; i++) p.px(16 + i, 15, "stone3");
    block(p, 21, 20, ["1.", "1.", ".1", ".1", "1."], CAP, "crack");
  },
  /** A corner of the lit lip knocked off by a bed being turned too tight, patched in whiter cement. */
  (p: Px) => {
    sideCap(p, 3);
    block(p, 28, 9, ["3k", "33", "3k"], CAP, "patch");
  },
];

const FRONT = [
  (p: Px) => frontCap(p, 11),
  /** The expansion joint again, crossing the front wall. */
  (p: Px) => { frontCap(p, 12); for (let y = 3; y < 9; y++) p.px(19, y, "stone1").px(20, y, "stone3"); },
  /** A crack wandering across the cement core. */
  (p: Px) => { frontCap(p, 13); block(p, 7, 4, ["11.........", "..11.......", "....111....", ".......11..", ".........11"], CAP, "crack"); },
];

/** Mitred corner: the side cap down x 16–31, meeting the back cap (top) or turning into the front cap (bottom). */
function corner(p: Px, kind: "top" | "bottom", seed: number) {
  p.rect(0, 0, 32, 32, "ink");
  for (let y = 0; y < 32; y++) for (let x = 16; x < 32; x++) {
    const i = x - 16;
    let letter: string;
    if (kind === "top") letter = y < 6 && y * 3 < i ? BACK_PROFILE[y] : SIDE_PROFILE[i];
    else {
      if (y > 9) continue;
      letter = y * 15 > (15 - i) * 9 ? FRONT_PROFILE[y] : SIDE_PROFILE[i];
    }
    p.px(x, y, paint(capTexture(letter, kind === "top" ? y : x, i, seed)));
  }
}

export default defineSprites({
  "ward/cap-left": tile(LEFT[0]),
  "ward/cap-left-b": tile(LEFT[1]),
  "ward/cap-left-c": tile(LEFT[2]),
  "ward/cap-right": tile(mirrored(LEFT[0])),
  "ward/cap-right-b": tile(mirrored(LEFT[1])),
  "ward/cap-right-c": tile(mirrored(LEFT[2])),
  "ward/cap-front": tile(FRONT[0]),
  "ward/cap-front-b": tile(FRONT[1]),
  "ward/cap-front-c": tile(FRONT[2]),
  "ward/cap-corner-tl": tile((p) => corner(p, "top", 31)),
  "ward/cap-corner-tr": tile(mirrored((p) => corner(p, "top", 31))),
  "ward/cap-corner-bl": tile((p) => corner(p, "bottom", 33)),
  "ward/cap-corner-br": tile(mirrored((p) => corner(p, "bottom", 33))),
});
