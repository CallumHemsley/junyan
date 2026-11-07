/** Authored ground composition only: never changes navigation, water or props. */
import type { DrawMap, WorldRenderView } from '../../render-contract';
type Map = Parameters<DrawMap>[1];
type Point = {x:number;y:number};
type Site = {x:number;y:number;w:number;h:number;kind:'harvest'|'bank'|'grove';turn?:number};
const profiles = [
 [[-.48,-.06],[-.47,-.17],[-.41,-.26],[-.34,-.34],[-.23,-.39],[-.1,-.42],[.04,-.43],[.18,-.4],[.3,-.35],[.4,-.27],[.46,-.16],[.48,-.04],[.46,.1],[.4,.22],[.3,.31],[.16,.37],[.02,.4],[-.12,.39],[-.25,.34],[-.36,.27],[-.43,.16],[-.46,.05]],
 [[-.46,-.08],[-.42,-.2],[-.33,-.3],[-.2,-.36],[-.06,-.4],[.09,-.39],[.23,-.35],[.35,-.28],[.43,-.17],[.47,-.04],[.45,.08],[.39,.2],[.29,.3],[.14,.37],[-.01,.4],[-.17,.37],[-.31,.29],[-.41,.17],[-.47,.05]],
] as const;
const sites:Record<string,Site[]>={
 park:[{x:15.7,y:52,w:15,h:12,kind:'harvest'},{x:10,y:61,w:6.5,h:5,kind:'harvest'},
 {x:51.8,y:19.3,w:12,h:7,kind:'grove'},{x:64.8,y:33,w:7,h:15,kind:'bank'},
 {x:56,y:23,w:7,h:5,kind:'grove'}],
 riverbank:[{x:39,y:74.7,w:11,h:9,kind:'bank'},{x:35.2,y:20,w:10,h:8,kind:'grove'},
 {x:60.8,y:20,w:8,h:6,kind:'bank'},{x:62.5,y:59,w:10,h:11,kind:'bank'},
 {x:39,y:39,w:7,h:6,kind:'bank'},{x:57.5,y:49.8,w:6.5,h:5,kind:'bank'}],
};
function shape(ctx:CanvasRenderingContext2D,view:WorldRenderView,points:Point[],color:string){
 ctx.fillStyle=view.shadeColor?.(color)??color;ctx.beginPath();
 for(const [i,p]of points.entries()){const q=view.project(p);if(i)ctx.lineTo(Math.round(q.x),Math.round(q.y));else ctx.moveTo(Math.round(q.x),Math.round(q.y));}ctx.closePath();ctx.fill();
}
function island(ctx:CanvasRenderingContext2D,view:WorldRenderView,x:number,y:number,w:number,h:number,color:string,variant=0){
 shape(ctx,view,profiles[variant%2].map(([dx,dy])=>({x:x+dx*w,y:y+dy*h})),color);
}
function dryClip(ctx:CanvasRenderingContext2D,map:Map,view:WorldRenderView){
 const outline=(r:{x:number;y:number;width:number;height:number})=>{
  for(const [i,p]of [{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x+r.width,y:r.y+r.height},{x:r.x,y:r.y+r.height}].entries()){const q=view.project(p);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);}ctx.closePath();
 };
 ctx.beginPath();outline({x:0,y:0,width:map.bounds.width,height:map.bounds.height});
 for(const t of map.terrain.filter(t=>t.material==='water'))outline(t.rect);
 ctx.clip('evenodd');
 // Deck pieces may overlap at elbows. Clip each separately so even/odd overlap
 // cannot accidentally expose a joint to a ground-material brush.
 for(const t of map.terrain.filter(t=>t.material==='bridge'||t.material==='boardwalk')){
  ctx.beginPath();ctx.rect(0,0,view.width,view.height);outline(t.rect);ctx.clip('evenodd');
 }
}
const clusters:Record<string,number[][]>={
 park:[[12,50,0],[18.5,50.5,1],[13.2,54.4,2],[20.8,53,0],[9.8,61.8,1],[51,20.8,0],[55.5,20,1],[63.5,32.2,1],[64,36,2],[67,29.8,0]],
 riverbank:[[38,76,0],[41.2,72.5,1],[36.8,71.8,2],[59.5,59.5,0],[64,60.8,1],[56,50,0],[59,48.4,2],[33,20.8,0],[62,21,1]],
};
function leafCluster(ctx:CanvasRenderingContext2D,view:WorldRenderView,x:number,y:number,style:number){
 const p=view.project({x,y}),o=view.project({x:0,y:0}),axis=view.project({x:1,y:0}),scale=Math.abs(axis.x-o.x)/18;
 ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));ctx.scale(scale,scale);
 const colors=['#6b8150','#95a967','#bdbe83','#a29b6c'].map(base=>view.shadeColor?.(base)??base);
 const leaf=(points:number[][],c:number)=>{ctx.fillStyle=colors[c];ctx.beginPath();points.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.fill();};
 if(style===2){
  // Three connected fallen-leaf clusters follow a worn foot margin.
  for(const [dx,dy]of [[-7,0],[0,-3],[7,1]]){leaf([[dx-3,dy],[dx-1,dy-2],[dx+4,dy-1],[dx+2,dy+1]],3);ctx.fillStyle=colors[2];ctx.fillRect(dx-1,dy-1,3,1);}
 }else{
  const blades=style===0?[[-10,-6],[-6,-12],[0,-14],[5,-10],[11,-7]]:[[-9,-3],[-6,-8],[1,-11],[7,-6],[12,-2]];
  blades.forEach(([dx,dy],i)=>{leaf([[-1,1],[dx-2,dy+1],[dx,dy],[dx+2,dy+4],[1,2]],i%2);ctx.fillStyle=colors[2];ctx.fillRect(Math.round(dx*.7),Math.round(dy*.7),2,2);});
  if(style===3){ctx.fillStyle=view.shadeColor?.('#e1d4a1')??'#e1d4a1';for(const [dx,dy]of [[-6,-9],[1,-12],[7,-7]]){ctx.fillRect(dx-1,dy-1,3,2);ctx.fillRect(dx,dy-2,1,4);}}
 }
 ctx.restore();
}
function inView(view:WorldRenderView,p:Point,r=8){const q=view.project(p),o=view.project({x:0,y:0}),a=view.project({x:1,y:0}),u=Math.abs(a.x-o.x);return q.x>-u*r&&q.y>-u*r&&q.x<view.width+u*r&&q.y<view.height+u*r;}

/** Worked soil follows the picking place, not a second tree-shadow ellipse. */
function harvestPocket(ctx:CanvasRenderingContext2D,map:Map,view:WorldRenderView,site:Site){
 const paint=(points:number[][],color:string)=>{
  // Cut the authored corners once: broad worn contours, not sharp camouflage polygons.
  const rounded=points.flatMap(([x,y],i)=>{const [nx,ny]=points[(i+1)%points.length];return [[x*.75+nx*.25,y*.75+ny*.25],[x*.25+nx*.75,y*.25+ny*.75]];});
  shape(ctx,view,rounded.map(([x,y])=>({x:site.x+x*site.w,y:site.y+y*site.h})),color);
 };
 const routes=site.w<10?[
  [[-.36,-.31],[-.17,-.37],[-.01,-.19],[.18,-.02],[.24,.21],[.08,.33],[-.09,.2],[-.19,-.02],[-.37,-.12]],
  [[-.16,.1],[.02,.06],[.16,.22],[.04,.38],[-.16,.32],[-.29,.2]],
 ]:[
  [[-.4,-.32],[-.3,-.39],[-.12,-.25],[.02,-.19],[.08,-.05],[.04,.03],[-.08,-.03],[-.16,-.14],[-.29,-.18],[-.4,-.25]],
  [[.05,-.15],[.18,-.25],[.45,-.37],[.49,-.25],[.36,-.11],[.21,-.13],[.13,-.04],[.08,.13],[.04,.18],[-.04,.11],[-.02,-.01]],
  [[-.16,-.14],[-.03,-.26],[.13,-.18],[.18,-.06],[.15,.1],[.07,.18],[-.06,.16],[-.17,.03]],
 ];
 for(const route of routes){
  paint(route,'#939064');
  // Foot-worn centers are lighter, leaving quiet grass between the arms.
  const center=route.reduce((p,[x,y])=>({x:p.x+x/route.length,y:p.y+y/route.length}),{x:0,y:0});
  paint(route.map(([x,y])=>[center.x+(x-center.x)*.68,center.y+(y-center.y)*.56]),'#afa177');
 }
 // Small leaf/root skirts attach to the actual trunks, not the former island centers.
 for(const p of map.props.filter(p=>p.id.startsWith('park.working-fruit-'))){
  const {x,y}=p.position;
  if(Math.abs(x-site.x)>site.w*.57||Math.abs(y-site.y)>site.h*.57)continue;
  island(ctx,view,x,y+.12,1.7,1.1,'#8e8c5d');
  shape(ctx,view,[{x:x-.15,y:y-.12},{x:x+.41,y:y+.1},{x:x+.7,y:y+.2},{x:x+.18,y:y+.27},{x:x-.25,y:y+.09}], '#b1a176');
 }
}

function pavingStone(ctx:CanvasRenderingContext2D,view:WorldRenderView,x:number,y:number,w:number,h:number,variant:number){
 const points=[{x:x-w*.46,y:y-h*.36},{x:x+w*.27,y:y-h*.48},{x:x+w*.48,y:y-h*.21},{x:x+w*.43,y:y+h*.35},{x:x-w*.28,y:y+h*.47},{x:x-w*.5,y:y+h*.16}];
 shape(ctx,view,points,'#626d60');
 shape(ctx,view,points.map(p=>({x:x+(p.x-x)*.82,y:y+(p.y-y)*.76-.035})),['#aaa88b','#92977e','#b8b197','#9ea38d'][variant%4]);
 shape(ctx,view,[points[0],points[1],{x:x+w*.2,y:y-h*.25},{x:x-w*.36,y:y-h*.15}],'#ccc4a4');
 if(variant%3===0)shape(ctx,view,[{x:x-w*.13,y:y-h*.3},{x:x+w*.02,y:y-h*.06},{x:x-w*.03,y:y+h*.15},{x:x+w*.07,y:y-h*.02}], '#777e69');
}

/** Original wear follows the existing wash → crossing → ferry route, inside the dry mask. */
function riverbankCraft(ctx:CanvasRenderingContext2D,view:WorldRenderView){
 if(inView(view,{x:37.5,y:73.4},9)){
  shape(ctx,view,[{x:32.7,y:71.7},{x:34.8,y:69.8},{x:37.3,y:70.4},{x:39.2,y:71.5},{x:42.1,y:72.6},{x:43,y:75.1},{x:41,y:77.4},{x:38.4,y:77},{x:36.1,y:75.8},{x:33.6,y:74.3}], '#77794f');
  shape(ctx,view,[{x:33.6,y:72},{x:35.1,y:70.7},{x:37.5,y:71.5},{x:40.4,y:72.5},{x:42.1,y:74.8},{x:40.7,y:76.5},{x:38.2,y:76},{x:36,y:74.6}], '#a49b72');
  for(let row=0;row<7;row++)for(let col=0;col<8;col++){
   const x=34.4+col*.98+(row%2)*.4,y=71.4+row*.82;
   if(Math.hypot((x-38)/4.3,(y-73.8)/2.8)>1||col===0&&row%3===0)continue;
   pavingStone(ctx,view,x,y,.94+(col%3)*.06,.78,(row*7+col)%4);
  }
  for(const [x,y,style]of [[33.7,72,0],[36,70.3,1],[37.8,76.8,2],[42.1,76.1,0],[41.9,72.3,1]])leafCluster(ctx,view,x,y,style);
 }
 // A damp perennial bed belongs to the washing bank; the middle stays open for passing feet.
 if(inView(view,{x:40.2,y:66.7},8)){
  island(ctx,view,40.2,66.8,5.5,9.2,'#718453');
  island(ctx,view,40.7,66.2,3.4,6.9,'#5f7952',1);
  island(ctx,view,39.6,68.3,2.8,3.1,'#929364');
  for(const [x,y]of [[38.5,64],[38,65.2],[37.9,66.5],[38.2,67.8],[38.7,69.1],[39.4,70.3]])pavingStone(ctx,view,x,y,.68,.45,Math.round(y));
  for(const [i,[x,y]]of [[39.4,63.8],[40.4,64.7],[39.3,65.8],[41.1,65.4],[40.3,67.2],[39.1,67.9],[41.1,68.3],[40.4,69.6]].entries()){
   leafCluster(ctx,view,x,y,i%3===0?3:i%2);leafCluster(ctx,view,x+.55,y+.45,i%2);
  }
 }
 // A rooted verge connects the domestic terrace to the timber approach without tiling the lawn.
 for(const [i,y]of [59.2,62.7,66.3,69.3].entries())if(inView(view,{x:31,y},6)){
  shape(ctx,view,[{x:27.8,y:y-2.5},{x:29.7,y:y-2.1},{x:30.1,y:y-.5},{x:29.4,y:y+1.4},{x:28.7,y:y+2.5},{x:26.9,y:y+1.9},{x:27.5,y}],i%2?'#718751':'#758a53');
  shape(ctx,view,[{x:32.1,y:y-1.7},{x:33.2,y:y-2.3},{x:34.8,y:y-1.2},{x:34,y:y+.5},{x:32.8,y:y+2},{x:32.1,y:y+1.3},{x:32.6,y}], '#798b55');
  for(let j=0;j<4;j++){
   const x=j%2?32.5:29.4,cy=y-1.6+j*.87;
   island(ctx,view,x,cy,.9,.4,j%2?'#b0a176':'#8b8058',i+j);
   leafCluster(ctx,view,x+(j%2?.5:-.7),cy+.4,(i+j)%3);
  }
 }
 if(inView(view,{x:59.9,y:60.1},10)){
  shape(ctx,view,[{x:53.1,y:59.4},{x:55,y:58.4},{x:58.2,y:58.7},{x:60.3,y:56.7},{x:62.5,y:56.8},{x:65.7,y:58.5},{x:66,y:60.7},{x:64.4,y:63.6},{x:61.7,y:63.3},{x:59.6,y:64.1},{x:56.8,y:62.8},{x:54.1,y:61.9}], '#7c7750');
  shape(ctx,view,[{x:53.8,y:59.8},{x:56.1,y:59.2},{x:59.3,y:59.6},{x:61.3,y:57.3},{x:63.3,y:57.9},{x:65,y:60.2},{x:63.3,y:62.6},{x:60,y:62.9},{x:57.3,y:62.3},{x:55.1,y:61.4}], '#a6976c');
  // The entry fans to the exposed side of the existing canopy, keeping this junction visible.
  for(let row=0;row<5;row++)for(let col=0;col<7;col++){
   const x=61.3+col*.87+(row%2)*.26,y=55.9+row*.68;
   if(Math.hypot((x-64)/3.5,(y-57.1)/1.8)>1.1)continue;
   pavingStone(ctx,view,x,y,.82,.75,col+row*3);
  }
  // Two broken skid lines explain the hauled-out hull on its real dry bank.
  for(let i=0;i<5;i++)for(const side of [-.45,.45]){
   const x=54.8+i*.66,y=60.7+side;
   shape(ctx,view,[{x,y},{x:x+.5,y:y-.03},{x:x+.52,y:y+.07},{x:x-.1,y:y+.12}], '#7d724e');
  }
  for(const [x,y,style]of [[54.1,58.9,1],[54.5,62.1,0],[58.7,63.4,2],[63.2,63,0],[65.5,59.9,1],[60.3,56.5,2]])leafCluster(ctx,view,x,y,style);
 }
 // Low seed heads and a stony dry rise give the ferry's inland meadow its own material story.
 if(inView(view,{x:70,y:51.1},9)){
  island(ctx,view,70.1,51.2,8.3,7.9,'#929363',1);
  island(ctx,view,70.7,51.7,5.3,4.9,'#a09a6a');
  island(ctx,view,68.1,50.2,3.6,4.3,'#728450');
  for(const [i,[x,y]]of [[67.2,49.5],[68.4,48.7],[70.1,48.4],[71.9,49.3],[72.7,50.9],[72.2,52.6],[70.7,53.4],[68.9,53.6],[67.5,52.2]].entries()){
   if(i%2===0)pavingStone(ctx,view,x,y,.95,.6,i);
   leafCluster(ctx,view,x-.25,y+.4,i%3===0?3:1);
  }
  for(const [x,y,style]of [[68.6,50,3],[69.4,50.8,1],[70.3,50.1,3],[71.5,51.2,1],[70.6,52,3],[69.2,52.4,0]])leafCluster(ctx,view,x,y,style);
 }
 for(const [x,y]of [[30.1,55],[31.4,59.1],[59.6,55.2],[62.1,58.8]])if(inView(view,{x,y},4)){
  island(ctx,view,x,y,3.4,2.7,'#788651');
  for(let n=0;n<3;n++)pavingStone(ctx,view,x+(n-1)*.72,y+(n%2)*.42,1,.7,n);
 }
}
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
   if(map.id==='park'&&s.kind==='harvest'){
    if(inView(view,s,Math.max(s.w,s.h)))harvestPocket(ctx,map,view,s);
    continue;
   }
   if(!inView(view,s))continue;
   const harvest=s.kind==='harvest';
   island(ctx,view,s.x,s.y,s.w,s.h,harvest?'#929766':s.kind==='bank'?'#899b68':'#7b925f',i);
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
  for(const [x,y,style]of clusters[map.id]??[])if(inView(view,{x,y},2))leafCluster(ctx,view,x,y,style);
  // Root fingers and leaf fans attach to real trunks; their widths track the existing props.
  for(const p of map.props.filter(p=>['tree','willow','mature-tree'].includes(p.kind))){
   if(!inView(view,p.position,4))continue;
   const {x,y}=p.position;
   for(const [i,[dx,dy]]of [[-.6,.24],[.55,.3],[-.13,-.55]].entries()){
    shape(ctx,view,[{x:x-.1,y:y-.1},{x:x+dx*.75,y:y+dy*.65},{x:x+dx,y:y+dy},{x:x+dx*.55,y:y+dy+.12}],i%2?'#8d8861':'#9b9768');
    if(i!==2)island(ctx,view,x+dx,y+dy+.12,.65,.4,'#89915e',i);
   }
  }
  if(map.id==='riverbank')riverbankCraft(ctx,view);
 }
 ctx.restore();
}

/** The river's existing strip contour is the only authority for wet and dry paint. */
export function drawRiverbankWater(ctx:CanvasRenderingContext2D,map:Map,view:WorldRenderView){
 if(map.id!=='riverbank')return;
 const time=view.reducedMotion?0:view.elapsedMs/1000;
 // Shallow shelves widen only at the working coves; quiet banks retain a thin wet edge.
 const shelf=(y:number,side:number)=>.22+(side<0?.9*Math.exp(-(((y-74)/3.1)**2)):1.1*Math.exp(-(((y-61.5)/3.6)**2)));
 const water=map.terrain.filter(t=>t.material==='water').map(t=>t.rect).sort((a,b)=>a.y-b.y);
 // Smooth only the flow inside the water; the stepped collision shoreline stays exact.
 const flow=water.map((r,i)=>{const neighbors=water.slice(Math.max(0,i-2),i+3).filter(p=>Math.abs(p.y-r.y)<1.6);const first=neighbors[0],last=neighbors.at(-1)!;return{x:neighbors.reduce((sum,p)=>sum+p.x,0)/neighbors.length,slope:(last.x-first.x)/Math.max(.5,last.y-first.y)};});
 const flowX=(r:typeof water[number],y:number)=>{const f=flow[water.indexOf(r)];return f.x+(y-r.y-r.height/2)*f.slope;};
 const runs:typeof water[]=[];
 for(const r of water){const last=runs.at(-1);if(!last||Math.abs(last.at(-1)!.y+last.at(-1)!.height-r.y)>.001)runs.push([r]);else last.push(r);}
 const outline=(rects:typeof water)=>{
  ctx.beginPath();
  for(const r of rects){for(const [i,p]of [{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x+r.width,y:r.y+r.height},{x:r.x,y:r.y+r.height}].entries()){const q=view.project(p);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);}ctx.closePath();}
 };
 const mask=(material:'water'|'sand')=>{
  outline(map.terrain.filter(t=>t.material===material).map(t=>t.rect));ctx.clip();
  // Separate subtraction clips preserve overlapping deck elbows.
  for(const t of map.terrain.filter(t=>t.material==='bridge'||t.material==='boardwalk')){
   ctx.beginPath();ctx.rect(0,0,view.width,view.height);
   const r=t.rect;for(const [i,p]of [{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x+r.width,y:r.y+r.height},{x:r.x,y:r.y+r.height}].entries()){const q=view.project(p);if(i)ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);}ctx.closePath();ctx.clip('evenodd');
  }
 };
 const band=(run:typeof water,left:(r:typeof water[number],y:number)=>number,right:(r:typeof water[number],y:number)=>number,color:string)=>{
  const edge=(offset:typeof left)=>run.flatMap(r=>[{x:offset(r,r.y),y:r.y},{x:offset(r,r.y+r.height),y:r.y+r.height}]);
  shape(ctx,view,[...edge(left),...edge(right).reverse()],color);
 };
 ctx.save();mask('sand');
 for(const run of runs)for(const side of [-1,1]){
  const bank=(r:typeof water[number])=>side<0?r.x:r.x+r.width;
  band(run,r=>bank(r),(r,y)=>bank(r)+side*(.34+shelf(y,side)*.35),'#b7b38b');
  band(run,r=>bank(r),(r,y)=>bank(r)+side*(.1+shelf(y,side)*.2),'#92a18a');
 }
 ctx.restore();
 ctx.save();mask('water');
 for(const run of runs){
  // Broad deep water and narrow translucent margins retain a clearly wet blue body.
  band(run,r=>r.x,r=>r.x+r.width,'#527f88');
  band(run,(r,y)=>flowX(r,y)+r.width*.13+shelf(y,-1)*.6,(r,y)=>flowX(r,y)+r.width*.87-shelf(y,1)*.6,'#4d7984');
  for(const side of [-1,1]){
   const bank=(r:typeof water[number])=>side<0?r.x:r.x+r.width;
   band(run,r=>bank(r),(r,y)=>bank(r)-side*shelf(y,side),'#659087');
   band(run,r=>bank(r),(r,y)=>bank(r)-side*(.06+shelf(y,side)*.13),'#7a9d8d');
  }
  // Longer broken ribbons follow the downstream contour, separated by quiet pools.
  for(const [start,length,fraction]of [[2,4.8,.38],[10.5,2.8,.69],[24,6.8,.56],[34,3.7,.27],[43.5,5.5,.63],[60,4.5,.35],[68.5,6,.61],[76,2.5,.33]]){
   const reach=run.filter(r=>r.y>=start&&r.y<start+length);
   if(reach.length<2||!inView(view,{x:reach[0].x+reach[0].width*fraction,y:start},length+2))continue;
   ctx.save();ctx.globalAlpha*=.82+Math.sin(time*.6+start*.3)*.12;
   band(reach,(r,y)=>flowX(r,y)+r.width*fraction+Math.sin(y*.42-time*.65)*.18,(r,y)=>flowX(r,y)+r.width*fraction+Math.sin(y*.42-time*.65)*.18+.045,'#789e9b');
   const tail=reach.slice(Math.floor(reach.length*.45));
   band(tail,(r,y)=>flowX(r,y)+r.width*fraction+Math.sin(y*.42-time*.65)*.18+.25,(r,y)=>flowX(r,y)+r.width*fraction+Math.sin(y*.42-time*.65)*.18+.28,'#6c9695');
   ctx.restore();
  }
 }
 ctx.restore();
}
