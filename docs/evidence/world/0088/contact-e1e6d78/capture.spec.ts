import {test,expect} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import definitions from '../../../0088/integrated-e02a747/maps.json' with {type:'json'};
import {restaurantMap} from '../../../0088/integrated-e02a747/restaurant.mjs';
const dir='docs/evidence/world/0088/contact-e1e6d78';
test('declared arrival and recorded receipt visual fixtures only',async({context},info)=>{
 const morningSource='docs/evidence/0088/integrated-c4ec7ed/desktop-final.json';
 const morning=JSON.parse(readFileSync(morningSource,'utf8')).state;
 const journeySource='docs/evidence/0088/integrated-e02a747/desktop-journey-events.jsonl';
 const receipt=readFileSync(journeySource,'utf8').trim().split('\n').map(x=>JSON.parse(x)).find(x=>x.stage==='receipt-seated-1');expect(receipt).toBeTruthy();
 const cases:any[]=[];
 for(const map of [restaurantMap,definitions.find((m:any)=>m.id==='town')]){const game=structuredClone(morning),e=map.entrances[0];game.world={...game.world,mapId:map.id,position:e.position,facing:e.facing??'south',activeActivity:null,activeAnchorId:null,returnPositions:{}};cases.push({name:`morning-${map.id}`,game,source:morningSource,method:'first declared arrival fixture',entrance:e.id});}
 cases.push({name:'receipt-seated-1',game:receipt.state,source:journeySource,method:'unmodified recorded ordinary e02 receipt-seated-1 save fixture'});
 const report:any={head:'e1e6d78c548b8c9bcd7a2a727e0e71a2b5041200',kind:'AUTHORIZED VISUAL FIXTURE; not new travel/service proof; scale18 current, not future15 trial',captures:[]};
 for(const c of cases){const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(g=>localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(g)),c.game);await page.goto('./');await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map',c.game.world.mapId);const welcome=page.getByRole('button',{name:'开门迎客'});if(await welcome.isVisible())await welcome.click();await page.locator('canvas[data-rendered="true"]').waitFor();await page.waitForTimeout(700);const file=`${info.project.name}-${c.name}.png`;await page.screenshot({path:`${dir}/${file}`,fullPage:true});report.captures.push({name:c.name,file,source:c.source,sourceSha256:createHash('sha256').update(readFileSync(c.source)).digest('hex'),method:c.method,entrance:c.entrance,position:c.game.world.position,fixtureState:c.game,errors,viewport:await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio})),blockingModals:await page.locator('.modal-backdrop').count()});await page.close();}
 writeFileSync(`${dir}/${info.project.name}-manifest.json`,JSON.stringify(report,null,2));expect(report.captures.flatMap((c:any)=>c.errors)).toEqual([]);
});
