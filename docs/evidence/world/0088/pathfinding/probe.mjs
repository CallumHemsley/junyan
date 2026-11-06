import fs from 'node:fs';import {canStand,canWalk,findPath} from './geometry.mjs';
const map=JSON.parse(fs.readFileSync(new URL('./town.json',import.meta.url)));const from=map.defaultSpawn;const results=[];
for(const p of [...map.entrances,...map.landmarks,...map.anchors]){const to=p.position,stand=canStand(map,to),direct=canWalk(map,from,to);const t=performance.now();const path=findPath(map,from,to);results.push({id:p.id,to,stand,direct,ms:performance.now()-t,length:path.length});}
fs.writeFileSync(new URL('./probe.json',import.meta.url),JSON.stringify(results,null,2));console.log(results);
