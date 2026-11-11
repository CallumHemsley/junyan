/**
 * The courtyard's kitchen gardens and entry planters: brick raised beds the neighbours share (scallions,
 * bok choy, chillies, herbs, beans and a loofah on bamboo trellises) and the two troughs either side of
 * the moon-gate entrance. One sprite per prop, footprint-sized, anchored on its bottom-centre; a bed's
 * soil fills its footprint seen from above, its brick front face below, its plants rising above.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { mound, stamp, sticker } from "../plant/_helpers.ts";
import { art, autoOutline, seedOf, townFoot, townFrame } from "./_helpers.ts";

/** Height of a bed's brick front face, art px. */
const WALL = 12;
/** Room above the bed for its tallest plants and trellis. */
const PLANTS = 40;

type Frame = ReturnType<typeof townFrame>;
/** The soil rectangle seen from above, in sprite px. */
type Soil = { x: number; y: number; w: number; h: number };

// ── the bed ────────────────────────────────────────────────────────────────────

/** Grey-blue and red bricks laid in courses, a lit coping, soil inside; moss at the foot, a missing brick, salt bloom. */
function brickBed(p: Px, f: Frame, seed: number): Soil {
  const W = f.w, G = f.gy;
  const top = G - f.depth + 1 - WALL, front = G - WALL + 1;
  // Top: coping ring of bricks round the soil.
  p.rect(0, top, W, front - top, "rose3");
  p.hline(0, top, W, "rose4").vline(0, top, front - top, "rose4");
  for (let x = 4; x < W; x += 8) { p.px(x, top + 1, "stone3"); p.px(x + 2, front - 2, "stone3"); }
  const soil = { x: 4, y: top + 4, w: W - 8, h: front - top - 7 };
  p.rect(soil.x, soil.y, soil.w, soil.h, "brown2");
  p.hline(soil.x, soil.y, soil.w, "brown1");
  p.over(() => { p.speckle(soil.x, soil.y + 1, soil.w, soil.h - 1, "brown3", 0.16, seed); p.speckle(soil.x, soil.y + 1, soil.w, soil.h - 1, "wood1", 0.05, seed + 1); });
  // Front face: courses three high, joints staggered, each brick its own tone.
  for (let j = 0; j < WALL; j++) {
    const course = Math.floor(j / 3), mortar = j % 3 === 2;
    for (let x = 0; x < W; x++) {
      const bx = Math.floor((x + (course % 2) * 4) / 8);
      const joint = (x + (course % 2) * 4) % 8 === 7;
      const tone = hash(bx, course, seed);
      const c: Color = mortar || joint ? "stone3" : tone < 0.18 ? "steel3" : tone < 0.6 ? "rose3" : "rose2";
      p.px(x, front + j, c);
    }
  }
  p.hline(0, front, W, "rose4");
  p.vline(W - 1, front, WALL, "rose1");
  // A brick missing from the second course, and white salt bloom, and moss along the foot.
  const mx = 8 + Math.floor(hash(1, 2, seed) * (W - 20));
  p.rect(mx, front + 3, 7, 2, "wood1");
  p.over(() => {
    for (let x = 0; x < W; x++) if (hash(x, 9, seed) < 0.35) p.px(x, G, hash(x, 8, seed) < 0.5 ? "leaf2" : "leaf3");
    for (let k = 0; k < 3; k++) { const sx = Math.floor(hash(k, 7, seed) * (W - 6)); p.hline(sx, front + 6 + k, 4, "cream3"); }
  });
  return soil;
}

// ── plants ─────────────────────────────────────────────────────────────────────

/** A tuft of scallions, foot at (x, base). */
function scallions(p: Px, x: number, base: number, seed: number): void {
  sticker(p, x - 3, base - 14, 8, 15, (q) => {
    for (let i = 0; i < 4; i++) {
      const sx = 1 + i * 2, top = 1 + Math.floor(hash(i, 1, seed) * 5), lean = [-1, 0, 1, 1][i];
      q.line(sx, 14, sx, top + 4, i % 2 ? "leaf2" : "leaf3");
      q.line(sx, top + 4, sx + lean, top, i % 2 ? "leaf3" : "leaf4");
      q.px(sx, 13, "cream4");
    }
  });
}

/** A chilli bush with a few hanging pods, most still green, two turned red. */
function chilli(p: Px, x: number, base: number, seed: number): void {
  sticker(p, x - 6, base - 12, 12, 12, (q) => {
    q.vline(6, 7, 5, "leaf2");
    mound(q, 6, 5, 5.5, 4.5, ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4"], seed);
    for (let k = 0; k < 4; k++) {
      const cx = 2 + Math.floor(hash(k, 1, seed) * 8), cy = 4 + Math.floor(hash(k, 2, seed) * 4);
      art(q, cx, cy, ["c", "C"], k < 2 ? { c: "red3", C: "red2" } : { c: "leaf4", C: "leaf3" });
    }
  });
}

/** Perilla (紫苏): broad crinkled leaves, purple on top. */
function perilla(p: Px, x: number, base: number, seed: number): void {
  sticker(p, x - 6, base - 13, 12, 13, (q) => {
    q.vline(6, 6, 7, "plum2");
    mound(q, 6, 5, 5.5, 5, ["plum1", "plum1", "plum2", "plum3", "plum4"], seed, [["33", "21"], [".3", "32"]], [3, 2]);
  }, { plum: "plum1" });
}

/** Mint, low and bright. */
function mint(p: Px, x: number, base: number, seed: number): void {
  sticker(p, x - 6, base - 8, 12, 8, (q) => mound(q, 6, 4, 6, 3.5, ["leaf2", "leaf2", "leaf3", "leaf4", "leaf5"], seed, [["3", "2"], ["33", "2."]], [2, 2]));
}

/** Coriander: lacy and pale. */
function coriander(p: Px, x: number, base: number, seed: number): void {
  sticker(p, x - 5, base - 10, 10, 10, (q) => {
    for (let i = 0; i < 4; i++) {
      const sx = 1 + i * 2 + (i > 1 ? 1 : 0), top = 2 + Math.floor(hash(i, 3, seed) * 3);
      q.line(5, 9, sx, top + 2, "leaf3");
      art(q, sx - 1, top, [".4.", "434"].map((r) => r.replace(/4/g, "a").replace(/3/g, "b")), { a: "leaf4", b: "leaf3" });
    }
  });
}

/** A bok choy seen from above in the bed: a rosette of dark spoon leaves round a pale heart. */
function choy(p: Px, x: number, base: number, flip: boolean): void {
  sticker(p, x - 4, base - 8, 8, 8, (q) => stamp(q, 0, 0, flip ? [
    ".2332..",
    "2344321",
    "34cc432",
    "24cc443",
    "2344432",
    ".23322.",
    "..111..",
  ] : [
    "..2332.",
    "1234432",
    "234cc43",
    "344cc42",
    "2344432",
    ".22332.",
    "..111..",
  ], ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"], { legend: { c: "jade6" } }));
}

/**
 * A bamboo trellis along the back of a bed: uprights tied to crossbars with wire, a vine climbing it
 * with leaves, and what it carries (`long beans` hang in pairs; a `loofah` hangs fat and has yellow flowers).
 */
function trellis(p: Px, x0: number, x1: number, base: number, height: number, crop: "beans" | "loofah", seed: number): void {
  const top = base - height;
  for (let x = x0; x <= x1; x += 9) { p.vline(x, top, height, "bamboo3"); p.vline(x + 1, top, height, "bamboo2"); p.px(x, top, "bamboo5"); }
  for (const y of [top + 3, top + Math.round(height * 0.55)]) { p.hline(x0, y, x1 - x0 + 2, "bamboo4"); p.hline(x0, y + 1, x1 - x0 + 2, "bamboo2"); }
  sticker(p, x0 - 2, top - 4, x1 - x0 + 6, height + 2, (q) => {
    const ox = x0 - 1, oy = top - 3;
    // The vine: a wandering stem along the crossbars and up the uprights, heart leaves on it.
    for (let x = x0; x <= x1 + 2; x++) {
      const y = top + 3 + Math.round(Math.sin(x / 5 + seed) * 2) + (x % 18 < 9 ? 0 : Math.round(height * 0.3));
      q.px(x - ox, y - oy, "leaf2");
      if (hash(x, 1, seed) < 0.38) art(q, x - ox - 1, y - oy - 2, [".3.", "334", ".2."].map((r) => r.replace(/4/g, "c").replace(/3/g, "b").replace(/2/g, "a")), { a: "leaf2", b: "leaf3", c: "leaf4" });
    }
    for (let k = 0; k < Math.round((x1 - x0) / 7); k++) {
      const hx = x0 + 3 + Math.floor(hash(k, 4, seed) * (x1 - x0 - 4)) - ox, hy = top + 6 + Math.floor(hash(k, 5, seed) * height * 0.4) - oy;
      if (crop === "beans") { q.vline(hx, hy, 9, "leaf3"); q.vline(hx + 1, hy + 1, 8, "leaf4"); }
      else if (k % 3 === 0) art(q, hx - 1, hy, [".s.", "lLl", "lLl", "lLl", "lLl", "lll", ".l."], { s: "leaf2", l: "leaf3", L: "leaf4" });
      else art(q, hx, hy, ["yY", "Yy"], { y: "gold3", Y: "gold4" });
    }
  }, { gold: "wood1" });
}

// ── the four beds ──────────────────────────────────────────────────────────────

type Planting = (p: Px, soil: Soil, f: Frame, seed: number) => void;

/** Lay plants in rows across the soil, back row first: `rows` of plant drawers, each spaced `dx` apart. */
function rows(p: Px, soil: Soil, list: readonly { plant: (p: Px, x: number, base: number, k: number) => void; dx: number }[]): void {
  list.forEach((row, r) => {
    const base = Math.round(soil.y + 4 + ((soil.h - 6) * (r + 0.5)) / list.length);
    let k = 0;
    // Hand-planted: each a pixel or so off the line, never a grid.
    for (let x = soil.x + 5 + (r % 2) * Math.round(row.dx / 2); x < soil.x + soil.w - 4; x += row.dx, k++)
      row.plant(p, x + Math.round((hash(k, r, soil.w) - 0.5) * 3), base + Math.round((hash(r, k, soil.h) - 0.5) * 3), k);
  });
}

/**
 * The herb island in the middle of the yard, everybody's: long beans up a trellis at the back, a row of
 * chillies, three of bok choy, scallions and garlic chives at the front, a trowel left in the soil and a
 * blank plant label on a chopstick.
 */
const island: Planting = (p, soil, _f, seed) => {
  trellis(p, soil.x + 2, soil.x + soil.w - 4, soil.y + 6, 36, "beans", seed);
  rows(p, { ...soil, y: soil.y + 10, h: soil.h - 10 }, [
    { plant: (q, x, b, k) => chilli(q, x, b, seed + k), dx: 13 },
    { plant: (q, x, b, k) => choy(q, x, b, k % 2 === 0), dx: 10 },
    { plant: (q, x, b, k) => choy(q, x, b, k % 2 === 1), dx: 10 },
    { plant: (q, x, b, k) => choy(q, x, b, k % 2 === 0), dx: 10 },
    { plant: (q, x, b, k) => scallions(q, x, b, seed + k * 3), dx: 8 },
    { plant: (q, x, b, k) => scallions(q, x, b, seed + k * 5 + 1), dx: 8 },
  ]);
  const ty = soil.y + soil.h - 8;
  art(p, soil.x + soil.w - 14, ty, ["..ss", ".sS.", "wW..", "w..."], { s: "steel3", S: "steel5", w: "wood3", W: "wood4" });
  p.vline(soil.x + 8, ty - 8, 9, "wood3");
  art(p, soil.x + 6, ty - 12, ["ccccc", "cCCCc", "ccccc"], { c: "cream3", C: "white" });
};

/** The bed along the central house's wall: a loofah up a trellis, yellow flowers and one fat fruit, and scallions in front. */
const wallBed: Planting = (p, soil, _f, seed) => {
  trellis(p, soil.x + 2, soil.x + soil.w - 4, soil.y + 6, 38, "loofah", seed);
  rows(p, { ...soil, y: soil.y + 8, h: soil.h - 8 }, [
    { plant: (q, x, b, k) => scallions(q, x, b, seed + k), dx: 8 },
    { plant: (q, x, b, k) => (k % 3 === 1 ? chilli(q, x, b, seed + k) : scallions(q, x, b, seed + k * 7)), dx: 10 },
  ]);
};

/** The herb bed by the stone court: perilla, mint, coriander, a chilli, for the neighbours' kitchens. */
const herbBed: Planting = (p, soil, _f, seed) => {
  rows(p, soil, [
    { plant: (q, x, b, k) => [perilla, chilli, perilla, coriander][k % 4](q, x, b, seed + k), dx: 14 },
    { plant: (q, x, b, k) => [mint, coriander, mint][k % 3](q, x, b, seed + k * 3), dx: 12 },
  ]);
};

/** The south bed: bok choy and scallions in rows, a gap where some were picked this morning. */
const southBed: Planting = (p, soil, _f, seed) => {
  rows(p, soil, [
    { plant: (q, x, b, k) => (k === 3 ? undefined : choy(q, x, b, k % 2 === 0)), dx: 10 },
    { plant: (q, x, b, k) => scallions(q, x, b, seed + k * 2), dx: 8 },
  ]);
};

const BEDS: Record<string, Planting> = {
  "courtyard.herb-island": island,
  "courtyard.planting-wall": wallBed,
  "courtyard.herb-court-bed": herbBed,
  "courtyard.south-bed": southBed,
};
const BY_VARIANT: readonly Planting[] = [island, wallBed, herbBed];

function bedDef(prop: MapProp): SpriteDef {
  const f = townFrame(prop, WALL + PLANTS);
  const plant = BEDS[prop.id] ?? BY_VARIANT[prop.variant % BY_VARIANT.length];
  return {
    w: f.w, h: f.h, anchor: f.anchor, foot: townFoot(prop),
    draw: (p) => {
      const seed = seedOf(prop.id);
      const soil = brickBed(p, f, seed);
      // Outline the bed's silhouette before the plants go on: the soil isn't transparent, so plants carry their own.
      autoOutline(p, { map: { rose: "rose1", steel: "rose1", stone: "rose1", leaf: "rose1", cream: "rose1" } });
      plant(p, soil, f, seed);
      autoOutline(p, { map: { bamboo: "wood1", leaf: "leaf1", steel: "steel1", wood: "wood1", cream: "ink2", white: "ink2" } });
    },
  };
}

// ── threshold planters ─────────────────────────────────────────────────────────

/**
 * Variant 0: a granite trough with a carved panel, mondo grass and a little pine trained into flat
 * cloud pads, left by the gate to see people in and out. Variant 1: a green-glazed trough of yellow
 * chrysanthemums, set out for the autumn by the family by the gate.
 */
function planterDef(prop: MapProp): SpriteDef {
  const f = townFrame(prop, 26);
  return {
    w: f.w, h: f.h, anchor: f.anchor, foot: townFoot(prop), shadow: { rx: Math.round(f.w / 2) - 2, ry: 4, dy: -4 },
    draw: (p) => {
      const W = f.w, G = f.gy, seed = seedOf(prop.id);
      const front = 11, top = G - f.depth + 9;
      const stone = prop.variant % 2 === 0;
      const [d, m, l, hi] = stone ? (["stone2", "stone3", "stone4", "stone5"] as const) : (["jade1", "jade2", "jade3", "jade4"] as const);
      p.rect(0, top, W, G - front - top + 1, l).hline(0, top, W, hi).vline(0, top, G - front - top + 1, hi);
      p.rect(3, top + 2, W - 6, G - front - top - 3, "brown2");
      p.over(() => p.speckle(3, top + 3, W - 6, G - front - top - 4, "brown3", 0.15, seed));
      p.rect(0, G - front + 1, W, front, m).hline(0, G - front + 1, W, l).vline(W - 1, G - front + 1, front, d).hline(0, G, W, d);
      if (stone) p.frame(4, G - front + 3, W - 8, front - 5, d);
      else p.over(() => { p.vline(5, G - front + 2, front - 3, "jade5"); p.hline(2, G - 2, W - 4, "jade2"); });
      autoOutline(p, { map: { stone: "stone1", jade: "jade1", brown: "wood1" } });
      if (stone) {
        for (let x = 5; x < W - 5; x += 4) sticker(p, x - 2, top - 3, 5, 6, (q) => { q.line(1, 5, 0, 1, "leaf1"); q.line(2, 5, 2, 0, "leaf2"); q.line(3, 5, 4, 1, "leaf1"); });
        sticker(p, Math.round(W / 2) - 10, top - 22, 22, 22, (q) => {
          q.line(10, 21, 8, 14, "wood3").line(11, 21, 9, 14, "wood2").line(8, 14, 12, 8, "wood3").line(9, 14, 13, 8, "wood2");
          q.line(9, 13, 3, 11, "wood3");
          mound(q, 4, 9, 4.5, 2.2, ["leaf1", "leaf1", "jade2", "leaf2", "leaf3"], seed, [["33", "21"]], [2, 2]);
          mound(q, 14, 6, 6, 2.6, ["leaf1", "leaf1", "jade2", "leaf2", "leaf3"], seed + 1, [["33", "21"]], [2, 2]);
          mound(q, 13, 2.5, 3.5, 2, ["leaf1", "leaf1", "jade2", "leaf2", "leaf3"], seed + 2, [["33", "21"]], [2, 2]);
        }, { wood: "wood1" });
      } else {
        sticker(p, 2, top - 14, W - 4, 17, (q) => {
          for (let k = 0; k < 4; k++) mound(q, 5 + k * ((W - 14) / 3), 11, 5, 4, ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4"], seed + k);
          for (let k = 0; k < 7; k++) {
            const x = 2 + Math.floor(hash(k, 1, seed) * (W - 10)), y = 2 + Math.floor(hash(k, 2, seed) * 6);
            art(q, x, y, [".yY.", "yYGy", "yggy", ".gg."], { y: "gold3", Y: "gold4", G: "gold5", g: "gold2" });
          }
        });
      }
    },
  };
}

export default defineSprites(Object.fromEntries([
  ...mapProps("all", "raised-bed").map((p) => [propSpriteId(p.map, p.id), bedDef(p)] as const),
  ...mapProps("all", "threshold-planter").map((p) => [propSpriteId(p.map, p.id), planterDef(p)] as const),
]));
