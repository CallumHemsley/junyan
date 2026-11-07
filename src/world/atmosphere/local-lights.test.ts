import {expect,it} from 'vitest';
import {authoredLocalLights} from './local-lights';
import {renderObjects as readingRoomObjects} from '../art/reading-room';
import {worldMaps} from '../registry';
import {atmosphereHooksForMap} from './map-hooks';
import {sampleAtmosphere} from './index';
const lamp={id:'workshop.desk-lamp',kind:'lamp',position:{x:9,y:8.5},width:.6,height:.6};
it('binds light to the actual fixture and does not scatter fallback emitters',()=>{
 const hooks=authoredLocalLights({id:'workshop',terrain:[],props:[lamp]});
 expect(hooks.lights?.map(l=>l.id)).toEqual(['workshop.desk-lamp']);
 expect(hooks.lights![0].emitter!.every(p=>p.z===2.505)).toBe(true);
 expect(hooks.lights![0].pool!.every(p=>p.z===1.675)).toBe(true);
 expect(authoredLocalLights({id:'workshop',terrain:[],props:[]} ).lights).toEqual([]);
 expect(authoredLocalLights({id:'workshop',terrain:[],props:[{...lamp,kind:'broken-lamp'}]}).lights).toEqual([]);
});
it('keeps the workshop entrance cool while the fixed bench lamp gains evening light',()=>{
 const hooks={...authoredLocalLights({id:'workshop',terrain:[],props:[lamp]}),interior:true};
 const input={mapId:'workshop',day:1,timeOfDay:'morning' as const,elapsedMs:1000,seed:42,reducedMotion:false};
 const morning=sampleAtmosphere(input,hooks),evening=sampleAtmosphere({...input,timeOfDay:'evening'},hooks);
 expect(evening.light.ambient[2]).toBeGreaterThan(evening.light.ambient[0]);
 expect(evening.light.ambient[0]).toBeLessThan(morning.light.ambient[0]);
 const pools=evening.commands.filter(c=>c.layer==='light');
 expect(pools).toHaveLength(1);expect(pools[0].points.every(p=>p.x<10&&p.y<10&&p.z===1.675)).toBe(true);
 expect(pools[0].opacity).toBeGreaterThan(morning.commands.find(c=>c.layer==='light')!.opacity);
 expect(sampleAtmosphere({...input,reducedMotion:true},hooks).commands).toEqual(sampleAtmosphere({...input,elapsedMs:999999,reducedMotion:true},hooks).commands);
});
it('warms occupied rooftop architecture without turning plant beds into emitters',()=>{
 const prop={id:'rooftop.stairhead',kind:'stairhead',position:{x:3,y:25},width:6,height:8};
 const hooks=authoredLocalLights({id:'rooftop',terrain:[],props:[prop,{...prop,id:'rooftop.herb-bed',kind:'raised-bed',position:{x:15,y:14}}]});
 expect(hooks.lights).toHaveLength(1);expect(hooks.lights![0].id).toBe('rooftop.stairhead-aperture');
 expect(hooks.lights![0].pool!.every(p=>p.x<12&&p.y>27)).toBe(true);
 expect(authoredLocalLights({id:'park',terrain:[],props:[lamp]})).toEqual({});
});

it('draws a tabletop practical after its host bench and before later objects',()=>{
 const bench={id:'workshop.lamp-bench',kind:'lamp-bench',position:{x:5,y:7},width:9,height:4};
 const light=authoredLocalLights({id:'workshop',terrain:[],props:[lamp,bench]}).lights![0];
 expect(light.depth).toBe(5+7+(9+4)/2+.02);
 expect(light.depth).toBeGreaterThan(5+7+(9+4)/2+.01);
});


it('binds reading-room light to its real window panes and lamp shade without lighting the room as outdoors',()=>{
 const map=worldMaps['reading-room'],hooks=atmosphereHooksForMap(map);
 expect(hooks.interior).toBe(true);
 expect(hooks.lights!.map(light=>light.id)).toEqual(['reading-room.broad-window','reading-room.alcove-window','reading-room.lamp']);
 for(const light of hooks.lights!) {
  const prop=map.props.find(prop=>prop.id===light.id)!;
  expect(light.emitter!.every(point=>point.x>=prop.position.x-.15&&point.x<=prop.position.x+prop.width+.15)).toBe(true);
  expect(light.pool!.every(point=>point.z===.025)).toBe(true);
  if(light.kind==='window') {
   expect(light.emitter!.every(point=>point.y===prop.position.y+.625)).toBe(true);
   expect(light.depth).toBeGreaterThan(readingRoomObjects(map).find(object=>object.id===light.id)!.depth!);
  }
  else expect(light.emitter!.every(point=>point.z===1.685)).toBe(true);
 }
 const input={mapId:map.id,day:1,timeOfDay:'morning' as const,elapsedMs:1000,seed:42,reducedMotion:true};
 const morning=sampleAtmosphere(input,hooks),evening=sampleAtmosphere({...input,timeOfDay:'evening'},hooks);
 expect(evening.light.ambient[0]).toBeLessThan(morning.light.ambient[0]);
 expect(evening.commands.filter(command=>command.layer==='light')).toHaveLength(3);
 expect(authoredLocalLights({...map,props:[]} ).lights).toEqual([]);
 expect(authoredLocalLights({...map,props:map.props.map(prop=>({...prop,kind:'changed'}))}).lights).toEqual([]);
});

it('distinguishes an explicit empty pool from legacy undefined and authored nonempty receivers',()=>{
 const input={mapId:'apartment',day:1,timeOfDay:'night' as const,elapsedMs:1000,seed:42,reducedMotion:true};
 for(const kind of ['lamp','window'] as const){
  const light={id:'fixture',kind,position:{x:3,y:4,z:2},radius:2};
  const sample=(pool?:readonly {x:number;y:number;z:number}[])=>sampleAtmosphere(input,{interior:true,lights:[{...light,...(pool===undefined?{}:{pool})}]}).commands;
  expect(sample().filter(c=>c.layer==='light')).toHaveLength(kind==='window'?4:3);
  expect(sample([]).filter(c=>c.layer==='light')).toHaveLength(0);
  const pool=[{x:2,y:3,z:.02},{x:4,y:3,z:.02},{x:4,y:5,z:.02},{x:2,y:5,z:.02}];
  const authored=sample(pool).filter(c=>c.layer==='light');
  expect(authored).toHaveLength(1);expect(authored[0].points).toEqual(pool);
  expect(sample([]).filter(c=>c.layer==='objects')).toEqual(sample().filter(c=>c.layer==='objects'));
 }
});

it('binds apartment apertures to actual movable lamp and pane geometry without foreground pools',()=>{
 const lamp={id:'apartment.reading-lamp',kind:'lamp',position:{x:18.4,y:15.5},width:1,height:1};
 const window={id:'apartment.window-one',kind:'window',position:{x:5,y:2},width:5,height:.25};
 const hooks=authoredLocalLights({id:'apartment',terrain:[],props:[lamp,window]});
 const practical=hooks.lights!.find(l=>l.id===lamp.id)!;
 expect(practical.position).toEqual({x:18.9,y:16,z:1.83});
 expect(practical.emitter!.every(p=>p.z===1.835&&p.x>18.4&&p.x<19.4&&p.y>15.5&&p.y<16.5)).toBe(true);
 expect(hooks.lights!.every(l=>l.pool?.length===0)).toBe(true);
 const panes=hooks.lights!.filter(l=>l.kind==='window');expect(panes.length).toBeGreaterThan(1);
 expect(panes.every(l=>l.emitter!.every(p=>p.y===2.325&&p.x>5&&p.x<10&&p.z! >1.1&&p.z! <3.4))).toBe(true);
 const moved=authoredLocalLights({id:'apartment',terrain:[],props:[{...lamp,position:{x:8.4,y:5.5}}]}).lights![0];
 expect(moved.position).toEqual({x:8.9,y:6,z:1.83});
 const input={mapId:'apartment',day:1,timeOfDay:'morning' as const,elapsedMs:0,seed:42,reducedMotion:true};
 const frame=(phase:'morning'|'noon'|'evening'|'night')=>sampleAtmosphere({...input,timeOfDay:phase},{...hooks,interior:true});
 expect(frame('morning').light.ambient).toEqual([.92,.89,.83]);expect(frame('noon').light.ambient).toEqual([.92,.89,.83]);
 expect(frame('night').light.ambient[0]).toBeLessThan(frame('evening').light.ambient[0]);
 expect(frame('night').light.ambient[2]).toBeGreaterThan(frame('night').light.ambient[0]);
 expect(frame('night').commands.filter(c=>c.layer==='light')).toEqual([]);
 expect(frame('night').commands.filter(c=>c.layer==='objects').every(c=>c.color===practical.color||panes.some(p=>p.color===c.color))).toBe(true);
});

it('uses optional authored emitter color while undefined emitters retain legacy bytes',()=>{
 const input={mapId:'workshop',day:1,timeOfDay:'night' as const,elapsedMs:0,seed:42,reducedMotion:true};
 const fixture={id:'light',kind:'lamp' as const,position:{x:2,y:3,z:2},radius:2};
 const legacy=sampleAtmosphere(input,{lights:[fixture]}),explicit=sampleAtmosphere(input,{lights:[{...fixture,color:undefined}]});
 expect(explicit).toEqual(legacy);
 expect(legacy.commands.find(c=>c.layer==='objects')!.color).toEqual([255,224,153]);
 expect(sampleAtmosphere(input,{lights:[{...fixture,color:[100,120,140]}]}).commands.find(c=>c.layer==='objects')!.color).toEqual([100,120,140]);
});
