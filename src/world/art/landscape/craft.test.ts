import { expect, it } from 'vitest';
import { drawLowerCrossing } from './index';
import { drawRiverbankWater } from './ground';
import { drawLandscapeProp } from './draw';
import { worldMaps } from '../../registry';
import type { WorldRenderView } from '../../render-contract';

function recordingContext() {
  const draws: { color: string; clips: number; alpha:number; path: {x:number;y:number}[] }[] = [];
  const clips: { x: number; y: number }[][] = [];
  let path: { x: number; y: number }[] = [], activeClips = 0;
  const stack: { alpha: number; clips: number; color: string }[] = [];
  const context = {
    globalAlpha: .45, fillStyle: '',
    save() { stack.push({ alpha: this.globalAlpha, clips: activeClips, color: this.fillStyle }); },
    restore() { const state = stack.pop()!; this.globalAlpha = state.alpha; activeClips = state.clips; this.fillStyle = state.color; },
    beginPath() { path = []; },
    moveTo(x: number, y: number) { path.push({ x, y }); },
    lineTo(x: number, y: number) { path.push({ x, y }); },
    closePath() {},
    rect(x: number, y: number, width: number, height: number) { path.push({x,y},{x:x+width,y},{x:x+width,y:y+height},{x,y:y+height}); },
    clip() { clips.push([...path]); activeClips++; },
    fill() { draws.push({ color: this.fillStyle, clips: activeClips, alpha:this.globalAlpha, path: [...path] }); },
    fillRect() { draws.push({ color: this.fillStyle, clips: activeClips, alpha:this.globalAlpha, path: [...path] }); },
    translate() {}, scale() {},
  };
  return { context: context as unknown as CanvasRenderingContext2D, draws, clips, stack };
}

it('clips every timber mark to the real lower deck and shades original materials once', () => {
  const { context, draws, clips, stack } = recordingContext(), inputs: string[] = [];
  const map = worldMaps.riverbank, before = JSON.stringify(map);
  const view: WorldRenderView = {
    project: (p) => ({ x: 720 + (p.x - p.y) * 15, y: (p.x + p.y) * 7.5 - 400 }),
    shadeColor: base => { inputs.push(String(base)); return '#010203'; },
    width: 1440, height: 1000, playerPosition: { x: 45, y: 57 }, elapsedMs: 12000, reducedMotion: true, pass: 'ground',
  };
  drawLowerCrossing(context, map, view);
  const r = map.terrain.find(t => t.id === 'riverbank.low-footbridge')!.rect;
  expect(clips).toEqual([[{ x: r.x, y: r.y }, { x: r.x + r.width, y: r.y }, { x: r.x + r.width, y: r.y + r.height }, { x: r.x, y: r.y + r.height }].map(p => view.project(p))]);
  expect(draws.length).toBeGreaterThan(100);
  expect(draws.every(draw => draw.clips === 1 && draw.color === '#010203')).toBe(true);
  expect(inputs.every(color => color !== '#010203')).toBe(true);
  expect(context.globalAlpha).toBe(.45);
  expect(stack).toHaveLength(0);
  expect(JSON.stringify(map)).toBe(before);
});

it('keeps landmark construction inside the shared shading and alpha contract', () => {
  for (const kind of ['laundry', 'boat', 'mooring', 'tied-rope']) {
    const { context, draws, stack } = recordingContext();
    const prop = worldMaps.riverbank.props.find(prop => prop.kind === kind)!;
    expect(drawLandscapeProp(context, prop, (x, y) => ({ x, y }), 18, 0, true, () => '#010203')).toBe(true);
    expect(draws.length).toBeGreaterThan(5);
    expect(draws.every(draw => draw.color === '#010203')).toBe(true);
    expect(context.globalAlpha).toBe(.45);
    expect(stack).toHaveLength(0);
  }
});

it('does not repaint other maps with lower-crossing timber', () => {
  const { context, draws } = recordingContext();
  drawLowerCrossing(context, worldMaps.park, {} as WorldRenderView);
  expect(draws).toHaveLength(0);
});


it('confines river material to its source surface with every deck subtracted separately', () => {
  const {context,draws,clips,stack}=recordingContext();
  const map=worldMaps.riverbank,before=JSON.stringify(map),inputs:string[]=[];
  const view:WorldRenderView={project:p=>({x:720+(p.x-p.y)*15,y:(p.x+p.y)*7.5-400}),shadeColor:base=>{inputs.push(String(base));return '#010203';},width:1440,height:1000,playerPosition:{x:40,y:74},elapsedMs:0,reducedMotion:true,pass:'ground'};
  drawRiverbankWater(context,map,view);
  const decks=map.terrain.filter(t=>t.material==='bridge'||t.material==='boardwalk');
  expect(clips).toHaveLength(2*(1+decks.length));
  for(const start of [1,2+decks.length])for(const [i,deck]of decks.entries()){
    const r=deck.rect;
    expect(clips[start+i].slice(-4)).toEqual([{x:r.x,y:r.y},{x:r.x+r.width,y:r.y},{x:r.x+r.width,y:r.y+r.height},{x:r.x,y:r.y+r.height}].map(p=>view.project(p)));
  }
  expect(draws.length).toBeGreaterThan(30);
  expect(draws.every(draw=>draw.clips===1+decks.length&&draw.color==='#010203')).toBe(true);
  expect(inputs.every(color=>color!=='#010203')).toBe(true);
  expect(context.globalAlpha).toBe(.45);expect(stack).toHaveLength(0);
  expect(JSON.stringify(map)).toBe(before);
});

it('anchors river current paint to the world, while freezing its injected time under reduced motion', () => {
  const view:WorldRenderView={project:p=>({x:720+(p.x-p.y)*15,y:(p.x+p.y)*7.5-400}),width:1440,height:1000,playerPosition:{x:40,y:74},elapsedMs:0,reducedMotion:true,pass:'ground'};
  const first=recordingContext(),later=recordingContext(),moved=recordingContext();
  drawRiverbankWater(first.context,worldMaps.riverbank,view);
  drawRiverbankWater(later.context,worldMaps.riverbank,{...view,elapsedMs:18425,reducedMotion:true});
  drawRiverbankWater(moved.context,worldMaps.riverbank,{...view,project:p=>{const q=view.project(p);return{x:q.x+20,y:q.y+10};}});
  expect(later.draws).toEqual(first.draws);
  const normal=recordingContext(),repeat=recordingContext();
  drawRiverbankWater(normal.context,worldMaps.riverbank,{...view,elapsedMs:18425,reducedMotion:false});
  drawRiverbankWater(repeat.context,worldMaps.riverbank,{...view,elapsedMs:18425,reducedMotion:false});
  expect(normal.draws).toEqual(repeat.draws);
  expect(normal.draws).not.toEqual(first.draws);
  const body=(draw:typeof normal.draws[number])=>!['#789e9b','#6c9695'].includes(draw.color);
  expect(normal.draws.filter(body)).toEqual(first.draws.filter(body));
  expect(JSON.stringify(moved.draws.map(draw=>({...draw,path:draw.path.map(p=>({x:p.x-20,y:p.y-10}))})))).toBe(JSON.stringify(first.draws));
  const other=recordingContext();drawRiverbankWater(other.context,worldMaps.park,view);expect(other.draws).toHaveLength(0);
});
