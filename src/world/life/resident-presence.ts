import type { GameState } from '../../contracts';
import { readingUsePose } from '../../features/reading-room/use';
import { mapsForNeighbourhood } from '../dynamic';
import type { LifeState } from './interactions';
import { restaurantPresence } from './presence';

export function lifeExcludedCharacterIds(game: GameState, life: LifeState, mapId: string, elapsedMs = life.elapsedMs): readonly string[] {
  const inside = restaurantPresence(game, life).insideCharacterIds;
  const reading = game.neighbourhood?.['reading-room'];
  if (mapId === 'reading-room' || inside.includes('lin-jie') || !reading?.use) return inside;
  const map = mapsForNeighbourhood(game.neighbourhood!)['reading-room'];
  return readingUsePose(reading, map, elapsedMs) ? [...inside, 'lin-jie'] : inside;
}
