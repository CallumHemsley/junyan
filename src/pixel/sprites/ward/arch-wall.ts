/**
 * The ward's back (north) wall, face-on, in 32×96 slices that tile horizontally in any order:
 * cream limewash over a jade gloss dado with a painted timber rail and a terrazzo cove skirting.
 * Each variant records something that happened on this ward.
 *
 * Slices anchor at their top-left corner: place them at (x, 0) along the top of the room, exactly like
 * `wall/back-*`. Wall-mounted pieces (window, door, clock, noticeboard, nurse call) anchor at the wall's
 * foot, 96px below the slice top.
 *
 * The bed head-wall: over each bed, place `ward/wall-oxygen` then `ward/wall-sockets` side by side
 * (or the `-b` pair for the elder's bed). Together they carry one 56px aluminium services rail, rows
 * 40–48, end caps at x 4 of the first and x 27 of the second; a 48px bed centres under the pair.
 */
import { defineSprites, type Px } from "../../kit/index.ts";
import { WALL, block, cornerShadow, slice, wardWall } from "./_arch.ts";

/** The services rail: anodised aluminium trunking with a jade stripe, from x0 to x1 inclusive. */
function servicesRail(p: Px, x0: number, x1: number, capLeft: boolean, capRight: boolean) {
  const n = x1 - x0 + 1;
  p.hline(x0, 40, n, "steel6").hline(x0, 41, n, "steel5").rect(x0, 42, n, 4, "steel5").hline(x0, 44, n, "jade4");
  p.hline(x0, 46, n, "steel4").hline(x0, 47, n, "steel3").hline(x0, 48, n, "cream2");
  for (let x = x0; x <= x1; x++) if ((x >> 3) % 2) p.px(x, 42, "steel6");
  if (capLeft) block(p, x0 - 2, 40, ["fe", "fe", "fe", "fe", "fh", "fe", "fE", "Ff", ".k"], WALL, "cap-l");
  if (capRight) block(p, x1 + 1, 40, ["Ee", "eE", "eE", "eE", "hf", "Ef", "Ef", "fF", "kK"], WALL, "cap-r");
}

/** A medical-oxygen outlet on the rail: a chrome boss ringed in green, the dust cap on its chain. */
function oxygenOutlet(p: Px, x: number) {
  block(p, x, 39, [
    ".eIIe..",
    "eIjjIe.",
    "IjFiFjE",
    "IjiiijE",
    "IjFiFjf",
    "eEjjEf.",
    ".fEEf..",
  ], { ...WALL, j: "jade4" }, "oxygen");
}

/** A Chinese five-hole socket plate: a two-pin pair over an angled three-pin set. */
function socket(p: Px, x: number) {
  block(p, x, 39, [
    "CWWWWWC",
    "WWWWWWk",
    "WFWWFWk",
    "WWWiWWk",
    "WWFWFWk",
    "WWWWWWk",
    "CkkkkkK",
  ], WALL, "socket");
}

/** A rocker switch on its own small plate, with the little amber neon that glows when the bed lamp is off. */
function rocker(p: Px, x: number) {
  block(p, x, 40, ["CWWC", "WeEk", "WeEk", "WyWk", "CkkK"], WALL, "rocker");
}

export default defineSprites({
  /** Quiet wall. The workhorse. */
  "ward/wall-a": slice((p) => wardWall(p, 11)),

  /** Quiet wall, the gloss and the rail's chips falling differently. */
  "ward/wall-b": slice((p) => wardWall(p, 23)),

  /**
   * By the door: the light switch, a bakelite double rocker added when the wing was rewired, its conduit
   * run straight up the wall to the coving. Thirty years of hands in the dark have greyed the plaster
   * round it, heaviest on the side the door opens from.
   */
  "ward/wall-c": slice((p) => {
    wardWall(p, 31);
    for (let y = 10; y < 43; y++) p.px(14, y, "cream5").px(15, y, "cream4").px(16, y, "cream3");
    for (const y of [16, 30]) block(p, 13, y, ["eEEf"], WALL, "saddle");
    block(p, 8, 38, [
      "....kkkkkkk.....",
      "..kkkkkkkkkkkk..",
      ".kkkkkkkkkkkkkk.",
      "kkkkkkkkkkkkkkk.",
      "kkkkkkkkkkkkkkk.",
      "kkkkkkkkkkkkkk..",
      ".kkkkkkkkkkkkk..",
      "..kkkkkkkkkkk...",
      "...kkkkkkkk.....",
      ".....kkkk.......",
    ], WALL, "grime");
    block(p, 11, 42, [
      "CWWWWWWWC",
      "WCeWWCeWk",
      "WeEkWeEkk",
      "WeEkWeEkk",
      "WkkkWkkkk",
      "CkkkkkkkK",
    ], WALL, "switch");
  }),

  /**
   * A health poster hung here through the nineties and came down for an inspection: a paler rectangle
   * of limewash, a dust line along its top, the yellowed tape still on three corners and a torn scrap
   * of the poster's corner under one of them.
   */
  "ward/wall-d": slice((p) => {
    wardWall(p, 41);
    p.rect(5, 17, 22, 28, "cream5");
    p.hline(5, 16, 22, "cream3");
    block(p, 4, 16, ["yY.", "Yyy", ".Y."], WALL, "tape-tl");
    block(p, 25, 15, [".yY", "yyY", "Y.."], WALL, "tape-tr");
    block(p, 24, 42, ["WWy.", "WyyY", ".yY."], WALL, "tape-br");
  }),

  /**
   * Behind a bed head: the bed's steel rail has rubbed the gloss back to the cream undercoat in a band
   * of scrapes, its rubber bumpers have left grey kisses, and one hard knock has dented the plaster.
   */
  "ward/wall-scuff": slice((p) => {
    wardWall(p, 53);
    block(p, 1, 69, [
      "..ccckkk.....cckk..........cc..",
      "cccckk....cccccckkkk.....ckkcc.",
      "..........................k....",
      "....kk.........................",
      ".SSs...........ccckk......SSs..",
      ".......cckk.....kkk............",
      "...............................",
      "....ccc...............cckk.....",
      "..........SSs..................",
      "..............kkk...........kk.",
    ], WALL, "scrapes");
    block(p, 15, 63, [".hh.", "hJgj", ".jj."], WALL, "dent");
  }),

  /**
   * The roof leaked one typhoon summer. The stain was painted over and came back as a tide line, and
   * now the limewash is lifting at its edge in one curled flake. Lower down, a chip in the dado shows
   * every coat the ward has worn: today's jade, a cream undercoat, and the pale blue of the seventies.
   */
  "ward/wall-peel": slice((p) => {
    wardWall(p, 61);
    block(p, 10, 11, [
      "......yyyyyyy.......",
      "...yyyCCCCCCCyyy....",
      "..yCCCCCCCCCCCCCyy..",
      ".yCCCCCCCCCCCCCCCCy.",
      "yCCCCCCCCCCCCCCCCCY.",
      "YCCCCCCCCCCCCCCCCYY.",
      ".YYCCCCCCCCCCCCCCY..",
      "..YYYCCCCCCCCCCYYY..",
      "....YYYYYCCYYYYY....",
      ".......YYYYYY.......",
    ], { ...WALL, C: "bamboo5" }, "tide-line");
    // The flake: limewash curled up off the plaster, lit on its rolled lip, grey bare plaster beneath.
    block(p, 22, 15, [
      "..WWC.",
      ".WCcck",
      "WCkttt",
      "Ck.tts",
      "...ss.",
    ], WALL, "flake");
    block(p, 6, 59, [
      ".hhhh.......",
      "hkCCkhhh....",
      "hkbBBbCkhh..",
      ".hkbbBBbkkh.",
      "..hhkbbkhh..",
      "....hhhh....",
    ], WALL, "paint-layers");
  }),

  /** The left half of a bed head-wall: the services rail begins, the oxygen outlet capped and unused. */
  "ward/wall-oxygen": slice((p) => {
    wardWall(p, 71);
    servicesRail(p, 4, 31, true, false);
    oxygenOutlet(p, 13);
    // The dust cap swinging on its bead chain.
    for (const [x, y] of [[18, 46], [18, 47], [19, 48], [19, 49]] as const) p.px(x, y, "steel3");
    block(p, 18, 50, [".hh", "hJJ", "hJh"], WALL, "dust-cap");
  }),

  /**
   * The elder's head-wall: the oxygen outlet with a flowmeter plugged in, its float resting low, and the
   * humidifier bottle of water hung beneath, a strip of tape on it with a date in biro, faded to nothing.
   */
  "ward/wall-oxygen-b": slice((p) => {
    wardWall(p, 73);
    servicesRail(p, 4, 31, true, false);
    oxygenOutlet(p, 13);
    block(p, 13, 46, [
      ".fEEf..",
      "fEeeEfh",
      "fEEEEfJ",
      ".fFFf..",
    ], WALL, "flowmeter-body");
    for (let y = 50; y < 60; y++) {
      p.faded(0.7, () => p.px(15, y, "blue6").px(16, y, "white").px(17, y, "blue5"));
      p.px(14, y, "steel3").px(18, y, "steel2");
    }
    p.px(16, 57, "jade4").px(16, 58, "jade3");
    block(p, 13, 60, [".fFFf..", "..ff...", "..ff..."], WALL, "neck");
    block(p, 12, 63, [".WWWWW.", "WWWWWWk", "eEEEEEf"], WALL, "lid");
    for (let y = 66; y < 77; y++) {
      p.px(12, y, "steel4").px(18, y, "steel3");
      p.faded(0.65, () => { for (let x = 13; x < 18; x++) p.px(x, y, y < 69 ? "blue6" : x === 13 ? "white" : "blue5"); });
    }
    p.hline(13, 77, 5, "steel3");
    block(p, 13, 70, ["yyyyy", "yYyYy"], WALL, "date-tape");
  }),

  /**
   * The right half of the player's head-wall: two sockets and the bed-lamp rocker. The second socket
   * sparked once, so a nurse taped it over with a cross of yellowed tape and nobody has come since.
   */
  "ward/wall-sockets": slice((p) => {
    wardWall(p, 81);
    servicesRail(p, 0, 26, false, true);
    socket(p, 2);
    socket(p, 11);
    rocker(p, 20);
    block(p, 10, 39, [
      "yY.....",
      ".yY..Yy",
      "..yYyY.",
      "...yy..",
      "..YyyY.",
      ".Yy..yY",
      "yY.....",
    ], WALL, "tape");
  }),

  /**
   * The elder's sockets: his grandson's phone charger has lived in the first one since spring, its
   * white cable looped down over the rail to wherever the phone is today.
   */
  "ward/wall-sockets-b": slice((p) => {
    wardWall(p, 83);
    servicesRail(p, 0, 26, false, true);
    socket(p, 2);
    socket(p, 11);
    rocker(p, 20);
    block(p, 2, 40, ["CWWWWC", "WWWWWk", "WWeWWk", "WWWWWk", "CkkkkK", ".kWWk.", "..WC.."], WALL, "charger");
    for (const [x, y] of [[4, 47], [4, 48], [5, 49], [5, 50], [5, 51], [5, 52], [6, 53], [6, 54], [6, 55], [7, 56], [7, 57], [8, 58], [8, 59], [9, 60], [10, 61], [11, 61], [12, 60], [13, 59], [14, 57], [14, 56]] as const) {
      p.px(x, y, "white").px(x + 1, y, "cream3");
    }
  }),

  /** The leftmost slice, against the left side wall, in its shadow. */
  "ward/wall-end-left": slice((p) => { wardWall(p, 101); cornerShadow(p, "left"); }),

  /** The rightmost slice, against the right side wall. */
  "ward/wall-end-right": slice((p) => { wardWall(p, 103); cornerShadow(p, "right"); }),
});
