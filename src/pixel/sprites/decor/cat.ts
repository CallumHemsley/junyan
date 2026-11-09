/**
 * Mantou (馒头), the shop cat: a ginger tabby tom with a white bib and socks, a nick out of his
 * left ear from his street days, and a red collar with a brass bell the owner's daughter chose.
 * He sleeps in the morning sun patch by the door and supervises from the counter end.
 * Object layer, anchored at the middle of where he touches the floor.
 */
import { defineSprites, type Color, type Px } from "../../kit/index.ts";
import { art, autoOutline } from "./_helpers.ts";

const FUR = {
  o: "brown1", G: "gold4", A: "orange3", a: "orange2", b: "orange1", d: "brown2",
  w: "cream5", W: "cream3", h: "cream4", n: "pink2", p: "pink3", e: "brown2",
  r: "red3", R: "red4", y: "gold4", Y: "gold2", k: "ink", g: "jade4", s: "white",
} as const;
const CAT_OUTLINE = { cream: "brown1", white: "brown1", orange: "brown1", gold: "brown1" } as const;

/** His head asleep: nicked left ear, closed eyes, chin down on his paws, collar and bell. */
const SLEEP_HEAD = [
  ".o.o.....oo..",
  "oAoAo...oaao.",
  "oApAAoooapaao",
  "bAAbAbAbaabao",
  "bAAAbAAAbaaao",
  "bAAAAAAAAaaao",
  "bAeAeAAAeaeao",
  "bAAeAwwwAeaao",
  "bwwwwwnwwwwwo",
  "owwwwdwdwwwwo",
  ".owwwwwwwwwo.",
  ".orRRRRYrrro.",
  "owwWwoyowWwwo",
  "owwwWoYowwWwo",
  ".oooo...oooo.",
];
/**
 * His tail, wrapped round the front of his body and tucked toward his nose: a curve that thins
 * to the tip, lit along its top, ringed every few pixels.
 */
function tail(p: Px) {
  const cells = new Map<string, Color>();
  for (let a = 168; a >= 58; a -= 1.5) {
    const t = (a * Math.PI) / 180, x = 12.5 + Math.cos(t) * 11.2, y = 11.2 + Math.sin(t) * 5.8;
    const r = a > 90 ? 1.3 : 1.3 - (90 - a) / 70;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (dx * dx + dy * dy > r * r + 0.3) continue;
      const px = Math.round(x + dx - 0.5), py = Math.round(y + dy - 0.5);
      const ring = Math.floor(a / 14) % 2 === 0 && a < 160;
      const tone: Color = ring ? (dy < 0 ? "orange2" : "orange1") : dy < 0 ? "orange3" : dy === 0 ? "orange2" : "orange1";
      cells.set(`${px},${py}`, tone);
    }
  }
  for (const [key] of cells) {
    const [x, y] = key.split(",").map(Number);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!cells.has(`${x + dx},${y + dy}`)) p.px(x + dx, y + dy, "brown1");
  }
  for (const [key, c] of cells) { const [x, y] = key.split(",").map(Number); p.px(x, y, c); }
}

/** The curled body, lit by the sun from the upper left, with tabby stripes running off the spine. */
function curledBody(p: Px, lift: number) {
  const cx = 12, cy = 10, rx = 10.5, ry = 7;
  for (let y = 0; y < 18; y++) for (let x = 0; x < 24; x++) {
    // Breathing in lifts the top of his back without moving his belly.
    const yy = y < cy ? y + lift * (1 - Math.abs(x - cx) / rx) : y;
    const u = (x + 0.5 - cx) / rx, v = (yy + 0.5 - cy) / ry, d = u * u + v * v;
    if (d > 1) continue;
    const z = Math.sqrt(1 - d), light = -0.45 * u - 0.65 * v + 0.5 * z;
    p.px(x, y, light > 0.86 ? "gold4" : light > 0.5 ? "orange3" : light > 0.08 ? "orange2" : "orange1");
  }
  // Stripes: short dashes running down from the spine, softened where the sun lands.
  for (let a = 200; a <= 335; a += 13) {
    const t = (a * Math.PI) / 180;
    for (let k = 0; k < 4; k++) {
      const r = 0.92 - k * 0.11, x = Math.round(cx + Math.cos(t) * rx * r - 0.5 + k * 0.4), y = Math.round(cy + Math.sin(t) * ry * r - 0.5 - (k === 0 ? lift : 0));
      const here = p.get(x, y);
      const stripe: Partial<Record<Color, Color>> = { gold4: "orange3", orange3: "orange1", orange2: "orange1", orange1: "brown2" };
      if (here && stripe[here] && !(k === 3 && a % 2)) p.px(x, y, stripe[here]!);
    }
  }
  // The line of his thigh, curled under.
  for (let a = 150; a <= 260; a += 6) {
    const t = (a * Math.PI) / 180, x = Math.round(7 + Math.cos(t) * 5.5), y = Math.round(12 + Math.sin(t) * 4);
    const here = p.get(x, y);
    if (here === "orange3" || here === "orange2") p.px(x, y, here === "orange3" ? "orange2" : "orange1");
  }
}

export default defineSprites({
  /** Asleep in the sun patch. Two frames at 1 fps: his back rises and falls a pixel. */
  "decor/cat-sleep": {
    w: 31, h: 19, anchor: [15, 17], foot: [-13, -8, 26, 8], shadow: { rx: 14, ry: 3, dy: -1 },
    frames: 2, fps: 1,
    draw: (p, frame) => {
      curledBody(p, frame === 1 ? 1 : 0);
      autoOutline(p, { map: CAT_OUTLINE });
      tail(p);
      art(p, 17, 1, SLEEP_HEAD, FUR);
      // Whiskers, pale against the fur and the floor.
      art(p, 15, 9, ["hh"], FUR);
      art(p, 30, 9, ["h"], FUR);
    },
  },

  /**
   * Sitting up, watching the door. Four frames at 4 fps: his tail tip flicks across and back,
   * and the nicked ear twitches on the third frame.
   */
  "decor/cat-sit": {
    w: 20, h: 26, anchor: [8, 25], foot: [-7, -5, 14, 5], shadow: { rx: 8, ry: 3, dy: -1 },
    frames: 4, fps: 4,
    draw: (p, frame) => {
      // Tail first, curling up his right side from behind the haunch.
      art(p, 12, 13, [
        "...ob.",
        "...oab",
        "...oab",
        "...oab",
        "...oab",
        "..obao",
        "..oabo",
        ".obao.",
        "obao..",
        "oaoo..",
      ], FUR);
      const tips = [
        ["..oo", ".oAo", "oAao", "oabo"],
        ["...o", "..oA", ".oAo", "oabo"],
        ["oo..", "oAo.", "oaAo", "oabo"],
        [".oo.", "oAAo", "oaao", "oabo"],
      ];
      art(p, 14, 10, tips[frame], FUR);
      art(p, 1, 0, [
        "..o.o......oo.",
        ".oAoAo....oaao",
        ".oApAAooooapao",
        "oAAAbAbAbAaaao",
        "oAAAAbAAbAaaao",
        "oAAAAAAAAAaaao",
        "oAAAAAAAAAaaao",
        "oAskAAAAAskaao",
        "oAkkAwwwwkkaao",
        "owwwwwnnwwwwao",
        "owwwwwwwwwwwao",
        ".owwwwwwwwwwo.",
        "..orRRRRYrrro.",
        "..oawwwyYwwao.",
        "..oAawwwwwaao.",
        ".oAAAwwwwwwaao",
        ".oAbAwwwwwwabo",
        "oAAAbAwwwwaabo",
        "oAbAAAwwwwabbo",
        "oAAbAAwwwwaabo",
        "oAAAbAwowwabbo",
        "oGAAAowwowwabo",
        "oAAAowWwowWwao",
        ".ooooooooooooo",
      ], FUR);
      // Whiskers.
      art(p, 0, 9, ["h.", ".h"], FUR);
      art(p, 15, 9, [".h", "h."], FUR);
      // The nicked ear flicks back on the third frame.
      if (frame === 2) {
        p.rect(2, 0, 5, 2, null);
        art(p, 2, 0, ["....", "o.o.", "oAoo"], FUR);
      }
    },
  },
});
