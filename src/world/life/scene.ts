import { readingRoomHost } from '../../features/reading-room/neighbours';
import type { GameState } from '../../contracts';
import type { WorldMapDefinition, WorldState } from '../schema';
import { catHabitat } from '../maps/courtyard';
import { compileLife } from './routes';
import { sampleLife } from './sample';
import { navigationFor } from './navigation';
import { nearbyLife, initialLifeState } from './interactions';
import { courtyardHabitats } from './habitats';
import { restaurantPresence } from './presence';
import type { LifeContext, LifePlan, Navigation } from './model';

const prepared = new WeakMap<WorldMapDefinition, { plan: LifePlan; navigation: Navigation }>();
export function worldLifeFrame(map: WorldMapDefinition, game: GameState, world: WorldState, reducedMotion: boolean) {
  let source = prepared.get(map);
  if (!source) {
    const navigation = navigationFor(map);
    source = { navigation, plan: compileLife(map, navigation) };
    prepared.set(map, source);
  }
  const life = world.life ?? initialLifeState();
  const cats = game.neighbourhood?.cats;
  const context: LifeContext = {
    day: game.day, seed: game.seed, elapsedMs: life.elapsedMs, player: world.position, reducedMotion,
    cats, habitats: map.id === 'courtyard' && cats ? courtyardHabitats(catHabitat(cats, game.day)) : undefined,
    excludedCharacterIds: restaurantPresence(game, life).insideCharacterIds,
    gardenMature: game.neighbourhood?.garden.restored === true && game.neighbourhood.garden.plants.tree.growth === 3,
  };
  const actors = sampleLife(source.plan, context, source.navigation, life);
  if (map.id === 'reading-room' && game.neighbourhood) actors.push(...readingRoomHost(game.neighbourhood['reading-room'], context));
  const options = nearbyLife(source.plan, actors, world.position, source.navigation);
  return { ...source, life, context, actors, options };
}
