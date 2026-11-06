const fs=require('fs'),path=require('path'),ts=require('typescript'),cp=require('child_process');
const dir=__dirname,head='23be251185d989f7b97d36391a8f6478344b1a3b';
function source(file){return cp.execFileSync('git',['show',`${head}:${file}`],{encoding:'utf8'});}
for(const name of ['geometry','dynamic','state'])fs.writeFileSync(path.join(dir,`${name}.source.ts`),source(`src/world/${name}.ts`));
const geometry=source('src/world/geometry.ts');fs.writeFileSync(path.join(dir,'geometry.mjs'),ts.transpileModule(geometry,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const exactFunction=source('src/world/dynamic.ts').slice(source('src/world/dynamic.ts').indexOf('export function safeAfterEdit'));
fs.writeFileSync(path.join(dir,'safe.mjs'),`import {canStand,canWalk} from './geometry.mjs';\n`+ts.transpileModule(exactFunction,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
(async()=>{
const {canStand,canWalk,findPath}=await import('./geometry.mjs'),{safeAfterEdit}=await import('./safe.mjs');
const collider=(id,x,y,width,height)=>({id,rect:{x,y,width,height}});
const before={version:1,id:'apartment',bounds:{width:12,height:10},defaultSpawn:{x:9,y:8,facing:'north'},walkable:[{x:0,y:0,width:12,height:10}],colliders:[collider('shelf.top',3,3,4,1),collider('shelf.left',3,4,1,3),collider('shelf.right',6,4,1,3),collider('shelf.bottom.left',4,6,.5,1),collider('shelf.bottom.right',5.5,6,.5,1)],occluders:[],entrances:[{id:'from-hall',position:{x:9,y:8},facing:'north'}],exits:[{id:'to-hall',rect:{x:8.5,y:7.5,width:1,height:1},targetMapId:'hall',targetEntranceId:'from-apartment',kind:'door'}],anchors:[],terrain:[],props:[],palette:{},npcHooks:[],landmarks:[]};
const after={...before,colliders:[...before.colliders,collider('placed.gate-cabinet',4.5,6,1,1)]};
const destination={x:9,y:8};
const fixtures=[{name:'still-standable-pocket',position:{x:5,y:5}},{name:'overlap-nearest-pocket',position:{x:5,y:6.25}}];
const {restoreWorld}=require('./state.bundle.cjs');
const results=fixtures.map(({name,position})=>{const recovered=safeAfterEdit(before,after,position);const reloaded=JSON.parse(JSON.stringify({map:after,position:recovered}));return{name,position,beforeStandable:canStand(before,position),beforeExitRoute:findPath(before,position,destination),afterOriginalStandable:canStand(after,position),recovered,recoveredStandable:canStand(after,recovered),beforeSegmentToRecovery:canWalk(before,position,recovered),afterExitRoute:findPath(after,recovered,destination),roundtripRecovered:safeAfterEdit(reloaded.map,reloaded.map,reloaded.position),actualRestoreWorld:restoreWorld(JSON.parse(JSON.stringify({version:1,mapId:'apartment',position:recovered,facing:'north',returnPositions:{},activeActivity:null,activeAnchorId:null})),{apartment:after},'apartment').position,outsideSafeAlternative:{point:{x:5,y:7.25},standable:canStand(after,{x:5,y:7.25}),exitRoute:findPath(after,{x:5,y:7.25},destination)}}});
fs.writeFileSync(path.join(dir,'fixtures.json'),JSON.stringify({before,after,fixtures},null,2));
fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({head,scope:'synthetic map geometry, exact safeAfterEdit and geometry; actual restoreWorld bundled from exact-head source receives JSON-roundtripped valid saved world',results},null,2));console.log(JSON.stringify(results,null,2));
})();
