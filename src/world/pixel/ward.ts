/**
 * The hospital opening's ward, drawn by the pixel engine: pure functions from a `WardFrame` (who is
 * present, how the two patients lie or sit, which foods are on the cabinet and in the player's
 * hands) to the actors and run-time props the engine draws in the `ward` scene. No DOM;
 * `WardView.tsx` renders the result.
 *
 * Sprites are asked for by the ids in `docs/design/pixel-contracts.md` (`ward/bed-*`,
 * `ward/blanket-*`, `char/doctor|nurse|aunt|elder|patient` with `lie` and `sit-bed`). Until that art
 * is registered, each falls back to an existing sprite, so the ward renders today and picks up the
 * real art as soon as it is merged, with no change here.
 */
import ward from "../../pixel/scenes/ward.ts";
import type { Actor, Facing, Mark, Prop, Scene, Vec } from "../../pixel/engine/index.ts";
import { TILE } from "../../pixel/kit/index.ts";
import type { WardCastId, WardFood, WardFrame, WardPose } from "../../opening-view";

/** Whether a sprite id is registered (`id in sprites`, or `atlas.has`). */
export type HasSprite = (id: string) => boolean;

/** A mark of the ward scene, by its contract name (see `src/pixel/scenes/ward.ts`). */
const marks: Scene["marks"] = ward.marks;
// A bare point is an array, which also has an `at` (the array method), so test for the array.
const isVec = (mark: Mark | Vec): mark is Vec => Array.isArray(mark);
export function wardMark(name: string): Mark {
  const mark = marks?.[name];
  if (!mark) throw new Error(`The ward scene has no mark "${name}"`);
  return isVec(mark) ? { at: mark } : mark;
}

const px = (value: number) => value / TILE;
const plus = ([x, y]: Vec, [dx, dy]: Vec): Vec => [x + px(dx), y + px(dy)];

/**
 * In-bed actors (`lie`, `sit-bed`: 32×64, anchor [16, 62]) are drawn at the bed's anchor and
 * offset by these art pixels, so the head lands on the pillow of the bed's 48×96 canvas (anchor
 * [24, 94]): lying, on the flat pillow centred at (24, 24); sitting, against the raised backrest's
 * pillow at (24, 20), a touch in front of it. Assumes the head's centre is about row 14 of the
 * frame, as on a standing character; the orchestrator tunes these when the cast art lands.
 */
export const IN_BED_OFFSET: Record<WardPose, Vec> = { lying: [0, -22], sitting: [0, -24] };

/**
 * Stand-ins while the cast and the beds are being drawn: an existing character sitting (`sit`) on
 * a bench in the middle of the bed. The bench's anchor is this far above the bed's (art px), the
 * sitter is drawn 4px up on the seat as in the cafe, and a second bench behind it lengthens the cot.
 */
const STAND_IN_SEAT = -40;
const STAND_IN_SIT: Vec = [0, -4];

type Look = { sprite: string; action: string; facing: Facing; offset?: Vec };
type Role = WardCastId | "elder" | "patient";

/** Who stands in for whom: the cook's whites read as the doctor's coat. */
const STAND_INS: Record<Role, string> = {
  doctor: "char/cook",
  nurse: "char/xiao-li",
  aunt: "char/lin-jie",
  elder: "char/zhang-laoshi",
  patient: "char/xiao-zhou",
};

const hasLook = (has: HasSprite, { sprite, action, facing }: Look) =>
  has(`${sprite}/${action}-${facing}`) || (facing === "left" && has(`${sprite}/${action}-right`));

/** The first look whose sprite is registered, else the last (the engine's own fallbacks take over). */
function pick(has: HasSprite, looks: readonly Look[]): Look {
  return looks.find((look) => hasLook(has, look)) ?? looks[looks.length - 1];
}

/** A visitor standing, in the real art if it exists, else a stand-in (facing down if it has no such side). */
function visitorLook(has: HasSprite, id: WardCastId, facing: Facing): Look {
  return pick(has, [
    { sprite: `char/${id}`, action: "idle", facing },
    { sprite: STAND_INS[id], action: "idle", facing },
    { sprite: STAND_INS[id], action: "idle", facing: "down" },
  ]);
}

/**
 * Someone in bed. The player lying is awake (the opening starts as they wake), so `lie-awake` is
 * preferred when the cast worker draws one, then `lie`; sitting up is `sit-bed`.
 */
function inBedLook(has: HasSprite, role: "elder" | "patient", pose: WardPose): Look {
  const actions = pose === "sitting" ? ["sit-bed"] : role === "patient" ? ["lie-awake", "lie"] : ["lie"];
  return pick(has, [
    ...actions.map((action): Look => ({ sprite: `char/${role}`, action, facing: "down", offset: IN_BED_OFFSET[pose] })),
    { sprite: STAND_INS[role], action: "sit", facing: "down" },
  ]);
}

export type WardStage = { actors: Actor[]; props: Prop[] };

/**
 * One bed and its occupant: the frame (`ward/bed-<who>-flat|raised`), the person, the blanket
 * (`ward/blanket-<who>-lying|sitting`) sorted just in front of them. Everything sorts from the
 * bed's anchor, one art pixel apart, so the bed's own things never interleave with anything else.
 */
function bed(has: HasSprite, who: "player" | "elder", pose: WardPose): WardStage {
  const at = wardMark(`bed/${who}`).at;
  const sort = (step: number) => at[1] + px(step);
  const role = who === "player" ? "patient" : "elder";
  const look = inBedLook(has, role, pose);
  const frame = `ward/bed-${who}-${pose === "sitting" ? "raised" : "flat"}`;
  const blanket = `ward/blanket-${who}-${pose}`;
  const seat = plus(at, [0, STAND_IN_SEAT]);
  const props: Prop[] = has(frame)
    ? [{ id: `bed/${who}`, sprite: frame, at, solid: false, sortY: sort(0) }]
    : [
        { id: `bed/${who}-head`, sprite: "furn/bench", at: plus(seat, [0, -22]), solid: false, sortY: sort(-1) },
        { id: `bed/${who}`, sprite: "furn/bench", at: seat, solid: false, sortY: sort(0) },
      ];
  if (has(blanket)) props.push({ id: `blanket/${who}`, sprite: blanket, at, solid: false, sortY: sort(2) });
  const real = look.offset !== undefined;
  const actor: Actor = {
    id: role, sprite: look.sprite, action: look.action, facing: look.facing,
    at: real ? at : seat, offset: look.offset ?? STAND_IN_SIT, sortY: sort(1),
  };
  return { actors: [actor], props };
}

/** The foods still on the cabinet, each on its own mark, back ones drawn first. */
function cabinetFoods(has: HasSprite, foods: readonly WardFood[]): Prop[] {
  const cabinet = wardMark("cabinet").at;
  const placed = foods
    .filter((food) => has(`food/${food}`))
    .map((food) => ({ food, at: wardMark(`food/${food}`).at }))
    .sort((a, b) => a.at[1] - b.at[1]);
  return placed.map(({ food, at }, rank): Prop => ({
    id: `food/${food}`, sprite: `food/${food}`, at, solid: false, sortY: cabinet[1] + px(1 + rank),
  }));
}

/** Everything the ward draws for one frame of the opening, beyond the scene's own furniture. */
export function wardStage(frame: WardFrame, has: HasSprite): WardStage {
  const player = bed(has, "player", frame.player);
  const elder = bed(has, "elder", frame.elder);
  const visitors = frame.present.map((id, index): Actor => {
    const mark = wardMark(`stand/${id}`);
    const look = visitorLook(has, id, mark.facing ?? "down");
    return { id, sprite: look.sprite, action: look.action, facing: look.facing, at: mark.at, phase: index + 1 };
  });
  const held: Prop[] = frame.held && has(`food/${frame.held}`)
    ? [{ id: "held", sprite: `food/${frame.held}`, at: wardMark("held").at, solid: false, sortY: wardMark("bed/player").at[1] + px(3) }]
    : [];
  return {
    actors: [...player.actors, ...elder.actors, ...visitors],
    props: [...player.props, ...elder.props, ...cabinetFoods(has, frame.table), ...held],
  };
}

/** The rectangle the fixed camera keeps in view (tile units), and its centre, the camera's focus. */
export const WARD_VIEW = wardMark("view");
export const WARD_FOCUS: Vec = [WARD_VIEW.at[0] + WARD_VIEW.size![0] / 2, WARD_VIEW.at[1] + WARD_VIEW.size![1] / 2];

/**
 * The largest integer zoom (device px per art px) at which the whole `view` rectangle fits a box
 * of `cssWidth`×`cssHeight` CSS px; never below 1. Whole zooms keep every pixel crisp.
 */
export function wardZoom(cssWidth: number, cssHeight: number, dpr: number): number {
  const [w, h] = WARD_VIEW.size!;
  return Math.max(1, Math.floor(Math.min((cssWidth * dpr) / (w * TILE), (cssHeight * dpr) / (h * TILE)) + 1e-9));
}
