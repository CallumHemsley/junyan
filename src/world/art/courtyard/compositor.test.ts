import { describe, expect, it } from 'vitest';
import { renderObjects } from './index';
import { courtyardMap } from '../../maps/courtyard';
import { worldMapSchema } from '../../schema';
import type { WorldRenderView } from '../../render-contract';

const view: WorldRenderView = { project: p => p, elapsedMs: 0, reducedMotion: true, playerPosition: { x: 16, y: 21 }, width: 720, height: 408, pass: 'objects' };
describe('courtyard compositor contract', () => {
  it('replaces every generic prop once and splits long house facades for actor depth', () => {
    const map = worldMapSchema.parse(courtyardMap), objects = renderObjects(map, view);
    expect(new Set(objects.map(o => o.id)).size).toBe(objects.length);
    for (const prop of map.props.filter(p => p.layer !== 'ground')) expect(objects.filter(o => o.id === prop.id)).toHaveLength(1);
    for (const house of map.props.filter(p => p.kind === 'row-house')) {
      expect(objects.some(o => o.id === `${house.id}.roof`)).toBe(true);
      expect(objects.filter(o => o.id.startsWith(`${house.id}.east.`)).length).toBeGreaterThan(0);
    }
    expect(renderObjects({ ...map, id: 'town' }, view)).toEqual([]);
  });
});

it('constructs each house roof with bounded finite tile planes and keeps animation out of the roof geometry',()=>{
 const map=worldMapSchema.parse(courtyardMap),before=JSON.stringify(map);
 for(const house of map.props.filter(p=>p.kind==='row-house')){
  const points:{x:number;y:number;z:number}[]=[],materials:string[]=[];
  const roofView:WorldRenderView={...view,project:(p,z=0)=>{points.push({...p,z});return p;},shadeColor:base=>{materials.push(String(base));return '#123456';}};
  const ctx=new Proxy({},{get:()=>()=>{},set:()=>true}) as CanvasRenderingContext2D;
  const roof=renderObjects(map,roofView).find(o=>o.id===`${house.id}.roof`)!;
  roof.draw(ctx,roofView);
  expect(points.every(p=>Number.isFinite(p.x+p.y+p.z))).toBe(true);
  expect(points.every(p=>p.x>=house.position.x-.41&&p.x<=house.position.x+house.width+.41)).toBe(true);
  expect(points.every(p=>p.y>=house.position.y-.36&&p.y<=house.position.y+house.height+1.21)).toBe(true);
  expect(materials).toContain('#607b7b');expect(materials).toContain('#4a6466');
  const original=[...points];points.length=0;
  roof.draw(ctx,{...roofView,elapsedMs:99999,reducedMotion:false});
  expect(points).toEqual(original);
 }
 expect(JSON.stringify(map)).toBe(before);
});
