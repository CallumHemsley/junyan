/**
 * The ward window: a wide steel window of the eighties wing, three bays under a transom, painted the
 * same jade as the dado, many coats deep. A cream roller blind is half drawn and hangs a pixel low on
 * the right, its bead chain down the right jamb. Outside, morning sky over lane-house roofs and the
 * plane tree that has grown to the third floor. On the terrazzo sill: a spider plant in a chipped
 * enamel mug that a patient left years ago and the nurses kept watering, one runner hanging over the
 * edge with a baby plant on it, and the elder's reading glasses, folded.
 *
 * 96×62 (three tiles wide). Anchors at the wall's foot: place it at (x, 96) on a wall that starts at
 * y = 0; the frame top lands on wall row 12 and the sill on rows 59–64, so the window cuts through the
 * dado rail as a real one would. Glass spans x 5–90, rows 3–43 (visible below the blind from row 20);
 * bays at x 5–32, 35–60, 63–90. A morning `shaft` light fits under it: `from` at the window's left
 * edge, `width` about 2.7 tiles, `panes: [3, 2]`.
 */
import { defineSprites, hash, Px, type Color } from "../../kit/index.ts";
import { block, fromTop } from "./_arch.ts";

const W = 96, H = 62;
const GX0 = 5, GX1 = 90, GY0 = 3, GY1 = 43, SILL = 47;
const MULLIONS = [33, 34, 61, 62], TRANSOM = [14, 15], BAR = 30;

/** `F` frame, `M` mullion or transom, `b` glazing bar, `g` glass, `.` outside. */
function plan(): string[][] {
  const g: string[][] = Array.from({ length: SILL }, (_, y) => Array.from({ length: W }, (_, x): string => {
    if (x < 2 || x > W - 3) return ".";
    return x >= GX0 && x <= GX1 && y >= GY0 && y <= GY1 ? "g" : "F";
  }));
  for (let y = GY0; y <= GY1; y++) for (const x of MULLIONS) g[y][x] = "M";
  for (let x = GX0; x <= GX1; x++) for (const y of TRANSOM) g[y][x] = "M";
  for (let x = GX0; x <= GX1; x++) if (g[BAR][x] === "g") g[BAR][x] = "b";
  return g;
}

/**
 * A clump of plane foliage: a mass lit on its upper left and shaded on its lower right, its rim broken
 * into leaf points so it reads as leaves rather than a cloud. Drawn only on glass.
 */
function clump(p: Px, g: string[][], cx: number, cy: number, rx: number, ry: number, seed: number, tone: "back" | "front") {
  const [lit, mid, dark] = tone === "front" ? ["leaf4", "leaf3", "leaf2"] as const : ["leaf3", "leaf2", "leaf1"] as const;
  for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
    if (g[y]?.[x] !== "g") continue;
    const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, r = Math.hypot(dx, dy);
    if (r > 1.12) continue;
    // Leaf points: the rim alternates in and out every couple of pixels.
    if (r > 0.86 && hash(x >> 1, y >> 1, seed) > 0.5) continue;
    const s = dx + dy;
    p.px(x, y, s < -0.95 && tone === "front" && hash(x, y, seed) > 0.4 ? "leaf5" : s < -0.45 ? lit : s > 0.6 ? dark : mid);
  }
}

/** The view: sky paling to haze, lane-house roofs low in the left bays, the plane tree on the right. */
function outside(p: Px, g: string[][]) {
  const onGlass = (x: number, y: number) => g[y]?.[x] === "g";
  p.faded(0.92, () => {
    for (let y = GY0; y <= GY1; y++) for (let x = GX0; x <= GX1; x++) {
      if (!onGlass(x, y)) continue;
      const t = y + (x - GX0) * 0.06;
      p.px(x, y, t < 28 ? "blue5" : t < 36 ? "blue6" : "cream5");
    }
    // Roofs: two grey tiled lane-house roofs, the near one with an upturned ridge end.
    for (let x = GX0; x <= 66; x++) {
      const far = 38 + Math.round(Math.abs(x - 46) / 9);
      const near = 37 + Math.round(Math.max(0, x - 18) / 4);
      for (let y = Math.min(far, GY1 + 1); y <= GY1; y++) if (onGlass(x, y)) p.px(x, y, (y - far) % 2 ? "stone3" : "stone4");
      for (let y = near; y <= GY1; y++) if (onGlass(x, y) && x < 38) p.px(x, y, y === near ? "stone1" : (y - near) % 2 ? "stone2" : "stone3");
    }
    block(p, 5, 35, ["SS", ".S"], { S: "stone1" }, "ridge-end");
    // A pigeon on the far ridge.
    block(p, 50, 36, [".ff", "fff"], { f: "steel2" }, "pigeon");
  });
  p.faded(0.95, () => {
    // The plane tree's branch, its bark peeling in pale patches the way plane bark does.
    for (let i = 0; i < 22; i++) {
      const x = GX1 - i, y = 30 + Math.round(i * 0.42);
      const bark: Color = (i >> 1) % 3 === 0 ? "cream3" : (i >> 1) % 3 === 1 ? "stone3" : "leaf2";
      if (onGlass(x, y)) p.px(x, y, bark);
      if (onGlass(x, y + 1)) p.px(x, y + 1, "stone2");
    }
    const back: [number, number, number, number][] = [[80, 24, 11, 6], [64, 29, 7, 4], [89, 35, 5, 7], [76, 41, 10, 3]];
    const front: [number, number, number, number][] = [[71, 31, 8, 5], [85, 28, 6, 4], [57, 34, 4, 3], [81, 38, 7, 4], [52, 27, 3, 2], [67, 41, 6, 3]];
    back.forEach(([x, y, rx, ry], i) => clump(p, g, x, y, rx, ry, i + 1, "back"));
    front.forEach(([x, y, rx, ry], i) => clump(p, g, x, y, rx, ry, i + 11, "front"));
  });
  // Glints on the glass: two short diagonal strokes in the left and right lower panes.
  p.faded(0.8, () => {
    for (const [x, y] of [[9, 33], [10, 32], [11, 31], [13, 33], [14, 32], [39, 28], [40, 27], [41, 26]] as const) if (onGlass(x, y)) p.px(x, y, "white");
  });
}

function joinery(p: Px, g: string[][]) {
  const at = (x: number, y: number) => g[y]?.[x] ?? ".";
  for (let y = 0; y < SILL; y++) for (let x = 0; x < W; x++) {
    const c = at(x, y);
    if (c === "F") {
      const outLit = at(x, y - 1) === "." || at(x - 1, y) === ".";
      const outShade = at(x + 1, y) === "." || at(x, y + 1) === ".";
      const faceUp = at(x, y - 1) !== "F" && at(x, y - 1) !== ".";
      const faceLeft = at(x - 1, y) !== "F" && at(x - 1, y) !== ".";
      const faceDown = at(x, y + 1) === "g" || at(x, y + 1) === "M";
      const faceRight = at(x + 1, y) === "g" || at(x + 1, y) === "M";
      p.px(x, y, outShade ? "jade1" : outLit ? "jade4" : faceUp || faceLeft ? "jade4" : faceDown || faceRight ? "jade2" : "jade3");
    } else if (c === "M") {
      const vertical = at(x, y - 1) === "M" && at(x, y + 1) === "M" && (at(x - 1, y) === "g" || at(x + 1, y) === "g" || at(x - 1, y) === "M");
      if (vertical) p.px(x, y, at(x - 1, y) === "g" || at(x - 1, y) === "b" ? "jade4" : "jade2");
      else p.px(x, y, at(x, y - 1) === "M" ? "jade2" : "jade4");
    } else if (c === "b") p.px(x, y, "jade2");
  }
  // Casement handles: a brass-coloured cockspur on each outer bay's meeting side.
  block(p, 30, 36, ["dd", "Dd", ".D"], { d: "gold3", D: "gold1" }, "handle-l");
  block(p, 64, 36, ["dd", "dD", "D."], { d: "gold3", D: "gold1" }, "handle-r");
}

/**
 * The roller blind: a housing over the frame head, glowing cream fabric with the transom's and the
 * mullions' shadows showing through it, a timber bottom bar hanging a pixel low on the right, and a
 * cord pull with a wooden acorn at its middle.
 */
function blind(p: Px) {
  p.hline(2, 0, W - 4, "white").rect(2, 1, W - 4, 2, "cream4").hline(2, 3, W - 4, "cream2");
  p.px(2, 1, "cream5").px(W - 3, 1, "cream3").px(W - 3, 2, "cream2");
  const HEM = 18;
  for (let x = 4; x <= W - 5; x++) {
    const low = x >= 48 ? 1 : 0;
    for (let y = 4; y < HEM + low; y++) {
      const shadow = MULLIONS.includes(x) || TRANSOM.includes(y);
      // The last rows before the bar a step warmer, where the sun comes through it strongest.
      p.px(x, y, shadow ? "cream4" : y >= HEM - 2 + low ? "bamboo5" : "cream5");
    }
    p.px(x, HEM + low, "oak4").px(x, HEM + 1 + low, "oak2");
  }
  p.hline(4, HEM, 3, "oak5").hline(50, HEM + 1, 5, "oak5");
  block(p, 46, HEM + 1, [".k.", ".k.", ".k.", "oOo", "OoO", ".O."], { k: "cream3", o: "oak4", O: "oak2" }, "acorn-pull");
  // The blind's bead chain down the right jamb, looped at the bottom.
  for (let y = 4; y < 40; y++) p.px(W - 4, y, y % 2 ? "steel4" : "steel2");
  block(p, W - 5, 40, [".e.", "e.e", ".e."], { e: "steel3" }, "chain-loop");
}

/** The terrazzo sill: top face in the frame's shade, chips, a lit nose, a front face and its shadow. */
function sill(p: Px) {
  p.hline(0, SILL, W, "stone4").rect(0, SILL + 1, W, 2, "stone5");
  for (const x of [7, 21, 33, 48, 61, 76, 88]) p.px(x, SILL + 1 + (x % 2), "stone3").px(x + 1, SILL + 1 + (x % 2), "white");
  p.hline(0, SILL + 3, W, "white").hline(0, SILL + 4, W, "stone4").hline(0, SILL + 5, W, "stone3");
  p.hline(1, SILL + 6, W - 2, "cream2");
  p.vline(0, SILL, 6, "stone3").vline(W - 1, SILL, 6, "stone2");
}

/** Quadratic curve sample, rounded to pixels. */
function curve(a: readonly [number, number], c: readonly [number, number], b: readonly [number, number], visit: (x: number, y: number, t: number) => void) {
  for (let i = 0; i <= 48; i++) {
    const t = i / 48, u = 1 - t;
    visit(Math.round(u * u * a[0] + 2 * u * t * c[0] + t * t * b[0]), Math.round(u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]), t);
  }
}

/** The spider plant: striped leaves arching out of a white enamel mug with a blue rim and a black chip. */
function spiderPlant(p: Px) {
  const base: [number, number] = [14, 42];
  // Back leaves first (darker), then front leaves; each a cream stripe over a green edge.
  const leaves: [number, number, number, number, boolean][] = [
    [7, 44, 6, 33, false], [22, 44, 22, 33, false], [11, 34, 11, 31, false],
    [2, 48, 4, 31, true], [5, 39, 8, 30, true], [10, 32, 11, 30, true], [14, 31, 14, 34, true],
    [26, 48, 24, 31, true], [23, 39, 20, 30, true], [18, 33, 17, 30, true],
  ];
  for (const [bx, by, cx, cy, front] of leaves) {
    curve(base, [cx, cy], [bx, by], (x, y, t) => {
      if (t < 0.08) return;
      p.px(x, y, front ? (t > 0.85 ? "leaf3" : "cream4") : "leaf2");
      p.px(x, y + 1, front ? "leaf3" : "leaf1");
    });
  }
  // The runner over the sill's edge, and the baby plant hanging on it.
  curve([19, 43], [27, 45], [25, 57], (x, y) => p.px(x, y, "bamboo3"));
  block(p, 22, 56, [".c.c.", "cGcGc", ".GgG.", "..g.."], { c: "cream4", G: "leaf3", g: "leaf2" }, "plantlet");
  block(p, 9, 41, [
    ".BBBBiBBB...",
    "BWWWWiWWWB..",
    "WCWWWWWWWkee",
    "WCWWWWWWWk.e",
    "WCWWWWWWWk.e",
    "WCWWWWWWWkee",
    "WCWWWWWWkk..",
    ".WCWWWWkk...",
    "..kkkkkk....",
  ], { W: "white", C: "cream5", B: "blue3", i: "steel1", k: "cream3", e: "cream4" }, "enamel-mug");
}

export default defineSprites({
  "ward/window": {
    w: W, h: H, anchor: [44, fromTop(12)], layer: "floor",
    draw: (p) => {
      const g = plan();
      outside(p, g);
      joinery(p, g);
      blind(p);
      sill(p);
      spiderPlant(p);
      block(p, 70, 47, [".fff.fff.", "fWbbfWbbf", ".fff.fff."], { f: "steel2", W: "white", b: "blue6" }, "reading-glasses");
    },
  },
});
