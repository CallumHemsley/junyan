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

export function cameraForMap(bounds:{width:number;height:number},position:Point,width:number,height:number,scale:number):Camera {
 const minX=-bounds.height*scale,maxX=bounds.width*scale,maxY=(bounds.width+bounds.height)*scale*.5;
 const clamp=(n:number,min:number,max:number)=>min>max?(min+max)/2:Math.max(min,Math.min(max,n));
 const x=clamp((position.x-position.y)*scale,minX+width/2,maxX-width/2);
 const y=clamp((position.x+position.y)*scale*.5,height/2,maxY-height/2);
 return {focus:{x:(x/scale+y/(scale*.5))/2,y:(y/(scale*.5)-x/scale)/2},width,height,scale};
}
