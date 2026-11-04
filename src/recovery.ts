import type { GameState, JournalEntry } from "./contracts";
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
