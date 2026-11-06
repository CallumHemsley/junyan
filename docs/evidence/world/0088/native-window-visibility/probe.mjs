import {chromium} from '@playwright/test';
import {writeFileSync} from 'node:fs';
const output=new URL('./capability-result.json',import.meta.url);
const result={method:'Native headful Chromium blank-page visibilitychange/document.hidden observation; CDP Browser.getWindowForTarget and setWindowBounds minimized then normal. No visibility override or focus emulation.',started:new Date().toISOString(),chromium:'/usr/bin/chromium',display:process.env.DISPLAY??null,states:[],error:null,capabilityProven:false};
let browser;
try {
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:false,ignoreDefaultArgs:['--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding'],args:['--mute-audio']});
 const context=await browser.newContext();await context.addInitScript(()=>{window.__nativeVisibilityEvents=[];document.addEventListener('visibilitychange',()=>window.__nativeVisibilityEvents.push({hidden:document.hidden,visibilityState:document.visibilityState,t:performance.now()}));});
 const page=await context.newPage();await page.goto('about:blank');
 const client=await context.newCDPSession(page),session=await browser.newBrowserCDPSession();
 const {targetInfo}=await client.send('Target.getTargetInfo');const window=await session.send('Browser.getWindowForTarget',{targetId:targetInfo.targetId});result.window=window;
 const observe=async(label)=>{const state=await page.evaluate(()=>({hidden:document.hidden,visibilityState:document.visibilityState,events:window.__nativeVisibilityEvents}));result.states.push({label,...state});return state;};
 await observe('before');await session.send('Browser.setWindowBounds',{windowId:window.windowId,bounds:{windowState:'minimized'}});
 await page.waitForFunction(()=>document.hidden,undefined,{timeout:5000}).catch(()=>{});const hidden=await observe('minimized');
 await session.send('Browser.setWindowBounds',{windowId:window.windowId,bounds:{windowState:'normal'}});await page.waitForFunction(()=>!document.hidden,undefined,{timeout:5000}).catch(()=>{});const restored=await observe('restored');
 result.capabilityProven=hidden.hidden===true&&restored.hidden===false&&restored.events.some(e=>e.hidden)&&restored.events.some(e=>!e.hidden);
} catch(error) {result.error=String(error?.stack??error);} finally {await browser?.close();result.finished=new Date().toISOString();writeFileSync(output,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));}
