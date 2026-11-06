import * as e02 from '/@fs/workspace/junyan-audit-e02/src/world/characters/index.ts';
import * as attached from './actor-b1fcbca/src/world/characters/index';
import { renderObjects, restaurantObjects, projectRestaurant } from '../../../src/world/art/restaurant';
import { restaurantMap } from './foundation-map';
import { renderObjects as residentialObjects, renderFurnitureObjects } from '/@fs/workspace/junyan-audit-e02/src/world/art/residential/index.ts';
import hallMap from '/@fs/workspace/junyan-audit-e02/src/world/maps/residential/residential-hall.json';
import { initialState as apartmentState } from '/@fs/workspace/junyan-audit-e02/src/features/apartment/rules.ts';
import { renderObjects as workshopObjects } from '/@fs/workspace/junyan-audit-e02/src/world/art/workshop/index.ts';
import workshopMap from '/@fs/workspace/junyan-audit-e02/src/world/maps/workshop/map.json';
import { content } from '../../../src/content';
import { createGame } from '../../../src/game';
import type { RestaurantView } from '../../../src/world/art/restaurant';

const params=new URLSearchParams(location.search);
const source=params.get('source')??'e02';
const seatedCharacter=params.get('character')??'lin-jie';
const {sampleActor,drawActor}=source==='attached'?attached:e02;
const multiplier=Number(params.get('multiplier')??1);
const scale=Number(params.get('scale')??24),ratio=Number(params.get('ratio')??1),attachment=Number(params.get('z')??0);
const canvas=document.querySelector('canvas')!,ctx=canvas.getContext('2d')!;
canvas.width=960;canvas.height=760;
function drawPerson(context,sample,view,position) {
 const anchor=view.project(position);
 drawActor(context,{...view,project(p,z=0){const q=view.project(p,z);return{x:anchor.x+(q.x-anchor.x)*multiplier,y:anchor.y+(q.y-anchor.y)*multiplier};}},sample,position);
}
const rows=[];
for(const [index,yaw] of [Math.PI/4,3*Math.PI/4,5*Math.PI/4].entries()) {
 const origin={x:160+index*320,y:310},center={x:5,y:8.8};
 const position={x:5,y:Number(params.get('seatY')??7.4)};
 const view:RestaurantView={project(point,z=0){return{x:origin.x+((point.x-center.x)-(point.y-center.y))*scale,y:origin.y+((point.x-center.x)+(point.y-center.y))*scale*.5-z*scale};},width:960,height:520,playerPosition:{x:20,y:20},elapsedMs:0,reducedMotion:true,pass:'ground'};
 const furnitureView={...view,project:(point,z=0)=>view.project(point,z*ratio)};
 const table=renderObjects(restaurantMap,view).find(o=>o.id==='table-5-9')!;
 const actor=sampleActor({characterId:seatedCharacter,facing:'south',yaw,action:'idle',posture:'sit',seatHeight:source==='attached'?.77*ratio/multiplier:undefined,elapsedMs:0,reducedMotion:true});
 ctx.fillStyle='#e5d6b6';ctx.beginPath();for(const [i,p]of [{x:3,y:6},{x:7,y:6},{x:7,y:12},{x:3,y:12}].entries()){const q=view.project(p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}ctx.fill();
 const actorView={...view,project:(point,z=0)=>view.project(point,z+attachment)};
 drawPerson(ctx,actor,actorView,position);
 const actorRaster=ctx.getImageData(0,0,960,760);
 table.draw(ctx,furnitureView);
 const occludedRaster=ctx.getImageData(0,0,960,760);
 const point=actorView.project(position),pixelScale=scale*multiplier/18;
 const bodyPixels=new Set<string>(),visibleBodyPixels=new Set<string>();
 for(const command of actor.drawCommands) {
  const nativeY=command.y+actor.frame.anchor.y;
  const hip=actor.frame.seatContact?.y??31;
  if(nativeY<hip-10||nativeY>hip)continue;
  const left=Math.round(point.x+command.x*pixelScale),right=Math.round(point.x+(command.x+command.width)*pixelScale);
  const top=Math.round(point.y+command.y*pixelScale),bottom=Math.round(point.y+(command.y+1)*pixelScale);
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++) {
   bodyPixels.add(`${x},${y}`);
   const offset=(y*960+x)*4;
   if([0,1,2].every(c=>actorRaster.data[offset+c]===occludedRaster.data[offset+c]))visibleBodyPixels.add(`${x},${y}`);
  }
 }
 const state=createGame(content,42);state.customers=state.customers.slice(0,1);state.customers[0].phase='checkout';
 for(const setting of restaurantObjects(restaurantMap,furnitureView,projectRestaurant(state,content,restaurantMap)))setting.draw(ctx,furnitureView);
 const hipHeight=actor.frame.seatContact?(actor.frame.anchor.y-actor.frame.seatContact.y)*multiplier/18:7*multiplier/18;
 const hip=view.project(position,attachment+hipHeight),seat=view.project({x:5,y:7.48},.77*ratio);
 rows.push({characterId:seatedCharacter,source,multiplier,yaw,scale,ratio,attachment,position,hipScreen:hip,seatScreen:seat,hipSeatGapWorld:attachment+hipHeight-.77*ratio,shoulderHeight:attachment+hipHeight+11*multiplier/18,tableHeight:1.44*ratio,actorDrawBeforeTable:true,visibleTorsoPixels:visibleBodyPixels.size,totalTorsoPixels:bodyPixels.size,footLiftNativePixels:attachment*18,sampleFrame:actor.frameId});
}
for(const [i,characterId]of ['player','lin-jie','xiao-li','zhang-laoshi','xiao-zhou'].entries()) {
 const view={project(p,z=0){return{x:90+i*180+(p.x-p.y)*scale,y:135+(p.x+p.y)*scale*.5-z*scale};},reducedMotion:true};
 const sample=sampleActor({characterId,facing:'south',yaw:Math.PI/4,action:'idle',elapsedMs:0,reducedMotion:true,heldObject:characterId==='player'?'tray':undefined});
 drawPerson(ctx,sample,view,{x:0,y:0});
}
const seedView={project:p=>p,playerPosition:{x:20,y:20}};
const door=residentialObjects(hallMap,seedView).find(o=>o.id==='residential-hall.west-threshold');
const bed=renderFurnitureObjects(apartmentState())[0];
const bench=workshopObjects(workshopMap,seedView).find(o=>o.id==='workshop.lamp-bench');
for(const [i,item]of [door,bed,bench].entries()) {
 const center=item.position;
 const view={project(p,z=0){return{x:160+i*320+((p.x-center.x)-(p.y-center.y))*scale,y:620+((p.x-center.x)+(p.y-center.y))*scale*.5-z*scale};},playerPosition:{x:20,y:20},elapsedMs:0,reducedMotion:true,pass:'objects'};
 item.draw(ctx,view);
 const sample=sampleActor({characterId:i===1?'lin-jie':'player',facing:'south',yaw:Math.PI/4,action:'idle',elapsedMs:0,reducedMotion:true});
 drawPerson(ctx,sample,view,{x:center.x+(i===2?3.8:2.8),y:center.y+.5});
}
Object.assign(window,{seatProof:rows});document.body.dataset.rendered='true';
