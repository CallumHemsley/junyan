import type { WorldMapDefinition } from "./schema";
// IDs survive layout changes because service, receipts and saved activities refer to them.
const tables=[{id:'table-5-9',x:5,y:8},{id:'table-17-9',x:12,y:8},{id:'table-5-14',x:5,y:12},{id:'table-17-14',x:12,y:12}];
const counter={id:'counter',kind:'counter',position:{x:2,y:2},width:14,height:2.4,layer:'object' as const,variant:0};
export const restaurantMap:WorldMapDefinition={
 version:1,id:"restaurant",bounds:{width:18,height:17},defaultSpawn:{x:9,y:14,facing:"north"},
 walkable:[{x:1,y:1,width:16,height:15}],
 colliders:[{id:counter.id,rect:{...counter.position,width:counter.width,height:counter.height}},...tables.map(t=>({id:t.id,rect:{x:t.x-1,y:t.y-1,width:2,height:2}}))],
 occluders:[],entrances:[{id:"from-town",position:{x:9,y:14},facing:"north"}],
 exits:[{id:"to-town",rect:{x:8,y:15,width:2,height:1},targetMapId:"town",targetEntranceId:"from-restaurant",kind:"door"}],
 anchors:[{id:"restaurant.kitchen",position:{x:9,y:5.8},radius:1.8,featureId:"restaurant",interactionId:"kitchen"},...tables.map((t,index)=>({id:`restaurant.table-${index+1}`,position:{x:t.x+1.5,y:t.y},radius:1.5,featureId:"restaurant" as const,interactionId:`table-${index+1}`}))],
 terrain:[{id:"floor",rect:{x:1,y:1,width:16,height:15},material:"wood",variant:0}],
 props:[counter,...tables.map(t=>({id:t.id,kind:"table",position:{x:t.x-1,y:t.y-1},width:2,height:2,layer:"object" as const,variant:0})),{id:"plant",kind:"tree",position:{x:2,y:13},width:1,height:1,layer:"object",variant:0}],
 palette:{wood:[137,104,73],cream:[245,232,202],jade:[111,154,134],ink:[48,43,42]},npcHooks:[],landmarks:[{id:"restaurant.kitchen",position:{x:9,y:5.8},kind:"kitchen"}]
};
