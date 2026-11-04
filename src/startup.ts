import type { Content, GameState } from "./contracts";
import { createSession, type Session } from "./opening";

export type StartupRead = {
  checkpoint: GameState | null;
  saved: GameState | null;
  failed: boolean;
};

export function startSession(
  read: StartupRead,
  content: Content,
  seed: number,
  skipOpening = false,
): { session: Session; saveError: boolean } {
  const game = read.checkpoint ?? read.saved;
  if (game) return { session: { phase: "day", game }, saveError: read.failed };
  const start = read.failed || skipOpening ? "day" : "opening";
  return { session: createSession(content, seed, start), saveError: read.failed };
}
