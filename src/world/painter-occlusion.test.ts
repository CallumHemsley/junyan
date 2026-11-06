import {it,expect,vi,beforeEach} from 'vitest';
import type {WorldRenderObject,WorldRenderView} from './render-contract';
import {restaurantMap} from './restaurant';
const fixture=vi.hoisted(()=>({objects:[] as WorldRenderObject[],draws:[] as {id:string;alpha:number}[],authored:true}));
vi.mock('./art-registry',()=>({artModules:{},selectArtModules:()=>fixture.authored?[{renderObjects:()=>fixture.objects}]:[]}));
vi.mock('./characters',()=>({sampleActor:()=>({}),projectActorBounds:()=>({x:0,y:0,width:10,height:20}),drawActor:(ctx:CanvasRenderingContext2D)=>fixture.draws.push({id:'player',alpha:ctx.globalAlpha})}));
vi.mock('./lighting',()=>({colorShader:()=>((color:string)=>color)}));
vi.mock('./atmosphere',()=>({sampleAtmosphere:()=>({light:{}})}));
vi.mock('./atmosphere/canvas',()=>({drawAtmosphere:()=>{},renderAtmosphereObjects:()=>[]}));
import {paintWorld} from './painter';
const position={x:9,y:9},occlusion={rect:{x:10,y:10,width:2,height:2},height:4,fadeWhenPlayerBehind:true};
const map={...restaurantMap,id:'depth-fixture',props:[],terrain:[],occluders:[]};
const view:WorldRenderView={project:(p,z=0)=>({x:p.x*10,y:p.y*10-z*10}),playerPosition:position,width:200,height:200,elapsedMs:0,reducedMotion:true,pass:'ground'};
function context(){
 const alpha:number[]=[];
 const ctx={globalAlpha:.8,save(){alpha.push(this.globalAlpha);},restore(){this.globalAlpha=alpha.pop()!;},fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},stroke(){},fill(){fixture.draws.push({id:'fallback',alpha:this.globalAlpha});}};
 return ctx as unknown as CanvasRenderingContext2D;
}
beforeEach(()=>{fixture.objects=[];fixture.draws=[];fixture.authored=true;});
it('uses actual stable compositor order and preserves inherited alpha around each custom item',()=>{
 fixture.objects=[['before',17],['tied-after',18],['after',19]].map(([id,depth])=>({id:String(id),position,depth:Number(depth),occlusion,draw:ctx=>fixture.draws.push({id:String(id),alpha:ctx.globalAlpha})}));
 const ctx=context();paintWorld(ctx,map,view,'east',false,10);
 expect(fixture.draws.map(x=>x.id)).toEqual(['before','player','tied-after','after']);
 expect(fixture.draws.map(x=>x.alpha)).toEqual([.8,.8,.8*.45,.8*.45]);expect(ctx.globalAlpha).toBe(.8);
});
it('keeps an equal-depth fallback prop before the player opaque and restores the inherited context',()=>{
 fixture.authored=false;
 const prop={id:'fallback',kind:'crate',position:{x:8.5,y:8.5},width:1,height:1,layer:'object' as const,variant:0};
 const ctx=context();paintWorld(ctx,{...map,props:[prop],occluders:[{id:'fallback',...occlusion}]},view,'east',false,10);
 expect(fixture.draws.at(-1)?.id).toBe('player');expect(fixture.draws.filter(x=>x.id==='fallback').length).toBeGreaterThan(0);expect(fixture.draws.every(x=>x.alpha===.8)).toBe(true);expect(ctx.globalAlpha).toBe(.8);
});
