import { z } from 'zod';
import { briefFor, briefIds, type BriefId } from './content';

export type ItemId = 'table' | 'chair';
export type Cell = { x: number; y: number };
export type Placement = Cell & { id: ItemId; rotation: 0 | 1 };
const coordinate = z.number().int().min(0).max(5);
const draftSchema = z.strictObject({ x: coordinate, y: z.number().int().min(0).max(4), rotation: z.union([z.literal(0), z.literal(1)]) });
const placementSchema = draftSchema.extend({ id: z.enum(['table', 'chair']) });
const usePoint = z.strictObject({ x: z.number().finite().min(0).max(1024), y: z.number().finite().min(0).max(1024) });
const usePath = z.array(usePoint).min(2).max(256);
const useSchema = z.strictObject({
  brief: z.enum(briefIds), startedAt: z.number().finite().nonnegative(), path: usePath,
  returnAt: z.number().finite().nonnegative().nullable(), returnPath: usePath.nullable(),
  pending: z.enum(['restart', ...briefIds]).nullable(),
});
const schema = z.strictObject({
  version: z.literal(1), brief: z.enum(briefIds), status: z.enum(['editing', 'complete']), completed: z.array(z.enum(briefIds)).max(2),
  layouts: z.strictObject({ window: z.array(placementSchema).max(2), alcove: z.array(placementSchema).max(2) }),
  completedLayouts: z.strictObject({ window: z.array(placementSchema).length(2).nullable(), alcove: z.array(placementSchema).length(2).nullable() }),
  selected: z.enum(['table', 'chair']).nullable(), draft: draftSchema.nullable(),
  retries: z.strictObject({ window: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), alcove: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) }),
  use: useSchema.nullable().default(null).catch(null),
  notice: z.enum(['window', 'left', 'rotate', 'okay', 'blocked']),
});
export type State = z.infer<typeof schema>;
export type Action =
  | { type: 'select'; id: ItemId } | { type: 'preview'; x: number; y: number }
  | { type: 'place' } | { type: 'rotate' } | { type: 'cancel' } | { type: 'check' } | { type: 'restart' }
  | { type: 'begin-brief'; brief: BriefId };
export function initialState(): State {
  return { version: 1, brief: 'window', status: 'editing', completed: [], layouts: { window: [], alcove: [] }, completedLayouts: { window: null, alcove: null }, selected: null, draft: null, retries: { window: 0, alcove: 0 }, notice: 'window', use: null };
}
export function footprint(p: Pick<Placement, 'id' | 'rotation'>): [number, number] { return p.id === 'chair' ? [1, 1] : p.rotation ? [1, 2] : [2, 1]; }
export function cells(p: Placement): Cell[] {
  const [width, height] = footprint(p);
  return Array.from({ length: width * height }, (_, i) => ({ x: p.x + i % width, y: p.y + Math.floor(i / width) }));
}
export function protectedCell(x: number, y: number) { return y === 4 || x === 5; }
export function legal(brief: BriefId, placements: readonly Placement[], candidate: Placement): boolean {
  if (!['table', 'chair'].includes(candidate.id) || ![0, 1].includes(candidate.rotation)) return false;
  const blocked = [...briefFor(brief).fixtures, ...placements.filter(p => p.id !== candidate.id).flatMap(cells)];
  return cells(candidate).every(c => Number.isInteger(c.x) && Number.isInteger(c.y) && c.x >= 0 && c.x < 6 && c.y >= 0 && c.y < 5 && !protectedCell(c.x, c.y) && !blocked.some(other => other.x === c.x && other.y === c.y));
}
export function unmetGoal(brief: BriefId, placements: readonly Placement[]): State['notice'] | null {
  const spec = briefFor(brief), table = placements.find(p => p.id === 'table'), chair = placements.find(p => p.id === 'chair');
  if (!table || table.y !== 0 || !cells(table).some(c => spec.windowColumns.includes(c.x))) return 'window';
  if (spec.requiresRotation && table.rotation !== 1) return 'rotate';
  if (!chair) return 'left';
  const [width, height] = footprint(table);
  const tableScreenX = table.x + width / 2 - table.y - height / 2;
  const chairScreenX = chair.x - chair.y;
  const adjacent = cells(table).some(c => Math.abs(c.x - chair.x) + Math.abs(c.y - chair.y) === 1);
  return adjacent && chairScreenX < tableScreenX - .5 ? null : 'left';
}
export function validate(value: unknown): State | null {
  const parsed = schema.safeParse(value);
  if (!parsed.success) return null;
  const s = parsed.data;
  if (s.completed.some((id, index) => id !== briefIds[index]) || (s.brief === 'alcove' && !s.completed.includes('window'))) return null;
  if ((s.selected === null) !== (s.draft === null) || (s.status === 'complete' && (s.selected || !s.completed.includes(s.brief) || unmetGoal(s.brief, s.layouts[s.brief])))) return null;
  if (s.use && (s.status !== 'complete' || s.use.brief !== s.brief || !s.completed.includes(s.use.brief) || ((s.use.returnAt === null) !== (s.use.returnPath === null)) || (s.use.returnAt !== null && s.use.pending === null) || (s.use.returnAt !== null && s.use.returnAt < s.use.startedAt))) s.use = null;
  for (const brief of briefIds) {
    const placements = s.layouts[brief];
    if (new Set(placements.map(p => p.id)).size !== placements.length || placements.some(p => !legal(brief, placements, p))) return null;
    const completed = s.completedLayouts[brief];
    if (s.completed.includes(brief) !== Boolean(completed)) return null;
    if (completed && (new Set(completed.map(p => p.id)).size !== completed.length || completed.some(p => !legal(brief, completed, p)) || unmetGoal(brief, completed))) return null;
  }
  if (!s.completed.includes('window') && s.layouts.alcove.length) return null;
  return s;
}
function retry(state: State, notice: State['notice']): State {
  return { ...state, notice, retries: { ...state.retries, [state.brief]: Math.min(Number.MAX_SAFE_INTEGER, state.retries[state.brief] + 1) } };
}
export function reduce(state: State, action: Action): State {
  if (state.use) return state; // Furniture stays frozen until the reader is safely home.
  switch (action.type) {
    case 'begin-brief':
      if (!briefIds.includes(action.brief) || (action.brief === 'alcove' && !state.completed.includes('window'))) return state;
      return { ...state, brief: action.brief, selected: null, draft: null, status: 'editing', notice: 'window' };
    case 'restart': return { ...state, layouts: { ...state.layouts, [state.brief]: [] }, selected: null, draft: null, status: 'editing', notice: 'window' };
    case 'select': {
      if (state.status === 'complete' || !['table', 'chair'].includes(action.id)) return state;
      const p = state.layouts[state.brief].find(p => p.id === action.id);
      return { ...state, selected: action.id, draft: p ? { x: p.x, y: p.y, rotation: p.rotation } : { x: action.id === 'table' ? 2 : 1, y: 2, rotation: 0 }, notice: action.id === 'table' ? 'window' : 'left' };
    }
    case 'preview': {
      if (!state.selected || !state.draft || !Number.isInteger(action.x) || !Number.isInteger(action.y) || action.x < 0 || action.x >= 6 || action.y < 0 || action.y >= 5) return state;
      const draft = { ...state.draft, x: action.x, y: action.y };
      return { ...state, draft, notice: legal(state.brief, state.layouts[state.brief], { id: state.selected, ...draft }) ? 'okay' : 'blocked' };
    }
    case 'rotate': return state.draft ? { ...state, draft: { ...state.draft, rotation: state.draft.rotation ? 0 : 1 }, notice: 'rotate' } : state;
    case 'cancel': return state.selected ? { ...state, selected: null, draft: null, notice: unmetGoal(state.brief, state.layouts[state.brief]) ?? 'okay' } : state;
    case 'place': {
      if (!state.selected || !state.draft || state.status === 'complete') return state;
      const p = { id: state.selected, ...state.draft };
      if (!legal(state.brief, state.layouts[state.brief], p)) return retry(state, 'blocked');
      return { ...state, layouts: { ...state.layouts, [state.brief]: [...state.layouts[state.brief].filter(other => other.id !== p.id), p] }, selected: null, draft: null, notice: 'okay' };
    }
    case 'check': {
      if (state.status === 'complete') return state;
      const goal = unmetGoal(state.brief, state.layouts[state.brief]);
      if (goal) return retry(state, goal);
      return { ...state, status: 'complete', completed: state.completed.includes(state.brief) ? state.completed : [...state.completed, state.brief], completedLayouts: { ...state.completedLayouts, [state.brief]: state.layouts[state.brief].map(p => ({ ...p })) }, selected: null, draft: null, notice: 'okay' };
    }
  }
}
export function recoveryForTransition(before: State, action: Action, after: State): string[] {
  if (action.type !== 'check' || before.status === 'complete' || after.status !== 'complete' || before.completed.includes(before.brief)) return [];
  return ['table', 'apartment.chair', 'apartment.put', 'apartment.at', 'apartment.window', 'apartment.beside', 'apartment.left', ...(before.brief === 'alcove' ? ['apartment.turn', 'apartment.once'] : [])];
}
