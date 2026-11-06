import { drawMap, renderObjects, restaurantObjects, projectRestaurant } from '../../../../src/world/art/restaurant';
import { restaurantMap } from './foundation-map';
import { createRenderer, characterFigure, customerPose } from '../../../../src/scene/renderer.js';
import { content } from '../../../../src/content';
import { createGame } from '../../../../src/game';
import type { RestaurantView, RestaurantObject } from '../../../../src/world/art/restaurant';

const canvas=document.querySelector('canvas')!;
const ctx=canvas.getContext('2d')!;
const params=new URLSearchParams(location.search);
const state=createGame(content,42);
state.customers=state.customers.map((c,i)=>({...c,phase:i===1?'checkout':i===3?'served':'seated'}));
state.served=1;
const food=params.get('food');
if(food) state.customers[0].phase='checkout';
const projectedContent=food?{...content,orders:content.orders.map(order=>order.id===state.customers[0].orderId?{...order,items:[{foodId:food,quantity:1}]}:order)}:content;
const projection=projectRestaurant(state,projectedContent,restaurantMap);
const player={x:Number(params.get('x')??12),y:Number(params.get('y')??17)};
const sprites=new Map<string,HTMLCanvasElement>();
function actor(id:string,position:{x:number;y:number},appearance?:typeof projection.customers[number]['appearance'],phase?:typeof projection.customers[number]['phase']):RestaurantObject {
  const key=id;
  let sprite=sprites.get(key);
  if(!sprite) {
    sprite=document.createElement('canvas');
    const renderer=createRenderer(sprite,{bake(api){api.zb.fill(-1e9);},draw(api){
      characterFigure(0,0,Math.PI/2,phase?customerPose(phase,appearance?.accessory):{stance:0},appearance??{shirt:[225,210,168],hair:[65,48,39],legs:[66,68,65]},api.dynamicAdd);
    }});
    renderer.draw();sprites.set(key,sprite);
  }
  const image=sprite;
  return {id,position,draw(ctx,v){const at=v.project(position),scale=innerWidth<600?18:24,factor=scale/12.73;ctx.drawImage(image,151,99,58,64,Math.round(at.x-29*factor),Math.round(at.y-51*factor),58*factor,64*factor);}};
}
function draw(elapsedMs=0) {
  canvas.width=innerWidth;canvas.height=innerHeight;
  const scale=innerWidth<600?18:24;
  const v:RestaurantView={project(p,z=0){const x=p.x-player.x,y=p.y-player.y;return{x:innerWidth/2+(x-y)*scale,y:innerHeight/2+(x+y)*scale*.5-z*scale};},elapsedMs,reducedMotion:params.has('reduced'),playerPosition:player,width:innerWidth,height:innerHeight,pass:'ground'};
  ctx.imageSmoothingEnabled=false;ctx.fillStyle='#334d47';ctx.fillRect(0,0,innerWidth,innerHeight);
  drawMap(ctx,restaurantMap,v);
  const objects=[...renderObjects(restaurantMap,v),...restaurantObjects(restaurantMap,v,projection),actor('player',player),...projection.customers.map(c=>actor(c.id,c.position,c.appearance,c.phase))];
  objects.sort((a,b)=>(a.depth??a.position.x+a.position.y)-(b.depth??b.position.x+b.position.y)||a.id.localeCompare(b.id));
  for(const object of objects)object.draw(ctx,v);
  document.body.dataset.rendered='true';
}
draw(Number(params.get('time')??0));
Object.assign(window,{restaurantPreview:{draw,projection,objects:renderObjects(restaurantMap,{} as RestaurantView).map(o=>o.id)}});
