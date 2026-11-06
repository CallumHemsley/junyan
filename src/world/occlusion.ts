import type {Point,Rect} from "./schema";
export function occludesPlayer(occluder:{rect:Rect;height:number},player:Point):boolean {
 const r=occluder.rect;
 for(const z of [.4,.9,1.4,1.9,2.2]) {
  const near=Math.max(r.x-player.x,r.y-player.y,0);
  const far=Math.min(r.x+r.width-player.x,r.y+r.height-player.y,occluder.height-z);
  if(near<=far)return true;
 }
 return false;
}
