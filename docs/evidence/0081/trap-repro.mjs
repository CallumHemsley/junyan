import {chromium} from '../../../node_modules/@playwright/test/index.mjs';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--mute-audio']});
try {
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5483/src/world/art/residential/harness.html');
 const result=await page.evaluate(async()=>{
  const [{createGame},{content},apartment,{mapsForNeighbourhood,safeAfterEdit},{canStand,findPath}]=await Promise.all([import('/src/game.ts'),import('/src/content/index.ts'),import('/src/features/apartment/rules.ts'),import('/src/world/dynamic.ts'),import('/src/world/geometry.ts')]);
  const game=createGame(content);let home=apartment.reduce(game.neighbourhood.apartment,{type:'accept-starter'},1);
  home=apartment.reduce(home,{type:'receive-gift',giftId:'repairs.stool'},1);
  function put(id,x,y){home=apartment.reduce(home,{type:'select',id},1);home=apartment.reduce(home,{type:'place',x,y},1);}
  put('table',2,0);put('repairs.stool',2,2);
  const before=mapsForNeighbourhood({...game.neighbourhood,apartment:home}).apartment;
  put('cushion',3,1);
  const after=mapsForNeighbourhood({...game.neighbourhood,apartment:home}).apartment,position={x:9,y:7};
  const relocated=safeAfterEdit(before,after,position);
  return {placements:home.placements,validHome:!!apartment.validate(home),position,relocated,beforeCanStand:canStand(before,position),beforeExitPath:findPath(before,position,before.defaultSpawn),afterCanStand:canStand(after,position),afterExitPath:findPath(after,position,after.defaultSpawn),relocatedExitPath:findPath(after,relocated,after.defaultSpawn)};
 });
 const trapped=result.validHome&&result.beforeExitPath.length>0&&result.afterCanStand&&result.afterExitPath.length===0&&result.relocatedExitPath.length===0;
 writeFileSync(fileURLToPath(new URL('./trap-repro.json',import.meta.url)),JSON.stringify({status:trapped?'REPRODUCED DEFECT':'not reproduced',scope:'pure current production navigation with valid apartment reducer actions',...result},null,2));
 console.log({trapped,position:result.position,relocated:result.relocated,validHome:result.validHome});
}finally{await browser.close();}
