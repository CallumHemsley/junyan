import {expect,it} from 'vitest';
import {renderObjects} from './index';
import {isometricRestaurantFixture as restaurantMap} from './fixture';
import type {RestaurantView} from './types';

it('keeps every rescaled kitchen fixture on its real supporting counter and paints it after that support',()=>{
 const points:{x:number;y:number;z:number}[]=[];
 const view:RestaurantView={project:(p,z=0)=>{points.push({...p,z});return p;},elapsedMs:0,reducedMotion:true,playerPosition:{x:9,y:14},width:720,height:458,pass:'objects'};
 const context=new Proxy({},{get:()=>()=>{},set:()=>true}) as CanvasRenderingContext2D;
 const counter=restaurantMap.props.find(p=>p.id==='counter')!;
 const objects=renderObjects(restaurantMap,view),sections=objects.filter(o=>o.id==='counter'||o.id.startsWith('counter.section.'));
 for(const fixture of objects.filter(o=>o.id.startsWith('restaurant.kitchen.'))){
  points.length=0;fixture.draw(context,view);expect(points.length).toBeGreaterThan(0);
  for(const p of points){
   expect(p.x,fixture.id).toBeGreaterThanOrEqual(counter.position.x-.08);
   expect(p.x,fixture.id).toBeLessThanOrEqual(counter.position.x+counter.width+.08);
   expect(p.y,fixture.id).toBeGreaterThanOrEqual(counter.position.y-.08);
   expect(p.y,fixture.id).toBeLessThanOrEqual(counter.position.y+counter.height+.08);
  }
  const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x));
  const supports=sections.filter(o=>o.occlusion!.rect.x<=maxX&&o.occlusion!.rect.x+o.occlusion!.rect.width>=minX);
  expect(fixture.depth!,fixture.id).toBeGreaterThan(Math.max(...supports.map(o=>o.position.x+o.position.y)));
 }
});
