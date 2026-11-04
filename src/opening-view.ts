import type { Content } from "./contracts";
import type { OpeningState } from "./opening";
import type { WardCastId, WardFood, WardFrame } from "./scene/ward.js";

export type TokenLook = "fogged" | "dot" | "plain";

export function tokenLook(opening: OpeningState, wordId: string): TokenLook {
  if (!Object.hasOwn(opening.recovered, wordId)) return "fogged";
  return opening.step - opening.recovered[wordId] <= 1 ? "dot" : "plain";
}

const wardCast: readonly string[] = ["doctor", "nurse", "aunt"] satisfies WardCastId[];

export function wardFrame(
  opening: OpeningState,
  content: Content,
  offered: string | null,
): WardFrame {
  const steps = content.opening.steps;
  const present = new Set<string>();
  const delivered: string[] = [];
  steps.slice(0, opening.step + 1).forEach((step, index) => {
    if (step.type === "end") return;
    for (const id of step.enter ?? []) present.add(id);
    const done = index < opening.step;
    if (done) for (const id of step.leave ?? []) present.delete(id);
    if (step.type === "request" && (done || opening.feedback === "thanks"))
      delivered.push(step.want);
  });
  const held =
    opening.feedback === "wrong-food" && offered ? offered : (delivered.at(-1) ?? null);
  const firstRequest = steps.findIndex((step) => step.type === "request");
  return {
    elder: "sitting",
    player: opening.step >= firstRequest ? "sitting" : "lying",
    present: wardCast.filter((id) => present.has(id)) as WardCastId[],
    table: content.opening.tray.filter(
      (food) => food !== held && !delivered.includes(food),
    ) as WardFood[],
    held: held as WardFood | null,
  };
}
