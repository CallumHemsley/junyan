import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const TABLES = [{table:1,x:3,y:4},{table:2,x:9,y:4},{table:3,x:3,y:8},{table:4,x:9,y:8}];
const PHASES = ['seated','ordered','checkout','served'];

export function restaurantFrames(content, count = 200) {
  const appearances = Object.fromEntries(content.orders.map(order => [order.id,content.characters.find(character => character.name === order.customer).appearance]));
  const orders = TABLES.map(table => content.orders.find(order => order.level===1 && order.table===table.table).id);
  const frames = [];
  for(let k=0;k<count;k++) {
    const state = {seed:42,day:1,level:1,player:{x:6,y:6},
      customers:TABLES.map((table,index) => ({table:table.table,orderId:orders[index],phase:PHASES[(k+index)%4]})),
      tray:Array(k%7).fill('bun'),served:0,earnings:0,mistakes:0,activeTable:null,feedback:'none',receipt:null,journal:{},ended:false};
    frames.push([state,{...state.player,yaw:(k%8)*Math.PI/4},k/30,k%2===1]);
  }
  return {appearances, frames};
}

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function captureCanvas() {
  const canvas = {frame:null, getContext:()=>({
    createImageData:(width,height)=>({data:new Uint8ClampedArray(width*height*4)}),
    putImageData:image=>{canvas.frame=image.data;},
  })};
  return canvas;
}

async function loadRoot(root, appearances, orderItems) {
  const scene = resolve(root,'src/scene');
  const {createRenderer} = await import(pathToFileURL(resolve(scene,'renderer.js')).href);
  if(!existsSync(resolve(scene,'restaurant-scene.js'))) return canvas => createRenderer(canvas,TABLES,appearances);
  const {restaurantScene} = await import(pathToFileURL(resolve(scene,'restaurant-scene.js')).href);
  return canvas => createRenderer(canvas,restaurantScene(TABLES,appearances,orderItems));
}

const percentile = (values, p) => {
  const sorted = [...values].sort((a,b) => a-b);
  return sorted[Math.min(sorted.length-1,Math.floor(p*sorted.length))];
};

async function main([trunkRoot, headRoot, outDirectory]) {
  if(!trunkRoot || !headRoot || !outDirectory) throw Error('usage: node src/scene/scene-frame-hashes.mjs <trunk-root> <head-root> <out-dir>');
  const out = resolve(outDirectory);
  await mkdir(out,{recursive:true});
  const content = JSON.parse(await readFile(resolve(headRoot,'src/content/content.json'),'utf8'));
  const {appearances, frames} = restaurantFrames(content);
  const roots = {trunk:await loadRoot(trunkRoot,appearances,Object.fromEntries(content.orders.map(order=>[order.id,order.items]))), head:await loadRoot(headRoot,appearances,Object.fromEntries(content.orders.map(order=>[order.id,order.items])))};
  const result = {trunk:{bake:[],draw:[],hashes:null}, head:{bake:[],draw:[],hashes:null}};
  const firstLast = {};
  for(let round=0;round<10;round++) {
    for(const name of round%2 ? ['head','trunk'] : ['trunk','head']) {
      const canvas = captureCanvas(), hashes = [];
      let start = performance.now();
      const renderer = roots[name](canvas);
      result[name].bake.push(performance.now()-start);
      for(const args of frames) {
        start = performance.now();
        renderer.draw(...args);
        result[name].draw.push(performance.now()-start);
        hashes.push(sha256(canvas.frame));
        if(round===0 && (hashes.length===1 || hashes.length===frames.length)) firstLast[`${hashes.length===1?'first':'last'}-${name}`] = canvas.frame.slice();
      }
      if(result[name].hashes && hashes.some((hash,index) => hash!==result[name].hashes[index])) throw Error(`${name} frames are not deterministic across rounds`);
      result[name].hashes = hashes;
    }
  }
  const {png} = await import('./png.mjs');
  for(const [file,pixels] of Object.entries(firstLast)) await writeFile(resolve(out,`${file}.png`),png(pixels));
  const differ = frames.filter((_,index) => result.trunk.hashes[index]!==result.head.hashes[index]).length;
  const stats = name => ({bakeMedian:percentile(result[name].bake,.5), bakeP95:percentile(result[name].bake,.95),
    drawMedian:percentile(result[name].draw,.5), drawP95:percentile(result[name].draw,.95)});
  const summary = {trunkRoot:resolve(trunkRoot), headRoot:resolve(headRoot), frames:frames.length, differ,
    first30:{trunk:sha256(result.trunk.hashes.slice(0,30).join('\n')), head:sha256(result.head.hashes.slice(0,30).join('\n'))},
    trunk:stats('trunk'), head:stats('head')};
  await writeFile(resolve(out,'frames.json'),JSON.stringify({...summary,
    perFrame:frames.map((_,index) => ({trunk:result.trunk.hashes[index], head:result.head.hashes[index]})),
    timings:{trunk:{bake:result.trunk.bake,draw:result.trunk.draw}, head:{bake:result.head.bake,draw:result.head.draw}}},null,2));
  const ms = value => value.toFixed(3);
  console.log(`${frames.length} frames, ${differ} differ; bake median trunk ${ms(summary.trunk.bakeMedian)} ms head ${ms(summary.head.bakeMedian)} ms; draw median trunk ${ms(summary.trunk.drawMedian)} ms head ${ms(summary.head.drawMedian)} ms`);
  console.log(`bake p95 trunk ${ms(summary.trunk.bakeP95)} ms head ${ms(summary.head.bakeP95)} ms; draw p95 trunk ${ms(summary.trunk.drawP95)} ms head ${ms(summary.head.drawP95)} ms; first 30 sha256 trunk ${summary.first30.trunk} head ${summary.first30.head}`);
  if(differ) process.exitCode = 1;
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
