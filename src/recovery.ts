import type { GameState, JournalEntry } from "./contracts";
import type { SessionAction } from "./opening";
import type { TokenLook } from "./opening-view";

export function freshWords(
  previous: GameState["journal"],
  next: GameState["journal"],
): string[] {
  return Object.keys(next).filter(
    (id) =>
      next[id].recovered &&
      !(Object.hasOwn(previous, id) && previous[id].recovered),
  );
}

export function wordState(
  entry: JournalEntry | undefined,
  fresh: boolean,
): TokenLook {
  if (!entry?.recovered) return "fogged";
  return fresh ? "dot" : "plain";
}

export function nextDots(
  dots: string[],
  previous: GameState,
  action: SessionAction,
  next: GameState,
): string[] {
  if (next === previous) return dots;
  if (action.type === "next-day" || action.type === "visit-location") return [];
  if (action.type === "feature-action") return previous.journal === next.journal ? dots : freshWords(previous.journal, next.journal);
  if (action.type !== "deliver") return dots;
  const served = (state: GameState) =>
    state.customers.find((entry) => entry.table === action.table)?.phase;
  if (served(previous) !== "ordered" || served(next) !== "checkout") return dots;
  return freshWords(previous.journal, next.journal);
}
