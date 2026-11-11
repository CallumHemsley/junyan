import {test,expect,type Page} from '@playwright/test';
import {closeActivity,interactAt,savedGame,walkTo} from './world-journey';
import {privateArtifact} from './private-artifacts';

async function seedWorkshop(page:Page){
 await page.goto('/?opening=skip&seed=42');
 await page.evaluate(async()=>{
  const {createGame}=await import('/src/game.ts'),{content}=await import('/src/neighbourhood/registry.ts'),{validateSavedGame}=await import('/src/save.ts');
  const game=createGame(content,42);
  game.neighbourhood!.location='apartment';
  game.world={version:1,mapId:'workshop',position:{x:15,y:25},facing:'north',returnPositions:{},activeActivity:null,activeAnchorId:null,life:{version:1,elapsedMs:42000,discoveries:[],reactions:[],pauses:[],serviceDepartures:[]}};
  const checked=validateSavedGame(game,content);if(!checked)throw Error('Invalid workshop fixture');
  localStorage.setItem('junyan-waiter-pending-v1',JSON.stringify(checked));
 });
 await page.reload();
 await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map','workshop');
 const opening=page.getByRole('button',{name:'开门迎客',exact:true});if(await opening.isVisible())await opening.click();
 // The workshop is walked in the top-down pixel engine (ticket 0182): it is ready once its camera is published.
 await expect(page.locator('.pixel-workshop')).toHaveAttribute('data-pixel-camera',/zoom/);
}

/** The pixel camera once it has held still for a few frames (closing a sheet resizes the view). */
const stableCamera=(page:Page)=>page.locator('.pixel-workshop').evaluate(async element=>{
 const frame=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
 let before=element.getAttribute('data-pixel-camera');
 for(let stable=0;stable<3;){await frame();const now=element.getAttribute('data-pixel-camera');stable=now===before?stable+1:0;before=now;}
 return JSON.parse(before!) as {x:number;y:number;zoom:number;dpr:number;tile:number};
});

async function visiblePlayerAndCue(page:Page){
 // One canvas, drawn at a whole-number zoom of the art (the pixel engine's resolution rule).
 await expect(page.locator('.pixel-workshop canvas')).toHaveCount(1);
 expect(Number.isInteger((await stableCamera(page)).zoom)).toBe(true);
 const world=(await savedGame(page)).world!;
 const measure=async()=>{
  const camera=await stableCamera(page);
  return page.evaluate(async({world,camera})=>{
   const {worldMaps}=await import('/src/world/registry.ts');
   const canvas=document.querySelector<HTMLCanvasElement>('.pixel-workshop canvas')!,box=canvas.getBoundingClientRect(),panel=document.querySelector('.world-context')?.getBoundingClientRect();
   // Tile units → CSS px from the canvas's top-left; a person stands about 54 art px tall.
   const scale=camera.zoom/camera.dpr,project=(p:{x:number;y:number})=>({x:box.x+(p.x*camera.tile-camera.x)*scale,y:box.y+(p.y*camera.tile-camera.y)*scale});
   const foot=project(world.position),headY=foot.y-54*scale;
   const cueElement=document.querySelector<HTMLElement>('.world-target-cue'),cue=cueElement?.getBoundingClientRect();
   const anchor=worldMaps.workshop.anchors.find(anchor=>anchor.id===cueElement?.dataset.targetId);
   const target=anchor?project(anchor.position):null;
   return {foot,headY,box:box.toJSON(),panel:panel?.toJSON(),cue:cue?.toJSON(),target};
  },{world,camera});
 };
 await expect.poll(async()=>{const metrics=await measure();return !world.activeActivity&&metrics.cue?.width&&metrics.target?Math.max(Math.abs(metrics.cue.x+metrics.cue.width/2-metrics.target.x),Math.abs(metrics.cue.y+metrics.cue.height/2-metrics.target.y)):0;}).toBeLessThan(1);
 const metrics=await measure();
 expect(metrics.foot.x).toBeGreaterThan(0);expect(metrics.foot.x).toBeLessThan(metrics.box.right);
 expect(metrics.headY).toBeGreaterThan(metrics.box.top);expect(metrics.foot.y).toBeLessThan(metrics.panel&&metrics.box.width<800?metrics.panel.top:metrics.box.bottom-100);
 return metrics;
}

for(const motion of ['no-preference','reduce'] as const)test(`workshop native framing preserves real routes, panels and lookup (${motion})`,async({page,isMobile},info)=>{
 test.setTimeout(240_000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.emulateMedia({reducedMotion:motion});await seedWorkshop(page);
 // The saved fixture only enters the map; every route and interaction below is live input.
 await visiblePlayerAndCue(page);
 const before=(await savedGame(page)).world!.position;
 await page.getByTestId('world-viewport').focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(250);await page.keyboard.up('ArrowUp');
 expect((await savedGame(page)).world!.position).not.toEqual(before);
 if(isMobile){expect(await page.evaluate(()=>navigator.maxTouchPoints)).toBeGreaterThan(0);const pad=page.getByRole('button',{name:'向右走',exact:true});const box=(await pad.boundingBox())!;await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);}
 await walkTo(page,{x:8,y:10.8});await visiblePlayerAndCue(page);
 await expect(page.locator('.world-target-cue')).toBeVisible();await expect(page.locator('.world-target-cue')).toHaveAttribute('data-target-id','workshop.lamp');
 await page.screenshot({path:privateArtifact(`framing/${info.project.name}-${motion}-lamp-closed.png`)});
 await interactAt(page,'workshop.lamp');await visiblePlayerAndCue(page);
 const source=page.locator('.repair-line .word').first();await source.click();await expect(page.getByRole('button',{name:'关闭词卡'})).toBeFocused();
 const paused=(await savedGame(page)).world!.position;await page.keyboard.press('ArrowDown');await page.waitForTimeout(300);expect((await savedGame(page)).world!.position).toEqual(paused);
 await page.keyboard.press('Escape');await expect(source).toBeFocused();await closeActivity(page);await expect(page.locator('[data-world-anchor="workshop.lamp"]')).toBeFocused();
 for(const point of [{x:3,y:5},{x:14,y:4.8},{x:20.8,y:10.8}]){await walkTo(page,point);await visiblePlayerAndCue(page);}
 await expect(page.locator('.world-target-cue')).toBeVisible();await expect(page.locator('.world-target-cue')).toHaveAttribute('data-target-id','workshop.toy');
 await interactAt(page,'workshop.toy');await visiblePlayerAndCue(page);
 await page.screenshot({path:privateArtifact(`framing/${info.project.name}-${motion}-toy-open.png`)});await closeActivity(page);
 for(const point of [{x:27.5,y:19.5},{x:15,y:25}]){await walkTo(page,point);await visiblePlayerAndCue(page);}
 if(isMobile){
  for(const [width,height]of [[390,667],[390,960],[598,960],[600,960],[844,390]]){
   await page.setViewportSize({width,height});await walkTo(page,{x:8,y:10.8});await visiblePlayerAndCue(page);await interactAt(page,'workshop.lamp');await visiblePlayerAndCue(page);
   await page.screenshot({path:privateArtifact(`framing/${motion}-${width}x${height}-lamp-open.png`)});await closeActivity(page);
  }
 }
 expect(errors).toEqual([]);
});
