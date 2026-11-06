import {actorCatalog,sampleActor,drawActor,actorContactMetrics,projectActorBounds,type ActorInput} from './index';
import {worldMaps} from '../registry';
import {project} from '../camera';
import {renderObjects as residentialObjects,renderFurnitureObjects} from '../art/residential';
import {renderObjects as workshopObjects} from '../art/workshop';
import {renderObjects as restaurantObjects} from '../art/restaurant';
import {initialState as initialApartment,type State as ApartmentState} from '../../features/apartment/rules';
import {furnitureWorldRect} from '../../features/apartment/world';
import {colorShader} from '../lighting';
import {sampleDayLight} from '../atmosphere';
import type {WorldRenderObject,WorldRenderView} from '../render-contract';
import {content} from '../../content';
const labels:Record<string,string>={player:'我',aunt:'小姨','resident-reader':'读书人','resident-courier':'送件人','resident-groundskeeper':'清扫人','resident-laundry-neighbour':'晒衣邻居','resident-river-walker':'河边散步人',...Object.fromEntries(content.characters.map(c=>[c.id,c.name]))};
const selector=document.querySelector<HTMLSelectElement>('#actor')!;
for(const actor of actorCatalog){const option=document.createElement('option');option.value=actor.id;option.textContent=labels[actor.id]??actor.id;selector.append(option);}selector.value='lin-jie';
const studies=[{id:'contact18',label:'原有十八，椅面已连接',ppu:18},{id:'common15',label:'全体十五，家具不变',ppu:15},{id:'local18',label:'原有十八，局部餐桌椅',ppu:18}] as const;
const apartment=initialApartment();
const chairState:ApartmentState={...apartment,owned:['bed','chair'],placements:[...apartment.placements,{id:'chair',x:3,y:0,rotation:0}]};
const bedRect=furnitureWorldRect(apartment.placements[0],apartment.rugSize),chairRect=furnitureWorldRect(chairState.placements[1],chairState.rugSize);
const hall=worldMaps['residential-hall'],door=hall.props.find(p=>p.kind==='door')!;
const workshop=worldMaps.workshop,bench=workshop.props.find(p=>p.id==='workshop.woodworking')!;
const restaurant=worldMaps.restaurant,table=restaurant.props.find(p=>p.id==='table-5-9')!;
type Reference = {id:string;label:string;center:{x:number;y:number};position:{x:number;y:number};pose:'stand'|'sit'|'work';seat?:number;surface?:number;dimensions:Record<string,number>;objects:(view:WorldRenderView)=>WorldRenderObject[]};
const references:Reference[]=[
 {id:'door',label:'住宅门',center:{x:door.position.x+door.width/2,y:door.position.y+door.height/2},position:{x:door.position.x+door.width+.65,y:door.position.y+door.height+.2},pose:'stand',dimensions:{top:2.9,openingHeight:2.7,width:door.width},objects:view=>residentialObjects(hall,view).filter(o=>o.id===door.id)},
 {id:'chair',label:'住宅椅',center:{x:chairRect.x+chairRect.width/2,y:chairRect.y+chairRect.height/2},position:{x:chairRect.x+chairRect.width/2,y:chairRect.y+chairRect.height*.65},pose:'sit',seat:.85,surface:1.0,dimensions:{seat:.85,back:1.7,width:chairRect.width},objects:()=>renderFurnitureObjects(chairState).filter(o=>o.id==='apartment.furniture.chair')},
 {id:'dining',label:'餐桌与凳',center:{x:table.position.x+table.width/2,y:table.position.y+table.height/2},position:{x:table.position.x+table.width/2,y:table.position.y-.52},pose:'sit',seat:.77,surface:1.44,dimensions:{tableTop:1.44,seat:.77,width:table.width,depth:table.height},objects:view=>restaurantObjects(restaurant,view).filter(o=>o.id===table.id)},
 {id:'workbench',label:'木工作台',center:{x:bench.position.x+bench.width/2,y:bench.position.y+bench.height/2},position:{x:bench.position.x+bench.width/2,y:bench.position.y+bench.height+.55},pose:'work',surface:1.63,dimensions:{top:1.63,width:bench.width,depth:bench.height},objects:view=>workshopObjects(workshop,view).filter(o=>o.id===bench.id)},
 {id:'bed',label:'原有床',center:{x:bedRect.x+bedRect.width/2,y:bedRect.y+bedRect.height/2},position:{x:bedRect.x+bedRect.width+.65,y:bedRect.y+bedRect.height/2},pose:'stand',dimensions:{mattress:.7,headboard:1.24,width:bedRect.width-.28,length:bedRect.height-.28},objects:()=>renderFurnitureObjects(apartment).filter(o=>o.id==='apartment.furniture.bed')},
];
const shader=colorShader(sampleDayLight('morning'));
const requestedScale=Number(new URLSearchParams(location.search).get('scale'));
const cameraScale=requestedScale===18?18:24;
const dpr=window.devicePixelRatio||1;
function drawStudy(){
 const host=document.querySelector('#references')!;host.replaceChildren();
 const records=[];
 for(const reference of references){
  const title=document.createElement('h2');title.textContent=reference.label;host.append(title);
  const row=document.createElement('section');row.className='row';host.append(row);
  for(const study of studies){
   const figure=document.createElement('figure'),caption=document.createElement('figcaption'),canvas=document.createElement('canvas');canvas.width=400*dpr;canvas.height=280*dpr;canvas.dataset.reference=reference.id;canvas.dataset.study=study.id;
   figure.append(canvas,caption);row.append(figure);
   const context=canvas.getContext('2d')!;context.scale(dpr,dpr);context.imageSmoothingEnabled=false;context.fillStyle='#d7d6bc';context.fillRect(0,0,400,280);
   const camera={focus:{x:(reference.center.x+reference.position.x)/2,y:(reference.center.y+reference.position.y)/2},width:400,height:280,scale:cameraScale};
   const view:WorldRenderView={project:(point,z)=>project(point,camera,z),shadeColor:shader,elapsedMs:0,reducedMotion:true,playerPosition:reference.position,width:400,height:280,pass:'objects'};
   const local=study.id==='local18'&&reference.id==='dining';
   const remap=(z:number)=>z<=.77?z/.77*.55:.55+(z-.77)/(1.44-.77)*.45;
   const objectView=local?{...view,project:(point:{x:number;y:number},z=0)=>project(point,camera,remap(z))}:view;
   const seatHeight=local?.55:reference.seat,handRestHeight=local?1:reference.surface;
   const input:ActorInput={characterId:selector.value,facing:reference.id==='dining'?'south':reference.id==='workbench'?'north':'east',action:'idle',posture:reference.pose,seatHeight,handRestHeight,pixelsPerWorldUnit:study.ppu,elapsedMs:0,reducedMotion:true};
   const actor=sampleActor(input),objects=reference.objects(objectView).map(object=>({depth:object.depth??object.position.x+object.position.y,draw:()=>object.draw(context,objectView)}));
   objects.push({depth:reference.position.x+reference.position.y,draw:()=>drawActor(context,view,actor,reference.position)});
   objects.sort((a,b)=>a.depth-b.depth).forEach(object=>object.draw());
   const contacts=actorContactMetrics(actor),standing=sampleActor({...input,posture:'stand',seatHeight:undefined,handRestHeight:undefined}),bounds=projectActorBounds(view,standing,reference.position);
   caption.textContent=`${study.label} · 人高 ${(bounds.height/cameraScale).toFixed(2)} · 骨盆 ${contacts.pelvis.height.toFixed(2)}${seatHeight===undefined?'':` · 椅面 ${seatHeight.toFixed(2)}`}`;
   records.push({reference:reference.id,study:study.id,actorId:selector.value,dpr,pixelsPerWorldUnit:study.ppu,camera,position:reference.position,dimensions:local?{...reference.dimensions,tableTop:1,seat:.55}:reference.dimensions,contacts,standingScreenBounds:bounds,poseScreenBounds:projectActorBounds(view,actor,reference.position),objects:objects.length,scope:local?'Reference-only furniture height remap; production furniture unchanged.':'Existing owned production prop callback and explicit human study; no shared scale/default change.'});
  }
 }
 Object.assign(window,{__REFERENCE_SCALE_STUDY__:{records,actorId:selector.value}});
}
selector.addEventListener('change',drawStudy);drawStudy();
