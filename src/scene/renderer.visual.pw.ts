import {test,expect,type Page} from '@playwright/test';
import type {Action,GameState} from '../contracts';

test.use({launchOptions:{args:['--mute-audio']},reducedMotion:'reduce'});

async function frames(page:Page,count=6) {
  await page.evaluate(async count=>{
    for(let frame=0;frame<count;frame++) await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
  },count);
}

test('playable-scale cast and trays stay still under reduced motion',async({page},info)=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error') errors.push(message.text());});
  await page.goto('/?test=1&seed=42&opening=skip');
  await page.getByRole('button',{name:'开门迎客'}).click();
  await expect(page.locator('canvas')).toBeVisible();
  const dispatch=async(action:Action)=>page.evaluate(action=>{
    const hooks=(window as unknown as {__TEST__:{dispatch(action:Action):void}}).__TEST__;
    hooks.dispatch(action);
  },action);
  await dispatch({type:'move',position:{x:3,y:5.5}});
  await dispatch({type:'interact',table:1});
  await dispatch({type:'move',position:{x:6,y:6}});
  await frames(page);
  await page.screenshot({path:`output/playwright/0029/${info.project.name}-playable-empty.png`,fullPage:true,scale:'css'});
  await dispatch({type:'move',position:{x:6,y:1}});
  const foodId=await page.evaluate(()=>{
    const hooks=(window as unknown as {__TEST__:{content:{foods:{id:string}[]}}}).__TEST__;
    return hooks.content.foods[0].id;
  });
  for(let slot=0;slot<6;slot++) await dispatch({type:'pickup',foodId});
  await dispatch({type:'move',position:{x:6,y:6}});
  await frames(page);
  const state=await page.evaluate(()=>(window as unknown as {__TEST__:{getState():GameState}}).__TEST__.getState());
  expect(state.tray).toHaveLength(6);
  expect(state.customers).toHaveLength(4);
  const canvas=page.locator('canvas');
  const before=await canvas.evaluate(element=>(element as HTMLCanvasElement).toDataURL());
  await frames(page,45);
  expect(await canvas.evaluate(element=>(element as HTMLCanvasElement).toDataURL())).toBe(before);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.screenshot({path:`output/playwright/0029/${info.project.name}-playable-full.png`,fullPage:true,scale:'css'});
  expect(errors).toEqual([]);
});
