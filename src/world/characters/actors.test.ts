import {describe,it,expect} from 'vitest';
import {sampleActor,directionFromYaw,type ActorInput} from './index';
import {paintActor} from './adapter';
const base:ActorInput={characterId:'player',facing:'east',action:'walk',elapsedMs:0,reducedMotion:false};
const pixels=(input:Partial<ActorInput>)=>Array.from(sampleActor({...base,...input}).frame.pixels);
describe('original pixel actors',()=>{
 it('keeps the approved returning cast visibly distinct in front and rear views',()=>{
  for(const facing of ['east','north'] as const)expect(new Set(['player','lin-jie','xiao-li','zhang-laoshi','xiao-zhou'].map(characterId=>JSON.stringify(pixels({characterId,facing})))).size).toBe(5);
 });
 it('orients cardinal movement relative to the isometric camera',()=>{
  expect([0,Math.PI/2,Math.PI,-Math.PI/2].map(directionFromYaw)).toEqual([1,7,5,3]);
  for(const [facing,yaw] of [['east',0],['south',Math.PI/2],['west',Math.PI],['north',-Math.PI/2]] as const)
   expect(sampleActor({...base,facing}).direction).toBe(directionFromYaw(yaw));
  expect(new Set(Array.from({length:8},(_,i)=>JSON.stringify(pixels({yaw:Math.PI/4-i*Math.PI/4})))).size).toBe(8);
 });
 it('moves the legs through a repeatable gait with at least one planted foot',()=>{
  const frames=Array.from({length:6},(_,i)=>sampleActor({...base,distanceTravelled:i/6}));
  expect(new Set(frames.map(f=>JSON.stringify(Array.from(f.frame.pixels)))).size).toBeGreaterThanOrEqual(4);
  expect(frames.every(f=>f.frame.feet.some(foot=>foot.planted))).toBe(true);
  expect(pixels({distanceTravelled:0,elapsedMs:500})).toEqual(pixels({distanceTravelled:0,elapsedMs:1700}));
 });
 it('freezes reduced motion while retaining direction and explicit contextual poses',()=>{
  expect(pixels({reducedMotion:true,elapsedMs:0})).toEqual(pixels({reducedMotion:true,elapsedMs:300}));
  expect(pixels({reducedMotion:true,facing:'east'})).not.toEqual(pixels({reducedMotion:true,facing:'west'}));
  expect(new Set(['stand','sit','crouch','work'].map(posture=>JSON.stringify(pixels({posture:posture as ActorInput['posture'],action:'idle'})))).size).toBe(4);
 });
 it('provides replayable blink, held object and depth-aware pixel samples without global time',()=>{
  expect(pixels({action:'idle',elapsedMs:0})).not.toEqual(pixels({action:'idle',elapsedMs:4200}));
  expect(pixels({carrying:true})).not.toEqual(pixels({carrying:false}));
  const calls:number[][]=[],shadows:number[][]=[];
  paintActor({project:(x,y,z)=>({sx:x,sy:y,d:z}),pixel:(x,y,d)=>{calls.push([x,y,d]);},shadow:(...args)=>{shadows.push(args);}},sampleActor(base),{x:10,y:20,z:2});
  expect(calls.length).toBeGreaterThan(200);
  expect(calls.every(c=>c.every(Number.isFinite)&&c[2]>=2)).toBe(true);
  expect(shadows.length).toBeGreaterThanOrEqual(2);
 });
});

describe('actor material boundary',()=>{
 it('routes every pixel through the supplied material callback without resetting inherited alpha',async()=>{
  const {drawActor}=await import('./adapter');
  let alpha=.45,style='';const stack:number[]=[],fills:{style:string;alpha:number}[]=[],materials:number[][]=[];
  const context={
   save:()=>stack.push(alpha),restore:()=>{alpha=stack.pop()!;},
   get globalAlpha(){return alpha;},set globalAlpha(value:number){alpha=value;},
   get fillStyle(){return style;},set fillStyle(value:string){style=value;},
   beginPath:()=>{},ellipse:()=>{},fill:()=>fills.push({style,alpha}),fillRect:()=>fills.push({style,alpha}),
  } as unknown as CanvasRenderingContext2D;
  drawActor(context,{project:point=>({x:(point.x-point.y)*18+50,y:(point.x+point.y)*9+60}),elapsedMs:0,reducedMotion:false,playerPosition:{x:0,y:0},width:100,height:100,pass:'objects',shadeColor:color=>{if(typeof color==='string')throw new Error('Actor material should pass authored RGB');materials.push([...color]);return '#345678';}},sampleActor(base),{x:0,y:0});
  expect(materials.length).toBeGreaterThan(100);
  expect(fills.every(fill=>fill.style==='#345678')).toBe(true);
  expect(fills.every(fill=>fill.alpha<=.45)).toBe(true);
  expect(context.globalAlpha).toBe(.45);
  expect(sampleActor(base).worldCommands.every(command=>/^#[0-9a-f]{6}$/.test(command.color))).toBe(true);
 });
});
