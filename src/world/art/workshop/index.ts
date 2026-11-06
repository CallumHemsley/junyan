import type { RepairArtApi } from '../../../features/repairs/scene';
import type { State } from '../../../features/repairs/rules';
import type { DrawMap, WorldRenderView, WorldRenderObject, WorldArtModule } from '../../render-contract';
import type { WorldMapDefinition } from '../../schema';
import { drawWorkshopProp } from './paint';

type Color = [number, number, number];
const css = (c: Color, light = 1) => `rgb(${c.map(v => Math.max(0, Math.min(255, Math.round(v * light)))).join(',')})`;

function material(view: WorldRenderView, color: Color | string, faceLight = 1) {
  if(typeof color === 'string')return view.shadeColor?.(color) ?? color;
  const base:Color=[Math.round(color[0]*faceLight),Math.round(color[1]*faceLight),Math.round(color[2]*faceLight)];
  return view.shadeColor?.(base) ?? css(base);
}

function painter(ctx: CanvasRenderingContext2D, view: WorldRenderView): RepairArtApi {
  const project = (x: number, y: number, z: number) => view.project({ x, y }, z);
  const polygon = (points: { x: number; y: number }[], color: string) => {
    ctx.fillStyle = color; ctx.beginPath();
    points.forEach((p, i) => { if (i) ctx.lineTo(Math.round(p.x), Math.round(p.y)); else ctx.moveTo(Math.round(p.x), Math.round(p.y)); });
    ctx.closePath(); ctx.fill();
  };
  return {
    box(x, y, z, a, b, c, color) {
      const p = (u: number, v: number, h: number) => project(u, v, h);
      polygon([p(x,b,z),p(a,b,z),p(a,b,c),p(x,b,c)],material(view,color,.76));
      polygon([p(a,y,z),p(a,b,z),p(a,b,c),p(a,y,c)],material(view,color,.88));
      polygon([p(x,y,c),p(a,y,c),p(a,b,c),p(x,b,c)],material(view,color));
    },
    sphere(x, y, z, r, color) {
      const p=project(x,y,z), side=project(x+r,y,z), top=project(x,y,z+r);
      const radius=Math.max(1,Math.hypot(side.x-p.x,side.y-p.y)*.88);
      ctx.fillStyle=material(view,color,.78); ctx.beginPath();ctx.ellipse(Math.round(p.x),Math.round(p.y),radius,Math.max(1,Math.abs(top.y-p.y)),0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=material(view,color);ctx.beginPath();ctx.ellipse(Math.round(p.x-radius*.15),Math.round(p.y-radius*.18),radius*.78,Math.max(1,Math.abs(top.y-p.y)*.72),0,0,Math.PI*2);ctx.fill();
    },
    capsule(a,b,r,s,colorOf) {
      const p=project(...a),q=project(...b),width=Math.max(1,Math.abs(project(a[0]+Math.max(r,s),a[1],a[2]).x-p.x)*2);
      ctx.strokeStyle=material(view,colorOf((a[2]+b[2])/2));ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(Math.round(p.x),Math.round(p.y));ctx.lineTo(Math.round(q.x),Math.round(q.y));ctx.stroke();
    },
  };
}

function paint(ctx: CanvasRenderingContext2D, map: WorldMapDefinition, view: WorldRenderView) {
  if(map.id!=='workshop') return;
  ctx.save();
  const api=painter(ctx,view);
  if(view.pass==='ground') {
    const tile=(x:number,y:number,w:number,h:number,color:Color)=>api.box(x,y,.002,x+w,y+h,.006,color);
    // Individual boards and stone joints stay fixed in world coordinates as the camera scrolls.
    for(let x=2;x<28;x+=.65) for(let y=2;y<21;y+=3) {
      const w=Math.min(.63,28-x),h=Math.min(2.97,21-y);
      const shade=Math.floor((x*11+y*7)%8);
      tile(x,y,w,h,[190+shade,151+shade,106+shade]);
      for(let grain=0;grain<2;grain++) tile(x+.15+grain*.2,y+.2,.013,Math.max(.1,h-.5),[173+shade,133+shade,92+shade]);
    }
    for(let x=2;x<28;x+=1.2) for(let y=21;y<27;y+=.9) {
      const offset=Math.floor((x-2)/1.2)%2*.4,top=Math.max(21,y-offset),bottom=Math.min(27,y+.86-offset);
      if(bottom>top)tile(x,top,Math.min(1.15,28-x),bottom-top,[176+(x%3)*2,174+(y%2)*2,150]);
    }
    for(const [x,y,w,h] of [[5,7.5,5.5,4],[18,7.5,6,4]]) {
      tile(x,y,w,h,[148,143,111]);tile(x+.12,y+.12,w-.24,h-.24,[109,132,115]);
      for(let a=x+.2;a<x+w;a+=.35)tile(a,y+.1,.08,.1,[205,188,143]);
    }
    tile(13,6,4,13,[159,141,106]);tile(13.12,6.1,3.76,12.8,[133,117,90]);
    ctx.save();ctx.globalAlpha*=.16;
    for(const x of [10,14.2,17])tile(x,3,1.5,4.5,[221,237,224]);
    ctx.restore();
  }
  ctx.restore();
}

export const drawMap: DrawMap = (ctx,map,view) => paint(ctx,map,view);

export function renderObjects(map: WorldMapDefinition, view: WorldRenderView, repairs?: State): WorldRenderObject[] {
  if(map.id!=='workshop')return [];
  return map.props.map(prop=>{
    const surfaceKinds=new Set(['task-lamp','lamp','radio','kettle','paper','chair-repair','thread-box']);
    const host=surfaceKinds.has(prop.kind)?map.props.find(p=>p.id!==prop.id&&/bench|shelf/.test(p.kind)&&prop.position.x>=p.position.x&&prop.position.x<=p.position.x+p.width&&prop.position.y>=p.position.y&&prop.position.y<=p.position.y+p.height):undefined;
    const candidate=map.occluders.find(o=>o.id===prop.id||o.id===host?.id);
    const depth=prop.kind==='wall'&&prop.position.x<3?prop.position.x+prop.position.y:host?host.position.x+host.position.y+host.width/2+host.height/2+.01:prop.position.x+prop.position.y+prop.width/2+prop.height/2;
    const player=view.project(view.playerPosition);
    const corners=[{x:prop.position.x,y:prop.position.y},{x:prop.position.x+prop.width,y:prop.position.y},{x:prop.position.x,y:prop.position.y+prop.height},{x:prop.position.x+prop.width,y:prop.position.y+prop.height}];
    const floor=corners.map(p=>view.project(p)),top=corners.map(p=>view.project(p,candidate?.height??0));
    const overlaps=player.x>=Math.min(...floor.map(p=>p.x))-8&&player.x<=Math.max(...floor.map(p=>p.x))+8&&player.y>=Math.min(...top.map(p=>p.y))&&player.y<=Math.max(...floor.map(p=>p.y))+8;
    return ({
    id:prop.id,
    position:{x:prop.position.x+prop.width/2,y:prop.position.y+prop.height/2},
    depth,
    occlusion:overlaps?candidate:undefined,
    draw(ctx,view){
      // Contact shadows ground each workstation and shelf in the room.
      if(!['wall','window','pegboard','paper','shavings','doormat','awning'].includes(prop.kind)){
        const at=view.project({x:prop.position.x+prop.width/2,y:prop.position.y+prop.height/2});
        const side=view.project({x:prop.position.x+prop.width,y:prop.position.y+prop.height});
        ctx.save();ctx.globalAlpha*=.14;ctx.fillStyle=material(view,'#342e28');ctx.beginPath();ctx.ellipse(at.x,at.y+3,Math.max(3,Math.abs(side.x-at.x)+prop.width*6),Math.max(2,Math.abs(side.y-at.y)*.65),0,0,Math.PI*2);ctx.fill();ctx.restore();
      }
      drawWorkshopProp(painter(ctx,view),prop,{repairs,elapsedSeconds:view.reducedMotion?0:view.elapsedMs/1000});
    },
  });});
}

// Foundation injects its authoritative feature state; this adapter owns no mutable game state.
export function createWorkshopArt(repairs: State): WorldArtModule {
  return {drawMap,renderObjects:(map,view)=>renderObjects(map,view,repairs)};
}
