import {chromium} from '../../../../node_modules/@playwright/test/index.mjs';
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const evidence=fileURLToPath(new URL('.',import.meta.url));
const base='http://127.0.0.1:5483';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--mute-audio']});
const results=[];
try {
 for(const [name,width,height] of [['desktop',1440,900],['phone',390,844]]){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',serviceWorkers:'block',hasTouch:name==='phone',isMobile:name==='phone'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/src/world/art/residential/harness.html');
  await page.evaluate(async()=>{
   const [{createGame},{content}]=await Promise.all([import('/src/game.ts'),import('/src/content/index.ts')]);
   const game=createGame(content);game.neighbourhood.location='apartment';
   game.journal.bun={lookups:2,lastSeen:1.5,recovered:true};
   game.world={version:1,mapId:'apartment',position:{x:17.5,y:13.5},facing:'north',returnPositions:{},activeActivity:null,activeAnchorId:null};
   const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('junyan-waiter',1);request.onupgradeneeded=()=>request.result.createObjectStore('saves');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
   await new Promise((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(game,'v1');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
  });
  await page.goto(base+'/');
  await page.getByTestId('world-viewport').waitFor();
  const help=page.getByRole('button',{name:'开门迎客'});if(await help.isVisible())await help.click();
  await page.locator('[data-world-anchor="apartment.furnish"]').click();
  await page.getByRole('button',{name:'收下',exact:true}).click();
  const canvas=page.locator('.connected-world canvas');
  await page.waitForTimeout(200);
  const before=createHash('sha256').update(await canvas.screenshot()).digest('hex');
  const saved=()=>page.evaluate(async()=>{
   const db=await new Promise(resolve=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);});
   const state=await new Promise(resolve=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);});db.close();return state;
  });
  let previewProof=null;
  async function place(row,column,item='桌子'){
   await page.getByRole('button',{name:new RegExp(item+'.*(收着|屋里)')}).click();
   if(!await page.locator('.apartment-floor-grid').isVisible())await page.getByRole('button',{name:'选格子',exact:true}).click();
   await page.getByRole('button',{name:new RegExp(`^第${row}行第${column}格(?:，.*)?$`)}).click();
   if(!previewProof){
    await page.waitForTimeout(500);const preview=await saved(),pixels=createHash('sha256').update(await canvas.screenshot()).digest('hex');
    previewProof={selected:preview.neighbourhood.apartment.selected,placements:preview.neighbourhood.apartment.placements,pixelsChanged:pixels!==before};
    if(previewProof.placements.length!==1||!previewProof.pixelsChanged)throw Error('world preview changed placement or failed to render');
    await page.screenshot({path:evidence+`${name}-normal-game-preview.png`});
   }
   await page.getByRole('button',{name:'放这里',exact:true}).click();
   await page.waitForTimeout(500);
   const ids={'桌子':'table','椅子':'chair','地毯':'rug','靠垫':'cushion','花瓶':'vase'};
   for(let attempt=0;attempt<30;attempt++){
    const snapshot=await saved();
    if(snapshot.neighbourhood.apartment.placements.some(p=>p.id===ids[item]&&p.x===column-1&&p.y===row-1))return;
    if(attempt===29)throw Error('placement did not persist '+item+' '+JSON.stringify(snapshot.neighbourhood.apartment));
    await page.waitForTimeout(100);
   }
  }
  await place(2,3);
  const first=await saved();
  if(!first.neighbourhood.apartment.placements.some(p=>p.id==='table'&&p.x===2&&p.y===1))throw Error('first placement did not save');
  const after=createHash('sha256').update(await canvas.screenshot()).digest('hex');
  await page.screenshot({path:evidence+`${name}-normal-game-table.png`});
  await place(3,4);
  await page.getByRole('button',{name:'撤回',exact:true}).click();await page.waitForTimeout(500);
  const undone=await saved();
  if(JSON.stringify(undone.neighbourhood.apartment.placements)!==JSON.stringify(first.neighbourhood.apartment.placements))throw Error('undo failed');
  await place(2,5,'椅子');await place(2,3,'地毯');await place(4,4,'靠垫');
  await page.getByRole('button',{name:'今日小礼物',exact:true}).click();await page.waitForTimeout(500);
  await place(4,5,'花瓶');
  const arranged=await saved();
  if(arranged.neighbourhood.apartment.placements.length!==6)throw Error('furnished layout is incomplete '+JSON.stringify(arranged.neighbourhood.apartment));
  await page.getByRole('button',{name:'继续走走',exact:true}).click();await page.waitForTimeout(500);
  await page.screenshot({path:evidence+`${name}-normal-game-furnished.png`});
  await page.reload();await page.getByTestId('world-viewport').waitFor();
  const reloaded=await saved();
  if(JSON.stringify(reloaded.neighbourhood.apartment.placements)!==JSON.stringify(arranged.neighbourhood.apartment.placements))throw Error('reload lost placement');
  if(reloaded.journal.bun.lookups!==2)throw Error('journal lost');
  await page.screenshot({path:evidence+`${name}-normal-game-reloaded.png`});
  results.push({name,errors,fixture:'valid saved apartment arrival; actions and reload use normal UI and real IndexedDB',first:first.neighbourhood.apartment.placements,undo:undone.neighbourhood.apartment.placements,reloaded:reloaded.neighbourhood.apartment.placements,preview:previewProof,home:reloaded.neighbourhood.apartment,journal:reloaded.journal.bun,canvasBefore:before,canvasAfter:after,furniturePixelsChanged:before!==after});
  await context.close();
 }
}finally{await browser.close();writeFileSync(evidence+'production-proof.json',JSON.stringify(results,null,2));}
console.log(results.map(r=>({name:r.name,errors:r.errors,furniturePixelsChanged:r.furniturePixelsChanged})));
