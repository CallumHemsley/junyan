/**
 * Street lamps, bollards and the park milestone (ticket 0166). One sprite per map instance, id
 * `town/<id>`, anchored on the footprint's bottom-centre and rising above it.
 *
 * The lamps are the French Concession's own: cast-iron posts put up by the Municipal Council in
 * the 1920s, repainted by every administration since, so the paint is bottle green on some, black
 * on others and council grey over green on the oldest. The glass is drawn unlit; the scene adds
 * the glow (put a `glow` light about 3 tiles above the anchor: the glass is at art y 11–22).
 */
import { defineSprites, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, townProps, townSpriteId } from "../../town/map.ts";
import { PAINT, art, autoOutline, bollard, lampPost, tone, type BollardStyle, type LampStyle, type Ramp } from "./_helpers.ts";

const LAMP_H = 112;

/** Per-instance design: which head, which paint, and the one thing that happened to it. */
const LAMPS: { style: LampStyle; paint: Ramp; story: string }[] = [
  { style: "lantern", paint: PAINT.green, story: "flyer" }, // lamp-0, the junction: notices pasted and torn off for years
  { style: "globe", paint: PAINT.black, story: "lock" }, // lamp-1: bicycles chained to it have rubbed a bright ring
  { style: "hex", paint: PAINT.grey, story: "bag" }, // lamp-2: council grey over green; a plastic bag tied on as a marker
  { style: "lantern", paint: PAINT.black, story: "vine" }, // lamp-3: a morning glory climbing from the verge
  { style: "globe", paint: PAINT.green, story: "collar" }, // lamp-4: hit by a van once, its foot set in a concrete collar
  { style: "hex", paint: PAINT.green, story: "nest" }, // lamp-5, by the park: sparrows nest in the cap
  { style: "lantern", paint: PAINT.grey, story: "plate" }, // lamp-6: a blank enamel number plate, rust round its screws
];

function lampSprite(i: number, w: number): SpriteDef {
  const d = LAMPS[i % LAMPS.length];
  return {
    w, h: LAMP_H, anchor: [Math.round(w / 2), LAMP_H - 1],
    foot: [-3, -4, 6, 4], shadow: { rx: 5, ry: 2 },
    draw: (p) => {
      const L = lampPost(p, { style: d.style, paint: d.paint, w, h: LAMP_H });
      const { cx } = L;
      const r = d.paint;
      if (d.paint === PAINT.grey) {
        // The grey is chipping off the old green beneath, worst at the plinth where feet kick it.
        p.over(() => {
          for (const [x, y] of [[cx - 3, LAMP_H - 4], [cx + 2, LAMP_H - 3], [cx - 1, L.shaftBottom - 9], [cx, L.ring + 6], [cx - 1, L.shaftTop + 14]] as const)
            art(p, x, y, ["12", "1."], { 1: "stone1", 2: "jade2" });
        });
      }
      // Rust weeping from the plinth seam.
      p.over(() => { p.px(cx + 3, LAMP_H - 6, "orange1").px(cx + 3, LAMP_H - 5, "rose2").px(cx - 2, LAMP_H - 10, "orange1"); });
      autoOutline(p, { map: { jade: "jade1", steel: "ink", stone: "stone1", cream: "stone1", blue: "steel1", gold: "wood1", white: "stone1" } });
      const S = L.shaftBottom;
      if (d.story === "flyer") {
        // Layers of pasted notices, scraped: a fresh one over the torn edges of older ones. Blank.
        art(p, cx - 2, S - 22, ["c55c.", "5554c", "4544c", "55c4.", ".5c4.", "c444c", ".c4c."], { 4: "cream4", 5: "cream5", c: "cream3" });
        p.px(cx - 1, S - 20, "stone3").px(cx, S - 20, "stone3").px(cx - 1, S - 18, "stone3");
        p.px(cx + 1, S - 8, "cream3").px(cx - 1, S - 7, "cream4").px(cx, S - 7, "cream3");
      } else if (d.story === "lock") {
        p.hline(cx - 1, S - 6, 3, "steel5").hline(cx - 1, S - 5, 3, "steel4").px(cx - 1, S - 6, "steel6");
      } else if (d.story === "bag") {
        // A blue plastic bag knotted round the shaft, its loose end lifting in the breeze.
        art(p, cx - 2, S - 30, [".bB..", "bBBbb", "1bb1b", "..bb.", "..b1.", "...b."], { b: "blue4", B: "blue5", 1: "blue3" });
      } else if (d.story === "vine") {
        // Morning glory up the urn: leaves and one pale blue flower, still open this early.
        art(p, cx - 4, LAMP_H - 28, [
          "....l....",
          "...lL....",
          "....l.b..",
          "...l.bBb.",
          "..lLl.b..",
          "...l.....",
          "..l.lL...",
          ".lL.l....",
          "..l..l...",
          "...l.lLl.",
          "..lL.l...",
          "...l.l...",
          "....ll...",
          "..lLl....",
          "...l.l...",
          "....l....",
        ], { l: "leaf2", L: "leaf4", b: "blue4", B: "white" });
      } else if (d.story === "collar") {
        // The foot set into a rough concrete collar after the van; the plinth's top step is gone into it.
        p.rect(0, LAMP_H - 4, w, 4, "stone3");
        p.hline(0, LAMP_H - 4, w, "stone4").hline(0, LAMP_H - 1, w, "stone2").vline(w - 1, LAMP_H - 4, 4, "stone2");
        p.px(2, LAMP_H - 3, "stone2").px(7, LAMP_H - 2, "stone2").px(8, LAMP_H - 3, "stone2");
      } else if (d.story === "nest") {
        // Straw poking from under the lantern cap where sparrows have moved in.
        const y = L.glass.y0 - 1;
        art(p, cx + 2, y - 1, ["b..", ".bB", "bb."], { b: "bamboo3", B: "bamboo4" });
        art(p, cx - 5, y, ["..b", "Bb."], { b: "bamboo3", B: "bamboo4" });
      } else if (d.story === "plate") {
        // A small blank enamel number plate screwed to the shaft, chipped at a corner.
        art(p, cx - 2, S - 26, ["kkkkk", "kWWWk", "kWwWk", "kWWok", "kkkkk"], { k: tone(r, 1), W: "cream5", w: "cream4", o: "orange1" });
      }
    },
  };
}

/** Which bollard design each instance gets; the two across a road always match. */
const BOLLARDS: { style: BollardStyle; paint?: Ramp; story?: string }[] = [
  { style: "cannon", story: "cup" }, // bollard-0: somebody's soy-milk cup left on the dome
  { style: "granite", story: "chip" }, // bollard-1: corner knocked off by a cart
  { style: "cannon", paint: PAINT.green, story: "chain" }, // bollard-2: a length of old chain still hooked on
  { style: "steel", story: "dent" }, // bollard-3: the newest, already dented
  { style: "cannon", story: "scuff" }, // bollard-4
  { style: "granite", story: "moss" }, // bollard-5
  { style: "cannon", paint: PAINT.green, story: "paint" }, // bollard-6: a dribble of white road paint
  { style: "steel", story: "sticker" }, // bollard-7
];

function bollardSprite(i: number, w: number): SpriteDef {
  const d = BOLLARDS[i % BOLLARDS.length];
  const h = 34; // headroom above the post for what gets left on top
  return {
    w, h, anchor: [Math.round(w / 2), h - 1], foot: [-3, -3, 6, 3], shadow: { rx: 4, ry: 2 },
    draw: (p) => {
      const b = bollard(p, d.style, w, h, d.paint);
      const { cx, B } = b;
      if (d.story === "chip") art(p, cx + 1, B - 22, ["..", ".3", "32"], { 2: "stone2", 3: "stone3" }), p.px(cx + 3, B - 21, null).px(cx + 3, B - 20, null).px(cx + 2, B - 21, null);
      if (d.story === "chain") art(p, cx + 2, B - 15, ["s.", ".S", "s.", ".o", "s."], { s: "steel3", S: "steel4", o: "orange1" });
      if (d.story === "scuff") p.over(() => { p.px(cx - 1, B - 6, "steel4").px(cx, B - 7, "steel3").px(cx + 1, B - 5, "orange1"); });
      if (d.story === "moss") art(p, cx - 3, B - 2, ["l....l", "Ll..lL", "lLl.ll"], { l: "leaf2", L: "leaf3" });
      if (d.story === "paint") p.over(() => { p.vline(cx - 1, B - 9, 4, "cream5").px(cx - 1, B - 5, "cream4").px(cx - 2, B - 2, "cream5"); });
      if (d.story === "dent") p.over(() => { art(p, cx, B - 9, ["13", "35"], { 1: "steel2", 3: "steel3", 5: "steel5" }); });
      if (d.story === "sticker") p.over(() => { p.rect(cx - 1, B - 7, 2, 2, "jade5").px(cx, B - 6, "jade4"); });
      autoOutline(p, { map: { steel: "ink", stone: "stone1", gold: "wood1", jade: "jade1", cream: "stone1", orange: "ink", leaf: "leaf1" } });
      if (d.story === "cup") {
        // A paper soy-milk cup with its straw, left on the dome by someone who meant to come back.
        art(p, cx - 2, B - 31, ["...s", "..s.", "kkkkk", "kWWWk", "kWwWk", "kWwwk", ".kkk."], { s: "cream4", k: "stone2", W: "white", w: "cream4" });
      }
    },
  };
}

/**
 * The park milestone: a granite marker older than the lane, its carved face worn smooth (no
 * legible text; a shallow eroded cartouche), lichen on the shaded side, and a few coins and a
 * pebble on top that people leave for luck.
 */
function milestone(w: number, h: number): SpriteDef {
  const H = 32;
  return {
    w, h: H, anchor: [Math.round(w / 2), H - 1], foot: [-7, -5, 14, 5], shadow: { rx: 8, ry: 3 },
    draw: (p) => {
      const x0 = Math.floor((w - 15) / 2);
      // Rounded top, then the front face; the top face pale and foreshortened.
      art(p, x0, 2, [
        "....5555554....",
        "..55555554443..",
        ".5555555444433.",
        "554444444333332",
      ], { 2: "stone2", 3: "stone3", 4: "stone4", 5: "stone5" });
      p.rect(x0, 6, 15, H - 7, "stone3");
      p.vline(x0, 6, H - 7, "stone4").vline(x0 + 1, 6, H - 7, "stone4").vline(x0 + 13, 6, H - 7, "stone2").vline(x0 + 14, 6, H - 7, "stone2");
      // The worn cartouche: a shallow sunk panel, its lower lip catching light.
      p.frame(x0 + 3, 8, 9, 14, "stone2");
      p.hline(x0 + 3, 21, 9, "stone4").vline(x0 + 11, 9, 13, "stone4");
      // Weathering: hairline crack, chisel marks at the base, lichen on the shaded right.
      p.line(x0 + 5, 23, x0 + 7, 28, "stone2");
      art(p, x0 + 11, 22, [".jJ", "jjJ", ".jj", "..j"], { j: "jade4", J: "jade5" });
      art(p, x0 + 12, 12, ["j.", "jJ"], { j: "jade4", J: "jade5" });
      p.hline(x0 + 1, H - 2, 13, "stone2");
      // Grass tufts at the foot.
      art(p, x0 - 1, H - 4, ["l..", "lL.", "lLl"], { l: "leaf2", L: "leaf3" });
      art(p, x0 + 13, H - 3, [".l.", "lLl"], { l: "leaf2", L: "leaf3" });
      autoOutline(p, { map: { stone: "stone1", jade: "stone1", leaf: "leaf1" } });
      // Luck: two coins and a pebble on the top.
      art(p, x0 + 4, 1, ["gG.cc", "ggkcC"], { g: "gold2", G: "gold4", c: "stone4", C: "stone5", k: "stone2" });
      art(p, x0 + 10, 2, ["sS"], { s: "steel3", S: "steel5" });
    },
  };
}

const sprites: Record<string, SpriteDef> = {};
townProps("street-lamp").forEach((prop, i) => { sprites[townSpriteId(prop.id)] = lampSprite(i, footprintPx(prop).w); });
townProps("bollard").forEach((prop, i) => { sprites[townSpriteId(prop.id)] = bollardSprite(i, footprintPx(prop).w); });
townProps("milestone").forEach((prop) => { const f = footprintPx(prop); sprites[townSpriteId(prop.id)] = milestone(f.w, f.h); });

export default defineSprites(sprites);
