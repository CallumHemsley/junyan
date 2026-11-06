import type { Point } from "./schema";
export type Camera = { focus: Point; width:number; height:number; scale:number };
export function project(point:Point,camera:Camera,z=0):Point {
  const x=point.x-camera.focus.x,y=point.y-camera.focus.y;
  return {x:camera.width/2+(x-y)*camera.scale,y:camera.height/2+(x+y)*camera.scale*.5-z*camera.scale};
}
export function unproject(point:Point,camera:Camera):Point {
  const u=(point.x-camera.width/2)/camera.scale,v=(point.y-camera.height/2)/(camera.scale*.5);
  return {x:camera.focus.x+(u+v)/2,y:camera.focus.y+(v-u)/2};
}
export function pointerGround(client:Point,rect:{left:number;top:number;width:number;height:number},camera:Camera):Point {
  return unproject({x:(client.x-rect.left)*camera.width/rect.width,y:(client.y-rect.top)*camera.height/rect.height},camera);
}
