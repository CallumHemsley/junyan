import {paintWorld} from '../painter';
import {worldMaps} from '../registry';
import {project} from '../camera';
import {createWorld} from '../state';
import {createGame} from '../../game';
import {content} from '../../neighbourhood/registry';
import type {DayPhase} from './index';
const canvas=document.querySelector('canvas')!,ctx=canvas.getContext('2d')!;
const game=createGame(content,42),initialWorld=createWorld(worldMaps);
const focus:Record<string,{x:number;y:number}>={courtyard:{x:25,y:17},apartment:{x:16,y:13},workshop:{x:15,y:12},park:{x:52,y:34},riverbank:{x:45,y:57}};
let mapId='courtyard',phase:DayPhase='morning';
function draw(nextMap=mapId,nextPhase=phase){
 mapId=nextMap;phase=nextPhase;
 const phone=innerWidth<600,width=phone?390:1280,height=phone?640:720,scale=phone?18:24;
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 const position=focus[mapId],camera={focus:position,width,height,scale};
 const served={morning:0,noon:2,evening:3,night:4}[phase];
 const start=performance.now();
 paintWorld(ctx,worldMaps[mapId],{project:(p,z)=>project(p,camera,z),elapsedMs:5000,reducedMotion:true,playerPosition:position,width,height,pass:'ground'},'south',false,scale,{...game,served},{...initialWorld,mapId,position});
 return {mapId,phase,served,scale,canvas:[width,height],renderMs:performance.now()-start};
}
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-map]'))button.onclick=()=>draw(button.dataset.map);
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-phase]'))button.onclick=()=>draw(mapId,button.dataset.phase as DayPhase);
Object.assign(window,{__PRODUCTION_LIGHTING__:{draw}});draw();
