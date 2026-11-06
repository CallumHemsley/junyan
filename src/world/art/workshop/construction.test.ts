import {expect,it} from 'vitest';
import {drawMap} from './index';
import {workshopDefinition} from '../../maps/workshop';
import {worldMapSchema} from '../../schema';
import type {WorldRenderView} from '../../render-contract';

it('covers the plank floor with warm joints and clips staggered boards at the room boundary',()=>{
 const points:{x:number;y:number;z:number}[]=[],colors:string[]=[],alphas:number[]=[];
 const ctx=new Proxy({globalAlpha:1},{get:(target,key)=>key==='globalAlpha'?target.globalAlpha:()=>{},set:(target,key,value)=>{if(key==='globalAlpha'){target.globalAlpha=value;alphas.push(value);}return true;}}) as CanvasRenderingContext2D;
 const view:WorldRenderView={project:(p,z=0)=>{points.push({...p,z});return p;},shadeColor:base=>{colors.push(String(base));return '#123456';},elapsedMs:0,reducedMotion:true,playerPosition:{x:8,y:10.8},width:720,height:458,pass:'ground'};
 drawMap(ctx,worldMapSchema.parse(workshopDefinition),view);
 const floor=points.filter(p=>p.y<21);
 expect(floor.length).toBeGreaterThan(0);
 expect(floor.every(p=>p.x>=2&&p.x<=28&&p.y>=2&&p.z>=0)).toBe(true);
 expect(colors).toContain('123,92,64');
 expect(colors).not.toContain('221,237,224');
 expect(alphas.every(alpha=>alpha===1)).toBe(true);
 // Adjacent board ends must stagger instead of making a continuous cross-room grid.
 const ends=new Set(floor.filter(p=>p.x===2).map(p=>p.y));
 expect(floor.some(p=>Math.abs(p.x-2.65)<.001&&!ends.has(p.y))).toBe(true);
});
