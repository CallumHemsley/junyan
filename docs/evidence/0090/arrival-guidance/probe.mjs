import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const fixture=JSON.parse(await readFile('docs/evidence/0090/arrival-guidance/fixture.json','utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const results=[];
for(const viewport of [{width:390,height:664},{width:320,height:568}]){
 const page=await browser.newPage({viewport,reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:5497/junyan/');
 await page.evaluate(async save=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});await new Promise((resolve,reject)=>{const t=db.transaction('saves','readwrite');t.objectStore('saves').put(save,'v1');t.oncomplete=resolve;t.onerror=reject;});db.close();localStorage.removeItem('junyan-waiter-pending-v1');},fixture.fixture);
 await page.reload();await page.getByRole('button',{name:/开门迎客/}).click();
 await page.locator('.world-life-options .world-anchor').first().waitFor();
 await page.screenshot({path:`docs/evidence/0090/arrival-guidance/${viewport.width}-adjacent-baseline.png`});
 const anchors=await page.locator('.world-life-options .world-anchor').evaluateAll(es=>es.map(e=>({text:e.textContent,buttons:[...e.querySelectorAll('button')].map(b=>({aria:b.getAttribute('aria-label'),word:b.hasAttribute('data-word-lookup'),width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}))})));
 const token=page.locator('.world-life-options [data-word-lookup]').first();await token.click();await page.locator('.word-popover').waitFor();await page.keyboard.press('Escape');await page.waitForTimeout(100);const focus=await token.evaluate(e=>e===document.activeElement);
 assert(focus);results.push({viewport,profile:fixture.profile,head:fixture.head,anchors,focusReturned:focus});await page.close();
}
await writeFile('docs/evidence/0090/arrival-guidance/observations.json',JSON.stringify(results,null,2)+'\n');await browser.close();
