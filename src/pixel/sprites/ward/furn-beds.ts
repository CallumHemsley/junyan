/**
 * The ward's two beds and their blankets, on the shared bed geometry in
 * `docs/design/pixel-contracts.md` (see `BED` in `_furn.ts`). Every sprite here is 48×96 with its
 * anchor at the foot end's floor line, [24, 94]; the head is at the top.
 *
 * The beds are the same 1980s model, white-enamelled steel tube with mint panels, a crank at the
 * foot to raise the backrest and a chart clip hanging from the foot rail. What differs is use:
 * the player's bed was made up this morning for someone new; the elder's has been his for weeks.
 *
 * Blankets are drawn over the occupant, so scenes sort them just in front of the bed and its sleeper.
 * They are transparent except for the blanket: lying covers y 34–76, sitting y 44–76.
 */
import { defineSprites, Px, type Color } from "../../kit/index.ts";
import { BED, ENAMEL, grid, hTube, roundCorners, SHEET, step, vTube } from "./_furn.ts";

type Who = "player" | "elder";
const MINT = { hi: "jade6", base: "jade5", shade: "jade4", deep: "jade3" } as const;
const BED_SPRITE = { w: BED.w, h: BED.h, anchor: BED.anchor, foot: [-23, -54, 46, 54] as const, shadow: { rx: 23, ry: 4, dy: -1 } };

// ── the frame ───────────────────────────────────────────────────────────────

/** A pressed enamel panel: mint, lit at the top left, a pressed inset, shaded at the right. */
function panel(p: Px, x: number, y: number, w: number, h: number) {
  p.rect(x, y, w, h, MINT.base);
  p.hline(x, y, w, MINT.hi).vline(x, y, h, MINT.hi);
  p.vline(x + w - 1, y + 1, h - 1, MINT.shade).hline(x + 1, y + h - 1, w - 1, MINT.deep);
  // The pressed inset: a groove shaded on its top and left, lit on its bottom and right.
  const ix = x + 4, iy = y + 3, iw = w - 8, ih = h - 6;
  if (ih < 2) return;
  p.hline(ix, iy, iw, MINT.shade).vline(ix, iy, ih, MINT.shade);
  p.hline(ix + 1, iy + ih - 1, iw - 1, MINT.hi).vline(ix + iw - 1, iy + 1, ih - 1, MINT.hi);
}

/** A post's ball finial, 3×3, sitting on a tube at (x, y). */
function finial(p: Px, x: number, y: number) {
  grid(p, x, y, 3, [".W.", "WEe", "eEd"], { W: "white", E: "steel5", e: "steel4", d: "steel3" });
}

/** A collar where two tubes join: a darker ring with a lit lip. */
function collar(p: Px, x: number, y: number) {
  p.hline(x, y, 3, "steel3").hline(x, y + 1, 3, "steel6");
}

/** The headboard of a flat bed: posts with finials, a top rail and the mint panel. */
function headboard(p: Px, who: Who) {
  vTube(p, 1, 2, 20, ENAMEL);
  vTube(p, 44, 2, 20, ENAMEL);
  finial(p, 1, 0);
  finial(p, 44, 0);
  // The top rail bows up in a shallow arch; the mint panel fills under it.
  panel(p, 4, 5, 40, 13);
  for (let x = 4; x < 44; x++) {
    const t = (x + 0.5 - 24) / 20, y = 2 + Math.round(2 * t * t);
    for (let yy = y + 3; yy < 6; yy++) p.px(x, yy, MINT.hi);
    p.px(x, y, ENAMEL.lit).px(x, y + 1, ENAMEL.base).px(x, y + 2, ENAMEL.deep);
  }
  if (who === "player") {
    // A chrome holder with a blank name card, put in this morning. DOM overlay area: x 20–27, y 9–12.
    p.frame(19, 8, 10, 6, "steel4").hline(19, 8, 10, "steel6");
    p.rect(20, 9, 8, 4, "white").hline(20, 12, 8, "cream4");
  } else {
    // Where the enamel has chipped at the corners and round the old card holder's screw holes.
    grid(p, 5, 6, 4, ["dd..", "d3..", "...."], { d: "steel2", "3": "steel3" });
    grid(p, 38, 17, 5, ["..33.", ".3dd3"], { d: "steel2", "3": "steel3" });
    p.px(20, 9, "steel2").px(27, 9, "steel2");
  }
}

/** Side rails: flat enamelled bars along the mattress edges, under the sheet's overhang. */
function sideRails(p: Px, from: number, to: number) {
  p.rect(1, from, 3, to - from, "steel5").vline(1, from, to - from, "steel6").vline(3, from, to - from, "steel3");
  p.rect(44, from, 3, to - from, "steel5").vline(44, from, to - from, "steel6").vline(46, from, to - from, "steel3");
  collar(p, 1, from);
  collar(p, 44, from);
}

/** A swivel castor under a post at x: chrome fork and a grey rubber wheel, the brake tab on `brake`. */
function castor(p: Px, x: number, brake: "left" | "right" | null, rust: boolean) {
  grid(p, x, 88, 4, [
    "deed",
    ".ed.",
    "rRRr",
    "rhRr",
    "rRRr",
    ".rr.",
  ], { d: "steel2", e: "steel4", r: "stone1", R: "stone2", h: "steel4" });
  if (brake === "right") grid(p, x + 4, 90, 3, ["ee.", "eed"], { e: "steel4", d: "steel2" });
  if (brake === "left") grid(p, x - 3, 90, 3, [".ee", "dee"], { e: "steel4", d: "steel2" });
  if (rust) p.px(x + 1, 88, "orange1").px(x + 2, 89, "orange1");
}

/**
 * The foot end, below the mattress: the foot rail, the foot panel, posts, castors and the crank.
 * The crank's handle folds down out of the way when the bed is flat and swings out when raised.
 */
function footEnd(p: Px, who: Who, raised: boolean) {
  const old = who === "elder";
  panel(p, 4, 81, 40, 8);
  hTube(p, 1, 78, 46, ENAMEL);
  vTube(p, 1, 76, 13, ENAMEL);
  vTube(p, 44, 76, 13, ENAMEL);
  collar(p, 1, 76);
  collar(p, 44, 76);
  castor(p, 0, "right", false);
  castor(p, 44, null, old);
  if (old) {
    // Chips on the foot panel where visitors' chairs have knocked it.
    grid(p, 39, 86, 4, [".33.", "3dd3"], { d: "steel2", "3": "steel3" });
    p.px(5, 87, "steel2").px(6, 87, "steel3");
  } else {
    // The hospital's inventory tag, a small blank aluminium plate riveted on.
    p.rect(6, 83, 6, 3, "steel5").hline(6, 85, 6, "steel3").px(6, 83, "steel6").px(11, 83, "steel3");
  }
  // The crank: a chrome boss on the panel and its folding handle.
  grid(p, 35, 83, 4, [".ee.", "eWe3", ".33."], { e: "steel5", W: "white", "3": "steel3" });
  if (raised) {
    // Swung out after cranking: the arm angles down to the right, the grip points at us.
    p.line(37, 85, 41, 89, "steel4").line(38, 85, 42, 89, "steel2");
    grid(p, 40, 89, 4, [".kk.", "kKkk", ".kk."], { k: "ink2", K: "steel3" });
  } else {
    // Folded flat: the arm hangs straight down, its grip just above the floor.
    p.vline(36, 86, 4, "steel5").vline(37, 86, 4, "steel3");
    grid(p, 35, 90, 3, ["kKk", "kkk"], { k: "ink2", K: "steel3" });
  }
}

/**
 * The bed-end chart in its clipboard, hung on the foot rail by a hook. Blank: ruled lines only.
 * DOM overlay area, if the scene wants one: x 20–26, y 82–89.
 */
function chart(p: Px, who: Who) {
  const old = who === "elder";
  // The board, then the paper.
  p.rect(18, 79, 11, 13, "oak3").vline(18, 79, 13, "oak4").vline(28, 79, 13, "oak2").hline(18, 91, 11, "oak1");
  if (old) {
    // Weeks of notes: a thick wad, the top sheets curled, a pencil on a string.
    p.rect(19, 81, 9, 10, "cream3");
    p.rect(19, 80, 9, 10, "cream4");
    p.rect(19, 80, 8, 9, "cream5");
    grid(p, 25, 87, 3, ["..4", ".43", "433"], { "4": "cream4", "3": "cream2" });
    for (const y of [83, 85, 87]) p.hline(20, y, y === 87 ? 4 : 6, "stone4");
    p.px(18, 83, "stone2").line(17, 84, 15, 90, "stone3");
    grid(p, 14, 90, 2, ["gg", "gg", "oo", "ii"], { g: "gold3", o: "gold1", i: "ink2" });
  } else {
    // One clean sheet, this morning's.
    p.rect(19, 80, 9, 10, "white").vline(27, 80, 10, "cream4").hline(19, 89, 9, "cream4");
    for (const y of [83, 85, 87]) p.hline(20, y, y === 83 ? 6 : 5, "steel4");
  }
  // The chrome clip and the hook it hangs from.
  grid(p, 20, 77, 7, ["..ddd..", ".eWWee.", "deeeee3"], { d: "steel2", e: "steel4", W: "white", "3": "steel3" });
}

/** The elder's own towel, faded pink with a white band, folded over the foot rail to dry. */
function towel(p: Px) {
  grid(p, 5, 77, 10, [
    "..pPPPPp..",
    ".pPPPPPPp.",
    "pPPPPPPPpp",
    "pPPPPPPppq",
    "pWWWWWWWWq",
    "pWWWWWWWwq",
    "pPPPPPPppq",
    "pPPPPPpppq",
    "pPPPPPPppq",
    "pPPpPPPppq",
    "pPPpPPppqq",
    "pWWwWWWwwq",
    "p.p.p.q.q.",
  ], { P: "pink3", p: "pink2", q: "pink1", W: "white", w: "cream4" });
}

// ── the mattress and its sheets ─────────────────────────────────────────────

/** The bottom sheet over the mattress top from `top` to 74, and the mattress's front face. */
function mattress(p: Px, who: Who, top: number) {
  const old = who === "elder";
  p.rect(4, top, 40, 75 - top, "white");
  p.vline(4, top, 75 - top, "white").vline(41, top, 75 - top, "cream5");
  p.vline(42, top, 75 - top, "cream4").vline(43, top, 75 - top, "cream3");
  // Under the headboard the sheet falls into its shadow.
  if (top === BED.mattressTop) p.hline(4, top, 40, "cream4").hline(5, top + 1, 38, "cream5");
  // The front face: the sheet pulled over the mattress's edge.
  p.hline(4, 74, 40, "white").rect(4, 75, 40, 3, "cream5").hline(4, 77, 40, "cream4");
  if (old) {
    // Untucked at the foot: the sheet hangs unevenly and the blue-ticked mattress shows beside it.
    p.rect(4, 75, 13, 3, "cream5");
    for (let x = 4; x < 17; x++) if (x % 3 === 1) p.vline(x, 75, 3, "blue4");
    p.hline(4, 77, 13, "blue3");
    grid(p, 17, 75, 27, [
      "444444444444444444444444443",
      "444434444444444443444444433",
      "33334333344444443334444433.",
      ".33.3...3433333.3.3333333..",
    ], { "4": "cream4", "3": "cream3" });
    // A week of lying in it: long soft wrinkles running from where he lies.
    p.over(() => {
      for (const [x0, y0, x1, y1] of [[8, 40, 14, 47], [33, 36, 38, 44], [10, 58, 16, 63], [30, 64, 36, 70], [22, 69, 27, 72], [37, 50, 40, 58]] as const) {
        p.line(x0, y0, x1, y1, "cream5");
        p.line(x0 + 1, y0, x1 + 1, y1, "cream4");
      }
    });
  } else {
    // Pressed creases from the hospital laundry, still sharp, and hospital corners at the foot.
    p.over(() => {
      for (const y of [47, 61]) if (y > top + 2) p.hline(6, y, 35, "cream5");
      p.vline(24, Math.max(top + 14, 33), 41 - Math.max(top - 18, 0), "cream5");
    });
    grid(p, 4, 75, 6, ["4444W3", "44W33.", "W33..."], { W: "white", "4": "cream4", "3": "cream3" });
    grid(p, 38, 75, 6, ["34W444", ".33W44", "...33W"], { W: "white", "4": "cream4", "3": "cream3" });
  }
}

/**
 * A pillow, `w`×`h` with its top-left at (x, y): plump, lit from the upper left, its case's seam
 * showing at the open end. `dent` presses a head-shaped hollow into it.
 */
function pillow(target: Px, x: number, y: number, w: number, h: number, dent: boolean) {
  // Contact shadow on the sheet first, so the pillow sits up off it.
  target.hline(x + 2, y + h, w - 2, "cream4").vline(x + w, y + 3, h - 3, "cream5");
  // Drawn on its own canvas so the rounded corners show the sheet, not holes.
  const p = new Px(target.w, target.h);
  p.rect(x, y, w, h, "white");
  roundCorners(p, x, y, w, h, 2);
  p.over(() => {
    // A soft contour on the lit sides, the plump body falling into shade low and to the right.
    p.hline(x + 2, y, w - 4, "cream5").vline(x, y + 2, h - 4, "cream5");
    p.rect(x + Math.floor(w * 0.45), y + h - 5, Math.ceil(w * 0.55) - 1, 3, "cream5");
    p.rect(x + w - 6, y + 4, 5, h - 6, "cream5");
    p.hline(x + 2, y + h - 2, w - 3, "cream4").hline(x + 3, y + h - 1, w - 5, "cream3");
    p.vline(x + w - 1, y + 2, h - 4, "cream3").vline(x + w - 2, y + 3, h - 5, "cream4");
    // The case's seam at its open right end, and a pressed line across the middle.
    p.vline(x + w - 5, y + 2, h - 4, "cream4");
    p.hline(x + 5, y + Math.floor(h / 2), 6, "cream5");
  });
  if (dent) p.over(() => {
    // His head's hollow, the cotton gone soft round it.
    const cx = x + Math.floor(w / 2), cy = y + Math.floor(h / 2);
    p.ellipse(cx, cy, 9, Math.max(3, h / 2 - 3), "cream5");
    p.ellipse(cx + 1, cy, 7, Math.max(2, h / 2 - 4.5), "cream4");
    p.ellipse(cx - 2, cy - 1, 4, Math.max(1.5, h / 2 - 6), "cream5");
  });
  target.blit(p, 0, 0);
}

/** The elder's second pillow from home, under the first: a blue-check case with little pink flowers. */
function homePillow(p: Px, x: number, y: number, w: number) {
  p.rect(x, y, w, 4, "blue6");
  for (let i = 0; i < w; i++) {
    if (i % 4 === 0) p.vline(x + i, y, 4, "blue5");
    if (i % 8 === 2) p.px(x + i, y + 1, "pink3");
  }
  p.hline(x, y + 3, w, "blue4").px(x, y, null).px(x + w - 1, y, null);
}

/** The elder's transistor radio, propped on the pillow corner, aerial up; left on at low volume. */
function radio(p: Px, x: number, y: number) {
  // The aerial first, angled back over the headboard.
  p.line(x + 2, y, x - 3, y - 9, "steel4");
  p.px(x - 3, y - 10, "steel5").px(x - 4, y - 10, "steel3");
  grid(p, x, y, 11, [
    "kkkkkkkkkkk",
    "k22222222wk",
    "k2gSgSg2Gk.",
    "k2SgSgS2gk.",
    "k2gSgSg2wk.",
    "k2SgSgS22k.",
    "k22222222wk",
    "kkkkkkkkkkk",
  ], { k: "wood1", "2": "wood2", g: "steel3", S: "steel5", G: "gold4", w: "wood3" });
  p.hline(x + 1, y + 1, 7, "wood3");
}

/** A folded newspaper: grey column blocks and a photo, no legible text. */
function newspaper(p: Px, x: number, y: number) {
  grid(p, x, y, 13, [
    "..44444444444",
    ".455555555554",
    "4555s5s55ss54",
    "4555555555554",
    "45ss5ss5PPP54",
    "4555555ss2P54",
    "45ss5ss5PPP54",
    "4555555555543",
    "4444444444433",
    "45ss5ss5ss543",
    "4555555555543",
    ".33333333333.",
  ], { "5": "cream4", "4": "cream3", "3": "cream2", s: "stone4", P: "stone3", "2": "stone2" });
}

// ── whole beds ──────────────────────────────────────────────────────────────

function bed(p: Px, who: Who, raised: boolean) {
  const old = who === "elder";
  if (raised) {
    // Posts and the top rail show above and beside the raised backrest.
    vTube(p, 1, 2, 20, ENAMEL);
    vTube(p, 44, 2, 20, ENAMEL);
    finial(p, 1, 0);
    finial(p, 44, 0);
    hTube(p, 4, 1, 40, ENAMEL);
  } else headboard(p, who);
  sideRails(p, 20, 77);
  mattress(p, who, raised ? 40 : BED.mattressTop);
  if (raised) {
    // The backrest: the mattress's head section cranked up, a face tilted toward us, so a step
    // darker than the flat sheet; the fold where it hinges at y 40.
    // Its top end faces the sky, so it is the lightest strip; the face below leans toward us.
    p.rect(4, 4, 40, 3, "white").hline(4, 6, 40, "cream4").rect(38, 4, 6, 2, "cream5");
    p.rect(4, 7, 40, 32, "cream5");
    p.vline(4, 7, 31, "white").vline(5, 7, 29, "white").hline(6, 7, 26, "white");
    p.vline(41, 7, 32, "cream4").vline(42, 7, 32, "cream4").vline(43, 7, 32, "cream3");
    p.px(4, 4, "steel4").px(43, 4, "steel3");
    // The hinge fold, and the shadow the raised section throws on the flat sheet below it.
    p.hline(4, 38, 40, "cream4").hline(4, 39, 40, "cream3").hline(4, 40, 40, "cream2");
    p.hline(6, 41, 38, "cream4").hline(12, 42, 32, "cream5").hline(24, 43, 20, "cream5");
    // The steel frame of the backrest shows at its sides.
    p.vline(3, 6, 34, "steel3").vline(44, 6, 34, "steel3");
    if (old) {
      p.over(() => {
        p.line(9, 30, 14, 36, "cream4").line(34, 31, 38, 37, "cream4").line(35, 31, 39, 37, "white");
      });
      homePillow(p, 8, 29, 31);
      pillow(p, 9, 11, 30, 19, true);
      radio(p, 33, 8);
      newspaper(p, 28, 58);
    } else pillow(p, 9, 11, 30, 19, false);
  } else {
    if (old) {
      homePillow(p, 8, 29, 31);
      pillow(p, 9, 17, 30, 14, true);
      radio(p, 33, 15);
      newspaper(p, 28, 58);
    } else pillow(p, 9, 17, 30, 15, false);
  }
  footEnd(p, who, raised);
  chart(p, who);
  if (old) {
    towel(p);
    // His bag of odds and ends in blue-and-white printed cloth, hung by its drawstring from the
    // headboard post.
    grid(p, 0, 2, 7, [
      ".k.....",
      "k.k....",
      ".k.....",
      ".qPq...",
      "pPPPp..",
      "pPWPPp.",
      "pPPPPpq",
      "pWPPWpq",
      "pPPPPpq",
      "pPWPPpq",
      "pPPPWpq",
      ".ppppq.",
    ], { k: "bamboo2", P: "blue3", p: "blue2", q: "blue1", W: "blue6" });
  } else {
    // The laundry's paper tag, still tied to the foot rail: this bed was cleaned this morning.
    grid(p, 30, 79, 4, [".k..", ".k..", "WWWc", "WkWc", "WWWc", "cccc"], { k: "stone3", W: "white", c: "cream3" });
  }
  p.outline("steel2");
}

// ── blankets ────────────────────────────────────────────────────────────────

type Pose = "lying" | "sitting";

/** The hospital check (player): soft blue ground, a mint warp two threads wide, a fine blue weft. */
function check(x: number, y: number): Color {
  const u = (x - 4 + 80) % 8, v = (y + 80) % 8;
  if (u < 2 && v === 0) return "jade4";
  if (u < 2) return "jade5";
  if (v === 0) return "blue4";
  return "blue5";
}

/** The older issue (elder): faded mint with cream bands, each with a darker thread under it. */
function stripe(_x: number, y: number): Color {
  const v = (y + 80) % 7;
  if (v < 2) return "cream4";
  if (v === 2) return "jade4";
  return "jade5";
}

/**
 * A light map over the blanket: 0 is the cloth as woven, +1 a lit fold, −1 or −2 shade. The body
 * under the blanket is drawn as contours, lit on the upper left and shaded on the lower right, and
 * the folds that run from the toes to the foot corners.
 */
function reliefMap(pose: Pose, who: Who, body: number, bottom: number) {
  const map = new Int8Array(48 * 96);
  const set = (x: number, y: number, v: number) => { map[y * 48 + x] = v; };
  const col = (x: number, y0: number, y1: number, v: number) => { for (let y = y0; y <= y1; y++) set(x, y, v); };
  const row = (y: number, x0: number, x1: number, v: number) => { for (let x = x0; x <= x1; x++) set(x, y, v); };
  const fold = (x0: number, y0: number, x1: number, y1: number) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + ((x1 - x0) * i) / n), y = Math.round(y0 + ((y1 - y0) * i) / n);
      set(x, y, -1);
      set(x - 1, y, 1);
    }
  };
  if (pose === "lying") {
    // Chest and hips: one broad soft form, lit down its left side, its right side and the blanket
    // beside it in shade.
    col(11, body + 2, 53, 1);
    col(12, body + 4, 50, 1);
    for (const x of [34, 35, 36, 37]) col(x, body + (x - 33), 54, -1);
    row(55, 15, 37, -1);
    row(56, 26, 36, -1);
  } else if (who === "elder") {
    // One knee drawn up: a round mound on the left leg, lit on its upper left.
    for (let y = body; y < body + 10; y++) for (let x = 10; x < 27; x++) {
      const u = (x + 0.5 - 18) / 7.5, v = (y + 0.5 - (body + 5)) / 4.6, d = u * u + v * v;
      if (d > 1) continue;
      if (d > 0.5 && u < 0 && v < 0.3) set(x, y, 1);
      else if (d > 0.45 && (u > 0.2 || v > 0.4)) set(x, y, -1);
    }
  }
  // Two legs: each lit on its left flank and shaded on its right, the valley between them darkest.
  const legTop = pose === "lying" ? 57 : body + 1;
  col(13, legTop, 66, 1);
  col(14, legTop + 2, 62, 1);
  for (const x of [22, 23]) col(x, legTop + 1, 66, -1);
  col(24, legTop + 1, 67, -2);
  col(25, legTop + 2, 66, 1);
  for (const x of [33, 34, 35]) col(x, legTop, 67, -1);
  col(36, legTop + 2, 66, -1);
  // The toes, then the drape from the feet to the corners and down the middle.
  for (const fx of [15, 26]) { row(63, fx + 1, fx + 5, 1); row(68, fx + 1, fx + 6, -1); set(fx + 7, 67, -1); }
  fold(15, 69, 8, 74);
  fold(34, 69, 41, 74);
  col(24, 69, 73, -1);
  // The blanket rolls over the mattress edges and hangs over the foot.
  col(4, body, bottom - 2, 1);
  col(42, body, bottom - 2, -1);
  col(43, body, bottom, -2);
  row(74, 5, 41, 1);
  row(bottom - 1, 4, 43, -1);
  row(bottom, 4, 43, -1);
  return (x: number, y: number) => map[y * 48 + x];
}

/** The top sheet turned down over the blanket: a lit fold, the band, and its shadow on the blanket. */
function turnDown(p: Px, top: number, slope: (x: number) => number) {
  for (let x = 4; x <= 43; x++) {
    const y = top + slope(x), right = x > 38;
    p.px(x, y, x < 30 ? "white" : "cream5");
    p.px(x, y + 1, right ? "cream4" : "cream5").px(x, y + 2, right ? "cream4" : "cream5");
    p.px(x, y + 3, right ? "cream3" : "cream4").px(x, y + 4, "cream3");
  }
  p.px(4, top + slope(4), "cream5").px(43, top + slope(43), "cream4");
}

function blanket(p: Px, who: Who, pose: Pose) {
  const old = who === "elder";
  const [top, bottom] = pose === "lying" ? BED.blanketLying : BED.blanketSitting;
  const cloth = old ? stripe : check;
  // The elder's turn-down is rumpled: it rides up and down in soft waves.
  const WAVE = [0, 0, 1, 1, 2, 2, 2, 1, 1, 0, 0, 0, 1, 1, 1, 2, 2, 1, 1, 0];
  const slope = old ? (x: number) => WAVE[((x - 4) >> 1) % WAVE.length] : () => 0;
  const roll = pose === "sitting" ? 3 : 0;
  const body = top + 5 + roll;
  const lit = reliefMap(pose, who, body, bottom);
  for (let y = top + 3; y <= bottom; y++) for (let x = 4; x <= 43; x++) p.px(x, y, step(cloth(x, y), lit(x, y)));
  if (roll) {
    // Folded down to the waist: the blanket's doubled edge rolls under the sheet.
    for (let x = 4; x <= 43; x++) {
      const y = top + 5 + slope(x);
      p.px(x, y, step(cloth(x, y), x < 30 ? 1 : 0)).px(x, y + 1, cloth(x, y + 1)).px(x, y + 2, step(cloth(x, y + 2), -1)).px(x, y + 3, step(cloth(x, y + 3), -2));
    }
  }
  // A hairline edge where the blanket meets the bed's frame and hangs over the foot.
  p.outline(old ? "jade3" : "blue3", { sides: ["left", "right", "bottom"] });
  turnDown(p, top, slope);

  if (old) {
    // A darned patch, cream cloth sewn on along its top with blue thread.
    grid(p, 7, bottom - 15, 7, [".b.b.b.", "5b5b5b4", "5555554", "5555554", "5555554", "4444443"], { "4": "cream4", "5": "cream5", "3": "cream3", b: "blue3" });
    // His newspaper, put down when he dozed off.
    newspaper(p, 29, pose === "lying" ? 57 : 55);
    // The hem has frayed where it hangs at the foot.
    for (let x = 6; x < 42; x += 3) p.px(x, bottom + 1, step(cloth(x, bottom), -1));
  } else {
    // The laundry press's fold creases, still sharp: across at two heights and down the middle.
    p.over(() => {
      for (const y of [pose === "lying" ? 50 : 57, 64]) for (let x = 5; x < 43; x++) {
        // The creases flatten out where the body lifts the blanket.
        if (x > 11 && x < 37) continue;
        p.px(x, y, step(p.get(x, y) as Color, -1));
        p.px(x, y + 1, step(p.get(x, y + 1) as Color, 1));
      }
    });
  }
}

export default defineSprites({
  /**
   * The player's bed, flat: made up this morning for a new patient. The sheet still carries the
   * laundry's pressed creases, hospital corners at the foot, a fresh chart with one sheet on it,
   * the laundry's paper tag still tied to the foot rail, a blank name card in the headboard's
   * holder (DOM area x 20–27, y 9–12).
   */
  "ward/bed-player-flat": { ...BED_SPRITE, draw: (p) => bed(p, "player", false) },
  /** The player's bed with the backrest cranked up; the crank handle is swung out from cranking. */
  "ward/bed-player-raised": { ...BED_SPRITE, draw: (p) => bed(p, "player", true) },
  /**
   * The elder's bed, flat: his for weeks. A second pillow from home in a blue-check case, the first
   * dented to the shape of his head, his transistor radio on the pillow corner, the bottom sheet
   * rumpled and untucked at the foot over the blue-ticked mattress, yesterday's paper, his pink
   * towel drying on the foot rail, his blue-print cloth bag hung on the headboard post, a thick chart with a
   * pencil on a string, chipped enamel.
   */
  "ward/bed-elder-flat": { ...BED_SPRITE, draw: (p) => bed(p, "elder", false) },
  /** The elder's bed with the backrest up, as he sits for breakfast. */
  "ward/bed-elder-raised": { ...BED_SPRITE, draw: (p) => bed(p, "elder", true) },
  /** The player's blanket over someone lying down: crisp pale check, the sheet turned down straight. */
  "ward/blanket-player-lying": { w: BED.w, h: BED.h, anchor: BED.anchor, draw: (p) => blanket(p, "player", "lying") },
  /** The player's blanket folded down to the waist of someone sitting up. */
  "ward/blanket-player-sitting": { w: BED.w, h: BED.h, anchor: BED.anchor, draw: (p) => blanket(p, "player", "sitting") },
  /** The elder's older striped blanket, the turn-down slid crooked, a darned patch, his newspaper on it. */
  "ward/blanket-elder-lying": { w: BED.w, h: BED.h, anchor: BED.anchor, draw: (p) => blanket(p, "elder", "lying") },
  /** The elder's blanket pushed to his lap, one knee drawn up under it. */
  "ward/blanket-elder-sitting": { w: BED.w, h: BED.h, anchor: BED.anchor, draw: (p) => blanket(p, "elder", "sitting") },
});
