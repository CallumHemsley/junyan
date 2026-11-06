import type { AtmosphereCommand, Point } from './index';

export type AtmosphereProject = (point: Point) => {x: number; y: number};

/** The host owns projection, clipping, canvas resolution and the frame loop. */
export function drawAtmosphereLayer(ctx: CanvasRenderingContext2D, commands: readonly AtmosphereCommand[], layer: AtmosphereCommand['layer'], project: AtmosphereProject): number {
  ctx.save();
  let drawn=0;
  for(const command of commands) {
    if(command.layer!==layer) continue;
    ctx.globalAlpha=command.opacity;
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

export type AtmosphereView = {
  project(point:{x:number;y:number},z?:number):{x:number;y:number};
  pass:'ground'|'objects'|'foreground';
};

/** Compatible with foundation WorldRenderView; sample once, draw each host pass. */
export function drawAtmosphere(ctx:CanvasRenderingContext2D, frame:{commands:readonly AtmosphereCommand[]}, view:AtmosphereView):number {
  const project:AtmosphereProject=point=>view.project(point,point.z??0);
  if(view.pass==='ground') return drawAtmosphereLayer(ctx,frame.commands,'ground',project);
  if(view.pass==='foreground') return drawAtmosphereLayer(ctx,frame.commands,'light',project)+drawAtmosphereLayer(ctx,frame.commands,'foreground',project);
  return 0;
}
