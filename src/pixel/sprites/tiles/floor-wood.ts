/**
 * Dining-room floor: honey oak boards, two 8px boards per tile running east–west.
 * Every variant shares the seam rows (7, 15) and board-top highlight rows (0, 8), so any mix tiles.
 * Butt joints are a seam-coloured gap with the lit end grain to its right (sun from the left).
 * Tiles anchor at their top-left corner and are placed on the 16px grid.
 * Suggested mix: a ×3, b ×2, f ×2, c, d, e, g once each.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { OAK, tile16 } from "./_helpers.ts";

const oak = (rows: readonly string[], name: string) => (p: Px) => tile16(p, rows, OAK, name);
const floor = (rows: readonly string[], name: string) => ({ w: 16, h: 16, anchor: [0, 0] as const, layer: "floor" as const, draw: oak(rows, name) });

export default defineSprites({
  /** Plain boards, no joints: the workhorse. */
  "tile/floor-wood-a": floor([
    "llaaalllllaaalla",
    "aaaaaaaaaaaaaaaa",
    "aaaaaaaabbbbaaaa",
    "abbbaaaaaaaalbba",
    "aallbaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaa",
    "aaaaaallllaaaaaa",
    "bbbbbbbbbbbbbbbb",
    "aallllaaaallllla",
    "aaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaa",
    "aaaaabbbbaaaaaaa",
    "allaaaaalbbbaaaa",
    "aaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaabba",
    "bbbbbbbbbbbbbbbb",
  ], "floor-wood-a"),

  /** Butt joints in both boards, staggered. */
  "tile/floor-wood-b": floor([
    "llaaalllllbllaal",
    "aaaaaaaaaablaaaa",
    "aabbbbaaaabaaaaa",
    "aaaaalbbaabaaaaa",
    "aaaaaaaaaabaaaaa",
    "aaaaaaaaaabaabba",
    "aaaaaaaaaabaaaaa",
    "bbbbbbbbbbbbbbbb",
    "allblllaaaalllla",
    "aaablaaaaaaaaaaa",
    "aaabaaaaaaaaaaaa",
    "aaabaaaallllaaaa",
    "aaabaaaaaaaaaaaa",
    "aaabaaaaaabbbbaa",
    "aaabaaaaaaaaalba",
    "bbbbbbbbbbbbbbbb",
  ], "floor-wood-b"),

  /** A knot with the grain parting around it. */
  "tile/floor-wood-c": floor([
    "lllaaallllaallla",
    "aaaaaaaaaaaaaaaa",
    "aaaaabbbbbaaaaaa",
    "aabbbaccbbbbaaaa",
    "aaaaaablbaaaaaaa",
    "aaabbbaaalbbaaaa",
    "aaaaaaaaaaaaaaaa",
    "bbbbbbbbbbbbbbbb",
    "lllllaaallllaall",
    "aaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaa",
    "aabbbbaaaaaaaaaa",
    "aaaaaalbbaaaaaaa",
    "aaaaaaaaaaaabbba",
    "aaaaaaaaaaaaaaaa",
    "bbbbbbbbbbbbbbbb",
  ], "floor-wood-c"),

  /** A pale streak worn into the finish by years of feet; a joint in the top board. */
  "tile/floor-wood-d": floor([
    "aallllaaalllbaal",
    "aaaaaaaaaaaablaa",
    "aaabbbbaaaaabaaa",
    "aaaaaaalbaaabaaa",
    "aaaaaaaaaaaabaaa",
    "aallaaaaaaaabaaa",
    "aaaaaaaaaaaabaaa",
    "bbbbbbbbbbbbbbbb",
    "llaaalllllllaala",
    "aaaaaaallllaaaaa",
    "aaallllllllllaaa",
    "aalllllbbllllaaa",
    "aaaalllllllllaaa",
    "aaaaaaaallllaaaa",
    "aaaaaaaaaaaaaaaa",
    "bbbbbbbbbbbbbbbb",
  ], "floor-wood-d"),

  /** The faint half-ring of an old cup and a stool-drag scuff. */
  "tile/floor-wood-e": floor([
    "llllaaallllaalll",
    "aaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaa",
    "abbbaaaaaaabaaaa",
    "aaaaaaaaaaabaaaa",
    "aaaaaaabbbbaaaaa",
    "aaaaaaaaaaaaaaaa",
    "bbbbbbbbbbbbbbbb",
    "aalllaaablllllaa",
    "aaaaaaaablaaaaaa",
    "aaaaaaaabaaaaaaa",
    "aaaaaaaabaaaaaaa",
    "aaaaaaaabaabbbca",
    "aaaaaaaabaaaaaaa",
    "aaaaaaaabaaabbaa",
    "bbbbbbbbbbbbbbbb",
  ], "floor-wood-e"),

  /** Joints again, at other offsets, so long runs of plain boards stay broken. */
  "tile/floor-wood-f": floor([
    "lllaalbllllaaall",
    "aaaaaablaaaaaaaa",
    "aaaaaabaaaabbbaa",
    "abbaaabaaaaaaalb",
    "aaaaaabaaaaaaaaa",
    "aaaaaabaaalllaaa",
    "aaaaaabaaaaaaaaa",
    "bbbbbbbbbbbbbbbb",
    "aallllaaaaaaabll",
    "aaaaaaaaaaaaabla",
    "aaaaaaaaaaaaabaa",
    "aaabbbbaaaaaabaa",
    "aaaaaaalbaaaabaa",
    "aaaaaaaaaaaaabaa",
    "aaaaaaaaaaaaabaa",
    "bbbbbbbbbbbbbbbb",
  ], "floor-wood-f"),
  /** A short, paler replacement board let in between two joints: a newer repair. */
  "tile/floor-wood-g": floor([
    "llbllllllllbllaa",
    "aablaaaaaaablaaa",
    "aabaaaallllbaaaa",
    "abbaaaaaaaabaaba",
    "aabaallaaaabaaaa",
    "aabaaaaaaaabaaaa",
    "aabaaaaallabaaaa",
    "bbbbbbbbbbbbbbbb",
    "lllaaalllllaalll",
    "aaaaaaaaaaaaaaaa",
    "aaaaaaabbbbaaaaa",
    "abbaaaaaaalbaaaa",
    "aaaaaaaaaaaaaaaa",
    "aaaaallllaaaaaaa",
    "aaaaaaaaaaaaabba",
    "bbbbbbbbbbbbbbbb",
  ], "floor-wood-g"),
});
