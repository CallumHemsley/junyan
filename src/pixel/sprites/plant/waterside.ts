/**
 * By the water, in autumn: weeping willows (`willow`, with a dappled shade `<map>/<id>-shade`), reed
 * beds (`reeds`) and water lilies (`lilies`), one sprite per prop as `<map>/<id>`.
 *
 * A willow's footprint is its trunk (the registry narrowed it; `spread` is the crown in tiles). Its
 * curtain of hanging shoots sways from the tips, four frames at 2 fps; so do the reed heads. The lily
 * pads lie still on the water.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { art, autoOutline, camphorBark, canopy, clamp, crownClumps, dappledShade, limb, type Ellipse, type Foliage } from "./_helpers.ts";

const SWAY = [0, 1, 0, -1];
const idSeed = (id: string) => { let s = 0; for (const ch of id) s = (s * 31 + ch.charCodeAt(0)) | 0; return (s >>> 0) % 100000; };

// ── willows ──────────────────────────────────────────────────────────────────

/** Willow leaves are narrow slips; in autumn the crown goes yellow-green at its sunny top. */
const WILLOW: Foliage = {
  ramp: ["jade1", "jade1", "leaf1", "jade2", "leaf2", "leaf3", "bamboo4"],
  leaves: [["3", "3", "2"], ["3.", "32", ".1"], [".3", "23", "1."]],
  step: [3, 3],
};
/** Shoot tones dark to light: back curtain, front curtain, yellowing tips. */
const SHOOT_BACK: readonly Color[] = ["jade1", "leaf1", "jade2"];
const SHOOT_FRONT: readonly Color[] = ["leaf2", "leaf3", "bamboo4"];
const SHOOT_MID: readonly Color[] = ["leaf1", "leaf2", "bamboo3"];

type WillowLayout = { seed: number; W: number; H: number; ax: number; baseY: number; forkX: number; forkY: number; crown: Ellipse; lean: number };

function willowLayout(prop: MapProp): WillowLayout {
  const seed = idSeed(prop.id);
  const spread = prop.spread ?? 5.5;
  const crownW = Math.round(spread * 32);
  const ry = Math.round(crownW * 0.3);
  // Willows lean out over the water: which way comes from the variant.
  const lean = (prop.variant % 2 ? 1 : -1) * (8 + Math.round(hash(1, 1, seed) * 8));
  const W = crownW + 20 + 2 * Math.abs(lean);
  const ax = Math.round(W / 2);
  const crown = { x: ax + lean, y: 6 + ry, rx: crownW / 2 - 2, ry };
  const forkY = crown.y + Math.round(ry * 0.6);
  const baseY = forkY + 44;
  const fpx = Math.max(12, Math.round(prop.width * 32));
  return { seed, W, H: baseY + Math.round(fpx / 2) + 1, ax, baseY, forkX: ax + Math.round(lean * 0.7), forkY, crown, lean };
}

/** One hanging shoot: a thread of slips from `top` down `len` px, its tip swinging `swing` px. */
function shoot(p: Px, x: number, top: number, len: number, swing: number, tones: readonly Color[], seed: number) {
  for (let k = 0; k < len; k++) {
    const t = k / len;
    const xx = Math.round(x + swing * t * t + Math.sin((top + k) * 0.25 + seed) * 0.6 * t);
    const tone = tones[t < 0.3 ? 0 : t < 0.8 ? 1 : 2];
    p.px(xx, top + k, tone);
    if (k % 3 === 1 && hash(x, k, seed) < 0.7) p.px(xx + (hash(k, x, seed) < 0.5 ? -1 : 1), top + k, tones[Math.min(2, (t < 0.5 ? 1 : 2))]);
  }
}

/**
 * A weeping willow, old and leaning out over the water: a short furrowed trunk, a shallow crown,
 * and a curtain of shoots that reaches nearly to the ground, yellowing at the tips.
 */
function drawWillow(p: Px, frame: number, prop: MapProp) {
  const L = willowLayout(prop);
  const { seed, ax, baseY, forkX, forkY, crown } = L;
  const bark = camphorBark(seed);
  const swing = SWAY[frame];
  const ground = baseY - 8;
  // The back curtain, behind the trunk.
  for (let x = Math.round(crown.x - crown.rx); x < crown.x + crown.rx; x += 3) {
    const u = (x - crown.x) / crown.rx;
    const top = Math.round(crown.y + crown.ry * Math.sqrt(Math.max(0, 1 - u * u)) * 0.2);
    const len = Math.round(clamp((ground - top) * (0.55 + 0.45 * (1 - Math.abs(u))) * (0.75 + 0.25 * hash(x, 2, seed)), 10, ground - top));
    shoot(p, x + 1, top, len, swing * 1.5, SHOOT_BACK, seed + x);
  }
  // Trunk and the two great limbs it splits into.
  limb(p, forkX, forkY + 2, Math.round(crown.x - crown.rx * 0.35), crown.y, 8, 4, bark, { bend: -4, seed: seed + 1 });
  limb(p, forkX, forkY + 2, Math.round(crown.x + crown.rx * 0.3), crown.y - 4, 8, 4, bark, { bend: 4, seed: seed + 2 });
  limb(p, ax, baseY, forkX, forkY, 14, 11, bark, { seed, flare: 6, bend: -L.lean * 0.3 });
  // The crown: a shallow dome of masses.
  const masses: Ellipse[] = [-0.5, 0, 0.5].map((f, i) => ({ x: crown.x + f * crown.rx * 0.9, y: crown.y - (i === 1 ? crown.ry * 0.3 : 0), rx: crown.rx * 0.48, ry: crown.ry * 0.62 }));
  const clumps = masses.flatMap((m, i) => crownClumps(m, 12, seed + i * 5).map((c) => ({ ...c, mass: m, group: i, sway: clamp((crown.y - c.y) / crown.ry + 0.5, 0, 1) })));
  canopy(p, clumps.sort((a, b) => a.y - b.y), WILLOW, crown, { seed, dx: swing });
  // The front curtain, draped over the dome from high up and falling nearly to the ground; long
  // shoots in the middle, shorter at the sides, a parting where the trunk shows.
  for (let x = Math.round(crown.x - crown.rx) + 1; x < crown.x + crown.rx; x += 2) {
    const u = (x - crown.x) / crown.rx;
    if (Math.abs(x - forkX) < 5 && hash(x, 4, seed) < 0.8) continue;
    const dome = crown.y - crown.ry * Math.sqrt(Math.max(0, 1 - u * u)) * 0.55;
    const top = Math.round(dome + crown.ry * (0.25 + hash(x, 5, seed) * 0.5));
    const len = Math.round(clamp((ground - top) * (0.5 + 0.5 * (1 - Math.abs(u) * 0.9)) * (0.75 + 0.25 * hash(x, 3, seed)), 10, ground - top + 4));
    shoot(p, x, top, len, swing * 2, x % 4 ? SHOOT_FRONT : SHOOT_MID, seed + x * 3);
  }
  autoOutline(p, { map: { leaf: "leaf1", jade: "jade1", bamboo: "leaf1", gold: "leaf1", wood: "wood1", brown: "wood1", stone: "stone1", ink: "ink" }, sides: ["bottom", "right", "left"] });
}

function willowDef(prop: MapProp): SpriteDef {
  const L = willowLayout(prop);
  return { w: L.W, h: L.H, frames: 4, fps: 2, anchor: [L.ax, L.H - 1], draw: (p, frame) => drawWillow(p, frame, prop) };
}
function willowShadeDef(prop: MapProp): SpriteDef {
  const L = willowLayout(prop);
  const masses: Ellipse[] = [{ x: L.crown.x, y: L.crown.y, rx: L.crown.rx, ry: L.crown.ry * 0.9 }, { x: L.crown.x, y: L.crown.y + L.crown.ry, rx: L.crown.rx * 0.8, ry: L.crown.ry * 0.8 }];
  const shade = dappledShade(masses, L.crown, L.baseY, L.seed, { strength: 0.28, reach: 0.2 });
  return { w: shade.w, h: shade.h, layer: "floor", anchor: [L.ax - shade.x0, L.H - 1 - shade.y0], draw: (p) => shade.draw(p) };
}

// ── reeds ──────────────────────────────────────────────────────────────────────

/**
 * A reed bed at the water's edge in autumn: tan common reed with pale plumes, a few cattails with
 * their brown heads, green still in the young shoots at the foot. Heads stir in the wind.
 */
function drawReeds(p: Px, frame: number, prop: MapProp, w: number, h: number, rise: number) {
  const seed = idSeed(prop.id);
  const swing = SWAY[frame];
  const n = Math.round(w / 1.4);
  const stems: [number, number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    const bx = 2 + Math.round(hash(i, 1, seed) * (w - 4));
    const by = h - 2 - Math.round(hash(i, 2, seed) * Math.min(h * 0.6, h - 6)); // foot within the footprint
    const tall = Math.round(rise * (0.55 + hash(i, 3, seed) * 0.45) + (h - by) * 0.3);
    stems.push([bx, by, tall, i]);
  }
  stems.sort((a, b) => a[1] - b[1]);
  for (const [bx, by, tall, i] of stems) {
    const kind = hash(i, 4, seed);
    const lean = (hash(i, 5, seed) - 0.5) * 6;
    const tones: readonly Color[] = kind < 0.2 ? ["leaf1", "leaf2", "leaf3"] : ["bamboo1", "bamboo2", "bamboo3"];
    const tip = (t: number) => Math.round(bx + lean * t + swing * t * t * 2);
    for (let k = 0; k < tall; k++) {
      const t = k / tall;
      p.px(tip(t), by - k, tones[t < 0.25 ? 0 : t < 0.7 ? 1 : 2]);
    }
    // A blade peeling off the stem.
    const bt = 0.3 + hash(i, 6, seed) * 0.3, side = hash(i, 7, seed) < 0.5 ? -1 : 1;
    for (let k = 0; k < 7; k++) p.px(tip(bt) + side * Math.round(k * 0.7), by - Math.round(tall * bt) - Math.round(k * 0.6) + Math.floor(k * k / 14), tones[1]);
    const x = tip(1), y = by - tall;
    if (kind > 0.85) art(p, x - 1, y, ["k.", "kK", "kK", "kK", "kk", ".k"], { k: "brown1", K: "brown2" });
    else if (kind > 0.3) art(p, x - 1, y - 3, [".c", "cC", "c.", ".c"], { c: "bamboo3", C: "cream3" });
  }
  // Mud and fallen blades at the foot.
  for (let x = 1; x < w - 1; x++) if (hash(x, 9, seed) < 0.35) p.px(x, h - 1, hash(x, 8, seed) < 0.5 ? "brown2" : "bamboo2");
  // No outline: a reed bed is a haze of fine stems, not a fence of posts.
}

function reedsDef(prop: MapProp): SpriteDef {
  const { w, h: fh } = footprintPx(prop);
  const rise = 40;
  const h = fh + rise;
  return { w, h, frames: 4, fps: 2, anchor: [Math.round(w / 2), h - 1], draw: (p, frame) => drawReeds(p, frame, prop, w, h, rise) };
}

// ── lilies ─────────────────────────────────────────────────────────────────────

/** Water lilies: a few round pads, each split to its centre, one white flower or a closed bud. */
function drawLilies(p: Px, prop: MapProp, w: number, h: number) {
  const seed = idSeed(prop.id);
  const pads: [number, number, number][] = [];
  for (let k = 0; k < 5; k++) pads.push([7 + Math.round(hash(k, 1, seed) * (w - 14)), 8 + Math.round(hash(k, 2, seed) * (h - 14)), 5 + Math.round(hash(k, 3, seed) * 4)]);
  pads.sort((a, b) => a[1] - b[1]);
  pads.forEach(([x, y, r], k) => {
    p.ellipse(x, y + 1, r, r * 0.6, "jade1");
    p.ellipse(x, y, r, r * 0.6, k === 3 ? "oak2" : "jade3");
    p.ellipse(x - 0.5, y - 0.5, r - 1.2, r * 0.6 - 1, k === 3 ? "bamboo3" : k === 4 ? "jade4" : "leaf3");
    p.px(x - Math.round(r * 0.5), y - 1, k === 3 ? "bamboo4" : "leaf4");
    // The split from rim to centre.
    const a = hash(k, 4, seed) * Math.PI * 2;
    for (let s = 0; s < r; s++) p.px(Math.round(x + Math.cos(a) * s), Math.round(y + Math.sin(a) * s * 0.6), null);
  });
  const [fx, fy] = pads[1];
  art(p, fx - 2, fy - 4, [".w.w.", "wWcWw", ".wWw.", "..g.."], { w: "cream4", W: "white", c: "gold4", g: "leaf2" });
  const [bx, by] = pads[2];
  art(p, bx, by - 3, [".p", "pP", ".g"], { p: "pink2", P: "pink3", g: "leaf2" });
  autoOutline(p, { map: { jade: "jade1", leaf: "jade1", oak: "wood1", bamboo: "wood1", cream: "jade1", white: "jade1", pink: "plum1", gold: "wood1" }, sides: ["bottom", "right"] });
}

function liliesDef(prop: MapProp): SpriteDef {
  const { w, h } = footprintPx(prop);
  return { w, h, anchor: [Math.round(w / 2), h - 1], draw: (p) => drawLilies(p, prop, w, h) };
}

export default defineSprites(Object.fromEntries([
  ...mapProps("all", "willow").flatMap((prop) => [[propSpriteId(prop.map, prop.id), willowDef(prop)], [`${propSpriteId(prop.map, prop.id)}-shade`, willowShadeDef(prop)]]),
  ...mapProps("all", "reeds").map((prop) => [propSpriteId(prop.map, prop.id), reedsDef(prop)]),
  ...mapProps("all", "lilies").map((prop) => [propSpriteId(prop.map, prop.id), liliesDef(prop)]),
]));
