/**
 * The woods' smaller plants, one sprite per prop as `<map>/<id>`: bamboo clumps (`bamboo`, swaying),
 * ferns (`fern`, five kinds, small and cheap) and flower clumps (`flowers`: autumn wildflowers and
 * the odd planted patch). Each stands on its footprint's centre, the anchor its bottom-centre.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { lance } from "../decor/_helpers.ts";
import { art, autoOutline, bloom, mound, star } from "./_helpers.ts";

const SWAY = [0, 1, 0, -1];
const idSeed = (id: string) => { let s = 0; for (const ch of id) s = (s * 31 + ch.charCodeAt(0)) | 0; return (s >>> 0) % 100000; };

// ── bamboo ───────────────────────────────────────────────────────────────────

const LEAF: Color[] = ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
const DRY_LEAF: Color[] = ["wood1", "oak1", "bamboo2", "bamboo3", "bamboo4"];

/**
 * A clump of moso bamboo (毛竹): a dozen culms fanning up from one root, ringed at the nodes, the old
 * ones gone yellow-grey, leaf sprays heavy at the top. Papery sheaths and dry leaves at the foot.
 */
function drawBamboo(p: Px, frame: number, prop: MapProp, w: number, h: number) {
  const seed = idSeed(prop.id);
  const swing = SWAY[frame];
  const base = h - Math.round(footprintPx(prop).h / 2);
  const cx = w / 2;
  const n = 9 + Math.floor(hash(1, 1, seed) * 5);
  const culms: { bx: number; tx: number; ty: number; width: number; old: boolean }[] = [];
  for (let i = 0; i < n; i++) {
    const bx = Math.round(cx + (hash(i, 2, seed) - 0.5) * 24);
    const ty = Math.round(4 + hash(i, 3, seed) * 36);
    culms.push({ bx, tx: Math.round(bx + (bx - cx) * 2.2 + (hash(i, 4, seed) - 0.5) * 12), ty, width: hash(i, 5, seed) < 0.6 ? 3 : 2, old: hash(i, 6, seed) < 0.22 });
  }
  culms.sort((a, b) => a.ty - b.ty);
  // Leaf sprays behind, darker.
  const sprays = (back: boolean) => culms.forEach((c, i) => {
    for (let k = 0; k < 4; k++) {
      const t = 0.02 + k * 0.14 + hash(i, k, seed + 7) * 0.06;
      const y = Math.round(c.ty + (base - c.ty) * t);
      const x = Math.round(c.tx + (c.bx - c.tx) * t + swing * (1 - t));
      const dir = (k + i) % 2 ? 1 : -1;
      const len = 10 + Math.round(hash(i, k, seed + 8) * 6);
      lance(p, [[x, y], [x + dir * Math.round(len * 0.6), y + 2], [x + dir * len, y + 6]], { width: 2, shift: back ? -1 : 0, ramp: c.old && k === 0 ? DRY_LEAF : LEAF });
      lance(p, [[x, y], [x + dir * 5, y - 3], [x + dir * 8, y - 3]], { width: 2, shift: back ? -1 : 1 });
    }
  });
  sprays(true);
  for (const c of culms) {
    const tones: Color[] = c.old ? ["stone2", "bamboo2", "bamboo3"] : ["jade2", "jade3", "leaf3"];
    for (let y = c.ty; y <= base; y++) {
      const t = (base - y) / (base - c.ty);
      const x = Math.round(c.bx + (c.tx - c.bx) * t * t + swing * Math.max(0, t - 0.5) * 2);
      for (let i = 0; i < c.width; i++) p.px(x + i, y, i === 0 ? tones[2] : i === c.width - 1 ? tones[0] : tones[1]);
      if ((y - c.ty) % 11 === 5) { for (let i = 0; i < c.width; i++) p.px(x + i, y, c.old ? "stone3" : "jade4"); p.px(x + c.width, y, tones[0]); }
    }
  }
  sprays(false);
  // The foot: papery sheaths and dry leaves.
  for (let k = 0; k < 6; k++) {
    const x = Math.round(cx + (hash(k, 9, seed) - 0.5) * 30), y = base - 1 + Math.round(hash(k, 10, seed) * 6);
    art(p, x, y, k % 2 ? ["bbB."] : [".bB", "bB."], { b: "bamboo3", B: "bamboo4" });
  }
  autoOutline(p, { map: { leaf: "leaf1", jade: "jade1", bamboo: "wood1", stone: "stone1", oak: "wood1", wood: "wood1" } });
}

function bambooDef(prop: MapProp): SpriteDef {
  const { w: fw, h: fh } = footprintPx(prop);
  const w = fw + 48, h = 132 + Math.round(fh / 2);
  return { w, h, frames: 4, fps: 2, anchor: [Math.round(w / 2), h - 1], draw: (p, frame) => drawBamboo(p, frame, prop, w, h) };
}

// ── ferns ─────────────────────────────────────────────────────────────────────

type FernKind = { name: string; rachis: Color; tones: readonly Color[]; fronds: number; reach: number; strap?: boolean };
const FERNS: readonly FernKind[] = [
  /** Sword fern, dark and glossy, evergreen. */
  { name: "sword", rachis: "leaf1", tones: ["leaf1", "leaf2", "leaf3"], fronds: 8, reach: 20 },
  /** Bracken gone bronze for the autumn. */
  { name: "bracken", rachis: "oak1", tones: ["oak1", "oak3", "bamboo4"], fronds: 6, reach: 22 },
  /** Lady fern, pale and lacy, half turned. */
  { name: "lady", rachis: "leaf2", tones: ["leaf2", "leaf3", "bamboo4"], fronds: 7, reach: 18 },
  /** Hart's tongue: plain strap leaves, no leaflets. */
  { name: "tongue", rachis: "jade2", tones: ["jade2", "jade3", "leaf3"], fronds: 6, reach: 15, strap: true },
  /** A young fern, still unrolling its fiddleheads. */
  { name: "young", rachis: "leaf2", tones: ["leaf2", "leaf3", "leaf4"], fronds: 5, reach: 13 },
];

/** A fern: fronds arching out of a crown at the footprint's centre, leaflets alternating along them. */
function drawFern(p: Px, prop: MapProp, w: number, h: number) {
  const seed = idSeed(prop.id);
  const kind = FERNS[(prop.variant + Math.floor(hash(seed, 1, 5) * 4)) % FERNS.length];
  const cx = w / 2, cy = h - Math.round(footprintPx(prop).h / 2) + 4;
  const fronds = kind.fronds + Math.floor(hash(seed, 2, 5) * 3);
  for (let f = 0; f < fronds; f++) {
    // Back fronds first: upright ones behind, low arching ones in front.
    const a = Math.PI * (1.08 + (0.84 * f) / (fronds - 1)) + (hash(f, 3, seed) - 0.5) * 0.25;
    const reach = kind.reach * (0.75 + hash(f, 4, seed) * 0.35);
    const up = Math.abs(Math.sin(a));
    const pts: [number, number][] = [];
    for (let s = 0; s <= reach; s++) {
      const t = s / reach;
      pts.push([cx + Math.cos(a) * s * 0.9, cy + Math.sin(a) * s + t * t * reach * 0.35 * (1 - up * 0.5)]);
    }
    const lit = Math.cos(a) < 0.2;
    pts.forEach(([x, y], s) => {
      const t = s / reach;
      if (kind.strap) {
        const wide = t < 0.15 || t > 0.9 ? 1 : 2;
        for (let k = 0; k < wide; k++) p.px(Math.round(x), Math.round(y) - k, kind.tones[k === wide - 1 && lit ? 2 : 1]);
        return;
      }
      p.px(Math.round(x), Math.round(y), kind.rachis);
      if (s % 2 || t < 0.08) return;
      const len = Math.max(1, Math.round((1 - t) * 4 + 1));
      for (const side of [-1, 1]) for (let k = 1; k <= len; k++) {
        const nx = -Math.sin(a) * side, ny = Math.cos(a) * side * 0.75;
        p.px(Math.round(x + nx * k), Math.round(y + ny * k + k * 0.3), kind.tones[k === len ? (side < 0 && lit ? 2 : 0) : 1]);
      }
    });
    if (kind.name === "young" && f % 2 === 0) {
      const [x, y] = pts[pts.length - 1];
      art(p, Math.round(x) - 1, Math.round(y) - 2, [".g.", "gHg", ".g."], { g: "leaf3", H: "leaf5" });
    }
  }
  autoOutline(p, { map: { leaf: "leaf1", oak: "wood1", bamboo: "wood1", jade: "jade1" }, sides: ["bottom", "right", "left"] });
}

function fernDef(prop: MapProp): SpriteDef {
  const { w, h } = footprintPx(prop);
  return { w, h, anchor: [Math.round(w / 2), h - 1], draw: (p) => drawFern(p, prop, w, h) };
}

// ── flowers ───────────────────────────────────────────────────────────────────

const GREEN: Color[] = ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
const SAGE: Color[] = ["jade1", "jade1", "jade2", "jade3", "jade4", "jade5"];

type Clump = { name: string; draw: (q: Px, w: number, h: number, seed: number) => void };
/** The flower clumps of the autumn park: mostly wild, a few somebody planted. */
const CLUMPS: readonly Clump[] = [
  {
    // Wild chrysanthemum (野菊): a loose mound starred with small gold daisies.
    name: "wild-chrysanthemum",
    draw: (q, w, h, s) => {
      mound(q, w / 2, h - 7, w / 2 - 3, 5, GREEN, s);
      for (let k = 0; k < 8; k++) star(q, 3 + Math.round(hash(k, 1, s) * (w - 8)), h - 15 + Math.round(hash(k, 2, s) * 8), "gold4", "gold2", "orange2");
    },
  },
  {
    // Purple asters on wiry stems.
    name: "asters",
    draw: (q, w, h, s) => {
      mound(q, w / 2, h - 6, w / 2 - 4, 4, SAGE, s);
      for (let k = 0; k < 7; k++) {
        const x = 4 + Math.round(hash(k, 1, s) * (w - 10)), y = h - 18 + Math.round(hash(k, 2, s) * 8);
        q.line(x + 1, y + 2, Math.round(w / 2), h - 6, "leaf2");
        star(q, x, y, "plum4", "plum3", "gold4");
      }
    },
  },
  {
    // Cosmos gone leggy at the end of the season: pink and white on feathery stems.
    name: "cosmos",
    draw: (q, w, h, s) => {
      for (let k = 0; k < 6; k++) {
        const x = 3 + Math.round(hash(k, 1, s) * (w - 9)), y = 2 + Math.round(hash(k, 2, s) * 10);
        q.line(x + 1, y + 2, Math.round(w / 2) + (k % 3) - 1, h - 3, "leaf3");
        q.px(x + 2, y + 6, "leaf4").px(x, y + 9, "leaf4");
        art(q, x, y, [".p.", "pcp", ".q."], k % 3 === 2 ? { p: "white", c: "gold4", q: "cream3" } : { p: "pink3", c: "gold4", q: "pink2" });
      }
    },
  },
  {
    // Goldenrod plumes, a little rusty.
    name: "goldenrod",
    draw: (q, w, h, s) => {
      for (let k = 0; k < 5; k++) {
        const x = 4 + k * 5 + Math.round(hash(k, 1, s) * 2);
        q.line(x, 8 + (k % 3) * 2, Math.round(w / 2) + k - 2, h - 3, "leaf2");
        art(q, x - 2, 2 + (k % 3) * 2, [".yY.", "yYyo", ".yy.", "..y.", ".y.."], { y: "gold3", Y: "gold4", o: "orange1" });
      }
      mound(q, w / 2, h - 5, w / 2 - 5, 3, GREEN, s);
    },
  },
  {
    // A planted patch: marigolds somebody keeps going by the path.
    name: "marigolds",
    draw: (q, w, h, s) => {
      mound(q, w / 2, h - 7, w / 2 - 3, 5, GREEN, s);
      for (const [x, y] of [[5, h - 14], [12, h - 16], [18, h - 13], [9, h - 10], [16, h - 9]] as const) bloom(q, x, y, ["orange1", "orange2", "orange3", "gold4"]);
    },
  },
  {
    // Red spider lilies (彼岸花), the season's: bare stalks, curled scarlet heads. Rare by design.
    name: "spider-lilies",
    draw: (q, w, h, s) => {
      for (let k = 0; k < 3; k++) {
        const x = 7 + k * 6 + Math.round(hash(k, 1, s) * 2), y = 5 + (k % 2) * 4;
        q.vline(x + 2, y + 4, h - y - 6, "leaf3");
        art(q, x, y, ["r.r.r", ".rRr.", "rRrRr", ".r.r."], { r: "red3", R: "red4" });
      }
    },
  },
];

function drawFlowers(p: Px, prop: MapProp, w: number, h: number) {
  const seed = idSeed(prop.id);
  // One spider-lily patch in about every eight clumps; the rest spread over the others.
  const roll = hash(seed, 1, 13);
  const clump = roll < 0.12 ? CLUMPS[5] : CLUMPS[(prop.variant * 2 + Math.floor(hash(seed, 2, 13) * 5)) % 5];
  p.clip(0, 0, w, h, () => clump.draw(p, w, h, seed));
  autoOutline(p, { map: { leaf: "leaf1", jade: "jade1", gold: "wood1", orange: "brown1", plum: "plum1", pink: "plum1", white: "leaf1", cream: "leaf1", red: "red1" } });
}

function flowersDef(prop: MapProp): SpriteDef {
  const { w: fw, h: fh } = footprintPx(prop);
  const w = Math.max(fw, 28), h = fh + 4;
  return { w, h, anchor: [Math.round(w / 2), h - 1], draw: (p) => drawFlowers(p, prop, w, h) };
}

export default defineSprites(Object.fromEntries([
  ...mapProps("all", "bamboo").map((prop) => [propSpriteId(prop.map, prop.id), bambooDef(prop)]),
  ...mapProps("all", "fern").map((prop) => [propSpriteId(prop.map, prop.id), fernDef(prop)]),
  ...mapProps("all", "flowers").map((prop) => [propSpriteId(prop.map, prop.id), flowersDef(prop)]),
]));

