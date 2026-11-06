import { content } from '../../content';
import type { ActorPose, LifeContext } from '../../world/life/model';
import { instruction } from './content';
import { unmetGoal, type State } from './rules';

const host = content.characters.find(character => character.id === 'lin-jie')!;

export function readingRoomHost(state: State, context: Pick<LifeContext, 'elapsedMs' | 'reducedMotion' | 'excludedCharacterIds'>): ActorPose[] {
  if (context.excludedCharacterIds?.includes(host.id) || !Number.isFinite(context.elapsedMs) || context.elapsedMs < 0) return [];
  const request = ['window', 'left', 'rotate', 'blocked'].includes(state.notice) ? state.notice : unmetGoal(state.brief, state.layouts[state.brief]) ?? 'window';
  return [{
    id: 'reading-room.host', characterId: host.id, kind: 'resident',
    // The protected aisle stays clear for every legal arrangement and replay draft.
    position: { x: 12.6, y: 6.5 }, facing: 'west',
    action: 'idle', activity: 'work', heldObject: 'book', radius: .22,
    phaseMs: context.reducedMotion ? 0 : context.elapsedMs % 6000,
    greeting: state.status === 'complete' ? host.thanks : instruction[request],
  }];
}
