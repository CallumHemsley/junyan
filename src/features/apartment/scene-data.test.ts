import { expect, it } from 'vitest';
import { createRenderer, groundPosition, projectPosition } from '../../scene/renderer.js';
import { captureCanvas, sha256 } from '../../scene/scene-frame-hashes.mjs';
import { apartmentScene, floorOrigin } from './scene-data';
import { initialState, reduce } from './rules';
it('projects every room cell back to the same direct-tap coordinate',()=>{
  for(let x=0;x<6;x++) for(let y=0;y<5;y++) {
    const projected=projectPosition({x:floorOrigin.x+(x+.5)*1.75+6,y:floorOrigin.y+(y+.5)*1.75+5});
    const point=groundPosition(projected.left,projected.top);
    expect(Math.floor((point.x-6-floorOrigin.x)/1.75)).toBe(x);expect(Math.floor((point.y-5-floorOrigin.y)/1.75)).toBe(y);
  }
});
it('renders deterministically with existing pixel primitives and visibly changes the room',()=>{
  const render=(state:ReturnType<typeof initialState>)=>{const canvas=captureCanvas();createRenderer(canvas as unknown as HTMLCanvasElement,apartmentScene()).draw(state);return sha256(canvas.frame);};
  const s=initialState();expect(render(s)).toBe(render(s));
  let placed=reduce(s,{type:'accept-starter'},1);placed=reduce(placed,{type:'select',id:'table'},1);placed=reduce(placed,{type:'place',x:3,y:1},1);
  expect(render(placed)).not.toBe(render(s));
});
