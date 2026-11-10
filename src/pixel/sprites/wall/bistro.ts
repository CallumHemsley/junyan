/**
 * Bistro pieces for the back wall and the front door: the long mirror, the globe lamps, the tall menu
 * board, and the edge of the striped awning seen over the door from inside.
 * Wall pieces anchor at the wall's foot (place them at (x, 96) on a wall starting at y = 0).
 */
import { defineSprites, hash, type Color, type Legend, type Px } from "../../kit/index.ts";
import { block } from "./_helpers.ts";

/**
 * The long bevelled mirror, 96×40, in a gilt frame gone brown in the hollows. It has hung over the
 * banquette since the thirties and nobody has dared re-silver it: the silver has darkened and foxed in
 * from the edges, worst in the corners and along the bottom where the steam from the kitchen settles.
 * What it reflects is only suggested: the bright street door opposite as a tall pale glow, the warm
 * blur of a lit globe lamp, the dark wainscot low down, and two diagonal bands of window light on the
 * glass. Frame top on wall row 16.
 */
function mirror(p: Px) {
  const w = 96, h = 40, gx = 4, gy = 4, gw = w - 8, gh = h - 8;
  const smooth = (a: number, b: number, v: number) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

  // ── Glass. A brightness field over the reflection, quantised to a warm grey ramp in clean flat steps.
  // Only the lamp's blur is dithered: checker seams on the slow steps read as stitching, not glass.
  const RAMP: readonly Color[] = ["stone2", "stone3", "stone4", "stone5", "cream4", "cream5"];
  const lamp = (x: number, y: number) => Math.exp(-(((x + 0.5 - 14) / 3.4) ** 2 + ((y + 0.5 - 9) / 2.6) ** 2));
  const field = (x: number, y: number) => {
    // The plaster opposite, calm and pale; its moulded rail and dark wainscot as a soft step down in
    // the lower third; the round-headed street door opposite as a tall pale glow (x 56–64, its head
    // from row 6); the lit globe lamp as a small warm blur.
    const dx = x + 0.5 - 60, dy = y + 0.5 - 10.5;
    const door = (dy < 0 ? Math.hypot(dx, dy) : Math.abs(dx)) - 4.5;
    const room = 3.45 - 0.3 * (y / gh) - 1.3 * smooth(16, 22, y);
    // The door's glazed upper light is daylight, flat and bright; its wooden lower panel only a little
    // paler than the wainscot round it.
    const inDoor = 1 - smooth(-0.4, 0.4, door), daylight = y < 20 ? 4.3 - room : 0.7;
    return room + inDoor * daylight + 1.9 * lamp(x, y);
  };
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const b = field(x, y);
    const reach = lamp(x, y) > 0.12 ? 0.2 : 0;
    const step = Math.floor(b + ((x + y) % 2 === 0 ? reach : -reach));
    p.px(gx + x, gy + y, lamp(x, y) > 0.78 ? "gold5" : RAMP[Math.max(0, Math.min(RAMP.length - 1, step))]);
  }

  // ── Two bands of window light lying diagonally across the glass, a broad one with a thin echo, and
  // a fainter one far right, each fading out (dithered) before it reaches the top and bottom.
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const d = x + (y >> 1), end = y < 3 || y > gh - 4, faint = y < 6 || y > gh - 7;
    if (end && (x + y) % 2 === 1) continue;
    if (d >= 30 && d <= 32) p.px(gx + x, gy + y, d === 30 ? "steel5" : "steel6");
    else if (d === 35) p.px(gx + x, gy + y, "steel5");
    else if ((d === 72 || d === 73) && (!faint || (x + y) % 2 === 0)) p.px(gx + x, gy + y, "steel5");
  }

  // ── Bevel: the glass edge catches the light along the top and left, falls dark bottom and right.
  p.hline(gx, gy, gw, "steel6").vline(gx, gy, gh, "steel6");
  p.hline(gx + 1, gy + gh - 1, gw - 1, "stone3").vline(gx + gw - 1, gy + 1, gh - 1, "stone3");

  // ── Desilvering. The silver dims from the edges in: along each edge a shallow ragged margin that
  // rises and falls a pixel at a time (deeper along the bottom, where the kitchen steam settles), and a
  // ragged bloom in each corner. Dimmed glass is the local tone one step down (two in the deepest
  // wear), so the reflection still shows through. Every worn pixel is joined to an edge: no speckle.
  const DIM: Partial<Record<Color, Color>> = {
    cream5: "stone5", cream4: "stone4", gold5: "cream4", stone5: "stone4", stone4: "stone3", stone3: "stone2",
    stone2: "stone1", stone1: "stone1", steel6: "steel4", steel5: "steel4", steel4: "steel3", steel3: "stone2",
  };
  const dim = (x: number, y: number, times: number) => {
    let c = p.get(gx + x, gy + y);
    for (let i = 0; i < times && c; i++) c = DIM[c] ?? c;
    if (c) p.px(gx + x, gy + y, c);
  };
  /** How far the wear reaches in from edge `side` (0 top, 1 left, 2 right, 3 bottom) at `along`. */
  const bite = (side: number, along: number) => {
    const a = along / 3, i = Math.floor(a), t = a - i;
    const r = hash(i, side, 11) * (1 - t) + hash(i + 1, side, 11) * t;
    return r * r * (side === 3 ? 3.2 : 2.4);
  };
  /** A ragged quarter-round bloom in each corner, each its own size. */
  const BLOOM = [7, 4.5, 5.5, 8] as const; // top-left, top-right, bottom-left, bottom-right
  const bloom = (x: number, y: number) => {
    const k = (x < gw / 2 ? 0 : 1) + (y < gh / 2 ? 0 : 2);
    const ex = x < gw / 2 ? x : gw - 1 - x, ey = y < gh / 2 ? y : gh - 1 - y;
    const ragged = BLOOM[k] + (hash(Math.floor(Math.atan2(ey, ex) * 7), k, 13) - 0.5) * 3;
    return ragged - Math.hypot(ex * 0.75, ey * 1.25);
  };
  const wear: [number, number, number][] = [];
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const over = Math.max(bite(0, x) - y, bite(1, y) - x, bite(2, y) - (gw - 1 - x), bite(3, x) - (gh - 1 - y), bloom(x, y));
    if (over > 0.5) wear.push([x, y, over > 3.5 ? 2 : 1]);
  }
  for (const [x, y, t] of wear) dim(x, y, t);
  // Foxing: a few small ragged blots further in, each with a darker heart.
  const FOX = [[".ss", "sSs", "ss."], ["ss.", "sSs", ".s."], ["sS", "ss"], [".s", "sS", "s."]] as const;
  const fox: readonly (readonly [number, number, number])[] = [[8, 4, 0], [22, 2, 2], [17, 26, 1], [46, 27, 3], [65, 3, 1], [80, 8, 0], [83, 20, 2], [4, 16, 3]];
  for (const [x, y, k] of fox) FOX[k].forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== ".") dim(x + i, y + j, ch === "S" ? 2 : 1); }));

  // ── Gilt frame, 4px: the outer moulding lit on its top and left faces and shaded bottom and right;
  // the sight edge (the lip against the glass) the other way round, since it faces into the frame.
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = Math.min(x, y, w - 1 - x, h - 1 - y);
    if (i > 3) continue;
    const topLeft = w - 1 - x !== i && h - 1 - y !== i; // on the top or left side of the frame
    const c: Color =
      i === 0 ? (topLeft ? "gold3" : "wood2")
      : i === 1 ? (topLeft ? "gold4" : "gold1")
      : i === 2 ? "gold2"
      : topLeft ? "gold1" : "gold3";
    p.px(x, y, c);
  }
  // The gilding rubbed through to the brown bole in the hollow of the moulding, in short runs.
  for (let x = 6; x < w - 6; x++) {
    if (hash(x >> 2, 0, 31) > 0.78) p.px(x, 2, "gold1");
    if (hash(x >> 2, 1, 31) > 0.7) p.px(x, h - 3, "gold1");
  }
  for (let y = 6; y < h - 6; y++) if (hash(y >> 2, 2, 31) > 0.75) p.px(w - 3, y, "gold1");
  // Glints on the lit top-left of the frame.
  p.hline(5, 1, 6, "gold5").vline(1, 5, 4, "gold5").px(40, 1, "gold5").px(41, 1, "gold5");
  // Corner blocks with a carved rosette, and a small shell at the top centre.
  for (const [x, y] of [[0, 0], [w - 5, 0], [0, h - 5], [w - 5, h - 5]] as const) {
    const lit = x === 0 && y === 0;
    block(p, x, y, [".lll.", "lLmLl", "lmdml", "lLmLl", ".lll."], { l: lit ? "gold4" : "gold3", L: lit ? "gold5" : "gold4", m: "gold2", d: "gold1" }, "rosette");
  }
  block(p, w / 2 - 4, 0, [".llLll.", "lLmLmLl", "lmdmdml", ".ddddd."].map((r) => r.padEnd(8, ".")), { l: "gold3", L: "gold5", m: "gold4", d: "gold1" }, "shell");
}

/**
 * A frosted glass globe on a brass bracket, 16×24. The arm is a little bent from a ladder, so the
 * globe sits a pixel off true. Globe top on wall row 14.
 */
function lampGlobe(p: Px) {
  // Soft glow round the globe: the lamp is lit for the dark early opening.
  p.faded(0.25, () => p.ellipse(8, 6, 8, 6.5, "gold5"));
  // Globe.
  p.ellipse(8, 6, 5.5, 5.5, "cream4");
  p.ellipse(7, 5, 4, 4, "cream5");
  p.ellipse(6.5, 4.5, 2, 2, "white");
  block(p, 3, 1, ["..ccccc...", ".c.......c"], { c: "cream4" }, "rim");
  p.px(12, 8, "cream3").px(11, 10, "cream3").px(12, 9, "cream3").px(10, 11, "cream3");
  // Gallery cup under the globe, the bent arm, the wall plate.
  block(p, 4, 11, ["glllllg", ".gdddg."], { g: "gold2", l: "gold4", d: "gold1" }, "cup");
  block(p, 6, 13, ["..lg..", "..lg..", "...lg.", "...lg.", "...lg.", "..lg..", "..lg..", ".lllg.", "lgggdl", "lgddgd", "lgggdd", ".dddd."], { l: "gold3", g: "gold2", d: "gold1" }, "arm");
}

/**
 * A tall blackboard menu in an ebonised frame, 30×44, with a chalk ledge and a stub of chalk. It is
 * blank: the day's menu is DOM text over the board. Overlay rectangle: x 4–25, y 4–37 (22×34).
 * Frame top on wall row 14.
 */
function menuBoard(p: Px) {
  p.rect(0, 0, 30, 41, "wood1");
  p.hline(0, 0, 30, "wood3").vline(0, 0, 41, "wood3").hline(1, 1, 28, "wood2").vline(1, 1, 39, "wood2");
  p.rect(3, 3, 24, 36, "steel1");
  p.hline(3, 3, 24, "ink").vline(3, 3, 36, "ink");
  // Yesterday's menu wiped off with one broad sweep of the cloth, and chalk dust settling at the foot.
  for (let x = 5; x < 25; x++) {
    const y = Math.round(27 - (x - 5) * 0.55 + ((x - 15) / 10) ** 2 * 2);
    p.px(x, y, "steel2");
    if (x > 6 && x < 23) p.px(x, y + 1, "steel2");
  }
  for (let x = 4; x < 26; x++) if (hash(x >> 1, 37, 4) > 0.4) p.px(x, 37, "steel2");
  for (let x = 4; x < 26; x++) if (hash(x >> 2, 38, 4) > 0.3) p.px(x, 38, "steel3");
  // Chalk ledge with a stub of chalk and the dust under it.
  p.rect(0, 41, 30, 2, "wood2").hline(0, 41, 30, "wood3").hline(0, 43, 30, "wood1");
  p.hline(20, 40, 3, "white").px(23, 40, "cream4").hline(18, 42, 7, "cream3");
  // Brass hanging hook at the top.
  block(p, 13, 0, [".gg.", "g..g"], { g: "gold3" }, "hook");
}

/**
 * The scalloped edge of the striped awning over the street door, seen from inside against the bright
 * street, 64×12: cream and bottle-green canvas glowing with the light behind it, bound along the
 * scallops, one scallop torn and stitched. Layer `over`: it hangs above everyone.
 */
function awning(p: Px) {
  const stripe = (x: number) => ((x >> 3) % 2 === 0 ? ["cream4", "cream5", "cream3"] : ["jade3", "jade4", "jade2"]) as [Color, Color, Color];
  for (let x = 0; x < 64; x++) {
    const [face, lit, shade] = stripe(x), u = x % 8;
    // Valance band rows 0–5: the canvas lit where the sun comes through, folds at the stripe joins.
    for (let y = 0; y < 6; y++) p.px(x, y, u === 0 ? shade : y < 2 ? lit : face);
    // Scallops: a half-round tongue per stripe hanging below the band.
    const depth = [6, 5, 4, 2][Math.min(3, Math.abs(u - 3.5) > 3 ? 3 : Math.abs(u - 3.5) > 2 ? 2 : Math.abs(u - 3.5) > 1 ? 1 : 0)];
    for (let y = 6; y < 6 + depth; y++) p.px(x, y, y === 5 + depth ? shade : face);
  }
  // Binding tape along the top, and the stitched tear.
  p.hline(0, 0, 64, "jade2");
  block(p, 41, 4, ["k.k", ".k.", "k.k"], { k: "cream2" }, "stitches");
}

const LEGEND: Legend = {};
void LEGEND;

export default defineSprites({
  "wall/mirror-long": { w: 96, h: 40, anchor: [48, 80], layer: "floor", draw: mirror },
  "wall/lamp-globe": { w: 16, h: 25, anchor: [8, 82], layer: "floor", draw: lampGlobe },
  "wall/menu-board-tall": { w: 30, h: 44, anchor: [15, 82], layer: "floor", draw: menuBoard },
  "wall/awning-edge": { w: 64, h: 12, anchor: [32, 12], layer: "over", draw: awning },
});
