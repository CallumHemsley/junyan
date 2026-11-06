import { createWorkshopArt } from './index';
import { workshopAtmosphereHooks } from './lighting';
import { workshopDefinition } from '../../maps/workshop';
import { worldMapSchema } from '../../schema';
import { cameraForMap, project } from '../../camera';
import { sampleAtmosphere, type DayPhase } from '../../atmosphere';
import { atmosphereHooksForMap } from '../../atmosphere/map-hooks';
import { drawAtmosphere, renderAtmosphereObjects } from '../../atmosphere/canvas';
import { colorShader } from '../../lighting';
import { drawActor, sampleActor } from '../../characters';
import { initialState, reduce, type Action } from '../../../features/repairs/rules';

const params=new URLSearchParams(location.search);
const phase:DayPhase=params.get('phase')==='evening'?'evening':'morning';
const occupied=params.get('occupied')!=='0';
const job=params.get('job')==='toy'?'toy':'lamp';
const canvas=document.querySelector('canvas')!;
canvas.width=Math.ceil(innerWidth/2);canvas.height=Math.ceil(innerHeight/2);
const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
const map=worldMapSchema.parse(workshopDefinition);
let repairs=initialState();
if(job==='toy')repairs=reduce(repairs,{type:'switch',job:'toy'},1);
if(params.get('completed')==='1') {
 const actions:Action[]=[{type:'select',job:'lamp',part:'bulb'},{type:'turn',job:'lamp',direction:'tighten'},{type:'test',job:'lamp'},{type:'return',job:'lamp'},{type:'switch',job:'toy'},{type:'select',job:'toy',part:'cover'},{type:'cover',job:'toy',position:'open'},{type:'select',job:'toy',part:'lead'},{type:'lead',job:'toy',position:'connected'},{type:'select',job:'toy',part:'cell'},{type:'cell',job:'toy',condition:'fresh'},{type:'select',job:'toy',part:'cover'},{type:'cover',job:'toy',position:'closed'},{type:'test',job:'toy'},{type:'return',job:'toy'}];
 repairs=actions.reduce((state,action)=>reduce(state,action,1),initialState());
}
const hooks=atmosphereHooksForMap(map,workshopAtmosphereHooks(map,repairs));
const frame=sampleAtmosphere({mapId:'workshop',day:1,timeOfDay:phase,elapsedMs:1200,seed:42,reducedMotion:true},hooks);
const camera=cameraForMap(map.bounds,params.get('completed')==='1'?{x:21,y:7}:job==='toy'?{x:20,y:14}:{x:10,y:14},canvas.width,canvas.height,innerWidth<600?11:15);
const view={project:(point:{x:number;y:number},z=0)=>project(point,camera,z),shadeColor:colorShader(frame.light),elapsedMs:1200,reducedMotion:true,playerPosition:{x:15,y:14},width:canvas.width,height:canvas.height,pass:'ground' as const};
ctx.fillStyle='#334d47';ctx.fillRect(0,0,canvas.width,canvas.height);
const art=createWorkshopArt(repairs);art.drawMap!(ctx,map,view);drawAtmosphere(ctx,frame,view);
const objects=[...art.renderObjects!(map,view),...renderAtmosphereObjects(frame)];
if(occupied){const position=job==='lamp'?{x:8,y:10.8}:{x:20.8,y:10.8};objects.push({id:'study-resident',position,draw(context,view){drawActor(context,view,sampleActor({characterId:job==='lamp'?'lin-jie':'xiao-zhou',facing:'north',action:'interact',posture:'work',elapsedMs:1200,reducedMotion:true}),position);}});}
objects.sort((a,b)=>(a.depth??a.position.x+a.position.y)-(b.depth??b.position.x+b.position.y)).forEach(object=>object.draw(ctx,view));
drawAtmosphere(ctx,frame,{...view,pass:'foreground'});
Object.assign(window,{workshopPocketStudy:{phase,occupied,job,completed:repairs.completed,hooks,objectOrder:objects.map(o=>({id:o.id,depth:o.depth??o.position.x+o.position.y})),camera,geometry:{colliders:map.colliders,anchors:map.anchors},ready:true}});
