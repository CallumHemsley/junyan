import {describe,expect,it} from 'vitest';
import {worldMapSchema} from '../../schema';
import {canStand,canWalk,findPath} from '../../geometry';
import {compileLife} from '../../life';
import {navigationFor} from '../../life/navigation';
import {initialState,reduce} from '../../../features/garden/rules';
import {rooftopForGarden} from './index';

describe('bounded rooftop threshold and care pocket',()=>{
 it('provides an open physical threshold between safe arrival and real care without adding a portal',()=>{
  const map=worldMapSchema.parse(rooftopForGarden(initialState()));
  const lintel=map.props.find(p=>p.kind==='threshold-lintel')!;
  const opening={x:lintel.position.x+lintel.width/2,y:lintel.position.y+lintel.height/2};
  const garden=map.anchors.find(a=>a.id==='rooftop.garden')!;
  expect(canStand(map,opening,.28)).toBe(true);
  for(const [from,to]of [[map.defaultSpawn,opening],[opening,garden.position],[garden.position,map.defaultSpawn]]){
   const path=findPath(map,from,to);expect(path.length).toBeGreaterThan(0);let previous=from;
   for(const point of path){expect(canWalk(map,previous,point,.28)).toBe(true);previous=point;}
  }
  expect(map.exits).toHaveLength(1);expect(map.exits[0].targetMapId).toBe('residential-stairs');
  expect(map.colliders.some(c=>c.id===lintel.id)).toBe(false);
 });
 it('keeps Lin identity and reachable work/terrace stops through existing life compilation',()=>{
  let state=reduce(initialState(),{type:'sync'},1);state=reduce(state,{type:'tidy',value:true},1);
  for(const garden of [initialState(),state,reduce(state,{type:'move',plant:'climber',site:1},1)]){
   const map=worldMapSchema.parse(rooftopForGarden(garden));const plan=compileLife(map,navigationFor(map));
   expect(plan.diagnostics).toEqual([]);
   const actor=plan.actors.find(a=>a.characterId==='lin-jie')!;expect(actor).toBeDefined();
   expect(actor.phases.some(p=>p.action==='work'&&p.from.x===20&&p.from.y===18.2)).toBe(true);
   expect(actor.phases.some(p=>p.action==='walk')).toBe(true);
  }
 });
 it('uses the existing architecture light hook and keeps supplies separate from garden actions',()=>{
  const map=worldMapSchema.parse(rooftopForGarden(initialState()));
  expect(map.props.some(p=>p.kind==='warm-window')).toBe(true);
  expect(map.anchors.filter(a=>a.featureId==='garden').map(a=>a.interactionId)).toContain('existing-garden-activity');
  expect(map.anchors.some(a=>/threshold|care-tray|care-soil/.test(a.id))).toBe(false);
 });
});
