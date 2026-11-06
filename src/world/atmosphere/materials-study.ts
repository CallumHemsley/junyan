import {worldMaps} from '../registry';
import {project,type Camera} from '../camera';
import type {WorldArtModule,WorldRenderView} from '../render-contract';
import * as courtyard from '../art/courtyard';
import * as residential from '../art/residential';
import * as workshop from '../art/workshop';
import {sampleAtmosphere,type DayPhase,type LightState} from './index';
import {atmosphereHooksForMap} from './map-hooks';
import {drawAtmosphere,renderAtmosphereObjects} from './canvas';
import {shadeAtmosphereCss} from './materials';
/** Scope this context to material art callbacks. Draw emissive atmosphere on the raw host context. */
function createAtmosphereMaterialContext(ctx:CanvasRenderingContext2D,light:LightState,exposure=1):CanvasRenderingContext2D {
  const colors=new Map<string,string>(),methods=new Map<PropertyKey,unknown>();
  return new Proxy(ctx,{
    get(target,key) {
      const cached=methods.get(key);
      if(cached!==undefined)return cached;
      const value=Reflect.get(target,key,target);
      if(typeof value!=='function')return value;
      const method=value.bind(target);methods.set(key,method);return method;
    },
    set(target,key,value) {
      if((key==='fillStyle'||key==='strokeStyle')&&typeof value==='string') {
        let shaded=colors.get(value);
        if(shaded===undefined) {
          shaded=shadeAtmosphereCss(value,light,exposure);
          if(colors.size>=2048)colors.clear();
          colors.set(value,shaded);
        }
        return Reflect.set(target,key,shaded,target);
      }
      return Reflect.set(target,key,value,target);
    },
  });
}


const canvas=document.querySelector('canvas')!,ctx=canvas.getContext('2d')!;
const art:Record<string,WorldArtModule>={courtyard,apartment:residential,workshop};
const focus={courtyard:{x:25,y:17},apartment:{x:16,y:13},workshop:{x:15,y:12}};
const materialContexts=new Map<string,CanvasRenderingContext2D>();
let scene:'courtyard'|'apartment'|'workshop'='courtyard',phase:DayPhase='evening',lit=true;
function draw(nextScene=scene,nextPhase=phase,nextLit=lit){
 scene=nextScene;phase=nextPhase;lit=nextLit;
 canvas.width=innerWidth<600?390:1280;canvas.height=innerWidth<600?560:720;
 const map=worldMaps[scene],module=art[scene],scale=innerWidth<600?18:24;
 const camera:Camera={focus:focus[scene],width:canvas.width,height:canvas.height,scale};
 const view:WorldRenderView={project:(p,z)=>project(p,camera,z),elapsedMs:5000,reducedMotion:true,playerPosition:focus[scene],width:canvas.width,height:canvas.height,pass:'ground'};
 const hooks=atmosphereHooksForMap(map);
 // This fixture proves an exact author-supplied pane; production artists own emitter geometry.
 if(scene==='courtyard')hooks.lights=hooks.lights?.map(light=>{const prop=map.props.find(p=>p.id===light.id);if(!prop||light.kind!=='window')return light;const x=prop.position.x+.14,y=prop.position.y+.265,w=prop.width-.28;return {...light,position:{x:x+w/2,y,z:1.44},emitter:[{x,y,z:1.45},{x:x+w,y,z:1.45},{x:x+w,y,z:2.63},{x,y,z:2.63}]};});
 const frame=sampleAtmosphere({mapId:scene,day:1,timeOfDay:phase,elapsedMs:5000,seed:42,reducedMotion:true},hooks,{x:camera.focus.x-30,y:camera.focus.y-30,width:60,height:60});
 const key=`${scene}:${phase}`;
 if(!materialContexts.has(key))materialContexts.set(key,createAtmosphereMaterialContext(ctx,frame.light));
 const material=lit?materialContexts.get(key)!:ctx;
 ctx.imageSmoothingEnabled=false;ctx.fillStyle=`rgb(${frame.light.sky.join(',')})`;ctx.fillRect(0,0,canvas.width,canvas.height);
 module.drawMap?.(material,map,view);
 drawAtmosphere(ctx,frame,view);
 module.drawMap?.(material,map,{...view,pass:'objects'});
 const objects=[...(module.renderObjects?.(map,view)??[]).map(o=>({...o,draw:()=>o.draw(material,view)})),...renderAtmosphereObjects(frame).map(o=>({...o,draw:()=>o.draw(ctx,view)}))];
 objects.sort((a,b)=>(a.depth??a.position.x+a.position.y)-(b.depth??b.position.x+b.position.y)).forEach(o=>o.draw());
 module.drawMap?.(material,map,{...view,pass:'foreground'});
 drawAtmosphere(ctx,frame,{...view,pass:'foreground'});
 return {mapId:map.id,phase,lit,canvas:[canvas.width,canvas.height],scale,lights:frame.commands.filter(c=>c.layer==='light').length};
}
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-map]'))button.onclick=()=>draw(button.dataset.map as typeof scene);
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-phase]'))button.onclick=()=>draw(scene,button.dataset.phase as DayPhase);
document.querySelector<HTMLButtonElement>('#toggle')!.onclick=()=>draw(scene,phase,!lit);
Object.assign(window,{__MATERIALS__:{draw}});draw();
