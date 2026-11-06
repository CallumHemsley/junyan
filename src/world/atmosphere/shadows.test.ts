import {expect,it} from 'vitest';
import {sampleAtmosphere,type AtmosphereHooks} from './index';
import {atmosphereHooksForMap} from './map-hooks';
const input={mapId:'park',day:1,timeOfDay:'morning' as const,elapsedMs:3000,seed:42,reducedMotion:false};
const hooks:AtmosphereHooks={shadows:[{id:'oak',position:{x:10,y:10},radius:2,height:4,shape:'canopy',contact:false}]};
it('casts one organic ground silhouette, with direction supplied by day phase',()=>{
 const morning=sampleAtmosphere(input,hooks).commands;
 const evening=sampleAtmosphere({...input,timeOfDay:'evening'},hooks).commands;
 expect(morning).toHaveLength(1);expect(morning[0].role).toBe('cast-shadow');
 expect(morning[0].layer).toBe('ground');expect(morning[0].points).toHaveLength(20);
 const center=(points:typeof morning[0]['points'])=>points.reduce((sum,p)=>sum+p.x,0)/points.length;
 expect(center(morning[0].points)).toBeGreaterThan(10);expect(center(evening[0].points)).toBeLessThan(10);
 expect(morning[0].opacity).toBeLessThan(.2);
 expect(sampleAtmosphere({...input,reducedMotion:true},hooks).commands).toEqual(morning);
});
it('keeps contacts small and only when their owner requests them',()=>{
 const frame=sampleAtmosphere(input,{shadows:[{...hooks.shadows![0],contact:true}]});
 const contact=frame.commands.find(c=>c.role==='contact-shadow')!;
 expect(contact.points).toHaveLength(12);
 expect(Math.max(...contact.points.map(p=>p.x))-Math.min(...contact.points.map(p=>p.x))).toBeLessThanOrEqual(.5);
});
it('recognizes mature canopies and leaves landscape contacts to its ground-pass owner',()=>{
 const frame=atmosphereHooksForMap({id:'park',terrain:[{id:'bridge',rect:{x:12,y:10,width:3,height:2},material:'bridge'}],props:[{id:'oak',kind:'mature-tree',position:{x:10,y:10},width:7,height:7}]});
 expect(frame.shadows).toHaveLength(1);expect(frame.shadows![0].contact).toBe(false);
 expect(frame.shadows![0].radius).toBeGreaterThan(2);
 expect(sampleAtmosphere(input,frame).commands.find(c=>c.role==='cast-shadow')!.exclusions).toEqual([{x:12,y:10,width:3,height:2}]);
});
