import { createRenderer, type BoxSurface, type Color, type SceneApi } from '../../../scene/renderer.js';
import type { WorldRenderView } from '../../render-contract';

export type NativeObjectRecipe = {commands:{part:string;surface:BoxSurface|null;box:Parameters<SceneApi['box']>}[];pivot:{x:number;y:number}};

type Raw = {data:Uint8ClampedArray; width:number; height:number; offset:{x:number;y:number}};
const rawCache = new Map<string,Raw>();
const gradedCache = new WeakMap<NonNullable<WorldRenderView['shadeColor']>, WeakMap<Raw,HTMLCanvasElement>>();
const identity = (c:string|readonly number[]) => typeof c === 'string' ? c : '#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');

function rasterize(recipe:NativeObjectRecipe, ppu:number):Raw {
  let pixels = new Uint8ClampedArray();
  const canvas = {width:0,height:0,getContext:()=>({
    createImageData:(w:number,h:number)=>({data:new Uint8ClampedArray(w*h*4)}),
    putImageData:(image:ImageData)=>{pixels=new Uint8ClampedArray(image.data);},
  })};
  const {pivot} = recipe;
  const bands = recipe.commands.filter(command=>!command.surface).map(({box:b})=>({center:(b[1]+b[4])/2-pivot.y,width:.14,color:b[6]}));
  const renderer = createRenderer(canvas as unknown as HTMLCanvasElement, {
    bake(api) {api.pix.fill(0);api.zb.fill(-1e9);api.groundZ.fill(-1e9);},
    draw(api) {
      for(const {surface,box:[x,y,z,right,front,top,color]} of recipe.commands) {
        if(!surface)continue;
        api.box(x-pivot.x,y-pivot.y,z,right-pivot.x,front-pivot.y,top,color,0,null,
          surface.kind==='cloth'?{...surface,bands}:surface);
      }
      api.shadeEdges();
    },
  }, {nativeWorld:{pixelsPerWorldUnit:ppu,originX:180,originY:150}});
  renderer.draw();
  let left=canvas.width,right=-1,top=canvas.height,bottom=-1;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]) {
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  if(right<left||left===0||top===0||right===canvas.width-1||bottom===canvas.height-1) throw new RangeError('Object raster exceeds its native surface');
  const width=right-left+1,height=bottom-top+1,data=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)data.set(pixels.subarray(((y+top)*canvas.width+left)*4,((y+top)*canvas.width+right+1)*4),y*width*4);
  return {data,width,height,offset:{x:left-180,y:top-150}};
}

/** Illustrative body bitmap: internal depth only; world ordering and native contact stay with the caller. */
export function drawNativeObject(ctx:CanvasRenderingContext2D, view:WorldRenderView, recipe:NativeObjectRecipe, contact:()=>void):boolean {
  const anchor=view.project(recipe.pivot),step=view.project({x:recipe.pivot.x+1,y:recipe.pivot.y});
  const measured=step.x-anchor.x,ppu=Math.round(measured),up=view.project(recipe.pivot,1),side=view.project({x:recipe.pivot.x,y:recipe.pivot.y+1});
  // Existing cameras use 11/15ppu. Unsupported projections/scales retain the native painter.
  if(!Number.isFinite(measured)||ppu<1||ppu>32||Math.abs(measured-ppu)>1e-9||
    Math.abs(step.y-anchor.y-ppu*.5)>1e-7||Math.abs(up.y-anchor.y+ppu)>1e-7||Math.abs(up.x-anchor.x)>1e-7||
    Math.abs(side.x-anchor.x+ppu)>1e-7||Math.abs(side.y-anchor.y-ppu*.5)>1e-7) return false;
  const key=JSON.stringify({recipe,ppu});
  let raw=rawCache.get(key);
  if(!raw) {
    raw=rasterize(recipe,ppu);rawCache.set(key,raw);
    if(rawCache.size>16)rawCache.delete(rawCache.keys().next().value!);
  }
  const shader=view.shadeColor??identity;
  let colors=gradedCache.get(shader);
  if(!colors) {colors=new WeakMap();gradedCache.set(shader,colors);}
  let colored=colors.get(raw);
  if(!colored) {
    // Never use cached raw pixels as scratch: atmosphere is applied exactly once.
    const data=new Uint8ClampedArray(raw.data),ramp=new Map<string,Color>();
    for(let i=0;i<data.length;i+=4)if(data[i+3]) {
      const key=`${data[i]},${data[i+1]},${data[i+2]}`;
      let color=ramp.get(key);
      if(!color) {
        const css=shader([data[i],data[i+1],data[i+2]]),hex=/^#([0-9a-f]{6})$/i.exec(css);
        if(!hex)throw new Error('Object atmosphere requires a six-digit RGB color');
        color=[0,2,4].map(at=>parseInt(hex[1].slice(at,at+2),16)) as Color;ramp.set(key,color);
      }
      data.set(color,i);
    }
    colored=document.createElement('canvas');colored.width=raw.width;colored.height=raw.height;
    colored.getContext('2d')!.putImageData(new ImageData(data,raw.width,raw.height),0,0);colors.set(raw,colored);
  }
  contact();
  // One uniform translation, at most .5 native pixel/axis from the unsnapped floor/contact.
  ctx.drawImage(colored,Math.round(anchor.x)+raw.offset.x,Math.round(anchor.y)+raw.offset.y);
  return true;
}
