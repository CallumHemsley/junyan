// Isolated authoring harness: shared map rules, camera and production art adapter.
import { mapDefinitions } from '../../maps/landscape';
import { worldMapSchema, type Point } from '../../schema';
import { canStand, movePlayer, findPath } from '../../geometry';
import { project, pointerGround, type Camera } from '../../camera';
import { drawMap } from './index';
const canvas=document.querySelector('canvas')!;
const ctx=canvas.getContext('2d')!;
const maps=mapDefinitions.map(raw=>worldMapSchema.parse(raw));
const params=new URLSearchParams(location.search);
let map=maps.find(m=>m.id===params.get('map'))??maps[0];
let player={x:Number(params.get('x')??map.defaultSpawn.x),y:Number(params.get('y')??map.defaultSpawn.y)};
let previous=0;
let waypoints:Point[]=[];
const keys=new Set<string>();
const camera=():Camera=>({focus:player,width:canvas.width,height:canvas.height,scale:18});
function paint(time:number){
 const dt=Math.min((time-previous)/1000,.03);previous=time;
 if(!document.hidden){
  let dx=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a'));
  let dy=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'));
  if(dx||dy){const old=dx;dx=(dx+dy)/Math.SQRT2;dy=(dy-old)/Math.SQRT2;waypoints=[];}
  else if(waypoints.length){dx=waypoints[0].x-player.x;dy=waypoints[0].y-player.y;if(Math.hypot(dx,dy)<.15)waypoints.shift();}
  const length=Math.hypot(dx,dy);
  if(length)player=movePlayer(map,player,{x:dx/length*dt*7,y:dy/length*dt*7});
  ctx.fillStyle='#8fa68a';ctx.fillRect(0,0,canvas.width,canvas.height);
  const view={project:(p:Point,z=0)=>project(p,camera(),z),elapsedMs:time,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,playerPosition:player,width:canvas.width,height:canvas.height};
  drawMap(ctx,map,{...view,pass:'ground'});drawMap(ctx,map,{...view,pass:'objects'});
  const p=project(player,camera());
  ctx.fillStyle='#465d4a66';ctx.fillRect(p.x-5,p.y-1,11,4);ctx.fillStyle='#4d574d';ctx.fillRect(p.x-4,p.y-9,3,9);ctx.fillRect(p.x+2,p.y-9,3,9);ctx.fillStyle='#eee0b6';ctx.fillRect(p.x-5,p.y-19,11,11);ctx.fillStyle='#dfb187';ctx.fillRect(p.x-4,p.y-27,9,9);ctx.fillStyle='#4b4437';ctx.fillRect(p.x-5,p.y-29,11,5);
  drawMap(ctx,map,{...view,pass:'foreground'});
 }
 requestAnimationFrame(paint);
}
function resize(){canvas.width=Math.ceil(innerWidth/2);canvas.height=Math.ceil(innerHeight/2);ctx.imageSmoothingEnabled=false;}
resize();addEventListener('resize',resize);
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();keys.add(e.key);}});
addEventListener('keyup',e=>keys.delete(e.key));addEventListener('blur',()=>keys.clear());
canvas.addEventListener('pointerdown',e=>{const target=pointerGround({x:e.clientX,y:e.clientY},canvas.getBoundingClientRect(),camera());waypoints=findPath(map,player,target);canvas.focus();});
for(const [id,index] of [['home',0],['river',1]] as const)document.getElementById(id)!.onclick=()=>{map=maps[index];player={...map.defaultSpawn};waypoints=[];};
Object.assign(window,{__LANDSCAPE_PREVIEW__:{getState:()=>({mapId:map.id,player:{...player},blocked:!canStand(map,player)}),go:(mapId:string,x:number,y:number)=>{map=maps.find(m=>m.id===mapId)!;player={x,y};}}});
requestAnimationFrame(paint);
