import type { DrawMap, WorldRenderView, WorldArtModule, WorldRenderObject } from '../../render-contract';
import { drawLandscapeGround } from './ground';
import { drawLandscapeProp, landscapeMaterialColor, landscapeFoliageBounds } from './draw';

function polygon(ctx: CanvasRenderingContext2D, view: WorldRenderView, points: {x:number;y:number}[], color: string, z = 0) {
  ctx.fillStyle = view.shadeColor?.(color) ?? color; ctx.beginPath();
  points.forEach((point, index) => {const p=view.project(point,z);if(index)ctx.lineTo(Math.round(p.x),Math.round(p.y));else ctx.moveTo(Math.round(p.x),Math.round(p.y));});
  ctx.closePath(); ctx.fill();
}

function forestBed(ctx:CanvasRenderingContext2D,view:WorldRenderView,prop:Parameters<typeof drawLandscapeProp>[1]){
  const {x,y}=prop.position,w=prop.width*1.4,h=prop.width;
  const contour=[[-.52,-.05],[-.48,-.27],[-.31,-.32],[-.23,-.46],[.04,-.48],[.18,-.37],[.43,-.3],[.51,-.08],[.45,.08],[.49,.23],[.26,.41],[.02,.44],[-.1,.35],[-.33,.38],[-.5,.19]];
  polygon(ctx,view,contour.map(([dx,dy])=>({x:x+dx*w,y:y+dy*h})),'#60764d');
  polygon(ctx,view,contour.map(([dx,dy])=>({x:x-.4+dx*w*.63,y:y+.2+dy*h*.65})),'#536e49');
  // Smaller lit floor windows separate the canopy groups instead of a map-wide shade band.
  polygon(ctx,view,[{x:x-w*.4,y:y+h*.1},{x:x-w*.18,y:y-h*.02},{x:x+w*.06,y:y+h*.13},{x:x-w*.02,y:y+h*.32},{x:x-w*.26,y:y+h*.3}], '#8b9965');
}

/** Timber stays inside the existing deck, including at the clipped water interfaces. */
export function drawLowerCrossing(ctx:CanvasRenderingContext2D,map:Parameters<DrawMap>[1],view:WorldRenderView){
  if(map.id!=='riverbank')return;
  const deck=map.terrain.find(t=>t.id==='riverbank.low-footbridge');if(!deck)return;
  const r=deck.rect,points=[{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x+r.width,y:r.y+r.height},{x:r.x,y:r.y+r.height}];
  ctx.save();ctx.beginPath();points.forEach((point,i)=>{const p=view.project(point);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();ctx.clip();
  polygon(ctx,view,points,'#66553e');
  const origin=view.project({x:0,y:0}),axis=view.project({x:1,y:0}),unit=Math.abs(axis.x-origin.x);
  for(let x=r.x+.05,n=0;x<r.x+r.width;x+=.58,n++){
    const end=Math.min(x+.53,r.x+r.width-.04),top=r.y+.13,bottom=r.y+r.height-.13;
    const p=view.project({x,y:(top+bottom)/2});if(p.x<-unit*4||p.x>view.width+unit*4||p.y<-unit*3||p.y>view.height+unit*3)continue;
    const repaired=n===19||n===20||n===37;
    polygon(ctx,view,[{x,y:top},{x:end,y:top},{x:end,y:bottom},{x,y:bottom}],repaired?'#8b7951':['#ac9060','#b99f6d','#a58c60','#b39b6c'][n%4]);
    polygon(ctx,view,[{x,y:top},{x:x+.08,y:top},{x:x+.08,y:bottom},{x,y:bottom}],'#d0b780');
    polygon(ctx,view,[{x:x+.31,y:top+.3},{x:x+.35,y:top+.3},{x:x+.38,y:bottom-.35},{x:x+.34,y:bottom-.35}],'#85724e');
    if(n%4===1)polygon(ctx,view,[{x:x+.14,y:top+.8},{x:x+.3,y:top+.57},{x:x+.43,y:top+.8},{x:x+.28,y:top+.94}],'#c6ab74');
    ctx.fillStyle=view.shadeColor?.('#554b39')??'#554b39';
    for(const y of [top+.16,bottom-.16]){const nail=view.project({x:x+.24,y});ctx.fillRect(Math.round(nail.x),Math.round(nail.y),Math.max(1,unit/18),Math.max(1,unit/18));}
  }
  for(const y of [r.y+.03,r.y+r.height-.12])polygon(ctx,view,[{x:r.x,y},{x:r.x+r.width,y},{x:r.x+r.width,y:y+.09},{x:r.x,y:y+.09}],'#786141');
  ctx.restore();
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
    ctx.fillStyle=shade('#73895b');ctx.fillRect(0,0,view.width,view.height);
    const forest:Parameters<typeof drawLandscapeProp>[1][]=[];
    const backdropExtent=Math.ceil((view.width+view.height)/Math.max(unit,1));
    for(let y=Math.floor((view.playerPosition.y-backdropExtent)/4)*4;y<view.playerPosition.y+backdropExtent;y+=4)for(let x=Math.floor((view.playerPosition.x-backdropExtent)/4)*4;x<view.playerPosition.x+backdropExtent;x+=4){
      if(x>=0&&y>=0&&x<=map.bounds.width&&y<=map.bounds.height)continue;
      const group=Math.abs((Math.floor(x/10)*37+Math.floor(y/12)*61)%17);
      if(group===3||group===11)continue;
      const n=Math.abs((x*x*37+y*y*71+x*y*13)%97),p=view.project({x,y});
      if(p.x<-unit*5||p.y<-unit*2||p.x>view.width+unit*5||p.y>view.height+unit*8)continue;
      forest.push({kind:n%13===0?'rock':map.id==='riverbank'&&group%5===0?'willow':map.id==='park'&&y>44&&x<0?'tree':'mature-tree',position:{x:x+n%3*.45,y:y+n%5*.24},width:3.4+(n%6)*.55,height:5,variant:map.id==='park'&&y>44&&x<0?2:n%2});
    }
    const painted=new Set<string>();
    let floorPainted=false;
    const forestFloor=()=>drawLandscapeGround(ctx,map,view,'underlay');
    for (const terrain of map.terrain) {
      if(!floorPainted&&terrain.material!=='grass'){
        forestFloor();
        // Let grouped roots and canopies cross the grass edge; the map rectangle must not cut them off.
        // Water and authored routes paint next, keeping their real surfaces visible through this backdrop.
        for(const prop of forest)forestBed(ctx,view,prop);
        for(const prop of forest){ctx.save();ctx.globalAlpha*=.56;drawLandscapeProp(ctx,prop,(x,y,z=0)=>view.project({x,y},z),unit,0,true,shade);ctx.restore();}
        floorPainted=true;
      }
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
        if ((material==='water'&&n%3===0)||(material!=='grass'&&n%11===0)) ctx.fillRect(Math.round(p.x),Math.round(p.y),(material==='water'?7:2)*pixel,pixel);
        if((material==='grass'||material==='moss'||material==='orchard-floor')&&((Math.floor(x/4)*19+Math.floor(y/5)*31)%13<3)&&n%4===0) {
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
    const waters=map.terrain.filter(t=>t.material==='water');
    const wet=(x:number,y:number)=>waters.some(t=>x>=t.rect.x&&x<t.rect.x+t.rect.width&&y>=t.rect.y&&y<t.rect.y+t.rect.height);
    for(const t of waters){const r=t.rect;
      for(let y=r.y+.2;y<r.y+r.height;y+=.8){
        for(const side of [-1,1]){const x=side<0?r.x:r.x+r.width;
          if(wet(x+side*.05,y))continue;
          const inner=x-side*(.18+((Math.floor(y)*7)%3)*.07),a=view.project({x:inner,y}),b=view.project({x:inner,y:Math.min(y+.58,r.y+r.height)});
          if(a.x< -4||a.x>view.width+4||a.y< -4||a.y>view.height+4)continue;
          ctx.strokeStyle=shade(Math.floor(y)%3?'#91b4a8':'#b4c3a4');ctx.lineWidth=Math.max(1,unit*.16);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
    }
    drawLandscapeGround(ctx,map,view,'verges');
    drawLowerCrossing(ctx,map,view);
    drawContactShadows(ctx,map,view);
  }
};

export const renderObjects: NonNullable<WorldArtModule['renderObjects']> = (map, view) => {
  if(map.id!=='park'&&map.id!=='riverbank')return [];
  const objects:WorldRenderObject[]=map.props.filter(prop=>prop.layer!=='ground').map(prop=>{
    const authored=map.occluders.find(o=>o.id===prop.id),bounds=landscapeFoliageBounds(prop);
    const span=bounds?Math.max(Math.abs(bounds.minX),Math.abs(bounds.maxX))/18:0;
    const occlusion=authored&&bounds?{...authored,rect:{x:prop.position.x-span/2,y:prop.position.y-span/2,width:span,height:span},height:-bounds.minY/18}:authored;
    return {
      id:prop.id,position:prop.position,
      occlusion,
      draw(ctx,current){
        const p=current.project(prop.position),origin=current.project({x:0,y:0}),axis=current.project({x:1,y:0}),unit=Math.abs(axis.x-origin.x);
        if(bounds){const scale=unit/18;if(p.x+bounds.maxX*scale<0||p.y+bounds.maxY*scale<0||p.x+bounds.minX*scale>current.width||p.y+bounds.minY*scale>current.height)return;}
        else if(p.x < -unit*6 || p.y < -unit*2 || p.x > current.width+unit*6 || p.y > current.height+unit*8)return;
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
        if(terrain.id==='riverbank.low-footbridge'){
          const shade=(color:string)=>current.shadeColor?.(color)??color;
          ctx.lineWidth=Math.max(1,unit*.2);ctx.strokeStyle=shade('#5d4e38');ctx.beginPath();ctx.moveTo(a.x,a.y+unit*.06);ctx.lineTo(b.x,b.y+unit*.06);ctx.stroke();
          ctx.lineWidth=Math.max(1,unit*.1);ctx.strokeStyle=shade('#b89a67');ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
          const width=Math.max(2,unit*.19),height=foot.y-top.y;
          ctx.fillStyle=shade('#5c4e38');ctx.fillRect(Math.round(top.x-width/2),Math.round(top.y),Math.ceil(width),Math.ceil(height+unit*.14));
          ctx.fillStyle=shade('#a88a58');ctx.fillRect(Math.round(top.x-width/2),Math.round(top.y),Math.max(1,Math.round(width*.52)),Math.ceil(height));
          ctx.fillStyle=shade('#d0b57e');ctx.fillRect(Math.round(top.x-width/2-unit*.04),Math.round(top.y),Math.ceil(width+unit*.08),Math.max(1,Math.round(unit*.1)));
          return;
        }
        ctx.lineWidth=Math.max(1,unit*.09);ctx.strokeStyle=current.shadeColor?.('#756c50')??'#756c50';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        ctx.strokeStyle=current.shadeColor?.('#b8a376')??'#b8a376';ctx.beginPath();ctx.moveTo(foot.x,foot.y);ctx.lineTo(top.x,top.y);ctx.stroke();
      }});
    }
  }
  return objects;
};
