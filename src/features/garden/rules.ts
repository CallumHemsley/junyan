import {z} from 'zod';

export const plantIds = ['flower', 'climber', 'tree'] as const;
export const siteIds = [0, 1, 2, 3, 4, 5] as const;
export type PlantId = typeof plantIds[number];
export type Site = typeof siteIds[number];
const site = z.union(siteIds.map(value => z.literal(value)));
const care = z.enum(['dry', 'ready', 'extra']);
const result = z.strictObject({
  before: z.number().int().min(0).max(3),
  after: z.number().int().min(0).max(3),
  outcome: z.enum(['grew', 'rested', 'drooped', 'shade']),
  observed: z.boolean(),
}).refine(value => value.after >= value.before && value.after - value.before <= 1);
const plant = z.strictObject({site, care, growth: z.number().int().min(0).max(3), drooping: z.boolean(), waited: z.boolean(), result: result.nullable()});
const dayValue = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const schema = z.strictObject({
  version: z.literal(1), day: dayValue.nullable(), restored: z.boolean(), shade: site,
  plants: z.strictObject({flower: plant, climber: plant, tree: plant}),
  planterEarned: z.boolean(),
}).superRefine((state, context) => {
  const plants = Object.values(state.plants);
  if (new Set(plants.map(value => value.site)).size !== 3) context.addIssue({code: 'custom', message: 'Pots must occupy different sites'});
  if (plants.some(value => value.result && value.result.after !== value.growth)) context.addIssue({code: 'custom', message: 'Daily comparison must match growth'});
  if (state.planterEarned !== plants.every(value => value.growth >= 1)) context.addIssue({code: 'custom', message: 'Planter eligibility must match earned growth'});
});
export type State = z.infer<typeof schema>;
export type Action =
  | {type: 'sync'} | {type: 'tidy'; value: boolean}
  | {type: 'water'; plant: PlantId} | {type: 'water-extra'; plant: PlantId}
  | {type: 'wait'; plant: PlantId} | {type: 'observe'; plant: PlantId}
  | {type: 'move'; plant: PlantId; site: Site} | {type: 'shade'; site: Site};

export function initialState(): State {
  const seed = (site: Site, care: State['plants']['flower']['care']): State['plants']['flower'] => ({site, care, growth: 0, drooping: false, waited: false, result: null});
  return {version: 1, day: null, restored: false, shade: 0,
    plants: {flower: seed(0, 'ready'), climber: seed(2, 'dry'), tree: seed(4, 'dry')}, planterEarned: false};
}
export function validate(value: unknown): State | null {
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
export function weather(day: number | null): 'rain' | 'hot' | 'clear' {
  return day !== null && day % 4 === 0 ? 'rain' : day !== null && day % 4 === 3 ? 'hot' : 'clear';
}
function synchronize(state: State, day: number): State {
  if (state.day === null) {
    const next = {...state, day};
    if (weather(day) !== 'rain') return next;
    return {...next, plants: Object.fromEntries(plantIds.map(id => [id, {...state.plants[id], care: state.plants[id].site !== state.shade ? 'ready' : state.plants[id].care}])) as State['plants']};
  }
  if (day <= state.day) return state;
  const next = structuredClone(state);
  next.day = day;
  if (!state.restored) return next;
  for (const id of plantIds) {
    const pot = next.plants[id];
    const old = state.plants[id];
    const needsShade = id === 'flower' && weather(state.day) === 'hot' && state.shade !== old.site;
    const outcome = old.care === 'extra' ? 'drooped' : old.care === 'ready' && needsShade ? 'shade' : old.care === 'ready' && old.growth < 3 ? 'grew' : 'rested';
    pot.growth = Math.min(3, old.growth + (outcome === 'grew' ? 1 : 0));
    pot.drooping = outcome === 'drooped';
    pot.care = weather(day) === 'rain' && pot.site !== next.shade ? 'ready' : 'dry';
    pot.waited = false;
    pot.result = {before: old.growth, after: pot.growth, outcome, observed: false};
  }
  next.planterEarned = next.planterEarned || plantIds.every(id => next.plants[id].growth >= 1);
  return next;
}

export function reduce(state: State, action: Action, day: number): State {
  if (!dayValue.safeParse(day).success || (state.day !== null && day < state.day)) return state;
  if (action.type === 'sync') return synchronize(state, day);
  if (state.day !== day) return state;
  if (action.type === 'tidy') return action.value === state.restored ? state : {...state, restored: action.value};
  if (!state.restored) return state;
  if (action.type === 'shade') return site.safeParse(action.site).success && action.site !== state.shade ? {...state, shade: action.site} : state;
  if (!('plant' in action) || !plantIds.includes(action.plant)) return state;
  const pot = state.plants[action.plant];
  let changed = pot;
  switch (action.type) {
    case 'water':
      if (pot.care === 'dry') changed = {...pot, care: 'ready', waited: false};
      break;
    case 'water-extra':
      if (pot.care === 'ready') changed = {...pot, care: 'extra', waited: false};
      break;
    case 'wait':
      if (pot.care !== 'extra' && !pot.waited) changed = {...pot, waited: true};
      break;
    case 'observe':
      if (pot.result && !pot.result.observed) changed = {...pot, result: {...pot.result, observed: true}};
      break;
    case 'move':
      if (site.safeParse(action.site).success && !plantIds.some(id => state.plants[id].site === action.site)) changed = {...pot, site: action.site};
      break;
  }
  return changed === pot ? state : {...state, plants: {...state.plants, [action.plant]: changed}};
}
export function gifts(state: State): string[] {
  return state.planterEarned ? ['garden.planter'] : [];
}

export function recoveryForTransition(before: State, after: State, action: Action): string[] {
  if (before === after) return [];
  if (action.type === 'move') return ['garden.put', 'garden.place'];
  if (action.type === 'shade') return ['garden.shade', 'garden.place'];
  if (action.type === 'water') return ['garden.dry', 'garden.water-verb', 'garden.little', 'garden.water'];
  if (action.type === 'wait') return before.plants[action.plant].care === 'ready' ? ['garden.soil', 'garden.wet', 'garden.first', 'dont'] : ['garden.wait'];
  if (action.type === 'observe') {
    const outcome = after.plants[action.plant].result?.outcome;
    return outcome === 'grew' ? ['garden.than', 'garden.yesterday', 'garden.tall'] : outcome === 'drooped' ? ['garden.too-much', 'tomorrow', 'again'] : outcome === 'shade' ? ['garden.flower', 'garden.shade', 'garden.place'] : [];
  }
  return [];
}
