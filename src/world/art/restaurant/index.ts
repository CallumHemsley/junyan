import type { RestaurantMap, RestaurantObject, RestaurantView } from './types';
import { RESTAURANT_TABLES, type RestaurantProjection } from './projection';
import { drawFood } from './food';
import { box, bowl, oval, palette as p, polygon } from './primitives';
export { projectRestaurant, RESTAURANT_TABLES } from './projection';
export type { RestaurantProjection, RestaurantCustomer } from './projection';
export type { RestaurantMap, RestaurantObject, RestaurantView } from './types';

export function drawMap(ctx: CanvasRenderingContext2D, map: RestaurantMap, v: RestaurantView) {
  if (map.id !== 'restaurant' || v.pass !== 'ground') return;
  for (let y=1; y<map.bounds.height-1; y++) for(let x=1; x<map.bounds.width-1; x++) {
    polygon(ctx,v,[[x,y,0],[x+1,y,0],[x+1,y+1,0],[x,y+1,0]],p.grout);
    polygon(ctx,v,[[x+.035,y+.035,.005],[x+.965,y+.035,.005],[x+.965,y+.965,.005],[x+.035,y+.965,.005]],(x+y)%2 ? p.tile : '#ebdcbb');
    for(let n=0;n<4;n++) {
      const a=x+((x*7+y*11+n*17)%89)/100+.05;
      const b=y+((x*13+y*3+n*23)%89)/100+.05;
      const s=v.project({x:a,y:b});
      const color=n%2 ? '#d2c29f' : '#f5e8cb';
      ctx.fillStyle=v.shadeColor?.(color) ?? color; ctx.fillRect(Math.round(s.x),Math.round(s.y),1,1);
    }
  }
  ctx.save();ctx.globalAlpha*=.18;
  for(const prop of map.props.filter(prop=>prop.kind==='table')) {
    const {x,y}=prop.position;
    polygon(ctx,v,[[x-.24,y-.56,.012],[x+.7,y-.9,.012],[x+1.25,y-.55,.012],[x+1.1,y+.15,.012],[x+.22,y+.2,.012]],'#a99575');
    polygon(ctx,v,[[x+.3,y+2.1,.012],[x+1.6,y+2.03,.012],[x+1.85,y+2.65,.012],[x+.75,y+2.85,.012],[x+.12,y+2.5,.012]],'#b8a584');
  }
  polygon(ctx,v,[[10.8,19.8,.012],[11.2,17.4,.012],[12.1,16.1,.012],[13.4,17.3,.012],[13.1,19.8,.012]],'#b29b77');
  polygon(ctx,v,[[10.3,7.9,.012],[10.5,6,.012],[14.1,5.8,.012],[14.8,7.1,.012],[13.7,8.8,.012],[11.4,8.6,.012]],'#b8a17b');
  ctx.restore();
  for(const y of [3,9,15]) {
    ctx.save();ctx.globalAlpha*=.1;
    polygon(ctx,v,[[1.2,y+.2,.015],[1.2,y+1.65,.015],[4.5,y+3.2,.015],[5.2,y+1.8,.015]],'#e5e6d5');
    ctx.restore();
  }
  for(const x of [8,16]) {
    ctx.save();ctx.globalAlpha*=.07;
    oval(ctx,{...v,shadeColor:undefined},x,7,.012,2.8,'#ffd492');
    ctx.restore();
  }
  box(ctx,v,1,20.92,-.16,10,.14,.2,p.woodLight);
  box(ctx,v,13,20.92,-.16,10,.14,.2,p.woodLight);
  polygon(ctx,v,[[10.8,19.7,.015],[13.2,19.7,.015],[13.2,20.85,.015],[10.8,20.85,.015]],p.jadeDark);
  for(let x=11; x<13.2;x+=.3) polygon(ctx,v,[[x,19.75,.02],[x+.05,19.75,.02],[x+.05,20.8,.02],[x,20.8,.02]],p.jade);
}

function table(ctx: CanvasRenderingContext2D, v: RestaurantView, x: number, y: number, w: number, d: number) {
  ctx.save();ctx.globalAlpha*=.18;
  oval(ctx,v,x+w/2+.25,y+d/2+.25,.01,1.35,p.ink);ctx.restore();
  for(const dx of [.18,w-.32]) for(const dy of [.18,d-.32]) box(ctx,v,x+dx,y+dy,0,.14,.14,1.32,p.woodDark);
  box(ctx,v,x,y,1.27,w,d,.17,p.woodLight,p.woodDark,p.wood);
  for(let n=.15;n<w;n+=.36) box(ctx,v,x+n,y+.04,1.443,.015,d-.08,.003,'#b88d5c');
  box(ctx,v,x+w-.48,y+.23,1.44,.25,.25,.35,p.cream,'#c3b594','#e1d4b4');
  for(let n=0;n<3;n++) box(ctx,v,x+w-.42+n*.06,y+.29,1.7,.025,.025,.3,p.woodDark);
  for(const sy of [y-.85,y+d+.22]) {
    for(const dx of [.12,.58]) box(ctx,v,x+w/2-.36+dx,sy+.1,0,.11,.37,.67,p.woodDark);
    box(ctx,v,x+w/2-.45,sy,.62,.9,.66,.15,p.woodLight);
  }
}
function counter(ctx: CanvasRenderingContext2D, v: RestaurantView, x: number, y: number, w: number, d: number) {
  box(ctx,v,x,y,0,w,d,1.68,p.jade,p.jadeDark,p.jade);
  for(let a=.2;a<w;a+=.8) box(ctx,v,x+a,y+d+.005,.1,.025,.025,1.52,'#b3c4aa');
  for(let z=.5;z<1.65;z+=.5) box(ctx,v,x,y+d+.015,z,w,.02,.02,'#b3c4aa');
  box(ctx,v,x-.08,y-.08,1.68,w+.16,d+.16,.19,p.woodLight,p.woodDark,p.wood);
}

function kitchenObjects(prop: RestaurantMap['props'][number]): RestaurantObject[] {
  const {x,y}=prop.position,w=prop.width;
  const fixtures: {id:string;x:number;extent?:number;draw:RestaurantObject['draw']}[] = [];
  for(const a of [1.7,4.2]) fixtures.push({id:`steamer.${a}`,x:x+a+.8,extent:1,draw(ctx,v) {
    for(let k=0;k<3;k++) {
      box(ctx,v,x+a,y+.65,1.87+k*.26,1.65,1.45,.23,'#dec28d','#ad8755','#c5a16a');
      box(ctx,v,x+a-.04,y+.61,2.06+k*.26,1.73,1.53,.06,p.cream);
      for(let j=.18;j<1.6;j+=.25) box(ctx,v,x+a+j,y+2.105,1.9+k*.26,.045,.02,.14,p.cream);
    }
    for(let n=0;n<3;n++) oval(ctx,v,x+a+.35+n*.45,y+1.3,2.72,.2,p.white);
    for(let k=0;k<3;k++) {
      const phase=((v.reducedMotion?0:v.elapsedMs)/3500+k/3)%1;
      const at=v.project({x:x+a+.7+Math.sin(phase*7+k)*.12,y:y+1.3},2.9+phase*.9);
      ctx.fillStyle='#fff3d799';ctx.fillRect(Math.round(at.x),Math.round(at.y),2,4);
    }
  }});
  for(const a of [8.4,8.95,10.2]) fixtures.push({id:`bowl.${a}`,x:x+a,draw(ctx,v){
    const row=a===8.95?.85:1.5;
    if(a===8.4) for(let k=0;k<3;k++) bowl(ctx,v,x+a,y+row,1.93+k*.12,false);
    else bowl(ctx,v,x+a,y+row,1.93);
  }});
  fixtures.push({id:'utensils',x:x+12.1,draw(ctx,v) {
    box(ctx,v,x+11.95,y+.95,1.87,.38,.38,.52,p.jade,p.jadeDark,p.jade);
    for(let k=0;k<5;k++) box(ctx,v,x+12+k*.055,y+1.02+k%2*.08,2.35,.025,.025,.45+k%2*.14,p.woodDark);
  }});
  fixtures.push({id:'plate-stack',x:x+15.5,draw(ctx,v) {
    for(let k=0;k<4;k++) oval(ctx,v,x+15.5,y+2.35,1.9+k*.07,.37,k%2?p.cream:'#c6b79b');
    box(ctx,v,x+16.4,y+.5,1.87,.23,.23,.62,'#af965e','#796344','#927c51');
    box(ctx,v,x+16.44,y+.54,2.49,.15,.15,.13,p.woodDark);
  }});
  fixtures.push({id:'youtiao',x:x+w-3,extent:1.4,draw(ctx,v) {
    box(ctx,v,x+w-4.4,y+.8,1.87,2.6,1.45,.12,p.woodDark);
    for(let k=0;k<5;k++) box(ctx,v,x+w-4.15+k*.43,y+1,2,.24,1.05,.19,p.brass,'#b68b4a','#c99c54');
  }});
  fixtures.push({id:'cloth',x:x+6.65,draw(ctx,v) {
    box(ctx,v,x+6.1,y+.6,1.87,1.1,1.2,.1,p.cream);
    for(let i=0;i<5;i++) box(ctx,v,x+6.2+i*.15,y+.65,1.976,.04,1.08,.008,'#bbab8d');
    oval(ctx,v,x+6.65,y+1.1,2.05,.36,p.white);
    box(ctx,v,x+5.95,y+.52,2.08,1.3,.12,.11,p.woodLight);
    box(ctx,v,x+7.25,y+.545,2.1,.27,.07,.06,p.woodDark);
    box(ctx,v,x+6.7,y+2.65,1.885,.7,.4,.045,p.cream);
    box(ctx,v,x+6.7,y+3.045,.95,.7,.025,.96,'#e3d4b1','#c5b799','#e3d4b1');
    for(const dx of [.14,.48]) box(ctx,v,x+6.7+dx,y+3.075,1.02,.045,.015,.82,'#b3b69a');
  }});
  fixtures.push({id:'ledger',x:x+13.75,draw(ctx,v) {
    box(ctx,v,x+13.2,y+.4,1.88,1.15,.8,.06,p.cream);
    box(ctx,v,x+13.3,y+.48,1.945,.4,.65,.012,'#d5c7a8');
    box(ctx,v,x+13.78,y+.48,1.945,.4,.65,.012,'#e7dabd');
    box(ctx,v,x+13.7,y+.5,1.98,.025,.7,.025,p.woodDark);
  }});
  fixtures.push({id:'pot',x:x+11.15,draw(ctx,v) {
    box(ctx,v,x+10.7,y+.35,1.88,.9,.7,.48,'#9caaa0','#5a706b','#7e928a');
    oval(ctx,v,x+11.15,y+.7,2.4,.4,'#b2beb0');
    box(ctx,v,x+11.11,y+.65,2.4,.09,.09,.12,p.woodDark);
    box(ctx,v,x+10.67,y+.72,2.13,.8,.05,.045,p.woodDark);
    oval(ctx,v,x+10.65,y+.75,2.16,.12,p.cream);
  }});
  return fixtures.map(f=>{
    const section=Math.min(Math.ceil(w/3)-1,Math.floor((f.x+(f.extent??.5)-x)/3));
    const support=x+section*3+Math.min(3,w-section*3)/2;
    return {id:`restaurant.kitchen.${f.id}`,position:{x:f.x,y:y+prop.height},depth:support+y+prop.height+.02,draw:f.draw};
  });
}

export function renderObjects(map: RestaurantMap, _view: RestaurantView): RestaurantObject[] {
  if(map.id !== 'restaurant') return [];
  const objects: RestaurantObject[] = map.props.flatMap(prop => {
    if(prop.kind==='counter') {
      const segments:RestaurantObject[]=[];
      for(let offset=0;offset<prop.width;offset+=3) {
        const width=Math.min(3,prop.width-offset),x=prop.position.x+offset,y=prop.position.y;
        segments.push({id:offset===0?prop.id:`${prop.id}.section.${offset}`,
          position:{x:x+width/2,y:y+prop.height},
          occlusion:{rect:{x,y,width,height:prop.height},height:1.87,fadeWhenPlayerBehind:true},
          draw(ctx,v){counter(ctx,v,x,y,width,prop.height);},
        });
      }
      return [...segments,...kitchenObjects(prop)];
    }
    return [{
    id: prop.id, position: {x:prop.position.x+prop.width/2,y:prop.position.y+prop.height},
    occlusion: {rect:{...prop.position,width:prop.width,height:prop.height},height:prop.kind==='counter'?2.8:1.9,fadeWhenPlayerBehind:true},
    draw(ctx,v) {
      const {x,y}=prop.position;
      if(prop.kind==='table') table(ctx,v,x,y,prop.width,prop.height);
      else {
        box(ctx,v,x,y,0,.8,.8,.65,p.woodLight);
        for(let k=0;k<8;k++) {
          const a=k*2.4;
          const top={x:x+.4+Math.cos(a)*.55,y:y+.4+Math.sin(a)*.55};
          polygon(ctx,v,[[x+.4,y+.4,.5],[top.x,top.y,1.4+k%3*.22],[top.x+.13,top.y,1.1+k%3*.22]],k%2?p.jade:p.jadeDark);
        }
      }
    },
  }];
  });
  for(let x=1;x<23;x+=2) objects.push({
    id:`restaurant.wall.back.${x}`,position:{x:x+1,y:1},
    occlusion:{rect:{x,y:.7,width:2,height:.7},height:3.68,fadeWhenPlayerBehind:true},
    draw(ctx,v) {
      box(ctx,v,x,.7,0,2,.22,3.5,p.cream,'#dbc7a2','#dfcfad');
      box(ctx,v,x,.65,3.5,2,.32,.18,p.woodDark);
      box(ctx,v,x,.94,.1,2,.025,.4,p.wood);
      if([3,5,7,15,17,19].includes(x)) {
        box(ctx,v,x,1,2.68,2,.4,.12,p.wood);
        for(const a of (x===7||x===19?[.35]:[.3,1.15])) {
          const height=x===5?.37:x===17?.61:.48;
          const glaze=x<8?p.jade:'#b2a486';
          box(ctx,v,x+a,1.08,2.8,.3,.28,height,glaze,p.jadeDark,glaze);
          box(ctx,v,x+a-.03,1.05,2.8+height,.36,.34,.06,p.cream);
        }
      }
    },
  });
  for(let y=1;y<21;y+=2) objects.push({
    id:`restaurant.wall.left.${y}`,position:{x:1,y:y+1},
    occlusion:{rect:{x:.7,y,width:.7,height:2},height:3.68,fadeWhenPlayerBehind:true},
    draw(ctx,v) {
      box(ctx,v,.7,y,0,.22,2,3.5,p.cream,'#c6b598','#dfcfad');
      box(ctx,v,.65,y,3.5,.32,2,.18,p.woodDark);
      box(ctx,v,.94,y,.1,.025,2,.4,p.wood);
      if([3,9,15].includes(y)) {
        box(ctx,v,.96,y+.1,1.2,.08,1.8,1.8,p.woodDark);
        const sky=y===3?'#9bb9c0':y===9?'#90acb5':'#819fab';
        box(ctx,v,1.05,y+.22,1.33,.035,1.56,1.52,sky,sky,sky);
        polygon(ctx,v,[[1.09,y+.23,2.6],[1.09,y+.7,2.85],[1.09,y+1.5,1.55],[1.09,y+1.13,1.34]],'#b6c8c6');
        polygon(ctx,v,[[1.095,y+.3,1.4],[1.095,y+.75,1.4],[1.095,y+.6,1.8],[1.095,y+.28,1.73]],'#83999d');
        box(ctx,v,1.09,y+.95,1.3,.04,.07,1.6,p.cream);
        box(ctx,v,1.09,y+.2,2.04,.04,1.6,.07,p.cream);
        box(ctx,v,.96,y,1.17,.44,2,.14,p.woodLight);
      }
    },
  });
  for(const x of [8,16]) objects.push({
    id:`restaurant.lamp.${x}`,position:{x,y:6},depth:map.bounds.width+map.bounds.height,
    occlusion:{rect:{x:x-.6,y:5.4,width:1.2,height:1.2},height:5.2,fadeWhenPlayerBehind:true},
    draw(ctx,v) {
      box(ctx,v,x-.03,5.97,5.1,.06,.06,1.15,p.woodDark);
      box(ctx,v,x-.2,5.8,5.02,.4,.4,.17,p.cream);
      box(ctx,v,x-.4,5.6,4.82,.8,.8,.2,p.cream);
      box(ctx,v,x-.65,5.35,4.65,1.3,1.3,.17,'#edd5a4');
      oval(ctx,{...v,shadeColor:undefined},x,6,4.64,.38,'#ffd492');
    },
  });
  return objects;
}

export function restaurantObjects(map: RestaurantMap, _view: RestaurantView, projection: RestaurantProjection): RestaurantObject[] {
  return projection.customers.flatMap(customer => {
    const meal=projection.meals.find(m=>m.table===customer.table);
    const binding=RESTAURANT_TABLES.find(b=>b.table===customer.table);
    const prop=map.props.find(p=>p.id===binding?.propId);
    if(!prop) return [];
    return [{id:`restaurant.table-setting.${customer.table}`,position:{x:prop.position.x+prop.width/2,y:prop.position.y+prop.height},
      depth:prop.position.x+prop.width/2+prop.position.y+prop.height+.01,
      draw(ctx:CanvasRenderingContext2D,v:RestaurantView) {
        if(!meal) {
          bowl(ctx,v,prop.position.x+prop.width*.32,prop.position.y+prop.height*.64,1.46,false);
          return;
        }
        meal.foods.forEach((food,i)=>{
          const x=prop.position.x+.4+i*.5,y=prop.position.y+.9;
          drawFood(ctx,v,food,x,y,1.55);
        });
      }}];
  });
}
