import {chromium} from '../../../../node_modules/@playwright/test/index.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const evidence=fileURLToPath(new URL('.',import.meta.url)),proof=JSON.parse(readFileSync(evidence+'production-proof.json','utf8'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--mute-audio']});const results=[];
try {
 for(const [name,width,height] of [['desktop',1440,900],['phone',390,844]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:name==='phone',isMobile:name==='phone',reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await page.goto('http://127.0.0.1:5483/src/world/art/residential/harness.html');
  await page.evaluate(async home=>{
   const [{createGame},{content}]=await Promise.all([import('/src/game.ts'),import('/src/content/index.ts')]);const game=createGame(content);game.neighbourhood.apartment=home;game.neighbourhood.location='apartment';game.world={version:1,mapId:'apartment',position:{x:17.5,y:13.5},facing:'north',returnPositions:{},activeActivity:null,activeAnchorId:null};
   const db=await new Promise(resolve=>{const r=indexedDB.open('junyan-waiter',1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>resolve(r.result);});await new Promise(resolve=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(game,'v1');tx.oncomplete=resolve;});db.close();
  },proof[0].home);
  await page.goto('http://127.0.0.1:5483/');await page.getByTestId('world-viewport').waitFor();await page.locator('canvas[data-rendered=true]').waitFor();const help=page.getByRole('button',{name:'开门迎客'});if(await help.isVisible())await help.click();
  const current=()=>page.evaluate(async()=>{const checkpoint=localStorage.getItem('junyan-waiter-pending-v1');if(checkpoint)return JSON.parse(checkpoint);const db=await new Promise(resolve=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);});const value=await new Promise(resolve=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>resolve(r.result);});db.close();return value;});
  const stops=[];results.push({name,errors,stops});
  for(const [label,x,y] of [['table-front',10,9],['table-side',12.6,8.6],['table-behind',10,5.4],['wardrobe-front',4.7,16.5],['wardrobe-behind',3,13.3]]){
   const start=await current();
   const route=await page.evaluate(async({save,target})=>{const [{mapsForNeighbourhood},{findPath}]=await Promise.all([import('/src/world/dynamic.ts'),import('/src/world/geometry.ts')]);return findPath(mapsForNeighbourhood(save.neighbourhood).apartment,save.world.position,target);},{save:start,target:{x,y}});
   if(!route.length)throw Error('No valid furniture approach '+label);
   for(const waypoint of route){
    for(let i=0;i<40;i++){
     const save=await current(),p=save.world.position,dx=waypoint.x-p.x,dy=waypoint.y-p.y,d=Math.hypot(dx,dy);
     if(d<.05)break;
     const amount=Math.min(1,2/d),point={x:p.x+dx*amount,y:p.y+dy*amount};
     const click=await page.evaluate(async({save,point})=>{const [{mapsForNeighbourhood},{cameraForMap,project}]=await Promise.all([import('/src/world/dynamic.ts'),import('/src/world/camera.ts')]);const map=mapsForNeighbourhood(save.neighbourhood).apartment,canvas=document.querySelector('.connected-world canvas'),r=canvas.getBoundingClientRect(),camera=cameraForMap(map.bounds,save.world.position,canvas.width,canvas.height,r.width<600?11:15),pixel=project(point,camera);return {x:r.left+pixel.x/canvas.width*r.width,y:r.top+pixel.y/canvas.height*r.height};},{save,point});
     if(name==='phone')await page.touchscreen.tap(click.x,click.y);else await page.mouse.click(click.x,click.y);
     await page.waitForFunction(async point=>{const pending=localStorage.getItem('junyan-waiter-pending-v1');if(!pending)return false;const s=JSON.parse(pending);return Math.hypot(s.world.position.x-point.x,s.world.position.y-point.y)<.03;},point,{timeout:12000});
    }
   }
   const save=await current();if(Math.hypot(save.world.position.x-x,save.world.position.y-y)>.2)throw Error('Approach incomplete '+label);
   await page.screenshot({path:evidence+`${name}-${label}.png`});stops.push({label,position:save.world.position});
  }
  await context.close();
 }
}finally{await browser.close();writeFileSync(evidence+'occlusion-proof.json',JSON.stringify({scope:'normal production renderer and actual saved furnishing fixture; real mouse/touch walking around table and wardrobe',results},null,2));}
console.log(results.map(result=>({name:result.name,errors:result.errors,stops:result.stops.length})));
