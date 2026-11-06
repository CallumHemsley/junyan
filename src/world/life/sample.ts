import type { Position } from '../../contracts';
import type { ActorPose, Facing, LifeContext, LifePlan } from './model';

function hash(text: string, seed: number): number {
  let value = seed >>> 0;
  for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619) >>> 0;
  return value / 4294967296;
}
function facing(from: Position, to: Position): Facing {
  const dx = to.x - from.x, dy = to.y - from.y;
  return Math.abs(dx) > Math.abs(dy) ? dx > 0 ? 'east' : 'west' : dy > 0 ? 'south' : 'north';
}
export function sampleLife(plan: LifePlan, context: LifeContext): ActorPose[] {
  if (!Number.isFinite(context.elapsedMs) || context.elapsedMs < 0 || !Number.isSafeInteger(context.day) || context.day < 1) return [];
  return plan.actors.flatMap(actor => {
    if (context.excludedCharacterIds?.includes(actor.characterId)) return [];
    if (actor.profile.kind === 'bird' && plan.mapId === 'rooftop' && !context.gardenMature) return [];
    const catWaiting = actor.characterId === 'white-cat' && context.cats?.story.node !== 'reunited';
    const time = (context.elapsedMs + hash(`${actor.id}:${context.day}`, context.seed) * actor.durationMs) % actor.durationMs;
    const phase = actor.phases.find(phase => time >= phase.startMs && time < phase.endMs) ?? actor.phases[0];
    const amount = catWaiting ? 0 : Math.max(0, Math.min(1, (time - phase.startMs) / (phase.endMs - phase.startMs)));
    const position = catWaiting ? actor.home : {
      x: phase.from.x + (phase.to.x - phase.from.x) * amount,
      y: phase.from.y + (phase.to.y - phase.from.y) * amount,
    };
    const nearby = Math.hypot(position.x - context.player.x, position.y - context.player.y) <= 1.6;
    const walking = !catWaiting && phase.action === 'walk';
    const activity = catWaiting ? 'sit' : walking ? 'walk' : nearby ? actor.profile.kind === 'bird' ? 'startle' : 'watch' : phase.action;
    return [{
      id: actor.id, characterId: actor.characterId, kind: actor.profile.kind, position,
      facing: nearby && !walking ? facing(position, context.player) : walking ? facing(phase.from, phase.to) : 'south',
      action: walking ? 'walk' : nearby && actor.profile.kind === 'resident' ? 'interact' : 'idle',
      activity, phaseMs: context.reducedMotion ? 0 : time - phase.startMs,
      greeting: actor.profile.greeting, radius: actor.profile.radius,
    } satisfies ActorPose];
  });
}
