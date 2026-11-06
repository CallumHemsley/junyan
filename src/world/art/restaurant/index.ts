import type { RestaurantMap, RestaurantObject, RestaurantView } from './types';
import type { RestaurantProjection } from './projection';
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
      ctx.fillStyle=n%2 ? '#d2c29f' : '#f5e8cb'; ctx.fillRect(Math.round(s.x),Math.round(s.y),1,1);
    }
  }
  box(ctx,v,1,20.92,-.16,10,.14,.2,p.woodLight);
  box(ctx,v,13,20.92,-.16,10,.14,.2,p.woodLight);
  polygon(ctx,v,[[10.8,19.7,.015],[13.2,19.7,.015],[13.2,20.85,.015],[10.8,20.85,.015]],p.jadeDark);
  for(let x=11; x<13.2;x+=.3) polygon(ctx,v,[[x,19.75,.02],[x+.05,19.75,.02],[x+.05,20.8,.02],[x,20.8,.02]],p.jade);
}

function table(ctx: CanvasRenderingContext2D, v: RestaurantView, x: number, y: number, w: number, d: number) {
  oval(ctx,v,x+w/2+.25,y+d/2+.25,.01,1.35,'#b3a58d');
  for(const dx of [.18,w-.32]) for(const dy of [.18,d-.32]) box(ctx,v,x+dx,y+dy,0,.14,.14,1.32,p.woodDark);
  box(ctx,v,x,y,1.27,w,d,.17,p.woodLight,p.woodDark,p.wood);
  for(let n=.15;n<w;n+=.36) box(ctx,v,x+n,y+.04,1.443,.015,d-.08,.003,'#b88d5c');
  bowl(ctx,v,x+w*.32,y+d*.64,1.46,false);
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
  for (const a of [1.7,4.2]) {
    for(let k=0;k<3;k++) {
      box(ctx,v,x+a,y+.65,1.87+k*.26,1.65,1.45,.23,'#dec28d','#ad8755','#c5a16a');
      box(ctx,v,x+a-.04,y+.61,2.06+k*.26,1.73,1.53,.06,p.cream);
      for(let j=.18;j<1.6;j+=.25) box(ctx,v,x+a+j,y+2.105,1.9+k*.26,.045,.02,.14,p.cream);
    }
    for(let n=0;n<3;n++) oval(ctx,v,x+a+.35+n*.45,y+1.3,2.72,.2,p.white);
    if(!v.reducedMotion) for(let k=0;k<3;k++) {
      const phase=(v.elapsedMs/3500+k/3)%1;
      const s=v.project({x:x+a+.7+Math.sin(phase*7+k)*.12,y:y+1.3},2.9+phase*.9);
      ctx.fillStyle='#fff3d799';ctx.fillRect(Math.round(s.x),Math.round(s.y),2,4);
    }
  }
  for(const a of [8.5,10,11.5]) bowl(ctx,v,x+a,y+1.5,1.93);
  box(ctx,v,x+w-4.4,y+.8,1.87,2.6,1.45,.12,p.woodDark);
  for(let k=0;k<5;k++) box(ctx,v,x+w-4.15+k*.43,y+1,2,.24,1.05,.19,p.brass,'#b68b4a','#c99c54');
  box(ctx,v,x+6.1,y+.6,1.87,1.1,1.2,.1,p.cream);
  oval(ctx,v,x+6.65,y+1.1,2.05,.36,p.white);
}

export function renderObjects(map: RestaurantMap, _view: RestaurantView): RestaurantObject[] {
  if(map.id !== 'restaurant') return [];
  const objects: RestaurantObject[] = map.props.map(prop => ({
    id: prop.id, position: {x:prop.position.x+prop.width/2,y:prop.position.y+prop.height},
    occlusion: {rect:{...prop.position,width:prop.width,height:prop.height},height:prop.kind==='counter'?2.8:1.9,fadeWhenPlayerBehind:true},
    draw(ctx,v) {
      const {x,y}=prop.position;
      if(prop.kind==='table') table(ctx,v,x,y,prop.width,prop.height);
      else if(prop.kind==='counter') counter(ctx,v,x,y,prop.width,prop.height);
      else {
        box(ctx,v,x,y,0,.8,.8,.65,p.woodLight);
        for(let k=0;k<8;k++) {
          const a=k*2.4;
          const top={x:x+.4+Math.cos(a)*.55,y:y+.4+Math.sin(a)*.55};
          polygon(ctx,v,[[x+.4,y+.4,.5],[top.x,top.y,1.4+k%3*.22],[top.x+.13,top.y,1.1+k%3*.22]],k%2?p.jade:p.jadeDark);
        }
      }
    },
  }));
  for(let x=1;x<23;x+=2) objects.push({
    id:`restaurant.wall.back.${x}`,position:{x:x+1,y:1},
    draw(ctx,v) {
      box(ctx,v,x,.7,0,2,.22,3.5,p.cream,'#dbc7a2','#dfcfad');
      box(ctx,v,x,.65,3.5,2,.32,.18,p.woodDark);
      box(ctx,v,x,.94,.1,2,.025,.4,p.wood);
      if(x>3&&x<21) {
        box(ctx,v,x,1,2.68,2,.4,.12,p.wood);
        for(const a of [.3,1.15]) {
          box(ctx,v,x+a,1.08,2.8,.3,.28,.48,p.jade,p.jadeDark,p.jade);
          box(ctx,v,x+a-.03,1.05,3.28,.36,.34,.06,p.cream);
        }
      }
    },
  });
  for(let y=1;y<21;y+=2) objects.push({
    id:`restaurant.wall.left.${y}`,position:{x:1,y:y+1},
    draw(ctx,v) {
      box(ctx,v,.7,y,0,.22,2,3.5,p.cream,'#c6b598','#dfcfad');
      box(ctx,v,.65,y,3.5,.32,2,.18,p.woodDark);
      box(ctx,v,.94,y,.1,.025,2,.4,p.wood);
      if([3,9,15].includes(y)) {
        box(ctx,v,.96,y+.1,1.2,.08,1.8,1.8,p.woodDark);
        box(ctx,v,1.05,y+.22,1.33,.035,1.56,1.52,p.cool,'#8dabb6','#8dabb6');
        box(ctx,v,1.09,y+.95,1.3,.04,.07,1.6,p.cream);
        box(ctx,v,1.09,y+.2,2.04,.04,1.6,.07,p.cream);
        box(ctx,v,.96,y,1.17,.44,2,.14,p.woodLight);
      }
    },
  });
  return objects;
}

export function restaurantObjects(map: RestaurantMap, _view: RestaurantView, projection: RestaurantProjection): RestaurantObject[] {
  return projection.meals.flatMap(meal => {
    const prop=map.props.find(p=>p.id===meal.propId);
    if(!prop) return [];
    return [{id:`restaurant.meal.${meal.table}`,position:{x:prop.position.x+prop.width/2,y:prop.position.y+prop.height},
      draw(ctx:CanvasRenderingContext2D,v:RestaurantView) {
        meal.foods.forEach((food,i)=>{
          const x=prop.position.x+.4+i*.5,y=prop.position.y+.9;
          if(food==='porridge'||food==='dumpling'||food==='milk') bowl(ctx,v,x,y,1.55);
          else {
            oval(ctx,v,x,y,1.51,.34,p.cream);
            if(food==='youtiao') for(const dx of [-.1,.1]) box(ctx,v,x+dx-.05,y-.25,1.53,.1,.5,.16,p.brass);
            else oval(ctx,v,x,y,1.68,.23,food==='egg'?p.brass:p.white);
          }
        });
      }}];
  });
}
