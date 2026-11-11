/**
 * Fences, the courtyard moon gate and the padlocked yard gate (ticket 0166).
 *
 * Fences are drawn to their footprints: an east–west fence stands on the footprint's bottom edge
 * and rises above it; a north–south one runs down the footprint's centre line, seen end-on. Odd
 * map variants are painted iron railings on a granite kerb (the Concession's own), even ones are
 * split-bamboo garden fences. Each instance has its own small history placed along it.
 */
import { defineSprites, hash, type Px, type SpriteDef } from "../../kit/index.ts";
import { footprintPx, mapProps, propSpriteId, type MapProp } from "../../world/maps.ts";
import { PAINT, art, autoOutline, bambooH, bambooV, railingH, railingV, rod, seedOf, tone, type Ramp } from "./_helpers.ts";

const RISE = 34;

/** Little things left along a fence, placed by seed. */
function fenceStories(p: Px, w: number, top: number, B: number, seed: number, iron: boolean) {
  const n = Math.max(1, Math.floor(w / 140));
  for (let k = 0; k < n; k++) {
    const pick = (seed + k * 7) % 5;
    const x = 10 + Math.floor(hash(k, 3, seed) * Math.max(1, w - 30));
    if (pick === 0) {
      // A cotton towel hung over the top rail to dry.
      art(p, x, top - 1, ["kkkkkkkk", "kWWWWWWk", "kbWbWbWk", "kWWWWWWk", "kbWbWbWk", "kWWWWWck", ".kkkkkk."], { k: "stone2", W: "cream5", b: "blue4", c: "cream3" });
    } else if (pick === 1) {
      // Morning glory climbing from the kerb.
      art(p, x, top + 1, [
        "..l.b...", ".lL.bBb.", "..l..b..", ".l.lL...", "lLl.l...", ".l..lL..", "..l.l...", ".lL..l..",
        "..l.lLl.", "...l.l..", "..lL.l..", "...l.l..", "....l...", "...lL...", "....l...",
      ].slice(0, Math.max(4, B - top - 2)), { l: "leaf2", L: "leaf4", b: "plum3", B: "white" });
    } else if (pick === 2 && iron) {
      // A bent baluster, kicked by someone's cart.
      p.px(x, top + 8, null).px(x + 1, top + 8, "jade2").px(x + 1, top + 9, "jade2");
    } else if (pick === 3) {
      // A bicycle chain lock wrapped round and forgotten.
      art(p, x, top + 10, ["s.s.s", ".S.S.", "s.s.s", "..g..", ".gGg."], { s: "steel3", S: "steel5", g: "gold2", G: "gold4" });
    } else {
      // A plastic bag snagged low, ballooning.
      art(p, x, B - 9, [".bb.", "bBBb", "bBbb", ".bb.", "..b."], { b: "steel5", B: "white" });
    }
  }
}

/**
 * Art-px spans along an east–west fence that a gate already stands on (the map puts
 * town.river-rail-left on the same line as the closed yard gate). There the fence keeps only its
 * kerb, as a sill in front of the gate, rather than drawing a railing through the gate's bars.
 */
function gateSpans(prop: MapProp): [number, number][] {
  return mapProps(prop.map, "gate", "closed-gate")
    .filter((g) => Math.abs(g.position.y + g.height - (prop.position.y + prop.height)) < 0.5)
    .map((g) => [Math.round((g.position.x - prop.position.x) * 32), Math.round((g.position.x + g.width - prop.position.x) * 32)] as [number, number])
    .filter(([a, b]) => b > 0 && a < prop.width * 32);
}

function fenceSprite(prop: MapProp): SpriteDef {
  const f = footprintPx(prop);
  const vertical = f.h > f.w;
  const iron = prop.variant % 2 === 1;
  const seed = seedOf(prop.id);
  const paint: Ramp = seed % 3 === 0 ? PAINT.black : PAINT.green;
  const H = f.h + RISE;
  return {
    w: f.w, h: H, anchor: [Math.round(prop.width * 16), H - 1], // the contract's round(width·32/2)
    draw: (p) => {
      if (vertical) {
        const cx = Math.floor(f.w / 2);
        if (iron) railingV(p, cx, RISE, f.h, { paint, seed });
        else bambooV(p, cx, RISE, f.h, seed);
        return;
      }
      const B = H - 1 - Math.floor((f.h - 4) / 2);
      if (iron) {
        const spans = gateSpans(prop);
        const r = railingH(p, f.w, B, { paint, seed });
        if (spans.length) {
          // Clear the railing above the kerb where a gate stands; leave the kerb as its sill.
          for (const [a, b] of spans) p.rect(Math.max(0, a), 0, Math.min(f.w, b) - Math.max(0, a), B - 4, null);
          p.over(() => { for (const [a, b] of spans) for (let x = Math.max(0, a) + 6; x < Math.min(f.w, b); x += 23) p.hline(x, B - 4, 3, "stone4"); });
          return;
        }
        // Rust where water sits at the feet of the balusters.
        p.over(() => { for (let x = 5; x < f.w - 3; x += 11 + (hash(x, seed) * 9 | 0)) p.px(x, r.bottom + 2, "orange1").px(x, r.bottom + 1, "rose2"); });
        fenceStories(p, f.w, r.top, B, seed, true);
      } else {
        const r = bambooH(p, f.w, B, seed);
        // One panel patched with fresh green lathes where the old ones broke.
        const px0 = 20 + Math.floor(hash(seed, 8) * Math.max(1, f.w - 50));
        p.over(() => { for (let y = r.top + 8; y < B - 3; y++) for (let x = px0; x < px0 + 14; x++) { const c = p.get(x, y); if (c === "bamboo4") p.px(x, y, "leaf5"); else if (c === "bamboo2") p.px(x, y, "leaf4"); } });
        fenceStories(p, f.w, r.top + 2, B, seed, false);
      }
    },
  };
}

/**
 * The courtyard moon gate (town.courtyard-moon-gate): a whitewashed wall with a round opening you
 * walk through, grey tile coping with rolled eave tiles and upturned ridge ends, a lattice "leak
 * window" each side with the garden's bamboo seen through it, last year's spring couplets faded to
 * blank pink paper, damp climbing the plaster from the granite footing, and a patch where the
 * plaster has fallen to show the grey brick. The opening is transparent.
 */
function moonGate(prop: MapProp): SpriteDef {
  const { w } = footprintPx(prop);
  const H = 100, B = H - 1;
  const cx = w / 2, R = 33, cy = B - 4 - R + 4; // the circle's foot sinks under the sill
  const wallTop = 20;
  return {
    w, h: H, anchor: [Math.round(w / 2), B],
    draw: (p) => {
      // Plaster face.
      p.rect(0, wallTop, w, B - wallTop + 1, "cream4");
      p.over(() => {
        // Sun on the upper wall, damp creeping up from the footing in a ragged edge, a few stains.
        p.rect(0, wallTop + 4, w, 10, "cream5");
        for (let x = 0; x < w; x++) {
          const top = B - 14 - Math.round(4 * hash(x >> 2, 1, 5) + 3 * Math.sin(x / 9));
          for (let y = top; y < B - 8; y++) p.px(x, y, y === top || hash(x, y >> 2, 3) < 0.2 ? "stone4" : "cream3");
        }
        for (const [x, y] of [[18, 60], [150, 40], [172, 66], [44, 34]] as const) p.vline(x, y, 8 + (x % 6), "cream3");
      });
      // Fallen plaster showing grey brick, lower left.
      art(p, 22, 66, [
        "..33333...",
        ".3121213..",
        "3212121223",
        "3121212113",
        ".3212123..",
        "..333.....",
      ], { 1: "stone2", 2: "stone3", 3: "cream2" });
      // Granite footing.
      p.rect(0, B - 7, w, 8, "stone3");
      p.hline(0, B - 7, w, "stone4").hline(0, B, w, "stone2");
      for (let x = 13; x < w; x += 24 + (x % 7)) p.vline(x, B - 6, 6, "stone2");
      // Eave shadow under the coping.
      p.hline(0, wallTop, w, "stone2").hline(0, wallTop + 1, w, "cream2");
      // The moon opening: a stone surround ring, then cut through.
      p.ellipse(cx, cy, R + 3, R + 3, "stone3");
      p.over(() => {
        for (let a = 0; a < Math.PI * 2; a += 0.01) {
          const lit = Math.cos(a - 3.9);
          p.px(Math.floor(cx + Math.cos(a) * (R + 2.5)), Math.floor(cy + Math.sin(a) * (R + 2.5)), lit > 0.3 ? "stone4" : lit < -0.4 ? "stone2" : "stone3");
        }
      });
      p.ellipse(cx, cy, R, R, null);
      // The reveal: the wall's thickness seen inside the top of the opening, in shadow.
      for (let a = Math.PI * 1.08; a < Math.PI * 1.92; a += 0.01) {
        const x = Math.floor(cx + Math.cos(a) * (R - 0.5)), y = Math.floor(cy + Math.sin(a) * (R - 0.5));
        p.px(x, y, "stone2").px(x, y + 1, "stone1");
      }
      // Sill: a worn granite step across the foot, dipped in the middle by feet.
      p.rect(Math.floor(cx - R + 3), B - 5, Math.ceil(2 * R - 6), 6, "stone3");
      p.hline(Math.floor(cx - R + 3), B - 5, Math.ceil(2 * R - 6), "stone5");
      p.hline(Math.floor(cx - 10), B - 5, 20, "stone4");
      p.hline(Math.floor(cx - R + 3), B, Math.ceil(2 * R - 6), "stone2");
      // Leak windows: a lattice of grey clay tiles in a hexagonal frame, bamboo behind.
      for (const wx of [Math.round(w * 0.16), Math.round(w * 0.84)]) {
        const x0 = wx - 12, y0 = 36;
        p.rect(x0, y0, 24, 24, "stone3");
        p.rect(x0 + 2, y0 + 2, 20, 20, "leaf2");
        p.over(() => {
          for (let y = y0 + 2; y < y0 + 22; y++) for (let x = x0 + 2; x < x0 + 22; x++) if (hash(x >> 1, y >> 1, 7) < 0.35) p.px(x, y, "leaf3");
          p.hline(x0 + 2, y0 + 2, 20, "leaf1");
          p.vline(x0 + 2, y0 + 2, 20, "leaf1");
        });
        // Lattice: a diamond grid of clay tiles set on edge, each tile two pixels thick, lit on its
        // upper-left face; a rosette where the centre lines cross.
        for (let y = y0 + 2; y < y0 + 22; y++) for (let x = x0 + 2; x < x0 + 22; x++) {
          const a = (x - x0 + y - y0) % 7, b = (((x - x0 - (y - y0)) % 7) + 7) % 7;
          if (a === 0 || b === 0) p.px(x, y, "stone4");
          else if (a === 1 || b === 1) p.px(x, y, "stone2");
        }
        art(p, x0 + 9, y0 + 9, [".44.", "4532", "4322", ".22."], { 2: "stone2", 3: "stone3", 4: "stone4", 5: "stone5" });
        p.frame(x0, y0, 24, 24, "stone2");
        p.hline(x0, y0 + 23, 24, "stone4").vline(x0 + 23, y0, 24, "stone4");
        p.hline(x0 + 1, y0 + 1, 22, "stone1");
      }
      // Faded spring couplets either side of the opening: blank paper, sun-bleached to pink.
      for (const x of [Math.round(cx - R - 12), Math.round(cx + R + 6)]) {
        p.rect(x, 32, 6, 44, "pink3");
        p.over(() => { p.vline(x, 32, 44, "cream4"); p.vline(x + 5, 32, 44, "pink2"); p.px(x + 2, 52, "cream4").px(x + 3, 53, "cream4"); });
        p.rect(x + 1, 74, 4, 3, null); p.px(x + 2, 74, "pink3"); // torn foot
      }
      // Coping: rolled grey tiles seen from above and the front, eave caps along the bottom edge.
      p.rect(0, 8, w, 11, "steel3");
      for (let x = 0; x < w; x += 4) { p.vline(x, 8, 11, "steel2"); p.vline(x + 1, 8, 11, "steel4"); }
      p.hline(0, 8, w, "steel4");
      // Not every tile is the original: a newer pale one, a dark wet one, a gap where one slipped.
      p.over(() => {
        for (const [x, c] of [[37, "stone4"], [118, "steel1"], [151, "stone4"], [84, "steel2"]] as const) p.rect(x, 9, 2, 8, c);
        p.rect(64, 12, 2, 5, "ink2");
        // Lichen and grime streaking down the tiles from the ridge.
        for (let x = 6; x < w - 4; x += 11 + ((x * 3) % 7)) p.vline(x, 9, 2 + (x % 4), "stone2");
      });
      for (let x = 1; x < w - 2; x += 4) { art(p, x, 17, [".33.", "3452", "3442", ".22."], { 2: "steel1", 3: "steel2", 4: "steel3", 5: "steel5" }); }
      // Ridge with upturned swallowtail ends.
      rod(p, 0, 4, w, 4, ["steel1", "steel2", "steel3", "steel4", "steel5"]);
      art(p, 0, 0, ["33...", "443..", "2443.", ".2443"], { 2: "steel2", 3: "steel3", 4: "steel4" });
      art(p, w - 5, 0, ["...33", "..344", ".3442", "3442."], { 2: "steel2", 3: "steel3", 4: "steel4" });
      // Moss on the coping in the shaded right end and a tuft of grass on the ridge.
      art(p, w - 30, 9, [".jj..j", "jJjjjJ", ".j.jj."], { j: "jade3", J: "jade4" });
      art(p, 58, 1, ["l.l", ".lL", "lLl"], { l: "leaf2", L: "leaf4" });
      // Bamboo from the garden leaning over the wall at the left end.
      for (const [x, y, flip] of [[8, 2, 0], [16, 0, 1], [26, 3, 0], [w - 22, 2, 1]] as const) {
        art(p, x, y, flip ? ["..ll..", ".lLl..", "lLl...", "..lLl.", "...ll."] : ["..ll..", "..lLl.", "...lLl", ".lLl..", ".ll..."], { l: "leaf2", L: "leaf4" });
      }
      autoOutline(p, { sides: ["top", "left", "right"], map: { cream: "stone2", stone: "stone1", steel: "steel1", leaf: "leaf1", pink: "stone2", jade: "steel1" } });
    },
  };
}

/**
 * The closed yard gate (town.closed-yard-gate): a pair of iron gates between pebble-dash pillars,
 * painted a council blue-grey long ago and rusting from the hinges down; sheet panels below with a
 * dent at kicking height, bars with spear tips above; a chain wound through the meeting stiles and
 * a heavy brass padlock; a blank notice board wired on, and weeds where nobody sweeps.
 */
function closedGate(prop: MapProp): SpriteDef {
  const { w } = footprintPx(prop);
  const H = 82, B = H - 1;
  const PW = 18; // pillar width
  const paint: Ramp = ["blue1", "steel2", "steel3", "blue4", "blue5"];
  return {
    w, h: H, anchor: [Math.round(w / 2), B],
    draw: (p) => {
      const top = B - 62, mid = B - 30, x0 = PW, x1 = w - PW;
      const meet = Math.round((x0 + x1) / 2);
      // Bars with spear tips.
      for (let x = x0 + 4; x < x1 - 2; x += 5) {
        if (Math.abs(x - meet) < 3) continue;
        p.vline(x, top - 1, mid - top + 2, tone(paint, 2)).vline(x + 1, top - 1, mid - top + 2, tone(paint, 1));
        art(p, x - 1, top - 5, [".3.", ".43", "342", ".2."], { 2: tone(paint, 1), 3: tone(paint, 2), 4: tone(paint, 3) });
      }
      // Sheet panels: riveted, a lit top edge, rust streaks down from every rivet.
      for (const [a, b] of [[x0, meet - 1], [meet + 1, x1]] as const) {
        p.rect(a, mid, b - a, B - 3 - mid, tone(paint, 2));
        p.hline(a, mid, b - a, tone(paint, 3)).hline(a, B - 4, b - a, tone(paint, 1));
        p.over(() => {
          for (let x = a + 4; x < b - 2; x += 10) {
            p.px(x, mid + 3, tone(paint, 4)).px(x, mid + 4, "steel1");
            if (hash(x, 2, 9) < 0.6) p.vline(x, mid + 5, 4 + ((x * 7) % 9), "orange1");
            p.px(x, B - 7, tone(paint, 4));
          }
        });
      }
      // Frames: rails and stiles in square tube.
      for (const [a, b] of [[x0, meet - 1], [meet + 1, x1]] as const) {
        rod(p, a, top, b - a, 3, paint); rod(p, a, mid - 2, b - a, 3, paint); rod(p, a, B - 4, b - a, 3, paint);
        for (const x of [a, b - 3]) { p.vline(x, top, B - top - 1, tone(paint, 3)); p.vline(x + 1, top, B - top - 1, tone(paint, 2)); p.vline(x + 2, top, B - top - 1, tone(paint, 1)); }
      }
      // A dent at kicking height in the right leaf.
      art(p, meet + 30, B - 16, ["2223", "2..4", "3444"].map((r) => r.replace(/\./g, "3")), { 2: tone(paint, 1), 3: tone(paint, 2), 4: tone(paint, 3) });
      // The wicket door outline cut into the left leaf, its own little hinge.
      p.frame(x0 + 26, mid - 22, 26, B - 4 - mid + 22, tone(paint, 1));
      p.rect(x0 + 27, mid + 6, 2, 3, "steel1");
      // Pillars: pebble-dash render, a cap, the plaster cracked.
      for (const px of [0, w - PW]) {
        p.rect(px, top - 10, PW, B - top + 11, "stone4");
        p.over(() => { p.speckle(px, top - 10, PW, B - top + 11, "stone3", 0.28, 13 + px); p.vline(px, top - 10, B - top + 11, "stone5"); p.vline(px + PW - 1, top - 10, B - top + 11, "stone2"); p.vline(px + PW - 2, top - 10, B - top + 11, "stone3"); });
        p.rect(px - 0, top - 16, PW, 6, "stone3");
        p.hline(px, top - 16, PW, "stone5").hline(px, top - 15, PW, "stone4").hline(px, top - 11, PW, "stone2");
        p.line(px + 5, top + 8, px + 8, top + 20, "stone2").line(px + 8, top + 20, px + 7, top + 26, "stone2");
        p.rect(px, B - 3, PW, 4, "stone3");
        // Hinge pins, rust tears below them.
        const hx = px === 0 ? PW : w - PW - 2;
        for (const y of [top + 6, mid + 6]) { p.rect(hx, y, 2, 4, "steel1"); p.vline(hx, y + 4, 9, "orange1"); p.vline(hx + 1, y + 4, 5, "rose2"); }
      }
      // Chain through the meeting stiles and the brass padlock.
      for (let y = mid - 8; y < mid + 6; y += 2) p.px(meet - 2 + ((y >> 1) & 1) * 3, y, "steel4").px(meet - 1 + ((y >> 1) & 1) * 2, y + 1, "steel2");
      art(p, meet - 3, mid + 5, [".sss.", "s...s", "s...s", "ggggg", "gGGgk", "gGkgk", "ggggk", ".kkk."], { s: "steel4", g: "gold3", G: "gold5", k: "gold1" });
      // A blank notice board wired to the right leaf, its corner curling.
      art(p, meet + 12, top + 10, [
        "s..............s",
        ".kkkkkkkkkkkkkk.",
        ".kWWWWWWWWWWWWk.",
        ".kW11111WWW11Wk.",
        ".kWWWWWWWWWWWck.",
        ".kW1111W1111Wck.",
        ".kWWWWWWWWWccck.",
        ".kWWWWWWWWccc.k.",
        ".kkkkkkkkkkkk...",
      ], { s: "steel3", k: "oak1", W: "cream4", c: "cream3", 1: "stone4" });
      // Weeds along the foot.
      for (let x = 3; x < w - 4; x += 13 + ((x * 5) % 11)) art(p, x, B - 4, [".l..", "lLl.", ".lLl", "lLlL"], { l: "leaf2", L: "leaf3" });
      autoOutline(p, { sides: ["top", "left", "right"], map: { blue: "blue1", steel: "steel1", stone: "stone1", gold: "wood1", oak: "wood1", cream: "stone2", leaf: "leaf1", orange: "steel1", rose: "steel1" } });
    },
  };
}

const sprites: Record<string, SpriteDef> = {};
for (const prop of mapProps("all", "fence")) sprites[propSpriteId(prop.map, prop.id)] = fenceSprite(prop);
for (const prop of mapProps("all", "gate")) sprites[propSpriteId(prop.map, prop.id)] = moonGate(prop);
for (const prop of mapProps("all", "closed-gate")) sprites[propSpriteId(prop.map, prop.id)] = closedGate(prop);

export default defineSprites(sprites);
