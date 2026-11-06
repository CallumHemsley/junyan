export const restaurantMap={
 version:1,id:"restaurant",bounds:{width:24,height:22},defaultSpawn:{x:12,y:17,facing:"north"},
 walkable:[{x:1,y:1,width:22,height:20}],
 colliders:[{id:"counter",rect:{x:3,y:2,width:18,height:3}},...[5,17].flatMap(x=>[9,14].map(y=>({id:`table-${x}-${y}`,rect:{x:x-1,y:y-1,width:2,height:2}})))],
 occluders:[],entrances:[{id:"from-town",position:{x:12,y:18},facing:"north"}],
 exits:[{id:"to-town",rect:{x:11,y:20,width:2,height:1},targetMapId:"town",targetEntranceId:"from-restaurant",kind:"door"}],
 anchors:[{id:"restaurant.service",position:{x:12,y:8},radius:2,featureId:"restaurant",interactionId:"service"}],
 terrain:[{id:"floor",rect:{x:1,y:1,width:22,height:20},material:"wood",variant:0}],
 props:[{id:"counter",kind:"counter",position:{x:3,y:2},width:18,height:3,layer:"object",variant:0},...[5,17].flatMap(x=>[9,14].map(y=>({id:`table-${x}-${y}`,kind:"table",position:{x:x-1,y:y-1},width:2,height:2,layer:"object" as const,variant:0}))),{id:"plant",kind:"tree",position:{x:2,y:18},width:1,height:1,layer:"object",variant:0}],
 palette:{wood:[137,104,73],cream:[245,232,202],jade:[111,154,134],ink:[48,43,42]},npcHooks:[],landmarks:[{id:"restaurant.kitchen",position:{x:12,y:6},kind:"kitchen"}]
};
