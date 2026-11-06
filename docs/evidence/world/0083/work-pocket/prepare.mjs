import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
const dir=new URL('./',import.meta.url).pathname;
const inputs={morning:JSON.parse(await readFile(new URL('../roof-edge-repair/morning-fixture.json',import.meta.url),'utf8')),evening:JSON.parse(await readFile(new URL('../roof-edge-repair/evening-fixture.json',import.meta.url),'utf8'))};
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--mute-audio']});const page=await browser.newPage();await page.goto('http://127.0.0.1:5485/?test=1');
const output=await page.evaluate(async inputs=>{
 const {content}=await import('/src/neighbourhood/registry.ts');const {getOrder,orderTotal}=await import('/src/game.ts');const {validateSavedGame}=await import('/src/save.ts');
 const {mapsForNeighbourhood}=await import('/src/world/dynamic.ts');const {actorsFor,planFor}=await import('/src/world/life-bridge.ts');const {initialLifeState,releaseServedCustomer}=await import('/src/world/life/index.ts');
 const game=structuredClone(inputs.evening);game.neighbourhood.location='garden';game.neighbourhood.garden.restored=true;
 game.receipt=null;game.feedback='none';game.activeTable=null;
 const lin=game.customers.find(c=>content.characters.find(x=>x.name===getOrder(game,c.table,content)?.customer)?.id==='lin-jie');
 if(!lin)throw new Error('No canonical Lin service table');
 if(lin.phase!=='served'){const replace=game.customers.find(c=>c.phase==='served'&&c!==lin);if(!replace)throw new Error('No valid evening fixture swap');replace.phase='seated';lin.phase='served';}
 game.served=game.customers.filter(c=>c.phase==='served').length;game.ended=game.served===4;game.earnings=game.customers.filter(c=>c.phase==='served').reduce((sum,c)=>sum+orderTotal(getOrder(game,c.table,content),content),0);
 let life=initialLifeState();for(const c of game.customers)if(c.phase==='served')life=releaseServedCustomer(life,game,c.table);
 game.world={...game.world,mapId:'rooftop',position:{x:19,y:20},facing:'north',activeActivity:null,activeAnchorId:null,returnPositions:{},life};
 const map=mapsForNeighbourhood(game.neighbourhood).rooftop,plan=planFor(map,game),actor=plan.actors.find(a=>a.characterId==='lin-jie');if(!actor)throw new Error(JSON.stringify(plan.diagnostics));
 const at=ms=>actorsFor(map,game,game.world,ms,false).find(a=>a.characterId==='lin-jie');
 let occupied=null,empty=null;
 for(let ms=2000;ms<actor.durationMs*2;ms+=1000){const pose=at(ms),later=at(ms+3000);if(!pose||!later)continue;
  if(occupied===null&&pose.activity==='work'&&Math.hypot(pose.position.x-20,pose.position.y-18.2)<.05&&Math.hypot(later.position.x-20,later.position.y-18.2)<.05)occupied=ms;
  if(empty===null&&pose.action==='idle'&&Math.hypot(pose.position.x-20,pose.position.y-18.2)>7&&Math.hypot(later.position.x-20,later.position.y-18.2)>7)empty=ms;
 }
 if(occupied===null||empty===null)throw new Error('No stable explicit resident fixture times');
 const fixtures=[];
 for(const occupancy of ['occupied','empty']){const next=structuredClone(game);next.world.life.elapsedMs=occupied;if(occupancy==='empty')next.world.life.serviceDepartures=[];if(!validateSavedGame(next,content))throw new Error('Invalid evening fixture');fixtures.push({phase:'evening',occupancy,game:next,expectedActor:occupancy==='occupied'?at(occupied):null});}
 const morning=structuredClone(inputs.morning);morning.neighbourhood.location='garden';morning.neighbourhood.garden.restored=true;morning.world={...morning.world,mapId:'rooftop',position:{x:19,y:20},facing:'north',activeActivity:null,activeAnchorId:null,returnPositions:{},life:initialLifeState()};
 if(!validateSavedGame(morning,content))throw new Error('Invalid morning fixture');fixtures.push({phase:'morning',occupancy:'service-present',game:morning,expectedActor:null});
 return {fixtures,actorRoute:actor,occupiedMs:occupied,emptyMs:occupied,terraceDwellMs:empty,diagnostics:plan.diagnostics,note:'Declared valid fixture states. Evening Lin is served/departed through the existing pure release model. Morning preserves restaurant identity presence; no duplicate rooftop Lin is fabricated. Work/walk exists; seated rest/contact remains a shared life-owner dependency.'};
},inputs);
await browser.close();await writeFile(`${dir}fixtures.json`,JSON.stringify(output,null,2));console.log(JSON.stringify({occupiedMs:output.occupiedMs,emptyMs:output.emptyMs,diagnostics:output.diagnostics}));
