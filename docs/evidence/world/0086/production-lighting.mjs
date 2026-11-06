import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const root='/workspace/junyan/docs/evidence/world/0086/production';await mkdir(root,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const errors=[],evidence=[];
for(const [name,width,height]of[['desktop',1280,900],['phone',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5488/src/world/atmosphere/production-lighting.html');await page.waitForFunction(()=>window.__PRODUCTION_LIGHTING__);
 for(const map of ['courtyard','apartment','workshop','park','riverbank'])for(const phase of ['morning','evening','night']){
  const state=await page.evaluate(({map,phase})=>window.__PRODUCTION_LIGHTING__.draw(map,phase),{map,phase});
  await page.screenshot({path:`${root}/${name}-${map}-${phase}.png`});evidence.push({name,...state});
 }
 await page.close();
}
await browser.close();await writeFile(`${root}/proof.json`,JSON.stringify({source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),foundation:'23be251',claim:'Native production painter snapshots with explicit service-progress render fixtures. No gameplay/persistence acceptance.',errors,evidence},null,2));
if(errors.length)throw Error(errors.join('\n'));console.log('Native production painter snapshots complete; no console errors.');
