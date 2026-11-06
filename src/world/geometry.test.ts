import {expect,it} from 'vitest';
import {canStand,canWalk,PLAYER_RADIUS} from './geometry';
import {restaurantMap} from './restaurant';
const map={...restaurantMap,bounds:{width:20,height:20},walkable:[{x:0,y:0,width:20,height:20}],colliders:[{id:'block',rect:{x:5,y:5,width:2,height:2}}]};

it('keeps axis and rounded-corner contact blocked, including exact tangencies',()=>{
 for(const point of [{x:4,y:6},{x:6,y:4},{x:8,y:6},{x:6,y:8},{x:4.4,y:4.2}])expect(canStand(map,point,1)).toBe(false);
 const corner={...map,colliders:[{id:'corner',rect:{x:10,y:10,width:2,height:2}}]};
 expect(canStand(corner,{x:7,y:6},5)).toBe(false);
 expect(canStand(corner,{x:7-1e-12,y:6},5)).toBe(true);
 expect(canStand(map,{x:4.4,y:4.19},1)).toBe(true);
 expect(canStand(map,{x:4.5,y:4.5},1)).toBe(false);
 expect(canStand(map,{x:3,y:6},1)).toBe(true);
 expect(canWalk(map,{x:4,y:3},{x:4,y:9},1)).toBe(false);
});

it('retains nonfinite point/radius and negative-radius behavior',()=>{
 for(const value of [NaN,Infinity,-Infinity]){
  expect(canStand(map,{x:value,y:3})).toBe(false);
  expect(canStand(map,{x:3,y:value})).toBe(false);
 }
 expect(canStand(map,{x:3,y:3},NaN)).toBe(false);
 expect(canStand(map,{x:3,y:3},Infinity)).toBe(false);
 expect(canStand(map,{x:6,y:6},-1)).toBe(true);
 expect(canStand(map,{x:6,y:6},-Infinity)).toBe(true);
 expect(canStand(map,{x:6,y:6},0)).toBe(false);
 expect(canStand(map,{x:3,y:3})).toBe(canStand(map,{x:3,y:3},PLAYER_RADIUS));
});

it('observes edits to collider rectangles, arrays, walkable support and bounds immediately',()=>{
 const edited=structuredClone(map),point={x:3,y:6};
 expect(canStand(edited,point)).toBe(true);
 edited.colliders[0].rect.x=2;
 expect(canStand(edited,point)).toBe(false);
 edited.colliders.length=0;
 expect(canStand(edited,point)).toBe(true);
 edited.colliders.push({id:'new-furniture',rect:{x:2,y:5,width:2,height:2}});
 expect(canStand(edited,point)).toBe(false);
 edited.colliders=[];
 edited.walkable[0].width=2;
 expect(canStand(edited,point)).toBe(false);
 edited.walkable[0].width=20;
 edited.bounds.width=2;
 expect(canStand(edited,point)).toBe(false);
});
