import {describe, expect, it} from 'vitest';
import {TABLES, type GameState} from '../contracts';
import {createRenderer, groundPosition, projectPosition, WIDTH, HEIGHT} from './renderer.js';

describe('restaurant projection',()=>{
  it('round trips every logical floor coordinate through the overlay projection',()=>{
    for(let x=0;x<=12;x++) for(let y=0;y<=10;y++) {
      const screen=projectPosition({x,y});
      const floor=groundPosition(screen.left,screen.top);
      expect(floor.x).toBeCloseTo(x,10);
      expect(floor.y).toBeCloseTo(y,10);
    }
    expect(projectPosition({x:6,y:5}).left).toBe(50);
    expect(projectPosition({x:6,y:5},1).top).toBeLessThan(projectPosition({x:6,y:5}).top);
  });
  it('bounds off-floor pointer coordinates',()=>{
    for(const left of [-100,0,100,200]) for(const top of [-100,0,100,200]) {
      const p=groundPosition(left,top);
      expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThanOrEqual(12);
      expect(p.y).toBeGreaterThanOrEqual(0); expect(p.y).toBeLessThanOrEqual(10);
    }
  });
});

it('renders independently without DOM globals and reflects customer/tray state',()=>{
  const snapshots:Uint8ClampedArray[]=[];
  const canvas=()=>({getContext:()=>({
    createImageData:(w:number,h:number)=>({data:new Uint8ClampedArray(w*h*4)}),
    putImageData:(data:ImageData)=>snapshots.push(data.data.slice()),
  })}) as unknown as HTMLCanvasElement;
  const firstCanvas=canvas(), secondCanvas=canvas();
  const first=createRenderer(firstCanvas,TABLES),second=createRenderer(secondCanvas,TABLES);
  const state:GameState={seed:42,day:1,level:1,player:{x:6,y:6},customers:[
    {table:1,orderId:'one',phase:'ordered'}, {table:2,orderId:'two',phase:'checkout'},
  ],tray:[],served:0,earnings:0,mistakes:0,activeTable:null,feedback:'none',receipt:null,journal:{},ended:false};
  const player={...state.player,yaw:Math.PI/2};
  first.draw(state,player,0,false);
  second.draw(state,player,0,false);
  expect(firstCanvas.width).toBe(WIDTH); expect(firstCanvas.height).toBe(HEIGHT);
  expect(snapshots[0]).toEqual(snapshots[1]);
  first.draw({...state,tray:['bun'],customers:[{table:1,orderId:'one',phase:'served'}]},player,0,false);
  expect(snapshots[2]).not.toEqual(snapshots[0]);
  second.draw(state,player,0,false);
  expect(snapshots[3]).toEqual(snapshots[0]);
});
