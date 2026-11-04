import {useEffect, useRef} from 'react';
import {createRenderer} from './renderer.js';
import {wardScene, type WardFrame} from './ward.js';
import './scene.css';

export default function WardScene({frame}:{frame:WardFrame}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef(frame);
  const invalidate = useRef<() => void>(() => {});
  useEffect(()=>{current.current=frame; invalidate.current();},[frame]);
  useEffect(()=>{
    if (!canvas.current) return;
    const renderer=createRenderer(canvas.current,wardScene);
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    let frameId=0, lastDraw=-Infinity, dirty=true;
    const bounds=canvas.current.getBoundingClientRect();
    let inViewport=bounds.bottom>0 && bounds.top<innerHeight && bounds.right>0 && bounds.left<innerWidth;
    const visible=()=>inViewport && !document.hidden;
    const schedule=()=>{
      if(!frameId && visible() && (dirty || !preference.matches)) frameId=requestAnimationFrame(draw);
    };
    const draw=(now:number)=>{
      frameId=0;
      if(!visible()) return;
      if(preference.matches || now-lastDraw>=1000/30) {
        renderer.draw(current.current,preference.matches?0:now/1000);
        lastDraw=now;
        dirty=false;
      }
      schedule();
    };
    const refresh=()=>{
      dirty=true;
      lastDraw=-Infinity;
      if(!visible()) {
        cancelAnimationFrame(frameId);
        frameId=0;
      }
      schedule();
    };
    const observer=new IntersectionObserver(entries=>{
      inViewport=entries[0].isIntersecting;
      refresh();
    });
    observer.observe(canvas.current);
    preference.addEventListener('change',refresh);
    document.addEventListener('visibilitychange',refresh);
    invalidate.current=()=>{dirty=true; schedule();};
    schedule();
    return ()=>{
      cancelAnimationFrame(frameId);
      observer.disconnect();
      preference.removeEventListener('change',refresh);
      document.removeEventListener('visibilitychange',refresh);
      invalidate.current=()=>{};
    };
  },[]);
  return <div className="restaurant-scene ward-scene" data-testid="ward-scene">
    <canvas ref={canvas} width={360} height={280} aria-hidden="true"/>
  </div>;
}
