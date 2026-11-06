import { mapDefinitions } from '../../maps/landscape';
import { worldMapSchema } from '../../schema';
import { project } from '../../camera';
import { colorShader } from '../../lighting';
import { sampleAtmosphere } from '../../atmosphere';
import { atmosphereHooksForMap } from '../../atmosphere/map-hooks';
import { drawAtmosphere } from '../../atmosphere/canvas';
import { drawPlayer } from '../../painter';
import { drawMap, renderObjects } from './index';
import type { WorldRenderView } from '../../render-contract';

const map=worldMapSchema.parse(mapDefinitions[0]);
const position={x:49,y:24};
const hooks=atmosphereHooksForMap(map);
const frame=sampleAtmosphere({mapId:'park',day:1,timeOfDay:'morning',elapsedMs:0,seed:42,reducedMotion:true},{shadows:hooks.shadows,shadowExclusions:hooks.shadowExclusions});
const shadeColor=colorShader(frame.light);
for(const mode of ['contact','cast','combined']){
  const canvas=document.getElementById(mode) as HTMLCanvasElement;
  canvas.width=240;canvas.height=300;
  const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
  const camera={focus:position,width:240,height:300,scale:15};
  const view:WorldRenderView={project:(point,z=0)=>project(point,camera,z),shadeColor,elapsedMs:0,reducedMotion:true,playerPosition:position,width:240,height:300,pass:'ground'};
  // A floor-only map copy isolates contact marks; production data is not mutated.
  drawMap(ctx,mode==='cast'?{...map,props:map.props.filter(p=>p.layer==='ground')}:map,view);
  if(mode!=='contact')drawAtmosphere(ctx,frame,view);
  const objects=renderObjects(map,view).map(o=>({depth:o.depth??o.position.x+o.position.y,draw:()=>o.draw(ctx,view)}));
  objects.push({depth:position.x+position.y,draw:()=>drawPlayer(ctx,view,position,'east',false,15)});
  objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
}
Object.assign(window,{__SHADOW_PROOF__:{scope:'component-layer diagnostic using production map/art/atmosphere functions; not a whole App acceptance journey',atmosphereShadowHooks:atmosphereHooksForMap(map).shadows?.map(s=>s.id),matureTrees:map.props.filter(p=>p.kind==='mature-tree').length}});
