import {chromium} from '../../../../node_modules/@playwright/test/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const device=process.argv[2]??'desktop';const output='docs/evidence/world/0084/'+(device==='phone'?'residents-phone':'residents');await mkdir(output,{recursive:true});
const cases=[['resident-reader','park','sit'],['resident-groundskeeper','park','work'],['resident-river-walker','riverbank','idle']];
const results=await Promise.all(cases.map(async([id,mapId,rest])=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});
 try{
  const page=await browser.newPage({viewport:device==='phone'?{width:390,height:844}:{width:1120,height:840},hasTouch:device==='phone',isMobile:device==='phone'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5486/src/world/art/landscape/preview.html');
  const setup=await page.evaluate(async({id,mapId,rest})=>{
   const {createGame}=await import('/src/game.ts'),{content}=await import('/src/content/index.ts'),{worldMaps}=await import('/src/world/registry.ts'),{actorsFor,planFor}=await import('/src/world/life-bridge.ts'),{canStand}=await import('/src/world/geometry.ts'),{saveGame}=await import('/src/save.ts'),{backgroundResident}=await import('/src/world/characters/background.ts'),{colorShader}=await import('/src/world/lighting.ts'),{sampleDayLight}=await import('/src/world/atmosphere/index.ts');
   const map=worldMaps[mapId],plan=planFor(map);if(plan.diagnostics.some(d=>d.hookId.includes(id)))throw Error(JSON.stringify(plan.diagnostics));
   const route=plan.actors.find(a=>a.characterId===id);if(!route)throw Error('Canonical actor missing from production plan '+id);
   for(let seed=0;seed<4096;seed++){
    const game=createGame(content,seed),world={version:1,mapId,position:map.defaultSpawn,facing:'east',returnPositions:{},activeActivity:null};
    const start=actorsFor(map,game,world,0,false).find(a=>a.characterId===id),later=actorsFor(map,game,world,7000,false).find(a=>a.characterId===id);
    const remaining=route.profile.dwellMs-start.phaseMs;
    if(start.activity!==rest||later.action!=='walk'||remaining<2500||remaining>5500)continue;
    const offset=[[2.5,1.5],[-2.5,-1.5],[2.5,-1.5],[-2.5,1.5]].map(([x,y])=>({x:start.position.x+x,y:start.position.y+y})).find(p=>canStand(map,p,.25));
    if(!offset)continue;
    world.position=offset;game.world=world;
    const actor=backgroundResident(id);if(!actor)throw Error('Producer silhouette missing');
    await saveGame(game);localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(game));
    return {id,mapId,seed,rest,start,later,remainingRestMs:remaining,playerPosition:offset,shirt:colorShader(sampleDayLight('morning'))(actor.appearance.shirt),routeStops:map.npcHooks.find(h=>h.characterId===id).route,scope:'Valid normal day seed selected for a naturally occurring rest-to-walk transition. No actor spawn, phase, elapsed-time or position override; ordinary App sampling uses canonical hooks/profiles.'};
   }
   throw Error('No suitable deterministic phase seed '+id);
  },{id,mapId,rest});
  await page.goto('http://127.0.0.1:5486/');await page.getByRole('button',{name:/开门迎客/}).click();await page.locator('[data-testid="world-viewport"] canvas[data-rendered="true"]').waitFor();
  if(await page.evaluate(()=>document.visibilityState)!=='visible')throw Error('Proof page hidden');
  await page.screenshot({path:`${output}/${id}-task.png`});
  await page.evaluate(()=>{const chunks=[],recorder=new MediaRecorder(document.querySelector('[data-testid="world-viewport"] canvas').captureStream(15),{mimeType:'video/webm'});recorder.ondataavailable=e=>chunks.push(e.data);window.__recording={recorder,chunks};recorder.start();});
  const observations=[];
  for(let second=0;second<=24;second+=4){
   if(second)await page.waitForTimeout(4000);
   const pixels=await page.evaluate(hex=>{const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),c=document.querySelector('[data-testid="world-viewport"] canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let count=0,x=0,y=0;for(let i=0;i<d.length;i+=4)if(d[i]===rgb[0]&&d[i+1]===rgb[1]&&d[i+2]===rgb[2]){count++;x+=(i/4)%c.width;y+=Math.floor(i/4/c.width);}return{count,centroid:count?{x:x/count,y:y/count}:null};},setup.shirt);
   observations.push({wallSecond:second,...pixels});
   if(second===12||second===24)await page.screenshot({path:`${output}/${id}-${second}s.png`});
  }
  const bytes=await page.evaluate(()=>new Promise(resolve=>{const {recorder,chunks}=window.__recording;recorder.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer())));recorder.stop();}));await writeFile(`${output}/${id}-motion.webm`,new Uint8Array(bytes));
  const points=observations.flatMap(o=>o.centroid?[o.centroid]:[]),motion=points.some(a=>points.some(b=>Math.hypot(a.x-b.x,a.y-b.y)>3));
  const result={device,...setup,observations,visibleMaterialMotion:motion,consoleErrors:errors};await writeFile(`${output}/${id}.json`,JSON.stringify(result,null,2)+'\n');
  if(!motion||errors.length)throw Error(id+' motion/console proof failed '+JSON.stringify(result));
  console.log('Observed natural task and movement '+id);return result;
 }finally{await browser.close();}
}));
await writeFile(output+'/evidence.json',JSON.stringify(results,null,2)+'\n');
