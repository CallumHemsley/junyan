import {describe,it,expect} from 'vitest';
import {sampleActor,directionFromYaw,type ActorInput} from './index';
import {paintActor} from './adapter';
const base:ActorInput={characterId:'player',facing:'east',action:'walk',elapsedMs:0,reducedMotion:false};
const pixels=(input:Partial<ActorInput>)=>Array.from(sampleActor({...base,...input}).frame.pixels);
describe('original pixel actors',()=>{
 it('keeps the approved returning cast visibly distinct in front and rear views',()=>{
  for(const facing of ['east','north'] as const)expect(new Set(['player','lin-jie','xiao-li','zhang-laoshi','xiao-zhou'].map(characterId=>JSON.stringify(pixels({characterId,facing})))).size).toBe(5);
 });
 it('orients cardinal movement relative to the isometric camera',()=>{
  expect([0,Math.PI/2,Math.PI,-Math.PI/2].map(directionFromYaw)).toEqual([1,7,5,3]);
  for(const [facing,yaw] of [['east',0],['south',Math.PI/2],['west',Math.PI],['north',-Math.PI/2]] as const)
   expect(sampleActor({...base,facing}).direction).toBe(directionFromYaw(yaw));
  expect(new Set(Array.from({length:8},(_,i)=>JSON.stringify(pixels({yaw:Math.PI/4-i*Math.PI/4})))).size).toBe(8);
 });
 it('moves the legs through a repeatable gait with at least one planted foot',()=>{
  const frames=Array.from({length:6},(_,i)=>sampleActor({...base,distanceTravelled:i/6}));
  expect(new Set(frames.map(f=>JSON.stringify(Array.from(f.frame.pixels)))).size).toBeGreaterThanOrEqual(4);
  expect(frames.every(f=>f.frame.feet.some(foot=>foot.planted))).toBe(true);
  expect(pixels({distanceTravelled:0,elapsedMs:500})).toEqual(pixels({distanceTravelled:0,elapsedMs:1700}));
 });
 it('freezes reduced motion while retaining direction and explicit contextual poses',()=>{
  expect(pixels({reducedMotion:true,elapsedMs:0})).toEqual(pixels({reducedMotion:true,elapsedMs:300}));
  expect(pixels({reducedMotion:true,facing:'east'})).not.toEqual(pixels({reducedMotion:true,facing:'west'}));
  expect(new Set(['stand','sit','crouch','work'].map(posture=>JSON.stringify(pixels({posture:posture as ActorInput['posture'],action:'idle'})))).size).toBe(4);
 });
 it('provides replayable blink, held object and depth-aware pixel samples without global time',()=>{
  expect(pixels({action:'idle',elapsedMs:0})).not.toEqual(pixels({action:'idle',elapsedMs:4200}));
  expect(pixels({carrying:true})).not.toEqual(pixels({carrying:false}));
  const calls:number[][]=[],shadows:number[][]=[];
  paintActor({project:(x,y,z)=>({sx:x,sy:y,d:z}),pixel:(x,y,d)=>{calls.push([x,y,d]);},shadow:(...args)=>{shadows.push(args);}},sampleActor(base),{x:10,y:20,z:2});
  expect(calls.length).toBeGreaterThan(200);
  expect(calls.every(c=>c.every(Number.isFinite)&&c[2]>=2)).toBe(true);
  expect(shadows.length).toBeGreaterThanOrEqual(2);
 });
});
