import {describe,expect,it} from 'vitest';
import {content} from '../content';
import {TABLES,type GameState,type Order} from '../contracts';
import {createGame,reduceGame} from '../game';
import {createRenderer,type SceneApi} from './renderer.js';
import {restaurantScene} from './restaurant-scene.js';
import {captureCanvas,sha256} from './scene-frame-hashes.mjs';

const items=Object.fromEntries(content.orders.map(order=>[order.id,order.items]));
function harness(orderItems:Record<string,Order['items']>=items) {
  const canvas=captureCanvas();
  const renderer=createRenderer(canvas as unknown as HTMLCanvasElement,restaurantScene(TABLES,{},orderItems));
  return (state:GameState)=>{
    renderer.draw(state,{...state.player,yaw:Math.PI/2},0,false);
    return canvas.frame.slice();
  };
}
function state(orderId:string,phase:'seated'|'ordered'|'checkout'|'served'='checkout'):GameState {
  return {...createGame(content),player:{x:6,y:6},customers:[{table:1,orderId,phase}]};
}
describe('served food projection',()=>{
  it('draws seven distinct food silhouettes, only after successful delivery',()=>{
    const render=harness(Object.fromEntries(content.foods.map(food=>[food.id,[{foodId:food.id,quantity:1}]])));
    const images=content.foods.map(food=>sha256(render(state(food.id))));
    expect(new Set(images).size).toBe(content.foods.length);
    const ordered=content.foods.map(food=>sha256(render(state(food.id,'ordered'))));
    expect(new Set(ordered).size).toBe(1);
  });
  it('shows one representative of each distinct kind regardless of quantities',()=>{
    const render=harness({one:[{foodId:'bun',quantity:1}],three:[{foodId:'bun',quantity:3}],
      duplicate:[{foodId:'bun',quantity:1},{foodId:'bun',quantity:2}],
      mixed:[{foodId:'bun',quantity:2},{foodId:'milk',quantity:1},{foodId:'egg',quantity:1}]});
    expect(render(state('one'))).toEqual(render(state('three')));
    expect(render(state('one'))).toEqual(render(state('duplicate')));
    expect(render(state('mixed'))).not.toEqual(render(state('one')));
  });
  it('keeps the matching meal through payment and reconstructs it from reloaded state',()=>{
    const saved=state('order-07');
    const render=harness();
    const geometry=(value:GameState)=>{
      const calls:unknown[]=[];
      const scene=restaurantScene(TABLES,{},items);
      const canvas=captureCanvas();
      const renderer=createRenderer(canvas as unknown as HTMLCanvasElement,{
        bake:scene.bake,
        draw:(api:SceneApi)=>{
          const record=(key:'box'|'sphere'|'capsule')=>(...args:unknown[])=>{calls.push([key,...args.map(arg=>typeof arg==='function'?'function':arg)]);};
          scene.draw({...api,box:record('box'),sphere:record('sphere'),capsule:record('capsule')},value,{...value.player,yaw:Math.PI/2},0,false);
        },
      });
      renderer.draw();
      return calls;
    };
    // Customer pose changes after payment; the meal geometry must remain identical.
    expect(geometry({...saved,customers:[{...saved.customers[0],phase:'served'}]})).toEqual(geometry(saved));
    expect(harness()(JSON.parse(JSON.stringify(saved)))).toEqual(render(saved));
    expect(render(state('missing'))).not.toEqual(render(saved));
  });
  it('leaves no rejected-order artifact and puts accepted food at only its assigned table',()=>{
    const initial={...state('order-01','ordered'),player:{x:3,y:5.5}};
    const render=harness();
    const rejected=reduceGame(initial,{type:'deliver',table:1,now:10},content);
    expect(rejected.feedback).toBe('wrong-food');
    expect(render(rejected)).toEqual(render(initial));
    const accepted=reduceGame({...initial,tray:['bun']},{type:'deliver',table:1,now:11},content);
    expect(accepted.customers[0].phase).toBe('checkout');
    const before=render(initial), after=render(accepted);
    const changed=[];
    for(let i=0;i<after.length;i+=4) if(after.subarray(i,i+4).some((v,n)=>v!==before[i+n]))changed.push(i/4);
    expect(changed.length).toBeGreaterThan(0);
    // All changed pixels stay near table 1, rather than leaking into another table.
    expect(changed.every(pixel=>pixel%360>130&&pixel%360<225&&Math.floor(pixel/360)>75&&Math.floor(pixel/360)<150)).toBe(true);
  });
});
