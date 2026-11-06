import {chromium} from '../../../../node_modules/@playwright/test/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const output='docs/evidence/world/0084/shadows';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
try{const page=await browser.newPage({viewport:{width:1440,height:680}});await page.goto('http://127.0.0.1:5486/src/world/art/landscape/shadow-proof.html');await page.waitForFunction(()=>window.__SHADOW_PROOF__);await page.screenshot({path:output+'/isolated-layers.png',fullPage:true});await writeFile(output+'/evidence.json',JSON.stringify(await page.evaluate(()=>window.__SHADOW_PROOF__),null,2)+'\n');}finally{await browser.close();}
