/**
 * Seats. Every seat's doc comment says where a seated person goes:
 * - "sitter anchor" is where the character's own anchor (their foot pixel, `[8, 31]` on a 16×32
 *   frame) lands relative to the seat's anchor. It is chosen so the depth sort puts the sitter in
 *   front of the seat (backless seats, chairs facing down or sideways) or behind the chair back
 *   (`chair-up`).
 * - "hips" is the centre of the seat surface relative to the seat's anchor: the sit frame's
 *   bottom should rest there.
 */
import { defineSprites, Px, type Color, type Legend } from "../../kit/index.ts";
import { grid } from "./_helpers.ts";

const W: Legend = { "1": "wood1", "2": "wood2", "3": "wood3", "4": "wood4", "5": "wood5", "6": "wood6",};
const B: Legend = { "1": "blue1", "2": "blue2", "3": "blue3", "4": "blue4", "5": "blue5", "6": "blue6" };
const J: Legend = { a: "jade1", b: "jade2", c: "jade3", d: "jade4", e: "jade5", f: "jade6" };
const TO_JADE: Partial<Record<Color, Color>> = { blue1: "jade1", blue2: "jade2", blue3: "jade3", blue4: "jade4", blue5: "jade5", blue6: "jade6" };
const STEEL: Legend = { "5": "steel5", "4": "steel4", "3": "steel3", "2": "steel2" };

/** The plastic stool's top: sun-faded lid with the hand-hold slot. Rows 1–5. */
const PLASTIC_TOP = [
  "..5555544444..",
  ".555444444443.",
  ".544421124443.",
  ".544422224433.",
  ".444444444333.",
];
/** Its rolled lip, skirt, arch and splayed legs. Rows 6–13. */
const PLASTIC_BODY = [
  ".333333333332.",
  ".322222222222.",
  ".433333333332.",
  ".433211112332.",
  ".432......232.",
  ".432......232.",
  "4432......2322",
  "433........322",
];

/** Shared seat and legs for the four chair facings: rows 16–22. */
const CHAIR_BASE = [
  ".333333322222.",
  ".222222222222.",
  "..43......32..",
  "..43......32..",
  "..4333333332..",
  "..43......32..",
  "..32......22..",
];

export default defineSprites({
  /**
   * Round wooden stool, four splayed legs and a rung. Story: a chip knocked out of the front of
   * the seat. Sitter anchor (0, +1); hips (0, -10).
   */
  "furn/stool-a": {
    w: 14, h: 15, anchor: [7, 14], foot: [-5, -6, 10, 6], shadow: { rx: 7, ry: 3 },
    draw: (p) => {
      grid(p, 0, 1, 14, [
        "...55564444...",
        "..5665444444..",
        ".544455444443.",
        ".544444433443.",
        "..4444444443..",
        "...44444333...",
        "..3363332222..",
        "...22222222...",
        "..43..22..32..",
        "..43..22..32..",
        "..4333223332..",
        ".43........32.",
        ".33........22.",
      ], W);
      p.outline("wood1");
    },
  },

  /**
   * Older three-legged stool with a thick seat: one leg at the front, two splayed at the back.
   * Story: a split across the seat held by two iron staples. Sitter anchor (0, +1);
   * hips (0, -10).
   */
  "furn/stool-b": {
    w: 14, h: 15, anchor: [7, 14], foot: [-5, -6, 10, 6], shadow: { rx: 7, ry: 3 },
    draw: (p) => {
      grid(p, 0, 1, 14, [
        "...55544444...",
        "..5654444422..",
        ".544444222433.",
        ".542222444433.",
        "..4444444443..",
        "...44444333...",
        "..3333332222..",
        "..3333322222..",
        "...22222222...",
        ".43...43...32.",
        "43....43....32",
        "33....43....22",
        "......43......",
      ], W);
      // Two iron staples bridging the split.
      p.rows(5, 3, ["5", "4", "3"], STEEL).rows(9, 2, ["5", "4", "3"], STEEL);
      p.outline("wood1");
    },
  },

  /**
   * Stackable plastic stool, faded blue. Story: a sun-faded lid and stress-whitening where the
   * left leg has been bent once too often. Sitter anchor (0, +1); hips (0, -10).
   */
  "furn/stool-plastic": {
    w: 14, h: 15, anchor: [7, 14], foot: [-5, -6, 10, 6], shadow: { rx: 7, ry: 3 },
    draw: (p) => {
      grid(p, 0, 1, 14, [...PLASTIC_TOP, ...PLASTIC_BODY], B);
      p.px(1, 11, "blue6").px(2, 12, "blue5");
      p.outline("blue1");
    },
  },

  /** The same stool in jade, so a row of them is not uniform. Sitter anchor (0, +1); hips (0, -10). */
  "furn/stool-plastic-jade": {
    w: 14, h: 15, anchor: [7, 14], foot: [-5, -6, 10, 6], shadow: { rx: 7, ry: 3 },
    draw: (p) => {
      grid(p, 0, 1, 14, [...PLASTIC_TOP, ...PLASTIC_BODY], B);
      p.px(11, 12, "blue5");
      p.outline("blue1");
      p.swap(TO_JADE);
    },
  },

  /** Four plastic stools nested, jade on blue on jade on blue: the lips stack up under the lid. Not a seat. */
  "furn/stool-stack": {
    w: 14, h: 22, anchor: [7, 21], foot: [-5, -6, 10, 6], shadow: { rx: 7, ry: 3 },
    draw: (p) => {
      const top = new Px(14, 7);
      grid(top, 0, 1, 14, PLASTIC_TOP, B);
      top.swap(TO_JADE);
      p.blit(top, 0, 0);
      grid(p, 0, 6, 14, [
        ".cccccccccccb.",
        ".bbbbbbbbbbbb.",
        ".444444444433.",
        ".333333333322.",
        ".ddddddddddcc.",
        ".ccccccccccbb.",
        ".444444444433.",
        ".333333333322.",
        ".322222222222.",
      ], { ...B, ...J });
      grid(p, 0, 15, 14, PLASTIC_BODY.slice(3), B);
      p.outline("blue1");
    },
  },

  /**
   * Wooden chair, the sitter facing the camera: seat in front, back behind. Story: the top rail
   * worn pale in the middle where hands pull the chair out. Sitter anchor (0, +1); hips (0, -10).
   */
  "furn/chair-down": {
    w: 14, h: 24, anchor: [7, 23], foot: [-6, -6, 12, 6], shadow: { rx: 7, ry: 3 },
    draw: (p) => {
      grid(p, 0, 1, 14, [
        ".556446644443.",
        ".433333333322.",
        "..3222222222..",
        "..43..43..32..",
        "..43..43..32..",
        "..43.4332.32..",
        "..43.4332.32..",
        "..43.4332.32..",
        "..43.4332.32..",
        "..43.4322.32..",
        "..43.3222.32..",
        ".556655444443.",
        ".564444444443.",
        ".544444444433.",
        ".444444443333.",
        ...CHAIR_BASE,
      ], W);
      p.outline("wood1");
    },
  },

  /**
   * Wooden chair, the sitter facing away: we see the back of the chair, the seat glimpsed through
   * the gaps beside the splat. Sitter anchor (0, -2), so the chair back is drawn over the sitter;
   * hips (0, -10).
   */
  "furn/chair-up": {
    w: 14, h: 24, anchor: [7, 23], foot: [-6, -6, 12, 6], shadow: { rx: 7, ry: 3 },
    draw: (p) => {
      grid(p, 0, 4, 14, [
        ".556446644443.",
        ".433333333322.",
        "..3222222222..",
        "..43..33..32..",
        "..43..33..32..",
        "..43.3332.32..",
        "..43.3332.32..",
        "..43.3332.32..",
        "..4353332432..",
        "..4343332432..",
        "..4343322432..",
        "..4343222332..",
        ...CHAIR_BASE,
      ], W);
      p.outline("wood1");
    },
  },

  /**
   * Wooden chair, the sitter facing right; the back stands along the left edge, its inner face in
   * shade. Sitter anchor (+1, +1); hips (+1, -10).
   */
  "furn/chair-right": {
    w: 14, h: 24, anchor: [7, 23], foot: [-6, -6, 12, 6], shadow: { rx: 7, ry: 3 },
    draw: (p) => {
      grid(p, 0, 1, 14, [
        ".565..........",
        ".556..........",
        ".455..........",
        ".442..........",
        ...Array<string>(7).fill(".432.........."),
        ".432555444443.",
        ".432544444443.",
        ".432444444433.",
        ".432444443333.",
        ".333333322222.",
        ".222222222222.",
        ".43.......32..",
        ".43.......32..",
        ".43333333332..",
        ".43.......32..",
        ".32.......22..",
      ], W);
      p.outline("wood1");
    },
  },

  /**
   * Wooden chair, the sitter facing left; the back stands along the right edge, its inner face
   * catching the morning light. Sitter anchor (-1, +1); hips (-1, -10).
   */
  "furn/chair-left": {
    w: 14, h: 24, anchor: [7, 23], foot: [-6, -6, 12, 6], shadow: { rx: 7, ry: 3 },
    draw: (p) => {
      grid(p, 0, 1, 14, [
        "..........565.",
        "..........553.",
        "..........553.",
        "..........442.",
        ...Array<string>(7).fill("..........442."),
        ".556654444442.",
        ".564444444442.",
        ".544444444442.",
        ".444444433442.",
        ".333333322222.",
        ".222222222222.",
        "..43.......32.",
        "..43.......32.",
        "..43333333332.",
        "..43.......32.",
        "..32.......22.",
      ], W);
      p.outline("wood1");
    },
  },

  /**
   * Long backless bench, two planks on splayed trestle ends. Story: a knot near the right end, and a pale patch worn where the regulars always sit. Two sitters: anchors
   * (-8, +1) and (+8, +1); hips (±8, -9).
   */
  "furn/bench": {
    w: 32, h: 12, anchor: [16, 11], foot: [-15, -4, 30, 4], shadow: { rx: 16, ry: 3, dy: -1 },
    draw: (p) => {
      p.rect(2, 1, 28, 1, "wood5").rect(1, 2, 30, 2, "wood4");
      p.over(() => {
        p.vline(1, 2, 2, "wood5").vline(30, 2, 2, "wood3").hline(3, 1, 5, "wood6");
        p.hline(18, 2, 4, "wood3").hline(13, 3, 3, "wood5").hline(24, 3, 2, "wood3");
        // Worn seat patch.
        p.hline(7, 2, 6, "wood5").hline(6, 3, 6, "wood5").hline(8, 2, 3, "wood6");
      });
      // A dark knot near the right end.
      p.rows(23, 2, ["323", ".3."], { "3": "wood3", "2": "wood2" });
      // Front face of the seat plank, worn pale along the edge.
      p.hline(1, 4, 30, "wood3").hline(1, 5, 30, "wood2").hline(7, 4, 5, "wood4");
      // Splayed trestle ends.
      grid(p, 1, 6, 6, [".4332.", ".4332.", ".4332.", "4332..", "3322.."], W);
      grid(p, 25, 6, 6, [".2332.", ".2332.", ".2332.", "..2332", "..2322"], W);
      p.outline("wood1");
    },
  },
});
