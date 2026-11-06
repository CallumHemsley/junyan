const fs=require('fs'),path=require('path'),cp=require('child_process'),ts=require('typescript'),assert=require('assert/strict');
const head='e02a747c3b4d4fc6a476ea744ecb6bdc1a738132',dir=__dirname;
const read=(h,p)=>cp.execFileSync('git',['show',`${h}:${p}`],{encoding:'utf8'});
for(const name of ['geometry','locomotion']){const source=read(head,`src/world/${name}.ts`);fs.writeFileSync(path.join(dir,`${name}.source.ts`),source);fs.writeFileSync(path.join(dir,`${name}.mjs`),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace('"./geometry"','"./geometry.mjs"'));}
fs.writeFileSync(path.join(dir,'viewport.source.tsx'),read(head,'src/world/WorldViewport.tsx'));
fs.writeFileSync(path.join(dir,'dynamic.source.ts'),read(head,'src/world/dynamic.ts'));
const map=JSON.parse(read(head,'src/world/maps/workshop/map.json'));fs.writeFileSync(path.join(dir,'map.json'),JSON.stringify(map,null,2));
(async()=>{
 const {findPath,canWalk,canStand,movePlayer}=await import('./geometry.mjs'),{advanceRoute}=await import('./locomotion.mjs');
 const from={x:7.999999306418678,y:6.799999583851207},target={x:8,y:10.8},original=findPath(map,from,target),results=[];
 function run(label,timing,old=false,route=original,start=from){let position={...start},remaining=route.map(p=>({...p})),blocked=false,frames=0,segmentsValid=true,maxStep=0;for(;frames<2000&&remaining.length;frames++){const milliseconds=timing[frames%timing.length],previous=position;if(old){const p=remaining[0],dx=p.x-position.x,dy=p.y-position.y,d=Math.hypot(dx,dy),step=milliseconds/1000*5;let delta;if(d<=Math.max(step,.03)){delta={x:dx,y:dy};remaining.shift();}else delta={x:dx/d*step,y:dy/d*step};if(delta.x||delta.y){const next=movePlayer(map,position,delta);if(Math.hypot(next.x-position.x,next.y-position.y)>.0001)position=next;else{blocked=true;remaining=[];}}}else{const n=advanceRoute(map,position,remaining,milliseconds/1000);remaining=n.remaining;position=n.position;blocked||=n.blocked;}maxStep=Math.max(maxStep,Math.hypot(position.x-previous.x,position.y-previous.y));segmentsValid&&=canWalk(map,previous,position);}return {label,timing,oldController:old,position,frames,blocked,remaining,reached:Math.hypot(position.x-target.x,position.y-target.y)<1e-6,segmentsValid,maxStep};}
 for(const ms of [16,16.6666666667,20,33.3333333333,40]){results.push(run(`prior-${ms}`,[ms],true));results.push(run(`corrected-${ms}`,[ms]));}
 results.push(run('corrected-jitter',[0,16,40,20,33.3333333333,16.6666666667]));
 results.push(run('corrected-duplicate-residual',[20,40,16],false,[{x:11,y:10.5},{x:11+1e-14,y:10.5},{x:11,y:10.5+1e-12},target],{x:11,y:10.5}));
 for(const result of results.filter(r=>!r.oldController)){assert(result.reached);assert(!result.blocked);assert(result.segmentsValid);}
 const zero=advanceRoute(map,from,original,0);assert.deepEqual(zero.position,from);assert.deepEqual(zero.remaining,original);assert(!zero.blocked);
 const empty=advanceRoute(map,from,[],.04);assert.deepEqual(empty.position,from);assert(!empty.blocked);
 // A real obstruction must terminate safely, not be mistaken for a harmless residual.
 const simple={...map,bounds:{width:10,height:10},walkable:[{x:0,y:0,width:10,height:10}],colliders:[{id:'wall',rect:{x:5,y:0,width:1,height:10}}]};
 let p={x:4.5,y:5},r=[{x:7,y:5}],collision;
 for(let n=0;n<100&&r.length;n++){collision=advanceRoute(simple,p,r,.04);assert(canStand(simple,collision.position));p=collision.position;r=collision.remaining;}
 assert(collision.blocked);assert(p.x<5);
 const report={head,method:'Exact new production geometry/advanceRoute; complete authored workshop route; prior controller sequence reproduced separately as control. No browser/player claim.',original,results,zeroDt:zero,emptyRoute:empty,collisionControl:collision,dynamicSafeFunctionUnchanged:read(head,'src/world/dynamic.ts').split('export function safeAfterEdit')[1]===read('23be251','src/world/dynamic.ts').split('export function safeAfterEdit')[1]};
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({route:original,runs:results.map(({label,reached,blocked,frames})=>({label,reached,blocked,frames})),collisionControl:collision,dynamicSafeFunctionUnchanged:report.dynamicSafeFunctionUnchanged},null,2));
})();
