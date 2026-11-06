import {execFileSync} from 'node:child_process';
import {stripTypeScriptTypes} from 'node:module';
const refs=['23be251','origin/codex/0080-courtyard'];
const rows=[];
for(const ref of refs){
 const head=execFileSync('git',['rev-parse',ref],{encoding:'utf8'}).trim();
 const source=execFileSync('git',['show',`${head}:src/world/art/courtyard/index.ts`],{encoding:'utf8'});
 const mod=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
 const calls=[];const ctx=new Proxy({},{get:(_,key)=>(...args)=>calls.push({op:String(key)}),set:()=>true});
 const view={project:({x,y},z=0)=>({x:x*10,y:y*10-z*10}),width:500,height:500,pass:'ground',elapsedMs:0,reducedMotion:true,playerPosition:{x:0,y:0}};
 mod.drawMap(ctx,{id:'restaurant',terrain:[{rect:{x:1,y:1,width:1,height:1},material:'tile'}],props:[],occluders:[]},view);
 rows.push({head,map:'restaurant',owner:'courtyard',calls:calls.length,drawsOnUnrelatedMap:calls.length>0,hasRenderObjects:typeof mod.renderObjects==='function'});
}
console.log(JSON.stringify(rows,null,2));
if(rows[0].drawsOnUnrelatedMap)process.exitCode=1;
