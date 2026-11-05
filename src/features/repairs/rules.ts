import { z } from 'zod';

export type Job = 'lamp' | 'toy';
export type Part = 'bulb' | 'cover' | 'lead' | 'cell';
export type Lamp = { kind: 'lamp'; fitting: 'loose' | 'seated'; power: 'off' | 'on'; test: 'none' | 'unstable' | 'steady' };
export type Toy = { kind: 'toy'; cover: 'open' | 'closed'; lead: 'loose' | 'connected'; cell: 'old' | 'fresh'; test: 'none' | 'still' | 'moving' };
export const feedbackIds = ['lamp-intro', 'lamp-unstable', 'lamp-steady', 'power-first', 'lamp-tight', 'lamp-loose', 'toy-intro', 'toy-open', 'toy-closed', 'toy-connect', 'toy-disconnect', 'toy-cell', 'toy-old-cell', 'toy-still', 'toy-moving', 'open-first', 'close-first', 'lamp-returned', 'toy-returned', 'all-complete', 'lamp-off'] as const;
export type Feedback = typeof feedbackIds[number];
export type State = { version: 1; jobs: { lamp: Lamp | null; toy: Toy | null }; active: Job; selected: Part | null; completed: Job[]; feedback: Feedback };
export type Action =
  | { type: 'start' | 'switch'; job: Job }
  | { type: 'select'; job: Job; part: Part }
  | { type: 'turn'; job: 'lamp'; direction: 'tighten' | 'loosen' }
  | { type: 'power-off'; job: 'lamp' }
  | { type: 'cover'; job: 'toy'; position: 'open' | 'closed' }
  | { type: 'lead'; job: 'toy'; position: 'loose' | 'connected' }
  | { type: 'cell'; job: 'toy'; condition: 'old' | 'fresh' }
  | { type: 'test' | 'return' | 'reset'; job: Job };

const freshLamp = (): Lamp => ({ kind: 'lamp', fitting: 'loose', power: 'off', test: 'none' });
const freshToy = (): Toy => ({ kind: 'toy', cover: 'closed', lead: 'loose', cell: 'old', test: 'none' });
export function initialState(): State {
  return { version: 1, jobs: { lamp: freshLamp(), toy: freshToy() }, active: 'lamp', selected: null, completed: [], feedback: 'lamp-intro' };
}
export function currentBench(state: State): Lamp | Toy | null {
  return state.jobs[state.active];
}
function update(state: State, bench: Lamp | Toy, feedback: Feedback): State {
  return { ...state, jobs: { ...state.jobs, [bench.kind]: bench }, feedback };
}
export function canReturn(bench: Lamp | Toy | null): boolean {
  return bench?.kind === 'lamp' ? bench.test === 'steady' && bench.power === 'on' : bench?.test === 'moving';
}
export function reduce(state: State, action: Action, _day: number): State {
  if (!(['lamp', 'toy'] as const).includes(action.job)) return state;
  if (action.type === 'switch') {
    if (state.active === action.job) return state;
    const bench = state.jobs[action.job];
    const feedback: Feedback = !bench ? (action.job === 'lamp' ? 'lamp-returned' : 'toy-returned') : bench.kind === 'lamp' ? (bench.test === 'steady' ? 'lamp-steady' : bench.test === 'unstable' ? 'lamp-unstable' : bench.fitting === 'seated' ? 'lamp-tight' : 'lamp-intro') : bench.test === 'moving' ? 'toy-moving' : bench.test === 'still' ? 'toy-still' : bench.cover === 'open' ? 'toy-open' : 'toy-closed';
    return { ...state, active: action.job, selected: null, feedback };
  }
  if (action.type === 'start') {
    if (state.jobs[action.job] !== null) return state;
    const bench = action.job === 'lamp' ? freshLamp() : freshToy();
    return { ...update(state, bench, action.job === 'lamp' ? 'lamp-intro' : 'toy-intro'), active: action.job, selected: null };
  }
  const bench = currentBench(state);
  if (!bench || action.job !== state.active) return state;
  if (action.type === 'select') {
    if (!visibleParts(bench).includes(action.part) || state.selected === action.part) return state;
    return { ...state, selected: action.part };
  }
  if (action.type === 'reset') return { ...update(state, bench.kind === 'lamp' ? freshLamp() : freshToy(), bench.kind === 'lamp' ? 'lamp-intro' : 'toy-intro'), selected: null };
  if (action.type === 'return') {
    if (!canReturn(bench)) return state;
    const completed = state.completed.includes(bench.kind) ? state.completed : [...state.completed, bench.kind];
    const firstGift = completed.length === 2 && state.completed.length < 2;
    return { ...state, jobs: { ...state.jobs, [bench.kind]: null }, selected: null, completed, feedback: firstGift ? 'all-complete' : bench.kind === 'lamp' ? 'lamp-returned' : 'toy-returned' };
  }
  if (bench.kind === 'lamp') {
    if (action.type === 'power-off') {
      if (bench.power === 'off') return state;
      return update(state, { ...bench, power: 'off', test: 'none' }, 'lamp-off');
    }
    if (action.type === 'test') {
      const test = bench.fitting === 'seated' ? 'steady' : 'unstable';
      if (bench.test === test && bench.power === 'on' && state.feedback === (test === 'steady' ? 'lamp-steady' : 'lamp-unstable')) return state;
      return update(state, { ...bench, power: 'on', test }, test === 'steady' ? 'lamp-steady' : 'lamp-unstable');
    }
    if (action.type !== 'turn' || state.selected !== 'bulb' || !['tighten', 'loosen'].includes(action.direction)) return state;
    if (bench.power === 'on') return state.feedback === 'power-first' ? state : { ...state, feedback: 'power-first' };
    const fitting = action.direction === 'tighten' ? 'seated' : 'loose';
    if (bench.fitting === fitting) return state;
    return update(state, { ...bench, fitting, test: 'none' }, fitting === 'seated' ? 'lamp-tight' : 'lamp-loose');
  }
  if (action.type === 'test') {
    if (bench.cover === 'open') return state.feedback === 'close-first' ? state : { ...state, feedback: 'close-first' };
    const test = bench.lead === 'connected' && bench.cell === 'fresh' ? 'moving' : 'still';
    if (bench.test === test && state.feedback === (test === 'moving' ? 'toy-moving' : 'toy-still')) return state;
    return update(state, { ...bench, test }, test === 'moving' ? 'toy-moving' : 'toy-still');
  }
  if (action.type === 'cover') {
    if (state.selected !== 'cover' || !['open', 'closed'].includes(action.position) || bench.cover === action.position) return state;
    return update(state, { ...bench, cover: action.position, test: 'none' }, action.position === 'open' ? 'toy-open' : 'toy-closed');
  }
  if (action.type === 'lead' && state.selected === 'lead' && ['loose', 'connected'].includes(action.position)) {
    if (bench.cover !== 'open') return state;
    if (bench.lead === action.position) return state;
    return update(state, { ...bench, lead: action.position, test: 'none' }, action.position === 'connected' ? 'toy-connect' : 'toy-disconnect');
  }
  if (action.type === 'cell' && state.selected === 'cell' && ['old', 'fresh'].includes(action.condition)) {
    if (bench.cover !== 'open' || bench.cell === action.condition) return state;
    return update(state, { ...bench, cell: action.condition, test: 'none' }, action.condition === 'fresh' ? 'toy-cell' : 'toy-old-cell');
  }
  return state;
}
export function visibleParts(bench: Lamp | Toy): Part[] {
  return bench.kind === 'lamp' ? ['bulb'] : bench.cover === 'open' ? ['cover', 'lead', 'cell'] : ['cover'];
}
export function gifts(state: State): string[] {
  return state.completed.includes('lamp') && state.completed.includes('toy') ? ['repairs.stool'] : [];
}

const lampSchema = z.strictObject({ kind: z.literal('lamp'), fitting: z.enum(['loose', 'seated']), power: z.enum(['off', 'on']), test: z.enum(['none', 'unstable', 'steady']) });
const toySchema = z.strictObject({ kind: z.literal('toy'), cover: z.enum(['open', 'closed']), lead: z.enum(['loose', 'connected']), cell: z.enum(['old', 'fresh']), test: z.enum(['none', 'still', 'moving']) });
const stateSchema = z.strictObject({ version: z.literal(1), jobs: z.strictObject({ lamp: lampSchema.nullable(), toy: toySchema.nullable() }), active: z.enum(['lamp', 'toy']), selected: z.enum(['bulb', 'cover', 'lead', 'cell']).nullable(), completed: z.array(z.enum(['lamp', 'toy'])).max(2), feedback: z.enum(feedbackIds) });
export function validate(value: unknown): State | null {
  const parsed = stateSchema.safeParse(value);
  if (!parsed.success) return null;
  const state = parsed.data, bench = currentBench(state);
  if (new Set(state.completed).size !== state.completed.length) return null;
  if (state.selected && (!bench || !visibleParts(bench).includes(state.selected))) return null;
  for (const job of ['lamp', 'toy'] as const) if (!state.jobs[job] && !state.completed.includes(job)) return null;
  const lamp = state.jobs.lamp, toy = state.jobs.toy;
  if (lamp) {
    if (lamp.power === 'off' && lamp.test !== 'none') return null;
    if (lamp.power === 'on' && lamp.test !== (lamp.fitting === 'loose' ? 'unstable' : 'steady')) return null;
  }
  if (toy && toy.test !== 'none') {
    if (toy.cover !== 'closed') return null;
    if ((toy.test === 'moving') !== (toy.lead === 'connected' && toy.cell === 'fresh')) return null;
  }
  if (!feedbackMatches(state)) return null;
  return state;
}

function feedbackMatches(state: State): boolean {
  const bench = currentBench(state);
  switch (state.feedback) {
    case 'all-complete': return !bench && state.completed.length === 2;
    case 'lamp-returned': return state.active === 'lamp' && !bench && state.completed.includes('lamp');
    case 'toy-returned': return state.active === 'toy' && !bench && state.completed.includes('toy');
    case 'lamp-intro': return bench?.kind === 'lamp' && bench.fitting === 'loose';
    case 'lamp-off': return bench?.kind === 'lamp' && bench.power === 'off';
    case 'lamp-tight': return bench?.kind === 'lamp' && bench.fitting === 'seated' && bench.power === 'off';
    case 'lamp-loose': return bench?.kind === 'lamp' && bench.fitting === 'loose' && bench.power === 'off';
    case 'lamp-unstable': return bench?.kind === 'lamp' && bench.test === 'unstable';
    case 'lamp-steady': return bench?.kind === 'lamp' && bench.test === 'steady';
    case 'power-first': return bench?.kind === 'lamp' && bench.power === 'on';
    case 'toy-intro': return bench?.kind === 'toy' && bench.lead === 'loose' && bench.cell === 'old' && bench.cover === 'closed';
    case 'toy-open': return bench?.kind === 'toy' && bench.cover === 'open';
    case 'toy-closed': return bench?.kind === 'toy' && bench.cover === 'closed' && bench.test === 'none';
    case 'toy-connect': return bench?.kind === 'toy' && bench.cover === 'open' && bench.lead === 'connected';
    case 'toy-disconnect': return bench?.kind === 'toy' && bench.cover === 'open' && bench.lead === 'loose';
    case 'toy-cell': return bench?.kind === 'toy' && bench.cover === 'open' && bench.cell === 'fresh';
    case 'toy-old-cell': return bench?.kind === 'toy' && bench.cover === 'open' && bench.cell === 'old';
    case 'toy-still': return bench?.kind === 'toy' && bench.test === 'still';
    case 'toy-moving': return bench?.kind === 'toy' && bench.test === 'moving';
    case 'open-first': return bench?.kind === 'toy' && bench.cover === 'closed';
    case 'close-first': return bench?.kind === 'toy' && bench.cover === 'open';
  }
}

export function recovered(before: State, action: Action, after: State): string[] {
  const previous = currentBench(before), next = currentBench(after);
  if (before === after || !previous || action.job !== before.active) return [];
  if (action.type === 'turn' && next?.kind === 'lamp' && previous.kind === 'lamp' && previous.fitting !== next.fitting) return ['repairs.bulb', action.direction === 'tighten' ? 'repairs.tighten' : 'repairs.loosen'];
  if (action.type === 'lead' && previous.kind === 'toy' && next?.kind === 'toy' && previous.lead !== next.lead) return ['repairs.wire', action.position === 'connected' ? 'repairs.connect' : 'repairs.disconnect'];
  if (action.type === 'cell' && previous.kind === 'toy' && next?.kind === 'toy' && previous.cell !== next.cell && action.condition === 'fresh') return ['repairs.battery', 'repairs.replace'];
  if (action.type === 'cover' && previous.kind === 'toy' && next?.kind === 'toy' && previous.cover !== next.cover) return [action.position === 'open' ? 'repairs.open' : 'repairs.close'];
  if (action.type === 'return' && next === null) return ['good', 'le', previous.kind === 'lamp' ? 'repairs.lamp' : 'repairs.toy'];
  return [];
}
