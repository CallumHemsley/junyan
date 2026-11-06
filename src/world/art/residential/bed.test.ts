import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorldRenderView } from '../../render-contract';
import { colorShader } from '../../lighting';
import { sampleAtmosphere } from '../../atmosphere';

type Bitmap = {width:number;height:number;data?:Uint8ClampedArray;getContext:()=>unknown};
let surfaces:Bitmap[],calls:{bitmap:Bitmap;x:number;y:number;alpha:number}[],ctx:CanvasRenderingContext2D;
const view = (ppu=11,x=200.25,y=160.75):WorldRenderView => ({
  project:(p,z=0)=>({x:x+(p.x-p.y)*ppu,y:y+(.5*(p.x+p.y)-z)*ppu}),
  elapsedMs:0,reducedMotion:false,playerPosition:{x:9,y:9},width:400,height:300,pass:'objects',
});
const plus = (amount:number) => vi.fn((color:string|readonly number[]) => {
  if(typeof color==='string') return color;
  return '#'+color.map(v=>Math.min(255,v+amount).toString(16).padStart(2,'0')).join('');
});
beforeEach(()=>{
  vi.resetModules();surfaces=[];calls=[];
  vi.stubGlobal('ImageData',class {constructor(public data:Uint8ClampedArray,public width:number,public height:number){}});
  vi.stubGlobal('document',{createElement:()=>{
    const canvas:Bitmap={width:0,height:0,getContext:()=>({putImageData:(image:ImageData)=>{canvas.data=image.data.slice();}})};
    surfaces.push(canvas);return canvas;
  }});
  ctx={globalAlpha:.37,drawImage:(bitmap:Bitmap,x:number,y:number)=>calls.push({bitmap,x,y,alpha:ctx.globalAlpha})} as unknown as CanvasRenderingContext2D;
});
afterEach(()=>vi.unstubAllGlobals());

describe('production native bed ownership',()=>{
  it('authors fifteen structural boxes and four printed bands without adding depth',async()=>{
    const {bedRecipe}=await import('./bed');const recipe=bedRecipe(4.14,4.14,7.86,7.86);
    const structural=recipe.commands.filter(p=>p.surface),prints=recipe.commands.filter(p=>!p.surface).map(p=>p.box);
    expect(structural).toHaveLength(15);expect(prints).toHaveLength(4);
    expect(structural.filter(p=>p.surface!.kind==='wood')).toHaveLength(8);
    expect(prints.map(b=>b[1])).toEqual([5.9399999999999995,6.539999999999999,7.139999999999999,7.739999999999998]);
    const boxes=structural.map(p=>p.box);
    expect(Math.min(...boxes.map(b=>b[0]))).toBe(4.14);expect(Math.max(...boxes.map(b=>b[3]))).toBe(7.86);
    expect(Math.max(...boxes.map(b=>b[5]))).toBe(1.24);
  });
  it('reuses an unchanged raw/graded object across camera, time, preference and offscreen re-entry',async()=>{
    const {bedRecipe,drawBed}=await import('./bed');const recipe=bedRecipe(4.14,4.14,7.86,7.86),shader=plus(17),contact=vi.fn();
    for(let phase=0;phase<257;phase++) {
      const frame={...view(11,phase===128?-10000:200+phase/256,160+phase/512),elapsedMs:phase*31,reducedMotion:phase%2===0,shadeColor:shader};
      expect(drawBed(ctx,frame,recipe,contact)).toBe(true);
    }
    expect(surfaces).toHaveLength(1);expect(contact).toHaveBeenCalledTimes(257);
    expect(new Set(calls.map(c=>c.bitmap)).size).toBe(1);expect(shader).toHaveBeenCalledTimes(new Set(shader.mock.calls.map(c=>JSON.stringify(c[0]))).size);
    expect(calls.every(c=>Number.isInteger(c.x)&&Number.isInteger(c.y)&&c.alpha===.37)).toBe(true);
    expect(ctx.globalAlpha).toBe(.37);
    // A second context also uses the same bitmap; inherited alpha stays a compositor concern.
    const second={globalAlpha:.8,drawImage:vi.fn()} as unknown as CanvasRenderingContext2D;
    drawBed(second,{...view(),shadeColor:shader},recipe,contact);
    expect((second.drawImage as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(calls[0].bitmap);
    expect(second.globalAlpha).toBe(.8);
  });
  it('copies raw colors before grading and invalidates for source or light changes',async()=>{
    const {bedRecipe,drawBed}=await import('./bed');const recipe=bedRecipe(4.14,4.14,7.86,7.86),contact=()=>{};
    drawBed(ctx,view(),recipe,contact);const raw=surfaces[0].data!.slice();
    const shader=plus(17);drawBed(ctx,{...view(),shadeColor:shader},recipe,contact);
    const graded=surfaces[1].data!;
    for(let i=0;i<raw.length;i+=4) {
      expect(graded[i+3]).toBe(raw[i+3]);
      for(let channel=0;channel<3;channel++)expect(graded[i+channel]).toBe(raw[i+3]?Math.min(255,raw[i+channel]+17):raw[i+channel]);
    }
    const old=recipe.commands[0].box[6][0];recipe.commands[0].box[6][0]=22;
    drawBed(ctx,{...view(),shadeColor:shader},recipe,contact);
    expect(surfaces).toHaveLength(3);expect(surfaces[2].data).not.toEqual(graded);
    recipe.commands[0].box[6][0]=old;drawBed(ctx,{...view(),shadeColor:shader},recipe,contact);
    expect(calls.at(-1)!.bitmap).toBe(surfaces[1]);expect(surfaces[0].data).toEqual(raw);
    recipe.commands.find(p=>!p.surface)!.box[6][0]=245;drawBed(ctx,view(),recipe,contact);expect(surfaces.at(-1)!.data).not.toEqual(raw);
    recipe.commands[0].surface!.kind='linen';drawBed(ctx,view(),recipe,contact);expect(surfaces).toHaveLength(5);
  });
  it('bounds raw ownership to sixteen scales, accepts measurement noise and falls back for unsupported cameras',async()=>{
    const {bedRecipe,drawBed}=await import('./bed');const recipe=bedRecipe(4.14,4.14,7.86,7.86),contact=vi.fn();
    for(let ppu=2;ppu<=18;ppu++)expect(drawBed(ctx,view(ppu),recipe,contact)).toBe(true);
    expect(surfaces).toHaveLength(17);
    drawBed(ctx,view(2),recipe,contact);expect(surfaces).toHaveLength(18);
    drawBed(ctx,view(2+1e-12),recipe,contact);expect(surfaces).toHaveLength(18);
    for(const ppu of [0,-1,11.01,33,NaN])expect(drawBed(ctx,view(ppu),recipe,contact)).toBe(false);
    const wrong={...view(),project:(p:{x:number;y:number},z=0)=>({x:200+(p.x-p.y)*11+z,y:160+(p.x+p.y)*5.5-z*11})};
    expect(drawBed(ctx,wrong,recipe,contact)).toBe(false);expect(contact).toHaveBeenCalledTimes(19);
  });
  it('uses stable shader identity for immutable authoritative light',()=>{
    const light=sampleAtmosphere({mapId:'apartment',day:1,seed:42,elapsedMs:0,timeOfDay:'morning',reducedMotion:false}).light;
    expect(colorShader(light)).toBe(colorShader(light));
  });
});
