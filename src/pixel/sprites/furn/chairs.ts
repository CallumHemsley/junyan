/**
 * Chairs with backs, each in the facings the room needs. "down" means the sitter faces the camera
 * (we see the seat and the back behind it); "up" means the sitter faces away (we see the back of
 * the chair); "left" and "right" are the directions the sitter faces. Side views take the Stardew
 * cheat: the back is turned a little toward us so a sliver of its face shows.
 *
 * All chairs are 28×45 with the anchor at the front legs, [14, 43]. Seated person (their own
 * anchor, the foot pixel `[16, 62]` of a 32×64 frame) relative to the chair's anchor:
 *   down (0, -4), left (-2, -4), right (+2, -4): draw the sitter after the chair.
 *   up (0, -6): draw the chair after the sitter, so its back covers them.
 * Hips (the middle of the seat surface) are at (0, -20) in every facing. The backs stand about
 * 16px above the seat, so a seated person's shoulders and head clear them.
 */
import { defineSprites, Px, type Color, type Legend } from "../../kit/index.ts";
import { boards, grid, mirrorable, roundCorners, TEA, type Tones } from "./_helpers.ts";

const JADE: Tones = { hi: "jade6", lit: "jade5", base: "jade4", shade: "jade3", deep: "jade2" };
const STEEL: Tones = { hi: "steel6", lit: "steel5", base: "steel4", shade: "steel3", deep: "steel2" };
const CHIP: Legend = { r: "red3", R: "red2", w: "wood4", W: "wood5" };

const chairDef = { w: 28, h: 45, anchor: [14, 43], foot: [-12, -12, 24, 11], shadow: { rx: 13, ry: 5, dy: -1 } } as const;

/** Chairs are laid out on a 28×50 board and cropped 5px from the top. */
const cropped = (draw: (p: Px) => void) => (p: Px) => {
  const board = new Px(28, 50);
  draw(board);
  p.blit(board, 0, -5);
};

/** Seat top and front face, lit from the upper left, shared by every facing. */
function seat(p: Px, t: Tones, x = 2, w = 24) {
  p.rect(x, 23, w, 11, t.base);
  p.hline(x + 1, 23, w - 2, t.lit).hline(x + 2, 23, Math.floor(w / 3), t.hi).vline(x, 24, 9, t.lit).vline(x + w - 1, 24, 10, t.shade).hline(x + 1, 33, w - 2, t.shade);
  p.hline(x, 34, w, t.lit).hline(x, 35, w, t.shade).hline(x, 36, w, t.deep);
}

/**
 * The turned-back cheat for side views: the near stile, a sliver of the back's face with its
 * cross pieces, the far stile, and the top rail as a cap. The face is shaded when the sitter faces
 * right (it looks east, away from the sun) and lit when they face left.
 */
function sideBack(L: ReturnType<typeof mirrorable>, o: { top: number; t: Tones; bars: readonly number[]; barH: number; between: Color; cap: Tones }) {
  const face = L.flip ? { lit: o.t.hi, base: o.t.lit, deep: o.t.base } : { lit: o.t.lit, base: o.t.base, deep: o.t.shade };
  // Far stile, the face, then the near stile running down to the floor as the front leg.
  L.rect(8, o.top + 2, 1, 23 - o.top - 1, o.t.deep);
  L.rect(5, o.top + 3, 3, 23 - o.top - 2, o.between);
  for (const y of o.bars) {
    L.rect(5, y, 3, o.barH, face.base);
    L.rect(5, y, 3, 1, face.lit);
    L.rect(5, y + o.barH - 1, 3, 1, face.deep);
    L.px(8, y, o.t.shade);
  }
  L.post(2, o.top + 2, 3, 48 - o.top - 2, o.t);
  L.grid(1, o.top, 9, ["455555543", "566665543", "344444332"], { "6": o.cap.hi, "5": o.cap.lit, "4": o.cap.base, "3": o.cap.shade, "2": o.cap.deep });
}

// ── the repainted chair ──────────────────────────────────────────────────────────────────────

/** Paint worn through the jade to the old red, and the red to bare wood, in the middle of the seat. */
function seatWear(p: Px, top = 26) {
  grid(p, 8, top, 12, [
    "...ggggg....",
    ".ggrrrrrgg..",
    "grrwwWWwrrg.",
    ".grrwwwwwrgg",
    "..ggrrrrrg..",
    "....gggg....",
  ], { ...CHIP, g: "jade3" });
}

function scuffedFeet(p: Px, xs: readonly number[]) {
  for (const x of xs) p.rect(x, 45, 4, 3, "wood4").vline(x + 3, 45, 3, "wood3").hline(x, 44, 4, "red3").px(x + 1, 44, "jade4");
}

function paintedDown(p: Px) {
  const L = mirrorable(p, 28, false);
  L.post(3, 37, 4, 11, JADE); L.post(21, 37, 4, 11, JADE);
  p.hline(7, 42, 14, "jade4").hline(7, 43, 14, "jade2");
  L.post(3, 11, 4, 12, JADE); L.post(21, 11, 4, 12, JADE);
  for (const y of [13, 18]) p.rect(7, y, 14, 3, "jade4").hline(7, y, 14, "jade5").hline(7, y + 2, 14, "jade3");
  // Crest rail with eared ends.
  p.rect(1, 7, 26, 2, "jade5").hline(2, 7, 11, "jade6").rect(1, 9, 26, 2, "jade4").hline(1, 10, 26, "jade3").vline(26, 8, 2, "jade3");
  roundCorners(p, 1, 7, 26, 4, 2);
  seat(p, JADE);
  seatWear(p);
  // Chips: knocked off the rail and a slat end, the seat edge; legs scuffed bare by shoes.
  p.rows(9, 9, [".r", "rw"], CHIP).rows(19, 10, ["rr"], CHIP).rows(7, 19, ["r", "w"], CHIP).rows(15, 34, ["rWr", ".r."], CHIP);
  scuffedFeet(p, [3, 21]);
  p.outline("jade1");
}

function paintedUp(p: Px) {
  const L = mirrorable(p, 28, false);
  seat(p, JADE);
  seatWear(p);
  L.post(3, 20, 4, 28, JADE); L.post(21, 20, 4, 28, JADE);
  for (const y of [23, 28]) p.rect(7, y, 14, 3, "jade3").hline(7, y, 14, "jade4").hline(7, y + 2, 14, "jade2");
  p.rect(1, 16, 26, 2, "jade5").hline(2, 16, 11, "jade6").rect(1, 18, 26, 2, "jade3").hline(1, 19, 26, "jade2");
  roundCorners(p, 1, 16, 26, 4, 2);
  // The back of the rail rubbed to red where it is pulled out from the table, a chip on a slat.
  p.rows(11, 16, ["rrrrr", ".rwwr"], CHIP).rows(16, 29, ["rr"], CHIP);
  scuffedFeet(p, [3, 21]);
  p.outline("jade1");
}

function paintedSide(p: Px, flip: boolean) {
  const L = mirrorable(p, 28, flip);
  L.post(21, 37, 4, 11, JADE);
  L.rect(6, 42, 15, 1, "jade4"); L.rect(6, 43, 15, 1, "jade2");
  seat(p, JADE);
  seatWear(p);
  sideBack(L, { top: 7, t: JADE, bars: [12, 17], barH: 3, between: "jade2", cap: JADE });
  L.grid(1, 7, 3, ["rr.", "rw."], CHIP);
  for (const x of [2, 21]) { L.rect(x, 45, 3, 3, "wood4"); L.rect(x, 44, 3, 1, "red3"); }
  p.outline("jade1");
}

// ── the folding chair ────────────────────────────────────────────────────────────────────────

/** Plum vinyl pad, lit at the top left, with a sheen and creases. */
function pad(p: Px, x: number, y: number, w: number, h: number, back = false) {
  p.rect(x, y, w, h, back ? "plum2" : "plum3");
  if (!back) {
    p.hline(x + 1, y, w - 2, "plum4").vline(x, y + 1, h - 2, "plum4").hline(x + 2, y + 1, Math.floor(w / 3), "pink3");
    p.vline(x + w - 1, y + 1, h - 1, "plum2").hline(x + 1, y + h - 1, w - 1, "plum2");
  } else {
    p.hline(x + 1, y, w - 2, "plum3").vline(x + w - 1, y, h, "plum1").hline(x, y + h - 1, w, "plum1");
  }
  roundCorners(p, x, y, w, h, 2);
}

function foldingSeat(p: Px) {
  pad(p, 3, 23, 22, 12);
  p.rect(3, 34, 22, 2, "plum2").hline(3, 35, 22, "plum1");
  p.rect(2, 36, 24, 1, "steel4");
}

function foldingDown(p: Px) {
  const L = mirrorable(p, 28, false);
  // Rear legs glimpsed under the seat, front legs, and the floor bar of the front U-tube.
  p.rect(5, 37, 2, 3, "steel3").rect(21, 37, 2, 3, "steel2");
  L.post(2, 34, 3, 14, STEEL); L.post(23, 34, 3, 14, STEEL);
  p.rect(5, 44, 18, 2, "steel4").hline(5, 44, 18, "steel5").hline(5, 45, 18, "steel3");
  for (const x of [2, 23]) p.rect(x, 46, 3, 2, "steel1").hline(x, 46, 3, "steel2");
  p.rows(2, 41, ["o", "go"], { o: "orange1", g: "gold1" });
  // Back frame: an upside-down U of tube with the pad between.
  L.post(4, 9, 3, 15, STEEL); L.post(21, 9, 3, 15, STEEL);
  p.rect(5, 7, 18, 1, "steel6").rect(4, 8, 20, 1, "steel5").rect(4, 9, 20, 1, "steel3");
  roundCorners(p, 4, 7, 20, 3, 1);
  pad(p, 7, 11, 14, 10);
  p.hline(10, 17, 5, "plum2").hline(12, 18, 4, "plum2");
  // Seat pad, its split seam with the foam showing.
  foldingSeat(p);
  grid(p, 15, 28, 8, ["......1.", "....1c1.", "..1cc1..", ".1c1....", "1......."], { "1": "plum1", c: "cream4" });
  p.outline("steel1");
}

function foldingUp(p: Px) {
  const L = mirrorable(p, 28, false);
  foldingSeat(p);
  L.post(4, 19, 3, 29, STEEL); L.post(21, 19, 3, 29, STEEL);
  p.rect(7, 42, 14, 2, "steel4").hline(7, 42, 14, "steel5").hline(7, 43, 14, "steel3");
  for (const x of [4, 21]) p.rect(x, 46, 3, 2, "steel1").hline(x, 46, 3, "steel2");
  p.rect(5, 17, 18, 1, "steel6").rect(4, 18, 20, 1, "steel5").rect(4, 19, 20, 1, "steel3");
  roundCorners(p, 4, 17, 20, 3, 1);
  // The back of the pad: plain vinyl stapled round its edge, scuffed where it hits the wall.
  pad(p, 7, 20, 14, 8, true);
  for (let x = 8; x < 20; x += 3) p.px(x, 21, "steel4").px(x, 26, "steel4");
  p.hline(11, 23, 5, "plum3").hline(12, 24, 3, "plum3");
  p.outline("steel1");
}

function foldingSide(p: Px, flip: boolean) {
  const L = mirrorable(p, 28, flip);
  L.post(22, 34, 3, 14, STEEL);
  L.rect(5, 44, 17, 1, "steel4"); L.rect(5, 45, 17, 1, "steel2");
  foldingSeat(p);
  // The back turned a little toward us: the near tube, a sliver of the pad's face, the far tube.
  const face = flip ? { lit: "pink3", base: "plum4", deep: "plum3" } as const : { lit: "plum4", base: "plum3", deep: "plum2" } as const;
  L.rect(9, 9, 1, 15, "steel3");
  L.rect(5, 10, 4, 11, face.base); L.rect(5, 10, 4, 1, face.lit); L.rect(5, 20, 4, 1, face.deep); L.rect(8, 11, 1, 9, face.deep);
  L.px(6, 12, face.lit); L.px(6, 13, face.lit);
  L.post(2, 9, 3, 39, STEEL);
  L.grid(2, 7, 8, [".555555.", "54444443"], { "5": "steel5", "4": "steel4", "3": "steel3" });
  for (const x of [2, 22]) L.rect(x, 46, 3, 2, "steel1");
  p.outline("steel1");
}

// ── the regular's chair, with his jacket on it ───────────────────────────────────────────────

const JACKET: Legend = { J: "brown3", S: "brown3", C: "brown2", l: "tan1", a: "tan2", d: "brown1", k: "wood2", s: "steel5", p: "blue2", t: "tan2" };

/**
 * Colour a corduroy jacket from a silhouette mask: one warm brown with a lit left edge and a
 * shaded right edge on each part, and the cord suggested by a few broken vertical ticks.
 * Mask letters: J body, S sleeve, C collar, l lining, a lapel facing, d seam or edge.
 */
function corduroy(p: Px, x0: number, y0: number, mask: readonly string[]) {
  grid(p, x0, y0, 28, mask, JACKET);
  mask.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const k = row[i];
      if (k !== "J" && k !== "S") continue;
      const x = x0 + i, y = y0 + j, left = row[i - 1] ?? ".", right = row[i + 1] ?? ".", below = mask[j + 1]?.[i] ?? ".";
      if (left !== k) p.px(x, y, "tan2");
      else if (right !== k) p.px(x, y, "brown2");
      else if ((i * 5 + Math.floor(j / 2) * 3) % 13 === 0 && below === k) p.px(x, y, "brown2").px(x, y + 1, "brown2");
    }
  });
}

function spindleChairBase(p: Px) {
  const L = mirrorable(p, 28, false);
  L.post(3, 37, 4, 11, TEA); L.post(21, 37, 4, 11, TEA);
  p.hline(7, 41, 14, "wood4").hline(7, 42, 14, "wood2");
  seat(p, TEA);
  boards(p, 2, 23, 24, 11, { dir: "h", seams: [], seed: 91, density: 2 });
  p.over(() => p.hline(9, 30, 10, "wood3").hline(11, 31, 7, "wood3"));
}

function jacketDown(p: Px) {
  const L = mirrorable(p, 28, false);
  spindleChairBase(p);
  L.post(3, 11, 3, 12, TEA); L.post(22, 11, 3, 12, TEA);
  for (const x of [9, 13, 17]) p.rect(x, 12, 2, 11, "wood3").vline(x, 12, 11, "wood4");
  p.rect(1, 8, 26, 4, "wood4").hline(2, 8, 24, "wood5").hline(1, 11, 26, "wood3");
  // The jacket, worn by the chair: shoulders over the rail, a collar, clean lapels to a V, the
  // fronts buttoned below, sleeves hanging down the sides with one fold each.
  corduroy(p, 0, 6, [
    "......JJJJJJJJJJJJJJJJ......",
    "....JJJJJJCCCCCCCCJJJJJJ....",
    "...JJJJJJCClllllllCJJJJJ....".slice(0, 27) + ".",
    "..SJJJJJJaCllllllCaJJJJJS...".slice(0, 27) + ".",
    ".SSJJJJJJJaallllaaJJJJJJSS..".slice(0, 27) + ".",
    "SSSJJJJJJJJaallaaJJJJJJJSSS.",
    "SSS.JJJJJJJJaddaJJJJJJJ.SSS.",
    "SSS.JJJJJJJJJdJJJJJJJJJ.SSS.",
    "SSd.JJJJJJJJJdJJJJJJJJJ.dSS.",
    "SdS.JJJJJJJJJdJJJJJJJJJ.SdS.",
    "dSS.JJJJJJJJJdJJJJJJJJJ.SSd.",
    "SSS.JJJJJJJJJdJJJJJJJJJ.SSS.",
    "SSS.JJJJJJJJJdJJJJJJJJJ.SSS.",
    "SSS.JJJJJJJJJdJJJJJJJJJ.SSS.",
    "ddd.JJJJJJJJJdJJJJJJJJJ.ddd.",
    "....JJJJJJJJJdJJJJJJJJJ.....",
    "....ddddddddddddddddddd.....",
  ]);
  // Breast pocket with the pen, flap pockets, buttons down the placket.
  grid(p, 5, 13, 5, ["..s..", "ddsdd", "..p.."], JACKET);
  p.hline(5, 18, 5, "brown1").hline(5, 19, 5, "tan2").hline(16, 18, 5, "brown1").hline(16, 19, 5, "tan2");
  for (const y of [13, 16, 19]) p.px(14, y, "wood2").px(14, y - 1, "tan2");
  p.outline("wood1");
}

function jacketUp(p: Px) {
  const L = mirrorable(p, 28, false);
  spindleChairBase(p);
  L.post(3, 20, 3, 28, TEA); L.post(22, 20, 3, 28, TEA);
  // The jacket's back: collar turned down, shoulders, one centre seam, sleeves with a fold, an
  // elbow patch.
  corduroy(p, 0, 15, [
    ".........CCCCCCCCCC.........",
    "......JJJCCCCCCCCCCJJJ......",
    "....JJJJJJJJJJJJJJJJJJJJ....",
    "...SJJJJJJJJJJJJJJJJJJJJS...",
    "..SSJJJJJJJJJJJJJJJJJJJJSS..",
    ".SSSJJJJJJJJJJJJJJJJJJJJSSS.",
    "SSS.JJJJJJJJJdJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJdJJJJJJJJJJ.SSS",
    "SSd.JJJJJJJJJdJJJJJJJJJJ.dSS",
    "SdS.JJJJJJJJJdJJJJJJJJJJ.SdS",
    "dSS.JJJJJJJJJdJJJJJJJJJJ.SSd",
    "SSS.JJJJJJJJJdJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJdJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJdJJJJJJJJJJ.SSS",
    "ddd.JJJJJJJJJdJJJJJJJJJJ.ddd",
    "....JJJJJJJJJlJJJJJJJJJJ....",
    "....JJJJJJJJJlJJJJJJJJJJ....",
    "....dddddddddddddddddddd....",
  ]);
  p.hline(9, 15, 10, "tan2").hline(9, 16, 10, "brown1");
  grid(p, 0, 26, 3, [".d.", "dCd", "dCd", ".d."], JACKET);
  p.outline("wood1");
}

export default defineSprites({
  /** The repainted chair: somebody painted it jade over its old red years ago, and both coats are wearing through. Facing the camera. */
  "furn/chair-painted-down": { ...chairDef, draw: cropped(paintedDown) },
  /** The repainted chair from behind: the top rail rubbed to red where hands pull it out. */
  "furn/chair-painted-up": { ...chairDef, draw: cropped(paintedUp) },
  /** The repainted chair, sitter facing left: the back turned toward us shows its lit slats. */
  "furn/chair-painted-left": { ...chairDef, draw: cropped((p) => paintedSide(p, true)) },
  /** The repainted chair, sitter facing right: the back's slats in shade. */
  "furn/chair-painted-right": { ...chairDef, draw: cropped((p) => paintedSide(p, false)) },

  /** A plum vinyl folding chair borrowed from the neighbourhood committee and never returned: the seat seam has split to the foam and one foot is rusting. Facing the camera. */
  "furn/chair-folding-down": { ...chairDef, draw: cropped(foldingDown) },
  /** The folding chair from behind: the pad's plain back, stapled round its edge. */
  "furn/chair-folding-up": { ...chairDef, draw: cropped(foldingUp) },
  /** The folding chair, sitter facing left: a sliver of the lit pad shows. */
  "furn/chair-folding-left": { ...chairDef, draw: cropped((p) => foldingSide(p, true)) },
  /** The folding chair, sitter facing right: a sliver of the pad shows, in shade. */
  "furn/chair-folding-right": { ...chairDef, draw: cropped((p) => foldingSide(p, false)) },

  /** Old Mr Liu's spindle-back chair, his brown corduroy jacket on it with a pen in the pocket, keeping his place while he fetches more tea. Facing the camera. */
  "furn/chair-jacket-down": { ...chairDef, draw: cropped(jacketDown) },
  /** Mr Liu's chair from behind: the jacket's back, the collar turned down, a suede patch on the elbow. */
  "furn/chair-jacket-up": { ...chairDef, draw: cropped(jacketUp) },
});
