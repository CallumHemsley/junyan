import {it,expect} from 'vitest';
import {restaurantMap} from './restaurant';
import {isExitConnected,safeExitPosition} from './exit-safety';
import {safeAfterEdit} from './dynamic';
import {restoreWorld,createWorld} from './state';
const before={...restaurantMap,id:'edit-room',bounds:{width:10,height:8},defaultSpawn:{x:1,y:4,facing:'east' as const},walkable:[{x:0,y:0,width:10,height:8}],colliders:[],anchors:[],exits:[{id:'out',rect:{x:.5,y:3,width:1,height:2},kind:'door' as const,targetMapId:'outside',targetEntranceId:'in'}]};
const after={...before,colliders:[{id:'new-wall',rect:{x:5,y:0,width:.5,height:8}}]};
it('retains valid connected feet but recovers a standable newly isolated player to the exit component',()=>{
 const p={x:8,y:4};expect(isExitConnected(before,p)).toBe(true);expect(isExitConnected(after,p)).toBe(false);
 const recovered=safeAfterEdit(before,after,p);expect(recovered!.x).toBeLessThan(5);expect(isExitConnected(after,recovered!)).toBe(true);
 expect(safeExitPosition(after,{x:2.1,y:4.1})).toEqual({x:2.1,y:4.1});
});
it('recovers embedded positions deterministically, and undo retains the recovered position',()=>{
 const p={x:5.25,y:4},a=safeExitPosition(after,p);expect(isExitConnected(after,a!)).toBe(true);expect(safeExitPosition(after,p)).toEqual(a);expect(safeAfterEdit(after,before,a!)).toEqual(a);
});
it('restores current and return positions against exit connectivity without losing unrelated world life',()=>{
 const world={...createWorld({restaurant:restaurantMap}),mapId:after.id,position:{x:8,y:4},returnPositions:{[after.id]:{x:8,y:4,facing:'west'}},life:{...createWorld({restaurant:restaurantMap}).life!,elapsedMs:1234}};
 const restored=restoreWorld(world,{[after.id]:after,restaurant:restaurantMap});expect(isExitConnected(after,restored.position)).toBe(true);expect(restored.returnPositions[after.id]).toBeUndefined();expect(restored.life?.elapsedMs).toBe(1234);
});
it('returns a total rejection when every exit support is blocked and restores to the safe restaurant',()=>{
 const blocked={...before,colliders:[{id:'blocked-exit',rect:{x:0,y:2,width:3,height:4}}]},p={x:8,y:4};
 expect(safeAfterEdit(before,blocked,p)).toBeNull();
 const original={...createWorld({restaurant:restaurantMap}),mapId:blocked.id,position:p,life:{...createWorld({restaurant:restaurantMap}).life!,elapsedMs:4567}};
 const restored=restoreWorld(original,{restaurant:restaurantMap,[blocked.id]:blocked});
 expect(restored.mapId).toBe('restaurant');expect(isExitConnected(restaurantMap,restored.position)).toBe(true);expect(restored.life?.elapsedMs).toBe(4567);
});
it('rolls the entire feature edit back when its projected geometry has no usable exit',async()=>{
 const {vi}=await import('vitest'),dynamic=await import('./dynamic'),{createGame}=await import('../game'),{content}=await import('../neighbourhood/registry'),{reduceNeighbourhoodGame}=await import('../neighbourhood/transitions');
 const blocked={...before,colliders:[{id:'blocked-exit',rect:{x:0,y:2,width:3,height:4}}]};
 const game={...createGame(content,42),world:{...createWorld({restaurant:restaurantMap}),mapId:before.id,position:{x:8,y:4}}};
 // Deliberately impossible geometry projection, not a claim of a legal UI layout.
 const spy=vi.spyOn(dynamic,'mapsForNeighbourhood').mockImplementation(n=>({restaurant:restaurantMap,[before.id]:n.apartment.starterClaimed?blocked:before}));
 try{expect(reduceNeighbourhoodGame(game,{type:'feature-action',feature:'apartment',action:{type:'accept-starter'},now:1000},content)).toBe(game);}finally{spy.mockRestore();}
});
