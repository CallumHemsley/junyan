import {paintWorld} from '../painter';
import {worldMaps} from '../registry';
import {project,cameraForMap} from '../camera';
import {createWorld} from '../state';
import {canStand,findPath} from '../geometry';
import {actorsFor} from '../life-bridge';
import {createGame} from '../../game';
import {content} from '../../neighbourhood/registry';
const canvas=document.querySelector('canvas')!,ctx=canvas.getContext('2d')!;
const game=createGame(content,42),world=createWorld(worldMaps);
const sites={
  'workshop-bench':{mapId:'workshop',position:{x:11.5,y:8.8},pocket:true},
  'workshop-entry':{mapId:'workshop',position:{x:15,y:22.5},pocket:false},
  'courtyard-window':{mapId:'courtyard',position:{x:23.5,y:21.5},pocket:true},
  'courtyard-laundry':{mapId:'courtyard',position:{x:6,y:11.5},pocket:false},
  'rooftop-threshold':{mapId:'rooftop',position:{x:12.5,y:29},pocket:true},
  'rooftop-care':{mapId:'rooftop',position:{x:19,y:20},pocket:false},
};
const routeChecks=new Map<string,boolean>();
function draw(site:keyof typeof sites='workshop-bench',phase:'morning'|'evening'='morning',occupied=true){
 const {mapId,position,pocket}=sites[site],map=worldMaps[mapId],bounds=canvas.getBoundingClientRect();
 const width=Math.ceil(bounds.width/2),height=Math.ceil(bounds.height/2),scale=bounds.width<600?11:15;
 canvas.width=width;canvas.height=height;
 const camera=cameraForMap(map.bounds,position,width,height,scale);
 const fixtureGame={...game,served:phase==='morning'?0:3},fixtureWorld={...world,mapId,position};
 const start=performance.now();
 paintWorld(ctx,map,{project:(p,z)=>project(p,camera,z),elapsedMs:5000,reducedMotion:true,playerPosition:position,width,height,pass:'ground'},'south',false,scale,fixtureGame,occupied?fixtureWorld:undefined);
 const renderMs=performance.now()-start;
 if(!routeChecks.has(site))routeChecks.set(site,canStand(map,position)&&(Math.hypot(position.x-map.defaultSpawn.x,position.y-map.defaultSpawn.y)<.2||findPath(map,map.defaultSpawn,position).length>0));
 const actors=occupied?actorsFor(map,fixtureGame,fixtureWorld,5000,true).filter(a=>{const p=project(a.position,camera);return p.x>=0&&p.y>=0&&p.x<width&&p.y<height;}):[];
 const result={site,mapId,position,phase,occupied,pocket,scale,logicalCanvas:[width,height],legalApproach:routeChecks.get(site),visibleActors:actors.map(a=>a.characterId),renderMs};
 document.querySelector('output')!.textContent=JSON.stringify(result);return result;
}
Object.assign(window,{__LOCAL_LIGHT_STUDY__:{draw}});draw();
