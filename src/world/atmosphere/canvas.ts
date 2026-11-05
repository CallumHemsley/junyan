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
