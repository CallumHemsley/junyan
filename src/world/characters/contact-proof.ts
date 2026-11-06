import {worldMaps} from '../registry';
import {project} from '../camera';
import {renderObjects,drawMap} from '../art/restaurant';
import {sampleActor,drawActor,actorContactMetrics,type ActorInput} from './index';
import {paintActorCanvas} from './adapter';
import type {WorldRenderView} from '../render-contract';
const map=worldMaps.restaurant,table=map.props.find(prop=>prop.id==='table-5-9')!;
const camera={focus:{x:5,y:8.5},width:360,height:280,scale:44};
const position={x:table.position.x+table.width/2,y:table.position.y-.52};
const cases=[{id:'before',label:'原来：身体低于椅面',seatHeight:undefined,furnitureScale:1},{id:'attached',label:'椅面连接：保留现有桌椅',seatHeight:.77,furnitureScale:1},{id:'proportion',label:'比例候选：桌椅高度七成二',seatHeight:.77*.72,furnitureScale:.72}];
const results=[];
for(const test of cases) {
 const figure=document.createElement('figure'),caption=document.createElement('figcaption'),canvas=document.createElement('canvas');
 caption.textContent=test.label;canvas.id=test.id;canvas.width=360;canvas.height=280;figure.append(caption,canvas);document.querySelector('#seats')!.append(figure);
 const context=canvas.getContext('2d')!;context.fillStyle='#d7d6bc';context.fillRect(0,0,360,280);
 const view:WorldRenderView={project:(point,z)=>project(point,camera,z),elapsedMs:0,reducedMotion:true,playerPosition:position,width:360,height:280,pass:'ground'};
 const furnitureView={...view,project:(point:{x:number;y:number},z=0)=>project(point,camera,z*test.furnitureScale)};
 drawMap(context,map,furnitureView);
 const sample=sampleActor({characterId:'lin-jie',facing:'south',action:'idle',posture:'sit',seatHeight:test.seatHeight,handRestHeight:test.seatHeight===undefined?undefined:1.44*test.furnitureScale,elapsedMs:0,reducedMotion:true});
 const objects=renderObjects(map,furnitureView).filter(object=>object.id===table.id).map(object=>({depth:object.depth??object.position.x+object.position.y,draw:()=>object.draw(context,furnitureView)}));
 objects.push({depth:position.x+position.y,draw:()=>drawActor(context,view,sample,position)});
 objects.sort((a,b)=>a.depth-b.depth).forEach(object=>object.draw());
 results.push({id:test.id,position,camera,tableTop:1.44*test.furnitureScale,seatHeight:test.seatHeight,seatContact:sample.frame.seatContact,contacts:actorContactMetrics(sample),scope:test.id==='attached'?'Actual production table/stool primitives, explicit actor attachment. Foundation still must wire the field.':test.id==='proportion'?'Owned scale prototype only, no production furniture edit.':'Actual old unbound sit geometry.'});
}
const aunt=document.querySelector<HTMLCanvasElement>('#aunt')!,context=aunt.getContext('2d')!;
context.fillStyle='#d7d6bc';context.fillRect(0,0,aunt.width,aunt.height);
for(let row=0;row<3;row++)for(let direction=0;direction<8;direction++) {
 const input:ActorInput={characterId:'aunt',facing:'east',yaw:Math.PI/4-direction*Math.PI/4,action:row===1?'walk':'idle',posture:row===2?'work':'stand',elapsedMs:row===1?130:260,reducedMotion:false};
 paintActorCanvas(context,sampleActor(input),20+direction*40,48+row*52);
}
Object.assign(window,{__CONTACT_PROOF__:results});
