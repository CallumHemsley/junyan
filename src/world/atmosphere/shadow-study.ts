import {worldMaps} from '../registry';
import {project} from '../camera';
import {drawPlayer} from '../painter';
import * as landscape from '../art/landscape';
import type {WorldRenderView} from '../render-contract';
import {sampleAtmosphere,type DayPhase,type AtmosphereCommand} from './index';
import {atmosphereHooksForMap} from './map-hooks';
import {drawAtmosphereLayer,visibleAtmosphereRect} from './canvas';
import {createAtmosphereColorShader} from './materials';
const canvas=document.querySelector('canvas')!,ctx=canvas.getContext('2d')!;
const sites={pond:{mapId:'park',position:{x:61,y:33}},bridge:{mapId:'riverbank',position:{x:48,y:19}},grove:{mapId:'park',position:{x:16,y:52}}};
let site:keyof typeof sites='pond',mode='combined',phase:DayPhase='evening';
function draw(nextSite=site,nextMode=mode,nextPhase=phase){
 site=nextSite;mode=nextMode;phase=nextPhase;
 const {mapId,position}=sites[site],map=worldMaps[mapId],phone=innerWidth<600,width=phone?390:1280,height=phone?640:720,scale=phone?18:24;
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 const camera={focus:position,width,height,scale};
 const view:WorldRenderView={project:(p,z)=>project(p,camera,z),elapsedMs:5000,reducedMotion:true,playerPosition:position,width,height,pass:'ground'};
 const hooks=atmosphereHooksForMap(map);
 const input={mapId,day:1,timeOfDay:phase,elapsedMs:5000,seed:42,reducedMotion:true};
 const frame=sampleAtmosphere(input,hooks,visibleAtmosphereRect(view));view.shadeColor=createAtmosphereColorShader(frame.light);
 ctx.globalAlpha=1;ctx.imageSmoothingEnabled=false;ctx.fillStyle=mode==='objects'?'#e3e2cf':'#81977b';ctx.fillRect(0,0,width,height);
 if(mode==='ground'||mode==='combined')landscape.drawMap(ctx,map,view);
 const cast=frame.commands.filter(c=>c.role==='cast-shadow');
 if(mode==='cast'||mode==='combined')drawAtmosphereLayer(ctx,cast,'ground',p=>view.project(p,p.z??0));
 if(mode==='contact')landscape.drawContactShadows(ctx,map,view);
 if(mode==='objects'||mode==='combined'){
  const objects=landscape.renderObjects(map,view);
  if(mode==='combined')objects.push({id:'shadow-proof-player',position,draw:(context,current)=>drawPlayer(context,current,position,'south',false,scale)});
  objects.sort((a,b)=>(a.depth??a.position.x+a.position.y)-(b.depth??b.position.x+b.position.y)).forEach(o=>o.draw(ctx,view));
 }
 const result={site,mapId,mode,phase,scale,castCount:cast.length,contactOwnership:'landscape drawContactShadows, ground pass only; atmosphere casts only'};
 document.querySelector('output')!.textContent=JSON.stringify(result);return result;
}
function pixelProof(){
 const c=document.createElement('canvas');c.width=8;c.height=8;const context=c.getContext('2d')!;
 const command:AtmosphereCommand={layer:'ground',role:'cast-shadow',points:[{x:0,y:0},{x:8,y:0},{x:8,y:8},{x:0,y:8}],color:[0,0,0],opacity:.25};
 const pixel=()=>[...context.getImageData(4,4,1,1).data];
 drawAtmosphereLayer(context,[command],'ground',p=>p);const single=pixel();context.clearRect(0,0,8,8);
 drawAtmosphereLayer(context,[command,command],'ground',p=>p);const overlap=pixel();context.clearRect(0,0,8,8);
 context.globalAlpha=.5;drawAtmosphereLayer(context,[command],'ground',p=>p);const inherited=pixel(),restored=context.globalAlpha;context.globalAlpha=1;context.clearRect(0,0,8,8);
 drawAtmosphereLayer(context,[{...command,exclusions:[{x:2,y:2,width:4,height:4}]}],'ground',p=>p);const deck=pixel(),outside=[...context.getImageData(1,1,1,1).data];
 const contactCanvas=document.createElement('canvas');contactCanvas.width=16;contactCanvas.height=16;const contactCtx=contactCanvas.getContext('2d')!;
 const contactMap={...worldMaps.park,props:[{id:'contact-proof',kind:'tree',position:{x:0,y:0},width:4,height:4,layer:'object' as const,variant:0}]};
 const contactView:WorldRenderView={project:p=>({x:8+p.x*20,y:8+p.y*10}),width:16,height:16,pass:'ground',elapsedMs:0,reducedMotion:true,playerPosition:{x:0,y:0}};
 landscape.drawContactShadows(contactCtx,contactMap,contactView);const contactFull=contactCtx.getImageData(8,9,1,1).data[3];contactCtx.clearRect(0,0,16,16);contactCtx.globalAlpha=.5;landscape.drawContactShadows(contactCtx,contactMap,contactView);const contactFaded=contactCtx.getImageData(8,9,1,1).data[3];
 return {single,overlap,inherited,restored,deck,outside,contactFull,contactFaded,contactRestored:contactCtx.globalAlpha};
}
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-site]'))button.onclick=()=>draw(button.dataset.site as typeof site);
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-mode]'))button.onclick=()=>draw(site,button.dataset.mode);
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-phase]'))button.onclick=()=>draw(site,mode,button.dataset.phase as DayPhase);
Object.assign(window,{__SHADOWS__:{draw,pixelProof}});draw();
