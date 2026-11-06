import { z } from 'zod';

export const itemIds = ['bed', 'table', 'chair', 'rug', 'cushion', 'repairs.stool', 'garden.planter', 'cats.cushion', 'vase', 'basket', 'lamp', 'blue-vase', 'large-basket', 'small-lamp'] as const;
export type ItemId = typeof itemIds[number];
export type Rotation = 0 | 1;
export type Placement = { id: ItemId; x: number; y: number; rotation: Rotation };
const item = z.enum(itemIds);
const placement = z.strictObject({ id: item, x: z.number().int(), y: z.number().int(), rotation: z.union([z.literal(0), z.literal(1)]) });
const snapshot = z.strictObject({ placements: z.array(placement), colour: z.enum(['blue', 'cream']), rugSize: z.enum(['small', 'large']) });
const schema = snapshot.extend({
  owned: z.array(item), starterClaimed: z.boolean(), lastGiftDay: z.number().int().min(0),
  selected: item.nullable(), draft: z.strictObject({ x: z.number().int(), y: z.number().int(), rotation: z.union([z.literal(0), z.literal(1)]) }).nullable(),
  undo: snapshot.nullable(), notice: z.enum(['welcome', 'window', 'left', 'right', 'large', 'rotate', 'okay', 'blocked', 'stored', 'gift', 'colour']),
});
export type State = z.infer<typeof schema>;
export type Action =
  | { type: 'accept-starter' }
  | { type: 'select'; id: ItemId }
  | { type: 'preview'; x: number; y: number }
  | { type: 'place'; x?: number; y?: number }
  | { type: 'rotate' } | { type: 'cancel' } | { type: 'store' } | { type: 'undo' }
  | { type: 'choose-colour'; colour: 'blue' | 'cream' }
  | { type: 'choose-rug'; size: 'small' | 'large' }
  | { type: 'claim-gift' }
  | { type: 'receive-gift'; giftId: 'repairs.stool' | 'garden.planter' | 'cats.cushion' };

export const dailyFinds = ['vase', 'basket', 'lamp'] as const;
export function initialState(): State {
  return { owned: ['bed'], placements: [{ id: 'bed', x: 0, y: 0, rotation: 0 }], colour: 'blue', rugSize: 'small', starterClaimed: false, lastGiftDay: 0, selected: null, draft: null, undo: null, notice: 'welcome' };
}
export function footprint(id: ItemId, rotation: Rotation, rugSize: State['rugSize']): [number, number] {
  const size: [number, number] = id === 'bed' ? [2, 2] : id === 'table' ? [2, 1] : id === 'rug' ? (rugSize === 'large' ? [2, 2] : [1, 2]) : [1, 1];
  return rotation === 1 ? [size[1], size[0]] : size;
}
export function cells(p: Placement, rugSize: State['rugSize']) {
  const [width, height] = footprint(p.id, p.rotation, rugSize);
  return Array.from({ length: width * height }, (_, i) => ({ x: p.x + i % width, y: p.y + Math.floor(i / width) }));
}
export function protectedCell(x: number, y: number) { return y === 4 || x === 5; }
export function legal(state: Pick<State, 'placements' | 'rugSize'>, p: Placement): boolean {
  const occupied = new Set(state.placements.filter(other => other.id !== p.id && (other.id === 'rug') === (p.id === 'rug')).flatMap(other => cells(other, state.rugSize).map(c => `${c.x},${c.y}`)));
  return cells(p, state.rugSize).every(c => c.x >= 0 && c.x < 6 && c.y >= 0 && c.y < 5 && !protectedCell(c.x, c.y) && !occupied.has(`${c.x},${c.y}`));
}
function remember(state: State): State['undo'] { return { placements: state.placements.map(p => ({ ...p })), colour: state.colour, rugSize: state.rugSize }; }
function unique(values: readonly unknown[]) { return new Set(values).size === values.length; }
function validSnapshot(value: z.infer<typeof snapshot>, owned: ItemId[]) {
  return unique(value.placements.map(p => p.id)) && value.placements.every(p => owned.includes(p.id) && legal(value, p)) && value.placements.some(p => p.id === 'bed' && p.x === 0 && p.y === 0 && p.rotation === 0);
}
export function validate(value: unknown): State | null {
  const result = schema.safeParse(value);
  if (!result.success) return null;
  const s = result.data;
  if (!unique(s.owned) || !s.owned.includes('bed') || !validSnapshot(s, s.owned) || (s.undo && !validSnapshot(s.undo, s.owned))) return null;
  const starter = ['table', 'chair', 'rug', 'cushion'] as const;
  if (s.starterClaimed ? !starter.every(id => s.owned.includes(id)) : starter.some(id => s.owned.includes(id))) return null;
  if ((s.lastGiftDay === 0) !== !dailyFinds.some(id => s.owned.includes(id))) return null;
  if (s.selected && (s.selected === 'bed' || !s.owned.includes(s.selected))) return null;
  if (Boolean(s.draft) !== Boolean(s.selected)) return null;
  if (s.draft && (s.draft.x < 0 || s.draft.x >= 6 || s.draft.y < 0 || s.draft.y >= 5)) return null;
  return s;
}
export function gifts(state: State): string[] { return state.owned.filter(id => id.includes('.')); }
export function reduce(state: State, action: Action, day: number): State {
  switch (action.type) {
    case 'accept-starter': return state.starterClaimed ? state : { ...state, starterClaimed: true, owned: [...state.owned, 'table', 'chair', 'rug', 'cushion'], notice: 'window' };
    case 'select': {
      if (action.id === 'bed' || !state.owned.includes(action.id)) return state;
      const p = state.placements.find(p => p.id === action.id);
      return { ...state, selected: action.id, draft: p ? { x: p.x, y: p.y, rotation: p.rotation } : { x: 2, y: 1, rotation: 0 }, notice: action.id === 'table' ? 'window' : action.id === 'chair' ? 'left' : 'okay' };
    }
    case 'preview': {
      if (!state.draft || !Number.isInteger(action.x) || !Number.isInteger(action.y) || action.x < 0 || action.x >= 6 || action.y < 0 || action.y >= 5) return state;
      const next = { ...state, draft: { ...state.draft, x: action.x, y: action.y } };
      return { ...next, notice: legal(next, { id: state.selected!, ...next.draft! }) ? 'okay' : 'blocked' };
    }
    case 'rotate': {
      if (!state.draft) return state;
      return { ...state, draft: { ...state.draft, rotation: state.draft.rotation === 0 ? 1 : 0 }, notice: 'rotate' };
    }
    case 'place': {
      if (!state.selected || !state.draft) return state;
      const p: Placement = { id: state.selected, ...state.draft, x: action.x ?? state.draft.x, y: action.y ?? state.draft.y };
      if (!Number.isInteger(p.x) || !Number.isInteger(p.y) || !legal(state, p)) return { ...state, notice: 'blocked' };
      const previous = state.placements.find(other => other.id === p.id);
      if (previous && previous.x === p.x && previous.y === p.y && previous.rotation === p.rotation) return { ...state, selected: null, draft: null, notice: 'okay' };
      const table = state.placements.find(p => p.id === 'table');
      const screenCentre = (p: Placement) => { const [w,h] = footprint(p.id,p.rotation,state.rugSize); return p.x + w/2 - p.y - h/2; };
      const difference = table ? screenCentre(p)-screenCentre(table) : 0;
      const notice = p.id === 'chair' && table && Math.abs(difference) > .5 ? (difference < 0 ? 'left' : 'right') : 'okay';
      return { ...state, placements: [...state.placements.filter(other => other.id !== p.id), p], selected: null, draft: null, undo: remember(state), notice };
    }
    case 'cancel': return { ...state, selected: null, draft: null, notice: 'okay' };
    case 'store': {
      if (!state.selected) return state;
      if (!state.placements.some(p => p.id === state.selected)) return { ...state, selected: null, draft: null, notice: 'stored' };
      return { ...state, placements: state.placements.filter(p => p.id !== state.selected), selected: null, draft: null, undo: remember(state), notice: 'stored' };
    }
    case 'undo': return state.undo ? { ...state, ...state.undo, undo: null, selected: null, draft: null, notice: 'okay' } : state;
    case 'choose-colour': return action.colour === state.colour || !state.owned.includes('cushion') ? state : { ...state, colour: action.colour, undo: remember(state), notice: 'colour' };
    case 'choose-rug': {
      if (!state.owned.includes('rug') || action.size === state.rugSize) return state;
      const next = { ...state, rugSize: action.size };
      const rug = state.placements.find(p => p.id === 'rug');
      return rug && !legal(next, rug) ? { ...state, notice: 'large' } : { ...next, undo: remember(state), notice: 'okay' };
    }
    case 'claim-gift': {
      if (!Number.isInteger(day) || day < 1 || state.lastGiftDay >= day) return state;
      const find = dailyFinds.find(id => !state.owned.includes(id));
      return find ? { ...state, owned: [...state.owned, find], lastGiftDay: day, notice: 'gift' } : state;
    }
    case 'receive-gift': return state.owned.includes(action.giftId) ? state : { ...state, owned: [...state.owned, action.giftId], notice: 'gift' };
  }
}

export const itemWordIds: Record<ItemId, string[]> = {
  bed: ['apartment.bed'], table: ['table'], chair: ['apartment.chair'], rug: ['apartment.rug'], cushion: ['apartment.cushion'],
  'repairs.stool': ['apartment.stool'], 'garden.planter': ['apartment.plant'], 'cats.cushion': ['apartment.cat', 'apartment.cushion'],
  vase: ['apartment.vase'], basket: ['apartment.basket'], lamp: ['apartment.lamp'],
  'blue-vase': ['apartment.blue', 'apartment.vase'], 'large-basket': ['apartment.large', 'apartment.basket'], 'small-lamp': ['apartment.small', 'apartment.lamp'],
};
export function recoveryForTransition(before: State, action: Action, after: State): string[] {
  if (action.type === 'accept-starter' && after.owned.length !== before.owned.length) return ['table', 'apartment.chair'];
  if (action.type === 'choose-colour' && before.colour !== after.colour) return [after.colour === 'blue' ? 'apartment.blue' : 'apartment.cream', 'apartment.cushion'];
  const changed = JSON.stringify(before.placements) !== JSON.stringify(after.placements);
  if (action.type === 'store' && changed) return ['apartment.store'];
  if (action.type === 'place' && changed && before.selected) return [...itemWordIds[before.selected], 'apartment.put', 'apartment.here'];
  return [];
}
