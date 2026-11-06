import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createGame } from '../../../game';
import { content } from '../../../content';
import { mapsForNeighbourhood } from '../../dynamic';
import WorldViewport from '../../WorldViewport';
import { worldMaps } from '../../registry';
import { reduceWorld } from '../../state';
import type { WorldState } from '../../schema';

function TraversalStudy() {
  const game = createGame(content);
  const maps = mapsForNeighbourhood(game.neighbourhood!);
  const [state, setState] = useState<WorldState>(() => {
    const map = worldMaps['residential-hall'];
    return { version: 1, mapId: map.id, position: { x: map.defaultSpawn.x, y: map.defaultSpawn.y }, facing: map.defaultSpawn.facing, returnPositions: {}, activeActivity: null, activeAnchorId: null };
  });
  return <><WorldViewport state={state} maps={maps} game={game} fresh={[]} dialogue={null} onPlay={() => {}} onLookup={() => {}} onAction={action => { if (action.type !== 'world-life') setState(previous => reduceWorld(previous, action, maps)); }}/><output hidden data-residential-state={JSON.stringify(state)}/></>;
}
createRoot(document.getElementById('root')!).render(<TraversalStudy/>);
