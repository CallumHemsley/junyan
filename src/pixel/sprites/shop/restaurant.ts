/**
 * 早安小馆 from the street (`town/restaurant`, 352×320): the bistro's own front.
 *
 * A 1930s Concession shopfront in bottle-green painted timber between two fluted cream pilasters,
 * the same green lattice and linen café curtains as the windows inside, a glazed double door exactly
 * at the map's opening (x 160..224), brass on everything a hand touches. Above the green fascia, a
 * cream Streamline upper storey: three steel windows, speed-line grooves, a stepped Deco crown. The
 * kitchen is at the east end, so the louvred vent there breathes steam up the render, and a second
 * stack on the roof does too. On the flat roof the cook dries his whites beside the water tank,
 * grows scallions in fish boxes and keeps one broken bentwood chair for his break.
 *
 * Blank sign field (DOM text): x 107..245, rows 213..225 (the gilt lacquer board on the fascia).
 * The doorway is 64 px tall; its left half stands open (the open leaf is another worker's prop).
 * The awning `town/breakfast-awning` hangs from the fascia's foot at z 90; its hem clears z 64.
 */
import { defineSprites, hash, type Legend, type Px } from "../../kit/index.ts";
import {
  acUnit, block, boards, cable, cafeCurtain, castShadow, flatRoof, greenFrame, perProp, plotFoot, signboard,
  sillPot, step, streak, streetGlass, stucco, wisp, zrect,
} from "./_front.ts";

const DOOR = [160, 224] as const;
const FRAMES = 4;

function pilaster(p: Px, H: number, x: number, w: number) {
  zrect(p, H, x, 0, w, 154, "cream3");
  // Deco fluting: three lit-and-shaded grooves, a stepped capital, a granite base.
  for (let i = 2; i < w - 2; i += 3) {
    zrect(p, H, x + i, 12, 1, 140, "cream2");
    zrect(p, H, x + i + 1, 12, 1, 140, "cream5");
  }
  zrect(p, H, x, 140, w, 146, "cream4");
  zrect(p, H, x, 140, w, 141, "cream2");
  zrect(p, H, x + 1, 146, w - 2, 148, "cream5");
  zrect(p, H, x, 0, w, 12, "stone3");
  zrect(p, H, x, 11, w, 12, "stone4");
  zrect(p, H, x + w - 1, 0, 1, 154, "cream1");
  zrect(p, H, x, 0, 1, 154, "cream4");
}

/** Raised panels of the bulkhead under a window, bottle green with a brass kick strip. */
function bulkhead(p: Px, H: number, x: number, w: number) {
  zrect(p, H, x, 4, w, 21, "jade2");
  zrect(p, H, x, 20, w, 21, "jade3");
  zrect(p, H, x, 4, w, 7, "gold2");
  zrect(p, H, x, 6, w, 7, "gold4");
  zrect(p, H, x, 4, w, 5, "gold1");
  const n = Math.max(1, Math.round(w / 34));
  const pw = Math.floor((w - 4) / n);
  for (let k = 0; k < n; k++) {
    const px0 = x + 3 + k * pw;
    zrect(p, H, px0, 9, pw - 3, 18, "jade3");
    zrect(p, H, px0 + 1, 10, pw - 5, 17, "jade2");
    zrect(p, H, px0 + 1, 16, pw - 5, 17, "jade1");
    zrect(p, H, px0 + pw - 5, 10, 1, 17, "jade1");
  }
}

/**
 * One shop window: green frame, casements of `lights` panes, a transom row above, the café curtain
 * on its rod, and a glimpse of the room over the curtain (globe lamps, a hanging fern).
 */
function shopWindow(p: Px, H: number, x: number, w: number, lights: number, seed: number) {
  const z0 = 21, z1 = 84;
  const y = H - z1, h = z1 - z0;
  // Marble sill.
  zrect(p, H, x - 2, 20, w + 4, 23, "stone4");
  zrect(p, H, x - 2, 22, w + 4, 23, "cream5");
  zrect(p, H, x - 2, 20, w + 4, 21, "stone2");
  roomGlass(p, x, y, w, h - 2, seed);
  // The room beyond the glass, above the curtain: globe lamps glowing, a fern in a hanging pot.
  const lampY = H - 60;
  for (let i = 0; i < lights; i++) {
    const cx = x + Math.round(((i + 0.5) * w) / lights);
    if (hash(i, seed) < 0.7) {
      halo(p, cx, lampY, 6);
      p.ellipse(cx, lampY, 2.5, 2.5, "gold5");
      p.px(cx - 1, lampY - 2, "white");
      p.vline(cx, lampY - 8, 5, "gold1");
    }
  }
  const fernX = x + Math.round(w * 0.3);
  block(p, fernX, H - 63, [
    "..l..m..l.",
    ".lm.mnm.ml",
    "lmnmnlnmnm",
    "m.lbbbbl.l",
    "...abba...",
  ], { l: "leaf1", m: "leaf2", n: "leaf3", a: "oak1", b: "oak2" }, "fern");
  // A bentwood chair's back just showing over the curtain.
  const chx = x + w - 22;
  block(p, chx, H - 50, [".aaaa.", "a....a", "a.aa.a", "a....a"], { a: "wood1" }, "chair-back");
  // Café curtain from the rod at z 46 down to the sill.
  cafeCurtain(p, x + 1, H - 46, w - 2, 46 - 23, seed);
  // Glazing: transom rail at z 66, transom uprights every 8, casement bars.
  const tr = H - 68;
  p.hline(x, tr, w, "jade1").hline(x, tr + 1, w, "jade2").hline(x, tr - 1, w, "jade3");
  for (let i = 8; i < w - 2; i += 8) p.vline(x + i, y, tr - y, "jade1");
  for (let i = 1; i < lights; i++) {
    const bx = x + Math.round((i * w) / lights);
    p.vline(bx - 1, tr + 2, H - 46 - tr - 2, "jade1").vline(bx, tr + 2, H - 46 - tr - 2, "jade3");
    p.vline(bx - 1, H - 45, 22, "jade1");
  }
  // A brass latch on the middle bar.
  const mid = x + Math.round((Math.floor(lights / 2) * w) / lights);
  p.rect(mid - 1, H - 52, 3, 2, "gold3").px(mid - 1, H - 52, "gold4").px(mid + 1, H - 51, "gold1");
  greenFrame(p, x - 3, y - 3, w + 6, h + 1, 3);
}

/** The bistro seen through its window: cream plaster in shade, the dark panelling, sky in the top. */
function roomGlass(p: Px, x: number, y: number, w: number, h: number, seed: number) {
  for (let j = 0; j < h; j++) {
    const t = j / h;
    const c = t < 0.07 ? "blue4" : t < 0.2 ? "cream1" : t < 0.62 ? "cream2" : "wood2";
    p.hline(x, y + j, w, c);
    if (t >= 0.07 && t < 0.11) p.dither(x, y + j, w, 1, "blue4", "checker", j);
  }
  // Two parallel glints rising to the right, the sky's reflection on the glass.
  const g0 = 6 + Math.floor(hash(seed, 3) * (w - 30));
  for (let j = 0; j < h; j++) for (const [dx, every] of [[0, 1], [4, 2]] as const) {
    const gx = g0 + dx + Math.floor((h - j) * 0.7) - 10;
    if (gx >= 0 && gx < w && j % every === 0) p.px(x + gx, y + j, step(p.get(x + gx, y + j) ?? "cream2", 2));
  }
}

/** A lamp's glow on solid art: a dithered ring of brighter pixels, no translucency. */
function halo(p: Px, cx: number, cy: number, r: number) {
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const d = (i * i) / (r * r) + (j * j) / (r * r * 0.7);
    if (d > 1) continue;
    const c = p.get(cx + i, cy + j);
    if (c && (d < 0.45 || (i + j) % 2 === 0)) p.px(cx + i, cy + j, step(c, d < 0.45 ? 2 : 1));
  }
}

/** The glazed double door, 64 wide, its leaves meeting at x 192. The left leaf carries the blank card. */
function door(p: Px, H: number) {
  const [x0, x1] = DOOR;
  const w = x1 - x0;
  // Marble threshold, worn hollow in the middle.
  zrect(p, H, x0 - 2, 0, w + 4, 3, "cream5");
  zrect(p, H, x0 - 2, 0, w + 4, 1, "stone3");
  zrect(p, H, x0 + 20, 2, 24, 3, "stone5");
  // Frame round a 64-tall opening, a head rail, and the fanlight over it (mostly under the awning).
  zrect(p, H, x0, 3, w, 90, "jade2");
  zrect(p, H, x0, 3, 1, 90, "jade3");
  zrect(p, H, x1 - 1, 3, 1, 90, "jade1");
  const fy = H - 86;
  streetGlass(p, x0 + 4, fy, w - 8, 16, 7);
  for (let i = x0 + 12; i < x1 - 6; i += 8) p.vline(i, fy, 16, "jade1");
  zrect(p, H, x0 + 2, 64, w - 4, 69, "jade2");
  zrect(p, H, x0 + 2, 68, w - 4, 69, "jade3");
  zrect(p, H, x0 + 2, 64, w - 4, 65, "jade1");
  // The left leaf stands open into the room (the lane-house worker's edge-on leaf stands at x ~161),
  // so the left half is the doorway itself; the right leaf is shut.
  openWay(p, H, x0 + 2, 30);
  leaf(p, H, x0 + 32, 30, true);
}

/** Through the open half of the door: the mosaic floor, the dark panelled wainscot, cream plaster, a lamp. */
function openWay(p: Px, H: number, x: number, w: number) {
  zrect(p, H, x, 3, w, 64, "cream2");
  zrect(p, H, x, 60, w, 64, "cream1");
  // Wainscot with a raised panel and its rail.
  zrect(p, H, x, 14, w, 34, "wood2");
  zrect(p, H, x, 33, w, 34, "wood4");
  zrect(p, H, x, 31, w, 33, "wood3");
  zrect(p, H, x + 5, 17, w - 10, 29, "wood1");
  zrect(p, H, x + 6, 18, w - 12, 28, "wood3");
  zrect(p, H, x + 6, 27, w - 12, 28, "wood4");
  // Mosaic floor, cream and ink octagon-and-dot, foreshortened, daylight spilling in on it.
  zrect(p, H, x, 3, w, 14, "cream4");
  for (let z = 4; z < 14; z += 3) for (let i = (z % 2) * 2; i < w; i += 4) p.px(x + i, H - 1 - z, "ink2");
  for (let i = 4; i < w - 4; i++) if (i % 3 !== 0) p.px(x + i, H - 5, "cream5");
  // A globe lamp on its bracket and a bentwood chair's back by the wall.
  halo(p, x + 20, H - 46, 5);
  p.ellipse(x + 20, H - 46, 2.5, 2.5, "gold5");
  p.px(x + 19, H - 47, "white").hline(x + 16, H - 43, 4, "gold2");
  block(p, x + 4, H - 30, [".aaaa.", "a....a", "a.aa.a", "a....a", "aaaaaa", ".a..a.", ".a..a.", ".a..a.", "a....a"], { a: "wood1" }, "chair");
  // The reveal's shadow on the left, where the open leaf stands.
  zrect(p, H, x, 3, 2, 64, "ink2");
  zrect(p, H, x + 2, 3, 1, 64, "wood1");
}

function leaf(p: Px, H: number, x: number, w: number, right: boolean) {
  zrect(p, H, x, 3, w, 64, "jade2");
  // Kick panel with a brass plate.
  zrect(p, H, x + 3, 3, w - 6, 8, "gold3");
  zrect(p, H, x + 3, 7, w - 6, 8, "gold5");
  zrect(p, H, x + 3, 3, w - 6, 4, "gold1");
  for (let i = 5; i < w - 6; i += 9) p.px(x + i, H - 6, "gold2");
  zrect(p, H, x + 3, 10, w - 6, 21, "jade3");
  zrect(p, H, x + 4, 11, w - 8, 20, "jade2");
  zrect(p, H, x + 4, 11, w - 8, 12, "jade1");
  // Glass: the warm room through it — the mosaic floor, the dark counter, a lamp — under the sky's reflection.
  const gx = x + 4, gw = w - 8, gy = H - 60, gh = 60 - 24;
  p.rect(gx, gy, gw, gh, "wood1");
  p.rect(gx, gy + gh - 9, gw, 9, "cream3");
  for (let j = gy + gh - 8; j < gy + gh; j += 3) for (let i = gx + ((j >> 1) % 3); i < gx + gw; i += 3) p.px(i, j, "ink2");
  p.rect(gx, gy + gh - 18, gw, 9, "wood2");
  p.hline(gx, gy + gh - 18, gw, "stone5");
  p.hline(gx, gy + gh - 11, gw, "gold3");
  p.rect(gx, gy + 6, gw, gh - 24, "cream2");
  p.hline(gx, gy + 6, gw, "cream1");
  halo(p, gx + (right ? 6 : gw - 6), gy + 12, 5);
  p.ellipse(gx + (right ? 6 : gw - 6), gy + 12, 2.5, 2.5, "gold5");
  // The sky caught in the top of the glass, and a glint across it.
  p.rect(gx, gy, gw, 4, "blue4");
  p.dither(gx, gy + 4, gw, 2, "blue4");
  for (let j = 0; j < gh; j++) {
    const k = gx + Math.floor((gh - j) * 0.6) - 6 + (right ? 4 : 0);
    if (k >= gx && k < gx + gw && j % 4 !== 3) p.px(k, gy + j, j < 6 ? "white" : step(p.get(k, gy + j) ?? "cream2", 1));
    if (k + 2 >= gx && k + 2 < gx + gw && j % 2 === 0) p.px(k + 2, gy + j, step(p.get(k + 2, gy + j) ?? "cream2", 1));
  }
  p.hline(gx, H - 52, gw, "jade1").hline(gx, H - 53, gw, "jade3");
  greenFrame(p, gx - 1, gy - 1, gw + 2, gh + 2, 1);
  // Push bar, brass, on standoffs; the meeting stiles are a hair darker.
  const by = H - 38;
  p.hline(gx + 1, by, gw - 2, "gold3").hline(gx + 1, by - 1, gw - 2, "gold5").hline(gx + 1, by + 1, gw - 2, "gold1");
  p.px(gx + 2, by + 2, "gold1").px(gx + gw - 3, by + 2, "gold1");
  zrect(p, H, right ? x : x + w - 1, 3, 1, 64, "jade1");
  if (!right) {
    // The card on its string: blank both sides (DOM may label it).
    p.line(gx + 6, gy + 1, gx + 10, gy + 6, "wood3").line(gx + 15, gy + 1, gx + 11, gy + 6, "wood3");
    p.rect(gx + 5, gy + 7, 13, 8, "cream5").frame(gx + 5, gy + 7, 13, 8, "jade2").hline(gx + 6, gy + 14, 11, "cream2");
  } else {
    // A small brass bell bracket on the right leaf.
    p.px(gx + gw - 4, gy + 1, "gold1").rect(gx + gw - 5, gy + 2, 3, 2, "gold3").px(gx + gw - 4, gy + 4, "gold2");
  }
}

/** The kitchen's louvred wall vent, its grease shadow, and the steam leaving it. */
function kitchenVent(p: Px, H: number, x: number, z: number, frame: number) {
  const y = H - z;
  p.rect(x, y, 18, 12, "steel3").frame(x, y, 18, 12, "steel1");
  p.hline(x, y, 18, "steel5");
  for (let j = y + 2; j < y + 11; j += 2) p.hline(x + 2, j, 14, "steel1").hline(x + 2, j + 1, 14, "steel4");
  // Grease and soot above, where years of breakfasts went up the wall.
  for (let j = 1; j < 10; j++) for (let i = 2; i < 16; i++) if (hash(i, j, 77) < 0.5 - j * 0.045) p.px(x + i, y - j, j < 4 ? "cream2" : "cream3");
  p.hline(x + 3, y - 1, 12, "cream1");
  wisp(p, x + 9, y - 1, frame, FRAMES, 40, false, 1);
  wisp(p, x + 5, y - 2, (frame + 2) % FRAMES, FRAMES, 28, false, 3);
}

function upperWindow(p: Px, H: number, x: number, z: number, seed: number, story: "pots" | "towel" | "plain") {
  const w = 52, h = 30, y = H - z - h;
  // Hood and sill.
  p.rect(x - 3, y - 3, w + 6, 2, "cream5").hline(x - 3, y - 1, w + 6, "cream2");
  p.rect(x - 4, y + h, w + 8, 3, "cream4").hline(x - 4, y + h, w + 8, "cream5").hline(x - 4, y + h + 3, w + 8, "cream1");
  // Sky in the panes: Crittall-style steel glazing, slim green bars, a wider light on the left.
  p.rect(x, y, w, h, "jade1");
  for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
    const t = j / h + i / w * 0.25;
    p.px(x + i, y + j, t < 0.28 ? "blue5" : t < 0.6 ? "blue4" : t < 0.9 ? "blue3" : "blue2");
  }
  for (let j = y + 7; j < y + h - 1; j += 7) p.hline(x + 1, j, w - 2, "jade1");
  p.vline(x + 18, y, h, "jade1").vline(x + 19, y, h, "jade2").vline(x + 35, y, h, "jade1");
  for (let j = 2; j < h - 2; j++) {
    const k = x + 4 + Math.floor((h - j) * 0.5);
    if (k < x + 18) p.px(k, y + j, "blue6");
  }
  p.frame(x - 1, y - 1, w + 2, h + 2, "jade2");
  p.hline(x - 1, y - 1, w + 2, "jade3").vline(x + w, y - 1, h + 2, "jade1");
  if (story === "pots") {
    sillPot(p, x + 2, y + h - 3, "geranium");
    sillPot(p, x + 40, y + h - 3, "cactus");
  } else if (story === "towel") {
    // The right casement is open outward: darker glass in its frame, and a striped towel over it.
    p.rect(x + 36, y + 1, 15, h - 2, "blue2");
    p.vline(x + 36, y + 1, h - 2, "jade3");
    p.rect(x + 37, y + 4, 12, 15, "pink3");
    for (let i = 0; i < 12; i += 4) p.vline(x + 38 + i, y + 4, 15, "pink2");
    p.hline(x + 37, y + 4, 12, "white").hline(x + 37, y + 18, 12, "pink1");
    p.vline(x + 48, y + 5, 14, "pink1");
  }
}

/** The stepped Deco crown over the centre of the parapet, with fins and a jade-glazed roundel. */
function crown(p: Px, H: number) {
  const steps: [number, number, number][] = [[132, 220, 166], [146, 206, 172], [160, 192, 178]];
  for (const [x0, x1, z1] of steps) {
    zrect(p, H, x0, 150, x1 - x0, z1, "cream3");
    zrect(p, H, x0, z1 - 2, x1 - x0, z1, "cream5");
    zrect(p, H, x0, z1 - 3, x1 - x0, z1 - 2, "cream4");
    zrect(p, H, x1 - 1, 150, 1, z1, "cream1");
    zrect(p, H, x0, 150, 1, z1 - 2, "cream4");
  }
  for (const fx of [150, 156, 196, 202]) { zrect(p, H, fx, 152, 1, 168, "cream2"); zrect(p, H, fx + 1, 152, 1, 168, "cream5"); }
  const cy = H - 166, cx = 176;
  p.ellipse(cx, cy, 6, 6, "jade1");
  p.ellipse(cx, cy, 5, 5, "jade3");
  p.ellipse(cx - 1, cy - 1, 3, 3, "jade4");
  p.px(cx - 3, cy - 3, "jade6").px(cx - 2, cy - 3, "jade5");
  p.ellipse(cx, cy, 1.5, 1.5, "gold3");
}

// ── the roof ────────────────────────────────────────────────────────────────

function roof(p: Px, frame: number) {
  flatRoof(p, 0, 0, 352, 161, 41);
  castShadow(p, 16, 20, 68, 56, 4);
  castShadow(p, 96, 30, 38, 42, 4);
  castShadow(p, 144, 76, 68, 44, 3);
  castShadow(p, 150, 30, 60, 40, 4);
  castShadow(p, 24, 114, 84, 22, 2);
  castShadow(p, 238, 120, 34, 24, 3);
  castShadow(p, 310, 66, 18, 74, 3);
  stairHut(p, 18, 20);
  waterTank(p, 96, 22);
  pigeonLoft(p, 150, 26);
  laundry(p, 228, 20);
  skylight(p, 146, 80);
  fishBoxes(p, 24, 108);
  brokenChair(p, 120, 112);
  roofCondenser(p, 238, 120);
  kitchenStack(p, 312, 60, frame);
  // The roof drain in the front corner, and the stain it leaves.
  p.rect(336, 150, 6, 4, "stone2").rect(337, 151, 4, 2, "ink2");
  for (let i = 0; i < 18; i++) for (let j = 0; j < 6; j++) if (hash(i, j, 3) < 0.35 - j * 0.05) p.px(322 + i, 152 + j - (i > 9 ? 1 : 0), "stone3");
}

function stairHut(p: Px, x: number, y: number) {
  const w = 64;
  // Slab roof seen from above, its lip, then the stucco face with a green door.
  p.rect(x - 2, y, w + 4, 16, "stone4").frame(x - 2, y, w + 4, 16, "stone3");
  p.hline(x - 2, y, w + 4, "cream5").hline(x - 2, y + 15, w + 4, "stone2");
  p.rect(x + 46, y + 4, 4, 6, "steel3").hline(x + 45, y + 3, 6, "steel5").vline(x + 49, y + 4, 6, "steel1");
  stucco(p, x, y + 16, w, 40, 9);
  p.hline(x, y + 16, w, "cream2");
  p.vline(x + w - 1, y + 16, 40, "cream1");
  // Door, bottle green like the shop's, the paint scuffed off round the handle.
  const dx = x + 22, dy = y + 24;
  p.rect(dx, dy, 20, 32, "jade2").frame(dx, dy, 20, 32, "jade1");
  p.hline(dx, dy, 20, "jade3").vline(dx, dy, 32, "jade3");
  p.rect(dx + 3, dy + 3, 14, 10, "jade3").rect(dx + 4, dy + 4, 12, 8, "jade2");
  p.rect(dx + 3, dy + 16, 14, 13, "jade3").rect(dx + 4, dy + 17, 12, 11, "jade2");
  p.rect(dx + 14, dy + 13, 4, 4, "wood4").px(dx + 15, dy + 14, "gold3").px(dx + 15, dy + 15, "gold1");
  // A lamp over the door and a bucket by it.
  p.rect(dx + 7, dy - 6, 6, 3, "steel4").hline(dx + 7, dy - 3, 6, "gold5");
  block(p, x + 4, y + 44, ["abbbbba", "acdddca", "acdddca", ".accca."], { a: "steel1", b: "steel5", c: "steel3", d: "steel4" }, "bucket");
}

function waterTank(p: Px, x: number, y: number) {
  const w = 38;
  // Brick piers.
  for (const px0 of [x + 4, x + w - 12]) { p.rect(px0, y + 40, 8, 12, "stone3"); p.hline(px0, y + 44, 8, "stone4"); p.hline(px0, y + 48, 8, "stone4"); p.vline(px0 + 7, y + 40, 12, "stone1"); }
  // Body: a steel drum, banded, rust weeping from the seams.
  p.rect(x, y + 6, w, 36, "steel3");
  p.vline(x, y + 6, 36, "steel1").vline(x + 1, y + 6, 36, "steel4").vline(x + 3, y + 6, 36, "steel5").vline(x + w - 1, y + 6, 36, "steel1").vline(x + w - 2, y + 6, 36, "steel2");
  for (const by of [y + 14, y + 28]) p.hline(x, by, w, "steel2").hline(x, by + 1, w, "steel4");
  for (const [rx, ry] of [[x + 12, y + 16], [x + 25, y + 30], [x + 30, y + 16]]) streak(p, rx, ry, 9, "orange1", "wood3");
  p.hline(x, y + 41, w, "steel1");
  // Lid ellipse.
  p.ellipse(x + w / 2, y + 6, w / 2, 6, "steel4");
  p.ellipse(x + w / 2, y + 6, w / 2 - 2, 4.5, "steel5");
  p.ellipse(x + w / 2 - 3, y + 5, 7, 2.5, "steel6");
  p.rect(x + 16, y + 3, 6, 3, "steel2").hline(x + 16, y + 3, 6, "steel4");
  // The pipe down to the roof.
  p.rect(x + w - 6, y + 42, 3, 12, "steel2").vline(x + w - 6, y + 42, 12, "steel4");
}

/**
 * The pigeon loft: a timber box on legs with a wire-mesh landing cage, roofed in tar felt. Somebody
 * upstairs still races pigeons; two are home.
 */
function pigeonLoft(p: Px, x: number, y: number) {
  const w = 58;
  // Felt roof from above, then the front: boards on the left, mesh cage on the right.
  p.rect(x - 2, y, w + 4, 10, "steel2").hline(x - 2, y, w + 4, "steel3").hline(x - 2, y + 9, w + 4, "ink2");
  for (let i = x + 6; i < x + w; i += 12) p.vline(i, y + 1, 8, "steel1");
  boards(p, x, y + 10, 30, 26, 5, 5, ["wood1", "wood2", "wood3", "wood4"]);
  p.hline(x, y + 10, 30, "wood1");
  // Two round holes with landing perches.
  for (const hx of [x + 6, x + 18]) { p.rect(hx, y + 16, 5, 5, "ink").px(hx, y + 16, "wood2").px(hx + 4, y + 16, "wood2"); p.hline(hx - 1, y + 21, 7, "oak4"); }
  // Mesh cage.
  p.rect(x + 30, y + 10, w - 30, 26, "ink2");
  for (let j = y + 11; j < y + 36; j += 3) for (let i = x + 31; i < x + w; i += 3) { p.px(i, j, "steel3"); p.px(i + 1, j + 1, "steel2"); }
  p.frame(x + 30, y + 10, w - 30, 26, "wood2");
  p.vline(x + 30, y + 10, 26, "wood4");
  // Two pigeons inside the cage, grey with a green-purple neck.
  for (const [bx, by] of [[x + 35, y + 26], [x + 45, y + 23]] as const) block(p, bx, by, ["..ab..", ".abbc.", "dbbbbc", ".ebbe.", "..f.f."], { a: "grey2", b: "grey2", c: "grey1", d: "plum2", e: "jade3", f: "skin2" }, "pigeon");
  // Legs.
  for (const lx of [x + 2, x + w - 4]) p.rect(lx, y + 36, 2, 8, "wood2").vline(lx, y + 36, 8, "wood3");
}

function laundry(p: Px, x: number, y: number) {
  // Two bamboo poles in cement-filled tins, a line between them.
  for (const px0 of [x, x + 72]) {
    p.rect(px0, y, 2, 52, "bamboo3").vline(px0, y, 52, "bamboo4").vline(px0 + 1, y, 52, "bamboo2");
    for (let j = y + 10; j < y + 50; j += 12) p.hline(px0, j, 2, "bamboo1");
    p.rect(px0 - 3, y + 50, 8, 6, "steel3").hline(px0 - 3, y + 50, 8, "steel5").vline(px0 + 4, y + 50, 6, "steel1");
  }
  cable(p, x + 1, y + 4, x + 73, y + 4, 4, "stone2");
  const L: Legend = { a: "stone2", w: "white", c: "cream4", d: "cream3", e: "steel5", j: "jade3", k: "jade5", l: "jade2", b: "blue3", v: "white", g: "gold3" };
  // The cook's whites: a double-breasted jacket on the line, sleeves down.
  block(p, x + 8, y + 6, [
    "..wwwwwwwwwww..",
    ".wwwcwwwwwcwwww",
    "wwwwcwwgwwcwwww",
    "wwwwcwwwwwcwwww",
    "wwwwcwwgwwcwwww",
    "wwwdcwwwwwcdwww",
    "www.cwwgwwc.www",
    "wwd.cwwwwwc.dww",
    "ww..cwwwwwc..ww",
    "wd..cwwwwwc..dw",
    "ee..cwwwwwc..ee",
    "....cwwwwwc....",
    "....cwwwwwc....",
    "....dccccccd...",
  ], L, "jacket");
  // An apron in jade check, folded once over the line.
  const ax = x + 28, ay = y + 8;
  p.rect(ax, ay, 14, 18, "jade5");
  for (let j = 0; j < 18; j++) for (let i = 0; i < 14; i++) if (i % 4 < 2 !== j % 4 < 2) p.px(ax + i, ay + j, "jade3");
  p.hline(ax, ay, 14, "jade6").vline(ax + 13, ay, 18, "jade2").hline(ax, ay + 17, 14, "jade2");
  p.rect(ax + 4, ay + 9, 6, 4, "jade6").frame(ax + 4, ay + 9, 6, 4, "jade2");
  // A blue-striped tea towel and a pair of socks.
  const tx = x + 48, ty = y + 9;
  p.rect(tx, ty, 11, 13, "white");
  for (const j of [2, 3, 9, 10]) p.hline(tx, ty + j, 11, "blue3");
  p.vline(tx + 10, ty, 13, "cream3").hline(tx, ty + 12, 11, "cream3");
  p.rect(x + 62, y + 10, 3, 7, "grey2").rect(x + 62, y + 16, 5, 2, "grey2").px(x + 64, y + 10, "grey3");
  p.rect(x + 67, y + 10, 3, 6, "grey1").rect(x + 67, y + 15, 4, 2, "grey1");
  for (const pegx of [x + 10, x + 20, x + 29, x + 41, x + 49, x + 58, x + 63, x + 68]) p.px(pegx, y + 7 + Math.round(4 * 4 * ((pegx - x) / 72) * (1 - (pegx - x) / 72)) - 1, "bamboo4");
}

function skylight(p: Px, x: number, y: number) {
  const w = 64, h = 38;
  // Upstand kerb, then two glass slopes meeting at a ridge: the far slope catches the sky.
  p.rect(x - 2, y - 2, w + 4, h + 6, "cream2").hline(x - 2, y - 2, w + 4, "cream4").hline(x - 2, y + h + 3, w + 4, "cream1");
  p.rect(x, y, w, 14, "blue5");
  p.rect(x, y + 14, w, h - 14, "blue3");
  for (let j = y + 15; j < y + h; j++) for (let i = x; i < x + w; i++) if ((i + j) % 2 === 0 && j > y + h - 8) p.px(i, j, "blue2");
  p.hline(x, y + 13, w, "jade3").hline(x, y + 14, w, "jade1");
  for (let i = x; i <= x + w; i += 16) { p.vline(i, y, h, "jade2"); p.vline(i + 1, y, h, "jade1"); }
  p.frame(x, y, w + 2, h, "jade1");
  // Glints, and the pane mended with yellowed corrugated plastic.
  p.line(x + 4, y + 10, x + 10, y + 3, "white").line(x + 20, y + 30, x + 28, y + 20, "blue5");
  const mx = x + 34, my = y + 16;
  p.rect(mx, my, 14, h - 17, "bamboo4");
  for (let i = 0; i < 14; i += 3) p.vline(mx + i, my, h - 17, "bamboo3");
  for (let i = 1; i < 14; i += 3) p.vline(mx + i, my, h - 17, "bamboo5");
  p.hline(mx, my, 14, "bamboo2");
}

function fishBoxes(p: Px, x: number, y: number) {
  // Three polystyrene fish boxes: scallions, coriander, one chili plant (the roof's only red).
  const box = (bx: number, by: number, w: number) => {
    p.rect(bx, by, w, 6, "white").frame(bx, by, w, 6, "steel4");
    p.rect(bx + 2, by + 1, w - 4, 4, "wood2");
    p.rect(bx, by + 6, w, 12, "cream5").hline(bx, by + 6, w, "steel5").vline(bx + w - 1, by + 6, 12, "steel4").hline(bx, by + 17, w, "steel4");
    p.hline(bx + 3, by + 10, w - 6, "steel6");
  };
  box(x, y + 8, 26);
  box(x + 30, y + 6, 26);
  box(x + 60, y + 10, 22);
  for (let i = 3; i < 23; i += 2) { const t = 3 + Math.floor(hash(i, 1, 5) * 6); p.vline(x + i, y + 9 - t, t + 1, i % 4 === 1 ? "leaf4" : "leaf3"); p.px(x + i, y + 9 - t, "leaf5"); }
  block(p, x + 33, y, [".m.nm.m..m.nm.m.mn", "mnmlnmnmlmnmlnmnml", "lmlmlmlmlmlmlmlmlm", ".l.l.l..l.l..l.l.l"], { l: "leaf1", m: "leaf2", n: "leaf3" }, "coriander");
  block(p, x + 63, y - 2, ["...m.n...", "..mnmnm..", ".mnr.nmr.", "mnmnmr.m.", ".lmnmnml.", "..lm.ml..", "...l.l...", "...l.l..."], { l: "leaf1", m: "leaf2", n: "leaf3", r: "red3" }, "chili");
}

function brokenChair(p: Px, x: number, y: number) {
  // The bentwood chair that lost its cane seat, now a plank; a coffee-tin ashtray beside it.
  block(p, x, y, [
    "..aaaaaaa...",
    ".ab.....ba..",
    ".a.aaaaa.a..",
    ".a.a...a.a..",
    ".ab.....ba..",
    "..a.....a...",
    ".cccccccccc.",
    ".ddddddddde.",
    "..a.....a...",
    "..a.....a...",
    "..a.a.a.a...",
    "..a.aaa.a...",
    "..a.....a...",
    ".aa.....aa..",
  ], { a: "wood1", b: "wood3", c: "oak4", d: "oak2", e: "oak1" }, "chair");
  block(p, x + 13, y + 9, ["abbba", "acdca", "acdca", ".aaa."], { a: "steel1", b: "steel2", c: "gold2", d: "gold3" }, "tin");
}

function roofCondenser(p: Px, x: number, y: number) {
  // The dining room's condenser, seen from above: a fan grille in a steel box on rubber feet.
  p.rect(x, y, 34, 14, "steel5").frame(x, y, 34, 14, "steel3").hline(x, y, 34, "steel6");
  p.ellipse(x + 17, y + 7, 9, 5.5, "steel2");
  p.ellipse(x + 17, y + 7, 8, 4.5, "steel1");
  for (let i = -7; i <= 7; i += 2) p.vline(x + 17 + i, y + 3, 9, "steel3");
  p.rect(x + 16, y + 6, 3, 2, "steel4");
  p.rect(x, y + 14, 34, 10, "steel4").hline(x, y + 14, 34, "steel5").hline(x, y + 23, 34, "steel2").vline(x + 33, y + 14, 10, "steel2");
  for (let i = x + 4; i < x + 30; i += 3) p.vline(i, y + 16, 6, "steel3");
  p.rect(x + 2, y + 24, 4, 2, "ink2").rect(x + 28, y + 24, 4, 2, "ink2");
  cable(p, x + 34, y + 18, x + 54, y + 34, 2, "cream2");
}

function kitchenStack(p: Px, x: number, y: number, frame: number) {
  // Duct across the roof from the kitchen at the east end, up into a stack under a rain cap.
  p.rect(x - 2, y + 66, 18, 8, "steel3").hline(x - 2, y + 66, 18, "steel5").hline(x - 2, y + 73, 18, "steel1");
  p.rect(x, y + 8, 12, 62, "steel4");
  p.vline(x, y + 8, 62, "steel5").vline(x + 1, y + 8, 62, "steel6").vline(x + 10, y + 8, 62, "steel2").vline(x + 11, y + 8, 62, "steel1");
  for (let j = y + 20; j < y + 66; j += 14) p.hline(x, j, 12, "steel3");
  // Guy wires.
  p.line(x, y + 30, x - 14, y + 70, "stone2");
  p.line(x + 11, y + 30, x + 24, y + 70, "stone2");
  // Rain cap: a little coolie hat on legs, soot under it.
  block(p, x - 5, y, [
    ".....aaaaaa.....",
    "...aaeeeeeeaa...",
    ".aaeeffffeeddaa.",
    "abbbbbbbbbbbbbba",
    "...c........c...",
    "...c.gggggg.c...",
    "...c.g....g.c...",
    "..aaaaaaaaaaaa..",
  ], { a: "steel1", b: "steel2", c: "steel3", d: "steel4", e: "steel5", f: "steel6", g: "ink2" }, "cap");
  wisp(p, x + 6, y - 1, frame, FRAMES, 46, false, 2);
  wisp(p, x + 3, y, (frame + 1) % FRAMES, FRAMES, 34, false, 5);
}

// ── the facade ──────────────────────────────────────────────────────────────

function facade(p: Px, H: number, frame: number) {
  const W = 352;
  // Upper storey render.
  stucco(p, 0, H - 150, W, 44, 19);
  // Streamline speed lines between the windows.
  for (const z of [118, 122, 126]) for (const [a, b] of [[10, 34], [102, 140], [212, 250], [318, 342]] as const) {
    zrect(p, H, a, z, b - a, z + 1, "cream2");
    zrect(p, H, a, z - 1, b - a, z, "cream5");
  }
  upperWindow(p, H, 42, 114, 1, "pots");
  upperWindow(p, H, 150, 114, 2, "towel");
  upperWindow(p, H, 258, 114, 3, "plain");
  // Cornice (lit lip seen from above, shaded underside) and parapet.
  zrect(p, H, 0, 148, W, 154, "cream4");
  zrect(p, H, 0, 153, W, 154, "cream5");
  zrect(p, H, 0, 148, W, 150, "cream2");
  zrect(p, H, 0, 147, W, 148, "cream1");
  for (let i = 4; i < W; i += 6) zrect(p, H, i, 148, 2, 150, "cream1");
  stucco(p, 0, H - 160, W, 6, 23);
  zrect(p, H, 0, 159, W, 160, "cream5");
  // Fascia: bottle-green board with mouldings, brass bead, the blank gilt sign.
  zrect(p, H, 0, 88, W, 110, "jade2");
  zrect(p, H, 0, 109, W, 110, "jade4");
  zrect(p, H, 0, 107, W, 109, "jade3");
  zrect(p, H, 0, 106, W, 107, "jade1");
  zrect(p, H, 0, 92, W, 93, "gold3");
  zrect(p, H, 0, 88, W, 92, "jade1");
  zrect(p, H, 0, 90, W, 91, "jade3");
  signboard(p, 104, H - 107, 144, 16, "lacquer");
  // Two brass gooseneck lamps over the board.
  for (const lx of [120, 228]) {
    p.px(lx, H - 112, "gold1").hline(lx, H - 113, 4, "gold3").vline(lx + 4, H - 113, 4, "gold3");
    p.rect(lx + 2, H - 109, 5, 2, "jade1").hline(lx + 2, H - 108, 5, "gold4");
  }
  // Ground floor.
  pilaster(p, H, 0, 10);
  pilaster(p, H, 342, 10);
  zrect(p, H, 10, 0, 332, 88, "jade2");
  zrect(p, H, 10, 0, 332, 4, "stone3");
  zrect(p, H, 10, 3, 332, 4, "stone4");
  bulkhead(p, H, 10, 150);
  bulkhead(p, H, 224, 118);
  shopWindow(p, H, 17, 136, 4, 1);
  shopWindow(p, H, 231, 104, 3, 2);
  // Green posts either side of the door.
  for (const [px0, w] of [[153, 7], [224, 4]] as const) { zrect(p, H, px0, 4, w, 88, "jade2"); zrect(p, H, px0, 4, 1, 88, "jade3"); zrect(p, H, px0 + w - 1, 4, 1, 88, "jade1"); }
  door(p, H);
  // A brass globe lamp on a bracket beside the door, like the ones inside.
  const gx = 233, gy = H - 52;
  p.hline(gx - 6, gy + 6, 6, "gold2").px(gx - 6, gy + 5, "gold1");
  p.ellipse(gx, gy + 3, 4, 4, "cream5");
  p.ellipse(gx - 1, gy + 2, 2, 2, "white");
  p.px(gx + 2, gy + 5, "cream3").hline(gx - 2, gy + 7, 5, "gold3");
  // A blank menu frame screwed to the post left of the door.
  p.rect(141, H - 58, 11, 16, "wood1").rect(142, H - 57, 9, 14, "cream4").hline(142, H - 57, 9, "cream5").hline(143, H - 52, 7, "cream2").hline(143, H - 49, 7, "cream2");
  // Upper-storey life: the kitchen vent (east end), its AC, a cable looped across.
  acUnit(p, 318, H - 124, 4, 6);
  kitchenVent(p, H, 322, 140, frame);
  cable(p, 0, H - 145, 140, H - 146, 5);
  cable(p, 140, H - 146, 352, H - 144, 7);
  p.rect(138, H - 148, 4, 4, "stone2").px(139, H - 147, "stone4");
  // A hairline crack in the render, filled once in a fresher cream.
  block(p, 112, H - 144, ["a..", ".a.", ".a.", "..b", "..a", ".a.", ".ab", "..a"], { a: "cream2", b: "cream5" }, "crack");
  crown(p, H);
  // Building edges.
  zrect(p, H, 351, 0, 1, 160, "cream1");
}

export default defineSprites(perProp("building-restaurant", (_prop, w, h) => ({
  frames: FRAMES,
  fps: 4,
  foot: plotFoot(w, h),
  draw: (p, frame) => {
    roof(p, frame);
    facade(p, h, frame);
  },
})));
