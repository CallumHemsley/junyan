import {expect,it,vi} from 'vitest';
import type {WorldRenderView} from './render-contract';
// Keep the real painter, river paint, atmosphere sampler and atmosphere canvas together.
vi.mock('./art-registry',async()=>{
 const {drawRiverbankWater}=await import('./art/landscape/ground');
 const art={drawMap:(ctx:CanvasRenderingContext2D,map:Parameters<typeof drawRiverbankWater>[1],view:WorldRenderView)=>{if(view.pass==='ground')drawRiverbankWater(ctx,map,view);}};
 return {artModules:{'./art/landscape/index.ts':art},selectArtModules:()=>[art]};
});
vi.mock('./characters',()=>({sampleActor:()=>({}),projectActorBounds:()=>({x:0,y:0,width:10,height:20}),drawActor:()=>{}}));
import {paintWorld} from './painter';
import {worldMaps} from './registry';
import {sampleDayLight} from './atmosphere';
import {colorShader} from './lighting';

it('preserves the authored river through the actual ground compositor while park retains atmospheric water',()=>{
 const view:WorldRenderView={project:(p,z=0)=>({x:720+(p.x-p.y)*15,y:(p.x+p.y)*7.5-400-z*15}),playerPosition:{x:40,y:74},width:1440,height:1000,elapsedMs:0,reducedMotion:true,pass:'ground'};
 const light=sampleDayLight('morning'),atmosphericBase=`rgb(${light.water.join(',')})`;
 for(const id of ['riverbank','park']){
  const paints:string[]=[],stack:{alpha:number;color:string}[]=[];
  const context={canvas:{width:1440,height:1000},globalAlpha:1,fillStyle:'',save(){stack.push({alpha:this.globalAlpha,color:this.fillStyle});},restore(){const state=stack.pop()!;this.globalAlpha=state.alpha;this.fillStyle=state.color;},beginPath(){},moveTo(){},lineTo(){},closePath(){},rect(){},clip(){},fillRect(){},fill(){paints.push(this.fillStyle);}};
  const ctx=context as unknown as CanvasRenderingContext2D;
  paintWorld(ctx,{...worldMaps[id],props:[],occluders:[]},view,'east',false,15);
  expect(paints.includes(atmosphericBase)).toBe(id==='park');
  if(id==='riverbank')expect(paints).toContain(colorShader(light)('#4d7984'));
  expect(stack).toHaveLength(0);
 }
});
