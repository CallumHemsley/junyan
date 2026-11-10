/**
 * The town's canvas awnings (`awning` props), one per shopfront, each hung from the fascia height its
 * building leaves for it (`AWNING_MOUNT`). The sprite is the footprint's width and rises from the
 * pavement line to the mount; everything below the valance is empty except the awning's soft shadow
 * on the wall, which is translucent so the building shows through it.
 *
 * Seen from above and in front: the canvas's sloping top face in vertical stripes, the front bar's
 * lit roll, the valance hanging off it. Every awning sags between its arms.
 *
 * - `town/breakfast-awning`: 早安小馆's, bottle green and cream like the edge seen from inside, scalloped,
 *   on brass arms; only a little tired.
 * - `town/tea-awning`: the tea house's, a blue-and-cream canvas bleached by summers, scalloped, sagging
 *   hard where rain pools; tied back with rope at the ends.
 * - `town/workshop-canopy`: ochre and dust-grey duck over the roller door, a straight hem, oil on it,
 *   and a square patch of green canvas stitched over a tear.
 */
import { defineSprites, hash, type Color, type Px } from "../../kit/index.ts";
import { AWNING_MOUNT, perProp, step } from "./_front.ts";

type Canvas = { a: Color; b: Color };
type Style = {
  stripes: Canvas; sw: number; inset: number; sag: number; arms: number;
  edge: "scallop" | "straight"; bar: [Color, Color, Color]; bleach: number; patch?: boolean; ropes?: boolean; oil?: boolean;
};

const STYLES: Record<string, Style> = {
  "town.breakfast-awning": { stripes: { a: "jade2", b: "cream4" }, sw: 8, inset: 10, sag: 1, arms: 4, edge: "scallop", bar: ["gold1", "gold3", "gold4"], bleach: 0.1 },
  "town.tea-awning": { stripes: { a: "blue4", b: "cream4" }, sw: 10, inset: 0, sag: 5, arms: 3, edge: "scallop", bar: ["bamboo1", "bamboo3", "bamboo4"], bleach: 0.45, ropes: true },
  "town.workshop-canopy": { stripes: { a: "bamboo3", b: "stone3" }, sw: 12, inset: 0, sag: 3, arms: 3, edge: "straight", bar: ["steel1", "steel3", "steel4"], bleach: 0.25, patch: true, oil: true },
};

function draw(p: Px, id: string, w: number, H: number) {
  const s = STYLES[id] ?? STYLES["town.breakfast-awning"];
  const m = AWNING_MOUNT[id] ?? { mount: H - 3, depth: 14, drop: 7 };
  const r0 = H - 1 - m.mount;
  const x0 = s.inset, x1 = w - s.inset, span = x1 - x0;
  const armAt = Array.from({ length: s.arms + 1 }, (_, k) => x0 + Math.round((k * (span - 1)) / s.arms));
  const sagAt = (i: number) => {
    for (let k = 0; k < armAt.length - 1; k++) if (i >= armAt[k] && i <= armAt[k + 1]) {
      const t = (i - armAt[k]) / (armAt[k + 1] - armAt[k]);
      return Math.round(s.sag * Math.sin(Math.PI * t));
    }
    return 0;
  };
  const stripeOf = (i: number) => (Math.floor((i - x0) / s.sw) % 2 === 0 ? s.stripes.a : s.stripes.b);
  const bottoms: number[] = [];
  for (let i = x0; i < x1; i++) {
    const c = stripeOf(i);
    const sag = sagAt(i);
    const front = r0 + m.depth + sag;
    const k = (i - x0) % s.sw;
    // Top face: tucked into shade under the fascia, sunlit across the slope, bleached toward the roll.
    for (let y = r0; y < front; y++) {
      const u = (y - r0) / Math.max(1, front - r0);
      let col: Color = u < 0.14 ? step(c, -1) : c;
      // Sun-bleached toward the roll: whole rows, so it reads as fading, not speckle.
      if (s.bleach > 0.2 && u > 1 - s.bleach) col = step(c, 1);
      // The canvas bellies between the arms: a soft fold shadow where it sags deepest.
      if (sag >= 3 && u > 0.7 && k === 0) col = step(c, -1);
      p.px(i, y, col);
    }
    // The roll over the front bar: two lit rows.
    p.px(i, front, step(c, 1));
    p.px(i, front + 1, c === "cream4" ? "cream5" : step(c, 1));
    // Valance: the front face, a step darker, with a seam row under the roll.
    let bottom = front + 1 + m.drop;
    if (s.edge === "scallop") {
      const half = s.sw / 2, d = (k + 0.5 - half) / half;
      bottom += Math.round(3 * Math.sqrt(Math.max(0, 1 - d * d))) - 1;
    }
    for (let y = front + 2; y <= bottom; y++) {
      let col = step(c, -1);
      if (y === front + 2) col = step(c, -2);
      else if (y === bottom) col = step(c, -2);
      else if (k === s.sw - 1 && s.edge === "scallop") col = step(c, -2);
      p.px(i, y, col);
    }
    bottoms.push(bottom);
  }
  // The fixing: a rail along the mount with brackets at the arms.
  p.hline(x0, r0 - 2, span, s.bar[1]).hline(x0, r0 - 1, span, s.bar[0]).hline(x0, r0 - 3, span, s.bar[2]);
  for (const ax of armAt) p.rect(Math.min(ax, x1 - 3), r0 - 3, 3, 3, s.bar[1]).px(Math.min(ax, x1 - 3), r0 - 3, s.bar[2]);
  // Ends: the end frame's dark edge.
  for (const ex of [x0, x1 - 1]) for (let y = r0; y <= bottoms[ex - x0]; y++) p.px(ex, y, step(p.get(ex, y) ?? "ink", -2));
  if (s.ropes) {
    // Rope ties at each end, knotted round the eave post out of frame.
    for (const [ex, dir] of [[x0 + 2, 1], [x1 - 3, -1]] as const) {
      const by = bottoms[ex - x0];
      for (let j = 0; j < 9; j++) p.px(ex + Math.round(dir * j * 0.4), by + 1 + j, j % 3 === 2 ? "bamboo2" : "bamboo3");
    }
    // Rain has pooled in the deepest sag: a darker blotch.
    const deep = armAt[1] + Math.round((armAt[2] - armAt[1]) / 2);
    for (let i = -9; i <= 9; i++) for (let y = r0 + m.depth - 4; y < r0 + m.depth + sagAt(deep + i); y++)
      if (Math.abs(i) < 2 * (y - (r0 + m.depth - 5))) p.px(deep + i, y, step(p.get(deep + i, y) ?? "cream3", -1));
  }
  if (s.oil) {
    // Oil and soot from the work beneath: a few broad smudges along the hem, where hands pull it.
    for (let i = x0 + 30; i < x1 - 40; i += 70) {
      const sx = i + Math.floor(hash(i, 9, 3) * 30);
      for (let k = 0; k < 9; k++) { const b = bottoms[sx + k - x0]; for (let y = b - 2 - (k > 1 && k < 7 ? 1 : 0); y < b; y++) p.px(sx + k, y, step(p.get(sx + k, y) ?? "stone2", -1)); }
    }
  }
  if (s.patch) {
    // A square of jade duck stitched over a tear, its stitches in pale thread.
    const px0 = x0 + Math.round(span * 0.62), py0 = r0 + 3;
    p.rect(px0, py0, 18, 9, "jade4").hline(px0, py0, 18, "jade5").hline(px0, py0 + 8, 18, "jade3").vline(px0 + 17, py0, 9, "jade3");
    for (let i = 1; i < 18; i += 2) { p.px(px0 + i, py0 + 1, "cream4"); p.px(px0 + i, py0 + 7, "cream4"); }
    for (let j = 2; j < 7; j += 2) { p.px(px0 + 1, py0 + j, "cream4"); p.px(px0 + 16, py0 + j, "cream4"); }
  }
  // The awning's soft shadow on the wall below it, cast down and to the right.
  p.faded(0.2, () => {
    for (let i = x0 + 3; i < x1 + 3 && i < w; i++) {
      const b = bottoms[Math.min(span - 1, i - x0 - 3)] ?? r0;
      for (let y = b + 1; y < b + 7 && y < H; y++) if (!p.solid(i, y)) p.px(i, y, "ink");
    }
  });
}

export default defineSprites(perProp("awning", (prop, w, h) => {
  const m = AWNING_MOUNT[prop.id];
  const H = Math.max(h, (m?.mount ?? h) + 4);
  return { h: H, anchor: [Math.round(w / 2), H - 1] as const, draw: (p: Px) => draw(p, prop.id, w, H) };
}));
