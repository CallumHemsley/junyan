import {characterFigure, characterTray, customerPose} from './renderer.js';

// Scene palette follows Morning Steam: dough, tea wood, jade and a cool window.
const wood = [156, 111, 70], darkWood = [92, 69, 48], cream = [239, 220, 182];
const jade = [111, 154, 134], cool = [158, 175, 188], steam = [255, 250, 240];
const waiter = {shirt:[245,232,202], legs:[63,78,74], hair:[54,43,34], skin:[228,177,132]};
function furniture({box,sphere,capsule}) {
function bowl(x,y,z,filled = true) {
  sphere(x,y,z,.28,jade,'solid');
  sphere(x-.035,y-.035,z+.13,.22,filled ? cream : [218,223,209],'solid');
}
function plant(x,y) {
  box(x-.28,y-.28,0,x+.28,y+.28,.55,[174,131,91]);
  for (let k=0;k<9;k++) {
    const a=k*2.4;
    capsule([x,y,.5],[x+Math.cos(a)*.43,y+Math.sin(a)*.43,.85+(k%3)*.19],.12,.07,()=>jade,'solid');
  }
}
function stool(x,y) {
  for (const dx of [-.23,.23]) box(x+dx-.06,y-.12,0,x+dx+.06,y+.12,.65,darkWood);
  box(x-.4,y-.35,.6,x+.4,y+.35,.76,wood);
}
return {bowl,plant,stool};
}
function servedFood({box,sphere,capsule}, kind, x, y) {
  const gold = [220,174,90];
  const stroke = (a,b,r,color) => capsule(a,b,r,r,()=>color,'solid');
  if(kind==='porridge' || kind==='dumpling') {
    sphere(x,y,1.49,.27,jade,'solid');
    sphere(x-.025,y-.025,1.61,.22,cream,'solid');
    if(kind==='dumpling') for(const dx of [-.12,.12]) {
      stroke([x+dx,y-.09,1.69],[x+dx,y+.09,1.69],.10,steam);
    }
  } else if(kind==='milk') {
    stroke([x,y,1.45],[x,y,1.73],.18,jade);
    sphere(x,y,1.77,.16,cream,'solid');
    stroke([x+.04,y,1.8],[x+.12,y,2.02],.025,darkWood);
  } else {
    box(x-.27,y-.24,1.28,x+.27,y+.24,1.32,cream);
    if(kind==='bun') {
      sphere(x,y,1.53,.23,cream,'solid');
      sphere(x,y,1.73,.07,[197,164,107],'solid');
    } else if(kind==='bread') {
      box(x-.22,y-.17,1.32,x+.22,y+.17,1.64,cream);
      stroke([x-.12,y-.18,1.65],[x-.12,y+.18,1.65],.025,[197,164,107]);
      stroke([x+.1,y-.18,1.65],[x+.1,y+.18,1.65],.025,[197,164,107]);
    } else if(kind==='egg') {
      stroke([x-.10,y,1.42],[x+.10,y,1.42],.16,steam);
      sphere(x,y,1.55,.10,gold,'solid');
    } else if(kind==='youtiao') for(const dx of [-.10,.10]) {
      stroke([x+dx,y-.27,1.43],[x+dx,y+.27,1.43],.09,gold);
    }
  }
}
export function restaurantScene(tables, appearances = {}, orderItems = {}) {
  // One representative per food kind; the receipt remains authoritative for quantities.
  const meals = Object.fromEntries(Object.entries(orderItems).map(([id,items]) =>
    [id,[...new Set(items.map(item=>item.foodId))]]));
return {
bake(api) {
  const {W,H,R2,COS,pix,zb,ground,groundZ,rgb,hash,unproject,box,sphere,capsule,castShadow} = api;
  const {bowl,plant,stool} = furniture(api);
  pix.fill(rgb(232,223,207)); zb.fill(-1e9);
  for (let iy=0;iy<H;iy++) for(let ix=0;ix<W;ix++) {
    const g=unproject(ix+.5,iy+.5), i=iy*W+ix;
    if (Math.abs(g.x)>6.65 || Math.abs(g.y)>5.65) continue;
    const gx=g.x+6.65, gy=g.y+5.65;
    const seam=gx%1.05<.045 || gy%1.05<.045;
    const tile=(Math.floor(gx/1.05)+Math.floor(gy/1.05))%2;
    const c=seam ? [175,159,133] : tile ? [221,204,170] : [232,216,183];
    const fleck=(hash(ix,iy)-.5)*7;
    pix[i]=rgb(c[0]+fleck,c[1]+fleck,c[2]+fleck);
    ground[i]=1; zb[i]=(g.x+g.y)/R2*COS;
  }
  groundZ.set(zb);
  // Two tall back walls; front walls are cut down to reveal the room.
  box(-6.7,-5.8,-.4,6.7,-5.55,3.2,cream);
  box(-6.8,-5.8,-.4,-6.55,5.65,3.2,[222,204,170]);
  box(-6.8,-5.8,3.2,6.7,-5.5,3.38,darkWood);
  box(-6.8,-5.8,3.2,-6.5,5.65,3.38,darkWood);
  box(-6.7,5.6,-.4,6.7,5.8,.06,wood);
  box(6.6,-5.8,-.4,6.8,5.8,.06,wood);
  // Window panes and deep wooden sills on the left wall.
  for (const y of [-3.6,.4,3.6]) {
    box(-6.5,y-.9,1.2,-6.40,y+.9,2.85,darkWood);
    box(-6.38,y-.79,1.34,-6.30,y+.79,2.73,cool);
    box(-6.29,y-.04,1.3,-6.24,y+.04,2.77,cream);
    box(-6.29,y-.82,2.04,-6.24,y+.82,2.13,cream);
    box(-6.5,y-1,1.15,-6.03,y+1,1.3,wood);
  }
  // Jade-tiled kitchen, warm wooden worktop, stacked bamboo steamers.
  box(-3.9,-5.4,0,4.9,-3.75,1.25,jade);
  for(let x=-3.8;x<4.9;x+=.7) box(x,-3.77,.12,x+.035,-3.73,1.22,cream);
  box(-4,-5.5,1.25,5,-3.65,1.44,wood);
  for (const x of [-2.8,-1.3]) {
    for(let k=0;k<3;k++) {
      box(x-.49,-4.8,1.45+k*.2,x+.49,-3.9,1.61+k*.2,[197,164,107]);
      box(x-.51,-4.82,1.6+k*.2,x+.51,-3.88,1.65+k*.2,cream);
    }
    for(let b=0;b<3;b++) sphere(x-.27+b*.27,-4.35,2.1,.17,cream,'solid');
  }
  for(const x of [.2,1.1,2]) bowl(x,-4.25,1.6);
  box(3.1,-4.9,1.44,4.4,-4,1.56,darkWood);
  for(let k=0;k<4;k++) capsule([3.3+k*.24,-4.65,1.68],[3.3+k*.24,-4.17,1.68],.1,.1,()=>[220,174,90],'solid');
  // Wall shelf and jars; lamp stem and cream shade.
  box(-3.8,-5.45,2.62,4.7,-5.0,2.76,wood);
  for(const x of [-3,-2.4,2.8,3.5,4.2]) {
    box(x-.16,-5.3,2.76,x+.16,-5.03,3.05,jade);
    box(x-.18,-5.32,3.05,x+.18,-5.01,3.1,cream);
  }
  capsule([.8,-2.6,3.8],[.8,-2.6,3.12],.035,.035,()=>darkWood,'solid');
  sphere(.8,-2.6,3.05,.48,[255,212,146],'solid');
  box(.3,-3.1,2.98,1.3,-2.1,3.06,cream);
  plant(-5.6,4.7); plant(5.7,-4.6); plant(-5.65,-4.8);
  for(const t of tables) {
    const x=t.x-6,y=t.y-5;
    for(const dx of [-.65,.65]) for(const dy of [-.5,.5]) box(x+dx-.09,y+dy-.09,0,x+dx+.09,y+dy+.09,1.05,darkWood);
    box(x-.98,y-.8,1.05,x+.98,y+.8,1.22,wood,t.table*9);
    box(x-.94,y-.76,1.22,x+.94,y+.76,1.27,[187,143,91]);
    stool(x,y-1.2); stool(x,y+1.2);
    box(x+.55,y-.53,1.27,x+.77,y-.3,1.52,cream);
    capsule([x+.67,y-.41,1.5],[x+.72,y-.45,1.85],.025,.025,()=>darkWood,'solid');
    castShadow(x,y,.4,1.1);
  }
  // A curled-up shop cat, tucked beside the front window.
  sphere(-5.6,2,.35,.4,[186,148,96],'solid');
  sphere(-5.4,1.8,.5,.23,[186,148,96],'solid');
  capsule([-5.9,2.05,.35],[-5.65,2.38,.36],.12,.08,()=>cream,'solid');
},
draw(api, state, player, time, moving) {
  const {W,pix,rgb,project,box,sphere,bakedZ,flushShadows,applyShadows,shadeEdges,dynamicAdd} = api;
  const {bowl} = furniture(api);
  for (const t of tables) {
    const customer=state.customers.find(c=>c.table===t.table);
    if (!customer) continue;
    const x=t.x-6,y=t.y-5;
    const served=customer.phase==='served', eating=customer.phase==='checkout'||served;
    const appearance = appearances[customer.orderId];
    const palette = {...waiter, ...appearance};
    characterFigure(x,y-1.2,Math.PI/2,customerPose(customer.phase,appearance?.accessory),palette,dynamicAdd);
    if(eating) {
      const meal=meals[customer.orderId] ?? [];
      meal.forEach((kind,index)=>servedFood(api,kind,x+(index-(meal.length-1)/2)*.58,y+.38));
    }
    else bowl(x+.45,y+.3,1.42,false);
  }
  const x=player.x-6,y=player.y-5;
  const rig=characterFigure(x,y,player.yaw,{stance:moving?Math.sin(time*12)*.17:.05,carry:true},waiter,dynamicAdd);
  characterTray(rig,state.tray,(start,end,color,transform)=>box(...start,...end,color,0,transform));
  flushShadows(); applyShadows(bakedZ); shadeEdges();
  // Pixel wisps, stepped gently like the upstream wind animation.
  for(const source of [-2.8,-1.3]) for(let k=0;k<3;k++) {
    const phase=(time*.32+k/3)%1;
    const p=project(source+Math.sin(phase*7+k)*.12,-4.35,2.25+phase*.8);
    const ix=Math.round(p.sx),iy=Math.round(p.sy);
    if(phase>.1&&phase<.85) for(let n=0;n<3;n++) {
      const i=(iy-n)*W+ix+(n%2);
      if(i>=0&&i<pix.length) pix[i]=rgb(...steam);
    }
  }
},
};
}
