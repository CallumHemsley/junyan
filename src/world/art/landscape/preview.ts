// Isolated art/composition prototype. Foundation owns production movement and camera.
import { mapDefinitions } from '../../maps/landscape';
import { drawLandscapeProp, landscapeMaterialColor } from './draw';
const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
const params = new URLSearchParams(location.search);
let map = mapDefinitions.find(m => m.id === params.get('map')) ?? mapDefinitions[0];
let player = { x: Number(params.get('x') ?? map.defaultSpawn.x), y: Number(params.get('y') ?? map.defaultSpawn.y) };
const keys = new Set<string>();
let target: {x:number;y:number} | null = null;
let previous = 0;
const unit = 18;
const project = (x:number,y:number,z=0) => ({x:canvas.width/2+(x-player.x-y+player.y)*unit, y:canvas.height*.58+(x-player.x+y-player.y)*unit*.5-z*unit});
const blocked = (x:number,y:number) => x<1.3||y<1.3||x>map.bounds.width-1.3||y>map.bounds.height-1.3||map.colliders.some(({rect:r})=>x>r.x-.3&&x<r.x+r.width+.3&&y>r.y-.3&&y<r.y+r.height+.3);
const polygon = (points:{x:number;y:number}[],color:string) => {
 ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
};
function paint(time:number) {
 const dt=Math.min((time-previous)/1000,.03); previous=time;
 if(!document.hidden){
 let dx=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a'));
 let dy=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'));
 // Map screen directions into the isometric ground axes.
 if(dx||dy){const old=dx;dx=(dx+dy)/Math.SQRT2;dy=(dy-old)/Math.SQRT2;target=null;}
 else if(target){dx=target.x-player.x;dy=target.y-player.y;if(Math.hypot(dx,dy)<.2)target=null;}
 const length=Math.hypot(dx,dy);if(length){dx=dx/length*dt*7;dy=dy/length*dt*7;if(!blocked(player.x+dx,player.y))player.x+=dx;if(!blocked(player.x,player.y+dy))player.y+=dy;}
 ctx.fillStyle='#8fa68a';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(const t of map.terrain){const r=t.rect;const p=project(r.x,r.y),a=project(r.x+r.width,r.y),b=project(r.x+r.width,r.y+r.height),c=project(r.x,r.y+r.height);polygon([p,a,b,c],landscapeMaterialColor(t.material)??'#869d62');}
 // World-locked grain, stepping stones and water glints retain pixel scale while scrolling.
 for(let y=Math.max(1,Math.floor(player.y-22));y<Math.min(map.bounds.height,player.y+22);y++)for(let x=Math.max(1,Math.floor(player.x-22));x<Math.min(map.bounds.width,player.x+22);x++){
 const t=map.terrain.filter(t=>x>=t.rect.x&&x<t.rect.x+t.rect.width&&y>=t.rect.y&&y<t.rect.y+t.rect.height).at(-1);const material=t?.material;
 const n=(x*37+y*71)%97,p=project(x+.15+n%5*.12,y+.2);ctx.fillStyle=material==='water'?'#a6c6b8':material==='path'?'#d9cc9e':material==='stone-path'?'#d4d2b5':'#a8b47b';
 if(n%3===0)ctx.fillRect(Math.round(p.x),Math.round(p.y),material==='water'?8:3,1);
 if(material==='bridge'||material==='boardwalk'){const a=project(x,y),b=project(x+1,y);ctx.strokeStyle='#7b795b';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
 }
 const props=map.props.map(prop=>({depth:prop.position.x+prop.position.y,prop}));
 const subjects=[...props,{depth:player.x+player.y,prop:null}].sort((a,b)=>a.depth-b.depth);
 for(const {prop} of subjects){if(prop){const p=project(prop.position.x,prop.position.y);if(p.x<-100||p.y<-20||p.x>canvas.width+100||p.y>canvas.height+110)continue;drawLandscapeProp(ctx,prop,project,unit,time,matchMedia('(prefers-reduced-motion: reduce)').matches);}else{
 const p=project(player.x,player.y);ctx.fillStyle='#465d4a66';ctx.fillRect(p.x-5,p.y-1,11,4);ctx.fillStyle='#4d574d';ctx.fillRect(p.x-4,p.y-9,3,9);ctx.fillRect(p.x+2,p.y-9,3,9);ctx.fillStyle='#eee0b6';ctx.fillRect(p.x-5,p.y-19,11,11);ctx.fillStyle='#dfb187';ctx.fillRect(p.x-4,p.y-27,9,9);ctx.fillStyle='#4b4437';ctx.fillRect(p.x-5,p.y-29,11,5);
 }}
 }
 requestAnimationFrame(paint);
}
function resize(){canvas.width=Math.ceil(innerWidth/2);canvas.height=Math.ceil(innerHeight/2);ctx.imageSmoothingEnabled=false;}
resize();addEventListener('resize',resize);
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();keys.add(e.key);}});
addEventListener('keyup',e=>keys.delete(e.key));addEventListener('blur',()=>keys.clear());
canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)*canvas.width/r.width-canvas.width/2,y=(e.clientY-r.top)*canvas.height/r.height-canvas.height*.58;target={x:player.x+x/(unit*2)+y/unit,y:player.y+y/unit-x/(unit*2)};canvas.focus();});
for(const [id,index] of [['home',0],['river',1]] as const)document.getElementById(id)!.onclick=()=>{map=mapDefinitions[index];player={...map.defaultSpawn};target=null;};
Object.assign(window,{__LANDSCAPE_PREVIEW__:{getState:()=>({mapId:map.id,player:{...player},blocked:blocked(player.x,player.y)}),go:(mapId:string,x:number,y:number)=>{map=mapDefinitions.find(m=>m.id===mapId)!;player={x,y};}}});
requestAnimationFrame(paint);
