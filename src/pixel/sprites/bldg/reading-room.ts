/**
 * The neighbourhood reading room (阅览室, ticket 0204): a quiet room on the ground floor of an old
 * Shanghai building, kept by the residents' committee. One sprite per map prop, `reading-room/<id>`,
 * anchored on the footprint's bottom-centre (pipeline: src/pixel/world/maps.ts).
 *
 * Seen as the workshop is: the back (north) wall a tall face (warm limewash over a walnut wainscot, a
 * picture rail, a clock with no numerals, a framed ink landscape), the west wall a cap with a
 * foreshortened face, the east a low partition's cap. On them: two tall windows of green-painted frames
 * (the broad one with a cushioned window seat), the bookcases, the hall doorway, the project desk with its
 * notice board. Books show coloured spines and never a title.
 *
 * The run-time shelves the furnishing feature stands in the alcove are drawn here too (`reading-shelf`
 * ids from the brief data), tall at the back row and low (`-low`) in front.
 */
import { defineSprites, hash, TILE, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import briefs from "../../../features/reading-room/briefs.json" with { type: "json" };

const MAP = "reading-room";
const props = (kind: string) => mapProps(MAP, kind);
const art = (p: Px, x: number, y: number, rows: readonly string[], legend: Record<string, Color | null>) => p.rows(x, y, rows, legend);

/** A sprite rising `rise` px above a footprint of `w`×`foot` px, anchored on its bottom-centre. */
function frame(w: number, foot: number, rise: number, draw: (p: Px, w: number, h: number) => void, extra: Partial<SpriteDef> = {}): SpriteDef {
  const h = foot + rise;
  return { w, h, anchor: [Math.round(w / 2), h - 1], draw: (p) => draw(p, w, h), ...extra };
}
function sprite(prop: MapProp, rise: number, draw: (p: Px, w: number, h: number) => void, extra: Partial<SpriteDef> = {}): SpriteDef {
  const { w, h } = footprintPx(prop);
  return frame(w, h, rise, draw, extra);
}

// ── books ──────────────────────────────────────────────────────────────────────

/** Cloth and paper spines, muted: a library's colours after decades of sun. */
const SPINES: readonly (readonly [Color, Color])[] = [
  ["rose3", "rose2"], ["jade3", "jade2"], ["blue3", "blue2"], ["gold3", "gold2"], ["plum3", "plum2"], ["oak4", "oak3"],
  ["cream4", "cream3"], ["steel4", "steel3"], ["brown3", "brown2"], ["jade4", "jade3"], ["blue4", "blue3"], ["wood4", "wood3"],
];

/**
 * A shelf row of books standing on `y` (the shelf's top surface), from x0 to x1, up to `h` tall: spines
 * of mixed widths and heights, lit on the left, a band or two of gilt (no title), the odd one leaning, a
 * gap where a book is out, sometimes a small thing on the shelf.
 */
function bookRow(p: Px, x0: number, x1: number, y: number, h: number, seed: number): void {
  let x = x0, k = 0;
  while (x < x1 - 1) {
    const r = hash(k, 1, seed);
    if (r < 0.05 && x + 6 < x1) { x += 4 + Math.floor(hash(k, 2, seed) * 3); k++; continue; }
    if (r > 0.97 && x + 8 < x1) {
      // A little vase or a pot of brushes on the shelf.
      art(p, x, y - 6, [".jj.", "jJjj", "jjjj", ".jj."], { j: "jade3", J: "jade5" });
      x += 6; k++; continue;
    }
    const bw = 2 + Math.floor(hash(k, 3, seed) * 3), bh = Math.max(4, h - Math.floor(hash(k, 4, seed) * 5));
    const [c, d] = SPINES[Math.floor(hash(k, 5, seed) * SPINES.length)];
    const lean = hash(k, 6, seed) < 0.06 && x + bw + 2 < x1;
    for (let i = 0; i < bw; i++) {
      const top = y - bh + (lean ? Math.max(0, bw - i - 1) : 0);
      p.vline(x + i + (lean ? 1 : 0), top, y - top, i === 0 ? c : i === bw - 1 ? d : c);
    }
    if (bh > 6) { p.px(x + Math.floor(bw / 2), y - bh + 2, "gold4"); if (hash(k, 7, seed) < 0.5) p.hline(x, y - 3, bw, "gold2"); }
    x += bw + (lean ? 1 : 0);
    k++;
  }
}

/**
 * A bookcase seen from the front: walnut carcass, a cornice, `shelves` rows of books, a plinth. Returns
 * nothing; (x, y) is the top-left of its front face, `fw` × `fh`.
 */
function bookcaseFront(p: Px, x: number, y: number, fw: number, fh: number, shelves: number, seed: number): void {
  p.rect(x, y, fw, fh, "wood2");
  p.rect(x - 1, y - 3, fw + 2, 3, "wood3").hline(x - 1, y - 3, fw + 2, "wood4").hline(x - 1, y - 1, fw + 2, "wood1");
  const inner = fh - 8, rowH = Math.floor(inner / shelves);
  for (let s = 0; s < shelves; s++) {
    const sy = y + 2 + s * rowH;
    p.rect(x + 3, sy, fw - 6, rowH - 2, "wood1");
    bookRow(p, x + 3, x + fw - 3, sy + rowH - 2, rowH - 4, seed + s * 13);
    p.hline(x + 2, sy + rowH - 2, fw - 4, "wood4").hline(x + 2, sy + rowH - 1, fw - 4, "wood3");
  }
  p.vline(x, y, fh, "wood3").vline(x + 1, y, fh, "wood4").vline(x + fw - 1, y, fh, "wood1").vline(x + fw - 2, y, fh, "wood2");
  p.rect(x, y + fh - 5, fw, 5, "wood3").hline(x, y + fh - 5, fw, "wood4").hline(x, y + fh - 1, fw, "ink");
}

// ── walls ──────────────────────────────────────────────────────────────────────

/** Back wall rows from its top: cap 0–4, cornice 5–8, limewash 9–43, picture rail at 14, wainscot 44–65, skirting 66–71. */
const BACK = { cap: 5, cornice: 9, rail: 14, dado: 44, skirt: 66, h: 72 };

function backWall(p: Px, w: number, h: number, seed: number, prop: MapProp): void {
  const top = h - BACK.h;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < BACK.cap; y++) p.px(x, top + y, y === 0 ? "wood1" : y === BACK.cap - 1 ? "wood4" : hash(x >> 3, y, seed) > 0.75 ? "wood1" : "wood2");
    p.px(x, top + 5, "cream2").px(x, top + 6, "cream5").px(x, top + 7, "cream4").px(x, top + 8, "cream2");
  }
  p.rect(0, top + BACK.cornice, w, BACK.dado - BACK.cornice, "cream3");
  for (let y = top + 10; y < top + BACK.dado; y++) for (let x = 0; x < w; x++) if (hash(x >> 4, y >> 3, seed) > 0.88) p.px(x, y, "cream4");
  // The picture rail, and the warmer patch the lamp has made over the years by the desk.
  p.hline(0, top + BACK.rail, w, "wood3").hline(0, top + BACK.rail + 1, w, "wood1");
  // Wainscot: walnut panels under a moulded rail.
  p.hline(0, top + BACK.dado, w, "wood4").hline(0, top + BACK.dado + 1, w, "wood3").hline(0, top + BACK.dado + 2, w, "wood1");
  p.rect(0, top + BACK.dado + 3, w, BACK.skirt - BACK.dado - 3, "wood2");
  for (let x = 0; x < w; x += 32) {
    p.frame(x + 4, top + BACK.dado + 6, 24, BACK.skirt - BACK.dado - 9, "wood1");
    p.hline(x + 5, top + BACK.dado + 7, 22, "wood3").vline(x + 5, top + BACK.dado + 7, BACK.skirt - BACK.dado - 11, "wood3");
  }
  p.hline(0, top + BACK.skirt, w, "wood3").rect(0, top + BACK.skirt + 1, w, 4, "wood1").hline(0, h - 1, w, "ink");
  const at = (tilesX: number) => Math.round((tilesX - prop.position.x) * TILE);
  // A framed ink landscape (mountains, a boat, no inscription) hung from the rail by two cords, west end.
  const fx = at(3.4), fy = top + 19;
  p.line(fx + 4, top + BACK.rail + 1, fx + 12, fy, "cream2").line(fx + 36, top + BACK.rail + 1, fx + 28, fy, "cream2");
  p.rect(fx, fy, 40, 20, "wood1").rect(fx + 2, fy + 2, 36, 16, "cream5");
  art(p, fx + 4, fy + 5, [
    "......s.........ss......",
    ".....sSs.......sSSs.....",
    "...ssSSSs....ssSSSSs....",
    "..sSSSSSSs..sSSSSSSSs...",
    "......................b.",
    ".........k..........bbb.",
    "........kkk.............",
  ], { s: "steel3", S: "steel4", k: "ink2", b: "steel2" });
  // The clock between the windows: round, walnut-rimmed, no numerals; ten to eight.
  const cx = at(14.5), cy = top + 25;
  p.ellipse(cx, cy, 8, 8, "wood2");
  p.ellipse(cx, cy, 6.5, 6.5, "cream5");
  for (const [dx, dy] of [[0, -5], [5, 0], [0, 5], [-5, 0]] as const) p.px(cx + dx, cy + dy, "cream2");
  p.line(cx, cy, cx - 3, cy - 2, "ink").line(cx, cy, cx + 1, cy - 5, "ink");
  // A bamboo scroll painting between the alcove window and the bookcase, and a blank programme card.
  const sx = at(20.4), sy = top + 16;
  p.rect(sx, sy, 14, 26, "cream4").hline(sx - 1, sy, 16, "wood3").hline(sx - 1, sy + 26, 16, "wood3");
  art(p, sx + 3, sy + 4, [".k...", ".k.k.", "kk.k.", ".k.kk", ".k.k.", ".k.k.", "kk.k.", ".k.k.", ".k..."], { k: "jade2" });
  p.rect(at(21.6), top + 24, 10, 12, "cream5").hline(at(21.6), top + 24, 10, "gold3");
  for (let r = 0; r < 3; r++) p.hline(at(21.6) + 2, top + 28 + r * 2, 6, "cream3");
  // Shadowed ends where it meets the side walls.
  for (const x of [0, w - 1]) p.vline(x, top + BACK.cornice, BACK.dado - BACK.cornice, "cream1");
}

/** The west wall: its cap seen from above, a foreshortened face (limewash over walnut) on the inner side. */
function sideWall(p: Px, w: number, h: number, rise: number, seed: number): void {
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) {
    let c: Color;
    if (i < 7) c = i === 0 ? "ink" : i === 6 ? "wood4" : hash(y >> 3, i, seed) > 0.8 ? "wood1" : "wood2";
    else if (y < rise) continue;
    else c = i < 9 ? "cream2" : i < 11 ? "cream3" : i === 11 ? "wood3" : "wood1";
    p.px(i, y, c);
  }
  for (let y = rise + 16; y < h; y += 32) { p.px(11, y, "wood1"); p.px(12, y, "wood2"); }
}

/** The east partition, a low wall: a walnut cap with a run of pot plants and a stack of magazines on it. */
function lowWall(p: Px, w: number, h: number, seed: number): void {
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) p.px(i, y, i === w - 1 ? "ink" : i === 0 ? "wood4" : hash(y >> 3, i, seed) > 0.8 ? "wood1" : "wood3");
  for (let y = 40; y < h - 30; y += 96) art(p, 0, y, [".gg.", "gGgg", ".gg.", "oooo"], { g: "leaf3", G: "leaf4", o: "orange1" });
}

// ── windows ────────────────────────────────────────────────────────────────────

/**
 * A tall window in the back wall: green-painted frames with small panes, morning sky and the leaves of
 * the lane's plane tree outside, cream linen curtains tied back. The broad one (variant 0) has a window
 * seat in front: a walnut box seat with indigo cushions, a striped bolster and someone's open book.
 */
function backWindow(p: Px, w: number, h: number, seat: boolean, seed: number): void {
  const top = h - BACK.h, wy = top + 11, wh = BACK.dado - 12;
  const x0 = 3, x1 = w - 3;
  p.rect(x0, wy, x1 - x0, wh, "jade2");
  // Glass: sky, a plane tree's leaves in the top corner, the light catching the glazing.
  for (let y = wy + 2; y < wy + wh - 2; y++) for (let x = x0 + 2; x < x1 - 2; x++) {
    const sky: Color = y < wy + wh * 0.4 ? "blue6" : y < wy + wh * 0.75 ? "blue5" : "blue4";
    p.px(x, y, sky);
  }
  for (let k = 0; k < Math.round((x1 - x0) / 10); k++) {
    const lx = x0 + 4 + Math.floor(hash(k, 1, seed) * (x1 - x0 - 10)), ly = wy + 3 + Math.floor(hash(k, 2, seed) * 6);
    art(p, lx, ly, [".gg.", "gGgg", ".gg."], { g: "leaf3", G: "leaf4" });
  }
  // Glazing bars: a pane every 8 px across and 9 down, mullions at the casement joints.
  for (let x = x0 + 9; x < x1 - 2; x += 9) p.vline(x, wy + 2, wh - 4, "jade3");
  for (let y = wy + 10; y < wy + wh - 2; y += 9) p.hline(x0 + 2, y, x1 - x0 - 4, "jade3");
  p.frame(x0, wy, x1 - x0, wh, "jade1");
  p.hline(x0 + 1, wy + 1, x1 - x0 - 2, "jade4");
  // The sill, and the curtains tied back either side.
  p.rect(x0 - 2, wy + wh, x1 - x0 + 4, 3, "cream4").hline(x0 - 2, wy + wh, x1 - x0 + 4, "cream5").hline(x0 - 2, wy + wh + 2, x1 - x0 + 4, "cream2");
  for (const side of [0, 1]) {
    const cx = side ? x1 - 7 : x0 - 1;
    for (let y = wy - 2; y < wy + wh; y++) {
      const waist = Math.abs(y - (wy + wh * 0.55)) < 2;
      const width = waist ? 4 : 7 - Math.round(Math.abs(y - (wy + wh * 0.55)) / 8);
      for (let i = 0; i < width; i++) p.px(side ? cx + 7 - width + i : cx + i, y, waist ? "gold3" : i % 3 === 0 ? "cream3" : "cream4");
    }
  }
  p.hline(x0 - 4, wy - 3, x1 - x0 + 8, "wood2").hline(x0 - 4, wy - 2, x1 - x0 + 8, "wood3");
  if (!seat) return;
  // The window seat: a box seat in front of the wainscot, its top cushioned.
  // Its top runs back to the wall over the footprint's depth (foreshortened), its front panelled in oak.
  const sy = h - 15, sh = 14;
  p.rect(0, sy - 9, w, 9, "oak4").hline(0, sy - 9, w, "oak5");
  p.rect(0, sy, w, sh, "oak3");
  for (let x = 4; x < w - 4; x += 26) { p.frame(x, sy + 3, 22, sh - 5, "oak2"); p.hline(x + 1, sy + 4, 20, "oak4"); }
  p.hline(0, sy, w, "oak5").vline(w - 1, sy - 9, sh + 9, "wood1").hline(0, h - 1, w, "ink");
  // Cushions along the top edge, plump and lit on top, a bolster at the east end, an open book.
  for (let k = 0; k < 5; k++) {
    const cx = 4 + k * Math.floor((w - 20) / 5);
    const c: readonly [Color, Color, Color] = k % 2 ? ["blue2", "blue3", "blue4"] : ["jade2", "jade3", "jade4"];
    art(p, cx, sy - 13, [
      ".bbbbbbbbbbbbbbbbbbb.",
      "bcccccccccccccccccccb",
      "bccdcccccccccccdcccab",
      "bccccccccccccccccccab",
      "baaaaaaaaaaaaaaaaaaab",
      ".aaaaaaaaaaaaaaaaaaa.",
    ].map((r) => r.slice(0, Math.max(10, Math.floor((w - 20) / 5) - 3))), { a: c[0], b: c[0], c: c[1], d: c[2] });
  }
  art(p, w - 18, sy - 12, [".cccccccccc.", "cCwCwCwCwCcc", "cwCwCwCwCwcc", ".cccccccccc."], { c: "cream3", C: "cream5", w: "rose3" });
  art(p, Math.round(w * 0.4), sy - 7, ["wwww.wwww", "wllw.wllw", "wwwwkwwww"], { w: "white", l: "cream3", k: "rose2" });
}

// ── bookcases and shelves ──────────────────────────────────────────────────────

/** The tall bookcase against the back wall: a front of five shelves, its top seen above the cornice. */
function backBookcase(p: Px, w: number, h: number, seed: number): void {
  const fh = 84, fy = h - fh;
  p.rect(1, fy - 10, w - 2, 8, "wood3").hline(1, fy - 10, w - 2, "wood4");
  // On top: boxes of periodicals and a rolled map.
  p.rect(6, fy - 16, 22, 7, "oak3").hline(6, fy - 16, 22, "oak4");
  p.rect(32, fy - 14, 14, 5, "cream4").hline(32, fy - 14, 14, "cream5");
  p.line(50, fy - 12, 74, fy - 15, "cream4").line(50, fy - 11, 74, fy - 14, "cream3");
  bookcaseFront(p, 1, fy, w - 2, fh, 5, seed);
}

/**
 * The bookcase along the west wall by the door, facing east: its top runs down the map; its east face,
 * full of spines, shows as a foreshortened strip; its south end shows its side panel with a small print.
 */
function sideBookcase(p: Px, w: number, h: number, seed: number): void {
  const tall = 84, depth = h - tall;
  // Top: the long cornice seen from above.
  p.rect(0, 0, w, depth, "wood3");
  p.hline(0, 0, w, "wood4").vline(0, 0, depth, "wood4").vline(w - 1, 0, depth, "wood1");
  for (let y = 6; y < depth; y += 18) p.hline(2, y, w - 18, "wood2");
  // The east face of spines, foreshortened to a strip, books' tops showing as coloured ticks.
  for (let y = 2; y < depth - 2; y++) {
    const [c, d] = SPINES[Math.floor(hash(y >> 1, 3, seed) * SPINES.length)];
    p.px(w - 15, y, "wood1");
    for (let i = 0; i < 13; i++) p.px(w - 14 + i, y, (y >> 1) % 9 === 0 ? (i < 2 ? "wood3" : "wood1") : i < 2 ? "wood1" : i < 9 ? c : d);
  }
  // The south end panel: walnut, a moulded frame, a small framed print of a cat, the plinth.
  const sy = depth;
  p.rect(0, sy, w, tall, "wood2");
  p.frame(3, sy + 4, w - 6, tall - 12, "wood1").vline(4, sy + 5, tall - 14, "wood3");
  p.rect(w / 2 - 6, sy + 20, 12, 14, "gold2").rect(w / 2 - 4, sy + 22, 8, 10, "cream5");
  art(p, w / 2 - 3, sy + 25, [".k.k", ".kkk", "kkkk", ".kk."], { k: "ink2" });
  p.rect(0, h - 6, w, 6, "wood3").hline(0, h - 6, w, "wood4").hline(0, h - 1, w, "ink");
}

/** One of the alcove's free-standing shelves: tall at the back (two shelves of books), low in front (one, with a plant on top). */
function alcoveShelf(p: Px, w: number, h: number, low: boolean, seed: number): void {
  if (low) {
    const fh = 24, fy = h - fh;
    p.rect(1, fy - 10, w - 2, 10, "wood3").hline(1, fy - 10, w - 2, "wood4");
    art(p, w - 16, fy - 18, ["..gg..", ".gGgg.", "gGgggg", ".oooo.", ".oooo."], { g: "leaf3", G: "leaf4", o: "orange1" });
    bookcaseFront(p, 1, fy, w - 2, fh, 1, seed);
    return;
  }
  const fh = 56, fy = h - fh;
  p.rect(1, fy - 12, w - 2, 10, "wood3").hline(1, fy - 12, w - 2, "wood4");
  bookcaseFront(p, 1, fy, w - 2, fh, 3, seed);
}

// ── the doorway and the desk ───────────────────────────────────────────────────

/**
 * The doorway to the hall: two slim walnut jambs, a lintel high over the opening with a fanlight, a
 * granite threshold worn into a dip, a cotton door curtain (门帘) tied to one side.
 */
function entry(p: Px, w: number, h: number): void {
  const base = h - 1, lintel = base - 70;
  p.rect(6, base - 7, w - 12, 7, "stone4").hline(6, base - 7, w - 12, "stone5").hline(6, base, w - 12, "stone2");
  p.over(() => { p.ellipse(w / 2, base - 3, 12, 2, "stone5"); });
  for (const x of [0, w - 6]) {
    p.rect(x, lintel, 6, base - lintel, "wood2");
    p.vline(x, lintel, base - lintel, "wood3").vline(x + 5, lintel, base - lintel, "wood1");
  }
  p.rect(0, lintel - 14, w, 14, "wood2").hline(0, lintel - 14, w, "wood4").hline(0, lintel - 1, w, "wood1");
  // The fanlight: a half-round of small panes over the door.
  for (let x = 8; x < w - 8; x++) {
    const u = (x - w / 2) / (w / 2 - 8);
    const hh = Math.round(Math.sqrt(Math.max(0, 1 - u * u)) * 10);
    for (let y = lintel - 2 - hh; y < lintel - 2; y++) p.px(x, y, (x % 6 === 0 || y % 4 === 0) ? "wood1" : "gold5");
  }
  // The curtain, indigo with a white band, tied back to the west jamb.
  for (let y = lintel; y < base - 10; y++) {
    const waist = Math.abs(y - (base - 40)) < 2;
    const width = waist ? 4 : 9 - Math.round(Math.abs(y - (base - 40)) / 7);
    for (let i = 0; i < Math.max(3, width); i++) p.px(6 + i, y, waist ? "gold3" : (y - lintel) % 12 < 2 ? "cream4" : i % 3 === 0 ? "blue2" : "blue3");
  }
}

/**
 * The project desk where the furnishing plans are kept: a walnut desk with a cork board on a stand
 * behind it (blank cards pinned up with coloured pins, a ruled sign-up sheet with no names), a stack of
 * the day's newspapers on wooden rods, an open ledger, a library date stamp and its pad, a pencil jar.
 */
function noticeDesk(p: Px, w: number, h: number, seed: number): void {
  const H = 22, front = h - H, top = front - 20;
  // The board on its stand, behind the desk.
  p.rect(10, top - 34, w - 20, 30, "oak3");
  p.rect(12, top - 32, w - 24, 26, "oak4");
  p.over(() => p.speckle(12, top - 32, w - 24, 26, "oak3", 0.25, seed));
  p.frame(10, top - 34, w - 20, 30, "wood2");
  for (let k = 0; k < 6; k++) {
    const cx = 14 + (k % 3) * 16 + Math.floor(hash(k, 1, seed) * 4), cy = top - 30 + Math.floor(k / 3) * 12 + Math.floor(hash(k, 2, seed) * 3);
    p.rect(cx, cy, 11, 8, k % 4 === 0 ? "cream4" : k % 4 === 1 ? "white" : k % 4 === 2 ? "jade5" : "gold5");
    p.px(cx + 5, cy, (["rose3", "blue3", "jade2", "gold2"] as const)[k % 4]);
  }
  p.rect(w - 26, top - 31, 12, 22, "white");
  for (let r = 0; r < 6; r++) p.hline(w - 24, top - 27 + r * 3, 8, "cream3");
  for (const x of [14, w - 16]) p.rect(x, top - 4, 2, 6, "wood2");
  // The desk.
  p.rect(0, top, w, front - top, "wood3");
  p.hline(0, top, w, "wood4").vline(0, top, front - top, "wood4");
  p.rect(0, front, w, 4, "wood2").hline(0, front, w, "wood4");
  p.rect(0, front + 4, 6, H - 4, "wood2").rect(w - 6, front + 4, 6, H - 4, "wood1");
  p.rect(8, front + 4, 20, 8, "wood2").frame(8, front + 4, 20, 8, "wood1").px(18, front + 8, "gold3");
  p.hline(0, front + H - 1, w, "ink");
  // On it: newspapers on rods, the ledger, stamp and pad, the pencil jar.
  for (let k = 0; k < 3; k++) {
    const nx = 4 + k * 3, ny = top + 2 + k * 2;
    p.hline(nx, ny, 22, "wood2");
    p.rect(nx + 1, ny + 1, 20, 8, k === 1 ? "cream4" : "cream5");
    for (let r = 0; r < 3; r++) p.hline(nx + 3, ny + 3 + r * 2, 14, "cream3");
  }
  art(p, 34, top + 6, ["wwwwwww.wwwwwww", "wlllllwkwllllllw", "wwwwwwwkwwwwwww"], { w: "cream5", l: "cream3", k: "rose2" });
  art(p, 54, top + 4, [".kk.", "kKKk", ".ss.", "sSSs"], { k: "wood2", K: "wood3", s: "blue2", S: "blue3" });
  art(p, w - 12, top + 1, [".ss.", "s.ys", "sggs", "ssss"], { s: "steel3", y: "gold4", g: "rose3" });
}

// ── sprites ────────────────────────────────────────────────────────────────────

type Fixture = { x: number; y: number };
const ALCOVE = { x: 13.5, y: 4, cellSize: 1.5 };
const alcoveFixtures = (briefs.find((b) => b.id === "alcove")?.fixtures ?? []) as Fixture[];

function wallSprite(prop: MapProp): SpriteDef {
  const { w, h } = footprintPx(prop);
  if (w >= h) return sprite(prop, BACK.h - h, (q, sw, sh) => backWall(q, sw, sh, 3, prop));
  // The west wall's cap runs on north past the floor to the back wall's top.
  const rise = Math.round(prop.position.y * TILE) - (Math.round((2.6 + 0.4) * TILE) - BACK.h);
  return sprite(prop, rise, (q, sw, sh) => sideWall(q, sw, sh, rise, 5));
}

export default defineSprites(Object.fromEntries([
  ...props("reading-wall").map((p) => [propSpriteId(MAP, p.id), wallSprite(p)] as const),
  ...props("reading-low-wall").map((p) => [propSpriteId(MAP, p.id), sprite(p, 6, (q, w, h) => lowWall(q, w, h, 7))] as const),
  ...props("reading-window").map((p) => {
    const { h } = footprintPx(p);
    return [propSpriteId(MAP, p.id), sprite(p, BACK.h - h, (q, w, sh) => backWindow(q, w, sh, p.variant === 0, p.variant + 3))] as const;
  }),
  ...props("reading-shelf").map((p) => {
    const { w } = footprintPx(p);
    return [propSpriteId(MAP, p.id), w >= footprintPx(p).h ? sprite(p, 90, (q, sw, sh) => backBookcase(q, sw, sh, p.variant + 11)) : sprite(p, 84, (q, sw, sh) => sideBookcase(q, sw, sh, p.variant + 17))] as const;
  }),
  ...alcoveFixtures.map((f, i): [string, SpriteDef] => {
    const size = Math.round(ALCOVE.cellSize * TILE), low = f.y > 0;
    return [`${MAP}/alcove.shelf-${i}${low ? "-low" : ""}`, frame(size, size, low ? 30 : 70, (q, w, h) => alcoveShelf(q, w, h, low, 29 + i * 7))];
  }),
  ...props("reading-entry").map((p) => [propSpriteId(MAP, p.id), sprite(p, 100, (q, w, h) => entry(q, w, h))] as const),
  ...props("reading-notice").map((p) => [propSpriteId(MAP, p.id), sprite(p, 50, (q, w, h) => noticeDesk(q, w, h, 9))] as const),
]));
