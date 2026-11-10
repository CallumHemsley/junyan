/**
 * Wall caps: the tops of the side and front walls, seen from above, as 32×32 tiles.
 * One profile everywhere: a dark outer edge, a tea-wood top plate, a dusky lime-plaster core, a lipped
 * inner plate that catches the sun, and a dark inner edge against the floor. Outside is void (`ink`).
 * They are deliberately quiet and dark: they frame the picture.
 *
 * Side caps fill the inner 16px of their tile; the front cap fills the top 10 rows. Corners mitre the
 * profiles together: `tl`/`tr` meet the back wall's own cap (rows 0–5 of every wall slice), `bl`/`br`
 * turn the side caps into the front cap. Door jambs end the front cap at a squared timber door post,
 * its end grain showing, for a two-tile (64px) doorway between them. Tiles anchor at their top-left.
 */
import { defineSprites, type Color, Px } from "../../kit/index.ts";
import { BACK_PROFILE, CAP, FRONT_PROFILE, SIDE_PROFILE, block, capTexture } from "./_helpers.ts";

const paint = (letter: string) => CAP[letter] as Color;
const tile = (draw: (p: Px) => void) => ({ w: 32, h: 32, anchor: [0, 0] as const, layer: "floor" as const, draw });
const mirrored = (draw: (p: Px) => void) => (p: Px) => { const q = new Px(32, 32); draw(q); p.blit(q, 0, 0, { flipX: true }); };

/** A left-hand side cap: void, then the profile across x 16–31, running down the tile. */
function sideCap(p: Px, seed: number) {
  p.rect(0, 0, 16, 32, "ink");
  for (let y = 0; y < 32; y++) for (let i = 0; i < 16; i++) p.px(16 + i, y, paint(capTexture(SIDE_PROFILE[i], y, i, seed)));
}
/** The front cap: the profile down rows 0–9 (inner edge at the top), void below. */
function frontCap(p: Px, seed: number, from = 0, to = 32) {
  p.rect(0, 10, 32, 22, "ink");
  for (let x = from; x < to; x++) for (let y = 0; y < 10; y++) p.px(x, y, paint(capTexture(FRONT_PROFILE[y], x, y, seed)));
}

/** A joint across a side cap's timber plates at row `y`, with a nail either side. */
function sideJoint(p: Px, y: number) {
  for (let i = 1; i < 14; i++) p.px(16 + i, y, "wood1");
  p.px(19, y - 2, "wood3").px(27, y + 2, "wood3");
}
function frontJoint(p: Px, x: number) {
  for (let y = 2; y < 9; y++) p.px(x, y, "wood1");
  p.px(x - 2, 4, "wood3").px(x + 2, 6, "wood3");
}

const LEFT = [
  (p: Px) => sideCap(p, 1),
  /** A scarf joint where two lengths of top plate meet, and a hairline crack in the plaster core. */
  (p: Px) => {
    sideCap(p, 2);
    sideJoint(p, 13);
    block(p, 22, 18, ["q.", "q.", ".q", ".q", "q."], CAP, "crack");
  },
  /** A chip knocked out of the lit edge by a ladder. */
  (p: Px) => {
    sideCap(p, 3);
    p.px(30, 22, "wood2").px(30, 23, "wood2").px(30, 24, "wood1").px(29, 24, "wood1");
  },
];

const FRONT = [
  (p: Px) => frontCap(p, 11),
  /** A joint in the top plate, nailed. */
  (p: Px) => { frontCap(p, 12); frontJoint(p, 19); },
  /** The plaster core cracked across where the street door slams. */
  (p: Px) => {
    frontCap(p, 13);
    block(p, 8, 4, ["qq.........", "..qq.......", "....qqq....", ".......qq..", ".........qq"], CAP, "crack");
  },
];

/**
 * Mitred corner. The side cap runs down x 16–31; `other` is the back cap (rows 0–5, meeting at
 * the top) or the front cap (rows 0–9, turning right at the bottom). The mitre runs from the outer
 * corner to the inner one so both profiles turn the corner without a seam.
 */
function corner(p: Px, kind: "top" | "bottom", seed: number) {
  p.rect(0, 0, 32, 32, "ink");
  for (let y = 0; y < 32; y++) for (let x = 16; x < 32; x++) {
    const i = x - 16;
    let letter: string | undefined;
    if (kind === "top") {
      // Back cap above the mitre line from (16,0) to (31,5).
      letter = y < 6 && y * 3 < i ? BACK_PROFILE[y] : SIDE_PROFILE[i];
    } else {
      // Front cap below the mitre line from (31,0) to (16,9); the side cap stops at the front's outer edge.
      if (y > 9) continue;
      letter = y * 15 > (15 - i) * 9 ? FRONT_PROFILE[y] : SIDE_PROFILE[i];
    }
    p.px(x, y, paint(capTexture(letter, kind === "top" ? y : x, i, seed)));
  }
}

/** The front cap ending at the door post. The post's top shows its end grain; its front face drops below. */
function doorJamb(p: Px) {
  frontCap(p, 21, 0, 22);
  block(p, 22, 0, [
    "1111111111",
    "1554444431",
    "1543333431",
    "1434444331",
    "1434224331",
    "1434444331",
    "1433333331",
    "1344444331",
    "1111111111",
    "1332222221",
    "1332222221",
    "1322222221",
    "1322222211",
    "1111111111",
  ], CAP, "door-post");
  // A brass hinge pin still in the post from the door that was taken off in summer.
  block(p, 21, 10, ["gG", "gG"], { g: "gold3", G: "gold1" }, "hinge");
}

export default defineSprites({
  "wall/cap-left": tile(LEFT[0]),
  "wall/cap-left-b": tile(LEFT[1]),
  "wall/cap-left-c": tile(LEFT[2]),
  "wall/cap-right": tile(mirrored(LEFT[0])),
  "wall/cap-right-b": tile(mirrored(LEFT[1])),
  "wall/cap-right-c": tile(mirrored(LEFT[2])),
  "wall/cap-front": tile(FRONT[0]),
  "wall/cap-front-b": tile(FRONT[1]),
  "wall/cap-front-c": tile(FRONT[2]),
  "wall/cap-corner-tl": tile((p) => corner(p, "top", 31)),
  "wall/cap-corner-tr": tile(mirrored((p) => corner(p, "top", 31))),
  "wall/cap-corner-bl": tile((p) => corner(p, "bottom", 33)),
  "wall/cap-corner-br": tile(mirrored((p) => corner(p, "bottom", 33))),
  "wall/cap-door-left": tile(doorJamb),
  "wall/cap-door-right": tile(mirrored(doorJamb)),
});
