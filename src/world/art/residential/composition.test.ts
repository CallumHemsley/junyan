import {expect, it} from 'vitest';
import {drawResidentialProps, renderObjects, type ResidentialArtApi} from './index';
import {mapDefinitions} from '../../maps/residential';
import {worldMapSchema} from '../../schema';
import {canStand, canWalk, findPath, PLAYER_RADIUS} from '../../geometry';
import {compileLife, interactLife, initialLifeState, nearbyLife, navigationFor} from '../../life';
import {initialState, itemIds, legal, reduce, validate} from '../../../features/apartment/rules';
import {furnitureColliders, furnitureRegion} from '../../../features/apartment/world';
import {catalog, initialProgression} from '../../../progression/model';
import {createGame} from '../../../game';
import {content} from '../../../neighbourhood/registry';
import {validateSavedGame} from '../../../save';
import {restorePurchases} from '../../../progression/purchases';
import type {WorldRenderView} from '../../render-contract';

const map=worldMapSchema.parse(mapDefinitions.find(map=>map.id==='apartment'));
const changed=['apartment.sofa','apartment.tea-corner','apartment.tea-stool'];
function starter() {
  let home=reduce(initialState(),{type:'accept-starter'},1);
  for(const [id,x,y]of [['rug',2,1],['table',2,1],['chair',4,1],['cushion',3,3]] as const) {
    home=reduce(home,{type:'select',id},1);home=reduce(home,{type:'place',x,y},1);
  }
  return home;
}
function crowded() {
  let home=reduce(initialState(),{type:'accept-starter'},1);
  for(const day of [1,2,3])home=reduce(home,{type:'claim-gift'},day);
  for(const giftId of ['repairs.stool','garden.planter','cats.cushion'] as const)home=reduce(home,{type:'receive-gift',giftId},3);
  home=restorePurchases(home,{...initialProgression(3),purchases:['blue-vase','large-basket','small-lamp']});
  for(const id of itemIds.filter(id=>id!=='bed'&&id!=='rug')) {
    home=reduce(home,{type:'select',id},3);
    if(id==='table')home=reduce(home,{type:'rotate'},3);
    const placement=Array.from({length:20},(_,i)=>({id,x:i%5,y:Math.floor(i/5),rotation:home.draft!.rotation})).find(p=>legal(home,p))!;
    expect(placement).toBeDefined();home=reduce(home,{type:'place',x:placement.x,y:placement.y},3);
  }
  home=reduce(home,{type:'choose-rug',size:'large'},3);home=reduce(home,{type:'select',id:'rug'},3);home=reduce(home,{type:'place',x:2,y:1},3);
  expect(home.placements).toHaveLength(14);return home;
}

it('preserves radius-aware entry, grid-border, living and utility circulation for sparse, exact starter and legal crowded homes',()=>{
  expect(furnitureRegion).toEqual({x:4,y:4,columns:6,rows:5,cellSize:2});
  for(const id of [...changed,'apartment.reading-lamp','apartment.tea-plant']) {
    const prop=map.props.find(prop=>prop.id===id)!;
    expect(map.colliders.find(c=>c.id===id)!.rect).toEqual({...prop.position,width:prop.width,height:prop.height});
  }
  const entry=map.defaultSpawn,anchor=map.anchors.find(a=>a.id==='apartment.furnish')!,tea=map.landmarks.find(l=>l.id==='apartment.tea-nook')!;
  expect(tea.position).toEqual({x:14.5,y:20.5});
  const sofa=map.props.find(p=>p.id==='apartment.sofa')!,table=map.props.find(p=>p.id==='apartment.tea-corner')!;
  expect(sofa.position.x-table.position.x-table.width).toBeCloseTo(1.6);
  for(const home of [initialState(),starter(),crowded()]) {
    expect(validate(JSON.parse(JSON.stringify(home)))).toEqual(home);
    const day=Math.max(1,home.lastGiftDay),game=createGame(content,42),purchases=catalog.furniture.filter(item=>home.owned.includes(item.id));
    game.day=day;game.level=Math.min(day,3);game.earnings=day===1?0:100;
    game.customers=game.customers.map(c=>({...c,orderId:content.orders.find(o=>o.table===c.table&&o.level===game.level)!.id}));
    game.progression={...initialProgression(day),spent:purchases.reduce((n,item)=>n+item.price,0),purchases:purchases.map(item=>item.id)};
    game.neighbourhood!.location='apartment';game.neighbourhood!.apartment=home;game.neighbourhood!.claimedGiftIds=home.owned.filter((id):id is 'repairs.stool'|'garden.planter'|'cats.cushion'=>id.includes('.'));
    expect(validateSavedGame(JSON.parse(JSON.stringify(game)),content)!.neighbourhood!.apartment).toEqual(home);
    expect(home.placements.find(p=>p.id==='bed')).toEqual({id:'bed',x:0,y:0,rotation:0});
    const world={...map,colliders:[...map.colliders,...furnitureColliders(home)]};
    const border=[...Array.from({length:5},(_,i)=>({x:15,y:5+i*2})),...Array.from({length:6},(_,i)=>({x:5+i*2,y:13}))];
    const targets=[anchor.position,tea.position,{x:16.8,y:19},{x:23,y:5.5},{x:23,y:12},{x:3.5,y:10},...border];
    for(const target of targets) {
      expect(canStand(world,target,PLAYER_RADIUS),JSON.stringify(target)).toBe(true);
      const path=findPath(world,entry,target,PLAYER_RADIUS);expect(path.length).toBeGreaterThan(0);
      let from={x:entry.x,y:entry.y};for(const point of path){expect(canWalk(world,from,point,PLAYER_RADIUS)).toBe(true);from=point;}
      expect(findPath(world,target,entry,PLAYER_RADIUS).length).toBeGreaterThan(0);
    }
    expect(canWalk(world,{x:16.8,y:17},{x:16.8,y:21},PLAYER_RADIUS)).toBe(true);
    const navigation=navigationFor(world),plan=compileLife(world,navigation);
    expect(plan.diagnostics).toEqual([]);expect(plan.actors).toEqual([]);
    expect(nearbyLife(plan,[],tea.position,navigation).some(a=>a.id==='apartment.tea-nook/inspect')).toBe(true);
    const response=interactLife(initialLifeState(),plan,[],{day,seed:42,elapsedMs:42000,player:tea.position,reducedMotion:true},'apartment.tea-nook/inspect',navigation);
    expect(response.events).toContainEqual({type:'discovered',mapId:'apartment',landmarkId:tea.id,day});
    expect(response.events).toContainEqual({type:'reacted',mapId:'apartment',targetId:tea.id,reaction:'watch',atMs:42000});
  }
});

it('connects four supported feet to each changed body and keeps low-table/seat/back height hierarchy',()=>{
  const boxes:{x:number;y:number;z:number;right:number;front:number;top:number}[]=[],shadows:{x:number;y:number;z:number;radius:number}[]=[];
  const api:ResidentialArtApi={box(x,y,z,right,front,top){boxes.push({x,y,z,right,front,top});},sphere(){},capsule(){},castShadow(x,y,z,radius){shadows.push({x,y,z,radius});}};
  drawResidentialProps(api,'apartment','object');
  for(const id of changed) {
    const p=map.props.find(p=>p.id===id)!,right=p.position.x+p.width,front=p.position.y+p.height;
    const body=boxes.filter(b=>b.x>=p.position.x&&b.y>=p.position.y&&b.right<=right&&b.front<=front);
    expect(body.every(b=>Number.isFinite(b.x+b.y+b.z+b.right+b.front+b.top)&&b.right>b.x&&b.front>b.y&&b.top>=b.z)).toBe(true);
    const feet=body.filter(b=>b.z<=.08&&b.top>.2&&b.right-b.x<.3&&b.front-b.y<.3);expect(feet).toHaveLength(4);
    for(const foot of feet) {
      const cx=(foot.x+foot.right)/2,cy=(foot.y+foot.front)/2;
      expect(body.some(b=>b.z<=foot.top+1e-9&&b.top>foot.top&&cx>=b.x&&cx<=b.right&&cy>=b.y&&cy<=b.front)).toBe(true);
      expect(shadows.some(s=>s.z>=.08&&s.z<=.12&&Math.hypot(cx-s.x,cy-s.y)<=s.radius)).toBe(true);
    }
    const max=Math.max(...body.map(b=>b.top));
    expect(max).toBeCloseTo(id==='apartment.sofa'?1.32:id==='apartment.tea-corner'?.96:.58);
    if(id==='apartment.tea-corner')expect(Math.max(...body.filter(b=>b.right-b.x>2&&b.front-b.y>1).map(b=>b.top))).toBe(.8);
  }
});

it('grades raw changed materials once, inherits alpha and keeps depth and static form across motion and player sides',()=>{
  function paint(id:string,elapsedMs:number,reducedMotion:boolean) {
    const paints:unknown[]=[];let path:unknown[]=[];const stack:number[]=[];
    const ctx={globalAlpha:.41,fillStyle:'',save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop()!;},beginPath(){path=[];},moveTo(x:number,y:number){path.push([x,y]);},lineTo(x:number,y:number){path.push([x,y]);},closePath(){},ellipse(...args:unknown[]){path.push(args);},fill(){paints.push({path:[...path],color:this.fillStyle,alpha:this.globalAlpha});}};
    const view:WorldRenderView={project:(p,z=0)=>({x:200+(p.x-p.y)*11,y:100+(p.x+p.y)*5.5-z*11}),shadeColor:(base,light)=>{expect(String(base)).not.toMatch(/^graded:/);return `graded:${JSON.stringify(base)}:${light}`;},width:720,height:456,pass:'objects',elapsedMs,reducedMotion,playerPosition:reducedMotion?{x:16.8,y:21}:{x:16.8,y:17}};
    const object=renderObjects(map,view).find(o=>o.id===id)!;expect(object.occlusion).toBeUndefined();
    const prop=map.props.find(p=>p.id===id)!;expect(object.position).toEqual({x:prop.position.x+prop.width/2,y:prop.position.y+prop.height/2});
    object.draw(ctx as unknown as CanvasRenderingContext2D,view);
    expect(ctx.globalAlpha).toBe(.41);expect(stack).toHaveLength(0);
    expect(paints.length).toBeGreaterThan(0);expect(paints.every(p=>(p as {color:string}).color.startsWith('graded:'))).toBe(true);
    expect(paints.some(p=>(p as {alpha:number}).alpha===.41)).toBe(true);
    expect(paints.every(p=>{const a=(p as {alpha:number}).alpha;return a>0&&a<=.41;})).toBe(true);
    return paints;
  }
  for(const id of changed)expect(paint(id,92000,true)).toEqual(paint(id,0,false));
});
