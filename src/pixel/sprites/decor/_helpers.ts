/**
 * Private drawing helpers for the decor domain. Not a sprite set (the leading `_` keeps the
 * loader away). Candidates for promotion into the kit are marked PROMOTE.
 */
import type { Color, Legend, Paint, Px } from "../../kit/index.ts";

type Side = "top" | "bottom" | "left" | "right";

/** The outline colour for each ramp family: the darkest step of the object's own material. */
const DARKEST: Record<string, Color> = {
  leaf: "leaf1", jade: "jade1", wood: "wood1", oak: "wood1", rose: "rose1", bamboo: "wood1",
  cream: "ink2", white: "ink2", red: "red1", gold: "wood1", steel: "steel1", stone: "stone1",
  blue: "blue1", skin: "skin1", tan: "tan1", blush: "skin1", orange: "brown1", brown: "brown1",
  pink: "plum1", plum: "plum1", grey: "steel1", hair: "hair1", ink: "ink",
};

const family = (c: Paint) => (c ?? "").replace(/\d+$/, "");

/**
 * PROMOTE. Outline every transparent pixel that touches the art, each in the darkest step of
 * the material it touches (leaves get leaf1, the pot jade1, the tassel wood1…), so a plant in a
 * glazed pot is outlined in two materials without hand masking. `map` overrides a family.
 */
export function autoOutline(p: Px, options: { sides?: readonly Side[]; diagonal?: boolean; map?: Partial<Record<string, Color>> } = {}): Px {
  const sides = options.sides ?? ["top", "bottom", "left", "right"];
  const reach: [number, number][] = [];
  if (sides.includes("top")) reach.push([0, 1]);
  if (sides.includes("bottom")) reach.push([0, -1]);
  if (sides.includes("left")) reach.push([1, 0]);
  if (sides.includes("right")) reach.push([-1, 0]);
  if (options.diagonal) reach.push([1, 1], [-1, 1], [1, -1], [-1, -1]);
  const hits: [number, number, Color][] = [];
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (p.solid(x, y)) continue;
    for (const [dx, dy] of reach) {
      const touched = p.get(x + dx, y + dy);
      if (touched === null) continue;
      const f = family(touched);
      hits.push([x, y, options.map?.[f] ?? DARKEST[f] ?? "ink"]);
      break;
    }
  }
  for (const [x, y, c] of hits) p.px(x, y, c);
  return p;
}

/** Wall-mounted pieces: a hairline shadow on the bottom and right only. */
export function wallEdge(p: Px, c: Color = "cream1"): Px {
  return p.outline(c, { sides: ["bottom", "right"] });
}

/** `rows()` under a decor name; rows are left-aligned, so a short row simply stops early. */
export function art(p: Px, x: number, y: number, rows: readonly string[], legend: Legend): Px {
  return p.rows(x, y, rows, legend);
}

/**
 * PROMOTE. Stamp a hand-drawn shape whose digits are tones on a ramp (1 = darkest). `shift`
 * moves every tone up or down the ramp (back leaves one step darker, sunlit ones lighter),
 * so one leaf drawing serves the whole canopy. Other characters come from `legend`.
 */
export function stamp(
  p: Px, x: number, y: number, rows: readonly string[], ramp: readonly Color[],
  options: { shift?: number; flipX?: boolean; legend?: Legend; outline?: Color } = {},
): Px {
  const shift = options.shift ?? 0;
  const w = Math.max(...rows.map((r) => r.length));
  if (options.outline) {
    const filled = (i: number, j: number) => j >= 0 && j < rows.length && i >= 0 && i < rows[j].length && rows[j][i] !== "." && rows[j][i] !== " ";
    for (let j = -1; j <= rows.length; j++) for (let i = -1; i <= w; i++) {
      if (filled(i, j)) continue;
      if (filled(i - 1, j) || filled(i + 1, j) || filled(i, j - 1) || filled(i, j + 1))
        p.px(options.flipX ? x + w - 1 - i : x + i, y + j, options.outline);
    }
  }
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const key = row[i];
      if (key === "." || key === " ") continue;
      const tx = options.flipX ? x + w - 1 - i : x + i;
      if (key >= "1" && key <= "9") {
        const tone = Math.max(1, Math.min(ramp.length, Number(key) + shift));
        p.px(tx, y + j, ramp[tone - 1]);
      } else if (options.legend && key in options.legend) p.px(tx, y + j, options.legend[key]);
      else throw new Error(`stamp(): "${key}" has no tone or legend entry`);
    }
  });
  return p;
}

/**
 * PROMOTE. A lance-shaped leaf along a hand-chosen midrib (`pts`, base first, tip last). It is
 * one pixel at the base and tip and `width` in the middle; the extra width grows toward the
 * light (up on a flat leaf, left on an upright one), so every leaf is lit from the upper left.
 * Its outline is painted first, so a front leaf cuts a clean dark edge across the ones behind.
 */
export function lance(
  p: Px, pts: readonly (readonly [number, number])[],
  options: { ramp?: readonly Color[]; width?: number; shift?: number; outline?: Color | null } = {},
): Px {
  const ramp = options.ramp ?? ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
  const width = options.width ?? 2, shift = options.shift ?? 0;
  const tone = (t: number) => ramp[Math.max(0, Math.min(ramp.length - 1, t - 1 + shift))];
  const path: [number, number][] = [];
  for (let s = 0; s + 1 < pts.length; s++) {
    let [x0, y0] = pts[s];
    const [x1, y1] = pts[s + 1];
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;
    for (;;) {
      const last = path[path.length - 1];
      if (!last || last[0] !== x0 || last[1] !== y0) path.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      const twice = 2 * error;
      if (twice >= dy) { error += dy; x0 += sx; }
      if (twice <= dx) { error += dx; y0 += sy; }
    }
  }
  const cells = new Map<string, Color>();
  const n = path.length;
  path.forEach(([x, y], i) => {
    const t = n > 1 ? i / (n - 1) : 0;
    const thick = t < 0.18 || t > 0.9 ? 1 : t > 0.75 ? Math.max(1, width - 1) : width;
    const [ax, ay] = path[Math.max(0, i - 1)], [bx, by] = path[Math.min(n - 1, i + 1)];
    const flat = Math.abs(bx - ax) >= Math.abs(by - ay);
    cells.set(`${x},${y}`, tone(thick > 1 ? 3 : t > 0.9 ? 4 : 3));
    for (let k = 1; k < thick; k++) {
      const key = flat ? `${x},${y - k}` : `${x - k},${y}`;
      cells.set(key, tone(k === thick - 1 ? (t < 0.5 ? 5 : 4) : 4));
    }
    if (thick >= 2 && t > 0.3) cells.set(`${x},${y}`, tone(2));
  });
  const outline = options.outline === undefined ? ramp[0] : options.outline;
  if (outline) for (const key of cells.keys()) {
    const [x, y] = key.split(",").map(Number);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!cells.has(`${x + dx},${y + dy}`)) p.px(x + dx, y + dy, outline);
  }
  for (const [key, c] of cells) { const [x, y] = key.split(",").map(Number); p.px(x, y, c); }
  return p;
}

/**
 * PROMOTE. Shade a vertical cylinder (pots, flasks, buckets) lit from the upper left. `tones`
 * runs dark to light; columns step from a lit left edge through a highlight a quarter in, to
 * the darkest step on the right. `inset(row)` narrows rows for a belly or taper.
 */
export function cylinder(
  p: Px, x: number, y: number, w: number, h: number, tones: readonly Color[],
  inset: (row: number) => number = () => 0,
): Px {
  const n = tones.length;
  for (let j = 0; j < h; j++) {
    const k = inset(j), width = w - 2 * k;
    for (let i = 0; i < width; i++) {
      const t = (i + 0.5) / width;
      const level = t < 0.12 ? n - 2 : t < 0.3 ? n - 1 : t < 0.55 ? n - 2 : t < 0.8 ? n - 3 : n - 4;
      p.px(x + k + i, y + j, tones[Math.max(0, Math.min(n - 1, level))]);
    }
  }
  return p;
}
