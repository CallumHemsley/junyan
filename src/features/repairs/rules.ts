import { z } from 'zod';

export type Job = 'lamp' | 'toy';
export type Part = 'bulb' | 'cover' | 'lead' | 'cell';
export type Lamp = { kind: 'lamp'; fitting: 'loose' | 'seated'; power: 'off' | 'on'; test: 'none' | 'unstable' | 'steady' };
export type Toy = { kind: 'toy'; cover: 'open' | 'closed'; lead: 'loose' | 'connected'; cell: 'old' | 'fresh'; test: 'none' | 'still' | 'moving' };
export const feedbackIds = ['lamp-intro', 'lamp-unstable', 'lamp-steady', 'power-first', 'lamp-tight', 'lamp-loose', 'toy-intro', 'toy-open', 'toy-closed', 'toy-connect', 'toy-disconnect', 'toy-cell', 'toy-old-cell', 'toy-still', 'toy-moving', 'open-first', 'close-first', 'lamp-returned', 'toy-returned'] as const;
export type Feedback = typeof feedbackIds[number];
export type State = { version: 1; bench: Lamp | Toy | null; selected: Part | null; completed: Job[]; feedback: Feedback };
export type Action =
  | { type: 'start'; job: Job }
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
  return { version: 1, bench: freshLamp(), selected: null, completed: [], feedback: 'lamp-intro' };
}
export function canReturn(bench: State['bench']): boolean {
  return bench?.kind === 'lamp' ? bench.test === 'steady' && bench.power === 'on' : bench?.test === 'moving';
}
export function reduce(state: State, action: Action, _day: number): State {
  if (action.type === 'start') {
    if (state.bench || !(['lamp', 'toy'] as const).includes(action.job)) return state;
    if (action.job === 'toy' && !state.completed.includes('lamp')) return state;
    return { ...state, bench: action.job === 'lamp' ? freshLamp() : freshToy(), selected: null, feedback: action.job === 'lamp' ? 'lamp-intro' : 'toy-intro' };
  }
  const bench = state.bench;
  if (!bench || action.job !== bench.kind) return state;
  if (action.type === 'select') {
    if (!visibleParts(bench).includes(action.part) || state.selected === action.part) return state;
    return { ...state, selected: action.part };
  }
  if (action.type === 'reset') return { ...state, bench: bench.kind === 'lamp' ? freshLamp() : freshToy(), selected: null, feedback: bench.kind === 'lamp' ? 'lamp-intro' : 'toy-intro' };
  if (action.type === 'return') {
    if (!canReturn(bench)) return state;
    return { ...state, bench: null, selected: null, completed: state.completed.includes(bench.kind) ? state.completed : [...state.completed, bench.kind], feedback: bench.kind === 'lamp' ? 'lamp-returned' : 'toy-returned' };
  }
  if (bench.kind === 'lamp') {
    if (action.type === 'power-off') {
      if (bench.power === 'off') return state;
      return { ...state, bench: { ...bench, power: 'off', test: 'none' }, feedback: 'lamp-intro' };
    }
    if (action.type === 'test') {
      const test = bench.fitting === 'seated' ? 'steady' : 'unstable';
      if (bench.test === test && bench.power === 'on') return state;
      return { ...state, bench: { ...bench, power: 'on', test }, feedback: test === 'steady' ? 'lamp-steady' : 'lamp-unstable' };
    }
    if (action.type !== 'turn' || state.selected !== 'bulb' || !['tighten', 'loosen'].includes(action.direction)) return state;
    if (bench.power === 'on') return state.feedback === 'power-first' ? state : { ...state, feedback: 'power-first' };
    const fitting = action.direction === 'tighten' ? 'seated' : 'loose';
    if (bench.fitting === fitting) return state;
    return { ...state, bench: { ...bench, fitting, test: 'none' }, feedback: fitting === 'seated' ? 'lamp-tight' : 'lamp-loose' };
  }
  if (action.type === 'test') {
    if (bench.cover === 'open') return state.feedback === 'close-first' ? state : { ...state, feedback: 'close-first' };
    const test = bench.lead === 'connected' && bench.cell === 'fresh' ? 'moving' : 'still';
    if (bench.test === test) return state;
    return { ...state, bench: { ...bench, test }, feedback: test === 'moving' ? 'toy-moving' : 'toy-still' };
  }
  if (action.type === 'cover') {
    if (state.selected !== 'cover' || !['open', 'closed'].includes(action.position) || bench.cover === action.position) return state;
    return { ...state, bench: { ...bench, cover: action.position, test: 'none' }, feedback: action.position === 'open' ? 'toy-open' : 'toy-closed' };
  }
  if (action.type === 'lead' && state.selected === 'lead' && ['loose', 'connected'].includes(action.position)) {
    if (bench.cover !== 'open') return state;
    if (bench.lead === action.position) return state;
    return { ...state, bench: { ...bench, lead: action.position, test: 'none' }, feedback: action.position === 'connected' ? 'toy-connect' : 'toy-disconnect' };
  }
  if (action.type === 'cell' && state.selected === 'cell' && ['old', 'fresh'].includes(action.condition)) {
    if (bench.cover !== 'open' || bench.cell === action.condition) return state;
    return { ...state, bench: { ...bench, cell: action.condition, test: 'none' }, feedback: action.condition === 'fresh' ? 'toy-cell' : 'toy-old-cell' };
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
const stateSchema = z.strictObject({ version: z.literal(1), bench: z.discriminatedUnion('kind', [lampSchema, toySchema]).nullable(), selected: z.enum(['bulb', 'cover', 'lead', 'cell']).nullable(), completed: z.array(z.enum(['lamp', 'toy'])).max(2), feedback: z.enum(feedbackIds) });
export function validate(value: unknown): State | null {
  const parsed = stateSchema.safeParse(value);
  if (!parsed.success) return null;
  const state = parsed.data, bench = state.bench;
  if (new Set(state.completed).size !== state.completed.length) return null;
  if (state.completed.includes('toy') && !state.completed.includes('lamp')) return null;
  if (bench?.kind === 'toy' && !state.completed.includes('lamp')) return null;
  if (state.selected && (!bench || !visibleParts(bench).includes(state.selected))) return null;
  if (bench?.kind === 'lamp') {
    if (bench.power === 'off' && bench.test !== 'none') return null;
    if (bench.power === 'on' && bench.test !== (bench.fitting === 'loose' ? 'unstable' : 'steady')) return null;
  }
  if (bench?.kind === 'toy' && bench.test !== 'none') {
    if (bench.cover !== 'closed') return null;
    if ((bench.test === 'moving') !== (bench.lead === 'connected' && bench.cell === 'fresh')) return null;
  }
  if (!bench && !state.completed.length) return null;
  return state;
}

export function recovered(before: State, action: Action, after: State): string[] {
  if (before === after || !before.bench || action.job !== before.bench.kind) return [];
  if (action.type === 'turn' && after.bench?.kind === 'lamp' && before.bench.kind === 'lamp' && before.bench.fitting !== after.bench.fitting) return ['repairs.bulb', action.direction === 'tighten' ? 'repairs.tighten' : 'repairs.loosen'];
  if (action.type === 'lead' && before.bench.kind === 'toy' && after.bench?.kind === 'toy' && before.bench.lead !== after.bench.lead) return ['repairs.wire', action.position === 'connected' ? 'repairs.connect' : 'repairs.disconnect'];
  if (action.type === 'cell' && before.bench.kind === 'toy' && after.bench?.kind === 'toy' && before.bench.cell !== after.bench.cell && action.condition === 'fresh') return ['repairs.battery', 'repairs.replace'];
  if (action.type === 'cover' && before.bench.kind === 'toy' && after.bench?.kind === 'toy' && before.bench.cover !== after.bench.cover) return [action.position === 'open' ? 'repairs.open' : 'repairs.close'];
  if (action.type === 'return' && after.bench === null) return ['good', 'le', before.bench.kind === 'lamp' ? 'repairs.lamp' : 'repairs.toy'];
  return [];
}
