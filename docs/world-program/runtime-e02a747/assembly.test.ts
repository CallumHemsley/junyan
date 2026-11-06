import {it,expect} from 'vitest';
import {writeFileSync} from 'node:fs';
import {advanceRoute} from '../src/world/locomotion';
import {findPath,canStand} from '../src/world/geometry';
import {worldMaps} from '../src/world/registry';
import {compileLife,navigationFor} from '../src/world/life';
import {createGame,reduceGame,orderTotal} from '../src/game';
import {TABLES} from '../src/contracts';
import {content} from '../src/neighbourhood/registry';
import {createWorld} from '../src/world/state';
import {reduceNeighbourhoodGame} from '../src/neighbourhood/transitions';
import {restaurantPresentation} from '../src/world/restaurant-view';
import {lifeContext} from '../src/world/life-bridge';
import {validateSavedGame} from '../src/save';
for(const ms of [16,16.6666666667,20,33.3333333333,40])it(`full original workshop route ${ms}ms`,()=>{
 const map=worldMaps.workshop,target={x:8,y:10.8};let position={x:7.999999306418678,y:6.799999583851207},remaining=findPath(map,position,target);
 expect(remaining.length).toBeGreaterThan(0);
 for(let frame=0;frame<1000&&remaining.length;frame++){const result=advanceRoute(map,position,remaining,ms/1000);expect(result.blocked).toBe(false);expect(canStand(map,result.position)).toBe(true);position=result.position;remaining=result.remaining;}
 expect(remaining).toEqual([]);expect(Math.hypot(position.x-target.x,position.y-target.y)).toBeLessThan(1e-6);
});
it('town contains the single replacement regular route',()=>{const map=worldMaps.town,plan=compileLife(map,navigationFor(map));const regulars=plan.actors.filter(a=>a.characterId==='xiao-li');writeFileSync('audit/town-plan.json',JSON.stringify({actors:plan.actors.map(a=>({id:a.id,characterId:a.characterId,phases:a.phases.length})),diagnostics:plan.diagnostics},null,2));expect(regulars).toHaveLength(1);expect(regulars[0].id).toBe('town.book-window-reader');expect(regulars[0].phases.some(p=>p.action==='walk')).toBe(true);});
it('served acknowledgment survives validated save and keeps meals',()=>{
 let game=createGame(content,42);game={...game,customers:game.customers.map(c=>c.table===1?{...c,phase:'checkout'}:c),player:{x:TABLES[0].x+1.4,y:TABLES[0].y},world:{...createWorld(worldMaps),position:{x:6.5,y:9},activeActivity:'restaurant',activeAnchorId:'restaurant.table-1'}};
 const order=content.orders.find(o=>o.id===game.customers[0].orderId)!;game=reduceGame(game,{type:'pay',table:1,change:order.paid-orderTotal(order,content)},content);expect(game.feedback).toBe('thanks');
 const before=restaurantPresentation(game,worldMaps.restaurant),actor=before.customers.find(c=>c.table===1)!;
 for(const mapId of Object.keys(worldMaps))expect(lifeContext(game,{...game.world!,mapId},0,false).excludedCharacterIds).toContain(actor.characterId);
 game=reduceNeighbourhoodGame(game,{type:'world-close'},content);
 const saved=validateSavedGame(JSON.parse(JSON.stringify(game)),content);expect(saved).not.toBeNull();
 const after=restaurantPresentation(saved!,worldMaps.restaurant);expect(after.customers.some(c=>c.table===1)).toBe(false);expect(after.meals).toEqual(before.meals);expect(saved!.served).toBe(1);
 for(const mapId of Object.keys(worldMaps))expect(lifeContext(saved!,{...saved!.world!,mapId},0,false).excludedCharacterIds).not.toContain(actor.characterId);
});
