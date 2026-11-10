/**
 * Character rig core: parts, slots, pose and the compositor. See `_rig.ts` for the overview.
 */
import type { Color, Paint, Px } from "../../kit/index.ts";

export type Dir = "down" | "up" | "left" | "right";
export const DIRS: readonly Dir[] = ["down", "up", "left", "right"];

export const W = 32;
export const H = 64;

/** Which offset a part rides on: legs stay planted, the body bobs, the head bobs with the body plus its own breath. */
export type Group = "legs" | "body" | "head";

/** One layer of hand-placed pixels. Rows are slot letters; `.` is transparent and `_` erases. */
export type Part = {
  rows: readonly string[];
  /** Top row and left column of the layer in the 16×32 frame. */
  y: number;
  x?: number;
  /** Draw order; higher is in front. See `Z`. */
  z: number;
  group?: Group;
  /** Fixed colours for this part, looked up before the character's slots (trays, food). */
  legend?: Readonly<Record<string, Paint>>;
};

/** Standard layer depths. */
export const Z = {
  behind: 0, // backpack seen from the front, a tray seen from behind
  farArm: 5, // the arm on the far side in profile
  legs: 10,
  skirt: 15,
  torso: 20,
  clothes: 25, // apron, cardigan body, tie
  arms: 30,
  sleeves: 35,
  head: 40,
  face: 45,
  hair: 50,
  hat: 55,
  glasses: 60,
  front: 70, // tray
  hands: 75, // hands gripping the tray
} as const;

/** `lie` and `sit-bed` are in bed: no legs are drawn, the blanket covers the figure from the chest or waist. */
export type LegPose = "stand" | "stepA" | "passA" | "stepB" | "passB" | "sit" | "lie" | "sit-bed";
export type ArmPose = "rest" | "swingA" | "swingB" | "carry" | "sit" | "lie" | "lap";
/** What the frame is for, beyond the body pose: pieces use it for blinks, glances and habits. */
export type Beat = "rest" | "breath" | "blink" | "habit";

export type Pose = {
  dir: Dir;
  action: string;
  frame: number;
  legs: LegPose;
  arms: ArmPose;
  /** Vertical offset of torso, arms and head. */
  body: number;
  /** Extra vertical offset of the head (breath). */
  head: number;
  beat: Beat;
};

export type Piece = (pose: Pose) => readonly Part[];

/** Art for the three drawn directions; `left` mirrors `right` unless given. */
export type Sided<T> = { down: T; up: T; right: T; left?: T };

/**
 * A character's slot palette.
 * Skin `S s k`, blush `b`, mouth `m`, top `T t u`, sleeve `V v`, forearm `F f`, bottom `P p`,
 * shoes `N n`, hair `H h d`, brow `r`, collar `C c`, accessory `A a Q`, second accessory `G g`, lens `L`.
 * `o` ink, `i` ink2, `w` white and `e` (eye, ink) are fixed for everyone.
 */
export type Slots = Partial<Record<string, Color>>;

const FIXED: Record<string, Paint> = { o: "ink", i: "ink2", w: "white", e: "ink", _: null };

export type Build = {
  /** A gentle forward lean: the head one pixel forward in profile and one lower. */
  lean?: boolean;
};

// ── helpers ────────────────────────────────────────────────────────────────

/** Shorthand for a part. */
export function part(y: number, z: number, rows: readonly string[], options: Partial<Omit<Part, "rows" | "y" | "z">> = {}): Part {
  const x = options.x ?? 0;
  for (const row of rows) if (x + row.length > W) throw new Error(`Part row "${row}" overflows the ${W}px frame at x=${x}`);
  return { y, z, rows, ...options };
}

/** Mirror a part left-to-right within the frame. */
export function mirror(p: Part): Part {
  const width = Math.max(...p.rows.map((r) => r.length));
  return { ...p, x: W - (p.x ?? 0) - width, rows: p.rows.map((r) => [...r.padEnd(width, ".")].reverse().join("")) };
}

/** Shading map: each slot letter to the next darker one. */
export const DARKER: Readonly<Record<string, string>> = {
  S: "s", s: "k", T: "t", t: "u", V: "v", F: "f", P: "p", H: "h", h: "d", A: "a", a: "Q", N: "n", C: "c", G: "g", X: "x", Y: "y",
};

/**
 * Mirror half-rows into a symmetric figure, then shade everything from column `shadeFrom`
 * rightward one step darker, as the sun is upper left. Asymmetries go on as separate parts.
 */
export function sym(half: readonly string[], shadeFrom = W): string[] {
  return half.map((row) => {
    const left = row.padEnd(W / 2, ".");
    const full = left + [...left].reverse().join("");
    return [...full].map((c, x) => (x >= shadeFrom && DARKER[c] ? DARKER[c] : c)).join("");
  });
}

/** Shade a region of rows one step darker (columns x0..x1 inclusive). */
export function darken(rows: readonly string[], x0: number, x1 = W - 1): string[] {
  return rows.map((row) => [...row].map((c, x) => (x >= x0 && x <= x1 && DARKER[c] ? DARKER[c] : c)).join(""));
}

/** Move a part. */
export function shift(p: Part, dx: number, dy: number): Part {
  return { ...p, x: (p.x ?? 0) + dx, y: p.y + dy };
}

/** Pick art by direction, mirroring `right` for `left` when no `left` is given. */
export function sided(art: Sided<readonly Part[]>): Piece {
  return (pose) => (pose.dir === "left" ? art.left ?? art.right.map(mirror) : art[pose.dir]);
}

/** Like `sided`, but each direction is itself a function of the pose. */
export function sidedBy(art: Sided<Piece>): Piece {
  return (pose) => {
    if (pose.dir !== "left") return art[pose.dir](pose);
    return art.left ? art.left(pose) : art.right({ ...pose, dir: "right" }).map(mirror);
  };
}

// ── composition ────────────────────────────────────────────────────────────

/** Composite parts into a Px, colour them with the slots and outline the silhouette in ink. */
export function render(p: Px, parts: readonly Part[], slots: Slots, pose: Pose, build: Build = {}): void {
  const sorted = parts.map((part, i) => ({ part, i })).sort((a, b) => a.part.z - b.part.z || a.i - b.i);
  const lean = build.lean ? (pose.dir === "right" ? [1, 1] : pose.dir === "left" ? [-1, 1] : [0, 1]) : [0, 0];
  for (const { part } of sorted) {
    const group = part.group ?? "body";
    const dx = group === "head" ? lean[0] : 0;
    const dy = group === "legs" ? 0 : group === "body" ? pose.body : pose.body + pose.head + lean[1];
    const ox = (part.x ?? 0) + dx, oy = part.y + dy;
    part.rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const key = row[i];
        if (key === ".") continue;
        const c = part.legend && key in part.legend ? part.legend[key] : key in FIXED ? FIXED[key] : slots[key];
        if (c === undefined) throw new Error(`Slot "${key}" has no colour (row ${j} "${row}")`);
        p.px(ox + i, oy + j, c);
      }
    });
  }
  p.outline("ink");
}
