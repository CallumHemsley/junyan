import type { Content, GameState } from "../contracts";
import { itemWordIds } from "../features/apartment/rules";
import { routineForDay } from "../features/cats/rules";
import { createNeighbourhood } from "../neighbourhood/model";
import type { NeighbourhoodAction } from "../neighbourhood/transitions";
import { canonicalWords, catalog, dueScore, progressionForDay, recordPractice, supportWords, type Scenario } from "./model";

export function availableScenarios(game: GameState): Scenario[] {
  const n = game.neighbourhood ?? createNeighbourhood(game.day);
  const p = progressionForDay(game);
  return catalog.scenarios.filter(s => {
    if (p.daily.completed.includes(s.id)) return false;
    switch (s.id) {
      case "cats.reunion": return n.cats.story.node !== "reunited";
      case "cats.sunny": case "cats.rainy": case "cats.route": {
        if (n.cats.story.node !== "reunited") return false;
        const r = n.cats.repeat;
        const kind = r.status === "active" ? r.encounter.kind : routineForDay(game.day);
        return s.id === `cats.${kind}` && (r.status === "active" || game.day > Math.max(n.cats.story.day, n.cats.lastCompletedDay ?? 0));
      }
      case "repairs.lamp": case "repairs.toy": return true;
      case "garden.water": return !n.garden.restored || Object.values(n.garden.plants).some(pot => pot.care === "dry");
      case "garden.observe": return n.garden.restored && Object.values(n.garden.plants).some(pot => pot.result && !pot.result.observed);
      case "apartment.place": return n.apartment.owned.some(id => id !== "bed" && !n.apartment.placements.some(p => p.id === id));
      default: return false;
    }
  });
}
export function recommendation(game: GameState, now: number, content: Content): Scenario | null {
  const p = progressionForDay(game);
  const ranked = availableScenarios(game).map((s, index) => ({
    s, score: dueScore(p, canonicalWords(s.targets, content), game.day, now, s.id) + (p.lastContext?.split(".")[0] !== s.location ? 2 : 0),
    tie: (index + game.day + game.seed) % catalog.scenarios.length,
  })).sort((a, b) => b.score - a.score || a.tie - b.tie);
  return ranked[0]?.s ?? null;
}

export function practiceForTransition(before: GameState, action: NeighbourhoodAction, after: GameState, content: Content): GameState["progression"] {
  if (action.type !== "feature-action" || before.neighbourhood === after.neighbourhood || !before.neighbourhood || !after.neighbourhood) return before.progression;
  const b = before.neighbourhood, a = after.neighbourhood;
  let context: string | null = null;
  let targets: string[] = [];
  let mistake = false;
  switch (action.feature) {
    case "cats":
      if (b.cats.story.node !== "reunited" && a.cats.story.node === "reunited") context = "cats.reunion";
      if (b.cats.repeat.status === "active" && a.cats.repeat.status === "complete") context = `cats.${b.cats.repeat.encounter.kind}`;
      mistake = ["wrong-cat", "gentle"].includes(a.cats.feedback);
      targets = catalog.scenarios.filter(s => s.location === "cats").flatMap(s => s.targets);
      break;
    case "repairs":
      if (action.action.type === "return" && b.repairs.jobs[action.action.job] && !a.repairs.jobs[action.action.job]) context = `repairs.${action.action.job}`;
      targets = catalog.scenarios.find(s => s.id === `repairs.${action.action.job}`)!.targets;
      mistake = ["power-first", "close-first", "open-first", "lamp-unstable", "toy-still"].includes(a.repairs.feedback);
      break;
    case "garden":
      if (action.action.type === "water" && b.garden.plants[action.action.plant].care === "dry" && a.garden.plants[action.action.plant].care === "ready") context = "garden.water";
      if (action.action.type === "observe" && !b.garden.plants[action.action.plant].result?.observed && a.garden.plants[action.action.plant].result?.observed) {
        context = "garden.observe";
        if (a.garden.plants[action.action.plant].result?.outcome !== "grew") context = null;
      }
      mistake = action.action.type === "water-extra";
      targets = ["garden.dry", "garden.pour", "garden.water"];
      break;
    case "apartment": {
      const id = b.apartment.selected;
      if (action.action.type === "place" && id && !b.apartment.placements.some(p => p.id === id) && a.apartment.placements.some(p => p.id === id)) {
        context = "apartment.place";
        targets = ["apartment.put", "apartment.here", ...itemWordIds[id]];
      }
      break;
    }
  }
  if (mistake) return supportWords(before, canonicalWords(targets, content));
  if (!context) return before.progression;
  const practiced = canonicalWords(action.feature === "apartment" ? targets : catalog.scenarios.find(s => s.id === context)!.targets, content);
  // These authored routines guide the next action. Completion is exposure, not an independent recall test.
  return recordPractice({ ...before, progression: supportWords(before, practiced) }, context, practiced, action.now);
}
