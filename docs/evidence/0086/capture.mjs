import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const root='/workspace/junyan/docs/evidence/0086';
await mkdir(`${root}/screens`,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
const errors=[];
for(const [name,width,height] of [['desktop',1280,800],['phone',390,844]]){
 const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:`${root}/motion`,size:{width:640,height:480}}});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
 await page.goto('http://127.0.0.1:5488/src/world/atmosphere/harness.html');
 await page.waitForFunction(()=>window.__ATMOSPHERE__?.frames>5);
 await page.evaluate(()=>window.__ATMOSPHERE__.freeze(5000));
 for(const phase of ['morning','noon','evening','night']){
  await page.locator(`[data-phase="${phase}"]`).click();
  await page.screenshot({path:`${root}/screens/${name}-${phase}.png`,fullPage:true});
 }
 await page.locator('[data-phase="evening"]').click();
 await page.locator('#treatment').click();
 await page.screenshot({path:`${root}/screens/${name}-wash.png`,fullPage:true});
 await page.locator('#treatment').click();
 await page.locator('#motion').click();
 await page.screenshot({path:`${root}/screens/${name}-reduced.png`,fullPage:true});
 await page.locator('#motion').click();
 await page.evaluate(()=>window.__ATMOSPHERE__.animate());
 const motion=await page.evaluate(async()=>{const c=document.querySelector('canvas'),a=c.toDataURL();for(let i=0;i<45;i++)await new Promise(requestAnimationFrame);return {changed:a!==c.toDataURL()};});
 if(!motion.changed)throw Error('Atmosphere did not animate');
 const before=await page.evaluate(()=>({...window.__ATMOSPHERE__.camera}));
 await page.keyboard.press('ArrowRight');
 const after=await page.evaluate(()=>({...window.__ATMOSPHERE__.camera}));
 if(before.x===after.x)throw Error('Camera did not move');
 await page.locator('canvas').click({position:{x:width/2,y:60}});
 await page.screenshot({path:`${root}/screens/${name}-camera.png`,fullPage:true});
 await writeFile(`${root}/${name}-capture.json`,JSON.stringify({before,after,motion,errors},null,2));
 await context.close();
}
await browser.close();
if(errors.length)throw Error(errors.join('\n'));
console.log('Captured four phases, wash comparison, reduced motion and camera input at two viewport sizes; console clean.');
