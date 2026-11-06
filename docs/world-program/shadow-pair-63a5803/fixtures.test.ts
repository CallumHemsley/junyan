import {it,expect} from 'vitest';import {writeFileSync,readFileSync} from 'node:fs';
import {reduceGame,orderTotal} from '../src/game';import {content} from '../src/neighbourhood/registry';import {TABLES} from '../src/contracts';import {worldMaps} from '../src/world/registry';import {canStand} from '../src/world/geometry';import {validateSavedGame} from '../src/save';
it('creates validated explicit phase and landmark review fixtures',()=>{
 const base=JSON.parse(readFileSync('/tmp/e02-visual/ordinary-base.json','utf8'));const fixtures=[];
 for(const phase of ['morning','evening'])for(const [mapId,id] of [['park','park.pond-deck'],['riverbank','riverbank.moon-bridge'],['park','park.orchard-basket']]){
  let game=structuredClone(base);if(phase==='evening')for(const table of [1,2,3]){const c=game.customers.find(c=>c.table===table),o=content.orders.find(o=>o.id===c.orderId);game={...game,customers:game.customers.map(c=>c.table===table?{...c,phase:'checkout'}:c),player:{x:TABLES[table-1].x+1.4,y:TABLES[table-1].y}};game=reduceGame(game,{type:'pay',table,change:o.paid-orderTotal(o,content)},content);}
  const map=worldMaps[mapId],landmark=map.landmarks.find(l=>l.id===id);expect(canStand(map,landmark.position)).toBe(true);
  game.world={...game.world,version:1,mapId,position:landmark.position,facing:'north',activeActivity:null,activeAnchorId:null,returnPositions:{}};
  expect(validateSavedGame(game,content)).not.toBeNull();expect(game.served).toBe(phase==='morning'?0:3);fixtures.push({mapId,id,phase,save:game});
 }
 writeFileSync('audit/fixtures.json',JSON.stringify(fixtures,null,2));
});
