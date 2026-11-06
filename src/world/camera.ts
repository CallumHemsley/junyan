import type { Point, Rect } from "./schema";
export type FramePoint = Point & { z: number };
export type Camera = { focus: Point; focusZ?:number; width:number; height:number; scale:number; offsetY?:number; offsetX?:number };
export function project(point:Point,camera:Camera,z=0):Point {
  const x=point.x-camera.focus.x,y=point.y-camera.focus.y;
  return {x:camera.width/2+(x-y)*camera.scale+(camera.offsetX??0),y:camera.height/2+(x+y)*camera.scale*.5-(z-(camera.focusZ??0))*camera.scale+(camera.offsetY??0)};
}
export function unprojectAtHeight(point:Point,camera:Camera,z:number):Point {
  const u=(point.x-camera.width/2-(camera.offsetX??0))/camera.scale,v=(point.y-camera.height/2-(camera.offsetY??0)+(z-(camera.focusZ??0))*camera.scale)/(camera.scale*.5);
  return {x:camera.focus.x+(u+v)/2,y:camera.focus.y+(v-u)/2};
}
export function unproject(point:Point,camera:Camera):Point { return unprojectAtHeight(point,camera,0); }
export function pointerGround(client:Point,rect:{left:number;top:number;width:number;height:number},camera:Camera):Point {
  return unproject({x:(client.x-rect.left)*camera.width/rect.width,y:(client.y-rect.top)*camera.height/rect.height},camera);
}

export function cameraForMap(bounds:{width:number;height:number},position:Point,width:number,height:number,scale:number,insetBottom=0,insetRight=0,focusZ=0):Camera {
 const safeWidth=Math.max(width*.35,width-insetRight);
 const safeHeight=Math.max(height*.35,height-insetBottom);
 const minX=-bounds.height*scale,maxX=bounds.width*scale,maxY=(bounds.width+bounds.height)*scale*.5;
 const clamp=(n:number,min:number,max:number)=>min>max?(min+max)/2:Math.max(min,Math.min(max,n));
 const x=clamp((position.x-position.y)*scale,minX+safeWidth/2,maxX-safeWidth/2);
 const y=clamp((position.x+position.y)*scale*.5,safeHeight/2,maxY-safeHeight/2);
 return {focusZ,focus:{x:(x/scale+y/(scale*.5))/2,y:(y/(scale*.5)-x/scale)/2},width,height,scale,offsetY:(safeHeight-height)/2,offsetX:(safeWidth-width)/2};
}

// Canvas units are half CSS pixels; the portrait ground window sits above the 132px control strip.
export function explorationCamera(bounds:{width:number;height:number},position:Point,width:number,height:number,insetBottom=0,insetRight=0,focusZ=0):Camera {
 const portrait=width<300&&height>width;
 if(!portrait)return cameraForMap(bounds,position,width,height,width<300?11:15,insetBottom,insetRight,focusZ);
 const availableHeight=Math.max(height*.35,height-Math.max(66,insetBottom));
 // A room that already fits should keep its overview rather than acquire empty cutaway above it.
 if((bounds.width+bounds.height)*11*.5<=availableHeight)return cameraForMap(bounds,position,width,height,11,Math.max(66,insetBottom),insetRight,focusZ);
 const localHeight=Math.min(width,availableHeight);
 const camera=cameraForMap(bounds,position,width,localHeight,11,0,insetRight,focusZ);
 return {...camera,height,offsetY:(camera.offsetY??0)+availableHeight-localHeight/2-height/2};
}

/** Fit explicit world geometry into the visible area; player state and projection stay independent. */
export function frameCamera(frame:readonly FramePoint[],width:number,height:number,available:Rect,maxScale:number):Camera {
 const xs=frame.map(p=>p.x-p.y),ys=frame.map(p=>(p.x+p.y)*.5-p.z);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const safeWidth=available.width*width,safeHeight=available.height*height;
 const gutter=Math.min(12,safeWidth/4,safeHeight/4);
 const scale=Math.min(maxScale,Math.max(1,safeWidth-gutter*2)/Math.max(1,maxX-minX),Math.max(1,safeHeight-gutter*2)/Math.max(1,maxY-minY));
 const x=(minX+maxX)/2,y=(minY+maxY)/2;
 return {focus:{x:x/2+y,y:y-x/2},width,height,scale,offsetX:(available.x+available.width/2)*width-width/2,offsetY:(available.y+available.height/2)*height-height/2};
}
