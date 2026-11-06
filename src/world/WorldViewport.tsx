import {restaurantCamera} from "./art/restaurant/camera";
import {nearbyExitTargets} from "./exit-targets";
import {surfaceHeight,pickSurface} from "./surfaces";
import {advanceRoute} from "./locomotion";
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
import {project,explorationCamera,type Camera} from "./camera";
import {movePlayer,nearbyAnchors} from "./geometry";
import {paintWorld} from "./painter";
import type {WorldAction} from "./state";
import {nearbyTargets,selectTarget,cycleTarget,type NearbyTarget,type TargetSelection} from "./target-selection";
import {currentPlaceWords,targetWords,placeBadgePaths,worldPlaceName,worldRegionName} from "./target-labels";
import {mandarinUi as ui} from "../language/ui";
import {language} from "../language";
import {createFrameCadence,advanceFrameCadence} from "./frame-cadence";
import {reducedWorldChanged} from "./render-invalidation";
import {visibleLifeReactions} from "./life/render";
import "./world.css";
const directions:Record<string,Point>={ArrowUp:{x:-1,y:-1},w:{x:-1,y:-1},ArrowDown:{x:1,y:1},s:{x:1,y:1},ArrowLeft:{x:-1,y:1},a:{x:-1,y:1},ArrowRight:{x:1,y:-1},d:{x:1,y:-1}};
export default function WorldViewport({state,maps,game,onLookup,onPlay=()=>{},dialogue=null,fresh,onAction,paused=false}:{state:WorldState;maps:MapRegistry;game:GameState;onPlay?:(line:Line)=>void;dialogue?:Line|null;onLookup:(word:Word,trigger:HTMLButtonElement)=>void;fresh:string[];onAction:(action:WorldAction|WorldLifeAction)=>void;paused?:boolean}) {
 const canvas=useRef<HTMLCanvasElement>(null),root=useRef<HTMLElement>(null);
 const latest=useRef({state,maps,game,onAction,paused});latest.current={state,maps,game,onAction,paused};
 const keys=useRef(new Set<string>()),path=useRef<Point[]>([]),cameraRef=useRef<Camera>({focus:state.position,width:960,height:600,scale:22});
 const cue=useRef<HTMLDivElement>(null),targetForFrame=useRef<NearbyTarget|null>(null),visibleTarget=useRef<NearbyTarget|null>(null);
 const activationButton=useRef<HTMLButtonElement>(null),lookupTrigger=useRef<HTMLButtonElement|null>(null),wasPaused=useRef(paused);
 const invocation=useRef<{key:string;fromControl:boolean}|null>(null),previousActivity=useRef(state.activeActivity),pendingActivityFocus=useRef(false);
 const [selection,setSelection]=useState<TargetSelection|null>(null);
 const actorMotion=useRef<{mapId:string;yaw?:number;distanceTravelled:number}>({mapId:state.mapId,distanceTravelled:0});
 const worker=useRef<Worker|null>(null),requestId=useRef(0),workerMap=useRef<object|null>(null);
 const elapsed=useRef(state.life?.elapsedMs??0),lastClockWrite=useRef(state.life?.elapsedMs??0);
 const [clock,setClock]=useState(0);
 const [interactionInset,setInteractionInset]=useState(0);
 const [interactionWidth,setInteractionWidth]=useState(0);
 const [viewport,setViewport]=useState({width:960,height:600});
 const map=maps[state.mapId];
 useEffect(()=>{path.current=[];keys.current.clear();requestId.current++;root.current?.focus();},[state.mapId,state.activeActivity]);
 useEffect(()=>{if(paused){path.current=[];keys.current.clear();requestId.current++;}},[paused]);
 useEffect(()=>{
  const context=document.querySelector<HTMLElement>(".world-context");
  if(!context||!state.activeActivity){setInteractionInset(0);setInteractionWidth(0);return;}
  const observer=new ResizeObserver(()=>{const bounds=context.getBoundingClientRect();setInteractionInset(bounds.height+84);setInteractionWidth(bounds.width+32);});observer.observe(context);
  return()=>observer.disconnect();
 },[state.activeActivity,state.activeAnchorId]);
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
  let frame=0,last=0,elapsedMs=elapsed.current;
  let cadence=createFrameCadence();
  const bounds=element.getBoundingClientRect();
  let inViewport=bounds.bottom>0&&bounds.top<innerHeight&&bounds.right>0&&bounds.left<innerWidth,dirty=true;
  let observed={game:latest.current.game,state:latest.current.state,map:latest.current.maps[latest.current.state.mapId]};
  let reactionSignature="";
  const visible=()=>inViewport&&!document.hidden;
  const tick=(now:number)=>{
   frame=0;if(!visible())return;
   const cadenceStep=advanceFrameCadence(cadence,now);cadence=cadenceStep.state;
   const dt=last?Math.min((now-last)/1000,.04):0;last=now;elapsedMs+=dt*1000;if(Math.floor(elapsedMs/500)!==Math.floor(elapsed.current/500))setClock(elapsedMs);elapsed.current=elapsedMs;
   const current=latest.current,map=current.maps[current.state.mapId];if(!map)return;
   if(actorMotion.current.mapId!==map.id){actorMotion.current={mapId:map.id,distanceTravelled:0};keys.current.clear();path.current=[];}
   if(observed.game!==current.game||observed.state!==current.state||observed.map!==map){
    dirty=dirty||observed.map!==map||(preference.matches&&reducedWorldChanged(observed.game,observed.state,current.game,current.state));
    observed={game:current.game,state:current.state,map};
   }
   if(elapsedMs-lastClockWrite.current>=1000){lastClockWrite.current=elapsedMs;current.onAction({type:"world-clock",elapsedMs});}
   const canMove=!current.paused&&!current.state.activeActivity;
   let moving=false;
   if(canMove){
    let routePosition:Point|null=null;
    let delta={x:0,y:0};for(const key of keys.current){const d=directions[key];if(d){delta.x+=d.x;delta.y+=d.y;}}
    const length=Math.hypot(delta.x,delta.y);
    if(length){path.current=[];requestId.current++;delta={x:delta.x/length*dt*5,y:delta.y/length*dt*5};}
    else if(path.current.length){const next=advanceRoute(map,current.state.position,path.current,dt);path.current=next.remaining;routePosition=next.position;delta={x:next.position.x-current.state.position.x,y:next.position.y-current.state.position.y};}
    if(delta.x||delta.y){const next=routePosition??movePlayer(map,current.state.position,delta);moving=Math.hypot(next.x-current.state.position.x,next.y-current.state.position.y)>.0001;if(moving){actorMotion.current={mapId:map.id,yaw:Math.atan2(next.y-current.state.position.y,next.x-current.state.position.x),distanceTravelled:actorMotion.current.distanceTravelled+Math.hypot(next.x-current.state.position.x,next.y-current.state.position.y)};current.onAction({type:"world-move",position:next});}}
   }
   // A doorway dispatch can commit the new map before this frame finishes.
   if(latest.current.state.mapId!==map.id){frame=requestAnimationFrame(tick);return;}
   const dpr=1,width=Math.ceil(viewport.width/2),height=Math.ceil(viewport.height/2);
   if(element.width!==Math.round(width*dpr)||element.height!==Math.round(height*dpr)){element.width=Math.round(width*dpr);element.height=Math.round(height*dpr);}
   const camera=map.id==="restaurant"?restaurantCamera(map.bounds,current.state.position,width,height,viewport.width<800?interactionInset/2:0,viewport.width>=800?interactionWidth/2:0):explorationCamera(map.bounds,current.state.position,width,height,viewport.width<800?interactionInset/2:0,viewport.width>=800?interactionWidth/2:0,surfaceHeight(map.id,current.state.position));cameraRef.current=camera;
   if(cue.current){
    const target=targetForFrame.current;
    if(target){const point=project(target.position,camera,surfaceHeight(map.id,target.position));cue.current.style.left=`${point.x*viewport.width/width}px`;cue.current.style.top=`${point.y*viewport.height/height}px`;cue.current.hidden=point.x<0||point.y<0||point.x>width||point.y>height;}
    else cue.current.hidden=true;
   }
   if(cadenceStep.draw){
    if(preference.matches){
     const reactions=JSON.stringify(visibleLifeReactions(current.state.life,map.id,elapsedMs));
     dirty=dirty||reactions!==reactionSignature;reactionSignature=reactions;
    }
    // Life routes still move under reduced motion; painting must follow their real positions.
    const liveActors=preference.matches&&actorsFor(map,current.game,current.state,elapsedMs,true).length>0;
    if(!preference.matches||dirty||moving||liveActors){context.setTransform(dpr,0,0,dpr,0,0);paintWorld(context,map,{project:(p,z)=>project(p,camera,z),elapsedMs,reducedMotion:preference.matches,playerPosition:current.state.position,width,height,pass:"ground"},current.state.facing,moving,camera.scale,current.game,current.state,actorMotion.current);element.dataset.rendered="true";dirty=false;}
   }
   frame=requestAnimationFrame(tick);
  };
  const refresh=()=>{last=0;dirty=true;cadence=createFrameCadence();keys.current.clear();if(!visible()){cancelAnimationFrame(frame);frame=0;}else if(!frame)frame=requestAnimationFrame(tick);};
  const observer=new IntersectionObserver(entries=>{inViewport=entries[0].isIntersecting;refresh();});observer.observe(element);
  document.addEventListener("visibilitychange",refresh);preference.addEventListener("change",refresh);if(visible())frame=requestAnimationFrame(tick);
  const up=(event:KeyboardEvent)=>keys.current.delete(event.key);window.addEventListener("keyup",up);window.addEventListener("blur",refresh);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();preference.removeEventListener("change",refresh);document.removeEventListener("visibilitychange",refresh);window.removeEventListener("keyup",up);window.removeEventListener("blur",refresh);};
 },[viewport,interactionInset,interactionWidth]);
 const dictionary=contentWords(content);
 const targets=[...nearbyTargets(map.id,nearbyAnchors(map,state.position),nearbyLife(planFor(map,game),actorsFor(map,game,state,clock,false),state.position,navigationFor(map)),state.position),...nearbyExitTargets(map,state.position,dictionary)];
 const selected=paused&&visibleTarget.current?.mapId===map.id?visibleTarget.current:selectTarget(targets,state.position,selection);
 if(!paused||!visibleTarget.current)visibleTarget.current=selected;
 targetForFrame.current=state.activeActivity?null:selected;
 useEffect(()=>{
  if(paused)return;
  if(selected?.key!==selection?.key)setSelection(selected?{key:selected.key,mode:"automatic"}:null);
 },[paused,selected?.key,selection?.key]);
 useEffect(()=>{
  if(!paused&&wasPaused.current&&lookupTrigger.current&&!lookupTrigger.current.isConnected)(activationButton.current??root.current)?.focus({preventScroll:true});
  wasPaused.current=paused;
 },[paused]);
 useEffect(()=>{
  if(previousActivity.current&&!state.activeActivity)pendingActivityFocus.current=true;
  previousActivity.current=state.activeActivity;
  if(!pendingActivityFocus.current||paused||state.activeActivity)return;
  const frame=requestAnimationFrame(()=>{
   if(latest.current.paused||latest.current.state.activeActivity)return;
   const target=invocation.current;
   if(target?.fromControl&&visibleTarget.current?.key===target.key&&activationButton.current)activationButton.current.focus({preventScroll:true});
   else root.current?.focus({preventScroll:true});
   pendingActivityFocus.current=false;invocation.current=null;
  });
  return()=>cancelAnimationFrame(frame);
 },[state.activeActivity,paused,selected?.key]);
 const wordToken=(word:Word)=><WordToken key={word.id} word={word} look={wordState(game.journal[word.id],fresh.includes(word.id))} onLookup={(word,trigger)=>{lookupTrigger.current=trigger;onLookup(word,trigger);}}/>;
 const label=selected?targetWords(selected,dictionary):[];
 const next=selected?cycleTarget(targets,selected.key,1):null;
 function cycle(direction:-1|1){if(paused||!selected)return;const next=cycleTarget(targets,selected.key,direction);if(next)setSelection({key:next.key,mode:"manual"});}
 function activate(fromControl=false){
  if(paused||state.activeActivity||!selected)return;
  invocation.current={key:selected.key,fromControl};setSelection({key:selected.key,mode:"manual"});
  path.current=[];keys.current.clear();requestId.current++;
  if(selected.source==="anchor")onAction({type:"world-interact",anchorId:selected.anchor.id,now:Date.now()});
  else if(selected.source==="life")onAction({type:"world-life",actionId:selected.affordance.id,elapsedMs:elapsed.current});
  else {worker.current?.postMessage({id:requestId.current,from:state.position,to:selected.position,...(workerMap.current!==map?{map}:{})});workerMap.current=map;}
 }
 function stepPad(key:string){
  const current=latest.current;
  if(current.paused||current.state.activeActivity)return;
  path.current=[];requestId.current++;
  const direction=directions[key],distance=.5/Math.SQRT2;
  const position=movePlayer(current.maps[current.state.mapId],current.state.position,{x:direction.x*distance,y:direction.y*distance});
  const dx=position.x-current.state.position.x,dy=position.y-current.state.position.y;
  if(dx||dy)actorMotion.current={mapId:current.state.mapId,yaw:Math.atan2(dy,dx),distanceTravelled:(actorMotion.current.mapId===current.state.mapId?actorMotion.current.distanceTravelled:0)+Math.hypot(dx,dy)};
  current.onAction({type:"world-move",position});
 }
 return <section ref={root} className="connected-world" data-testid="world-viewport" data-map={map.id} tabIndex={0} aria-label={worldRegionName(map.id)} onKeyDown={event=>{
  if(paused||state.activeActivity)return;
  if(event.key==="Escape"){event.preventDefault();event.stopPropagation();path.current=[];keys.current.clear();requestId.current++;return;}
  if(event.target instanceof HTMLButtonElement||event.ctrlKey||event.altKey||event.metaKey)return;
  if(directions[event.key]){event.preventDefault();event.stopPropagation();keys.current.add(event.key);}
  else if((event.key==="e"||event.key==="Enter")&&selected){event.preventDefault();event.stopPropagation();activate();}
 }} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))keys.current.clear();}}>
  <canvas ref={canvas} aria-hidden="true" onPointerDown={event=>{
   if(paused||state.activeActivity)return;
   root.current?.focus();const rect=event.currentTarget.getBoundingClientRect(),p=pickSurface({x:(event.clientX-rect.left)*cameraRef.current.width/rect.width,y:(event.clientY-rect.top)*cameraRef.current.height/rect.height},cameraRef.current,map);
   if(!p)return;
   const id=++requestId.current;
   worker.current?.postMessage({id,from:state.position,to:p,...(workerMap.current!==map?{map}:{})});workerMap.current=map;
  }}/>
  <div className="world-place" role="group" aria-label={worldPlaceName(map.id)} aria-live="polite"><svg className="world-place-badge" viewBox="0 0 24 24" aria-hidden="true">{placeBadgePaths(map.id).map((path,index)=><path key={index} d={path}/>)}</svg>{currentPlaceWords(map.id,dictionary).map(wordToken)}</div>
  <div ref={cue} className="world-target-cue" data-target-id={selected?.targetId} aria-hidden="true" hidden>
    <svg viewBox="0 0 40 24"><ellipse cx="20" cy="12" rx="17" ry="7"/><ellipse cx="20" cy="12" rx="14" ry="4"/></svg>
  </div>
  {!state.activeActivity&&selected&&<div className="world-target-group" data-selected-target={selected.key} data-target-id={selected.targetId}>
   <span className="world-target-label">{selected.source==="anchor"&&selected.anchor.interactionId.startsWith("table-")&&<span>{selected.anchor.interactionId.split("-")[1]}</span>}{label.map(wordToken)}</span>
   <button ref={activationButton} className="world-target-activate" data-world-anchor={selected.source==="anchor"?selected.anchor.id:undefined} data-world-life={selected.source==="life"?selected.affordance.id:undefined} data-world-exit={selected.source==="exit"?selected.exit.id:undefined}
    disabled={paused} aria-label={selected.source==="anchor"&&selected.anchor.featureId==="restaurant"?(selected.anchor.interactionId.startsWith("table-")?ui.tableOrder(Number(selected.anchor.interactionId.split("-")[1])):ui.kitchen):label.map(word=>word.text).join(language.tokenSeparator)}
    onClick={()=>activate(true)} onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();event.stopPropagation();cycle(event.key==="ArrowLeft"?-1:1);}}}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m10 8 4 4-4 4"/></svg>
   </button>
   {targets.length>1&&<button className="world-target-switch" disabled={paused} aria-label={`${ui.view(next?targetWords(next,dictionary).map(word=>word.text).join(language.tokenSeparator):"")} ${targets.length}`} onClick={()=>cycle(1)}>
    <span aria-hidden="true">↻</span><small aria-hidden="true">{targets.length}</small>
   </button>}
  </div>}
  {dialogue&&<div className="world-life-dialogue"><FeatureLine line={dialogue} onLookup={onLookup} onPlay={onPlay} recoveredWordIds={Object.keys(game.journal).filter(id=>game.journal[id].recovered)} freshWordIds={fresh}/></div>}
  <div className="world-pad" aria-label="走动">{["ArrowUp","ArrowLeft","ArrowDown","ArrowRight"].map((key,i)=><button key={key} aria-label={["向前走","向左走","向后走","向右走"][i]} disabled={paused||!!state.activeActivity} onClick={event=>{if(event.detail===0)stepPad(key);}} onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);keys.current.add(key);}} onPointerUp={()=>keys.current.delete(key)} onPointerCancel={()=>keys.current.delete(key)} onLostPointerCapture={()=>keys.current.delete(key)}>{["↑","←","↓","→"][i]}</button>)}</div>
 </section>;
}
