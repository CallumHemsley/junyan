import { expect, it } from 'vitest';
import { drawLowerCrossing, renderObjects } from './index';
import { drawLandscapeGround, drawRiverbankWater } from './ground';
import { drawLandscapeProp } from './draw';
import { worldMaps } from '../../registry';
import type { WorldRenderView } from '../../render-contract';

function recordingContext() {
  const draws: { color: string; clips: number; alpha:number; path: {x:number;y:number}[] }[] = [];
  const clips: { x: number; y: number }[][] = [];
  const strokes:{color:string;alpha:number;path:{x:number;y:number}[]}[]=[];
  let path: { x: number; y: number }[] = [], activeClips = 0;
  const stack: { alpha: number; clips: number; color: string }[] = [];
  const context = {
    globalAlpha: .45, fillStyle: '',strokeStyle:'',
    stroke(){strokes.push({color:this.strokeStyle,alpha:this.globalAlpha,path:[...path]});},
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
  return { context: context as unknown as CanvasRenderingContext2D, draws, clips, stack,strokes };
}

it('keeps orchard soil in the dry/deck mask, shades once and preserves the caller and map',()=>{
 const {context,draws,stack}=recordingContext(),map=worldMaps.park,before=JSON.stringify(map),inputs:string[]=[];
 const view:WorldRenderView={project:p=>({x:1000+(p.x-p.y)*11,y:100+(p.x+p.y)*5.5}),shadeColor:base=>{inputs.push(String(base));return '#010203';},width:2000,height:1500,playerPosition:{x:15.7,y:52},elapsedMs:42000,reducedMotion:true,pass:'ground'};
 drawLandscapeGround(context,map,view,'underlay');
 const decks=map.terrain.filter(t=>t.material==='bridge'||t.material==='boardwalk');
 expect(draws.length).toBeGreaterThan(0);
 expect(draws.every(draw=>draw.color==='#010203'&&draw.clips===1+decks.length&&draw.alpha===.45)).toBe(true);
 expect(inputs.every(color=>color!=='#010203')).toBe(true);
 expect(context.globalAlpha).toBe(.45);expect(stack).toHaveLength(0);expect(JSON.stringify(map)).toBe(before);
});

it('anchors orchard material to world geometry across camera translation and motion clocks',()=>{
 const view:WorldRenderView={project:p=>({x:1000+(p.x-p.y)*11,y:100+(p.x+p.y)*5.5}),width:2000,height:1500,playerPosition:{x:15.7,y:52},elapsedMs:42000,reducedMotion:true,pass:'ground'};
 const first=recordingContext(),later=recordingContext(),moved=recordingContext();
 drawLandscapeGround(first.context,worldMaps.park,view,'underlay');
 drawLandscapeGround(later.context,worldMaps.park,{...view,elapsedMs:98000,reducedMotion:false},'underlay');
 drawLandscapeGround(moved.context,worldMaps.park,{...view,project:p=>{const q=view.project(p);return{x:q.x+20,y:q.y+10};}},'underlay');
 expect(later.draws).toEqual(first.draws);
 expect(moved.draws.map(draw=>({...draw,path:draw.path.map(p=>({x:p.x-20,y:p.y-10}))}))).toEqual(first.draws);
});

it('retains visible orchard ground when its site pivot has moved beyond the viewport edge',()=>{
 const map={...worldMaps.park,props:worldMaps.park.props.filter(p=>p.id.startsWith('park.working-fruit-'))};
 const {context,draws}=recordingContext();
 const view:WorldRenderView={project:p=>({x:(p.x-p.y-(15.7-52))*11-110,y:160+(p.x+p.y-15.7-52)*5.5}),width:200,height:300,playerPosition:{x:15.7,y:52},elapsedMs:42000,reducedMotion:true,pass:'ground'};
 expect(view.project({x:15.7,y:52}).x).toBe(-110);
 drawLandscapeGround(context,map,view,'underlay');
 expect(draws.some(draw=>draw.path.some(p=>p.x>=0&&p.x<=200&&p.y>=0&&p.y<=300))).toBe(true);
});

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


it('attaches the real ferry rope to the current hull bow and mooring tie band',()=>{
 const base=worldMaps.riverbank;
 const view:WorldRenderView={project:p=>({x:720+(p.x-p.y)*15,y:(p.x+p.y)*7.5-400}),shadeColor:()=> '#010203',width:1440,height:1000,playerPosition:{x:62,y:57},elapsedMs:0,reducedMotion:true,pass:'objects'};
 for(const offset of [0,1]){
  const map={...base,props:base.props.map(p=>p.id==='riverbank.ferry-boat'?{...p,position:{x:p.position.x+offset,y:p.position.y}}:p)};
  const {context,strokes,stack}=recordingContext();
  renderObjects(map,view).find(o=>o.id==='riverbank.ferry-rope')!.draw(context,view);
  const hull=view.project(map.props.find(p=>p.id==='riverbank.ferry-boat')!.position),post=view.project(map.props.find(p=>p.id==='riverbank.ferry-post')!.position),scale=15/18;
  expect(strokes).toHaveLength(2);
  for(const stroke of strokes){
   expect(stroke.path[0]).toEqual({x:Math.round(Math.round(hull.x)+29*scale),y:Math.round(Math.round(hull.y)+2*scale)});
   expect(stroke.path.at(-1)).toEqual({x:Math.round(Math.round(post.x)-3*scale),y:Math.round(Math.round(post.y)-7*scale)});
   expect(stroke.color).toBe('#010203');expect(stroke.alpha).toBe(.45);
  }
  expect(stack).toHaveLength(0);expect(context.globalAlpha).toBe(.45);
 }
});
