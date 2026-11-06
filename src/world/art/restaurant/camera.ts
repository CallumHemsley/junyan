import {cameraForMap,frameCamera,type Camera} from '../../camera';
import type {Point} from '../../schema';

/** A small dining room gets a composed overview; narrow phones retain a readable walking window. */
export function restaurantCamera(bounds:{width:number;height:number},position:Point,width:number,height:number,insetBottom=0,insetRight=0):Camera {
  const available={x:0,y:0,width:Math.max(.35,(width-insetRight)/width),height:Math.max(.35,(height-Math.max(66,insetBottom))/height)};
  const frame=[{x:.65,y:.65,z:3.68},{x:bounds.width-1,y:.65,z:3.68},{x:.65,y:bounds.height-1,z:3.68},{x:bounds.width-1,y:bounds.height-1,z:0}];
  const overview=frameCamera(frame,width,height,available,18);
  if(overview.scale>=11)return overview;
  // Reading a face takes precedence over fitting every corner on a narrow screen.
  return cameraForMap(bounds,position,width,height,11,Math.max(66,insetBottom),insetRight);
}
