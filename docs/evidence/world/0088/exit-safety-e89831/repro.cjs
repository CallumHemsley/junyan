// PREPARED ONLY. Execute after parent confirms performance window ended.
const fs=require('fs'),path=require('path'),ts=require('typescript'),crypto=require('crypto'),assert=require('assert/strict');
const dir=__dirname,head='e89831bf65a4d7a7fd0ecca17e3deca047b011b0';
const acquired=JSON.parse(fs.readFileSync(path.join(dir,'acquired-sources.json'),'utf8'));
const source=p=>acquired.find(x=>x.path===p).content;
function compile(name,s){const js=ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;fs.writeFileSync(path.join(dir,name+'.cjs'),js.replaceAll('require("./geometry")','require("./geometry.cjs")').replaceAll('require("./schema")','require("./schema.cjs")').replaceAll('require("./life")','require("./life.cjs")').replaceAll('require("./exit-safety")','require("./exit-safety.cjs")'));}
compile('geometry',source('src/world/geometry.ts'));compile('schema',source('src/world/schema.ts'));compile('exit-safety',source('src/world/exit-safety.ts'));
compile('life',source('src/world/life/interactions.ts').split('export function reduceLife')[0].replace("import { lineFor } from '../../features/cats/content';",''));compile('state',source('src/world/state.ts'));
compile('dynamic',"import {safeExitPosition} from './exit-safety';\n"+source('src/world/dynamic.ts').slice(source('src/world/dynamic.ts').indexOf('export function safeAfterEdit')));
const {canStand}=require('./geometry.cjs'),{safeExitPosition,exitComponent,isExitConnected}=require('./exit-safety.cjs'),{safeAfterEdit}=require('./dynamic.cjs'),{restoreWorld}=require('./state.cjs');
const before={version:1,id:'apartment',bounds:{width:10,height:8},defaultSpawn:{x:1,y:4,facing:'east'},walkable:[{x:0,y:0,width:10,height:8}],colliders:[],anchors:[],exits:[{id:'out',rect:{x:.5,y:3,width:1,height:2},kind:'door',targetMapId:'outside',targetEntranceId:'in'}],entrances:[],occluders:[],terrain:[],props:[],palette:{},npcHooks:[],landmarks:[]};
const after={...before,colliders:[{id:'cover-exit',rect:{x:0,y:2,width:3,height:4}}]},position={x:8,y:4},restaurant={...before,id:'restaurant'};
const validWorld={version:1,mapId:after.id,position,facing:'east',returnPositions:{},activeActivity:null,activeAnchorId:null,life:{version:1,elapsedMs:4321,discoveries:[],reactions:[],pauses:[],serviceDepartures:[]}};
const maps={apartment:after,restaurant};const restored=restoreWorld(JSON.parse(JSON.stringify(validWorld)),maps,'apartment');
const malformed=restoreWorld({version:99},maps,'apartment');
const blocked={afterStandable:canStand(after,position),afterExitComponentLength:exitComponent(after).length,safePosition:safeExitPosition(after,position),safeAfterEdit:safeAfterEdit(before,after,position),validSerializedRestore:restored,restoredStandable:canStand(restaurant,restored.position),malformedWorldRestore:malformed,malformedSpawnStandable:canStand(after,malformed.position)};
assert(blocked.afterStandable);assert.equal(blocked.afterExitComponentLength,0);assert.equal(blocked.safePosition,null);assert.equal(blocked.safeAfterEdit,null);assert.equal(restored.mapId,'restaurant');assert(blocked.restoredStandable);assert.deepEqual(restored.life,validWorld.life);
// Execute exact post-feature commit tail, supplying explicit candidate state/journal/map resolver.
// This does NOT claim execution of current legal furniture action generation or entire reducer.
const tail=source('src/neighbourhood/transitions.ts').slice(source('src/neighbourhood/transitions.ts').lastIndexOf('  let world = game.world;'));
const commit=new Function('game','state','next','journal','mapsForNeighbourhood','safeAfterEdit',tail.slice(0,tail.lastIndexOf('}')));
const priorHome={placements:[{id:'old'}]},nextHome={placements:[{id:'new'}]},state={apartment:priorHome},next={apartment:nextHome};
const game={world:validWorld,neighbourhood:state,journal:{known:{lookups:3}},coins:12};const gameBefore=JSON.stringify(game),journal={known:{lookups:4},newWord:{lookups:1}};
const rejected=commit(game,state,next,journal,s=>({apartment:s===state?before:after}),safeAfterEdit);
assert.strictEqual(rejected,game);assert.equal(JSON.stringify(game),gameBefore);assert.strictEqual(rejected.neighbourhood,state);assert.strictEqual(rejected.journal,game.journal);
const validNext={...before,colliders:[{id:'divider',rect:{x:5,y:0,width:.5,height:8}}]};
const accepted=commit(game,state,next,journal,s=>({apartment:s===state?before:validNext}),safeAfterEdit);assert.notStrictEqual(accepted,game);assert.strictEqual(accepted.neighbourhood,next);assert.strictEqual(accepted.journal,journal);assert(isExitConnected(validNext,accepted.world.position));
const previous=JSON.parse(fs.readFileSync(path.join(dir,'prior-pocket-fixtures.json'),'utf8'));
const pocketControls=previous.fixtures.map(f=>{const p=safeAfterEdit(previous.before,previous.after,f.position);assert(p&&isExitConnected(previous.after,p));return{name:f.name,input:f.position,recovered:p,exitConnected:true}});
const report={head,method:'Exact-source pure helpers and restoreWorld, plus extracted actual post-feature commit tail with supplied candidate maps/state. No browser/legal UI reproduction.',blocked,atomicCommitTail:{rejectedSameGame:rejected===game,gameUnchanged:JSON.stringify(game)===gameBefore,acceptedPosition:accepted.world.position,acceptedFeatureAndJournal:true},pocketControls,malformedFallbackStillInvalid:!blocked.malformedSpawnStandable};
fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(dir,'source-manifest.json'),JSON.stringify({head,files:acquired.map(x=>({path:x.path,gitBlobSha:x.sha,sha256:crypto.createHash('sha256').update(x.content).digest('hex')}))},null,2));console.log(JSON.stringify(report,null,2));
