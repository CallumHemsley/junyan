/**
 * The residential building's structure (ticket 0202): an old shikumen house's shared hall (mailboxes,
 * a notice board, the stair up, doors to the rooms either side) and the player's small apartment on the
 * floor above. One sprite per map prop, `<map>/<id>`, anchored on the footprint's bottom-centre.
 *
 * Walls are seen as the cafe's: a wall running east–west shows a tall face (lime plaster over a dark
 * dado) under a timber cap, rising from its footprint; a wall running north–south shows its cap and a
 * narrow foreshortened face on the room side. Doors, windows, the notice board and the wall lights stand
 * on those faces.
 */
import { defineSprites, hash, TILE, type Color, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { block } from "./_lane.ts";

const MAPS = ["residential-hall", "apartment"];
const props = (kind: string) => mapProps(MAPS, kind);

/** A sprite rising `rise` px above its footprint, anchored on the footprint's bottom-centre. */
function sprite(prop: MapProp, rise: number, draw: (p: Px, w: number, h: number) => void, extra: Partial<SpriteDef> = {}): SpriteDef {
  const { w, h: foot } = footprintPx(prop);
  const h = foot + rise;
  return { w, h, anchor: [Math.round((prop.width * TILE) / 2), h - 1], draw: (p) => draw(p, w, h), ...extra };
}

/** Face heights: the hall's walls are a storey of the old house; the flat's are lower, the map shows two tiles. */
const FACE: Record<string, number> = { "residential-hall": 92, apartment: 64 };

// ── walls ───────────────────────────────────────────────────────────────────

/**
 * An east–west wall's face, `face` px tall from its foot (the sprite's bottom row): timber cap, plaster
 * yellowed with age, a picture rail, a dark panelled dado, a skirting. `tint` picks the plaster.
 */
function wallFace(p: Px, w: number, h: number, face: number, seed: number, tint: "cream" | "jade"): void {
  const top = h - face, dado = Math.round(face * 0.62);
  const plaster: [Color, Color, Color] = tint === "jade" ? ["jade5", "jade6", "jade4"] : ["cream3", "cream4", "cream2"];
  for (let x = 0; x < w; x++) for (let y = 0; y < 5; y++) p.px(x, top + y, y === 0 ? "wood1" : y === 4 ? "wood4" : hash(x >> 3, y, seed) > 0.75 ? "wood1" : "wood2");
  p.hline(0, top + 5, w, "wood1");
  p.rect(0, top + 6, w, dado - 6, plaster[0]);
  p.hline(0, top + 6, w, plaster[2]).hline(0, top + 7, w, plaster[2]);
  for (let y = top + 8; y < top + dado; y++) for (let x = 0; x < w; x++) if (hash(x >> 4, y >> 3, seed) > 0.87) p.px(x, y, plaster[1]);
  // A picture rail, with a nail or two.
  p.hline(0, top + 12, w, "wood3").hline(0, top + 13, w, "wood1");
  for (let x = 30; x < w; x += 90 + Math.floor(hash(x, 1, seed) * 60)) p.px(x, top + 14, "steel2");
  const dy = top + dado;
  p.hline(0, dy, w, "wood4").hline(0, dy + 1, w, "wood3").hline(0, dy + 2, w, "wood1");
  p.rect(0, dy + 3, w, h - 6 - dy - 3, "wood2");
  for (let x = 0; x < w; x += 32) {
    const ph = h - 6 - dy - 9;
    if (ph < 4) break;
    p.frame(x + 4, dy + 6, 24, ph, "wood1");
    p.hline(x + 5, dy + 7, 22, "wood3").vline(x + 5, dy + 7, ph - 2, "wood3");
  }
  p.hline(0, h - 6, w, "wood3").rect(0, h - 5, w, 4, "wood1").hline(0, h - 1, w, "ink");
  for (const x of [0, w - 1]) p.vline(x, top + 6, dado - 6, plaster[2]);
}

/**
 * A north–south wall: its timber cap along the outer edge and a narrow foreshortened face on the room
 * side (plaster over a strip of dado). The cap runs on up `rise` px to meet the east–west wall's cap.
 */
function sideWall(p: Px, w: number, h: number, room: "east" | "west", rise: number, seed: number, tint: "cream" | "jade" = "cream"): void {
  const at = (i: number) => (room === "east" ? i : w - 1 - i);
  const cap = Math.min(7, w - 4);
  const plaster: Color = tint === "jade" ? "jade5" : "cream3";
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) {
    let c: Color;
    if (i < cap) c = i === 0 ? "ink" : i === cap - 1 ? "wood4" : hash(y >> 3, i, seed) > 0.8 ? "wood1" : "wood2";
    else if (y < rise) continue;
    else c = i < cap + 2 ? "cream2" : i < w - 2 ? plaster : i === w - 2 ? "wood3" : "wood1";
    p.px(at(i), y, c);
  }
  for (let y = rise + 16; y < h; y += 32) p.px(at(w - 2), y, "wood1");
}

// ── doors and windows ───────────────────────────────────────────────────────

/**
 * A room door in a wall face: a stone-framed doorway with a transom, its two leaves closed (black lacquer
 * with brass), or folded back and the room dim beyond (`open`). The opening is the prop's width.
 */
function door(p: Px, w: number, h: number, open: boolean, seed: number): void {
  const base = h - 1, dh = 68, top = base - dh, J = 5;
  p.rect(0, top - 14, w, dh + 15, "stone4");
  p.hline(0, top - 14, w, "stone5").vline(0, top - 14, dh + 15, "stone5").vline(w - 1, top - 14, dh + 15, "stone2");
  // Transom: a fan of small panes over the door.
  p.rect(J, top - 11, w - 2 * J, 9, "wood2");
  for (let x = J + 1; x < w - J - 1; x++) p.vline(x, top - 10, 7, (x - J) % 8 === 0 ? "wood2" : x < w / 2 ? "blue5" : "blue4");
  p.hline(J, top - 3, w - 2 * J, "stone3");
  if (open) {
    p.rect(J, top, w - 2 * J, dh, "wood1");
    // The room beyond: its floor in the lamp's warmth, a chair back, a scroll on the far wall (blank).
    p.rect(J + 2, base - 18, w - 2 * J - 4, 16, "oak2");
    for (let y = base - 16; y < base - 2; y += 4) p.hline(J + 2, y, w - 2 * J - 4, "oak1");
    p.faded(0.35, (q) => q.ellipse(w / 2, base - 12, w / 3, 6, "gold4"));
    p.rect(w / 2 - 6, top + 10, 12, 22, "cream4");
    p.hline(w / 2 - 7, top + 10, 14, "wood2").hline(w / 2 - 7, top + 31, 14, "wood2");
    for (const x of [J, w - J - 6]) { p.rect(x, top, 6, dh - 2, "steel1"); p.vline(x, top, dh - 2, "steel2"); p.vline(x + 5, top, dh - 2, "ink"); }
  } else {
    const lw = Math.floor((w - 2 * J) / 2);
    for (const [lx, side] of [[J, 0], [J + lw, 1]] as const) {
      p.rect(lx, top, lw, dh, "steel1");
      p.frame(lx + 4, top + 5, lw - 8, Math.floor(dh * 0.4), "ink");
      p.frame(lx + 4, top + 10 + Math.floor(dh * 0.4), lw - 8, dh - 16 - Math.floor(dh * 0.4), "ink");
      p.vline(lx + 2, top + 3, dh - 6, "steel2");
      p.vline(side ? lx : lx + lw - 1, top, dh, "ink");
      block(p, side ? lx + 3 : lx + lw - 8, top + Math.floor(dh * 0.48), [".ab.", "a..c", "a..c", ".cc."], { a: "gold4", b: "gold5", c: "gold2" }, "ring");
    }
    // A pair of slippers left outside, and a calendar page pinned to the leaf.
    block(p, w / 2 - 9, base - 4, ["aab.aab", "ccc.ccc"], { a: "plum3", b: "plum2", c: "plum1" }, "slippers");
  }
  p.rect(J - 2, base - 2, w - 2 * J + 4, 3, "stone4");
  p.hline(J - 2, base - 2, w - 2 * J + 4, "stone5").hline(J - 2, base, w - 2 * J + 4, "steel1");
  void seed;
}

/**
 * A window in an east–west wall: a tall casement with glazing bars, morning sky and the neighbours'
 * roofs in it, a sill with a plant. `glassTop` and `glassH` are rows above the wall's foot.
 */
function wallWindow(p: Px, w: number, h: number, foot: number, glassTop: number, glassH: number, plant: boolean, seed: number): void {
  const top = h - 1 - foot - glassTop;
  p.rect(0, top - 3, w, glassH + 6, "wood2");
  p.hline(0, top - 3, w, "wood4");
  const gx = 3, gw = w - 6;
  for (let y = 0; y < glassH; y++) for (let x = 0; x < gw; x++) {
    const t = y / glassH + (x / gw) * 0.3;
    p.px(gx + x, top + y, t < 0.25 ? "white" : t < 0.6 ? "blue5" : t < 0.95 ? "blue4" : "blue3");
  }
  // The neighbours' roofs and a TV aerial in the lower panes.
  p.faded(0.5, (q) => { for (let x = 0; x < gw; x++) { const r = Math.round(glassH * 0.68 + 3 * Math.abs(Math.sin((x + seed) * 0.06))); q.vline(gx + x, top + r, glassH - r, "steel3"); } });
  p.vline(gx + Math.floor(gw * 0.7), top + Math.round(glassH * 0.45), 8, "steel2");
  for (let x = gx + Math.floor(gw / 2) - 1; x <= gx + Math.floor(gw / 2); x++) p.vline(x, top, glassH, "wood3");
  for (let x = gx + 12; x < gx + gw - 6; x += 16) if (Math.abs(x - (gx + gw / 2)) > 4) p.vline(x, top, glassH, "wood3");
  p.hline(gx, top + Math.floor(glassH / 3), gw, "wood3");
  p.vline(w - 1, top - 3, glassH + 6, "wood1");
  // The sill.
  p.rect(-1 + 1, top + glassH + 3, w, 3, "wood4");
  p.hline(0, top + glassH + 3, w, "wood5").hline(0, top + glassH + 5, w, "wood1");
  if (plant) block(p, Math.floor(w * 0.2), top + glassH - 4, ["..ab..", ".abbc.", "abccbd", ".eeff.", ".efff."], { a: "leaf4", b: "leaf3", c: "leaf2", d: "leaf1", e: "orange2", f: "orange1" }, "sillPot");
}

// ── hall fittings ───────────────────────────────────────────────────────────

/**
 * The stair rail along the upper hall: a polished handrail seen from above on turned balusters, its
 * newel post at the foot with a brass cap. North–south, 13 px wide.
 */
function railing(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1;
  for (let y = 0; y < h; y++) {
    p.px(2, y, "wood1");
    for (let i = 3; i < w - 3; i++) p.px(i, y, i === 3 ? "wood4" : i === w - 4 ? "wood1" : "wood3");
    if (y % 6 === 0) for (let i = 3; i < w - 3; i++) p.px(i, y, "wood2");
  }
  // The newel post at the foot.
  p.rect(1, base - 20, w - 2, 21, "wood2");
  p.vline(1, base - 20, 21, "wood4").vline(w - 2, base - 20, 21, "ink");
  p.rect(2, base - 24, w - 4, 5, "gold3");
  p.hline(2, base - 24, w - 4, "gold5");
  void seed;
}

/**
 * The tenants' mailboxes: a cabinet of eight small doors on legs, each with a brass slot and a blank
 * name card (the DOM may letter them), a newspaper sticking out of one, a parcel slip in another.
 */
function mailboxes(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, top = base - 58, cols = 4, rows = 2;
  p.rect(0, top, w, 44, "jade2");
  p.hline(0, top, w, "jade4").vline(w - 1, top, 44, "jade1").hline(0, top + 43, w, "jade1");
  const cw = Math.floor((w - 6) / cols), ch = 19;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = 3 + c * cw, y = top + 3 + r * (ch + 1);
    p.rect(x, y, cw - 2, ch, "jade3");
    p.hline(x, y, cw - 2, "jade4").vline(x + cw - 3, y, ch, "jade1").hline(x, y + ch - 1, cw - 2, "jade1");
    p.rect(x + 4, y + 4, cw - 10, 2, "ink");
    p.hline(x + 4, y + 3, cw - 10, "gold3");
    p.rect(x + 6, y + 9, cw - 14, 6, "cream5");
    p.px(x + cw - 6, y + 12, "gold4");
  }
  // Mail sticking out: a folded newspaper and a slip.
  p.rect(3 + cw + 6, top + 2, 14, 5, "cream4");
  p.hline(3 + cw + 6, top + 4, 14, "steel3");
  p.rect(3 + 3 * cw + 8, top + 22, 8, 4, "white");
  // Legs and a shelf of flyers underneath.
  for (const lx of [2, w - 6]) p.rect(lx, top + 44, 4, base - top - 44, "jade1");
  p.rect(2, base - 6, w - 4, 3, "jade2");
  p.rect(10, base - 10, 22, 4, "cream4");
  p.hline(10, base - 10, 22, "white");
  void seed;
}

/** The notice board on the east wall: cork in a black frame, pinned papers (all blank), a key on a nail. */
function noticeBoard(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, top = base - 64, bh = 30;
  p.rect(0, top, w, bh, "wood1");
  p.rect(2, top + 2, w - 4, bh - 4, "oak3");
  for (let i = 0; i < 40; i++) p.px(3 + Math.floor(hash(i, 1, seed) * (w - 6)), top + 3 + Math.floor(hash(i, 2, seed) * (bh - 6)), "oak2");
  const papers: [number, number, number, number, Color][] = [[5, 5, 16, 12, "white"], [24, 4, 12, 16, "cream5"], [40, 6, 14, 10, "pink3"], [10, 18, 14, 8, "blue6"], [42, 18, 16, 8, "cream4"]];
  for (const [x, y, pw, ph, c] of papers) if (x + pw < w - 2) {
    p.rect(x, top + y, pw, ph, c);
    p.vline(x + pw - 1, top + y + 1, ph - 1, "cream2").hline(x + 1, top + y + ph - 1, pw - 1, "cream2");
    p.px(x + Math.floor(pw / 2), top + y + 1, "red3");
  }
  p.px(w - 4, top + bh + 3, "steel2");
  block(p, w - 6, top + bh + 4, [".a.", "a.a", ".a.", ".b.", ".bb"], { a: "gold3", b: "gold2" }, "key");
}

/**
 * A hall lantern: a brass and glass lamp hung on a cord over the mailboxes (`hang`), or the apartment's
 * small wall sconce with a pleated shade. Both glow (the scene adds the light).
 */
function lantern(p: Px, w: number, h: number, hang: boolean): void {
  const base = h - 1;
  if (hang) {
    const cy = base - 70, cx = Math.floor(w / 2);
    p.vline(cx, 0, cy, "ink2");
    block(p, cx - 6, cy, [
      "...aa...", "..abbc..", ".abbbbc.", "deeeeeef", "deffffef", "defgffef", "deffffef", "deeeeeef", ".dddddd.", "...cc...",
    ].map((r) => r.padEnd(12, ".")), { a: "gold5", b: "gold4", c: "gold2", d: "gold1", e: "gold3", f: "gold5", g: "white" }, "lantern");
  } else {
    const cy = base - 40;
    block(p, 2, cy, [".aaaaaa.", "abbbbbba", "abbbbbbc", ".cccccc.", "...dd...", "...dd...", "..eeee.."].map((r) => r.padEnd(Math.max(8, w - 2), ".")).map((r) => r.slice(0, Math.max(8, w - 2))),
      { a: "cream5", b: "gold5", c: "cream3", d: "gold2", e: "wood2" }, "sconce");
  }
}

// ── apartment fittings ──────────────────────────────────────────────────────

/** A marble door sill set in the floor, worn in the middle. */
function threshold(p: Px, w: number, h: number): void {
  p.rect(0, 0, w, h, "cream5");
  p.frame(0, 0, w, h, "stone3");
  if (w > h) p.hline(Math.floor(w * 0.3), Math.floor(h / 2), Math.floor(w * 0.4), "stone4");
  else p.vline(Math.floor(w / 2), Math.floor(h * 0.3), Math.floor(h * 0.4), "stone4");
  p.px(3, 2, "stone4").px(w - 5, h - 3, "stone4");
}

/**
 * A shelf on the west wall, seen foreshortened along the wall: framed photographs from home, a few
 * books, a ceramic cat, a jar of pebbles from a beach. North–south.
 */
function wallShelf(p: Px, w: number, h: number, seed: number): void {
  const base = h - 1, lift = 34;
  const top = 0, len = h - lift;
  for (let y = top; y < top + len; y++) { p.px(0, y + lift - 14, "wood1"); }
  // The shelf board, seen from above along the wall, things standing on it.
  p.rect(0, top + lift - 14, w, len, "wood3");
  p.vline(w - 1, top + lift - 14, len, "wood1").vline(0, top + lift - 14, len, "wood4");
  const things = [
    { rows: ["aaaa", "abba", "abca", "abba", "aaaa"], legend: { a: "wood2", b: "cream5", c: "skin3" } },   // photo
    { rows: ["abc", "abc", "abc", "abc", "abc", "abc"], legend: { a: "blue3", b: "red3", c: "jade3" } },    // books
    { rows: [".a.a", ".aaa", "abaa", ".aaa"], legend: { a: "white", b: "ink" } },                         // ceramic cat
    { rows: [".aa.", "abba", "acba", "abca", "aaaa"], legend: { a: "blue5", b: "stone4", c: "cream4" } },  // jar of pebbles
    { rows: ["aaaa", "abba", "acba", "aaaa"], legend: { a: "gold3", b: "blue4", c: "white" } },            // small framed print
  ];
  let y = top + lift - 10, k = Math.floor(hash(seed, 1, 1) * things.length);
  while (y < top + lift - 14 + len - 6) {
    const t = things[k % things.length];
    p.rows(2 + Math.floor(hash(k, 2, seed) * Math.max(1, w - 7)), y, t.rows, t.legend as never);
    y += t.rows.length + 4;
    k++;
  }
  // Its brackets, below.
  for (const by of [top + lift - 8, base - 6]) p.rect(1, by, 3, 4, "steel2");
}

// ── sprites ─────────────────────────────────────────────────────────────────

function wallSprite(prop: MapProp): SpriteDef {
  const { w, h } = footprintPx(prop);
  const face = FACE[prop.map] ?? 64;
  const tint = prop.map === "apartment" ? "cream" : "cream";
  if (w >= h) return sprite(prop, face - h, (q, sw, sh) => wallFace(q, sw, sh, face, prop.position.x * 7 + 3, tint));
  // A north–south wall's cap runs on north to the top of the wall it meets.
  const rise = prop.map === "apartment" ? Math.round(prop.position.y * TILE) : face;
  return sprite(prop, rise, (q, sw, sh) => sideWall(q, sw, sh, prop.position.x < 10 ? "east" : "west", rise, 5));
}

function partitionSprite(prop: MapProp): SpriteDef {
  const { w, h } = footprintPx(prop);
  if (w >= h) return sprite(prop, 40 - h, (q, sw, sh) => wallFace(q, sw, sh, 40, 9, "jade"));
  const rise = prop.map === "residential-hall" ? FACE[prop.map] : 40;
  return sprite(prop, rise, (q, sw, sh) => sideWall(q, sw, sh, prop.map === "apartment" || prop.position.x > 10 ? "west" : "east", rise, 7, prop.map === "apartment" ? "jade" : "cream"));
}

function windowSprite(prop: MapProp): SpriteDef {
  const face = FACE[prop.map] ?? 64;
  const { h } = footprintPx(prop);
  // The window's foot row is the wall's foot: the prop's own bottom edge sits a few px proud of it.
  const foot = Math.max(0, h - 13);
  if (prop.map === "residential-hall") return sprite(prop, face, (q, w, sh) => wallWindow(q, w, sh, foot, 72, 44, false, 3));
  return sprite(prop, face, (q, w, sh) => wallWindow(q, w, sh, foot, 52, 32, prop.variant === 1 || prop.id.includes("kitchen"), prop.variant + 1));
}

export default defineSprites(Object.fromEntries([
  ...props("wall").map((p) => [propSpriteId(p.map, p.id), wallSprite(p)] as const),
  ...props("partition").map((p) => [propSpriteId(p.map, p.id), partitionSprite(p)] as const),
  ...props("window").map((p) => [propSpriteId(p.map, p.id), windowSprite(p)] as const),
  ...props("door").map((p) => [propSpriteId(p.map, p.id), sprite(p, 84, (q, w, h) => door(q, w, h, String(p.variant) === "open", 3))] as const),
  ...props("railing").map((p) => [propSpriteId(p.map, p.id), sprite(p, 0, (q, w, h) => railing(q, w, h, 2))] as const),
  ...props("mailboxes").map((p) => [propSpriteId(p.map, p.id), sprite(p, 40, (q, w, h) => mailboxes(q, w, h, 5))] as const),
  ...props("notice-board").map((p) => [propSpriteId(p.map, p.id), sprite(p, 64, (q, w, h) => noticeBoard(q, w, h, 8))] as const),
  ...props("lantern").map((p) => [propSpriteId(p.map, p.id), sprite(p, p.map === "residential-hall" ? 84 : 44, (q, w, h) => lantern(q, w, h, p.map === "residential-hall"))] as const),
  ...props("threshold").map((p) => [propSpriteId(p.map, p.id), sprite(p, 0, (q, w, h) => threshold(q, w, h), { layer: "floor" })] as const),
  ...props("wall-shelf").map((p, i) => [propSpriteId(p.map, p.id), sprite(p, 34, (q, w, h) => wallShelf(q, w, h, i + 4))] as const),
]));
