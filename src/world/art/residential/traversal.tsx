import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import WorldViewport from '../../WorldViewport';
import { worldMaps } from '../../registry';
import { reduceWorld } from '../../state';
import type { WorldState } from '../../schema';

function TraversalStudy() {
  const [state, setState] = useState<WorldState>(() => {
    const map = worldMaps['residential-hall'];
    return { version: 1, mapId: map.id, position: { x: map.defaultSpawn.x, y: map.defaultSpawn.y }, facing: map.defaultSpawn.facing, returnPositions: {}, activeActivity: null };
  });
  return <><WorldViewport state={state} onAction={action => setState(previous => reduceWorld(previous, action, worldMaps))}/><output hidden data-residential-state={JSON.stringify(state)}/></>;
}
createRoot(document.getElementById('root')!).render(<TraversalStudy/>);
