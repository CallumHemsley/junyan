import {surfaceHeight,atFeet} from "./surfaces";
import {selectArtModules,artModules} from "./art-registry";
import {worldViewBounds} from "./culling";
import {workshopAtmosphereHooks} from "./art/workshop/lighting";
import {RESTAURANT_FURNITURE_PROFILE,restaurantObjects} from "./art/restaurant";
import {content} from "../content";
import {restaurantPresentation} from "./restaurant-view";
import {drawLifeActor,drawLifeReactions} from "./life";
import {colorShader} from "./lighting";
import {occludesPlayer} from "./occlusion";
import {sampleActor,drawActor} from "./characters";
import {actorsFor} from "./life-bridge";
import {sampleAtmosphere} from "./atmosphere";
import {atmosphereHooksForMap} from "./atmosphere/map-hooks";
import {drawAtmosphere,renderAtmosphereObjects} from "./atmosphere/canvas";
import {drawFurniture,renderFurnitureObjects} from "./art/residential";
import {createWorkshopArt} from "./art/workshop";
import type {GameState} from "../contracts";
import type {WorldState} from "./schema";
import type { WorldMapDefinition, Point, Facing } from "./schema";
import type { WorldRenderView, WorldArtModule } from "./render-contract";
const colors:Record<string,string>={wood:"#9c805e",stone:"#9aab9d",grass:"#68834f",water:"#4f8593",sand:"#baac7d",dirt:"#9b8a63",path:"#b5a780",tile:"#9fada2"};
const hash=(x:number,y:number)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
function polygon(ctx:CanvasRenderingContext2D,points:Point[],color:string) {ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(Math.round(p.x),Math.round(p.y)):ctx.moveTo(Math.round(p.x),Math.round(p.y)));ctx.closePath();ctx.fill();}
function floor(ctx:CanvasRenderingContext2D,view:WorldRenderView,x:number,y:number,w:number,h:number,color:string,z=0) {
 polygon(ctx,[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}].map(p=>view.project(p,z)),view.shadeColor?.(color)??color);
}
function box(ctx:CanvasRenderingContext2D,view:WorldRenderView,p:Point,w:number,h:number,z:number,color:string) {
 const a=view.project(p),b=view.project({x:p.x+w,y:p.y}),c=view.project({x:p.x+w,y:p.y+h}),d=view.project({x:p.x,y:p.y+h});
 const at=view.project(p,z),bt=view.project({x:p.x+w,y:p.y},z),ct=view.project({x:p.x+w,y:p.y+h},z),dt=view.project({x:p.x,y:p.y+h},z);
 polygon(ctx,[b,c,ct,bt],view.shadeColor?.("#574c42")??"#574c42");polygon(ctx,[c,d,dt,ct],view.shadeColor?.("#796953")??"#796953");polygon(ctx,[at,bt,ct,dt],view.shadeColor?.(color)??color);
 ctx.strokeStyle="#544b3c";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(at.x,at.y);ctx.lineTo(bt.x,bt.y);ctx.lineTo(ct.x,ct.y);ctx.lineTo(dt.x,dt.y);ctx.closePath();ctx.stroke();void a;
}
export function drawPlayer(ctx:CanvasRenderingContext2D,view:WorldRenderView,p:Point,facing:Facing,moving:boolean,_scale:number,motion?:{yaw:number;distanceTravelled:number},carrying=false) {
 const sample=sampleActor({characterId:"player",facing,action:moving?"walk":"idle",elapsedMs:view.elapsedMs,reducedMotion:view.reducedMotion,yaw:motion?.yaw,distanceTravelled:motion?.distanceTravelled,heldObject:carrying?"tray":undefined});
 drawActor(ctx,{...view,pass:"objects"},sample,p);
}
export function paintWorld(ctx:CanvasRenderingContext2D,map:WorldMapDefinition,view:WorldRenderView,facing:Facing,moving:boolean,scale:number,game?:GameState,world?:WorldState,motion?:{yaw:number;distanceTravelled:number}) {
 const baseHooks=hooksFor(map),hooks=map.id==="workshop"&&game?.neighbourhood?workshopAtmosphereHooks(map,game.neighbourhood.repairs,baseHooks):baseHooks;
 const atmosphere=sampleAtmosphere({mapId:map.id,day:game?.day??1,timeOfDay:(game?.served??0)<2?"morning":(game?.served??0)<3?"noon":(game?.served??0)<4?"evening":"night",seed:game?.seed??42,elapsedMs:view.elapsedMs,reducedMotion:view.reducedMotion},hooks,worldViewBounds(view));
 const shadeColor=colorShader(atmosphere.light);view={...view,shadeColor};
 const modules=selectArtModules(artModules,map.id).filter(module=>module!==artModules["./art/workshop/index.ts"]);
 if(map.id==="workshop"&&game?.neighbourhood)modules.push(createWorkshopArt(game.neighbourhood.repairs));
 ctx.fillStyle="#334d47";ctx.fillRect(0,0,view.width,view.height);ctx.imageSmoothingEnabled=false;
 for(const terrain of modules.length?[]:map.terrain) {
  const r=terrain.rect;
  for(let x=r.x;x<r.x+r.width;x++)for(let y=r.y;y<r.y+r.height;y++) {
   const p=view.project({x,y});if(p.x < -scale*3||p.x>view.width+scale*3||p.y < -scale*3||p.y>view.height+scale*3)continue;
   const color=colors[terrain.material]??(terrain.material.includes("grass")?colors.grass:terrain.material.includes("water")?colors.water:colors.stone);
   floor(ctx,view,x,y,Math.min(1,r.x+r.width-x),Math.min(1,r.y+r.height-y),color);
   const n=hash(x,y);ctx.fillStyle=n>.5?"#ffffff0c":"#182e2712";ctx.fillRect(Math.round(p.x),Math.round(p.y),2+n*3,1);
  }
 }
 const restaurant=map.id==="restaurant"&&game?restaurantPresentation(game,map):null;
 for(const module of modules)module.drawMap?.(ctx,map,{...view,pass:"ground"});
 if(map.id==="apartment"&&game?.neighbourhood)drawFurniture(ctx,game.neighbourhood.apartment,{...view,pass:"ground"});
 drawAtmosphere(ctx,atmosphere,{...view,pass:"ground"});
 const custom=[...modules.flatMap(module=>module.renderObjects?.(map,view)??[]),...renderAtmosphereObjects(atmosphere),...(restaurant?restaurantObjects(map,view,restaurant):[]),...(map.id==="apartment"&&game?.neighbourhood?renderFurnitureObjects(game.neighbourhood.apartment):[])];
 const customIds=new Set(custom.map(object=>object.id));
 const objects=[...(modules.length?[]:map.props).filter(p=>p.layer!=="ground"&&!customIds.has(p.id)).map(prop=>({depth:prop.position.x+prop.position.y+prop.width/2+prop.height/2,draw:()=>{
  const p=view.project(prop.position);if(p.x < -200||p.x>view.width+200||p.y < -200||p.y>view.height+300)return;
  const behind=map.occluders.some(o=>o.fadeWhenPlayerBehind&&o.id===prop.id&&occludesPlayer(o,view.playerPosition));
  ctx.globalAlpha=behind?.45:1;
  if(/tree|bamboo|plant/.test(prop.kind)) {
   box(ctx,view,prop.position,.2,.2,1.8,"#695844");
   for(let i=0;i<3;i++){const at=view.project({x:prop.position.x+(i-1)*.35,y:prop.position.y},2+i*.5);ctx.fillStyle=["#385e44","#557c4d","#789454"][i];ctx.beginPath();ctx.ellipse(at.x,at.y,scale*(1.1-i*.13),scale*.8,0,0,Math.PI*2);ctx.fill();}
  }else {const height=/building|house|wall|shed/.test(prop.kind)?3.4:/table|bench|counter/.test(prop.kind)?1.1:.65;box(ctx,view,prop.position,prop.width,prop.height,height,/roof|building|house/.test(prop.kind)?"#62756b":"#aa9167");}
  ctx.globalAlpha=1;
 }})),{depth:view.playerPosition.x+view.playerPosition.y,draw:()=>drawPlayer(ctx,atFeet(view,surfaceHeight(map.id,view.playerPosition)),view.playerPosition,facing,moving,scale,motion,(game?.tray.length??0)>0)}];
 for(const object of custom) objects.push({depth:object.depth??object.position.x+object.position.y,draw:()=>{
  ctx.save();
  const occlusion=object.occlusion;
  if(occlusion?.fadeWhenPlayerBehind && occludesPlayer(occlusion,view.playerPosition))ctx.globalAlpha=.45;
  object.draw(ctx,view);ctx.restore();
 }});
 if(restaurant)for(const customer of restaurant.customers)objects.push({depth:customer.position.x+customer.position.y,draw:()=>drawActor(ctx,atFeet({...view,pass:"objects"},surfaceHeight(map.id,customer.position)),sampleActor({characterId:customer.characterId,facing:customer.facing,action:"idle",posture:"sit",seatHeight:customer.seatHeight,handRestHeight:RESTAURANT_FURNITURE_PROFILE.tableTop,elapsedMs:view.elapsedMs,reducedMotion:view.reducedMotion}),customer.position)});
 const actors=game&&world?actorsFor(map,game,world,view.elapsedMs,view.reducedMotion):[];
 for(const actor of actors)objects.push({depth:actor.position.x+actor.position.y,draw:()=>drawLifeActor(ctx,actor,atFeet(view,surfaceHeight(map.id,actor.position)),(_ctx,resident,_lifeView,posture)=>drawActor(ctx,atFeet({...view,pass:"objects"},surfaceHeight(map.id,resident.position)),sampleActor({characterId:resident.characterId,facing:resident.facing,yaw:resident.yaw,action:resident.action,elapsedMs:view.elapsedMs,reducedMotion:view.reducedMotion,posture}),resident.position),world?.life)});
 for(const module of modules)module.drawMap?.(ctx,map,{...view,pass:"objects"});
 objects.sort((a,b)=>a.depth-b.depth).forEach(object=>object.draw());
 for(const module of modules)module.drawMap?.(ctx,map,{...view,pass:"foreground"});
 drawAtmosphere(ctx,atmosphere,{...view,pass:"foreground"});
 if(world?.life)drawLifeReactions(ctx,world.life,map.id,[...map.landmarks,...actors],view);
}

const hookCache=new WeakMap<WorldMapDefinition,ReturnType<typeof atmosphereHooksForMap>>();
function hooksFor(map:WorldMapDefinition) {let hooks=hookCache.get(map);if(!hooks){hooks=atmosphereHooksForMap(map);hookCache.set(map,hooks);}return hooks;}
