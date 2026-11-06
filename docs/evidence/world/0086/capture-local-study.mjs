import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const variant=process.env.LOCAL_LIGHT_VARIANT??'candidate';
const root=`/workspace/junyan/docs/evidence/world/0086/study-${variant}`;await mkdir(root,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const errors=[],evidence=[];
for(const [name,width,height]of[['desktop',1440,1000],['phone',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5488/src/world/atmosphere/local-light-study.html');await page.waitForFunction(()=>window.__LOCAL_LIGHT_STUDY__);
 for(const site of ['workshop-bench','workshop-entry','courtyard-window','courtyard-laundry','rooftop-threshold','rooftop-care'])for(const phase of ['morning','evening']){
  for(const occupied of site.endsWith('bench')||site.endsWith('window')||site.endsWith('threshold')?[false,true]:[true]){
   const state=await page.evaluate(({site,phase,occupied})=>window.__LOCAL_LIGHT_STUDY__.draw(site,phase,occupied),{site,phase,occupied});
   if(!state.legalApproach)throw Error(`No legal approach: ${JSON.stringify(state)}`);
   const path=`${root}/${name}-${site}-${phase}-${occupied?'occupied':'empty'}.png`;
   await page.screenshot({path});evidence.push({name,...state,path});
  }
 }
 await page.close();
}
await browser.close();await writeFile(`${root}/proof.json`,JSON.stringify({variant,scope:'Fixed native painter composition fixtures, not gameplay/performance acceptance.',errors,evidence},null,2));if(errors.length)throw Error(errors.join('\n'));console.log(`${variant}: matched native landmark compositions captured; no browser errors.`);
