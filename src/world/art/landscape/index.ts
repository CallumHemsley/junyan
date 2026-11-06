import type { DrawMap, WorldRenderView, WorldArtModule, WorldRenderObject } from '../../render-contract';
import { drawLandscapeProp, landscapeMaterialColor } from './draw';

function polygon(ctx: CanvasRenderingContext2D, view: WorldRenderView, points: {x:number;y:number}[], color: string, z = 0) {
  ctx.fillStyle = view.shadeColor?.(color) ?? color; ctx.beginPath();
  points.forEach((point, index) => {const p=view.project(point,z);if(index)ctx.lineTo(Math.round(p.x),Math.round(p.y));else ctx.moveTo(Math.round(p.x),Math.round(p.y));});
  ctx.closePath(); ctx.fill();
}

export function drawContactShadows(ctx:CanvasRenderingContext2D,map:Parameters<DrawMap>[1],view:WorldRenderView){
  const origin=view.project({x:0,y:0}),axis=view.project({x:1,y:0}),unit=Math.abs(axis.x-origin.x);
  ctx.save();ctx.globalAlpha*=.2;ctx.fillStyle=view.shadeColor?.('#394f3c')??'#394f3c';
  for(const prop of map.props){
    if(!['tree','mature-tree','willow','bamboo','rock','bench'].includes(prop.kind))continue;
    const p=view.project(prop.position);
    if(p.x < -unit*2 || p.y < -unit || p.x > view.width+unit*2 || p.y > view.height+unit)continue;
    const radius=prop.kind==='mature-tree'?.65:prop.kind==='bamboo'?.6:prop.kind==='rock'?Math.min(.5,prop.width*.18):.26;
    const spots=prop.kind==='bench'?[-.8,.8]:[0];
    for(const offset of spots){ctx.beginPath();ctx.ellipse(Math.round(p.x+offset*unit),Math.round(p.y+unit*.04),unit*radius,unit*radius*.32,0,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
}

export const drawMap: DrawMap = (ctx, map, view) => {
  if (map.id !== 'park' && map.id !== 'riverbank') return;
  const origin = view.project({x:0,y:0}), axis = view.project({x:1,y:0});
  const unit = Math.abs(axis.x-origin.x);
  const shade=(base:string)=>view.shadeColor?.(base)??base;
  if (view.pass === 'ground') {
    // Distant forest is decorative; the map's authored walkable boundary is unchanged.
    ctx.fillStyle=shade(map.id==='park'?'#849d83':'#7f9c8f');ctx.fillRect(0,0,view.width,view.height);
    const backdropExtent=Math.ceil((view.width+view.height)/Math.max(unit,1));
    for(let y=Math.floor((view.playerPosition.y-backdropExtent)/4)*4;y<view.playerPosition.y+backdropExtent;y+=4)for(let x=Math.floor((view.playerPosition.x-backdropExtent)/4)*4;x<view.playerPosition.x+backdropExtent;x+=4){
      if(x>=0&&y>=0&&x<=map.bounds.width&&y<=map.bounds.height)continue;
      const n=Math.abs((x*x*37+y*y*71+x*y*13)%97),p=view.project({x,y});
      if(p.x<-unit*5||p.y<-unit*2||p.x>view.width+unit*5||p.y>view.height+unit*8)continue;
      ctx.save();ctx.globalAlpha=.56;
      drawLandscapeProp(ctx,{kind:n%7===0?'rock':'tree',position:{x:x+n%3*.3,y:y+n%5*.2},width:3.6,height:3.6,variant:n%4},(x,y,z=0)=>view.project({x,y},z),unit,0,true,shade);ctx.restore();
    }

    const painted=new Set<string>();
    let floorPainted=false;
    const forestFloor=()=>{
      for(const patch of map.props.filter(p=>p.layer==='ground')){
        const {x,y}=patch.position,w=patch.width,h=patch.height;
        const at=view.project(patch.position);
        if(at.x < -unit*w || at.y < -unit*h || at.x > view.width+unit*w || at.y > view.height+unit*h)continue;
        for(let iy=0;iy<11;iy++)for(let ix=0;ix<13;ix++){
          const dx=(ix/12-.5)*w,dy=(iy/10-.5)*h;
          const radius=Math.hypot(dx/(w*.5),dy/(h*.5));
          const n=(ix*37+iy*61+Number(patch.variant)*17)%97;
          if(radius>1||n/97>Math.max(0,1-radius*.9)*.78)continue;
          const p=view.project({x:x+dx+(n%3)*.06,y:y+dy});
          ctx.fillStyle=shade(n%2?'#78915d':'#8a9c66');
          ctx.fillRect(Math.round(p.x),Math.round(p.y),Math.max(2,unit*.32),Math.max(1,unit*.12));
        }
        for(let i=0;i<37;i++){
          const dx=((i*37)%97/97-.5)*w*.7,dy=((i*61)%97/97-.5)*h*.7,p=view.project({x:x+dx,y:y+dy});
          ctx.fillStyle=shade(i%3?'#a69e66':'#647753');ctx.fillRect(Math.round(p.x),Math.round(p.y),Math.max(1,unit*.13),Math.max(1,unit*.06));
        }
      }
    };
    for (const terrain of map.terrain) {
      if(!floorPainted&&terrain.material!=='grass'){forestFloor();floorPainted=true;}
      if(terrain.material==='water'||terrain.material==='sand'){
        if(painted.has(terrain.material))continue;painted.add(terrain.material);ctx.fillStyle=shade(landscapeMaterialColor(terrain.material)!);ctx.beginPath();
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
        ctx.fillStyle=shade(material==='water'?'#a5c7bd':material==='path'?'#e0d2a8':material==='stone-path'?'#cbd0b8':'#a4b278');
        if(material==='path'||material==='stone-path'){
          const r=terrain!.rect,edge=Math.min(x+.5-r.x,r.x+r.width-x-.5,y+.5-r.y,r.y+r.height-y-.5);
          if(edge<.7){ctx.fillStyle=shade(n%2?'#a2a373':'#b3aa7d');ctx.fillRect(Math.round(p.x-3*pixel),Math.round(p.y),5*pixel,2*pixel);}
        }
        if (n%3===0) ctx.fillRect(Math.round(p.x),Math.round(p.y),(material==='water'?7:2)*pixel,pixel);
        if(material==='grass'||material==='moss'||material==='orchard-floor') {
          ctx.fillStyle=shade(n%2?'#78915e':'#94a76c');
          ctx.fillRect(Math.round(p.x-4*pixel),Math.round(p.y-3*pixel),pixel,2*pixel);
          ctx.fillRect(Math.round(p.x-2*pixel),Math.round(p.y-2*pixel),pixel,2*pixel);
        }
        if(material==='bridge'||material==='boardwalk') {
          const a=view.project({x,y}),b=view.project({x:x+1,y});
          ctx.strokeStyle=shade('#807954');ctx.lineWidth=pixel;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
    }
    drawContactShadows(ctx,map,view);
  }
};

export const renderObjects: NonNullable<WorldArtModule['renderObjects']> = (map, view) => {
  if(map.id!=='park'&&map.id!=='riverbank')return [];
  const objects:WorldRenderObject[]=map.props.filter(prop=>prop.layer!=='ground').map(prop=>{
    const occlusion=map.occluders.find(o=>o.id===prop.id);
    return {
      id:prop.id,position:prop.position,
      occlusion,
      draw(ctx,current){
        const p=current.project(prop.position),origin=current.project({x:0,y:0}),axis=current.project({x:1,y:0}),unit=Math.abs(axis.x-origin.x);
        if(p.x < -unit*6 || p.y < -unit*2 || p.x > current.width+unit*6 || p.y > current.height+unit*8)return;
        drawLandscapeProp(ctx,prop,(x,y,z=0)=>current.project({x,y},z),unit,current.elapsedMs,current.reducedMotion,color=>current.shadeColor?.(color)??color);
      },
    };
  });
  for(const terrain of map.terrain.filter(t=>t.material==='bridge')) {
    const r=terrain.rect;
    for(const y of [r.y,r.y+r.height])for(let x=r.x+.5;x<r.x+r.width;x+=2.5) {
      const end=Math.min(x+2.5,r.x+r.width);
      objects.push({id:`${terrain.id}.rail-${x}-${y}`,position:{x:(x+end)/2,y},draw(ctx,current){
        const a=current.project({x,y},.8),b=current.project({x:end,y},.8),foot=current.project({x,y}),top=current.project({x,y},1);
        const origin=current.project({x:0,y:0}),axis=current.project({x:1,y:0}),unit=Math.abs(axis.x-origin.x);
        ctx.lineWidth=Math.max(1,unit*.09);ctx.strokeStyle=current.shadeColor?.('#756c50')??'#756c50';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        ctx.strokeStyle=current.shadeColor?.('#b8a376')??'#b8a376';ctx.beginPath();ctx.moveTo(foot.x,foot.y);ctx.lineTo(top.x,top.y);ctx.stroke();
      }});
    }
  }
  return objects;
};
