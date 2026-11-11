/**
 * The player's body (ticket 0193 pass three, landed in 0194): a joint puppet on the cast's
 * proportions (`ex/waiter`): a big round head with the chin on the collar, a body about 20 wide with
 * the arms, short legs. Heads are in `_hero-head.ts`; poses in `_hero-poses.ts`.
 *
 * Limbs are capsules lit by plane from the upper left, with an interior line in a darker step of the
 * limb's own colour where a near limb crosses the body (no doubled outlines), and one `ink`
 * silhouette outline. Hands are mittens (a palm with the thumb on the inside), knees carry a crease,
 * and shoes are a toe cap on a sole so the toe lifts clearly at heel strike.
 *
 * Carrying, both hands hold the rig's tea-wood tray (`_tray.ts`) at its usual place, so the dishes
 * placed by `trayActors` in `src/world/pixel/cafe.ts` still sit on the board.
 *
 * Frame 32×64, anchor [16, 62]: soles sit on row 61.
 */
import type { Color, Px } from "../../kit/index.ts";
import { paint, type Pose } from "./_core.ts";
import { drawHead } from "./_hero-head.ts";
import {
  HIP_L, HIP_R, HIP_SIDE, HIP_Y, SHOULDER_L, SHOULDER_R, SHOULDER_SIDE, SHOULDER_Y, WAIST_Y,
  type Arm, type HeroDir, type HeroFrame, type Leg, type V,
} from "./_hero-poses.ts";
import { TRAY } from "./_tray.ts";

type Tones = readonly [Color, Color, Color];
const add = (a: V, dx: number, dy: number): V => [a[0] + dx, a[1] + dy];

function capsule(p: Px, a: V, b: V, r: number, tones: Tones, edge = false): void {
  const [ax, ay] = a, [bx, by] = b;
  const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy || 1;
  const x0 = Math.floor(Math.min(ax, bx) - r - 2), x1 = Math.ceil(Math.max(ax, bx) + r + 2);
  const y0 = Math.floor(Math.min(ay, by) - r - 2), y1 = Math.ceil(Math.max(ay, by) + r + 2);
  const near = (x: number, y: number) => {
    const cx = x + 0.5, cy = y + 0.5;
    const t = Math.max(0, Math.min(1, ((cx - ax) * dx + (cy - ay) * dy) / len2));
    const qx = ax + t * dx, qy = ay + t * dy;
    return { d: Math.hypot(cx - qx, cy - qy), nx: (cx - qx) / r, ny: (cy - qy) / r };
  };
  if (edge) p.over(() => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const { d } = near(x, y); if (d <= r + 1 && d > r) p.px(x, y, tones[2]); } });
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const { d, nx, ny } = near(x, y);
    if (d > r) continue;
    const lit = -(nx + ny * 0.8);
    p.px(x, y, lit > 0.55 ? tones[0] : lit < -0.4 ? tones[2] : tones[1]);
  }
}

/**
 * A shoe: a rounded cream upper from heel to toe on a sole line. In profile the sole follows the
 * foot, so the toe visibly lifts at heel strike; from the front it is the bottom row of the shoe.
 * Neither ever drops below the ground row.
 */
function shoe(p: Px, l: Leg, far: boolean, edge: boolean, profile: boolean): void {
  const up: Tones = far ? ["cream4", "cream3", "cream2"] : ["cream5", "cream4", "cream2"];
  const [hx, hy] = l.heel, [tx, ty] = l.toe;
  capsule(p, l.heel, l.toe, profile ? 1.3 : 1.6, up, edge);
  const n = Math.max(1, Math.round(Math.hypot(tx - hx, ty - hy)));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(hx + ((tx - hx) * i) / n);
    const y = Math.min(GROUND, Math.round(hy + ((ty - hy) * i) / n + (profile ? 0.9 : 1.1)));
    p.px(x, y, profile ? "wood2" : "cream2");
  }
}
const GROUND = 61;

function leg(p: Px, hip: V, l: Leg, far: boolean, edge: boolean, profile: boolean): void {
  const pants: Tones = far ? ["blue2", "blue2", "blue1"] : ["blue3", "blue2", "blue1"];
  shoe(p, l, far, edge, profile);
  capsule(p, l.knee, l.ankle, 2, pants, edge);
  // Rolled cuff over the shoe.
  capsule(p, add(l.ankle, 0, -0.5), l.ankle, 2.1, far ? ["blue3", "blue2", "blue2"] : ["blue4", "blue3", "blue2"]);
  capsule(p, hip, l.knee, 2.4, pants, edge);
  // A crease behind the knee breaks the tube.
  if (profile) p.px(Math.round(l.knee[0] - 1.5), Math.round(l.knee[1]), far ? "blue1" : "blue1");
  else p.px(Math.round(l.knee[0]), Math.round(l.knee[1] + 1), far ? "blue1" : "blue2");
}

/** A mitten hand: the palm a pixel past the wrist along the forearm, the thumb on the inside. */
function hand(p: Px, a: Arm, inward: number, far: boolean): void {
  const [ex, ey] = a.elbow, [hx, hy] = a.hand;
  const len = Math.hypot(hx - ex, hy - ey) || 1;
  const ux = (hx - ex) / len, uy = (hy - ey) / len;
  const tones: Tones = far ? ["skin3", "skin3", "skin2"] : ["skin4", "skin3", "skin2"];
  // The near hand gets an interior line where it crosses the apron or the shirt.
  capsule(p, [hx - ux * 0.3, hy - uy * 0.3], [hx + ux * 1.2, hy + uy * 1.2], 1.45, tones, !far);
  p.px(Math.round(hx + inward * 1.6 - ux * 0.5), Math.round(hy - uy * 0.5), tones[1]);
}

function arm(p: Px, shoulder: V, a: Arm, far: boolean, edge: boolean, inward: number): void {
  const skin: Tones = far ? ["skin3", "skin2", "skin2"] : ["skin4", "skin3", "skin2"];
  const sleeve: Tones = far ? ["cream4", "cream3", "cream3"] : ["cream5", "cream4", "cream3"];
  capsule(p, a.elbow, a.hand, 1.4, skin, edge);
  hand(p, a, inward, far);
  const cuff: V = [shoulder[0] + (a.elbow[0] - shoulder[0]) * 0.8, shoulder[1] + (a.elbow[1] - shoulder[1]) * 0.8];
  capsule(p, shoulder, cuff, 2.2, sleeve, edge);
  capsule(p, cuff, cuff, 2, far ? ["cream3", "cream3", "cream2"] : ["cream4", "cream3", "cream2"]);
}

// ── torso ─────────────────────────────────────────────────────────────────

function torsoFront(p: Px, f: HeroFrame, back: boolean): void {
  const b = f.bob, tw = Math.round(f.twist), S = SHOULDER_Y, W = WAIST_Y;
  p.poly([[8 + tw, S - 1 + b], [24 + tw, S - 1 + b], [25 + tw, S + 2 + b], [23, W + b], [9, W + b], [7 + tw, S + 2 + b]], "cream4");
  p.over(() => {
    p.rect(8 + tw, S - 1 + b, 5, 3, "cream5");
    p.rect(20 + tw, S + b, 6, W - S, "cream3");
  });
  p.rect(9, W + b, 14, HIP_Y - W + 1, "blue2");
  p.hline(9, W + b, 14, "blue1");
  if (back) {
    p.line(10 + tw, S + b, 19, W - 1 + b, "jade3").line(21 + tw, S + b, 12, W - 1 + b, "jade3");
    p.hline(8, W + b, 16, "jade3");
    p.rows(13, W - 1 + b, ["jj.jj", "jJJJj", ".jJj."], { j: "jade3", J: "jade2" });
    p.line(15, W + 2 + b, 14 + f.hem, W + 6 + b, "jade3").line(16, W + 2 + b, 18 + f.hem, W + 5 + b, "jade2");
    p.poly([[8, W + b], [10, W + b], [9 + f.hem, 51], [7 + f.hem, 51]], "jade3");
    p.poly([[22, W + b], [24, W + b], [25 + f.hem, 51], [23 + f.hem, 51]], "jade2");
    return;
  }
  // Collar points under the chin.
  p.rows(10 + tw, S - 2 + b, ["..wW....Ww..", "...wW..Ww...", "....wkkw...."], { w: "white", W: "cream4", k: "cream3" });
  const h = f.hem;
  p.poly([[11, 36 + b], [21, 36 + b], [22, W + b], [10, W + b]], "jade3");
  p.line(11 + tw, S - 1 + b, 11, 36 + b, "jade3").line(21 + tw, S - 1 + b, 21, 36 + b, "jade2");
  p.poly([[9, W + b], [23, W + b], [24 + h, 52], [8 + h, 52]], "jade3");
  p.over(() => {
    p.rect(11, 36 + b, 2, 7, "jade4").rect(9, W + b, 2, 8, "jade4");
    p.poly([[19, 36 + b], [22, 36 + b], [22, W + b], [19, W + b]], "jade2");
    p.poly([[19, W + b], [23, W + b], [24 + h, 52], [20 + h, 52]], "jade2");
    p.line(14, W + 2 + b, 13 + h, 51, "jade2").line(17, W + 2 + b, 17 + h, 51, "jade4");
  });
  p.hline(8 + h, 52, 17, "jade2");
  p.hline(9, W + b, 14, "jade2");
  // Order pad in the bib pocket with a pencil stub; the tea towel tucked at the hip.
  p.rows(16, 38 + b, ["..y.", "wwr.", "QQQQ", "Qqq."], { w: "white", y: "gold4", r: "red3", Q: "jade2", q: "jade4" });
  p.rows(8, W + 1 + b, ["tt", "tT", "bT", "tT", ".T"], { t: "cream5", T: "cream3", b: "blue4" });
}

function torsoSide(p: Px, f: HeroFrame): void {
  const b = f.bob, ln = f.lean, tw = f.twist, S = SHOULDER_Y, W = WAIST_Y;
  // A fuller chest than pass two: back on the left, chest on the right.
  // The shirt's collar line rises a row at the back of the neck so the neck stays short.
  p.poly([[11 + ln, S - 2 + b], [17 + ln, S - 2 + b], [18 + ln, S - 1 + b], [10 + ln, S - 1 + b]], "cream4");
  p.poly([[10 + ln, S - 1 + b], [19 + ln + tw, S - 1 + b], [21 + ln + tw, S + 3 + b], [20.5, W + b], [10, W + b], [9 + ln, S + 2 + b]], "cream4");
  p.over(() => { p.rect(9, S - 1 + b, 5 + ln, 4, "cream5"); p.rect(9, 39 + b, 2, 5, "cream3"); p.px(16 + ln, 38 + b, "cream3").px(17 + ln, 39 + b, "cream3"); });
  p.rect(10, W + b, 11, HIP_Y - W + 1, "blue2");
  p.hline(10, W + b, 11, "blue1");
  p.rows(17 + ln, S - 2 + b, ["wW.", ".wk"], { w: "white", W: "cream4", k: "cream3" });
  p.line(17 + ln, S - 1 + b, 19 + ln, 36 + b, "jade3");
  p.poly([[18 + ln, 36 + b], [21 + ln, 36 + b], [21, W + b], [17, W + b]], "jade3");
  p.rows(8, W - 1 + b, ["jj.", "jJj", ".jJ", "..j"], { j: "jade3", J: "jade2" });
  p.hline(10, W + b, 11, "jade2");
  const h = f.hem;
  p.poly([[14, W + b], [21, W + b], [23 + h, 52], [15 + h, 52]], "jade3");
  p.over(() => {
    p.line(15, W + 1 + b, 16 + h, 51, "jade4");
    p.line(20, W + 2 + b, 22 + h, 51, "jade2");
  });
  p.hline(15 + h, 52, 9, "jade2");
}

function apronOverNearThigh(p: Px, f: HeroFrame): void {
  const h = f.hem, b = f.bob;
  p.poly([[15, WAIST_Y + b], [21, WAIST_Y + b], [23 + h, 52], [16 + h, 52]], "jade3");
  p.line(20, WAIST_Y + 2 + b, 22 + h, 51, "jade2");
  p.hline(16 + h, 52, 8, "jade2");
}

const shiftArm = (a: Arm, dx: number, dy: number): Arm => ({ elbow: add(a.elbow, dx, dy), hand: add(a.hand, dx, dy) });

// ── the tray ───────────────────────────────────────────────────────────────

const HAND_SLOTS = { S: "skin4", s: "skin3", k: "skin2" } as const;
/** The rig's tray parts for a facing, riding the body's bob like the rest of the upper body. */
function tray(p: Px, dir: Exclude<HeroDir, "left">, bob: number): void {
  const pose: Pose = { dir, action: "carry", frame: 0, legs: "stand", arms: "carry", body: bob, head: 0, beat: "rest" };
  paint(p, TRAY(pose), HAND_SLOTS, pose);
}

/**
 * Arms holding the tray, relative to the shoulder: elbows bent out at the waist, hands under the
 * board's ends (front and back) or under its near edge (profile), where `_tray.ts` draws the thumbs.
 */
const CARRY_ARMS = {
  frontL: { elbow: [-2.5, 4.5], hand: [-3.5, 7.5] },
  frontR: { elbow: [2.5, 4.5], hand: [3.5, 7.5] },
  sideN: { elbow: [1.5, 5], hand: [7.5, 7.5] },
  sideF: { elbow: [3, 4.5], hand: [9, 6.5] },
} as const;
const held = (shoulder: V, k: { elbow: readonly number[]; hand: readonly number[] }): Arm => ({
  elbow: add(shoulder, k.elbow[0], k.elbow[1]), hand: add(shoulder, k.hand[0], k.hand[1]),
});

// ── assembly ──────────────────────────────────────────────────────────────

/** Draw one frame of the player into a 32×64 canvas. */
export function drawHero(p: Px, f: HeroFrame, dir: HeroDir): void {
  if (dir === "left") {
    const q = new (p.constructor as new (w: number, h: number) => Px)(p.w, p.h);
    drawHero(q, f, "right");
    p.blit(q, 0, 0, { flipX: true });
    // The pencil lives behind the right ear: in left profile it is the near ear.
    drawHead(p, "left-pencil", f);
    return;
  }
  const b = f.bob;
  if (dir === "right") {
    const hip: V = [HIP_SIDE, HIP_Y + b];
    const sh: V = add(SHOULDER_SIDE, f.lean, b);
    const armF = f.carry ? held(sh, CARRY_ARMS.sideF) : shiftArm(f.armF, f.lean, b);
    const armN = f.carry ? held(sh, CARRY_ARMS.sideN) : shiftArm(f.armN, f.lean, b);
    arm(p, add(sh, -f.twist, 0), armF, true, false, 1);
    leg(p, add(hip, 1, 0), f.legF, true, false, true);
    torsoSide(p, f);
    leg(p, hip, f.legN, false, true, true);
    p.over(() => p.clip(0, HIP_Y - 2, 32, 9, () => apronOverNearThigh(p, f)));
    arm(p, add(sh, f.twist, 0), armN, false, true, 1);
    if (f.carry) tray(p, dir, b);
  } else {
    const back = dir === "up";
    const hipL: V = [HIP_L, HIP_Y + b], hipR: V = [HIP_R, HIP_Y + b];
    const shL = add(SHOULDER_L, f.twist, b), shR = add(SHOULDER_R, f.twist, b);
    // From behind, the tray is in front of the body: only its ends show past the hips.
    if (f.carry && back) tray(p, dir, b);
    const legs: [V, Leg, boolean][] = [[hipL, f.legN, false], [hipR, f.legF, true]];
    legs.sort((x, y) => (back ? y[1].heel[1] - x[1].heel[1] : x[1].heel[1] - y[1].heel[1]));
    for (const [hip, l, far] of legs) leg(p, hip, l, far && !back, true, false);
    if (f.carry) {
      torsoFront(p, f, back);
      arm(p, shL, held(shL, CARRY_ARMS.frontL), false, true, back ? -1 : 1);
      arm(p, shR, held(shR, CARRY_ARMS.frontR), true, true, back ? 1 : -1);
      if (!back) tray(p, dir, b);
    } else {
      const armL = shiftArm(f.armN, 0, b), armR = shiftArm(f.armF, 0, b);
      const behind = (a: Arm) => (back ? a.hand[1] > 45 + b : a.hand[1] < 43 + b);
      if (behind(armL)) arm(p, shL, armL, false, false, 1);
      if (behind(armR)) arm(p, shR, armR, true, false, -1);
      torsoFront(p, f, back);
      if (!behind(armL)) arm(p, shL, armL, false, true, back ? -1 : 1);
      if (!behind(armR)) arm(p, shR, armR, true, true, back ? 1 : -1);
    }
  }
  drawHead(p, dir, f);
  p.outline("ink");
}
