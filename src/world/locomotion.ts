import type {Point,WorldMapDefinition} from "./schema";
import {movePlayer} from "./geometry";
export function advanceRoute(map:WorldMapDefinition,from:Point,route:readonly Point[],seconds:number,speed=5):{position:Point;remaining:Point[];blocked:boolean} {
 const remaining=[...route];let position=from,budget=Math.max(0,Math.min(seconds,.1))*speed;
 while(remaining.length) {
  const target=remaining[0],dx=target.x-position.x,dy=target.y-position.y,distance=Math.hypot(dx,dy);
  if(distance<1e-7){remaining.shift();continue;}
  if(budget<=0)break;
  const amount=Math.min(distance,budget),next=movePlayer(map,position,{x:dx/distance*amount,y:dy/distance*amount});
  const travelled=Math.hypot(next.x-position.x,next.y-position.y);
  if(travelled<1e-7)return {position,remaining:[],blocked:true};
  position=next;budget-=amount;
  if(Math.hypot(target.x-position.x,target.y-position.y)<1e-7)remaining.shift();
  else break;
 }
 return {position,remaining,blocked:false};
}
