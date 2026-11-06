import {chromium} from '../../../node_modules/@playwright/test/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const output='docs/evidence/0084/app';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio','--no-sandbox']});const proof=[];
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:960}],['phone',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,hasTouch:device==='phone',isMobile:device==='phone'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5486/src/world/art/landscape/preview.html');
  await page.evaluate(async()=>{const {createGame}=await import('/src/game.ts');const {content}=await import('/src/content/index.ts');const {saveGame}=await import('/src/save.ts');const game=createGame(content,42);game.world={version:1,mapId:'park',position:{x:78,y:10},facing:'east',returnPositions:{},activeActivity:null};await saveGame(game);localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game));});
  await page.goto('http://127.0.0.1:5486/');await page.locator('[data-testid="world-viewport"][data-map="park"]').waitFor();if(await page.getByRole('button',{name:/开门迎客/}).isVisible())await page.getByRole('button',{name:/开门迎客/}).click();await page.waitForTimeout(300);
  await page.screenshot({path:`${output}/${device}-park.png`});
  const canvas=page.locator('[data-testid="world-viewport"] canvas');
  await canvas.click();await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowDown');await page.waitForTimeout(1100);await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowDown');
  await page.locator('[data-testid="world-viewport"][data-map="riverbank"]').waitFor({timeout:4000});await page.screenshot({path:`${output}/${device}-river-arrival.png`});
  await page.evaluate(()=>{const canvas=document.querySelector('[data-testid="world-viewport"] canvas');const recorder=new MediaRecorder(canvas.captureStream(20),{mimeType:'video/webm'}),chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);window.__recording={recorder,chunks};recorder.start();});
  if(device==='phone'){
   const pad=page.getByRole('button',{name:'向右走',exact:true});const bounds=await pad.boundingBox();await page.touchscreen.tap(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
   const r=await canvas.boundingBox();await page.touchscreen.tap(r.x+r.width*.62,r.y+r.height*.51);await page.waitForTimeout(1400);
  }else{await page.keyboard.down('ArrowRight');await page.waitForTimeout(700);await page.keyboard.up('ArrowRight');}
  const bytes=await page.evaluate(()=>new Promise(resolve=>{const {recorder,chunks}=window.__recording;recorder.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer())));recorder.stop();}));await writeFile(`${output}/${device}-movement.webm`,new Uint8Array(bytes));
  const saved=await page.evaluate(async()=>{const {loadGame}=await import('/src/save.ts');const {content}=await import('/src/content/index.ts');return (await loadGame(content)).world;});
  await page.reload();await page.locator('[data-testid="world-viewport"][data-map="riverbank"]').waitFor();if(await page.getByRole('button',{name:/开门迎客/}).isVisible())await page.getByRole('button',{name:/开门迎客/}).click();await page.waitForTimeout(300);
  const loaded=await page.evaluate(async()=>{const {loadGame}=await import('/src/save.ts');const {content}=await import('/src/content/index.ts');return (await loadGame(content)).world;});
  if(saved.mapId!==loaded.mapId||Math.hypot(saved.position.x-loaded.position.x,saved.position.y-loaded.position.y)>.1)throw Error('App reload lost world position');
  await page.screenshot({path:`${output}/${device}-reloaded.png`});
  if(errors.length)throw Error(errors.join('\n'));
  proof.push({device,seededStart:{mapId:'park',position:{x:78,y:10}},saved,loaded,consoleErrors:errors,scope:'actual App travel from park to riverbank and reload; initial valid day save seeded to isolate landscape integration; whole town/activity journey pending'});
  await context.close();
 }
 await writeFile(output+'/evidence.json',JSON.stringify(proof,null,2)+'\n');
}finally{await browser.close();}
