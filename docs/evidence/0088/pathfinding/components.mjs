import fs from 'node:fs';import {canStand,canWalk} from './geometry.mjs';
const map=JSON.parse(fs.readFileSync(new URL('./town.json',import.meta.url)));const points=new Map();
for(let x=.5;x<map.bounds.width;x+=.5)for(let y=.5;y<map.bounds.height;y+=.5){const p={x,y};if(canStand(map,p))points.set(`${x},${y}`,p)}
const visited=new Set(),components=[];for(const [k,p] of points){if(visited.has(k))continue;const q=[p];visited.add(k);for(let i=0;i<q.length;i++)for(const [dx,dy] of [[.5,0],[-.5,0],[0,.5],[0,-.5]]){const n={x:q[i].x+dx,y:q[i].y+dy},nk=`${n.x},${n.y}`;if(points.has(nk)&&!visited.has(nk)&&canWalk(map,q[i],n)){visited.add(nk);q.push(n)}}components.push({count:q.length,sample:q[0],containsSpawn:q.some(p=>p.x===34&&p.y===32)})}
fs.writeFileSync(new URL('./components.json',import.meta.url),JSON.stringify({method:'half-tile valid standing grid, edges tested by published canWalk; not proof of all continuous-space topology',components},null,2));console.log(components)
