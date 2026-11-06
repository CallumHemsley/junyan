import type { AtmosphereHooks, Point } from '../../atmosphere';
import { atmosphereHooksForMap } from '../../atmosphere/map-hooks';
import type { WorldMapDefinition } from '../../schema';
import type { State } from '../../../features/repairs/rules';

/** Standard atmosphere hooks only: the host supplies phase, material shading and the single sampler. */
export function workshopAtmosphereHooks(map: WorldMapDefinition, repairs: State): AtmosphereHooks {
  if(map.id!=='workshop')return {};
  const lights=(atmosphereHooksForMap(map).lights??[]).filter(light=>light.kind==='window').map(light=>({...light,radius:1.2}));
  if(repairs.jobs[repairs.active]){
    const id=repairs.active==='lamp'?'workshop.desk-lamp':'workshop.toy-lamp';
    const prop=map.props.find(p=>p.id===id);
    if(prop){
      const {x,y}=prop.position;
      const emitter:Point[]=[{x:x-.3,y:y+.08,z:2.51},{x:x+.02,y:y+.08,z:2.51},{x:x+.02,y:y+.42,z:2.51},{x:x-.3,y:y+.42,z:2.51}];
      lights.push({id:`${id}.task-pool`,position:{x:x-.14,y:y+.25,z:2.51},radius:3.2,kind:'lamp',emitter});
    }
  }
  if(repairs.completed.includes('lamp')){
    const shelf=map.props.find(p=>p.id==='workshop.returned-shelf');
    if(shelf){const x=shelf.position.x+1.2,y=shelf.position.y+.7,z=3.02;
      lights.push({id:'workshop.returned-lamp.pool',position:{x,y,z},radius:1.4,kind:'lamp',emitter:[{x:x-.12,y,z:z-.1},{x:x+.12,y,z:z-.1},{x:x+.12,y,z:z+.1},{x:x-.12,y,z:z+.1}]});
    }
  }
  return {lights};
}
