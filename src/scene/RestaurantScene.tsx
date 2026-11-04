import {useEffect, useRef} from 'react';
import {KITCHEN, TABLES, type GameState, type Position} from '../contracts';
import {createRenderer, groundPosition, projectPosition} from './renderer.js';
import {restaurantScene} from './restaurant-scene.js';
import './scene.css';
import {characterFor, content} from '../content';

export {projectPosition} from './renderer.js';
export type RestaurantSceneProps = {
  state: GameState;
  onMove: (position:Position)=>void;
  onTable: (table:number)=>void;
  onKitchen: ()=>void;
};

export default function RestaurantScene({state,onMove,onTable,onKitchen}:RestaurantSceneProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef(state);
  const invalidate = useRef<() => void>(() => {});
  useEffect(()=>{current.current=state; invalidate.current();},[state]);
  useEffect(()=>{
    let stop=()=>{}, timer=0;
    // The bake is the heaviest synchronous work on screen; give the surrounding UI a painted frame first.
    const pending=requestAnimationFrame(()=>{timer=window.setTimeout(()=>{stop=start();});});
    const start=()=>{
      if (!canvas.current) return ()=>{};
      const renderer=createRenderer(canvas.current,restaurantScene(TABLES,Object.fromEntries(content.orders.map(order => [order.id, characterFor(order.customer).appearance]))));
      const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
      const player={...current.current.player,yaw:Math.PI/2};
      let frame=0, last=0, lastDraw=-Infinity, dirty=true;
      const bounds=canvas.current.getBoundingClientRect();
      let inViewport=bounds.bottom>0 && bounds.top<innerHeight && bounds.right>0 && bounds.left<innerWidth;
      const visible=()=>inViewport && !document.hidden;
      const schedule=()=>{
        if(!frame && visible() && (dirty || !preference.matches)) frame=requestAnimationFrame(draw);
      };
      const draw=(now:number)=>{
        frame=0;
        if(!visible()) return;
        const dt=last?Math.min((now-last)/1000,.05):0;
        last=now;
        const target=current.current.player;
        const dx=target.x-player.x,dy=target.y-player.y;
        const moving=Math.hypot(dx,dy)>.025;
        if(moving) player.yaw=Math.atan2(dy,dx);
        const blend=preference.matches?1:1-Math.exp(-dt*13);
        player.x+=dx*blend; player.y+=dy*blend;
        if(preference.matches || now-lastDraw>=1000/30) {
          renderer.draw(current.current,player,preference.matches?0:now/1000,moving&&!preference.matches);
          lastDraw=now;
          dirty=false;
        }
        schedule();
      };
      const refresh=()=>{
        dirty=true;
        last=0;
        lastDraw=-Infinity;
        if(!visible()) {
          cancelAnimationFrame(frame);
          frame=0;
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
        cancelAnimationFrame(frame);
        observer.disconnect();
        preference.removeEventListener('change',refresh);
        document.removeEventListener('visibilitychange',refresh);
        invalidate.current=()=>{};
      };
    };
    return ()=>{cancelAnimationFrame(pending); clearTimeout(timer); stop();};
  },[]);
  return <div className="restaurant-scene" data-testid="restaurant-scene">
    <canvas ref={canvas} width={360} height={280} aria-hidden="true"
      onClick={event=>{
        const rect=event.currentTarget.getBoundingClientRect();
        onMove(groundPosition((event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100));
      }}/>
    {TABLES.map(table=>{
      const customer=state.customers.find(c=>c.table===table.table);
      return <button key={table.table} type="button"
        className="scene-target scene-table" style={percentPosition(table,1.3)}
        data-testid={`table-${table.table}`} data-phase={customer?.phase ?? 'empty'}
        aria-pressed={state.activeTable===table.table} onClick={()=>onTable(table.table)}>
        <span>{table.table}桌</span><i aria-hidden="true"/>
      </button>;
    })}
    <button type="button" className="scene-target scene-kitchen" style={percentPosition(KITCHEN,1.8)}
      data-testid="kitchen" onClick={onKitchen}>取餐</button>
  </div>;
}
function percentPosition(position:Position,z=0) {
  const {left,top}=projectPosition(position,z);
  return {left:`${left}%`,top:`${top}%`};
}
