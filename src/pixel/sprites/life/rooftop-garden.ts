/**
 * The rooftop garden's own pots, its sun shade and the crates the roof was found cluttered with. These
 * are run-time props: `projectGarden` (`src/world/maps/rooftop/index.ts`) adds them to the rooftop map
 * from the saved garden, and `runtimeProps` draws each as `rooftop/<id>` with `frame = variant`.
 *
 * One sprite per pot, `rooftop/garden-<plant>`, carries every state the garden can be in as a frame:
 * `frame = growth * 6 + (drooping ? 3 : 0) + care`, with growth 0–3 and care dry 0, ready 1, extra 2.
 * That is 24 frames; `gardenFrame()` is the same formula, and `rooftop-garden.test.ts` pins it to
 * `projectGarden`. Care shows in the soil and the saucer (dry: pale cracked soil, an empty saucer;
 * ready: dark damp soil; extra: water standing on the soil and brimming in the saucer); drooping (the
 * day after too much water) lets the leaves hang and yellow; growth is the plant itself.
 *
 * The garden grows three things: a pot chrysanthemum (花), a climbing butterfly pea on a cane wigwam (藤)
 * and a kumquat sapling (小树). Autumn, a soft morning.
 */
import { Px, defineSprites, hash, type Color, type SpriteDef, type SpriteSet } from "../../kit/index.ts";
import { TILE } from "../../kit/sprite.ts";
import { plantIds, type PlantId } from "../../../features/garden/rules.ts";
import { canopy, mound, type Foliage } from "../plant/_helpers.ts";
import { art, autoOutline, pot, type Ramp } from "./_helpers.ts";

// ── the frame convention ───────────────────────────────────────────────────────

export type Care = "dry" | "ready" | "extra";
const CARE: readonly Care[] = ["dry", "ready", "extra"];
export const GROWTH_STAGES = 4;
/** Every state a garden pot can show: four growth stages × upright/drooping × three care states. */
export const GARDEN_FRAMES = GROWTH_STAGES * 2 * CARE.length;

/** The frame (= the projected prop's `variant`) for a pot's state. */
export const gardenFrame = (growth: number, drooping: boolean, care: Care) => growth * 6 + (drooping ? 3 : 0) + CARE.indexOf(care);

/** The state a frame shows; the inverse of `gardenFrame`. */
export function gardenState(frame: number): { growth: number; drooping: boolean; care: Care } {
  const f = ((frame % GARDEN_FRAMES) + GARDEN_FRAMES) % GARDEN_FRAMES;
  return { growth: Math.floor(f / 6), drooping: f % 6 >= 3, care: CARE[f % 3] };
}

/**
 * Footprints of the run-time props, tiles, as `projectGarden` gives them (pinned by the test): pots
 * 1.4 square, the shade 2 × 2.2, the crates 1.2 and 1.4 wide by 1.2 deep.
 */
export const GARDEN_FOOTPRINTS = {
  pot: { width: 1.4, height: 1.4 },
  shade: { width: 2, height: 2.2 },
  "crate-a": { width: 1.2, height: 1.2 },
  "crate-b": { width: 1.4, height: 1.2 },
} as const;

const px = (t: number) => Math.max(1, Math.round(t * TILE));

// ── pots, soil and saucers ─────────────────────────────────────────────────────

const TERRACOTTA: Ramp = ["rose1", "rose2", "rose3", "rose4", "red5"];
const CELADON: Ramp = ["jade2", "jade3", "jade4", "jade5", "jade6"];
const BROWN_GLAZE: Ramp = ["wood1", "wood2", "wood3", "wood4", "gold2"];
const POTS: Record<PlantId, { glaze: Ramp; w: number; h: number }> = {
  flower: { glaze: TERRACOTTA, w: 24, h: 18 },
  climber: { glaze: CELADON, w: 22, h: 20 },
  tree: { glaze: BROWN_GLAZE, w: 28, h: 21 },
};

/** The saucer under a pot: terracotta, empty and pale when dry, brimming when overwatered. */
function saucer(p: Px, cx: number, G: number, w: number, care: Care): void {
  const ry = 4;
  if (care === "extra") p.faded(0.35, () => p.ellipse(cx + 3, G - 1, w / 2 + 4, ry + 1, "blue2"));
  p.ellipse(cx, G - ry + 1, w / 2, ry, "rose2");
  p.ellipse(cx, G - ry, w / 2, ry - 0.5, "rose3");
  p.ellipse(cx, G - ry, w / 2 - 1.5, ry - 1.5, care === "extra" ? "blue3" : care === "ready" ? "rose2" : "rose4");
  if (care === "extra") p.hline(Math.round(cx - w / 2 + 3), G - ry - 1, 4, "blue5");
}

/** The soil surface in a pot's mouth for its care state. */
function soil(p: Px, s: { cx: number; cy: number; rx: number; ry: number }, care: Care, seed: number): void {
  const { cx, cy, rx, ry } = s;
  if (care === "dry") {
    // Shrunk from the rim, pale and cracked.
    p.ellipse(cx, cy, rx + 0.5, ry + 0.5, "brown1");
    p.ellipse(cx, cy, rx - 0.5, ry - 0.5, "oak4");
    p.over(() => {
      p.line(Math.round(cx - rx * 0.6), Math.round(cy), Math.round(cx - 1), Math.round(cy - 1), "oak2");
      p.line(Math.round(cx), Math.round(cy - 1), Math.round(cx + rx * 0.5), Math.round(cy + 1), "oak2");
      p.speckle(Math.round(cx - rx), Math.round(cy - ry), Math.round(rx * 2), Math.round(ry * 2), "oak5", 0.14, seed);
      p.line(Math.round(cx + 2), Math.round(cy - ry + 1), Math.round(cx + 3), Math.round(cy + ry - 1), "oak2");
    });
    return;
  }
  p.ellipse(cx, cy, rx, ry, care === "extra" ? "wood1" : "brown2");
  p.over(() => p.speckle(Math.round(cx - rx), Math.round(cy - ry), Math.round(rx * 2), Math.round(ry * 2), care === "extra" ? "brown2" : "brown1", 0.18, seed));
  if (care === "ready") p.faded(0.5, () => p.px(Math.round(cx - rx * 0.4), Math.round(cy - 1), "cream4"));
  else {
    p.ellipse(cx + 1, cy + 0.5, rx * 0.7, ry * 0.6, "blue2");
    p.hline(Math.round(cx - rx * 0.3), Math.round(cy - 1), 3, "blue5");
  }
}

// ── the plants ─────────────────────────────────────────────────────────────────

const GREEN: Ramp = ["leaf1", "leaf2", "leaf3", "leaf4", "leaf5"];
const GLOSSY: Ramp = ["jade1", "jade1", "jade2", "leaf2", "jade3", "leaf3", "leaf4"];

/**
 * The pot chrysanthemum, a cutting from Granny Shen's: two seed leaves; a leafy clump; a bushy plant
 * with tight buds; a dome of soft pink double flowers with cream hearts, held in a split-bamboo hoop.
 */
function flower(q: Px, x: number, y: number, growth: number, seed: number): void {
  if (growth === 0) {
    for (const dx of [-4, 1, 5]) art(q, x + dx - 1, y - 4, ["g.g", ".g.", ".s."], { g: "leaf4", s: "leaf2" });
    return;
  }
  const r = [0, 5, 8, 10][growth], h = [0, 6, 10, 13][growth];
  for (const dx of [-2, 0, 2]) q.line(x + dx, y, x + dx * 2, y - h + 2, "leaf2");
  mound(q, x, y - h + r * 0.4, r, r * 0.75, ["leaf1", "leaf1", "leaf2", "leaf3", "leaf4"], seed, [["33", "21"], [".3", "32"], ["3.", "22"]], [3, 2]);
  if (growth === 2) for (let k = 0; k < 5; k++) art(q, x - 7 + Math.floor(hash(k, 1, seed) * 13), y - h - 1 + Math.floor(hash(k, 2, seed) * 5), [".p", "gg"], { p: "pink2", g: "leaf3" });
  if (growth === 3) {
    // The hoop: a split-bamboo ring tied to three canes.
    q.ellipse(x, y - 4, r + 1, 2, "bamboo3");
    q.ellipse(x, y - 4, r, 1.2, null);
    for (let k = 0; k < 9; k++) {
      const fx = x - r + 1 + Math.floor(hash(k, 3, seed) * (r * 2 - 3)), fy = y - h - 2 + Math.floor(hash(k, 4, seed) * (r * 0.9));
      art(q, fx, fy, [".pP.", "pPcP", "ppPp", ".pp."], { p: "pink2", P: "pink3", c: "cream5" });
    }
  }
}

/**
 * The butterfly pea (蝶豆) up a wigwam of three bamboo canes tied at the top: a hooked sprout; a few
 * leaves on short canes; the vine twined two-thirds up; leafy to the top, with blue flowers and pods.
 */
function climber(q: Px, x: number, y: number, growth: number, seed: number): void {
  if (growth === 0) { art(q, x - 1, y - 7, [".gg", "g..", "g..", ".g.", ".g.", ".s.", ".s."], { g: "leaf3", s: "leaf2" }); return; }
  const cane = [0, 22, 36, 44][growth];
  const top = y - cane;
  for (const fx of [-8, 8, 1]) { q.line(x + fx, y - 1, x, top, fx === 1 ? "bamboo2" : "bamboo3"); }
  q.hline(x - 1, top + 1, 3, "cream2");
  const reach = [0, 0.45, 0.7, 1][growth];
  // The vine spirals up the canes; heart leaves along it, alternating sides.
  for (let j = 0; j < Math.round(cane * reach); j++) {
    const t = j / cane;
    const half = 8 * (1 - t);
    const vx = Math.round(x + Math.sin(j / 3 + seed) * half), vy = y - 1 - j;
    q.px(vx, vy, "leaf2");
    if (j % 3 === 1) art(q, vx + (j % 6 === 1 ? 0 : -2), vy - 1, ["3.3", "434", ".2."].map((r) => r.replace(/4/g, "c").replace(/3/g, "b").replace(/2/g, "a")), { a: "leaf2", b: "leaf3", c: "leaf4" });
  }
  if (growth === 3) {
    for (let k = 0; k < 6; k++) {
      const j = 6 + Math.floor(hash(k, 1, seed) * (cane - 8));
      const fx = Math.round(x + Math.sin(j / 3 + seed) * 8 * (1 - j / cane)) + (k % 2 ? 2 : -3);
      art(q, fx, y - 1 - j, [".b.", "bWb", ".b."], { b: k % 3 ? "blue3" : "blue4", W: "white" });
    }
    art(q, x + 4, y - 14, ["g", "g", "g", "G"], { g: "leaf3", G: "leaf2" });
  }
}

const KUMQUAT: Foliage = { ramp: GLOSSY, leaves: [["33", "22"], ["3.", "32"], [".3", "21"]], step: [3, 2] };

/**
 * A kumquat (金桔) grown from a pip of last New Year's fruit: a seedling; a thin whip with a tuft; a
 * little tree tied to a chopstick stake; a round glossy head studded with gold fruit.
 */
function tree(q: Px, x: number, y: number, growth: number, seed: number): void {
  if (growth === 0) { q.vline(x, y - 7, 7, "leaf2"); art(q, x - 3, y - 9, ["gg..gg", ".gG.Gg", "...g.."], { g: "leaf3", G: "leaf4" }); return; }
  const trunk = [0, 14, 18, 22][growth], r = [0, 5, 8, 12][growth];
  q.vline(x, y - trunk, trunk, "wood3");
  if (growth >= 2) q.vline(x + 1, y - trunk + 2, trunk - 2, "wood2");
  if (growth === 2) { q.vline(x + 5, y - trunk - 2, trunk + 2, "wood4"); q.hline(x + 1, y - trunk + 6, 4, "cream3"); }
  const cy = y - trunk - r * 0.6;
  if (growth === 1) mound(q, x, cy, r, r * 0.8, ["jade1", "leaf2", "jade3", "leaf3", "leaf4"], seed, KUMQUAT.leaves, [2, 2]);
  else canopy(q, [{ x, y: cy, rx: r, ry: r * 0.85, seed }], KUMQUAT, { x, y: cy, rx: r, ry: r * 0.85 }, { seed });
  if (growth === 3) for (let k = 0; k < 9; k++) {
    const a = hash(k, 1, seed) * Math.PI * 2, d = 0.3 + hash(k, 2, seed) * 0.6;
    art(q, Math.round(x + Math.cos(a) * r * d) - 1, Math.round(cy + Math.sin(a) * r * 0.8 * d), ["oO", "do"], { o: "orange3", O: "gold4", d: "orange2" });
  }
}

const PLANTS: Record<PlantId, (q: Px, x: number, y: number, growth: number, seed: number) => void> = { flower, climber, tree };

/**
 * Drooping: everything above the soil sags toward its tips, a pixel more the farther it reaches from
 * the stem and the higher it stands, and the leaves go limp and a little yellow.
 */
function droop(q: Px, x: number, y: number): Px {
  const out = new Px(q.w, q.h);
  const yellow: Partial<Record<Color, Color>> = { leaf5: "bamboo4", leaf4: "bamboo3", leaf3: "bamboo3", leaf2: "leaf2", jade3: "bamboo2", leaf1: "leaf1", pink3: "pink2", pink2: "pink1", blue4: "blue3", blue3: "blue2", gold4: "gold3", orange3: "orange2" };
  // Tops of the plant, so a canopy slumps as a whole: the higher a pixel, the farther it falls.
  let top = y;
  for (let j = 0; j < q.h && top === y; j++) for (let i = 0; i < q.w; i++) if (q.solid(i, j)) { top = j; break; }
  const tall = Math.max(4, y - top);
  for (let j = q.h - 1; j >= 0; j--) for (let i = 0; i < q.w; i++) {
    const c = q.get(i, j);
    if (!c) continue;
    const reach = Math.abs(i - x), height = Math.max(0, y - j);
    const dy = Math.round(Math.min(10, (reach / 4) ** 1.25 + (height / tall) * tall * 0.22));
    const ny = Math.min(y, j + dy);
    const c2 = yellow[c] && hash(i, j, 3) < 0.6 ? yellow[c]! : c;
    if (!out.solid(i, ny)) out.px(i, ny, c2);
  }
  return out;
}

// ── the pot sprite ─────────────────────────────────────────────────────────────

/** Room above a pot's footprint for its tallest state (the climber's canes). */
const POT_RISE = 58;

function potDef(id: PlantId): SpriteDef {
  const { width, height } = GARDEN_FOOTPRINTS.pot;
  const W = px(width), D = px(height), H = D + POT_RISE, G = H - 1;
  const spec = POTS[id];
  const seed = id.length * 101 + id.charCodeAt(0);
  return {
    w: W, h: H, anchor: [Math.round(W / 2), G], frames: GARDEN_FRAMES,
    foot: [-Math.round(W / 2), -D, W, D], shadow: { rx: Math.round(spec.w / 2) + 3, ry: 4, dy: -3 },
    draw: (p, frame) => {
      const { growth, drooping, care } = gardenState(frame);
      const cx = W / 2;
      saucer(p, cx, G - Math.round(D / 2) + 6, spec.w + 6, care);
      const top = G - Math.round(D / 2) + 3 - spec.h;
      const mouth = pot(p, Math.round(cx - spec.w / 2), top, spec.w, spec.h, spec.glaze, { belly: id === "tree" ? 2 : 1 });
      // Damp darkens the pot's lower half when it has been watered; dry terracotta has a white salt line.
      if (care !== "dry") p.over(() => { for (let x = 0; x < W; x++) for (let y = top + Math.round(spec.h * 0.6); y < top + spec.h; y++) { const c = p.get(x, y); if (c && spec.glaze.indexOf(c) > 0) p.px(x, y, spec.glaze[spec.glaze.indexOf(c) - 1]); } });
      else if (id === "flower") p.over(() => p.hline(Math.round(cx - spec.w / 2) + 2, top + Math.round(spec.h * 0.7), spec.w - 4, "cream3"));
      soil(p, mouth, care, seed);
      autoOutline(p, { map: { rose: "rose1", red: "rose1", jade: "jade1", wood: "wood1", gold: "wood1", blue: "blue1" } });
      // The plant on its own canvas, so drooping can bend it and it gets its own outline.
      const q = new Px(W, H);
      PLANTS[id](q, Math.round(mouth.cx), Math.round(mouth.cy), growth, seed);
      const plant = drooping && growth > 0 ? droop(q, Math.round(mouth.cx), Math.round(mouth.cy)) : q;
      autoOutline(plant, { map: { leaf: "leaf1", jade: "jade1", bamboo: "wood1", pink: "plum1", cream: "plum1", blue: "blue1", white: "blue1", orange: "brown1", gold: "wood1", wood: "wood1" } });
      p.blit(plant, 0, 0);
    },
  };
}

// ── the shade ──────────────────────────────────────────────────────────────────

/**
 * The garden's sun shade, made from a roll of reed blind (竹帘) on two bamboo poles at the back, propped
 * at the front on a pair of sticks and tied with string: walk-under, light falling through its slats.
 * The player carries it to whichever pot needs shade. Its two poles are its only solid feet.
 */
function shadeDef(): SpriteDef {
  const { width, height } = GARDEN_FOOTPRINTS.shade;
  const W = px(width), D = px(height), RISE = 62, H = D + RISE, G = H - 1;
  const back = G - D + 1;
  /** The blind's height above the paving: over a grown pot's head, so the pot shows beneath it. */
  const LIFT = 58;
  return {
    w: W, h: H, anchor: [Math.round(W / 2), G],
    draw: (p) => {
      const topBack = back - LIFT, frontY = G - LIFT;
      // Poles at the back corners, sticks at the front.
      for (const x of [1, W - 3]) { p.vline(x, topBack, back - topBack, "bamboo3"); p.vline(x + 1, topBack, back - topBack, "bamboo2"); for (let y = topBack + 8; y < back; y += 14) p.px(x, y, "bamboo5"); }
      for (const x of [4, W - 6]) { p.line(x, frontY, x + (x < W / 2 ? -1 : 1), G - 2, "oak3"); p.line(x + 1, frontY, x + 1 + (x < W / 2 ? -1 : 1), G - 2, "oak2"); }
      // The blind: reed slats running east-west, a sliver of light between every few, the cords that weave
      // them running front to back, the front edge sagging between its sticks.
      for (let y = topBack; y <= frontY; y++) {
        const gap = (y - topBack) % 4 === 3;
        for (let x = 0; x < W; x++) {
          const sag = Math.round(Math.sin((x / W) * Math.PI) * 2);
          if (y > frontY - 2 + sag) continue;
          if (gap) { if (hash(x >> 2, y, 5) < 0.55) continue; p.px(x, y, "bamboo2"); continue; }
          const cord = x % 12 === 5;
          p.px(x, y, cord ? "cream2" : (y - topBack) % 4 === 0 ? "bamboo4" : x < W * 0.3 ? "bamboo4" : "bamboo3");
        }
      }
      p.hline(0, topBack, W, "bamboo5");
      for (let x = 0; x < W; x++) p.px(x, frontY - 1 + Math.round(Math.sin((x / W) * Math.PI) * 2), "bamboo1");
      art(p, W - 5, frontY, ["b.b.", ".b.b", "b..."], { b: "bamboo3" });
      autoOutline(p, { map: { bamboo: "wood1", oak: "wood1", cream: "wood1" } });
      // Its shade on the paving under it, cast a little down and right (translucent, round the sticks).
      p.faded(0.2, () => p.under(() => p.poly([[6, back + 4], [W, back + 4], [W, G - 1], [8, G - 1]], "plum1")));
    },
  };
}

// ── the crates ─────────────────────────────────────────────────────────────────

/**
 * What the roof was cluttered with before the garden was restored: an old fruit crate of cracked pots
 * and a dead geranium, and a wider one of tangled string, a rusted trowel and dry stalks.
 */
function crateDef(which: "crate-a" | "crate-b"): SpriteDef {
  const { width, height } = GARDEN_FOOTPRINTS[which];
  const W = px(width), D = px(height), RISE = 16, H = D + RISE, G = H - 1;
  return {
    w: W, h: H, anchor: [Math.round(W / 2), G], foot: [-Math.round(W / 2), -D, W, D], shadow: { rx: Math.round(W / 2) - 2, ry: 4, dy: -4 },
    draw: (p) => {
      const top = G - 24;
      p.rect(1, top, W - 2, 5, "oak2").hline(1, top, W - 2, "oak3");
      p.rect(3, top + 1, W - 6, 3, "wood1");
      // Contents rising over the back rail.
      if (which === "crate-a") {
        art(p, 5, top - 9, [
          "..rRRr......",
          ".rRrrrr.....",
          ".rr..rr.bbb.",
          ".rRrr.r.b.bb",
          "..rrrr..bbb.",
        ], { r: "rose3", R: "rose4", b: "bamboo2" });
        p.line(18, top - 1, 21, top - 12, "bamboo2").line(21, top - 12, 24, top - 9, "bamboo3");
      } else {
        art(p, 4, top - 7, [
          "c.c..ccc....ss",
          ".ccc.c..c..sss",
          "c..cc..cc.oo..",
          ".cc..ccc..oOo.",
        ], { c: "cream2", s: "steel2", o: "orange1", O: "oak2" });
        for (const x of [20, 24, 27]) p.line(x, top, x + 2, top - 12, "bamboo2");
      }
      // The front: three grey, weathered slats with gaps, a split, nail rust.
      for (let s = 0; s < 3; s++) {
        const y = top + 5 + s * 6;
        p.rect(1, y, W - 2, 5, "stone3").hline(1, y, W - 2, "stone4").hline(1, y + 4, W - 2, "stone2");
        p.px(3, y + 2, "orange1").px(W - 4, y + 2, "orange1");
      }
      p.line(8, top + 12, 16, top + 14, "stone1");
      p.rect(1, top + 5, 2, 18, "stone2").rect(W - 3, top + 5, 2, 18, "stone1");
      autoOutline(p, { map: { oak: "wood1", stone: "stone1", rose: "rose1", bamboo: "wood1", cream: "stone1", steel: "steel1", orange: "brown1" } });
    },
  };
}

const GARDEN: SpriteSet = {
  ...Object.fromEntries(plantIds.map((id) => [`rooftop/garden-${id}`, potDef(id)])),
  "rooftop/garden-shade": shadeDef(),
  "rooftop/garden-crate-a": crateDef("crate-a"),
  "rooftop/garden-crate-b": crateDef("crate-b"),
};

export default defineSprites(GARDEN);
