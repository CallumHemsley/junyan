import {describe,it,expect} from 'vitest';
import {actorCatalog,supportedActorIds,supportsActor,diagnoseActorIds,sampleActor,trySampleActor,UnsupportedActorError,getActorDefinition,type ActorInput} from './index';
import {profiles,profileFor} from '../life/profiles';
import {worldMaps} from '../registry';
const input:ActorInput={characterId:'aunt',facing:'east',action:'idle',elapsedMs:0,reducedMotion:false};
describe('explicit human identity catalog',()=>{
 it('contains explicit player, aunt, four regulars and five canonical background identities',()=>{
  expect(actorCatalog.length).toBe(11);
  expect(new Set(supportedActorIds).size).toBe(actorCatalog.length);
  expect(supportsActor('player')).toBe(true);expect(supportsActor('aunt')).toBe(true);
  expect(supportedActorIds.every(id=>getActorDefinition(id)?.appearance)).toBe(true);
 });
 it('covers every human profile and canonical human hook in the consumed world',()=>{
  const humans=[...profiles.values()].filter(profile=>profile.kind==='resident').map(profile=>profile.id);
  for(const map of Object.values(worldMaps))for(const hook of map.npcHooks){const profile=profileFor(hook.characterId);if(profile?.kind==='resident')humans.push(profile.id);}
  expect(humans).toContain('aunt');expect(diagnoseActorIds(humans)).toEqual([]);
 });
 it('rejects unsupported humans with a typed diagnostic and no cloned player sample',()=>{
  const unknown={...input,characterId:'unknown-neighbour'};
  expect(supportsActor(unknown.characterId)).toBe(false);
  expect(()=>sampleActor(unknown)).toThrow(UnsupportedActorError);
  expect(trySampleActor(unknown)).toEqual({ok:false,diagnostic:{code:'unsupported-human-actor',characterId:'unknown-neighbour',message:'Unsupported human actor "unknown-neighbour". Register an explicit identity before sampling.'}});
  expect(diagnoseActorIds(['unknown-neighbour','unknown-neighbour']).length).toBe(1);
  expect(supportsActor('white-cat')).toBe(false);expect(supportsActor('bird')).toBe(false);
 });
 it('preserves the courtyard aunt palette and distinguishes her bob/apron from player and Lin Jie',()=>{
  expect(getActorDefinition('aunt')!.appearance).toEqual({shirt:[145,151,132],hair:[82,70,59],legs:[66,68,65],accessory:'aunt'});
  for(const facing of ['east','north','south','west'] as const){
   const aunt=sampleActor({...input,facing}).frame.pixels;
   expect(aunt).not.toEqual(sampleActor({...input,facing,characterId:'player'}).frame.pixels);
   expect(aunt).not.toEqual(sampleActor({...input,facing,characterId:'lin-jie'}).frame.pixels);
  }
  expect(trySampleActor(input).ok).toBe(true);
 });
});
