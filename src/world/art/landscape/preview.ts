// Isolated authoring harness: shared map rules, camera and production art adapter.
import { mapDefinitions } from '../../maps/landscape';
import { worldMapSchema, type Point } from '../../schema';
import { canStand, movePlayer, findPath } from '../../geometry';
import { project, pointerGround, type Camera } from '../../camera';
import { paintWorld } from '../../painter';
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
  paintWorld(ctx,map,{...view,pass:'ground'},'east',!!length,camera().scale);
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
