/**
 * Floors of the residential hall and the apartment (ticket 0202). Placed by
 * `src/pixel/town/ground-residential-legend.ts`.
 *
 * - `terrazzo`: the shikumen hall's 1930s floor, cream cement with grey, black and the odd rose and jade
 *   chip, polished by ninety years of feet; a hairline crack, a worn grey patch.
 * - `timber`: honey parquet laid in a basket weave of 16 px squares, four slats each, the squares turning
 *   alternately; a scuff, a board faded paler in the sun.
 * - `woven`: rush matting in a tight basketweave, warm straw.
 * - `glazed-tile`: 8 px white glazed tiles in grey grout, a band of blue ones, a cracked tile.
 *
 * Every pattern repeats every 32 px and the same at the edges in every variant. Edges: brass strips,
 * cloth binding, marble lips (`ground/edge-…`).
 */
import { defineSprites, hash, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { T, inBlob, sided, stamp, tile, type Corner, type Side } from "./_helpers.ts";

const sprites: Record<string, SpriteDef> = {};
const VARIANTS = ["a", "b", "c", "d"] as const;

// ── terrazzo ────────────────────────────────────────────────────────────────

function terrazzo(p: Px, v: string): void {
  const seed = v.charCodeAt(0);
  p.rect(0, 0, T, T, "stone5");
  // Chips: sparse, a few tones; the same field everywhere near the tile edges.
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const edge = x < 3 || y < 3 || x > T - 4 || y > T - 4;
    const n = hash(x, y, edge ? 3 : seed);
    if (n > 0.965) p.px(x, y, n > 0.993 ? "stone1" : n > 0.982 ? "stone3" : "stone4");
    else if (n > 0.962) p.px(x, y, hash(x, y, 7) > 0.5 ? "rose4" : "jade5");
    else if (n < 0.05) p.px(x, y, "cream5");
  }
  if (v === "c") stamp(p, 6, 8, ["a....", ".a...", ".aa..", "...a.", "....a"], { a: "cream2" }, false);
  // A chip of old repair: a small square of slightly greyer cement.
  if (v === "d") { p.rect(12, 12, 8, 6, "stone4"); p.hline(12, 12, 8, "stone3"); }
}

// ── parquet ─────────────────────────────────────────────────────────────────

/** Slat tones by square and slat, a little irregular; squares that touch the tile edge keep fixed tones. */
const SLATS: readonly Color[] = ["oak3", "oak4", "oak3", "oak3"];
function timber(p: Px, v: string): void {
  const seed = v.charCodeAt(0);
  for (let sq = 0; sq < 4; sq++) {
    const sx = (sq % 2) * 16, sy = Math.floor(sq / 2) * 16, across = (sq === 0 || sq === 3);
    for (let k = 0; k < 4; k++) {
      const tone = SLATS[(k + sq) % 4];
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        const along = across ? i : j, side = across ? j : i;
        if (Math.floor(side / 4) !== k) continue;
        const seam = side % 4 === 3, end = along === 15;
        p.px(sx + i, sy + j, seam || end ? "oak2" : side % 4 === 0 && tone !== "oak4" ? "oak4" : tone);
      }
    }
  }
  // Grain flecks inside the squares.
  for (let i = 0; i < 10; i++) { const x = 2 + Math.floor(hash(i, 1, seed) * 28), y = 2 + Math.floor(hash(i, 2, seed) * 28); if (p.get(x, y) !== "oak1") p.px(x, y, "oak2"); }
  if (v === "c") for (let j = 17; j < 31; j++) for (let i = 17; i < 31; i++) if (p.get(i, j) === "oak3") p.px(i, j, "oak4");
  if (v === "d") stamp(p, 8, 20, ["aaab", "..bb"], { a: "oak2", b: "oak1" }, false);
}

// ── rush matting ────────────────────────────────────────────────────────────

function woven(p: Px, worn: boolean): void {
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    const cell = (Math.floor(x / 4) + Math.floor(y / 4)) % 2, u = x % 4, w = y % 4;
    // Each 4×4 cell is a pair of strands running one way, shaded where they dive under the next.
    const along = cell ? u : w;
    p.px(x, y, along === 3 ? "bamboo2" : along === 0 ? "bamboo4" : "bamboo3");
  }
  if (worn) for (let y = 8; y < 24; y++) for (let x = 6; x < 26; x++) if (inBlob(x, y, 16, 16, 10, 7) && p.get(x, y) === "bamboo3") p.px(x, y, "bamboo4");
}

// ── glazed tile ─────────────────────────────────────────────────────────────

function glazed(p: Px, v: string): void {
  for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 4; tx++) {
    const x0 = tx * 8, y0 = ty * 8;
    // One blue patterned tile in the rare variant; the rest plain white.
    const blue = v === "d" && tx === 1 && ty === 1;
    const face: Color = blue ? "blue4" : "white", lit: Color = blue ? "blue5" : "white", shade: Color = blue ? "blue3" : "cream4";
    p.rect(x0, y0, 8, 8, face);
    p.hline(x0, y0 + 6, 7, shade).vline(x0 + 6, y0, 7, shade);
    p.px(x0 + 1, y0 + 1, lit === "white" ? "cream5" : lit);
    p.hline(x0, y0 + 7, 8, "stone4").vline(x0 + 7, y0, 8, "stone4");
    if (blue) stamp(p, x0 + 1, y0 + 1, [".a.", "aba", ".a."], { a: "white", b: "blue2" }, false);
  }
  // The window's reflection on a few tiles.
  p.px(10, 10, "white").px(11, 9, "white");
  if (v === "c") stamp(p, 17, 17, ["a...", ".a..", ".aa.", "...a"], { a: "stone3" }, false);
}

// ── edges ───────────────────────────────────────────────────────────────────

/** A brass divider strip where the terrazzo stops. */
function brass(p: Px, side: Side): void {
  sided(p, side, (plot) => { for (let a = 0; a < T; a++) { plot(a, 0, "gold2"); plot(a, 1, a % 7 === 0 ? "gold4" : "gold3"); } });
}
/** The matting's cloth binding, with a stitched line. */
function binding(p: Px, side: Side): void {
  sided(p, side, (plot) => { for (let a = 0; a < T; a++) { plot(a, 0, "wood1"); plot(a, 1, "wood2"); plot(a, 2, "wood3"); plot(a, 3, a % 3 === 0 ? "bamboo5" : "wood2"); plot(a, 4, "wood1"); } });
}
function bindingCorner(p: Px, c: Corner): void {
  const x0 = c.endsWith("w") ? 0 : T - 5, y0 = c.startsWith("n") ? 0 : T - 5;
  p.rect(x0, y0, 5, 5, "wood2");
  p.frame(x0, y0, 5, 5, "wood1");
  p.px(x0 + 2, y0 + 2, "bamboo5");
}
/** A marble lip round the glazed tile. */
function marble(p: Px, side: Side): void {
  sided(p, side, (plot) => { for (let a = 0; a < T; a++) { plot(a, 0, "stone3"); plot(a, 1, "cream5"); plot(a, 2, a % 9 === 4 ? "stone4" : "cream5"); plot(a, 3, "stone4"); } });
}

for (const v of VARIANTS) {
  sprites[`ground/terrazzo-${v}`] = tile((p) => terrazzo(p, v));
  sprites[`ground/timber-${v}`] = tile((p) => timber(p, v));
  sprites[`ground/glazed-tile-${v}`] = tile((p) => glazed(p, v));
}
sprites["ground/woven-a"] = tile((p) => woven(p, false));
sprites["ground/woven-b"] = tile((p) => woven(p, true));
for (const side of ["n", "s", "w", "e"] as const) {
  sprites[`ground/edge-terrazzo-${side}`] = tile((p) => brass(p, side));
  sprites[`ground/edge-woven-${side}`] = tile((p) => binding(p, side));
  sprites[`ground/edge-glazed-tile-${side}`] = tile((p) => marble(p, side));
}
for (const c of ["nw", "ne", "sw", "se"] as const) sprites[`ground/edge-woven-${c}`] = tile((p) => bindingCorner(p, c));
// Past the rooms' walls: the dark of rooms and stairwells nobody can see into.
for (const v of ["a", "b"] as const) sprites[`ground/residential-dark-${v}`] = tile((p) => {
  p.rect(0, 0, T, T, "ink2");
  if (v === "b") p.hline(4, 20, 9, "wood1");
});

export default defineSprites(sprites);
