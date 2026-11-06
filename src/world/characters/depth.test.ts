import {describe,it,expect} from 'vitest';
import {createRenderer,type SceneApi} from '../../scene/renderer.js';
import {sampleActor} from './index';
import {paintActor} from './adapter';
function rendered(withBox:boolean) {
 let pixels=new Uint8ClampedArray();
 const canvas={getContext:()=>({createImageData:(width:number,height:number)=>({data:new Uint8ClampedArray(width*height*4)}),putImageData:(image:{data:Uint8ClampedArray})=>{pixels=image.data.slice();}})} as unknown as HTMLCanvasElement;
 const sample=sampleActor({characterId:'xiao-li',facing:'east',action:'idle',elapsedMs:0,reducedMotion:false});
 const renderer=createRenderer(canvas,{
  bake(api:SceneApi){api.pix.fill(api.rgb(220,214,190));api.zb.fill(-1e9);api.groundZ.fill(-1e9);if(withBox)api.box(-.6,-.6,0,.6,.6,1.1,[143,109,77]);},
  draw(api:SceneApi){paintActor({project:api.project,pixel:(x,y,d,color)=>{if(x<0||x>=api.W||y<0||y>=api.H)return;const index=y*api.W+x;if(d>api.zb[index]){api.zb[index]=d;api.pix[index]=api.rgb(...color);}}},sample,{x:-.4,y:-.4});},
 });
 renderer.draw();return pixels;
}
describe('pixel actors in actual Pixel Plays depth',()=>{
 it('lets a foreground box hide the lower body while the face remains visible',()=>{
  const open=rendered(false),occluded=rendered(true);
  let hidden=0,visibleHead=0;
  for(let y=95;y<150;y++)for(let x=150;x<205;x++) {
   const i=(y*360+x)*4;
   if(open[i]===220&&open[i+1]===214)continue;
   const equal=[0,1,2].every(channel=>open[i+channel]===occluded[i+channel]);
   if(equal&&y<124)visibleHead++;
   if(!equal&&y>130)hidden++;
  }
  expect(visibleHead).toBeGreaterThan(30);
  expect(hidden).toBeGreaterThan(10);
 });
});
