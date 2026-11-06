import ts from 'typescript';
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sha='9f144d512cfc0e74cfd7c1c9f43b75f7bf954a6c';
const root=new URL('./',import.meta.url);
const hashes={};
for(const name of ['geometry','validation']) {
 const source=execFileSync('git',['show',`${sha}:src/world/${name}.ts`],{encoding:'utf8'});
 hashes[name]=createHash('sha256').update(source).digest('hex');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace('"./geometry"','"./geometry.mjs"');
 writeFileSync(new URL(`${name}.mjs`,root),js);
}
const {canStand,canWalk,nearbyAnchors}=await import('./geometry.mjs');
const {validateWorldGraph}=await import('./validation.mjs');
const base={version:1,id:'probe',bounds:{width:10,height:10},defaultSpawn:{x:2,y:5,facing:'east'},walkable:[{x:0,y:0,width:10,height:10}],colliders:[],occluders:[],entrances:[],exits:[],anchors:[],terrain:[],props:[],palette:{},npcHooks:[],landmarks:[]};
const gap={...base,walkable:[{x:0,y:0,width:4.99,height:10},{x:5.01,y:0,width:4.99,height:10}]};
const solid={...base,colliders:[{id:'bench',rect:{x:4,y:4,width:2,height:2}}],anchors:[{id:'bench',position:{x:5,y:5},radius:2,featureId:'repairs',interactionId:'bench'}]};
const out={sha,hashes,method:'Unmodified git source transpiled by TypeScript; synthetic boundary fixtures, no integrated user trigger asserted.',gap:{stand:canStand(gap,{x:5,y:5}),walk:canWalk(gap,{x:4.5,y:5},{x:5.5,y:5}),expected:false},anchor:{approachStand:canStand(solid,{x:3.5,y:5}),nearbyCount:nearbyAnchors(solid,{x:3.5,y:5}).length,validationErrors:validateWorldGraph({probe:solid}),expectedErrors:[]},nonfinite:{canWalk:canWalk(base,{x:2,y:5},{x:NaN,y:6}),expected:false}};
writeFileSync(new URL('results.json',root),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));
