/**
 * The courtyard's kitchen gardens and entry planters: brick raised beds the neighbours share (scallions,
 * bok choy, chillies, herbs, beans and a loofah on bamboo trellises) and the two troughs either side of
 * the moon-gate entrance. One sprite per prop, footprint-sized, anchored on its bottom-centre; a bed's
 * soil fills its footprint seen from above, its brick front face below, its plants rising above.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { mound, sticker } from "../plant/_helpers.ts";
import { PLANTS, WALL, brickBed, chilli, choy, coriander, mint, perilla, rows, scallions, trellis, type Frame, type Soil } from "./_beds.ts";
import { art, autoOutline, seedOf, townFoot, townFrame } from "./_helpers.ts";

// ── the four beds ──────────────────────────────────────────────────────────────

type Planting = (p: Px, soil: Soil, f: Frame, seed: number) => void;

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
