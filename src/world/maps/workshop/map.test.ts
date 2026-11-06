import { describe, expect, it } from 'vitest';
import { worldMapSchema } from '../../schema';
import { canStand, canWalk, findPath, contains } from '../../geometry';
import { workshopDefinition } from './index';
const map=worldMapSchema.parse(workshopDefinition);
describe('authored workshop circulation',()=>{
  it('reaches both real repair benches from town with the shared player footprint',()=>{
    expect(canStand(map,map.defaultSpawn)).toBe(true);
    for(const anchor of map.anchors) {
      expect(canStand(map,anchor.position),anchor.id).toBe(true);
      const path=findPath(map,map.defaultSpawn,anchor.position);
      expect(path.length,anchor.id).toBeGreaterThan(0);
      let previous=map.defaultSpawn;
      for(const point of path){expect(canWalk(map,previous,point),anchor.id).toBe(true);previous={...previous,...point};}
    }
    expect(map.anchors.map(a=>a.interactionId)).toEqual(['repair-lamp','repair-toy']);
  });
  it('keeps arrival off its reciprocal town door trigger',()=>{
    const door=map.exits[0];
    expect(contains(door.rect,map.entrances[0].position)).toBe(false);
    expect(findPath(map,map.defaultSpawn,{x:15,y:26.5}).length).toBeGreaterThan(0);
    expect(door.targetMapId).toBe('town');expect(door.targetEntranceId).toBe('from-workshop');
  });
  it('lets residents traverse authored routes and leaves room beside foreground workstations',()=>{
    for(const npc of map.npcHooks) {
      let previous=npc.position;
      expect(canStand(map,previous),npc.id).toBe(true);
      for(const point of npc.route){expect(findPath(map,previous,point).length,npc.id).toBeGreaterThan(0);previous=point;}
    }
    for(const point of [{x:12,y:18.8},{x:22,y:19.1},{x:23,y:5},{x:5,y:24.8}]) expect(findPath(map,map.defaultSpawn,point).length).toBeGreaterThan(0);
  });
});
