import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { bedRecipe, drawBed } from './bed';
import { wardrobeRecipe } from './wardrobe';
import { drawNativeObject } from './native-object';
import { mapDefinitions } from '../../maps/residential';
import { worldMapSchema } from '../../schema';
import { renderObjects } from './index';
import type { WorldRenderView } from '../../render-contract';
import { sampleAtmosphere } from '../../atmosphere';
import { colorShader } from '../../lighting';

type Bitmap = {width:number;height:number;data?:Uint8ClampedArray;getContext:()=>unknown};
let surfaces:Bitmap[],draws:Bitmap[],ctx:CanvasRenderingContext2D;
const view = (ppu=11):WorldRenderView => ({
  project:(p,z=0)=>({x:200+(p.x-p.y)*ppu,y:150+(.5*(p.x+p.y)-z)*ppu}),
  elapsedMs:0,reducedMotion:false,playerPosition:{x:6,y:16.8},width:400,height:300,pass:'objects',
});
beforeEach(()=>{
  surfaces=[];draws=[];
  vi.stubGlobal('ImageData',class {constructor(public data:Uint8ClampedArray,public width:number,public height:number){}});
  vi.stubGlobal('document',{createElement:()=>{
    const canvas:Bitmap={width:0,height:0,getContext:()=>({putImageData:(image:ImageData)=>{canvas.data=image.data.slice();}})};
    surfaces.push(canvas);return canvas;
  }});
  ctx={globalAlpha:.45,drawImage:(bitmap:Bitmap)=>draws.push(bitmap)} as unknown as CanvasRenderingContext2D;
});
afterEach(()=>vi.unstubAllGlobals());

it('shares one sixteen-entry body cache between bed and wardrobe',()=>{
  // Unique source coordinates isolate this test from the other ownership checks.
  const bed=bedRecipe(40,40,43.72,43.72),wardrobe=wardrobeRecipe(42,54,44,56),contact=vi.fn();
  for(const recipe of [bed,wardrobe])for(let ppu=2;ppu<=9;ppu++)drawNativeObject(ctx,view(ppu),recipe,contact);
  expect(surfaces).toHaveLength(16);
  drawBed(ctx,view(2),bed,contact);drawNativeObject(ctx,view(2),wardrobe,contact);
  expect(surfaces).toHaveLength(16);
  drawNativeObject(ctx,view(10),wardrobe,contact);drawBed(ctx,view(2),bed,contact);
  expect(surfaces).toHaveLength(18); // The oldest bed entry was evicted by the wardrobe.
  drawNativeObject(ctx,view(2),wardrobe,contact);expect(surfaces).toHaveLength(18);
  expect(contact).toHaveBeenCalledTimes(21);
});

it('invalidates either asset on source mutation and grades raw copies once per shader',()=>{
  for(const recipe of [bedRecipe(64,64,67.72,67.72),wardrobeRecipe(62,74,64,76)]) {
    const start=surfaces.length,contact=vi.fn();drawNativeObject(ctx,view(),recipe,contact);
    const raw=surfaces[start].data!.slice();
    const shader=vi.fn((c:string|readonly number[])=>typeof c==='string'?c:'#'+c.map(v=>Math.min(255,v+12).toString(16).padStart(2,'0')).join(''));
    const shaded={...view(),shadeColor:shader};drawNativeObject(ctx,shaded,recipe,contact);
    const graded=surfaces[start+1].data!,count=shader.mock.calls.length;
    for(let i=0;i<raw.length;i+=4) {
      expect(graded[i+3]).toBe(raw[i+3]);
      for(let ch=0;ch<3;ch++)expect(graded[i+ch]).toBe(raw[i+3]?Math.min(255,raw[i+ch]+12):raw[i+ch]);
    }
    drawNativeObject(ctx,{...shaded,elapsedMs:1000,reducedMotion:true},recipe,contact);
    expect(shader).toHaveBeenCalledTimes(count);expect(surfaces).toHaveLength(start+2);
    recipe.commands[0].box[6][0]=30;drawNativeObject(ctx,shaded,recipe,contact);
    expect(surfaces).toHaveLength(start+3);expect(surfaces.at(-1)!.data).not.toEqual(graded);
    expect(surfaces[start].data).toEqual(raw);expect(ctx.globalAlpha).toBe(.45);
  }
});

it('keeps the wardrobe planted within its original solid and retains native contact/fade ownership',()=>{
  const recipe=wardrobeRecipe(2,14,4,16),boxes=recipe.commands.map(c=>c.box);
  expect(boxes.every(([x,y,z,r,f,t])=>x>=2&&r<=4&&x<r&&y>=14&&f<=16&&y<f&&z>=0&&z<t&&t<=2.5)).toBe(true);
  expect(boxes.filter(b=>b[2]===0)).toHaveLength(1);
  expect(recipe.commands.filter(c=>c.part==='door')).toHaveLength(2);
  expect(recipe.commands.filter(c=>c.part==='pull')).toHaveLength(2);
  const map=worldMapSchema.parse(mapDefinitions.find(m=>m.id==='apartment'));
  const object=renderObjects(map,view()).find(o=>o.id==='apartment.storage')!;
  expect(object.position).toEqual({x:3,y:15});
  expect(object.occlusion).toEqual({id:'apartment.storage',rect:{x:2,y:14,width:2,height:2},height:2.5,fadeWhenPlayerBehind:true});
  const shadowAlpha:number[]=[];
  const context={globalAlpha:.45,save(){},restore(){this.globalAlpha=.45;},beginPath(){},moveTo(){},lineTo(){},closePath(){},ellipse:vi.fn(),fill(){shadowAlpha.push(this.globalAlpha);},drawImage:vi.fn()};
  object.draw(context as unknown as CanvasRenderingContext2D,view());
  expect(context.drawImage).toHaveBeenCalledOnce();expect(shadowAlpha).toEqual([.45*.45*.18]);
  expect(context.globalAlpha).toBe(.45);
  context.drawImage.mockClear();context.ellipse.mockClear();
  object.draw(context as unknown as CanvasRenderingContext2D,view(11.01));
  expect(context.drawImage).not.toHaveBeenCalled();expect(context.ellipse).toHaveBeenCalledOnce();
  expect(shadowAlpha.filter(alpha=>alpha===.45*.45*.18)).toHaveLength(2);expect(context.globalAlpha).toBe(.45);
  const contact=vi.fn();expect(drawNativeObject(ctx,view(11.01),recipe,contact)).toBe(false);expect(contact).not.toHaveBeenCalled();
});

it('returns to the same wardrobe pixels after authoritative atmosphere transitions',()=>{
  const recipe=wardrobeRecipe(82,94,84,96),start=surfaces.length;
  const shaders=['morning','noon','evening','night','morning'].map(timeOfDay=>colorShader(sampleAtmosphere({mapId:'apartment',day:1,seed:42,elapsedMs:42000,timeOfDay:timeOfDay as 'morning'|'noon'|'evening'|'night',reducedMotion:false},{interior:true}).light));
  for(const shadeColor of shaders)drawNativeObject(ctx,{...view(),shadeColor},recipe,()=>{});
  expect(shaders.at(-1)).toBe(shaders[0]);
  expect(draws.at(-1)).toBe(draws[0]);
  expect(surfaces).toHaveLength(start+4);
  expect(surfaces[start].data).not.toEqual(surfaces[start+3].data);
});
