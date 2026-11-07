import { type BoxSurface, type SceneApi } from '../../../scene/renderer.js';
import { drawNativeObject } from './native-object';

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

export const drawBed = drawNativeObject;
