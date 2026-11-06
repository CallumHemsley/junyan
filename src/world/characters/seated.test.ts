import {describe,it,expect} from 'vitest';
import {sampleActor,type ActorInput} from './index';
const input:ActorInput={characterId:'lin-jie',facing:'south',action:'idle',posture:'sit',seatHeight:.77,elapsedMs:0,reducedMotion:false};
describe('world-relative seat attachment',()=>{
 it('places the pelvis at stool height while retaining grounded feet and an unclipped head',()=>{
  for(const characterId of ['lin-jie','xiao-li','zhang-laoshi','xiao-zhou','aunt'])for(const facing of ['north','east','south','west'] as const){
   const sample=sampleActor({...input,characterId,facing}),frame=sample.frame;
   expect(frame.seatContact!.height).toBe(.77);
   expect((frame.anchor.y-frame.seatContact!.y)/18).toBeCloseTo(.77,1);
   expect(frame.feet.every(foot=>foot.planted&&Math.abs(frame.anchor.y-foot.y)<=1)).toBe(true);
   expect(Array.from(frame.pixels.slice(0,frame.width*4)).every(value=>value===0)).toBe(true);
   expect(frame.height).toBeGreaterThan(40);
  }
 });
 it('keeps standing and legacy unbound sitting unchanged when a seat is absent',()=>{
  expect(sampleActor({...input,posture:'stand'}).frame.pixels).toEqual(sampleActor({...input,posture:'stand',seatHeight:undefined}).frame.pixels);
  expect(sampleActor({...input,seatHeight:undefined}).frame.seatContact).toBeUndefined();
  expect(sampleActor(input).frameId).toContain('/seat-0.77');
  expect(sampleActor(input).frame.pixels).not.toEqual(sampleActor({...input,seatHeight:undefined}).frame.pixels);
 });
 it('freezes incidental motion without losing the explicit seat attachment',()=>{
  expect(sampleActor({...input,reducedMotion:true,elapsedMs:0}).frame).toEqual(sampleActor({...input,reducedMotion:true,elapsedMs:5500}).frame);
  expect(()=>sampleActor({...input,seatHeight:NaN})).toThrow(RangeError);
 });
});

it('publishes pure physical pelvis/feet/hand metadata for the calibrated restaurant surface',async()=>{
 const {actorContactMetrics}=await import('./index');
 const sample=sampleActor({...input,seatHeight:.55,handRestHeight:1});
 const metrics=actorContactMetrics(sample);
 expect(metrics.pelvis.height).toBeCloseTo(.55,1);
 expect(metrics.feet.every(foot=>Math.abs(foot.height)<1/18+.001)).toBe(true);
 expect(metrics.hand.height).toBe(1);
 expect(actorContactMetrics(sampleActor({...input,seatHeight:undefined})).pelvis.height).toBe(7/18);
});
