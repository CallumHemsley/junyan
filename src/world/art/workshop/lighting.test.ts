import { describe, expect, it } from 'vitest';
import { workshopAtmosphereHooks } from './lighting';
import { initialState, reduce, type Action } from '../../../features/repairs/rules';
import { worldMapSchema } from '../../schema';
import { workshopDefinition } from '../../maps/workshop';
import { atmosphereHooksForMap } from '../../atmosphere/map-hooks';
import { sampleAtmosphere } from '../../atmosphere';
const map=worldMapSchema.parse(workshopDefinition);
const returnedLamp=():ReturnType<typeof initialState>=>{
  const actions:Action[]=[{type:'select',job:'lamp',part:'bulb'},{type:'turn',job:'lamp',direction:'tighten'},{type:'test',job:'lamp'},{type:'return',job:'lamp'}];
  return actions.reduce((state,action)=>reduce(state,action,1),initialState());
};
describe('workshop task-light projection',()=>{
  it('follows the selected repair rather than lighting both benches',()=>{
    const lamp=initialState(),toy=reduce(lamp,{type:'switch',job:'toy'},1);
    expect(workshopAtmosphereHooks(map,lamp).lights?.filter(l=>l.kind==='lamp').map(l=>l.id)).toEqual(['workshop.desk-lamp']);
    expect(workshopAtmosphereHooks(map,toy).lights?.filter(l=>l.kind==='lamp').map(l=>l.id)).toEqual(['workshop.toy-lamp']);
  });
  it('clears the task light on return and restores it for a repeat job',()=>{
    const returned=returnedLamp(),repeat=reduce(returned,{type:'start',job:'lamp'},1);
    expect(workshopAtmosphereHooks(map,returned).lights?.filter(l=>l.kind==='lamp').map(l=>l.id)).toEqual([]);
    expect(workshopAtmosphereHooks(map,repeat).lights?.filter(l=>l.kind==='lamp').map(l=>l.id)).toEqual(['workshop.desk-lamp']);
  });
  it('leaves phase strength and shadow ownership to the single atmosphere sampler',()=>{
    const before=JSON.stringify(map),overrides=workshopAtmosphereHooks(map,initialState());
    expect(overrides.shadows).toEqual(atmosphereHooksForMap(map).shadows);
    const hooks=atmosphereHooksForMap(map,overrides);
    const sample=(timeOfDay:'morning'|'evening')=>sampleAtmosphere({mapId:'workshop',day:1,timeOfDay,elapsedMs:0,seed:42,reducedMotion:true},hooks).commands.filter(c=>c.layer==='light').reduce((sum,c)=>sum+c.opacity,0);
    expect(sample('evening')).toBeGreaterThan(sample('morning'));
    expect(JSON.stringify(map)).toBe(before);
  });
});
