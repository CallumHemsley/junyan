import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const root='/workspace/junyan/docs/evidence/world/0086/materials';await mkdir(root,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const evidence=[],errors=[];
for(const [name,width,height] of [['desktop',1280,900],['phone',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5488/src/world/atmosphere/materials-study.html');await page.waitForFunction(()=>window.__MATERIALS__);
 for(const scene of ['courtyard','apartment','workshop'])for(const phase of ['morning','evening','night']){
  const state=await page.evaluate(({scene,phase})=>window.__MATERIALS__.draw(scene,phase,true),{scene,phase});
  await page.screenshot({path:`${root}/${name}-${scene}-${phase}.png`});evidence.push({name,...state});
 }
 await page.evaluate(()=>window.__MATERIALS__.draw('courtyard','evening',false));await page.screenshot({path:`${root}/${name}-courtyard-unlit.png`});
 if(name==='desktop'){
  const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.start');
  await page.evaluate(()=>{for(let i=0;i<40;i++)window.__MATERIALS__.draw('courtyard','evening',true);});
  const {profile}=await cdp.send('Profiler.stop');
  await writeFile(`${root}/profile.json`,JSON.stringify(profile.nodes.filter(n=>n.hitCount>0).sort((a,b)=>b.hitCount-a.hitCount).slice(0,12).map(n=>({function:n.callFrame.functionName,url:n.callFrame.url,hits:n.hitCount})),null,2));
  const cost=await page.evaluate(()=>{const rows=[];for(const scene of ['courtyard','apartment','workshop']){for(let i=0;i<6;i++)window.__MATERIALS__.draw(scene,'evening',i%2===0);const runs=[];for(let r=0;r<5;r++){const pair=[];for(const lit of [false,true]){const start=performance.now();for(let i=0;i<8;i++)window.__MATERIALS__.draw(scene,'evening',lit);pair.push({lit,msPerFrame:(performance.now()-start)/8});}runs.push(pair);}rows.push({scene,runs});}return rows;});await writeFile(`${root}/cost.json`,JSON.stringify({claim:'Actual art-callback study cost, including canvas resize, map sampling and all drawing; excludes game movement and DOM. Five interleaved pairs of eight frames; no full-game performance verdict.',cost},null,2));
 }
 await page.close();
}
await browser.close();await writeFile(`${root}/proof.json`,JSON.stringify({errors,evidence},null,2));if(errors.length)throw Error(errors.join('\n'));console.log('Actual material callbacks captured at production 24/18 pixel camera scales; no browser errors.');
