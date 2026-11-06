import { sampleActor } from '../characters';
import { drawActor } from '../characters/adapter';
import type { WorldRenderObject } from '../render-contract';
import type { ActorPose } from './model';
import type { LifeState } from './interactions';
import { drawLifeActor, type ResidentDrawer } from './render';

export const drawLifeResident: ResidentDrawer = (ctx, actor, view, posture) => {
  const sample = sampleActor({ characterId: actor.characterId, facing: actor.facing, yaw: actor.yaw,
    action: actor.action, elapsedMs: actor.phaseMs, reducedMotion: view.reducedMotion, posture });
  drawActor(ctx, view, sample, actor.position);
};

export function lifeObjects(actors: readonly ActorPose[], state: LifeState, drawResident: ResidentDrawer = drawLifeResident): WorldRenderObject[] {
  return actors.map(actor => ({
    id: actor.id,
    position: actor.position,
    draw: (ctx, view) => drawLifeActor(ctx, actor, view, drawResident, state),
  }));
}
