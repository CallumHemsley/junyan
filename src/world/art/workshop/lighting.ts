import type { AtmosphereHooks } from '../../atmosphere';
import { atmosphereHooksForMap } from '../../atmosphere/map-hooks';
import type { WorldMapDefinition } from '../../schema';
import type { State } from '../../../features/repairs/rules';

/** Select existing authored fixtures; atmosphere owns their geometry, phase and shadow definitions. */
export function workshopAtmosphereHooks(map: WorldMapDefinition, repairs: State, base: AtmosphereHooks = atmosphereHooksForMap(map)): AtmosphereHooks {
  if(map.id!=='workshop')return {};
  const activeId=repairs.jobs[repairs.active]?(repairs.active==='lamp'?'workshop.desk-lamp':'workshop.toy-lamp'):null;
  return {...base,lights:(base.lights??[]).filter(light=>light.kind==='window'||light.id===activeId)};
}
