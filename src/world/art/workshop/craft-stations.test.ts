import {expect,it} from 'vitest';
import {drawWorkshopProp,workshopCraftHeights} from './paint';
import {renderObjects} from './index';
import {workshopDefinition} from '../../maps/workshop';
import {worldMapSchema} from '../../schema';
import type {RepairArtApi} from '../../../features/repairs/scene';
import type {WorldRenderView} from '../../render-contract';

const map=worldMapSchema.parse(workshopDefinition);
const heights:Record<string,number>={
 'workshop.window-bench':1.86,'workshop.woodworking':1.98,
 'workshop.clamped-chair':workshopCraftHeights.joinery,
 'workshop.sewing-bench':workshopCraftHeights.sewing,
 'workshop.wood-rack':workshopCraftHeights.timber,
};

it('keeps craft geometry inside its supported footprints and measured height envelopes',()=>{
 for(const [id,height]of Object.entries(heights)){
  const prop=map.props.find(prop=>prop.id===id)!;
  const points:{x:number;y:number;z:number}[]=[];
  const point=(x:number,y:number,z:number,r=0)=>{for(const sign of [-1,1])points.push({x:x+sign*r,y:y+sign*r,z:z+sign*r});};
  const api:RepairArtApi={
   box:(x,y,z,a,b,c)=>{expect(a).toBeGreaterThanOrEqual(x);expect(b).toBeGreaterThanOrEqual(y);expect(c).toBeGreaterThanOrEqual(z);point(x,y,z);point(a,b,c);},
   sphere:(x,y,z,r)=>point(x,y,z,r),
   capsule:(a,b,r,s)=>{point(...a,r);point(...b,s);},
  };
  drawWorkshopProp(api,prop,{elapsedSeconds:0});
  expect(points.length,id).toBeGreaterThan(0);
  for(const p of points){
   expect(p.x,id).toBeGreaterThanOrEqual(prop.position.x-.09);expect(p.x,id).toBeLessThanOrEqual(prop.position.x+prop.width+.09);
   expect(p.y,id).toBeGreaterThanOrEqual(prop.position.y-.09);expect(p.y,id).toBeLessThanOrEqual(prop.position.y+prop.height+.09);
   expect(p.z,id).toBeGreaterThanOrEqual(0);expect(p.z,id).toBeLessThanOrEqual(height+.001);
  }
  expect(Math.max(...points.map(p=>p.z)),id).toBeGreaterThan(height-.04);
 }
});

it('corrects only craft compound fade heights without changing authored metadata, depth or overlap gating',()=>{
 const original=JSON.stringify(map.occluders);
 const view:WorldRenderView={project:(p,z=0)=>({x:(p.x-p.y)*16,y:(p.x+p.y)*8-z*16}),elapsedMs:0,reducedMotion:true,playerPosition:{x:0,y:0},width:720,height:458,pass:'objects'};
 const cases=[['workshop.woodworking',workshopCraftHeights.joinery],['workshop.clamped-chair',workshopCraftHeights.joinery],['workshop.sewing-bench',workshopCraftHeights.sewing],['workshop.wood-rack',workshopCraftHeights.timber]] as const;
 for(const [id,height]of cases){
  const prop=map.props.find(p=>p.id===id)!;
  const near={...view,playerPosition:{x:prop.position.x+prop.width/2-.5,y:prop.position.y-.5}};
  const object=renderObjects(map,near).find(o=>o.id===id)!;
  expect(object.occlusion?.height,id).toBe(height);
  expect(object.occlusion?.rect,id).toEqual(map.occluders.find(o=>o.id===(id==='workshop.clamped-chair'?'workshop.woodworking':id))!.rect);
  expect(renderObjects(map,{...view,playerPosition:{x:100,y:100}}).find(o=>o.id===id)!.occlusion,id).toBeUndefined();
  const host=id==='workshop.clamped-chair'?map.props.find(p=>p.id==='workshop.woodworking')!:prop;
  expect(object.depth,id).toBe(host.position.x+host.position.y+host.width/2+host.height/2+(id==='workshop.clamped-chair'?.01:0));
 }
 expect(JSON.stringify(map.occluders)).toBe(original);
 const lamp=map.props.find(p=>p.id==='workshop.lamp-bench')!;
 const near={...view,playerPosition:{x:lamp.position.x+2,y:lamp.position.y-.5}};
 expect(renderObjects(map,near).find(o=>o.id===lamp.id)!.occlusion?.height).toBe(map.occluders.find(o=>o.id===lamp.id)?.height);
});
