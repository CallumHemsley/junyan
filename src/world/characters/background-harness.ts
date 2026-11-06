import {backgroundResidents,sampleActor,drawActor,type Facing} from './index';
import {paintActorCanvas} from './adapter';
import {worldMaps} from '../registry';
import {paintWorld} from '../painter';
import {project,unproject} from '../camera';
import type {WorldRenderView,WorldRenderObject} from '../render-contract';
import {colorShader} from '../lighting';
import {sampleDayLight} from '../atmosphere';
import {createWorld} from '../state';
import {createGame} from '../../game';
import {content} from '../../content';
const directions=document.querySelector<HTMLCanvasElement>('#directions')!;
const motion=document.querySelector<HTMLCanvasElement>('#motion')!;
const stage=document.querySelector<HTMLCanvasElement>('#stage')!;
const media=matchMedia('(prefers-reduced-motion: reduce)');
const state={elapsedMs:0,paused:false,offset:{x:0,y:0},distance:0,yaw:0,moving:false};
const keys=new Set<string>();let target:{x:number;y:number}|null=null;
const map=worldMaps.courtyard,position={x:23,y:20},camera={focus:position,width:720,height:440,scale:18};
const game=createGame(content,42),world={...createWorld(worldMaps),mapId:map.id,position};
const shader=colorShader(sampleDayLight('morning'));
const reduced=()=>media.matches||state.paused;
function sheet(canvas:HTMLCanvasElement,animate:boolean) {
 const context=canvas.getContext('2d')!;context.fillStyle='#d7d6bc';context.fillRect(0,0,canvas.width,canvas.height);
 backgroundResidents.forEach((resident,row)=>{
  for(let column=0;column<8;column++) {
   const work=animate&&column>=6;
   const sample=sampleActor({characterId:resident.id,facing:'east',yaw:animate?Math.PI/4:Math.PI/4-column*Math.PI/4,action:animate&&!work?'walk':'idle',posture:work?'work':'stand',distanceTravelled:animate&&!work?(column+state.elapsedMs/160)/6:undefined,elapsedMs:work?state.elapsedMs:0,reducedMotion:reduced()});
   paintActorCanvas(context,sample,20+column*40,48+row*52);
  }
 });
}
function draw() {
 sheet(directions,false);sheet(motion,true);
 const context=stage.getContext('2d')!;
 const view:WorldRenderView={project:(point,z)=>project(point,camera,z),elapsedMs:state.elapsedMs,reducedMotion:reduced(),playerPosition:position,width:720,height:440,pass:'objects',shadeColor:shader};
 paintWorld(context,map,{...view,pass:'ground'},'east',false,18,game,world);
 const residents:WorldRenderObject[]=backgroundResidents.map((resident,index)=>{
  const p={x:19+index*1.6+state.offset.x,y:24-index*1.1+state.offset.y};
  const moving=state.moving;
  const input={characterId:resident.id,facing:'east' as Facing,action:moving?'walk' as const:'idle' as const,posture:!moving&&(resident.role==='reader'||resident.role==='groundskeeper'||resident.role==='laundry')?'work' as const:'stand' as const,yaw:state.yaw,elapsedMs:state.elapsedMs,distanceTravelled:moving?state.distance:undefined,reducedMotion:reduced()};
  return {id:resident.id,position:p,depth:p.x+p.y,draw:ctx=>drawActor(ctx,view,sampleActor(input),p)};
 });
 residents.sort((a,b)=>a.depth!-b.depth!).forEach(resident=>resident.draw(context,view));
}
stage.addEventListener('keydown',event=>{if(event.key.startsWith('Arrow')){event.preventDefault();keys.add(event.key);target=null;}});
stage.addEventListener('keyup',event=>keys.delete(event.key));stage.addEventListener('blur',()=>keys.clear());
stage.addEventListener('pointerdown',event=>{stage.focus();const bounds=stage.getBoundingClientRect();const worldPoint=unproject({x:(event.clientX-bounds.left)/bounds.width*720,y:(event.clientY-bounds.top)/bounds.height*440},camera);target={x:worldPoint.x-22.2,y:worldPoint.y-21.8};});
document.querySelector('#pause')!.addEventListener('click',()=>{state.paused=!state.paused;draw();});
function update(ms:number) {
 let dx=0,dy=0;
 if(keys.has('ArrowRight')){dx++;dy--;}
 if(keys.has('ArrowLeft')){dx--;dy++;}
 if(keys.has('ArrowUp')){dx--;dy--;}
 if(keys.has('ArrowDown')){dx++;dy++;}
 if(!dx&&!dy&&target){dx=target.x-state.offset.x;dy=target.y-state.offset.y;if(Math.hypot(dx,dy)<.1){target=null;dx=dy=0;}}
 const length=Math.hypot(dx,dy),step=Math.min(ms*.0015,length);
 state.moving=length>0;
 if(length){const x=Math.max(-2,Math.min(2,state.offset.x+dx/length*step)),y=Math.max(-2,Math.min(2,state.offset.y+dy/length*step));const distance=Math.hypot(x-state.offset.x,y-state.offset.y);state.moving=distance>.001;if(state.moving){state.yaw=Math.atan2(y-state.offset.y,x-state.offset.x);state.distance+=distance;}state.offset={x,y};}
 state.elapsedMs+=ms;draw();
}
let last=0;function tick(now:number){if(!document.hidden){if(last)update(Math.min(50,now-last));last=now;}else last=0;requestAnimationFrame(tick);}
Object.assign(window,{__BACKGROUND_FIXTURE__:{state,draw,samples:()=>backgroundResidents.map(resident=>sampleActor({characterId:resident.id,facing:'east',action:'walk',elapsedMs:state.elapsedMs,reducedMotion:reduced()}))}});
draw();requestAnimationFrame(tick);
