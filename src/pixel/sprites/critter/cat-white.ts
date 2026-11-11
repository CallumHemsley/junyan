/**
 * 雪球 (Xuěqiú), the courtyard's white cat, one of the two cats in the courtyard story. Fluffy,
 * odd-eyed (her right eye blue, her left amber), with a pink nose and pink ears, and the tip of her
 * tail grubby grey from sleeping in the coal shed. The white is shaded in cool greys and outlined
 * dark so she still reads on pale paving. The player tells her from the black cat by colour, so
 * she must never be confused with `critter/cat-black` or the grey tabby. The body is `_cat.ts`.
 */
import { defineSprites } from "../../kit/index.ts";
import { catSprites } from "./_cat.ts";

export default defineSprites(catSprites("cat-white", {
  fur: {
    L: "white", A: "steel6", a: "steel5", H: "white", d: "white", D: "steel6", o: "steel1",
    u: "white", U: "steel5", w: "white", W: "steel5", n: "pink2", p: "pink3",
    g: "blue4", G: "blue5", e: "gold3", E: "gold4", k: "ink", m: "steel3",
    S: "white", s: "steel5", h: "steel3",
  },
  tones: ["white", "steel6", "steel5", "steel4"],
  outline: "steel1",
  tail: ["steel6", "steel5", "steel6", "steel5"],
  tip: [["stone4", "stone3"], ["stone3", "stone2"], ["stone2", "stone1"]],
  fluffy: true,
}));
