/**
 * The riverbank's ferry landing and the park's harvest: the ferryman's covered sampan, his mooring post
 * and rope, the stepping stones at the landing polished by feet, a family's mid-autumn picnic, and the
 * orchard handcart. One sprite per prop (`<map>/<id>`), footprint-sized, on the footprint's bottom-centre.
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { art, autoOutline, basket, cylinder, orangeHeap, printCheck, seedOf, townFoot, townFrame } from "./_helpers.ts";

type Frame = ReturnType<typeof townFrame>;
type Draw = (p: Px, f: Frame, prop: MapProp, frame: number) => void;

function kind(name: string, rise: number, draw: Draw, options: { floor?: boolean; frames?: number; fps?: number; shadow?: boolean } = {}): [string, SpriteDef][] {
  return mapProps("all", name).map((prop) => {
    const f = townFrame(prop, rise);
    return [propSpriteId(prop.map, prop.id), {
      w: f.w, h: f.h, anchor: f.anchor,
      ...(options.floor ? { layer: "floor" as const } : { foot: townFoot(prop) }),
      ...(options.frames ? { frames: options.frames, fps: options.fps ?? 2 } : {}),
      ...(options.shadow && !options.floor ? { shadow: { rx: Math.round(f.w / 2) - 4, ry: Math.max(3, Math.round(f.depth / 6)), dy: -Math.round(f.depth / 3) } } : {}),
      draw: (p: Px, frame: number) => draw(p, f, prop, frame),
    }];
  });
}

const OUTLINE = { oak: "wood1", wood: "wood1", bamboo: "wood1", stone: "stone1", steel: "steel1", cream: "stone1", white: "stone1", gold: "wood1", orange: "brown1", blue: "blue1", leaf: "leaf1", jade: "jade1", rose: "rose1", brown: "wood1", hair: "ink", ink: "ink", plum: "plum1" } as const;

// ── the ferry boat ─────────────────────────────────────────────────────────────

const BOB = [0, 1, 1, 0];

/**
 * Old Tang's ferry, a black-awning sampan (乌篷船) of tung-oiled fir: the hull swept up at bow and stern,
 * three arched hoods of woven bamboo blackened with soot and tar, a sculling oar (橹) shipped at the
 * stern, a coil of rope on the foredeck, his tea jar and a bamboo pole along the gunwale. It rides on
 * the water and bobs: four frames at 2 fps, rings of ripple at the waterline.
 */
const drawBoat: Draw = (p, f, _prop, frame) => {
  const G = f.gy, W = f.w, bob = BOB[frame];
  const water = G - 14;
  // Ripples round the waterline, translucent, moving with the bob.
  p.faded(0.45, () => {
    for (let k = 0; k < 3; k++) {
      const y = water + 2 + k * 3 + (frame % 2), x0 = 10 + k * 6 - bob * 2, x1 = W - 10 - k * 6 + bob * 2;
      for (let x = x0; x < x1; x += 1) if ((x + k * 3 + frame) % 9 < 5) p.px(x, y, k === 0 ? "blue6" : "blue5");
    }
  });
  p.faded(0.25, () => p.ellipse(W / 2, water + 4, W / 2 - 14, 4, "blue1"));
  // Plan: the near gunwale 9 px above the water, the deck seen between the gunwales, the far gunwale
  // 18 px further up the screen; both rise at bow and stern (the sheer).
  const near = water - 9 + bob, far = near - 18;
  const sheer = (x: number) => { const u = (x - W / 2) / (W / 2 - 6); return Math.round(9 * u ** 4); };
  const pinch = (x: number) => { const u = Math.abs((x - W / 2) / (W / 2 - 6)); return Math.round(9 * u ** 3); };
  // The deck and the inside of the hull, narrowing to the bow and stern.
  for (let x = 8; x < W - 8; x++) {
    const top = far - sheer(x) + pinch(x), bottom = near - sheer(x) - Math.round(pinch(x) / 3);
    for (let y = top; y < bottom; y++) p.px(x, y, y === top ? "oak5" : y === top + 1 ? "oak3" : (x % 12) === 0 ? "wood2" : y > bottom - 3 ? "oak2" : "oak3");
  }
  // The near side: planks down to the waterline, tarred at the bottom, swept up at the ends.
  for (let x = 6; x < W - 6; x++) {
    const top = near - sheer(x) - Math.round(pinch(x) / 3), u = Math.abs((x - W / 2) / (W / 2 - 6));
    const keel = water + bob - Math.round(5 * u ** 2);
    for (let y = top; y <= keel; y++) {
      const r = y - top;
      p.px(x, y, r === 0 ? "oak5" : r === 1 ? "oak4" : y >= keel - 1 ? "wood1" : r % 4 === 1 ? "wood2" : x < W * 0.4 ? "oak3" : "oak2");
    }
  }
  // Bow and stern posts.
  art(p, W - 11, near - 16, ["..a", ".ab", "abb", "bbc", "bcc"], { a: "oak5", b: "oak4", c: "oak2" });
  art(p, 7, near - 16, ["a..", "ba.", "bba", "cbb", "ccb"], { a: "oak5", b: "oak4", c: "oak2" });
  // Three woven hoods across the middle: low barrel vaults seen from above, rounded at the ends, the
  // middle one a little taller; woven bamboo blackened with soot and tar, lit on the left.
  const hoods: [number, number, number][] = [[44, 22, 6], [68, 28, 9], [98, 22, 6]];
  for (const [hx, hw, rise] of hoods) {
    const top = far - rise - 2, bottom = near + 1;
    for (let x = hx; x < hx + hw; x++) {
      const u = (x - hx + 0.5) / hw;
      const round = Math.round((1 - Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2))) * 5);
      for (let y = top + round; y < bottom; y++) {
        const lit = u < 0.32, crown = y < top + round + 3;
        const weave = (x + y) % 4 === 0 || (x - y + 64) % 4 === 0;
        p.px(x, y, crown ? (lit ? "steel3" : "hair3") : weave ? (lit ? "hair3" : "ink2") : lit ? "steel2" : "hair2");
      }
    }
    // The hood's open end facing us: a dark arched mouth.
    p.rect(hx + 3, near - 4, hw - 6, 5, "ink");
    p.vline(hx, top + 4, bottom - top - 4, "bamboo2").vline(hx + hw - 1, top + 4, bottom - top - 4, "bamboo2");
  }
  const y0 = far + 6;
  // Coiled rope on the foredeck, the tea jar, the pole along the gunwale.
  for (let k = 0; k < 3; k++) p.ellipse(W - 30, y0 + 4 + k * 0.5, 7 - k * 2, 2.5 - k * 0.5, k === 1 ? "bamboo4" : "bamboo3");
  p.px(W - 30, y0 + 4, "bamboo2");
  art(p, 126, y0 - 2, [".gg.", "gGgg", "gggg", ".gg."], { g: "jade3", G: "jade5" });
  p.line(18, near - 2 - sheer(18), W - 18, near - 2 - sheer(W - 18), "bamboo4");
  // The sculling oar shipped over the stern, its blade trailing in the water.
  p.line(26, y0, 2, water + 2 + bob, "oak3").line(27, y0, 3, water + 2 + bob, "oak2");
  art(p, 0, water + bob, ["oo.", "ooo", ".oo"], { o: "oak2" });
  autoOutline(p, { map: OUTLINE });
};

// ── the mooring post, the rope, the stones ─────────────────────────────────────

/** A granite mooring post (系缆石) at the landing, its neck worn into grooves by a century of ropes, an iron ring set in it. */
const drawMooring: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, cx = Math.round(W / 2);
  cylinder(p, cx - 7, G - 22, 14, 22, ["stone1", "stone2", "stone3", "stone4", "stone5"], (j) => (j > 6 && j < 10 ? 1 : 0));
  p.ellipse(cx, G - 22, 7, 2.5, "stone4");
  p.ellipse(cx - 0.5, G - 22.5, 5.5, 1.6, "stone5");
  p.over(() => { p.speckle(cx - 7, G - 22, 14, 22, "stone2", 0.06, seedOf(prop.id)); p.hline(cx - 7, G - 14, 14, "stone2"); });
  art(p, cx + 3, G - 12, [".sss.", "s...s", "s...s", ".sss."], { s: "steel2" });
  // The rope's turns round the neck and its tail.
  for (const y of [G - 16, G - 15]) p.hline(cx - 7, y, 14, y % 2 ? "bamboo3" : "bamboo4");
  p.line(cx - 7, G - 15, cx - 12, G - 4, "bamboo3");
  art(p, cx - 6, G - 4, ["mM.", ".m."], { m: "leaf2", M: "leaf3" });
  autoOutline(p, { map: OUTLINE });
};

/** The ferry's rope from the boat's bow to the post: sagging almost to the stones, a loose coil by the post. */
const drawRope: Draw = (p, f) => {
  const G = f.gy, W = f.w;
  for (let x = 0; x < W; x++) {
    const u = x / (W - 1);
    const y = Math.round((G - 14) * (1 - u) + (G - 16) * u + 10 * Math.sin(u * Math.PI));
    p.px(x, y, (x % 3) === 0 ? "bamboo2" : "bamboo3").px(x, y - 1, (x % 3) === 1 ? "bamboo4" : "bamboo3");
  }
  for (let k = 0; k < 2; k++) p.ellipse(W - 12, G - 4 + k, 6 - k * 2, 2, k ? "bamboo4" : "bamboo3");
  p.ellipse(W - 12, G - 4, 2.5, 0.8, null);
  autoOutline(p, { map: OUTLINE });
};

/** Stepping stones at the landing: granite slabs polished pale in the middle by feet, moss in the joints, a damp edge toward the water. */
const drawWornStones: Draw = (p, f, prop) => {
  const G = f.gy, seed = seedOf(prop.id);
  const stones: [number, number, number, number][] = [[6, G - 52, 22, 12], [30, G - 40, 24, 13], [8, G - 26, 26, 12], [36, G - 14, 22, 11]];
  for (const [x, y, w, h] of stones) {
    p.ellipse(x + w / 2, y + h / 2 + 1, w / 2, h / 2, "stone2");
    p.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, "stone3");
    p.ellipse(x + w / 2 - 1, y + h / 2 - 0.5, w / 2 - 2, h / 2 - 2, "stone4");
    p.ellipse(x + w / 2, y + h / 2, w / 4, h / 4, "stone5");
    p.px(Math.round(x + w * 0.38), Math.round(y + h * 0.35), "white");
    p.over(() => p.speckle(x, y, w, h, "stone3", 0.05, seed + x));
    for (let k = 0; k < 4; k++) { const a = hash(k, x, seed) * Math.PI * 2; p.px(Math.round(x + w / 2 + Math.cos(a) * (w / 2 + 1)), Math.round(y + h / 2 + Math.sin(a) * (h / 2 + 1)), k % 2 ? "leaf2" : "leaf3"); }
  }
  // The lowest stone dark with river damp on its west edge.
  p.faded(0.35, () => p.ellipse(10, G - 22, 6, 4, "blue1"));
};

// ── the picnic ─────────────────────────────────────────────────────────────────

/**
 * A family's mid-autumn picnic under the heron copse: a blue-and-white check cloth spread a little
 * askew, a flowered thermos, a tin of mooncakes with one cut into quarters, a heap of mandarins, two
 * cups, a paper bag of roast chestnuts and a straw hat; one corner of the cloth folded back by the wind.
 */
const drawPicnic: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, D = f.depth, seed = seedOf(prop.id);
  const x0 = 14, y0 = G - D + 16, cw = W - 28, ch = D - 30;
  // The cloth, skewed: each row slides a pixel every few rows.
  const check = printCheck("blue5", "blue4", 6);
  const cloth = (x: number, y: number) => { const j = y - y0; const sx = x0 + Math.round(j * 0.15); return x >= sx && x < sx + cw && j >= 0 && j < ch; };
  for (let y = y0; y < y0 + ch; y++) for (let x = 0; x < W; x++) if (cloth(x, y)) p.px(x, y, "cream5");
  p.over(() => check(p, 0, 0, W, f.h));
  // The folded-back corner shows the cloth's plain back, and its hem.
  art(p, x0 + cw - 10 + Math.round(ch * 0.15), y0 + ch - 9, [
    ".......c",
    "......cC",
    ".....cCC",
    "....cCCC",
    "...cCCCc",
    "..cCCCc.",
    ".cCCCc..",
    "ccccc...",
  ], { c: "cream3", C: "cream5" });
  p.over(() => { for (let x = 0; x < W; x++) for (let y = y0; y < y0 + ch; y++) if (cloth(x, y) && !cloth(x, y + 1)) p.px(x, y, "blue2"); });
  // Mooncake tin: a round gold tin, its lid off beside it, four cakes, one in quarters.
  const mx = x0 + 18, my = y0 + 10;
  p.ellipse(mx, my + 1, 12, 6, "gold1");
  p.ellipse(mx, my, 12, 6, "gold3");
  p.ellipse(mx, my, 10.5, 5, "rose2");
  for (const [dx, dy, cut] of [[-5, -1, false], [3, -2, false], [-1, 2, false], [6, 2, true]] as const) {
    art(p, mx + dx - 3, my + dy - 2, cut ? ["oO.o", "oy.o", "....", "oo.o"] : [".oOo.", "oOyOo", "oyOyo", ".ooo."], { o: "gold2", O: "gold3", y: "oak5" });
  }
  p.ellipse(mx + 22, my + 12, 9, 4.5, "gold3");
  p.ellipse(mx + 22, my + 11.5, 7, 3, "gold4");
  // Mandarins heaped, two cups, the thermos, the chestnut bag, the hat.
  orangeHeap(p, x0 + cw - 30, y0 + 16, 9, 3, seed);
  art(p, x0 + 44, y0 + 26, ["wWw.wWw", "wcw.wcw", ".c...c."], { w: "white", W: "cream5", c: "cream3" });
  cylinder(p, x0 + cw - 14, y0 - 2, 8, 17, ["cream2", "cream3", "cream4", "cream5", "white"]);
  p.over(() => { p.px(x0 + cw - 12, y0 + 6, "pink2").px(x0 + cw - 9, y0 + 9, "pink2").px(x0 + cw - 11, y0 + 8, "leaf3"); p.hline(x0 + cw - 14, y0 - 1, 8, "jade3"); });
  art(p, x0 + cw - 13, y0 - 4, ["oooooo", ".oooo."], { o: "oak3" });
  art(p, x0 + 6, y0 + ch - 14, [".bbbb.", "bBBBBb", "bbbbbb", "bbbbbb", ".bbbb.", "..cc.."], { b: "oak4", B: "oak5", c: "brown2" });
  art(p, x0 + 10, y0 + ch - 16, ["c.c", ".cc"], { c: "brown2" });
  // The straw hat just off the cloth, crown up.
  const hx = W - 16, hy = G - 14;
  p.ellipse(hx, hy + 1, 11, 5, "bamboo2");
  p.ellipse(hx, hy, 11, 5, "bamboo4");
  p.ellipse(hx - 1, hy - 2, 5, 3.5, "bamboo3");
  p.ellipse(hx - 1.5, hy - 2.5, 4, 2.5, "bamboo5");
  p.hline(hx - 6, hy - 1, 10, "blue2");
  autoOutline(p, { map: OUTLINE });
};

// ── the orchard cart ───────────────────────────────────────────────────────────

/**
 * The orchard's handcart (板车): a bed of worn planks on two bicycle-spoked wheels with old rubber tyres,
 * its shafts resting on the soil, loaded with a basket of persimmons, a basket of pears and a sack of
 * chestnuts tied at the neck; a picking pole across the load and a pair of cotton gloves on a shaft.
 */
const drawCart: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, seed = seedOf(prop.id);
  // Shafts running out to the left, down onto the ground.
  p.line(2, G - 4, 22, G - 22, "oak3").line(2, G - 3, 22, G - 21, "oak2");
  p.line(6, G - 12, 24, G - 28, "oak3");
  art(p, 6, G - 9, ["cC", "cc", "bb"], { c: "cream4", C: "white", b: "blue3" });
  // The bed: top face of planks, its front edge.
  const bx = 18, bw = W - 22, by = G - 34;
  p.rect(bx, by, bw, 14, "oak4");
  for (let y = by; y < by + 14; y += 4) p.hline(bx, y, bw, "oak3");
  p.hline(bx, by, bw, "oak5");
  p.rect(bx, by + 14, bw, 4, "oak2").hline(bx, by + 14, bw, "oak3");
  // The load: two baskets and the sack.
  const b1 = basket(p, bx + 2, by - 6, 20, 6, 10, { taper: 2 });
  for (let k = 0; k < 7; k++) art(p, bx + 4 + (k % 4) * 4, b1.top - 4 + Math.floor(k / 4) * 2, [".s.", "oOo", "ooo"], { s: "leaf1", o: "orange2", O: "orange3" });
  b1.front();
  const b2 = basket(p, bx + 22, by - 4, 18, 6, 9, { taper: 2 });
  for (let k = 0; k < 6; k++) art(p, bx + 24 + (k % 3) * 5, b2.top - 4 + Math.floor(k / 3) * 2, [".s.", "gGg", "ggg"], { s: "wood2", g: "gold3", G: "gold4" });
  b2.front();
  art(p, bw + bx - 9, by - 12, [
    "..ss..",
    "..tt..",
    ".ssss.",
    "sSsssq",
    "sSsssq",
    "sssssq",
    ".qqqq.",
  ], { s: "bamboo4", S: "bamboo5", q: "bamboo2", t: "cream2" });
  p.line(bx - 2, by - 8, bx + bw, by - 14, "bamboo3");
  // The near wheel, face on: rubber tyre, spokes, hub; the far one peeping under the bed.
  p.ellipse(bx + bw / 2 + 4, G - 13, 10, 10, "steel1");
  p.ellipse(bx + bw / 2 + 4, G - 13, 8.5, 8.5, "steel2");
  p.ellipse(bx + bw / 2 + 4, G - 13, 7, 7, null);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; p.line(Math.round(bx + bw / 2 + 4), G - 13, Math.round(bx + bw / 2 + 4 + Math.cos(a) * 6), Math.round(G - 13 + Math.sin(a) * 6), "steel3"); }
  p.ellipse(bx + bw / 2 + 4, G - 13, 1.5, 1.5, "steel4");
  // Persimmon leaves fallen on the bed.
  for (let k = 0; k < 3; k++) art(p, bx + 4 + Math.floor(hash(k, 1, seed) * (bw - 8)), by + 8 + Math.floor(hash(k, 2, seed) * 4), ["oO"], { o: "orange1", O: "orange2" });
  autoOutline(p, { map: OUTLINE });
};

export default defineSprites(Object.fromEntries([
  ...kind("boat", 24, drawBoat, { frames: BOB.length, fps: 2 }),
  ...kind("mooring", 4, drawMooring, { shadow: true }),
  ...kind("tied-rope", 6, drawRope),
  ...kind("worn-stones", 0, drawWornStones, { floor: true }),
  ...kind("picnic", 8, drawPicnic, { floor: true }),
  ...kind("cart", 8, drawCart, { shadow: true }),
]));
