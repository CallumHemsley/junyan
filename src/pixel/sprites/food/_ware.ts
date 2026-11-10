/**
 * Private: the shop's crockery, shared by the hero icons and the table-scale servings.
 * Blue-and-white porcelain plates and bowls, each with its own pattern, and bamboo steamers.
 * Everything is seen from above and in front, lit from the upper left.
 */
import { Px, type Color } from "../../kit/index.ts";
import { inEllipse, type Ramp } from "./_helpers.ts";

/** Where a pixel sits on a plate's rim: angle round the plate (0 = right, π/2 = front) and r from well (0) to edge (1). */
export type RimSpot = { a: number; r: number; lit: boolean; dx: number; dy: number; rx: number; ry: number; well: number };
export type RimPattern = (spot: RimSpot, x: number, y: number) => Color | undefined;

export type PlateOptions = {
  /** Thickness of the near edge in px. */
  thick?: number;
  /** Well radius as a fraction of the plate. */
  well?: number;
  /** Paint the rim. */
  rim?: RimPattern;
  /** Pixels (x, y) knocked out of the rim's front edge: a chip. */
  chip?: readonly (readonly [number, number])[];
};

/** A flat round plate centred on (cx, cy), radii rx × ry. */
export function plate(q: Px, cx: number, cy: number, rx: number, ry: number, o: PlateOptions = {}): void {
  const thick = o.thick ?? 2, well = o.well ?? 0.66;
  // The near edge's thickness, lit at the left, cooling to the right.
  for (let y = Math.floor(cy); y <= Math.ceil(cy + ry + thick); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!inEllipse(cx, cy + thick, rx, ry, x, y)) continue;
      const u = (x + 0.5 - cx) / rx;
      q.px(x, y, u < -0.45 ? "blue6" : u < 0.4 ? "blue5" : "blue4");
    }
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!inEllipse(cx, cy, rx, ry, x, y)) continue;
      const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry, e = Math.hypot(u, v);
      let c: Color = "white";
      if (e < well) {
        // The well: its far-left slope turns from the sun.
        if (!inEllipse(cx + rx * 0.08, cy + ry * 0.1, rx * well, ry * well, x, y)) c = "blue6";
      } else {
        // The rim: its near-right stretch tilts away from the light.
        if (v > 0.35 && u > 0.25) c = "blue6";
        const spot = { a: Math.atan2(v, u), r: (e - well) / (1 - well), lit: !(v > 0.2 && u > 0.2), dx: x + 0.5 - cx, dy: y + 0.5 - cy, rx, ry, well };
        c = o.rim?.(spot, x, y) ?? c;
      }
      q.px(x, y, c);
    }
  for (const [x, y] of o.chip ?? []) q.px(x, y, null);
}

/** Rim patterns. Each plate in the shop has its own. */
export const RIMS = {
  /** A single blue line round the well and a darker band at the edge. */
  banded: (s: RimSpot) => (s.r > 0.82 ? (s.lit ? "blue3" : "blue2") : s.r < 0.2 ? "blue4" : undefined),
  /** Little two-pixel dots round the rim inside a blue edge. */
  dotted: (s: RimSpot) => {
    if (s.r > 0.86) return s.lit ? "blue3" : "blue2";
    const n = Math.max(10, Math.round(s.rx * 0.9)), k = Math.round((s.a / (2 * Math.PI)) * n), a = (k / n) * 2 * Math.PI;
    const m = s.well + (1 - s.well) * 0.45;
    if (Math.abs(s.dx - Math.cos(a) * m * s.rx) < 1 && Math.abs(s.dy - Math.sin(a) * m * s.ry) < 0.55) return s.lit ? "blue3" : "blue2";
    return undefined;
  },
  /** A scalloped wave band. */
  wave: (s: RimSpot) => {
    const crest = 0.5 + 0.22 * Math.sin(s.a * 14);
    if (s.r > crest && s.r < crest + 0.24) return s.lit ? "blue3" : "blue2";
    if (s.r > 0.9) return "blue4";
    return undefined;
  },
  /** A plain plate with only a hairline at the edge. */
  plain: (s: RimSpot) => (s.r > 0.86 ? "blue4" : undefined),
} satisfies Record<string, RimPattern>;

/** Bowl geometry: the half-width of the body at depth fraction t (0 rim, 1 foot), a sphere section. */
export const bowlWidth = (rx: number, t: number, belly = 0.78) => rx * Math.sqrt(1 - (belly * t) ** 2);

/** Paint callback for a bowl body pixel: u across (−1 left, 1 right), t down (0 rim, 1 foot). */
export type BodyPattern = (u: number, t: number, lit: boolean, x: number, y: number) => Color | undefined;

export type BowlOptions = { belly?: number; foot?: number; body?: BodyPattern };

/**
 * A round porcelain bowl: rim radii rx × ry at (cx, cy), body `depth` tall narrowing to a foot.
 * The mouth shows the far inner wall in shade; fill the contents with `surface`.
 */
export function bowl(q: Px, cx: number, cy: number, rx: number, ry: number, depth: number, o: BowlOptions = {}): void {
  const belly = o.belly ?? 0.78, steps = Math.ceil(depth * 3);
  for (let y = Math.floor(cy); y <= Math.ceil(cy + depth + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      let hit = -1, u = 0;
      // The visible front surface at this pixel belongs to the shallowest ring whose disc reaches it.
      for (let k = 0; k <= steps; k++) {
        const t = k / steps, w = bowlWidth(rx, t, belly), yc = cy + t * depth;
        if (y + 0.5 >= yc && inEllipse(cx, yc, w, ry * (w / rx), x, y)) { hit = t; u = (x + 0.5 - cx) / w; break; }
      }
      if (hit < 0) continue;
      // Glazed curve: a highlight band left of centre, cooling round to the right, darker where it turns under.
      const BODY: Ramp = ["blue4", "blue5", "blue6", "white"];
      let i = u < -0.72 ? 2 : u < -0.3 ? 3 : u < 0.25 ? 2 : u < 0.66 ? 1 : 0;
      if (hit > 0.74) i = Math.max(0, i - 1);
      q.px(x, y, o.body?.(u, hit, i >= 2, x, y) ?? BODY[i]);
    }
  // Foot ring.
  const bw = bowlWidth(rx, 1, belly), fw = bw * (o.foot ?? 0.68), fy = Math.round(cy + depth + ry * (bw / rx) - 0.5);
  for (let x = Math.floor(cx - fw); x < Math.ceil(cx + fw); x++) {
    const u = (x + 0.5 - cx) / fw;
    q.px(x, fy + 1, u < -0.3 ? "blue6" : u < 0.45 ? "blue5" : "blue4").px(x, fy + 2, u < -0.3 ? "blue5" : "blue4");
  }
  // Lip, then the far inner wall: it faces away from the sun, darkest at the left.
  q.ellipse(cx, cy, rx, ry, "white");
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (inEllipse(cx, cy + 0.35, rx - 1.2, ry - 0.9, x, y)) {
        const u = (x + 0.5 - cx) / rx;
        q.px(x, y, u < -0.3 ? "blue5" : u < 0.45 ? "blue6" : "white");
      }
}

/**
 * Whatever fills a bowl: a flat surface with the rim's shadow along its far-left edge and a sheen
 * just inside it. Ramp is [shade, base, sheen].
 */
export function surface(q: Px, cx: number, cy: number, rx: number, ry: number, ramp: Ramp, sheen = true): void {
  const [shade, base, light] = ramp;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!inEllipse(cx, cy, rx, ry, x, y)) continue;
      let c = base;
      if (!inEllipse(cx + rx * 0.1, cy + ry * 0.28, rx, ry, x, y)) c = shade;
      else if (sheen && !inEllipse(cx + rx * 0.2, cy + ry * 0.5, rx, ry, x, y) && x + 0.5 < cx + rx * 0.25) c = light;
      q.px(x, y, c);
    }
}

const BAMBOO: Ramp = ["bamboo1", "bamboo2", "bamboo3", "bamboo4", "bamboo5"];

/**
 * A round bamboo steamer, rim radii rx × ry at (cx, cy), woven band `depth` tall.
 * `back` draws the band, rim and dark well; `front` redraws only the near half of the rim so it
 * can sit in front of whatever is inside. `binds` are the x positions of rattan lashings.
 */
export function steamer(q: Px, cx: number, cy: number, rx: number, ry: number, depth: number, which: "back" | "front", binds: readonly number[] = [], lipWidth?: number): void {
  const lip = lipWidth ?? Math.max(1.5, rx * 0.08);
  const inRim = (x: number, y: number) => inEllipse(cx, cy, rx, ry, x, y);
  // The rim reads as a strip with a visible top face, so its near edge keeps most of its width.
  const inWell = (x: number, y: number) => inEllipse(cx, cy + 0.4, rx - lip, ry - lip * 0.75 - 0.4, x, y);
  if (which === "back") {
    for (let y = Math.floor(cy); y <= Math.ceil(cy + ry + depth); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const inBand = inEllipse(cx, cy + depth, rx, ry, x, y) || (y + 0.5 >= cy && y + 0.5 < cy + depth && x + 0.5 >= cx - rx && x + 0.5 <= cx + rx);
        if (!inBand) continue;
        const u = (x + 0.5 - cx) / rx;
        // Cylinder light across the band, then a basket weave of strips riding over and under.
        let i = u < 0.1 ? 3 : u < 0.6 ? 2 : 1;
        // Woven strips two pixels tall; each passes over and under the uprights every four pixels.
        const row = Math.floor((y - Math.floor(cy)) / 2), under = Math.floor((x + (row % 2) * 2) / 4) % 2 === 0;
        if (under) i -= 1;
        if ((y - Math.floor(cy)) % 2 === 1 && !under) i = Math.max(0, i - 1) + (u < -0.3 ? 1 : 0);
        q.px(x, y, BAMBOO[Math.max(0, Math.min(4, i))]);
      }
    // Shadow under the rim's lip, a lit bead at the foot.
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      let top = -1, foot = -1;
      for (let y = 0; y < q.h; y++) { if (inRim(x, y)) top = y; if (inEllipse(cx, cy + depth, rx, ry, x, y)) foot = y; }
      const u = (x + 0.5 - cx) / rx;
      if (top >= 0) q.over(() => q.px(x, top + 1, "bamboo1").px(x, top + 2, "bamboo2"));
      if (foot >= 0) q.over(() => q.px(x, foot - 1, u < 0.35 ? "bamboo4" : "bamboo3").px(x, foot, u < 0.35 ? "bamboo3" : "bamboo2"));
    }
    // Rattan lashings: short diagonal wraps down the band.
    for (const bx of binds) {
      let top = -1;
      for (let y = 0; y < q.h; y++) if (inRim(bx, y)) top = y;
      for (let j = 1; j < depth + 1; j++) {
        const x = bx + (j % 3 === 0 ? 1 : 0);
        q.over(() => q.px(x, top + j, j % 3 === 2 ? "bamboo2" : "bamboo4").px(x + 1, top + j, j % 3 === 2 ? "bamboo1" : "bamboo3"));
      }
    }
  }
  // Rim: a bent strip, its top lit along the back-left, shaded at the front-right.
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (!inRim(x, y) || inWell(x, y)) continue;
      if (which === "front" && y + 0.5 < cy) continue;
      const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry;
      const inner = inEllipse(cx, cy + 0.2, rx - lip * 0.5, ry - lip * 0.4, x, y);
      let c: Color = v < 0 ? (u < 0.35 ? "bamboo5" : "bamboo4") : u < 0.5 ? "bamboo4" : "bamboo3";
      if (inner && v > 0) c = u < 0.5 ? "bamboo5" : "bamboo4";
      if (inner && v <= 0) c = "bamboo3";
      q.px(x, y, c);
    }
  if (which === "back") for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (inWell(x, y)) q.px(x, y, inEllipse(cx + 1.5, cy + 1.5, rx - lip - 1.5, ry - lip - 1, x, y) ? "bamboo2" : "bamboo1");
}

export type TumblerOptions = {
  /** Px of empty glass between the rim and the milk. */
  headroom: number;
  /** Px of thick solid glass at the bottom. */
  base: number;
  /** Ridge spacing for the ribbed glass, in px. */
  ribs: number;
  /** [shade, mid, light, highlight] of what fills the glass. */
  fill: Ramp;
};

/**
 * A tall ribbed glass tumbler, slightly tapered, rim at `top` and foot at `bottom` (pixel rows),
 * radii rxTop/rxBot, ellipse depth ry. Filled to `headroom` below the rim. The glass itself is
 * translucent (`p.faded`); what it holds is solid. Draws onto its own canvas, outlined.
 */
export function tumbler(w: number, h: number, cx: number, top: number, bottom: number, rxTop: number, rxBot: number, ry: number, o: TumblerOptions): Px {
  const q = new Px(w, h);
  const rxAt = (y: number) => rxTop + (rxBot - rxTop) * Math.max(0, Math.min(1, (y - top) / (bottom - top)));
  const ryBot = ry * (rxBot / rxTop);
  const inside = (x: number, y: number) => {
    const py = y + 0.5;
    if (py >= top && py <= bottom && Math.abs(x + 0.5 - cx) <= rxAt(py)) return true;
    return inEllipse(cx, top, rxTop, ry, x, y) || inEllipse(cx, bottom, rxBot, ryBot, x, y);
  };
  const milkTop = top + o.headroom, milkBottom = bottom - o.base;
  const [shade, mid, light, high] = o.fill;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!inside(x, y)) continue;
    const py = y + 0.5, r = rxAt(py) - 1, u = (x + 0.5 - cx) / r;
    const inMilk = Math.abs(u) <= 1 && py >= milkTop && (py <= milkBottom || inEllipse(cx, milkBottom, r, ryBot - 0.4, x, y));
    if (inMilk) {
      let c = u < -0.55 ? light : u < 0.3 ? mid : shade;
      // Ribs: each ridge of the glass bends the light, a step lighter on the sunny side, darker round the back.
      const rib = Math.round((u + 1) * r) % o.ribs === 0;
      if (rib) c = u < 0.3 ? (c === mid ? light : high) : u < 0.7 ? shade : mid;
      if (u < -0.62 && u > -0.85) c = high;
      q.px(x, y, c);
    } else q.faded(py > milkBottom ? 0.6 : 0.35, () => q.px(x, y, py > milkBottom ? "blue6" : "blue6"));
  }
  // The milk's surface: shade under the far rim, then a sheen.
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const r = rxAt(milkTop) - 1;
    if (!inEllipse(cx, milkTop, r, ry - 0.5, x, y)) continue;
    q.px(x, y, inEllipse(cx + r * 0.12, milkTop + ry * 0.35, r, ry - 0.5, x, y) ? mid : shade);
  }
  // Glass: a long highlight down the left, the rim's lip (solid in front, faint behind), the thick base.
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!inside(x, y)) continue;
    const py = y + 0.5, d = x + 0.5 - (cx - rxAt(py));
    if (d > 1 && d < 2.2 && py > top + 1 && py < bottom - 1) q.faded(0.85, () => q.px(x, y, "white"));
    const onRim = inEllipse(cx, top, rxTop, ry, x, y) && !inEllipse(cx, top, rxTop - 1, ry - 1, x, y);
    if (onRim) py > top ? q.px(x, y, "white") : q.faded(0.6, () => q.px(x, y, "white"));
    if (py > milkBottom + 1 && py < bottom && Math.abs(x + 0.5 - cx) < rxBot - 2 && Math.round(py) === Math.round(bottom - 1)) q.faded(0.7, () => q.px(x, y, "white"));
  }
  // Outline: the glass edge, darker round the shaded side and foot.
  const hits: [number, number, Color][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (q.solid(x, y)) continue;
    const r = q.solid(x - 1, y), l = q.solid(x + 1, y), u = q.solid(x, y + 1), d = q.solid(x, y - 1);
    if (!(r || l || u || d)) continue;
    hits.push([x, y, (l || u) && !r && !d && x < cx ? "steel3" : "steel2"]);
  }
  for (const [x, y, c] of hits) q.px(x, y, c);
  return q;
}
