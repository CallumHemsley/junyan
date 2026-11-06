import type {WorldRenderView,WorldDrawCommand,WorldRenderObject} from '../render-contract';
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

export function paintActorCanvas(context:CanvasRenderingContext2D,sample:ActorSample,x:number,y:number,scale=1,shadeColor:(base:RGB)=>string=color=>`rgb(${color.join(',')})`):void {
  context.save();
  context.imageSmoothingEnabled=false;
  context.save();context.globalAlpha*=.18;context.fillStyle=shadeColor([48,43,42]);
  context.beginPath();context.ellipse(x,y-1,8*scale,3*scale,0,0,Math.PI*2);context.fill();
  context.restore();context.save();context.globalAlpha*=.28;context.fillStyle=shadeColor([48,43,42]);
  for(const foot of sample.frame.feet)if(foot.planted) {
    const left=Math.round(x+(foot.x-sample.frame.anchor.x-2)*scale);
    const right=Math.round(x+(foot.x-sample.frame.anchor.x+2)*scale);
    context.fillRect(left,Math.round(y+(foot.y-sample.frame.anchor.y)*scale),right-left,Math.max(1,Math.round(scale)));
  }
  context.restore();
  for(const command of sample.drawCommands) {
    context.fillStyle=shadeColor(command.color);
    const left=Math.round(x+command.x*scale),top=Math.round(y+command.y*scale);
    const right=Math.round(x+(command.x+command.width)*scale),bottom=Math.round(y+(command.y+1)*scale);
    context.fillRect(left,top,right-left,bottom-top);
  }
  context.restore();
}

export function actorCommands(sample:Pick<ActorSample,'drawCommands'>,position:{x:number;y:number},nativePixelsPerTile=18):WorldDrawCommand[] {
  const world=(x:number,y:number)=>({x:position.x+(x*.5+y)/nativePixelsPerTile,y:position.y+(y-x*.5)/nativePixelsPerTile});
  return sample.drawCommands.map(span=>({kind:'polygon',color:'#'+span.color.map(channel=>channel.toString(16).padStart(2,'0')).join(''),points:[
    world(span.x,span.y),world(span.x+span.width,span.y),world(span.x+span.width,span.y+1),world(span.x,span.y+1),
  ]}));
}

export function drawActor(context:CanvasRenderingContext2D,view:WorldRenderView,sample:ActorSample,position:{x:number;y:number}):void {
  const p=view.project(position),unit=view.project({x:position.x+.5,y:position.y-.5});
  const scale=Math.abs(unit.x-p.x)/18;
  paintActorCanvas(context,sample,p.x,p.y,scale);
}

export function actorObject(id:string,sample:ActorSample,position:{x:number;y:number}):WorldRenderObject {
  return {id,position,depth:position.x+position.y,draw:(context,view)=>drawActor(context,view,sample,position)};
}
