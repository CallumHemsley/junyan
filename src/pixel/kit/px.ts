import { PALETTE, type Color } from "./palette.ts";

export const COLOR_NAMES = Object.keys(PALETTE) as Color[];
const INDEX = new Map<string, number>(COLOR_NAMES.map((name, i) => [name, i + 1]));
const RGB = COLOR_NAMES.map((name) => {
  const hex = PALETTE[name];
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)] as const;
});

/** A colour name, or `null` to erase back to transparent. */
export type Paint = Color | null;
export type Legend = Record<string, Paint>;
export type Region = [x: number, y: number, w: number, h: number];
export type Mode = "normal" | "over" | "under";

/** Deterministic 0..1 noise for texture placement. Never use Math.random in a sprite. */
export function hash(x: number, y: number, seed = 0): number {
  let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 2147483647)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/**
 * An indexed-colour pixel canvas. Coordinates are whole pixels, origin top-left.
 * Everything drawn is a palette colour; there is no anti-aliasing and no blending.
 */
export class Px {
  readonly w: number;
  readonly h: number;
  /** 0 is transparent; otherwise palette index + 1. */
  readonly ink: Uint8Array;
  /** Per-pixel alpha, for glass, steam and light sprites. Solid art leaves this at 255. */
  readonly alpha: Uint8Array;
  /** Alpha (0..1) stamped on pixels drawn from now on. */
  opacity = 1;
  private mode: Mode = "normal";
  private ox = 0;
  private oy = 0;
  private clipBox: Region;

  constructor(w: number, h: number) {
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) throw new Error(`Bad sprite size ${w}x${h}`);
    this.w = w;
    this.h = h;
    this.ink = new Uint8Array(w * h);
    this.alpha = new Uint8Array(w * h);
    this.clipBox = [0, 0, w, h];
  }

  // ── reading ────────────────────────────────────────────────────────────────
  get(x: number, y: number): Paint {
    x += this.ox;
    y += this.oy;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    const i = this.ink[y * this.w + x];
    return i ? COLOR_NAMES[i - 1] : null;
  }
  solid(x: number, y: number): boolean {
    return this.get(x, y) !== null;
  }

  // ── single pixels ──────────────────────────────────────────────────────────
  px(x: number, y: number, c: Paint): this {
    x = Math.round(x) + this.ox;
    y = Math.round(y) + this.oy;
    const [cx, cy, cw, ch] = this.clipBox;
    if (x < cx || y < cy || x >= cx + cw || y >= cy + ch) return this;
    const at = y * this.w + x;
    const filled = this.ink[at] !== 0;
    if (this.mode === "over" && !filled) return this;
    if (this.mode === "under" && filled) return this;
    if (c === null) {
      this.ink[at] = 0;
      this.alpha[at] = 0;
      return this;
    }
    const index = INDEX.get(c);
    if (!index) throw new Error(`Unknown palette colour "${c}"`);
    this.ink[at] = index;
    this.alpha[at] = Math.round(Math.max(0, Math.min(1, this.opacity)) * 255);
    return this;
  }

  /**
   * What `px(x, y, …)` would meet at a whole-pixel position: -1 outside the clip box, 0 on a
   * transparent pixel, 1 on artwork. For generators that resolve overdraw themselves and then
   * write each pixel once (see `canopy` in the plant helpers).
   */
  peek(x: number, y: number): -1 | 0 | 1 {
    x += this.ox;
    y += this.oy;
    const b = this.clipBox;
    if (x < b[0] || y < b[1] || x >= b[0] + b[2] || y >= b[1] + b[3]) return -1;
    return this.ink[y * this.w + x] !== 0 ? 1 : 0;
  }
  /** The scoped drawing mode `px` is in: "normal", or "over"/"under" inside those scopes. */
  get drawMode(): Mode {
    return this.mode;
  }
  /** `px` in normal mode whatever the current scope: for writing pixels already resolved against the mode. */
  put(x: number, y: number, c: Paint): this {
    const keep = this.mode;
    this.mode = "normal";
    try { return this.px(x, y, c); } finally { this.mode = keep; }
  }

  // ── shapes ─────────────────────────────────────────────────────────────────
  rect(x: number, y: number, w: number, h: number, c: Paint): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c);
    return this;
  }
  /** One-pixel rectangle border. */
  frame(x: number, y: number, w: number, h: number, c: Paint): this {
    this.rect(x, y, w, 1, c).rect(x, y + h - 1, w, 1, c);
    return this.rect(x, y, 1, h, c).rect(x + w - 1, y, 1, h, c);
  }
  hline(x: number, y: number, length: number, c: Paint): this {
    return this.rect(x, y, length, 1, c);
  }
  vline(x: number, y: number, length: number, c: Paint): this {
    return this.rect(x, y, 1, length, c);
  }
  line(x0: number, y0: number, x1: number, y1: number, c: Paint): this {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;
    for (;;) {
      this.px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const twice = 2 * error;
      if (twice >= dy) { error += dy; x0 += sx; }
      if (twice <= dx) { error += dx; y0 += sy; }
    }
    return this;
  }
  /**
   * Filled ellipse. The centre is in pixel-edge coordinates, so `ellipse(8, 8, 8, 8)` exactly
   * fills a 16×16 box and `ellipse(8, 4, 8, 4)` a 16×8 one. Radii may be fractional.
   */
  ellipse(cx: number, cy: number, rx: number, ry: number, c: Paint): this {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
        if (u * u + v * v <= 1) this.px(x, y, c);
      }
    return this;
  }
  /** Filled polygon (even-odd), sampled at pixel centres. Points are in pixel-edge coordinates. */
  poly(points: readonly (readonly [number, number])[], c: Paint): this {
    const ys = points.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const crossings: number[] = [];
      for (let i = 0; i < points.length; i++) {
        const [ax, ay] = points[i], [bx, by] = points[(i + 1) % points.length];
        const py = y + 0.5;
        if ((ay <= py && by > py) || (by <= py && ay > py)) crossings.push(ax + ((py - ay) / (by - ay)) * (bx - ax));
      }
      crossings.sort((a, b) => a - b);
      for (let i = 0; i + 1 < crossings.length; i += 2)
        for (let x = Math.ceil(crossings[i] - 0.5); x + 0.5 < crossings[i + 1]; x++) this.px(x, y, c);
    }
    return this;
  }

  /**
   * Hand-placed pixels. One string per row, one character per pixel; `.` and space are skipped.
   * Any character missing from the legend throws, which catches typos.
   */
  rows(x: number, y: number, rows: readonly string[], legend: Legend): this {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const key = row[i];
        if (key === "." || key === " ") continue;
        if (!(key in legend)) throw new Error(`rows(): "${key}" is not in the legend (row ${j}: "${row}")`);
        this.px(x + i, y + j, legend[key]);
      }
    });
    return this;
  }

  // ── texture ────────────────────────────────────────────────────────────────
  /** Ordered dither. `checker` covers half the pixels, `quarter` a quarter, `rows` every other row. */
  dither(x: number, y: number, w: number, h: number, c: Paint, pattern: "checker" | "quarter" | "rows" = "checker", phase = 0): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const gx = x + i + phase, gy = y + j;
      const on = pattern === "checker" ? (gx + gy) % 2 === 0 : pattern === "quarter" ? gx % 2 === 0 && gy % 2 === 0 : gy % 2 === 0;
      if (on) this.px(x + i, y + j, c);
    }
    return this;
  }
  /** Scatter single pixels at roughly `density` (0..1), deterministically from `seed`. */
  speckle(x: number, y: number, w: number, h: number, c: Paint, density: number, seed = 1): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (hash(x + i, y + j, seed) < density) this.px(x + i, y + j, c);
    return this;
  }

  // ── whole-canvas passes ────────────────────────────────────────────────────
  /** Visit every pixel in the region. Return a paint to replace it, or `undefined` to leave it. */
  each(visit: (x: number, y: number, current: Paint) => Paint | undefined, region?: Region): this {
    const [rx, ry, rw, rh] = region ?? [-this.ox, -this.oy, this.w, this.h];
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) {
      const next = visit(x, y, this.get(x, y));
      if (next !== undefined) this.px(x, y, next);
    }
    return this;
  }
  /** Recolour: every pixel of a key colour becomes its mapped colour. */
  swap(map: Partial<Record<Color, Paint>>, region?: Region): this {
    return this.each((_x, _y, current) => (current !== null && current in map ? map[current] : undefined), region);
  }
  /**
   * Draw an outline on the transparent pixels that touch the artwork.
   * `sides` limits which side of the art gets outlined; `diagonal` also closes corners.
   */
  outline(c: Color, options: { diagonal?: boolean; sides?: readonly ("top" | "bottom" | "left" | "right")[] } = {}): this {
    const sides = options.sides ?? ["top", "bottom", "left", "right"];
    const reach: [number, number][] = [];
    if (sides.includes("top")) reach.push([0, 1]);
    if (sides.includes("bottom")) reach.push([0, -1]);
    if (sides.includes("left")) reach.push([1, 0]);
    if (sides.includes("right")) reach.push([-1, 0]);
    if (options.diagonal) reach.push([1, 1], [-1, 1], [1, -1], [-1, -1]);
    const hits: [number, number][] = [];
    for (let y = -this.oy; y < this.h - this.oy; y++) for (let x = -this.ox; x < this.w - this.ox; x++)
      if (!this.solid(x, y) && reach.some(([dx, dy]) => this.solid(x + dx, y + dy))) hits.push([x, y]);
    for (const [x, y] of hits) this.px(x, y, c);
    return this;
  }
  /** Copy the left half onto the right half, mirrored. Draw symmetric art once. */
  mirrorX(): this {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < Math.floor(this.w / 2); x++) {
      const from = y * this.w + x, to = y * this.w + (this.w - 1 - x);
      this.ink[to] = this.ink[from];
      this.alpha[to] = this.alpha[from];
    }
    return this;
  }

  // ── composition ────────────────────────────────────────────────────────────
  /** Stamp another canvas here. Transparent source pixels are skipped. */
  blit(source: Px, x: number, y: number, options: { flipX?: boolean; flipY?: boolean; map?: Partial<Record<Color, Paint>> } = {}): this {
    const keep = this.opacity;
    for (let j = 0; j < source.h; j++) for (let i = 0; i < source.w; i++) {
      const sx = options.flipX ? source.w - 1 - i : i, sy = options.flipY ? source.h - 1 - j : j;
      const index = source.ink[sy * source.w + sx];
      if (!index) continue;
      const name = COLOR_NAMES[index - 1];
      const mapped = options.map && name in options.map ? options.map[name]! : name;
      this.opacity = source.alpha[sy * source.w + sx] / 255;
      this.px(x + i, y + j, mapped);
    }
    this.opacity = keep;
    return this;
  }
  clone(): Px {
    const copy = new Px(this.w, this.h);
    copy.ink.set(this.ink);
    copy.alpha.set(this.alpha);
    return copy;
  }
  flippedX(): Px {
    return new Px(this.w, this.h).blit(this, 0, 0, { flipX: true });
  }

  // ── scoped drawing modes ───────────────────────────────────────────────────
  /** Inside `draw`, pixels land only on existing artwork. Use for shading, grain and highlights. */
  over(draw: (p: this) => void): this {
    return this.scoped("over", draw);
  }
  /** Inside `draw`, pixels land only on transparent pixels. Use for backing shapes. */
  under(draw: (p: this) => void): this {
    return this.scoped("under", draw);
  }
  /** Inside `draw`, (0,0) is (x,y) and nothing can be drawn outside the w×h box. */
  clip(x: number, y: number, w: number, h: number, draw: (p: this) => void): this {
    const keep = { ox: this.ox, oy: this.oy, clip: this.clipBox };
    const ax = x + this.ox, ay = y + this.oy;
    const [cx, cy, cw, ch] = this.clipBox;
    const left = Math.max(cx, ax), top = Math.max(cy, ay);
    this.clipBox = [left, top, Math.max(0, Math.min(cx + cw, ax + w) - left), Math.max(0, Math.min(cy + ch, ay + h) - top)];
    this.ox = ax;
    this.oy = ay;
    try { draw(this); } finally { this.ox = keep.ox; this.oy = keep.oy; this.clipBox = keep.clip; }
    return this;
  }
  /** Inside `draw`, pixels are stamped with this alpha (0..1). */
  faded(opacity: number, draw: (p: this) => void): this {
    const keep = this.opacity;
    this.opacity = opacity;
    try { draw(this); } finally { this.opacity = keep; }
    return this;
  }
  private scoped(mode: Mode, draw: (p: this) => void): this {
    const keep = this.mode;
    this.mode = mode;
    try { draw(this); } finally { this.mode = keep; }
    return this;
  }

  // ── export ─────────────────────────────────────────────────────────────────
  /** Straight (non-premultiplied) RGBA, row-major. */
  toRGBA(): Uint8ClampedArray {
    const out = new Uint8ClampedArray(this.w * this.h * 4);
    for (let i = 0; i < this.ink.length; i++) {
      const index = this.ink[i];
      if (!index) continue;
      const [r, g, b] = RGB[index - 1];
      out[i * 4] = r;
      out[i * 4 + 1] = g;
      out[i * 4 + 2] = b;
      out[i * 4 + 3] = this.alpha[i];
    }
    return out;
  }
}
