import {test,expect} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import definitions from './maps.json' with {type:'json'};
import {restaurantMap} from './restaurant.mjs';
const dir='docs/evidence/world/0088/integrated-e02a747';
const maps=[restaurantMap,...definitions];
const sources={morning:'docs/evidence/world/0088/integrated-c4ec7ed/desktop-final.json',evening:'docs/evidence/world/0088/integrated-23be251/desktop-activity-final.json'};
test('LABELLED visual fixture survey; not door travel proof',async({context},info)=>{
 const report:any={head:'e02a747c3b4d4fc6a476ea744ecb6bdc1a738132',kind:'authorized declared-arrival/save fixture survey; NOT travel/activity proof',captures:[]};
 for(const [phase,source] of Object.entries(sources))for(const map of maps){
  const game=structuredClone(JSON.parse(readFileSync(source,'utf8')).state);const entrance=map.entrances[0];
  game.world={...game.world,mapId:map.id,position:{...entrance.position},facing:entrance.facing??'south',activeActivity:null,activeAnchorId:null,returnPositions:{}};
  const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(save=>{localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(save));},game);
  await page.goto('./');await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',map.id);const welcome=page.getByRole('button',{name:'开门迎客'});if(await welcome.isVisible())await welcome.click();await page.locator('canvas[data-rendered="true"]').waitFor();await page.waitForTimeout(700);
  const path=`${dir}/${info.project.name}-${phase}-${map.id}.png`;await page.screenshot({path,fullPage:true});
  report.captures.push({map:map.id,phase,source,entranceId:entrance.id,position:entrance.position,served:game.served,path,errors,viewport:await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio}))});
  await page.close();
 }
 writeFileSync(`${dir}/${info.project.name}-survey.json`,JSON.stringify(report,null,2));expect(report.captures.flatMap((x:any)=>x.errors)).toEqual([]);
});
