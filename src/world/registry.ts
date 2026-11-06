import { worldMapSchema, type WorldMapDefinition } from "./schema";
import { restaurantMap } from "./restaurant";
export type MapRegistry = Readonly<Record<string,WorldMapDefinition>>;
export function createMapRegistry(definitions:unknown[]):MapRegistry {
  const registry:Record<string,WorldMapDefinition>={};
  for(const raw of definitions) {
    const map=worldMapSchema.parse(raw);
    if(registry[map.id]) throw new Error(`Duplicate world map ${map.id}`);
    for(const group of [map.entrances,map.exits,map.anchors,map.colliders,map.props,map.terrain,map.occluders,map.npcHooks,map.landmarks])
      if(new Set(group.map(item=>item.id)).size!==group.length) throw new Error(`Duplicate world content ID in ${map.id}`);
    registry[map.id]=map;
  }
  return registry;
}
const modules=import.meta.glob<{mapDefinitions?:unknown[]}>("./maps/*/index.ts",{eager:true});
export const worldMaps=createMapRegistry([restaurantMap,...Object.values(modules).flatMap(module=>module.mapDefinitions??[])]);
