import {chromium} from '../../../node_modules/@playwright/test/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const output='docs/evidence/0084/inspect';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});const results=[];
try{
 for(const [name,motion,position] of [['pond-normal','no-preference',{x:61,y:33}],['pond-reduced','reduce',{x:61,y:33}],['reading-normal','no-preference',{x:31,y:28}],['reading-reduced','reduce',{x:31,y:28}]]){
  const context=await browser.newContext({viewport:{width:1120,height:840},reducedMotion:motion}),page=await context.newPage(),errors=[],failedResponses=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text()+' @ '+m.location().url);});
  page.on('response',r=>{if(r.status()>=400)failedResponses.push({status:r.status(),url:r.url()});});
  await page.goto('http://127.0.0.1:5486/src/world/art/landscape/preview.html');
  await page.evaluate(async position=>{const {createGame}=await import('/src/game.ts'),{content}=await import('/src/content/index.ts'),{saveGame}=await import('/src/save.ts');const game=createGame(content,42);game.world={version:1,mapId:'park',position,facing:'east',returnPositions:{},activeActivity:null};await saveGame(game);localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game));},position);
  await page.goto('http://127.0.0.1:5486/');await page.getByRole('button',{name:/开门迎客/}).click();await page.waitForTimeout(400);
  const canvas=page.locator('[data-testid="world-viewport"] canvas');
  await page.evaluate(()=>{const c=document.querySelector('[data-testid="world-viewport"] canvas');window.__INSPECT_BEFORE__=c.getContext('2d').getImageData(0,0,c.width,c.height).data.slice();});
  await canvas.screenshot({path:`${output}/${name}-before.png`});
  await page.locator('.world-life-options .world-anchor > button:last-child').first().click();await page.waitForTimeout(150);
  const state=await page.evaluate(async()=>{const pending=localStorage.getItem('junyan-waiter-pending-v1');if(pending)return JSON.parse(pending).world;const {loadGame}=await import('/src/save.ts'),{content}=await import('/src/content/index.ts');return (await loadGame(content)).world;});
  const changedPixels=await page.evaluate(()=>{const c=document.querySelector('[data-testid="world-viewport"] canvas'),after=c.getContext('2d').getImageData(0,0,c.width,c.height).data,before=window.__INSPECT_BEFORE__;let changed=0;for(let i=0;i<after.length;i+=4)if(after[i]!==before[i]||after[i+1]!==before[i+1]||after[i+2]!==before[i+2])changed++;return changed;});
  await canvas.screenshot({path:`${output}/${name}-after.png`});
  results.push({name,motion,position,life:state.life,changedPixels,errors,failedResponses});
  await writeFile(output+'/evidence.json',JSON.stringify(results,null,2)+'\n');
  await context.close();
 }
 await writeFile(output+'/evidence.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
