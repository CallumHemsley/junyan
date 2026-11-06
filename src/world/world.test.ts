import { describe,it,expect } from "vitest";
import { restaurantMap } from "./restaurant";
import { canStand,canWalk,findPath,movePlayer } from "./geometry";
import { project,unproject,pointerGround } from "./camera";
import { createWorld,restoreWorld,reduceWorld } from "./state";
import type {WorldMapDefinition} from "./schema";
const map:WorldMapDefinition={...restaurantMap,id:"test",bounds:{width:80,height:60},defaultSpawn:{x:2,y:2,facing:"south"},walkable:[{x:0,y:0,width:80,height:60}],colliders:[{id:"wall",rect:{x:10,y:0,width:.2,height:45}}],exits:[],anchors:[]};
describe("world locomotion",()=>{
 it("walks beyond restaurant bounds and routes around solids",()=>{
  expect(canStand(map,{x:60,y:50})).toBe(true);
  expect(canWalk(map,{x:2,y:2},{x:20,y:2})).toBe(false);
  const path=findPath(map,{x:2,y:2},{x:20,y:2});expect(path.length).toBeGreaterThan(1);
  let p={x:2,y:2};for(const next of path){expect(canWalk(map,p,next)).toBe(true);p=next;}
  expect(p).toEqual({x:20,y:2});
 });
 it("sweeps a footprint instead of tunnelling or cutting corners",()=>{
  expect(movePlayer(map,{x:9,y:2},{x:20,y:0}).x).toBeLessThan(9.79);
  expect(canStand(map,{x:9.9,y:2})).toBe(false);
  expect(canStand(map,{x:NaN,y:2})).toBe(false);
 });
 it("rejects uncovered strips within the footprint and nonfinite segments",()=>{
  const strip={...map,colliders:[],walkable:[{x:0,y:0,width:10,height:60},{x:10.1,y:0,width:69.9,height:60}]};
  expect(canStand(strip,{x:10.05,y:3})).toBe(false);
  expect(canWalk(map,{x:2,y:2},{x:NaN,y:3})).toBe(false);
 });
 it("round trips moved cameras and CSS-scaled pointer edges",()=>{
  for(const focus of [{x:0,y:0},{x:53,y:29}])for(const width of [390,1280]) {
   const camera={focus,width,height:700,scale:24};
   for(const p of [{x:0,y:0},{x:width,y:700},{x:width/2,y:350}]) {
    const ground=unproject(p,camera),again=project(ground,camera);
    expect(again.x).toBeCloseTo(p.x);expect(again.y).toBeCloseTo(p.y);
    expect(pointerGround({x:p.x/2+11,y:p.y/2+19},{left:11,top:19,width:width/2,height:350},camera)).toEqual(ground);
   }
  }
 });
 it("migrates corrupt world state without unrelated save resets",()=>{
  const maps={restaurant:restaurantMap,test:map};
  expect(restoreWorld({version:88},maps)).toEqual(createWorld(maps));
  const old={...createWorld(maps),position:{x:NaN,y:0}};
  expect(restoreWorld(old,maps).position).toEqual(createWorld(maps).position);
 });
 it("enters a paired door and cannot bounce on its safe arrival",()=>{
  const a={...map,id:"a",exits:[{id:"to-b",rect:{x:3,y:2,width:1,height:1},targetMapId:"b",targetEntranceId:"from-a",kind:"door" as const}]};
  const b={...map,id:"b",entrances:[{id:"from-a",position:{x:2,y:2},facing:"east" as const}]};
  const start={...createWorld({restaurant:restaurantMap}),mapId:"a",position:{x:2.9,y:2.5}};
  const next=reduceWorld(start,{type:"world-move",position:{x:3.1,y:2.5}},{a,b});
  expect(next.mapId).toBe("b");expect(next.position).toEqual({x:2,y:2});expect(next.returnPositions.a.x).toBe(2.9);
 });
});
