/**
 * Where a carried thing goes as the arms swing. Things are drawn for the standing `rest` pose and
 * moved by `heldOffset`: the screen-right hand from the front, the screen-left hand from behind,
 * the near hand in profile (facing right; mirror the parts for `left`).
 */
import type { Pose } from "./_core.ts";

export function heldOffset(pose: Pose): [number, number] {
  const step = pose.legs;
  if (pose.dir === "down") return step === "stepA" ? [-1, 1] : step === "stepB" ? [0, -2] : [0, 0];
  if (pose.dir === "up") return step === "stepA" ? [1, 1] : step === "stepB" ? [0, -2] : [0, 0];
  return step === "stepA" ? [-5, -1] : step === "stepB" ? [5, -1] : [0, 0];
}
