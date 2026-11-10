import type { WorldMapDefinition } from "./schema";
/**
 * 早安小馆 in the pixel cafe's own space: tile units of `src/pixel/scenes/cafe.ts` (22×14, origin at
 * its top-left, x right, y down the screen). The pixel view draws the scene; this file is the same
 * room for the game rules (walking, paths, anchors, the door), so one coordinate system exists.
 * Colliders are the scene's compiled footprints; `src/world/pixel/cafe-map.test.ts` keeps them in step.
 */
// IDs survive layout changes because service, receipts and saved activities refer to them.
const tables=[
 {id:"table-5-9",at:{x:3.4,y:6},stand:{x:3.4,y:6.5}},
 {id:"table-17-9",at:{x:7.9,y:6.3},stand:{x:9.35,y:5.9}},
 {id:"table-5-14",at:{x:4.2,y:11},stand:{x:4.2,y:11.45}},
 {id:"table-17-14",at:{x:15.2,y:11.5},stand:{x:13.75,y:11.05}},
];
/** The table sprite's footprint: 60×24 art px (32 to a tile), from 30 px left of and 26 px above its anchor, which snaps to the art grid. */
const art=(tiles:number)=>Math.round(tiles*32)/32;
const tableRect=(at:{x:number;y:number})=>({x:art(at.x)-30/32,y:art(at.y)-26/32,width:60/32,height:24/32});
type Footprint=[id:string,x:number,y:number,width:number,height:number];
const footprints:Footprint[]=[
 ["stool.1a",1.6875,5.46875,.625,.34375],["stool.1b",4.5,5.5,.625,.3125],
 ["stool.2a",7.59375,4.59375,.625,.3125],["stool.2b",7.59375,7,.625,.3125],
 ["stool.3a",2.5,10.5,.625,.3125],["stool.3b",5.28125,10.5,.625,.3125],
 ["stool.4a",14.875,9.78125,.625,.34375],["stool.4b",14.875,12.21875,.625,.3125],
 ["plant-rubber",1.28125,3.5625,.75,.1875],["plant-bamboo",10.125,7.90625,.625,.1875],
 ["plant-snake",1.25,12.5625,.6875,.1875],["plant-money-tree",19.9375,12.5625,.75,.1875],
 ["broom",1.125,8.28125,.625,.125],["crate-bottles",19.90625,9.1875,.9375,.375],["boxes",18.71875,9.375,.9375,.375],
 ["sideboard",4.28125,3.15625,1.9375,.40625],["water-dispenser",8.8125,3.34375,.6875,.25],
 ["coat-rack",1.375,10.28125,.375,.125],["umbrella-stand",13.0625,12.6875,.5,.15625],["umbrella-wet",13.71875,12.78125,.25,.0625],
 ["kitchen.stove",12.03125,3.09375,1.9375,.875],["kitchen.wok",14.03125,3.15625,1.9375,.8125],["kitchen.soymilk",16.125,3.59375,1.0625,.375],
 ["kitchen.sink",17.34375,3.21875,1.9375,.75],["kitchen.fridge",19.4375,3.46875,1.125,.4375],
 ["kitchen.flour",12.125,5.8125,1,.3125],["kitchen.crate",19.90625,5.8125,.9375,.3125],
 // The L-shaped counter: its leg down column 11, then the long run along row 7. It seals the kitchen.
 ...[3,4,5,6].map((y):Footprint=>[`counter.leg-${y}`,11,y,1,1]),
 ...[11,12,13,14,15,16,17,18,19,20].map((x):Footprint=>[`counter.run-${x}`,x,7,1,1]),
];
const counter={id:"counter",kind:"counter",position:{x:11,y:3},width:10,height:5,layer:"object" as const,variant:0};
export const restaurantMap:WorldMapDefinition={
 version:1,id:"restaurant",bounds:{width:22,height:14},defaultSpawn:{x:11,y:11.9,facing:"north"},
 walkable:[{x:1,y:3.1,width:20,height:9.9}],
 colliders:[...tables.map(t=>({id:t.id,rect:tableRect(t.at)})),...footprints.map(([id,x,y,width,height])=>({id,rect:{x,y,width,height}}))],
 occluders:[],entrances:[{id:"from-town",position:{x:11,y:11.9},facing:"north"}],
 // The street door, columns 10–11 of the front wall.
 exits:[{id:"to-town",rect:{x:10.25,y:12.5,width:1.5,height:.5},targetMapId:"town",targetEntranceId:"from-restaurant",kind:"door"}],
 // The kitchen pass is the cafe's `pickup` mark, on the dining side of the long counter.
 anchors:[{id:"restaurant.kitchen",position:{x:15.5,y:8.5},radius:1.8,featureId:"restaurant",interactionId:"kitchen"},...tables.map((t,index)=>({id:`restaurant.table-${index+1}`,position:t.stand,radius:1.5,featureId:"restaurant" as const,interactionId:`table-${index+1}`}))],
 terrain:[{id:"floor",rect:{x:1,y:3,width:20,height:10},material:"wood",variant:0}],
 props:[counter,...tables.map(t=>{const rect=tableRect(t.at);return {id:t.id,kind:"table",position:{x:rect.x,y:rect.y},width:rect.width,height:rect.height,layer:"object" as const,variant:0};})],
 palette:{wood:[137,104,73],cream:[245,232,202],jade:[111,154,134],ink:[48,43,42]},npcHooks:[],landmarks:[{id:"restaurant.kitchen",position:{x:15.5,y:8.5},kind:"kitchen"}]
};
