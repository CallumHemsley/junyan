import {paintWorld} from '../painter';
import {worldMaps} from '../registry';
import {project} from '../camera';
import {createWorld} from '../state';
import {createGame} from '../../game';
import {content} from '../../content';
const map=worldMaps.courtyard,position={x:23,y:20};
const camera={focus:position,width:720,height:480,scale:18};
const world={...createWorld(worldMaps),mapId:map.id,position,facing:'east' as const};
const results:Record<string,unknown>={};
for(const [phase,served] of [['morning',0],['evening',3]] as const) {
 const canvas=document.querySelector<HTMLCanvasElement>(`#${phase}`)!,context=canvas.getContext('2d')!;
 const game={...createGame(content,42),served};
 paintWorld(context,map,{project:(point,z)=>project(point,camera,z),elapsedMs:0,reducedMotion:true,playerPosition:position,width:720,height:480,pass:'ground'},world.facing,false,18,game,world);
 results[phase]={mapId:map.id,camera,position,served,elapsedMs:0,reducedMotion:true,particleFree:true,actorPixels:Array.from(context.getImageData(350,206,20,32).data),png:canvas.toDataURL('image/png').split(',')[1]};
}
Object.assign(window,{__ACTOR_LIGHTING_PROOF__:results});
