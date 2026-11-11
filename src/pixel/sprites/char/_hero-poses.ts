/**
 * The player's poses (ticket 0193 pass three, landed in 0194). Pure data and small pure helpers:
 * nothing here draws, so the timing is testable on its own.
 *
 * The player is not built on the rig's shared leg and arm shapes. He is a joint puppet: every frame
 * is a hand-placed set of joints (hip, knee, ankle, heel, toe, shoulder, elbow, hand) per facing,
 * drawn by `_hero-body.ts` with the head from `_hero-head.ts`.
 *
 * Walk, 8 frames at 10 fps per facing. Each leg runs through eight hand-placed phases (contact with
 * the heel striking and toe up, down with the knee taking the weight, passing, up with the heel
 * peeling off, then toe-off behind, lift, swing and reach); the other leg is four phases apart. The
 * arms swing against the legs with the elbows bent; the body dips on the down beat and rises on the
 * up; the head lands a frame late, the hair tips two frames late, and the apron hem trails.
 *
 * The poses were keyed for a longer-legged figure (hip at row 44) and are mapped onto the cast's
 * proportions (hip at row 46): soles stay put, legs shorten toward the sole, arms move to the wider
 * shoulders and shorten a little.
 */

export type V = readonly [number, number];
export type Leg = { knee: V; ankle: V; heel: V; toe: V };
export type Arm = { elbow: V; hand: V };
export type HeroDir = "down" | "up" | "right" | "left";
export type Expr = "neutral" | "happy" | "surprised" | "puzzled" | "embarrassed" | "laugh";
export type Eyes = "open" | "blink" | "glance" | "shut";

/** One drawn frame. Joint positions are absolute frame pixels before `bob`. */
export type HeroFrame = {
  /** Near leg / arm: screen-left in front and back views, the camera side in profile. */
  legN: Leg; legF: Leg; armN: Arm; armF: Arm;
  /** Whole upper body (torso, arms, head) down by this many pixels: the walk's weight. */
  bob: number;
  /** Extra on the head, a beat behind the body (the nod). */
  nod: number;
  /** Hair tips, a further beat behind (follow-through). */
  tip: number;
  /** Apron hem swing, pixels sideways (forward in profile). */
  hem: number;
  /** Shoulders forward (profile) or sideways (front/back): the torso twist. */
  twist: number;
  /** Head and chest forward in profile: the lean. */
  lean: number;
  expr: Expr;
  eyes: Eyes;
  /** Both hands on the tray: the arms are fixed to it and the board rides the bob. */
  carry?: boolean;
};

/** The skeleton's fixed joints. Soles sit on row 61. */
export const SHOULDER_Y = 34, WAIST_Y = 43, HIP_Y = 46;
export const SHOULDER_SIDE: V = [15, SHOULDER_Y + 1];
export const SHOULDER_L: V = [7, SHOULDER_Y + 1], SHOULDER_R: V = [25, SHOULDER_Y + 1];
export const HIP_L = 12, HIP_R = 20, HIP_SIDE = 15;

/** The value `k` frames earlier in a looping series: hair and hems follow the body a beat late. */
export function lag(series: readonly number[], i: number, k: number): number {
  const n = series.length;
  return series[(((i - k) % n) + n) % n];
}

// ── key poses, as keyed (hip at row 44, shoulders at 10/22 or 15) ──────────

const legAt = (hx: number, k: readonly number[]): Leg => ({ knee: [hx + k[0], k[1]], ankle: [hx + k[2], k[3]], heel: [hx + k[4], k[5]], toe: [hx + k[6], k[7]] });
const armAt = (s: V, k: readonly number[]): Arm => ({ elbow: [s[0] + k[0], s[1] + k[1]], hand: [s[0] + k[2], s[1] + k[3]] });

// Profile (facing right): [knee x, y, ankle x, y, heel x, y, toe x, y], x relative to the hip.
const SIDE_LEG = [
  [3, 52, 5, 58, 4.5, 59.6, 8.5, 57.8], // contact: heel strikes, toe up
  [3.5, 51.6, 3, 58, 2, 60, 6.5, 60], // down: foot flat, knee takes the weight
  [1.5, 52, 0.5, 58, -0.5, 60, 4, 60], // passing: straight under the hip
  [-0.5, 52, -2.5, 57.6, -3.5, 58.2, 0.5, 60], // up: heel peels off
  [-2, 52, -5, 57, -6.5, 56.8, -3, 60], // toe-off behind
  [-1, 51, -5, 55, -6.5, 54.2, -3.5, 56.6], // lift: foot trails up
  [2, 50, -1, 55.5, -2, 56, 2, 56.6], // swing: knee passes forward
  [4.5, 50.2, 5, 55.6, 4, 56.6, 8, 55.6], // reach
] as const;
// [elbow dx, dy, hand dx, dy] from the shoulder.
const ARM = {
  back: [-2, 5.2, -4.5, 8.5], midBack: [-1, 5.6, -2.5, 9.6], down: [-0.6, 5.8, 0.8, 10], midFwd: [1, 5.6, 3, 9.4], fwd: [3, 5, 6, 8],
} as const;
const SIDE_ARMS = [ARM.back, ARM.midBack, ARM.down, ARM.midFwd, ARM.fwd, ARM.midFwd, ARM.down, ARM.midBack];

export const WALK_BOB = [0, 1, 0, -1, 0, 1, 0, -1];
const SIDE_LEAN = [0, 1, 0, 0, 0, 1, 0, 0];
const TWIST = [-1, -0.5, 0, 0.5, 1, 0.5, 0, -0.5];
const SIDE_HEM = [1, 1, 0, 0, 1, 1, 0, 0];

const base = { expr: "neutral" as Expr, eyes: "open" as Eyes };
const lagged = (series: readonly number[], i: number) => ({ nod: lag(series, i, 1) - series[i], tip: lag(series, i, 2) - lag(series, i, 1) });

const KEYED_WALK_RIGHT: HeroFrame[] = WALK_BOB.map((bob, i) => {
  const sh: V = [15, 34];
  return {
    ...base,
    legN: legAt(15, SIDE_LEG[i]), legF: legAt(16, SIDE_LEG[(i + 4) % 8]),
    armN: armAt(sh, SIDE_ARMS[i]), armF: armAt(sh, SIDE_ARMS[(i + 4) % 8]),
    bob, ...lagged(WALK_BOB, i), hem: SIDE_HEM[i], twist: TWIST[i], lean: SIDE_LEAN[i],
  };
});

// Front and back: the foot nearer the camera sits lower on screen; a lifted heel shows a shorter shoe.
const FRONT_LEG = [
  [0, 52.4, 0, 58.8, -1.6, 60.6, 1.6, 60.6], // contact, nearest
  [-0.5, 51.8, 0, 58.2, -1.6, 60.2, 1.6, 60.2], // down
  [0, 51.6, 0, 58, -1.6, 60, 1.6, 60], // passing
  [0, 51.2, 0, 57.4, -1.2, 59.6, 1.2, 59.6], // up, heel lifting
  [0, 50.6, 0, 56.4, -1, 58, 1, 58], // toe-off, furthest
  [0.5, 50, 0.3, 55, -0.8, 56.4, 1, 56.4], // lift
  [0, 50.8, -0.4, 56, -1.6, 57.6, 1.4, 57.6], // swing
  [0, 51.8, 0, 58.2, -1.6, 60.2, 1.6, 60.4], // reach
] as const;
const FA = { back: [-1.5, 4.5, -2, 8], mid: [-1, 5, -0.5, 9.6], fwd: [-0.4, 5.6, 1.6, 10.4] } as const;
const FRONT_ARMS = [FA.back, FA.mid, FA.mid, FA.fwd, FA.fwd, FA.mid, FA.mid, FA.back];
const FRONT_HEM = [0, 1, 1, 0, 0, -1, -1, 0];
const mirrorArm = (a: readonly number[]) => [-a[0], a[1], -a[2], a[3]];

function keyedFrontWalk(back: boolean): HeroFrame[] {
  return WALK_BOB.map((bob, i) => {
    // From behind, the leg stepping forward is the one further away: shift its phase by half.
    const k = back ? (i + 4) % 8 : i;
    return {
      ...base,
      legN: legAt(13, FRONT_LEG[k]), legF: legAt(19, FRONT_LEG[(k + 4) % 8]),
      armN: armAt([10, 34], FRONT_ARMS[(k + 4) % 8]), armF: armAt([22, 34], mirrorArm(FRONT_ARMS[k])),
      bob, ...lagged(WALK_BOB, i), hem: FRONT_HEM[i], twist: TWIST[i] * 0.5, lean: 0,
    };
  });
}

/** Idle, 8 frames at 5 fps: one slow breath, the hair a frame behind it, a blink on frame 6. */
export const BREATH = [0, 0, 0, 1, 1, 1, 0, 0];
function keyedIdle(dir: "down" | "up" | "right", expr: Expr): HeroFrame[] {
  return BREATH.map((bob, i) => {
    const eyes: Eyes = expr === "laugh" ? "shut" : i === 6 ? "blink" : "open";
    const tip = lag(BREATH, i, 1) - bob;
    if (dir === "right") {
      return { expr, eyes, bob, nod: 0, tip, hem: 0, twist: 0, lean: 0,
        legN: legAt(15, [1, 52, 1, 58, 0, 60, 4.5, 60]), legF: legAt(14, [0, 52, -0.5, 58, -1.5, 60, 3, 60]),
        armN: armAt([15, 34], [0, 6, 0.6, 10]), armF: armAt([15, 34], [0.5, 6, 1.2, 10]) };
    }
    return { expr, eyes, bob, nod: 0, tip, hem: 0, twist: 0, lean: 0,
      legN: legAt(13, FRONT_LEG[2]), legF: legAt(19, FRONT_LEG[2]),
      armN: armAt([10, 34], [-1, 5, -0.6, 9.8]), armF: armAt([22, 34], [1, 5, 0.6, 9.8]) };
  });
}

// ── mapped onto the cast's proportions ─────────────────────────────────────

const KEYED_HIP = 44, SOLE = 61;
/** Leg rows: the sole stays put, the hip drops two rows. */
const legY = (y: number) => SOLE - ((SOLE - y) * (SOLE - HIP_Y)) / (SOLE - KEYED_HIP);
const ARM_SCALE = 0.92;

const remapLeg = (l: Leg, dx: number): Leg => {
  const m = (v: V): V => [v[0] + dx, legY(v[1])];
  return { knee: m(l.knee), ankle: m(l.ankle), heel: m(l.heel), toe: m(l.toe) };
};
const remapArm = (a: Arm, from: V, to: V): Arm => {
  const m = (v: V): V => [to[0] + (v[0] - from[0]) * ARM_SCALE, to[1] + (v[1] - from[1]) * ARM_SCALE];
  return { elbow: m(a.elbow), hand: m(a.hand) };
};
const side = (frames: HeroFrame[]): HeroFrame[] => frames.map((f) => ({
  ...f, legN: remapLeg(f.legN, 0), legF: remapLeg(f.legF, 0), armN: remapArm(f.armN, [15, 34], SHOULDER_SIDE), armF: remapArm(f.armF, [15, 34], SHOULDER_SIDE),
}));
const front = (frames: HeroFrame[]): HeroFrame[] => frames.map((f) => ({
  ...f,
  legN: remapLeg(f.legN, HIP_L - 13), legF: remapLeg(f.legF, HIP_R - 19),
  armN: remapArm(f.armN, [10, 34], SHOULDER_L), armF: remapArm(f.armF, [22, 34], SHOULDER_R),
}));

export const WALK_RIGHT = side(KEYED_WALK_RIGHT);
export const WALK_DOWN = front(keyedFrontWalk(false));
export const WALK_UP = front(keyedFrontWalk(true));
export function idle(dir: "down" | "up" | "right", expr: Expr = "neutral"): HeroFrame[] {
  return dir === "right" ? side(keyedIdle("right", expr)) : front(keyedIdle(dir, expr));
}

// ── the player's actions ──────────────────────────────────────────────────

/** The actions the game asks of `char/player`. Left is drawn from right and mirrored (own pencil). */
export type HeroAction = "idle" | "walk" | "carry-idle" | "carry-walk";
type Drawn = Exclude<HeroDir, "left">;

/**
 * Carrying keeps the legs, bob, nod, hair and hem of the walk or idle; the arms are fixed to the tray
 * (drawn in `_hero-body.ts`) and the shoulders stop twisting so the board stays square.
 */
const carrying = (frames: HeroFrame[]): HeroFrame[] => frames.map((f) => ({ ...f, carry: true, twist: 0 }));

const WALK: Record<Drawn, HeroFrame[]> = { down: WALK_DOWN, up: WALK_UP, right: WALK_RIGHT };
const IDLE: Record<Drawn, HeroFrame[]> = { down: idle("down"), up: idle("up"), right: idle("right") };

/**
 * Tiles walked per frame when the engine steps a walk by distance (`SpriteDef.stride`): the 8-frame
 * cycle at the waiter's 3.2 tiles/s then plays in its designed 0.8 s (the 4-frame cast keeps 0.375).
 */
export const HERO_STRIDE = 0.32;

export const HERO_ACTIONS: Record<HeroAction, { fps: number; stride?: number; frames: Record<Drawn, HeroFrame[]> }> = {
  idle: { fps: 5, frames: IDLE },
  walk: { fps: 10, stride: HERO_STRIDE, frames: WALK },
  "carry-idle": { fps: 5, frames: { down: carrying(IDLE.down), up: carrying(IDLE.up), right: carrying(IDLE.right) } },
  "carry-walk": { fps: 10, stride: HERO_STRIDE, frames: { down: carrying(WALK.down), up: carrying(WALK.up), right: carrying(WALK.right) } },
};

/**
 * How far the tray (and everything on it) rides down in each frame of a carry action. The bob is
 * the same in every facing, so the dishes (`food/tray-*`, facing down only) can follow it.
 */
export function carryBob(action: "carry-idle" | "carry-walk"): number[] {
  const bobs = Object.values(HERO_ACTIONS[action].frames).map((frames) => frames.map((f) => f.bob));
  if (bobs.some((b) => b.join() !== bobs[0].join())) throw new Error(`${action}: the bob differs between facings`);
  return bobs[0];
}
