/**
 * Where the lane meets a door: doorsteps and stairs (`steps`), mats (`threshold-mat`) and the leaves
 * that stand open (`open-door-leaf`), one sprite per map prop, id `town/<id>`. Steps and mats are flat
 * (`floor`); a leaf stands up and is depth-sorted.
 *
 * An open leaf is hinged on the door's left jamb and swung out 90°, so we see it edge-on: its top edge
 * from above (the first 22 rows, the 32px leaf foreshortened), then its full-height end with a sliver of
 * its inner face. The sprite is the footprint's 6px wide and 22 + the leaf's height tall.
 */
import { defineSprites, hash, TILE, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, townProps, townSpriteId, type TownProp } from "../../town/map.ts";
import { block, moss } from "./_lane.ts";

type Draw = (p: Px, w: number, h: number, prop: TownProp) => void;

// ── steps ───────────────────────────────────────────────────────────────────

/**
 * One stone step: a tread seen from above (lit, worn), then its riser (a face, darker), spanning
 * x0..x1. Treads dish in the middle where feet land; the nosing is chipped in places.
 */
function step(p: Px, x0: number, x1: number, y: number, tread: number, riser: number, seed: number,
  tone: { top: Color; lit: Color; face: Color; dark: Color; edge: Color } = GRANITE): void {
  const w = x1 - x0;
  p.rect(x0, y, w, tread, tone.top);
  p.hline(x0, y, w, tone.lit);
  // Feet have polished a shallow dish into the middle of the tread: paler, with a shaded far lip.
  if (tone !== CONCRETE) {
    const d0 = x0 + Math.floor(w * 0.36), d1 = x1 - Math.floor(w * 0.36), dc = (d0 + d1) / 2, dr = (d1 - d0) / 2;
    const cy = y + tread / 2 + 0.5, ry = Math.max(1.2, tread / 2 - 3);
    p.ellipse(dc, cy, dr, ry, tone.lit);
    // The dish's far lip is in shadow: a short shaded run along its top edge.
    for (let xx = Math.ceil(dc - dr * 0.6); xx < dc + dr * 0.6; xx++) p.px(xx, Math.floor(cy - ry) - 1, tone.face);
  }
  // Granite speckle, sparse and in pairs.
  for (let i = 0; i < Math.floor((w * tread) / 110); i++) {
    const sx = x0 + 1 + Math.floor(hash(i, 1, seed) * (w - 3)), sy = y + 1 + Math.floor(hash(i, 2, seed) * (tread - 2));
    p.px(sx, sy, tone.face).px(sx + 1, sy, hash(i, 3, seed) > 0.5 ? tone.lit : tone.face);
  }
  p.rect(x0, y + tread, w, riser, tone.face);
  p.hline(x0, y + tread, w, tone.lit);
  p.hline(x0, y + tread + riser - 1, w, tone.dark);
  p.vline(x0, y, tread + riser, tone.lit).vline(x1 - 1, y, tread + riser, tone.dark);
  // Chips out of the nosing.
  for (let i = 0; i < Math.max(1, Math.floor(w / 30)); i++) {
    const cx = x0 + 3 + Math.floor(hash(i, 7, seed) * (w - 8));
    p.px(cx, y + tread, tone.dark).px(cx + 1, y + tread, tone.face).px(cx + 1, y + tread + 1, tone.dark);
  }
  p.hline(x0, y + tread + riser, w, tone.edge);
}

const GRANITE = { top: "stone4", lit: "stone5", face: "stone3", dark: "stone2", edge: "steel1" } as const;
const MARBLE = { top: "cream5", lit: "white", face: "cream3", dark: "cream2", edge: "stone2" } as const;
const CONCRETE = { top: "stone4", lit: "stone5", face: "stone3", dark: "stone2", edge: "stone1" } as const;

/** 敦和里 No. 1's doorstep: two granite steps up to the gate, a coin of moss in the joint, a broom. */
const residenceSteps: Draw = (p, w, _h, prop) => {
  const seed = prop.variant * 17;
  step(p, 2, w - 2, 12, 12, 5, seed);
  step(p, 10, w - 10, 0, 8, 4, seed + 1);
  moss(p, 10, 9, 8, 3, seed, 1);
  // A short broom of bamboo twigs left against the upper step's end.
  block(p, w - 18, 2, ["....a", "...ab", "..ab.", ".cc..", "cdcd.", "dcdc.", "cddd."], { a: "wood3", b: "wood2", c: "bamboo4", d: "bamboo2" }, "broom");
  // Last New Year's firecracker paper, trodden into the joint: a few faded pink flecks.
  for (const [x, y] of [[20, 25], [24, 26], [70, 24]] as const) p.px(x, y, "pink2");
};

/** The bistro's step: one long white marble step with a brass nosing, a boot scraper by the door. */
const restaurantSteps: Draw = (p, w, _h, prop) => {
  const seed = prop.variant * 17;
  step(p, 4, w - 4, 6, 16, 6, seed, MARBLE);
  // Brass nosing strip along the step's edge, polished where feet go.
  p.hline(4, 21, w - 8, "gold2").hline(4, 22, w - 8, "gold1");
  for (let x = 30; x < w - 30; x++) p.px(x, 21, "gold4");
  // Grey veins in the marble.
  p.line(12, 9, 26, 18, "stone4").line(26, 18, 34, 17, "stone4").line(60, 8, 72, 14, "stone4");
  // Cast-iron boot scraper.
  block(p, w - 14, 4, ["a....a", "abbbba", "a....a", "c....c"], { a: "steel1", b: "steel3", c: "steel2" }, "scraper");
};

/** The workshop landing: a poured concrete slab, an oil stain, a plank ramp for the handcart. */
const workshopLanding: Draw = (p, w, _h, prop) => {
  const seed = prop.variant * 17;
  step(p, 2, w - 2, 4, 20, 5, seed, CONCRETE);
  // Oil stain where the moped stands.
  block(p, 22, 10, [".aab..", "abbbba", "abccbb", ".abbb.", "..aa.."], { a: "stone3", b: "stone2", c: "stone1" }, "oil");
  // Wood shavings blown out of the door.
  for (const [x, y] of [[48, 9], [52, 13], [60, 8], [44, 16]] as const) p.px(x, y, "oak5").px(x + 1, y, "oak4");
  // Plank ramp over the riser on the right.
  for (let j = 0; j < 22; j++) p.hline(w - 30, 6 + j, 18, j % 6 === 5 ? "oak1" : "oak3");
  p.vline(w - 30, 6, 22, "oak4").vline(w - 13, 6, 22, "oak1");
  for (let j = 8; j < 28; j += 7) { p.px(w - 28, j, "steel2"); p.px(w - 15, j, "steel2"); }
  p.hline(w - 30, 28, 18, "wood1");
};

/**
 * The river stairs: granite steps down to the canal, each tread darker and damper than the last,
 * cheek walls either side, an iron mooring ring, weed where the water reaches.
 */
const riverStairs: Draw = (p, w, h, prop) => {
  const seed = prop.variant * 17;
  const tones = [GRANITE, GRANITE, { ...GRANITE, top: "stone3", lit: "stone4", face: "stone2", dark: "stone1" },
    { top: "stone3", lit: "stone4", face: "stone2", dark: "stone1", edge: "steel1" }, { top: "stone2", lit: "stone3", face: "stone1", dark: "steel1", edge: "steel1" }] as const;
  for (let i = 0; i < 5; i++) step(p, 8, w - 8, i * 12, 8, 4, seed + i, tones[i]);
  // Cheek walls.
  for (const x of [0, w - 8]) {
    p.rect(x, 0, 8, h, "stone3");
    p.vline(x, 0, h, "stone5").vline(x + 1, 0, h, "stone4").vline(x + 7, 0, h, "stone2");
    for (let y = 6; y < h; y += 10) p.hline(x, y, 8, "stone2");
  }
  p.hline(0, h - 1, w, "steel1");
  // Damp line and weed on the lowest step.
  moss(p, 8, 48, w - 16, 8, seed, 3);
  for (let x = 9; x < w - 9; x++) if (hash(x, 1, seed) > 0.5) p.px(x, 58, "jade2");
  // A mooring ring on the right cheek.
  block(p, w - 7, 30, [".aa.", "a..b", "a..b", ".bb."], { a: "steel3", b: "steel1" }, "ring");
  p.px(w - 6, 34, "orange1").px(w - 6, 35, "orange1");
};

// ── mats ────────────────────────────────────────────────────────────────────

/** The bistro's coir mat, framed in black rubber, worn pale in the middle, one corner lifting. */
const coirMat: Draw = (p, w, h) => {
  const x = 2, y = 4, mw = w - 4, mh = h - 8;
  p.rect(x, y, mw, mh, "ink2");
  for (let yy = y + 2; yy < y + mh - 2; yy++) for (let xx = x + 2; xx < x + mw - 2; xx++) {
    const u = (xx - (x + mw / 2)) / (mw / 2), v = (yy - (y + mh / 2)) / (mh / 2);
    const worn = u * u + v * v < 0.35;
    p.px(xx, yy, (xx + yy * 2) % 3 === 0 ? (worn ? "bamboo3" : "bamboo2") : worn ? "bamboo4" : "bamboo3");
  }
  p.hline(x, y, mw, "steel2");
  // The lifting corner.
  block(p, x + mw - 6, y, ["..aab", ".abbb", "abbbc", "abbc.", "ccc.."], { a: "bamboo4", b: "bamboo3", c: "ink" }, "corner");
};

/** A braided rag rug, an oval of old clothes in rings: somebody's grandmother's winter evenings. */
const ragRug: Draw = (p, w, h) => {
  const cx = w / 2, cy = h / 2 - 1, rx = w / 2 - 2, ry = h / 2 - 4;
  const rings: Color[] = ["plum2", "cream4", "jade3", "blue3", "cream3", "pink2", "jade4", "cream5"];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const d = Math.hypot((x + 0.5 - cx) / rx, (y + 0.5 - cy) / ry);
    if (d > 1) continue;
    const ring = Math.min(rings.length - 1, Math.floor((1 - d) * 9));
    // The braid's twist: a darker stitch every third pixel along each ring, offset ring to ring.
    const twist = (x + (ring % 2 ? 1 : 0)) % 3 === 0 && ring < 7;
    p.px(x, y, twist ? (ring % 2 ? "plum1" : "stone2") : rings[ring]);
  }
  // Its edge sits a pixel proud of the paving.
  for (let x = 0; x < w; x++) for (let y = h - 1; y > 0; y--) if (p.get(x, y)) { p.px(x, y + 1, "stone2"); break; }
};

/** A flattened cardboard box, taped, oil-stained, printed with the ghost of a blank label. */
const cardboardMat: Draw = (p, w, h) => {
  const x = 3, y = 5;
  p.poly([[x, y + 2], [w - 4, y], [w - 2, h - 6], [x + 2, h - 4]], "oak4");
  p.over((q) => {
    q.line(x + 1, y + 13, w - 3, y + 11, "oak3");
    for (let xx = x; xx < w; xx += 9) q.vline(xx, y, h, "oak3");
    block(q, 14, 9, [".aab.", "abbbb", "abccb", ".bbb."], { a: "oak2", b: "oak1", c: "wood2" }, "oilBlot");
    q.rect(w - 22, y + 4, 12, 7, "oak5");
    q.frame(w - 22, y + 4, 12, 7, "oak3");
    // Brown tape over the fold.
    q.hline(x, y + 12, w, "bamboo3");
    // A boot print.
    block(q, 30, 18, ["aa.", "aaa", "...", ".aa", ".aa"], { a: "oak2" }, "boot");
  });
  p.outline("oak1", { sides: ["bottom", "right"] });
};

/**
 * The lane gateway's granite sill: one long stone, two ruts worn by cart wheels, the pivot holes of a
 * gate that went for scrap in 1958, and a drain slot.
 */
const gatewaySill: Draw = (p, w, h) => {
  p.rect(0, 1, w, h - 3, "stone4");
  p.hline(0, 1, w, "stone5").hline(0, h - 3, w, "stone3").hline(0, h - 2, w, "stone2").hline(0, h - 1, w, "steel1");
  for (const rx of [Math.floor(w * 0.3), Math.floor(w * 0.66)]) for (let y = 2; y < h - 3; y++) { p.px(rx, y, "stone3"); p.px(rx + 1, y, (y & 1) ? "stone3" : "stone4"); p.px(rx + 2, y, "stone5"); }
  for (const px0 of [4, w - 8]) block(p, px0, 4, [".ab.", "abbc", ".cc."], { a: "stone2", b: "steel1", c: "stone3" }, "pivot");
  // Joints where the sill was laid in three pieces.
  for (const jx of [Math.floor(w / 3) + 8, Math.floor((2 * w) / 3) - 6]) p.vline(jx, 1, h - 3, "stone2");
  // Drain slot.
  p.rect(w / 2 - 6, h - 7, 12, 2, "steel1");
  for (let x = w / 2 - 5; x < w / 2 + 6; x += 2) p.px(x, h - 7, "stone3");
};

// ── open leaves ─────────────────────────────────────────────────────────────

type LeafTone = { edge: Color; face: Color; gloss: Color; top: Color; rail: Color };
const LEAF: Record<number, { h: number; tone: LeafTone; story: "lacquer" | "glazed" | "planks" }> = {
  /** The bistro's door: varnished dark wood with a glass light and a brass kick plate. */
  17: { h: 64, tone: { edge: "wood1", face: "wood2", gloss: "wood3", top: "wood4", rail: "wood1" }, story: "glazed" },
  /** 敦和里 No. 1's left gate leaf, black lacquer, held open with a brick. */
  18: { h: 66, tone: { edge: "ink", face: "steel1", gloss: "steel2", top: "steel3", rail: "ink" }, story: "lacquer" },
  /** The workshop's plank door, jade paint gone chalky, iron strap hinges. */
  19: { h: 64, tone: { edge: "jade1", face: "jade3", gloss: "jade4", top: "jade5", rail: "jade2" }, story: "planks" },
};

function leafSprite(prop: TownProp): SpriteDef {
  const { w, h: foot } = footprintPx(prop);
  const spec = LEAF[prop.variant] ?? LEAF[18];
  const H = foot + spec.h;
  return {
    w, h: H,
    anchor: [Math.round((prop.width * TILE) / 2), H - 1],
    shadow: { rx: 4, ry: 2 },
    draw: (p) => {
      const t = spec.tone;
      // Top edge seen from above, running from the hinge (top) to the free end.
      p.rect(1, 0, w - 2, foot, t.top);
      p.vline(1, 0, foot, t.gloss).vline(w - 2, 0, foot, t.rail);
      // The leaf's end and the sliver of its inner face, full height.
      const y0 = foot;
      p.rect(1, y0, w - 2, spec.h, t.face);
      p.vline(1, y0, spec.h, t.gloss).vline(2, y0, spec.h, t.face).vline(w - 3, y0, spec.h, t.gloss).vline(w - 2, y0, spec.h, t.edge);
      // Rails across the inner face where the panels are.
      for (const k of [0.06, 0.48, 0.55, 0.94]) p.hline(1, y0 + Math.floor(spec.h * k), w - 3, t.rail);
      if (spec.story === "glazed") {
        for (let y = y0 + 6; y < y0 + Math.floor(spec.h * 0.46); y++) { p.px(2, y, "blue5"); p.px(3, y, (y & 3) ? "blue4" : "white"); }
        p.rect(1, y0 + spec.h - 9, w - 3, 6, "gold2");
        p.vline(1, y0 + spec.h - 9, 6, "gold4").hline(1, y0 + spec.h - 4, w - 3, "gold1");
      }
      if (spec.story === "planks") {
        for (const k of [0.15, 0.8]) { const y = y0 + Math.floor(spec.h * k); p.hline(0, y, w, "steel2"); p.px(w - 1, y, "steel1"); }
        for (let y = y0 + 4; y < y0 + spec.h - 4; y += 9) if (hash(y, 1, prop.variant) > 0.4) p.px(2, y, "stone4");
      }
      if (spec.story === "lacquer") {
        // The brass ring hangs from the outer face and stands out past the leaf's edge.
        p.rows(0, y0 + 28, ["b.", "ab", "a.", "ab", "c."], { a: "gold4", b: "gold3", c: "gold1" });
        // An iron bolt on the inner face, and a brick wedged under the foot to hold the leaf open.
        p.rect(2, y0 + 30, 2, 5, "steel3").px(2, y0 + 30, "steel5");
        block(p, 0, H - 4, ["abbbbc", "bcccdd", "dddddd"], { a: "rose4", b: "rose3", c: "rose2", d: "rose1" }, "brick");
      }
      p.under((q) => q.vline(0, 0, H - (spec.story === "lacquer" ? 4 : 0), t.edge));
      p.vline(w - 1, 0, H - (spec.story === "lacquer" ? 4 : 0), t.edge);
      p.hline(1, 0, w - 2, t.edge);
    },
  };
}

// ── sprites ─────────────────────────────────────────────────────────────────

const STEPS: Record<number, Draw> = { 13: restaurantSteps, 14: residenceSteps, 15: workshopLanding, 16: riverStairs };
const MATS: Record<number, Draw> = { 17: coirMat, 18: ragRug, 19: cardboardMat, 20: gatewaySill };

function flatSprite(prop: TownProp, draw: Draw): SpriteDef {
  const { w, h } = footprintPx(prop);
  return { w, h, anchor: [Math.round((prop.width * TILE) / 2), h - 1], layer: "floor", draw: (p) => draw(p, w, h, prop) };
}

export default defineSprites(Object.fromEntries([
  ...townProps("steps").map((prop) => [townSpriteId(prop.id), flatSprite(prop, STEPS[prop.variant] ?? residenceSteps)] as const),
  ...townProps("threshold-mat").map((prop) => [townSpriteId(prop.id), flatSprite(prop, MATS[prop.variant] ?? coirMat)] as const),
  ...townProps("open-door-leaf").map((prop) => [townSpriteId(prop.id), leafSprite(prop)] as const),
]));
