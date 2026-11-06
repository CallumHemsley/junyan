import type { Word } from '../contracts';
import type { Point, WorldMapDefinition } from './schema';
import type { NearbyTarget } from './target-selection';
import { canWalk, contains } from './geometry';

export function nearbyExitTargets(map: WorldMapDefinition, player: Point, dictionary: readonly Word[]): NearbyTarget[] {
  return map.exits.flatMap(exit => {
    const word = dictionary.find(word => word.id === exit.cueWordId);
    if (exit.kind !== 'door' || !word) return [];
    const position = { x: exit.rect.x + exit.rect.width / 2, y: exit.rect.y + exit.rect.height / 2 };
    // Keep the cue on the real landing's small apron, where its cutaway is visible.
    const apron = { x: exit.rect.x - .75, y: exit.rect.y - .75, width: exit.rect.width + 1.5, height: exit.rect.height + 1.5 };
    if (!contains(apron, player) || Math.hypot(position.x - player.x, position.y - player.y) > 2.5 || !canWalk(map, player, position)) return [];
    return [{ key: `${map.id}/exit/${exit.id}`, mapId: map.id, targetId: exit.id, position, source: 'exit' as const, exit, word }];
  });
}
