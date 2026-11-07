import {afterEach, expect, it, vi} from 'vitest';
import {drawProp, renderObjects} from './index';
import {buildingSections} from './building-sections';
import {sampleDayLight} from '../../atmosphere';
import {worldMapSchema} from '../../schema';
import definition from '../../maps/town/map.json';
import type {WorldRenderView} from '../../render-contract';

const map = worldMapSchema.parse(definition);
const view: WorldRenderView = {project: (p, z = 0) => ({x: (p.x-p.y)*15+720, y: (p.x+p.y)*7.5-z*15}),
  elapsedMs: 0, reducedMotion: true, playerPosition: {x:35,y:30.8}, width:1440, height:1000, pass:'objects'};
type Fill = {color:string; alpha:number; points:{x:number;y:number}[]};
function context(alpha = .45) {
  const fills:Fill[] = [], stack:{alpha:number;color:string}[] = [];
  let points:Fill['points'] = [];
  const ctx = {globalAlpha:alpha, fillStyle:'', strokeStyle:'', lineWidth:1,
    save() {stack.push({alpha:this.globalAlpha,color:this.fillStyle});},
    restore() {const prior=stack.pop()!;this.globalAlpha=prior.alpha;this.fillStyle=prior.color;},
    beginPath() {points=[];}, moveTo(x:number,y:number) {points.push({x,y});}, lineTo(x:number,y:number) {points.push({x,y});},
    closePath() {}, stroke() {}, clearRect:vi.fn(), fillRect() {}, drawImage:vi.fn(),
    fill() {fills.push({color:this.fillStyle,alpha:this.globalAlpha,points:[...points]});},
  };
  return {ctx:ctx as unknown as CanvasRenderingContext2D, fills, stack};
}
const emission = (fills:Fill[]) => fills.filter(f=>f.color==='rgb(255,224,153)');
function paint(id:string, strength?:number, overrides:Partial<WorldRenderView> = {}) {
  const {ctx,fills,stack} = context();
  const shadeColor=vi.fn((_base:unknown)=> 'graded-material');
  drawProp(ctx,map.props.find(p=>p.id===id)!,{...view,shadeColor,...(strength===undefined?{}:{castLight:{...sampleDayLight('night'),lampStrength:strength}}),...overrides});
  expect(ctx.globalAlpha).toBe(.45);expect(stack).toHaveLength(0);
  expect(shadeColor.mock.calls.some(args=>String(args[0])==='255,224,153')).toBe(false);
  return fills;
}

afterEach(()=>vi.unstubAllGlobals());
it('emits only the selected real openings and keeps every surrounding material graded once',()=>{
  for(const prop of map.props.filter(p=>p.kind.startsWith('building-'))) {
    const lit=paint(prop.id,1), dark=paint(prop.id,0);
    expect(emission(lit)).toHaveLength(prop.id==='town.restaurant'?3:prop.id==='town.residence'?1:0);
    expect(lit.filter(f=>f.color!=='rgb(255,224,153)')).toEqual(dark);
    expect(emission(paint(prop.id))).toHaveLength(0);
  }
});
it('fits panes inside their host side frames and confines spill to the restaurant doorstep',()=>{
  for(const [id,offset] of [['town.restaurant',1],['town.residence',4.1]] as const) {
    const host=map.props.find(p=>p.id===id)!, {x,y}=host.position;
    const [pane]=emission(paint(id,1));
    const points=[[x+host.width+.171,y+offset+.12,2.23],[x+host.width+.171,y+offset+1.14,2.23],
      [x+host.width+.171,y+offset+1.14,3.62],[x+host.width+.171,y+offset+.12,3.62]];
    expect(pane.points).toEqual(points.map(([x,y,z])=>{const p=view.project({x,y},z);return {x:Math.round(p.x),y:Math.round(p.y)};}));
  }
  const [,,spill]=emission(paint('town.restaurant',1));
  expect(spill.alpha).toBeCloseTo(.45*.17);
  expect(spill.points).toEqual([[33.2,28.48],[34.8,28.48],[35,29.25],[33,29.25]].map(([x,y])=>{const p=view.project({x,y},.025);return {x:Math.round(p.x),y:Math.round(p.y)};}));
});
it('uses authoritative phase strength and inherited alpha without clock or motion dependence',()=>{
  for(const phase of ['morning','noon','evening','night'] as const) {
    const strength=sampleDayLight(phase).lampStrength, still=emission(paint('town.restaurant',strength));
    expect(still).toHaveLength(strength<.1?0:3);
    still.forEach((fill,i)=>expect(fill.alpha).toBeCloseTo(.45*strength*[.80,.62,.17][i]));
    expect(emission(paint('town.restaurant',strength,{elapsedMs:99999,reducedMotion:false}))).toEqual(still);
  }
  const before=renderObjects(map,view).map(({id,position,depth,occlusion})=>({id,position,depth,occlusion}));
  const after=renderObjects(map,{...view,castLight:sampleDayLight('night')}).map(({id,position,depth,occlusion})=>({id,position,depth,occlusion}));
  expect(after).toEqual(before);
  expect(after.some(o=>o.id.startsWith('atmosphere:'))).toBe(false);
});
it('invalidates host plates for strength changes with a stable shader and inherits compositor fade',()=>{
  const offscreen=context(1), target=context(.45);
  vi.stubGlobal('OffscreenCanvas',class {constructor(public width:number,public height:number) {} getContext(){return offscreen.ctx;}});
  const prop={...map.props.find(p=>p.id==='town.restaurant')!};
  const painter=vi.fn(), shader=()=> 'graded-material';
  const phaseView=(strength:number):WorldRenderView=>({...view,shadeColor:shader,castLight:{...sampleDayLight('night'),lampStrength:strength}});
  const sections=buildingSections(prop,view,map.occluders.find(o=>o.id===prop.id),painter);
  for(const strength of [0,.04,.22,.88,1,.04]) {
    const current=phaseView(strength);
    for(const section of sections)section.draw(target.ctx,current);
    const count=painter.mock.calls.length;
    for(const section of sections)section.draw(target.ctx,{...current,elapsedMs:9999});
    expect(painter).toHaveBeenCalledTimes(count);
    expect(target.ctx.globalAlpha).toBe(.45);
  }
  expect(painter).toHaveBeenCalledTimes(6);
  expect(offscreen.ctx.clearRect).toHaveBeenCalledTimes(6);
  expect(target.ctx.drawImage).toHaveBeenCalled();
  for(const [, ...coordinates] of vi.mocked(target.ctx.drawImage).mock.calls)expect(coordinates.every(Number.isFinite)).toBe(true);
});
