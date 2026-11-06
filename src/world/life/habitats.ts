import type { Position } from '../../contracts';
import type { LifeContext } from './model';

type CourtyardHabitat = {
  white: Position & { relaxed: boolean };
  black: Position & { relaxed: boolean };
  aunt: Position;
};
export function courtyardHabitats(snapshot: CourtyardHabitat): NonNullable<LifeContext['habitats']> {
  return [
    { characterId: 'white-cat', position: { x: snapshot.white.x, y: snapshot.white.y }, activity: snapshot.white.relaxed ? 'sit' : 'idle' },
    { characterId: 'black-cat', position: { x: snapshot.black.x, y: snapshot.black.y }, activity: snapshot.black.relaxed ? 'sit' : 'idle' },
    { characterId: 'aunt', position: snapshot.aunt, activity: 'work' },
  ];
}
