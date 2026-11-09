/**
 * Money and paper for paying and change: coins, folded notes, a blank receipt. No numerals or
 * text anywhere; the amounts live in the interface. Anchors are the bottom-centre pixel.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { grid, selout } from "./_helpers.ts";

/** A coin lying flat, 6×4: rim, a raised ring, a glint. Steel for 元, brass for 角. */
const COIN = [".rrrrrr.", "rhhffddr", "rfddddfr", ".rrrrrr."];

/** A stack of `n` coins at (x, y): the edges of the lower ones, milled, under the top face. */
function stack(p: Px, x: number, y: number, n: number, metal: "steel" | "gold") {
  const k: Record<string, Color> = metal === "steel"
    ? { r: "steel2", h: "steel6", f: "steel4", d: "steel5", e: "steel3", E: "steel1" }
    : { r: "gold1", h: "gold5", f: "gold3", d: "gold4", e: "gold2", E: "gold1" };
  for (let i = n - 1; i >= 0; i--) {
    const top = y + i;
    p.hline(x + 1, top + 3, 6, i === n - 1 ? k.E : k.e).px(x, top + 2, k.r).px(x + 7, top + 2, k.r);
    if (i === n - 1) p.hline(x + 1, top + 4, 6, k.r);
  }
  grid(p, x, y, COIN, k);
}

function coins(p: Px) {
  // A short stack of steel 元, a brass 角 and a steel one loose beside it.
  stack(p, 1, 2, 3, "steel");
  stack(p, 8, 7, 1, "gold");
  stack(p, 11, 3, 1, "steel");
}

/** A banknote folded in half, its print reduced to a blank portrait oval and border lines. */
function note(p: Px, x: number, y: number, ink: { d: Color; m: Color; l: Color }) {
  grid(p, x, y, [
    "..oooooooooooo",
    ".oLLLLLLLLLLmo",
    "oLmmmmmmmmmLmo",
    "oLmwwmmMMmmLmo",
    "oLmwwmmmmmmLmo",
    "oLmmmmMMMmmLmo",
    "oLLLLLLLLLLLmo",
    "ommmmmmmmmmmmo",
    "oddddddddddddo",
    ".oooooooooooo.",
  ], { o: ink.d, L: ink.l, m: ink.m, M: ink.d, w: "cream5", d: ink.d });
}

function notes(p: Px) {
  note(p, 0, 2, { d: "plum1", m: "plum3", l: "plum4" });
  note(p, 5, 0, { d: "jade1", m: "jade4", l: "jade5" });
}

function receipt(p: Px) {
  // A slip torn from the pad: ruled lines, a curl at the top, a sawtooth bottom edge.
  p.rect(1, 1, 11, 17, "white");
  p.hline(1, 1, 11, "cream4").hline(2, 0, 9, "cream5");
  for (const y of [5, 8, 11, 14]) p.hline(3, y, 7, "cream3");
  p.hline(3, 3, 4, "cream3");
  p.vline(11, 2, 16, "cream3");
  p.rows(1, 18, ["w.w.w.w.w.w"], { w: "white" });
  // A thumb smudge in the corner.
  p.rows(8, 15, [".s", "ss"], { s: "cream4" });
  selout(p, "cream2", "cream3");
}

export default defineSprites({
  /** A small stack of steel coins and two loose ones, one brass. */
  "food/coins": { w: 20, h: 13, anchor: [10, 12], draw: coins },
  /** Two folded notes, one purple, one green; blank ovals where the print would be. */
  "food/notes": { w: 19, h: 12, anchor: [9, 11], draw: notes },
  /** A blank receipt slip with ruled lines. Overlay area for DOM text: x 3–9, y 3–14. */
  "food/receipt": { w: 13, h: 20, anchor: [6, 19], draw: receipt },
});
