import {characterFigure, COLORS, projectPosition, WIDTH, HEIGHT} from './renderer.js';

const wood = [156,111,70], darkWood = [92,69,48], cream = [239,220,182], jade = [111,154,134];
const wall = [238,228,206], wainscot = [176,202,186], sheet = [246,242,232], pillow = [250,247,238];
const metal = [190,192,186], glass = [182,208,214], morning = [226,234,222], curtain = [198,220,204];
const blanket = [126,168,146], screen = [58,82,74], steel = [96,100,98];

export const WARD_CAST = {
  elder: {shirt:[196,212,224], legs:[196,212,224], hair:[204,200,190], accessory:'glasses'},
  player: {shirt:[196,212,224], legs:[196,212,224], hair:[52,42,34]},
  doctor: {shirt:[246,246,240], legs:[70,78,84], hair:[40,34,30], accessory:'doctor'},
  nurse: {shirt:[176,214,202], legs:[176,214,202], hair:[56,42,34], accessory:'nurse'},
  aunt: {shirt:[204,160,74], legs:[96,86,78], hair:[70,50,38], accessory:'aunt'},
};

export const BEDS = {
  elder: {x:-3, top:.8, foot:-2.5, head:-5.3},
  player: {x:2.6, top:.8, foot:-2.5, head:-5.3},
};
const LYING_LIFT = .2, INCLINE = .35, BLANKET_SITTING = .4, BLANKET_FROM = -4.3;
export const LYING_BLANKET = {forward:[-.3,.42], side:[-.64,.64], height:[-.15,1.25]};
export const sittingBlanket = bed => [bed.x-1.05, BLANKET_FROM, bed.top, bed.x+1.05, bed.foot-.05, bed.top+BLANKET_SITTING];
export function lyingTransform(bed) {
  const c = Math.cos(INCLINE), s = Math.sin(INCLINE);
  return ([forward, side, height]) => [bed.x - side, bed.foot - .3 - height*c + forward*s, bed.top + LYING_LIFT + forward*c + height*s];
}

export const FIGURES = {
  doctor: {x:1.0, y:-3.8, yaw:Math.PI/6, pose:{stance:.05, armR:.2}},
  nurse: {x:-4.6, y:-.6, yaw:Math.PI/4, pose:{stance:.05, armL:.25}},
  aunt: {x:.25, y:-2.85, yaw:0, pose:{crouch:1, scale:.88, armR:.6, armL:.6}},
  elder: {x:-3, y:-4.55, yaw:Math.PI/4},
  player: {x:2.6, y:-4.55, yaw:Math.PI/2},
};
const BED_SEATED_Z = .23;
const TABLE_SLOTS = {milk:[-1.3,-4.95], egg:[-.95,-4.7], bread:[-.65,-5.05]};
const FOOD = {
  milk: (api, x, y, z) => {
    api.capsule([x,y,z+.02],[x,y,z+.3],.14,.14,h => h<z+.23 ? jade : [232,216,182],'solid');
    api.sphere(x,y,z+.33,.1,[150,108,70],'solid');
  },
  egg: (api, x, y, z) => api.sphere(x,y,z+.13,.13,[206,158,108],'solid'),
  bread: (api, x, y, z) => { api.sphere(x,y,z+.12,.17,[196,138,74],'solid'); api.sphere(x+.02,y+.02,z+.22,.1,[226,176,108],'solid'); },
};
const CABINET_TOP = 1.05, CLOTH = .03;

const DRIP = {x:4.2, y:-4.25, z:2.25};
const MONITOR = {x0:4.12, x1:4.88, y:-4.88, z:1.55};
const SWAY = {x:1.78, y:-5.25, z0:1.25, z1:1.85};

export function wardMotionBounds() {
  const at = (x, y, z) => { const p = projectPosition({x:x+6,y:y+5}, z); return [p.left/100*WIDTH, p.top/100*HEIGHT]; };
  const rect = points => {
    const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
    return [Math.floor(Math.min(...xs))-2, Math.floor(Math.min(...ys))-2, Math.ceil(Math.max(...xs))+2, Math.ceil(Math.max(...ys))+2];
  };
  return [
    rect([at(DRIP.x,DRIP.y,DRIP.z), at(DRIP.x,DRIP.y,DRIP.z-.5)]),
    rect([at(MONITOR.x0,MONITOR.y,MONITOR.z+.15), at(MONITOR.x1,MONITOR.y,MONITOR.z-.15)]),
    rect([at(SWAY.x,SWAY.y,SWAY.z0), at(SWAY.x,SWAY.y,SWAY.z1), at(SWAY.x,SWAY.y,SWAY.z0)]),
  ];
}

function furniture({box,sphere,capsule}) {
  function plant(x,y) {
    box(x-.26,y-.26,0,x+.26,y+.26,.5,[174,131,91]);
    for (let k=0;k<9;k++) {
      const a=k*2.4;
      capsule([x,y,.45],[x+Math.cos(a)*.4,y+Math.sin(a)*.4,.8+(k%3)*.18],.12,.07,()=>jade,'solid');
    }
  }
  function bed(bx, by, along) {
    const L = (a,b,c,d,e,f,color) => along==='y' ? box(bx+a,by+b,c,bx+d,by+e,f,color) : box(bx+b,by+a,c,bx+e,by+d,f,color);
    L(-1,0,0,1,.2,1.45,wood);
    L(-.95,.25,.3,.95,3.0,.55,steel);
    for (const lx of [-.9,.78]) for (const ly of [.3,2.85]) L(lx,ly,0,lx+.12,ly+.12,.32,metal);
    L(-1,.2,.55,1,3.0,.8,sheet);
    L(-.7,.25,.8,.7,.75,1.02,pillow);
    L(-1,3.0,0,1,3.18,1.05,wood);
  }
  function chair(x,y) {
    for (const dx of [-.3,.26]) for (const dy of [-.3,.26]) box(x+dx,y+dy,0,x+dx+.05,y+dy+.05,.56,darkWood);
    box(x-.38,y-.38,.55,x+.38,y+.38,.66,wood);
    box(x-.42,y-.38,.66,x-.32,y+.38,1.45,wood);
  }
  return {plant,bed,chair};
}

export const wardScene = {
bake(api) {
  const {W,H,R2,COS,pix,zb,ground,groundZ,rgb,hash,unproject,box,sphere,capsule,castShadow} = api;
  const {plant,bed,chair} = furniture(api);
  pix.fill(rgb(232,223,207)); zb.fill(-1e9);
  for (let iy=0;iy<H;iy++) for (let ix=0;ix<W;ix++) {
    const g=unproject(ix+.5,iy+.5), i=iy*W+ix;
    if (Math.abs(g.x)>6.65 || Math.abs(g.y)>5.65) continue;
    const gx=g.x+6.65, gy=g.y+5.65;
    const seam=gx%.95<.04 || gy%.95<.04;
    const tile=(Math.floor(gx/.95)+Math.floor(gy/.95))%2;
    let c=seam ? [190,186,170] : tile ? [222,220,206] : [234,231,218];
    const lit=g.x-(g.y+5.6)*.45, reach=g.y+5.6;
    if (reach>0 && reach<4.2 && lit>-1.75 && lit<1.15 && (reach<3.6 || hash(ix,iy)>(reach-3.6)/.6)) c=c.map((v,k)=>v*[1.04,1.02,.94][k]+[6,4,0][k]);
    const fleck=(hash(ix,iy)-.5)*6;
    pix[i]=rgb(c[0]+fleck,c[1]+fleck,c[2]+fleck);
    ground[i]=1; zb[i]=(g.x+g.y)/R2*COS;
  }
  groundZ.set(zb);
  box(-6.7,-5.8,-.4,6.7,-5.55,3.2,wall);
  box(-6.8,-5.8,-.4,-6.55,5.65,3.2,[226,214,190]);
  box(-6.55,-5.56,0,6.7,-5.5,1.0,wainscot);
  box(-6.56,-5.5,0,-6.5,5.65,1.0,[164,190,174]);
  box(-6.55,-5.52,1.0,6.7,-5.46,1.07,wood);
  box(-6.52,-5.5,1.0,-6.46,5.65,1.07,wood);
  box(-6.8,-5.8,3.2,6.7,-5.5,3.38,darkWood);
  box(-6.8,-5.8,3.2,-6.5,5.65,3.38,darkWood);
  box(-6.7,5.6,-.4,6.7,5.8,.06,wood);
  box(6.6,-5.8,-.4,6.8,5.8,.06,wood);
  box(-1.75,-5.56,1.25,1.15,-5.46,2.95,darkWood);
  box(-1.62,-5.47,1.37,1.02,-5.42,2.83,glass);
  box(-1.62,-5.46,2.2,1.02,-5.41,2.83,morning);
  box(-.33,-5.42,1.33,-.27,-5.38,2.87,cream);
  box(-1.62,-5.42,2.08,1.02,-5.38,2.14,cream);
  box(-1.85,-5.5,1.18,1.25,-5.1,1.3,wood);
  capsule([-2.5,-5.38,3.05],[1.9,-5.38,3.05],.035,.035,()=>darkWood,'solid');
  for (const [x0,x1] of [[-2.35,-1.72],[1.12,1.75]]) {
    box(x0,-5.42,1.2,x1,-5.25,3.0,curtain);
    for (let x=x0+.12;x<x1;x+=.16) box(x,-5.26,1.2,x+.04,-5.22,3.0,[176,202,188]);
  }
  box(-6.55,-1.6,0,-6.4,.55,2.62,darkWood);
  box(-6.47,-1.45,0,-6.36,.4,2.48,[176,134,92]);
  box(-6.37,-1.05,1.45,-6.33,-.05,2.2,glass);
  box(-6.37,-1.3,.3,-6.33,.25,1.2,[164,122,82]);
  sphere(-6.3,.18,1.15,.07,COLORS.brass,'solid');
  box(-6.5,2.0,1.55,-6.42,3.7,2.6,wood);
  box(-6.43,2.12,1.67,-6.39,3.58,2.48,[214,226,214]);
  box(-6.42,2.12,1.67,-6.38,3.58,1.95,jade);
  box(-6.42,2.7,1.67,-6.38,3.3,2.15,[96,138,118]);
  bed(-3,-5.5,'y');
  bed(2.6,-5.5,'y');
  bed(-6.5,2.6,'x');
  box(-6.25,1.85,.8,-3.65,3.35,.92,blanket);
  box(-6.2,1.95,.92,-4.0,3.25,.96,[148,186,164]);
  for (const bx of [-3,2.6]) {
    capsule([bx+1.08,-4.6,.95],[bx+1.08,-3.0,.95],.04,.04,()=>metal,'solid');
    for (const y of [-4.5,-3.1]) capsule([bx+1.08,y,.75],[bx+1.08,y,.95],.03,.03,()=>metal,'solid');
  }
  box(-1.55,-5.4,0,-.45,-4.45,1.0,wood);
  box(-1.6,-5.45,1.0,-.4,-4.4,CABINET_TOP,[187,143,91]);
  box(-1.5,-4.47,.55,-.5,-4.43,.58,darkWood);
  box(-1.48,-5.25,CABINET_TOP,-.48,-4.5,CABINET_TOP+CLOTH,[244,236,216]);
  chair(.25,-2.85);
  chair(-4.4,4.4);
  capsule([DRIP.x,DRIP.y,.06],[DRIP.x,DRIP.y,2.95],.035,.035,()=>metal,'solid');
  for (let k=0;k<5;k++) { const a=k*1.26; capsule([DRIP.x,DRIP.y,.06],[DRIP.x+Math.cos(a)*.35,DRIP.y+Math.sin(a)*.35,.04],.035,.035,()=>steel,'solid'); }
  capsule([DRIP.x-.18,DRIP.y,2.92],[DRIP.x+.18,DRIP.y,2.92],.03,.03,()=>metal,'solid');
  box(DRIP.x-.17,DRIP.y-.1,2.38,DRIP.x+.13,DRIP.y+.06,2.85,[226,238,236]);
  capsule([DRIP.x,DRIP.y+.06,2.3],[DRIP.x,DRIP.y+.06,1.92],.05,.05,()=>[214,230,228],'solid');
  capsule([DRIP.x,DRIP.y+.06,1.9],[3.4,-3.5,1.2],.018,.018,()=>[226,236,236],'solid');
  box(4.1,-5.3,0,4.9,-4.6,.08,steel);
  capsule([4.5,-4.95,.08],[4.5,-4.95,.95],.05,.05,()=>metal,'solid');
  box(4.05,-5.35,.95,4.95,-4.55,1.05,metal);
  box(4.05,-5.25,1.05,4.95,-4.95,1.95,[78,84,80]);
  box(4.12,-4.96,1.15,4.88,-4.9,1.85,screen);
  plant(-5.7,-4.85);
  plant(5.75,4.75);
  box(5.0,-1.2,0,6.2,-.1,.85,[214,206,190]);
  box(4.95,-1.25,.85,6.25,-.05,.92,cream);
  for (let k=0;k<3;k++) box(5.15,-1.05+k*.32,.92,6.05,-.82+k*.32,1.08,[210,226,218]);
  castShadow(-3,-3.8,.4,1.3); castShadow(2.6,-3.8,.4,1.3); castShadow(-5,2.6,.4,1.2);
},
draw(api, frame, time) {
  const {W,pix,rgb,project,box,sphere,capsule,bakedZ,flushShadows,applyShadows,shadeEdges,dynamicAdd} = api;
  for (const food of frame.table) FOOD[food](api,...TABLE_SLOTS[food],CABINET_TOP+CLOTH);
  const elder = FIGURES.elder, player = FIGURES.player;
  if (frame.elder === 'lying') lie(api, BEDS.elder, WARD_CAST.elder);
  else {
    const held = frame.held && FOOD[frame.held];
    const rig = characterFigure(elder.x,elder.y,elder.yaw,{crouch:1,scale:.88,z:BED_SEATED_Z,lean:.08,armL:.3,
      ...(held ? {elbowR:[.32,.36,1.22],handR:[.58,.24,1.5]} : {armR:.35})},WARD_CAST.elder,dynamicAdd);
    if (held) held(api,...rig.local(.62,.24,1.42));
  }
  if (frame.elder === 'sitting') box(...sittingBlanket(BEDS.elder), blanket);
  if (frame.player === 'lying') lie(api, BEDS.player, WARD_CAST.player);
  else {
    characterFigure(player.x,player.y,player.yaw,{crouch:1,scale:.88,z:BED_SEATED_Z,armR:.3,armL:.3},WARD_CAST.player,dynamicAdd);
    box(...sittingBlanket(BEDS.player), blanket);
  }
  for (const id of frame.present) {
    const f = FIGURES[id];
    const rig = characterFigure(f.x,f.y,f.yaw,f.pose,WARD_CAST[id],dynamicAdd);
    if (id === 'aunt') {
      box(...rig.local(.28,-.22,1.0),...rig.local(.62,.22,1.22),[244,238,224],0);
      sphere(...rig.local(.45,-.08,1.28),.1,[252,248,238],'solid');
      sphere(...rig.local(.45,.1,1.28),.1,[252,248,238],'solid');
      capsule([f.x+.1,f.y+.62,.02],[f.x+.1,f.y+.62,.62],.13,.13,()=>jade,'solid');
      sphere(f.x+.1,f.y+.62,.68,.11,cream,'solid');
    }
  }
  flushShadows(); applyShadows(bakedZ); shadeEdges();
  const put = (x,y,z,color) => {
    const p=project(x,y,z), ix=Math.round(p.sx), iy=Math.round(p.sy);
    if (ix>=0 && iy>=0 && ix<W && iy*W+ix<pix.length) pix[iy*W+ix]=rgb(...color);
  };
  const drop=(time*1.6)%1;
  put(DRIP.x,DRIP.y+.06,2.28-drop*.3,[150,196,214]);
  const blip=Math.floor(time*6)%12;
  put(MONITOR.x0+(MONITOR.x1-MONITOR.x0)*blip/11,MONITOR.y,MONITOR.z+(blip%4===1?.12:0),[168,230,196]);
  if (Math.sin(time*1.7)>.2) for (let z=SWAY.z0;z<SWAY.z0+.6;z+=.05) put(SWAY.x,SWAY.y,z,[176,202,188]);
},
};

function lie(api, bed, palette) {
  const to = lyingTransform(bed), local = (f,s,h) => to([f,s,h]);
  characterFigure(0,0,0,{lying:true,scale:.88},palette,(a,b,r0,r1,f)=>api.dynamicAdd(to(a),to(b),r0,r1,f));
  api.box(-.62,-.6,.95,-.32,.6,2.35,pillow,0,local);
  const {forward,side,height} = LYING_BLANKET;
  api.box(forward[0],side[0],height[0],forward[1],side[1],height[1],blanket,0,local);
}
