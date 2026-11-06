import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const dir=new URL('./',import.meta.url);
const before=JSON.parse(await readFile(new URL('before.json',dir),'utf8'));
const after=JSON.parse(await readFile(new URL('after.json',dir),'utf8'));
assert.equal(before.length,8);assert.equal(after.length,8);
const comparisons=before.map(b=>{
 const a=after.find(x=>x.device===b.device&&x.phase===b.phase&&x.landmark===b.landmark);assert.ok(a);
 for(const key of ['device','phase','landmark','position','served','canvas','uiState'])assert.deepEqual(a[key],b[key],`${b.path}: ${key}`);
 assert.equal(b.uiState.blockingModals,0);assert.equal(b.uiState.contextualPanels,0);
 assert.deepEqual(b.errors,[]);assert.deepEqual(a.errors,[]);assert.notEqual(a.asset,b.asset);
 return {device:b.device,phase:b.phase,landmark:b.landmark,before:b.path,after:a.path,uiState:b.uiState,position:b.position,canvas:b.canvas,beforeBuild:b.sourceHead,afterBuild:a.sourceHead,beforeAsset:b.asset,afterAsset:a.asset,kind:'matched declared-save/camera fixture; not travel proof'};
});
const payloadDiff=execFileSync('git',['diff','--name-only','2d22909','--','src','public','package.json','pnpm-lock.yaml','vite.config.ts','tsconfig.json','docs/evidence/0083','docs/tickets/0083-rooftop.md'],{encoding:'utf8'}).trim();
assert.equal(payloadDiff,'','Ready payload or historical numeric evidence changed during evidence repair');
await writeFile(new URL('matched-pairs.json',dir),JSON.stringify({readyProduct:'2d22909',baselineBuild:'e02a747',productAndHistoricalDiff:[],comparisons},null,2));
console.log('8 matched unobstructed fixture pairs; ready product and historical numeric files unchanged.');
