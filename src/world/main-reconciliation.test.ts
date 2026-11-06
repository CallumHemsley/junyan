import {it,expect} from 'vitest';
import type {GameState} from '../contracts';
import {content} from '../neighbourhood/registry';
import {createGame,getOrder,orderTotal,reduceGame} from '../game';
import {reduceNeighbourhoodGame} from '../neighbourhood/transitions';
import {validateSavedGame} from '../save';
import {createWorld} from './state';
import {worldMaps} from './registry';
import {mapsForNeighbourhood} from './dynamic';
function earned():GameState{
 const game=createGame(content,42),earnings=game.customers.reduce((sum,c)=>sum+orderTotal(getOrder(game,c.table,content)!,content),0);
 return {...game,customers:game.customers.map(c=>({...c,phase:'served'})),served:4,ended:true,earnings};
}
it('preserves main next-day progression/order semantics and the independent world clock/return history',()=>{
 const game={...earned(),world:{...createWorld(worldMaps),returnPositions:{town:{x:10,y:10,facing:'south' as const}},life:{...createWorld(worldMaps).life!,elapsedMs:123456}}};
 const next=reduceNeighbourhoodGame(game,{type:'advance-world-day',now:9e9},content),expected=reduceGame(game,{type:'next-day',now:9e9},content);
 expect(next.customers).toEqual(expected.customers);expect(next.progression).toEqual(expected.progression);expect(next.earnings).toBe(expected.earnings);expect(next.day).toBe(2);
 expect(next.world?.life?.elapsedMs).toBe(123456);expect(next.world?.returnPositions).toEqual(game.world.returnPositions);
});
it('prepares optional invitations without teleporting an existing world player or awarding learning',()=>{
 const game={...earned(),world:createWorld(worldMaps)},next=reduceNeighbourhoodGame(game,{type:'follow-scenario',id:'repairs.lamp'},content);
 expect(next.world).toBe(game.world);expect(next.neighbourhood?.location).toBe(game.neighbourhood?.location);expect(next.neighbourhood?.repairs.active).toBe('lamp');expect(next.neighbourhood?.repairs.jobs.lamp).toBeTruthy();expect(next.journal).toBe(game.journal);expect(next.progression).toBe(game.progression);
});
it('rejects a remote purchase even when legacy location still says apartment',()=>{
 const base=earned(),game={...base,neighbourhood:{...base.neighbourhood!,location:'apartment' as const},world:{...createWorld(worldMaps),mapId:'town',position:worldMaps.town.defaultSpawn}};
 expect(reduceNeighbourhoodGame(game,{type:'purchase-furniture',id:'blue-vase'},content)).toBe(game);
});
it('keeps paid ownership, debit, placement collision and learning through corrupt world migration/reload',()=>{
 const base=earned();let game:GameState={...base,neighbourhood:{...base.neighbourhood!,location:'apartment'},world:{...createWorld(worldMaps,'apartment'),position:worldMaps.apartment.anchors[0].position}};
 game=reduceNeighbourhoodGame(game,{type:'purchase-furniture',id:'blue-vase'},content);
 const spent=game.progression!.spent;expect(spent).toBe(8);
 game=reduceNeighbourhoodGame(game,{type:'feature-action',feature:'apartment',action:{type:'select',id:'blue-vase'},now:100},content);
 game=reduceNeighbourhoodGame(game,{type:'feature-action',feature:'apartment',action:{type:'place',x:2,y:1},now:101},content);
 expect(game.neighbourhood?.apartment.placements.some(p=>p.id==='blue-vase')).toBe(true);
 const restored=validateSavedGame({...game,world:{version:999}},content)!;
 expect(restored).not.toBeNull();expect(restored.progression).toEqual(game.progression);expect(restored.journal).toEqual(game.journal);expect(restored.neighbourhood?.apartment.owned).toContain('blue-vase');expect(restored.world?.mapId).toBe('apartment');
 expect(mapsForNeighbourhood(restored.neighbourhood!).apartment.colliders.some(c=>c.id==='apartment.furniture.blue-vase')).toBe(true);
 expect(reduceNeighbourhoodGame(restored,{type:'purchase-furniture',id:'blue-vase'},content)).toBe(restored);
 expect(restored.progression?.spent).toBe(spent);
});
