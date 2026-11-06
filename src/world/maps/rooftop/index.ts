import definition from './map.json';
import {plantIds, type State, type Site} from '../../../features/garden/rules';

export const rooftopMap = definition;
export const gardenSites: Record<Site, {x: number; y: number}> = {
  0: {x: 15, y: 22}, 1: {x: 24, y: 22}, 2: {x: 32, y: 19},
  3: {x: 15, y: 29}, 4: {x: 24, y: 29}, 5: {x: 31, y: 12},
};

/** Project existing saved garden state; never create a second care or growth model. */
export function projectGarden(state: State) {
  const pots = plantIds.map(id => {
    const plant = state.plants[id];
    const position = gardenSites[plant.site];
    return {
      id: `rooftop.garden-${id}`, kind: `garden-${id}`, position,
      width: 1.4, height: 1.4, layer: 'object' as const,
      variant: plant.growth * 6 + (plant.drooping ? 3 : 0) + (plant.care === 'dry' ? 0 : plant.care === 'ready' ? 1 : 2),
    };
  });
  const shade = gardenSites[state.shade];
  const props = [...pots, {
    id: 'rooftop.garden-shade', kind: 'garden-shade',
    position: {x: shade.x - .3, y: shade.y - .4},
    width: 2, height: 2.2, layer: 'object' as const, variant: 0,
  }, ...(!state.restored ? [
    {id: 'rooftop.garden-crate-a', kind: 'garden-crate', position: {x: 18, y: 25}, width: 1.2, height: 1.2, layer: 'object' as const, variant: 0},
    {id: 'rooftop.garden-crate-b', kind: 'garden-crate', position: {x: 20.5, y: 27}, width: 1.4, height: 1.2, layer: 'object' as const, variant: 1},
  ] : [])];
  const colliders = pots.map(pot => ({id: pot.id, rect: {...pot.position, width: pot.width, height: pot.height}}));
  for (const crate of props.filter(p => p.kind === 'garden-crate')) colliders.push({id: crate.id, rect: {...crate.position, width: crate.width, height: crate.height}});
  // Only the shade feet are solid; its canopy remains a walk-under surface.
  for (const side of [0, 1.8]) colliders.push({
    id: `rooftop.shade-foot-${side}`, rect: {x: shade.x - .3 + side, y: shade.y - .4, width: .15, height: .15},
  });
  const anchors = plantIds.map(id => {
    const site = gardenSites[state.plants[id].site];
    return {id: `rooftop.pot.${id}`, position: {x: site.x + .7, y: site.y + 2.1}, radius: 1.6,
      featureId: 'garden' as const, interactionId: `garden.${id}`};
  });
  return {
    props,
    anchors,
    colliders,
    occluders: [{id: 'rooftop.garden-shade', rect: {...props[3].position, width: 2, height: 2.2}, height: 3, fadeWhenPlayerBehind: true}],
  };
}

export function rooftopForGarden(state: State) {
  const garden = projectGarden(state);
  const tree = garden.anchors.find(anchor => anchor.id === 'rooftop.pot.tree')!.position;
  return {...definition,
    npcHooks: [...definition.npcHooks, {id: 'life.rooftop.sparrow', characterId: 'bird',
      position: {x: tree.x - .4, y: tree.y},
      route: [{x: tree.x + .4, y: tree.y}, {x: tree.x, y: tree.y + .4}]}],
    props: [...definition.props, ...garden.props],
    anchors: [...definition.anchors, ...garden.anchors],
    colliders: [...definition.colliders, ...garden.colliders], occluders: [...definition.occluders, ...garden.occluders]};
}

export const mapDefinitions = [definition];
