/**
 * 老板 the cook, fifties, stout and jolly. Seen behind the counter, facing the room. A puffed
 * white cap, a bristly moustache, eyes creased from smiling, sleeves shoved up thick forearms, a
 * blue-check towel over his left shoulder, a white apron with a soy-sauce splash, a steel ladle.
 * `idle-down` breathes and blinks; `work-down` stirs the pot in front of him (the pot is the
 * kitchen's sprite; the ladle's bowl dips at about row 46).
 */
import { defineSprites, type SpriteDef } from "../../kit/index.ts";
import { PERSON, RIG, darken, mirror, part, render, sym, Z, type Part, type Pose } from "./_rig.ts";

const SLOTS = {
  S: "tan4", s: "tan3", k: "tan2", b: "blush", m: "tan1", r: "hair1",
  T: "cream4", t: "cream3", u: "cream2", C: "cream5", c: "cream3",
  V: "cream4", v: "cream3", X: "cream3", x: "cream2", F: "tan4", f: "tan3",
  P: "stone2", p: "stone1", N: "wood2", n: "wood1", Y: "ink2", y: "ink2",
  H: "hair2", h: "hair1", d: "hair1",
  A: "white", a: "cream5", Q: "cream3",
} as const;

const head = part(12, Z.head, RIG.head({ dir: "down" } as Pose)[0].rows, { group: "head" });

const CAP = part(4, Z.hat, [
  "...........CCCCCCCCC............",
  ".........CCCCCCCCCCCCC..........",
  "........CCCCcCCCCCcCCCC.........",
  ".......CCCCcCCCCCCCcCCCCc.......",
  ".......CCCCcCCCCCCCcCCCCc.......",
  "......CCCCCcCCCCCCCcCCCCcc......",
  "......CCCCcCCCCCCCCCcCCCcc......",
  "......CCCCcCCCCCCCCCcCCccc......",
  ".....cccccccccccccccccccccc.....",
  ".....CCCCCCCCCCCCCCCCCCCccc.....",
  ".....CCCCCCCCCCCCCCCCCCccccc....",
  ".....ccccccccccccccccccccccc....",
  ".....hh....................hh...",
  ".....h......................h...",
], { group: "head" });

/** Jolly: creased smiling eyes, bushy brows, a moustache, round cheeks. Blinks on the breath. */
const face = (pose: Pose): Part[] => {
  const blink = pose.beat === "breath";
  const looking = pose.action === "work";
  return [part(20, Z.face, [
    "........rrrrr......rrrrr........",
    "................................",
    "................................",
    ...(blink || looking
      ? ["................................", ".........e...e......e...e.......", "..........eee........eee........"]
      : ["................................", "..........we........we..........", "..........ee........ee.........."]),
    ".......bbb............bbb.......",
    ".......bbbb..rrrrrr..bbbb.......",
    "............rrrrrrrr............",
    "...............mm...............",
  ], { group: "head" })];
};

const TORSO = part(33, Z.torso, sym([
  "........cCCCkkss",
  ".....TTTTTTCCkks",
  "....TTTTTTTTTCCk",
  "....TTTTTTTTTTTT",
  "....TTTTTTTTTTTT",
  "......TTTTTTTTTT",
  ".....TTTTTTTTTTT",
  ".....TTTTTTTTTTT",
  ".....tTTTTTTTTTT",
  ".....tTTTTTTTTTT",
  ".....tTTTTTTTTTT",
  ".....ttTTTTTTTTT",
  "......tttttttttt",
  ".......ttttttttt",
], 21));

/** The apron, with a soy-sauce splash and a towel over the shoulder. */
const APRON = [
  part(34, Z.clothes, [
    "..........a..........a..........",
    "..........a..........a..........",
    "..........aa........aa..........",
    "........QAAAAAAAAAAAAAAa........",
    "........QAAAAAAAAAAAAAaa........",
    ".......QAAAAAAAAAAAAAAaaa.......",
    ".......QAAAAAAAAAAAAAAaaa.......",
    ".......QAAAAAAAAAAAAAAaaa.......",
    ".......QAAAAAAAAAAAAAaaaa.......",
    "......QQQQQQQQQQQQQQQQQQQQ......",
    ".......QAAAAaAAAAAAAAaaaa.......",
    ".......QAAAAaAAAAAAAaAaaa.......",
    ".......QAAAAAAAAAAAAaAaaa.......",
    ".......QAAAAAAAAAAAAAAaaa.......",
    ".......QAaAAAAAAAAAAAAaaa.......",
    ".......QQQQQQQQQQQQQQQQQQ.......",
  ]),
  part(39, Z.clothes + 1, ["................oO..", "...............oOOo.", "................oOo.", ".................o..", "...................."], { legend: { o: "wood3", O: "wood4" } }),
  part(32, Z.sleeves, [
    "....bBbB....",
    "...bBwBwb...",
    "...BbBbBb...",
    "...bBwBwb...",
    "...BbBbB....",
    "...bBwB.....",
    "...BbB......",
    "...bB.......",
  ], { legend: { b: "blue4", B: "blue5", w: "white" } }),
];

/** Thick forearms, sleeves shoved past the elbow. */
const ARM_L = [
  "......VVVV......",
  "....VVVVVVv.....",
  "...VVVVVVvv.....",
  "...VVVVVvvo.....",
  "...VVVVvvvo.....",
  "...XXXXxxxo.....",
  "...FFFFFffo.....",
  "...FFFFFffo.....",
  "...FFFFFffo.....",
  "...SSSSSkko.....",
  "...SSSSSkk......",
  "...sSSSskk......",
  "....ssskk.......",
];
const armLeft = part(34, Z.arms, ARM_L);
const armRight = (() => { const m = mirror(part(34, Z.arms, ARM_L)); return { ...m, rows: darken(m.rows, 0) }; })();

const LADLE = { s: "steel4", S: "steel5", d: "steel2", D: "steel3", w: "steel6", h: "wood3", H: "wood4" } as const;
/** Stirring: the right hand circles over the pot, the ladle dipping in and out. Frame 0–3. */
const STIR: readonly [dx: number, dy: number][] = [[0, 0], [-2, 1], [-4, 0], [-2, -1]];
const workArm = (frame: number): Part[] => {
  const [dx, dy] = STIR[frame];
  const upper = part(34, Z.arms, darken([
    "......................VVVV......",
    ".....................vVVVVVV....",
    ".....................vvVVVVVV...",
    ".....................oVVVVVVV...",
    ".....................oVVVVVVV...",
    ".....................oxxxXXXX...",
  ], 0));
  const fore = part(40 + dy, Z.hands, darken([
    "......................ffFFFF....",
    ".....................ffFFFF.....",
    "....................kkSSSS......",
    "...................kkSSSSs......",
    "....................kSSs........",
  ], 0).map((r) => shiftRow(r, dx)));
  const ladle = part(36 + dy, Z.hands - 1, [
    "......................hH........",
    ".....................hH.........",
    "....................hH..........",
    "...................hH...........",
    "..................sS............",
    ".................sS.............",
    ".................s..............",
    "................dsSs............",
    "...............dDsSSs...........",
    "...............dDDsss...........",
    "................dddd............",
  ].map((r) => shiftRow(r, dx)), { legend: LADLE });
  return [upper, fore, ladle];
};
const shiftRow = (r: string, dx: number) => (dx >= 0 ? ".".repeat(dx) + r.slice(0, r.length - dx) : r.slice(-dx) + ".".repeat(-dx));

const HAIR = part(16, Z.hair, [
  ".....hh....................hh...",
  ".....hh....................hh...",
  ".....h......................h...",
], { group: "head" });

function frame(pose: Pose): Part[] {
  const legs = RIG.legs(pose);
  const arms = pose.action === "work" ? [armLeft, ...workArm(pose.frame)] : [armLeft, armRight];
  return [...legs, TORSO, ...arms, ...APRON, head, ...face(pose), HAIR, CAP];
}

const sprite = (action: "idle" | "work", frames: number, fps: number): SpriteDef => ({
  ...PERSON,
  frames,
  fps,
  draw: (p, f) => {
    const pose: Pose = {
      dir: "down", action, frame: f, legs: "stand", arms: "rest",
      body: action === "idle" && f === 1 ? 1 : action === "work" && f % 2 === 1 ? 1 : 0,
      head: action === "work" ? 1 : 0,
      beat: action === "idle" && f === 3 ? "breath" : "rest",
    };
    render(p, frame(pose), SLOTS, pose);
  },
});

export default defineSprites({
  "char/cook/idle-down": sprite("idle", 4, 2),
  "char/cook/work-down": sprite("work", 4, 5),
});
