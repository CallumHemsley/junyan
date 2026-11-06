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

export function overlapsPaint(a:Rect,b:Rect):boolean {
 return a.width>0&&a.height>0&&b.width>0&&b.height>0&&a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
}
export function canFadeOccluder(occluder:{rect:Rect;height:number},player:Point,playerDrawn:boolean,playerBounds:Rect,paintedBounds?:Rect):boolean {
 return playerDrawn&&(!paintedBounds||overlapsPaint(playerBounds,paintedBounds))&&occludesPlayer(occluder,player);
}
