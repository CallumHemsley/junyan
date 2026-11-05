import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from '@playwright/test';
import {createRenderer, WIDTH} from './renderer.js';
import {restaurantScene} from './restaurant-scene.js';
import {portraitScene} from './portrait-scene.js';
import {png} from './png.mjs';

const directory = resolve(process.argv[2] ?? 'output/playwright/0022-first-pass');
await mkdir(directory, {recursive:true});
const content = JSON.parse(await readFile(new URL('../content/content.json',import.meta.url),'utf8'));
const tables = [{table:1,x:3,y:4},{table:2,x:9,y:4},{table:3,x:3,y:8},{table:4,x:9,y:8}];
const appearances = Object.fromEntries(content.orders.map(order => [order.id,content.characters.find(character => character.name === order.customer).appearance]));
const state = {seed:42,day:1,level:1,player:{x:6,y:6},customers:tables.map(table => ({table:table.table,orderId:content.orders.find(order => order.level===1 && order.table===table.table).id,phase:'seated'})),tray:[],served:0,earnings:0,mistakes:0,activeTable:null,feedback:'none',receipt:null,journal:{},ended:false};
let frame;
const renderer = createRenderer({getContext:()=>({createImageData:(width,height)=>({data:new Uint8ClampedArray(width*height*4)}),putImageData:image=>{frame=image.data.slice();}})},restaurantScene(tables,appearances,Object.fromEntries(content.orders.map(order=>[order.id,order.items]))));
const cards=[];
for(const [mode,tray,time,moving] of [['empty',[],0,false],['full',Array(6).fill('bun'),0,false],['walk-a',Array(6).fill('bun'),.1,true],['walk-b',Array(6).fill('bun'),.35,true]]) {
  for(const [direction,yaw] of [['east',0],['south-east',Math.PI/4],['south',Math.PI/2],['south-west',Math.PI*.75],['west',Math.PI],['north-west',Math.PI*1.25],['north',Math.PI*1.5],['north-east',Math.PI*1.75]]) {
    renderer.draw({...state,tray},{...state.player,yaw},time,moving);
    const bytes=png(frame),name=`${mode}-${direction}.png`;
    await writeFile(resolve(directory,name),bytes);
    cards.push(`<figure><figcaption>${mode} / ${direction} / t=${time}</figcaption><img src="data:image/png;base64,${bytes.toString('base64')}" /></figure>`);
  }
}
const html=`<!doctype html><meta charset="utf-8"><style>body{margin:16px;background:#f4eee4;color:#241d16;font:14px system-ui}main{display:grid;grid-template-columns:repeat(4,360px);gap:12px}figure{margin:0}img{width:360px;height:280px;image-rendering:pixelated}figcaption{padding:6px}</style><main>${cards.join('')}</main>`;
await writeFile(resolve(directory,'contact-sheet.html'),html);
const portraits=createRenderer({getContext:()=>({createImageData:(width,height)=>({data:new Uint8ClampedArray(width*height*4)}),putImageData:image=>{frame=image.data.slice();}})},portraitScene());
const portraitCards=[];
for(const seated of [false,true]) for(const [name,yaw] of [['front',Math.PI/4],['back',Math.PI*1.25]]) {
  for(const character of [{id:'waiter',appearance:{}},...content.characters]) {
    portraits.draw(character.appearance,yaw,{carry:!character.appearance.accessory,crouch:seated?1:0,scale:seated?.88:1},['bun','bun','bun']);
    const width=58,height=65,crop=new Uint8ClampedArray(width*height*4);
    for(let row=0;row<height;row++) crop.set(frame.subarray(((row+95)*WIDTH+155)*4,((row+95)*WIDTH+155+width)*4),row*width*4);
    const bytes=png(crop,width,height);
    const label=`${character.id}-${seated?'seated':'standing'}-${name}`;
    await writeFile(resolve(directory,`${label}.png`),bytes);
    portraitCards.push(`<figure><figcaption>${label}</figcaption><img src="data:image/png;base64,${bytes.toString('base64')}" /></figure>`);
  }
}
const portraitHtml=`<!doctype html><meta charset="utf-8"><style>body{margin:12px;background:#f4eee4;color:#241d16;font:12px system-ui}main{display:grid;grid-template-columns:repeat(5,190px);gap:8px}figure{margin:0}img{width:174px;height:195px;image-rendering:pixelated}figcaption{padding:6px}</style><main>${portraitCards.join('')}</main>`;
await writeFile(resolve(directory,'cast-contact-sheet.html'),portraitHtml);
const browser=await chromium.launch({args:['--mute-audio']});
try {
  const page=await browser.newPage({viewport:{width:1510,height:1300}});
  await page.setContent(html);
  await page.screenshot({path:resolve(directory,'waiter-directions.png'),fullPage:true});
  await page.setViewportSize({width:1010,height:950});
  await page.setContent(portraitHtml);
  await page.screenshot({path:resolve(directory,'cast-contact-sheet.png'),fullPage:true});
} finally { await browser.close(); }
console.log(directory);
