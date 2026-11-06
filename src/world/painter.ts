import { createRenderer, characterFigure } from "../scene/renderer.js";
import type { WorldMapDefinition, Point, Facing } from "./schema";
import type { WorldRenderView, WorldArtModule } from "./render-contract";
const art=import.meta.glob<WorldArtModule>("./art/*/index.ts",{eager:true});
const colors:Record<string,string>={wood:"#9c805e",stone:"#9aab9d",grass:"#68834f",water:"#4f8593",sand:"#baac7d",dirt:"#9b8a63",path:"#b5a780",tile:"#9fada2"};
const hash=(x:number,y:number)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
function polygon(ctx:CanvasRenderingContext2D,points:Point[],color:string) {ctx.fillStyle=color;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(Math.round(p.x),Math.round(p.y)):ctx.moveTo(Math.round(p.x),Math.round(p.y)));ctx.closePath();ctx.fill();}
function floor(ctx:CanvasRenderingContext2D,view:WorldRenderView,x:number,y:number,w:number,h:number,color:string,z=0) {
 polygon(ctx,[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}].map(p=>view.project(p,z)),color);
}
function box(ctx:CanvasRenderingContext2D,view:WorldRenderView,p:Point,w:number,h:number,z:number,color:string) {
 const a=view.project(p),b=view.project({x:p.x+w,y:p.y}),c=view.project({x:p.x+w,y:p.y+h}),d=view.project({x:p.x,y:p.y+h});
 const at=view.project(p,z),bt=view.project({x:p.x+w,y:p.y},z),ct=view.project({x:p.x+w,y:p.y+h},z),dt=view.project({x:p.x,y:p.y+h},z);
 polygon(ctx,[b,c,ct,bt],"#574c42");polygon(ctx,[c,d,dt,ct],"#796953");polygon(ctx,[at,bt,ct,dt],color);
 ctx.strokeStyle="#544b3c";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(at.x,at.y);ctx.lineTo(bt.x,bt.y);ctx.lineTo(ct.x,ct.y);ctx.lineTo(dt.x,dt.y);ctx.closePath();ctx.stroke();void a;
}
const sprites=new Map<string,HTMLCanvasElement>();
function actorSprite(facing:Facing,phase:number):HTMLCanvasElement {
 const key=`${facing}-${phase}`;const cached=sprites.get(key);if(cached)return cached;
 const canvas=document.createElement("canvas");
 const yaw={north:-Math.PI/2,east:0,south:Math.PI/2,west:Math.PI}[facing];
 const renderer=createRenderer(canvas,{bake(api){api.zb.fill(-1e9);},draw(api){characterFigure(0,0,yaw,{stance:phase===0?0:phase===1?.23:-.23},{shirt:[225,210,168],hair:[65,48,39],legs:[66,68,65],accessory:"waiter"},api.dynamicAdd);}});
 renderer.draw();sprites.set(key,canvas);return canvas;
}
export function drawPlayer(ctx:CanvasRenderingContext2D,view:WorldRenderView,p:Point,facing:Facing,moving:boolean,scale:number) {
 const at=view.project(p),phase=moving&&!view.reducedMotion?Math.floor(view.elapsedMs/150)%2+1:0;
 ctx.fillStyle="#203d3744";ctx.beginPath();ctx.ellipse(at.x,at.y+2,scale*.45,scale*.2,0,0,Math.PI*2);ctx.fill();
 const sprite=actorSprite(facing,phase),factor=scale/12.73;
 ctx.drawImage(sprite,151,99,58,64,Math.round(at.x-29*factor),Math.round(at.y-51*factor),58*factor,64*factor);
}
export function paintWorld(ctx:CanvasRenderingContext2D,map:WorldMapDefinition,view:WorldRenderView,facing:Facing,moving:boolean,scale:number) {
 ctx.fillStyle="#334d47";ctx.fillRect(0,0,view.width,view.height);ctx.imageSmoothingEnabled=false;
 for(const terrain of map.terrain) {
  const r=terrain.rect;
  for(let x=r.x;x<r.x+r.width;x++)for(let y=r.y;y<r.y+r.height;y++) {
   const p=view.project({x,y});if(p.x < -scale*3||p.x>view.width+scale*3||p.y < -scale*3||p.y>view.height+scale*3)continue;
   const color=colors[terrain.material]??(terrain.material.includes("grass")?colors.grass:terrain.material.includes("water")?colors.water:colors.stone);
   floor(ctx,view,x,y,Math.min(1,r.x+r.width-x),Math.min(1,r.y+r.height-y),color);
   const n=hash(x,y);ctx.fillStyle=n>.5?"#ffffff0c":"#182e2712";ctx.fillRect(Math.round(p.x),Math.round(p.y),2+n*3,1);
  }
 }
 for(const module of Object.values(art))module.drawMap?.(ctx,map,{...view,pass:"ground"});
 const custom=Object.values(art).flatMap(module=>module.renderObjects?.(map,view)??[]);
 const customIds=new Set(custom.map(object=>object.id));
 const objects=[...map.props.filter(p=>p.layer!=="ground"&&!customIds.has(p.id)).map(prop=>({depth:prop.position.x+prop.position.y+prop.width/2+prop.height/2,draw:()=>{
  const p=view.project(prop.position);if(p.x < -200||p.x>view.width+200||p.y < -200||p.y>view.height+300)return;
  const behind=map.occluders.some(o=>o.fadeWhenPlayerBehind&&o.id===prop.id&&view.playerPosition.x+view.playerPosition.y<prop.position.x+prop.position.y);
  ctx.globalAlpha=behind?.45:1;
  if(/tree|bamboo|plant/.test(prop.kind)) {
   box(ctx,view,prop.position,.2,.2,1.8,"#695844");
   for(let i=0;i<3;i++){const at=view.project({x:prop.position.x+(i-1)*.35,y:prop.position.y},2+i*.5);ctx.fillStyle=["#385e44","#557c4d","#789454"][i];ctx.beginPath();ctx.ellipse(at.x,at.y,scale*(1.1-i*.13),scale*.8,0,0,Math.PI*2);ctx.fill();}
  }else {const height=/building|house|wall|shed/.test(prop.kind)?3.4:/table|bench|counter/.test(prop.kind)?1.1:.65;box(ctx,view,prop.position,prop.width,prop.height,height,/roof|building|house/.test(prop.kind)?"#62756b":"#aa9167");}
  ctx.globalAlpha=1;
 }})),{depth:view.playerPosition.x+view.playerPosition.y,draw:()=>drawPlayer(ctx,view,view.playerPosition,facing,moving,scale)}];
 for(const object of custom) objects.push({depth:object.depth??object.position.x+object.position.y,draw:()=>{
  ctx.save();
  const occlusion=object.occlusion;
  if(occlusion?.fadeWhenPlayerBehind && view.playerPosition.x+view.playerPosition.y<object.position.x+object.position.y)ctx.globalAlpha=.45;
  object.draw(ctx,view);ctx.restore();
 }});
 for(const module of Object.values(art))module.drawMap?.(ctx,map,{...view,pass:"objects"});
 objects.sort((a,b)=>a.depth-b.depth).forEach(object=>object.draw());
 for(const module of Object.values(art))module.drawMap?.(ctx,map,{...view,pass:"foreground"});
}
