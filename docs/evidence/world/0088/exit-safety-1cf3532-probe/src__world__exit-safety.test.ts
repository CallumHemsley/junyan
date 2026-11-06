import {it,expect} from 'vitest';
import {restaurantMap} from './restaurant';
import {isExitConnected,safeExitPosition} from './exit-safety';
import {safeAfterEdit} from './dynamic';
import {restoreWorld,createWorld} from './state';
const before={...restaurantMap,id:'edit-room',bounds:{width:10,height:8},defaultSpawn:{x:1,y:4,facing:'east' as const},walkable:[{x:0,y:0,width:10,height:8}],colliders:[],anchors:[],exits:[{id:'out',rect:{x:.5,y:3,width:1,height:2},kind:'door' as const,targetMapId:'outside',targetEntranceId:'in'}]};
const after={...before,colliders:[{id:'new-wall',rect:{x:5,y:0,width:.5,height:8}}]};
it('retains valid connected feet but recovers a standable newly isolated player to the exit component',()=>{
 const p={x:8,y:4};expect(isExitConnected(before,p)).toBe(true);expect(isExitConnected(after,p)).toBe(false);
 const recovered=safeAfterEdit(before,after,p);expect(recovered.x).toBeLessThan(5);expect(isExitConnected(after,recovered)).toBe(true);
 expect(safeExitPosition(after,{x:2.1,y:4.1})).toEqual({x:2.1,y:4.1});
});
it('recovers embedded positions deterministically, and undo retains the recovered position',()=>{
 const p={x:5.25,y:4},a=safeExitPosition(after,p);expect(isExitConnected(after,a)).toBe(true);expect(safeExitPosition(after,p)).toEqual(a);expect(safeAfterEdit(after,before,a)).toEqual(a);
});
it('restores current and return positions against exit connectivity without losing unrelated world life',()=>{
 const world={...createWorld({restaurant:restaurantMap}),mapId:after.id,position:{x:8,y:4},returnPositions:{[after.id]:{x:8,y:4,facing:'west'}},life:{...createWorld({restaurant:restaurantMap}).life!,elapsedMs:1234}};
 const restored=restoreWorld(world,{[after.id]:after,restaurant:restaurantMap});expect(isExitConnected(after,restored.position)).toBe(true);expect(restored.returnPositions[after.id]).toBeUndefined();expect(restored.life?.elapsedMs).toBe(1234);
});
