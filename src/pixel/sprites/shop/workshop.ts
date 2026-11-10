/**
 * The workshop (`town/workshop`, 352×352): a 1950s neighbourhood repair works in a brick shed whose
 * sawtooth roof is the street's oddest sight. From above, five teeth step back from the street, each
 * a band of glazing (some panes painted over, one gone, one mended with plywood) under the
 * corrugated back slope of the tooth in front of it, rusting at the laps, a gutter of silt and grass
 * in every valley.
 *
 * Street face: the roller door (x 160..240, the map's opening) wound up all but the bottom slat, the
 * bench, pegboard and the half-built bicycle inside; a steel-framed window with a cracked pane and
 * a plywood one; a side door, the meter box, a hose on its hook; a painted sign band gone chalky.
 *
 * Blank sign field (DOM text): the painted band x 122..282, rows 238..251.
 * The doorway is 64 px tall (the shutter's bottom bar at z 64). The canopy `town/workshop-canopy`
 * hangs from z 100, over the roller door.
 */
import { defineSprites, hash, type Color, type Legend, type Px } from "../../kit/index.ts";
import { acUnit, block, cable, darkRoom, downpipe, greyBrick, perProp, plotFoot, signboard, step, zrect } from "./_front.ts";

const F = 128; // facade height, to the top of the parapet
const TEETH = 5;

/**
 * The sawtooth from above and in front. Ridges run along the street, and each tooth turns a band of
 * glazing toward the street (it is the morning light the old fitters wanted), so the roof reads as
 * five stacked bands: a glazed face seen straight on, then the tooth's corrugated back slope going
 * away, foreshortened, lit by the sky.
 */
function roof(p: Px, w: number, H: number) {
  const bottom = H - F;
  const T = bottom / TEETH; // ~44.8 rows per tooth
  for (let n = 0; n < TEETH; n++) {
    const y0 = Math.round(n * T), y1 = Math.round((n + 1) * T);
    const glassTop = y1 - 17; // the glazing band is the bottom 16 rows of each tooth, plus its gutter
    // Back slope: corrugated, ribs every 4 px, a lap halfway, lighter as it rises toward the next ridge.
    for (let y = y0; y < glassTop; y++) for (let x = 0; x < w; x++) {
      const k = x % 4, u = (y - y0) / (glassTop - y0);
      let c: Color = k === 0 ? "steel4" : k === 3 ? "steel2" : "steel3";
      if (u < 0.35 && k === 1) c = "steel4";
      if (u > 0.85) c = k === 3 ? "steel2" : "steel3";
      if (y === y0 + Math.round((glassTop - y0) / 2)) c = k === 0 ? "steel5" : "steel4";
      p.px(x, y, c);
    }
    // Ridge cap along the top of the glazing.
    p.hline(0, glassTop, w, "steel5").hline(0, glassTop + 1, w, "steel4").hline(0, glassTop - 1, w, "steel2");
    // The glazed face: steel glazing bars, panes catching the sky high and the dark shop low.
    for (let y = glassTop + 2; y < y1 - 2; y++) for (let x = 0; x < w; x++) {
      const gy = Math.floor((y - glassTop - 2) / 6), gx = Math.floor(x / 11);
      const bar = (y - glassTop - 2) % 6 === 5 || x % 11 === 0;
      const r = hash(gx, n * 5 + gy, 3);
      let c: Color = bar ? "steel1" : (y - glassTop - 2) % 6 < 2 ? "blue4" : "blue3";
      if (!bar && gy >= 1) c = (y - glassTop - 2) % 6 < 2 ? "blue3" : "blue2";
      if (!bar && r < 0.13) c = (y - glassTop - 2) % 6 === 0 ? "cream3" : "cream2"; // painted over
      if (!bar && r > 0.975) c = "ink"; // a pane gone
      if (!bar && r > 0.955 && r <= 0.975) c = "oak3"; // plywood
      if (!bar && x % 11 === 2 + ((y - glassTop) % 6) && gy === 0 && r > 0.3 && r < 0.6) c = "blue5"; // glint
      p.px(x, y, c);
    }
    // Gutter in the valley, with a sag and a tuft of grass growing in the silt.
    p.hline(0, y1 - 2, w, "steel2").hline(0, y1 - 1, w, "steel1");
    const tuft = Math.floor(hash(n, 4, 7) * (w - 40)) + 20;
    p.rows(tuft, y1 - 5, ["m.n.", "mnmn", "lmlm"], { l: "leaf1", m: "leaf2", n: "leaf3" });
  }
  // Rust on the slopes, a new sheet, a sheet of yellowed fibreglass letting light in.
  for (let n = 0; n < TEETH; n++) {
    const y0 = Math.round(n * T), gt = Math.round((n + 1) * T) - 17;
    for (let k = 0; k < 4; k++) {
      const rx = 8 + Math.floor(hash(n, k, 18) * (w - 30)), ry = y0 + 3 + Math.floor(hash(k, n, 19) * (gt - y0 - 9));
      p.rect(rx + 1, ry, 6, 2, "wood3").hline(rx, ry + 1, 8, "wood3").hline(rx + 2, ry + 2, 4, "orange1").px(rx + 3, ry + 3, "orange1");
    }
    if (n === 1) for (let y = y0; y < gt - 1; y++) for (let x = 120; x < 140; x++) p.px(x, y, x % 4 === 0 ? "gold4" : x % 4 === 3 ? "bamboo3" : "bamboo4");
    if (n === 3) for (let y = y0; y < gt - 1; y++) for (let x = 230; x < 254; x++) p.px(x, y, x % 4 === 0 ? "steel5" : x % 4 === 3 ? "steel3" : "steel4");
  }
  // A ventilator cowl on the third slope, a pigeon on a ridge, the street cable over the edge.
  block(p, 286, Math.round(2 * T) + 6, [
    "...aaaaaa...",
    "..abbccdda..",
    ".abcbcbcdda.",
    ".abbccbcdda.",
    "..abbccdda..",
    "...aeeeea...",
    "....aeea....",
    "....aeea....",
  ], { a: "steel1", b: "steel5", c: "steel4", d: "steel3", e: "steel2" }, "cowl");
  block(p, 70, Math.round(4 * T) - 22, ["..ab..", ".abbc.", "dbbbbc", ".ebbe.", "..f.f."], { a: "grey2", b: "grey2", c: "grey1", d: "plum2", e: "jade3", f: "skin2" }, "pigeon");
  // Gable edges.
  for (let y = 0; y < bottom; y++) { p.px(0, y, "steel1"); p.px(w - 1, y, "steel1"); }
}

function facade(p: Px, H: number, w: number) {
  // Brick up to the zigzag; the gable tops of the teeth carry a coping.
  greyBrick(p, 0, H - F, w, F, 12);
  // Parapet coping, its top seen from above, and a stepped centre over the sign.
  zrect(p, H, 0, 124, w, 128, "stone4");
  zrect(p, H, 0, 127, w, 128, "stone5");
  zrect(p, H, 0, 124, w, 125, "stone2");
  zrect(p, H, 0, 120, w, 124, "stone3");
  zrect(p, H, 0, 120, w, 121, "stone1");
  // A lime-washed plinth band, splashed with street grime in small clusters.
  zrect(p, H, 0, 0, w, 14, "stone4");
  zrect(p, H, 0, 13, w, 14, "stone5");
  zrect(p, H, 0, 0, w, 1, "stone2");
  for (let i = 0; i < w; i += 5) if (hash(i, 1, 6) < 0.3) { const hh = 1 + Math.floor(hash(i, 2, 6) * 3); zrect(p, H, i, 1, 3, 1 + hh, "stone3"); }
  // Painted sign band, chalky.
  signboard(p, 118, H - 116, 168, 16, "painted", 4);
  // The roller door's opening, 64 px tall: the room, the posts, the drum box, the last slats of the
  // shutter hanging under it with the bottom bar at z 64.
  roomInside(p, H, 160, 80);
  zrect(p, H, 156, 0, 4, 86, "steel2");
  zrect(p, H, 240, 0, 4, 86, "steel1");
  zrect(p, H, 156, 0, 1, 86, "steel4");
  zrect(p, H, 158, 74, 84, 86, "steel3");
  zrect(p, H, 158, 85, 84, 86, "steel5");
  zrect(p, H, 158, 74, 84, 75, "steel1");
  zrect(p, H, 158, 79, 84, 80, "steel2");
  for (let j = 0; j < 9; j++) zrect(p, H, 160, 73 - j, 80, 74 - j, j % 3 === 0 ? "steel5" : j % 3 === 1 ? "steel4" : "steel2");
  zrect(p, H, 160, 64, 80, 65, "steel1");
  zrect(p, H, 196, 65, 8, 67, "steel2");
  zrect(p, H, 197, 66, 6, 67, "steel5");
  // Steel window with a cracked pane and a plywood one.
  steelWindow(p, H, 24, 32, 112, 56);
  // Side door, meter box, hose.
  sideDoor(p, H, 266);
  block(p, 300, H - 74, [
    "aaaaaaaaaaaa",
    "abbbbbbbbbbc",
    "abddddddddbc",
    "abdeeeeeedbc",
    "abdeffffedbc",
    "abdeeeeeedbc",
    "abddddddddbc",
    "abbbbbgbbbbc",
    "abbbbbbbbbbc",
    "cccccccccccc",
  ], { a: "steel5", b: "steel4", c: "steel1", d: "steel2", e: "white", f: "ink2", g: "gold3" }, "meter");
  cable(p, 306, H - 74, 306, H - 118, 0, "ink2");
  // Hose coiled on its hook.
  const hx = 318, hy = H - 46;
  p.ellipse(hx, hy, 7, 6, "jade2");
  p.ellipse(hx, hy, 5, 4, "jade1");
  p.ellipse(hx, hy, 3.5, 2.5, "stone3");
  p.px(hx - 5, hy - 4, "jade4").px(hx - 6, hy - 2, "jade4");
  for (let j = 0; j < 24; j++) p.px(hx + 5 + Math.round(Math.sin(j / 4) * 2), hy + 4 + j, "jade2");
  p.rect(hx - 1, hy - 7, 3, 2, "steel2");
  acUnit(p, 30, H - 112, 7, 0);
  downpipe(p, 4, H - F + 2, H - 2);
  downpipe(p, w - 8, H - F + 2, H - 2);
  // Edges.
  zrect(p, H, 0, 0, 1, F, "stone1");
  zrect(p, H, w - 1, 0, 1, F, "stone1");
  void darkRoom;
}

/** Inside the workshop: pegboard with tools, the bench and its vice, a bicycle frame on a stand. */
function roomInside(p: Px, H: number, x: number, w: number) {
  for (let j = 0; j < 64; j++) p.hline(x, H - 1 - j, w, j < 6 ? "stone2" : j < 30 ? "wood1" : j < 56 ? "ink2" : "ink");
  // Pegboard and tool silhouettes.
  p.rect(x + 8, H - 66, 40, 24, "oak1");
  for (let j = H - 64; j < H - 43; j += 3) for (let i = x + 10; i < x + 47; i += 3) p.px(i, j, "wood1");
  const TL: Legend = { s: "steel4", t: "steel3", w: "wood4", r: "orange2" };
  block(p, x + 11, H - 63, ["..s......t.....", ".sss.....t...w.", "..s.....ttt..w.", "..w......t...w.", "..w......t...s.", "..w......t..sss"], TL, "tools");
  block(p, x + 30, H - 62, ["sssssss..", "s.....s..", "sssssss..", "...w.....", "...w.....", "...w....."], TL, "saw");
  // Workbench with a vice and a radio.
  p.rect(x + 4, H - 34, 48, 4, "oak3").hline(x + 4, H - 34, 48, "oak4").hline(x + 4, H - 31, 48, "oak1");
  for (const lx of [x + 6, x + 48]) p.rect(lx, H - 30, 3, 24, "oak2");
  p.rect(x + 8, H - 20, 40, 3, "oak2");
  block(p, x + 8, H - 40, ["aaa.", "abba", "acca", "aaaa"], { a: "steel1", b: "steel4", c: "steel3" }, "vice");
  block(p, x + 30, H - 40, ["..aaaaaaa", ".abbbbbba", "abcbcdeba", "abbbbbbba"], { a: "wood1", b: "wood3", c: "stone4", d: "gold3", e: "red3" }, "radio");
  // A bicycle frame upside down on the floor, wheels off; a wheel hangs on the wall.
  p.line(x + 54, H - 12, x + 66, H - 24, "jade3").line(x + 66, H - 24, x + 74, H - 12, "jade3").line(x + 54, H - 12, x + 74, H - 12, "jade3");
  p.ellipse(x + 66, H - 54, 8, 8, "steel3");
  p.ellipse(x + 66, H - 54, 7, 7, "ink2");
  p.line(x + 59, H - 54, x + 73, H - 54, "steel2").line(x + 66, H - 61, x + 66, H - 47, "steel2");
  // Oil on the floor.
  p.rect(x + 20, H - 4, 14, 2, "ink2").rect(x + 24, H - 5, 6, 1, "ink2");
  // A work lamp hung low over the bench.
  p.vline(x + 28, H - 64, 4, "steel1").rect(x + 25, H - 60, 7, 3, "steel3").hline(x + 25, H - 57, 7, "gold5");
}

function steelWindow(p: Px, H: number, x: number, z: number, w: number, h: number) {
  const y = H - z - h;
  p.rect(x - 2, y - 2, w + 4, h + 4, "stone2");
  p.rect(x - 3, y + h + 1, w + 6, 3, "stone4").hline(x - 3, y + h + 1, w + 6, "stone5");
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const t = j / h;
    p.px(x + i, y + j, t < 0.2 ? "blue4" : t < 0.5 ? "blue3" : "blue2");
  }
  const cw = 14, ch = 11;
  for (let j = 0; j <= h; j += ch) p.hline(x, y + j, w, "steel1");
  for (let i = 0; i <= w; i += cw) p.vline(x + i, y, h, "steel1");
  // Glints, a plywood pane, a cracked one, one pivot pane tipped open.
  for (let i = 0; i < w; i += cw) p.line(x + i + 3, y + 8, x + i + 7, y + 3, "blue5");
  p.rect(x + cw * 2 + 1, y + ch + 1, cw - 1, ch - 1, "oak3").hline(x + cw * 2 + 1, y + ch + 1, cw - 1, "oak4").px(x + cw * 2 + 3, y + ch + 3, "oak1").px(x + cw * 3 - 2, y + ch * 2 - 2, "oak1");
  block(p, x + cw * 5 + 2, y + ch * 2 + 2, ["w....", ".w...", ".w.w.", "..w..", "..w..", ".w..w", ".w..."], { w: "white" }, "crack");
  p.rect(x + cw * 3 + 1, y + 1, cw - 1, ch - 1, "ink2").hline(x + cw * 3 + 1, y + 1, cw - 1, "steel4").hline(x + cw * 3 + 1, y + 5, cw - 1, "steel1");
}

function sideDoor(p: Px, H: number, x: number) {
  zrect(p, H, x - 2, 0, 28, 74, "stone2");
  zrect(p, H, x, 0, 24, 72, "jade3");
  zrect(p, H, x, 0, 1, 72, "jade4");
  zrect(p, H, x + 23, 0, 1, 72, "jade1");
  zrect(p, H, x + 3, 40, 18, 66, "jade2");
  zrect(p, H, x + 3, 6, 18, 36, "jade2");
  // Paint kicked off at the bottom to the grey primer; a handle worn bright.
  for (let i = 0; i < 24; i++) if (hash(i, 4, 2) < 0.6) zrect(p, H, x + i, 0, 1, 2 + Math.floor(hash(i, 5, 2) * 5), "steel3");
  p.rect(x + 18, H - 38, 3, 2, "steel5").px(x + 18, H - 36, "steel2");
}

export default defineSprites(perProp("building-workshop", (_prop, w, h) => ({
  foot: plotFoot(w, h),
  draw: (p) => {
    facade(p, h, w);
    roof(p, w, h);
  },
})));
