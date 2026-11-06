import {nearbyLife} from "./life";
import {actorsFor,planFor,navigationFor,type WorldLifeAction} from "./life-bridge";
import FeatureLine from "../neighbourhood/FeatureLine";
import type {Line} from "../contracts";
import type {GameState,Word} from "../contracts";
import WordToken from "../WordToken";
import {content} from "../neighbourhood/registry";
import {contentWords} from "../content/words";
import {wordState} from "../recovery";
import {useEffect,useRef,useState} from "react";
import type {WorldState,Point} from "./schema";
import type {MapRegistry} from "./registry";
import {project,pointerGround,cameraForMap,type Camera} from "./camera";
import {movePlayer,nearbyAnchors} from "./geometry";
import {paintWorld} from "./painter";
import type {WorldAction} from "./state";
import "./world.css";
const mapNames:Record<string,string>={restaurant:"早安小馆",town:"早市街",courtyard:"院子",workshop:"修理间",rooftop:"屋顶花园",apartment:"家","residential-hall":"楼下","residential-stairs":"楼梯",park:"河畔公园",riverbank:"河岸"};
const directions:Record<string,Point>={ArrowUp:{x:-1,y:-1},w:{x:-1,y:-1},ArrowDown:{x:1,y:1},s:{x:1,y:1},ArrowLeft:{x:-1,y:1},a:{x:-1,y:1},ArrowRight:{x:1,y:-1},d:{x:1,y:-1}};
export default function WorldViewport({state,maps,game,onLookup,onPlay,dialogue,fresh,onAction,paused=false}:{state:WorldState;maps:MapRegistry;game:GameState;onPlay:(line:Line)=>void;dialogue:Line|null;onLookup:(word:Word,trigger:HTMLButtonElement)=>void;fresh:string[];onAction:(action:WorldAction|WorldLifeAction)=>void;paused?:boolean}) {
 const canvas=useRef<HTMLCanvasElement>(null),root=useRef<HTMLElement>(null);
 const latest=useRef({state,maps,game,onAction,paused});latest.current={state,maps,game,onAction,paused};
 const keys=useRef(new Set<string>()),path=useRef<Point[]>([]),cameraRef=useRef<Camera>({focus:state.position,width:960,height:600,scale:22});
 const worker=useRef<Worker|null>(null),requestId=useRef(0),workerMap=useRef<object|null>(null);
 const elapsed=useRef(0);
 const [clock,setClock]=useState(0);
 const [viewport,setViewport]=useState({width:960,height:600});
 const map=maps[state.mapId];
 useEffect(()=>{path.current=[];keys.current.clear();requestId.current++;root.current?.focus();},[state.mapId,state.activeActivity]);
 useEffect(()=>{
  const instance=new Worker(new URL("./path-worker.ts",import.meta.url),{type:"module"});worker.current=instance;
  instance.onmessage=(event:MessageEvent<{id:number;path:Point[];mapId:string}>)=>{
   if(event.data.id===requestId.current&&event.data.mapId===latest.current.state.mapId&&!latest.current.state.activeActivity)path.current=event.data.path;
  };
  return()=>{instance.terminate();worker.current=null;};
 },[]);
 useEffect(()=>{
  const element=root.current;if(!element||!canvas.current)return;
  const resize=new ResizeObserver(entries=>{const bounds=entries[0].contentRect;setViewport({width:Math.round(bounds.width),height:Math.round(bounds.height)});});resize.observe(element);
  return()=>resize.disconnect();
 },[]);
 useEffect(()=>{
  const element=canvas.current;if(!element)return;
  const context=element.getContext("2d");if(!context)return;
  const preference=matchMedia("(prefers-reduced-motion: reduce)");
  let frame=0,last=0,lastDraw=0,elapsedMs=0;
  const tick=(now:number)=>{
   frame=0;if(document.hidden)return;
   const dt=last?Math.min((now-last)/1000,.04):0;last=now;elapsedMs+=dt*1000;if(Math.floor(elapsedMs/500)!==Math.floor(elapsed.current/500))setClock(elapsedMs);elapsed.current=elapsedMs;
   const current=latest.current,map=current.maps[current.state.mapId];if(!map)return;
   const canMove=!current.paused&&!current.state.activeActivity;
   let moving=false;
   if(canMove){
    let delta={x:0,y:0};for(const key of keys.current){const d=directions[key];if(d){delta.x+=d.x;delta.y+=d.y;}}
    const length=Math.hypot(delta.x,delta.y);
    if(length){path.current=[];requestId.current++;delta={x:delta.x/length*dt*5,y:delta.y/length*dt*5};}
    else if(path.current.length){const target=path.current[0],p=current.state.position,dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),step=dt*5;if(d<=Math.max(step,.03)){delta={x:dx,y:dy};path.current.shift();}else delta={x:dx/d*step,y:dy/d*step};}
    if(delta.x||delta.y){const next=movePlayer(map,current.state.position,delta);moving=Math.hypot(next.x-current.state.position.x,next.y-current.state.position.y)>.0001;if(moving)current.onAction({type:"world-move",position:next});else path.current=[];}
   }
   const dpr=1,width=Math.ceil(viewport.width/2),height=Math.ceil(viewport.height/2);
   if(element.width!==Math.round(width*dpr)||element.height!==Math.round(height*dpr)){element.width=Math.round(width*dpr);element.height=Math.round(height*dpr);}
   const camera=cameraForMap(map.bounds,current.state.position,width,height,viewport.width<600?11:15);cameraRef.current=camera;
   if(now-lastDraw>=1000/30||preference.matches){context.setTransform(dpr,0,0,dpr,0,0);paintWorld(context,map,{project:(p,z)=>project(p,camera,z),elapsedMs:preference.matches?0:elapsedMs,reducedMotion:preference.matches,playerPosition:current.state.position,width,height,pass:"ground"},current.state.facing,moving,camera.scale,current.game,current.state);lastDraw=now;element.dataset.rendered="true";}
   frame=requestAnimationFrame(tick);
  };
  const refresh=()=>{last=0;keys.current.clear();if(document.hidden){cancelAnimationFrame(frame);frame=0;}else if(!frame)frame=requestAnimationFrame(tick);};
  document.addEventListener("visibilitychange",refresh);frame=requestAnimationFrame(tick);
  const up=(event:KeyboardEvent)=>keys.current.delete(event.key);window.addEventListener("keyup",up);window.addEventListener("blur",refresh);
  return()=>{cancelAnimationFrame(frame);document.removeEventListener("visibilitychange",refresh);window.removeEventListener("keyup",up);window.removeEventListener("blur",refresh);};
 },[viewport]);
 const nearby=nearbyAnchors(map,state.position);
 const lifeOptions=nearbyLife(planFor(map,game),actorsFor(map,game,state,clock,false),state.position,navigationFor(map));
 const dictionary=contentWords(content);
 const token=(hanzi:string)=>{const word=dictionary.find(w=>w.hanzi===hanzi);return word?<WordToken key={word.id} word={word} look={wordState(game.journal[word.id],fresh.includes(word.id))} onLookup={onLookup}/>:null;};
 const place:Record<string,string[]>={restaurant:["早安小馆"],courtyard:["院子"],workshop:["修理间"],apartment:["家"],rooftop:["屋顶","花园"]};
 return <section ref={root} className="connected-world" data-testid="world-viewport" data-map={map.id} tabIndex={0} aria-label={`${mapNames[map.id]??"街坊"}，方向键走动，点地面走过去`} onKeyDown={event=>{
  if(paused||state.activeActivity||event.target instanceof HTMLButtonElement)return;
  if(directions[event.key]){event.preventDefault();event.stopPropagation();keys.current.add(event.key);}
  else if((event.key==="e"||event.key==="Enter")&&nearby[0]){event.preventDefault();onAction({type:"world-interact",anchorId:nearby[0].id});}
 }} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))keys.current.clear();}}>
  <canvas ref={canvas} aria-hidden="true" onPointerDown={event=>{
   if(paused||state.activeActivity)return;
   root.current?.focus();const rect=event.currentTarget.getBoundingClientRect(),p=pointerGround({x:event.clientX,y:event.clientY},rect,cameraRef.current);
   const id=++requestId.current;
   worker.current?.postMessage({id,from:state.position,to:p,...(workerMap.current!==map?{map}:{})});workerMap.current=map;
  }}/>
  <div className="world-place" aria-live="polite">{(place[map.id]??[]).map(token)}</div>
  <div className="world-nearby">{!state.activeActivity&&nearby.map(a=><div className="world-anchor" key={a.id}>{token(a.featureId==="restaurant"&&a.interactionId.startsWith("table-")?"客人":"看看")}<button data-world-anchor={a.id} aria-label={a.featureId==="restaurant"&&a.interactionId.startsWith("table-")?`${a.interactionId.split("-")[1]}桌点餐`:a.featureId==="restaurant"?"厨房":"看看"} onClick={()=>onAction({type:"world-interact",anchorId:a.id})}>→</button></div>)}</div>
  {!state.activeActivity&&lifeOptions.length>0&&<div className="world-life-options">{lifeOptions.slice(0,2).map(option=><div className="world-anchor" key={option.id}>{option.label.tokens.map(word=><WordToken key={word.id} word={word} look={wordState(game.journal[word.id],fresh.includes(word.id))} onLookup={onLookup}/>)}<button aria-label={option.label.tokens.map(w=>w.hanzi).join("")} onClick={()=>onAction({type:"world-life",actionId:option.id,elapsedMs:elapsed.current})}>→</button></div>)}</div>}
  {dialogue&&<div className="world-life-dialogue"><FeatureLine line={dialogue} onLookup={onLookup} onPlay={onPlay} recoveredWordIds={Object.keys(game.journal)} freshWordIds={fresh}/></div>}
  <div className="world-pad" aria-label="走动">{["ArrowUp","ArrowLeft","ArrowDown","ArrowRight"].map((key,i)=><button key={key} aria-label={["向前走","向左走","向后走","向右走"][i]} disabled={paused||!!state.activeActivity} onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);keys.current.add(key);}} onPointerUp={()=>keys.current.delete(key)} onPointerCancel={()=>keys.current.delete(key)} onLostPointerCapture={()=>keys.current.delete(key)}>{["↑","←","↓","→"][i]}</button>)}</div>
 </section>;
}
