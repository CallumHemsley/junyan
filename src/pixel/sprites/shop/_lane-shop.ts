/**
 * Procedural lane shops and lock-ups for the `building-shop` and `building-shutter` props that are
 * not named landmarks (ticket 0175's dense lanes added them, and more may come). Everything is
 * chosen from the prop's id hash, `variant` and footprint, so each instance is its own shop and
 * stays the same shop every bake.
 *
 * Each building: the lanes' hipped pantile roof (`laneRoof`, read-only from 0164's kit) with one or
 * two things on it; an upper storey of grey brick or render with lane windows; and a ground floor
 * made by its trade, with a blank sign board, its own awning or none, a window display and one story
 * detail. Trades: tobacco and sundries kiosk, tailor, noodle shop, fruit shop, hardware, barber,
 * pharmacy, repair stall. Lock-ups: half up with the owner's legs showing, down under abstract
 * posters, open on a parked scooter, down with a hand-painted repair.
 */
import { hash, type Color, type Px } from "../../kit/index.ts";
import type { TownProp } from "../../town/map.ts";
import {
  acUnit as laneAc, aerial, bricks, laneRoof, laneWindow, laundryPole, plinth, quiltRack, skylight, solarHeater,
  stringCourse, tarp, tigerWindow,
} from "../bldg/_lane.ts";
import { block, rollerShutter, signboard, step, stucco, wisp, zrect } from "./_front.ts";

export const TRADES = ["kiosk", "tailor", "noodle", "fruit", "hardware", "barber", "pharmacy", "repair"] as const;
export type Trade = (typeof TRADES)[number];
export const LOCKUPS = ["legs", "posters", "scooter", "painted"] as const;
export type Lockup = (typeof LOCKUPS)[number];

/** A stable 32-bit hash of a string (FNV-1a). */
export function idHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const tradeOf = (prop: TownProp): Trade => TRADES[((idHash(prop.id) >>> 7) + prop.variant * 3) % TRADES.length];
export const lockupOf = (prop: TownProp): Lockup => LOCKUPS[((idHash(prop.id) >>> 7) + prop.variant) % LOCKUPS.length];

/** Ground floor: the shopfront spans z 0..62, the sign board z 64..77, a string course at z 78. */
const OPEN_TOP = 62, SIGN0 = 64, SIGN1 = 78;

type Ctx = { p: Px; w: number; H: number; seed: number; frame: number };

// ── the building around the shop ────────────────────────────────────────────

/** Facade height for a plot `h` tall: two storeys where there is room, one where there is not. */
const facadeHeight = (h: number) => (h >= 200 ? 144 : Math.max(96, Math.min(128, h - 40)));

function body(c: Ctx, F: number, brick: boolean) {
  const { p, w, H, seed } = c;
  const roofH = H - F + 1;
  laneRoof(p, 0, 0, w, roofH, { seed, ridgeY: Math.max(6, Math.min(44, Math.round(roofH * 0.26))), damp: 0.07 });
  roofLife(p, w, roofH, seed);
  // Upper storey.
  const up0 = SIGN1 + 4;
  if (brick) bricks(p, 0, H - F, w, F - up0, seed);
  else stucco(p, 0, H - F, w, F - up0, seed, { base: "cream3", lit: "cream4", dim: "cream2" });
  const upH = F - up0;
  if (upH >= 34) {
    const n = w >= 176 ? 2 : 1, ww = 26, wh = Math.min(38, upH - 12);
    for (let k = 0; k < n; k++) {
      const x = Math.round(((k + 0.5) * w) / n - ww / 2);
      const r = hash(k, 3, seed);
      laneWindow(p, x, H - F + 6, ww, wh, {
        seed: seed + k, glass: r < 0.4 ? "curtain" : r < 0.7 ? "sky" : "dark",
        curtain: (["cream", "plum", "jade", "pink"] as const)[Math.floor(hash(k, 4, seed) * 4)],
        shutters: r < 0.5 ? "open" : null, shutterTone: (["jade", "wood", "blue", "cream"] as const)[Math.floor(hash(k, 5, seed) * 4)],
        cage: r > 0.8, sill: r < 0.3 ? "plants" : "plain", frame: brick ? "wood" : "jade",
      });
    }
    // Something of the household upstairs: an AC unit, or a pole of laundry.
    if (hash(1, 9, seed) < 0.5) laneAc(p, w - 30, H - F + 10, seed);
    else laundryPole(p, 6, H - F + 8, Math.min(w - 12, 60), seed, ["shirt", "towel", "socks"]);
  }
  p.hline(0, H - F, w, "stone4");
  stringCourse(p, 0, H - 1 - SIGN1 - 3, w, seed);
  p.vline(0, H - F, F, "steel1").vline(w - 1, H - F, F, "steel1");
}

/** One or two lived-in things on the roof, picked by hash and room. */
function roofLife(p: Px, w: number, roofH: number, seed: number) {
  const ridge = Math.max(6, Math.min(44, Math.round(roofH * 0.26)));
  const near = roofH - ridge - 14;
  if (near < 30) return;
  const pick = Math.floor(hash(2, 2, seed) * 5);
  const midY = ridge + 10 + Math.floor(near * 0.3);
  if (pick === 0 && w >= 120) tigerWindow(p, Math.round(w / 2 - 18), midY, seed, { w: 36, plant: true });
  else if (pick === 1 && w >= 64) solarHeater(p, Math.round(w / 2 - 20), midY);
  else if (pick === 2) skylight(p, Math.round(w * 0.3), midY, 22, 16);
  else if (pick === 3) tarp(p, Math.round(w * 0.4), midY + 6, 30, 16, seed);
  else quiltRack(p, Math.round(w * 0.25), midY, Math.min(48, w - 40), "check");
  if (hash(3, 3, seed) < 0.5) aerial(p, Math.round(w * 0.75), ridge + 2);
}

/** A small canvas awning hung at the top of the opening, sagging, `colors` striped, scalloped or straight. */
function miniAwning(c: Ctx, a: Color, b: Color, scallop: boolean, patch = false) {
  const { p, w, H } = c;
  const top = H - 1 - SIGN0, depth = 9, drop = 6, x0 = 3, x1 = w - 3;
  p.hline(x0, top - 1, x1 - x0, "steel2");
  const bottoms: number[] = [];
  for (let x = x0; x < x1; x++) {
    const t = (x - x0) / (x1 - x0), sag = Math.round(2 * Math.sin(Math.PI * t));
    const col = Math.floor((x - x0) / 8) % 2 === 0 ? a : b, k = (x - x0) % 8;
    for (let y = top; y < top + depth + sag; y++) p.px(x, y, y < top + 2 ? step(col, -1) : col);
    p.px(x, top + depth + sag, step(col, 1));
    let bot = top + depth + sag + drop;
    if (scallop) bot += Math.round(2 * Math.sqrt(Math.max(0, 1 - ((k + 0.5 - 4) / 4) ** 2))) - 1;
    for (let y = top + depth + sag + 1; y <= bot; y++) p.px(x, y, y === bot || y === top + depth + sag + 1 ? step(col, -2) : step(col, -1));
    bottoms.push(bot);
  }
  for (const ex of [x0, x1 - 1]) for (let y = top; y <= bottoms[ex - x0]; y++) p.px(ex, y, step(p.get(ex, y) ?? "ink", -2));
  if (patch) {
    const px0 = x0 + Math.round((x1 - x0) * 0.6);
    p.rect(px0, top + 2, 10, 6, "jade4").hline(px0, top + 2, 10, "jade5");
    for (let i = 1; i < 10; i += 2) p.px(px0 + i, top + 3, "cream4").px(px0 + i, top + 7, "cream4");
  }
  // The awning's soft shadow on the shopfront below: one step darker, two rows.
  for (let x = x0 + 2; x < x1; x++) for (let r = 1; r <= 2; r++) { const y = bottoms[x - x0 - 2] + r, cc = p.get(x, y); if (cc) p.px(x, y, step(cc, -1)); }
}

/** Piers either side and the dark opening between, the floor inside lit by the street. */
function opening(c: Ctx, x0: number, x1: number, tone: Color = "wood1") {
  const { p, H } = c;
  for (let j = 4; j < OPEN_TOP; j++) zrect(p, H, x0, j, x1 - x0, j + 1, j < 10 ? step(tone, 1) : j < 40 ? tone : "ink2");
}

function piers(c: Ctx, brick: boolean) {
  const { p, w, H, seed } = c;
  for (const x of [0, w - 6]) {
    if (brick) bricks(p, x, H - SIGN1, 6, SIGN1 - 4, seed + x);
    else { zrect(p, H, x, 4, 6, SIGN1, "cream3"); zrect(p, H, x, 4, 1, SIGN1, "cream4"); zrect(p, H, x + 5, 4, 1, SIGN1, "cream1"); }
  }
  plinth(p, 0, H, w, seed, 4);
}

// ── trades ──────────────────────────────────────────────────────────────────

/** Tobacco and sundries: a glazed hatch over a counter of packs, snacks on clips, the old public phone. */
function kiosk(c: Ctx) {
  const { p, w, H } = c;
  opening(c, 6, w - 6);
  // The counter cabinet, glass-fronted, packs in rows.
  zrect(p, H, 8, 4, w - 16, 26, "steel5");
  zrect(p, H, 10, 8, w - 20, 24, "blue6");
  for (let i = 12; i < w - 14; i += 5) for (const z of [10, 17]) zrect(p, H, i, z, 4, z + 5, (["blue3", "gold3", "white", "jade3", "steel4", "orange2"] as Color[])[Math.floor(hash(i, z, c.seed) * 6)]);
  zrect(p, H, 8, 25, w - 16, 27, "steel6");
  // Snacks on a line of clips across the top of the hatch.
  p.hline(10, H - 58, w - 20, "steel3");
  for (let i = 14; i < w - 16; i += 9) block(p, i, H - 57, ["aa", "bb", "bb", "bb", "cc"].map((r) => r + "."), { a: "steel4", b: (["orange3", "gold4", "jade4", "pink3", "blue4"] as Color[])[Math.floor(hash(i, 2, c.seed) * 5)], c: "steel3" }, "snack");
  // The public phone on the counter: cream with a jade handset, its coiled cord.
  block(p, w - 34, H - 36, ["..aaaaaa..", ".abbbbbba.", "acccccccca", "abdbdbdbba", "abbbbbbbba", "aaaaaaaaaa"], { a: "jade1", b: "cream4", c: "jade3", d: "steel3" }, "phone");
  for (let j = 0; j < 6; j++) p.px(w - 36 + (j % 2), H - 34 + j, "jade2");
  // A drinks fridge glowing at the back.
  p.rect(14, H - 58, 18, 26, "white").frame(14, H - 58, 18, 26, "steel3");
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) p.rect(16 + i * 3, H - 54 + j * 8, 2, 6, (["jade3", "orange2", "blue3"] as Color[])[(i + j) % 3]);
  piers(c, true);
  signboard(p, 8, H - 1 - SIGN1 + 1, w - 16, SIGN1 - SIGN0 - 1, "light");
  // A tin canopy instead of an awning, rippled.
  for (let i = 4; i < w - 4; i++) { p.px(i, H - 1 - SIGN0, i % 3 ? "steel4" : "steel5"); p.px(i, H - SIGN0, i % 3 ? "steel3" : "steel4"); p.px(i, H - SIGN0 + 1, "steel1"); }
}

/** The tailor: bolts of cloth stacked in the window, a dress form with a tape, a jacket on the door. */
function tailor(c: Ctx) {
  const { p, w, H, seed } = c;
  const doorX = w - 36;
  opening(c, 6, doorX - 2, "cream2");
  zrect(p, H, 6, 4, doorX - 8, 16, "wood2");
  zrect(p, H, 6, 15, doorX - 8, 17, "wood4");
  // Bolts of cloth lying in a pyramid, ends showing their roll.
  const cloths: Color[] = ["plum3", "blue3", "jade3", "cream4", "wood3", "grey2", "pink2", "blue4"];
  let k = 0;
  for (let row = 0; row < 3; row++) for (let i = 10 + row * 6; i < doorX - 28 - row * 6; i += 12, k++) {
    const col = cloths[Math.floor(hash(k, 1, seed) * cloths.length)];
    const by = H - 18 - row * 8;
    p.rect(i, by - 7, 11, 7, col).hline(i, by - 7, 11, step(col, 1)).hline(i, by - 1, 11, step(col, -1));
    p.rect(i + 1, by - 5, 2, 3, step(col, -2));
  }
  // The dress form, a tape round its neck, pins in its shoulder.
  const fx = doorX - 22;
  block(p, fx, H - 58, [
    "..aaaa..", ".abbbba.", "abbbbbba", "abbccbba", "abbbbbba", ".abbbba.", ".abbbba.", "abbbbbba", "abbbbbba", ".aaaaaa.",
    "...dd...", "...dd...", "...dd...", "...dd...", "..dddd..", ".dddddd.",
  ], { a: "cream2", b: "cream4", c: "gold4", d: "wood2" }, "dress-form");
  p.line(fx + 1, H - 56, fx + 4, H - 48, "gold4").line(fx + 6, H - 56, fx + 5, H - 47, "gold4");
  // The door: half glass with lace, a finished jacket hanging on it in its paper.
  door(c, doorX, "plum2");
  block(p, doorX + 6, H - 52, ["...a...", "..a.a..", ".bbbbb.", "bcbbbcb", "bcbbbcb", "bbbbbbb", "bbbdbbb", "bbbbbbb", ".bbbbb."], { a: "steel3", b: "blue2", c: "blue3", d: "cream5" }, "jacket");
  piers(c, false);
  signboard(p, 10, H - 1 - SIGN1 + 2, w - 20, SIGN1 - SIGN0 - 3, "wood", seed);
  miniAwning(c, "plum2", "cream4", true);
}

/** The noodle shop: a counter with the stock pot steaming, bowls stacked, noodles drying on a rod. */
function noodle(c: Ctx) {
  const { p, w, H, seed, frame } = c;
  opening(c, 6, w - 6, "wood2");
  // The back wall: white tiles and a blank menu board.
  zrect(p, H, 8, 30, w - 16, OPEN_TOP, "cream4");
  for (let i = 8; i < w - 8; i += 6) zrect(p, H, i, 30, 1, OPEN_TOP, "cream3");
  for (let z = 36; z < OPEN_TOP; z += 6) zrect(p, H, 8, z, w - 16, z + 1, "cream3");
  p.rect(w - 50, H - 58, 34, 16, "ink2").frame(w - 50, H - 58, 34, 16, "wood3");
  // The counter: steel top, a tiled front.
  zrect(p, H, 6, 4, w - 12, 26, "jade4");
  for (let i = 8; i < w - 8; i += 6) zrect(p, H, i, 4, 1, 24, "jade3");
  for (let z = 9; z < 24; z += 5) zrect(p, H, 6, z, w - 12, z + 1, "jade3");
  zrect(p, H, 6, 24, w - 12, 28, "steel4");
  zrect(p, H, 6, 27, w - 12, 28, "steel6");
  // The stock pot on its burner, steaming; bowls in a stack, a ladle hung up.
  const px0 = 16;
  block(p, px0, H - 37, [
    ".aaaaaaaaaaaaaaaaa.",
    "abbbbbbbbbbbbbbbbba",
    "accccccccccccccccca",
    ".adddddddddddddda..",
    ".adeeeeedddeeeeda..",
    ".adddddddddddddda..",
    ".adddddddddddddda..",
    "..aaaaaaaaaaaaaa...",
  ].map((r) => r.padEnd(19, ".")), { a: "steel1", b: "steel4", c: "wood3", d: "steel4", e: "steel5" }, "pot");
  wisp(p, px0 + 9, H - 38, frame, 4, 18, false, seed, 1.3);
  wisp(p, px0 + 5, H - 37, (frame + 2) % 4, 4, 14, false, seed + 3, 1);
  for (let k = 0; k < 4; k++) block(p, px0 + 30, H - 31 - k * 3, ["aaaaaaaa", ".abccba."], { a: "white", b: "blue3", c: "blue4" }, "bowl");
  p.vline(px0 + 46, H - 58, 12, "steel3").ellipse(px0 + 46, H - 45, 2.5, 2, "steel4");
  // Hand-pulled noodles drying over a bamboo rod at the side.
  p.hline(w - 46, H - 40, 30, "bamboo2");
  for (let i = w - 44; i < w - 18; i++) if (i % 2 === 0) p.vline(i, H - 39, 8 + (i % 3), "cream4");
  piers(c, hash(4, 4, seed) < 0.5);
  signboard(p, 8, H - 1 - SIGN1 + 1, w - 16, SIGN1 - SIGN0 - 1, "painted", seed);
  miniAwning(c, "jade3", "cream4", false);
}

/** The fruit shop: crates spilling oranges, pears and bananas onto the step, a scale and a bare bulb. */
function fruit(c: Ctx) {
  const { p, w, H, seed } = c;
  opening(c, 6, w - 6, "wood1");
  const crate = (x: number, z: number, cw: number, fruitC: [Color, Color, Color]) => {
    zrect(p, H, x, z, cw, z + 10, "oak3");
    zrect(p, H, x, z + 9, cw, z + 10, "oak4");
    zrect(p, H, x, z + 4, cw, z + 5, "oak2");
    for (let i = 1; i < cw - 2; i += 4) for (let r = 0; r < 2; r++) {
      const fx = x + i + (r % 2) * 2, fy = H - 1 - z - 11 - r * 3;
      p.rect(fx, fy, 3, 3, fruitC[0]).px(fx, fy, fruitC[2]).px(fx + 2, fy + 2, fruitC[1]);
    }
  };
  const fruits: [Color, Color, Color][] = [["orange2", "orange1", "orange3"], ["leaf4", "leaf3", "leaf5"], ["gold4", "gold2", "gold5"], ["plum3", "plum2", "plum4"], ["orange3", "orange2", "gold5"]];
  let k = 0;
  for (let tier = 0; tier < 3; tier++) for (let x = 10 + tier * 4; x < w - 30 - tier * 4; x += 24, k++)
    crate(x, 4 + tier * 14, 22, fruits[Math.floor(hash(k, 1, seed) * fruits.length)]);
  // A bunch of bananas hung up, a hanging scale, a bare bulb on its flex.
  block(p, w - 26, H - 58, ["...a....", "..bbb...", ".bcbcb..", "bcbcbcb.", "cbcbcbc.", ".c.c.c.."], { a: "wood2", b: "gold4", c: "gold3" }, "bananas");
  p.vline(w - 40, H - 62, 10, "steel2").rect(w - 44, H - 52, 9, 6, "steel4").frame(w - 44, H - 52, 9, 6, "steel2").hline(w - 46, H - 44, 13, "steel3");
  p.vline(w / 2, H - 62, 8, "ink2").ellipse(w / 2, H - 52, 2.5, 3, "gold5");
  // Blank price slips stuck into the fruit on cardboard.
  for (let i = 18; i < w - 40; i += 30) p.rect(i, H - 30, 7, 5, "cream5").hline(i, H - 26, 7, "cream2");
  piers(c, true);
  signboard(p, 8, H - 1 - SIGN1 + 1, w - 16, SIGN1 - SIGN0 - 1, "enamel");
  miniAwning(c, "blue3", "white", true);
}

/** Hardware: brooms, buckets, rope and hose hung across the front; enamel basins stacked by the door. */
function hardware(c: Ctx) {
  const { p, w, H, seed } = c;
  opening(c, 6, w - 6, "wood1");
  // Shelves of tins at the back.
  for (const z of [30, 42, 54]) { zrect(p, H, 8, z, w - 16, z + 1, "wood3"); for (let i = 10; i < w - 12; i += 5) zrect(p, H, i, z + 1, 4, z + 5 + Math.floor(hash(i, z, seed) * 3), (["steel4", "gold3", "jade3", "blue3", "cream3"] as Color[])[Math.floor(hash(i, z, seed + 1) * 5)]); }
  // The rail across the top with everything hung from it.
  p.hline(4, H - 60, w - 8, "steel2");
  for (let i = 10; i < w - 12; i += 16) {
    const kind = Math.floor(hash(i, 5, seed) * 4);
    if (kind === 0) block(p, i, H - 59, ["..a..", "..a..", "..a..", "..a..", "..a..", "..a..", ".bbb.", "bcbcb", "bcbcb", "bcbcb"], { a: "bamboo3", b: "bamboo2", c: "bamboo4" }, "broom");
    else if (kind === 1) block(p, i, H - 59, [".a.a.", "a...a", "bbbbb", "bcccb", "bcccb", ".bbb."], { a: "steel3", b: "blue2", c: "blue4" }, "bucket");
    else if (kind === 2) { p.ellipse(i + 4, H - 52, 5, 5, "bamboo3"); p.ellipse(i + 4, H - 52, 3, 3, "ink2"); p.ellipse(i + 4, H - 52, 4, 4, "bamboo2"); p.ellipse(i + 4, H - 52, 2.5, 2.5, "ink2"); }
    else block(p, i, H - 59, ["..a..", ".bcb.", ".bcb.", ".bcb.", "..d..", "..d..", "..d.."], { a: "steel3", b: "steel4", c: "steel6", d: "wood3" }, "dustpan");
  }
  // Enamel basins stacked by the door, blue rims, and a feather duster in the top one.
  for (let k = 0; k < 4; k++) p.rect(w - 34 - k, H - 8 - k * 3, 22 + 2 * k, 3, "white").hline(w - 34 - k, H - 6 - k * 3, 22 + 2 * k, "blue3");
  block(p, w - 24, H - 32, ["a.b.a", ".bab.", "babab", ".bab.", "..c..", "..c..", "..c.."], { a: "plum3", b: "orange2", c: "wood2" }, "duster");
  piers(c, true);
  signboard(p, 8, H - 1 - SIGN1 + 1, w - 16, SIGN1 - SIGN0 - 1, "enamel");
}

/** The barber: a glass door, a turning pole in blue, white and jade, the chair and its mirror, towels drying. */
function barber(c: Ctx) {
  const { p, w, H, seed, frame } = c;
  const doorX = Math.round(w / 2 - 14);
  opening(c, 6, w - 6, "cream2");
  // Inside: the mirror's glints, the chair's back and headrest.
  p.rect(12, H - 56, doorX - 18, 18, "blue4").frame(12, H - 56, doorX - 18, 18, "wood2");
  p.line(16, H - 42, 22, H - 52, "blue6");
  block(p, 18, H - 34, ["..aaaa..", ".abbbba.", ".abbbba.", "aaaaaaaa", "acccccca", "a......a"], { a: "ink2", b: "plum2", c: "steel4" }, "chair");
  door(c, doorX, "jade2");
  // The pole: a glass cylinder with a turning spiral (animated), brass caps.
  const bx = doorX + 34;
  p.rect(bx, H - 60, 6, 3, "gold3").rect(bx, H - 28, 6, 3, "gold2");
  for (let j = 0; j < 29; j++) for (let i = 0; i < 6; i++) {
    const band = Math.floor((j + i + frame * 2) / 3) % 3;
    p.px(bx + i, H - 57 + j, (["blue3", "white", "jade3"] as Color[])[band]);
  }
  p.vline(bx, H - 57, 29, "steel5").vline(bx + 5, H - 57, 29, "steel2");
  // Towels drying on a rail outside the window.
  p.hline(w - 46, H - 30, 36, "steel3");
  for (let k = 0; k < 3; k++) { const tx = w - 44 + k * 12; p.rect(tx, H - 29, 9, 11, k === 1 ? "jade5" : "white").hline(tx, H - 19, 9, "steel4").vline(tx + 8, H - 29, 11, k === 1 ? "jade4" : "cream3"); }
  piers(c, false);
  signboard(p, 10, H - 1 - SIGN1 + 2, w - 20, SIGN1 - SIGN0 - 3, "wood", seed);
}

/** The pharmacy: a white counter, the wall of little wooden drawers, jars, a green cross lightbox. */
function pharmacy(c: Ctx) {
  const { p, w, H } = c;
  opening(c, 6, w - 6, "cream3");
  // The hundred-drawer cabinet behind the counter, brass pulls.
  const cx0 = 10, cw = w - 20;
  zrect(p, H, cx0, 26, cw, OPEN_TOP - 2, "wood2");
  for (let z = 28; z < OPEN_TOP - 4; z += 7) for (let i = cx0 + 2; i < cx0 + cw - 8; i += 9) {
    zrect(p, H, i, z, 8, z + 6, "wood4");
    zrect(p, H, i, z + 5, 8, z + 6, "wood5");
    p.px(i + 4, H - 1 - z - 3, "gold4");
  }
  // White counter with glass jars and paper packets tied with string; a brass herb scale.
  zrect(p, H, 6, 4, w - 12, 24, "white");
  zrect(p, H, 6, 23, w - 12, 26, "steel5");
  zrect(p, H, 6, 4, w - 12, 6, "steel4");
  for (let i = 14; i < w / 2; i += 10) block(p, i, H - 33, [".aa.", "abba", "acca", "abba", "aaaa"], { a: "steel5", b: "blue6", c: (["jade4", "gold4", "wood4"] as Color[])[i % 3] }, "jar");
  for (let k = 0; k < 3; k++) p.rect(w / 2 + 6 + k * 9, H - 30, 8, 5, "cream4").vline(w / 2 + 10 + k * 9, H - 30, 5, "wood3");
  block(p, w - 34, H - 36, ["....a....", "aaaaaaaaa", "b...a...b", "cc..a..cc", "....a....", "..ddddd.."], { a: "gold2", b: "gold1", c: "gold3", d: "gold1" }, "scale");
  piers(c, false);
  signboard(p, 8, H - 1 - SIGN1 + 1, w - 32, SIGN1 - SIGN0 - 1, "light");
  // The green cross lightbox at the end of the board.
  block(p, w - 22, H - 1 - SIGN1 + 1, ["..aaaa..", "..abba..", "aaabbaaa", "abbbbbba", "abbbbbba", "aaabbaaa", "..abba..", "..aaaa.."], { a: "jade2", b: "jade5" }, "cross");
}

/** A tiny repair stall: a bench at the front with a lamp, radios and phones in bits, cables, a key cutter. */
function repair(c: Ctx) {
  const { p, w, H, seed } = c;
  opening(c, 6, w - 6, "wood1");
  // Shelves of radios and handsets waiting, labelled with blank tags.
  for (const z of [40, 52]) { zrect(p, H, 8, z, w - 16, z + 1, "wood3"); for (let i = 10; i < w - 18; i += 14) { zrect(p, H, i, z + 1, 11, z + 8, (["wood3", "steel3", "jade2", "cream3"] as Color[])[Math.floor(hash(i, z, seed) * 4)]); p.px(i + 2, H - 1 - z - 4, "steel5"); p.rect(i + 7, H - 1 - z - 6, 2, 3, "cream5"); } }
  // The bench across the front: oak top, a desk lamp lit, a radio open on its back, a key cutter.
  zrect(p, H, 6, 4, w - 12, 22, "oak2");
  zrect(p, H, 6, 21, w - 12, 25, "oak4");
  zrect(p, H, 6, 24, w - 12, 25, "oak5");
  block(p, 14, H - 38, ["aaaa....", "abba....", ".ac.....", "..c.....", "..c.....", ".ddd...."], { a: "jade2", b: "gold5", c: "steel3", d: "steel2" }, "lamp");
  p.rect(26, H - 30, 18, 5, "wood3").rect(28, H - 29, 14, 3, "jade2").px(31, H - 28, "gold4").px(37, H - 28, "orange2");
  block(p, w - 34, H - 33, ["..aaaa..", ".abbbba.", "abcccbba", "abbbbbba", "aaaaaaaa"], { a: "steel1", b: "steel4", c: "steel6" }, "key-cutter");
  // Cables hung in loops from a nail.
  for (let k = 0; k < 3; k++) for (let j = 0; j < 10 + k * 3; j++) p.px(w - 20 - Math.round(Math.sin((j / (10 + k * 3)) * Math.PI) * (3 + k)), H - 60 + j, (["ink2", "jade3", "steel2"] as Color[])[k]);
  piers(c, true);
  signboard(p, 8, H - 1 - SIGN1 + 1, w - 16, SIGN1 - SIGN0 - 1, "painted", seed);
  miniAwning(c, "bamboo3", "stone3", false, true);
}

/** A half-glazed shop door, `tone` paint, with lace in the glass and a brass handle; 28 wide at x. */
function door(c: Ctx, x: number, tone: Color) {
  const { p, H } = c;
  zrect(p, H, x - 2, 0, 32, OPEN_TOP, step(tone, -1));
  zrect(p, H, x, 3, 28, OPEN_TOP - 1, tone);
  zrect(p, H, x, 3, 1, OPEN_TOP - 1, step(tone, 1));
  p.rect(x + 4, H - 58, 20, 26, "white");
  for (let i = x + 5; i < x + 24; i += 3) p.vline(i, H - 57, 24, "cream4");
  zrect(p, H, x + 4, 7, 20, 26, step(tone, -1));
  zrect(p, H, x + 5, 8, 18, 25, tone);
  p.rect(x + 22, H - 34, 2, 4, "gold3").px(x + 22, H - 34, "gold5");
  zrect(p, H, x - 2, 0, 32, 3, "stone4");
}

const TRADE_DRAW: Record<Trade, (c: Ctx) => void> = { kiosk, tailor, noodle, fruit, hardware, barber, pharmacy, repair };

/** A procedural lane shop for any `building-shop` prop that is not a named landmark. */
export function laneShop(p: Px, prop: TownProp, w: number, h: number, frame: number) {
  const seed = idHash(prop.id) % 100000;
  const c: Ctx = { p, w, H: h, seed, frame };
  const F = facadeHeight(h);
  body(c, F, hash(seed, 1) < 0.55);
  TRADE_DRAW[tradeOf(prop)](c);
}

// ── lock-ups ────────────────────────────────────────────────────────────────

/** Abstract posters on a shutter: overlapping rectangles, circles and stripes, faded, corners torn. */
function posters(c: Ctx, x0: number, x1: number, z0: number, z1: number) {
  const { p, H, seed } = c;
  const n = Math.max(2, Math.floor((x1 - x0) / 26));
  for (let k = 0; k < n; k++) {
    const pw = 16 + Math.floor(hash(k, 1, seed) * 10), ph = 20 + Math.floor(hash(k, 2, seed) * 10);
    const x = x0 + 4 + Math.floor(((x1 - x0 - pw - 8) * k) / Math.max(1, n - 1)), z = z0 + 6 + Math.floor(hash(k, 3, seed) * Math.max(1, z1 - z0 - ph - 12));
    const ground = (["cream4", "blue5", "pink3", "jade5", "gold5"] as Color[])[Math.floor(hash(k, 4, seed) * 5)];
    const y = H - z - ph;
    p.rect(x, y, pw, ph, ground);
    const motif = Math.floor(hash(k, 5, seed) * 3);
    if (motif === 0) p.ellipse(x + pw / 2, y + ph * 0.4, pw * 0.3, pw * 0.3, step(ground, -2));
    else if (motif === 1) for (let j = 3; j < ph - 3; j += 4) p.hline(x + 2, y + j, pw - 4, step(ground, -1));
    else { p.rect(x + 2, y + 2, pw - 4, ph * 0.5, step(ground, -2)); p.hline(x + 2, y + ph - 5, pw - 6, step(ground, -1)); }
    // Torn corner, curling.
    p.rect(x + pw - 4, y + ph - 4, 4, 4, "steel4").px(x + pw - 4, y + ph - 4, step(ground, -1));
  }
}

function lockupBay(c: Ctx, x0: number, x1: number, state: Lockup) {
  const { p, H, seed } = c;
  const top = H - 1 - OPEN_TOP, bw = x1 - x0, h = OPEN_TOP - 2;
  const down = state === "legs" ? 0.56 : state === "scooter" ? 0.12 : 1;
  zrect(p, H, x0, 2, bw, OPEN_TOP, "ink2");
  for (let j = 2; j < 12; j++) zrect(p, H, x0, j, bw, j + 1, "wood1");
  if (state === "scooter") {
    // A scooter parked nose out in the lit garage, a helmet on its mirror, shelves of clutter behind.
    zrect(p, H, x0, 12, bw, OPEN_TOP - 6, "cream2");
    zrect(p, H, x0, 12, bw, 14, "stone2");
    for (const z of [30, 44]) {
      zrect(p, H, x0 + 4, z, bw - 8, z + 1, "wood2");
      for (let i = x0 + 6; i < x1 - 10; i += 11) zrect(p, H, i, z + 1, 8, z + 6 + Math.floor(hash(i, z, seed) * 3), (["oak3", "steel4", "blue3", "jade4"] as Color[])[Math.floor(hash(i, z + 1, seed) * 4)]);
    }
    p.ellipse(x0 + bw / 2, H - 5, 14, 2.5, "stone2");
    const sx = x0 + Math.round(bw / 2) - 9;
    block(p, sx, H - 3 - 22, ["a.................a", "ab...............ba", ".a...gggggggg...a..", "..aaaggggggggaaa...", ".....aaaaaaaaa.....", "....acceddecca.....", "....acdddddca......", "....abbbbbbbba.....", "...abbbbbbbbbba....", "...abhbbbbbbbba....", "...abhbbbbbbbba....", "...abbbbiibbbba....", "....abbbbbbbba.....", "....abbbbbbbba.....", ".....abbbbbba......", "......abbbba.......", "......afkkfa.......", "......akffka.......", "......afkkfa.......", "......akffka.......", "......afkkfa.......", ".......aaaa........"], { a: "ink2", b: "jade3", c: "steel3", d: "white", e: "gold5", f: "ink", g: "plum1", h: "jade5", i: "steel5", k: "steel1" }, "scooter");
    block(p, sx + 16, H - 27, [".aaa.", "abbba", "abcba", ".aaa."], { a: "ink2", b: "cream4", c: "blue3" }, "helmet");
  }
  if (state === "legs") {
    // Under the half-raised shutter: the owner's legs as he sorts stock, a bucket, a crate.
    const lx = x0 + Math.round(bw * 0.4);
    const legs = [...Array(18).fill("abba.abba"), "acca.acca", "dddd.dddd", "ddddddddd"];
    block(p, lx, H - 3 - legs.length, legs, { a: "blue1", b: "blue2", c: "blue1", d: "ink" }, "legs");
    block(p, x0 + 8, H - 12, ["aaaaaaa", "abbbbba", ".abbba.", ".aaaaa."], { a: "steel2", b: "steel4" }, "bucket");
    p.rect(x1 - 30, H - 14, 20, 10, "oak3").hline(x1 - 30, H - 14, 20, "oak4").hline(x1 - 30, H - 9, 20, "oak2");
  }
  rollerShutter(p, x0, top, bw, h, down, seed + x0, state === "posters" ? 0.7 : 0.4);
  if (state === "posters") posters(c, x0, x1, 4, OPEN_TOP - 10);
  if (state === "painted") {
    // A dented run of slats replaced and painted by hand in jade, the brush strokes showing, and a
    // blank white panel painted on where a notice will go.
    const py = top + 22, ph = 18;
    for (let j = 0; j < ph; j++) {
      const l = Math.floor(hash(j, 1, seed) * 4), r = Math.floor(hash(j, 2, seed) * 4);
      p.hline(x0 + 6 + l, py + j, bw - 12 - l - r, (j % 3) === 0 ? "jade4" : "jade3");
    }
    for (let i = x0 + 10; i < x1 - 10; i += 7) p.px(i, py + ph, "jade3").px(i, py + ph + 1, "jade3");
    p.rect(x0 + Math.round(bw / 2) - 10, py + 4, 20, 10, "white").hline(x0 + Math.round(bw / 2) - 10, py + 13, 20, "cream3");
  }
}

/** A procedural lock-up for any `building-shutter` prop that is not a named landmark. */
export function laneShutter(p: Px, prop: TownProp, w: number, h: number, frame: number) {
  const seed = idHash(prop.id) % 100000;
  const c: Ctx = { p, w, H: h, seed, frame };
  const F = facadeHeight(h);
  body(c, F, hash(seed, 2) < 0.6);
  const first = lockupOf(prop);
  if (w >= 176) {
    const mid = Math.round(w / 2);
    lockupBay(c, 8, mid - 4, first);
    lockupBay(c, mid + 4, w - 8, LOCKUPS[(LOCKUPS.indexOf(first) + 1) % LOCKUPS.length]);
    zrect(p, h, mid - 4, 2, 8, SIGN1, "cream3");
    zrect(p, h, mid - 4, 2, 1, SIGN1, "cream4");
    zrect(p, h, mid + 3, 2, 1, SIGN1, "cream1");
  } else lockupBay(c, 8, w - 8, first);
  piers(c, hash(seed, 3) < 0.5);
  signboard(p, 8, h - 1 - SIGN1 + 1, w - 16, SIGN1 - SIGN0 - 1, hash(seed, 4) < 0.5 ? "painted" : "wood", seed);
}
