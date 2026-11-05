import { z } from 'zod';

export const targets = ['white', 'black', 'bicycle', 'bench', 'door', 'window', 'aunt'] as const;
export type Target = typeof targets[number];
const daySchema = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const storySchema = z.discriminatedUnion('node', [
  z.strictObject({ node: z.enum(['search', 'crouched', 'emerged', 'invited', 'doorway']) }),
  z.strictObject({ node: z.literal('reunited'), day: daySchema }),
]);
const kinds = ['sunny', 'rainy', 'route'] as const;
export type EncounterKind = typeof kinds[number];
const activeSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('sunny'), day: daySchema, step: z.enum(['notice', 'greet', 'sit']) }),
  z.strictObject({ kind: z.literal('rainy'), day: daySchema, step: z.enum(['bicycle', 'find', 'wait']) }),
  z.strictObject({ kind: z.literal('route'), day: daySchema, step: z.enum(['notice', 'follow', 'invite']) }),
]);
const feedbacks = ['clue', 'bicycle-clue', 'wrong-cat', 'gentle', 'crouched', 'space', 'emerged', 'invited', 'doorway', 'reunion', 'black-greeting', 'black-sitting', 'black-clue', 'sunny', 'rainy', 'empty-bicycle', 'rain-found', 'route', 'window-found', 'visit-complete', 'return', 'later', 'white-sitting'] as const;
const stateSchema = z.strictObject({
  version: z.literal(1), story: storySchema,
  selected: z.enum(targets).nullable(),
  cats: z.strictObject({
    white: z.strictObject({ noticed: z.boolean(), calm: z.boolean(), gaveSpace: z.boolean(), rested: z.boolean(), sawEmptyBicycle: z.boolean() }),
    black: z.strictObject({ greeted: z.boolean(), satTogether: z.boolean() }),
  }),
  repeat: z.discriminatedUnion('status', [
    z.strictObject({ status: z.literal('idle') }),
    z.strictObject({ status: z.literal('active'), encounter: activeSchema }),
    z.strictObject({ status: z.literal('complete'), day: daySchema, finishedDay: daySchema, kind: z.enum(kinds) }),
  ]),
  completedKinds: z.array(z.enum(kinds)).max(3),
  lastCompletedDay: daySchema.nullable(),
  feedback: z.enum(feedbacks),
}).superRefine((state, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
  const progressed = !['search', 'crouched'].includes(state.story.node);
  if (progressed && (!state.cats.white.noticed || !state.cats.white.calm)) issue('Story requires an observed calm cat');
  if (state.story.node === 'crouched' && !state.cats.white.noticed) issue('Crouching requires finding the cat');
  if (state.cats.white.calm && !state.cats.white.noticed) issue('Calm requires an observed cat');
  if (state.cats.white.gaveSpace && (!state.cats.white.noticed || !state.cats.white.calm)) issue('Giving space requires a calm observed cat');
  if (state.cats.white.sawEmptyBicycle && state.story.node !== 'reunited') issue('Empty bicycle belongs to later rain visits');
  if (state.cats.white.sawEmptyBicycle && !state.completedKinds.includes('rainy') && !(state.repeat.status === 'active' && state.repeat.encounter.kind === 'rainy')) issue('Empty bicycle needs rain encounter evidence');
  if (state.cats.white.rested && state.story.node !== 'reunited') issue('Resting follows reunion');
  if (state.cats.black.satTogether && !state.cats.black.greeted) issue('Sitting requires greeting');
  if (new Set(state.completedKinds).size !== state.completedKinds.length) issue('Duplicate encounter evidence');
  if ((state.lastCompletedDay === null) !== (state.completedKinds.length === 0)) issue('Completion evidence must agree');
  if (state.story.node !== 'reunited') {
    if (state.repeat.status !== 'idle' || state.lastCompletedDay !== null) issue('Repeats require reunion');
    return;
  }
  if (state.lastCompletedDay !== null && state.lastCompletedDay <= state.story.day) issue('Repeat must follow reunion day');
  if (state.repeat.status === 'idle' && state.lastCompletedDay !== null) issue('Completed repeat cannot be idle');
  if (state.repeat.status === 'active') {
    const encounter = state.repeat.encounter;
    if (encounter.day <= Math.max(state.story.day, state.lastCompletedDay ?? 0) || encounter.kind !== routineForDay(encounter.day)) issue('Invalid anchored encounter');
  }
  if (state.repeat.status === 'complete') {
    if (state.repeat.finishedDay < state.repeat.day) issue('Completion cannot precede the encounter');
    if (state.repeat.day !== state.lastCompletedDay || !state.completedKinds.includes(state.repeat.kind) || state.repeat.kind !== routineForDay(state.repeat.day)) issue('Invalid completion');
  }
});
export type State = z.infer<typeof stateSchema>;
export type Action =
  | { type: 'select'; target: Target }
  | { type: 'crouch' | 'wait' | 'space' | 'approach' | 'follow' | 'reunite' | 'greet' | 'sit' | 'begin' };
export type Choice = { action: Action; label: string };
export function initialState(): State {
  return { version: 1, story: { node: 'search' }, selected: null,
    cats: { white: { noticed: false, calm: false, gaveSpace: false, rested: false, sawEmptyBicycle: false }, black: { greeted: false, satTogether: false } },
    repeat: { status: 'idle' }, completedKinds: [], lastCompletedDay: null, feedback: 'clue' };
}
export function validate(value: unknown): State | null {
  const result = stateSchema.safeParse(value);
  return result.success ? result.data : null;
}
export function routineForDay(day: number): EncounterKind {
  return kinds[(day - 1) % kinds.length];
}
export function gifts(state: State): string[] {
  return state.story.node === 'reunited' ? ['cats.cushion'] : [];
}
export function reduce(state: State, action: Action, day: number): State {
  if (!daySchema.safeParse(day).success) return state;
  if (action.type === 'select') {
    if (!targets.includes(action.target)) return state;
    let next: State = { ...state, selected: action.target };
    if (action.target === 'white') next = { ...next, cats: { ...state.cats, white: { ...state.cats.white, noticed: true } } };
    if (state.repeat.status === 'active') {
      const e = state.repeat.encounter;
      if (e.kind === 'sunny' && e.step === 'notice' && action.target === 'black')
        return { ...next, repeat: { status: 'active', encounter: { ...e, step: 'greet' } }, feedback: 'black-clue' };
      if (e.kind === 'rainy' && action.target === 'bicycle')
        return { ...next, cats: { ...next.cats, white: { ...next.cats.white, sawEmptyBicycle: true } }, repeat: { status: 'active', encounter: { ...e, step: e.step === 'wait' ? 'wait' : 'find' } }, feedback: 'empty-bicycle' };
      if (e.kind === 'rainy' && (action.target === 'white' || action.target === 'door'))
        return { ...next, repeat: { status: 'active', encounter: { ...e, step: 'wait' } }, feedback: 'rain-found' };
      if (e.kind === 'route' && e.step === 'notice' && action.target === 'white')
        return { ...next, repeat: { status: 'active', encounter: { ...e, step: 'follow' } }, feedback: 'route' };
      return { ...next, feedback: e.kind === 'rainy' && action.target === 'bicycle' ? 'empty-bicycle' : e.kind };
    }
    const feedback: Record<Target, State['feedback']> = {
      white: state.story.node === 'reunited' ? 'return' : ['emerged', 'invited', 'doorway'].includes(state.story.node) ? 'emerged' : 'bicycle-clue',
      black: state.story.node === 'reunited' ? 'black-clue' : 'wrong-cat',
      bicycle: state.story.node === 'reunited' ? 'return' : 'bicycle-clue', bench: 'black-clue',
      door: 'doorway', window: 'window-found', aunt: state.story.node === 'reunited' ? 'reunion' : 'clue',
    };
    return { ...next, feedback: feedback[action.target] };
  }
  if (action.type === 'begin') {
    if (state.story.node !== 'reunited' || state.repeat.status === 'active') return state;
    if (day <= Math.max(state.story.day, state.lastCompletedDay ?? 0)) return { ...state, feedback: 'later' };
    const kind = routineForDay(day);
    const encounter = kind === 'rainy' ? { kind, day, step: 'bicycle' as const }
      : kind === 'sunny' ? { kind, day, step: 'notice' as const } : { kind, day, step: 'notice' as const };
    return { ...state, selected: null, repeat: { status: 'active', encounter }, feedback: kind };
  }
  if (state.repeat.status === 'active') {
    const e = state.repeat.encounter;
    const finish = (next = state): State => ({ ...next, repeat: { status: 'complete', day: e.day, finishedDay: Math.max(day, e.day), kind: e.kind },
      completedKinds: state.completedKinds.includes(e.kind) ? state.completedKinds : [...state.completedKinds, e.kind],
      lastCompletedDay: e.day, feedback: 'visit-complete' });
    if (e.kind === 'sunny' && e.step === 'greet' && state.selected === 'black' && action.type === 'greet')
      return { ...state, cats: { ...state.cats, black: { ...state.cats.black, greeted: true } }, repeat: { status: 'active', encounter: { ...e, step: 'sit' } }, feedback: 'black-greeting' };
    if (e.kind === 'sunny' && e.step === 'sit' && state.selected === 'black' && action.type === 'sit')
      return finish({ ...state, cats: { ...state.cats, black: { greeted: true, satTogether: true } } });
    if (e.kind === 'rainy' && e.step === 'wait' && (state.selected === 'white' || state.selected === 'door') && action.type === 'wait') return finish();
    if (e.kind === 'rainy' && e.step === 'wait' && (state.selected === 'white' || state.selected === 'door') && action.type === 'space')
      return { ...state, cats: { ...state.cats, white: { ...state.cats.white, gaveSpace: true } }, feedback: 'space' };
    if (e.kind === 'route' && e.step === 'follow' && state.selected === 'white' && action.type === 'follow')
      return { ...state, repeat: { status: 'active', encounter: { ...e, step: 'invite' } }, feedback: 'window-found' };
    if (e.kind === 'route' && e.step === 'invite' && (state.selected === 'white' || state.selected === 'window') && action.type === 'approach')
      return finish({ ...state, cats: { ...state.cats, white: { ...state.cats.white, rested: true } } });
    if (action.type === 'space' || action.type === 'approach') return { ...state, feedback: 'gentle' };
    return state;
  }
  if (state.selected === 'black' && action.type === 'greet')
    return { ...state, cats: { ...state.cats, black: { ...state.cats.black, greeted: true } }, feedback: 'black-greeting' };
  if (state.selected === 'black' && action.type === 'sit' && state.cats.black.greeted)
    return { ...state, cats: { ...state.cats, black: { greeted: true, satTogether: true } }, feedback: 'black-sitting' };
  if (action.type === 'reunite' && state.story.node === 'doorway')
    return { ...state, story: { node: 'reunited', day }, selected: 'aunt', feedback: 'reunion' };
  if (action.type === 'follow' && state.story.node === 'invited')
    return { ...state, story: { node: 'doorway' }, selected: 'door', feedback: 'doorway' };
  if (state.selected !== 'white') return state;
  if (action.type === 'space') return { ...state, cats: { ...state.cats, white: { ...state.cats.white, noticed: true, calm: true, gaveSpace: true } }, feedback: 'space' };
  if (state.story.node === 'reunited' && (action.type === 'wait' || action.type === 'approach'))
    return { ...state, cats: { ...state.cats, white: { ...state.cats.white, rested: true } }, feedback: 'white-sitting' };
  if (action.type === 'crouch' && state.story.node === 'search') return { ...state, story: { node: 'crouched' }, feedback: 'crouched' };
  if (action.type === 'wait' && state.story.node === 'crouched')
    return { ...state, cats: { ...state.cats, white: { ...state.cats.white, noticed: true, calm: true } }, story: { node: 'emerged' }, feedback: 'emerged' };
  if (action.type === 'approach' && state.story.node === 'emerged') return { ...state, story: { node: 'invited' }, feedback: 'invited' };
  if (action.type === 'approach' && ['search', 'crouched'].includes(state.story.node)) return { ...state, feedback: 'gentle' };
  return state;
}
export function choices(state: State): Choice[] {
  const choice = (type: Exclude<Action['type'], 'select'>, label: string = type): Choice => ({ action: { type }, label: `action-${label}` });
  if (state.repeat.status === 'active') {
    const e = state.repeat.encounter;
    if (e.kind === 'sunny' && e.step === 'greet' && state.selected === 'black') return [choice('greet')];
    if (e.kind === 'sunny' && e.step === 'sit' && state.selected === 'black') return [choice('sit')];
    if (e.kind === 'rainy' && e.step === 'wait' && (state.selected === 'white' || state.selected === 'door')) return [choice('wait'), choice('space')];
    if (e.kind === 'route' && e.step === 'follow' && state.selected === 'white') return [choice('follow')];
    if (e.kind === 'route' && e.step === 'invite' && (state.selected === 'white' || state.selected === 'window')) return [choice('approach')];
    return [];
  }
  const result: Choice[] = [];
  if (state.selected === 'black') {
    result.push(choice('greet'));
    if (state.cats.black.greeted) result.push(choice('sit'));
  }
  if (state.selected === 'white') {
    if (state.story.node === 'search') result.push(choice('crouch'), choice('space'), choice('approach'));
    if (state.story.node === 'crouched') result.push(choice('wait'), choice('space'), choice('approach'));
    if (state.story.node === 'emerged') result.push(choice('approach'));
    if (state.story.node === 'reunited') result.push(choice('wait'), choice('approach'), choice('space'));
  }
  if (state.story.node === 'invited') result.push(choice('follow'));
  if (state.story.node === 'doorway') result.push(choice('reunite', 'call'));
  if (state.story.node === 'reunited') result.push(choice('begin'));
  return result;
}
export function recoveredWords(state: State): string[] {
  const ids = new Set<string>();
  const add = (...keys: string[]) => keys.forEach(key => ids.add(({ 'thanks': 'thank-you', 'hello': 'cats.hello' } as Record<string, string>)[key] ?? `cats.${key}`));
  if (state.cats.white.noticed) add('white-name', 'white', 'cat', 'bicycle', 'under', 'at');
  if (state.cats.white.gaveSpace) add('back', 'quiet');
  if (state.story.node === 'crouched' || !['search'].includes(state.story.node)) add('crouch');
  if (!['search', 'crouched'].includes(state.story.node)) add('wait', 'emerge');
  if (['doorway', 'reunited'].includes(state.story.node)) add('follow', 'walk', 'door');
  if (state.story.node === 'reunited') add('found', 'thanks', 'cushion', 'give');
  if (state.cats.black.greeted) add('black-name', 'black', 'hello', 'bench', 'beside');
  if (state.cats.black.satTogether) add('sit', 'together');
  if (state.completedKinds.includes('rainy')) add('rain');
  if (state.cats.white.sawEmptyBicycle) add('empty');
  if (state.completedKinds.includes('sunny')) add('sun');
  if (state.completedKinds.includes('route')) add('window', 'go', 'friend');
  return [...ids];
}
export function recoveryForTransition(before: State, after: State): string[] {
  const known = new Set(recoveredWords(before));
  return recoveredWords(after).filter(id => !known.has(id));
}
export function sceneFacts(state: State, day: number) {
  const routine = state.repeat.status === 'active' ? state.repeat.encounter.kind
    : state.story.node === 'reunited' ? routineForDay(Math.max(1, day)) : 'sunny';
  const routeAtWindow = state.repeat.status === 'active' && state.repeat.encounter.kind === 'route' && state.repeat.encounter.step === 'invite'
    || state.repeat.status === 'complete' && state.repeat.kind === 'route' && state.repeat.finishedDay === day;
  const white = routeAtWindow ? 'window' : state.story.node === 'doorway' || state.story.node === 'reunited' && (routine === 'rainy' || state.repeat.status === 'idle' && day === state.story.day) ? 'door'

    : state.story.node === 'invited' ? 'path' : ['emerged', 'reunited'].includes(state.story.node) ? 'open' : 'bicycle';
  return { routine, white, crouched: state.story.node === 'crouched', close: !['search', 'crouched'].includes(state.story.node) };
}
