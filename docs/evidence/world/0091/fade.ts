import { drawFoliage, type FoliageSpecies } from '../../../../src/world/art/landscape/foliage';
import { project, cameraForMap } from '/@fs/workspace/junyan-audit-ready-art/src/world/camera.ts';
import { mapDefinitions } from '/@fs/workspace/junyan-audit-ready-art/src/world/maps/landscape/index.ts';
import { drawMap } from '/@fs/workspace/junyan-audit-ready-art/src/world/art/landscape/index.ts';
import { drawPlayer } from '/@fs/workspace/junyan-audit-ready-art/src/world/painter.ts';
import { colorShader } from '/@fs/workspace/junyan-audit-ready-art/src/world/lighting.ts';
import { sampleAtmosphere } from '/@fs/workspace/junyan-audit-ready-art/src/world/atmosphere/index.ts';
import { canStand, PLAYER_RADIUS } from '/@fs/workspace/junyan-audit-ready-art/src/world/geometry.ts';
const map=mapDefinitions[0],foot={x:44,y:22},actor={x:40.6,y:18.6},unit=11,w=195,h=310;
if(!canStand(map,foot,.5)||!canStand(map,actor,PLAYER_RADIUS))throw Error('Fade study standing invalid');
const camera=cameraForMap(map.bounds,actor,w,h,unit,0,0);
const shadeColor=colorShader(sampleAtmosphere({mapId:'park',day:1,timeOfDay:'morning',elapsedMs:0,seed:42,reducedMotion:true}).light);
const view={project:(p:any,z=0)=>project(p,camera,z),shadeColor,elapsedMs:0,reducedMotion:true,playerPosition:actor,width:w,height:h,pass:'ground'};
function canvas(){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function tree(c:HTMLCanvasElement,species:FoliageSpecies,alpha:number){
 const ctx=c.getContext('2d')!,p=view.project(foot);ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.round(p.x),Math.round(p.y));ctx.scale(unit/18,unit/18);drawFoliage(ctx,{species,seed:42,elapsedMs:0,reducedMotion:true,shadeColor});ctx.restore();
}
const actorLayer=canvas();drawPlayer(actorLayer.getContext('2d')!,view,actor,'east',false,unit);
const actorPixels=actorLayer.getContext('2d')!.getImageData(0,0,w,h).data;
const metrics:any[]=[];
for(const species of ['camphor','willow','fruit'] as const)for(const alpha of [.3,.5]){
 const section=document.createElement('section');document.querySelector('#views')!.append(section);
 const opaque=canvas();tree(opaque,species,1);
 for(const mode of ['direct','group'] as const){
  const layer=canvas();if(mode==='direct')tree(layer,species,alpha);else {const c=layer.getContext('2d')!;c.globalAlpha=alpha;c.drawImage(opaque,0,0);}
  const values=layer.getContext('2d')!.getImageData(0,0,w,h).data;
  let treePixels=0,aboveNominal=0,aboveOneAndHalf=0,actorPixelsCount=0,overlapPixels=0,overlapSum=0,actorAreaSum=0,max=0,alphaSum=0;
  const nominal=Math.round(alpha*255),overlapValues:number[]=[];
  for(let i=3;i<values.length;i+=4){const a=values[i];if(a){treePixels++;alphaSum+=a;max=Math.max(max,a);if(a>nominal+1)aboveNominal++;if(a>nominal*1.5)aboveOneAndHalf++;}
   if(actorPixels[i]>127){actorPixelsCount++;actorAreaSum+=a;if(a){overlapPixels++;overlapSum+=a;overlapValues.push(a);}}
  }
  overlapValues.sort((a,b)=>a-b);
  metrics.push({species,requestedAlpha:alpha,mode,nominalByte:nominal,treeVisiblePixels:treePixels,treeMaxAlpha:max/255,treeMeanAlpha:alphaSum/treePixels/255,treePixelsAboveRequestedPlusOneByte:aboveNominal,treeFractionAboveRequestedPlusOneByte:aboveNominal/treePixels,treeFractionAboveOneAndHalfRequested:aboveOneAndHalf/treePixels,actorOpaquePixels:actorPixelsCount,treeCoveredActorPixels:overlapPixels,actorCoverageFraction:overlapPixels/actorPixelsCount,meanAlphaAcrossCoveredActor:overlapSum/overlapPixels/255,meanAlphaAcrossWholeActor:actorAreaSum/actorPixelsCount/255,p95AlphaAcrossCoveredActor:overlapValues[Math.floor(overlapValues.length*.95)]/255});
  const c=canvas(),ctx=c.getContext('2d')!;c.id=`fade-${species}-${alpha}-${mode}`;
  drawMap(ctx,map,view);drawPlayer(ctx,view,actor,'east',false,unit);ctx.drawImage(layer,0,0);
  const figure=document.createElement('figure'),caption=document.createElement('figcaption');caption.textContent=`${species} · inherited alpha${alpha} · ${mode==='direct'?'direct spans':'isolated group'}`;figure.append(caption,c);section.append(figure);
 }
}
Object.assign(window,{__FOLIAGE_FADE__:{scope:'evidence-only direct vs isolated-group fade; production unchanged',source:'1b42875',camera,cssViewport:{width:390,height:620},backing:{width:w,height:h},foot,treeFootRadius:.5,actor,playerRadius:PLAYER_RADIUS,standingValid:true,metrics}});
