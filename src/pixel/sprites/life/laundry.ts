/**
 * Laundry on bamboo poles (晾衣竿) along the lanes: each line is one sprite the width of its footprint,
 * which is long and very thin. The poles ride on iron brackets at second-storey height and the washing
 * hangs from them, so the whole sprite rises above its footprint and nothing touches the ground.
 *
 * Every line belongs to a household, and its washing says who lives there. Over a doorway (the span
 * of the map's exits and steps under the line) only small things hang, high above the lintel.
 * Four frames at 2 fps: a slow breeze lifts the hems a pixel east and lets them fall.
 */
import { defineSprites, hash, type Color, type Px } from "../../kit/index.ts";
import { outdoorMap, mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { TILE } from "../../kit/sprite.ts";
import {
  art, cloth, peg, pole, printCheck, printMotif, printStripes, seedOf, townFrame, type Cloth, type Ramp,
} from "./_helpers.ts";

/** Rows from the top of the sprite to each pole. The back pole sits 103 px above the ground row. */
const BACK = 8, FRONT = 14;
const RISE = 104;
const SWAY = [0, 1, 1, 0];

type Item = { w: number; h: number; draw: (p: Px, x: number, y: number, sway: number) => void };

// ── fabrics ────────────────────────────────────────────────────────────────────

const WHITE: Ramp = ["cream2", "cream3", "cream4", "cream5", "white"];
const DENIM: Ramp = ["blue1", "blue2", "blue3", "blue4"];
const NAVY: Ramp = ["blue1", "blue1", "blue2", "blue3"];
const SKY: Ramp = ["blue2", "blue3", "blue4", "blue5", "blue6"];
const GREY: Ramp = ["steel1", "steel2", "steel3", "steel4"];
const CHARCOAL: Ramp = ["ink", "steel1", "steel2", "steel3"];
const KHAKI: Ramp = ["bamboo1", "bamboo2", "bamboo3", "bamboo4"];
const PINK: Ramp = ["pink1", "pink2", "pink3", "cream5"];
const PLUMC: Ramp = ["plum1", "plum2", "plum3", "plum4"];
const MUSTARD: Ramp = ["gold1", "gold2", "gold3", "gold4"];
const SAGE: Ramp = ["jade2", "jade3", "jade4", "jade5"];
const JADEC: Ramp = ["jade1", "jade2", "jade3", "jade4"];
const ORANGEC: Ramp = ["orange1", "orange2", "orange3", "gold4"];

// ── garment shapes ─────────────────────────────────────────────────────────────

const centred = (w: number, n: number, c = "#") => ".".repeat(Math.floor((w - n) / 2)) + c.repeat(n) + ".".repeat(w - n - Math.floor((w - n) / 2));

/** A shirt or tee silhouette: shoulders, sleeves `sleeve` rows deep, a body `body` wide, `len` tall. */
function topShape(w: number, body: number, len: number, sleeve: number, collar: boolean): string[] {
  const neck = centred(w, 6), mid = Math.floor(w / 2);
  const rows = [collar ? neck.slice(0, mid - 1) + "dd" + neck.slice(mid + 1) : centred(w, w - 6), centred(w, w - 2)];
  for (let j = 0; j < sleeve; j++) rows.push("#".repeat(w));
  rows.push("d".repeat(Math.floor((w - body) / 2)) + "#".repeat(body) + "d".repeat(w - body - Math.floor((w - body) / 2)));
  while (rows.length < len - 1) rows.push(centred(w, body));
  rows.push(centred(w, body, "d"));
  return rows;
}

/** A wire hanger's hook over the pole at (x, y), its shoulders hidden in the garment. */
function hook(p: Px, x: number, y: number): void {
  art(p, x, y - 3, [".s.", "s.s", "..s", ".s.", ".s."], { s: "steel3" });
}

/** A button-down shirt on a hanger: collar points, a placket of buttons, a breast pocket. 18×21. */
function shirt(fabric: Cloth, buttons: Color = "cream4", pocket = true): Item {
  return {
    w: 18, h: 22,
    draw: (p, x, y, sway) => {
      hook(p, x + 8, y);
      cloth(p, x, y + 2, topShape(18, 12, 20, 4, true), fabric, [6, 12], sway);
      const lit = fabric.ramp[fabric.ramp.length - 1], dark = fabric.ramp[Math.max(0, fabric.ramp.length - 3)];
      art(p, x + 6, y + 2, ["w....w", ".w..w."], { w: lit });
      p.vline(x + 9, y + 4, 16, dark);
      for (let j = 5; j < 20; j += 4) p.px(x + 8, y + j, buttons);
      if (pocket) art(p, x + 4, y + 7, ["ddd", "d.d", "ddd"], { d: dark });
    },
  };
}

/** A T-shirt pegged at the shoulders. Child size is 12×12, adult 16×18. */
function tee(fabric: Cloth, small = false): Item {
  const w = small ? 12 : 16;
  return {
    w, h: small ? 13 : 19,
    draw: (p, x, y, sway) => {
      cloth(p, x, y + 1, topShape(w, small ? 8 : 10, small ? 12 : 18, small ? 2 : 3, false), fabric, [Math.floor(w / 2)], sway);
      art(p, x + Math.floor(w / 2) - 2, y + 1, ["d..d", ".dd."], { d: fabric.ramp[0] });
      peg(p, x + 2, y);
      peg(p, x + w - 4, y);
    },
  };
}

/** Trousers pegged by the waistband, legs hanging. 13×30. `jeans` adds gold stitching and a rivet. */
function trousers(fabric: Cloth, jeans = false): Item {
  return {
    w: 13, h: 31,
    draw: (p, x, y, sway) => {
      const shape = ["ddddddddddddd", "#############"];
      for (let j = 0; j < 8; j++) shape.push(j === 6 ? "######s######" : "#############");
      for (let j = 0; j < 19; j++) shape.push(j < 8 ? "######.######" : "#####...#####");
      shape.push("ddddd...ddddd");
      cloth(p, x, y + 1, shape, fabric, [2, 10], sway);
      if (jeans) p.over(() => { art(p, x + 1, y + 3, ["g.........g", ".g.......g."], { g: "gold3" }); p.px(x + 6, y + 2, "steel5"); });
      peg(p, x, y);
      peg(p, x + 11, y);
    },
  };
}

/** A white cotton singlet (老头衫), the summer uniform of every grandfather on the lane. 12×18. */
function singlet(): Item {
  return {
    w: 12, h: 19,
    draw: (p, x, y, sway) => {
      const shape = [".##....##...", ".##....##...", "###....###..", "####..####.."];
      for (let j = 0; j < 13; j++) shape.push(j === 7 ? "#s########.." : "##########..");
      shape.push("dddddddddd..");
      cloth(p, x, y + 1, shape, { ramp: WHITE }, [3, 7], sway);
      // A darned patch under one arm.
      art(p, x + 7, y + 7 + 0, ["c.", ".c"], { c: "cream3" });
      peg(p, x + 1, y);
      peg(p, x + 7, y);
    },
  };
}

/** A towel or tea cloth, striped, with a fringe. */
function towel(colors: readonly Color[], w = 10, h = 15): Item {
  return {
    w, h: h + 1,
    draw: (p, x, y, sway) => {
      const shape = Array.from({ length: h }, (_, j) => (j === h - 1 ? "#.".repeat(w).slice(0, w) : "#".repeat(w)));
      cloth(p, x, y + 1, shape, { ramp: WHITE, print: printStripes([colors[0], null, colors[1] ?? colors[0], null, null], 2) }, [Math.floor(w / 2)], sway);
      peg(p, x + 1, y);
      peg(p, x + w - 3, y);
    },
  };
}

/** A bedsheet folded over the back pole: the reverse shows as a band on top, the hem waves. */
function sheet(w: number, h: number, fabric: Cloth, fold: Ramp): Item {
  return {
    w, h,
    draw: (p, x, y, sway) => {
      const shape = Array.from({ length: h }, (_, j) => {
        if (j < h - 2) return "#".repeat(w);
        return Array.from({ length: w }, (_, i) => (Math.sin(i / 3.2 + j) > (j === h - 1 ? 0.2 : -0.6) ? "#" : ".")).join("");
      });
      cloth(p, x, y + 1, shape, fabric, Array.from({ length: Math.floor(w / 9) }, (_, k) => 5 + k * 9 + (k % 2)), sway);
      p.hline(x, y - 1, w, fold[fold.length - 1]).hline(x, y, w, fold[fold.length - 2]).hline(x, y + 1, w, fold[fold.length - 3]);
      p.hline(x, y + 2, w, fold[0]);
      for (let k = 0; k < w - 4; k += 16) peg(p, x + k + 3, y - 1, "pink2");
    },
  };
}

/**
 * Grandmother's padded jacket (棉袄), the pole threaded through its sleeves the old way so the arms
 * stretch out along it. Plum cotton with small flowers, quilted in diamonds, a mandarin collar and
 * cream frog fastenings down the slanted front. 36×24.
 */
function paddedJacket(): Item {
  return {
    w: 36, h: 24,
    draw: (p, x, y, sway) => {
      const W = 36, body = 18;
      const shape = [centred(W, 6), "..".concat("#".repeat(W - 4), ".."), ".".concat("#".repeat(W - 2), "."), "#".repeat(W), "#".repeat(W), "#".repeat(W)];
      shape.push("dd" + ".".repeat((W - body) / 2 - 2) + "#".repeat(body) + ".".repeat((W - body) / 2 - 2) + "dd");
      for (let j = 0; j < 16; j++) shape.push(centred(W, body, j === 8 ? "#" : "#"));
      shape.push(centred(W, body, "d"));
      cloth(p, x, y - 3, shape, { ramp: PLUMC, print: printMotif(["p.", ".c"], { p: "pink3", c: "cream4" }, 5, 4) }, [14, 21], sway);
      // Quilting: stitched diamonds pressed into the padding, on the lit plum only.
      p.over(() => {
        for (let k = -24; k < W; k += 6) for (let j = 0; j < shape.length; j++) {
          for (const xx of [x + k + j, x + k + shape.length - j]) if (p.get(xx, y - 3 + j) === "plum3") p.px(xx, y - 3 + j, "plum2");
        }
      });
      // Cuff ends, the collar band, frog fastenings.
      for (const cx of [x, x + W - 2]) p.rect(cx, y, 2, 3, "plum1");
      art(p, x + 15, y - 4, ["cccccc"], { c: "plum4" });
      for (const [dx, dy] of [[18, -1], [20, 1], [21, 3], [21, 7], [21, 11], [21, 15]] as const) art(p, x + dx, y + dy, ["ww"], { w: "cream4" });
    },
  };
}

/** A round plastic sock hanger hooked on the pole, clips dangling socks and a pair of pants. 18×16. */
function sockHanger(seed: number, colors: Color = "pink2"): Item {
  return {
    w: 18, h: 16,
    draw: (p, x, y, sway) => {
      hook(p, x + 8, y);
      art(p, x, y + 2, [
        "...pPPPPPPPPPPp...",
        ".pp............pp.",
        "pp..............pp",
        ".pppppppppppppppp.",
      ], { p: colors, P: "pink3" });
      const socks: [Color, Color][] = [["steel3", "steel4"], ["blue1", "blue2"], ["cream4", "white"], ["gold3", "gold4"], ["steel2", "steel3"], ["jade3", "jade4"]];
      for (let i = 0; i < 6; i++) {
        const sx = x + 1 + i * 3, sy = y + 6;
        p.px(sx, sy - 1, "steel4").px(sx, sy, "steel3");
        const dx = i > 2 ? sway : 0;
        if (i === 3) {
          art(p, sx - 1 + dx, sy + 1, ["ppppp", "ppppp", "pP.Pp", "p...p"], { p: "plum3", P: "plum2" });
          continue;
        }
        const [a, b] = socks[Math.floor(hash(i, seed, 2) * socks.length)];
        const len = 6 + Math.floor(hash(seed, i, 3) * 3);
        for (let j = 0; j < len; j++) p.px(sx + (j > 3 ? dx : 0), sy + 1 + j, j === 0 ? a : b).px(sx + 1 + (j > 3 ? dx : 0), sy + 1 + j, a);
        p.px(sx + (i % 2 ? -1 : 2) + dx, sy + len, b);
      }
    },
  };
}

/** A pillowcase with an embroidered scalloped edge. 14×11. */
function pillowcase(fabric: Cloth): Item {
  return {
    w: 14, h: 12,
    draw: (p, x, y, sway) => {
      const shape = Array.from({ length: 10 }, () => "#".repeat(14));
      shape.push("#.#.#.#.#.#.#.");
      cloth(p, x, y + 1, shape, fabric, [7], sway);
      p.over(() => p.hline(x, y + 9, 14, "white"));
      peg(p, x + 1, y);
      peg(p, x + 11, y);
    },
  };
}

/**
 * Soy-cured pork belly (酱油肉) hung to dry on string loops, the way every Shanghai family does it in
 * the cold months: dark lacquered strips with a seam of fat. `n` strips.
 */
function curedPork(n: number): Item {
  return {
    w: n * 6, h: 21,
    draw: (p, x, y, sway) => {
      for (let i = 0; i < n; i++) {
        const sx = x + i * 6, len = 14 + ((i * 3) % 4), dx = i % 2 ? sway : 0;
        art(p, sx + 1, y, ["c.", ".c", "c."], { c: "cream2" });
        for (let j = 0; j < len; j++) {
          const xx = sx + (j > len / 2 ? dx : 0);
          art(p, xx, y + 3 + j, [j === 0 ? "wwRr" : j % 6 === 3 ? "fwrr" : "fRRr"], { f: "cream3", w: "cream4", R: "rose3", r: "rose2" });
          if (j === 1) p.px(xx + 3, y + 3 + j, "rose4");
        }
        art(p, sx + dx, y + 3 + len, [".rr."], { r: "rose1" });
      }
    },
  };
}

/** A salted fish (咸鱼) hung by its tail, head down, silver going gold as it cures. 7×19. */
function saltedFish(): Item {
  return {
    w: 7, h: 19,
    draw: (p, x, y) => {
      art(p, x, y, [
        "...c...",
        "...c...",
        ".fffff.",
        "..fgf..",
        "...g...",
        "..sgG..",
        ".ssgGg.",
        ".sggGg.",
        "fsggGgf",
        ".sggGg.",
        ".sggGg.",
        ".sggGg.",
        ".sggGg.",
        "..sgg..",
        "..sgg..",
        "..skg..",
        "..sgg..",
        "...g...",
      ], { c: "cream2", f: "gold2", s: "steel3", g: "gold3", G: "gold4", k: "ink" });
    },
  };
}

// ── brackets and layout ────────────────────────────────────────────────────────

/** An iron bracket bolted to the wall above, cradling both poles, rust weeping from the bolt. */
function bracket(p: Px, x: number): void {
  p.rect(x - 1, 0, 3, 2, "steel1").px(x - 1, 0, "steel2");
  p.vline(x, 2, FRONT, "steel2");
  p.px(x + 1, 3, "steel1");
  for (const y of [BACK, FRONT]) art(p, x - 1, y + 2, ["s.s", "sss"], { s: "steel2" });
  p.px(x, 2, "orange1").px(x, 3, "orange1");
}

/** Spans (sprite px) under doors: exits, steps and door leaves touching the line, padded a little. */
function doorSpans(prop: MapProp): [number, number][] {
  const near = (y: number) => Math.abs(y - prop.position.y) < 1.6;
  const map = outdoorMap(prop.map);
  const rects = [
    ...map.exits.map((e) => e.rect),
    ...map.props.filter((q) => q.kind === "steps" || q.kind === "open-door-leaf").map((q) => ({ x: q.position.x, y: q.position.y, width: q.width })),
  ];
  return rects
    .filter((r) => near(r.y) && r.x < prop.position.x + prop.width && r.x + r.width > prop.position.x)
    .map((r) => [Math.round((r.x - prop.position.x) * TILE) - 4, Math.round((r.x + r.width - prop.position.x) * TILE) + 4] as [number, number]);
}

/** Items short enough to hang over a door. */
const SMALL = 17;

/**
 * Lay items left to right along a pole from x0 to x1, gaps from the seed. Each item hangs once
 * before any repeats; over a door span only small items may hang, and big ones wait their turn.
 */
function layout(p: Px, items: readonly Item[], x0: number, x1: number, y: number, avoid: readonly [number, number][], seed: number, sway: number): void {
  let queue = [...items], x = x0, round = 0;
  for (let guard = 0; guard < 200 && x < x1; guard++) {
    if (!queue.length) { round++; queue = items.filter((_, i) => items.length < 3 || (i + round) % 2 === 0); }
    const door = avoid.find(([a, b]) => x < b && x + 8 > a);
    const fits = (item: Item) => x + item.w <= x1 && (item.h <= SMALL || !avoid.some(([a, b]) => x < b && x + item.w > a));
    const i = queue.findIndex(fits);
    if (i < 0) {
      if (door) { x = door[1] + 1; continue; }
      const next = avoid.find(([a]) => a > x);
      if (next) { x = next[1] + 1; continue; }
      break;
    }
    const [item] = queue.splice(i, 1);
    item.draw(p, x, y, sway);
    x += item.w + 2 + Math.floor(hash(guard, seed, 7) * 5);
  }
}

// ── the households ─────────────────────────────────────────────────────────────

const PEONY = printMotif([".pp.", "pPPp", ".pg.", "..g."], { p: "pink2", P: "pink3", g: "leaf3" }, 9, 7);
const SPRIG = printMotif(["b.", ".l"], { b: "blue3", l: "leaf3" }, 5, 4);
const DOTS = printMotif(["w"], { w: "white" }, 4, 3);
type Household = { back: Item[]; front: Item[] };

/**
 * The Wangs over the shikumen door: three generations. Grandmother's plum padded jacket, grandfather's
 * singlets, the father's work shirts, the boy's football top, the peony sheet from the wedding.
 */
function wangs(seed: number): Household {
  return {
    back: [
      sheet(50, 40, { ramp: ["cream2", "cream3", "cream4", "cream5"], print: PEONY }, ["pink1", "pink2", "pink3"]),
      sheet(44, 34, { ramp: SKY, print: printCheck("blue3", "blue2", 4) }, ["blue2", "blue3", "blue4"]),
      sheet(40, 36, { ramp: PINK, print: DOTS }, ["pink1", "pink2", "pink3"]),
    ],
    front: [
      paddedJacket(), singlet(), shirt({ ramp: SKY }, "white"), tee({ ramp: MUSTARD, print: printStripes(["jade3", null, null], 2) }, true),
      sockHanger(seed), trousers({ ramp: GREY }), towel(["jade3", "jade4"]), singlet(), shirt({ ramp: WHITE }, "steel3", false),
      tee({ ramp: JADEC, print: printStripes([null, null, "white"], 2) }), trousers({ ramp: CHARCOAL }), towel(["gold2", "gold3"], 9, 13),
      tee({ ramp: ORANGEC }, true), shirt({ ramp: PINK }, "white"),
    ],
  };
}

/**
 * The young couple behind the south houses: jeans, a striped duvet cover, sage and grey, pillowcases
 * in pairs, two white tops from her week on the wards and his navy running shirt.
 */
function couple(seed: number): Household {
  return {
    back: [
      sheet(54, 40, { ramp: WHITE, print: printStripes(["blue4", null, null], 3, true) }, ["steel3", "steel4", "steel5"]),
      sheet(42, 34, { ramp: SAGE }, ["jade3", "jade4", "jade5"]),
      sheet(46, 38, { ramp: ["blue1", "blue2", "blue3", "blue4"], print: SPRIG }, ["blue3", "blue4", "blue5"]),
    ],
    front: [
      trousers({ ramp: DENIM }, true), tee({ ramp: WHITE }), pillowcase({ ramp: PINK }), pillowcase({ ramp: PINK }),
      tee({ ramp: NAVY, print: printStripes(["white", null, null], 1) }), sockHanger(seed, "jade4"), trousers({ ramp: KHAKI }), tee({ ramp: WHITE }),
      towel(["blue3", "blue4"], 11, 16), shirt({ ramp: SAGE }), trousers({ ramp: DENIM }, true), tee({ ramp: MUSTARD }),
      towel(["plum3", "plum4"], 10, 14), shirt({ ramp: SKY }, "white", false),
    ],
  };
}

/** The passage line strung from the bistro's side wall: the cook's cured pork and a salted fish, tea towels, his singlets. */
function cooks(_seed: number): Household {
  return {
    back: [
      sheet(40, 30, { ramp: ["blue1", "blue2", "blue3", "blue4"], print: SPRIG }, ["blue3", "blue4", "blue5"]),
      sheet(36, 28, { ramp: WHITE, print: printCheck("cream3", "blue4", 3) }, ["cream3", "cream4", "cream5"]),
      sheet(40, 32, { ramp: SAGE }, ["jade3", "jade4", "jade5"]),
    ],
    front: [
      curedPork(3), saltedFish(), towel(["blue2", "blue3"], 9, 13), singlet(), curedPork(2), towel(["rose3", "rose4"], 9, 12),
      saltedFish(), tee({ ramp: GREY }), singlet(), towel(["jade3", "jade4"], 9, 12),
    ],
  };
}

const HOUSEHOLDS: Record<string, (seed: number) => Household> = {
  "town.residence-laundry": wangs,
  "town.south-laundry": couple,
  "town.alley-laundry": cooks,
};

export default defineSprites(Object.fromEntries(mapProps("all", "laundry").map((prop) => {
  const f = townFrame(prop, RISE);
  const seed = seedOf(prop.id);
  const household = (HOUSEHOLDS[prop.id] ?? (prop.variant % 2 ? couple : wangs))(seed);
  const avoid = doorSpans(prop);
  return [propSpriteId(prop.map, prop.id), {
    w: f.w, h: f.h, anchor: f.anchor, frames: SWAY.length, fps: 2,
    draw: (p: Px, frame: number) => {
      const W = f.w, sway = SWAY[frame];
      const brackets = [2, W - 3];
      for (let x = 110; x < W - 60; x += 110) brackets.push(x + Math.floor(hash(x, seed, 1) * 20));
      pole(p, 0, W, BACK, seed);
      layout(p, household.back, 5, W - 4, BACK + 1, avoid, seed + 1, sway);
      pole(p, 0, W, FRONT, seed + 9);
      layout(p, household.front, 4, W - 4, FRONT + 1, avoid, seed + 2, sway);
      for (const x of brackets) bracket(p, x);
      for (const y of [BACK, FRONT]) { p.px(0, y, "bamboo5").px(0, y + 1, "bamboo3"); p.px(W - 1, y, "bamboo3").px(W - 1, y + 1, "bamboo1"); }
    },
  }];
})));
