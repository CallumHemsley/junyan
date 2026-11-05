import { chromium } from '../../../node_modules/@playwright/test/index.mjs';
import fs from 'node:fs';
const output = process.env.EVIDENCE_OUTPUT ?? '/tmp/junyan-0064-evidence';
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ['--mute-audio'],
});
const context = await browser.newContext({viewport:{width:1440,height:1000}});
const page = await context.newPage(); const errors=[]; const notes=[];
page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto('http://127.0.0.1:5406/?test=1&seed=42&opening=skip');
await page.getByRole('button',{name:'开门迎客'}).click();
for(const table of [1,2,3]){
 const d=await page.evaluate(()=>({state:window.__TEST__.getState(),content:window.__TEST__.content}));
 const order=d.content.orders.find(o=>o.id===d.state.customers.find(c=>c.table===table).orderId);
 const t=Date.now(); await page.getByTestId(`table-${table}`).click();
 await page.getByRole('dialog',{name:`${table}桌点餐`}).waitFor();
 notes.push({table,walkMs:Date.now()-t,dialog:await page.getByRole('dialog').innerText()});
 if(table===1)await page.screenshot({path:`${output}/desktop-order.png`,fullPage:true});
 await page.getByRole('button',{name:'去厨房',exact:true}).click();
 await page.getByRole('dialog',{name:'厨房',exact:true}).waitFor();
 if(table===1)await page.screenshot({path:`${output}/desktop-kitchen.png`,fullPage:true});
 for(const item of order.items){const food=d.content.foods.find(f=>f.id===item.foodId); for(let n=0;n<item.quantity;n++)await page.getByRole('button',{name:`拿${food.word.hanzi}`,exact:true}).click();}
 await page.getByRole('button',{name:'端好了，去上菜'}).click();
 await page.getByTestId(`table-${table}`).click();
 await page.getByRole('dialog',{name:`${table}桌点餐`}).waitFor();
 await page.getByRole('button',{name:'上菜',exact:false}).last().click();
 const total=order.items.reduce((s,i)=>s+d.content.foods.find(f=>f.id===i.foodId).price*i.quantity,0);
 for(let n=0;n<order.paid-total;n++)await page.getByRole('button',{name:'+1块',exact:true}).click();
 await page.getByRole('button',{name:'递上找零'}).click();
 if(table===1)await page.screenshot({path:`${output}/desktop-receipt.png`,fullPage:true});
 await page.getByRole('button',{name:'继续招呼'}).click();
}
await page.getByTestId('table-1').click(); await page.getByRole('dialog',{name:'1桌点餐'}).waitFor();
notes.push({revisit:await page.getByRole('dialog').innerText()});
await page.screenshot({path:`${output}/desktop-revisit.png`,fullPage:true});
fs.writeFileSync(`${output}/exploration.json`,JSON.stringify({notes,errors},null,2));
await browser.close();
