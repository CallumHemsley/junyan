import {expect, it} from 'vitest';
import {renderObjects} from './index';
import {courtyardMap} from '../../maps/courtyard';
import {worldMapSchema} from '../../schema';
import type {WorldRenderView} from '../../render-contract';

type Point = {x:number; y:number; z:number};
const map = worldMapSchema.parse(courtyardMap);
const beds = map.props.filter(prop => prop.kind === 'raised-bed');
function paint(bed: typeof beds[number], overrides: Partial<WorldRenderView> = {}) {
  const fills: {points:Point[]; color:string; alpha:number}[] = [], shades:string[] = [];
  let points:Point[] = [];
  const stack: {alpha:number; color:string}[] = [];
  const ctx = {
    globalAlpha:.37, fillStyle:'inherited',
    save() {stack.push({alpha:this.globalAlpha,color:this.fillStyle});},
    restore() {const saved=stack.pop()!;this.globalAlpha=saved.alpha;this.fillStyle=saved.color;},
    beginPath() {points=[];}, moveTo() {}, lineTo() {}, closePath() {},
    fill() {fills.push({points:[...points],color:this.fillStyle,alpha:this.globalAlpha});},
  };
  const view:WorldRenderView = {
    project:(p,z=0)=>{points.push({...p,z});return {x:100+(p.x-p.y)*11,y:100+(p.x+p.y)*5.5-z*11};},
    shadeColor:base=>{expect(String(base)).not.toMatch(/^graded:/);shades.push(String(base));return `graded:${base}`;},
    playerPosition:bed.position,width:720,height:456,pass:'objects',elapsedMs:0,reducedMotion:true,...overrides,
  };
  const object=renderObjects(map,view).find(object=>object.id===bed.id)!;
  object.draw(ctx as unknown as CanvasRenderingContext2D,view);
  expect(stack).toHaveLength(0);expect(ctx.globalAlpha).toBe(.37);expect(ctx.fillStyle).toBe('inherited');
  expect(shades).toHaveLength(fills.length);
  return {fills,object};
}

it('keeps every actual planting variant rooted inside its soil and preserves inherited grading, alpha and depth',()=>{
  const before=JSON.stringify(map);
  expect(beds).toHaveLength(4);
  expect(new Set(beds.map(bed=>bed.variant))).toEqual(new Set([0,1,2]));
  for(const bed of beds) {
    const {fills,object}=paint(bed);
    expect(fills.length).toBeGreaterThan(4);
    expect(fills.every(fill=>fill.alpha===.37&&fill.color.startsWith('graded:'))).toBe(true);
    expect(fills.slice(0,4).map(fill=>fill.color)).toEqual(['graded:#8b6b4b','graded:#675746','graded:#675746','graded:#615d47']);
    const foliage=fills.slice(4).flatMap(fill=>fill.points);
    expect(foliage.every(p=>Number.isFinite(p.x+p.y+p.z))).toBe(true);
    expect(foliage.every(p=>p.x>=bed.position.x+.13-1e-9&&p.x<=bed.position.x+bed.width-.13+1e-9)).toBe(true);
    expect(foliage.every(p=>p.y>=bed.position.y+.13-1e-9&&p.y<=bed.position.y+bed.height-.13+1e-9)).toBe(true);
    expect(Math.min(...foliage.map(p=>p.z))).toBeGreaterThanOrEqual(.44);
    expect(Math.max(...foliage.map(p=>p.z))).toBeLessThanOrEqual(1.25);
    if(bed.variant===1)expect(Math.max(...foliage.map(p=>p.z))).toBeGreaterThan(1);
    expect(object.depth).toBeCloseTo(bed.position.x+bed.position.y+(bed.width+bed.height)/2);
    expect(object.occlusion).toBeUndefined();
    expect(paint(bed,{elapsedMs:92000,reducedMotion:false,playerPosition:{x:bed.position.x-1,y:bed.position.y-1}}).fills).toEqual(fills);
    expect(paint(bed,{elapsedMs:92000,reducedMotion:true,playerPosition:{x:bed.position.x+bed.width+1,y:bed.position.y+bed.height+1}}).fills).toEqual(fills);
  }
  expect(JSON.stringify(map)).toBe(before);
});

it('keeps the complete taller foliage drawing alive when only its edge intersects phone or desktop viewport',()=>{
  for(const bed of beds)for(const [width,height,scale]of [[195,384,11],[720,456,15]]) {
    const center={x:bed.position.x+bed.width/2,y:bed.position.y+bed.height/2};
    const relative=(p:{x:number;y:number},z=0)=>({x:(p.x-center.x-p.y+center.y)*scale,y:(p.x-center.x+p.y-center.y)*scale/2-z*scale});
    const all=paint(bed).fills.flatMap(fill=>fill.points).map(p=>relative(p,p.z));
    const xs=all.map(p=>p.x),ys=all.map(p=>p.y);
    for(const [dx,dy]of [[.5-Math.max(...xs),height/2],[width-.5-Math.min(...xs),height/2],[width/2,.5-Math.max(...ys)],[width/2,height-.5-Math.min(...ys)]]) {
      const result=paint(bed,{width,height,project:(p,z=0)=>{const at=relative(p,z);return {x:at.x+dx,y:at.y+dy};}});
      expect(result.fills.length,`${bed.id} at ${dx},${dy}`).toBeGreaterThan(4);
    }
  }
});
