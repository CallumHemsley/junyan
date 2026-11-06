import {chromium} from '../../../node_modules/@playwright/test/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const mapId=process.argv[2]??'riverbank';const output='docs/evidence/0084/walk-'+mapId;await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--mute-audio','--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5486/src/world/art/landscape/preview.html');
 await page.evaluate(async mapId=>{const {createGame}=await import('/src/game.ts'),{content}=await import('/src/content/index.ts'),{saveGame}=await import('/src/save.ts');const game=createGame(content,42);game.world={version:1,mapId,position:mapId==='park'?{x:7,y:61}:{x:20,y:19},facing:'east',returnPositions:{},activeActivity:null};await saveGame(game);localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game));},mapId);
 await page.goto('http://127.0.0.1:5486/');await page.getByRole('button',{name:/开门迎客/}).click();
 const read=()=>page.evaluate(async()=>{const {loadGame}=await import('/src/save.ts'),{content}=await import('/src/content/index.ts');return (await loadGame(content)).world;});
 await page.evaluate(()=>{const chunks=[],recorder=new MediaRecorder(document.querySelector('[data-testid="world-viewport"] canvas').captureStream(10),{mimeType:'video/webm'});recorder.ondataavailable=e=>chunks.push(e.data);window.__recording={recorder,chunks};recorder.start();});
 const proof=[];
 for(const [id,x,y] of mapId==='park'?[['orchard-basket',16,52],['bamboo-court',29,8],['tea-pavilion',54,18],['pond-deck',61,33],['ridge-view',79,29]]:[['moon-bridge',48,19],['old-ferry',62,57],['lower-crossing',45,57],['fishing-jetty',40,39]]){
  const start=await read();let steps=0;
  for(;steps<70;steps++){
   const state=await read();if(steps%10===0)console.log(id,steps,JSON.stringify(state.position));if(Math.hypot(state.position.x-x,state.position.y-y)<.4)break;
   const target=await page.evaluate(async({from,goal,mapId})=>{const {findPath}=await import('/src/world/geometry.ts'),{worldMaps}=await import('/src/world/registry.ts');const path=findPath(worldMaps[mapId],from,goal);if(!path.length)throw Error('no shared path');const p=path.find(p=>Math.hypot(p.x-from.x,p.y-from.y)>.5)??goal;const dx=p.x-from.x,dy=p.y-from.y,d=Math.hypot(dx,dy),length=Math.min(6,d);return {x:from.x+dx/d*length,y:from.y+dy/d*length};},{from:state.position,goal:{x,y},mapId});
   const click=await page.evaluate(async({target,state})=>{const {cameraForMap,project}=await import('/src/world/camera.ts');const {worldMaps}=await import('/src/world/registry.ts');const canvas=document.querySelector('[data-testid="world-viewport"] canvas'),r=canvas.getBoundingClientRect();const camera=cameraForMap(worldMaps[state.mapId].bounds,state.position,canvas.width,canvas.height,r.width<600?11:15),p=project(target,camera);return {x:r.x+p.x*r.width/canvas.width,y:r.y+p.y*r.height/canvas.height};},{target,state});
   await page.mouse.click(click.x,click.y);
   let reached=false;
   for(let poll=0;poll<50;poll++){await page.waitForTimeout(200);const current=await read();if(Math.hypot(current.position.x-target.x,current.position.y-target.y)<.35){reached=true;break;}}
   if(!reached){await page.screenshot({path:output+'/failed-route.png'});throw Error('Actual pointer movement did not reach '+JSON.stringify(target));}

  }
  const end=await read();if(steps===70)throw Error('route step limit '+id);
  proof.push({id,start,end,actualPointerSegments:steps});console.log('Reached '+id);
  await page.screenshot({path:`${output}/desktop-${id}.png`});
 }
 const bytes=await page.evaluate(()=>new Promise(resolve=>{const {recorder,chunks}=window.__recording;recorder.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer())));recorder.stop();}));await writeFile(output+'/desktop-route.webm',new Uint8Array(bytes));
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(output+'/evidence.json',JSON.stringify({setup:`Valid day save seeded at ${mapId}; all route segments then use actual canvas pointer input and shared production pathfinding`,proof,consoleErrors:errors},null,2)+'\n');
}finally{await browser.close();}
