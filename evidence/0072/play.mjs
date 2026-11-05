import {chromium} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const label=process.argv[2]??'after', width=Number(process.argv[3]??1440), reduced=process.argv[4]==='reduce';
const out=`evidence/0072/${label}-${width}${reduced?'-reduce':''}`;
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--mute-audio','--no-sandbox']});
const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:reduced?'reduce':'no-preference'});
const page=await context.newPage(), errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const click=(name,exact=true)=>page.getByRole('button',{name,exact}).click();
const content=JSON.parse(await readFile('src/content/content.json','utf8'));
const savedMode=label.includes('saved');
const data=async()=>({content,state:await page.evaluate(async saved=>{
 if(!saved)return window.__TEST__.getState();
 const pending=localStorage.getItem('junyan-waiter-pending-v1');if(pending)return JSON.parse(pending);
 const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('junyan-waiter',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 return new Promise((resolve,reject)=>{const r=db.transaction('saves').objectStore('saves').get('v1');r.onsuccess=()=>{resolve(r.result);db.close();};r.onerror=()=>reject(r.error);});
},savedMode)});
const shot=async name=>{await page.waitForTimeout(350);await page.screenshot({path:`${out}/${name}.png`,fullPage:true});};
await page.goto(`http://127.0.0.1:5472/?${savedMode?'':'test=1&'}seed=42&opening=skip`);await click('开门迎客',false);await page.waitForTimeout(500);
for(let day=1;day<=(label==='before'?1:2);day++){
 for(const table of [1,2,3,4]){
  const {state,content}=await data(), order=content.orders.find(o=>o.id===state.customers.find(c=>c.table===table).orderId);
  const tableClick=async()=>{await page.getByRole('button',{name:new RegExp(`^${table}桌 ${order.customer}`)}).click();await page.getByRole('dialog',{name:`${table}桌点餐`}).waitFor();};
  await tableClick();await click('去厨房');
  if(day===1&&table===1){
   await click('拿豆浆');await click('端好了，去上菜',false);await tableClick();await page.getByRole('dialog').getByRole('button',{name:'上菜',exact:false}).click();
   if((await data()).state.customers.find(c=>c.table===table).phase!=='ordered')throw Error('wrong delivery accepted');
   await click('关闭');await shot('rejected');await page.getByTestId('kitchen').click();await click('放回豆浆');
  }
  for(const item of order.items){const food=content.foods.find(f=>f.id===item.foodId);for(let n=0;n<item.quantity;n++)await click(`拿${food.word.hanzi}`);}
  await click('端好了，去上菜',false);await tableClick();await page.getByRole('dialog').getByRole('button',{name:'上菜',exact:false}).click();
  if((await data()).state.customers.find(c=>c.table===table).phase!=='checkout')throw Error('not delivered');
  await click('关闭');await shot(`day${day}-table${table}-checkout`);
  if(table===2&&savedMode){await page.reload();await click('开门迎客',false);if((await data()).state.customers.find(c=>c.table===table).phase!=='checkout')throw Error('reload lost delivery');await shot(`day${day}-reload`);}
  await tableClick();const total=order.items.reduce((sum,i)=>sum+content.foods.find(f=>f.id===i.foodId).price*i.quantity,0);
  for(let n=0;n<order.paid-total;n++)await click('+1块');await click('递上找零',false);await click('继续招呼',false);
  if(table<4)await shot(`day${day}-table${table}-served`);
 }
 await shot(`day${day}-summary`);if(day===1&&label!=='before')await click('明天见',false);
}
await click('明天见',false);await page.getByRole('button',{name:/本子/}).click();await shot('journal');await click('关闭');
await writeFile(`${out}/result.json`,JSON.stringify({errors,state:(await data()).state,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)},null,2));
if(errors.length)throw Error(errors.join('\n'));await browser.close();
