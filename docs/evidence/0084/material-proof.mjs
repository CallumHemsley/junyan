import {chromium} from '../../../node_modules/@playwright/test/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const output='docs/evidence/0084/materials';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio','--no-sandbox']});const proof=[];
try{
 for(const device of ['desktop','phone'])for(const phase of ['morning','evening']){
  const context=await browser.newContext({viewport:device==='phone'?{width:390,height:844}:{width:1440,height:960},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5486/src/world/art/landscape/preview.html');
  await page.evaluate(async phase=>{const {createGame,getOrder,orderTotal}=await import('/src/game.ts'),{content}=await import('/src/content/index.ts'),{saveGame}=await import('/src/save.ts');const game=createGame(content,42);if(phase==='evening'){for(const c of game.customers.slice(0,3)){game.earnings+=orderTotal(getOrder(game,c.table,content),content);c.phase='served';}game.served=3;}game.world={version:1,mapId:'park',position:{x:53,y:21},facing:'east',returnPositions:{},activeActivity:null};await saveGame(game);localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game));},phase);
  await page.goto('http://127.0.0.1:5486/');await page.getByRole('button',{name:/开门迎客/}).click();await page.waitForTimeout(350);
  const canvas=page.locator('[data-testid="world-viewport"] canvas');await canvas.screenshot({path:`${output}/${device}-${phase}-materials.png`});
  const result=await page.evaluate(async phase=>{const {colorShader}=await import('/src/world/lighting.ts'),{sampleDayLight}=await import('/src/world/atmosphere/index.ts');const canvas=document.querySelector('[data-testid="world-viewport"] canvas'),data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,hist=new Map();for(let i=0;i<data.length;i+=4){const hex='#'+[data[i],data[i+1],data[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('');hist.set(hex,(hist.get(hex)??0)+1);}const shade=colorShader(sampleDayLight(phase));return {phase,mapId:'park',position:{x:53,y:21},particles:'off through reducedMotion',width:canvas.width,height:canvas.height,materials:[['wood','#7e6d4e'],['foliage','#6c8e58'],['masonry','#b1ae94']].map(([name,base])=>({name,base,output:shade(base),visiblePixelCount:hist.get(shade(base))??0}))};},phase);
  if(errors.length)throw Error(errors.join('\n'));proof.push({device,...result,consoleErrors:errors});
  if(phase==='evening'){await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(300);await canvas.screenshot({path:`${output}/${device}-evening-lit.png`});}
  await context.close();
 }
 for(const device of ['desktop','phone']){const morning=proof.find(p=>p.device===device&&p.phase==='morning'),evening=proof.find(p=>p.device===device&&p.phase==='evening');for(let i=0;i<3;i++){if(morning.materials[i].output===evening.materials[i].output)throw Error('Material unchanged');if(!morning.materials[i].visiblePixelCount||!evening.materials[i].visiblePixelCount)throw Error('Material absent from actual canvas');}}
 await writeFile(output+'/evidence.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof,null,2));
}finally{await browser.close();}
