import {sampleAtmosphere,shadeAtmosphereColor,type AtmosphereHooks,type DayPhase,type Point,type RGB} from './index';
import {atmosphereHooksForMap} from './map-hooks';
import {drawAtmosphere,drawAtmosphereLayer} from './canvas';
const canvas=document.querySelector('canvas')!;
const ctx=canvas.getContext('2d')!;
const output=document.querySelector('output')!;
let phase:DayPhase='morning', reduced=false, wash=false, frozenMs:number|null=null;
const camera={x:24,y:15};
const trees=Array.from({length:55},(_,i)=>({x:3+(i*13.7)%43,y:3+(i*7.31)%27})).filter(p=>!(p.y>11&&p.y<18)&&!(p.x>16&&p.x<31&&p.y>5&&p.y<12));
const houses=[{x:16,y:7,w:5,h:3},{x:23,y:7,w:5,h:3},{x:33,y:20,w:4,h:4}];
const hooks:AtmosphereHooks={
 water:[{id:'canal',rect:{x:0,y:19,width:31,height:5},shore:['north','south']},{id:'pool',rect:{x:35,y:4,width:8,height:5},shore:['north','east','south','west']}],
 lights:[...houses.flatMap((h,i)=>[{id:`window${i}`,position:{x:h.x+1,y:h.y+h.h,z:1.5},radius:2.5,kind:'window' as const}]),{id:'lamp',position:{x:29,y:14,z:1.5},radius:2,kind:'lamp'}],
 shadows:trees.map((p,i)=>({id:`tree${i}`,position:p,radius:.65,height:2})),
 foliage:trees.map((p,i)=>({id:`tree${i}`,position:{...p,z:2},radius:.8,kind:'leaves'})),
 particles:[{id:'garden',rect:{x:3,y:3,width:39,height:24},kind:'pollen',count:16},{id:'river',rect:{x:3,y:18,width:29,height:7},kind:'firefly',count:18}],
};
const project=(p:Point)=>({x:320+(p.x-camera.x-p.y+camera.y)*13,y:180+(p.x-camera.x+p.y-camera.y)*6.5-(p.z??0)*18});
function polygon(points:Point[],color:RGB){ctx.fillStyle=`rgb(${color.join(',')})`;ctx.beginPath();points.forEach((p,i)=>{const v=project(p);if(i)ctx.lineTo(Math.round(v.x),Math.round(v.y));else ctx.moveTo(Math.round(v.x),Math.round(v.y));});ctx.closePath();ctx.fill();}
function tile(x:number,y:number,w:number,h:number,color:RGB,z=0){polygon([{x,y,z},{x:x+w,y,z},{x:x+w,y:y+h,z},{x,y:y+h,z}],color);}
let elapsed=0,last=0,frames=0;
const measures:number[]=[];
function draw(ms:number){
 const start=performance.now();
 const frame=sampleAtmosphere({mapId:'riverbank',day:2,timeOfDay:phase,elapsedMs:ms,seed:42,reducedMotion:reduced},hooks,{x:camera.x-20,y:camera.y-20,width:40,height:40});
 const color=(rgb:RGB,exposure=1)=>wash?rgb:shadeAtmosphereColor(rgb,frame.light,exposure);
 ctx.fillStyle=`rgb(${frame.light.sky.join(',')})`;ctx.fillRect(0,0,640,360);
 for(let y=0;y<32;y++)for(let x=0;x<48;x++){
  const path=y>=11&&y<18||x>=29&&x<33;
  const n=((x*17+y*31)%7)-3;
  tile(x,y,1,1,color(path?[189+n,175+n,140+n]:[104+n,139+n,94+n],path?1:.7));
  if(path&&((x+y)%3===0))tile(x+.15,y+.5,.35,.035,color([157,149,121]));
  if(!path&&(x*3+y)%5===0){tile(x+.2,y+.3,.07,.17,color([139,165,104]));tile(x+.52,y+.61,.08,.12,color([86,124,83]));}
 }
 drawAtmosphereLayer(ctx,frame.commands,'ground',project);
 // An authored pedestrian bridge stays above water.
 for(let x=12;x<15;x+=.25){tile(x,18.6,.20,5.8,color([145,114,77]));}
 for(const h of houses){
  polygon([{x:h.x,y:h.y+h.h},{x:h.x+h.w,y:h.y+h.h},{x:h.x+h.w,y:h.y+h.h,z:2},{x:h.x,y:h.y+h.h,z:2}],color([201,185,150],.6));
  polygon([{x:h.x+h.w,y:h.y},{x:h.x+h.w,y:h.y+h.h},{x:h.x+h.w,y:h.y+h.h,z:2},{x:h.x+h.w,y:h.y,z:2}],color([153,143,121],.3));
  tile(h.x-.3,h.y-.3,h.w+.6,h.h+.6,color([74,98,104]),2.1);
  for(let x=h.x;x<h.x+h.w;x+=.35)tile(x,h.y-.25,.045,h.h+.5,color([104,126,128]),2.15);
  tile(h.x+2,h.y+h.h+.02,.7,.08,color([90,79,63]),.7);
  tile(h.x+.75,h.y+h.h+.03,.65,.05,color([217,192,136]),1.5);
 }
 for(const tree of [...trees].sort((a,b)=>a.x+a.y-b.x-b.y)){
  polygon([{x:tree.x-.1,y:tree.y},{x:tree.x+.1,y:tree.y},{x:tree.x+.1,y:tree.y,z:2},{x:tree.x-.1,y:tree.y,z:2}],color([103,88,61],.2));
  tile(tree.x-.8,tree.y-.7,1.6,1.4,color([66,112,82],.3),1.8);
  tile(tree.x-.65,tree.y-.6,1.3,1.1,color([83,137,90],.7),2);
  tile(tree.x-.45,tree.y-.5,.85,.8,color([123,161,101]),2.15);
 }
 drawAtmosphereLayer(ctx,frame.commands,'light',project);
 drawAtmosphereLayer(ctx,frame.commands,'foreground',project);
 if(wash){ctx.globalAlpha=.22;ctx.fillStyle=phase==='evening'?'#d2a066':'#8297a4';ctx.fillRect(0,0,640,360);ctx.globalAlpha=1;}
 measures.push(performance.now()-start);if(measures.length>300)measures.shift();frames++;
 output.textContent=`${phase} · ${frame.commands.length} atmosphere polygons · camera ${camera.x.toFixed(1)}, ${camera.y.toFixed(1)} · ${frames} frames`;
}
function loop(now:number){if(!document.hidden){elapsed+=last?Math.min(now-last,50):0;last=now;if(!reduced||frames===0)draw(frozenMs??elapsed);}else last=0;requestAnimationFrame(loop);}
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-phase]'))button.onclick=()=>{phase=button.dataset.phase as DayPhase;document.querySelectorAll('[data-phase]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));draw(frozenMs??elapsed);};
document.querySelector<HTMLButtonElement>('#motion')!.onclick=()=>{reduced=!reduced;draw(elapsed);};
document.querySelector<HTMLButtonElement>('#treatment')!.onclick=()=>{wash=!wash;draw(elapsed);};
window.addEventListener('keydown',e=>{const moves:Record<string,[number,number]>={ArrowRight:[1,-1],ArrowLeft:[-1,1],ArrowUp:[-1,-1],ArrowDown:[1,1]};const m=moves[e.key];if(m){e.preventDefault();camera.x=Math.max(8,Math.min(40,camera.x+m[0]));camera.y=Math.max(6,Math.min(26,camera.y+m[1]));draw(elapsed);}});
canvas.onclick=e=>{const rect=canvas.getBoundingClientRect(),u=((e.clientX-rect.left)/rect.width*640-320)/13,v=((e.clientY-rect.top)/rect.height*360-180)/6.5;camera.x=Math.max(8,Math.min(40,camera.x+(u+v)/2));camera.y=Math.max(6,Math.min(26,camera.y+(v-u)/2));draw(elapsed);};
Object.assign(window,{__ATMOSPHERE__:{sampleAtmosphere,atmosphereHooksForMap,drawAtmosphere,hooks,draw,measures,camera,get frames(){return frames;},animate(){frozenMs=null;},freeze(ms:number){frozenMs=ms;draw(ms);},phase(value:DayPhase){phase=value;draw(elapsed);}}});
requestAnimationFrame(loop);
