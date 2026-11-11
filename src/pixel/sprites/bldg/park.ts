/**
 * The park's tea pavilion (`pavilion`) and the riverbank's hill shrine (`shrine`), one sprite per prop
 * (`<map>/<id>`), anchored on the footprint's bottom-centre and rising far above it.
 *
 * The pavilion (亭) is a square Suzhou-style garden pavilion: a granite platform with three steps, four
 * dark chestnut columns on stone drums, a fretwork frieze (挂落) under a jade-painted lintel, "beauty's
 * rest" bench rails (美人靠) along its sides, a round stone table and drum stools inside, and a
 * pyramidal roof of grey tiles whose four corners sweep up into horns (翼角), crowned by a gourd finial.
 * No red: the lacquer is chestnut and jade. A blank plaque hangs under the front eave for the DOM.
 *
 * The shrine is a roadside earth-god shrine (土地庙) no taller than a child: a brick niche under a tiny
 * tiled roof, a seated figure worn faceless, an incense bowl whose three sticks smoke (four frames at
 * 3 fps), oranges and a cup of tea set out, moss on its north side.
 */
import { Px, defineSprites, hash, type Color, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { drumStool, pot, seedOf, townFrame } from "../life/_helpers.ts";
import { mound } from "../plant/_helpers.ts";
import { autoOutline } from "../decor/_helpers.ts";
import { lichen, moss, pantiles } from "./_lane.ts";

type Pt = readonly [number, number];
const art = (p: Px, x: number, y: number, rows: readonly string[], legend: Record<string, Color | null>) => p.rows(x, y, rows, legend);

/** Pixels inside a polygon (even-odd, pixel centres), for masking a texture to a roof face. */
function inPoly(pts: readonly Pt[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// ── the pavilion ───────────────────────────────────────────────────────────────

const WOOD: readonly Color[] = ["wood1", "wood2", "wood3", "wood4"];

/** A column on its stone drum base, chestnut lacquer lit on the left, from `top` down to `base`. */
function column(p: Px, x: number, top: number, base: number): void {
  p.rect(x, top, 6, base - top - 4, "wood2");
  p.vline(x, top, base - top - 4, "wood3").vline(x + 1, top, base - top - 4, "wood4").vline(x + 5, top, base - top - 4, "wood1");
  // Lacquer worn at hand height.
  p.rect(x + 1, base - 34, 2, 6, "wood3");
  art(p, x - 2, base - 5, [".ssssssss.", "sSSSSSSSss", "sssssssssq", ".qqqqqqqq."], { s: "stone4", S: "stone5", q: "stone2" });
}

/** The fretwork frieze hanging under a lintel between two columns: a lattice of linked squares in dark wood. */
function frieze(p: Px, x0: number, x1: number, y: number): void {
  // The lintel, painted jade with a gold-dotted band, then the fretwork below it.
  p.rect(x0, y, x1 - x0, 5, "jade2").hline(x0, y, x1 - x0, "jade3").hline(x0, y + 4, x1 - x0, "jade1");
  for (let x = x0 + 3; x < x1 - 2; x += 6) p.px(x, y + 2, "gold3");
  const fy = y + 5;
  for (let x = x0; x < x1; x++) {
    const u = (x - x0) % 12;
    p.px(x, fy, "wood1");
    if (u === 0 || u === 6) p.vline(x, fy, 6, "wood2");
    if (u >= 2 && u <= 4) { p.px(x, fy + 2, "wood2"); p.px(x, fy + 4, "wood2"); }
    if (u === 2 || u === 4) p.vline(x, fy + 2, 3, "wood2");
  }
  // The frieze's corners drop as little hanging brackets at the columns.
  for (const x of [x0, x1 - 4]) art(p, x, fy + 6, ["kkkk", ".kk.", "..k."].map((r) => (x === x0 ? r : [...r].reverse().join(""))), { k: "wood2" });
}

/** A side bench rail (美人靠) seen end-on along the pavilion's side: a seat board, curved spindles leaning out. */
function sideBench(p: Px, x: number, y0: number, y1: number, side: -1 | 1): void {
  for (let y = y0; y < y1; y++) {
    p.px(x, y, "wood4").px(x + side, y, "wood3").px(x + side * 2, y, "wood2");
    if ((y - y0) % 4 === 0) { p.px(x + side * 3, y - 1, "wood2"); p.px(x + side * 4, y - 2, "wood2"); p.px(x + side * 5, y - 2, "wood1"); }
  }
  p.vline(x + side * 5, y0 - 2, y1 - y0, "wood3");
}

function pavilionDef(prop: MapProp): SpriteDef {
  const f = townFrame(prop, 100);
  const W = f.w, G = f.gy, seed = seedOf(prop.id);
  const cx = Math.round(W / 2);
  // Plan in sprite px: the platform, the columns' square, the roof's eaves.
  const plat = { x0: 26, x1: W - 26, back: G - 140, front: G - 22 };
  const col = { x0: 52, x1: W - 58, back: G - 122, front: G - 40 };
  const colH = 88, eaveH = 92, over = 26;
  // The roof's top is foreshortened to 60% of its depth, as the style bible asks of tops, so the apex
  // stands up out of the slopes like a tent's.
  const roofFront = col.front + 14 - eaveH;
  const eave = { x0: col.x0 - over, x1: col.x1 + 6 + over, front: roofFront, back: roofFront - Math.round((col.front - col.back + 28) * 0.6) };
  const apex: Pt = [cx, Math.round((eave.front + eave.back) / 2) - 54];
  return {
    w: W, h: f.h, anchor: f.anchor,
    shadow: { rx: Math.round((plat.x1 - plat.x0) / 2), ry: 10, dy: -8 },
    draw: (p) => {
      // ── the platform ──
      p.rect(plat.x0, plat.back, plat.x1 - plat.x0, plat.front - plat.back, "stone4");
      // Granite slabs, worn paler on the walking lines.
      for (let y = plat.back; y < plat.front; y++) for (let x = plat.x0; x < plat.x1; x++) {
        const sx = Math.floor((x - plat.x0 + (Math.floor((y - plat.back) / 14) % 2) * 12) / 24), sy = Math.floor((y - plat.back) / 14);
        const joint = (x - plat.x0 + (sy % 2) * 12) % 24 === 0 || (y - plat.back) % 14 === 0;
        p.px(x, y, joint ? "stone3" : hash(sx, sy, seed) < 0.25 ? "stone5" : "stone4");
      }
      p.hline(plat.x0, plat.back, plat.x1 - plat.x0, "stone5").vline(plat.x0, plat.back, plat.front - plat.back, "stone5");
      // Under the roof the slabs lie in shade.
      p.over(() => {
        for (let y = eave.front + 6; y < col.front + 6; y++) for (let x = col.x0 - 6; x < col.x1 + 12; x++) {
          const c = p.get(x, y);
          if (c === "stone5") p.px(x, y, "stone3"); else if (c === "stone4") p.px(x, y, "stone3"); else if (c === "stone3") p.px(x, y, "stone2");
        }
      });
      // The platform's front face and its three steps.
      p.rect(plat.x0, plat.front, plat.x1 - plat.x0, 8, "stone3").hline(plat.x0, plat.front, plat.x1 - plat.x0, "stone4").hline(plat.x0, plat.front + 7, plat.x1 - plat.x0, "stone1");
      for (let x = plat.x0 + 16; x < plat.x1; x += 32) p.vline(x, plat.front + 1, 6, "stone2");
      p.vline(plat.x1 - 1, plat.back, plat.front - plat.back + 8, "stone2");
      for (let s = 0; s < 3; s++) {
        const sw = 52 - s * -6, sx = cx - Math.round(sw / 2), sy = plat.front + 8 + s * 4;
        if (sy + 4 > G + 1) break;
        p.rect(sx, sy, sw, 4, s % 2 ? "stone4" : "stone5").hline(sx, sy + 3, sw, "stone2").vline(sx + sw - 1, sy, 4, "stone2");
      }
      p.over(() => { p.speckle(plat.x0, plat.back, plat.x1 - plat.x0, plat.front - plat.back + 8, "stone3", 0.03, seed); });
      // Moss creeping in at the platform's shaded back corner and fallen leaves on it.
      art(p, plat.x1 - 14, plat.back + 2, [".mmM", "mMmm", ".mm."], { m: "leaf2", M: "leaf3" });
      for (const [dx, dy, c] of [[20, 96, "orange2"], [140, 104, "gold3"], [70, 110, "orange3"]] as const) art(p, plat.x0 + dx, plat.back + dy, [".c", "cc"], { c });

      // Two glazed pots at the platform's front corners, each with a little trained pine.
      for (const x of [plat.x0 + 6, plat.x1 - 22]) {
        const s0 = pot(p, x, plat.front - 18, 16, 16, ["jade1", "jade2", "jade3", "jade4", "jade5"], { belly: 1 });
        const tx = Math.round(s0.cx), ty = Math.round(s0.cy);
        p.line(tx, ty, tx - 2, ty - 10, "wood3").line(tx - 2, ty - 10, tx + 3, ty - 16, "wood3");
        mound(p, tx - 4, ty - 11, 5, 2.4, ["leaf1", "leaf1", "jade2", "leaf2", "leaf3"], seed + x, [["33", "21"]], [2, 2]);
        mound(p, tx + 3, ty - 17, 6, 2.6, ["leaf1", "leaf1", "jade2", "leaf2", "leaf3"], seed + x + 1, [["33", "21"]], [2, 2]);
      }
      // ── inside: the stone table and stools ──
      const ty = Math.round((col.front + col.back) / 2) + 6;
      drumStool(p, cx - 34, ty - 18, 14, 14);
      drumStool(p, cx + 20, ty - 18, 14, 14);
      p.rect(cx - 6, ty - 18, 12, 16, "stone3").vline(cx - 6, ty - 18, 16, "stone4").vline(cx + 5, ty - 18, 16, "stone2");
      p.ellipse(cx, ty - 22, 20, 7, "stone2");
      p.ellipse(cx, ty - 24, 20, 7, "stone4");
      p.ellipse(cx - 1, ty - 25, 18, 5.5, "stone5");
      // A tea tray left on it: a pot and two cups.
      art(p, cx - 7, ty - 31, ["..kk...", ".kKKk.w", "kkrrkkW", ".krrk..", "..kk..."], { k: "rose1", K: "rose2", r: "wood2", w: "cream4", W: "white" });
      art(p, cx + 6, ty - 27, ["wW", "cc"], { w: "white", W: "cream5", c: "cream3" });
      drumStool(p, cx - 7, ty - 4, 14, 14);

      // ── columns, benches, friezes ──
      // The back columns rise into the roof; with the roof foreshortened they stop under its far eave.
      for (const x of [col.x0, col.x1]) column(p, x, Math.max(col.back - colH, eave.back + 8), col.back);
      sideBench(p, col.x0 + 2, col.back + 6, col.front - 2, -1);
      sideBench(p, col.x1 + 3, col.back + 6, col.front - 2, 1);
      for (const x of [col.x0, col.x1]) column(p, x, col.front - colH, col.front);
      frieze(p, col.x0 + 6, col.x1, eave.front + 3);

      // ── the roof ──
      // Corners: the eave rectangle, its corners swept up and out into horns.
      const FL: Pt = [eave.x0, eave.front], FR: Pt = [eave.x1, eave.front], BL: Pt = [eave.x0, eave.back], BR: Pt = [eave.x1, eave.back];
      const sweep = (x: number) => { const u = Math.abs(x - cx) / ((eave.x1 - eave.x0) / 2); return Math.round(20 * u ** 4); };
      // The fascia under the front eave: dark boards, a row of round tile ends, the eave's shadow on the frieze.
      for (let x = eave.x0; x < eave.x1; x++) {
        const y = eave.front - sweep(x);
        p.px(x, y + 1, "steel2").px(x, y + 2, "jade1").px(x, y + 3, "jade2").px(x, y + 4, "wood1");
        if (x % 6 === 0) p.px(x, y + 2, "steel4");
      }
      // Faces: the far slope (a sliver behind the apex), the side slopes, the front slope. Each is
      // tiled in courses parallel to its eave and tile columns fanning out from the apex, so the faces
      // converge on the finial; the side slopes are foreshortened to a sliver of courses.
      const frontFace: Pt[] = [];
      for (let x = eave.x0; x <= eave.x1; x += 2) frontFace.push([x, eave.front + 1 - sweep(x)]);
      frontFace.push(apex);
      const leftFace: Pt[] = [[eave.x0 - 2, eave.front - 18], [eave.x0 - 2, eave.back + 6], [eave.x0 + 4, eave.back - 8], apex];
      const rightFace: Pt[] = [[eave.x1 + 2, eave.front - 18], [eave.x1 + 2, eave.back + 6], [eave.x1 - 4, eave.back - 8], apex];
      const backFace: Pt[] = [[eave.x0 + 4, eave.back - 8], [eave.x1 - 4, eave.back - 8], apex];
      const ramp: readonly Color[] = ["steel1", "steel2", "steel3", "steel4", "steel5"];
      const tile = (level: number, course: boolean, channel: boolean): Color => ramp[Math.max(0, Math.min(4, level - (course ? 2 : channel ? 1 : 0)))];
      for (let y = eave.back - 10; y < eave.front + 4; y++) for (let x = eave.x0 - 4; x < eave.x1 + 4; x++) {
        const X = x + 0.5, Y = y + 0.5;
        const dx = X - apex[0], dy = Y - apex[1];
        if (inPoly(frontFace, X, Y)) {
          const span = Math.max(1, eave.front - sweep(x) - apex[1]);
          const t = dy / span;
          const course = Math.floor(t * 20) !== Math.floor((t - 1 / span) * 20);
          const s0 = dx / Math.max(1, dy), channel = Math.floor(s0 * 18) !== Math.floor(((dx - 1) / Math.max(1, dy)) * 18);
          const level = 3 - (x > cx + 30 ? 1 : 0) - (t > 0.88 ? 1 : 0) + (t < 0.25 && x < cx ? 1 : 0);
          p.px(x, y, tile(level, course, channel));
        } else if (inPoly(leftFace, X, Y) || inPoly(rightFace, X, Y)) {
          const left = x < cx;
          const t = Math.abs(dx) / Math.max(1, Math.abs((left ? eave.x0 : eave.x1) - apex[0]));
          const course = Math.floor(t * 9) !== Math.floor((t - 1 / 100) * 9);
          const channel = Math.floor((dy / Math.max(1, Math.abs(dx))) * 10) !== Math.floor(((dy - 1) / Math.max(1, Math.abs(dx))) * 10);
          p.px(x, y, tile(left ? 3 : 2, course, channel));
        } else if (inPoly(backFace, X, Y)) p.px(x, y, (x % 6) === 0 ? "steel1" : "steel2");
      }
      // Hip ridges from the front corners and back corners to the apex, each ending in an upswept horn.
      const hip = (a: Pt, lit: boolean) => {
        p.line(a[0], a[1], apex[0], apex[1], lit ? "stone5" : "stone3");
        p.line(a[0] + (lit ? 1 : -1), a[1], apex[0] + (lit ? 1 : -1), apex[1], lit ? "stone4" : "steel2");
        p.line(a[0], a[1] + 1, apex[0], apex[1] + 1, "steel1");
      };
      hip([FL[0] - 2, FL[1] - 20], true);
      hip([FR[0] + 2, FR[1] - 20], false);
      hip([BL[0] + 4, BL[1] - 6], true);
      hip([BR[0] - 4, BR[1] - 6], false);
      // Horns at the four corners: plaster curls rising off the hips.
      const horn = (x: number, y: number, flip: boolean, small = false) => {
        const rows = small ? ["..a", ".ab", "abc"] : ["....a", "...ab", "..abc", ".abcc", "abccd"];
        art(p, x, y, flip ? rows.map((r) => [...r].reverse().join("")) : rows, { a: "stone5", b: "stone4", c: "stone3", d: "steel1" });
      };
      horn(FL[0] - 7, FL[1] - 25, false);
      horn(FR[0] + 3, FR[1] - 25, true);
      horn(BL[0] + 1, BL[1] - 10, false, true);
      horn(BR[0] - 4, BR[1] - 10, true, true);
      // The finial: a grey ceramic gourd on a lotus base.
      art(p, apex[0] - 4, apex[1] - 14, [
        "...ab...",
        "..abbc..",
        "..bbcc..",
        "...cc...",
        ".abbbcc.",
        "abbbbccd",
        "abbbcccd",
        ".bbccdd.",
        "...dd...",
        ".aabccd.",
        "abbbcccd",
      ], { a: "steel5", b: "steel4", c: "steel3", d: "steel1" });
      // Weather on the tiles: lichen and moss in the channels low on the shaded side.
      lichen(p, eave.x0 + 20, eave.front - 40, eave.x1 - eave.x0 - 40, 30, seed, 4);
      // Ginkgo and maple leaves caught in the tile channels.
      for (let k = 0; k < 9; k++) {
        const lx = eave.x0 + 24 + Math.floor(hash(k, 1, seed) * (eave.x1 - eave.x0 - 48)), ly = apex[1] + 30 + Math.floor(hash(k, 2, seed) * (eave.front - apex[1] - 40));
        if (inPoly(frontFace, lx, ly)) art(p, lx, ly, k % 3 ? [".g", "gG"] : ["o.", "oO"], { g: "gold3", G: "gold4", o: "orange2", O: "orange3" });
      }
      moss(p, cx + 10, eave.front - 24, 60, 20, seed, 3);
      // The plaque under the front eave, blank for the DOM: a dark board in a gold frame.
      const px0 = cx - 15, py0 = eave.front + 3;
      p.rect(px0, py0, 30, 9, "wood1").frame(px0, py0, 30, 9, "gold2").hline(px0 + 1, py0 + 1, 28, "wood2");
      autoOutline(p, { map: { stone: "stone1", steel: "steel1", wood: "wood1", jade: "jade1", gold: "wood1", leaf: "leaf1", rose: "rose1", cream: "stone1", white: "stone1", orange: "brown1" } });
    },
  };
}

// ── the shrine ─────────────────────────────────────────────────────────────────

function shrineDef(prop: MapProp): SpriteDef {
  const f = townFrame(prop, 24);
  const W = f.w, G = f.gy, seed = seedOf(prop.id);
  const cx = Math.round(W / 2);
  return {
    w: W, h: f.h, anchor: f.anchor, frames: 4, fps: 3,
    shadow: { rx: 26, ry: 6, dy: -14 },
    draw: (p, frame) => {
      // A stone apron in front where people kneel, worn smooth, and the hill path's stones round it.
      const ay = G - 22;
      p.ellipse(cx, ay + 6, 30, 8, "stone3");
      p.ellipse(cx, ay + 5, 29, 7, "stone4");
      p.over(() => p.speckle(cx - 30, ay - 2, 60, 16, "stone3", 0.1, seed));
      for (const [dx, dy] of [[-44, 2], [38, 6], [-30, 14], [46, -8]] as const) art(p, cx + dx, ay + dy, [".ss.", "sSss", ".qq."], { s: "stone3", S: "stone4", q: "stone2" });
      // The shrine body: grey brick sides, a dark niche, a stone sill.
      const bx = cx - 18, by = G - 58, bw = 36, bh = 30;
      for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) {
        const course = Math.floor((y - by) / 3), joint = (y - by) % 3 === 2 || (x - bx + (course % 2) * 3) % 6 === 5;
        p.px(x, y, joint ? "stone2" : hash(Math.floor((x - bx) / 6), course, seed) < 0.3 ? "stone4" : "steel3");
      }
      p.vline(bx + bw - 1, by, bh, "steel1");
      p.rect(cx - 9, by + 6, 18, 20, "ink2");
      p.rect(cx - 8, by + 7, 16, 18, "wood1");
      // The earth god, seated, worn faceless: a pale head, an ochre robe, a staff.
      art(p, cx - 6, by + 9, [
        "....cc......",
        "...cCCc.....",
        "...cccc..g..",
        "..oooooo.g..",
        ".oOOooooog..",
        ".oOoooooog..",
        ".ooooooooo..",
        ".ddddddddd..",
      ], { c: "cream3", C: "cream4", o: "gold2", O: "gold3", d: "gold1", g: "oak3" });
      // Pale paper strips either side of the niche, blank.
      for (const x of [cx - 13, cx + 11]) p.rect(x, by + 6, 2, 18, "cream3");
      p.rect(bx - 2, by + bh, bw + 4, 4, "stone4").hline(bx - 2, by + bh, bw + 4, "stone5").hline(bx - 2, by + bh + 3, bw + 4, "stone2");
      // The roof: a tiny tiled hip, ridge and two horns.
      const roofY = by - 12;
      const roof = new Px(W, f.h);
      pantiles(roof, bx - 8, roofY, bw + 16, 12, seed, "south", { damp: 0.2 });
      for (let y = roofY; y < roofY + 12; y++) for (let x = bx - 8; x < bx + bw + 8; x++) {
        const inset = Math.round((roofY + 12 - y) * 0.5);
        if (x >= bx - 8 + inset && x < bx + bw + 8 - inset) { const c = roof.get(x, y); if (c) p.px(x, y, c); }
      }
      p.hline(bx - 2, roofY - 2, bw + 4, "steel2").hline(bx - 2, roofY - 1, bw + 4, "stone4");
      art(p, bx - 5, roofY - 5, ["a..", "ab.", ".bc"], { a: "stone5", b: "stone4", c: "stone3" });
      art(p, bx + bw + 2, roofY - 5, ["..a", ".ba", "cb."], { a: "stone5", b: "stone4", c: "stone3" });
      p.hline(bx - 8, roofY + 12, bw + 16, "steel1");
      // The incense bowl on the sill, three sticks, and offerings: oranges, a cup of tea.
      const iy = by + bh - 4;
      art(p, cx - 5, iy, [".bbbbbbbb.", "bBBBBBBBBb", ".bbbbbbbb.", "..qqqqqq.."], { b: "steel3", B: "steel4", q: "steel2" });
      for (const dx of [-2, 0, 2]) { p.vline(cx + dx, iy - 7, 7, "rose3"); p.px(cx + dx, iy - 8, "orange3"); }
      for (const [dx, dy] of [[-16, 0], [-12, 1], [-14, -2]] as const) art(p, cx + dx, iy + dy, [".oO", "ooo", ".d."], { o: "orange2", O: "orange3", d: "orange1" });
      art(p, cx + 10, iy, ["wWw", "wgw", ".w."], { w: "white", W: "cream5", g: "gold3" });
      // Moss on the north-facing brick and the roof's back edge.
      p.over(() => { for (let k = 0; k < 14; k++) p.px(bx + Math.floor(hash(k, 1, seed) * bw), by + Math.floor(hash(k, 2, seed) * 8), k % 2 ? "leaf2" : "leaf3"); });
      autoOutline(p, { map: { stone: "stone1", steel: "steel1", wood: "wood1", gold: "wood1", cream: "stone1", white: "stone1", orange: "brown1", rose: "rose1", leaf: "leaf1", ink: "ink" } });
      // Smoke from the sticks, curling up and drifting east, translucent.
      p.faded(0.45, () => {
        for (let k = 0; k < 3; k++) for (let j = 0; j < 22; j++) {
          const y = iy - 9 - j - k * 2, x = cx + (k - 1) * 2 + Math.round(Math.sin((j + frame * 2.5 + k * 3) / 3.5) * 1.6 + j * 0.25);
          if ((j + frame + k) % 5 !== 0) p.px(x, y, j > 14 ? "cream4" : "white");
        }
      });
    },
  };
}

export default defineSprites(Object.fromEntries([
  ...mapProps("all", "pavilion").map((p) => [propSpriteId(p.map, p.id), pavilionDef(p)] as const),
  ...mapProps("all", "shrine").map((p) => [propSpriteId(p.map, p.id), shrineDef(p)] as const),
]));
