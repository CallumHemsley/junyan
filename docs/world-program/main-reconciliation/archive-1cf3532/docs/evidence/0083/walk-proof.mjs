import {chromium} from '@playwright/test';
import {writeFile, mkdir} from 'node:fs/promises';
const dir = new URL('./runtime/', import.meta.url).pathname;
await mkdir(dir, {recursive: true});
const browser = await chromium.launch({executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--mute-audio']});
const results = [];
for (const [device, width, height] of [['desktop', 1440, 900], ['phone', 390, 844]]) {
  const context = await browser.newContext({viewport: {width, height}, hasTouch: device === 'phone', isMobile: device === 'phone', recordVideo: {dir, size: {width, height}}, serviceWorkers: 'block'});
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const video = page.video();
  await page.goto('http://127.0.0.1:5485/src/world/art/rooftop/harness.html?test=1');
  await page.evaluate(async () => {
    const {createGame} = await import('/src/game.ts');
    const {content} = await import('/src/neighbourhood/registry.ts');
    const {saveGame} = await import('/src/save.ts');
    const game = createGame(content, 42);
    game.neighbourhood.location = 'garden'; game.neighbourhood.garden.restored = true;
    localStorage.removeItem('junyan-waiter-pending-v1');
    await saveGame(game);
  });
  await page.goto('http://127.0.0.1:5485/?seed=42');
  await page.locator('[data-testid="world-viewport"][data-map="rooftop"] canvas[data-rendered="true"]').waitFor();
  const viewport = page.getByTestId('world-viewport');
  const read = () => page.evaluate(async () => {
    const pending = localStorage.getItem('junyan-waiter-pending-v1');
    if (pending) return JSON.parse(pending);
    const {loadGame} = await import('/src/save.ts');
    const {content} = await import('/src/neighbourhood/registry.ts');
    return loadGame(content);
  });
  await viewport.focus();
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(450); await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(100);
  let saved = await read();
  if (!saved?.world || Math.hypot(saved.world.position.x - 12.5, saved.world.position.y - 29) < .4) throw new Error(`${device}: keyboard failed`);
  const keyboard = saved.world.position;
  if (device === 'phone') {
    const button = await page.getByRole('button', {name: '向前走', exact: true}).boundingBox();
    await page.screenshot({path: `${dir}${device}-before-touch.png`});
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: button.x + button.width / 2, y: button.y + button.height / 2}]});
    await page.waitForTimeout(450);
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await page.waitForTimeout(100); saved = await read();
    if (Math.hypot(saved.world.position.x - keyboard.x, saved.world.position.y - keyboard.y) < .4) throw new Error('touch pad failed');
  }
  const stops = [{id:'garden',x:19,y:20},{id:'water',x:11.5,y:12},{id:'trellis',x:21,y:9},{id:'lookout',x:44,y:12},{id:'terrace',x:35,y:29.5}];
  const reached = [];
  for (const stop of stops) {
    saved = await read();
    const path = await page.evaluate(async ({from,to,neighbourhood}) => {
      const {findPath} = await import('/src/world/geometry.ts');
      const {mapsForNeighbourhood} = await import('/src/world/dynamic.ts');
      return findPath(mapsForNeighbourhood(neighbourhood).rooftop, from, to);
    }, {from: saved.world.position, neighbourhood: saved.neighbourhood, to: {x: stop.x,y:stop.y}});
    if (!path.length) throw new Error(`No path to ${stop.id}`);
    for (const end of path) {
      await page.waitForTimeout(150);
      let current = (await read()).world.position;
      let steps = 0;
      if ((await read()).world.mapId !== 'rooftop') throw new Error('Unexpected portal transition during roof route');
      while (Math.hypot(end.x-current.x,end.y-current.y) > .35) {
        if (++steps > 30) {await writeFile(`${dir}${device}-bounded-failure.json`,JSON.stringify({stop,end,current,path},null,2));await context.close();await browser.close();throw new Error("Route exceeded 30 pointer segments");}
        const distance=Math.hypot(end.x-current.x,end.y-current.y), step=Math.min(3,distance);
        const target={x:current.x+(end.x-current.x)/distance*step,y:current.y+(end.y-current.y)/distance*step};
        const box=await viewport.locator('canvas').boundingBox();
        const pixel=await page.evaluate(async ({target,current,width,height})=>{
          const {cameraForMap,project}=await import('/src/world/camera.ts');
          const canvas=document.querySelector('[data-testid=world-viewport] canvas');
          const camera=cameraForMap({width:48,height:36},current,canvas.width,canvas.height,width<600?11:15);
          const pixel=project(target,camera);
          return {x:pixel.x*width/canvas.width,y:pixel.y*height/canvas.height};
        },{target,current,width:box.width,height:box.height});
        const x=box.x+pixel.x,y=box.y+pixel.y;
        await page.screenshot({path:`${dir}${device}-before-ground-input.png`});
        if (device==='phone') await page.touchscreen.tap(x,y); else await page.mouse.click(x,y);
        try { await page.waitForFunction(async ({target})=>{
          const pending=localStorage.getItem('junyan-waiter-pending-v1');
          const {loadGame}=await import('/src/save.ts');
          const {content}=await import('/src/neighbourhood/registry.ts');
          const game=pending?JSON.parse(pending):await loadGame(content);
          return game?.world&&Math.hypot(game.world.position.x-target.x,game.world.position.y-target.y)<.3;
        }, {target}, {timeout:7000,polling:100}); } catch (error) {
          await writeFile(`${dir}${device}-failure.json`,JSON.stringify({stop,current,target,path,saved:await read()},null,2));
          await page.screenshot({path:`${dir}${device}-failure.png`});
          await context.close(); await browser.close(); throw error;
        }
        await page.waitForTimeout(150);
        current=(await read()).world.position;
      }
    }
    console.log(`${device}: reached ${stop.id}`);
    const final=(await read()).world.position;
    reached.push({id:stop.id,position:final});
    await page.screenshot({path:`${dir}${device}-${stop.id}.png`});
    if (stop.id==='garden') {
      await page.locator('[data-world-anchor="rooftop.garden"]').click();
      await page.locator('[data-world-activity="garden"]').waitFor();
      await page.screenshot({path:`${dir}${device}-garden-activity.png`});
      await page.getByRole('button',{name:'继续走走',exact:true}).click();
    }
  }
  const beforeReload=(await read()).world;
  await page.reload();
  await page.locator('[data-map="rooftop"] canvas[data-rendered="true"]').waitFor();
  const afterReload=(await read()).world;
  if (JSON.stringify(beforeReload.position)!==JSON.stringify(afterReload.position)) throw new Error('reload position mismatch');
  await page.screenshot({path:`${dir}${device}-reload.png`});
  results.push({device,keyboard,reached,beforeReload,afterReload,errors,note:'Seeded legacy garden save; actual App viewport keyboard/pointer/touch traversal and real activity. Full building-stair journey pending other maps.'});
  await context.close();
  await video.saveAs(`${dir}${device}-traversal.webm`);
}
await browser.close();
await writeFile(`${dir}proof.json`,JSON.stringify(results,null,2));
if(results.some(r=>r.errors.length)) throw new Error('page errors in runtime proof');
