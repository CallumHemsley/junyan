import { test, expect } from '/workspace/cats-0068/node_modules/@playwright/test';
const harness='/src/features/cats/harness.html?test=1';
for (const target of ['white','window']) test(`late completion restored with ${target} selected`,async({page},info)=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto(harness);
 const select=async(target:string)=>page.getByTestId(`cats-${target}`).click();
 const act=async(type:string)=>page.getByTestId(`cats-action-${type}`).click();
 const snap=()=>page.evaluate(()=>(window as any).__CATS_HARNESS__.state());
 await select('white');
 for(const type of ['crouch','wait','approach','follow','reunite']) await act(type);
 await page.evaluate(()=>(window as any).__CATS_HARNESS__.day(3)); await act('begin'); await select('white'); await act('follow');
 await select('black'); await expect(page.getByTestId('cats-action-approach')).toHaveCount(0);
 await select(target);
 await page.evaluate(()=>(window as any).__CATS_HARNESS__.day(4)); await act('approach');
 const done=await snap();
 expect(done.repeat).toEqual({status:'complete',day:3,finishedDay:4,kind:'route'});
 expect(done.cats.white.rested).toBe(true);
 await page.goto(`${harness}&day=4&state=${encodeURIComponent(JSON.stringify(done))}`);
 expect(await snap()).toEqual(done);
 const observations=await page.evaluate(async()=>{
  const {visualPose}=await import('/src/features/cats/scene.ts');
  const {sceneFacts,reduce,recoveryForTransition,gifts}=await import('/src/features/cats/rules.ts');
  const s=(window as any).__CATS_HARNESS__.state();
  const rejected=reduce(s,{type:'reunite'},4);
  return {pose:visualPose(s,4),today:sceneFacts(s,4),tomorrow:sceneFacts(s,5),recovery:recoveryForTransition(s,rejected),gifts:gifts(rejected)};
 });
 await page.screenshot({path:`/workspace/scratch/cats-final-review/${info.project.name}-late-${target}.png`,fullPage:true});
 console.log(JSON.stringify({target,observations}));
 expect(observations.today.white).toBe('window'); expect(observations.tomorrow.white).toBe('door');
 expect(observations.recovery).toEqual([]); expect(observations.gifts).toEqual(['cats.cushion']); expect(errors).toEqual([]);
 expect(observations.pose.sitting).toBe(true);
});
for (const target of ['white','door']) for(const rested of [false,true]) test(`rain patient actions ${target} previously rested ${rested}`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'}); await page.goto(harness);
 const select=async(t:string)=>page.getByTestId(`cats-${t}`).click();
 const act=async(t:string)=>page.getByTestId(`cats-action-${t}`).click();
 await select('white');for(const t of ['crouch','wait','approach','follow','reunite']) await act(t);
 if(rested){await select('white');await act('wait');}
 await page.evaluate(()=>(window as any).__CATS_HARNESS__.day(2));await act('begin');await select(target);
 const observe=()=>page.evaluate(async()=>{const {visualPose}=await import('/src/features/cats/scene.ts');const h=(window as any).__CATS_HARNESS__;return {pose:visualPose(h.state(),2),state:h.state(),events:h.events};});
 const before=await observe();await act('space');const space=await observe();
 expect(space.state.cats.white.gaveSpace).toBe(true);expect(space.events.recover.flat()).toContain('cats.back');expect(space.pose.sitting).toBe(false);
 expect(Math.hypot(space.pose.player.x-space.pose.white.x,space.pose.player.y-space.pose.white.y)).toBeGreaterThan(Math.hypot(before.pose.player.x-before.pose.white.x,before.pose.player.y-before.pose.white.y));
 await act('wait');const waited=await observe();expect(waited.state.repeat.status).toBe('complete');
 await page.screenshot({path:`/workspace/scratch/cats-final-review/${info.project.name}-rain-${target}-${rested}.png`,fullPage:true});
 console.log(JSON.stringify({target,rested,space:space.pose,waited:waited.pose}));
});
