import { useEffect, useRef } from 'react';
import { createRenderer, groundPosition } from '../../scene/renderer.js';
import { apartmentScene, floorOrigin } from './scene-data';
import type { State } from './rules';
import { featureUi } from '../copy';
const copy = featureUi.apartment;
export default function Scene({state,onPreview,onConfirm}:{state:State;onPreview:(x:number,y:number)=>void;onConfirm:()=>void}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const current=useRef(state);
  const renderer=useRef<ReturnType<typeof createRenderer<[State]>>|null>(null);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>{
      if(canvas.current) { renderer.current=createRenderer(canvas.current,apartmentScene());renderer.current.draw(current.current);canvas.current.dataset.rendered='true'; }
    });
    return ()=>{cancelAnimationFrame(frame);renderer.current=null;};
  },[]);
  useEffect(()=>{
    current.current=state;
    const frame=requestAnimationFrame(()=>renderer.current?.draw(state));
    return ()=>cancelAnimationFrame(frame);
  },[state]);
  return <div className="apartment-scene">
    <canvas ref={canvas} width={360} height={280} role="img" aria-label={copy.scene}/>
    {state.selected && <button type="button" className="apartment-floor-target" aria-label={copy.floorHelp} onClick={event=>{
      if(event.detail===0) return;
      const rect=event.currentTarget.getBoundingClientRect();
      const position=groundPosition((event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100);
      onPreview(Math.floor((position.x-6-floorOrigin.x)/1.75),Math.floor((position.y-5-floorOrigin.y)/1.75));
    }} onKeyDown={event=>{
      if(!state.draft) return;
      const direction:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      if(direction[event.key]) {event.preventDefault();const [dx,dy]=direction[event.key];onPreview(Math.max(0,Math.min(5,state.draft.x+dx)),Math.max(0,Math.min(4,state.draft.y+dy)));}
      else if(event.key==='Enter' || event.key===' ') {event.preventDefault();onConfirm();}
    }}/>}<span className="apartment-window-label">{copy.window}</span><span className="apartment-door-label">{copy.door}</span><span className="apartment-resident-label">{copy.resident}</span>
  </div>;
}
