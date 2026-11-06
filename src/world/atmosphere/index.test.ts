import {describe,it,expect} from 'vitest';
import {sampleAtmosphere,shadeAtmosphereColor,sampleDayLight,MAX_ATMOSPHERE_COMMANDS,type AtmosphereHooks,type AtmosphereInput} from './index';
const input: AtmosphereInput={mapId:'riverbank',day:2,timeOfDay:'evening',elapsedMs:1500,seed:42,reducedMotion:false};
const hooks: AtmosphereHooks={
 water:[{id:'river',rect:{x:0,y:0,width:18,height:6},shore:['north','south']}],
 lights:[{id:'window',position:{x:4,y:8,z:2},radius:2,kind:'window'}],
 foliage:[{id:'willow',position:{x:4,y:5,z:2},radius:1,kind:'leaves'}],
 shadows:[{id:'willow',position:{x:4,y:5},radius:1,height:2}],
 particles:[{id:'bank',rect:{x:0,y:5,width:12,height:4},kind:'firefly',count:9}],
};
describe('atmosphere',()=>{
 it('interpolates supplied day progress without changing gameplay time',()=>{
  expect(sampleDayLight(0)).toEqual(sampleDayLight('morning'));
  expect(sampleDayLight(.4)).toEqual(sampleDayLight('noon'));
  expect(sampleDayLight(.75)).toEqual(sampleDayLight('evening'));
  expect(sampleDayLight(1)).toEqual(sampleDayLight('night'));
  const a=sampleDayLight(.5),b=sampleDayLight(.51);
  expect(Math.abs(a.lampStrength-b.lampStrength)).toBeLessThan(.03);
 });
 it('bounds decorative output even without a viewport on a giant map',()=>{
  const frame=sampleAtmosphere(input,{water:[{id:'wide',rect:{x:0,y:0,width:10000,height:10000}}]});
  expect(frame.commands.length).toBeLessThanOrEqual(MAX_ATMOSPHERE_COMMANDS);
 });
 it('uses the exact author emitter polygon and can suppress an inferred emitter',()=>{
  const emitter=[{x:1,y:1,z:1},{x:3,y:1,z:1},{x:3,y:1,z:2},{x:1,y:1,z:2}];
  const lamp={id:'pane',position:{x:2,y:1,z:1},radius:2,kind:'window' as const};
  const exact=sampleAtmosphere(input,{lights:[{...lamp,emitter}]});
  expect(exact.commands.filter(c=>c.layer==='objects').map(c=>c.points)).toEqual([emitter]);
  const suppressed=sampleAtmosphere(input,{lights:[{...lamp,emitter:[]}]});
  expect(suppressed.commands.filter(c=>c.layer==='objects')).toEqual([]);
  expect(suppressed.commands.some(c=>c.layer==='light')).toBe(true);
 });
 it('clips authored reflection silhouettes to water and holds them at rest',()=>{
  const h={water:[{id:'pond',rect:{x:0,y:0,width:5,height:5}}],reflections:[{id:'lamp',position:{x:2,y:1},width:1,height:2,color:[255,200,120] as const}]};
  const a=sampleAtmosphere({...input,reducedMotion:true},h);
  expect(a).toEqual(sampleAtmosphere({...input,reducedMotion:true,elapsedMs:99999},h));
  expect(a.commands.length).toBeGreaterThan(sampleAtmosphere({...input,reducedMotion:true},{water:h.water}).commands.length);
  for(const c of a.commands) for(const p of c.points){expect(p.x).toBeGreaterThanOrEqual(0);expect(p.x).toBeLessThanOrEqual(5);expect(p.y).toBeGreaterThanOrEqual(0);expect(p.y).toBeLessThanOrEqual(5);}
 });
 it('is replayable and does not mutate authored hooks',()=>{
  const before=JSON.stringify(hooks), a=sampleAtmosphere(input,hooks);
  expect(sampleAtmosphere(input,hooks)).toEqual(a);
  expect(JSON.stringify(hooks)).toBe(before);
  expect(sampleAtmosphere({...input,elapsedMs:2500},hooks).commands).not.toEqual(a.commands);
 });
 it('retains detailed water, light and foliage at rest without drifting particles',()=>{
  const a=sampleAtmosphere({...input,reducedMotion:true},hooks);
  expect(a).toEqual(sampleAtmosphere({...input,elapsedMs:99999,reducedMotion:true},hooks));
  expect(a.commands.length).toBeGreaterThan(50);
  expect(a.animationMs).toBe(0);
 });
 it('makes noon and evening differ through cool shadows and local warm light',()=>{
  const noon=sampleAtmosphere({...input,timeOfDay:'noon'},hooks), evening=sampleAtmosphere(input,hooks);
  expect(noon.commands.filter(c=>c.layer==='light')).toHaveLength(0);
  expect(evening.commands.filter(c=>c.layer==='light').length).toBeGreaterThan(0);
  expect(evening.light.shadowOffset[0]).toBeLessThan(0);
  expect(noon.light.shadowOffset[0]).toBeGreaterThan(0);
  expect(shadeAtmosphereColor([100,150,120],noon.light)).not.toEqual(shadeAtmosphereColor([100,150,120],evening.light));
 });
 it('does not repaint distant hooks as the camera scrolls',()=>{
  const frame=sampleAtmosphere(input,hooks,{x:80,y:80,width:10,height:10});
  expect(frame.commands).toEqual([]);
 });
 it('keeps shore paint inside narrow fractional water fragments beside decks',()=>{
  const frame=sampleAtmosphere(input,{water:[{id:'sliver',rect:{x:1,y:2,width:.05,height:.4},shore:['north','east','south','west']}]});
  for(const c of frame.commands)for(const p of c.points){expect(p.x).toBeGreaterThanOrEqual(1-1e-8);expect(p.x).toBeLessThanOrEqual(1.05+1e-8);expect(p.y).toBeGreaterThanOrEqual(2-1e-8);expect(p.y).toBeLessThanOrEqual(2.4+1e-8);}
 });
 it('keeps clipped water dashes within the authored water region',()=>{
  const frame=sampleAtmosphere(input,{water:hooks.water},{x:2,y:2,width:4,height:2});
  for(const command of frame.commands) for(const p of command.points) {
   expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThanOrEqual(18);
   expect(p.y).toBeGreaterThanOrEqual(0); expect(p.y).toBeLessThanOrEqual(6);
  }
 });
 it('keeps interiors warm across regions without inventing a clock',()=>{
  expect(sampleAtmosphere(input,{interior:true}).light.ambient).toEqual([.92,.89,.83]);
  expect(sampleAtmosphere(input).commands).toEqual([]);
 });
});
