import type { GameState } from '../contracts';
import type { WorldState } from './schema';

/** Reduced motion still repaints input and discoveries, but not clock-only saves. */
export function reducedWorldChanged(previousGame: GameState, previousWorld: WorldState, game: GameState, world: WorldState): boolean {
  const before = Object.entries(previousGame).filter(([key]) => key !== 'world');
  const after = Object.entries(game).filter(([key]) => key !== 'world');
  if (before.length !== after.length || after.some(([key, value]) => Reflect.get(previousGame, key) !== value)) return true;
  const scene = (state: WorldState) => {
    const { life, ...space } = state;
    const { elapsedMs: _elapsed, ...events } = life ?? { elapsedMs: 0 };
    return JSON.stringify([space, events]);
  };
  return scene(previousWorld) !== scene(world);
}
