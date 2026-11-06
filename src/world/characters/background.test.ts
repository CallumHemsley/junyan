import {describe,it,expect} from 'vitest';
import {backgroundResidents,isBackgroundResidentId,sampleActor,type ActorInput} from './index';
const input=(id:string,extra:Partial<ActorInput>={}):ActorInput=>({characterId:id,facing:'east',action:'idle',elapsedMs:0,reducedMotion:false,...extra});
const pixels=(id:string,extra:Partial<ActorInput>={})=>Array.from(sampleActor(input(id,extra)).frame.pixels);
const silhouette=(id:string,yaw:number)=>sampleActor(input(id,{yaw})).frame.pixels.filter((_,index)=>index%4===3).join(',');
describe('proposed unvoiced background residents',()=>{
 it('has five explicit IDs separate from the voiced regulars and rejects unknown proposal IDs',()=>{
  expect(new Set(backgroundResidents.map(r=>r.id)).size).toBe(5);
  expect(backgroundResidents.every(r=>isBackgroundResidentId(r.id))).toBe(true);
  expect(isBackgroundResidentId('lin-jie')).toBe(false);
  expect(isBackgroundResidentId('bg-unknown')).toBe(false);
  expect(isBackgroundResidentId('bg-passerby')).toBe(false);
  expect(backgroundResidents.map(r=>r.id)).toEqual(['resident-reader','resident-courier','resident-groundskeeper','resident-laundry-neighbour','resident-river-walker']);
 });
 it('retains five different silhouettes in front, three-quarter and rear without color',()=>{
  for(const yaw of [Math.PI/4,0,Math.PI*5/4])expect(new Set(backgroundResidents.map(r=>silhouette(r.id,yaw))).size).toBe(5);
 });
 it('walks every resident with planted contact and a travelling-distance gait',()=>{
  for(const resident of backgroundResidents) {
   const frames=Array.from({length:6},(_,i)=>sampleActor(input(resident.id,{action:'walk',distanceTravelled:i/6})));
   expect(new Set(frames.map(f=>Array.from(f.frame.pixels).join(','))).size,resident.id).toBeGreaterThanOrEqual(4);
   expect(frames.every(f=>f.frame.feet.some(foot=>foot.planted))).toBe(true);
   expect(pixels(resident.id,{action:'walk',distanceTravelled:0,elapsedMs:0})).toEqual(pixels(resident.id,{action:'walk',distanceTravelled:0,elapsedMs:1500}));
  }
 });
 it('changes contextual held-object acting but freezes it under reduced motion',()=>{
  for(const resident of backgroundResidents) {
   const workFrames=Array.from({length:10},(_,i)=>pixels(resident.id,{posture:'work',elapsedMs:i*100}).join(','));
   expect(new Set(workFrames).size,resident.id).toBeGreaterThanOrEqual(2);
   expect(pixels(resident.id,{posture:'work',reducedMotion:true,elapsedMs:0})).toEqual(pixels(resident.id,{posture:'work',reducedMotion:true,elapsedMs:5500}));
   expect(sampleActor(input(resident.id)).frameId).toContain(resident.heldObject);
  }
 });
});
