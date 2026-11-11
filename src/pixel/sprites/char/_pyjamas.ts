/**
 * The ward's pyjamas, shared by 老爷爷 and the patient: hospital issue, washed a hundred times, pale
 * blue-white cotton with blue pinstripes, a notched collar piped in blue, a placket of pale buttons
 * and one chest pocket. Characters wear them by adding `PYJAMA_SLOTS` to their slots, wrapping
 * their body pieces in `striped`, and adding `pyjamaTop` to their extras.
 */
import { BED, RIG, frontSide, sided, type BodyPieces } from "./_rig.ts";
import { part, Z, type Part, type Piece, type Pose } from "./_core.ts";

/** Pale cotton, blue stripes (`B` lit, `D` shaded), blue piping on collar and cuffs. */
export const PYJAMA_SLOTS = {
  T: "blue6", t: "blue5", u: "blue4", C: "blue3", c: "blue2",
  V: "blue6", v: "blue5", X: "blue3", x: "blue2", F: "blue6", f: "blue5",
  P: "blue6", p: "blue5", B: "blue3", D: "blue2", K: "cream3",
} as const;

const LIT = new Set(["T", "V", "F", "P"]);
const SHADE = new Set(["t", "u", "v", "f", "p"]);
/** Stripe columns: every third, symmetric about the middle, leaving the placket clear. */
const isStripe = (x: number) => (x < 16 ? x % 3 === 1 : (31 - x) % 3 === 1);

/** Pinstripe a part's cloth (front and back views; in profile every third column from the back). */
function stripePart(p: Part, profile: boolean): Part {
  const x0 = p.x ?? 0;
  if (p.legend) return p;
  return {
    ...p,
    rows: p.rows.map((row) => [...row].map((c, i) => {
      const x = x0 + i;
      if (!(profile ? x % 3 === 0 : isStripe(x))) return c;
      return LIT.has(c) ? "B" : SHADE.has(c) ? "D" : c;
    }).join("")),
  };
}

/** Wrap a body piece so its cloth is pinstriped. */
export const striped = (piece: Piece): Piece => (pose) => piece(pose).map((p) => stripePart(p, pose.dir === "left" || pose.dir === "right"));

/** The rig's body and the bed body, pinstriped: pass as `body` and `bedBody`. */
export const PYJAMA_BODY: Partial<BodyPieces> = { torso: striped(RIG.torso), arms: striped(RIG.arms), legs: striped(RIG.legs) };
export const PYJAMA_BED = { torso: striped(BED.torso), arms: striped(BED.arms), legs: striped(BED.legs) };

// ── collar, placket, pocket ────────────────────────────────────────────────

const TOP_DOWN = part(33, Z.clothes, [
  "..........CC........CC..........",
  "..........cCC......CCc..........",
  "...........cCC....CCc...........",
  "............cCC..CCc............",
  "..............cTTc..............",
  "................K...............",
  "..........CCCc..................",
  "..........TTTt..K...............",
  "..........tttt..................",
  "................K...............",
  "................................",
  "................K...............",
]);
const TOP_SIDE = part(33, Z.clothes, [
  "...............CCCc.............",
  "................cCCc............",
  "..................cCc...........",
  "....................K...........",
  "....................T...........",
  "....................K...........",
  "................................",
  "....................K...........",
]);
const TOP_UP = part(33, Z.clothes, [
  "..........cCCCCCCCCCCc..........",
]);
/** Lying: the collar opens round the neck under the chin; sitting, the standing collar. */
const TOP_LIE = part(28, Z.clothes, [
  "................................",
  "..........CC........CC..........",
  "..........cCCC....CCCc..........",
  "............cCCKTCCc............",
  "..............cTTc..............",
  "...............KT...............",
]);

export const pyjamaTop: Piece = (pose: Pose) => {
  if (pose.legs === "lie") return [TOP_LIE];
  if (pose.legs === "sit-bed") return [TOP_DOWN];
  return topPiece(pose);
};
const topPiece = frontSide(sided({ down: [TOP_DOWN], up: [TOP_UP], right: [] }), () => [TOP_SIDE]);
