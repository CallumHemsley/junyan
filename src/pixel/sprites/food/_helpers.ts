/**
 * Private drawing helpers for the food domain. Not a sprite set (the leading `_` keeps the loader out).
 *
 * The shading helpers light a curved form from the style bible's sun (upper left, slightly toward the
 * viewer) and step the result along a hand-picked ramp. They only block in form; every sprite then
 * finishes by hand with `rows()`.
 */
import { Px, type Color, type Legend } from "../../kit/index.ts";

/** A material ramp, dark to light. */
export type Ramp = readonly Color[];

// Morning sun: from the upper left and toward the viewer. x right, y down, z out of the screen.
const SUN = (() => {
  const v = [-0.55, -0.7, 0.62];
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n] as const;
})();

/** Lambert light (0..1) for a surface normal. */
export function light(nx: number, ny: number, nz: number): number {
  return Math.max(0, nx * SUN[0] + ny * SUN[1] + nz * SUN[2]);
}

/**
 * Step a light value onto a ramp. `cuts` are ascending light thresholds, one fewer than the ramp:
 * light below cuts[0] gets ramp[0], above the last cut gets the lightest tone.
 */
export function tone(ramp: Ramp, value: number, cuts?: readonly number[]): Color {
  const steps = cuts ?? ramp.slice(1).map((_, i) => (i + 1) / ramp.length);
  let i = 0;
  while (i < steps.length && value >= steps[i]) i++;
  return ramp[i];
}

export type DomeOptions = {
  /** Light thresholds for `tone`. */
  cuts?: readonly number[];
  /** Flatten the top (0 = hemisphere, 1 = flat disc lit straight on). */
  flat?: number;
  /** Only paint over existing art (to reshade a hand-drawn silhouette). */
  over?: boolean;
};

/** A lit dome or ball filling an ellipse (pixel-edge centre, like `Px.ellipse`). */
export function dome(p: Px, cx: number, cy: number, rx: number, ry: number, ramp: Ramp, options: DomeOptions = {}): Px {
  const flat = options.flat ?? 0;
  const paint = () => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry, d = u * u + v * v;
        if (d > 1) continue;
        const nz = Math.sqrt(1 - d) * (1 - flat) + flat;
        const n = Math.hypot(u * (1 - flat), v * (1 - flat), nz);
        p.px(x, y, tone(ramp, light((u * (1 - flat)) / n, (v * (1 - flat)) / n, nz / n), options.cuts));
      }
  };
  if (options.over) p.over(paint); else paint();
  return p;
}

/**
 * A lit tube along a polyline (pixel-edge coordinates) with rounded ends.
 * `radius(t)` gives the radius at fraction t (0..1) of the length, so blisters and tapers are easy.
 */
export function tube(p: Px, points: readonly (readonly [number, number])[], radius: (t: number) => number, ramp: Ramp, cuts?: readonly number[]): Px {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  const total = lengths[lengths.length - 1];
  const xs = points.map((q) => q[0]), ys = points.map((q) => q[1]);
  const pad = 6;
  for (let y = Math.floor(Math.min(...ys) - pad); y <= Math.ceil(Math.max(...ys) + pad); y++)
    for (let x = Math.floor(Math.min(...xs) - pad); x <= Math.ceil(Math.max(...xs) + pad); x++) {
      const px = x + 0.5, py = y + 0.5;
      let best = Infinity, bestT = 0, ox = 0, oy = 0;
      for (let i = 1; i < points.length; i++) {
        const [ax, ay] = points[i - 1], [bx, by] = points[i];
        const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy || 1;
        const s = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
        const qx = ax + s * dx, qy = ay + s * dy, dist = Math.hypot(px - qx, py - qy);
        if (dist < best) { best = dist; bestT = (lengths[i - 1] + s * (lengths[i] - lengths[i - 1])) / total; ox = px - qx; oy = py - qy; }
      }
      const r = radius(bestT);
      if (best > r) continue;
      const u = ox / r, v = oy / r, nz = Math.sqrt(Math.max(0, 1 - u * u - v * v));
      p.px(x, y, tone(ramp, light(u, v, nz), cuts));
    }
  return p;
}

/**
 * Selective outline: the classic finish where the sunlit top and left edges get a softer line than
 * the shadowed bottom and right. Both colours should be dark steps of the object's own ramp.
 */
export function selout(p: Px, dark: Color, lit: Color = dark): Px {
  const hits: [number, number, Color][] = [];
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (p.solid(x, y)) continue;
    const below = p.solid(x, y + 1), right = p.solid(x + 1, y), above = p.solid(x, y - 1), left = p.solid(x - 1, y);
    if (!(below || right || above || left)) continue;
    hits.push([x, y, (below || right) && !above && !left ? lit : dark]);
  }
  for (const [x, y, c] of hits) p.px(x, y, c);
  return p;
}

/** Draw a separate part on its own canvas (so it can be outlined alone), then stamp it. */
export function part(w: number, h: number, draw: (q: Px) => void): Px {
  const q = new Px(w, h);
  draw(q);
  return q;
}

/** `rows()` that also checks every row has the same width, to catch hand-typing slips. */
export function grid(p: Px, x: number, y: number, rows: readonly string[], legend: Legend): Px {
  const width = rows[0].length;
  rows.forEach((row, i) => {
    if (row.length !== width) throw new Error(`grid row ${i} is ${row.length} wide, expected ${width}: "${row}"`);
  });
  return p.rows(x, y, rows, legend);
}

/** Recolour only the pixels inside an ellipse (pixel-edge centre). */
export function inEllipse(cx: number, cy: number, rx: number, ry: number, x: number, y: number): boolean {
  const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
  return u * u + v * v <= 1;
}

/** Shift the colour at (x, y) along a ramp by `steps` (negative is darker). Pixels off the ramp are left alone. */
export function shift(p: Px, x: number, y: number, ramp: Ramp, steps: number): void {
  const c = p.get(x, y);
  if (!c) return;
  const i = ramp.indexOf(c);
  if (i < 0) return;
  p.px(x, y, ramp[Math.max(0, Math.min(ramp.length - 1, i + steps))]);
}

/**
 * Hand-placed relief over shaded art: `d`/`D` darken one/two ramp steps, `l`/`L` lighten.
 * Creases, folds and ridges keep the local light this way instead of a fixed colour.
 */
export function relief(p: Px, x: number, y: number, rows: readonly string[], ramp: Ramp): void {
  const steps: Record<string, number> = { d: -1, D: -2, l: 1, L: 2 };
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const k = row[i];
      if (k === "." || k === " ") continue;
      if (!(k in steps)) throw new Error(`relief(): "${k}" is not d, D, l or L (row ${j})`);
      shift(p, x + i, y + j, ramp, steps[k]);
    }
  });
}
