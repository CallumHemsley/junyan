/**
 * Money and paper for paying and change: coins, folded notes, a blank receipt. No numerals or
 * text anywhere; the amounts live in the interface. Anchors are the bottom-centre pixel.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { grid, selout } from "./_helpers.ts";

/** A coin lying flat, 6×4: rim, a raised ring, a glint. Steel for 元, brass for 角. */
const COIN = ["..rrrr..", ".rhhffr.", "rhfddfdr", ".rfddfr.", "..rrrr.."];

/** A stack of `n` coins at (x, y): the edges of the lower ones, milled, under the top face. */
function stack(p: Px, x: number, y: number, n: number, metal: "steel" | "gold") {
  const k: Record<string, Color> = metal === "steel"
    ? { r: "steel2", h: "steel6", f: "steel4", d: "steel5", e: "steel3", E: "steel1" }
    : { r: "gold1", h: "gold5", f: "gold3", d: "gold4", e: "gold2", E: "gold1" };
  // Milled edges of the coins underneath, one pixel each, the lowest in shadow.
  for (let i = 0; i < n; i++) {
    const ey = y + 3 + i;
    p.hline(x + 1, ey, 6, i === n - 1 ? k.E : k.e).px(x, ey, k.r).px(x + 7, ey, k.r);
    if (i < n - 1) for (let j = x + 2; j < x + 6; j += 2) p.px(j, ey, k.f);
  }
  p.hline(x + 2, y + 3 + n, 4, k.r);
  grid(p, x, y, COIN, k);
}

function coins(p: Px) {
  // A short stack of steel 元, a brass 角 and a steel one loose beside it.
  stack(p, 1, 2, 3, "steel");
  stack(p, 8, 7, 1, "gold");
  stack(p, 11, 2, 1, "steel");
}

/**
 * A banknote folded once: the near half flat, the far half lifted and showing its paler back.
 * The print is reduced to a blank watermark oval, a portrait panel and border lines.
 */
function note(p: Px, x: number, y: number, ink: { d: Color; m: Color; l: Color }) {
  grid(p, x, y, [
    "....oooooooooooooo",
    "...oLLLLLLLLLLLLLo",
    "..oLlllllllllllLo.",
    ".oLlllllllllllLo..",
    "oooooooooooooooo..",
    "oLLLLLLLLLLLLLLo..",
    "oLmmwwmmMMMMmmLo..",
    "oLmwwwmmMddMmmLo..",
    "oLmmwwmmMMMMmmLo..",
    "oLLLLLLLLLLLLLLo..",
    "oooooooooooooooo..",
  ], { o: ink.d, L: ink.l, l: "cream4", m: ink.m, M: ink.d, d: ink.l, w: "cream5" });
}

function notes(p: Px) {
  note(p, 0, 2, { d: "plum1", m: "plum3", l: "plum4" });
  note(p, 4, 0, { d: "jade1", m: "jade4", l: "jade5" });
}

function receipt(p: Px) {
  // A slip torn from the pad: ruled lines, a curl at the top, a sawtooth bottom edge.
  p.rect(1, 1, 9, 13, "white");
  p.hline(1, 1, 9, "cream4").hline(2, 0, 7, "cream5");
  p.hline(3, 3, 3, "cream3");
  for (const y of [5, 7, 9, 11]) p.hline(3, y, 5, "cream3");
  p.vline(9, 2, 12, "cream3");
  p.rows(1, 14, ["w.w.w.w.w"], { w: "white" });
  // A thumb smudge in the corner.
  p.rows(6, 11, [".s", "ss"], { s: "cream4" });
  selout(p, "cream2", "cream3");
}

export default defineSprites({
  /** A small stack of steel coins and two loose ones, one brass. */
  "food/coins": { w: 20, h: 13, anchor: [10, 12], draw: coins },
  /** Two folded notes, one purple, one green; blank ovals where the print would be. */
  "food/notes": { w: 22, h: 13, anchor: [11, 12], draw: notes },
  /** A blank receipt slip with ruled lines. Overlay area for DOM text: x 3–8, y 3–12. */
  "food/receipt": { w: 11, h: 16, anchor: [5, 15], draw: receipt },
});
