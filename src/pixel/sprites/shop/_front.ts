/**
 * Private draw kit for the town's shopfronts (ticket 0165). Not a sprite set.
 *
 * Every building sprite is exactly its footprint (`footprintPx`): the street facade fills the bottom
 * `F` rows, the roof seen from above fills the rest. Facade code thinks in heights above the pavement:
 * `z = 0` is the bottom row, so a feature from `z0` up to `z1` covers rows `h - z1 .. h - z0 - 1`.
 * Light is from the upper left: tops lightest, fronts a step darker, right and under edges darkest.
 *
 * Roof language is shared with the lane houses (0164): grey pantiles in the stone ramp with a ridge
 * of tiles stood on edge and round drip-tile eaves. The restaurant's flat Deco roof and the
 * workshop's sawtooth are the deliberate exceptions.
 */
import { hash, Px, ramp, type Color, type Legend, type Paint, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, townProps, townSpriteId, type TownProp } from "../../town/map.ts";

// ── sprite plumbing ─────────────────────────────────────────────────────────

/** The contract's anchor: the footprint's bottom-centre. */
export const anchorOf = (w: number, h: number) => [Math.round(w / 2), h - 1] as const;

/**
 * One sprite per map prop of `kind`, each drawn to its footprint. `draw` gets the prop, so a kind
 * with several instances can tell them apart by id and variant.
 */
export function perProp(kind: string, make: (prop: TownProp, w: number, h: number) => Partial<SpriteDef> & Pick<SpriteDef, "draw">): Record<string, SpriteDef> {
  const out: Record<string, SpriteDef> = {};
  for (const prop of townProps(kind)) {
    const { w, h } = footprintPx(prop);
    out[townSpriteId(prop.id)] = { w, h, anchor: anchorOf(w, h), ...make(prop, w, h) };
  }
  return out;
}

/** A building is solid over its whole plot. */
export const plotFoot = (w: number, h: number) => [-Math.round(w / 2), -(h - 1), w, h] as const;

/** Stamp a hand-drawn block, checking every row has the same width. */
export function block(p: Px, x: number, y: number, rows: readonly string[], legend: Legend, name = "block"): void {
  const w = rows[0]?.length ?? 0;
  rows.forEach((row, i) => {
    if (row.length !== w) throw new Error(`${name}: row ${i} "${row}" is ${row.length} wide, expected ${w}`);
  });
  p.rows(x, y, rows, legend);
}

/** Facade coordinates: `Z(h)(z)` is the canvas row of the pixel `z` above the pavement. */
export const rowAt = (h: number) => (z: number) => h - 1 - z;
/** Fill from height z0 (inclusive) up to z1 (exclusive). */
export function zrect(p: Px, h: number, x: number, z0: number, w: number, z1: number, c: Paint) {
  p.rect(x, h - z1, w, z1 - z0, c);
}

/**
 * One step along a colour's own ramp: `+1` lighter, `-1` darker. Inside a solid sprite this is how
 * steam, shade and glow are laid over art (a translucent pixel there would show the ground through).
 */
export function step(c: Color, d: number): Color {
  if (c === "white") return d >= 0 ? "white" : step("cream5", d + 1);
  if (c === "ink") return d <= 0 ? "ink" : step("ink2", d - 1);
  if (c === "ink2") return d < 0 ? "ink" : d === 0 ? "ink2" : "ink2";
  const m = /^([a-z]+)(\d)$/.exec(c);
  if (!m) return c;
  const r = ramp(m[1]);
  const i = Math.max(0, Math.min(r.length - 1, Number(m[2]) - 1 + d));
  if (Number(m[2]) - 1 + d >= r.length && (m[1] === "cream" || m[1] === "steel" || m[1] === "blue")) return "white";
  return r[i];
}

/** Shift every solid pixel in a rectangle `d` steps along its ramp. */
export function shade(p: Px, x: number, y: number, w: number, h: number, d = -1) {
  p.each((_x, _y, c) => (c ? step(c, d) : undefined), [x, y, w, h]);
}

/**
 * Soft translucent stuff (steam, smoke, glow) as a grid of levels 1..3: over transparent pixels it
 * is drawn translucent; over solid art it lightens the art along its ramp instead.
 */
export function softLayer(p: Px, w: number, h: number, paint: (put: (x: number, y: number, level: number) => void) => void, smoke = false) {
  const grid = new Uint8Array(w * h);
  paint((x, y, level) => {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && y >= 0 && x < w && y < h) grid[y * w + x] = Math.max(grid[y * w + x], level);
  });
  const veil: Color[] = smoke ? ["grey2", "grey3", "steel5"] : ["steel6", "white", "white"];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const l = grid[y * w + x];
    if (!l) continue;
    const c = p.get(x, y);
    if (c) p.px(x, y, l >= 3 && !smoke ? "white" : step(c, l));
    else p.faded([0.35, 0.6, 0.85][l - 1], () => p.px(x, y, veil[l - 1]));
  }
}

// ── how the awnings meet their buildings ────────────────────────────────────

/**
 * Where each awning is fixed to its building, as heights above the pavement. The building leaves a
 * plain fascia band at `mount`; the awning sprite hangs from it. Keyed by the awning's prop id.
 */
export const AWNING_MOUNT: Record<string, { building: string; mount: number; depth: number; drop: number }> = {
  // 早安小馆: under the green fascia; the scallops' lowest points stay above the 64 px doorway.
  "town.breakfast-awning": { building: "town.restaurant", mount: 90, depth: 14, drop: 7 },
  // The tea house: strung under the lower tiled eave, out over the terrace tables.
  "town.tea-awning": { building: "town.tea-house", mount: 88, depth: 16, drop: 7 },
  // The workshop: a canopy over the roller door, below the painted sign band.
  "town.workshop-canopy": { building: "town.workshop", mount: 100, depth: 14, drop: 6 },
};

// ── materials ───────────────────────────────────────────────────────────────

/**
 * Cream stucco: a calm render with gentle weathering. Rain streaks run down from `streaks` (x, y)
 * points; a repaired patch is a slightly fresher rectangle.
 */
export function stucco(p: Px, x: number, y: number, w: number, h: number, seed: number, o: { base?: Color; lit?: Color; dim?: Color } = {}) {
  const base = o.base ?? "cream3", lit = o.lit ?? "cream4", dim = o.dim ?? "cream2";
  p.rect(x, y, w, h, base);
  // Big soft unevenness of the render: lit blobs to the upper left, tired ones low down.
  for (let j = 0; j < h; j += 6) for (let i = 0; i < w; i += 9) {
    const r = hash(x + i, y + j, seed);
    if (r < 0.1) p.rect(x + i + 1, y + j + 1, 4 + Math.floor(r * 30), 2, lit);
    else if (r > 0.94 && j > h / 3) p.rect(x + i, y + j + 2, 3, 1, dim);
  }
  // A lit top margin under whatever caps it.
  p.hline(x, y, w, lit);
}

/** A rain streak running down a wall from (x, y), `len` long, tapering. */
export function streak(p: Px, x: number, y: number, len: number, c: Color, c2?: Color) {
  for (let j = 0; j < len; j++) {
    if (j < len * 0.6 || j % 2 === 0) p.px(x, y + j, c);
    if (c2 && j < len * 0.35) p.px(x + 1, y + j, c2);
  }
}

/**
 * Grey Shanghai brick, 8×4 bricks in stretcher bond with a pale lime mortar. Each brick's top edge
 * catches a little light; a few bricks are darker, browner or replaced.
 */
export function greyBrick(p: Px, x: number, y: number, w: number, h: number, seed: number, o: { mortar?: Color; body?: Color; lit?: Color; dark?: Color } = {}) {
  const mortar = o.mortar ?? "stone4", body = o.body ?? "stone3", lit = o.lit ?? "stone4", dark = o.dark ?? "stone2";
  p.rect(x, y, w, h, mortar);
  for (let row = 0; row * 4 < h; row++) {
    const off = row % 2 ? 4 : 0;
    for (let col = -1; col * 8 < w + 8; col++) {
      const bx = x + col * 8 + off, by = y + row * 4;
      const r = hash(col, row, seed);
      const c: Color = r < 0.12 ? dark : r > 0.93 ? "grey2" : r > 0.88 ? "cream2" : body;
      p.clip(x, y, w, h, (q) => {
        q.rect(bx - x, by - y, 7, 3, c);
        if (c === body && r > 0.5) q.hline(bx - x, by - y, 4 + Math.floor(r * 3), lit);
        if (r > 0.97) q.px(bx - x + 5, by - y + 1, "stone1");
      });
    }
  }
}

/** Vertical timber boards, `bw` wide, lit on their left edges, with grain streaks and nail heads. */
export function boards(p: Px, x: number, y: number, w: number, h: number, seed: number, bw = 6, c: [Color, Color, Color, Color] = ["wood1", "wood2", "wood3", "wood4"]) {
  const [d, b, m, l] = c;
  p.rect(x, y, w, h, m);
  for (let i = 0; i < w; i += bw) {
    p.vline(x + i, y, h, d);
    p.vline(x + i + 1, y, h, l);
    for (let j = 2; j < h - 2; j += 3) {
      const r = hash(x + i, y + j, seed);
      if (r < 0.28) p.vline(x + i + 2 + Math.floor(r * 10) % (bw - 2), y + j, 2 + Math.floor(r * 9), b);
    }
  }
}

// ── roofs ───────────────────────────────────────────────────────────────────

export type TileRoof = {
  /** Rows from the top of the region down to the top of the ridge. */
  ridge: number;
  seed: number;
  /** Left and right ends: an upturned curl, or plain gables. */
  ends?: "curl" | "plain";
  /** Column period of the pantiles (roll + channel). */
  pitch?: number;
};

/** Roll-tile column shades across one pantile period, left to right: lit roll, roll, shaded roll, channel… */
function tileColumn(i: number, pitch: number, near: boolean): Color {
  const k = i % pitch;
  if (near) return k === 0 ? "stone4" : k === 1 ? "stone4" : k === 2 ? "stone3" : k === pitch - 1 ? "stone1" : "stone2";
  return k === 0 ? "stone5" : k === 1 ? "stone4" : k === 2 ? "stone4" : k === pitch - 1 ? "stone2" : "stone3";
}

/**
 * A grey pantile roof seen from above and in front: the far slope over the ridge (lighter, short,
 * foreshortened), the ridge of tiles stood on edge, the near slope down to a row of round drip-tile
 * ends at the eave. Fills `x, y, w, h`; the eave's bottom row is `y + h - 1`.
 */
export function pantileRoof(p: Px, x: number, y: number, w: number, h: number, o: TileRoof) {
  const pitch = o.pitch ?? 6;
  const rTop = o.ridge, rH = 8, nearTop = rTop + rH, eaveH = 5;
  p.clip(x, y, w, h, (q) => {
    // Far slope: short courses of 3 rows.
    for (let j = 0; j < rTop; j++) for (let i = 0; i < w; i++) {
      let c = tileColumn(i, pitch, false);
      if ((rTop - j) % 3 === 0) c = i % pitch < 3 ? "stone5" : "stone2";
      q.px(i, j, c);
    }
    // Near slope: courses every 6 rows, each lip a lit catch-light over a shadow line in the channel.
    for (let j = nearTop; j < h - eaveH; j++) for (let i = 0; i < w; i++) {
      const course = (j - nearTop) % 6;
      let c = tileColumn(i, pitch, true);
      if (course === 0) c = i % pitch < 3 ? (i % pitch === 0 ? "stone5" : "stone4") : "stone1";
      else if (course === 1 && i % pitch >= 3) c = "stone2";
      q.px(i, j, c);
    }
    // The ridge: a base course, tiles on edge, a lit coping line, a shadow onto the near slope.
    q.hline(0, rTop, w, "stone4");
    q.rect(0, rTop + 1, w, 4, "stone2");
    for (let i = 0; i < w; i += 2) q.vline(i, rTop + 1, 4, hash(i, 9, o.seed) < 0.1 ? "stone3" : "stone4");
    q.hline(0, rTop + 5, w, "stone1");
    q.hline(0, rTop + 6, w, "stone3");
    q.hline(0, rTop + 7, w, "stone2");
    // Eave: drip-tile discs on the rolls, pointed drip tiles under the channels, then the shadow line.
    const e = h - eaveH;
    for (let i = 0; i < w; i++) {
      const k = i % pitch;
      if (k < 3) {
        q.px(i, e, "stone4");
        q.px(i, e + 1, k === 1 ? "stone5" : "stone3");
        q.px(i, e + 2, k === 1 ? "stone3" : "stone2");
        q.px(i, e + 3, "stone1");
      } else {
        q.px(i, e, "stone2");
        q.px(i, e + 1, "stone2");
        q.px(i, e + 2, k === 4 ? "stone2" : "stone1");
        q.px(i, e + 3, k === 4 ? "stone1" : "ink2");
      }
      q.px(i, e + 4, "ink2");
    }
    // Weather: moss in the channels low on the slope and along the ridge.
    for (let i = 3; i < w - 3; i += pitch) {
      const r = hash(i, 1, o.seed);
      if (r < 0.22) {
        const my = h - eaveH - 3 - Math.floor(r * 30);
        q.rect(i, my, 2, 3, "jade2").px(i, my - 1, "jade3").px(i + 1, my + 3, "leaf2");
      }
      if (hash(i, 2, o.seed) < 0.18) q.px(i + 1, rTop + 8, "jade3").px(i + 2, rTop + 8, "jade2");
    }
    // Gable barge tiles down both ends.
    for (const bx of [0, w - 4]) {
      q.rect(bx, 0, 4, h - 1, "stone2");
      q.vline(bx + (bx ? 0 : 1), 0, h - 1, "stone3");
      q.vline(bx === 0 ? 0 : w - 1, 0, h, "stone1");
      for (let j = 3; j < h - 2; j += 6) q.hline(bx, j, 4, "stone1");
    }
  });
  if (o.ends !== "plain") {
    // Upturned ridge ends: a little scroll at each end of the ridge.
    const L: Legend = { a: "stone1", b: "stone2", c: "stone4", d: "stone5" };
    const curl = ["..aa..", ".adca.", "adbba.", "abba..", "abbbaa", "abbbba"];
    block(p, x + 1, y + rTop - 5, curl, L, "curl");
    block(p, x + w - 7, y + rTop - 5, curl.map((r) => [...r].reverse().join("")), L, "curl");
  }
}

/** A short pantile strip (a lean-to or a skirt roof): no ridge, just courses and the eave. */
export function tileSkirt(p: Px, x: number, y: number, w: number, h: number, seed: number) {
  pantileRoof(p, x, y - 8, w, h + 8, { ridge: 0, seed, ends: "plain" });
  // Overwrite the ridge with a flashing line against the wall above.
  p.hline(x, y, w, "stone1").hline(x, y + 1, w, "stone4");
}

/**
 * A flat concrete roof inside a stucco parapet, seen from above: the back parapet's coping and its
 * inner face (a front-facing wall, a step darker), coping rims down both sides, and a screed of big
 * square pavers with tarred seams. The front parapet belongs to the facade.
 */
export function flatRoof(p: Px, x: number, y: number, w: number, h: number, seed: number) {
  const face = 9;
  p.rect(x, y, w, h, "stone4");
  // Big cast slabs (about 32×21 once foreshortened), joints in stone3, a few tarred, cracked or replaced.
  for (let j = face + 6, row = 0; j < h; j += 21, row++) {
    p.hline(x, y + j, w, "stone3");
    for (let i = (row % 2) * 16; i < w; i += 32) {
      p.vline(x + i, y + j, Math.min(21, h - j), "stone3");
      const r = hash(i, j, seed);
      if (r < 0.1) p.rect(x + i + 1, y + j + 1, 31, 20, "stone5");
      else if (r > 0.9) p.line(x + i + 6, y + j + 3, x + i + 15, y + j + 10, "stone3");
      if (r > 0.4 && r < 0.5) p.hline(x + i + 1, y + j + 1, 30, "stone5");
    }
  }
  // Tar along the joints near the drains.
  p.hline(x + 6, y + h - 2, w - 12, "stone3");
  // Back parapet: coping (lit), then its inner face in shade with a damp line at its foot.
  p.rect(x, y, w, 4, "cream4").hline(x, y, w, "cream5").hline(x, y + 3, w, "cream2");
  p.rect(x, y + 4, w, face, "cream2");
  p.hline(x, y + 4, w, "cream1");
  for (let i = 0; i < w; i += 7) if (hash(i, 3, seed) < 0.3) p.vline(x + i, y + 6, 4 + Math.floor(hash(i, 4, seed) * 4), "cream1");
  p.hline(x, y + 4 + face, w, "stone2");
  p.hline(x, y + 5 + face, w, "stone3");
  // Side parapets: coping rims with an inner shadow on the right one's face side.
  for (const [sx, lit] of [[x, true], [x + w - 5, false]] as const) {
    p.rect(sx, y, 5, h, "cream3");
    p.vline(sx + (lit ? 0 : 4), y, h, lit ? "cream5" : "cream1");
    p.vline(sx + (lit ? 4 : 0), y + 4, h - 4, lit ? "cream2" : "cream4");
    if (lit) p.vline(sx + 5, y + 4 + face, h - face - 4, "stone3");
  }
}

// ── openings ────────────────────────────────────────────────────────────────

/** Bottle-green joinery shading: frame members lit on top and left, shaded on the bottom and right. */
export function greenFrame(p: Px, x: number, y: number, w: number, h: number, t = 3, ramp: [Color, Color, Color] = ["jade1", "jade2", "jade3"]) {
  const [d, m, l] = ramp;
  p.rect(x, y, w, t, m).rect(x, y + h - t, w, t, m).rect(x, y, t, h, m).rect(x + w - t, y, t, h, m);
  p.hline(x, y, w, l).vline(x, y, h, l);
  p.hline(x, y + h - 1, w, d).vline(x + w - 1, y, h, d);
  // Inner reveal: shaded on the top and left of the glass, lit on its bottom and right.
  p.hline(x + t - 1, y + t - 1, w - 2 * t + 2, d).vline(x + t - 1, y + t - 1, h - 2 * t + 2, d);
  p.hline(x + t - 1, y + h - t, w - 2 * t + 2, l).vline(x + w - t, y + t - 1, h - 2 * t + 2, l);
}

/**
 * Shop glass from the street on a bright morning: sky caught at the top, the dim room below, two
 * diagonal glints. Fills the rectangle; bars and curtains go on top.
 */
export function streetGlass(p: Px, x: number, y: number, w: number, h: number, seed: number, warm = false) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const t = j / h + (i / w) * 0.15;
    let c: Color = t < 0.16 ? "blue4" : t < 0.4 ? "blue3" : t < 0.75 ? "blue2" : "blue1";
    if (warm && t >= 0.4) c = t < 0.75 ? "jade2" : "jade1";
    if (t > 0.14 && t < 0.18 && (i + j) % 2 === 0) c = "blue3";
    p.px(x + i, y + j, c);
  }
  // Two parallel glints, rising to the right.
  const g0 = Math.floor(hash(x, y, seed) * Math.max(1, w - 12)) + 4;
  for (let j = 0; j < h; j++) {
    const gx = g0 + Math.floor((h - j) * 0.7) - 8;
    if (gx >= 0 && gx < w) p.px(x + gx, y + j, "blue5");
    if (gx + 1 >= 0 && gx + 1 < w && j % 3 !== 0) p.px(x + gx + 1, y + j, "blue4");
    const gx2 = gx + 5;
    if (gx2 >= 0 && gx2 < w && j % 2 === 0) p.px(x + gx2, y + j, "blue4");
  }
}

/** Unbleached linen café curtain hung on a brass rod at row `y`, falling `h` rows, lace at the hem. */
export function cafeCurtain(p: Px, x: number, y: number, w: number, h: number, seed: number) {
  p.rect(x, y + 1, w, h - 1, "cream4");
  for (let i = 0; i < w; i++) {
    const k = (i + Math.floor(hash(seed, 0) * 4)) % 5;
    if (k === 0) p.vline(x + i, y + 2, h - 4, "cream3");
    if (k === 1) p.vline(x + i, y + 3, h - 6, "cream5");
    if (k === 4 && i % 10 === 4) p.vline(x + i, y + 2, h - 3, "cream2");
  }
  // Lace hem: a drawn-thread band and a scalloped edge.
  p.hline(x, y + h - 4, w, "cream5");
  for (let i = 0; i < w; i++) {
    if (i % 2 === 0) p.px(x + i, y + h - 3, "white");
    if (i % 4 === 1) p.px(x + i, y + h - 1, "cream3");
  }
  // Rod and rings.
  p.hline(x - 1, y, w + 2, "gold3").px(x - 1, y, "gold1").px(x + w, y, "gold1");
  for (let i = 2; i < w; i += 7) p.px(x + i, y + 1, "gold2");
}

/**
 * A blank signboard with a flat field for the DOM text. Returns the field rectangle `[x, y, w, h]`.
 * `lacquer`: black-green lacquer in a gilt bead (the bistro); `wood`: a carved plaque frame;
 * `painted`: a painted band straight on the wall; `light`: a modern lightbox.
 */
export function signboard(p: Px, x: number, y: number, w: number, h: number, style: "lacquer" | "wood" | "painted" | "light" | "enamel", seed = 0): [number, number, number, number] {
  if (style === "lacquer") {
    p.rect(x, y, w, h, "gold2").hline(x, y, w, "gold4").vline(x, y, h, "gold3").hline(x, y + h - 1, w, "gold1").vline(x + w - 1, y, h, "gold1");
    p.rect(x + 2, y + 2, w - 4, h - 4, "jade1");
    p.hline(x + 3, y + 3, w - 6, "jade2");
    p.px(x + 1, y + 1, "gold5").px(x + w - 2, y + 1, "gold3");
    return [x + 3, y + 4, w - 6, h - 7];
  }
  if (style === "wood") {
    p.rect(x, y, w, h, "wood2").hline(x, y, w, "wood4").vline(x, y, h, "wood3").hline(x, y + h - 1, w, "wood1").vline(x + w - 1, y, h, "wood1");
    p.rect(x + 3, y + 3, w - 6, h - 6, "ink2");
    p.hline(x + 3, y + 3, w - 6, "wood1");
    p.frame(x + 2, y + 2, w - 4, h - 4, "gold2");
    for (const [cx, cy] of [[x + 1, y + 1], [x + w - 3, y + 1], [x + 1, y + h - 3], [x + w - 3, y + h - 3]]) p.rect(cx, cy, 2, 2, "gold3");
    return [x + 4, y + 4, w - 8, h - 8];
  }
  if (style === "painted") {
    // Lime paint gone thin and chalky over brick: a flat field, a darker rim where it was cut in,
    // and a few flakes where the brick shows through.
    p.rect(x, y, w, h, "cream3");
    p.hline(x, y, w, "cream2").hline(x, y + h - 1, w, "cream2").vline(x, y, h, "cream2").vline(x + w - 1, y, h, "cream2");
    p.hline(x + 1, y + 1, w - 2, "cream4");
    for (let n = 0; n < Math.floor(w / 30); n++) {
      const fx = x + 4 + Math.floor(hash(n, 1, seed) * (w - 12)), fy = y + 2 + Math.floor(hash(n, 2, seed) * (h - 6));
      p.rect(fx, fy, 4, 2, "stone3").px(fx + 4, fy + 1, "stone3").px(fx, fy, "stone2");
    }
    return [x + 2, y + 2, w - 4, h - 4];
  }
  if (style === "enamel") {
    p.rect(x, y, w, h, "blue2").frame(x, y, w, h, "blue1");
    p.rect(x + 2, y + 2, w - 4, h - 4, "cream5").hline(x + 2, y + 2, w - 4, "white");
    p.frame(x + 1, y + 1, w - 2, h - 2, "blue3");
    p.px(x + 3, y + h - 3, "stone2").px(x + w - 5, y + 3, "stone2");
    return [x + 3, y + 3, w - 6, h - 6];
  }
  // Lightbox: a brushed steel frame round a milky face.
  p.rect(x, y, w, h, "steel4").hline(x, y, w, "steel6").vline(x, y, h, "steel5").hline(x, y + h - 1, w, "steel2").vline(x + w - 1, y, h, "steel2");
  p.rect(x + 2, y + 2, w - 4, h - 4, "white");
  p.hline(x + 2, y + h - 3, w - 4, "cream5");
  p.vline(x + 2, y + 2, h - 4, "cream5");
  return [x + 3, y + 3, w - 6, h - 6];
}

/**
 * A roller shutter in its guides: the drum box at the top, `down` of the opening covered (0..1),
 * the dark shop behind the rest. `wear` 0..1 adds rust, dents and grime; returns the row where the
 * shutter's bottom bar sits so the caller can draw the room beyond above `y + h`.
 */
export function rollerShutter(p: Px, x: number, y: number, w: number, h: number, down: number, seed: number, wear = 0.3): number {
  const box = 7;
  const open = y + box + Math.round((h - box) * down);
  // The drum box.
  p.rect(x - 2, y, w + 4, box, "steel3").hline(x - 2, y, w + 4, "steel5").hline(x - 2, y + box - 1, w + 4, "steel1").hline(x - 2, y + 1, w + 4, "steel4");
  for (let i = 6; i < w; i += 24) p.px(x + i, y + 3, "steel2");
  // Guides.
  p.rect(x - 2, y + box, 2, h - box, "steel2").vline(x - 2, y + box, h - box, "steel4");
  p.rect(x + w, y + box, 2, h - box, "steel1").vline(x + w, y + box, h - box, "steel3");
  // Slats: corrugated 3-row profile, lit crest, mid, shadowed trough.
  for (let j = y + box; j < open; j++) {
    const k = (j - y - box) % 3;
    p.hline(x, j, w, k === 0 ? "steel5" : k === 1 ? "steel4" : "steel2");
  }
  // Bottom bar with a lifting handle and a lock tongue.
  if (open < y + h) {
    p.hline(x, open, w, "steel1").hline(x, open - 1, w, "steel3");
    p.rect(x + Math.floor(w / 2) - 3, open - 3, 6, 2, "steel2").hline(x + Math.floor(w / 2) - 3, open - 3, 6, "steel5");
  } else {
    p.hline(x, y + h - 1, w, "steel1");
    p.rect(x + Math.floor(w / 2) - 3, y + h - 4, 6, 2, "steel2").hline(x + Math.floor(w / 2) - 3, y + h - 4, 6, "steel5");
  }
  // Grime low down, rust in runs from the drum and at the feet of the guides, the odd dent.
  for (let i = 0; i < w; i++) {
    const r = hash(i, seed, 11);
    if (r < wear * 0.35) {
      const len = 3 + Math.floor(r * 40) % 10;
      for (let j = 0; j < len && y + box + j < open; j++) if (j < len - 2 || j % 2 === 0) p.px(x + i, y + box + j, j < 2 ? "orange1" : "wood3");
    }
    if (r > 1 - wear * 0.6 && open > y + h - 6) p.px(x + i, y + h - 2 - Math.floor(r * 3), "stone2");
  }
  if (wear > 0.5) for (let n = 0; n < 3; n++) {
    const dx = x + 6 + Math.floor(hash(n, seed, 5) * (w - 14)), dy = y + box + 4 + Math.floor(hash(n, seed, 6) * Math.max(1, open - y - box - 10));
    if (dy < open - 3) p.rect(dx, dy, 4, 2, "steel3").hline(dx, dy + 2, 4, "steel5");
  }
  return open;
}

/** A dark interior seen through an opening: a soft gradient into the depth, lit near the floor. */
export function darkRoom(p: Px, x: number, y: number, w: number, h: number, warm = true) {
  for (let j = 0; j < h; j++) p.hline(x, y + j, w, j < h * 0.55 ? "ink" : j < h * 0.85 ? "ink2" : warm ? "wood1" : "steel1");
}

// ── fittings ────────────────────────────────────────────────────────────────

/** A split-type air-conditioner's outdoor unit on two brackets, with its drip stain below. */
export function acUnit(p: Px, x: number, y: number, seed: number, drip = 14) {
  const L: Legend = { a: "steel1", b: "steel2", c: "steel3", d: "steel4", e: "steel5", f: "steel6", g: "grey1" };
  block(p, x, y, [
    "affffffffffffffffffeea",
    "afeeeeeeeeeeeeeeeeedda",
    "afeeeebbbbbbbbbeeeedda",
    "afeeebcdcdcdcdcbeeedda",
    "afeeebdcabacdcdbedddda",
    "afeeebcdbabdcdcbedddda",
    "afeeebdcdcdcdcdbeddcda",
    "afeeeebbbbbbbbbeeddcda",
    "afeeeeeeeeeeeeeedddcda",
    "addddddddddddddddcccca",
    ".aaaaaaaaaaaaaaaaaaaa.",
  ], L, "ac");
  // Brackets and the hose.
  p.vline(x + 3, y + 11, 3, "steel1").hline(x + 3, y + 13, 5, "steel1");
  p.vline(x + 18, y + 11, 3, "steel1").hline(x + 14, y + 13, 5, "steel1");
  p.px(x + 21, y + 6, "cream2").vline(x + 22, y + 6, 4, "cream2");
  if (drip > 0) for (let j = 0; j < drip; j++) if (j < drip - 3 || j % 2) p.px(x + 15 + (j > drip / 2 ? 1 : 0), y + 12 + j, hash(j, 1, seed) < 0.5 ? "stone2" : "cream1");
}

/** A rainwater downpipe with brackets every 16 rows and a shoe at the bottom. */
export function downpipe(p: Px, x: number, y0: number, y1: number, c: [Color, Color, Color] = ["steel1", "steel3", "steel4"]) {
  p.rect(x, y0, 3, y1 - y0, c[1]).vline(x, y0, y1 - y0, c[2]).vline(x + 2, y0, y1 - y0, c[0]);
  for (let j = y0 + 6; j < y1 - 4; j += 16) p.hline(x - 1, j, 5, c[0]).hline(x - 1, j - 1, 5, c[2]);
  p.rect(x - 1, y1 - 3, 5, 3, c[1]).hline(x - 1, y1 - 3, 5, c[2]).px(x + 3, y1 - 1, c[0]);
}

/** A sagging cable from (x0, y0) to (x1, y1). */
export function cable(p: Px, x0: number, y0: number, x1: number, y1: number, sag: number, c: Color = "ink2") {
  const n = Math.max(1, Math.abs(x1 - x0));
  let prev: [number, number] | null = null;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t + sag * 4 * t * (1 - t));
    if (prev && Math.abs(prev[1] - y) > 1) p.line(prev[0], prev[1], x, y, c);
    else p.px(x, y, c);
    prev = [x, y];
  }
}

/**
 * Steam or smoke rising from (x, y): three soft puffs on a lazy S, a seamless loop over `frames`,
 * `rise` rows tall. Over art it brightens; over nothing it is translucent.
 */
export function wisp(p: Px, x: number, y: number, frame: number, frames: number, rise: number, smoke = false, seed = 0) {
  const t = frame / frames;
  softLayer(p, p.w, p.h, (put) => {
    for (let n = 0; n < 3; n++) {
      const k = (n / 3 + t) % 1;
      const cy = y - k * rise;
      const cx = x + Math.sin((k * 1.6 + seed * 0.37) * Math.PI * 2) * (2 + k * 4) + k * 5;
      const r = 1.5 + k * 3.2;
      const strength = (k < 0.15 ? k / 0.15 : 1) * (1 - k);
      const core = strength > 0.5 ? 3 : 2;
      for (let j = Math.floor(cy - r); j <= Math.ceil(cy + r); j++) for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++) {
        const u = (i + 0.5 - cx) / r, v = (j + 0.5 - cy) / (r * 0.8);
        const d = u * u + v * v;
        if (d > 1 || strength < 0.12) continue;
        // A bite out of the lower right makes each puff curl rather than sit as a disc.
        const bu = (i + 0.5 - cx - r * 0.45) / (r * 0.55), bv = (j + 0.5 - cy - r * 0.35) / (r * 0.45);
        if (r > 2.5 && bu * bu + bv * bv < 1) continue;
        put(i, j, d < 0.4 ? core : strength > 0.3 ? 2 : 1);
      }
    }
    for (let j = 1; j <= 3; j++) put(x + (j === 3 ? 1 : 0), y - j, 2);
  }, smoke);
}

/** A potted plant on a sill: a terracotta-ish pot (oak) and a few leaves. */
export function sillPot(p: Px, x: number, y: number, kind: "fern" | "geranium" | "cactus" | "scallion" | "dead") {
  const L: Legend = { a: "oak1", b: "oak2", c: "oak3", d: "oak4", l: "leaf2", m: "leaf3", n: "leaf4", o: "leaf1", r: "pink2", s: "pink3", g: "grey1", h: "wood3", j: "jade3", k: "jade2" };
  const pot = ["bddddcb", "abcccba", ".abbba."];
  const tops: Record<string, string[]> = {
    fern: ["..n..n.m", ".mnmmn.l", "lmnlmmnm", ".lmmnml.", "..llml.."],
    geranium: ["..sr.s..", ".rsrnsr.", "..mnmmn.", ".lmnlml.", "..llml.."],
    cactus: [".......", "...n...", "..mnm..", "..mnm.n", "n.mnmnm", "mnmnml.", ".lmnml."],
    scallion: ["n.n.n..", "m.mnm.n", "mnmnmnm", "lmlmlml", ".lllll."],
    dead: ["....h..", ".h..h.h", "..h.hh.", "...hh..", "..hhh.."],
  };
  const top = tops[kind];
  block(p, x, y - top.length, top.map((r) => r.padEnd(8, ".")), L, `pot-${kind}`);
  block(p, x, y, pot.map((r) => r.padEnd(8, ".")), L, "pot");
}

/** A soft cast shadow on a wall: translucent ink. Shadows are light, so they may be translucent. */
export function shadowBand(p: Px, x: number, y: number, w: number, h: number, alpha = 0.22) {
  p.faded(alpha, () => p.rect(x, y, w, h, "ink"));
}

/**
 * The contact shadow an object casts on a roof under the upper-left sun: the roof one step darker
 * in a box offset down and to the right. Call it before drawing the object.
 */
export function castShadow(p: Px, x: number, y: number, w: number, h: number, off = 3) {
  shade(p, x + off, y + off, w, h, -1);
}

/** A 12×10 step lattice (步步锦): `a` is a bar. */
const LATTICE = [
  "aaaaaaaaaaaa",
  "a.....a.....",
  "a.....a.....",
  "a..aaaaaaa..",
  "a..a.....a..",
  "aaaa.....aaa",
  "a..a.....a..",
  "a..aaaaaaa..",
  "a.....a.....",
  "a.....a.....",
];

/** Paper-backed wooden lattice: warm paper lit from the room, thin bars with a shadow under each. */
export function lattice(p: Px, x: number, y: number, w: number, h: number, seed: number, torn = false) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const bar = LATTICE[j % 10][i % 12] === "a";
    const above = LATTICE[(j + 9) % 10][i % 12] === "a";
    p.px(x + i, y + j, bar ? "wood2" : above ? "cream3" : j < h * 0.3 ? "cream5" : "cream4");
  }
  p.frame(x, y, w, h, "wood2");
  p.hline(x, y, w, "wood4");
  if (torn) {
    // A torn pane, patched with a square of newer, whiter paper.
    const tx = x + 12 * (1 + Math.floor(hash(seed, 1) * Math.max(1, w / 12 - 2))) + 1, ty = y + 11;
    p.rect(tx, ty, 5, 4, "white").px(tx + 4, ty + 3, "cream4");
  }
}
