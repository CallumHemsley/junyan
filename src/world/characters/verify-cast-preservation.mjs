import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {frame as after} from './artwork.mjs';
const baseline='85d6d6e0f5c7cb37b427afba2c691e7e881bc4fb';
const source=execFileSync('git',['show',baseline+':src/world/characters/artwork.mjs'],{encoding:'utf8'});
const {frame:before}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const content=JSON.parse(readFileSync(new URL('../../content/content.json',import.meta.url)));
const appearances=[{},...content.characters.map(c=>c.appearance)];
const digest=createHash('sha256');let cases=0;
for(const appearance of appearances)for(let direction=0;direction<8;direction++)for(const action of ['idle','walk','sit','crouch','interact','react'])for(const phase of [0,1,4])for(const carrying of [false,true]){
 const input={appearance,direction,action,phase,carrying};
 const prior=before(input),current=after(input);for(const field of Object.keys(prior))assert.deepEqual(current[field],prior[field]);digest.update(current.pixels);cases++;
}
const result={baseline,cases,exactFrameAndAttachmentEquality:true,comparison:'All preexisting frame fields, including pixels/anchor/held/feet. New pelvis metadata is additive.',pixelHash:digest.digest('hex'),scope:'Player and approved four regulars, all directions and six contextual actions. No background profile selected.'};
mkdirSync(new URL('../../../docs/evidence/world/0085/current/background/',import.meta.url),{recursive:true});
writeFileSync(new URL('../../../docs/evidence/world/0085/current/background/cast-preservation.json',import.meta.url),JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
