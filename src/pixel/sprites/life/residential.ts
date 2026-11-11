/**
 * Furniture and daily life in the residential hall and the apartment (ticket 0202), one sprite per map
 * prop (`<map>/<id>`) for the kinds no other map draws yet, plus every furnishing the player can own.
 *
 * Owned furnishings are projected at run time (`furnitureProps` in src/features/apartment/world.ts) as
 * props `apartment.furniture.<item>.<orientation>` on their placement's cells; the sprite for each shows
 * the blue scheme in frame 0 and the cream one in frame 1 (the prop's `variant`), so a change of colour
 * needs no new sprite. Orientation keys: `r0`/`r1`, and for the rug `small-r0` … `large-r1`.
 */
import { defineSprites, hash, TILE, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { footprint, itemIds, type ItemId } from "../../../features/apartment/rules.ts";
import { block } from "../bldg/_lane.ts";

const MAPS = ["residential-hall", "apartment"];
const props = (kind: string) => mapProps(MAPS, kind);

function sprite(prop: MapProp, rise: number, draw: (p: Px, w: number, h: number) => void, extra: Partial<SpriteDef> = {}): SpriteDef {
  const { w, h: foot } = footprintPx(prop);
  const h = foot + rise;
  return { w, h, anchor: [Math.round((prop.width * TILE) / 2), h - 1], draw: (p) => draw(p, w, h), ...extra };
}

// ── hall life ───────────────────────────────────────────────────────────────

/** The hall's shoe rack and the flat's: two slatted shelves of everyone's shoes and a pair of slippers. */
function shoeRack(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, top = base - 30;
  p.rect(0, top, w, 4, "wood4");
  p.hline(0, top, w, "wood5").hline(0, top + 3, w, "wood2");
  for (const y of [top + 14, base - 3]) { p.rect(0, y, w, 3, "wood3"); p.hline(0, y, w, "wood4"); }
  for (const x of [0, w - 3]) p.rect(x, top, 3, base - top + 1, "wood2");
  const shoes: [Color, Color][] = [["ink2", "ink"], ["white", "steel4"], ["wood3", "wood1"], ["red3", "red2"], ["blue3", "blue2"], ["plum3", "plum2"], ["cream4", "cream2"]];
  for (let x = 4, k = 0; x < w - 10; x += 10, k++) for (const y of [top + 7, base - 10]) {
    const [a, b] = shoes[Math.floor(hash(k, y, seed) * shoes.length)];
    block(p, x, y, ["aab.aab", "bbb.bbb"], { a, b }, "shoes");
  }
  // On top: a shoehorn and a folded cloth.
  p.hline(6, top - 1, 12, "gold3");
  p.rect(w - 18, top - 3, 12, 3, "cream4");
}

/** A brass umbrella stand with three umbrellas, one still dripping onto the terrazzo. */
function umbrella(p: Px, w: number, h: number): void {
  const base = h - 1, cx = Math.floor(w / 2);
  const brollies: [number, Color, Color][] = [[-4, "blue3", "blue2"], [1, "red3", "red2"], [5, "ink2", "ink"]];
  for (const [dx, a, b] of brollies) {
    const end = cx + Math.round(dx * 0.5);
    p.line(cx + dx, base - 46, end, base - 14, a);
    p.line(cx + dx + 1, base - 46, end + 1, base - 14, b);
    p.px(cx + dx, base - 48, "wood3").px(cx + dx + 1, base - 47, "wood3");
  }
  p.rect(cx - 7, base - 18, 14, 18, "gold3");
  p.vline(cx - 7, base - 18, 18, "gold4").vline(cx + 6, base - 18, 18, "gold1").hline(cx - 7, base - 18, 14, "gold5");
  p.faded(0.4, (q) => q.ellipse(cx + 9, base - 1, 4, 1.5, "blue4"));
}

/** A brown paper parcel tied with string (0), the hall shelf of parcels waiting (1), or a canvas bag (2). */
function parcel(p: Px, w: number, h: number, kind: number): void {
  const base = h - 1;
  if (kind === 1) {
    p.rect(0, base - 26, w, 3, "wood3"); p.hline(0, base - 26, w, "wood4");
    for (const lx of [1, w - 4]) p.rect(lx, base - 23, 3, 23, "wood2");
    for (let x = 6, k = 0; x < w - 14; x += 18, k++) {
      const bh = 10 + (k % 2) * 4;
      p.rect(x, base - 26 - bh, 14, bh, k % 3 === 1 ? "steel5" : "oak3");
      p.hline(x, base - 26 - bh, 14, k % 3 === 1 ? "white" : "oak4");
      p.vline(x + 7, base - 26 - bh, bh, "cream5");
      p.rect(x + 2, base - 23 - bh + 3, 5, 3, "white");
    }
    p.rect(6, base - 10, w - 12, 9, "oak3"); p.hline(6, base - 10, w - 12, "oak4");
    return;
  }
  if (kind === 2) {
    block(p, Math.floor(w / 2) - 9, base - 20, ["...aaaa....", "..a....a...", "..a....a...", "bbbbbbbbbbb", "bcccccccccd", "bcccccccccd", "bcceeeccccd", "bcccccccccd", "bcccccccccd", "bcccccccccd", "bcccccccccd", "bcccccccccd", ".dddddddddd"].map((r) => r.slice(0, 11)),
      { a: "wood2", b: "jade4", c: "jade3", d: "jade2", e: "cream5" }, "bag");
    return;
  }
  const bx = Math.floor(w / 2) - 10, by = base - 18;
  p.rect(bx, by, 20, 6, "oak4"); p.rect(bx, by + 6, 20, 12, "oak3");
  p.hline(bx, by, 20, "oak5").vline(bx + 19, by, 18, "oak1").hline(bx, by + 17, 20, "oak1");
  p.vline(bx + 10, by, 18, "cream5").hline(bx, by + 10, 20, "cream5");
  p.rect(bx + 3, by + 1, 5, 3, "white");
}

/** A mat by kind: the bench's patchwork cushion (hall), a towelling bath mat, the tea corner's big rug. */
function mat(p: Px, w: number, h: number, prop: MapProp): void {
  if (prop.map === "residential-hall") {
    // A patchwork cushion on the bench, its seat 18 px up.
    const y = h - 1 - 22;
    const patches: Color[] = ["blue4", "pink3", "jade4", "gold4", "plum3", "cream4"];
    for (let i = 0; i < Math.floor(w / 8); i++) p.rect(i * 8 + 1, y, 8, 8, patches[i % patches.length]);
    p.hline(1, y, w - 2, "white").hline(1, y + 7, w - 2, "steel2");
    for (let x = 8; x < w - 2; x += 8) p.vline(x, y, 8, "cream5");
    return;
  }
  if (prop.variant === 1) {
    // The tea corner's rug: madder and indigo, a medallion, a border, a little worn where the stool goes.
    p.rect(0, 0, w, h, "blue2");
    p.frame(0, 0, w, h, "ink2");
    p.frame(4, 4, w - 8, h - 8, "cream4");
    for (let x = 6; x < w - 6; x++) for (const y of [6, h - 7]) p.px(x, y, (x >> 2) % 2 ? "rose3" : "cream4");
    for (let y = 6; y < h - 6; y++) for (const x of [6, w - 7]) p.px(x, y, (y >> 2) % 2 ? "rose3" : "cream4");
    p.rect(8, 8, w - 16, h - 16, "rose2");
    for (let y = 8; y < h - 8; y++) for (let x = 8; x < w - 8; x++) if ((x + y) % 12 === 0 || (x - y + 240) % 12 === 0) p.px(x, y, "rose3");
    p.ellipse(w / 2, h / 2, w * 0.18, h * 0.2, "blue2");
    p.ellipse(w / 2, h / 2, w * 0.14, h * 0.15, "cream4");
    p.ellipse(w / 2, h / 2, w * 0.08, h * 0.08, "gold3");
    for (let x = 1; x < w - 1; x += 2) { p.px(x, 0, "cream5"); p.px(x, h - 1, "cream5"); }
    return;
  }
  // A towelling bath mat, jade with a white stripe.
  p.rect(2, 2, w - 4, h - 4, "jade4");
  p.hline(2, 2, w - 4, "jade5").hline(2, h - 3, w - 4, "jade2");
  for (const y of [8, h - 10]) p.hline(4, y, w - 8, "white");
  for (let y = 4; y < h - 4; y += 2) for (let x = 4; x < w - 4; x += 3) if ((x + y) % 4 === 0) p.px(x, y, "jade3");
}

// ── apartment fittings ──────────────────────────────────────────────────────

/**
 * The kitchen along the back wall: a tiled counter with a two-ring gas stove and a kettle on it, a wok,
 * a rice cooker, a thermos, a chopping board with spring onions, a deep sink; cupboards under it.
 */
function kitchen(p: Px, w: number, h: number): void {
  const base = h - 1, front = 28, top = base - front - (h - front - 14);
  const topH = h - front - 14;
  // Counter top seen from above: white tiles with grey grout.
  p.rect(0, top, w, topH, "white");
  for (let y = top; y < top + topH; y += 6) p.hline(0, y, w, "stone4");
  for (let x = 0; x < w; x += 6) p.vline(x, top, topH, "stone4");
  p.hline(0, top + topH - 1, w, "stone3");
  // Stove with two rings and the kettle.
  p.rect(10, top + 4, 44, topH - 8, "steel2");
  p.frame(10, top + 4, 44, topH - 8, "steel1");
  for (const cx of [21, 43]) { p.ellipse(cx, top + topH / 2, 7, 6, "steel1"); p.ellipse(cx, top + topH / 2, 4, 3, "steel3"); }
  block(p, 15, top + 2, [".aaa..", "abbbcd", "abbbc.", "abbbc.", ".ccc.."], { a: "steel6", b: "steel5", c: "steel3", d: "steel4" }, "kettle");
  // The wok on the back ring, a rice cooker, a thermos with a peony.
  p.ellipse(43, top + topH / 2 - 1, 9, 6, "ink2"); p.ellipse(43, top + topH / 2 - 2, 7, 4, "steel1"); p.hline(52, top + topH / 2 - 1, 6, "wood3");
  p.rect(64, top + 3, 16, 14, "cream5"); p.rect(64, top + 3, 16, 4, "steel4"); p.hline(64, top + 3, 16, "white"); p.px(77, top + 12, "red3");
  p.rect(86, top + 2, 8, 16, "red3"); p.rect(86, top + 2, 8, 3, "steel5"); block(p, 87, top + 8, ["ab", "ba"], { a: "pink2", b: "leaf3" }, "peony");
  // Chopping board with spring onions, and the sink.
  p.rect(102, top + 6, 26, 14, "oak4"); p.hline(102, top + 6, 26, "oak5").hline(102, top + 19, 26, "oak2");
  for (let x = 106; x < 124; x += 3) p.line(x, top + 9, x + 2, top + 17, "leaf3");
  p.rect(140, top + 4, 40, topH - 8, "steel4"); p.rect(143, top + 7, 34, topH - 14, "steel2"); p.hline(143, top + 7, 34, "steel1"); p.px(160, top + 4, "steel6").vline(160, top + 1, 3, "steel5");
  // Front: cupboard doors and a cloth curtain under the sink.
  p.rect(0, base - front, w, front, "jade3");
  p.hline(0, base - front, w, "jade4");
  for (let x = 0; x < 136; x += 34) { p.frame(x + 2, base - front + 3, 30, front - 6, "jade2"); p.px(x + 28, base - front + 12, "gold4"); }
  for (let x = 138; x < w; x++) p.vline(x, base - front + 2, front - 3, (x >> 2) % 2 ? "cream4" : "cream3");
  p.hline(0, base, w, "ink");
}

/** A three-panel folding screen of paper in timber frames, a little plum-blossom spray painted on it. */
function screen(p: Px, w: number, h: number): void {
  const base = h - 1, sh = 64, top = base - sh, panels = 3, pw = Math.floor(w / panels);
  for (let i = 0; i < panels; i++) {
    const x = i * pw, lit = i % 2 === 0;
    p.rect(x, top, pw, sh, "wood2");
    p.rect(x + 2, top + 2, pw - 4, sh - 6, lit ? "cream5" : "cream4");
    p.hline(x + 2, top + Math.floor(sh / 2), pw - 4, "wood3");
    p.vline(x + pw - 1, top, sh, "wood1");
  }
  p.line(4, top + 40, 26, top + 12, "wood1");
  for (const [x, y] of [[10, top + 32], [16, top + 24], [22, top + 16], [26, top + 12]] as const) block(p, x - 1, y - 1, [".a.", "aba", ".a."], { a: "pink2", b: "gold4" }, "blossom");
}

/**
 * The wardrobe: a tall camphor-wood wardrobe with a long mirror in one door, a suitcase on top, seen
 * from the front.
 */
function wardrobe(p: Px, w: number, h: number): void {
  const base = h - 1, wh = 92, top = base - wh;
  p.rect(0, top, w, wh, "wood3");
  p.hline(0, top, w, "wood5").vline(0, top, wh, "wood4").vline(w - 1, top, wh, "wood1");
  p.rect(0, top, w, 6, "wood2");
  const dw = Math.floor((w - 6) / 2);
  p.rect(3, top + 8, dw, wh - 16, "wood4");
  p.rect(5, top + 10, dw - 4, wh - 20, "blue5");
  for (let y = top + 10; y < top + wh - 10; y++) for (let x = 5; x < 5 + dw - 4; x++) if ((x - 5) * 2 + (y - top) < 26) p.px(x, y, "white");
  p.rect(3 + dw + 1, top + 8, dw, wh - 16, "wood4");
  p.frame(3 + dw + 4, top + 12, dw - 6, wh - 24, "wood2");
  p.px(3 + dw - 2, top + wh / 2, "gold4").px(3 + dw + 3, top + wh / 2, "gold4");
  p.rect(2, base - 7, w - 4, 7, "wood1");
  // A suitcase on top, and a hat box.
  p.rect(6, top - 9, 30, 9, "rose2"); p.hline(6, top - 9, 30, "rose3"); p.rect(18, top - 11, 6, 2, "wood1");
  p.rect(w - 22, top - 8, 16, 8, "cream4"); p.hline(w - 22, top - 8, 16, "cream5");
}

/** The bookcase in the corner: four shelves of books, a radio on top, a photo propped against the books. */
function bookcase(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, bh = 100, top = base - bh;
  p.rect(0, top, w, bh, "wood2");
  p.vline(0, top, bh, "wood4").vline(w - 1, top, bh, "ink").hline(0, top, w, "wood4");
  const colours: Color[] = ["blue3", "red3", "jade3", "cream4", "plum3", "gold3", "wood4", "steel4", "pink2", "oak4"];
  for (let s = 0; s < 4; s++) {
    const sy = top + 6 + s * 23;
    p.rect(2, sy, w - 4, 20, "wood1");
    let x = 3;
    while (x < w - 4) {
      const bw = 2 + Math.floor(hash(x, s, seed) * 3), bhh = 13 + Math.floor(hash(x, s + 9, seed) * 6);
      if (hash(x, s + 4, seed) > 0.85) { x += 3; continue; }
      p.rect(x, sy + 20 - bhh, bw, bhh, colours[Math.floor(hash(x, s + 2, seed) * colours.length)]);
      p.px(x, sy + 20 - bhh + 2, "cream5");
      x += bw;
    }
    p.hline(1, sy + 20, w - 2, "wood4").hline(1, sy + 21, w - 2, "wood3");
  }
  p.rect(4, top - 10, 22, 10, "wood4"); p.rect(6, top - 8, 10, 6, "oak5"); p.ellipse(21, top - 5, 3, 3, "gold3");
}

/**
 * The sofa, its long side to the tea table: seen from above, the back along the east, arms at both
 * ends, two seat cushions and a crocheted antimacassar, a book left face down.
 */
function sofa(p: Px, w: number, h: number): void {
  const base = h - 1, rise = 26, top = base - (h - rise) - rise + rise;
  const sh = h - rise;
  // Base and seat seen from above, then its south end facing the camera.
  p.rect(0, 0, w, sh, "jade3");
  p.rect(w - 14, 0, 14, sh, "jade2");
  p.hline(w - 14, 0, 14, "jade3").vline(w - 15, 4, sh - 8, "jade1");
  for (const y of [0, sh - 12]) { p.rect(0, y, w - 14, 12, "jade2"); p.hline(0, y, w - 14, "jade4"); }
  for (const [y0, y1] of [[12, Math.floor(sh / 2)], [Math.floor(sh / 2), sh - 12]] as const) {
    p.rect(2, y0 + 1, w - 18, y1 - y0 - 2, "jade4");
    p.hline(2, y0 + 1, w - 18, "jade5").vline(w - 17, y0 + 1, y1 - y0 - 2, "jade3");
  }
  // Antimacassar on the back, a book face down on the seat.
  p.rect(w - 13, Math.floor(sh / 2) - 12, 12, 24, "cream5");
  for (let y = Math.floor(sh / 2) - 12; y < Math.floor(sh / 2) + 12; y += 3) p.px(w - 13, y, "cream3");
  p.rect(10, 22, 12, 8, "red3"); p.vline(16, 22, 8, "red2");
  // South end, facing the camera.
  p.rect(0, sh, w, rise, "jade2");
  p.hline(0, sh, w, "jade4");
  p.rect(2, base - 4, 4, 4, "wood2").rect(w - 6, base - 4, 4, 4, "wood2");
  p.hline(0, base - 4, w, "jade1");
  void top;
}

/** A pedestal washbasin with a round mirror above and a cake of soap. */
function washbasin(p: Px, w: number, h: number): void {
  const base = h - 1, cx = Math.floor(w / 2);
  p.ellipse(cx, base - 54, 9, 9, "steel4"); p.ellipse(cx, base - 54, 8, 8, "blue5"); p.px(cx - 3, base - 58, "white").px(cx - 2, base - 59, "white");
  p.rect(cx - 3, base - 26, 6, 26, "white"); p.vline(cx + 2, base - 26, 26, "cream4");
  p.ellipse(cx, base - 32, 16, 7, "white"); p.ellipse(cx, base - 33, 12, 4, "cream4"); p.ellipse(cx, base - 33, 3, 2, "steel3");
  p.px(cx, base - 38, "steel5").vline(cx, base - 41, 3, "steel4");
  p.rect(cx + 8, base - 37, 4, 2, "pink3");
}

/** A towel rail on the bath wall with a striped towel and a flannel. */
function towelRail(p: Px, w: number, h: number): void {
  const base = h - 1, y = base - 36;
  p.hline(0, y, w, "steel5").hline(0, y + 1, w, "steel3");
  for (const x of [0, w - 2]) p.rect(x, y - 2, 2, 5, "steel2");
  p.rect(6, y + 2, 20, 18, "blue5");
  for (const yy of [y + 8, y + 12]) p.hline(6, yy, 20, "blue3");
  p.vline(25, y + 2, 18, "blue4");
  p.rect(32, y + 2, 10, 10, "pink3"); p.vline(41, y + 2, 10, "pink2");
}

/** A row of coat hooks by the door: a grey coat, a scarf, a cloth bag. */
function coatHook(p: Px, w: number, h: number): void {
  const base = h - 1;
  p.rect(0, 0, w, h - 30, "wood2");
  p.vline(0, 0, h - 30, "wood4");
  for (let y = 8; y < h - 34; y += 18) p.px(w - 3, y, "gold4").px(w - 2, y, "gold3");
  block(p, 0, 10, ["aab", "aab", "aab", "aab", "abb", "abb", "abb", "bbb"], { a: "steel3", b: "steel2" }, "coat");
  block(p, 2, 30, ["ab", "ab", "ab", "ab", "ab"], { a: "red3", b: "red2" }, "scarf");
  block(p, 0, 42, ["..a", ".a.", "bbb", "bcb", "bbb"], { a: "wood2", b: "cream3", c: "cream5" }, "bag");
  void base;
}

/** Morning sun through the two back windows, falling down and to the right across the boards. */
function sunlight(p: Px, w: number, h: number): void {
  p.faded(0.2, (q) => {
    for (const [x0, ww] of [[0, 72], [134, 72]] as const) for (let y = 0; y < h; y++) {
      const shift = Math.round(y * 0.45);
      for (let x = 0; x < ww; x++) {
        const xx = x0 + x + shift;
        if (xx >= w) continue;
        // Glazing-bar shadows split each patch into panes.
        if (x % 24 === 23 || y % 48 === 47) continue;
        q.px(xx, y, y < h * 0.6 ? "gold5" : "cream5");
      }
    }
  });
}

// ── owned furnishings ───────────────────────────────────────────────────────

type Scheme = { cloth: Color; clothLit: Color; clothDark: Color };
const SCHEMES: readonly Scheme[] = [{ cloth: "blue3", clothLit: "blue4", clothDark: "blue2" }, { cloth: "cream4", clothLit: "cream5", clothDark: "cream3" }];

/** One owned furnishing, `w`×`h` on its cells (h includes `rise`), in colour scheme `s`. */
function furnishing(p: Px, id: ItemId, w: number, h: number, rise: number, s: Scheme, rotated: boolean): void {
  const base = h - 1, fw = w, fh = h - rise;
  const cx = Math.floor(w / 2);
  switch (id) {
    case "bed": {
      // A wooden bed seen from above, headboard at the north, quilt in the scheme, pillow and a folded blanket.
      p.rect(2, rise - 14, fw - 4, 16, "wood2"); p.hline(2, rise - 14, fw - 4, "wood4"); p.frame(6, rise - 11, fw - 12, 10, "wood1");
      p.rect(4, rise + 2, fw - 8, fh - 10, "cream5");
      p.rect(10, rise + 6, fw - 20, 16, "white"); p.hline(10, rise + 21, fw - 20, "cream3");
      p.rect(4, rise + 26, fw - 8, fh - 34, s.cloth);
      p.hline(4, rise + 26, fw - 8, s.clothLit);
      for (let y = rise + 34; y < base - 10; y += 10) p.hline(6, y, fw - 12, s.clothDark);
      p.rect(4, base - 24, fw - 8, 8, s.clothDark);
      p.rect(2, base - 8, fw - 4, 8, "wood2"); p.hline(2, base - 8, fw - 4, "wood4");
      p.vline(2, rise - 14, fh + 14, "wood1"); p.vline(fw - 3, rise - 14, fh + 14, "wood1");
      return;
    }
    case "table": {
      // A square-legged pine table, its top seen from above with a tea ring, its front edge and legs.
      const tx = 6, ty = rise - 26 + 8, tw = fw - 12, th = fh - 16;
      p.rect(tx, ty, tw, th, "oak4");
      p.hline(tx, ty, tw, "oak5").vline(tx + tw - 1, ty, th, "oak2");
      for (let y = ty + 4; y < ty + th; y += 6) p.hline(tx + 2, y, tw - 4, "oak3");
      p.rect(tx, ty + th, tw, 5, "oak2"); p.hline(tx, ty + th + 4, tw, "oak1");
      for (const lx of [tx + 2, tx + tw - 6]) p.rect(lx, ty + th + 5, 4, base - (ty + th + 5) + 1, "oak1");
      p.ellipse(tx + tw * 0.7, ty + th * 0.4, 4, 3, "oak3"); p.ellipse(tx + tw * 0.7, ty + th * 0.4, 3, 2, "oak4");
      void rotated;
      return;
    }
    case "chair": {
      const sx = cx - 12, sy = base - 26;
      p.rect(sx, sy - 22, 24, 6, "wood3"); p.hline(sx, sy - 22, 24, "wood4");
      for (const x of [sx + 2, sx + 20]) p.rect(x, sy - 16, 3, 16, "wood2");
      p.rect(sx, sy, 24, 12, "wood4"); p.hline(sx, sy, 24, "wood5"); p.rect(sx + 3, sy + 2, 18, 8, s.cloth);
      p.rect(sx, sy + 12, 24, 3, "wood2");
      for (const x of [sx + 1, sx + 20]) p.rect(x, sy + 15, 3, base - sy - 15 + 1, "wood1");
      return;
    }
    case "rug": {
      p.rect(0, 0, fw, fh, s.clothDark);
      p.frame(2, 2, fw - 4, fh - 4, "cream5");
      p.rect(5, 5, fw - 10, fh - 10, s.cloth);
      for (let y = 5; y < fh - 5; y++) for (let x = 5; x < fw - 5; x++) if ((x + y) % 10 === 0) p.px(x, y, s.clothLit);
      p.ellipse(fw / 2, fh / 2, fw * 0.2, fh * 0.15, "cream5"); p.ellipse(fw / 2, fh / 2, fw * 0.14, fh * 0.1, s.clothDark);
      for (let x = 1; x < fw - 1; x += 2) { p.px(x, 0, "cream4"); p.px(x, fh - 1, "cream4"); }
      return;
    }
    case "cushion": case "cats.cushion": {
      const cy = base - 14;
      p.ellipse(cx, cy, 20, 12, id === "cats.cushion" ? "plum3" : s.clothDark);
      p.ellipse(cx, cy - 1, 18, 10, id === "cats.cushion" ? "plum4" : s.cloth);
      p.ellipse(cx - 3, cy - 3, 9, 4, id === "cats.cushion" ? "pink3" : s.clothLit);
      if (id === "cats.cushion") { block(p, cx - 3, cy - 2, [".a.a.", "a.a.a", ".aaa.", ".aaa."], { a: "plum2" }, "paw"); for (let k = 0; k < 4; k++) p.px(cx + 8 + k, cy + 4 - (k % 2), "steel6"); }
      else p.px(cx, cy - 1, "gold4");
      return;
    }
    case "repairs.stool": {
      const sx = cx - 12, sy = base - 24;
      p.ellipse(cx, sy + 1, 13, 6, "wood2"); p.ellipse(cx, sy, 12, 5, "wood4"); p.ellipse(cx - 2, sy - 1, 7, 2, "wood5");
      for (const [x0, x1] of [[cx - 9, cx - 11], [cx + 9, cx + 11], [cx - 3, cx - 4]] as const) { p.line(x0, sy + 3, x1, base, "wood2"); p.line(x0 + 1, sy + 3, x1 + 1, base, "wood1"); }
      // The leg Old Hu mended, a pale new one and a brass band.
      p.line(cx + 4, sy + 3, cx + 5, base, "oak5"); p.px(cx + 4, sy + 10, "gold4").px(cx + 5, sy + 10, "gold3");
      p.hline(sx + 4, sy + 12, 16, "oak2");
      return;
    }
    case "garden.planter": {
      const by = base - 18;
      p.rect(cx - 18, by, 36, 18, "wood3"); p.hline(cx - 18, by, 36, "wood4"); p.vline(cx + 17, by, 18, "wood1"); p.hline(cx - 18, by + 9, 36, "wood2");
      p.rect(cx - 16, by + 1, 32, 3, "wood1");
      for (let x = cx - 14; x < cx + 14; x += 4) block(p, x, by - 10, [".a.", "abc", ".b.", ".c.", ".c.", ".c.", ".c.", ".c.", ".c.", ".c.", ".c."].slice(0, 11), { a: "leaf4", b: "leaf3", c: "leaf2" }, "herb");
      return;
    }
    case "vase": case "blue-vase": {
      // A tall porcelain vase on a little stand: white with a blue band, or all-over blue glaze; a spray of
      // peonies or plum branches in it.
      const blue = id === "blue-vase";
      const L = blue ? { a: "blue5", b: "blue4", c: "blue2", d: "white", s: "wood1" } : { a: "white", b: "cream5", c: "cream3", d: "blue3", s: "wood1" };
      block(p, cx - 9, base - 40, [
        ".....abba.........", "......bc..........", "......bc..........", ".....abbc.........", "....abbbbc........", "...abbbbbbc.......", "..abbddddbbc......", "..abddbbddbc......",
        "..abbddddbbc......", "..abbbbbbbbc......", "..abbbbbbbbc......", "...abbbbbbc.......", "....abbbbc........", "....cccccc........", "...ssssssss.......", "...s......s.......",
      ].map((r) => r.slice(0, 16)), L as never, "vase");
      block(p, cx - 8, base - 54, ["a..b..a.", ".abcba..", "..dbd...", "a.ddd.a.", ".ad.da..", "..d.d...", "..d.d...", "...d....", "...d....", "...d....", "...d....", "...d....", "...d....", "...d...."],
        blue ? { a: "white", b: "pink3", c: "gold4", d: "wood2" } : { a: "pink2", b: "pink3", c: "gold4", d: "leaf2" }, "spray");
      return;
    }
    case "basket": case "large-basket": {
      const big = id === "large-basket", bw = big ? 40 : 26, bh = big ? 24 : 16;
      const bx = cx - bw / 2, by = base - bh;
      p.rect(bx, by, bw, bh, "bamboo3");
      for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) if ((x + (y >> 1)) % 4 === 0) p.px(x, y, "bamboo2");
      p.hline(bx, by, bw, "bamboo5").hline(bx, by + 1, bw, "bamboo4").vline(bx + bw - 1, by, bh, "bamboo1");
      if (big) { p.rect(bx + 4, by - 6, bw - 8, 6, "cream4"); p.hline(bx + 4, by - 6, bw - 8, "cream5"); }
      else p.line(bx + 3, by, cx, by - 10, "bamboo2"), p.line(cx, by - 10, bx + bw - 4, by, "bamboo2");
      return;
    }
    case "lamp": case "small-lamp": {
      const small = id === "small-lamp";
      if (small) {
        // A small lamp on a stack of books.
        p.rect(cx - 10, base - 10, 20, 4, "blue3"); p.rect(cx - 9, base - 6, 18, 5, "red3"); p.hline(cx - 9, base - 6, 18, "red4"); p.hline(cx - 10, base - 10, 20, "blue4");
        p.rect(cx - 4, base - 14, 8, 4, "gold2"); p.vline(cx, base - 24, 10, "gold3");
        block(p, cx - 9, base - 34, ["..aaaaaaaaaaaa..", ".abbbbbbbbbbbbc.", "abbbbbbbbbbbbbbc", "abbbbbbbbbbbbbbc", ".cccccccccccccc."].map((r) => r.slice(0, 16)), { a: "cream5", b: "gold5", c: "cream3" }, "shade");
      } else {
        p.rect(cx - 7, base - 4, 14, 4, "wood1"); p.vline(cx, base - 60, 56, "wood2"); p.vline(cx + 1, base - 60, 56, "wood3");
        block(p, cx - 12, base - 76, ["....aaaaaaaaa....", "...abbbbbbbbbc...", "..abbbbbbbbbbbc..", ".abbbbbbbbbbbbbc.", "abbbbbbbbbbbbbbbc", ".cccccccccccccc.."].map((r) => r.slice(0, 17)), { a: "cream5", b: "gold5", c: "cream3" }, "shade");
      }
      return;
    }
  }
}

const ITEM_RISE: Partial<Record<ItemId, number>> = { bed: 14, table: 18, chair: 24, lamp: 60, "small-lamp": 4, vase: 4, "blue-vase": 4, "garden.planter": 8 };

/** Every owned-furnishing sprite: each item in each orientation (and rug size), blue and cream frames. */
function furnishingSprites(): Record<string, SpriteDef> {
  const out: Record<string, SpriteDef> = {};
  // One furniture cell is two tiles (`furnitureRegion.cellSize` in src/features/apartment/world.ts).
  const cell = 2 * TILE;
  for (const id of itemIds) for (const rotation of [0, 1] as const) for (const rugSize of id === "rug" ? (["small", "large"] as const) : (["small"] as const)) {
    const [cw, ch] = footprint(id, rotation, rugSize);
    const w = cw * cell, foot = ch * cell, rise = ITEM_RISE[id] ?? 0, h = foot + rise;
    const key = id === "rug" ? `${rugSize}-r${rotation}` : `r${rotation}`;
    out[`apartment/furniture.${id}.${key}`] = {
      w, h, anchor: [Math.round(w / 2), h - 1], frames: 2, fps: 0.0001, ...(id === "rug" ? { layer: "floor" as const } : {}),
      draw: (p, frame) => furnishing(p, id, w, h, rise, SCHEMES[frame % 2], rotation === 1),
    };
  }
  return out;
}

// ── sprites ─────────────────────────────────────────────────────────────────

export default defineSprites(Object.fromEntries([
  ...props("shoe-rack").map((p, i) => [propSpriteId(p.map, p.id), sprite(p, 24, (q, w, h) => shoeRack(q, w, h, i + 3))] as const),
  ...props("umbrella").map((p) => [propSpriteId(p.map, p.id), sprite(p, 30, (q, w, h) => umbrella(q, w, h))] as const),
  ...props("parcel").map((p) => [propSpriteId(p.map, p.id), sprite(p, p.variant === 1 ? 20 : 4, (q, w, h) => parcel(q, w, h, p.map === "apartment" ? 2 : Number(p.variant)))] as const),
  ...props("mat").map((p) => [propSpriteId(p.map, p.id), p.map === "residential-hall"
    ? sprite(p, 12, (q, w, h) => mat(q, w, h, p))
    : sprite(p, 0, (q, w, h) => mat(q, w, h, p), { layer: "floor" })] as const),
  ...props("kitchen").map((p) => [propSpriteId(p.map, p.id), sprite(p, 28, (q, w, h) => kitchen(q, w, h))] as const),
  ...props("screen").map((p) => [propSpriteId(p.map, p.id), sprite(p, 0, (q, w, h) => screen(q, w, h))] as const),
  ...props("wardrobe").map((p) => [propSpriteId(p.map, p.id), sprite(p, 40, (q, w, h) => wardrobe(q, w, h))] as const),
  ...props("bookcase").map((p) => [propSpriteId(p.map, p.id), sprite(p, 46, (q, w, h) => bookcase(q, w, h, 6))] as const),
  ...props("sofa").map((p) => [propSpriteId(p.map, p.id), sprite(p, 26, (q, w, h) => sofa(q, w, h))] as const),
  ...props("washbasin").map((p) => [propSpriteId(p.map, p.id), sprite(p, 40, (q, w, h) => washbasin(q, w, h))] as const),
  ...props("towel-rail").map((p) => [propSpriteId(p.map, p.id), sprite(p, 40, (q, w, h) => towelRail(q, w, h))] as const),
  ...props("coat-hook").map((p) => [propSpriteId(p.map, p.id), sprite(p, 30, (q, w, h) => coatHook(q, w, h))] as const),
  ...props("sunlight").map((p) => [propSpriteId(p.map, p.id), sprite(p, 0, (q, w, h) => sunlight(q, w, h), { layer: "floor" })] as const),
  ...Object.entries(furnishingSprites()),
]));
