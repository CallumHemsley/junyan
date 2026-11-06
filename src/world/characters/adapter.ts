import type {ActorSample} from './index';
import type {RGB} from './artwork.mjs';

export type ActorSurface = {
  project(x:number,y:number,z:number):{sx:number;sy:number;d:number};
  pixel(x:number,y:number,depth:number,color:RGB):void;
  shadow?(x:number,y:number,z:number,radius:number,strength:number):void;
};
export type ActorPosition = {x:number;y:number;z?:number};

export function paintActor(surface:ActorSurface,sample:ActorSample,position:ActorPosition,nativePixelsPerTile=18):void {
  const base=position.z??0;
  surface.shadow?.(position.x,position.y,base,.40,.22);
  for(const foot of sample.frame.feet)if(foot.planted) {
    const side=(foot.x-sample.frame.anchor.x)/nativePixelsPerTile/Math.SQRT2;
    surface.shadow?.(position.x+side,position.y-side,base,.13,.65);
  }
  for(const span of sample.drawCommands)for(let i=0;i<span.width;i++) {
    const horizontal=(span.x+i)/nativePixelsPerTile/Math.SQRT2;
    const elevation=-span.y/nativePixelsPerTile/(Math.sqrt(3)/2);
    const p=surface.project(position.x+horizontal,position.y-horizontal,base+elevation);
    surface.pixel(Math.round(p.sx),Math.round(p.sy),p.d,span.color);
  }
}

export function paintActorCanvas(context:CanvasRenderingContext2D,sample:ActorSample,x:number,y:number,scale=1):void {
  context.save();
  context.imageSmoothingEnabled=false;
  context.fillStyle='rgba(48,43,42,.18)';
  context.beginPath();context.ellipse(x,y-1,8*scale,3*scale,0,0,Math.PI*2);context.fill();
  for(const command of sample.drawCommands) {
    context.fillStyle=`rgb(${command.color.join(',')})`;
    context.fillRect(Math.round(x+command.x*scale),Math.round(y+command.y*scale),command.width*scale,scale);
  }
  context.restore();
}
