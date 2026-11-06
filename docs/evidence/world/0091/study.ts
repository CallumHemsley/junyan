import { drawFoliage, foliageBounds, type FoliageSpecies } from '../../../../src/world/art/landscape/foliage';
import { drawLandscapeProp as oldTree } from './old-52a4046';
import { project, cameraForMap } from '/@fs/workspace/junyan-audit-ready-art/src/world/camera.ts';
import { mapDefinitions } from '/@fs/workspace/junyan-audit-ready-art/src/world/maps/landscape/index.ts';
import { drawMap } from '/@fs/workspace/junyan-audit-ready-art/src/world/art/landscape/index.ts';
import { drawPlayer } from '/@fs/workspace/junyan-audit-ready-art/src/world/painter.ts';
import { colorShader } from '/@fs/workspace/junyan-audit-ready-art/src/world/lighting.ts';
import { sampleAtmosphere } from '/@fs/workspace/junyan-audit-ready-art/src/world/atmosphere/index.ts';
import { canStand } from '/@fs/workspace/junyan-audit-ready-art/src/world/geometry.ts';
const species: FoliageSpecies[]=['camphor','willow','fruit'];
const input=(s:FoliageSpecies,time=0,reducedMotion=true,shadeColor=(s:string)=>s)=>({species:s,seed:42,elapsedMs:time,reducedMotion,shadeColor});
const native=document.querySelector<HTMLCanvasElement>('#native')!, n=native.getContext('2d')!;
n.fillStyle='#d4d8be';n.fillRect(0,0,native.width,native.height);
for(let i=0;i<4;i++){
 n.save();n.translate(96+i*192,134);
 if(!i)oldTree(n,{kind:'mature-tree',position:{x:0,y:0},width:7,height:7,variant:0},()=>({x:0,y:0}),18,0,true);
 else drawFoliage(n,input(species[i-1]));n.restore();
 n.fillStyle='#344b43';n.font='11px sans-serif';n.fillText(['OLD 52a4046',...species][i],32+i*192,151);
}
const contract=document.querySelector<HTMLCanvasElement>('#contract')!, d=contract.getContext('2d')!;
d.fillStyle='#d4d8be';d.fillRect(0,0,768,320);
for(let row=0;row<2;row++)for(let i=0;i<3;i++) {
 const s=species[i],box=foliageBounds(input(s));d.save();d.translate(128+i*256,140+row*155);
 d.strokeStyle='#71816d';d.strokeRect(box.minX,box.minY,box.maxX-box.minX,box.maxY-box.minY);
 d.globalAlpha=row?.35:1;drawFoliage(d,input(s,0,true,row?c=>c:()=> '#344b43'));d.restore();
}
const map=mapDefinitions[0];
function scene(id:string,unit:number,timeOfDay:'morning'|'evening') {
 const canvas=document.querySelector<HTMLCanvasElement>('#'+id)!,ctx=canvas.getContext('2d')!;
 const camera={focus:{x:49,y:24},width:canvas.width,height:canvas.height,scale:unit};
 const shadeColor=colorShader(sampleAtmosphere({mapId:'park',day:1,timeOfDay,elapsedMs:0,seed:42,reducedMotion:true}).light);
 const view={project:(p:any,z=0)=>project(p,camera,z),shadeColor,elapsedMs:0,reducedMotion:true,playerPosition:camera.focus,width:canvas.width,height:canvas.height,pass:'ground'};
 drawMap(ctx,map,view);
 // Ground is the unmodified production park. Outline its actual water collider rectangles.
 ctx.save();ctx.strokeStyle=shadeColor('#e8d6a8');ctx.lineWidth=1;ctx.setLineDash([3,4]);
 for(const c of map.colliders.filter((c:any)=>c.id.includes('pond'))) {
  const r=c.rect;ctx.beginPath();[[r.x,r.y],[r.x+r.width,r.y],[r.x+r.width,r.y+r.height],[r.x,r.y+r.height]].forEach(([x,y],i)=>{const p=view.project({x,y});i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)});ctx.closePath();ctx.stroke();
 }ctx.restore();
 const phone=id==='phone';
 const spots=phone?[[42,23],[51,21],[61,23]]:[[35,27],[43,21],[53,19],[64,20]];
 spots.forEach(([x,y],i)=>{
  const actor={x:x+1,y:y+1};
  if(!canStand(map,{x,y},.5)||!canStand(map,actor))throw Error('Study specimen/actor fails production radius-aware canStand');
  const p=view.project({x,y});ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));ctx.scale(unit/18,unit/18);
  if(!phone&&i===0)oldTree(ctx,{kind:'mature-tree',position:{x:0,y:0},width:7,height:7,variant:0},()=>({x:0,y:0}),18,0,true,shadeColor);
  else drawFoliage(ctx,input(species[phone?i:i-1],0,true,shadeColor));ctx.restore();
  drawPlayer(ctx,view,actor,'east',false,unit);
 });
 ctx.fillStyle=shadeColor('#f3ebd5');ctx.fillRect(10,10,canvas.width-20,37);ctx.fillStyle=shadeColor('#344b43');ctx.font='12px sans-serif';ctx.fillText(phone?'Camphor / willow / fruit · real player scale':'Old / camphor / willow / fruit · real player beside each',19,26);ctx.font='10px sans-serif';ctx.fillText('Dashed shoreline = actual collider boundary; study positions only',19,40);
}
scene('desktop',15,'morning');scene('phone',11,'morning');scene('evening',15,'evening');
const actualViews:any[]=[];
for(const mode of ['phone','desktop'])for(const s of ['old',...species] as const) {
 const phone=mode==='phone',w=phone?390:1120,h=phone?620:640,unit=phone?11:15;
 const canvas=document.createElement('canvas');canvas.id=`actual-${mode}-${s}`;canvas.width=Math.ceil(w/2);canvas.height=Math.ceil(h/2);canvas.style.width=w+'px';canvas.style.height=h+'px';
 const label=document.createElement('p');label.textContent=`${mode} · ${s} · actual App display scale`;
 document.querySelector('#actual')!.append(label,canvas);
 const ctx=canvas.getContext('2d')!,actor={x:46,y:22},foot={x:44,y:22};
 if(!canStand(map,actor)||!canStand(map,foot,.5))throw Error('Actual scale view fails canStand');
 const camera=cameraForMap(map.bounds,actor,canvas.width,canvas.height,unit,0,0);
 const shadeColor=colorShader(sampleAtmosphere({mapId:'park',day:1,timeOfDay:'morning',elapsedMs:0,seed:42,reducedMotion:true}).light);
 const view={project:(p:any,z=0)=>project(p,camera,z),shadeColor,elapsedMs:0,reducedMotion:true,playerPosition:actor,width:canvas.width,height:canvas.height,pass:'ground'};
 drawMap(ctx,map,view);const at=view.project(foot);ctx.save();ctx.translate(Math.round(at.x),Math.round(at.y));ctx.scale(unit/18,unit/18);if(s==='old')oldTree(ctx,{kind:'mature-tree',position:{x:0,y:0},width:7,height:7,variant:0},()=>({x:0,y:0}),18,0,true,shadeColor);else drawFoliage(ctx,input(s,0,true,shadeColor));ctx.restore();drawPlayer(ctx,view,actor,'east',false,unit);
 actualViews.push({mode,species:s,cssViewport:{width:w,height:h},backing:{width:canvas.width,height:canvas.height},camera,specimenFoot:foot,treeFootRadius:.5,actor,playerRadius:.22,canStand:true,scope:'production cameraForMap / drawPlayer / drawMap component, no App controls; inset0'});
}
const check=document.createElement('canvas');check.width=200;check.height=160;const ctx=check.getContext('2d')!;
function pixels(s:FoliageSpecies,time=0,reduced=true,alpha=1){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,200,160);ctx.translate(100,140);ctx.globalAlpha=alpha;drawFoliage(ctx,input(s,time,reduced));return ctx.getImageData(0,0,200,160).data;}
const equal=(a:Uint8ClampedArray,b:Uint8ClampedArray)=>a.every((v,i)=>v===b[i]);
const checks=species.map(s=>{
 const a=pixels(s),b=pixels(s),r=pixels(s,99999);let contained=true,count=0;
 for(let t=0;t<14000;t+=170){const p=pixels(s,t,false),box=foliageBounds(input(s));for(let y=0;y<160;y++)for(let x=0;x<200;x++)if(p[(y*200+x)*4+3]){count++;if(x-100<box.minX||x-100>=box.maxX||y-140<box.minY||y-140>=box.maxY)contained=false;}}
 const half=pixels(s,0,true,.5);const inheritedAlpha=ctx.globalAlpha===.5;const transform=ctx.getTransform();const transformPreserved=transform.e===100&&transform.f===140;
 const calls:string[]=[];drawFoliage(ctx,{...input(s),shadeColor:c=>(calls.push(c),c)});
 const start=performance.now();for(let i=0;i<1000;i++)drawFoliage(ctx,input(s,i*16,false));const ms=(performance.now()-start)/1000;
 return {species:s,deterministic:equal(a,b),reducedMotionStable:equal(a,r),boundsContainAllSampledSway:contained,inheritedAlpha,transformPreserved,shadeCalls:calls.length,uniqueShadeBases:new Set(calls).size,halfAlphaMax:Math.max(...half.filter((_,i)=>i%4===3)),sampledVisiblePixels:count,drawMsMean1000:ms};
});
Object.assign(window,{__FOLIAGE_STUDY__:{scope:'component study, not integrated App acceptance',productionReference:'1b42875',actualViews,checks}});
