import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const tag=process.argv[2];if(!['before','after'].includes(tag))throw new Error('Use before or after');
const dir=new URL('./',import.meta.url).pathname;
const sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const productArtHead=execFileSync('git',['log','-1','--format=%H','--','src/world/art/rooftop'],{encoding:'utf8'}).trim();
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const captures=[];
for(const [device,width,height]of [['desktop',1440,1000],['phone',390,844]])for(const phase of ['morning','evening'])for(const [landmark,position]of [['arrival',{x:12.5,y:29}],['city-lookout',{x:44,y:12}]]){
 const game=JSON.parse(await readFile(`${dir}${phase}-fixture.json`,'utf8'));
 game.world={...game.world,mapId:'rooftop',position,facing:landmark==='arrival'?'east':'north',activeActivity:null,activeAnchorId:null,returnPositions:{}};
 const context=await browser.newContext({viewport:{width,height},hasTouch:device==='phone',isMobile:device==='phone',deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(save=>localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(save)),game);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5485/');await page.locator('[data-map="rooftop"] canvas[data-rendered="true"]').waitFor();
 const welcome=page.getByRole('button',{name:/^开门迎客/});await page.waitForTimeout(700);if(await welcome.isVisible()){await welcome.click();await page.locator('.modal-backdrop').waitFor({state:'hidden'});await page.waitForTimeout(200);}if(await page.locator('.modal-backdrop').isVisible())throw new Error('Dialog obscures declared-camera capture');
 const path=`${tag}-${device}-${phase}-${landmark}.png`;await page.screenshot({path:`${dir}${path}`,fullPage:true});
 const canvas=await page.locator('[data-map="rooftop"] canvas').evaluate(c=>({width:c.width,height:c.height,rect:{width:c.getBoundingClientRect().width,height:c.getBoundingClientRect().height}}));
 captures.push({device,phase,landmark,position,served:game.served,sourceHead,productArtHead,canvas,path,errors,fixtureSource:phase==='morning'?'456fce9/integrated-c4ec7ed/desktop-final.json':'456fce9/integrated-23be251/desktop-activity-final.json',note:'Actual production App declared-camera/save fixture; not traversal proof.'});
 await context.close();
}
await browser.close();await writeFile(`${dir}${tag}.json`,JSON.stringify(captures,null,2));if(captures.some(c=>c.errors.length))throw new Error('Browser errors');
