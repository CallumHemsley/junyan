import { execFileSync } from 'node:child_process';
import { mkdir, writeFile, symlink } from 'node:fs/promises';
const target='docs/evidence/0089/actor-b1fcbca/src/world/characters';
await mkdir(target,{recursive:true});
for(const file of ['index.ts','adapter.ts','artwork.mjs','artwork.d.mts','catalog.ts','background.ts']) {
 const source=execFileSync('git',['show',`b1fcbca6dc28d8d7327e014b34a518b74001d1a2:src/world/characters/${file}`]);
 await writeFile(`${target}/${file}`,source);
}
try { await symlink('../../../../../src/content','docs/evidence/0089/actor-b1fcbca/src/content','dir'); } catch(error) { if(error.code!=='EEXIST')throw error; }
