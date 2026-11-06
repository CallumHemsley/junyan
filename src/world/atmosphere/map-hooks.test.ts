import {expect,it} from 'vitest';
import {atmosphereHooksForMap} from './map-hooks';
import {sampleAtmosphere} from './index';
it('compiles opt-in hooks from validated map data and accepts exact artist overrides',()=>{
 const map={id:'park',terrain:[{id:'water',material:'water',rect:{x:0,y:0,width:3,height:2}}],props:[{id:'tree',kind:'tree',position:{x:5,y:4},width:2,height:3},{id:'lamp',kind:'lantern',position:{x:3,y:3},width:1,height:3},{id:'seat',kind:'bench',position:{x:5,y:5},width:1,height:1}]};
 const hooks=atmosphereHooksForMap(map);
 expect(hooks.water).toHaveLength(1);expect(hooks.lights).toHaveLength(1);
 expect(hooks.foliage).toHaveLength(1);expect(hooks.shadows).toHaveLength(2);
 expect(atmosphereHooksForMap(map,{foliage:[]}).foliage).toEqual([]);
});
it('avoids false shoreline seams between water rectangles',()=>{
 const input={mapId:'riverbank',day:1,timeOfDay:'noon' as const,elapsedMs:0,seed:42,reducedMotion:true};
 const a={id:'a',rect:{x:0,y:0,width:3,height:1},shore:['south'] as const};
 const b={id:'b',rect:{x:0,y:1,width:3,height:1}};
 const exposed=sampleAtmosphere(input,{water:[a]}).commands;
 const joined=sampleAtmosphere(input,{water:[a,b]}).commands;
 const shore=exposed.filter(c=>c.opacity===.7);
 expect(shore.length).toBeGreaterThan(0);
 expect(joined.filter(c=>c.opacity===.7)).toHaveLength(0);
});

it('cuts authored crossing surfaces out of water so late effects cannot repaint decks',()=>{
 const map={id:'riverbank',props:[],terrain:[{id:'river',material:'water',rect:{x:0,y:0,width:10,height:8}},{id:'crossing',material:'bridge',rect:{x:0,y:3,width:10,height:2}}]};
 const hooks=atmosphereHooksForMap(map);
 expect(hooks.water?.reduce((sum,w)=>sum+w.rect.width*w.rect.height,0)).toBe(60);
 const frame=sampleAtmosphere({mapId:'riverbank',day:1,timeOfDay:'evening',elapsedMs:3000,seed:42,reducedMotion:false},hooks);
 for(const c of frame.commands) for(const p of c.points)expect(p.y<=3||p.y>=5).toBe(true);
});
