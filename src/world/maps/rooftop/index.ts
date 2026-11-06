import definition from './map.json';
import {plantIds, type State, type Site} from '../../../features/garden/rules';

export const mapDefinitions = [definition];
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
    width: 2, height: 2.2, layer: 'foreground' as const, variant: 0,
  }];
  const colliders = pots.map(pot => ({id: pot.id, rect: {...pot.position, width: pot.width, height: pot.height}}));
  // Only the shade feet are solid; its canopy remains a walk-under surface.
  for (const side of [0, 1.8]) colliders.push({
    id: `rooftop.shade-foot-${side}`, rect: {x: shade.x - .3 + side, y: shade.y - .4, width: .15, height: .15},
  });
  return {
    props,
    colliders,
    occluders: [{id: 'rooftop.garden-shade', rect: {...props[3].position, width: 2, height: 2.2}, height: 3, fadeWhenPlayerBehind: true}],
  };
}

export function rooftopForGarden(state: State) {
  const garden = projectGarden(state);
  return {...definition, props: [...definition.props, ...garden.props],
    colliders: [...definition.colliders, ...garden.colliders], occluders: [...definition.occluders, ...garden.occluders]};
}
