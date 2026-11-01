import {useEffect, useRef} from 'react';
import {KITCHEN, TABLES, type GameState, type Position} from '../contracts';
import {createRenderer, groundPosition, projectPosition} from './renderer.js';
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
  useEffect(()=>{current.current=state;},[state]);
  useEffect(()=>{
    if (!canvas.current) return;
    const renderer=createRenderer(canvas.current,TABLES,Object.fromEntries(content.orders.map(order => [order.id, characterFor(order.customer).appearance])));
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const player={...current.current.player,yaw:Math.PI/2};
    let frame=0, last=0, lastDraw=-Infinity;
    const draw=(now:number)=>{
      const dt=last?Math.min((now-last)/1000,.05):0;
      last=now;
      const target=current.current.player;
      const dx=target.x-player.x,dy=target.y-player.y;
      const moving=Math.hypot(dx,dy)>.025;
      if(moving) player.yaw=Math.atan2(dy,dx);
      const blend=preference.matches?1:1-Math.exp(-dt*13);
      player.x+=dx*blend; player.y+=dy*blend;
      if(now-lastDraw>=1000/30) {
        renderer.draw(current.current,player,preference.matches?0:now/1000,moving&&!preference.matches);
        lastDraw=now;
      }
      frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(frame);
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
