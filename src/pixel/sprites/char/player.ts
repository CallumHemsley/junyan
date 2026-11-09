/** The waiter: the player. Cream shirt, rolled sleeves, jade apron, dark trousers, dark hair. */
import { defineSprites } from "../../kit/index.ts";
import { defineCharacter, part, sided, Z } from "./_rig.ts";

const h = (y: number, rows: readonly string[]) => part(y, Z.hair, rows, { group: "head" });

const hair = sided({
  down: [h(4, [
    ".....hhhhhh.....",
    "...hhHHHHhhhh...",
    "..hhHHhhhhhhhd..",
    "..hHHhhhhhhhhd..",
    "..hHhhhhhhhhdd..",
    "..hhhhhhhdhhdd..",
    "..hhhshhsshsdd..",
    "..hh........dd..",
    "..h..........d..",
  ])],
  up: [h(4, [
    ".....hhhhhh.....",
    "...hhHHHHhhhh...",
    "..hhHHHhhhhhhd..",
    "..hHHhhhhhhhhd..",
    "..hHhhhhhhhhdd..",
    "..hhhhhhhhhhdd..",
    "..hhhhhhhhhhdd..",
    "..hhhhhhhhhhdd..",
    "..dhhhhhhhhddd..",
    "..ddhhhhhhhddd..",
    "...ddhdhhdhdd...",
    "....d......d....",
  ])],
  right: [h(4, [
    ".....hhhhhh.....",
    "...hhHHHHhhhh...",
    "..hhHHhhhhhhhh..",
    "..hHhhhhhhhhhhh.",
    "..hhhhhhhhhhhhh.",
    "..hhhhhhhhhhhhd.",
    "..hhhhhhhshhsd..",
    "..dhhhhhhh......",
    "..dhhhhhh.......",
    "..ddhhhd........",
    "...ddd..........",
  ])],
});

const apron = sided({
  down: [part(18, Z.clothes, [
    "......a..a......",
    "......AAAa......",
    "......AAAa......",
    "......AAaa......",
    ".....QQQQQQ.....",
    ".....AAAAaa.....",
    ".....AAAaaa.....",
    ".....AAaaaQ.....",
  ])],
  up: [part(18, Z.clothes, [
    "......a..a......",
    "................",
    "................",
    "................",
    ".....QQQQQQ.....",
    "......aQQa......",
    "......a..a......",
    "......a.........",
  ])],
  right: [part(18, Z.clothes, [
    "..........a.....",
    "..........AA....",
    "..........AA....",
    "..........Aa....",
    ".....QQQQQQQ....",
    ".........AAa....",
    ".........AAa....",
    ".........Aaa....",
    ".........aaQ....",
  ])],
});

export default defineSprites({
  ...defineCharacter({
    id: "player",
    slots: {
      S: "skin4", s: "skin3", k: "skin2", b: "blush", m: "skin2",
      T: "cream5", t: "cream4", u: "cream3", C: "white", c: "cream3",
      V: "cream5", v: "cream3", F: "skin4", f: "skin3",
      P: "blue2", p: "blue1", N: "wood3", n: "wood2",
      H: "hair3", h: "hair2", d: "hair1",
      A: "jade4", a: "jade3", Q: "jade2",
    },
    hair,
    extras: [apron],
  }, ["idle", "walk"]),
});
