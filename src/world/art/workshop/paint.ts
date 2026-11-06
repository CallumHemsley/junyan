import type { SceneApi } from '../../../scene/renderer.js';
import { drawLamp, drawToy } from '../../../features/repairs/scene';
import type { State } from '../../../features/repairs/rules';
import { workshopDefinition as map } from '../../maps/workshop';

type Color = [number, number, number];
type Prop = typeof map.props[number];
export type WorkshopPaintState = { repairs?: State; elapsedSeconds: number };
const wood: Color = [156, 111, 70], edge: Color = [92, 69, 48], cream: Color = [239, 220, 182];
const jade: Color = [111, 154, 134], metal: Color = [153, 159, 151], ink: Color = [58, 58, 52];
const warm: Color = [255, 212, 146], blue: Color = [158, 175, 188], straw: Color = [193, 165, 108];

export function workshopGroundColor(x: number, y: number): Color | null {
  if (x < 2 || x > 28 || y < 2 || y > 27) return null;
  if (y > 21) {
    const joint = x % 1.2 < .055 || (y + Math.floor(x / 1.2) % 2 * .45) % .9 < .055;
    const n = Math.sin(Math.floor(x / 1.2) * 71 + Math.floor(y / .9) * 29) * 5;
    return joint ? [127, 125, 107] : [179 + n, 175 + n, 151 + n];
  }
  const board = Math.floor(x / .65), grain = Math.sin(y * 15 + board * 21) * 2;
  const joint = x % .65 < .025 || (y + board % 3 * 2) % 6 < .035;
  let c: Color = joint ? [140, 105, 71] : [191 + grain + board % 3 * 4, 151 + grain + board % 3 * 3, 105 + grain];
  // Mullion-shaped pools of cool daylight across the main aisle.
  if (x > 9 && x < 19 && y > 3 && y < 8 && Math.floor((x - 9) / 2.5) !== 1) c = [c[0] + 19, c[1] + 25, c[2] + 31];
  if ((x > 5 && x < 10.5 || x > 18 && x < 24) && y > 7.5 && y < 11.5) {
    const border = y < 7.65 || y > 11.35 || x % 1 < .035;
    c = border ? [147, 141, 110] : [112, 131, 114];
  }
  if (x > 13 && x < 17 && y > 6 && y < 19) c = (x < 13.15 || x > 16.85) ? [159, 141, 106] : [133, 117, 90];
  return c;
}

export function drawWorkshopProp(api: SceneApi, prop: Prop, state: WorkshopPaintState) {
  const x = prop.position.x, y = prop.position.y, w = prop.width, h = prop.height;
  const b = (a: number, c: number, z: number, d: number, e: number, top: number, color: Color) => api.box(x + a, y + c, z, x + d, y + e, top, color);
  const line = (a: [number, number, number], c: [number, number, number], radius: number, color: Color) => api.capsule([x + a[0], y + a[1], a[2]], [x + c[0], y + c[1], c[2]], radius, radius, () => color, 'solid');
  const dot = (a: number, c: number, z: number, r: number, color: Color) => api.sphere(x + a, y + c, z, r, color, 'solid');
  const bench = (color: Color = wood, top = 1.45) => {
    for (const a of [.18, w - .18]) for (const c of [.18, h - .18]) b(a - .08, c - .08, .04, a + .08, c + .08, top, edge);
    b(.1, .1, .65, w - .1, h - .1, .78, edge);
    b(-.08, -.08, top, w + .08, h + .08, top + .18, color);
    for (let a = .25; a < w; a += .55) b(a, 0, top + .181, a + .018, h, top + .188, edge);
    for (const a of [.15, w - .15]) for (const c of [.15, h - .15]) dot(a,c,top+.19,.035,metal);
  };
  const plant = (a: number, c: number, z: number, size = 1) => {
    b(a-.28*size,c-.28*size,z,a+.28*size,c+.28*size,z+.45*size,straw);
    b(a-.3*size,c-.3*size,z+.4*size,a+.3*size,c+.3*size,z+.49*size,edge);
    for (let i=0;i<5;i++) {
      const angle=i*2.4;
      line([a,c,z+.45*size],[a+Math.cos(angle)*.4*size,c+Math.sin(angle)*.4*size,z+(1.1+i%2*.25)*size],.085*size,jade);
      dot(a+Math.cos(angle)*.37*size,c+Math.sin(angle)*.37*size,z+(1.06+i%2*.25)*size,.19*size,[96,132+i*4,102]);
    }
  };
  switch (prop.kind) {
    case 'wall':
      b(0,0,0,w,h,3.8,prop.variant ? [207,190,158] : cream);
      b(0,0,0,w,h,.35,edge); b(0,0,3.5,w,h,3.85,edge);
      if (!prop.variant) for (let a=.5;a<w;a+=4.5) b(a,0,.35,a+.13,h,3.55,wood);
      break;
    case 'low-wall': b(0,0,0,w,h,.55,cream); b(0,0,.55,w,h,.7,wood); break;
    case 'window':
      b(-.08,-.08,1.55,w+.08,h+.08,3.25,edge);
      b(0,0,1.68,w,h,3.12,blue);
      if (prop.variant) {
        for (let a=1.5;a<w;a+=1.5) b(a,0,1.68,a+.09,h+.05,3.12,cream);
        b(0,0,2.4,w,h+.07,2.48,cream); b(-.1,0,1.5,w+.1,.5,1.65,wood);
      } else {
        for (let c=1;c<h;c++) b(0,c,1.68,w+.05,c+.09,3.12,cream);
        b(0,0,2.4,w+.07,h,2.48,cream); b(0,-.1,1.5,.5,h+.1,1.65,wood);
      }
      break;
    case 'shelf': case 'display-shelf':
      b(0,0,.05,.15,h,3.4,edge); b(w-.15,0,.05,w,h,3.4,edge);
      for (const z of [.35,1.55,2.75]) {
        b(0,0,z,w,h,z+.13,wood);
        if (prop.kind==='shelf') for (let a=.35;a<w-.3;a+=.8) {
          b(a,.2,z+.14,a+.58,h-.15,z+.65,a%1.6<.8?jade:straw);
          b(a+.16,h-.19,z+.3,a+.42,h-.12,z+.4,cream);
        }
      }
      if (prop.kind==='display-shelf') {
        const completed=state.repairs?.completed ?? [];
        if(completed.includes('lamp')) drawLamp(api,{kind:'lamp',fitting:'seated',power:'on',test:'steady'},x+1.2,y+.7,1.69,.65,0);
        if(completed.includes('toy')) drawToy(api,{kind:'toy',cover:'closed',lead:'connected',cell:'fresh',test:'moving'},x+3.6,y+.6,1.69,.6,state.elapsedSeconds);
        b(.5,.2,2.89,1.5,1,3.3,cream); b(3.7,.2,2.89,4.7,1,3.3,blue);
        for(let i=0;i<3;i++) dot(2.2+i*.24,.7,3.05,.16,metal);
      }
      break;
    case 'pegboard':
      b(0,0,1.55,w,h,3.1,[176,139,91]);
      for(let a=.2;a<w;a+=.35) for(let z=1.7;z<3;z+=.35) dot(a,h+.02,z,.025,edge);
      for(let i=0;i<8;i++) {
        const a=.5+i*.9;
        line([a,h+.1,2.7],[a,h+.1,2.03],.05,metal);
        if(i%3===0) line([a-.2,h+.1,2.65],[a+.22,h+.1,2.65],.08,metal);
        else if(i%3===1) b(a-.08,h,1.9,a+.08,h+.18,2.25,edge);
        else {line([a,h+.1,2.03],[a-.15,h+.1,1.85],.055,metal);line([a,h+.1,2.03],[a+.15,h+.1,1.85],.055,metal);}
      }
      break;
    case 'lamp-bench': case 'toy-bench':
      bench(); b(.3,.2,1.64,w-.3,h-.2,1.66,[111,137,120]);
      if(prop.kind==='lamp-bench') drawLamp(api,state.repairs?.jobs.lamp ?? {kind:'lamp',fitting:'loose',power:'off',test:'none'},x+2.4,y+.85,1.67,.78,state.elapsedSeconds);
      else drawToy(api,state.repairs?.jobs.toy ?? {kind:'toy',cover:'closed',lead:'loose',cell:'old',test:'none'},x+2.8,y+.8,1.67,.9,state.elapsedSeconds);
      line([.45,h-.3,1.7],[1.35,h-.4,1.7],.05,metal); b(.3,h-.45,1.69,.6,h-.2,1.83,edge);
      for(let i=0;i<4;i++) dot(w-1+i*.16,h-.35,1.73,.055,metal);
      break;
    case 'wood-bench':
      bench(prop.variant?[177,138,88]:wood);
      for(let i=0;i<4;i++) b(.2+i*.18,.2,1.64,.3+i*.18,h-.2,1.72,[203-i*8,172-i*6,115-i*5]);
      b(w-.8,h-.35,1.4,w-.3,h+.18,1.86,metal); b(w-.7,h+.18,1.5,w-.4,h+.3,1.74,edge);
      line([w-.55,h+.32,1.6],[w-.55,h+.32,1.2],.04,metal);
      break;
    case 'sewing-bench':
      bench(); b(1,.3,1.64,2.4,1.3,1.68,cream); b(1.35,.4,1.68,2.15,1,1.85,ink);
      b(1.9,.45,1.85,2.15,.85,2.5,ink); b(1.3,.45,2.35,2.15,.85,2.53,ink);
      line([1.35,.65,2.35],[1.35,.65,1.83],.04,metal);
      dot(2.15,.97,2.2,.25,edge);
      for(let i=0;i<3;i++){b(3+i*.28,.4,1.64,3.18+i*.28,.65,2.08,i%2?jade:straw);}
      b(.3,.3,1.64,.8,1.85,1.72,blue); break;
    case 'stool':
      for(const a of [.1,.7]) for(const c of [.1,.7]) b(a,c,0,a+.12,c+.12,.78,edge);
      b(0,0,.78,.9,.9,.92,wood); break;
    case 'drawers':
      b(0,0,0,w,h,2.5,edge);
      for(let c=.1;c<h;c+=.95) for(let z=.15;z<2.4;z+=.7){b(.05,c,z,w+.03,c+.8,z+.6,wood);b(w,c+.3,z+.25,w+.1,c+.5,z+.32,metal);}
      break;
    case 'timber-rack':
      for(let a=.1;a<w;a+=.25) b(a,.1,0,a+.15,h-.2,2.6+a*.18,a%.5<.25?wood:straw);
      b(0,h-.5,.7,w,h-.35,.85,edge); break;
    case 'bins': case 'crates': case 'basket':
      b(0,0,0,w,h,.75,prop.variant?blue:wood); b(.12,.12,.6,w-.12,h-.12,.78,edge);
      for(let z=.15;z<.7;z+=.2) b(-.01,h,z,w+.01,h+.04,z+.04,straw);
      if(prop.kind==='bins') for(let a=.1;a<w;a+=.3) dot(a,h*.5,.85,.13,metal);
      if(prop.kind==='basket') for(let i=0;i<4;i++) b(.15+i*.16,.15,.76,.35+i*.16,h-.15,.86+i%2*.07,i%2?cream:jade);
      break;
    case 'plant': plant(.5,.5,1.65,.8); break;
    case 'planter': b(0,0,0,w,h,.6,wood); plant(w/2,h*.3,.6,1.1);plant(w/2,h*.75,.6,.8); break;
    case 'radio': b(0,0,1.69,w,h,2.2,edge); b(.1,h,1.8,.5,h+.02,2.1,metal);dot(.67,h+.04,1.9,.08,cream);line([.6,.1,2.2],[.75,.1,2.8],.018,metal);break;
    case 'kettle': dot(.3,.3,1.95,.28,metal);b(.15,.15,2.15,.45,.45,2.24,ink);line([.45,.3,2],[.65,.3,2.15],.07,metal);break;
    case 'task-lamp': b(0,0,1.65,.5,.5,1.73,edge);line([.25,.25,1.73],[.3,.25,2.8],.045,metal);line([.3,.25,2.8],[-.15,.25,2.7],.05,metal);b(-.35,.05,2.5,.05,.45,2.7,jade);break;
    case 'chair-repair':
      b(0,0,1.67,1,1,1.78,wood);for(const a of [.1,.8]) for(const c of [.1,.8]) b(a,c,1.78,a+.1,c+.1,2.5,edge);
      b(.05,.05,2.4,.95,.2,2.6,wood); b(-.15,.3,1.65,1.15,.4,1.72,metal);break;
    case 'shavings': for(let i=0;i<12;i++){const a=(i*1.31)%w,c=(i*.77)%h;line([a,c,.03],[a+.15,c+.1,.05],.035,straw);}break;
    case 'paper': b(0,0,1.67,w,h,1.69,cream);for(let i=0;i<3;i++) line([.2,.15+i*.13,1.7],[.7,.2+i*.13,1.7],.015,blue);break;
    case 'door-post': b(0,0,0,w,h,3.5,edge);b(.04,.04,0,w-.04,h-.04,3.5,wood);break;
    case 'doormat': b(0,0,.01,w,h,.03,edge);for(let a=.15;a<w;a+=.22) b(a,.1,.031,a+.05,h-.1,.04,straw);break;
    case 'awning':
      // Narrow overhead ribs retain the covered threshold without hiding the player.
      for(const a of [0,w]){b(a-.06,0,0,a+.06,h,3.7,edge);}
      for(let a=0;a<w;a+=.55) b(a,0,3.65,a+.12,h,3.76,jade);
      b(0,h-.15,3.35,w,h,3.65,[101,130,116]);break;
    case 'bicycle':
      for(const a of [.6,2.4]) {dot(a,.5,.65,.55,ink);dot(a,.51,.65,.42,metal);dot(a,.53,.65,.32,cream);}
      line([.6,.54,.65],[1.1,.54,1.45],.055,jade);line([1.1,.54,1.45],[1.7,.54,.65],.055,jade);line([1.7,.54,.65],[.6,.54,.65],.055,jade);
      line([1.1,.54,1.45],[2.1,.54,1.35],.055,jade);line([2.1,.54,1.35],[2.4,.54,.65],.055,jade);line([1.7,.54,.65],[2.1,.54,1.35],.055,jade);
      b(.9,.4,1.45,1.4,.7,1.55,edge);line([2.1,.54,1.35],[2,.54,1.8],.035,metal);line([1.8,.54,1.8],[2.2,.54,1.8],.045,edge);break;
    case 'wheel': dot(.45,.25,.45,.42,ink);dot(.45,.27,.45,.3,metal);break;
  }
}
