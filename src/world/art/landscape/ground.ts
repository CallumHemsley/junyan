/** Authored ground composition only: never changes navigation, water or props. */
import type { DrawMap, WorldRenderView } from '../../render-contract';
type Map = Parameters<DrawMap>[1];
type Point = {x:number;y:number};
type Site = {x:number;y:number;w:number;h:number;kind:'harvest'|'bank'|'grove';turn?:number};
const profiles = [
 [[-.49,-.12],[-.42,-.26],[-.32,-.28],[-.3,-.39],[-.16,-.36],[-.07,-.46],[.08,-.4],[.17,-.43],[.27,-.3],[.36,-.28],[.36,-.16],[.47,-.06],[.41,.06],[.47,.14],[.34,.23],[.33,.34],[.17,.32],[.07,.43],[-.05,.37],[-.19,.41],[-.27,.29],[-.39,.27],[-.35,.11],[-.47,.06]],
 [[-.48,-.05],[-.39,-.2],[-.41,-.29],[-.25,-.28],[-.16,-.43],[-.04,-.38],[.07,-.44],[.14,-.31],[.3,-.34],[.29,-.2],[.44,-.14],[.38,0],[.46,.12],[.31,.19],[.28,.34],[.12,.31],[0,.43],[-.1,.34],[-.27,.38],[-.29,.23],[-.43,.2],[-.37,.05]],
] as const;
const sites:Record<string,Site[]>={
 park:[{x:15.7,y:52,w:15,h:12,kind:'harvest'},{x:10,y:61,w:6.5,h:5,kind:'harvest'},
 {x:51.8,y:19.3,w:12,h:7,kind:'grove'},{x:64.8,y:33,w:7,h:15,kind:'bank'},
 {x:56,y:23,w:7,h:5,kind:'grove'}],
 riverbank:[{x:39,y:74.7,w:11,h:9,kind:'bank'},{x:35.2,y:20,w:10,h:8,kind:'grove'},
 {x:60.8,y:20,w:8,h:6,kind:'bank'},{x:62.5,y:59,w:10,h:11,kind:'bank'},
 {x:39,y:39,w:7,h:6,kind:'bank'},{x:57.5,y:49.8,w:11,h:8,kind:'bank'}],
};
function shape(ctx:CanvasRenderingContext2D,view:WorldRenderView,points:Point[],color:string){
 ctx.fillStyle=view.shadeColor?.(color)??color;ctx.beginPath();
 for(const [i,p]of points.entries()){const q=view.project(p);if(i)ctx.lineTo(Math.round(q.x),Math.round(q.y));else ctx.moveTo(Math.round(q.x),Math.round(q.y));}ctx.closePath();ctx.fill();
}
function island(ctx:CanvasRenderingContext2D,view:WorldRenderView,x:number,y:number,w:number,h:number,color:string,variant=0){
 shape(ctx,view,profiles[variant%2].map(([dx,dy])=>({x:x+dx*w,y:y+dy*h})),color);
}
function dryClip(ctx:CanvasRenderingContext2D,map:Map,view:WorldRenderView){
 ctx.beginPath();
 for(const r of [{x:0,y:0,width:map.bounds.width,height:map.bounds.height},...map.terrain.filter(t=>['water','bridge','boardwalk'].includes(t.material)).map(t=>t.rect)]){
  for(const [i,p]of [{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x+r.width,y:r.y+r.height},{x:r.x,y:r.y+r.height}].entries()){const q=view.project(p);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);}ctx.closePath();
 }ctx.clip('evenodd');
}
function inView(view:WorldRenderView,p:Point,r=8){const q=view.project(p),o=view.project({x:0,y:0}),a=view.project({x:1,y:0}),u=Math.abs(a.x-o.x);return q.x>-u*r&&q.y>-u*r&&q.x<view.width+u*r&&q.y<view.height+u*r;}
export function drawLandscapeGround(ctx:CanvasRenderingContext2D,map:Map,view:WorldRenderView,stage:'underlay'|'verges'){
 ctx.save();dryClip(ctx,map,view);
 const composed=sites[map.id]??[];
 if(stage==='underlay'){
  // Broad connected root/moss beds sit under the paths, keeping the clearings open.
  for(const [i,p]of map.props.filter(p=>p.kind==='woodland-floor').entries()){
   if(!inView(view,p.position))continue;
   island(ctx,view,p.position.x,p.position.y,p.width*.9,p.height*.85,'#7e955f',i);
   island(ctx,view,p.position.x-.7,p.position.y+.4,p.width*.63,p.height*.57,'#758d59',i+1);
  }
  for(const [i,s]of composed.entries()){
   if(!inView(view,s))continue;
   const harvest=s.kind==='harvest';
   island(ctx,view,s.x,s.y,s.w,s.h,harvest?'#929766':s.kind==='bank'?'#829066':'#7b925f',i);
   // Offset connected beds leave grass tongues and small green windows, not square soil cards.
   for(const [j,[dx,dy,w,h]]of [[-.17,-.18,.42,.33],[.16,-.04,.44,.38],[-.07,.22,.39,.26]].entries()){
    island(ctx,view,s.x+dx*s.w,s.y+dy*s.h,s.w*w,s.h*h,harvest?(j===1?'#a3986b':'#a49f70'):'#8e9a6d',i+j);
   }
  }
 }else{
  // Bite into straight margins locally. The centre remains legible and every patch is dry-clipped.
  const relevant=(x:number,y:number)=>composed.some(s=>Math.hypot((x-s.x)/(s.w*.7),(y-s.y)/(s.h*.7))<1.25);
  for(const t of map.terrain.filter(t=>['path','stone-path'].includes(t.material))){
   const r=t.rect,longX=r.width>r.height,length=longX?r.width:r.height;
   if(!inView(view,{x:r.x+r.width/2,y:r.y+r.height/2},Math.max(r.width,r.height)))continue;
   for(let d=.4,k=0;d<length-.3;d+=1.1,k++)for(const side of [-1,1]){
    const x=longX?r.x+d:r.x+(side<0?0:r.width),y=longX?r.y+(side<0?0:r.height):r.y+d;
    if(!relevant(x,y)||!inView(view,{x,y},3))continue;
    const depth=[.12,.3,.2,.08,.24,.16][(k+(side>0?3:0))%6],along=.68+(k%3)*.13;
    const points=longX?[{x:x-along/2,y},{x:x-.2,y:y-side*depth},{x:x+.18,y:y-side*depth*.7},{x:x+along/2,y},{x:x+.2,y:y+side*.3},{x:x-.3,y:y+side*.22}]:[{x,y:y-along/2},{x:x-side*depth,y:y-.2},{x:x-side*depth*.7,y:y+.18},{x,y:y+along/2},{x:x+side*.3,y:y+.2},{x:x+side*.22,y:y-.3}];
    shape(ctx,view,points,k%3?'#8b9a66':'#9ca171');
    // Small adjacent root/leaf clusters follow the verge; never a uniform grass grid.
    if(k%3===1){const p=longX?{x:x+.35,y:y+side*.45}:{x:x+side*.45,y:y+.35};
     island(ctx,view,p.x,p.y,.7,.35,'#a8a371',k);
     island(ctx,view,p.x-.18,p.y+.2,.38,.16,'#718652',k+1);
    }
   }
  }
  // Distinct work pockets: harvest foot scuffs, damp washing stones and old landing paving.
  const stones=map.id==='park'?[[15.2,53.5,.8,.45],[17,51.8,.6,.35],[54.4,18.9,.9,.5],[63.8,34.7,.7,.35]]:[[39.2,74.7,.9,.5],[40.2,73.5,1.1,.5],[38.6,75.8,.6,.4],[61.8,58.6,1,.5],[62.3,60,.7,.5],[35.3,20,.8,.4],[60.6,19.8,.8,.4]];
  for(const [i,[x,y,w,h]]of stones.entries())if(inView(view,{x,y},2)){
   island(ctx,view,x,y,w,h,map.id==='park'?'#ada47b':'#adb09a',i);
   island(ctx,view,x-.1,y-.06,w*.6,h*.32,'#c4bfa1',i+1);
  }
  // Root fingers and leaf fans attach to real trunks; their widths track the existing props.
  for(const p of map.props.filter(p=>['tree','willow','mature-tree'].includes(p.kind))){
   if(!inView(view,p.position,4))continue;
   const {x,y}=p.position;
   for(const [i,[dx,dy]]of [[-.6,.24],[.55,.3],[-.13,-.55]].entries()){
    shape(ctx,view,[{x:x-.1,y:y-.1},{x:x+dx*.75,y:y+dy*.65},{x:x+dx,y:y+dy},{x:x+dx*.55,y:y+dy+.12}],i%2?'#8d8861':'#9b9768');
    if(i!==2)island(ctx,view,x+dx,y+dy+.12,.65,.4,'#89915e',i);
   }
  }
 }
 ctx.restore();
}
