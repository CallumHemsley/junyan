import { createRenderer, type BoxSurface, type Color, type SceneApi } from '../../../scene/renderer.js';
import type { WorldRenderView } from '../../render-contract';

type Box = Parameters<SceneApi['box']>;
type BedPart = { part:string; surface:BoxSurface|null; box:Box };
export type BedRecipe = { commands:BedPart[]; pivot:{x:number; y:number} };

// The original fifteen structural boxes; the four decorative stripes become printed color only.
export function bedRecipe(x:number, y:number, endX:number, endY:number):BedRecipe {
  const commands:BedPart[] = [];
  const add = (kind:BoxSurface['kind'], part:string, ...box:Box) => commands.push({part, surface:{kind}, box});
  add('wood', 'frame', x,y,0,endX,endY,.4,[159,119,77]);
  add('linen', 'mattress', x,y,.4,endX,endY,.7,[231,219,187]);
  add('wood', 'headboard', x,y,.7,endX,y+.2,1.2,[159,119,77]);
  add('linen', 'pillow', x+.2,y+.35,.7,endX-.2,y+1.1,.88,[215,207,176]);
  add('linen', 'pillow-seam', x+.24,y+.39,.88,endX-.24,y+.46,.9,[239,227,193]);
  for(let at=x+.3;at<endX-.2;at+=.55) add('wood','headboard-slat',at,y+.03,.85,at+.1,y+.2,1.24,[193,153,101]);
  add('cloth','blanket',x,y+1.3,.7,endX,endY,.83,[132,158,127]);
  add('cloth','blanket-fold',x+.05,y+1.25,.83,endX-.05,y+1.62,.9,[176,190,154]);
  for(let at=y+1.8;at<endY-.1;at+=.6) commands.push({part:'blanket-stripe',surface:null,box:[x+.05,at,.83,endX-.05,at+.035,.85,[151,175,137]]});
  add('cloth','blanket-end',x,endY-.15,.45,endX,endY,.83,[112,144,117]);
  add('cloth','blanket-corner',x+.2,endY-.2,.83,x+.8,endY,.88,[155,177,140]);
  return {commands, pivot:{x:(x+endX)/2,y:(y+endY)/2}};
}

type Raw = {data:Uint8ClampedArray; width:number; height:number; offset:{x:number;y:number}};
const rawCache = new Map<string,Raw>();
const gradedCache = new WeakMap<NonNullable<WorldRenderView['shadeColor']>, WeakMap<Raw,HTMLCanvasElement>>();
const identity = (c:string|readonly number[]) => typeof c === 'string' ? c : '#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');

function rasterize(recipe:BedRecipe, ppu:number):Raw {
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
  if(right<left||left===0||top===0||right===canvas.width-1||bottom===canvas.height-1) throw new RangeError('Bed raster exceeds its native surface');
  const width=right-left+1,height=bottom-top+1,data=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)data.set(pixels.subarray(((y+top)*canvas.width+left)*4,((y+top)*canvas.width+right+1)*4),y*width*4);
  return {data,width,height,offset:{x:left-180,y:top-150}};
}

/** Illustrative body bitmap: internal depth only; world ordering and native contact stay with the caller. */
export function drawBed(ctx:CanvasRenderingContext2D, view:WorldRenderView, recipe:BedRecipe, contact:()=>void):boolean {
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
        if(!hex)throw new Error('Bed atmosphere requires a six-digit RGB color');
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
