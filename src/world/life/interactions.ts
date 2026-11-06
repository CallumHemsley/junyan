import { z } from 'zod';
import { lineFor } from '../../features/cats/content';
import type { Line, Position } from '../../contracts';
import type { ActorPose, Affordance, LifeContext, LifeEvent, LifePlan, Navigation } from './model';

const id = z.string().min(1).max(200);
const discovery = z.strictObject({ mapId: id, landmarkId: id, day: z.number().int().positive().max(Number.MAX_SAFE_INTEGER) });
const reaction = z.strictObject({ mapId: id, targetId: id, reaction: z.enum(['wave', 'sit', 'watch', 'flutter', 'ripple', 'sway']), atMs: z.number().finite().nonnegative() });
export const lifeStateSchema = z.strictObject({
  version: z.literal(1),
  discoveries: z.array(discovery).max(10000),
  reactions: z.array(reaction).max(100),
}).superRefine((value, context) => {
  const keys = value.discoveries.map(item => JSON.stringify([item.mapId, item.landmarkId]));
  if (new Set(keys).size !== keys.length) context.addIssue({ code: 'custom', message: 'Duplicate discovery' });
});
export type LifeState = z.infer<typeof lifeStateSchema>;
export const initialLifeState = (): LifeState => ({ version: 1, discoveries: [], reactions: [] });
export function restoreLife(value: unknown): LifeState {
  const parsed = lifeStateSchema.safeParse(value);
  return parsed.success ? parsed.data : initialLifeState();
}
export function reduceLife(state: LifeState, event: LifeEvent): LifeState {
  if (event.type === 'discovered') {
    if (state.discoveries.some(item => item.mapId === event.mapId && item.landmarkId === event.landmarkId)) return state;
    const { mapId, landmarkId, day } = event;
    return { ...state, discoveries: [...state.discoveries, { mapId, landmarkId, day }] };
  }
  const { mapId, targetId, reaction, atMs } = event;
  if (state.reactions.some(item => item.mapId === mapId && item.targetId === targetId && item.reaction === reaction && item.atMs === atMs)) return state;
  return { ...state, reactions: [...state.reactions.filter(item => item.mapId !== mapId || item.targetId !== targetId), { mapId, targetId, reaction, atMs }].slice(-100) };
}
function visible(player: Position, target: Position, reach: number, navigation: Navigation): boolean {
  return Math.hypot(target.x - player.x, target.y - player.y) <= reach && navigation.canWalk(player, target, 0);
}
export function nearbyLife(plan: LifePlan, actors: readonly ActorPose[], player: Position, navigation: Navigation): Affordance[] {
  const options: Affordance[] = [];
  for (const actor of actors) {
    if (!visible(player, actor.position, 1.7, navigation)) continue;
    const kind = actor.greeting ? 'greet' : actor.kind === 'cat' ? 'sit' : 'watch';
    options.push({ id: `${actor.id}/${kind}`, targetId: actor.id, kind, position: actor.position,
      label: lineFor(kind === 'greet' ? 'action-greet' : kind === 'sit' ? 'action-sit' : 'action-look') });
  }
  for (const landmark of plan.landmarks) {
    if (!visible(player, landmark.position, 1.8, navigation)) continue;
    options.push({ id: `${landmark.id}/inspect`, targetId: landmark.id, kind: 'inspect', position: landmark.position, label: lineFor('action-look') });
  }
  return options.sort((a, b) => Math.hypot(a.position.x - player.x, a.position.y - player.y) - Math.hypot(b.position.x - player.x, b.position.y - player.y) || a.id.localeCompare(b.id));
}
export function interactLife(state: LifeState, plan: LifePlan, actors: readonly ActorPose[], context: LifeContext, actionId: string, navigation: Navigation): {
  state: LifeState; events: LifeEvent[]; line?: Line;
} {
  const option = nearbyLife(plan, actors, context.player, navigation).find(item => item.id === actionId);
  if (!option || !Number.isFinite(context.elapsedMs) || context.elapsedMs < 0 || !Number.isSafeInteger(context.day) || context.day < 1) return { state, events: [] };
  const events: LifeEvent[] = [];
  if (option.kind === 'inspect') {
    if (!state.discoveries.some(item => item.mapId === plan.mapId && item.landmarkId === option.targetId)) {
      events.push({ type: 'discovered', mapId: plan.mapId, landmarkId: option.targetId, day: context.day });
    }
    const landmark = plan.landmarks.find(item => item.id === option.targetId)!;
    const reaction = ['pond', 'water', 'fountain', 'river'].includes(landmark.kind) ? 'ripple'
      : ['windchime', 'tree', 'bamboo', 'flowers'].includes(landmark.kind) ? 'sway' : 'watch';
    events.push({ type: 'reacted', mapId: plan.mapId, targetId: option.targetId, reaction, atMs: context.elapsedMs });
  } else {
    const actor = actors.find(actor => actor.id === option.targetId)!;
    events.push({ type: 'reacted', mapId: plan.mapId, targetId: actor.id,
      reaction: option.kind === 'greet' ? 'wave' : option.kind === 'sit' ? 'sit' : actor.kind === 'bird' ? 'flutter' : 'watch', atMs: context.elapsedMs });
    return { state: events.reduce(reduceLife, state), events, line: actor.greeting };
  }
  return { state: events.reduce(reduceLife, state), events };
}
