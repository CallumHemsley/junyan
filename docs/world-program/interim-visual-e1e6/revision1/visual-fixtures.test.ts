import {it,expect} from 'vitest';
import {readFileSync,writeFileSync} from 'node:fs';
import {content} from '../src/neighbourhood/registry';
import {validateSavedGame} from '../src/save';
import {mapsForNeighbourhood} from '../src/world/dynamic';
import {canStand} from '../src/world/geometry';
import {createWorld} from '../src/world/state';
import {furnitureWorldRect} from '../src/features/apartment/world';
it('validates declared actual-App camera and prop visual setups',()=>{
 const base=JSON.parse(readFileSync('/tmp/e02-visual/ordinary-base.json','utf8'));
 const maps=mapsForNeighbourhood(base.neighbourhood,base.day),specs:any[]=[];
 for(const [table,x,y] of [[1,5,9],[4,17,14]])for(const [view,dx,dy,facing] of [['north',0,-1.6,'south'],['east',1.6,0,'west'],['south',0,1.6,'north']])specs.push({id:`table${table}-player-${view}`,mapId:'restaurant',position:{x:Number(x)+Number(dx),y:Number(y)+Number(dy)},facing,subject:`table ${table} and actual fixed south-facing seated customer; player ${view}`,table});
 specs.push({id:'kitchen',mapId:'restaurant',position:{x:12,y:6.5},facing:'north',subject:'kitchen and tray',activity:'restaurant',anchor:'restaurant.kitchen',tray:['bun','milk']});
 specs.push({id:'restaurant-chair-table',mapId:'restaurant',position:{x:7,y:10.8},facing:'north',subject:'restaurant chair and table physical reference'});
 specs.push({id:'town-residence-door',mapId:'town',position:{x:11.5,y:23.5},facing:'north',subject:'town residence door physical reference'});
 specs.push({id:'workshop-bench',mapId:'workshop',position:{x:8,y:11},facing:'north',subject:'workshop lamp bench physical reference; active light selector not consumed by base painter'});
 const bed=base.neighbourhood.apartment.placements.find((p:any)=>p.id==='bed'),bedRect=furnitureWorldRect(bed,base.neighbourhood.apartment.rugSize);
 specs.push({id:'apartment-starter-bed',mapId:'apartment',position:{x:bedRect.x+bedRect.width+1,y:bedRect.y+bedRect.height/2},facing:'west',subject:'dynamic starter bed physical reference',bedRect});
 specs.push({id:'stair-mid',mapId:'residential-stairs',position:{x:5.5,y:28},facing:'north',subject:'actual authored lower tread midpoint'});
 specs.push({id:'stair-home-landing',mapId:'residential-stairs',position:{x:12,y:21.5},facing:'east',subject:'authored home landing'});
 specs.push({id:'roof-arrival',mapId:'rooftop',position:{x:12.5,y:29},facing:'east',subject:'rooftop arrival'});
 specs.push({id:'courtyard-laundry',mapId:'courtyard',position:{x:32.5,y:10.8},facing:'north',subject:'courtyard laundry sorting approach'});
 const fixtures=specs.map(spec=>{
  const map=maps[spec.mapId];expect(map,spec.id).toBeDefined();expect(canStand(map,spec.position),spec.id).toBe(true);
  const game=structuredClone(base);
  if(spec.tray){game.tray=spec.tray;game.customers[0].phase='ordered';game.player={x:6,y:2.3};}
  game.world={...createWorld(maps),mapId:spec.mapId,position:spec.position,facing:spec.facing,activeActivity:spec.activity??null,activeAnchorId:spec.anchor??null};
  const validated=validateSavedGame(game,content);expect(validated,spec.id).not.toBeNull();expect(validated!.world!.mapId,spec.id).toBe(spec.mapId);expect(validated!.world!.position,spec.id).toEqual(spec.position);expect(validated!.tray,spec.id).toEqual(game.tray);
  return {...spec,save:validated};
 });
 writeFileSync('audit/visual-fixtures.json',JSON.stringify({method:'Declared valid visual/setup fixtures only. NOT ordinary travel, progression or main semantic merge proof. Customers fixed south; names specify player viewpoint.',fixtures},null,2)+'\n');
});
