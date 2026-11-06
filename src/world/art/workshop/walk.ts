import { worldMapSchema } from '../../schema';
import { workshopDefinition } from '../../maps/workshop';
import { findPath, movePlayer, nearbyAnchors } from '../../geometry';
import { project, pointerGround, type Camera } from '../../camera';
import { createWorkshopArt } from './index';
import { initialState } from '../../../features/repairs/rules';

// Isolated art proof consumes shared movement/camera; production owns its frame loop and saves.
const map=worldMapSchema.parse(workshopDefinition);
const canvas=document.querySelector('canvas')!;
const ctx=canvas.getContext('2d')!;
let position={...map.defaultSpawn},path:{x:number;y:number}[]=[],last=0;
const keys=new Set<string>(),preference=matchMedia('(prefers-reduced-motion: reduce)');
const drawMap=createWorkshopArt(initialState());
const camera:Camera={focus:position,width:720,height:560,scale:24};
const targets={lamp:{x:8,y:10.8},toy:{x:20.8,y:10.8},shelf:{x:23,y:5},joinery:{x:12,y:18.8},entry:{x:15,y:25}};
const proof={position,visits:[] as string[],frames:0,errors:[] as string[]};
Object.assign(window,{workshopProof:proof});
function actor(){
 const p=project(position,camera);ctx.fillStyle='#363b33';ctx.beginPath();ctx.ellipse(p.x,p.y,9,4,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#353c49';ctx.fillRect(p.x-5,p.y-13,4,12);ctx.fillRect(p.x+1,p.y-13,4,12);
 ctx.fillStyle='#837697';ctx.fillRect(p.x-7,p.y-32,14,20);ctx.fillStyle='#e1bc96';ctx.fillRect(p.x-5,p.y-43,10,12);ctx.fillStyle='#46403b';ctx.fillRect(p.x-6,p.y-46,12,6);
}
function render(now:number){
 const delta=Math.min(40,now-last||0);last=now;
 let movement={x:0,y:0};
 if(keys.has('ArrowUp')||keys.has('w'))movement.y-=1;
 if(keys.has('ArrowDown')||keys.has('s'))movement.y+=1;
 if(keys.has('ArrowLeft')||keys.has('a'))movement.x-=1;
 if(keys.has('ArrowRight')||keys.has('d'))movement.x+=1;
 if(movement.x||movement.y){path=[];const n=Math.hypot(movement.x,movement.y);movement={x:movement.x/n*delta*.006,y:movement.y/n*delta*.006};}
 else if(path.length){const target=path[0],dx=target.x-position.x,dy=target.y-position.y,n=Math.hypot(dx,dy),step=Math.min(n,delta*.006);if(n<.025)path.shift();else movement={x:dx/n*step,y:dy/n*step};}
 const next=movePlayer(map,position,movement);position={...position,...next};
 camera.focus=position;proof.position=position;proof.frames++;
 const ratio=canvas.clientWidth/canvas.clientHeight;
 camera.width=720;camera.height=Math.round(720/ratio);canvas.width=camera.width;canvas.height=camera.height;
 ctx.imageSmoothingEnabled=false;ctx.fillStyle='#444339';ctx.fillRect(0,0,canvas.width,canvas.height);
 const view={project:(p:{x:number;y:number},z=0)=>project(p,camera,z),elapsedMs:now,reducedMotion:preference.matches,playerPosition:position,width:camera.width,height:camera.height,pass:'ground' as const};
 drawMap(ctx,map,view);drawMap(ctx,map,{...view,pass:'objects'});actor();drawMap(ctx,map,{...view,pass:'foreground'});
 document.querySelector('#position')!.textContent=`${position.x.toFixed(1)}, ${position.y.toFixed(1)} · ${nearbyAnchors(map,position).map(a=>a.interactionId==='repair-lamp'?'台灯':'玩具').join(' ')}`;
 if(!document.hidden)requestAnimationFrame(render);
}
canvas.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();keys.add(e.key);}});
canvas.addEventListener('keyup',e=>keys.delete(e.key));canvas.addEventListener('blur',()=>keys.clear());
canvas.addEventListener('pointerdown',e=>{canvas.focus();const target=pointerGround({x:e.clientX,y:e.clientY},canvas.getBoundingClientRect(),camera);path=findPath(map,position,target);});
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-target]'))button.onclick=()=>{const id=button.dataset.target as keyof typeof targets;path=findPath(map,position,targets[id]);proof.visits.push(id);};
document.addEventListener('visibilitychange',()=>{keys.clear();if(!document.hidden){last=0;requestAnimationFrame(render);}});
requestAnimationFrame(render);
