import {chromium} from '@playwright/test';
import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const page=await browser.newPage({viewport:{width:1200,height:1500},deviceScaleFactor:1});const errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto('http://localhost:5499/docs/evidence/world/0091/fade.html');await page.waitForFunction(()=>window.__FOLIAGE_FADE__);
for(const s of ['camphor','willow','fruit'])for(const alpha of [.3,.5])for(const mode of ['direct','group'])await page.locator('[id="fade-'+s+'-'+alpha+'-'+mode+'"]').screenshot({path:new URL(`./fade-${s}-${alpha}-${mode}.png`,import.meta.url).pathname});
const result=await page.evaluate(()=>window.__FOLIAGE_FADE__);result.consoleErrors=errors;result.foliageSourceSha256=createHash('sha256').update(await readFile(new URL('../../../../src/world/art/landscape/foliage.ts',import.meta.url))).digest('hex');
for(const m of result.metrics){if(m.actorCoverageFraction<.8)throw Error('Insufficient actual actor overlap');if(m.mode==='group'&&m.treePixelsAboveRequestedPlusOneByte!==0)throw Error('Isolated group alpha violation');if(m.mode==='direct'&&m.treeFractionAboveRequestedPlusOneByte<.5)throw Error('Direct accumulation no longer reproduced');}
if(errors.length)throw Error(errors.join('\n'));
await writeFile(new URL('./fade-checks.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(result.metrics);await browser.close();
