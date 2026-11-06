import {it,expect} from 'vitest';
import {worldMaps} from './registry';
import {planFor} from './life-bridge';
import {content} from '../content';
import {diagnoseActorIds,sampleActor} from './characters';
import {atFeet,surfaceHeight} from './surfaces';
import {cameraForMap,project} from './camera';
import {stairSurfaces} from './maps/residential/elevation';
import type {WorldRenderView} from './render-contract';
it('preflights every currently emitted human ID before strict catalog sampling reaches production',()=>{
 const ids=['player',...content.characters.map(c=>c.id),...Object.values(worldMaps).flatMap(map=>planFor(map).actors.filter(a=>a.profile.kind==='resident').map(a=>a.characterId))];
 expect(diagnoseActorIds(ids)).toEqual([]);
 for(const characterId of new Set(ids))expect(()=>sampleActor({characterId,facing:'south',action:'idle',elapsedMs:0,reducedMotion:true})).not.toThrow();
 expect(new Set(ids).has('aunt')).toBe(true);
});
it('attaches deterministic NPC-foot fixtures to the same intermediate tread support as the player',()=>{
 // A render contract fixture, not a claim that a resident is authored on stairs.
 const map=worldMaps['residential-stairs'];
 for(const surface of stairSurfaces.filter(s=>s.kind==='tread')){
  const position={x:surface.rect.x+2,y:surface.rect.y+.25},footZ=surfaceHeight(map.id,position);
  const camera=cameraForMap(map.bounds,position,195,386,11,0,0,footZ);
  const view={project:(p,z)=>project(p,camera,z)} as WorldRenderView;
  expect(atFeet(view,footZ).project(position)).toEqual(project(position,camera,footZ));
  expect(atFeet(view,footZ).project(position,footZ)).toEqual(project(position,camera,footZ));
 }
});
