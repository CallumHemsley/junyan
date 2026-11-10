/**
 * The character rig. Every person is assembled from layered parts of hand-placed pixels written
 * in slot letters (skin, top, bottom, hair…), coloured by the character's slot palette and
 * outlined in `ink`.
 *
 * - The body (head shape, torso, arms, legs) is drawn once per direction and pose in `_body.ts`
 *   and `_side.ts`.
 * - A character supplies a slot palette, a hairstyle, a face and extras (apron, cardigan,
 *   glasses, bag, tray), each a `Piece`: a function from the pose to parts.
 * - `left` is the mirror of `right` unless a piece supplies its own `left` art.
 * - Every frame carries a `beat` (rest, breath, blink, habit) so faces and props can act.
 *
 * Frame 32×64, anchor [16, 62] between the feet.
 */
import type { SpriteDef, SpriteSet } from "../../kit/index.ts";
import { FRONT_ARMS, FRONT_LEGS, HEAD, SIT_BODY, TORSO } from "./_body.ts";
import { DIRS, mirror, render, sided, type Build, type Part, type Piece, type Pose, type Slots } from "./_core.ts";
import { SIDE_ARMS, SIDE_LEGS } from "./_side.ts";

export * from "./_core.ts";
export { EAR_RIGHT, HEAD, SIT_BODY, TORSO } from "./_body.ts";

type FrameSpec = Omit<Pose, "dir" | "action" | "frame">;

const stand = { legs: "stand", arms: "rest", body: 0, head: 0 } as const;
const IDLE: FrameSpec[] = [
  { ...stand, beat: "rest" },
  { ...stand, body: 1, beat: "breath" },
  { ...stand, beat: "rest" },
  { ...stand, beat: "habit" },
];
const WALK: FrameSpec[] = [
  { legs: "stepA", arms: "swingA", body: 0, head: 0, beat: "rest" },
  { legs: "passA", arms: "rest", body: -1, head: 0, beat: "rest" },
  { legs: "stepB", arms: "swingB", body: 0, head: 0, beat: "rest" },
  { legs: "passB", arms: "rest", body: -1, head: 0, beat: "rest" },
];
const seat = { legs: "sit", arms: "sit", body: SIT_BODY, head: 0 } as const;
const SIT: FrameSpec[] = [
  { ...seat, beat: "rest" },
  { ...seat, head: 1, beat: "breath" },
  { ...seat, beat: "rest" },
  { ...seat, beat: "habit" },
];

export type Action = "idle" | "walk" | "sit" | "carry-idle" | "carry-walk";
export const ACTIONS: Record<Action, { frames: FrameSpec[]; fps: number }> = {
  idle: { frames: IDLE, fps: 2 },
  walk: { frames: WALK, fps: 7 },
  sit: { frames: SIT, fps: 2 },
  "carry-idle": { frames: IDLE.slice(0, 2).map((f) => ({ ...f, arms: "carry" })), fps: 2 },
  "carry-walk": { frames: WALK.map((f) => ({ ...f, arms: "carry" })), fps: 7 },
};

/** Sprite contract shared by every person. */
export const PERSON = { w: 32, h: 64, anchor: [16, 62], foot: [-8, -8, 16, 8], shadow: { rx: 11, ry: 4 } } as const;

/** Run a right-facing piece for `left` and mirror it. */
export function facing(piece: Piece): Piece {
  return (pose) => (pose.dir === "left" ? piece({ ...pose, dir: "right" }).map(mirror) : piece(pose));
}

/** Choose a piece for front/back views and another for profile (mirrored for left). */
export function frontSide(front: Piece, side: Piece): Piece {
  const profile = facing(side);
  return (pose) => (pose.dir === "down" || pose.dir === "up" ? front(pose) : profile(pose));
}

export type BodyPieces = { head: Piece; torso: Piece; arms: Piece; legs: Piece };

/** The default body. Characters override single pieces (a wider torso, a long skirt). */
export const RIG: BodyPieces = {
  head: sided({ down: [HEAD.down], up: [HEAD.up], right: [HEAD.right] }),
  torso: sided({ down: [TORSO.down], up: [TORSO.up], right: [TORSO.right] }),
  arms: frontSide(FRONT_ARMS, SIDE_ARMS),
  legs: frontSide(FRONT_LEGS, SIDE_LEGS),
};

export type CharacterDef = {
  id: string;
  slots: Slots;
  hair: Piece;
  face: Piece;
  /** Clothes and accessories layered on the body. */
  extras?: readonly Piece[];
  /** Replace single body pieces. */
  body?: Partial<BodyPieces>;
  build?: Build;
  /** Walk playback speed (default 7: four frames in about 0.6 s). */
  walkFps?: number;
  /** Adjust a frame's pose (a smaller bob, a different breath). */
  pose?: (pose: Pose) => Pose;
};

/** Every part of one frame, before colouring. */
export function partsFor(def: CharacterDef, pose: Pose): Part[] {
  const body = { ...RIG, ...def.body };
  return [body.legs, body.torso, body.arms, body.head, def.face, def.hair, ...(def.extras ?? [])].flatMap((piece) => piece(pose));
}

/** Sprite definitions `char/<id>/<action>-<dir>` for a character. */
export function defineCharacter(def: CharacterDef, actions: readonly Action[]): SpriteSet {
  const out: SpriteSet = {};
  for (const action of actions) {
    const spec = ACTIONS[action];
    for (const dir of DIRS) {
      const sprite: SpriteDef = {
        ...PERSON,
        frames: spec.frames.length,
        fps: action.endsWith("walk") ? def.walkFps ?? spec.fps : spec.fps,
        draw: (p, frame) => {
          let pose: Pose = { ...spec.frames[frame], dir, action, frame };
          if (def.pose) pose = def.pose(pose);
          render(p, partsFor(def, pose), def.slots, pose, def.build);
        },
      };
      out[`char/${def.id}/${action}-${dir}`] = sprite;
    }
  }
  return out;
}
