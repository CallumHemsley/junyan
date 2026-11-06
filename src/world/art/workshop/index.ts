import type { RepairArtApi } from '../../../features/repairs/scene';
import type { State } from '../../../features/repairs/rules';
import type { DrawMap, WorldRenderView } from '../../render-contract';
import type { WorldMapDefinition } from '../../schema';
import { drawWorkshopProp } from './paint';

type Color = [number, number, number];
const css = (c: Color, light = 1) => `rgb(${c.map(v => Math.max(0, Math.min(255, Math.round(v * light)))).join(',')})`;

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
      polygon([p(x,b,z),p(a,b,z),p(a,b,c),p(x,b,c)],css(color,.76));
      polygon([p(a,y,z),p(a,b,z),p(a,b,c),p(a,y,c)],css(color,.88));
      polygon([p(x,y,c),p(a,y,c),p(a,b,c),p(x,b,c)],css(color));
    },
    sphere(x, y, z, r, color) {
      const p=project(x,y,z), side=project(x+r,y,z), top=project(x,y,z+r);
      const radius=Math.max(1,Math.hypot(side.x-p.x,side.y-p.y)*.88);
      ctx.fillStyle=css(color,.78); ctx.beginPath();ctx.ellipse(Math.round(p.x),Math.round(p.y),radius,Math.max(1,Math.abs(top.y-p.y)),0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=css(color);ctx.beginPath();ctx.ellipse(Math.round(p.x-radius*.15),Math.round(p.y-radius*.18),radius*.78,Math.max(1,Math.abs(top.y-p.y)*.72),0,0,Math.PI*2);ctx.fill();
    },
    capsule(a,b,r,s,colorOf) {
      const p=project(...a),q=project(...b),width=Math.max(1,Math.abs(project(a[0]+Math.max(r,s),a[1],a[2]).x-p.x)*2);
      ctx.strokeStyle=css(colorOf((a[2]+b[2])/2));ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(Math.round(p.x),Math.round(p.y));ctx.lineTo(Math.round(q.x),Math.round(q.y));ctx.stroke();
    },
  };
}

function paint(ctx: CanvasRenderingContext2D, map: WorldMapDefinition, view: WorldRenderView, repairs?: State) {
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
    ctx.save();ctx.globalAlpha=.16;
    for(const x of [10,14.2,17])tile(x,3,1.5,4.5,[221,237,224]);
    ctx.restore();
  } else {
    const props=[...map.props].sort((a,b)=>a.position.x+a.position.y-b.position.x-b.position.y);
    for(const prop of props) {
      const center={x:prop.position.x+prop.width/2,y:prop.position.y+prop.height/2};
      const front=center.x+center.y>view.playerPosition.x+view.playerPosition.y;
      if((view.pass==='foreground')!==front)continue;
      const occluder=map.occluders.find(o=>o.id===prop.id);
      const screen=view.project(center), player=view.project(view.playerPosition);
      const fade=front&&occluder?.fadeWhenPlayerBehind&&Math.abs(screen.x-player.x)<Math.max(25,prop.width*12)&&screen.y-player.y<occluder.height*24;
      ctx.save();ctx.globalAlpha=fade?.35:1;
      drawWorkshopProp(api,prop,{repairs,elapsedSeconds:view.reducedMotion?0:view.elapsedMs/1000});
      ctx.restore();
    }
  }
  ctx.restore();
}

export const drawMap: DrawMap = (ctx,map,view) => paint(ctx,map,view);
// Foundation injects its authoritative feature state; this adapter owns no mutable game state.
export function createWorkshopArt(repairs: State): DrawMap {
  return (ctx,map,view) => paint(ctx,map,view,repairs);
}
