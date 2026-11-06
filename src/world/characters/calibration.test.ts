import {describe,it,expect} from 'vitest';
import {ACTOR_PIXELS_PER_WORLD_UNIT,actorCommands,actorCatalog,sampleActor,actorContactMetrics,projectActorBounds,type ActorInput} from './index';
const base:ActorInput={characterId:'player',facing:'east',action:'idle',elapsedMs:0,reducedMotion:true};
const view={project:(p:{x:number;y:number},z=0)=>({x:200+(p.x-p.y)*30,y:200+(p.x+p.y)*15-z*30}),elapsedMs:0,reducedMotion:true,playerPosition:{x:0,y:0},width:400,height:400,pass:'objects' as const};
describe('explicit whole-human calibration study',()=>{
 it('preserves every native standing sprite at15 while changing all projected bounds coherently',()=>{
  for(const actor of actorCatalog){
   const normal=sampleActor({...base,characterId:actor.id,pixelsPerWorldUnit:18}),trial=sampleActor({...base,characterId:actor.id,pixelsPerWorldUnit:15});
   expect(trial.frame.pixels).toEqual(normal.frame.pixels);
   expect(trial.pixelsPerWorldUnit).toBe(15);
   const a=projectActorBounds(view,normal,{x:0,y:0}),b=projectActorBounds(view,trial,{x:0,y:0});
   expect(Math.abs(b.height-a.height*1.2)).toBeLessThanOrEqual(2);
   expect(trial.worldCommands).not.toEqual(normal.worldCommands);
  }
 });
 it('retains absolute seat/hand heights and ground feet at either study calibration',()=>{
  for(const pixelsPerWorldUnit of [18,15])for(const actor of actorCatalog){
   const sample=sampleActor({...base,characterId:actor.id,pixelsPerWorldUnit,posture:'sit',seatHeight:.77,handRestHeight:1.44});
   const metrics=actorContactMetrics(sample),tolerance=1/pixelsPerWorldUnit;
   expect(Math.abs(metrics.pelvis.height-.77)).toBeLessThanOrEqual(tolerance);
   expect(Math.abs(metrics.hand.height-1.44)).toBeLessThanOrEqual(tolerance);
   expect(metrics.feet.every(foot=>Math.abs(foot.height)<=tolerance)).toBe(true);
  }
 });
 it('reaches an explicit work surface in world units at both calibrations',()=>{
  for(const pixelsPerWorldUnit of [18,15])for(const actor of actorCatalog){
   const sample=sampleActor({...base,characterId:actor.id,pixelsPerWorldUnit,posture:'work',handRestHeight:1.63});
   expect(Math.abs(actorContactMetrics(sample).hand.height-1.63)).toBeLessThanOrEqual(1/pixelsPerWorldUnit);
  }
 });
 it('uses one default15 for every human and rejects invalid calibration',()=>{
  expect(ACTOR_PIXELS_PER_WORLD_UNIT).toBe(15);
  for(const actor of actorCatalog){
   const sample=sampleActor({...base,characterId:actor.id});
   expect(sample.pixelsPerWorldUnit).toBe(ACTOR_PIXELS_PER_WORLD_UNIT);
   expect(actorContactMetrics(sample).pixelsPerWorldUnit).toBe(ACTOR_PIXELS_PER_WORLD_UNIT);
   expect(actorCommands({drawCommands:sample.drawCommands},{x:0,y:0})).toEqual(sample.worldCommands);
  }
  expect(()=>sampleActor({...base,pixelsPerWorldUnit:0})).toThrow(RangeError);
  expect(()=>sampleActor({...base,pixelsPerWorldUnit:NaN})).toThrow(RangeError);
 });
});
