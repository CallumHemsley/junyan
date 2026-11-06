import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const tag='material';
const dir=new URL('./',import.meta.url).pathname,prepared=JSON.parse(await readFile(`${dir}fixtures.json`,'utf8'));
const sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const evening=structuredClone(prepared.fixtures.find(f=>f.phase==='evening'&&f.occupancy==='empty'));
const morning=structuredClone(evening);morning.phase='morning';morning.game.served=0;morning.game.earnings=0;for(const customer of morning.game.customers)customer.phase='seated';
prepared.fixtures=[morning,evening];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});const captures=[];
for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]])for(const f of prepared.fixtures)for(const [view,position]of [['arrival',{x:12.5,y:29}],['care-pocket',{x:19,y:20}]]){
 const game=structuredClone(f.game);game.world.position=position;game.world.facing=view==='arrival'?'east':'north';
 const context=await browser.newContext({viewport:{width,height},hasTouch:device!=='desktop',isMobile:device!=='desktop',deviceScaleFactor:1,serviceWorkers:'block'});
 await context.addInitScript(save=>localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(save)),game);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5485/');await page.locator('[data-map=rooftop] canvas[data-rendered=true]').waitFor();await page.waitForTimeout(700);
 const welcome=page.getByRole('button',{name:/^开门迎客/});if(await welcome.isVisible()){await welcome.click();await page.locator('.modal-backdrop').waitFor({state:'hidden'});await page.waitForTimeout(200);}
 if(await page.locator('.modal-backdrop').isVisible())throw new Error('Obscured fixture');
 const file=`${tag}-${device}-${f.phase}-${f.occupancy}-${view}.png`;await page.screenshot({path:`${dir}${file}`,fullPage:true});
 captures.push({sourceHead,device,viewport:{width,height},phase:f.phase,occupancy:f.occupancy,served:game.served,lifeElapsedInput:game.world.life.elapsedMs,position,garden:game.neighbourhood.garden,particleFields:0,file,ui:{modals:await page.locator('.modal-backdrop').count(),context:await page.locator('.world-context').count()},errors,kind:'production App matched material-phase fixture, same garden/camera/explicit clock; no particle hooks in production map compiler; not travel/progress proof',identityNote:f.phase==='morning'?'Lin remains in restaurant; no rooftop duplicate':f.occupancy==='occupied'?'Existing served/departed Lin follows authored roof route':'Existing service-presence state keeps Lin inside restaurant; same explicit time as occupied fixture'});
 await context.close();
}
await browser.close();await writeFile(`${dir}${tag}.json`,JSON.stringify(captures,null,2));if(captures.some(c=>c.errors.length))throw new Error('Browser errors');
