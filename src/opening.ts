import { isNeighbourhoodAction, reduceNeighbourhoodGame, type NeighbourhoodAction } from "./neighbourhood/transitions";
import type { Action, Content, GameState } from "./contracts";
import { createGame, recordLookup, recoverWords, reduceGame } from "./game";

export type OpeningState = {
  seed: number;
  step: number;
  tray: string[];
  feedback: "none" | "wrong-food" | "thanks";
  reply: number | null;
  recovered: Record<string, number>;
  journal: GameState["journal"];
};
export type Session =
  | { phase: "opening"; opening: OpeningState }
  | { phase: "day"; game: GameState };
export type OpeningAction =
  | Extract<Action, { type: "pickup" | "return-food" | "deliver" | "lookup" }>
  | { type: "advance"; now: number }
  | { type: "reply"; option: number };
export type SessionAction = Action | OpeningAction | NeighbourhoodAction;

export const NEXT_BED = 1;

export function createOpening(content: Content, seed = 42): OpeningState {
  return {
    seed: Number.isFinite(seed) ? seed >>> 0 : 42,
    step: 0,
    tray: [],
    feedback: "none",
    reply: null,
    recovered: {},
    journal: {},
  };
}

export function createSession(
  content: Content,
  seed: number,
  start: Session["phase"],
): Session {
  return start === "opening"
    ? { phase: "opening", opening: createOpening(content, seed) }
    : { phase: "day", game: createGame(content, seed) };
}

function recover(
  state: OpeningState,
  wordIds: readonly string[],
): OpeningState["recovered"] {
  const fresh = wordIds.filter((id) => !Object.hasOwn(state.recovered, id));
  if (fresh.length === 0) return state.recovered;
  const recovered = { ...state.recovered };
  for (const id of fresh) recovered[id] = state.step;
  return recovered;
}

function validTime(now: number): boolean {
  return Number.isFinite(now) && now >= 0;
}

export function reduceOpening(
  state: OpeningState,
  action: OpeningAction,
  content: Content,
): OpeningState {
  if (action.type === "lookup") {
    const journal = recordLookup(state.journal, action, content);
    return journal === state.journal ? state : { ...state, journal };
  }
  if (action.type === "advance" && !validTime(action.now)) return state;
  const step = content.opening.steps[state.step];
  switch (step?.type) {
    case "say-en":
    case "say": {
      if (action.type !== "advance") return state;
      return {
        ...state,
        step: state.step + 1,
        recovered: step.type === "say" ? recover(state, step.recover) : state.recovered,
      };
    }
    case "request": {
      if (action.type === "advance")
        return state.feedback === "thanks"
          ? { ...state, step: state.step + 1, tray: [], feedback: "none" }
          : state;
      if (state.feedback === "thanks") return state;
      switch (action.type) {
        case "pickup":
          if (state.tray.length > 0 || !content.opening.tray.includes(action.foodId))
            return state;
          return { ...state, tray: [action.foodId], feedback: "none" };
        case "return-food":
          if (action.index !== 0 || state.tray.length === 0) return state;
          return { ...state, tray: [] };
        case "deliver":
          if (action.table !== NEXT_BED || state.tray.length === 0) return state;
          return state.tray[0] === step.want
            ? { ...state, tray: [], feedback: "thanks", recovered: recover(state, step.recover) }
            : { ...state, tray: [], feedback: "wrong-food" };
      }
      return state;
    }
    case "reply": {
      if (action.type === "advance")
        return state.reply === null
          ? state
          : { ...state, step: state.step + 1, reply: null };
      if (
        action.type !== "reply" ||
        state.reply !== null ||
        !Number.isInteger(action.option) ||
        action.option < 0 ||
        action.option >= step.options.length
      )
        return state;
      return {
        ...state,
        reply: action.option,
        recovered: recover(state, step.options[action.option].recover),
      };
    }
    default:
      return state;
  }
}

export function handoffJournal(
  opening: OpeningState,
  now: number,
): GameState["journal"] {
  return recoverWords(opening.journal, Object.keys(opening.recovered), now);
}

export function reduceSession(
  session: Session,
  action: SessionAction,
  content: Content,
): Session {
  if (isNeighbourhoodAction(action)) {
    if (session.phase !== "day") return session;
    const game = reduceNeighbourhoodGame(session.game, action, content);
    return game === session.game ? session : { phase: "day", game };
  }
  if (session.phase === "day") {
    if (action.type === "advance" || action.type === "reply") return session;
    const game = reduceGame(session.game, action, content);
    return game === session.game ? session : { phase: "day", game };
  }
  switch (action.type) {
    case "move":
    case "interact":
    case "pay":
    case "next-day":
      return session;
  }
  const { opening } = session;
  if (
    action.type === "advance" &&
    validTime(action.now) &&
    content.opening.steps[opening.step]?.type === "end"
  )
    return {
      phase: "day",
      game: {
        ...createGame(content, opening.seed),
        journal: handoffJournal(opening, action.now),
      },
    };
  const next = reduceOpening(opening, action, content);
  return next === opening ? session : { phase: "opening", opening: next };
}
