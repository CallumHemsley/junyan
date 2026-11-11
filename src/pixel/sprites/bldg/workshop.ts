/**
 * The repair workshop's structure (ticket 0182): a cosy Shanghai repair shop in warm light, sawdust on
 * the boards, a lifetime of tools on the walls. One sprite per map prop, id `workshop/<id>`, anchored on
 * the footprint's bottom-centre (pipeline: src/pixel/world/maps.ts).
 *
 * The room is seen as the cafe is: the back (north) wall a tall face with a timber cap (here two tiles,
 * all the map shows above the floor), the side walls as caps with a foreshortened face on the inner side,
 * the front as a low wall's cap and street face either side of the open doorway. Windows, the pegboard
 * and the shelving stand on those walls; the benches and small things are another ticket's.
 */
import { defineSprites, hash, TILE, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { block, bricks } from "./_lane.ts";

const MAP = "workshop";
const props = (kind: string) => mapProps(MAP, kind);

/** A sprite rising `rise` px above its footprint, anchored on the footprint's bottom-centre. */
function sprite(prop: MapProp, rise: number, draw: (p: Px, w: number, h: number) => void): SpriteDef {
  const { w, h: foot } = footprintPx(prop);
  const h = foot + rise;
  return { w, h, anchor: [Math.round((prop.width * TILE) / 2), h - 1], draw: (p) => draw(p, w, h) };
}

// ── walls ───────────────────────────────────────────────────────────────────

/** Back wall rows from its top: timber cap 0–4, cornice 5–7, limewash 8–38, dado panelling 39–57, skirting 58–63. */
const BACK = { cap: 5, cornice: 8, dado: 39, skirt: 58, h: 64 };

/**
 * The back wall: limewash gone the colour of tea over a dark panelled dado, the timber cap above. Where
 * the shelving, pegboard and window leave it bare: a fuse box, a blank calendar, a round clock with no
 * numerals, the faded rectangle where a mirror hung.
 */
function backWall(p: Px, w: number, h: number, seed: number, prop: MapProp): void {
  const top = h - BACK.h;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < BACK.cap; y++) p.px(x, top + y, y === 0 ? "wood1" : y === BACK.cap - 1 ? "wood4" : hash(x >> 3, y, seed) > 0.75 ? "wood1" : "wood2");
    p.px(x, top + 5, "wood2").px(x, top + 6, hash(x >> 2, 6, seed) > 0.4 ? "wood5" : "wood4").px(x, top + 7, "wood1");
  }
  p.rect(0, top + BACK.cornice, w, BACK.dado - BACK.cornice, "cream3");
  p.hline(0, top + 8, w, "cream2").hline(0, top + 9, w, "cream2");
  for (let y = top + 10; y < top + BACK.dado; y++) for (let x = 0; x < w; x++) if (hash(x >> 4, y >> 3, seed) > 0.86) p.px(x, y, "cream4");
  // Smoke from the soldering lamp has browned the plaster in a soft band over the benches.
  for (let x = 0; x < w; x++) if (hash(x >> 3, 1, seed + 2) > 0.5) p.px(x, top + 10, "cream1");
  // Dado: dark stained panels with a moulded rail, one panel every 32 px.
  p.hline(0, top + BACK.dado, w, "wood4").hline(0, top + BACK.dado + 1, w, "wood3").hline(0, top + BACK.dado + 2, w, "wood1");
  p.rect(0, top + BACK.dado + 3, w, BACK.skirt - BACK.dado - 3, "wood2");
  for (let x = 0; x < w; x += 32) {
    p.frame(x + 4, top + BACK.dado + 6, 24, BACK.skirt - BACK.dado - 9, "wood1");
    p.hline(x + 5, top + BACK.dado + 7, 22, "wood3").vline(x + 5, top + BACK.dado + 7, BACK.skirt - BACK.dado - 11, "wood3");
  }
  p.hline(0, top + BACK.skirt, w, "wood3").rect(0, top + BACK.skirt + 1, w, 4, "wood1").hline(0, h - 1, w, "ink");
  // What hangs where nothing stands (x in art px from the wall's west end, which is map x = prop.position.x).
  const at = (tilesX: number) => Math.round((tilesX - prop.position.x) * TILE);
  // A fuse box with its cables, near the west end.
  const fx = at(2.4), fy = top + 14;
  p.rect(fx, fy, 14, 18, "steel4");
  p.hline(fx, fy, 14, "steel5").vline(fx + 13, fy, 18, "steel2").hline(fx, fy + 17, 14, "steel2");
  p.rect(fx + 3, fy + 4, 8, 4, "cream4").px(fx + 10, fy + 12, "red3");
  for (const dx of [3, 7, 10]) p.vline(fx + dx, top + 8, fy - top - 8, "ink2");
  // The clock between the parts shelf and the pegboard.
  const cx = at(9.5), cy = top + 20;
  p.ellipse(cx, cy, 7, 7, "wood2");
  p.ellipse(cx, cy, 6, 6, "cream5");
  p.line(cx, cy, cx, cy - 4, "ink").line(cx, cy, cx + 3, cy + 1, "ink");
  p.px(cx - 1, cy - 5, "cream3").px(cx + 4, cy - 3, "cream3").px(cx - 5, cy + 1, "cream3");
  // A blank calendar (DOM may write on it) between the pegboard and the display shelf.
  const kx = at(18.5), ky = top + 13;
  p.rect(kx, ky, 18, 22, "cream5");
  p.rect(kx, ky, 18, 5, "red3");
  p.hline(kx, ky + 5, 18, "red2");
  for (let r = 0; r < 4; r++) p.hline(kx + 2, ky + 9 + r * 3, 14, "cream3");
  p.vline(kx + 17, ky, 22, "cream3").hline(kx, ky + 21, 18, "cream2");
  // The pale ghost of a mirror at the east end, and its nail.
  const gx = at(26.5);
  p.rect(gx, top + 14, 20, 16, "cream4");
  p.px(gx + 10, top + 12, "steel2");
  // The wall's ends are in shadow where they meet the side walls.
  for (const x of [0, w - 1]) p.vline(x, top + 8, BACK.dado - 8, "cream1");
}

/**
 * A side wall: its timber cap seen from above along the outer edge and, on the inner side, a narrow
 * foreshortened face (limewash over a strip of dark dado). The cap runs on up past the floor to meet the
 * back wall's cap, `rise` px.
 */
function sideWall(p: Px, w: number, h: number, inner: "east" | "west", rise: number, seed: number): void {
  const at = (i: number) => (inner === "east" ? i : w - 1 - i);
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) {
    let c: Color;
    if (i < 7) c = i === 0 ? "ink" : i === 6 ? "wood4" : hash(y >> 3, i, seed) > 0.8 ? "wood1" : "wood2";
    else if (y < rise) continue;
    else c = i < 9 ? "cream2" : i < 11 ? "cream3" : i === 11 ? "wood3" : "wood1";
    p.px(at(i), y, c);
  }
  // Panel joints in the dado strip, and the odd hook.
  for (let y = rise + 16; y < h; y += 32) { p.px(at(11), y, "wood1"); p.px(at(12), y, "wood2"); }
  for (let y = rise + 40; y < h - 20; y += 150) p.px(at(9), y, "steel2").px(at(10), y + 1, "steel3");
}

/**
 * The front wall either side of the doorway: its cap from above and its face to the lane below it,
 * brick under limewash, a damp line, a pot or two on the cap.
 */
function lowWall(p: Px, w: number, h: number, seed: number, doorSide: "east" | "west"): void {
  const base = h - 1, capH = 8, face = base - capH;
  for (let x = 0; x < w; x++) for (let y = 0; y < capH; y++) p.px(x, y, y === 0 ? "wood1" : y === 1 ? "wood4" : y === capH - 1 ? "wood1" : hash(x >> 3, y, seed) > 0.8 ? "wood1" : "wood2");
  bricks(p, 0, capH, w, face, seed);
  p.rect(0, capH, w, Math.floor(face * 0.55), "cream3");
  for (let x = 0; x < w; x++) { const d = Math.floor(face * 0.55) + Math.floor(hash(x >> 3, 2, seed) * 3); p.px(x, capH + d, "cream2"); }
  p.hline(0, capH, w, "steel1").hline(0, base, w, "steel1");
  // Pots on the cap: a geranium, a jade plant, an old enamel mug of pencils near the door.
  for (let x = 20; x < w - 20; x += 70 + Math.floor(hash(x, 1, seed) * 40)) block(p, x, 0, ["..ab..", ".abbc.", "abccbd", ".eeff.", ".efff."], { a: "leaf4", b: "leaf3", c: "leaf2", d: "leaf1", e: "orange2", f: "orange1" }, "capPot");
  const mx = doorSide === "east" ? w - 14 : 6;
  block(p, mx, 0, ["a.b.c", "ddddd", "deeed", "deeed", "ddddd"], { a: "gold4", b: "red3", c: "blue4", d: "white", e: "steel5" }, "mug");
}

/** A door post: a square timber jamb, painted jade long ago, worn to wood at shoulder height. */
function doorPost(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1;
  p.rect(1, 0, w - 2, base, "jade3");
  p.vline(1, 0, base, "jade4").vline(w - 2, 0, base, "jade1").hline(1, 0, w - 2, "jade4");
  // Shoulders and parcels have worn the paint through to the wood on the doorway side.
  const worn = seed % 2 ? w - 4 : 2;
  for (let y = base - 50; y < base - 28; y++) { p.px(worn, y, "wood3"); p.px(worn + 1, y, y % 5 ? "wood3" : "jade3"); }
  p.rect(0, base - 4, w, 5, "stone4");
  p.hline(0, base - 4, w, "stone5").hline(0, base, w, "steel1");
  // A brass number plate (blank) on one post.
  if (seed % 2) { p.rect(3, base - 64, w - 6, 6, "gold3"); p.hline(3, base - 64, w - 6, "gold4"); }
}

/**
 * The awning over the yard door: a faded blue-and-white striped canvas sloping down from the wall to a
 * scalloped valance, its iron arms, a patch where it tore. Seen from above; nothing touches the ground.
 */
function awning(p: Px, w: number, h: number, seed: number): void {
  // Fixed high on the front wall (about three metres up) and reaching out a tile over the step, so it
  // sits above the doorway; the rest of the plot below it stays open.
  const top = 0, valance = 38;
  for (let y = top; y < valance; y++) for (let x = 0; x < w; x++) {
    const stripe = Math.floor((x + 2) / 14) % 2;
    const lit = y < top + (valance - top) * 0.45;
    p.px(x, y, stripe ? (lit ? "cream5" : "cream4") : (lit ? "blue4" : "blue3"));
  }
  // Folds where the canvas sags between the arms.
  for (const fx of [Math.floor(w / 3), Math.floor((2 * w) / 3)]) for (let y = top + 3; y < valance; y++) { const c = p.get(fx, y); p.px(fx, y, c === "cream5" || c === "cream4" ? "cream3" : "blue2"); }
  p.hline(0, top, w, "steel2").hline(0, top + 1, w, "steel4");
  // A patch sewn over a tear.
  const px0 = Math.floor(w * 0.62), py0 = top + Math.floor((valance - top) * 0.45);
  p.rect(px0, py0, 14, 9, "cream3");
  p.frame(px0, py0, 14, 9, "oak3");
  // Valance: scallops alternating with the stripes, a dark line under it.
  for (let x = 0; x < w; x++) {
    const stripe = Math.floor((x + 2) / 14) % 2, k = (x + 2) % 14;
    const depth = 6 + (k > 2 && k < 11 ? 2 : 0) + (k > 4 && k < 9 ? 1 : 0);
    for (let y = valance; y < valance + depth; y++) p.px(x, y, y === valance ? "steel2" : stripe ? "cream3" : "blue2");
    p.px(x, valance + depth, "blue1");
  }
  // Iron arms running back to the wall brackets.
  for (const ax of [6, w - 8]) p.line(ax, top + 2, ax + (ax < w / 2 ? 4 : -4), valance, "steel1");
  void seed; void h;
}

// ── windows ─────────────────────────────────────────────────────────────────

/**
 * The high back window: a wide transom of small panes over the pegboard, morning light in it, a plant and
 * a jar of brushes on the sill. Its glass spans the wall's limewash band.
 */
function backWindow(p: Px, w: number, h: number): void {
  const base = h - 1, wallFoot = base - 6, top = wallFoot - BACK.h + 9, gh = 16;
  p.rect(0, top, w, gh + 4, "wood2");
  p.rect(2, top + 2, w - 4, gh, "blue5");
  for (let y = 0; y < gh; y++) for (let x = 0; x < w - 4; x++) {
    const t = y / gh + (x / w) * 0.4;
    if (t > 0.55) p.px(2 + x, top + 2 + y, t > 0.95 ? "blue3" : "blue4");
    else if (t < 0.18) p.px(2 + x, top + 2 + y, "white");
  }
  // Roofs across the lane, faint through the glass.
  p.faded(0.45, (q) => { for (let x = 2; x < w - 2; x++) { const r = top + gh - 4 - Math.round(2 * Math.abs(Math.sin(x * 0.07))); q.vline(x, r, top + gh + 2 - r, "steel3"); } });
  for (let x = 2; x < w - 2; x += 16) p.vline(x, top + 2, gh, "wood3");
  p.hline(2, top + 2 + Math.floor(gh / 2), w - 4, "wood3");
  p.vline(w - 1, top, gh + 4, "wood1").hline(0, top + gh + 3, w, "wood1");
  // Sill with a pot of mint and a jar of brushes.
  p.rect(-1 + 1, top + gh + 4, w, 3, "wood4");
  p.hline(0, top + gh + 4, w, "wood5").hline(0, top + gh + 6, w, "wood1");
  block(p, 20, top + gh - 3, [".ab.", "abbc", ".dd.", ".de."], { a: "leaf4", b: "leaf3", c: "leaf2", d: "orange2", e: "orange1" }, "mint");
  block(p, w - 30, top + gh - 4, ["a.b.c", ".abc.", "ddddd", "deeed", "ddddd"], { a: "wood4", b: "bamboo3", c: "wood2", d: "blue5", e: "blue4" }, "brushes");
}

/**
 * The side window in the west wall, seen almost edge-on: a tall strip of bright glass in the wall's
 * face, its glazing bars across, a sill catching the light.
 */
function sideWindow(p: Px, w: number, h: number): void {
  p.rect(0, 0, w, h, "wood2");
  for (let y = 2; y < h - 2; y++) for (let x = 0; x < w - 1; x++) p.px(x, y, x < 2 ? "white" : x < 4 ? "blue5" : "blue4");
  for (let y = 2; y < h - 2; y += 21) p.hline(0, y, w, "wood3");
  p.vline(w - 1, 0, h, "wood1").hline(0, 0, w, "wood1").hline(0, h - 1, w, "wood1");
  // A geranium on the sill near the top.
  block(p, 0, 10, ["ab", "bc", "dd"].map((r) => r.padEnd(w, ".")).map((r) => r.slice(0, w)), { a: "pink2", b: "leaf3", c: "leaf2", d: "orange1" }, "sidePot");
}

// ── shelving and storage ────────────────────────────────────────────────────

/** A free-standing shelf unit against the back wall: frame, four shelves, the bottom one a cupboard. */
function shelfFrame(p: Px, w: number, h: number, height: number): { top: number; shelves: number[] } {
  const base = h - 1, top = base - height;
  p.rect(0, top, w, height, "wood2");
  p.rect(3, top + 3, w - 6, height - 6, "wood1");
  const shelves = [top + 3 + Math.round((height - 6) * 0.27), top + 3 + Math.round((height - 6) * 0.52), top + 3 + Math.round((height - 6) * 0.76)];
  for (const sy of shelves) { p.hline(3, sy, w - 6, "wood4"); p.hline(3, sy + 1, w - 6, "wood3"); p.hline(3, sy + 2, w - 6, "wood1"); }
  p.vline(0, top, height, "wood3").vline(w - 1, top, height, "ink").hline(0, top, w, "wood4").hline(0, base, w, "ink");
  p.vline(1, top, height, "wood4");
  return { top, shelves };
}

/**
 * The parts shelf: jars of screws and washers, coils of wire, valve tubes in a box, a cassette deck
 * waiting for a belt, spools of thread, an electric fan with no guard; a cupboard below.
 */
function partsShelf(p: Px, w: number, h: number, seed: number): void {
  const { top, shelves } = shelfFrame(p, w, h, 92);
  const rows = [top + 3, ...shelves.map((s) => s + 3)];
  // Shelf 1: jars.
  for (let x = 6; x < w - 10; x += 10) block(p, x, shelves[0] - 10, [".aa.", "abba", "bccb", "bcdb", "bccb", "bbbb", ".ee.", ".ee.", ".ee.", "...."].slice(0, 10),
    { a: "steel4", b: "blue5", c: (["gold3", "steel3", "wood4", "cream4"] as const)[Math.floor(hash(x, 1, seed) * 4)], d: "white", e: "blue4" }, "jar");
  // Shelf 2: coils of wire, a box of valves, a cassette deck.
  for (const [x, c1, c2] of [[8, "orange2", "orange1"], [26, "red3", "red2"], [44, "steel4", "steel2"]] as const) block(p, x, shelves[1] - 9, [".aaaa.", "ab..ba", "a.bb.a", "ab..ba", ".aaaa.", "......", "......", "......", "......"].slice(0, 9), { a: c1, b: c2 }, "coil");
  block(p, 66, shelves[1] - 9, ["aaaaaaaaaaaa", "abcbcbcbcbca", "abcbcbcbcbca", "aaaaaaaaaaaa", "addddddddda.", ".........a..", "............", "............", "............"].slice(0, 9).map((r) => r.padEnd(12, ".")), { a: "oak3", b: "steel5", c: "gold3", d: "oak2" }, "valves");
  p.rect(90, shelves[1] - 10, 30, 10, "steel3");
  p.hline(90, shelves[1] - 10, 30, "steel5").rect(94, shelves[1] - 7, 8, 4, "ink").rect(106, shelves[1] - 7, 8, 4, "ink");
  p.px(97, shelves[1] - 5, "steel4").px(109, shelves[1] - 5, "steel4");
  // Shelf 3: spools of thread and a fan.
  for (let x = 8; x < 70; x += 8) { const c = (["blue3", "pink2", "jade3", "gold3", "plum3", "cream4", "leaf3", "orange2"] as const)[(x >> 3) % 8]; block(p, x, shelves[2] - 7, ["aaaa", ".bb.", ".bb.", ".bb.", ".bb.", ".bb.", "aaaa"], { a: "oak4", b: c }, "spool"); }
  p.ellipse(110, shelves[2] - 12, 10, 10, "jade4");
  p.ellipse(110, shelves[2] - 12, 8, 8, "jade5");
  p.line(110, shelves[2] - 20, 110, shelves[2] - 4, "jade2").line(102, shelves[2] - 12, 118, shelves[2] - 12, "jade2");
  p.rect(107, shelves[2] - 3, 6, 3, "jade2");
  // Cupboard doors below.
  const cy = shelves[2] + 3, ch = h - 1 - cy - 3;
  for (const dx of [3, Math.floor(w / 2)]) { p.rect(dx, cy, Math.floor(w / 2) - 3, ch, "wood3"); p.frame(dx + 3, cy + 3, Math.floor(w / 2) - 9, ch - 6, "wood2"); p.px(dx + (dx === 3 ? Math.floor(w / 2) - 7 : 3), cy + ch / 2, "gold4"); }
  void rows;
}

/**
 * The shelf of repaired things for sale: a tin rooster, a wooden horse, a tin car, two transistor radios
 * and a valve radio, a mantel clock with no numerals, a doll in a new dress; blank price tags on strings.
 */
function displayShelf(p: Px, w: number, h: number, seed: number): void {
  const { shelves } = shelfFrame(p, w, h, 96);
  const tag = (x: number, y: number) => { p.vline(x, y - 3, 3, "cream3"); p.rect(x - 2, y, 5, 3, "white"); p.px(x + 2, y + 2, "cream3"); };
  // Shelf 1: radios.
  const r1 = shelves[0];
  p.rect(8, r1 - 14, 34, 14, "wood4"); p.rect(10, r1 - 12, 14, 10, "oak5"); for (let y = r1 - 11; y < r1 - 2; y += 2) p.hline(11, y, 12, "oak3"); p.ellipse(33, r1 - 7, 4, 4, "gold3"); p.hline(8, r1 - 14, 34, "wood5");
  tag(26, r1 + 4);
  p.rect(52, r1 - 11, 20, 11, "red3"); p.rect(54, r1 - 9, 10, 7, "steel5"); for (let y = r1 - 8; y < r1 - 2; y += 2) p.hline(55, y, 8, "steel3"); p.px(68, r1 - 6, "gold4"); p.hline(52, r1 - 11, 20, "red4");
  p.rect(82, r1 - 11, 20, 11, "jade3"); p.rect(84, r1 - 9, 10, 7, "cream4"); p.px(98, r1 - 6, "gold4"); p.hline(82, r1 - 11, 20, "jade4");
  tag(92, r1 + 4);
  // The mantel clock.
  p.rect(116, r1 - 16, 26, 16, "wood3"); p.ellipse(129, r1 - 9, 7, 6, "cream5"); p.line(129, r1 - 9, 129, r1 - 13, "ink").line(129, r1 - 9, 132, r1 - 8, "ink"); p.hline(116, r1 - 16, 26, "wood5");
  p.rect(152, r1 - 9, 30, 9, "steel4"); p.hline(152, r1 - 9, 30, "steel5"); p.rect(155, r1 - 7, 12, 5, "ink"); p.px(160, r1 - 5, "steel4");
  // Shelf 2: toys.
  const r2 = shelves[1];
  block(p, 10, r2 - 14, ["...ab....", "..abbc...", "..bbbd...", ".eebbbb..", "eebbbbbbf", ".bbbbbbf.", "..bbbbf..", "...g.g...", "...g.g...", "..hh.hh..", "........."].concat(["........."]).concat(["........."]).concat(["........."]).slice(0, 14),
    { a: "red3", b: "gold4", c: "red3", d: "ink", e: "orange2", f: "gold2", g: "steel2", h: "steel3" }, "rooster");
  tag(16, r2 + 4);
  block(p, 34, r2 - 13, ["aa.........", "abb........", ".bbbbbbbbb.", ".bbbbbbbbbc", "..b.b..b.b.", "..b.b..b.b.", "..d.d..d.d.", "eeeeeeeeeee", "e.........e", "...........", "...........", "...........", "..........."],
    { a: "wood2", b: "wood4", c: "cream5", d: "wood2", e: "oak3" }, "horse");
  block(p, 54, r2 - 8, ["..aaaa..", ".abbbba.", "accccccd", "addddddd", ".ee..ee."], { a: "blue4", b: "blue6", c: "blue3", d: "blue2", e: "ink" }, "tinCar");
  tag(60, r2 + 4);
  // The doll in a new dress.
  block(p, 76, r2 - 16, ["..aa..", ".abba.", ".bbbb.", "..cc..", ".dddd.", "dddddd", "deedde", "dddddd", ".dddd.", "..ff..", "..ff..", "..gg.."], { a: "hair1", b: "skin4", c: "skin3", d: "pink2", e: "pink3", f: "skin3", g: "ink" }, "doll");
  // A wooden top and a tin frog.
  block(p, 96, r2 - 6, [".aa.", "abba", ".cc.", "..d."], { a: "plum3", b: "gold4", c: "plum2", d: "wood2" }, "top");
  block(p, 110, r2 - 6, [".a..a.", "abbbba", "bcbbcb", ".bbbb."], { a: "leaf4", b: "leaf3", c: "ink" }, "frog");
  tag(116, r2 + 4);
  // Shelf 3: boxes of the owners' things waiting to be collected, with names (blank cards).
  const r3 = shelves[2];
  for (let x = 8; x < w - 20; x += 30) {
    p.rect(x, r3 - 12, 24, 12, "oak3"); p.hline(x, r3 - 12, 24, "oak4").vline(x + 23, r3 - 12, 12, "oak1");
    p.rect(x + 6, r3 - 9, 12, 6, "cream5");
  }
  // Bottom: a glass-fronted cabinet with a reel-to-reel inside.
  const cy = r3 + 3, ch = h - 1 - cy - 3;
  p.rect(3, cy, w - 6, ch, "blue5");
  p.faded(0.6, (q) => q.rect(4, cy + 1, w - 8, ch - 2, "wood1"));
  p.ellipse(40, cy + ch / 2, 8, 8, "steel3"); p.ellipse(70, cy + ch / 2, 8, 8, "steel3");
  for (let x = 3; x < w - 3; x += 48) p.vline(x, cy, ch, "wood3");
  for (let k = 0; k < 6; k++) p.px(10 + k * 30, cy + 2 + (k % 2), "white");
  void seed;
}

/**
 * The pegboard over the main bench: every tool drawn round in white paint so it goes back where it came
 * from; most are home, the gaps say what is out on the benches.
 */
function pegboard(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, top = base - 40, bh = 26;
  p.rect(0, top, w, bh, "oak4");
  p.frame(0, top, w, bh, "wood2");
  for (let y = top + 3; y < top + bh - 2; y += 4) for (let x = 3; x < w - 2; x += 4) p.px(x, y, "oak2");
  const tools: [string[], Record<string, Color>][] = [
    [["..a..", ".aaa.", "..b..", "..b..", "..b..", "..b..", "..c..", "..c..", "..c.."], { a: "steel3", b: "steel4", c: "wood3" }],       // hammer
    [["aaa", ".b.", ".b.", ".b.", ".b.", ".c.", ".c.", ".c.", ".c."], { a: "steel5", b: "steel4", c: "red3" }],                          // screwdriver
    [["a...a", ".a.a.", "..b..", ".c.c.", "c...c", "c...c"], { a: "steel4", b: "steel2", c: "blue3" }],                                   // pliers
    [["aaaaaaa", "a.....a", "abbbbba", "aaaaaaa"], { a: "steel3", b: "steel5" }],                                                      // spirit level / ruler
    [["aaaa", "a..a", "a..a", ".bb.", ".bb.", ".bb.", ".bb.", ".bb."], { a: "steel4", b: "wood4" }],                                     // spanner
    [[".aa.", "abba", "abba", ".aa.", "..c.", "..c.", "..c."], { a: "gold3", b: "gold5", c: "steel2" }],                                 // soldering iron stand
    [["aaaaaaaaaa", "abbbbbbbba", "abababbaba", "aaaaaaaaaa"], { a: "wood3", b: "steel4" }],                                          // saw
  ];
  let x = 6;
  let k = 0;
  while (x < w - 14) {
    const [rows, legend] = tools[k % tools.length];
    const ty = top + 4;
    if (hash(k, 1, seed) > 0.18) p.rows(x, ty, rows, legend);
    else {
      // A tool out on a bench: only its white painted outline remains.
      rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch !== ".") p.px(x + i, ty + j, "white"); }));
    }
    x += rows[0].length + 8;
    k++;
  }
  p.vline(w - 1, top, bh, "wood1").hline(0, top + bh - 1, w, "wood1");
}

/**
 * The drawer chest against the east wall, an old pharmacy cabinet of forty small drawers: its top from
 * above (a tray of screws, a lamp base), its front (facing the room, west) foreshortened down the left,
 * its south end panel showing below.
 */
function drawers(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, end = 40, topH = h - end, fw = 12;
  // Top surface.
  p.rect(fw, 0, w - fw, topH, "wood3");
  for (let y = 4; y < topH; y += 9) p.hline(fw + 2, y, w - fw - 4, "wood2");
  p.vline(w - 1, 0, topH, "wood1").hline(fw, 0, w - fw, "wood4");
  block(p, fw + 8, 20, ["aaaaaaa", "abcbcba", "aaaaaaa"], { a: "oak3", b: "steel4", c: "gold3" }, "screwTray");
  block(p, fw + 10, 70, [".aa.", "abba", ".aa.", "cccc"], { a: "gold3", b: "gold5", c: "wood1" }, "lampBase");
  // Front: drawers stacked along the chest, each a narrow strip with a brass pull.
  p.rect(0, 0, fw, topH, "wood2");
  for (let y = 2; y < topH - 2; y += 8) {
    p.rect(1, y, fw - 2, 7, hash(y, 1, seed) > 0.85 ? "wood4" : "wood3");
    p.hline(1, y, fw - 2, "wood4").hline(1, y + 6, fw - 2, "wood1");
    p.px(5, y + 3, "gold4").px(6, y + 3, "gold3");
    if (hash(y, 2, seed) > 0.8) p.rect(2, y + 1, 3, 2, "cream5");
  }
  p.vline(0, 0, topH, "ink");
  // South end panel, facing the camera: panelled side, plinth.
  p.rect(0, topH, w, end, "wood2");
  p.frame(4, topH + 4, w - 8, end - 12, "wood1");
  p.hline(5, topH + 5, w - 10, "wood3").vline(5, topH + 5, end - 14, "wood3");
  p.rect(0, base - 5, w, 6, "wood1");
  p.hline(0, topH, w, "wood4").vline(w - 1, topH, end, "ink").vline(0, topH, end, "ink").hline(0, base, w, "ink");
}

/**
 * The timber rack against the west wall: boards and battens of every wood stood on end in a rack of
 * two uprights and rails, offcuts in a crate at its foot. Seen from the front (south).
 */
function timberRack(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, rackH = 74, top = base - rackH;
  // Boards standing on end, of different heights and woods, leaning a little.
  const woods: [Color, Color, Color][] = [["oak4", "oak3", "oak2"], ["wood4", "wood3", "wood2"], ["oak5", "oak4", "oak3"], ["wood3", "wood2", "wood1"], ["bamboo4", "bamboo3", "bamboo2"]];
  for (let x = 3, k = 0; x < w - 5; k++) {
    const bw = 4 + Math.floor(hash(k, 1, seed) * 4), bh = rackH - 4 - Math.floor(hash(k, 2, seed) * 30);
    const [lit, face, dark] = woods[Math.floor(hash(k, 3, seed) * woods.length)];
    p.rect(x, base - bh, bw, bh, face);
    p.vline(x, base - bh, bh, lit).vline(x + bw - 1, base - bh, bh, dark);
    p.hline(x, base - bh, bw, lit);
    // End grain at the top.
    p.px(x + 1, base - bh + 1, dark);
    x += bw;
  }
  // The rack: two uprights and two rails in front of the boards.
  for (const ux of [0, w - 4]) { p.rect(ux, top, 4, rackH, "wood2"); p.vline(ux, top, rackH, "wood3"); }
  for (const ry of [top + 14, top + 46]) { p.rect(0, ry, w, 4, "wood2"); p.hline(0, ry, w, "wood4"); p.hline(0, ry + 3, w, "wood1"); }
  // Offcuts in a crate at the foot.
  p.rect(6, base - 14, w - 12, 14, "oak3");
  p.hline(6, base - 14, w - 12, "oak4").hline(6, base - 7, w - 12, "oak2").vline(w - 7, base - 14, 14, "oak1");
  for (let x = 9; x < w - 9; x += 5) p.rect(x, base - 18 - (x % 3), 3, 5, (x >> 2) % 2 ? "wood4" : "oak5");
  p.hline(0, base, w, "ink");
}

// ── sprites ─────────────────────────────────────────────────────────────────

function wallSprite(prop: MapProp): SpriteDef {
  const { w, h } = footprintPx(prop);
  if (w >= h) return sprite(prop, BACK.h - h, (q, sw, sh) => backWall(q, sw, sh, 3, prop));
  // A side wall's cap runs on north past the floor to the back wall's top.
  const rise = Math.round(prop.position.y * TILE);
  return sprite(prop, rise, (q, sw, sh) => sideWall(q, sw, sh, prop.position.x < 10 ? "east" : "west", rise, prop.variant + 5));
}

export default defineSprites(Object.fromEntries([
  ...props("wall").map((p) => [propSpriteId(MAP, p.id), wallSprite(p)] as const),
  ...props("low-wall").map((p, i) => [propSpriteId(MAP, p.id), sprite(p, 30, (q, w, h) => lowWall(q, w, h, 11 + i, p.position.x < 10 ? "east" : "west"))] as const),
  ...props("door-post").map((p, i) => [propSpriteId(MAP, p.id), sprite(p, 72, (q, w, h) => doorPost(q, w, h, i + 1))] as const),
  ...props("awning").map((p) => [propSpriteId(MAP, p.id), sprite(p, 96, (q, w, h) => awning(q, w, h, 2))] as const),
  ...props("window").map((p) => {
    const { w, h } = footprintPx(p);
    return [propSpriteId(MAP, p.id), w >= h ? sprite(p, 66, (q, sw, sh) => backWindow(q, sw, sh)) : sprite(p, 0, (q, sw, sh) => sideWindow(q, sw, sh))] as const;
  }),
  ...props("shelf").map((p) => [propSpriteId(MAP, p.id), sprite(p, 70, (q, w, h) => partsShelf(q, w, h, 4))] as const),
  ...props("display-shelf").map((p) => [propSpriteId(MAP, p.id), sprite(p, 74, (q, w, h) => displayShelf(q, w, h, 6))] as const),
  ...props("pegboard").map((p) => [propSpriteId(MAP, p.id), sprite(p, 56, (q, w, h) => pegboard(q, w, h, 8))] as const),
  ...props("drawers").map((p) => [propSpriteId(MAP, p.id), sprite(p, 40, (q, w, h) => drawers(q, w, h, 3))] as const),
  ...props("timber-rack").map((p) => [propSpriteId(MAP, p.id), sprite(p, 66, (q, w, h) => timberRack(q, w, h, 5))] as const),
]));
