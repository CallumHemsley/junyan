import {it,expect} from "vitest";
import {createGame} from "../game";
import {content} from "../neighbourhood/registry";
import {createWorld} from "./state";
import {worldMaps} from "./registry";
import {restaurantPresence} from "./presence";
import {restaurantPresentation} from "./restaurant-view";
import {lifeContext} from "./life-bridge";
import {reduceNeighbourhoodGame} from "../neighbourhood/transitions";
it("keeps a served customer for the reaction, then releases the same resident after leaving the receipt",()=>{
 let game=createGame(content,42);game={...game,customers:game.customers.map(c=>c.table===1?{...c,phase:"served"}:c),served:1,world:{...createWorld(worldMaps),position:worldMaps.restaurant.anchors.find(anchor=>anchor.id==="restaurant.table-1")!.position,activeActivity:"restaurant",activeAnchorId:"restaurant.table-1"}};
 const actor=restaurantPresence(game).find(p=>p.table===1)!;
 expect(restaurantPresentation(game,worldMaps.restaurant).customers.some(c=>c.table===1)).toBe(true);
 expect(lifeContext(game,{...game.world!,mapId:"town"},0,false).excludedCharacterIds).toContain(actor.characterId);
 game=reduceNeighbourhoodGame(game,{type:"world-close"},content);
 expect(restaurantPresentation(game,worldMaps.restaurant).customers.some(c=>c.table===1)).toBe(false);
 expect(lifeContext(game,{...game.world!,mapId:"town"},0,false).excludedCharacterIds).not.toContain(actor.characterId);
 expect(game.customers.find(c=>c.table===1)?.phase).toBe("served");expect(game.served).toBe(1);
});
