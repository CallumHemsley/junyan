import {createRenderer,characterFigure,type SceneApi} from '../../scene/renderer.js';
import content from '../../content/content.json';
import {sampleActor,type Facing,type ActorPosture,type ActorInput} from './index';
import {paintActor,paintActorCanvas} from './adapter';
const before=document.querySelector<HTMLCanvasElement>('#before')!;
const after=document.querySelector<HTMLCanvasElement>('#after')!;
const sheet=document.querySelector<HTMLCanvasElement>('#sheet')!;
const cast=document.querySelector<HTMLSelectElement>('#cast')!;
const pose=document.querySelector<HTMLSelectElement>('#pose')!;
const state={x:-1,y:-1,facing:'east' as Facing,elapsedMs:0,distance:0,moving:false,carrying:false,frozen:false};
const media=matchMedia('(prefers-reduced-motion: reduce)');
const keys=new Set<string>();
let target:{x:number;y:number}|null=null;
function actorInput():ActorInput {
 return {characterId:cast.value,facing:state.facing,action:state.moving?'walk':'idle',elapsedMs:state.elapsedMs,distanceTravelled:state.moving?state.distance:undefined,reducedMotion:media.matches||state.frozen,posture:pose.value as ActorPosture,carrying:state.carrying};
}
function bake(api:SceneApi) {
 api.pix.fill(api.rgb(215,214,188));api.zb.fill(-1e9);api.groundZ.fill(-1e9);api.ground.fill(0);
 for(let x=-5;x<5;x++)for(let y=-5;y<5;y++)api.box(x,y,-.15,x+.98,y+.98,0,(x+y)%2?[187,185,152]:[201,197,165]);
 api.box(-3.7,-3.7,0,-2.8,-2.8,.8,[143,109,77]);api.sphere(-3.25,-3.25,1.05,.7,[111,145,119]);
 api.box(.1,.1,0,1.3,1.3,.9,[143,109,77]);api.box(.05,.05,.9,1.35,1.35,1,[187,143,91]);
}
function scene(legacy:boolean) {
 return {bake,draw(api:SceneApi){
  const input=actorInput(), appearance=content.characters.find(c=>c.id===input.characterId)?.appearance;
  const yaw={east:0,south:Math.PI/2,west:Math.PI,north:-Math.PI/2}[state.facing];
  if(legacy)characterFigure(state.x,state.y,yaw,{stance:state.moving?Math.sin(state.elapsedMs*.012)*.17:0,crouch:pose.value==='sit'||pose.value==='crouch'?1:0,carry:state.carrying},appearance as Parameters<typeof characterFigure>[4]??{},api.dynamicAdd);
  else paintActor({project:api.project,shadow:api.castShadow,pixel:(x,y,depth,color)=>{
   if(x<0||x>=api.W||y<0||y>=api.H)return;
   const i=y*api.W+x;if(depth<=api.zb[i])return;
   api.zb[i]=depth;api.pix[i]=api.rgb(...color);
  }},sampleActor(input),state);
  api.flushShadows();api.applyShadows(api.bakedZ);
 }};
}
const oldRenderer=createRenderer(before,scene(true)),newRenderer=createRenderer(after,scene(false));
function drawSheet() {
 const context=sheet.getContext('2d')!;context.fillStyle='#d7d6bc';context.fillRect(0,0,sheet.width,sheet.height);
 for(let i=0;i<5;i++)for(let d=0;d<8;d++) {
  const characterId=['player',...content.characters.map(c=>c.id)][i];
  paintActorCanvas(context,sampleActor({...actorInput(),characterId,yaw:Math.PI/4-d*Math.PI/4,action:'walk'}),28+d*56,78+i*80,2);
 }
}
function draw(){oldRenderer.draw();newRenderer.draw();drawSheet();document.querySelector('output')!.textContent=`${state.x.toFixed(2)} · ${state.y.toFixed(2)} · ${sampleActor(actorInput()).frameId}`;}
function update(ms:number) {
 let dx=0,dy=0;
 if(keys.has('ArrowRight'))dx++;
 if(keys.has('ArrowLeft'))dx--;
 if(keys.has('ArrowDown'))dy++;
 if(keys.has('ArrowUp'))dy--;
 if(!dx&&!dy&&target){dx=target.x-state.x;dy=target.y-state.y;if(Math.hypot(dx,dy)<.08){target=null;dx=dy=0;}}
 const length=Math.hypot(dx,dy),step=Math.min(ms*.0025,length);
 state.moving=length>0;
 if(length){const x=Math.max(-4.3,Math.min(4.3,state.x+dx/length*step)),y=Math.max(-4.3,Math.min(4.3,state.y+dy/length*step));state.distance+=Math.hypot(x-state.x,y-state.y);state.x=x;state.y=y;state.facing=Math.abs(dx)>Math.abs(dy)?dx>0?'east':'west':dy>0?'south':'north';}
 state.elapsedMs+=ms;draw();
}
after.addEventListener('keydown',event=>{if(event.key.startsWith('Arrow')){event.preventDefault();keys.add(event.key);target=null;}});
after.addEventListener('keyup',event=>keys.delete(event.key));
after.addEventListener('blur',()=>keys.clear());
after.addEventListener('pointerdown',event=>{after.focus();const rect=after.getBoundingClientRect(),sx=(event.clientX-rect.left)/rect.width*360,sy=(event.clientY-rect.top)/rect.height*280;const u=(sx-180)/18,v=(sy-150)/9;target={x:(u+v)/Math.SQRT2,y:(v-u)/Math.SQRT2};});
document.querySelector('#carry')!.addEventListener('click',()=>{state.carrying=!state.carrying;draw();});
document.querySelector('#freeze')!.addEventListener('click',()=>{state.frozen=!state.frozen;draw();});
cast.addEventListener('change',draw);pose.addEventListener('change',draw);
let last=0;
function tick(now:number){if(!document.hidden){if(last)update(Math.min(50,now-last));last=now;}else last=0;requestAnimationFrame(tick);}
Object.assign(window,{__ACTOR_FIXTURE__:{state,draw,step:update,sample:()=>sampleActor(actorInput()),set:(value:Partial<typeof state>)=>{Object.assign(state,value);draw();}}});
draw();requestAnimationFrame(tick);
