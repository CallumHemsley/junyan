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
 * His tail, wrapped along the front of the curl with its tip tucked under his chin: lit along its
 * top, three plain rings, nothing busier.
 */
function tail(p: Px) {
  const cells = new Map<string, Color>();
  for (let a = 168; a >= 70; a -= 1.5) {
    const t = (a * Math.PI) / 180, x = 14.5 + Math.cos(t) * 12, y = 11.5 + Math.sin(t) * 7.2;
    const r = a > 95 ? 1.3 : 1.05;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      if (dx * dx + dy * dy > r * r + 0.3) continue;
      const px = Math.round(x + dx - 0.5), py = Math.round(y + dy - 0.5);
      const ring = [150, 128, 106].some((c) => Math.abs(a - c) < 3);
      const tone: Color = ring ? "orange1" : dy < 0 ? "gold4" : dy === 0 ? "orange3" : "orange2";
      cells.set(`${px},${py}`, tone);
    }
  }
  for (const [key] of cells) {
    const [x, y] = key.split(",").map(Number);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!cells.has(`${x + dx},${y + dy}`) && !p.solid(x + dx, y + dy)) p.px(x + dx, y + dy, "brown1");
  }
  for (const [key, c] of cells) { const [x, y] = key.split(",").map(Number); p.px(x, y, c); }
  // Where the tail lies over his belly, a dark fur crease above it keeps it a tail.
  for (const [key] of cells) {
    const [x, y] = key.split(",").map(Number);
    if (!cells.has(`${x},${y - 1}`) && p.solid(x, y - 1)) p.px(x, y - 1, "brown2");
  }
}

/**
 * The curl: one round arc of back lit by the sun from the upper left, stripes running off the
 * spine like hoops, the haunch rounding into the front. `lift` raises the crown of the back.
 */
function curledBody(p: Px, lift: number) {
  const cx = 14, cy = 10.5, rx = 13, ry = 8.5;
  for (let y = 0; y < 21; y++) for (let x = 0; x < 29; x++) {
    const yy = y < cy ? y + lift * Math.max(0, 1 - Math.abs(x + 0.5 - cx + 3) / rx) : y;
    const u = (x + 0.5 - cx) / rx, v = (yy + 0.5 - cy) / ry, d = u * u + v * v;
    if (d > 1) continue;
    const z = Math.sqrt(1 - d), light = -0.45 * u - 0.65 * v + 0.5 * z;
    p.px(x, y, light > 0.9 ? "gold4" : light > 0.52 ? "orange3" : light > 0.1 ? "orange2" : "orange1");
  }
  // Stripes: hoops off the spine, every so often, fading where the sun lands.
  const stripe: Partial<Record<Color, Color>> = { gold4: "orange3", orange3: "orange1", orange2: "orange1", orange1: "brown2" };
  for (let a = 168; a <= 300; a += 17) {
    const t = (a * Math.PI) / 180;
    for (let k = 0; k < 3; k++) {
      const r = 0.93 - k * 0.12;
      const x = Math.round(cx + Math.cos(t) * rx * r - 0.5), y = Math.round(cy + Math.sin(t) * ry * r - 0.5 - (k === 0 ? Math.round(lift) : 0));
      const here = p.get(x, y);
      if (here && stripe[here]) p.px(x, y, stripe[here]!);
    }
  }
  // The rounded haunch at the back-left, a soft fold line.
  for (let a = 200; a <= 280; a += 7) {
    const t = (a * Math.PI) / 180, x = Math.round(8 + Math.cos(t) * 5), y = Math.round(13 + Math.sin(t) * 4);
    const here = p.get(x, y);
    if (here === "orange3" || here === "orange2") p.px(x, y, here === "orange3" ? "orange2" : "orange1");
  }
}

export default defineSprites({
  /**
   * Asleep in the sun patch, curled nose to tail. Eight frames at 2 fps: a slow breath in and out
   * (the crown of his back rises a pixel), a pause, and on the last frame his right ear flicks.
   */
  "decor/cat-sleep": {
    w: 30, h: 21, anchor: [14, 19], foot: [-13, -8, 26, 8], shadow: { rx: 14, ry: 3, dy: -1 },
    frames: 8, fps: 2,
    draw: (p, frame) => {
      curledBody(p, [0, 0.5, 1, 1, 0.5, 0, 0, 0][frame]);
      autoOutline(p, { map: CAT_OUTLINE });
      tail(p);
      art(p, 16, 4, SLEEP_HEAD, FUR);
      if (frame === 7) {
        // The right ear flicks flat: repaint the ear as back fur, then draw it folded.
        art(p, 24, 4, ["AAaaA", "aaaaa", "....."], FUR);
        art(p, 24, 4, ["..ooo", ".oaao", "oaaao"], FUR);
      }
      // Whiskers, pale against the fur.
      art(p, 14, 12, ["hh"], FUR);
    },
  },

  /**
   * Awake and loafed on the floor, paws tucked under, watching you. Three frames at 1 fps: eyes
   * open, half closed, closed: a slow cat blink, which is how cats say they like you.
   */
  "decor/cat-loaf": {
    w: 24, h: 21, anchor: [12, 19], foot: [-10, -6, 20, 6], shadow: { rx: 11, ry: 3, dy: -1 },
    frames: 3, fps: 1,
    draw: (p, frame) => {
      // The loaf: a low dome of back behind the head.
      const cx = 12, cy = 12.5, rx = 11, ry = 7;
      for (let y = 2; y < 21; y++) for (let x = 0; x < 24; x++) {
        const u = (x + 0.5 - cx) / rx, v = (y + 0.5 - cy) / ry, d = u * u + v * v;
        if (d > 1) continue;
        const z = Math.sqrt(1 - d), light = -0.45 * u - 0.65 * v + 0.5 * z;
        p.px(x, y, light > 0.9 ? "gold4" : light > 0.5 ? "orange3" : light > 0.08 ? "orange2" : "orange1");
      }
      for (const [x, y] of [[3, 9], [4, 8], [19, 8], [20, 9], [2, 12], [21, 12], [2, 15], [21, 15]] as const) p.px(x, y, "orange1");
      autoOutline(p, { map: CAT_OUTLINE });
      // Tail tucked round his right side to the front.
      art(p, 15, 15, ["......o", ".....oA", "....oAa", "oooobao", "AAAaao.", "oooooo."], FUR);
      // Head, the same face as when he sits; the eyes change.
      const eyes = [
        ["bAAAAAAAAAaaab", "bAskAAAAAskaab", "bAkkAwwwwkkaab"],
        ["bAAAAAAAAAaaab", "bAddAAAAAddaab", "bAkkAwwwwkkaab"],
        ["bAAAAAAAAAaaab", "bAAAAAAAAAaaab", "bAeeAwwwweeaab"],
      ][frame];
      art(p, 5, 0, [
        "..o.o......oo.",
        ".oAoAo....oaao",
        ".oApAAooooapao",
        "oAAAbAbAbAaaao",
        "bAAAAbAAbAaaab",
        ...eyes,
        "bwwwwwnnwwwwab",
        "bwwwwwwwwwwwab",
        ".owwwwwwwwwwo.",
        "..orRRRRYrrro.",
        "..owwwwyYwwwo.",
        "..owwoowwoowo.",
        "...oo..oo..o..",
      ], FUR);
      art(p, 3, 9, ["h.", ".h"], FUR);
      art(p, 19, 9, [".h", "h."], FUR);
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
