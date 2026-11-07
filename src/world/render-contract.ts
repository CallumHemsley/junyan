import type { Point, WorldMapDefinition } from "./schema";
export type WorldRenderView = {
  project(point:Point,z?:number):Point;
  shadeColor?: import("./lighting").ShadeColor;
  castLight?: Pick<import("./atmosphere").LightState,"shadowOffset"|"shadowOpacity"|"shadow"> & Partial<Pick<import("./atmosphere").LightState,"lampStrength">>;
  elapsedMs:number;
  reducedMotion:boolean;
  playerPosition:Point;
  width:number;
  height:number;
  pass:"ground"|"objects"|"foreground";
};
export type DrawMap = (ctx:CanvasRenderingContext2D,map:WorldMapDefinition,view:WorldRenderView)=>void;
export type WorldRenderObject = {
 id:string;
 position:Point;
 depth?:number;
 occlusion?:{rect:{x:number;y:number;width:number;height:number};height:number;fadeWhenPlayerBehind:boolean};
 draw(ctx:CanvasRenderingContext2D,view:WorldRenderView):void;
};
export type WorldArtModule = {
 drawMap?:DrawMap;
 renderObjects?:(map:WorldMapDefinition,view:WorldRenderView)=>WorldRenderObject[];
};
export type WorldDrawCommand =
 | {kind:"ellipse";position:Point;z?:number;radiusX:number;radiusY:number;color:string;alpha?:number}
 | {kind:"line";from:Point;to:Point;z?:number;width:number;color:string;alpha?:number}
 | {kind:"polygon";points:Point[];z?:number;color:string;alpha?:number};
export function drawCommands(ctx:CanvasRenderingContext2D,view:WorldRenderView,commands:readonly WorldDrawCommand[]) {
 for(const command of commands) {
  ctx.save();ctx.globalAlpha=command.alpha??1;ctx.fillStyle=view.shadeColor?.(command.color)??command.color;ctx.strokeStyle=view.shadeColor?.(command.color)??command.color;
  if(command.kind==="ellipse") {const p=view.project(command.position,command.z);ctx.beginPath();ctx.ellipse(p.x,p.y,command.radiusX,command.radiusY,0,0,Math.PI*2);ctx.fill();}
  else if(command.kind==="line") {const a=view.project(command.from,command.z),b=view.project(command.to,command.z);ctx.lineWidth=command.width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  else {ctx.beginPath();command.points.forEach((point,index)=>{const p=view.project(point,command.z);if(index)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();ctx.fill();}
  ctx.restore();
 }
}
