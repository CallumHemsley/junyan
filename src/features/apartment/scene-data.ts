import { characterFigure, type Scene, type SceneApi } from '../../scene/renderer.js';
import { cells, footprint, legal, type Placement, type State } from './rules';
const wood: [number,number,number] = [175,137,90];
const dark: [number,number,number] = [98,76,54];
const cream: [number,number,number] = [239,220,182];
const cell = 1.75;
export const floorOrigin = { x:-5.25, y:-4.375 };
function furniture(api:SceneApi, p:Placement, state:State) {
  const [w,h] = footprint(p.id,p.rotation,state.rugSize);
  const x=floorOrigin.x+p.x*cell+.13, y=floorOrigin.y+p.y*cell+.13;
  const right=x+w*cell-.26, front=y+h*cell-.26;
  const {box,sphere,capsule,castShadow}=api;
  switch(p.id) {
    case 'bed':
      box(x,y,0,right,front,.38,wood); box(x-.08,y-.1,.1,right+.08,y+.08,1.25,dark);
      box(x+.04,y+.08,.38,right-.04,front-.04,.65,cream);
      box(x+.25,y+.22,.65,right-.25,y+.8,.8,[248,235,207]);
      box(x+.05,y+1.15,.65,right-.05,front,.77,[124,149,126]);
      for(let i=0;i<4;i++) box(x+.1,y+1.3+i*.48,.77,right-.1,y+1.33+i*.48,.79,[150,165,136]);
      break;
    case 'table':
      for(const dx of [x+.12,right-.28]) for(const dy of [y+.12,front-.28]) box(dx,dy,0,dx+.16,dy+.16,1.15,dark);
      box(x,y,1.1,right,front,1.3,wood); box(x+.06,y+.06,1.3,right-.06,front-.06,1.34,[195,157,105]);
      box(x+.32,y+.2,1.34,x+.85,y+.64,1.39,cream); sphere(x+.58,y+.43,1.5,.17,[129,151,134],'solid');
      break;
    case 'chair': case 'repairs.stool':
      for(const dx of [x+.12,right-.25]) for(const dy of [y+.12,front-.25]) box(dx,dy,0,dx+.13,dy+.13,.68,dark);
      box(x,y,.65,right,front,.82,wood);
      if(p.id==='chair') {
        if(p.rotation===0) { box(x,y,0,x+.14,y+.16,1.55,dark);box(right-.14,y,0,right,y+.16,1.55,dark);box(x,y,1.2,right,y+.16,1.55,wood); }
        else { box(x,y,0,x+.16,y+.14,1.55,dark);box(x,front-.14,0,x+.16,front,1.55,dark);box(x,y,1.2,x+.16,front,1.55,wood); }
      }
      break;
    case 'rug':
      box(x,y,.01,right,front,.035,[170,153,115]);box(x+.15,y+.15,.035,right-.15,front-.15,.05,[211,192,150]);
      for(let at=x+.2;at<right-.1;at+=.25) { box(at,y-.09,.01,at+.07,y+.03,.04,cream);box(at,front-.03,.01,at+.07,front+.09,.04,cream); }
      break;
    case 'cushion': case 'cats.cushion': {
      const colour:[number,number,number]=p.id==='cats.cushion' ? [191,162,117] : state.colour==='blue' ? [128,155,171] : [226,208,169];
      box(x+.05,y+.05,.05,right-.05,front-.05,.25,colour);sphere((x+right)/2,(y+front)/2,.26,.48,colour,'solid');
      break;
    }
    case 'vase': case 'garden.planter':
      box(x+.35,y+.35,0,right-.35,front-.35,.6,[132,157,139]);
      for(let i=0;i<5;i++) {const a=i*2.4;capsule([x+.7,y+.7,.55],[x+.7+Math.cos(a)*.45,y+.7+Math.sin(a)*.45,1.1+(i%2)*.3],.11,.07,()=>[103,140,105],'solid');}
      break;
    case 'basket':
      box(x+.12,y+.12,0,right-.12,front-.12,.55,[186,153,103]);box(x+.23,y+.23,.55,right-.23,front-.23,.58,dark);
      for(let i=0;i<4;i++) box(x+.11,y+.12,.12+i*.1,right-.11,y+.15,.15+i*.1,cream);
      break;
    case 'lamp':
      sphere(x+.7,y+.7,.12,.4,dark,'solid');capsule([x+.7,y+.7,.12],[x+.7,y+.7,1.65],.06,.06,()=>dark,'solid');
      sphere(x+.7,y+.7,1.7,.45,[245,212,151],'solid');box(x+.25,y+.25,1.5,x+1.15,y+1.15,1.6,cream);
      break;
  }
  if(p.id!=='rug') castShadow((x+right)/2,(y+front)/2,.15,Math.max(w,h)*.55,.8,0);
}
export function apartmentScene():Scene<[State]> {
  return {
    bake(api) {
      const {W,H,pix,zb,ground,groundZ,rgb,hash,unproject,box}=api;
      pix.fill(rgb(232,223,207));zb.fill(-1e9);
      for(let sy=0;sy<H;sy++) for(let sx=0;sx<W;sx++) {
        const p=unproject(sx+.5,sy+.5),i=sy*W+sx;
        const gx=(p.x-floorOrigin.x)/cell,gy=(p.y-floorOrigin.y)/cell;
        if(gx<0 || gx>6 || gy<0 || gy>5) continue;
        const seam=gx%1<.025 || gy%1<.025;
        const c=seam ? [171,145,108] : (Math.floor(gx)+Math.floor(gy))%2 ? [208,182,140] : [220,196,153];
        const grain=(hash(sx,sy)-.5)*8;pix[i]=rgb(c[0]+grain,c[1]+grain,c[2]+grain);ground[i]=1;zb[i]=(p.x+p.y)/api.R2*api.COS;
      }
      groundZ.set(zb);
      box(-5.45,-4.55,-.3,5.45,-4.38,2.9,cream);box(-5.45,-4.55,-.3,-5.26,4.5,2.9,[220,203,170]);
      box(-5.46,-4.56,2.9,5.46,-4.35,3.06,dark);box(-5.46,-4.56,2.9,-5.23,4.5,3.06,dark);
      box(-5.4,4.38,-.3,5.4,4.55,.02,wood);box(5.25,-4.4,-.3,5.45,4.55,.02,wood);
      box(.2,-4.36,1.05,3.4,-4.25,2.7,dark);box(.3,-4.23,1.15,3.3,-4.18,2.6,[158,175,188]);
      box(1.7,-4.16,1.1,1.83,-4.1,2.65,cream);box(.25,-4.16,1.85,3.35,-4.1,1.98,cream);box(.05,-4.4,.95,3.55,-3.98,1.1,wood);
      box(3.45,-4.28,1.05,3.8,-4.14,2.75,[145,157,136]);box(-.2,-4.28,1.05,.12,-4.14,2.75,[145,157,136]);
      box(3.5,2.7,.01,5.24,4.36,.035,[143,128,100]);
      box(-5.2,.2,1.95,-4.85,2.45,2.08,wood);box(-5.15,.5,2.08,-4.9,.9,2.45,[128,155,142]);box(-5.15,1.2,2.08,-4.9,1.6,2.32,cream);
    },
    draw(api,state) {
      const {box}=api;
      state.placements.filter(p=>p.id==='rug').forEach(p=>furniture(api,p,state));
      state.placements.filter(p=>p.id!=='rug').forEach(p=>furniture(api,p,state));
      if(state.selected && state.draft) {
        const draft={id:state.selected,...state.draft};const valid=legal(state,draft);
        for(const c of cells(draft,state.rugSize)) {
          const x=floorOrigin.x+c.x*cell,y=floorOrigin.y+c.y*cell;
          const colour:[number,number,number]=valid ? [84,103,90] : [103,90,74];
          const segment=valid ? cell : .32;
          for(let step=0;step<cell;step+=valid ? cell : .5) {const end=Math.min(step+segment,cell);box(x+step,y,.06,x+end,y+.06,.1,colour);box(x+step,y+cell-.06,.06,x+end,y+cell,.1,colour);box(x,y+step,.06,x+.06,y+end,.1,colour);box(x+cell-.06,y+step,.06,x+cell,y+end,.1,colour);}
        }
      }
      characterFigure(4.4,3.1,-Math.PI/2,{scale:.9,armR:.3,armL:.1},{shirt:[111,154,134],hair:[65,48,39],skin:[232,183,143],legs:[79,83,70],accessory:'bun'},api.dynamicAdd);
      api.flushShadows();api.applyShadows(api.bakedZ);api.shadeEdges();
    },
  };
}
