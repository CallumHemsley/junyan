import type { WorldRenderObject } from '../render-contract';
import type { ActorPose } from './model';
import type { LifeState } from './interactions';
import { drawLifeActor, type ResidentDrawer } from './render';

export function lifeObjects(actors: readonly ActorPose[], state: LifeState, drawResident: ResidentDrawer): WorldRenderObject[] {
  return actors.map(actor => ({
    id: actor.id,
    position: actor.position,
    draw: (ctx, view) => drawLifeActor(ctx, actor, view, drawResident, state),
  }));
}
