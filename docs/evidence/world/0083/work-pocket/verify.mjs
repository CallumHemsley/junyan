import {readFile,writeFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const dir=new URL('./',import.meta.url).pathname;
const load=async n=>JSON.parse(await readFile(`${dir}${n}.json`,'utf8'));
const before=await load('before'),after=await load('after'),pairs=[];
assert.equal(before.length,18);assert.equal(after.length,18);
for(let i=0;i<18;i++){
 const a=before[i],b=after[i];for(const key of ['device','viewport','phase','occupancy','served','lifeElapsedInput','position','ui'])assert.deepEqual(a[key],b[key]);assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);assert.deepEqual(b.ui,{modals:0,context:0});
 pairs.push({before:a.file,after:b.file,device:b.device,phase:b.phase,occupancy:b.occupancy,viewport:b.viewport,position:b.position,lifeElapsedInput:b.lifeElapsedInput,ui:b.ui});
}
const material=await load('material');assert.equal(material.length,8);
for(const a of material.filter(c=>c.phase==='morning')){
 const b=material.find(c=>c.phase==='evening'&&c.device===a.device&&c.position.x===a.position.x&&c.position.y===a.position.y);assert.ok(b);
 for(const key of ['viewport','lifeElapsedInput','position','garden','ui','particleFields'])assert.deepEqual(a[key],b[key]);assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);
}
const traversal=await load('traversal');for(const r of traversal){assert.equal(r.steps.length,8);assert.deepEqual(r.errors,[]);assert.equal(r.wateredGarden.plants.climber.care,'ready');assert.equal(r.movedGarden.plants.climber.site,1);assert.equal(r.returnedWorld.mapId,'rooftop');assert.deepEqual(r.returnedWorld.position,{x:12.5,y:29});}
const motion=await load('resident-motion');assert.deepEqual(motion.errors,[]);assert.ok(motion.activities.includes('work'));assert.ok(motion.activities.includes('walk'));
const hashes={};for(const name of await readdir(dir))if(/\.(png|mp4|webm)$/.test(name))hashes[name]=createHash('sha256').update(await readFile(`${dir}${name}`)).digest('hex');
await writeFile(`${dir}verified.json`,JSON.stringify({pairs,materialPairs:4,traversals:traversal.map(r=>({device:r.device,steps:r.steps.length,errors:r.errors})),residentActivities:motion.activities,hashes,claim:'Bounded production evidence only. Not independent art acceptance or full opening/service/world completion.'},null,2));console.log('18 art pairs, 4 matched material phase pairs, 2 input/progress/reload/stair runs and actual work/walk recording verified');
