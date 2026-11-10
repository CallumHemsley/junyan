import type { WorldMapDefinition } from "./schema";
import colliders from "./pixel/cafe-colliders.json" with { type: "json" };
/**
 * 早安小馆 in the pixel cafe's own space: tile units of `src/pixel/scenes/cafe.ts` (22×14, origin at
 * its top-left, x right, y down the screen). The pixel view draws the scene; this file is the same
 * room for the game rules (walking, paths, anchors, the door), so one coordinate system exists.
 * Colliders are the scene's compiled footprints, written by `node src/pixel/tools/colliders.ts cafe
 * --out src/world/pixel/cafe-colliders.json`; `src/world/pixel/cafe-map.test.ts` keeps all of it in step.
 */
// IDs survive layout changes because service, receipts and saved activities refer to them.
const tables=[
 {id:"table-5-9",at:{x:3.4,y:6},stand:{x:3.4,y:6.5}},
 {id:"table-17-9",at:{x:7.9,y:5.85},stand:{x:9.35,y:5.45}},
 {id:"table-5-14",at:{x:4.2,y:11},stand:{x:4.2,y:11.45}},
 {id:"table-17-14",at:{x:15.2,y:11.5},stand:{x:13.75,y:11.05}},
];
/** The table sprite's footprint: 60×24 art px (32 to a tile), from 30 px left of and 26 px above its anchor, which snaps to the art grid. */
const art=(tiles:number)=>Math.round(tiles*32)/32;
const tableRect=(at:{x:number;y:number})=>({x:art(at.x)-30/32,y:art(at.y)-26/32,width:60/32,height:24/32});
const counter={id:"counter",kind:"counter",position:{x:11,y:3},width:10,height:5,layer:"object" as const,variant:0};
export const restaurantMap:WorldMapDefinition={
 version:1,id:"restaurant",bounds:{width:22,height:14},defaultSpawn:{x:11,y:11.9,facing:"north"},
 walkable:[{x:1,y:3.1,width:20,height:9.9}],
 colliders,
 occluders:[],entrances:[{id:"from-town",position:{x:11,y:11.9},facing:"north"}],
 // The street door, columns 10–11 of the front wall.
 exits:[{id:"to-town",rect:{x:10.25,y:12.5,width:1.5,height:.5},targetMapId:"town",targetEntranceId:"from-restaurant",kind:"door"}],
 // The kitchen pass is the cafe's `pickup` mark, on the dining side of the long counter.
 anchors:[{id:"restaurant.kitchen",position:{x:15.5,y:8.5},radius:1.8,featureId:"restaurant",interactionId:"kitchen"},...tables.map((t,index)=>({id:`restaurant.table-${index+1}`,position:t.stand,radius:1.5,featureId:"restaurant" as const,interactionId:`table-${index+1}`}))],
 terrain:[{id:"floor",rect:{x:1,y:3,width:20,height:10},material:"wood",variant:0}],
 props:[counter,...tables.map(t=>{const rect=tableRect(t.at);return {id:t.id,kind:"table",position:{x:rect.x,y:rect.y},width:rect.width,height:rect.height,layer:"object" as const,variant:0};})],
 palette:{wood:[137,104,73],cream:[245,232,202],jade:[111,154,134],ink:[48,43,42]},npcHooks:[],landmarks:[{id:"restaurant.kitchen",position:{x:15.5,y:8.5},kind:"kitchen"}]
};
