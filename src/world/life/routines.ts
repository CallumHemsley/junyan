import { z } from 'zod';
import definitions from './routines.json';
import type { LifeMap } from './model';
import { profileFor } from './profiles';

const offset = z.strictObject({ x: z.number().finite(), y: z.number().finite() });
export const routines = z.array(z.strictObject({
  id: z.string().min(1), mapId: z.string().min(1), landmarkId: z.string().min(1),
  characterId: z.enum(['xiao-li', 'bird']), offsets: z.array(offset).min(2),
})).parse(definitions);

export function additionalHooks(map: LifeMap): LifeMap['npcHooks'] {
  return routines.filter(routine => routine.mapId === map.id && !map.npcHooks.some(hook => profileFor(hook.characterId)?.id === routine.characterId)).flatMap(routine => {
    const landmark = map.landmarks.find(item => item.id === routine.landmarkId);
    if (!landmark) return [];
    const points = routine.offsets.map(offset => ({ x: landmark.position.x + offset.x, y: landmark.position.y + offset.y }));
    return [{ id: routine.id, characterId: routine.characterId, position: points[0], route: points.slice(1) }];
  });
}
