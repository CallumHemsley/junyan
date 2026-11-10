/**
 * Bed curtains: an aluminium ceiling track on drop rods, and pale green cotton privacy curtains with
 * the open mesh band along the top that every hospital curtain has. Boiled in the hospital laundry so
 * often the green has gone soft. All of them stand on the floor: the anchor is the floor point under
 * the curtain line, the track runs 87px above it (just under the ceiling), the drop rods reach the
 * ceiling at 91, and the hem hangs 6px clear of the floor so feet show beneath.
 *
 * East–west runs (face-on), 64 wide, anchor [32, 91]:
 *   `ward/curtain-drawn`     pulled across, full of soft folds; one glider has jumped the track, so the
 *                            mesh sags there; a darned tear; the laundry tag at the hem.
 *   `ward/curtain-gathered`  pushed to the left end in a tight bundle, the rest of the track bare.
 *                            Flip it (`flipX`) to gather at the right.
 *   `ward/curtain-rail`      32 wide, anchor [16, 91]: bare track to continue a run.
 *
 * North–south runs (between beds, seen nearly end-on):
 *   `ward/curtain-side-gathered`  16×92, anchor [8, 91]: the bundle pushed back against the wall.
 *   `ward/curtain-side-drawn`     20×156, anchor [10, 155]: drawn out 64px (two tiles) from the wall;
 *                                 the anchor is the floor under its south end, its top at the wall.
 */
import { defineSprites, hash, type Color, type Px } from "../../kit/index.ts";
import { block } from "./_arch.ts";

const RAIL = 4, MESH = 7, CLOTH = 18, HEM = 84, H = 92;

/**
 * Soft folds of uneven width (6–10px, as cloth really falls): each a lit left facet, the belly, and a
 * shaded right facet; every third fold is deeper and creases to `jade3`. Returns tone and belly per x.
 */
function folds(width: number, seed: number): { tone: Color; belly: boolean; ridge: boolean }[] {
  const out: { tone: Color; belly: boolean; ridge: boolean }[] = [];
  for (let f = 0; out.length < width; f++) {
    const w = 6 + Math.floor(hash(f, 1, seed) * 5), deep = f % 3 === 2;
    for (let i = 0; i < w && out.length < width; i++) {
      const t = i / w;
      const tone: Color = t < 0.3 ? "jade6" : t < 0.7 ? "jade5" : deep && i === w - 1 ? "jade3" : "jade4";
      out.push({ tone, belly: t < 0.45, ridge: i === 1 });
    }
  }
  return out;
}
const TIGHT: readonly Color[] = ["jade6", "jade5", "jade4"];

function track(p: Px, x0: number, x1: number, rods: readonly number[]) {
  const n = x1 - x0 + 1;
  p.hline(x0, RAIL, n, "steel6").hline(x0, RAIL + 1, n, "steel4").hline(x0, RAIL + 2, n, "steel2");
  for (const x of rods) p.vline(x, 0, RAIL, "steel4").vline(x + 1, 0, RAIL, "steel2").hline(x - 1, 0, 4, "steel3");
}

/** The open mesh band, rows 7–16: a hemmed top, a diamond net shaded by the fold under it, a seam. */
function mesh(p: Px, x: number, top: number, tone: Color) {
  const lit = tone === "jade6", shade = tone === "jade4" || tone === "jade3";
  p.px(x, top, lit ? "white" : "cream4");
  for (let y = top + 1; y < CLOTH - 2; y++) {
    if ((x + y) % 3 === 0 || (x - y + 30) % 3 === 0) p.faded(0.8, () => p.px(x, y, shade ? "cream3" : lit ? "white" : "cream5"));
  }
  p.px(x, CLOTH - 2, shade ? "cream3" : "cream4").px(x, CLOTH - 1, shade ? "jade3" : "jade4");
}

/** One column of hanging cloth, rows 18 to the hem, the hem lower where a fold bellies forward. */
function cloth(p: Px, x: number, tone: Color, belly: boolean, hem = HEM) {
  const bottom = hem + (belly ? 1 : 0);
  for (let y = CLOTH; y <= bottom; y++) p.px(x, y, tone);
  p.px(x, bottom - 3, tone === "jade4" ? "jade3" : "jade5").px(x, bottom, "jade3");
}

function drawn(p: Px) {
  track(p, 0, 63, [6, 50]);
  const fall = folds(64, 4);
  for (let x = 0; x < 64; x++) {
    const { tone, belly, ridge } = fall[x];
    // The glider that jumped the track: the mesh sags 2px between x 36 and 45.
    const sag = x >= 36 && x <= 45 ? (x === 36 || x === 45 ? 1 : 2) : 0;
    mesh(p, x, MESH + sag, tone);
    cloth(p, x, tone, belly);
    if (ridge && !sag) p.px(x, MESH - 1, "steel3");
  }
  // The last fold on the right turns away into shade, and the leading edge is hemmed.
  p.vline(63, CLOTH, HEM - CLOTH + 1, "jade3").vline(0, CLOTH, HEM - CLOTH + 1, "jade5");
  // A tear darned in a slightly darker thread.
  block(p, 47, 49, ["c.....", ".c....", "..c...", "...c..", "....c.", ".....c"].map((r) => r), { c: "jade3" }, "darn");
  for (const [x, y] of [[46, 50], [48, 52], [50, 54]] as const) p.px(x, y, "jade4");
  // The laundry tag sewn into the hem, blank where the ward number has washed away.
  block(p, 4, HEM - 4, ["WWW", "WCk", "kk."], { W: "white", C: "cream5", k: "cream3" }, "tag");
}

function gathered(p: Px) {
  track(p, 0, 63, [24, 52]);
  // End stop.
  block(p, 61, RAIL - 1, ["ff.", "fFf", "fFf", "ff."], { f: "steel3", F: "steel1" }, "end-stop");
  for (let y = MESH; y <= HEM + 1; y++) {
    const t = (y - MESH) / (HEM - MESH);
    const xl = 2 - Math.round(t * 2), xr = 14 + Math.round(t * 3);
    for (let x = xl; x <= xr; x++) {
      const tone = TIGHT[(x + 3) % 3];
      const belly = (x + 3) % 3 === 0;
      if (y === HEM + 1 && !belly) continue;
      let c: Color;
      if (y < CLOTH - 2) c = y === MESH ? "white" : (x + y) % 2 ? (tone === "jade4" ? "cream3" : "cream5") : "cream4";
      else if (y === CLOTH - 2) c = "cream4";
      else if (y === CLOTH - 1) c = "jade4";
      else c = y >= HEM - 1 ? "jade3" : y === HEM - 3 ? "jade5" : tone;
      p.px(x, y, c);
    }
    p.px(xr + 1, y, y < CLOTH ? "cream2" : "jade3");
  }
  for (let x = 2; x < 15; x += 2) p.px(x, MESH - 1, "steel3");
}

function sideGathered(p: Px) {
  track(p, 0, 15, [7]);
  for (let y = MESH; y <= HEM + 1; y++) {
    const t = (y - MESH) / (HEM - MESH);
    const xl = 3 - Math.round(t * 2), xr = 12 + Math.round(t * 2);
    for (let x = xl; x <= xr; x++) {
      const k = (x + y * 0) % 4;
      const tone: Color = k === 0 ? "jade6" : k === 3 ? "jade4" : "jade5";
      if (y === HEM + 1 && k !== 1) continue;
      let c: Color;
      if (y < CLOTH - 2) c = y === MESH ? "white" : (x + y) % 2 ? "cream5" : "cream4";
      else if (y === CLOTH - 1) c = "jade4";
      else if (y === CLOTH - 2) c = "cream4";
      else c = y >= HEM - 1 ? "jade3" : tone;
      p.px(x, y, c);
    }
    p.px(xr + 1, y, y < CLOTH ? "cream2" : "jade3");
  }
}

/**
 * Drawn out from the wall, seen almost end-on: the track runs down the picture from the wall (top) to
 * the curtain's south end, and under it the cloth shows as a long narrow fall of folds, lit on the
 * west, a strip of mesh at its head by the wall, the hem at the south end.
 */
function sideDrawn(p: Px) {
  const D = 64, top = RAIL + 3, bottom = D + HEM;
  for (let y = top; y <= bottom + 1; y++) {
    const t = (y - top) / (bottom - top);
    const xl = 5 - Math.round(t * 1.5), xr = 13 + Math.round(t * 1.5);
    for (let x = xl; x <= xr; x++) {
      const k = (x - xl) % 4;
      let c: Color = k === 0 ? "jade6" : k === 3 ? "jade4" : "jade5";
      if (x === xl) c = "jade6";
      if (y < top + 9) c = y === top ? "white" : (x + y) % 2 ? "cream5" : "cream4";
      else if (y === top + 9) c = "cream4";
      else if (y === top + 10) c = "jade4";
      if (y >= bottom - 1) c = "jade3";
      if (y === bottom + 1 && k !== 1) continue;
      p.px(x, y, c);
    }
    p.px(xr + 1, y, y < top + 10 ? "cream2" : "jade3");
  }
  // The track over it, from the wall to the south end, with its drop rods.
  for (let y = RAIL; y <= RAIL + D; y++) p.px(9, y, "steel6").px(10, y, "steel4").px(11, y, "steel2");
  for (const y of [RAIL, RAIL + D]) block(p, 8, y - 4, [".ef.", ".ef.", ".ef.", "eEEf"], { e: "steel5", E: "steel4", f: "steel2" }, "rod");
}

export default defineSprites({
  "ward/curtain-drawn": { w: 64, h: H, anchor: [32, H - 1], draw: drawn },
  "ward/curtain-gathered": { w: 64, h: H, anchor: [32, H - 1], draw: gathered },
  "ward/curtain-rail": { w: 32, h: H, anchor: [16, H - 1], draw: (p) => track(p, 0, 31, [15]) },
  "ward/curtain-side-gathered": { w: 16, h: H, anchor: [8, H - 1], draw: sideGathered },
  "ward/curtain-side-drawn": { w: 20, h: 64 + H, anchor: [10, 64 + H - 1], draw: sideDrawn },
});
