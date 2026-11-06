import type { DrawMap, WorldRenderView } from '../../render-contract';
import { drawLandscapeProp, landscapeMaterialColor } from './draw';

function polygon(ctx: CanvasRenderingContext2D, view: WorldRenderView, points: {x:number;y:number}[], color: string, z = 0) {
  ctx.fillStyle = color; ctx.beginPath();
  points.forEach((point, index) => {const p=view.project(point,z);if(index)ctx.lineTo(Math.round(p.x),Math.round(p.y));else ctx.moveTo(Math.round(p.x),Math.round(p.y));});
  ctx.closePath(); ctx.fill();
}

export const drawMap: DrawMap = (ctx, map, view) => {
  if (map.id !== 'park' && map.id !== 'riverbank') return;
  const origin = view.project({x:0,y:0}), axis = view.project({x:1,y:0});
  const unit = Math.abs(axis.x-origin.x);
  if (view.pass === 'ground') {
    const painted=new Set<string>();
    for (const terrain of map.terrain) {
      if(terrain.material==='water'||terrain.material==='sand'){
        if(painted.has(terrain.material))continue;painted.add(terrain.material);ctx.fillStyle=landscapeMaterialColor(terrain.material)!;ctx.beginPath();
        for(const t of map.terrain.filter(t=>t.material===terrain.material)){const r=t.rect;for(const [i,point] of [{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x+r.width,y:r.y+r.height},{x:r.x,y:r.y+r.height}].entries()){const p=view.project(point);if(i)ctx.lineTo(Math.round(p.x),Math.round(p.y));else ctx.moveTo(Math.round(p.x),Math.round(p.y));}ctx.closePath();}
        ctx.fill();continue;
      }
      const r=terrain.rect;
      polygon(ctx,view,[{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x+r.width,y:r.y+r.height},{x:r.x,y:r.y+r.height}],landscapeMaterialColor(terrain.material) ?? '#869d62');
    }
    const ground = [...map.terrain].reverse();
    const focus = view.playerPosition;
    const extent = Math.ceil((view.width + view.height) / Math.max(unit,1));
    for (let y=Math.max(0,Math.floor(focus.y-extent));y<Math.min(map.bounds.height,focus.y+extent);y++) {
      for (let x=Math.max(0,Math.floor(focus.x-extent));x<Math.min(map.bounds.width,focus.x+extent);x++) {
        const p=view.project({x:x+.5,y:y+.5});
        if(p.x < -unit || p.y < -unit || p.x > view.width+unit || p.y > view.height+unit)continue;
        const terrain=ground.find(t=>x+.5>=t.rect.x&&x+.5<t.rect.x+t.rect.width&&y+.5>=t.rect.y&&y+.5<t.rect.y+t.rect.height);
        const material=terrain?.material;
        const n=(x*37+y*71)%97;
        const pixel=Math.max(1,Math.round(unit/18));
        ctx.fillStyle=material==='water'?'#a5c7bd':material==='path'?'#e0d2a8':material==='stone-path'?'#cbd0b8':'#a4b278';
        if (n%3===0) ctx.fillRect(Math.round(p.x),Math.round(p.y),(material==='water'?7:2)*pixel,pixel);
        if(material==='grass'||material==='moss'||material==='orchard-floor') {
          ctx.fillStyle=n%2?'#78915e':'#94a76c';
          ctx.fillRect(Math.round(p.x-4*pixel),Math.round(p.y-3*pixel),pixel,2*pixel);
          ctx.fillRect(Math.round(p.x-2*pixel),Math.round(p.y-2*pixel),pixel,2*pixel);
        }
        if(material==='bridge'||material==='boardwalk') {
          const a=view.project({x,y}),b=view.project({x:x+1,y});
          ctx.strokeStyle='#807954';ctx.lineWidth=pixel;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
    }
  } else {
    const playerDepth=view.playerPosition.x+view.playerPosition.y;
    const foreground=view.pass==='foreground';
    for(const prop of [...map.props].sort((a,b)=>a.position.x+a.position.y-b.position.x-b.position.y)) {
      if((prop.position.x+prop.position.y>playerDepth)!==foreground)continue;
      const p=view.project(prop.position);
      if(p.x < -unit*6 || p.y < -unit*2 || p.x > view.width+unit*6 || p.y > view.height+unit*8)continue;
      ctx.save();
      if(foreground && ['tree','bamboo','willow'].includes(prop.kind) && Math.hypot(prop.position.x-view.playerPosition.x,prop.position.y-view.playerPosition.y)<3.5)ctx.globalAlpha=.48;
      drawLandscapeProp(ctx,prop,(x,y,z=0)=>view.project({x,y},z),unit,view.elapsedMs,view.reducedMotion);
      ctx.restore();
    }
    // Rails frame each crossing while leaving the playable deck clear.
    for(const terrain of map.terrain.filter(t=>t.material==='bridge')) {
      const r=terrain.rect;
      for(const y of [r.y,r.y+r.height]) {
        if((r.x+r.width/2+y>playerDepth)!==foreground)continue;
        const a=view.project({x:r.x,y},.8),b=view.project({x:r.x+r.width,y},.8);
        ctx.strokeStyle='#756c50';ctx.lineWidth=Math.max(1,unit*.09);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        for(let x=r.x+.5;x<r.x+r.width;x+=2.5) {
          const foot=view.project({x,y}),top=view.project({x,y},1);
          ctx.strokeStyle='#b8a376';ctx.beginPath();ctx.moveTo(foot.x,foot.y);ctx.lineTo(top.x,top.y);ctx.stroke();
        }
      }
    }
  }
};
