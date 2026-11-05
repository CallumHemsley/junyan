import { test, expect } from '/workspace/cats-0068/node_modules/@playwright/test';
const harness='/src/features/cats/harness.html?test=1';
test('independent landmark and black friend detours after route and rain',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(harness);
 const select=async(t:string)=>page.getByTestId(`cats-${t}`).click();
 const act=async(t:string)=>page.getByTestId(`cats-action-${t}`).click();
 await select('white');for(const t of ['crouch','wait','approach','follow','reunite'])await act(t);
 await select('black');await act('greet');await act('sit');
 await page.evaluate(()=>(window as any).__CATS_HARNESS__.day(3));await act('begin');await select('white');await act('follow');await select('window');
 await page.evaluate(()=>(window as any).__CATS_HARNESS__.day(4));await act('approach');
 const observe=()=>page.evaluate(async()=>{const {visualPose}=await import('/src/features/cats/scene.ts');const h=(window as any).__CATS_HARNESS__;return {pose:visualPose(h.state(),h.day()),state:h.state()};});
 const pose=(day:number)=>page.evaluate(async d=>{const {visualPose}=await import('/src/features/cats/scene.ts');return visualPose((window as any).__CATS_HARNESS__.state(),d);},day);
 const windowPose=await pose(4);expect(windowPose.sitting).toBe(true);
 for(const t of ['door','bench','bicycle','aunt']){await select(t);expect((await pose(4)).sitting).toBe(false);}
 await select('black');expect((await pose(4)).player).toEqual({x:8.15,y:6.1});expect((await pose(4)).sitting).toBe(true);
 await page.screenshot({path:`/workspace/scratch/cats-alias-review/${info.project.name}-black-detour.png`,fullPage:true});
 await page.evaluate(()=>(window as any).__CATS_HARNESS__.day(5));await act('begin');await select('door');await act('space');await act('wait');
 const rainPose=await pose(5);expect(rainPose.sitting).toBe(true);await select('white');expect(await pose(5)).toEqual(rainPose);
 for(const t of ['window','bench','bicycle','aunt']){await select(t);expect((await pose(5)).sitting).toBe(false);}
 await select('black');expect((await pose(5)).player).toEqual({x:8.15,y:6.1});expect((await pose(5)).sitting).toBe(true);expect(errors).toEqual([]);
});
