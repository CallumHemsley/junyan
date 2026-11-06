import type {HeldObject} from './background';
import {getActorDefinition,diagnoseActorIds,UnsupportedActorError,type ActorDiagnostic} from './catalog';
import {actorCommands} from './adapter';
import type {WorldDrawCommand} from '../render-contract';
import {frame, type RGB, type PixelFrame} from './artwork.mjs';

export type Facing = 'north' | 'east' | 'south' | 'west';
export type ActorAction = 'idle' | 'walk' | 'interact';
export type ActorPosture = 'stand' | 'sit' | 'crouch' | 'work' | 'react';
export type ActorInput = {
  characterId:string;
  facing:Facing;
  action:ActorAction;
  elapsedMs:number;
  reducedMotion:boolean;
  posture?:ActorPosture;
  distanceTravelled?:number;
  yaw?:number;
  carrying?:boolean;
  heldObject?:HeldObject;
};
export type PixelSpan = {x:number;y:number;width:number;color:RGB};
export type ActorSample = {
  version:1;
  characterId:string;
  facing:Facing;
  direction:number;
  frameId:string;
  phase:number;
  posture:ActorPosture;
  frame:PixelFrame;
  drawCommands:PixelSpan[];
  worldCommands:WorldDrawCommand[];
};
const facingDirections:Record<Facing,number> = {south:7,west:5,north:3,east:1};

export function directionFromYaw(yaw:number):number {
  return ((Math.round((Math.PI/4-yaw)/(Math.PI/4))%8)+8)%8;
}
export function sampleActor(input:ActorInput):ActorSample {
  const definition=getActorDefinition(input.characterId);
  if(!definition)throw new UnsupportedActorError(input.characterId);
  const posture=input.posture ?? 'stand';
  const direction=input.yaw===undefined?facingDirections[input.facing]:directionFromYaw(input.yaw);
  const heldObject=input.heldObject??definition.heldObject;
  const clock=input.distanceTravelled===undefined?input.elapsedMs/definition.cadenceMs:input.distanceTravelled*6;
  const phase=input.reducedMotion?0:Math.floor(Math.max(0,clock))%6;
  const action=posture==='sit'||posture==='crouch'?posture:posture==='react'?'react':posture==='work'?'interact':input.action;
  const appearance=definition.appearance;
  const picture=frame({appearance,body:definition.body,role:definition.role,direction,phase,action,reducedMotion:input.reducedMotion,carrying:input.carrying,heldObject,acting:!input.reducedMotion&&input.elapsedMs%6000>5200,blink:!input.reducedMotion&&input.action==='idle'&&input.elapsedMs%4400>=4160});
  const commands:PixelSpan[]=[];
  for(let y=0;y<picture.height;y++)for(let x=0;x<picture.width;) {
    const offset=(y*picture.width+x)*4;
    if(!picture.pixels[offset+3]){x++;continue;}
    const color=Array.from(picture.pixels.subarray(offset,offset+3)) as RGB;
    let end=x+1;
    while(end<picture.width) {
      const next=(y*picture.width+end)*4;
      if(!picture.pixels[next+3]||color.some((channel,i)=>channel!==picture.pixels[next+i]))break;
      end++;
    }
    commands.push({x:x-picture.anchor.x,y:y-picture.anchor.y,width:end-x,color});
    x=end;
  }
  return {version:1,characterId:input.characterId,facing:input.facing,direction,
    frameId:`${input.characterId}/${direction}/${posture}/${input.action}/${phase}${input.carrying?'/carry':''}${heldObject?'/'+heldObject:''}${!input.reducedMotion&&input.action==='idle'&&input.elapsedMs%4400>=4160?'/blink':''}${!input.reducedMotion&&input.elapsedMs%6000>5200?'/acting':''}`,
    phase,posture,frame:picture,drawCommands:commands,worldCommands:actorCommands({drawCommands:commands},{x:0,y:0})};
}

export {drawActor,actorCommands,actorObject} from './adapter';

export {backgroundResidents,isBackgroundResidentId,type BackgroundResidentId,type HeldObject} from './background';

export type ActorSampleResult = {ok:true;sample:ActorSample}|{ok:false;diagnostic:ActorDiagnostic};
export function trySampleActor(input:ActorInput):ActorSampleResult {
  const diagnostic=diagnoseActorIds([input.characterId])[0];
  return diagnostic?{ok:false,diagnostic}:{ok:true,sample:sampleActor(input)};
}
export {actorCatalog,supportedActorIds,supportsActor,getActorDefinition,diagnoseActorIds,UnsupportedActorError,type ActorCatalogEntry,type ActorDiagnostic} from './catalog';
