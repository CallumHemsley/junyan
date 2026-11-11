/**
 * 花卷 (Huājuǎn), the lane's cat: a lean grey mackerel tabby who belongs to everyone and no one.
 * The noodle stall feeds her at seven, the tailor at noon. An "M" on her brow, buff chin and chest,
 * green eyes, one white sock on her left forepaw, the left ear tipped flat (the neighbourhood
 * committee had her neutered), and a kink at the end of her tail from an old door. Distinct from
 * the cafe's ginger Mantou (`decor/cat-*`) in colour, build and markings. The body is `_cat.ts`.
 */
import { defineSprites } from "../../kit/index.ts";
import { catSprites } from "./_cat.ts";

export default defineSprites(catSprites("cat-tabby", {
  fur: {
    L: "stone4", A: "stone3", a: "stone2", H: "stone5", d: "stone2", D: "stone1", o: "stone1",
    u: "cream4", U: "cream3", w: "cream4", W: "cream3", n: "pink2", p: "pink3",
    g: "leaf4", G: "leaf5", e: "leaf4", E: "leaf5", k: "ink", m: "stone1",
    S: "cream5", s: "cream3", h: "cream5",
  },
  tones: ["stone5", "stone4", "stone3", "stone2"],
  outline: "stone1",
  tail: ["stone4", "stone3", "stone2", "stone1"],
  stripes: true,
  tippedEar: true,
}));
