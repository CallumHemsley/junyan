import { workshopDefinition } from '../../maps/workshop';
import { worldMapSchema } from '../../schema';
import { createWorkshopArt } from './index';
import { sampleAtmosphere } from '../../atmosphere';
import { colorShader } from '../../lighting';
import { project } from '../../camera';
import { paintWorld } from '../../painter';
import { createGame } from '../../../game';
import { content } from '../../../neighbourhood/registry';
import { createNeighbourhood } from '../../../neighbourhood/model';

const game=createGame(content,42);
game.neighbourhood=createNeighbourhood(game.day);
const map=worldMapSchema.parse(workshopDefinition),canvas=document.querySelector('canvas')!,ctx=canvas.getContext('2d')!;
const camera={focus:{x:15,y:13},width:720,height:560,scale:18};
const art=createWorkshopArt(game.neighbourhood!.repairs);
const proof:{phase:string;changedPixels?:number;materialChangedPixels?:number;materialMeanDelta?:number;alphaPreserved?:boolean}={phase:'morning'};
Object.assign(window,{workshopLighting:proof});
let morning:Uint8ClampedArray;
function draw(phase:'morning'|'evening',lit=false){
 const frame=sampleAtmosphere({mapId:'workshop',day:game.day,timeOfDay:phase,elapsedMs:0,seed:game.seed,reducedMotion:true},{interior:true,particles:[]});
 const view={project:(point:{x:number;y:number},z=0)=>project(point,camera,z),shadeColor:colorShader(frame.light),elapsedMs:0,reducedMotion:true,playerPosition:{x:15,y:14},width:720,height:560,pass:'ground' as const};
 ctx.globalAlpha=1;ctx.fillStyle=view.shadeColor([68,67,57]);ctx.fillRect(0,0,720,560);
 if(lit)paintWorld(ctx,map,view,'north',false,18,{...game,served:3},game.world);
 else{
  art.drawMap!(ctx,map,view);
  const objects=art.renderObjects!(map,view).sort((a,b)=>(a.depth??a.position.x+a.position.y)-(b.depth??b.position.x+b.position.y));
  for(const object of objects)object.draw(ctx,view);
  ctx.globalAlpha=.45;objects[0].draw(ctx,view);proof.alphaPreserved=ctx.globalAlpha===.45;ctx.globalAlpha=1;
 }
 const pixels=ctx.getImageData(0,0,720,560).data;
 if(phase==='morning')morning=pixels.slice();
 else if(morning){let changed=0,total=0;for(let i=0;i<pixels.length;i+=4){const delta=Math.abs(pixels[i]-morning[i])+Math.abs(pixels[i+1]-morning[i+1])+Math.abs(pixels[i+2]-morning[i+2]);if(delta)changed++;total+=delta;}proof.changedPixels=changed;if(!lit){proof.materialChangedPixels=changed;proof.materialMeanDelta=total/(pixels.length/4*3);}}
 proof.phase=lit?'evening-lit':phase;
}
document.querySelector('#morning')!.addEventListener('click',()=>draw('morning'));
document.querySelector('#evening')!.addEventListener('click',()=>draw('evening'));
document.querySelector('#lit')!.addEventListener('click',()=>draw('evening',true));
draw('morning');
