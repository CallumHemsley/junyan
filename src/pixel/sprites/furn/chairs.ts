/**
 * Chairs with backs, each in the facings the room needs. "down" means the sitter faces the camera
 * (we see the seat and the back behind it); "up" means the sitter faces away (we see the back of
 * the chair); "left" and "right" are the directions the sitter faces.
 *
 * All chairs are 28×50 with the anchor at the front legs, [14, 48]. Seated person (their own
 * anchor, the foot pixel `[16, 62]` of a 32×64 frame) relative to the chair's anchor:
 *   down (0, -4), left (-2, -4), right (+2, -4): draw the sitter after the chair.
 *   up (0, -6): draw the chair after the sitter, so its back covers them.
 * Hips (the middle of the seat surface) are at (0, -20) in every facing.
 */
import { defineSprites, type Legend, type Px } from "../../kit/index.ts";
import { boards, grid, mirrorable, roundCorners, TEA, type Tones } from "./_helpers.ts";

const JADE: Tones = { hi: "jade6", lit: "jade5", base: "jade4", shade: "jade3", deep: "jade2" };
const STEEL: Tones = { hi: "steel6", lit: "steel5", base: "steel4", shade: "steel3", deep: "steel2" };
const BACKSIDE: Tones = { hi: "jade5", lit: "jade4", base: "jade3", shade: "jade3", deep: "jade2" };
const CHIP: Legend = { r: "red3", R: "red2", w: "wood4", W: "wood5" };
const CORD: Legend = { a: "tan2", b: "brown3", c: "brown2", d: "brown1", l: "tan2", L: "tan1", k: "wood2", s: "steel5", p: "blue2" };

const chairDef = { w: 28, h: 50, anchor: [14, 48], foot: [-12, -12, 24, 11], shadow: { rx: 13, ry: 5, dy: -1 } } as const;

/** Seat top and front face, lit from the upper left, shared by every facing. */
function seat(p: Px, t: Tones, x = 2, w = 24) {
  p.rect(x, 23, w, 11, t.base);
  p.hline(x + 1, 23, w - 2, t.lit).hline(x + 2, 23, Math.floor(w / 3), t.hi).vline(x, 24, 9, t.lit).vline(x + w - 1, 24, 10, t.shade).hline(x + 1, 33, w - 2, t.shade);
  p.hline(x, 34, w, t.lit).hline(x, 35, w, t.shade).hline(x, 36, w, t.deep);
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

function paintedDown(p: Px) {
  const L = mirrorable(p, 28, false);
  L.post(3, 37, 4, 11, JADE); L.post(21, 37, 4, 11, JADE);
  p.hline(7, 42, 14, "jade4").hline(7, 43, 14, "jade2");
  L.post(3, 5, 4, 18, JADE); L.post(21, 5, 4, 18, JADE);
  for (const y of [9, 15]) p.rect(7, y, 14, 3, "jade4").hline(7, y, 14, "jade5").hline(7, y + 2, 14, "jade3");
  // Crest rail with eared ends.
  p.rect(1, 1, 26, 2, "jade5").hline(2, 1, 11, "jade6").rect(1, 3, 26, 3, "jade4").hline(1, 5, 26, "jade3").vline(26, 2, 3, "jade3");
  roundCorners(p, 1, 1, 26, 5, 2);
  seat(p, JADE);
  seatWear(p);
  // Chips: knocked off the rail, the slat ends, the seat edge; legs scuffed bare by shoes.
  p.rows(9, 3, [".r", "rw"], CHIP).rows(19, 4, ["rr"], CHIP).rows(7, 16, ["r", "w"], CHIP).rows(15, 34, ["rWr", ".r."], CHIP).rows(3, 24, ["r", "r"], CHIP);
  for (const x of [3, 21]) p.rect(x, 45, 4, 3, "wood4").vline(x + 3, 45, 3, "wood3").hline(x, 44, 4, "red3").px(x + 1, 44, "jade4");
  p.outline("jade1");
}

function paintedUp(p: Px) {
  const L = mirrorable(p, 28, false);
  seat(p, JADE);
  seatWear(p);
  L.post(3, 16, 4, 32, JADE); L.post(21, 16, 4, 32, JADE);
  for (const y of [19, 25]) p.rect(7, y, 14, 3, "jade3").hline(7, y, 14, "jade4").hline(7, y + 2, 14, "jade2");
  p.rect(1, 11, 26, 2, "jade5").hline(2, 11, 11, "jade6").rect(1, 13, 26, 3, "jade3").hline(1, 15, 26, "jade2");
  roundCorners(p, 1, 11, 26, 5, 2);
  // The back of the rail rubbed to red where it is pulled out from the table, a chip on a slat.
  p.rows(11, 11, ["rrrrr", ".rwwr"], CHIP).rows(16, 26, ["rr"], CHIP);
  for (const x of [3, 21]) p.rect(x, 45, 4, 3, "wood4").vline(x + 3, 45, 3, "wood3").hline(x, 44, 4, "red3");
  p.outline("jade1");
}

function paintedSide(p: Px, flip: boolean) {
  const L = mirrorable(p, 28, flip);
  L.post(21, 37, 4, 11, JADE);
  L.rect(6, 42, 15, 1, "jade4"); L.rect(6, 43, 15, 1, "jade2");
  seat(p, JADE);
  seatWear(p);
  // The back seen end-on: the rail's top, its end, and the stile leaning back a little.
  L.grid(1, 1, 4, ["5554", "6554", "6554", "5554", "5554", "5544", "5544", "5544", "5444", "5443", "4443", "4433", "3332"], { "6": "jade6", "5": "jade5", "4": "jade4", "3": "jade3", "2": "jade2" });
  L.post(1, 14, 4, 6, JADE);
  L.post(2, 20, 4, 28, JADE);
  L.rect(6, 6, 1, 16, "jade3");
  for (const y of [9, 15]) L.px(6, y, "jade5");
  L.grid(2, 22, 3, ["rr.", "rw."], CHIP);
  for (const x of [2, 21]) { L.rect(x, 45, 4, 3, "wood4"); L.rect(x, 44, 4, 1, "red3"); }
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

function foldingDown(p: Px) {
  const L = mirrorable(p, 28, false);
  // Rear legs glimpsed under the seat, front legs, and the floor bar of the front U-tube.
  p.rect(5, 37, 2, 3, "steel3").rect(21, 37, 2, 3, "steel2");
  L.post(2, 34, 3, 14, STEEL); L.post(23, 34, 3, 14, STEEL);
  p.rect(5, 44, 18, 2, "steel4").hline(5, 44, 18, "steel5").hline(5, 45, 18, "steel3");
  for (const x of [2, 23]) p.rect(x, 46, 3, 2, "steel1").hline(x, 46, 3, "steel2");
  p.rows(2, 41, ["o", "go"], { o: "orange1", g: "gold1" });
  // Back frame: an upside-down U of tube with the pad between.
  L.post(4, 3, 3, 21, STEEL); L.post(21, 3, 3, 21, STEEL);
  p.rect(5, 1, 18, 1, "steel6").rect(4, 2, 20, 1, "steel5").rect(4, 3, 20, 1, "steel3");
  roundCorners(p, 4, 1, 20, 3, 1);
  pad(p, 7, 5, 14, 11);
  p.hline(10, 12, 5, "plum2").hline(12, 13, 4, "plum2");
  // Seat pad, its split seam with the foam showing, and the steel seat frame.
  pad(p, 3, 23, 22, 12);
  p.rect(3, 34, 22, 2, "plum2").hline(3, 35, 22, "plum1");
  p.rect(2, 36, 24, 1, "steel4");
  grid(p, 15, 28, 8, ["......1.", "....1c1.", "..1cc1..", ".1c1....", "1......."], { "1": "plum1", c: "cream4" });
  p.outline("steel1");
}

function foldingUp(p: Px) {
  const L = mirrorable(p, 28, false);
  pad(p, 3, 23, 22, 12);
  p.rect(3, 34, 22, 2, "plum2").hline(3, 35, 22, "plum1").rect(2, 36, 24, 1, "steel4");
  L.post(4, 13, 3, 35, STEEL); L.post(21, 13, 3, 35, STEEL);
  p.rect(7, 42, 14, 2, "steel4").hline(7, 42, 14, "steel5").hline(7, 43, 14, "steel3");
  for (const x of [4, 21]) p.rect(x, 46, 3, 2, "steel1").hline(x, 46, 3, "steel2");
  p.rect(5, 11, 18, 1, "steel6").rect(4, 12, 20, 1, "steel5").rect(4, 13, 20, 1, "steel3");
  roundCorners(p, 4, 11, 20, 3, 1);
  // The back of the pad: plain vinyl stapled round its edge, scuffed where it hits the wall.
  pad(p, 7, 14, 14, 10, true);
  for (let x = 8; x < 20; x += 3) p.px(x, 15, "steel4").px(x, 22, "steel4");
  p.hline(11, 18, 5, "plum3").hline(12, 19, 3, "plum3");
  p.outline("steel1");
}

function foldingSide(p: Px, flip: boolean) {
  const L = mirrorable(p, 28, flip);
  L.post(22, 34, 3, 14, STEEL);
  L.rect(5, 44, 17, 1, "steel4"); L.rect(5, 45, 17, 1, "steel2");
  pad(p, 3, 23, 22, 12);
  p.rect(3, 34, 22, 2, "plum2").hline(3, 35, 22, "plum1").rect(2, 36, 24, 1, "steel4");
  // The back seen edge-on: the tube, leaning back a pixel, and the pad's thickness beside it.
  L.post(3, 13, 3, 35, STEEL);
  L.post(2, 1, 3, 13, STEEL);
  L.grid(5, 4, 3, ["44.", "333", "433", "433", "433", "433", "433", "433", "433", "433", "433", "433", "333", "22."], { "4": "plum4", "3": "plum3", "2": "plum2" });
  for (const x of [3, 22]) L.rect(x, 46, 3, 2, "steel1");
  p.outline("steel1");
}

// ── the regular's chair, with his jacket on it ───────────────────────────────────────────────

function spindleChairBase(p: Px) {
  const L = mirrorable(p, 28, false);
  L.post(3, 37, 4, 11, TEA); L.post(21, 37, 4, 11, TEA);
  p.hline(7, 41, 14, "wood4").hline(7, 42, 14, "wood2");
  seat(p, TEA);
  boards(p, 2, 23, 24, 11, { dir: "h", seams: [], seed: 91, density: 2 });
  p.over(() => p.hline(9, 30, 10, "wood3").hline(11, 31, 7, "wood3"));
}

/**
 * Colour a jacket from a silhouette mask: corduroy ribs by column, a lit left edge and a shaded
 * right edge on each part. Mask letters: J body, S sleeve, l/L lining, C collar.
 */
function corduroy(p: Px, x0: number, y0: number, mask: readonly string[]) {
  grid(p, x0, y0, 28, mask.map((r) => r.replace(/[JSC]/g, "b").replace(/l/g, "l").replace(/L/g, "L")), CORD);
  mask.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const k = row[i];
      if (k !== "J" && k !== "S" && k !== "C") continue;
      const x = x0 + i, y = y0 + j, left = row[i - 1] ?? ".", right = row[i + 1] ?? ".";
      let c: "tan2" | "brown3" | "brown2" | "brown1" = i % 2 ? "brown2" : "brown3";
      if (k === "C") c = "brown3";
      if (left !== k) c = "tan2";
      else if (right !== k) c = "brown1";
      p.px(x, y, c);
    }
  });
}

function jacketDown(p: Px) {
  const L = mirrorable(p, 28, false);
  spindleChairBase(p);
  L.post(3, 5, 3, 18, TEA); L.post(22, 5, 3, 18, TEA);
  for (const x of [9, 13, 17]) p.rect(x, 7, 2, 16, "wood3").vline(x, 7, 16, "wood4");
  p.rect(1, 2, 26, 4, "wood4").hline(2, 2, 24, "wood5").hline(1, 5, 26, "wood3");
  // The jacket, worn by the chair: front panels open over the spindles, lapels, sleeves down the sides.
  corduroy(p, 0, 0, [
    "......JJJJJJJJJJJJJJJJ......",
    "....JJJJJJJLLLLLLJJJJJJJ....",
    "...JJJJJJJJLllllLJJJJJJJJ...",
    "..SJJJJJJJJJLllLJJJJJJJJJS..",
    ".SSJJJJJJJJJLllLJJJJJJJJJSS.",
    "SSS.JJJJJJJJlllLJJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJlllllLLLJJJJJJ.SSS",
    "SSS.JJJJJJlllllLLLJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SSS.JJJJJJJllllLLJJJJJJJ.SSS",
    "SS..JJJJJJJllllLLJJJJJJJ..SS",
    "SS..JJJJJJJ......JJJJJJJ..SS",
  ]);
  // Lapels, pockets, the pen, buttons, hems and cuffs.
  grid(p, 4, 3, 20, [
    ".......d....d.......",
    "......bd....db......",
    ".....bd......db.....",
    "....bd........db....",
    "...d............d...",
  ], CORD);
  grid(p, 5, 7, 5, ["..s..", "ddsdd", "..p.."], CORD);
  p.hline(5, 16, 5, "brown1").hline(5, 17, 5, "tan2").hline(18, 16, 5, "brown1").hline(18, 17, 5, "tan2");
  for (const y of [10, 14, 18]) p.px(18, y, "wood2").px(18, y - 1, "tan4");
  p.hline(4, 21, 7, "brown1").hline(17, 21, 7, "brown1");
  for (const x of [0, 25]) p.hline(x, 19, 3, "brown1");
  p.outline("wood1");
}

function jacketUp(p: Px) {
  const L = mirrorable(p, 28, false);
  spindleChairBase(p);
  L.post(3, 16, 3, 32, TEA); L.post(22, 16, 3, 32, TEA);
  // The jacket's back: collar turned up, a yoke seam, the centre seam and vent, an elbow patch.
  corduroy(p, 0, 8, [
    ".........CCCCCCCCCC.........",
    "......JJJCCCCCCCCCCJJJ......",
    "....JJJJJJJJJJJJJJJJJJJJ....",
    "...SJJJJJJJJJJJJJJJJJJJJS...",
    "..SSJJJJJJJJJJJJJJJJJJJJSS..",
    ".SSSJJJJJJJJJJJJJJJJJJJJSSS.",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJJJJJJJJJJJJ.SSS",
    "SSS.JJJJJJJJJlLJJJJJJJJJ.SSS",
    "SS..JJJJJJJJJlLJJJJJJJJJ..SS",
    "SS..JJJJJJJJJlLJJJJJJJJJ..SS",
    "SS..JJJJJJJJJ..JJJJJJJJJ..SS",
  ]);
  // Collar edge, yoke seam, centre seam, elbow patch with its stitches, hem and cuffs.
  p.hline(9, 9, 10, "brown1").hline(5, 14, 18, "brown1").hline(5, 15, 18, "tan2");
  p.vline(13, 16, 10, "brown1");
  grid(p, 0, 19, 3, [".d.", "dcd", "dad", "dcd", "dcd", ".d."], CORD);
  p.hline(4, 29, 9, "brown1").hline(15, 29, 9, "brown1");
  for (const x of [0, 25]) p.hline(x, 27, 3, "brown1");
  p.outline("wood1");
}

export default defineSprites({
  /** The repainted chair: somebody painted it jade over its old red years ago, and both coats are wearing through. Facing the camera. */
  "furn/chair-painted-down": { ...chairDef, draw: paintedDown },
  /** The repainted chair from behind: the top rail rubbed to red where hands pull it out. */
  "furn/chair-painted-up": { ...chairDef, draw: paintedUp },
  /** The repainted chair, sitter facing left. */
  "furn/chair-painted-left": { ...chairDef, draw: (p) => paintedSide(p, true) },
  /** The repainted chair, sitter facing right. */
  "furn/chair-painted-right": { ...chairDef, draw: (p) => paintedSide(p, false) },

  /** A plum vinyl folding chair borrowed from the neighbourhood committee and never returned: the seat seam has split to the foam and one foot is rusting. Facing the camera. */
  "furn/chair-folding-down": { ...chairDef, draw: foldingDown },
  /** The folding chair from behind: the pad's plain back, stapled round its edge. */
  "furn/chair-folding-up": { ...chairDef, draw: foldingUp },
  /** The folding chair, sitter facing left. */
  "furn/chair-folding-left": { ...chairDef, draw: (p) => foldingSide(p, true) },
  /** The folding chair, sitter facing right. */
  "furn/chair-folding-right": { ...chairDef, draw: (p) => foldingSide(p, false) },

  /** Old Mr Liu's spindle-back chair, his brown corduroy jacket on it with a pen in the pocket, keeping his place while he fetches more tea. Facing the camera. */
  "furn/chair-jacket-down": { ...chairDef, draw: jacketDown },
  /** Mr Liu's chair from behind: the jacket's back, the collar turned up, a suede patch on the elbow. */
  "furn/chair-jacket-up": { ...chairDef, draw: jacketUp },
});
