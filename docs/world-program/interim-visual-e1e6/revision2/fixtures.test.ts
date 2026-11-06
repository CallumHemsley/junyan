import {it,expect} from 'vitest';
import {readFileSync,writeFileSync} from 'node:fs';
import {content} from '../../src/neighbourhood/registry';
import {validateSavedGame} from '../../src/save';
import {mapsForNeighbourhood} from '../../src/world/dynamic';
import {canStand} from '../../src/world/geometry';
import {createWorld} from '../../src/world/state';
import {projectRestaurant} from '../../src/world/art/restaurant/projection';
it('validates revision2 declared nature and separated restaurant setups',()=>{
 const base=JSON.parse(readFileSync('/tmp/e02-visual/ordinary-base.json','utf8'));
 const maps=mapsForNeighbourhood(base.neighbourhood,base.day),specs:any[]=[];
 for(const mapId of ['park','riverbank']){
  const map=maps[mapId];specs.push({id:`${mapId}-default`,mapId,position:{x:map.defaultSpawn.x,y:map.defaultSpawn.y},facing:map.defaultSpawn.facing,subject:`${mapId} default spawn`});
  const entry=map.entrances[0];specs.push({id:`${mapId}-first-entrance`,mapId,position:entry.position,facing:entry.facing,subject:`${mapId} first entrance ${entry.id}`});
 }
 for(const id of ['park.pond-deck','park.orchard-basket']){const landmark=maps.park.landmarks.find(l=>l.id===id)!;specs.push({id:id.replace('.','-'),mapId:'park',position:landmark.position,facing:'north',subject:`existing ${id} declared landmark`});}
 for(const [table,x,y] of [[1,5,6.4],[4,17,11.4]])specs.push({id:`restaurant-table${table}-corrected-player-north`,mapId:'restaurant',position:{x,y},facing:'south',table,subject:`player north of table${table}; actual seated customer fixed south, not rotated`});
 const customers=projectRestaurant(base,content,maps.restaurant).customers;
 const fixtures=specs.map(spec=>{
  expect(canStand(maps[spec.mapId],spec.position),spec.id).toBe(true);
  const game=structuredClone(base);game.world={...createWorld(maps),mapId:spec.mapId,position:spec.position,facing:spec.facing};
  const restored=validateSavedGame(game,content);expect(restored,spec.id).not.toBeNull();expect(restored!.world!.mapId,spec.id).toBe(spec.mapId);expect(restored!.world!.position,spec.id).toEqual(spec.position);
  const separation=spec.table?customers.map(customer=>({customerId:customer.id,position:customer.position,distance:Math.hypot(spec.position.x-customer.position.x,spec.position.y-customer.position.y)})):undefined;
  if(separation)expect(Math.min(...separation.map(row=>row.distance)),spec.id).toBeGreaterThanOrEqual(1);
  return {...spec,customerSeparation:separation,save:restored};
 });
 writeFileSync('audit/revision2/fixtures.json',JSON.stringify({method:'Revision2 validated declared visual/setup fixtures only. NOT ordinary travel or main semantic merge acceptance. Corrected north positions preserve at least1worldunit separation from all fixed south-facing seated customers.',fixtures},null,2)+'\n');
});
