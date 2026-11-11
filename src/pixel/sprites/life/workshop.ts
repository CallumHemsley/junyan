/**
 * Old Fang's repair workshop: the benches and the small things on and around them. One sprite per prop
 * (`workshop/<id>`), sized to its footprint and anchored on its bottom-centre (pixel-contracts).
 *
 * Things standing on a bench (the magnifier lamp, the green lamp, the kettle, the chalk board, the chair
 * in its clamps, the mending box) are their own props, but their anchors lie inside the bench's
 * footprint, north of its front edge, so the bench sorts in front of them and its top would hide them.
 * So each is drawn by one function at its world position, lifted onto the bench top, and called twice:
 * by its own sprite and by its bench's sprite, which paints it over its own top. The two copies land
 * on the same pixels, and the part rising above the bench comes from the item's own sprite.
 *
 * Light points (world tiles, for glow lights): see `LIGHTS` at the bottom of the file.
 */
import { Px, defineSprites, hash, type Color, type SpriteDef } from "../../kit/index.ts";
import { TILE } from "../../kit/sprite.ts";
import { mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { art, autoOutline, cylinder, seedOf, townFrame, weaveAt } from "./_helpers.ts";

const MAP = "workshop";
const OUTLINE = { oak: "wood1", wood: "wood1", bamboo: "wood1", stone: "stone1", steel: "steel1", cream: "wood1", white: "steel1", gold: "wood1", orange: "brown1", blue: "blue1", leaf: "leaf1", jade: "jade1", rose: "rose1", brown: "wood1", hair: "ink", ink: "ink", plum: "plum1", pink: "plum1", red: "red1", grey: "steel1" } as const;

// ── geometry ───────────────────────────────────────────────────────────────────

/** A prop's anchor in world art px, rounded as the engine rounds it. */
const anchorPx = (p: MapProp) => [Math.round((p.position.x + p.width / 2) * TILE), Math.round((p.position.y + p.height) * TILE)] as const;
const inside = (item: MapProp, bench: MapProp) => {
  const cx = item.position.x + item.width / 2, cy = item.position.y + item.height / 2;
  return cx > bench.position.x && cx < bench.position.x + bench.width && cy > bench.position.y && cy < bench.position.y + bench.height;
};

/** Bench tops are foreshortened to this share of their depth (style bible: tops at 60–70%). */
const TOP_SCALE = 0.65;
/** Bench top heights above the floor, art px. */
const BENCH_KINDS: Record<string, number> = { "lamp-bench": 24, "toy-bench": 24, "wood-bench": 24, "sewing-bench": 24 };
const ITEM_KINDS = ["lamp", "kettle", "paper", "chair-repair", "thread-box"];
const benches = () => mapProps("all", ...Object.keys(BENCH_KINDS));
/** The bench an item stands on, if any. */
const benchOf = (item: MapProp) => benches().find((b) => b.map === item.map && inside(item, b));
/** How high an item's base sits: its bench's top, or the floor. */
const liftOf = (item: MapProp) => { const b = benchOf(item); return b ? BENCH_KINDS[b.kind] : 0; };

// ── things on benches ──────────────────────────────────────────────────────────

/** Draws an item with its base centre at (x, y) on canvas `p`. */
type ItemDraw = (p: Px, x: number, y: number, prop: MapProp) => void;

/**
 * The magnifier lamp clamped to the electronics bench: a sprung arm in two jointed sections reaching
 * out over the work, a round head with a ring of light round its lens. Its light is the lens (`LIGHTS`).
 */
const magnifier: ItemDraw = (p, x, y) => {
  art(p, x + 2, y - 5, ["ssss", "sSSs", "s..s", "sssS"], { s: "steel2", S: "steel4" });
  p.line(x + 4, y - 6, x + 6, y - 18, "steel3").line(x + 5, y - 6, x + 7, y - 18, "steel4");
  p.px(x + 6, y - 18, "steel5");
  p.line(x + 6, y - 19, x - 4, y - 25, "steel3").line(x + 6, y - 18, x - 4, y - 24, "steel4");
  // Springs along the arm.
  for (const k of [1, 3, 5]) p.px(x + 6 - k * 2, y - 19 - k, "steel5");
  // The head: a cream ring housing round a lens catching the light.
  art(p, x - 11, y - 28, [
    "..cccc..",
    ".cCCCCc.",
    "cCwwwwCc",
    "cwbwwwwc",
    "cwwwwbwc",
    ".cwwwwc.",
    "..cccc..",
  ], { c: "cream2", C: "cream4", w: "blue6", b: "blue5" });
};

/** The green enamel lamp on the toy bench: a heavy round base, a stem, a cone shade, the bulb glowing under it. */
const greenLamp: ItemDraw = (p, x, y) => {
  art(p, x - 4, y - 3, [".jjjjjj.", "jJJJJJjj", ".jjjjjj."], { j: "jade2", J: "jade4" });
  p.vline(x, y - 14, 11, "steel3").vline(x + 1, y - 14, 11, "steel2");
  art(p, x - 6, y - 21, [
    "....jj.....",
    "...jJJj....",
    "..jJJJjj...",
    ".jJJJJjjj..",
    "jJJJJjjjjj.",
    "jjjjjjjjjj.",
    ".ggYYYYgg..",
  ], { j: "jade2", J: "jade4", g: "gold3", Y: "gold5" });
};

/**
 * The kettle on the window bench: an enamel kettle, cream with a blue rim and a painted plum blossom,
 * chipped at the spout, on a small charcoal stove in a clay pot; a thread of steam.
 */
const kettle: ItemDraw = (p, x, y) => {
  cylinder(p, x - 6, y - 8, 12, 8, ["rose1", "rose2", "rose3", "rose4", "red5"]);
  p.rect(x - 4, y - 6, 8, 2, "ink2").px(x - 2, y - 5, "orange2").px(x + 1, y - 5, "orange3");
  cylinder(p, x - 6, y - 17, 12, 9, ["cream1", "cream2", "cream3", "cream4", "cream5"]);
  p.hline(x - 6, y - 17, 12, "blue3").hline(x - 6, y - 9, 12, "blue3");
  art(p, x - 3, y - 14, [".p.", "pyp", ".p."], { p: "pink2", y: "gold4" });
  art(p, x + 5, y - 15, ["..b", ".bb", "bb."], { b: "cream3" });
  art(p, x - 4, y - 21, ["..ss..", ".s..s.", "s....s"], { s: "steel3" });
  p.faded(0.45, () => art(p, x + 7, y - 24, [".w", "w.", ".w", "..w"], { w: "white" }));
};

/** The chalk board propped on the toy bench: the plan of a tin car drawn in chalk, wheels and a side view, no words. */
const chalkBoard: ItemDraw = (p, x, y) => {
  p.rect(x - 13, y - 22, 26, 18, "wood3").rect(x - 12, y - 21, 24, 16, "jade1");
  p.hline(x - 13, y - 22, 26, "wood4");
  p.over(() => {
    p.line(x - 9, y - 12, x + 7, y - 12, "cream4").line(x - 9, y - 12, x - 6, y - 17, "cream4").line(x - 6, y - 17, x + 4, y - 17, "cream4").line(x + 4, y - 17, x + 7, y - 12, "cream4");
    p.ellipse(x - 5, y - 10, 2, 2, "cream3");
    p.ellipse(x + 4, y - 10, 2, 2, "cream3");
    p.line(x - 10, y - 8, x + 9, y - 8, "cream2");
    p.px(x + 8, y - 19, "cream3").px(x + 9, y - 18, "cream3");
  });
  // The board leans on a stick of chalk and a duster at its foot.
  art(p, x - 12, y - 4, ["cccc....dddd"], { c: "white", d: "steel3" });
};

/**
 * A bentwood café chair from the bistro, its back loose, glued and held in two sash clamps on the
 * woodworking bench; a bead of glue dried amber at the joint, a rag beside it.
 */
const clampedChair: ItemDraw = (p, x, y) => {
  // Back legs and the bent back hoop, then the seat ring, then the front legs.
  p.vline(x - 6, y - 30, 26, "wood2").vline(x + 5, y - 30, 26, "wood2");
  art(p, x - 7, y - 33, ["..wwwwwwww..", ".w........w.", "w..........w"], { w: "wood3" });
  p.vline(x - 3, y - 30, 14, "wood3").vline(x + 2, y - 30, 14, "wood3");
  p.ellipse(x, y - 15, 9, 4, "wood3");
  p.ellipse(x, y - 15.5, 7.5, 3, "oak3");
  p.ellipse(x - 0.5, y - 16, 5.5, 2, "oak4");
  p.line(x - 7, y - 13, x - 8, y, "wood3").line(x + 7, y - 13, x + 8, y, "wood2");
  p.ellipse(x, y - 6, 7, 2.5, null);
  for (let a = 0; a < Math.PI * 2; a += 0.15) p.px(Math.round(x + Math.cos(a) * 7), Math.round(y - 6 + Math.sin(a) * 2.5), "wood2");
  // Two sash clamps across the back, steel bars with wooden jaws.
  for (const cy of [y - 27, y - 20]) {
    p.hline(x - 10, cy, 21, "steel3").hline(x - 10, cy + 1, 21, "steel2");
    art(p, x - 11, cy - 2, ["oo", "oo", "oo", "oo"], { o: "oak4" });
    art(p, x + 9, cy - 2, ["oo", "oo", "oo", "oo"], { o: "oak4" });
    p.px(x + 11, cy, "gold3");
  }
  p.px(x - 3, y - 25, "gold3").px(x - 3, y - 24, "gold2");
  art(p, x + 8, y - 4, ["cCc", "ccc"], { c: "cream3", C: "cream4" });
};

/** The mending box on the sewing table: a lidded wooden box open on spools of thread, a pincushion, small scissors. */
const mendingBox: ItemDraw = (p, x, y) => {
  p.rect(x - 9, y - 12, 18, 3, "oak3").hline(x - 9, y - 12, 18, "oak4");
  p.rect(x - 9, y - 9, 18, 7, "oak3").hline(x - 9, y - 9, 18, "oak5").hline(x - 9, y - 3, 18, "oak2").vline(x + 8, y - 9, 7, "oak2");
  p.rect(x - 8, y - 8, 16, 3, "wood1");
  const spools: Color[] = ["blue3", "gold3", "jade3", "plum3", "cream4"];
  spools.forEach((c, i) => art(p, x - 7 + i * 3, y - 11, ["o", c === "cream4" ? "c" : "t", "o"], { o: "oak4", t: c, c }));
  art(p, x + 4, y - 14, [".pp.", "pPpp", ".pp."], { p: "pink2", P: "pink3" });
  p.px(x + 5, y - 15, "steel5").px(x + 6, y - 15, "steel5");
  art(p, x - 12, y - 4, ["s.s", ".s.", "o.o"], { s: "steel4", o: "steel2" });
};

const ITEMS: Record<string, ItemDraw> = {
  "workshop.desk-lamp": magnifier,
  "workshop.toy-lamp": greenLamp,
  "workshop.kettle": kettle,
  "workshop.chalk-sketch": chalkBoard,
  "workshop.clamped-chair": clampedChair,
  "workshop.mending-box": mendingBox,
};
const KIND_DEFAULTS: Record<string, ItemDraw> = { lamp: greenLamp, kettle, paper: chalkBoard, "chair-repair": clampedChair, "thread-box": mendingBox };
const itemDraw = (prop: MapProp) => ITEMS[prop.id] ?? KIND_DEFAULTS[prop.kind];

/**
 * Paint an item onto canvas `p` whose top-left is world (left, top). On a bench its base lands on the
 * bench's foreshortened top, as far down it as the item's centre is from the bench's back edge.
 */
function paintItem(p: Px, item: MapProp, left: number, top: number): void {
  const [x, y] = itemBase(item);
  itemDraw(item)(p, x - left, y - top, item);
}

/** Where an item's base centre lands, in world art px. */
function itemBase(item: MapProp): readonly [number, number] {
  const [ax] = anchorPx(item);
  const bench = benchOf(item);
  const cy = (item.position.y + item.height / 2) * TILE;
  return [ax, bench
    ? Math.round(bench.position.y * TILE) + Math.round((cy - bench.position.y * TILE) * TOP_SCALE) - BENCH_KINDS[bench.kind]
    : Math.round(cy)];
}

/** Every item standing on a bench, painted onto the bench's canvas, back to front. */
function paintItemsOn(p: Px, bench: MapProp, left: number, top: number): void {
  const items = mapProps(bench.map, ...ITEM_KINDS).filter((i) => inside(i, bench)).sort((a, b) => anchorPx(a)[1] - anchorPx(b)[1]);
  for (const item of items) {
    const q = new Px(p.w, p.h);
    paintItem(q, item, left, top);
    autoOutline(q, { map: OUTLINE });
    p.blit(q, 0, 0);
  }
}

/** Room above an item's footprint for its art. */
const ITEM_RISE = 40;

function itemDef(prop: MapProp): SpriteDef {
  const f = townFrame(prop, liftOf(prop) + ITEM_RISE);
  // Small things may be wider than their footprint (a lamp's arm); the canvas grows round the anchor.
  const W = Math.max(f.w, 32);
  const anchor = [Math.round(W / 2), f.h - 1] as const;
  const [ax, ay] = anchorPx(prop);
  return {
    w: W, h: f.h, anchor,
    draw: (p) => {
      paintItem(p, prop, ax - anchor[0], ay - anchor[1]);
      autoOutline(p, { map: OUTLINE });
    },
  };
}

// ── benches ────────────────────────────────────────────────────────────────────

type Frame = ReturnType<typeof townFrame>;
type BenchDraw = (p: Px, f: Frame, top: number, front: number, prop: MapProp) => void;

/**
 * A bench's carcass: a top of oiled planks foreshortened from the footprint's back edge, the top's lit
 * front edge, a front face down to the floor, legs at the ends. Returns the top's rows.
 */
function carcass(p: Px, f: Frame, H: number, seed: number, wood: readonly Color[] = ["wood1", "wood2", "wood3", "wood4", "wood5"]): { top: number; front: number } {
  const W = f.w, G = f.gy;
  const top = G - f.depth + 1 - H, front = top + Math.round(f.depth * TOP_SCALE);
  const floor = front + H;
  for (let y = top; y < front; y++) for (let x = 0; x < W; x++) {
    const board = Math.floor((y - top) / 6);
    const seam = (y - top) % 6 === 5;
    p.px(x, y, seam ? wood[1] : hash(Math.floor(x / 9), board, seed) < 0.2 ? wood[4] : wood[3]);
  }
  p.hline(0, top, W, wood[4]).vline(0, top, front - top, wood[4]);
  p.over(() => { for (let k = 0; k < 6; k++) p.hline(Math.floor(hash(k, 1, seed) * (W - 12)), top + 2 + Math.floor(hash(k, 2, seed) * (front - top - 4)), 4 + Math.floor(hash(k, 3, seed) * 6), wood[2]); });
  // The front edge of the top, then the apron and legs down to the floor.
  p.rect(0, front, W, 3, wood[2]).hline(0, front, W, wood[4]).hline(0, front + 2, W, wood[1]);
  for (const x of [1, W - 6]) { p.rect(x, front + 3, 5, floor - front - 3, wood[2]); p.vline(x, front + 3, floor - front - 3, wood[3]); p.vline(x + 4, front + 3, floor - front - 3, wood[0]); }
  p.hline(5, floor - 5, W - 10, wood[1]);
  return { top, front };
}

/** A back-board standing on the bench's back edge, `h` tall: planks, a shelf along it, its shadow on the top. */
function hutch(p: Px, x0: number, x1: number, top: number, h: number, seed: number): number {
  p.rect(x0, top - h, x1 - x0, h, "wood2");
  for (let x = x0 + 6; x < x1; x += 12) p.vline(x, top - h, h, "wood1");
  p.hline(x0, top - h, x1 - x0, "wood4");
  const shelf = top - Math.round(h * 0.55);
  p.rect(x0, shelf, x1 - x0, 3, "wood3").hline(x0, shelf, x1 - x0, "wood4");
  p.over(() => p.hline(x0, top, x1 - x0, "wood2"));
  void seed;
  return shelf;
}

/**
 * The electronics bench under the parts shelf: a green rubber mat worn through at the elbow rests, a
 * gutted valve radio on its back with its chassis out, the soldering iron in its coiled stand with a
 * damp sponge, a reel of solder, a meter with a blank dial, a tray of resistors, a mug of tea gone cold;
 * a bank of small drawers below and a box of donor radios under the bench.
 */
const lampBench: BenchDraw = (p, f, top, front, prop) => {
  const W = f.w, seed = seedOf(prop.id);
  const G = front + BENCH_KINDS["lamp-bench"];
  // A back-board with a shelf of labelled (blank) parts boxes and a coil of wire on a nail.
  const shelf = hutch(p, 4, W - 30, top, 22, seed);
  for (let k = 0; k < 9; k++) { const c: Color = (["oak4", "cream4", "jade3", "oak3", "blue3"] as const)[k % 5]; p.rect(8 + k * 14, shelf - 7, 12, 7, c); p.rect(10 + k * 14, shelf - 5, 6, 2, "cream5"); }
  for (let a = 0; a < Math.PI * 2; a += 0.2) p.px(Math.round(W - 40 + Math.cos(a) * 4), Math.round(top - 8 + Math.sin(a) * 3), "rose3");
  // Under the bench: the drawer bank on the right, a box of old radios on the left.
  p.rect(W - 52, front + 3, 44, G - front - 6, "wood2");
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const dx = W - 51 + c * 11, dy = front + 4 + r * 6;
    p.rect(dx, dy, 10, 5, "wood3").hline(dx, dy, 10, "wood4").px(dx + 4, dy + 2, "gold3").px(dx + 5, dy + 2, "gold3");
  }
  p.rect(10, G - 14, 30, 10, "oak3").hline(10, G - 14, 30, "oak4").hline(10, G - 5, 30, "oak2");
  art(p, 13, G - 18, ["rrrrrrrr..cccccc", "rKKKKKKr..cGGGGc", "rrrrrrrr..cccccc"], { r: "wood3", K: "gold3", c: "cream3", G: "jade3" });
  // The mat.
  p.rect(6, top + 3, W - 40, front - top - 5, "jade2");
  p.over(() => { for (let x = 6; x < W - 34; x += 6) p.vline(x, top + 3, front - top - 5, "jade3"); p.ellipse(30, front - 4, 8, 2, "jade3"); });
  // The gutted radio: its wooden case lying open, the chassis out beside it with valves standing up.
  p.rect(10, top - 6, 30, 14, "wood3").rect(12, top - 4, 26, 10, "wood1");
  p.hline(10, top - 6, 30, "wood4");
  p.rect(44, top + 2, 34, 12, "steel3").hline(44, top + 2, 34, "steel5").hline(44, top + 13, 34, "steel2");
  for (const [vx, vh] of [[48, 9], [55, 11], [62, 9], [70, 7]] as const) {
    art(p, vx, top + 2 - vh, Array.from({ length: vh }, (_, j) => (j === 0 ? ".g." : j < vh - 2 ? "gGg" : "sss")), { g: "steel5", G: "gold4", s: "steel2" });
  }
  for (const [cx, cy, c] of [[51, top + 8, "blue3"], [58, top + 9, "gold3"], [66, top + 8, "rose3"], [73, top + 10, "jade4"]] as const) p.rect(cx, cy, 3, 2, c);
  // Coloured wires curling off the chassis.
  p.line(78, top + 6, 86, top + 10, "rose3").line(78, top + 8, 88, top + 4, "blue3");
  // Soldering iron in its coil stand, the sponge, the reel of solder.
  art(p, 96, top + 4, ["..sssss...", ".s.s.s.s..", "s.s.s.s.s.", ".ssssssss.", "..kkkkkk.."], { s: "steel3", k: "steel1" });
  p.line(98, top + 2, 112, top - 4, "steel4").line(98, top + 3, 104, top + 1, "ink2");
  p.line(112, top - 4, 115, top - 6, "wood2");
  art(p, 96, top + 11, ["yyyyy", "yYyYy"], { y: "gold3", Y: "gold2" });
  art(p, 106, top + 10, [".ss.", "sSSs", "sSSs", ".ss."], { s: "steel3", S: "steel5" });
  // The meter, a tray of resistors, the mug.
  p.rect(120, top + 1, 14, 11, "gold2").rect(122, top + 2, 10, 5, "cream4").hline(121, top + 1, 12, "gold3");
  p.line(124, top + 6, 128, top + 3, "ink2");
  p.rect(136, top + 6, 12, 6, "oak3").hline(136, top + 6, 12, "oak4");
  for (let k = 0; k < 5; k++) p.px(138 + k * 2, top + 8 + (k % 2), (["gold3", "blue3", "rose3", "jade3", "cream4"] as const)[k]);
  art(p, 22, top + 12, [".www.", "wWwwh", "wbbwh", ".www."], { w: "white", W: "cream5", b: "wood2", h: "cream3" });
  void hash(seed, 0);
};

/**
 * The toy bench by the display shelf: a cloth spread on the boards, a wind-up tin truck in faded blue
 * and cream on its back with its base plate off to show the clockwork, a rack of watchmaker's
 * screwdrivers, a jar of springs, a dish of screws and the tin key.
 */
const toyBench: BenchDraw = (p, f, top, front, prop) => {
  const W = f.w, G = front + BENCH_KINDS["toy-bench"];
  // A hutch of little drawers at the back, brass pulls, one drawer open on a tangle of spare keys.
  hutch(p, 30, W - 6, top, 18, seedOf(prop.id));
  for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) {
    const dx = 32 + c * 12, dy = top - 16 + r * 8;
    if (dx + 10 > W - 6) break;
    p.rect(dx, dy, 10, 6, "oak3").hline(dx, dy, 10, "oak4").px(dx + 4, dy + 3, "gold3").px(dx + 5, dy + 3, "gold3");
  }
  art(p, 32 + 5 * 12, top - 8, ["gkkkkkkkg", ".gkgkgkg."], { g: "gold3", k: "wood1" });
  // Shelf under the bench with a row of tin toys waiting their turn.
  p.hline(8, G - 12, W - 16, "wood3").hline(8, G - 11, W - 16, "wood2");
  for (let k = 0; k < 5; k++) {
    const x = 16 + k * 30;
    const c: Color = (["blue3", "jade3", "gold3", "cream4", "plum3"] as const)[k];
    art(p, x, G - 20, [".ccc..", "cccccc", "cwcccc", ".k..k."], { c, w: "white", k: "ink2" });
  }
  // The cloth under the work.
  p.rect(52, top + 2, 56, front - top - 3, "cream4");
  p.over(() => { for (let y = top + 2; y < front - 1; y += 4) p.hline(52, y, 56, "cream3"); });
  // The tin truck, half-repaired.
  const tx = 60, ty = top + 4;
  art(p, tx, ty, [
    "....bbbbbbb.......",
    "...bBBBBBBbb......",
    "..bBwwwwBBbbcccccc",
    ".bBBwwwwBBbbcCCCCc",
    "bbbbbbbbbbbbcccccc",
    "bkkbbbbbbbkkbbbbbb",
    ".kk.......kk......",
  ], { b: "blue3", B: "blue4", w: "blue6", c: "cream3", C: "cream4", k: "ink2" });
  // Its base plate beside it, and the clockwork: a brass spring coil and gear.
  p.rect(tx + 22, ty + 3, 14, 5, "steel4").hline(tx + 22, ty + 3, 14, "steel5");
  art(p, tx + 6, ty + 9, [".ggg.", "gGgGg", "ggGgg", ".ggg."], { g: "gold2", G: "gold4" });
  art(p, tx + 38, ty + 1, ["..k.", ".kk.", "kkkk"], { k: "gold3" });
  // Watchmaker's screwdrivers standing in a wooden block.
  p.rect(110, top + 6, 16, 5, "oak3").hline(110, top + 6, 16, "oak4");
  for (let k = 0; k < 6; k++) { const c: Color = (["rose3", "blue3", "jade3", "gold3", "plum3", "cream4"] as const)[k]; p.vline(111 + k * 2.5, top - 2, 8, c); p.px(Math.round(111 + k * 2.5), top - 3, "steel4"); }
  // The jar of springs, the dish of screws.
  cylinder(p, 132, top - 2, 9, 11, ["steel3", "steel4", "steel5", "steel6", "white"]);
  p.over(() => { for (let k = 0; k < 4; k++) art(p, 133 + (k % 2) * 3, top + 1 + Math.floor(k / 2) * 3, ["s.s", ".s."], { s: "gold3" }); });
  p.rect(132, top - 3, 9, 2, "steel2");
  p.ellipse(150, top + 8, 6, 2.5, "white");
  p.ellipse(150, top + 8, 4.5, 1.6, "cream3");
  for (const dx of [-2, 0, 2]) p.px(150 + dx, top + 8, "steel2");
};

/**
 * The window bench along the west wall: a long narrow table under the window for tea and odd jobs, the
 * kettle on its little stove at the north end, jars of nails and screws along it, a stack of newspaper
 * for wrapping, a tea tin and Old Fang's cup.
 */
const windowBench: BenchDraw = (p, f, top, front, prop) => {
  void f;
  const W = f.w, seed = seedOf(prop.id);
  for (let k = 0; k < 4; k++) {
    const y = top + 50 + k * 18;
    cylinder(p, 6 + (k % 2) * 16, y - 8, 9, 10, ["steel3", "steel4", "steel5", "steel6", "white"]);
    p.rect(6 + (k % 2) * 16, y - 9, 9, 2, (["oak3", "jade3", "blue3", "gold3"] as const)[k]);
    p.over(() => p.speckle(6 + (k % 2) * 16, y - 6, 9, 7, "steel2", 0.4, seed + k));
  }
  p.rect(8, front - 26, 26, 8, "cream3").hline(8, front - 26, 26, "cream4");
  for (let y = front - 24; y < front - 18; y += 2) p.hline(9, y, 24, "cream2");
  art(p, 24, front - 12, ["sSs", "sss", "sjs"], { s: "steel3", S: "steel5", j: "jade3" });
  art(p, 10, front - 10, ["wWw", "wbw", ".w."], { w: "white", W: "cream5", b: "wood2" });
  void W;
};

/**
 * The carpenter's bench: a thick beech top dark with oil and scarred by forty years of chisels, a row of
 * dog holes, a wooden-screw face vice holding a chair leg half shaped with the spokeshave, a jack plane
 * on its side, curls of shaving, chisels in a roll, a mallet and a try square.
 */
const woodBench: BenchDraw = (p, f, top, front) => {
  const W = f.w, G = front + BENCH_KINDS["wood-bench"];
  // A tool rack along the back: chisels, a saw and a brace hung in a row.
  p.rect(30, top - 14, W - 40, 3, "wood3").hline(30, top - 14, W - 40, "wood4");
  for (let x = 36; x < W - 70; x += 6) { p.vline(x, top - 11, 9, "steel4"); p.vline(x, top - 4, 3, "wood3"); }
  art(p, W - 64, top - 12, ["wwwwssssssssssss", "wwww.ssssssssss.", "......sssssss..."], { w: "wood3", s: "steel4" });
  art(p, W - 38, top - 12, ["..s..", ".s.s.", "s...s", ".sss.", "..w.."], { s: "steel3", w: "wood3" });
  // Dog holes along the front of the top.
  for (let x = 10; x < W - 30; x += 14) p.rect(x, front - 4, 2, 2, "wood1");
  // The face vice at the left end: a chop with its big wooden screw and tommy bar, the leg in its jaws.
  p.rect(2, front, 12, 16, "oak3").hline(2, front, 12, "oak4").vline(13, front, 16, "oak2");
  p.ellipse(8, front + 8, 3, 3, "oak2");
  p.hline(1, front + 8, 15, "oak4");
  p.line(4, front - 2, 34, front - 9, "oak4").line(4, front - 1, 34, front - 8, "oak3");
  p.over(() => { p.px(14, front - 4, "oak5"); p.px(22, front - 6, "oak5"); });
  // Shavings on the top round the leg.
  for (let k = 0; k < 6; k++) art(p, 18 + k * 6, top + 6 + (k % 3) * 3, ["oO.", ".oO"], { o: "oak4", O: "oak5" });
  // The plane on its side, a mallet, chisels in a canvas roll, the try square.
  art(p, 70, top + 3, [
    "...kk..........",
    "..kRRk.........",
    "ssssssssssssss.",
    "sSSSSSSSSSSSSss",
    "wwwwwwwwwwwwwww",
  ], { k: "rose2", R: "rose3", s: "steel3", S: "steel5", w: "oak4" });
  art(p, 92, top + 9, ["oooo......", "oOOo......", "oooowwwwww"], { o: "oak3", O: "oak4", w: "oak2" });
  p.rect(112, top + 4, 26, 8, "bamboo3");
  for (let k = 0; k < 6; k++) p.vline(114 + k * 4, top + 1, 9, k % 2 ? "steel4" : "steel3");
  art(p, 142, top + 4, ["ssssssssss", "s.........", "w.........", "w........."], { s: "steel4", w: "wood3" });
  // A bench hook and a coffee tin of glue under the bench.
  cylinder(p, W - 30, G - 13, 9, 9, ["gold1", "gold2", "gold3", "gold4", "gold5"]);
  p.rect(W - 30, G - 14, 9, 2, "steel2");
};

/**
 * The sewing table: an old treadle machine, black iron gone soft at the edges, its gold scrollwork worn
 * to ghosts (no lettering), the hand wheel bright from use, a length of flowered cotton under the foot
 * and spilling to the floor; below, the iron treadle frame in its lattice and the treadle plate.
 */
const sewingBench: BenchDraw = (p, f, top, front) => {
  const W = f.w, G = front + BENCH_KINDS["sewing-bench"];
  // The iron treadle frame under the table: lattice sides, the treadle, the belt up to the wheel.
  for (const x of [8, W - 22]) {
    p.rect(x, front + 3, 14, G - front - 5, "ink2");
    p.rect(x + 2, front + 5, 10, G - front - 10, null);
    p.line(x + 2, front + 5, x + 11, G - 7, "ink2").line(x + 11, front + 5, x + 2, G - 7, "ink2");
  }
  p.rect(24, G - 7, W - 48, 4, "ink2").hline(24, G - 7, W - 48, "steel2");
  for (let x = 28; x < W - 28; x += 4) p.px(x, G - 6, "steel3");
  p.line(W - 34, G - 8, W - 34, front + 3, "oak2");
  // The cloth: flowered cotton draped over the front edge, its end on the floor.
  const cl = 22, cw = 30;
  p.rect(cl, top + 6, cw, front - top - 5, "blue4");
  for (let y = front + 1; y < G - 2; y++) { const w = cw - Math.round((y - front) * 0.4); p.hline(cl + (y % 2), y, w, (y % 5 === 0) ? "blue3" : "blue4"); }
  p.over(() => { for (let k = 0; k < 12; k++) art(p, cl + Math.floor(hash(k, 1, 7) * (cw - 3)), top + 6 + Math.floor(hash(k, 2, 7) * (G - top - 10)), [".p.", "pyp", ".p."], { p: "pink3", y: "gold4" }); });
  // The machine head, seen from the front: the bed plate on the table, the pillar at the right, the long
  // arm over to the needle bar at the left, black iron with ghostly gold scrolls, the bright hand wheel.
  const mx = 34, base = top + Math.round((front - top) * 0.6);
  p.rect(mx, base, 70, 5, "ink2").hline(mx, base, 70, "steel2").hline(mx, base + 4, 70, "ink");
  p.rect(mx + 50, base - 22, 14, 22, "ink2").vline(mx + 50, base - 22, 22, "steel1").vline(mx + 63, base - 22, 22, "ink");
  p.rect(mx + 6, base - 24, 58, 9, "ink2").hline(mx + 6, base - 24, 58, "steel2").hline(mx + 6, base - 16, 58, "ink");
  p.rect(mx + 2, base - 22, 8, 16, "ink2").vline(mx + 2, base - 22, 16, "steel2");
  p.vline(mx + 5, base - 6, 6, "steel5").px(mx + 5, base, "steel6");
  p.over(() => { art(p, mx + 14, base - 22, ["g.gg.g..g", ".g..g.gg.", "g.g...g.g"], { g: "gold2" }); art(p, mx + 52, base - 18, [".g.", "g.g", ".g.", "g.g"], { g: "gold2" }); });
  const wx = mx + 68, wy = base - 16;
  p.ellipse(wx, wy, 7, 7, "steel3");
  p.ellipse(wx, wy, 5.5, 5.5, "steel2");
  p.ellipse(wx, wy, 1.5, 1.5, "steel5");
  for (let a = Math.PI * 1.1; a < Math.PI * 1.6; a += 0.1) p.px(Math.round(wx + Math.cos(a) * 7), Math.round(wy + Math.sin(a) * 7), "steel5");
  // A pincushion and a spool of thread on the table's right.
  art(p, W - 26, top + 6, [".pp.", "pPpp", ".pp."], { p: "pink2", P: "pink3" });
  art(p, W - 18, top + 4, ["oo", "tt", "tt", "oo"], { o: "oak4", t: "jade3" });
};

const BENCHES: Record<string, BenchDraw> = {
  "workshop.lamp-bench": lampBench,
  "workshop.toy-bench": toyBench,
  "workshop.window-bench": windowBench,
  "workshop.woodworking": woodBench,
  "workshop.sewing-bench": sewingBench,
};
const BENCH_DEFAULTS: Record<string, BenchDraw> = { "lamp-bench": lampBench, "toy-bench": toyBench, "sewing-bench": sewingBench, "wood-bench": woodBench };

function benchDef(prop: MapProp): SpriteDef {
  const H = BENCH_KINDS[prop.kind];
  const f = townFrame(prop, H + ITEM_RISE);
  const [ax, ay] = anchorPx(prop);
  const draw = BENCHES[prop.id] ?? (prop.kind === "wood-bench" && prop.width < 2 ? windowBench : BENCH_DEFAULTS[prop.kind]);
  return {
    w: f.w, h: f.h, anchor: f.anchor, shadow: { rx: Math.round(f.w / 2) - 2, ry: Math.max(4, Math.round(f.depth / 5)), dy: -Math.round(f.depth / 3) },
    draw: (p) => {
      const seed = seedOf(prop.id);
      // Dark walnut for the fine-work benches, pale oiled beech for the carpenter's and the window bench, so
      // each stands off the honey floorboards.
      const pale = prop.kind === "wood-bench";
      const { top, front } = carcass(p, f, H, seed, pale ? ["wood2", "oak2", "oak3", "oak4", "oak5"] : ["wood1", "wood1", "wood2", "wood3", "wood4"]);
      draw(p, f, top, front, prop);
      autoOutline(p, { map: OUTLINE });
      paintItemsOn(p, prop, ax - f.anchor[0], ay - f.anchor[1]);
    },
  };
}

// ── things on the floor ────────────────────────────────────────────────────────

type Draw = (p: Px, f: Frame, prop: MapProp) => void;
function floorThing(name: string, rise: number, draw: Draw, options: { shadow?: boolean } = {}): [string, SpriteDef][] {
  return mapProps("all", name).map((prop) => {
    const f = townFrame(prop, rise);
    return [propSpriteId(prop.map, prop.id), {
      w: f.w, h: f.h, anchor: f.anchor,
      ...(options.shadow ? { shadow: { rx: Math.max(4, Math.round(f.w / 2) - 2), ry: 3, dy: -Math.round(f.depth / 3) } } : {}),
      draw: (p: Px) => { draw(p, f, prop); },
    }];
  });
}

/**
 * The spares bins by the drawer chest: a stack of steel parts bins, open at the front, three high and
 * two wide, full of screws, valves, knobs and springs sorted by a system only Old Fang understands.
 */
const drawBins: Draw = (p, f, prop) => {
  const W = f.w, G = f.gy, seed = seedOf(prop.id);
  const bw = Math.floor((W - 4) / 2), bh = 13;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
    const x = 2 + c * bw, y = G - (r + 1) * bh - 1;
    p.rect(x, y, bw - 1, bh, "steel3").hline(x, y, bw - 1, "steel5").vline(x + bw - 2, y, bh, "steel2");
    p.rect(x + 2, y + 2, bw - 5, 6, "steel1");
    const c2: Color = (["gold3", "steel4", "rose3", "jade3", "cream4", "blue3"] as const)[r * 2 + c];
    for (let k = 0; k < 6; k++) p.px(x + 3 + Math.floor(hash(k, r * 2 + c, seed) * (bw - 7)), y + 4 + Math.floor(hash(r, k, seed) * 4), c2);
    p.rect(x + 4, y + 9, bw - 9, 3, "cream4");
  }
  autoOutline(p, { map: OUTLINE });
};

/**
 * The valve radio by the pegboard, on a little stand of its own: a walnut case with rounded shoulders,
 * a cloth-covered speaker, a dial window glowing amber with its needle, two bakelite knobs. It is always
 * on, low, tuned to the opera. Its light is the dial (`LIGHTS`).
 */
const drawRadio: Draw = (p, f) => {
  const W = f.w, G = f.gy, cx = Math.round(W / 2);
  // The stand: a small square stool.
  p.rect(cx - 11, G - 14, 22, 3, "oak4").hline(cx - 11, G - 14, 22, "oak5");
  for (const x of [cx - 10, cx + 8]) p.rect(x, G - 11, 2, 11, "oak3");
  // The case.
  art(p, cx - 12, G - 34, [
    "...wwwwwwwwwwwwwwwwww...",
    "..wWWWWWWWWWWWWWWWWWww..",
    ".wWwwwwwwwwwwwwwwwwwwww.",
    "wWwccccccccccwwddddddwwq",
    "wWwcCcCcCcCccwwdyyyyydwq",
    "wWwccccccccccwwdyYyyydwq",
    "wWwcCcCcCcCccwwddddddwwq",
    "wWwccccccccccwwwwwwwwwwq",
    "wWwcCcCcCcCccwwkk..kkwwq",
    "wWwccccccccccwwkk..kkwwq",
    "wwwwwwwwwwwwwwwwwwwwwwwq",
    ".qqqqqqqqqqqqqqqqqqqqqq.",
  ], { w: "wood3", W: "wood4", q: "wood1", c: "bamboo3", C: "bamboo4", d: "gold2", y: "gold4", Y: "gold5", k: "ink2" });
  p.px(cx + 6, G - 30, "rose3");
  autoOutline(p, { map: OUTLINE });
};

/** The window plant: a spider plant in a big biscuit tin by the west window, its runners hanging over the rim, babies on their ends. */
const drawPlant: Draw = (p, f, prop) => {
  const W = f.w, G = f.gy, cx = Math.round(W / 2), seed = seedOf(prop.id);
  cylinder(p, cx - 9, G - 14, 18, 14, ["blue1", "blue2", "blue3", "blue4", "blue5"]);
  p.over(() => { p.hline(cx - 9, G - 11, 18, "gold3"); p.hline(cx - 9, G - 4, 18, "gold3"); for (let x = cx - 7; x < cx + 8; x += 4) p.px(x, G - 8, "cream4"); });
  p.ellipse(cx, G - 14, 9, 2.5, "blue4");
  p.ellipse(cx, G - 14, 7.5, 1.6, "brown1");
  for (let k = 0; k < 14; k++) {
    const a = Math.PI * (0.05 + (k / 13) * 0.9), len = 10 + Math.floor(hash(k, 1, seed) * 8);
    const ex = Math.round(cx - Math.cos(a) * len), ey = Math.round(G - 15 - Math.sin(a) * len * 0.8);
    p.line(cx, G - 15, ex, ey, k % 2 ? "leaf3" : "leaf4");
    p.px(Math.round((cx + ex) / 2), Math.round((G - 15 + ey) / 2), "cream4");
  }
  for (const s of [-1, 1]) {
    p.line(cx + s * 8, G - 14, cx + s * 13, G - 4, "leaf2");
    art(p, cx + s * 13 - 2, G - 6, ["g.g", ".g.", "ggg"], { g: "leaf3" });
  }
  autoOutline(p, { map: OUTLINE });
};

/** Shavings swept toward the bench but not up: pale curls and sawdust on the floor, thick by the bench leg. */
const drawShavings: Draw = (p, f, prop) => {
  const W = f.w, G = f.gy, D = f.depth, seed = seedOf(prop.id);
  for (let k = 0; k < 40; k++) {
    const u = (hash(k, 1, seed) + hash(k, 2, seed)) / 2, v = (hash(k, 3, seed) + hash(k, 4, seed)) / 2;
    const x = Math.round(2 + u * (W - 6)), y = Math.round(G - D + 3 + v * (D - 6));
    art(p, x, y, k % 3 ? [".oO", "oO."] : ["oo", "Oo"], k % 4 ? { o: "oak4", O: "oak5" } : { o: "bamboo4", O: "bamboo5" });
  }
  p.faded(0.4, () => p.speckle(0, G - D, W, D, "oak4", 0.12, seed));
};

/** The doormat inside the yard door: coir, a woven border, worn pale where feet wipe, a few shavings carried out on boots. */
const drawMat: Draw = (p, f, prop) => {
  const G = f.gy, W = f.w, D = f.depth, seed = seedOf(prop.id);
  const x0 = 3, y0 = G - D + 6, w = W - 6, h = D - 8;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const border = i < 3 || j < 3 || i >= w - 3 || j >= h - 3;
    const worn = Math.abs(i - w / 2) < w * 0.18 && !border;
    p.px(x0 + i, y0 + j, border ? (i + j) % 2 ? "brown2" : "brown1" : worn ? (hash(i, j, seed) < 0.4 ? "oak5" : "oak4") : hash(i, j, seed) < 0.3 ? "oak3" : "oak4");
  }
  for (let k = 0; k < 4; k++) art(p, x0 + 8 + Math.floor(hash(k, 1, seed) * (w - 16)), y0 + 4 + Math.floor(hash(k, 2, seed) * (h - 8)), ["oO"], { o: "oak5", O: "bamboo5" });
  p.outline("brown1", { sides: ["top", "left"] });
};

/** A cartwheel off the old flatbed, waiting for a new felloe: iron-tyred, twelve spokes, one split, leaning on its edge. */
const drawWheel: Draw = (p, f) => {
  const W = f.w, G = f.gy, cx = Math.round(W / 2), cy = G - 13, r = 12;
  p.ellipse(cx, cy, r, r, "steel2");
  p.ellipse(cx, cy, r - 1.5, r - 1.5, "oak3");
  p.ellipse(cx, cy, r - 4, r - 4, null);
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    p.line(cx, cy, Math.round(cx + Math.cos(a) * (r - 3)), Math.round(cy + Math.sin(a) * (r - 3)), k === 4 ? "oak2" : "oak4");
  }
  p.ellipse(cx, cy, 2.5, 2.5, "oak2");
  p.ellipse(cx - 0.5, cy - 0.5, 1.2, 1.2, "steel4");
  for (let a = Math.PI * 1.05; a < Math.PI * 1.55; a += 0.08) p.px(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), "steel4");
  autoOutline(p, { map: OUTLINE });
};

// ── lights ─────────────────────────────────────────────────────────────────────

/**
 * Where light comes from, in world tiles (the scene can put glow lights here): the magnifier lamp's lens,
 * the green lamp's bulb under its shade, and the radio's dial. Computed from the map, so they follow it.
 */
export const LIGHTS: Readonly<Record<string, readonly [number, number]>> = Object.fromEntries([
  ...mapProps(MAP, "lamp").map((p) => {
    const [x, y] = itemBase(p);
    const at = p.id === "workshop.desk-lamp" ? [x - 7, y - 25] : [x, y - 15];
    return [p.id, [at[0] / TILE, at[1] / TILE] as const];
  }),
  ...mapProps(MAP, "radio").map((p) => { const [ax, ay] = anchorPx(p); return [p.id, [(ax + 6) / TILE, (ay - 29) / TILE] as const]; }),
]);

export default defineSprites(Object.fromEntries([
  ...benches().map((b) => [propSpriteId(b.map, b.id), benchDef(b)] as const),
  ...mapProps("all", ...ITEM_KINDS).map((i) => [propSpriteId(i.map, i.id), itemDef(i)] as const),
  ...floorThing("bins", 26, drawBins, { shadow: true }),
  ...floorThing("radio", 22, drawRadio, { shadow: true }),
  ...floorThing("plant", 22, drawPlant, { shadow: true }),
  ...floorThing("shavings", 0, drawShavings),
  ...floorThing("doormat", 0, drawMat),
  ...floorThing("wheel", 16, drawWheel, { shadow: true }),
]));
