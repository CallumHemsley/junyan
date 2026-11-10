import {test,expect,type Page} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import {content} from '../src/content';
import {createGame} from '../src/game';
import {seedDayOne} from './opening';
import {savedGame} from './world-journey';
import {privateArtifact} from './private-artifacts';
import type {Facing,Point} from '../src/world/schema';

type Sample={map:string;direction:number;phase:number;action:string;pixelHash:number};
const samples=(page:Page)=>page.evaluate(()=>(globalThis as typeof globalThis&{__HEADING_SAMPLES__?:Sample[]}).__HEADING_SAMPLES__??[]);

// Observe the actual artwork calls and returned pixels; no production hook or UI is added.
async function observeHeading(page:Page){
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.route(/\/src\/world\/characters\/artwork\.mjs(?:\?.*)?$/,async route=>{
    const response=await route.fetch();
    const body=(await response.text()).replace('export function frame(','function sourceFrame(')+`
export function frame(options){
 const picture=sourceFrame(options);
 if(options.appearance?.accessory==='player'){
  let pixelHash=2166136261;for(const byte of picture.pixels)pixelHash=Math.imul(pixelHash^byte,16777619)>>>0;
  (globalThis.__HEADING_SAMPLES__??=[]).push({map:document.querySelector('[data-testid="world-viewport"]')?.dataset.map,direction:options.direction,phase:options.phase,action:options.action,pixelHash});
 }
 return picture;
}`;
    await route.fulfill({response,body});
  });
  return errors;
}
// The restaurant and the town are drawn by the pixel engine now (tickets 0157, 0174); this artwork
// still draws the courtyard, so the heading is observed there, at its entrance from town.
const COURTYARD={x:23,y:33.5};
async function restore(page:Page,baseURL:string,facing:Facing,position:Point=COURTYARD,mapId='courtyard'){
  const game=createGame(content,42);
  game.world={version:1,mapId,position,facing,returnPositions:{},activeActivity:null,activeAnchorId:null};
  await seedDayOne(page,baseURL,game);
  await page.goto('/?opening=skip');
  await page.getByRole('button',{name:'开门迎客'}).click();
  await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',mapId);
  if(mapId==='courtyard')await expect.poll(async()=>(await samples(page)).length).toBeGreaterThan(0);
}

for(const [facing,direction]of [['north',3],['east',1],['south',7],['west',5]] as const){
  test(`restored ${facing} draws that heading before any movement`,async({page,baseURL},info)=>{
    const errors=await observeHeading(page);
    await page.emulateMedia({reducedMotion:'reduce'});
    await restore(page,baseURL!,facing);
    const trace=await samples(page);
    await writeFile(privateArtifact(`heading/${info.project.name}-restore-${facing}.json`),JSON.stringify(trace,null,2));
    await page.screenshot({path:privateArtifact(`heading/${info.project.name}-restore-${facing}.png`),fullPage:true});
    expect(trace[0].direction).toBe(direction);
    expect(trace.every(sample=>sample.direction===direction)).toBe(true);
    expect((await savedGame(page)).world).toMatchObject({position:COURTYARD,facing});
    expect(errors).toEqual([]);
  });
}

test('continuous diagonal heading and gait survive stopping, then a discrete pad step turns the avatar',async({page,baseURL},info)=>{
  const errors=await observeHeading(page);
  await restore(page,baseURL!,'north');
  await page.getByTestId('world-viewport').focus();
  const before=(await savedGame(page)).world!.position;
  await page.keyboard.down('ArrowUp');
  try{
    await expect.poll(async()=>Math.hypot((await savedGame(page)).world!.position.x-before.x,(await savedGame(page)).world!.position.y-before.y)).toBeGreaterThan(.8);
  }finally{await page.keyboard.up('ArrowUp');}
  await expect.poll(async()=>(await samples(page)).at(-1)).toMatchObject({direction:4,action:'idle'});
  const walking=(await samples(page)).filter(sample=>sample.action==='walk');
  expect(walking.every(sample=>sample.direction===4)).toBe(true);
  expect(new Set(walking.map(sample=>sample.phase)).size).toBeGreaterThan(2);
  expect(new Set(walking.map(sample=>sample.pixelHash)).size).toBeGreaterThan(1);
  const stopped=(await savedGame(page)).world!.position;
  await page.getByRole('button',{name:'向后走',exact:true}).press('Enter');
  await expect.poll(async()=>(await savedGame(page)).world!.position).not.toEqual(stopped);
  await expect.poll(async()=>(await samples(page)).at(-1)?.direction).toBe(0);
  await page.screenshot({path:privateArtifact(`heading/${info.project.name}-pad-after-diagonal.png`),fullPage:true});
  await writeFile(privateArtifact(`heading/${info.project.name}-movement.json`),JSON.stringify(await samples(page),null,2));
  expect(errors).toEqual([]);
});

test('the first rendered sample after a physical doorway uses the destination entrance facing',async({page,baseURL},info)=>{
  const errors=await observeHeading(page);
  // From the town's lane below the moon gate (town tiles), walking up leaves for the courtyard, whose
  // entrance from town faces north.
  await restore(page,baseURL!,'west',{x:45,y:2.4},'town');
  await page.getByTestId('world-viewport').focus();
  await page.keyboard.down('ArrowUp');
  try{await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map','courtyard');}
  finally{await page.keyboard.up('ArrowUp');}
  await expect.poll(async()=>(await samples(page)).some(sample=>sample.map==='courtyard')).toBe(true);
  const trace=await samples(page);
  expect(trace.find(sample=>sample.map==='courtyard')).toMatchObject({direction:3,phase:0,action:'idle'});
  await page.screenshot({path:privateArtifact(`heading/${info.project.name}-doorway.png`),fullPage:true});
  await writeFile(privateArtifact(`heading/${info.project.name}-doorway.json`),JSON.stringify(trace,null,2));
  expect(errors).toEqual([]);
});
