/**
 * The tea house (`town/tea-house`, 288×320): a two-storey timber teahouse older than the Deco street
 * around it. Grey tile hip roof with upturned corners and a jade-glazed vase on the ridge; a tiled skirt
 * roof over a columned veranda; lattice doors papered from inside; carved brackets where the columns
 * meet the painted beam. The east bay is the terrace side: an open bay with a lean-out bench rail where
 * the old men hang their birdcages and leave the teapot cooling on the rail.
 *
 * Blank sign field (DOM text): the black plaque between the upper windows, x 108..180, rows 175..187.
 * The canvas awning `town/tea-awning` is strung under the skirt roof at z 88.
 */
import { defineSprites, hash, type Color, type Legend, type Px } from "../../kit/index.ts";
import { block, boards, lattice, perProp, plotFoot, signboard, sillPot, step, tileSkirt, zrect } from "./_front.ts";

const COLS = [6, 78, 144, 210, 282];

function column(p: Px, H: number, cx: number) {
  const x = cx - 4;
  zrect(p, H, x, 10, 8, 86, "rose1");
  zrect(p, H, x, 10, 1, 86, "wood1");
  zrect(p, H, x + 1, 10, 2, 86, "rose3");
  zrect(p, H, x + 3, 10, 1, 86, "rose2");
  zrect(p, H, x + 7, 10, 1, 86, "rose1");
  // Lacquer worn through to the wood at shoulder height, where everyone leans.
  zrect(p, H, x + 2, 40, 3, 52, "wood3");
  zrect(p, H, x + 2, 44, 1, 50, "wood4");
  // Drum-shaped stone base.
  block(p, x - 2, H - 13, [".bbbbbbbb.", "bcccccccdb", "bcdddddddb", "abbbbbbbba", ".aaaaaaaa."], { a: "stone2", b: "stone3", c: "stone5", d: "stone4" }, "base");
}

/** Carved brackets (雀替) tucked under the beam either side of a column. */
function brackets(p: Px, H: number, cx: number, left: boolean, right: boolean) {
  const L: Legend = { a: "wood1", b: "wood3", c: "wood4", d: "jade2", e: "gold3" };
  const shape = ["bbbbbbbbbbbb", "abccccbbbba.", ".abbdbbcba..", "..abbbcba...", "...abbba....", "....aba.....", ".....a......"];
  if (right) block(p, cx + 4, H - 85, shape, L, "bracket");
  if (left) block(p, cx - 16, H - 85, shape.map((r) => [...r].reverse().join("")), L, "bracket");
}

/** The painted beam (额枋): jade and blue bands with gilt rules and three cartouches. */
function beam(p: Px, H: number, w: number) {
  zrect(p, H, 0, 84, w, 99, "jade2");
  zrect(p, H, 0, 98, w, 99, "jade4");
  zrect(p, H, 0, 97, w, 98, "jade3");
  zrect(p, H, 0, 84, w, 89, "blue2");
  zrect(p, H, 0, 88, w, 89, "gold2");
  zrect(p, H, 0, 84, w, 85, "blue1");
  zrect(p, H, 0, 95, w, 96, "gold2");
  for (const [cx, cw] of [[42, 40], [144, 70], [246, 40]] as const) {
    const x = cx - cw / 2;
    zrect(p, H, x, 89, cw, 95, "cream4");
    zrect(p, H, x, 94, cw, 95, "cream5");
    zrect(p, H, x, 89, 1, 95, "gold2");
    zrect(p, H, x + cw - 1, 89, 1, 95, "gold1");
    // A plain meander inside, worn off in places.
    for (let i = 3; i < cw - 3; i += 4) {
      if (hash(cx, i, 4) < 0.15) continue;
      p.px(x + i, H - 93, "blue3").px(x + i, H - 92, "blue3").px(x + i + 1, H - 92, "blue3").px(x + i + 2, H - 92, "blue3").px(x + i + 2, H - 91, "blue3");
    }
  }
}

/** A papered lattice door leaf with a carved lower panel; `open` folds it back to show the room. */
function doorLeaf(p: Px, H: number, x: number, w: number, open: boolean, seed: number) {
  if (open) {
    // The leaf folded flat against the next one: just its edge, and the room beyond.
    zrect(p, H, x, 12, w, 82, "wood1");
    for (let j = 0; j < 70; j++) p.hline(x + 2, H - 13 - j, w - 4, j < 14 ? "wood2" : j < 40 ? "wood1" : "ink2");
    return;
  }
  zrect(p, H, x, 12, w, 82, "wood3");
  zrect(p, H, x, 12, 1, 82, "wood4");
  zrect(p, H, x + w - 1, 12, 1, 82, "wood1");
  lattice(p, x + 3, H - 79, w - 6, 40, seed, seed % 3 === 1);
  // Waist rail and the carved skirt panel with a ruyi medallion.
  zrect(p, H, x + 2, 36, w - 4, 39, "wood2");
  zrect(p, H, x + 2, 38, w - 4, 39, "wood5");
  zrect(p, H, x + 4, 15, w - 8, 34, "wood2");
  zrect(p, H, x + 5, 16, w - 10, 33, "wood3");
  zrect(p, H, x + 5, 32, w - 10, 33, "wood4");
  const mx = x + Math.floor(w / 2) - 3, my = H - 29;
  block(p, mx, my, [".aaaa.", "abccba", "abccba", ".aaaa."], { a: "wood1", b: "wood4", c: "wood5" }, "medallion");
  zrect(p, H, x + 2, 12, w - 4, 14, "wood1");
}

/** The open terrace bay: a lean-out bench rail, the teapot on it, a birdcage, an orchid. */
function terraceBay(p: Px, H: number, x: number, w: number) {
  // The room behind, in shade: a tea table and stools seen dimly, a lamp.
  for (let j = 0; j < 72; j++) p.hline(x, H - 13 - j, w, j < 22 ? "wood2" : j < 54 ? "wood1" : "ink2");
  block(p, x + 30, H - 40, ["aaaaaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbbbbb", "..b............b..", "..b............b..", "..b............b.."], { a: "wood3", b: "wood2" }, "table");
  p.rect(x + 34, H - 43, 4, 3, "cream4").rect(x + 40, H - 43, 3, 3, "cream4").px(x + 41, H - 44, "jade4");
  p.ellipse(x + 50, H - 72, 3, 3, "gold4");
  p.px(x + 49, H - 73, "gold5");
  // Lean-out bench (美人靠): the seat, then the curved back rail with its balusters.
  zrect(p, H, x, 12, w, 22, "wood2");
  zrect(p, H, x, 21, w, 22, "wood5");
  zrect(p, H, x, 20, w, 21, "wood4");
  for (let i = 2; i < w; i += 5) zrect(p, H, x + i, 22, 2, 36, "wood3");
  for (let i = 2; i < w; i += 5) zrect(p, H, x + i + 1, 22, 1, 36, "wood1");
  zrect(p, H, x, 35, w, 38, "wood3");
  zrect(p, H, x, 37, w, 38, "wood5");
  zrect(p, H, x, 34, w, 35, "wood1");
  // A brown clay teapot and two cups on the rail.
  block(p, x + 14, H - 44, ["...aa...", ".abbbba.", "abccbbba", "abbbbbbad", ".aaaaaa.."].map((r) => r.padEnd(9, ".")), { a: "wood1", b: "rose3", c: "rose4", d: "rose2" }, "teapot");
  p.rect(x + 26, H - 41, 3, 3, "white").px(x + 26, H - 41, "blue3").rect(x + 31, H - 41, 3, 3, "white");
  // A bamboo birdcage on its hook, a thrush inside.
  const bx = x + 40, by = H - 78;
  p.vline(bx + 7, by - 6, 6, "steel2");
  block(p, bx, by, [
    "....aaaaaaa.....",
    "..aabbbbbbbaa...",
    ".abababababab...",
    "a.b.b.b.b.b.ba..",
    "a.b.b.ccb.b.ba..",
    "a.b.bcddcb.b.a..",
    "a.b.b.cc.b.b.a..",
    "a.b.b.ee.b.b.a..",
    "aaaaaaaaaaaaaa..",
    ".bbbbbbbbbbbb...",
  ].map((r) => r.slice(0, 15)), { a: "bamboo2", b: "bamboo4", c: "brown3", d: "brown2", e: "gold3" }, "cage");
  // An orchid in a blue-and-white pot on the step.
  block(p, x + 4, H - 30, ["..m.n..", ".mnmn.m", "mn.pmn.", "..pmp..", ".aaaaa.", ".abcba.", "..aaa.."], { m: "leaf2", n: "leaf3", p: "plum4", a: "blue2", b: "white", c: "blue3" }, "orchid");
}

// ── roof ────────────────────────────────────────────────────────────────────

type Face = "N" | "S" | "L" | "R" | "ridge" | null;

function roof(p: Px, w: number) {
  const RH = 160, L = 12, CW = 52;
  const lift = (x: number) => L * Math.max(0, 1 - x / CW) ** 2 + L * Math.max(0, 1 - (w - 1 - x) / CW) ** 2;
  const fe = (x: number) => Math.round(RH - 3 - lift(x));
  const be = (x: number) => Math.round(Math.max(0, 9 - lift(x) * 0.6));
  const r0 = 34, r1 = 43, ra = 74, rb = w - 74;
  const corner = 3;
  const face = (x: number, y: number): Face => {
    if (y < be(x) || y > fe(x)) return null;
    if (y >= r0 && y < r1 && x >= ra && x < rb) return "ridge";
    const mirror = x >= w / 2;
    const xx = mirror ? w - 1 - x : x;
    if (xx < ra) {
      if (y >= r1) {
        const xh = ra - ((y - r1) * (ra - corner)) / (fe(corner) - r1);
        return xx < xh ? (mirror ? "R" : "L") : "S";
      }
      if (y < r0) {
        const xb = ra - ((r0 - y) * (ra - corner)) / (r0 - be(corner));
        return xx < xb ? (mirror ? "R" : "L") : "N";
      }
      return mirror ? "R" : "L";
    }
    return y < r0 ? "N" : "S";
  };
  for (let y = 0; y < RH; y++) for (let x = 0; x < w; x++) {
    const f = face(x, y);
    if (!f) continue;
    let c: Color;
    if (f === "S") {
      const k = x % 6, course = (y - r1) % 6;
      c = k === 0 || k === 1 ? "stone4" : k === 2 ? "stone3" : k === 5 ? "stone1" : "stone2";
      if (course === 0) c = k < 3 ? (k === 0 ? "stone5" : "stone4") : "stone1";
      if (y > fe(x) - 5) {
        const e = y - (fe(x) - 4);
        c = k < 3 ? (["stone4", k === 1 ? "stone5" : "stone3", "stone2", "stone1", "ink2"] as Color[])[e] : (["stone2", "stone2", "stone1", "ink2", "ink2"] as Color[])[e];
      }
    } else if (f === "N") {
      const k = x % 6, course = (r0 - y) % 3;
      c = k === 0 ? "stone5" : k < 3 ? "stone4" : k === 5 ? "stone2" : "stone3";
      if (course === 0) c = k < 3 ? "stone5" : "stone2";
    } else if (f === "L" || f === "R") {
      // Hip faces: tile rows run down toward the eave at the side; the west hip catches the sun.
      const k = y % 5, course = x % 6;
      const lit = f === "L";
      c = k === 0 ? (lit ? "stone5" : "stone3") : k < 3 ? (lit ? "stone4" : "stone3") : k === 4 ? "stone1" : (lit ? "stone3" : "stone2");
      if (course === 0) c = k < 3 ? (lit ? "stone5" : "stone4") : "stone1";
      const edge = f === "L" ? x : w - 1 - x;
      if (edge < 3) c = edge === 0 ? "stone1" : "stone2";
    } else {
      c = "stone2";
    }
    p.px(x, y, c);
  }
  // Main ridge: tiles on edge, a lit coping, the shadow it throws on the near slope.
  for (let x = ra; x < rb; x++) {
    p.px(x, r0 - 3, "stone4").px(x, r0 - 2, "stone5");
    for (let y = r0 - 1; y < r1 - 2; y++) p.px(x, y, x % 2 ? "stone2" : "stone4");
    p.px(x, r1 - 2, "stone1").px(x, r1 - 1, "stone3");
    p.px(x, r0 - 4, "stone2");
  }
  // Hip ridges: four diagonal rolls of tile from the ridge ends to the corners.
  const hip = (x0: number, y0: number, x1: number, y1: number, lit: boolean) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= n; s++) {
      const x = Math.round(x0 + ((x1 - x0) * s) / n), y = Math.round(y0 + ((y1 - y0) * s) / n);
      p.rect(x - 2, y - 1, 5, 3, "stone2");
      p.px(x - 2, y - 1, lit ? "stone5" : "stone4").px(x - 1, y - 1, "stone4").px(x + 2, y + 1, "stone1");
      if (s % 3 === 0) p.px(x, y, "stone1");
    }
  };
  hip(ra, r1 - 1, corner + 2, fe(corner + 2) - 3, true);
  hip(rb - 1, r1 - 1, w - corner - 3, fe(w - corner - 3) - 3, false);
  hip(ra, r0, corner + 3, be(corner + 3) + 2, true);
  hip(rb - 1, r0, w - corner - 4, be(w - corner - 4) + 2, false);
  // Ridge ornaments: curling fish-tail ends and a jade-glazed vase in the middle.
  const OR: Legend = { a: "stone1", b: "stone2", c: "stone3", d: "stone4", e: "stone5" };
  const fish = [".....aa..", "....adda.", "...adba..", "..adba...", ".adcba...", "adccbaaa.", "adcccccba", "abbbbbbba"];
  block(p, ra - 4, r0 - 10, fish, OR, "fish");
  block(p, rb - 5, r0 - 10, fish.map((r) => [...r].reverse().join("")), OR, "fish");
  block(p, w / 2 - 5, r0 - 12, [
    "...aaaa...", "..aeedda..", "..adddca..", "...abba...", "..adddca..", ".aeddddca.", ".adddddca.", "..acccca..", "aaaaaaaaaa",
  ], { a: "jade1", b: "jade2", c: "jade3", d: "jade4", e: "jade6" }, "vase");
  // Upturned corner tips: the eave flicks up into a hook at each front corner.
  const tip = ["..ab", ".abd", "abdd", "bddb", "bdba", "bba."];
  const TL: Legend = { a: "stone1", b: "stone2", d: "stone4" };
  block(p, 0, fe(0) - 12, tip.map((r) => [...r].reverse().join("")), TL, "tip");
  block(p, w - 4, fe(w - 1) - 12, tip, TL, "tip");
  // Moss in the low channels, a few new tiles where the typhoon took some.
  for (let x = 12; x < w - 12; x += 6) {
    const r = hash(x, 5, 21);
    if (r < 0.2) p.rect(x + 3, fe(x) - 8 - Math.floor(r * 25), 2, 3, "jade2").px(x + 3, fe(x) - 9 - Math.floor(r * 25), "jade3");
    if (r > 0.9) for (let y = r1 + 8; y < r1 + 20; y++) if (face(x, y) === "S") p.px(x, y, (y - r1) % 6 === 0 ? "grey3" : "grey2").px(x + 1, y, (y - r1) % 6 === 0 ? "grey3" : "grey2");
  }
  // Stonecrop (瓦松) in tufts on the old tiles, the sure sign of a roof nobody has relaid in decades.
  for (const [sx, sy] of [[96, 70], [180, 96], [130, 128], [228, 118], [60, 120]] as const) {
    if (face(sx, sy) !== "S" && face(sx, sy) !== "L" && face(sx, sy) !== "R") continue;
    block(p, sx, sy, ["..n..", ".nmn.", "nmlmn", ".lml."], { l: "jade2", m: "jade3", n: "jade5" }, "stonecrop");
  }
  // A child's kite, caught on the south slope months ago: a faded paper diamond and its tail.
  block(p, 200, 60, [
    "....a....",
    "...aba...",
    "..abcba..",
    ".abcccba.",
    "abcccccba",
    ".abcccba.",
    "..abcba..",
    "...aba...",
    "....a....",
  ], { a: "bamboo2", b: "blue4", c: "cream4" }, "kite");
  for (let j = 0; j < 22; j++) p.px(204 + Math.round(Math.sin(j / 3) * 3) + Math.floor(j / 4), 69 + j, j % 5 === 4 ? "plum3" : "cream2");
  // A shadow strip under the eave: the rafters' dark gap.
  for (let x = 0; x < w; x++) p.px(x, fe(x) + 1, "ink2").px(x, fe(x) + 2, "ink");
}

// ── facade ──────────────────────────────────────────────────────────────────

function facade(p: Px, H: number, w: number) {
  // Plinth: granite step and the veranda's stone floor seen from above.
  zrect(p, H, 0, 0, w, 5, "stone3");
  zrect(p, H, 0, 4, w, 5, "stone5");
  zrect(p, H, 0, 0, w, 1, "stone2");
  for (let i = 0; i < w; i += 36) zrect(p, H, i, 0, 1, 4, "stone2");
  zrect(p, H, 0, 5, w, 12, "stone4");
  for (let i = 18; i < w; i += 36) zrect(p, H, i, 5, 1, 12, "stone3");
  zrect(p, H, 0, 11, w, 12, "stone2");
  // The recessed front, in the veranda's shade.
  zrect(p, H, 0, 12, w, 84, "wood1");
  // Bay 1: a papered lattice window over a boarded sill wall.
  boards(p, 10, H - 32, 64, 20, 3, 6, ["wood1", "wood2", "wood3", "wood3"]);
  zrect(p, H, 10, 31, 64, 33, "wood5");
  lattice(p, 12, H - 80, 60, 46, 2);
  sillPot(p, 50, H - 35, "fern");
  // Bay 2: four closed lattice doors.
  for (let k = 0; k < 4; k++) doorLeaf(p, H, 82 + k * 14.5 | 0, 15, false, k + 10);
  // Bay 3: the way in. The outer leaves are closed, the middle two folded back.
  doorLeaf(p, H, 148, 15, false, 20);
  doorLeaf(p, H, 163, 14, true, 21);
  doorLeaf(p, H, 177, 14, true, 22);
  doorLeaf(p, H, 191, 15, false, 23);
  // Inside the open doors: a hanging lamp and the edge of a tea table, warm.
  p.ellipse(184, H - 64, 3, 3, "gold4");
  p.px(183, H - 65, "gold5");
  p.vline(184, H - 82, 15, "wood2");
  p.rect(166, H - 32, 24, 3, "wood3").hline(166, H - 32, 24, "wood4");
  // A raised threshold board the customers step over.
  zrect(p, H, 163, 12, 28, 16, "wood3");
  zrect(p, H, 163, 15, 28, 16, "wood5");
  // Bay 4: the terrace side.
  terraceBay(p, H, 214, 64);
  // Columns and brackets, then the painted beam.
  COLS.forEach((cx, i) => {
    column(p, H, cx);
    brackets(p, H, cx, i > 0, i < COLS.length - 1);
  });
  beam(p, H, w);
  // Skirt roof over the veranda (z 98..112), its corners flicked up.
  tileSkirt(p, 0, H - 114, w, 16, 6);
  for (const [x, flip] of [[0, false], [w - 6, true]] as const) {
    const t = ["....ab", "...abd", "..abdb", ".abdb.", "abdb..", "bba..."];
    block(p, x, H - 106, flip ? t.map((r) => [...r].reverse().join("")) : t, { a: "stone1", b: "stone2", d: "stone4" }, "skirt-tip");
  }
  // Upper storey: boarded wall, a balustrade, long lattice windows, the plaque.
  boards(p, 0, H - 152, w, 38, 9, 8, ["wood1", "wood2", "wood3", "wood4"]);
  // Windows.
  for (const [x, ww, blind] of [[12, 84, true], [192, 84, false]] as const) {
    zrect(p, H, x - 2, 122, ww + 4, 150, "wood2");
    lattice(p, x, H - 148, ww, 24, x + 1, x > 100);
    if (blind) {
      // A bamboo blind let down over half the window and tied off.
      for (let j = 0; j < 14; j++) p.hline(x + 2, H - 147 + j, 40, j % 2 ? "bamboo3" : "bamboo4");
      p.hline(x + 2, H - 133, 40, "bamboo2");
      p.vline(x + 12, H - 148, 16, "rose3").vline(x + 31, H - 148, 16, "rose3");
    }
  }
  signboard(p, 104, H - 149, 80, 18, "wood");
  // Balustrade: rail, balusters, a lit top.
  zrect(p, H, 0, 113, w, 116, "wood2");
  for (let i = 3; i < w; i += 6) { zrect(p, H, i, 116, 2, 124, "wood3"); zrect(p, H, i + 1, 116, 1, 124, "wood1"); }
  zrect(p, H, 0, 123, w, 126, "wood3");
  zrect(p, H, 0, 125, w, 126, "wood5");
  zrect(p, H, 0, 122, w, 123, "wood1");
  // Pots on the balcony, and a pair of slippers left out.
  sillPot(p, 102, H - 128, "geranium");
  sillPot(p, 240, H - 128, "scallion");
  // Rafter ends under the main eave, painted jade with cream eyes.
  zrect(p, H, 0, 150, w, 160, "wood1");
  for (let i = 2; i < w; i += 7) {
    p.rect(i, H - 157, 4, 4, "jade2").px(i, H - 157, "jade3").px(i + 1, H - 156, "cream4").px(i + 3, H - 154, "jade1");
  }
  zrect(p, H, 0, 150, w, 151, "ink2");
  void step;
}

export default defineSprites(perProp("building-tea", (_prop, w, h) => ({
  foot: plotFoot(w, h),
  draw: (p) => {
    facade(p, h, w);
    roof(p, w);
  },
})));
