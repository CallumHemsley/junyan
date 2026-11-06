import {it,expect} from "vitest";
import {advanceRoute} from "./locomotion";
import {worldMapSchema} from "./schema";
import workshop from "./maps/workshop/map.json";
const map=worldMapSchema.parse(workshop);
for(const ms of [16,16.667,20,33.333,40])it(`reaches the final walkable point after a residual waypoint at ${ms}ms`,()=>{
 let position={x:11,y:10.5},remaining=[{x:11+1e-14,y:10.5},{x:8,y:10.8}];
 for(let n=0;n<1000&&remaining.length;n++){const next=advanceRoute(map,position,remaining,ms/1000);expect(next.blocked).toBe(false);position=next.position;remaining=next.remaining;}
 expect(remaining).toEqual([]);expect(position.x).toBeCloseTo(8,6);expect(position.y).toBeCloseTo(10.8,6);
});
