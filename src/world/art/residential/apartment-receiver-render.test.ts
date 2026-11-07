import {describe,expect,it} from 'vitest';
import {drawMap,renderObjects} from './index';
import {mapDefinitions} from '../../maps/residential';
import {worldMapSchema} from '../../schema';
import {sampleAtmosphere} from '../../atmosphere';
import {atmosphereHooksForMap} from '../../atmosphere/map-hooks';
import {colorShader} from '../../lighting';
import type {WorldRenderView} from '../../render-contract';

function render(phase:'morning'|'night',objects=false){
 const map=worldMapSchema.parse(mapDefinitions.find(m=>m.id==='apartment'));
 const before=JSON.stringify(map),frame=sampleAtmosphere({mapId:map.id,day:1,timeOfDay:phase,elapsedMs:42000,seed:42,reducedMotion:true},atmosphereHooksForMap(map));
 const graded=colorShader(frame.light),fills:{material:string;color:string;alpha:number}[]=[],stack:number[]=[];let material='';
 const ctx={globalAlpha:.4,fillStyle:'',strokeStyle:'',lineWidth:1,lineCap:'',
  save(){stack.push(this.globalAlpha)},restore(){this.globalAlpha=stack.pop()!},beginPath(){},closePath(){},moveTo(){},lineTo(){},ellipse(){},stroke(){},
  fill(){fills.push({material,color:this.fillStyle,alpha:this.globalAlpha})},
 };
 const view:WorldRenderView={project:(p,z=0)=>({x:(p.x-p.y)*15,y:(p.x+p.y)*7.5-z*15}),
  shadeColor:(base,brightness)=>{material=JSON.stringify(base);return graded(base,brightness)},castLight:frame.light,
  playerPosition:{x:16,y:15},width:720,height:458,elapsedMs:42000,reducedMotion:true,pass:'ground'};
 if(objects){const sofa=renderObjects(map,view).find(p=>p.id==='apartment.sofa')!;sofa.draw(ctx as unknown as CanvasRenderingContext2D,{...view,pass:'objects'});}
 else drawMap(ctx as unknown as CanvasRenderingContext2D,map,view);
 expect(ctx.globalAlpha).toBe(.4);expect(stack).toHaveLength(0);expect(JSON.stringify(map)).toBe(before);
 return fills;
}

describe('apartment material receiver production artist',()=>{
 it('keeps all receiver samples inside the authored inner rug plane instead of interleaving lower layers',()=>{
  const day=render('morning'),night=render('night');const rug='[143,157,129]';
  expect(day.filter(p=>p.material===rug)).toHaveLength(3);
  const indices=night.flatMap((p,i)=>p.material===rug?[i]:[]);
  expect(indices.length).toBeGreaterThan(40);
  expect(indices.at(-1)!-indices[0]+1).toBe(indices.length);
  expect(new Set(night.filter(p=>p.material===rug).map(p=>p.color)).size).toBeGreaterThan(1);
  expect(night.filter(p=>p.material===rug).every(p=>p.alpha===.4)).toBe(true);
 });
 it('shades real sofa faces without regrading a string or replacing inherited fade',()=>{
  const sofa=render('night',true);
  expect(sofa.filter(p=>p.material.startsWith('[')).every(p=>p.alpha===.4)).toBe(true);
  expect(sofa.every(p=>!p.material.includes('"#')||p.material==='"#342c24"')).toBe(true);
  expect(new Set(sofa.filter(p=>p.material==='[160,179,147]').map(p=>p.color)).size).toBeGreaterThan(1);
 });
});
