import {expect,it} from 'vitest';
import {project,unproject} from '../camera';
import {visibleAtmosphereRect} from './canvas';
it('derives culling bounds from the real camera for desktop, phone and scrolled views',()=>{
 for(const [width,height,scale] of [[960,600,24],[390,640,18]]){
  const camera={focus:{x:65,y:43},width,height,scale};
  const rect=visibleAtmosphereRect({project:(p,z)=>project(p,camera,z),width,height},96);
  for(const point of [{x:-96,y:-96},{x:width+96,y:-96},{x:-96,y:height+96},{x:width+96,y:height+96}]){
   const world=unproject(point,camera);
   expect(world.x).toBeGreaterThanOrEqual(rect.x-1e-8);expect(world.x).toBeLessThanOrEqual(rect.x+rect.width+1e-8);
   expect(world.y).toBeGreaterThanOrEqual(rect.y-1e-8);expect(world.y).toBeLessThanOrEqual(rect.y+rect.height+1e-8);
  }
 }
});
