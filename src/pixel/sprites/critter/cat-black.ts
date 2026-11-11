/**
 * 煤球 (Méiqiú), the courtyard's black cat, the other cat in the courtyard story. Sleek, with
 * amber eyes and a small white blaze on the chest. Her black has blue-black highlights where the sun
 * catches it, so she reads as a cat, not a hole. The player tells her from the white cat by colour,
 * so she must never be confused with `critter/cat-white` or the grey tabby. The body is `_cat.ts`.
 */
import { defineSprites } from "../../kit/index.ts";
import { catSprites } from "./_cat.ts";

export default defineSprites(catSprites("cat-black", {
  fur: {
    L: "hair2", A: "hair1", a: "hair1", H: "blue1", d: "blue1", D: "hair1", o: "ink",
    u: "hair2", U: "hair1", w: "white", W: "steel5", n: "pink1", p: "plum2",
    g: "gold3", G: "gold4", e: "gold3", E: "gold4", k: "ink", m: "ink",
    S: "hair2", s: "hair1", h: "steel5",
  },
  tones: ["blue1", "hair2", "hair2", "hair1"],
  outline: "ink",
  tail: ["hair2", "hair1", "blue1", "hair1"],
  chest: {
    sit: ["....", "....", ".w..", ".wW.", "..W.", "...."],
    side: ["..", "..", ".w", ".W"],
    walk: ["....", "....", ".wW."],
  },
}));
