/**
 * The canopy generator was rewritten for speed (ticket 0203). This keeps the original, Map-based
 * version verbatim as the reference and checks the fast one draws the same pixels across crowns,
 * foliage, wind shifts, drawing modes, clips, opacity and art already on the canvas.
 */
import { describe, expect, it } from "vitest";
import { Px, hash, type Color } from "../../kit/index.ts";
import { CAMPHOR_CLUSTERS, FIG_LEAVES, PLANE_CLUSTERS, canopy, crownClumps, massClumps, type Clump, type Foliage } from "./_helpers.ts";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ── the original canopy, verbatim (before ticket 0203) ──────────────────────────
/** Light on a sphere lit from the upper left, 0 (shade) .. 1 (full sun). */
function sphereLight(nx: number, ny: number): number {
  const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  return clamp((-0.55 * nx - 0.7 * ny + 0.45 * nz + 0.35) / 1.45, 0, 1);
}

/**
 * Draw foliage clumps back to front. Each clump is shaded as a ball within the crown (`crown`, the
 * whole canopy's ellipse, darkens the underside and lights the upper-left), gets a scalloped rim
 * from the leaves that overhang it, and cuts a dark seam into the clumps already drawn behind it.
 * `dx` shifts clumps sideways by their `sway` for a wind frame.
 */
function canopyReference(
  p: Px, clumps: readonly Clump[], foliage: Foliage,
  crown: { x: number; y: number; rx: number; ry: number }, options: { seed?: number; dx?: number } = {},
): Px {
  const { ramp, leaves, step } = foliage;
  const n = ramp.length;
  const seed = options.seed ?? 1;
  // Which group drew each pixel: clumps of one mass melt together, masses cut seams into each other.
  const owner = new Map<number, number>();
  // Value structure per mass: a yellow-green rim on its sunny upper left (the ramp's last tone,
  // used nowhere else), a mid body, and a dark underside; the whole crown darkens to the lower right.
  const body = n - 2; // highest tone a leaf may take away from the rim
  const light = (c: Clump, x: number, y: number) => {
    const m = c.mass ?? c;
    const mu = (x - m.x) / m.rx, mv = (y - m.y) / m.ry;
    const local = sphereLight((x - c.x) / c.rx, (y - c.y) / c.ry);
    const massL = sphereLight(mu * 0.95, mv * 0.95);
    const global = sphereLight((x - crown.x) / crown.rx * 0.9, (y - crown.y) / crown.ry * 0.9);
    let t = 0.2 * local + 0.5 * massL + 0.3 * global + (c.shift ?? 0) * 0.12;
    if (mv > 0.3) t -= (mv - 0.3) * 0.55;
    const rim = (c.shift ?? 0) >= 0 && mu * mu + mv * mv > 0.55 && mu * 0.55 + mv * 0.85 < -0.5 && global > 0.35;
    return { t: clamp(t, 0, 0.999), rim };
  };
  const toneAt = (c: Clump, x: number, y: number) => {
    const { t, rim } = light(c, x, y);
    return rim ? n - 1 : clamp(1 + Math.floor(Math.pow(t, 1.15) * body * 1.08), 1, body);
  };
  clumps.forEach((c, ci) => {
    const off = Math.round((c.sway ?? 0) * (options.dx ?? 0));
    const cs = (c.seed ?? ci * 31) + seed * 977;
    const cells = new Map<number, Color>();
    const key = (x: number, y: number) => (y + 512) * 4096 + (x + 512);
    // Body: a step darker than the leaves, so gaps read as depth.
    for (let y = Math.floor(c.y - c.ry); y <= Math.ceil(c.y + c.ry); y++)
      for (let x = Math.floor(c.x - c.rx); x <= Math.ceil(c.x + c.rx); x++) {
        const u = (x + 0.5 - c.x) / (c.rx - 0.5), v = (y + 0.5 - c.y) / (c.ry - 0.5);
        if (u * u + v * v > 1) continue;
        cells.set(key(x + off, y), ramp[Math.max(1, Math.min(body, toneAt(c, x, y)) - 1)]);
      }
    // Leaves on a jittered grid, local to the clump so the texture rides along when it sways.
    const [sx, sy] = step;
    for (let j = -1, gy = c.y - c.ry - 2; gy <= c.y + c.ry + 1; j++, gy += sy)
      for (let gx = c.x - c.rx - 3 + ((j & 1) ? sx / 2 : 0); gx <= c.x + c.rx + 1; gx += sx) {
        const lx = Math.round(gx - c.x), ly = Math.round(gy - c.y);
        const h = hash(lx, ly, cs);
        const leaf = leaves[Math.floor(hash(ly, lx, cs + 5) * leaves.length)];
        const lw = leaf[0].length, lh = leaf.length;
        const x0 = Math.round(gx + (hash(lx, ly, cs + 1) - 0.5) * 2), y0 = Math.round(gy + (hash(lx, ly, cs + 2) - 0.5) * 2);
        const cx = x0 + lw / 2, cy = y0 + lh / 2;
        const u = (cx - c.x) / c.rx, v = (cy - c.y) / c.ry;
        if (u * u + v * v > 1.02) continue;
        const base = toneAt(c, cx, cy);
        const tone = base - (h < 0.06 ? 1 : 0);
        const cap = base === n - 1 ? n - 1 : body;
        const odd = foliage.odd && hash(lx, ly, cs + 9) < foliage.odd.chance ? foliage.odd.ramp : null;
        const flip = hash(lx, ly, cs + 3) < 0.5;
        if (foliage.outlineLeaves) {
          const on = (ri: number, rj: number) => rj >= 0 && rj < lh && ri >= 0 && ri < lw && leaf[rj][ri] !== undefined && leaf[rj][ri] !== ".";
          for (let rj = -1; rj <= lh; rj++) for (let ri = -1; ri <= lw; ri++) {
            if (on(ri, rj)) continue;
            if (on(ri + 1, rj) || on(ri - 1, rj) || on(ri, rj + 1) || on(ri, rj - 1))
              cells.set(key(x0 + (flip ? lw - 1 - ri : ri) + off, y0 + rj), ramp[Math.max(0, Math.min(1, base - 3))]);
          }
        }
        leaf.forEach((row, rj) => {
          for (let ri = 0; ri < row.length; ri++) {
            const ch = row[ri];
            if (ch === ".") continue;
            const t = clamp(tone + Number(ch) - 2, 1, cap);
            const color = odd ? odd[clamp(t - 1, 0, odd.length - 1)] : ramp[t];
            cells.set(key(x0 + (flip ? lw - 1 - ri : ri) + off, y0 + rj), color);
          }
        });
      }
    // The seam: where this clump overlaps the ones behind, a dark rim on its lower right, a softer
    // one on its upper left. Only over existing art, so the silhouette is left to the final outline.
    const group = c.group ?? -1 - ci;
    const seams: [number, number, Color][] = [];
    for (const k of cells.keys()) {
      const x = (k % 4096) - 512, y = Math.floor(k / 4096) - 512;
      for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]] as const) {
        const nk = key(x + dx, y + dy);
        if (!cells.has(nk) && owner.get(nk) !== group) seams.push([x + dx, y + dy, dx + dy > 0 ? ramp[0] : ramp[1]]);
      }
    }
    p.over(() => { for (const [x, y, col] of seams) p.px(x, y, col); });
    for (const [k, col] of cells) { p.px((k % 4096) - 512, Math.floor(k / 4096) - 512, col); owner.set(k, group); }
  });
  return p;
}


// ────────────────────────────────────────────────────────────────────────────────

const LEAF: Color[] = ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
const foliages: Foliage[] = [
  { ramp: LEAF, leaves: PLANE_CLUSTERS, step: [5, 4] },
  { ramp: ["jade1", "jade2", "jade3", "jade4", "jade5"], leaves: CAMPHOR_CLUSTERS, step: [4, 3], odd: { ramp: ["gold2", "gold3", "gold4"], chance: 0.12 } },
  { ramp: LEAF, leaves: FIG_LEAVES, step: [6, 5], outlineLeaves: true },
];

type Case = { name: string; w: number; h: number; draw: (p: Px, fn: typeof canopy) => void };
function cases(): Case[] {
  const out: Case[] = [];
  let k = 0;
  for (const foliage of foliages) for (const size of [[48, 44], [120, 104]] as const) for (const dx of [0, 2, -3]) {
    const [w, h] = size, seed = 11 + k++;
    const crown = { x: w / 2, y: h / 2, rx: w * 0.42, ry: h * 0.4 };
    const masses = [0, 1, 2].map((i) => ({ x: crown.x + (hash(i, 1, seed) - 0.5) * crown.rx, y: crown.y + (hash(i, 2, seed) - 0.5) * crown.ry, rx: crown.rx * 0.5, ry: crown.ry * 0.45 }));
    const inner: Clump[] = crownClumps({ ...crown, rx: crown.rx * 0.66, ry: crown.ry * 0.66 }, Math.max(4, w / 10), seed + 40).map((c) => ({ ...c, shift: -3, sway: 0, group: 99 }));
    const outer = massClumps(crown, masses, Math.max(4, w / 9), seed);
    const art = (p: Px) => { p.rect(Math.round(w * 0.45), Math.round(h * 0.5), 6, h, "wood2"); p.rect(2, 2, 8, 5, "stone3"); };
    out.push({ name: "plain " + k + " dx " + dx, w, h, draw: (p, fn) => { art(p); fn(p, inner, foliage, crown, { seed: seed + 40 }); fn(p, outer, foliage, crown, { seed: seed + 3, dx }); } });
    out.push({ name: "over " + k, w, h, draw: (p, fn) => { art(p); p.over(() => fn(p, outer, foliage, crown, { seed, dx })); } });
    out.push({ name: "under " + k, w, h, draw: (p, fn) => { art(p); p.under(() => fn(p, outer, foliage, crown, { seed, dx })); } });
    out.push({ name: "clip " + k, w, h, draw: (p, fn) => { art(p); p.clip(3, 4, w - 9, h - 12, () => fn(p, outer, foliage, crown, { seed, dx })); } });
    out.push({ name: "opacity " + k, w, h, draw: (p, fn) => { p.opacity = 0.6; fn(p, outer, foliage, crown, { seed, dx }); } });
  }
  return out;
}

const same = (a: Px, b: Px) => Buffer.from(a.ink).equals(Buffer.from(b.ink)) && Buffer.from(a.alpha).equals(Buffer.from(b.alpha));

describe("canopy", () => {
  it("draws exactly what the original drew", () => {
    for (const c of cases()) {
      const fast = new Px(c.w, c.h), slow = new Px(c.w, c.h);
      c.draw(fast, canopy);
      c.draw(slow, canopyReference as typeof canopy);
      expect(same(fast, slow), c.name).toBe(true);
    }
  });

  it("draws the same again once its sway cache holds the crown", () => {
    for (const c of cases().slice(0, 6)) {
      const once = new Px(c.w, c.h), twice = new Px(c.w, c.h);
      c.draw(once, canopy);
      c.draw(twice, canopy);
      expect(same(once, twice), c.name).toBe(true);
    }
  });
});
