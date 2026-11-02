import {test,expect,type Page} from '@playwright/test';

test.use({launchOptions:{args:['--mute-audio']}});
const draws=(page:Page)=>page.evaluate(()=>(window as unknown as {sceneDraws:number}).sceneDraws);
async function settle(page:Page){await page.waitForTimeout(180);}
async function scrollAway(page:Page){
  // Give the page enough scrollable space to exercise the real IntersectionObserver.
  await page.evaluate(()=>{const spacer=document.createElement('div');spacer.style.height='2500px';document.body.append(spacer);window.scrollTo(0,2000);});
  await expect.poll(()=>page.locator('canvas').evaluate(canvas=>canvas.getBoundingClientRect().bottom)).toBeLessThan(0);
  await settle(page);
}

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    const counters=window as unknown as {sceneDraws:number};counters.sceneDraws=0;
    const original=CanvasRenderingContext2D.prototype.putImageData;
    CanvasRenderingContext2D.prototype.putImageData=function(...args:Parameters<typeof original>){counters.sceneDraws++;return original.apply(this,args);};
  });
});

test('reduced motion draws on input, then stays idle and restores after scrolling',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/?test=1&seed=42');
  await page.getByRole('button',{name:'开门迎客'}).click();
  await expect.poll(()=>draws(page)).toBeGreaterThan(0);await settle(page);
  const before=await draws(page);
  const pixels=await page.locator('canvas').evaluate(canvas=>(canvas as HTMLCanvasElement).toDataURL());
  await page.waitForTimeout(400);
  expect(await draws(page)).toBe(before);
  expect(await page.locator('canvas').evaluate(canvas=>(canvas as HTMLCanvasElement).toDataURL())).toBe(pixels);
  // A real pointer movement changes player position and must repaint despite idle scheduling.
  await page.locator('canvas').click({position:{x:130,y:250},force:true});
  await expect.poll(()=>draws(page)).toBeGreaterThan(before);
  // The game still advances an explicit walking route under reduced motion.
  // Wait for that real input-driven state change to finish before testing idle work.
  await expect.poll(async()=>{const start=await draws(page);await page.waitForTimeout(350);return await draws(page)-start;},{timeout:15000}).toBe(0);
  const afterMove=await draws(page);await page.waitForTimeout(300);expect(await draws(page)).toBe(afterMove);
  await scrollAway(page);const offscreen=await draws(page);
  await page.waitForTimeout(350);expect(await draws(page)).toBe(offscreen);
  await page.evaluate(()=>window.scrollTo(0,0));
  await expect.poll(()=>draws(page)).toBeGreaterThan(offscreen);await settle(page);
  await page.screenshot({path:`output/playwright/0041/${info.project.name}-restored.png`,fullPage:false});
  expect(errors).toEqual([]);
});

test('animated scene suspends offscreen and resumes on visibility and preference changes',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/?test=1&seed=42');await page.getByRole('button',{name:'开门迎客'}).click();
  await expect.poll(()=>draws(page)).toBeGreaterThan(3);
  await scrollAway(page);const paused=await draws(page);
  await page.waitForTimeout(350);expect(await draws(page)).toBe(paused);
  await page.evaluate(()=>window.scrollTo(0,0));await expect.poll(()=>draws(page)).toBeGreaterThan(paused+3);
  await page.emulateMedia({reducedMotion:'reduce'});await settle(page);
  const reduced=await draws(page);await page.waitForTimeout(350);expect(await draws(page)).toBe(reduced);
  await page.emulateMedia({reducedMotion:'no-preference'});await expect.poll(()=>draws(page)).toBeGreaterThan(reduced+3);
});
