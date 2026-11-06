import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const stage=process.argv[2]??'after',output=`docs/evidence/world/0084/e02/${stage}`;await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio','--no-sandbox']});const proof=[];
try{for(const device of ['desktop','phone'])for(const phase of ['morning','evening']){
 const context=await browser.newContext({viewport:device==='phone'?{width:390,height:844}:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5486/src/world/art/landscape/preview.html');
 const fixtures=await page.evaluate(async()=>{const {mapDefinitions}=await import('/src/world/maps/landscape/index.ts');return mapDefinitions.flatMap(m=>[{id:m.id+'-default',mapId:m.id,position:m.defaultSpawn},{id:m.id+'-first-entrance',mapId:m.id,position:m.entrances[0].position}]);});
 if(stage!=='before')fixtures.push(...[{id:'orchard-approach',mapId:'park',position:{x:16,y:56}},{id:'orchard-basket',mapId:'park',position:{x:16,y:52}},{id:'pond-approach',mapId:'park',position:{x:65,y:36}},{id:'pond-deck',mapId:'park',position:{x:61,y:33}},{id:'ferry-approach',mapId:'riverbank',position:{x:62,y:61}},{id:'old-ferry',mapId:'riverbank',position:{x:62,y:57}}]);
 for(const fixture of fixtures){
  await page.evaluate(async({phase,fixture})=>{const {createGame,getOrder,orderTotal}=await import('/src/game.ts'),{content}=await import('/src/content/index.ts'),{saveGame}=await import('/src/save.ts');const game=createGame(content,42);if(phase==='evening'){for(const c of game.customers.slice(0,3)){game.earnings+=orderTotal(getOrder(game,c.table,content),content);c.phase='served';}game.served=3;}game.world={version:1,mapId:fixture.mapId,position:fixture.position,facing:'east',returnPositions:{},activeActivity:null};await saveGame(game);localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game));},{phase,fixture});
  await page.goto('http://127.0.0.1:5486/');const viewport=page.locator(`[data-testid="world-viewport"][data-map="${fixture.mapId}"]`);await viewport.waitFor();const open=page.getByRole('button',{name:/开门迎客/});if(await open.isVisible())await open.click();await page.waitForTimeout(100);
  await page.screenshot({path:`${output}/${device}-${phase}-${fixture.id}.png`});proof.push({device,phase,...fixture,errors:[...errors]});
 }await context.close();
}if(proof.some(p=>p.errors.length))throw Error(JSON.stringify(proof.filter(p=>p.errors.length)));await writeFile(output+'/evidence.json',JSON.stringify({stage,basis:'owner branch; actual App; fixed valid day save fixtures; reduced motion particles off; no travel claim',proof},null,2)+'\n');}finally{await browser.close();}
