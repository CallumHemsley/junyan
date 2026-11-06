import {chromium} from '../../../../node_modules/@playwright/test/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const sourcePaths=['src/world/art/residential/index.ts','src/world/maps/residential/elevation.ts','src/world/maps/residential/residential-stairs.json','src/world/maps/residential/residential-hall.json','src/world/maps/residential/apartment.json','docs/evidence/world/0081/proof.config.mjs'];
const sourceHashes=()=>Object.fromEntries(sourcePaths.map(path=>[path,createHash('sha256').update(readFileSync('/workspace/junyan/'+path)).digest('hex')]));
const startHashes=sourceHashes();
const root=fileURLToPath(new URL('.',import.meta.url));
const label=process.env.RESIDENTIAL_RUN??'baseline-height';
const out=root+label+'/';await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--mute-audio']});
const results=[];
try {
 for(const [name,width,height] of [['desktop',1440,1000],['phone',390,844]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:name==='phone',isMobile:name==='phone',serviceWorkers:'block',recordVideo:{dir:out+'video',size:{width:Math.min(width,960),height}}});
  const page=await context.newPage(),errors=[],record={name,errors,stops:[],clicks:[]};results.push(record);page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/src/world/painter.ts*',async route=>{
   const response=await route.fetch(),source=await response.text(),signature='export function drawPlayer(ctx, view, p, facing, moving, _scale, motion, carrying = false) {';
   if(!source.includes(signature))throw Error('Observation boundary changed');
   const observe=`const samples=globalThis.__residentialFeet??=[];const foot=view.project(p),ground=view.project(p,0);samples.push({mapId:document.querySelector('.connected-world')?.dataset.map,position:{...p},foot,ground,scale:Math.abs(view.project({x:p.x+.5,y:p.y-.5}).x-foot.x)});if(samples.length>16000)samples.shift();`;
   await route.fulfill({response,body:source.replace(signature,signature+observe)});
  });
  await page.goto('http://127.0.0.1:5483/audio/manifest.json');
  await page.evaluate(async()=>{
   const [{createGame},{content},{worldMaps},{createWorld},{validateSavedGame}]=await Promise.all([import('/src/game.ts'),import('/src/neighbourhood/registry.ts'),import('/src/world/registry.ts'),import('/src/world/state.ts'),import('/src/save.ts')]);
   const game=createGame(content,42);game.world={...createWorld(worldMaps),mapId:'residential-stairs',position:{x:11.5,y:37}};
   if(!validateSavedGame(game,content))throw Error('Invalid declared arrival fixture');
   const db=await new Promise(resolve=>{const r=indexedDB.open('junyan-waiter',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);});await new Promise(resolve=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(game,'v1');tx.oncomplete=resolve;});db.close();
  });
  await page.goto('http://127.0.0.1:5483/');await page.locator('canvas[data-rendered=true]').waitFor();
  const help=page.getByRole('button',{name:'开门迎客'});if(await help.isVisible())await help.click();
  async function current(){return page.evaluate(async()=>{const pending=localStorage.getItem('junyan-waiter-pending-v1');if(pending)return JSON.parse(pending);const db=await new Promise(resolve=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);});const s=await new Promise(resolve=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);});db.close();return s;});}
  async function walk(target,mapId){
   const start=await current();if(start.world.mapId!==mapId)throw Error('Unexpected start map');
   const path=await page.evaluate(async({game,target})=>{const [{mapsForNeighbourhood},{findPath}]=await Promise.all([import('/src/world/dynamic.ts'),import('/src/world/geometry.ts')]);return findPath(mapsForNeighbourhood(game.neighbourhood)[game.world.mapId],game.world.position,target);},{game:start,target});
   if(!path.length)throw Error('No route '+JSON.stringify({mapId,target}));
   for(const waypoint of path)for(let iteration=0;iteration<80;iteration++){
    const game=await current();if(game.world.mapId!==mapId)return;if(Math.hypot(game.world.position.x-waypoint.x,game.world.position.y-waypoint.y)<.12)break;
    const p=game.world.position,dx=waypoint.x-p.x,dy=waypoint.y-p.y,t=Math.min(1,1.5/Math.hypot(dx,dy)),point={x:p.x+dx*t,y:p.y+dy*t};
    const click=await page.evaluate(async({game,point})=>{
     const [{mapsForNeighbourhood},{surfaceHeight,pickSurface},{cameraForMap,project}]=await Promise.all([import('/src/world/dynamic.ts'),import('/src/world/surfaces.ts'),import('/src/world/camera.ts')]);const map=mapsForNeighbourhood(game.neighbourhood)[game.world.mapId],canvas=document.querySelector('.connected-world canvas'),r=canvas.getBoundingClientRect(),camera=cameraForMap(map.bounds,game.world.position,canvas.width,canvas.height,r.width<600?11:15,0,0,surfaceHeight(map.id,game.world.position)),z=surfaceHeight(map.id,point),pixel=project(point,camera,z),picked=pickSurface(pixel,camera,map);return {x:r.left+pixel.x/canvas.width*r.width,y:r.top+pixel.y/canvas.height*r.height,picked,z};
    },{game,point});
    record.clicks.push({mapId,target:point,picked:click.picked,z:click.z});
    if(!click.picked||Math.hypot(click.picked.x-point.x,click.picked.y-point.y)>.001)throw Error('Projected destination resolves to another surface '+JSON.stringify({point,click}));
    if(name==='phone')await page.touchscreen.tap(click.x,click.y);else await page.mouse.click(click.x,click.y);
    const deadline=Date.now()+9000;let reached=false;
    while(Date.now()<deadline){await page.waitForTimeout(60);const after=await current();if(after.world.mapId!==mapId||Math.hypot(after.world.position.x-point.x,after.world.position.y-point.y)<.12){reached=true;break;}}
    if(!reached)throw Error('Movement stalled '+JSON.stringify({point,world:(await current()).world}));
   }
  }
  async function pause(id){await page.waitForTimeout(450);const game=await current(),foot=await page.evaluate(async()=>{const {surfaceHeight}=await import('/src/world/surfaces.ts');const samples=(globalThis.__residentialFeet??[]).slice(-30).map(s=>({...s,z:surfaceHeight(s.mapId,s.position)}));return samples.map(s=>({...s,error:Math.abs(s.foot.y-s.ground.y+s.z*s.scale)}));});if(foot.some(s=>s.error>.001))throw Error('Foot height mismatch');await page.screenshot({path:out+`${name}-${id}.png`});record.stops.push({id,world:game.world,feet:foot});}
  async function portal(destination){const game=await current(),mapId=game.world.mapId,target=await page.evaluate(async({mapId,destination})=>{const {worldMaps}=await import('/src/world/registry.ts');const r=worldMaps[mapId].exits.find(e=>e.targetMapId===destination).rect;return {x:r.x+r.width/2,y:r.y+r.height/2};},{mapId,destination});await walk(target,mapId);if((await current()).world.mapId!==destination)throw Error('Door failed '+destination);}
  try {
   await pause('arrival');
   for(const [id,x,y] of [['lower-before',5.5,33.2],['lower-first',5.5,32.8],['lower-mid',5.5,28.25],['lower-last',5.5,24.2],['home-first',5.5,23.8],['home-door',17,21.5]]){await walk({x,y},'residential-stairs');await pause(id);}
   await portal('apartment');await pause('apartment-return');await portal('residential-stairs');
   for(const [id,x,y] of [['upper-before',17,19.2],['upper-first',17,18.8],['upper-mid',17,14.25],['upper-last',17,9.2],['roof-first',17,8.8]]){await walk({x,y},'residential-stairs');await pause(id);}
   await portal('rooftop');await pause('roof-door');await portal('residential-stairs');
   for(const [id,x,y] of [['descent-roof',17,8.8],['descent-upper-first',17,9.2],['descent-upper-last',17,18.8],['descent-home',17,19.2],['descent-home-turn',5.5,23.8],['descent-lower-first',5.5,24.2],['descent-lower-last',5.5,32.8],['descent-hall',5.5,33.2]]){await walk({x,y},'residential-stairs');await pause(id);}
   await portal('residential-hall');await pause('hall-return');await page.waitForTimeout(1200);record.before=(await current()).world;await page.reload();await page.locator('canvas[data-rendered=true]').waitFor();await page.waitForTimeout(450);record.after=(await current()).world;
   if(record.before.mapId!==record.after.mapId||JSON.stringify(record.before.position)!==JSON.stringify(record.after.position)||errors.length)throw Error('Reload or console failure');record.status='passed';
  }catch(error){record.status='failed';record.failure=error.message;record.failedWorld=(await current()).world;await page.screenshot({path:out+`${name}-failure.png`});throw error;}
  finally{record.video=await page.video().path();await context.close();}
 }
}finally{await browser.close();await writeFile(out+'results.json',JSON.stringify({foundationHead:execFileSync('git',['-C','/workspace/scratch/residential-0081-proof','rev-parse','HEAD'],{encoding:'utf8'}).trim(),ownerHead:execFileSync('git',['-C','/workspace/junyan','rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceHashes:startHashes,sourceHashesAtEnd:sourceHashes(),sourcesUnchanged:JSON.stringify(startHashes)===JSON.stringify(sourceHashes()),method:'Declared saved stair arrival; actual mouse/touch and doors thereafter; observation-only foot projection hook; no internal movement dispatch; pre-main-reconciliation snapshot',results},null,2));}
console.log(results.map(r=>({name:r.name,status:r.status,stops:r.stops.length,errors:r.errors})));
