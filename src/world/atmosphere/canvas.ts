import type {WorldRenderView,WorldRenderObject} from '../render-contract';
import type { AtmosphereCommand, Point } from './index';

export type AtmosphereProject = (point: Point) => {x: number; y: number};

/** The host owns projection, clipping, canvas resolution and the frame loop. */
export function drawAtmosphereLayer(ctx: CanvasRenderingContext2D, commands: readonly AtmosphereCommand[], layer: AtmosphereCommand['layer'], project: AtmosphereProject): number {
  ctx.save();
  const inheritedOpacity=ctx.globalAlpha;
  let drawn=0;
  for(const command of commands) {
    if(command.layer!==layer) continue;
    ctx.globalAlpha=inheritedOpacity*command.opacity;
    ctx.fillStyle=`rgb(${command.color.join(',')})`;
    ctx.beginPath();
    command.points.forEach((point,i)=>{
      const p=project(point), x=Math.round(p.x), y=Math.round(p.y);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.closePath(); ctx.fill(); drawn++;
  }
  ctx.restore();
  return drawn;
}

export type AtmosphereView = Pick<WorldRenderView,'project'|'pass'>;

/** Compatible with foundation WorldRenderView; sample once, draw each host pass. */
export function drawAtmosphere(ctx:CanvasRenderingContext2D, frame:{commands:readonly AtmosphereCommand[]}, view:AtmosphereView):number {
  const project:AtmosphereProject=point=>view.project(point,point.z??0);
  if(view.pass==='ground') return drawAtmosphereLayer(ctx,frame.commands,'ground',project);
  if(view.pass==='foreground') return drawAtmosphereLayer(ctx,frame.commands,'light',project)+drawAtmosphereLayer(ctx,frame.commands,'foreground',project);
  return 0;
}

/** Append these entries to foundation's object queue for actor/roof occlusion. */
export function renderAtmosphereObjects(frame:{commands:readonly AtmosphereCommand[]}):WorldRenderObject[] {
  const groups=new Map<string,{position:Point;depth?:number;commands:AtmosphereCommand[]}>();
  for(const command of frame.commands) {
    if(command.layer!=='objects'||!command.object) continue;
    const {id,position,depth}=command.object;
    const group=groups.get(id)??{position,depth,commands:[]};
    group.commands.push(command);groups.set(id,group);
  }
  return [...groups].map(([id,group])=>({id:`atmosphere:${id}`,position:group.position,depth:group.depth,
    draw(ctx,view){drawAtmosphereLayer(ctx,group.commands,'objects',point=>view.project(point,point.z??0));},
  }));
}

/** Invert the host's affine ground projection; no second camera or persistent state. */
export function visibleAtmosphereRect(view:Pick<WorldRenderView,'project'|'width'|'height'>,padding=96):import('./index').Rect {
  const origin=view.project({x:0,y:0}),x=view.project({x:1,y:0}),y=view.project({x:0,y:1});
  const ax=x.x-origin.x,ay=x.y-origin.y,bx=y.x-origin.x,by=y.y-origin.y,det=ax*by-ay*bx;
  const corners=[[-padding,-padding],[view.width+padding,-padding],[-padding,view.height+padding],[view.width+padding,view.height+padding]].map(([sx,sy])=>({
    x:((sx-origin.x)*by-(sy-origin.y)*bx)/det,
    y:(ax*(sy-origin.y)-ay*(sx-origin.x))/det,
  }));
  const left=Math.min(...corners.map(p=>p.x)),top=Math.min(...corners.map(p=>p.y));
  return {x:left,y:top,width:Math.max(...corners.map(p=>p.x))-left,height:Math.max(...corners.map(p=>p.y))-top};
}
