import {it,expect} from 'vitest';
import {project,unprojectAtHeight} from './camera';
import {worldViewBounds} from './culling';
it('keeps every visible ground corner plus raised-scene padding at scrolled phone/desktop cameras',()=>{
 for(const width of [195,720])for(const focusZ of [0,2.4,4.8]){
  const camera={focus:{x:62,y:57},focusZ,width,height:386,scale:width===195?11:15,offsetY:-20,offsetX:-30};
  const bounds=worldViewBounds({project:(p,z)=>project(p,camera,z),width,height:386})!;
  for(const screen of [{x:0,y:0},{x:width,y:0},{x:0,y:386},{x:width,y:386}]){
   const p=unprojectAtHeight(screen,camera,0);expect(p.x).toBeGreaterThanOrEqual(bounds.x);expect(p.x).toBeLessThanOrEqual(bounds.x+bounds.width);expect(p.y).toBeGreaterThanOrEqual(bounds.y);expect(p.y).toBeLessThanOrEqual(bounds.y+bounds.height);
  }
 }
});
