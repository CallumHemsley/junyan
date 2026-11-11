/**
 * The rooftop garden's architecture (ticket 0186): a shared Shanghai rooftop above the lanes, morning
 * soft, plants in every container. One sprite per map prop, id `rooftop/<id>`, anchored on the
 * footprint's bottom-centre (pipeline: src/pixel/world/maps.ts), built from the lane-house kit.
 *
 * - Parapets: lime-rendered walls with a tiled coping, pots and drying racks along them; the north
 *   parapet's rise shows the neighbouring rooftops beyond it. The east and west parapets run north–south,
 *   seen as a coping strip and a foreshortened inner face.
 * - The stair hut (its door on the east side, where the stairs and the exit are), its steps, the water
 *   tank on its stand, the tool bay, the pergola over the tea corner (its four posts are their own props)
 *   with a wisteria, the garden threshold (two posts and a lintel), the bamboo screen, pipes on the deck,
 *   a warm window, and floor marks: worn paving and weathering.
 */
import { defineSprites, hash, Px, TILE, type Color, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, outdoorMap, propSpriteId, type MapProp } from "../../world/maps.ts";
import {
  acUnit, block, bricks, castShadow, eave, facadeShell, laneRoof, laneWindow, laundryPole, lichen, moss, sillPlants, stain, tarp,
} from "./_lane.ts";

const MAP = "rooftop";
const props = (kind: string) => mapProps(MAP, kind);

/** A sprite rising `rise` px above its footprint, anchored on the footprint's bottom-centre. */
function sprite(prop: MapProp, rise: number, draw: (p: Px, w: number, h: number) => void, extra: Partial<SpriteDef> = {}): SpriteDef {
  const { w, h: foot } = footprintPx(prop);
  const h = foot + rise;
  return { w, h, anchor: [Math.round((prop.width * TILE) / 2), h - 1], draw: (p) => draw(p, w, h), ...extra };
}

// ── parapets ────────────────────────────────────────────────────────────────

/** Neighbouring rooftops beyond the north parapet: rows of grey pantile roofs, ridges, a chimney, aerials. */
function skyline(p: Px, w: number, rows: number, seed: number): void {
  // Two bands of roofs, the far one paler.
  for (let band = 0; band < 2; band++) {
    const top = band === 0 ? 0 : Math.round(rows * 0.42), hgt = band === 0 ? Math.round(rows * 0.5) : rows - Math.round(rows * 0.42);
    const T = new Px(w, hgt);
    laneRoof(T, 0, 0, w, hgt, { seed: seed + band, ridgeY: 2, copings: false, damp: 0.04 });
    const far: Partial<Record<Color, Color>> = { steel1: "steel3", steel2: "steel4", steel3: "steel4", stone2: "stone3", stone3: "stone4", ink: "steel3" };
    for (let y = 0; y < hgt; y++) for (let x = 0; x < w; x++) {
      const c = T.get(x, y);
      if (c) p.px(x, top + y, band === 0 ? far[c] ?? c : c);
    }
    // Party walls between the neighbours' houses.
    for (let x = 60 + Math.floor(hash(band, 1, seed) * 40); x < w; x += 120 + Math.floor(hash(x, band, seed) * 60)) {
      p.rect(x, top, 4, hgt - 4, band === 0 ? "stone5" : "stone4");
      p.vline(x + 4, top, hgt - 4, "steel2");
    }
  }
  // A chimney, a water tower and TV aerials poking up.
  for (let i = 0; i < Math.floor(w / 220); i++) {
    const x = 80 + Math.floor(hash(i, 3, seed) * (w - 160));
    if (i % 2) { p.rect(x, rows - 18, 8, 14, "rose3"); p.hline(x, rows - 18, 8, "rose4").vline(x + 7, rows - 18, 14, "rose1"); p.rect(x + 2, rows - 18, 4, 2, "ink"); }
    else { p.vline(x, rows - 22, 18, "steel2"); p.hline(x - 5, rows - 20, 11, "steel3"); p.hline(x - 3, rows - 16, 7, "steel3"); }
  }
}

/**
 * The north parapet: a rendered wall facing the garden, its coping tiled, bamboo drying poles and pots on
 * it, the neighbours' rooftops beyond. `face` is the wall's height above the deck.
 */
function northParapet(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, face = 30, copeY = base - face - 8;
  skyline(p, w, copeY, seed);
  wallFace(p, 0, copeY + 8, w, base, seed);
  coping(p, 0, copeY, w, seed);
  parapetLife(p, w, copeY, base, seed);
}

/** The south parapet: the same wall seen from the street side, a lower drop of render and stains. */
function southParapet(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, face = 26, copeY = base - face - 8;
  wallFace(p, 0, copeY + 8, w, base, seed);
  coping(p, 0, copeY, w, seed);
  parapetLife(p, w, copeY, base, seed + 5);
}

/** Lime render over brick: patchy, a damp line at its foot, brick showing where it fell, rust stains. */
function wallFace(p: Px, x: number, top: number, w: number, base: number, seed: number): void {
  p.rect(x, top, w, base - top + 1, "cream3");
  for (let y = top; y <= base; y++) for (let xx = x; xx < x + w; xx++) if (hash(xx >> 4, y >> 2, seed) > 0.88) p.px(xx, y, "cream2");
  for (let i = 0; i < Math.floor(w / 90); i++) {
    const fx = x + 10 + Math.floor(hash(i, 1, seed) * (w - 40)), fy = top + 4 + Math.floor(hash(i, 2, seed) * Math.max(1, base - top - 14));
    bricks(p, fx, fy, 14, 8, seed + i);
    p.hline(fx, fy - 1, 14, "cream4").vline(fx - 1, fy, 8, "cream4").hline(fx, fy + 8, 14, "cream1");
  }
  for (let i = 0; i < Math.floor(w / 160); i++) stain(p, x + 20 + Math.floor(hash(i, 3, seed) * (w - 40)), top, 5, base - top - 4);
  for (let xx = x; xx < x + w; xx++) { const d = 3 + Math.floor(hash(xx >> 2, 4, seed) * 4); for (let y = base - d; y <= base; y++) p.px(xx, y, y === base - d ? "jade5" : y > base - 2 ? "stone2" : "jade4"); }
  p.hline(x, base, w, "steel1");
}

/** A parapet's coping seen from above: a lime cap with a row of tiles and drip ends down its face. */
function coping(p: Px, x: number, y: number, w: number, seed: number): void {
  p.rect(x, y, w, 4, "stone4");
  p.hline(x, y, w, "stone5").hline(x, y + 3, w, "stone3");
  for (let xx = x; xx < x + w; xx++) if (hash(xx >> 3, y, seed) > 0.8) p.px(xx, y + 1, "stone3");
  eave(p, x, y + 3, w, 2);
}

/** What lives on a parapet: pots on the coping, bamboo drying poles on brackets with washing, a quilt. */
function parapetLife(p: Px, w: number, copeY: number, base: number, seed: number): void {
  for (let x = 30 + Math.floor(hash(1, 1, seed) * 40); x < w - 40; x += 70 + Math.floor(hash(x, 2, seed) * 80)) {
    const kind = hash(x, 3, seed);
    if (kind < 0.6) sillPlants(p, x, copeY + 1, 26, seed + x);
    else if (kind < 0.88) {
      // A bamboo drying pole on two iron brackets above the coping, today's washing on it.
      laundryPole(p, x, copeY - 14, 60, seed + x, (["shirt", "towel", "socks", "vest", "trousers", "pillow"] as const).filter((_, i) => hash(i, x, seed) > 0.4));
      for (const bx of [x + 1, x + 57]) p.vline(bx, copeY - 14, 16, "steel2");
    } else {
      // A quilt thrown over the wall to air: folded over the coping, its print and border hanging down the face.
      const tones: [Color, Color, Color][] = [["pink3", "pink2", "pink1"], ["blue5", "blue4", "blue2"], ["jade5", "jade4", "jade2"]];
      const [lit, face, shade] = tones[Math.floor(hash(x, 4, seed) * 3)];
      const qw = 30, qh = Math.min(20, base - copeY - 6);
      p.rect(x, copeY - 1, qw, 4, lit);
      p.hline(x, copeY - 1, qw, "white");
      p.rect(x, copeY + 3, qw, qh, face);
      p.frame(x + 2, copeY + 5, qw - 4, qh - 4, shade);
      for (let k = 6; k < qw - 4; k += 7) block(p, x + k - 1, copeY + 7 + ((k / 7) % 2) * 5, [".a.", "aba", ".a."], { a: shade, b: "gold4" }, "quiltMotif");
      p.vline(x + qw - 1, copeY + 3, qh, shade);
      for (let k = 0; k < qw; k++) if ((k * 5) % 7 < 3) p.px(x + k, copeY + 3 + qh, shade);
    }
  }
}

/**
 * A north–south parapet seen from above: its tiled coping along the outer edge and its inner face (toward
 * the garden) as a foreshortened strip, with pots, a rain spout and a drying rack along it. `inner` is the
 * side the garden is on.
 */
function sideParapet(p: Px, w: number, h: number, seed: number, inner: "east" | "west"): void {
  const cope = 12;
  const at = (i: number) => (inner === "east" ? i : w - 1 - i);
  for (let y = 0; y < h; y++) {
    for (let i = 0; i < w; i++) {
      let c: Color;
      if (i < cope) c = i === 0 ? "steel1" : i < 3 ? "stone3" : i < 9 ? ((y >> 3) & 1 ? "stone4" : "stone5") : i === 9 ? "stone5" : "steel2";
      else c = i > w - 4 ? (i === w - 1 ? "stone2" : "jade4") : hash(i >> 2, y >> 3, seed) > 0.86 ? "cream2" : "cream3";
      p.px(at(i), y, c);
    }
    // Tile courses across the coping.
    if (y % 6 === 5) for (let i = 3; i < 9; i++) p.px(at(i), y, "stone3");
  }
  // Pots on the coping, a spout through the wall, a folding drying rack against it.
  for (let y = 40; y < h - 40; y += 90 + Math.floor(hash(y, 1, seed) * 60)) {
    const kind = hash(y, 2, seed);
    if (kind < 0.6) block(p, inner === "east" ? 1 : w - 11, y, ["..ab.c....", ".abccbd...", "abcddcdb..", ".bcdcdb...", "..eeff....", "..efff....", "...gg....."].map((r) => r.slice(0, 10)),
      { a: "leaf5", b: "leaf4", c: "leaf3", d: "leaf2", e: "orange2", f: "orange1", g: "rose2" }, "copingPot");
    else if (kind < 0.8) { for (let i = cope; i < w; i++) { p.px(at(i), y, "steel4"); p.px(at(i), y + 1, "steel2"); } stain(p, inner === "east" ? cope : 2, y + 2, 4, 12); }
    else for (let k = 0; k < 24; k += 4) for (let i = cope; i < w; i++) p.px(at(i), y + k, (k / 4) % 2 ? "bamboo3" : "bamboo2");
  }
}

// ── the stair hut and its steps ─────────────────────────────────────────────

/**
 * The stair hut: a little brick house over the stairwell, a hipped roof running north–south, its south
 * end wall facing the camera with a window, and its east wall (toward the garden) foreshortened with the
 * door onto the steps, a lit stair window and a meter. Rows of the east wall are footprint rows.
 */
function stairHut(p: Px, prop: MapProp, w: number, h: number, seed: number): void {
  const F = 88, L = h - F, base = h - 1, S = 24, RW = w - S;
  facadeShell(p, 0, L, w, base, { seed, groundH: F - 8, quoins: true, bandCourses: 0 });
  laneWindow(p, 40, L + 28, 26, 30, { seed, shutters: "open", shutterTone: "jade", glass: "curtain", curtain: "cream", sill: "plants" });
  acUnit(p, 110, L + 20, seed);
  // The east wall strip: the wall's height runs across it (foot at the right edge, top under the eave).
  const at = (hgt: number) => w - 1 - hgt;
  for (let j = 0; j < L; j++) for (let k = 0; k < S; k++) {
    let c: Color = k < 3 ? "stone2" : k < 4 ? "stone4" : "cream3";
    if (k >= 4 && hash(k >> 2, j >> 3, seed) > 0.86) c = "cream2";
    p.px(at(k), j, c);
  }
  // The door: from the exit beside the hut, if the map has one.
  const exit = outdoorExit(prop);
  const d0 = exit ? Math.round((exit.y - prop.position.y) * TILE) - 4 : Math.round(L * 0.5), dl = exit ? Math.round(exit.height * TILE) + 8 : 40;
  for (let j = d0; j < Math.min(L, d0 + dl); j++) for (let k = 0; k < 18; k++) {
    const edge = j === d0 || j === d0 + dl - 1 || k === 17;
    p.px(at(k), j, edge ? "stone4" : k > 13 ? "ink" : (j - d0) % 9 === 0 ? "wood1" : "wood3");
  }
  for (let j = d0 - 1; j <= d0 + dl; j++) p.px(at(0), j, "stone5");
  p.px(at(8), d0 + dl - 6, "gold3").px(at(9), d0 + dl - 6, "gold4");
  // A small window up the stair, and a meter box.
  for (let j = 24; j < 44; j++) for (let k = 10; k < 18; k++) p.px(at(k), j, j === 24 || j === 43 || k === 10 || k === 17 ? "cream5" : k > 14 ? "blue4" : "blue2");
  for (let j = 60; j < 72; j++) for (let k = 6; k < 12; k++) p.px(at(k), j, j === 60 || k === 11 ? "steel5" : "steel4");
  for (let j = 0; j < L; j++) { p.px(at(S - 1), j, "steel1"); p.px(at(0), j, "steel1"); }
  // The roof, drawn east–west and turned a quarter: hips at the north and south ends.
  const T = new Px(L, RW);
  laneRoof(T, 0, 0, L, RW, { seed, ridgeY: Math.round(RW * 0.32), damp: 0.1 });
  lichen(T, 10, Math.round(RW * 0.32) + 6, L - 20, RW - Math.round(RW * 0.32) - 12, seed + 3, 3);
  moss(T, 12, RW - 16, L - 24, 10, seed, 3);
  for (let a = 0; a < L; a++) for (let b = 0; b < RW; b++) { const c = T.get(a, b); if (c) p.px(b, a, c); }
  castShadow(p, w - S, 0, 3, L, 0);
  eave(p, 0, L - 5, RW);
  tarp(p, 30, 60, 18, 34, seed);
}

/** The exit rect on the side of a prop (the stair hut's door), in tiles, if any. */
function outdoorExit(prop: MapProp): { y: number; height: number } | null {
  const ex = ROOF_EXITS.find((e) => Math.abs(e.rect.x - (prop.position.x + prop.width)) < 0.6 && e.rect.y >= prop.position.y && e.rect.y < prop.position.y + prop.height);
  return ex ? { y: ex.rect.y, height: ex.rect.height } : null;
}
const ROOF_EXITS = outdoorMap(MAP).exits;

/**
 * The steps from the deck up to the hut's door: three granite treads climbing west, seen from above as
 * bands, each riser a dark sliver facing the garden, a cheek wall north and south, pots on the cheeks.
 */
function hutSteps(p: Px, w: number, h: number, seed: number): void {
  const cheek = 10, n = 3, tw = Math.floor(w / n);
  for (let i = 0; i < n; i++) {
    const x0 = i * tw, x1 = i === n - 1 ? w : x0 + tw;
    // West treads are higher: a step paler.
    const top: Color = i === 0 ? "stone4" : "stone3", face: Color = "stone3";
    p.rect(x0, cheek, x1 - x0, h - 2 * cheek, top);
    // The tread's lit nosing, then its riser dropping east to the next tread, in shade.
    p.vline(x0, cheek, h - 2 * cheek, "stone5");
    p.vline(x1 - 5, cheek, h - 2 * cheek, face).vline(x1 - 4, cheek, h - 2 * cheek, "stone2").vline(x1 - 3, cheek, h - 2 * cheek, "stone2").vline(x1 - 2, cheek, h - 2 * cheek, "stone1").vline(x1 - 1, cheek, h - 2 * cheek, "steel1");
    for (let k = 0; k < 4; k++) { const sy = cheek + 4 + Math.floor(hash(i, k, seed) * (h - 2 * cheek - 8)); p.px(x0 + 3 + Math.floor(hash(k, i, seed) * (tw - 10)), sy, "stone3"); }
  }
  // Cheek walls: the north one seen from above, the south one showing its face.
  p.rect(0, 0, w, cheek, "stone4");
  p.hline(0, 0, w, "stone5").hline(0, cheek - 1, w, "steel2");
  p.rect(0, h - cheek, w, cheek, "stone3");
  p.hline(0, h - cheek, w, "stone5").hline(0, h - cheek + 1, w, "stone4").hline(0, h - 1, w, "steel1");
  for (let x = 6; x < w; x += 16) p.vline(x, h - cheek + 2, cheek - 3, "stone2");
  block(p, w - 16, 0, ["..ab..", ".abbc.", "abccbd", ".eeff.", ".efff."], { a: "leaf4", b: "leaf3", c: "leaf2", d: "leaf1", e: "orange2", f: "orange1" }, "stepPot");
}

/** The warm window: the stair's lit window seen edge-on, a slit of lamplight in the dawn. */
function warmWindow(p: Px, w: number, h: number): void {
  const len = Math.min(h - 2, 26), y0 = h - 1 - len;
  p.rect(0, y0, w, len, "cream5");
  for (let y = y0 + 2; y < y0 + len - 2; y++) for (let x = 0; x < w; x++) p.px(x, y, x === 0 ? "orange3" : (y & 3) === 0 ? "gold4" : "gold5");
  p.hline(0, y0 + Math.floor(len / 2), w, "wood3");
  p.faded(0.35, (q) => q.rect(0, y0 - 3, w, len + 6, "gold4"));
}

// ── yard structures ─────────────────────────────────────────────────────────

/**
 * The water tank: a galvanised drum on a steel stand over a concrete plinth, a ladder, the outlet pipe
 * dropping to the deck, rust tears and a float-valve hatch. 128 × 128 plot, rising 64.
 */
function waterTank(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, d = w - 16, x = 8, r = d / 2, cx = x + r, standH = 26, bodyH = 54, ry = 12;
  const lidY = base - standH - bodyH - 6;
  // Plinth and stand.
  p.rect(2, base - 10, w - 4, 11, "stone4");
  p.hline(2, base - 10, w - 4, "stone5").hline(2, base, w - 4, "steel1").vline(w - 3, base - 10, 11, "stone2");
  for (const lx of [x + 6, cx - 2, x + d - 10]) { p.rect(lx, base - standH - 4, 5, standH - 6, "steel2"); p.vline(lx, base - standH - 4, standH - 6, "steel4"); }
  p.line(x + 8, base - standH, cx, base - 12, "steel2").line(x + d - 8, base - standH, cx, base - 12, "steel2");
  // Drum.
  const top = base - standH - bodyH;
  for (let yy = top; yy < base - standH; yy++) for (let xx = x; xx < x + d; xx++) {
    const u = (xx + 0.5 - cx) / r;
    p.px(xx, yy, u < -0.75 ? "steel4" : u < -0.2 ? "steel5" : u < 0.4 ? "steel4" : u < 0.8 ? "steel3" : "steel2");
  }
  for (const band of [top + 16, top + 34]) { p.hline(x, band, d, "steel2"); for (let xx = x + 3; xx < x + d; xx += 6) p.px(xx, band - 1, "steel5"); }
  p.hline(x, base - standH, d, "steel1").vline(x, top, bodyH, "steel1").vline(x + d - 1, top, bodyH, "steel1");
  for (let j = 0; j < 30; j++) if (hash(j, 3, seed) > 0.25) p.px(cx + 24 + (j > 15 ? 1 : 0), top + 8 + j, j < 10 ? "orange1" : "wood3");
  // Lid seen from above.
  p.ellipse(cx, top, r, ry, "steel3");
  p.ellipse(cx, top - 1, r - 1, ry - 1, "steel5");
  p.ellipse(cx + 3, top, r - 10, ry - 4, "steel4");
  p.rect(cx - 16, top - 6, 14, 8, "steel3");
  p.rect(cx - 15, top - 6, 12, 6, "steel4");
  p.hline(cx - 15, top - 6, 12, "steel6");
  // Ladder up the front and the outlet pipe.
  const lx = x + 14;
  for (const sx of [lx, lx + 9]) p.vline(sx, top - 2, base - top - 8, "steel2");
  for (let yy = top + 4; yy < base - 10; yy += 6) p.hline(lx, yy, 10, "steel3");
  p.rect(x + d - 18, base - standH, 5, standH - 8, "steel3");
  p.vline(x + d - 18, base - standH, standH - 8, "steel5");
  // A tin of paint left on the plinth since the last time somebody meant to fix the rust.
  block(p, w - 18, base - 16, [".aaa.", "abbbc", "adddc", "abbbc", ".ccc."], { a: "steel5", b: "steel4", c: "steel2", d: "jade3" }, "paintTin");
  void lidY;
}

/**
 * The tool bay: an open timber shelter with a tin pent roof, pegboard tools inside (rake, spade, fork,
 * shears, a coil of hose, string, seed tins), a bench with pots. 128 × 128 plot, rising 56.
 */
function toolBay(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, eaveY = base - 64, back = 8;
  // The back wall (planks) and the pegboard, seen in the open front.
  p.rect(back, back, w - 2 * back, base - back - 2, "oak2");
  for (let x = back + 6; x < w - back; x += 8) p.vline(x, back, base - back - 2, "oak1");
  const board = { x: back + 8, y: eaveY + 8, w: w - 2 * back - 16, h: 34 };
  p.rect(board.x, board.y, board.w, board.h, "oak4");
  for (let y = board.y + 3; y < board.y + board.h; y += 5) for (let x = board.x + 3; x < board.x + board.w; x += 5) p.px(x, y, "oak2");
  // Tools on pegs.
  p.vline(board.x + 8, board.y + 2, 30, "wood3"); p.rows(board.x + 4, board.y + 1, ["aaaaaaaaa", "a.a.a.a.a"], { a: "steel3" });
  p.vline(board.x + 22, board.y + 2, 24, "wood3"); p.rect(board.x + 19, board.y + 25, 7, 8, "steel4"); p.hline(board.x + 19, board.y + 25, 7, "steel5");
  p.vline(board.x + 34, board.y + 2, 22, "wood3"); p.rows(board.x + 31, board.y + 24, ["a.a.a", "a.a.a", "a.a.a"], { a: "steel3" });
  block(p, board.x + 44, board.y + 4, ["a...a", ".a.a.", "..b..", ".c.c.", "c...c"], { a: "steel4", b: "steel2", c: "red3" }, "shears");
  block(p, board.x + 56, board.y + 6, [".aaaa.", "ab..ba", "a.cc.a", "ab..ba", ".aaaa."], { a: "jade4", b: "jade2", c: "steel2" }, "hoseCoil");
  p.rect(board.x + 70, board.y + 4, 6, 8, "bamboo3"); p.hline(board.x + 70, board.y + 4, 6, "bamboo4");
  // The potting bench across the front of the bay, pots and seed tins on it.
  const by = base - 30;
  p.rect(back + 2, by, w - 2 * back - 4, 5, "oak3");
  p.hline(back + 2, by, w - 2 * back - 4, "oak5").hline(back + 2, by + 4, w - 2 * back - 4, "oak1");
  for (const lx of [back + 4, w - back - 8]) p.rect(lx, by + 5, 4, base - by - 6, "oak2");
  sillPlants(p, back + 6, by, 60, seed);
  block(p, w - back - 34, by - 7, ["aab.cc", "abb.cd", "abb.cd", "bbb.dd"], { a: "steel5", b: "steel3", c: "gold4", d: "gold2" }, "tins");
  // Posts and the tin pent roof.
  for (const x of [0, w - 6]) { p.rect(x, eaveY, 6, base - eaveY, "oak3"); p.vline(x, eaveY, base - eaveY, "oak4"); p.vline(x + 5, eaveY, base - eaveY, "oak1"); }
  for (let y = 0; y <= eaveY; y++) for (let x = 0; x < w; x++) { const k = x % 5; p.px(x, y, (["steel5", "steel4", "steel3", "steel2", "steel3"] as Color[])[k]); }
  for (let i = 0; i < 8; i++) { const rx = 3 + Math.floor(hash(i, 1, seed) * (w - 6)), ry = 2 + Math.floor(hash(i, 2, seed) * (eaveY - 14)); for (let j = 0; j < 10; j++) if (hash(i, j, seed) > 0.3) p.px(rx, ry + j, j < 4 ? "orange1" : "wood3"); }
  moss(p, 2, eaveY - 12, w - 4, 10, seed, 2);
  for (let x = 0; x < w; x++) p.px(x, eaveY + 1, x % 5 < 3 ? "steel2" : "steel1");
  p.rect(0, eaveY + 2, w, 3, "steel3");
  p.hline(0, eaveY + 2, w, "steel5").hline(0, eaveY + 4, w, "steel1");
  p.hline(0, 0, w, "steel1");
}

/**
 * The pergola over the tea corner, seen from above at beam height: two timber beams, bamboo rafters, a
 * wisteria grown over half of it with hanging racemes, dappled shade on the deck under it. Its posts are
 * their own props. `rear`/`front` are the beams' rows.
 */
function pergola(p: Px, w: number, h: number, seed: number): void {
  const front = h - 1 - 106, rear = front - 64;
  // Dappled shade on the deck, where the leaves are thickest.
  p.faded(0.14, (q) => {
    for (let i = 0; i < 9; i++) q.ellipse(20 + i * w * 0.07 + hash(i, 1, seed) * 20, h - 50 + hash(i, 2, seed) * 30, 26 + hash(i, 3, seed) * 14, 12, "ink");
  });
  // Rafters: split bamboo running north–south, overhanging the beams a little.
  for (let x = 6; x < w - 4; x += 14) { p.vline(x, rear - 6, front - rear + 14, "bamboo3"); p.vline(x + 1, rear - 6, front - rear + 14, "bamboo2"); for (let y = rear; y < front + 6; y += 9) p.px(x, y, "bamboo4"); }
  // Beams.
  for (const y of [rear, front]) { p.rect(0, y, w, 5, "wood3"); p.hline(0, y, w, "wood4").hline(0, y + 4, w, "wood1"); for (let x = 20; x < w; x += 40) p.vline(x, y + 1, 3, "wood2"); }
  // Wisteria: leafy clumps over the west two-thirds, thinning east, each a dark mass lit on its upper
  // left; lilac racemes hang from the front beam and through the gaps.
  // Stems run along both beams and up the rafters first, so the clumps hang off something.
  for (const y of [rear + 2, front + 2]) for (let x = 0; x < w * 0.8; x++) p.px(x, y + Math.round(Math.sin(x * 0.15) * 1.5), "wood2");
  for (let x = 6; x < w * 0.7; x += 28) p.line(x, front, x + 6, rear, "wood2");
  const clumps = Array.from({ length: 70 }, (_, i) => {
    const along = hash(i, 7, seed) < 0.55;
    return {
      x: Math.pow(hash(i, 1, seed), 1.3) * w * 0.8,
      y: along ? (hash(i, 8, seed) < 0.5 ? rear + 2 : front + 2) + (hash(i, 2, seed) - 0.5) * 8 : rear + hash(i, 2, seed) * (front - rear),
      rx: 6 + hash(i, 3, seed) * 7, ry: 4 + hash(i, 4, seed) * 3,
    };
  });
  for (const c of clumps) p.ellipse(c.x + 1, c.y + 1, c.rx, c.ry, "leaf1");
  for (const c of clumps) p.ellipse(c.x, c.y, c.rx - 1, c.ry - 1, "leaf2");
  for (const c of clumps) p.ellipse(c.x - c.rx * 0.25, c.y - c.ry * 0.3, c.rx * 0.6, c.ry * 0.55, "leaf3");
  for (const [i, c] of clumps.entries()) for (let k = 0; k < 5; k++) {
    const lx = Math.round(c.x - c.rx * 0.5 + hash(i, k + 10, seed) * c.rx * 0.8), ly = Math.round(c.y - c.ry * 0.6 + hash(i, k + 20, seed) * c.ry * 0.6);
    p.px(lx, ly, "leaf4").px(lx + 1, ly, "leaf4");
  }
  for (let i = 0; i < 22; i++) {
    const x = Math.floor(Math.pow(hash(i, 5, seed), 1.3) * w * 0.7), y = front - 2 + Math.floor(hash(i, 6, seed) * 10);
    p.rows(x, y, [".a.", "abb", "bbc", ".bc", "..c"], { a: "plum4", b: "plum3", c: "plum2" });
  }
  // The trunk's twist where it climbs the south-west post.
  p.line(4, front + 4, 14, front - 30, "wood2").line(6, front + 2, 30, front - 50, "wood2");
}

/** A pergola post: a square timber on a stone base, the wisteria twining up the west ones. */
function post(p: Px, w: number, h: number, vine: boolean): void {
  const base = h - 1, cx = Math.floor(w / 2);
  p.rect(cx - 3, 4, 6, base - 6, "wood3");
  p.vline(cx - 3, 4, base - 6, "wood4").vline(cx + 2, 4, base - 6, "wood1");
  p.rect(cx - 4, 0, 8, 5, "wood2"); p.hline(cx - 4, 0, 8, "wood4");
  p.rect(0, base - 4, w, 5, "stone4");
  p.hline(0, base - 4, w, "stone5").hline(0, base, w, "steel1");
  if (vine) for (let y = 6; y < base - 6; y += 5) p.rows(cx - 4 + ((y >> 3) % 2) * 3, y, ["ab", ".c"], { a: "leaf4", b: "leaf3", c: "leaf2" });
}

/** A threshold post: a bamboo pole set in a pot of cement, a morning glory climbing it. */
function thresholdPost(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, cx = Math.floor(w / 2);
  p.vline(cx - 1, 0, base - 2, "bamboo4").vline(cx, 0, base - 2, "bamboo2");
  for (let y = 8; y < base; y += 12) p.px(cx - 1, y, "bamboo1").px(cx, y, "bamboo1");
  for (let y = 10; y < base - 4; y += 6) p.px(cx + ((y >> 2) % 2 ? 1 : -2), y, hash(y, 1, seed) > 0.7 ? "blue4" : "leaf3");
  p.rect(0, base - 2, w, 3, "stone3");
}

/**
 * The lintel over the garden threshold: a bamboo crossbar between the two posts, a blank wooden plaque
 * hung from it (DOM may letter it), morning glory along it. Rises over the path, clear of heads.
 */
function thresholdLintel(p: Px, w: number, h: number, seed: number): void {
  const y = 4;
  p.hline(0, y, w, "bamboo4").hline(0, y + 1, w, "bamboo3").hline(0, y + 2, w, "bamboo1");
  for (let x = 10; x < w; x += 18) p.vline(x, y, 3, "bamboo1");
  const pw = 34, px0 = Math.round((w - pw) / 2);
  p.vline(px0 + 4, y + 3, 3, "steel2").vline(px0 + pw - 5, y + 3, 3, "steel2");
  p.rect(px0, y + 6, pw, 10, "wood3");
  p.hline(px0, y + 6, pw, "wood5").hline(px0, y + 15, pw, "wood1");
  p.rect(px0 + 2, y + 8, pw - 4, 6, "oak5");
  for (let x = 0; x < w; x += 3) {
    if (hash(x, 1, seed) < 0.35) continue;
    p.rows(x, y - 2 + Math.floor(hash(x, 2, seed) * 3), hash(x, 3, seed) > 0.8 ? [".a.", "aba"] : ["ab", "bc"], hash(x, 3, seed) > 0.8 ? { a: "blue4", b: "white" } : { a: "leaf4", b: "leaf3", c: "leaf2" });
  }
  void h;
}

/**
 * The bamboo screen along the west edge: a trough of black bamboo, canes rising out of it into a leafy
 * crown, a woven reed panel behind. Seen from above, leaves and canes along a north–south run.
 */
function bambooScreen(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, rise = 46, trough = { x: 4, w: w - 8 };
  // The trough, seen from above, its south end face showing.
  p.rect(trough.x, rise, trough.w, base - rise - 8, "stone3");
  p.vline(trough.x, rise, base - rise - 8, "stone5").vline(trough.x + trough.w - 1, rise, base - rise - 8, "stone2");
  p.rect(trough.x + 2, rise + 2, trough.w - 4, base - rise - 12, "wood2");
  p.rect(trough.x, base - 8, trough.w, 9, "stone3");
  p.hline(trough.x, base - 8, trough.w, "stone5").hline(trough.x, base, trough.w, "steel1");
  // Canes and leaves, the crowns shifted up (they stand tall).
  for (let y = rise; y < base - 10; y += 7) {
    const lean = Math.floor(hash(y, 1, seed) * 6) - 3;
    p.line(trough.x + 6 + lean, y - 30, trough.x + 8, y + 2, "jade2");
    p.line(trough.x + trough.w - 8 - lean, y - 34, trough.x + trough.w - 10, y + 2, "jade1");
  }
  for (let y = 0; y < base - 14; y += 3) for (let x = 0; x < w; x += 4) {
    if (hash(x, y, seed) < 0.3) continue;
    const lit = x < w / 2;
    p.rows(x, y, hash(x, y, seed + 1) > 0.5 ? ["aab", ".bc"] : ["a..", "bbc"], lit ? { a: "leaf4", b: "leaf3", c: "leaf2" } : { a: "leaf3", b: "leaf2", c: "leaf1" });
  }
}

/** A pipe lying on the deck on little concrete blocks: galvanised, a joint, a valve at one end, rust. */
function deckPipe(p: Px, w: number, h: number, seed: number): void {
  const horizontal = w >= h;
  const len = horizontal ? w : h, thick = horizontal ? h : w;
  const put = (along: number, across: number, c: Color) => horizontal ? p.px(along, across, c) : p.px(across, along, c);
  const tones: Color[] = ["steel5", "steel4", "steel3", "steel2", "steel1"];
  for (let a = 0; a < len; a++) for (let c = 0; c < thick; c++) put(a, c, tones[Math.min(4, Math.round((c / Math.max(1, thick - 1)) * 4))]);
  for (let a = 18; a < len - 4; a += 40) for (let c = 0; c < thick; c++) { put(a, c, "steel2"); put(a + 1, c, "steel5"); }
  for (let i = 0; i < Math.floor(len / 30); i++) { const a = Math.floor(hash(i, 1, seed) * len); put(a, thick - 2, "orange1"); put(a + 1, thick - 2, "wood3"); }
  if (seed % 2 === 0) for (let a = 0; a < 3; a++) for (let c = 0; c < thick; c++) put(a, c, a === 1 ? "red3" : "steel3");
}

// ── floor marks ─────────────────────────────────────────────────────────────

/** Worn paving: where feet have polished the deck on the way to the garden, a pale scuffed oval. */
function wornPaving(p: Px, w: number, h: number, variant: number): void {
  const cx = w / 2 + (variant % 2 ? 3 : -3), cy = h / 2 + (variant === 2 ? 3 : 0);
  p.faded(0.32, (q) => q.ellipse(cx, cy, w * 0.42, h * 0.3, "stone5"));
  p.faded(0.22, (q) => q.ellipse(cx + 2, cy + 1, w * 0.26, h * 0.18, "white"));
  // A few scuffs and a chip.
  for (let i = 0; i < 4; i++) { const x = Math.floor(hash(i, 1, variant) * (w - 8)) + 4, y = Math.floor(hash(i, 2, variant) * (h - 8)) + 4; p.faded(0.5, (q) => q.hline(x, y, 3, "stone2")); }
}

/** Weathering on the deck: 0 a water stain with a rust run, 1 a crack with moss in it, 2 a moss patch with lichen. */
function weathering(p: Px, w: number, h: number, variant: number): void {
  if (variant % 3 === 0) {
    p.faded(0.25, (q) => q.ellipse(w / 2, h / 2, w * 0.45, h * 0.38, "stone1"));
    p.faded(0.3, (q) => q.ellipse(w / 2, h / 2, w * 0.3, h * 0.24, "steel2"));
    p.faded(0.5, (q) => { for (let x = 6; x < w - 8; x++) q.px(x, Math.round(h / 2 + Math.sin(x * 0.4) * 2), "orange1"); });
  } else if (variant % 3 === 1) {
    let y = 4;
    for (let x = 2; x < w - 2; x++) { p.px(x, y, "stone1"); if (hash(x, 1, variant) > 0.6) y += hash(x, 2, variant) > 0.5 ? 1 : -1; y = Math.max(2, Math.min(h - 3, y)); if (x % 7 === 3) p.rows(x - 1, y - 1, ["ab", "bc"], { a: "leaf4", b: "leaf3", c: "leaf2" }); }
    p.line(w / 2, 6, w / 2 + 6, h - 4, "stone1");
  } else {
    p.faded(0.3, (q) => q.ellipse(w / 2, h / 2, w * 0.42, h * 0.36, "jade2"));
    moss(p, 4, 4, w - 8, h - 8, variant * 11, 3);
    for (let i = 0; i < 5; i++) p.rows(4 + Math.floor(hash(i, 1, variant) * (w - 10)), 3 + Math.floor(hash(i, 2, variant) * (h - 8)), [".a.", "abc"], { a: "jade5", b: "jade4", c: "jade3" });
  }
}

// ── sprites ─────────────────────────────────────────────────────────────────

function parapetSprite(prop: MapProp, i: number): SpriteDef {
  const { w, h } = footprintPx(prop);
  if (w >= h) return prop.position.y < 10 ? sprite(prop, 48, (q, sw, sh) => northParapet(q, sw, sh, 21 + i)) : sprite(prop, 28, (q, sw, sh) => southParapet(q, sw, sh, 31 + i));
  return sprite(prop, 0, (q, sw, sh) => sideParapet(q, sw, sh, 41 + i, prop.position.x < 10 ? "east" : "west"));
}

export default defineSprites(Object.fromEntries([
  ...props("parapet").map((p, i) => [propSpriteId(MAP, p.id), parapetSprite(p, i)] as const),
  ...props("stairhead").map((p) => [propSpriteId(MAP, p.id), sprite(p, 0, (q, w, h) => stairHut(q, p, w, h, 13))] as const),
  ...props("stairs").map((p) => [propSpriteId(MAP, p.id), sprite(p, 0, (q, w, h) => hutSteps(q, w, h, 5))] as const),
  ...props("water-tank").map((p) => [propSpriteId(MAP, p.id), sprite(p, 64, (q, w, h) => waterTank(q, w, h, 7))] as const),
  ...props("tool-bay").map((p) => [propSpriteId(MAP, p.id), sprite(p, 56, (q, w, h) => toolBay(q, w, h, 9))] as const),
  ...props("pergola").map((p) => [propSpriteId(MAP, p.id), sprite(p, 80, (q, w, h) => pergola(q, w, h, 3))] as const),
  ...props("post").map((p) => [propSpriteId(MAP, p.id), sprite(p, 77, (q, w, h) => post(q, w, h, p.position.x < 35))] as const),
  ...props("threshold-post").map((p, i) => [propSpriteId(MAP, p.id), sprite(p, 72, (q, w, h) => thresholdPost(q, w, h, i + 1))] as const),
  ...props("threshold-lintel").map((p) => [propSpriteId(MAP, p.id), sprite(p, 70, (q, w, h) => thresholdLintel(q, w, h, 2))] as const),
  ...props("bamboo-screen").map((p) => [propSpriteId(MAP, p.id), sprite(p, 46, (q, w, h) => bambooScreen(q, w, h, 6))] as const),
  ...props("pipe").map((p, i) => [propSpriteId(MAP, p.id), sprite(p, 0, (q, w, h) => deckPipe(q, w, h, i), { layer: "floor" })] as const),
  ...props("warm-window").map((p) => [propSpriteId(MAP, p.id), sprite(p, 26, (q, w, h) => warmWindow(q, w, h))] as const),
  ...props("worn-paving").map((p) => [propSpriteId(MAP, p.id), sprite(p, 0, (q, w, h) => wornPaving(q, w, h, p.variant), { layer: "floor" })] as const),
  ...props("weathering").map((p) => [propSpriteId(MAP, p.id), sprite(p, 0, (q, w, h) => weathering(q, w, h, p.variant), { layer: "floor" })] as const),
]));
