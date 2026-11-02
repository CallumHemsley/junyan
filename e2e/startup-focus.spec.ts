import {test,expect,type Page,type Locator} from '@playwright/test';
import {silentResponse} from './audio-fixtures';
const url=()=>`${process.env.JUNYAN_PREVIEW_URL}?seed=42`;
const customer=(page:Page)=>page.locator('.customer-row').first();
async function activate(page:Page,control:Locator){
  for(let i=0;i<100;i++){
    if(await control.evaluate(element=>element===document.activeElement))break;
    await page.keyboard.press(page.context().browser()!.browserType().name()==='webkit'?'Alt+Tab':'Tab');
  }
  await expect(control).toBeFocused();await page.keyboard.press('Enter');
}
test.beforeEach(async({page})=>{await page.route('**/*.wav',route=>silentResponse(route));});
test('a real queued database open cannot strand a valid recovery checkpoint',async({page,context},info)=>{
  await page.goto(url());await page.getByRole('button',{name:'开门迎客'}).click();
  await customer(page).click();await expect(page.getByRole('dialog',{name:'1桌点餐'})).toBeVisible();
  await page.waitForTimeout(650);
  const holder=await context.newPage();
  try{
    await holder.goto(url());await expect(holder.getByRole('button',{name:'开门迎客'})).toBeVisible();
    await holder.evaluate(async()=>{
      const connection=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('junyan-waiter',1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
      (window as any).heldDatabase=connection;
      await new Promise<void>(resolve=>{const request=indexedDB.deleteDatabase('junyan-waiter');request.onblocked=()=>resolve()});
    });
    await page.getByRole('dialog').getByRole('button',{name:'包子',exact:true}).click();
    await page.reload();
    await expect(page.getByRole('button',{name:'开门迎客'})).toBeVisible({timeout:3000});
    await page.getByRole('button',{name:'开门迎客'}).click();await page.getByRole('button',{name:/^本子/}).click();
    await expect(page.locator('.journal-list')).toContainText('包子');
    await page.screenshot({path:info.outputPath('queued-checkpoint-restored.png'),fullPage:true});
  }finally{await holder.close()}
});
test('a queued database open without a checkpoint has a bounded playable fallback',async({page,context})=>{
  const holder=await context.newPage();
  try{
    await holder.goto(url());await expect(holder.getByRole('button',{name:'开门迎客'})).toBeVisible();await holder.waitForTimeout(650);
    await holder.evaluate(async()=>{
      (window as any).heldDatabase=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('junyan-waiter',1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
      await new Promise<void>(resolve=>{const request=indexedDB.deleteDatabase('junyan-waiter');request.onblocked=()=>resolve()});
    });
    await page.goto(url());await expect(page.getByRole('button',{name:'开门迎客'})).toBeVisible({timeout:3000});
    await page.getByRole('button',{name:'开门迎客'}).click();await customer(page).click();
    await page.getByRole('dialog').getByRole('button',{name:'包子',exact:true}).click();await page.keyboard.press('Escape');await page.keyboard.press('Escape');
    await holder.close();await page.waitForTimeout(700);
    await page.getByRole('button',{name:/^本子/}).click();await expect(page.locator('.journal-list')).toContainText('包子');
  }finally{if(!holder.isClosed())await holder.close()}
});
test('a timed-out old read cannot replace new gameplay when it finally completes',async({page,context})=>{
  await page.goto(url());await expect(page.getByRole('button',{name:'开门迎客'})).toBeVisible();await page.waitForTimeout(700);
  // Delay only native completion delivery, after a real read has captured its snapshot.
  await context.addInitScript(()=>{
    const original=IDBDatabase.prototype.transaction;const descriptor=Object.getOwnPropertyDescriptor(IDBTransaction.prototype,'oncomplete')!;let next=true;
    IDBDatabase.prototype.transaction=function(...args:Parameters<typeof original>){
      const transaction=original.apply(this,args);
      if(next&&transaction.mode==='readonly'){
        next=false;let assigned:unknown;
        Object.defineProperty(transaction,'oncomplete',{get:()=>assigned,set(handler){assigned=handler;descriptor.set!.call(transaction,typeof handler==='function'?function(event:Event){setTimeout(()=>handler.call(transaction,event),2500)}:handler)}});
      }
      return transaction;
    };
  });
  await page.reload();await expect(page.getByRole('button',{name:'开门迎客'})).toBeVisible({timeout:2200});
  await page.getByRole('button',{name:'开门迎客'}).click();await customer(page).click();
  await page.getByRole('dialog').getByRole('button',{name:'包子',exact:true}).click();await page.keyboard.press('Escape');await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  await page.getByRole('button',{name:/^本子/}).click();await expect(page.locator('.journal-list')).toContainText('包子');
});
test('real keyboard focus returns to the opener across nested and replacement dialogs',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url());await activate(page,page.getByRole('button',{name:'开门迎客'}));
  for(let i=0;i<8;i++){
    await activate(page,customer(page));await expect(page.getByRole('dialog',{name:'1桌点餐'})).toBeVisible();
    const word=page.getByRole('dialog').getByRole('button',{name:'包子',exact:true});
    await activate(page,word);await page.keyboard.press('Escape');await expect(word).toBeFocused();
    await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(customer(page)).toBeFocused({timeout:1500});
  }
  await activate(page,customer(page));await activate(page,page.getByRole('button',{name:'去厨房',exact:true}));
  await expect(page.getByRole('dialog',{name:'厨房',exact:true})).toBeVisible();await page.keyboard.press('Escape');await expect(customer(page)).toBeFocused();
  const help=page.getByRole('button',{name:'怎么玩',exact:true});await activate(page,help);await page.keyboard.press('Escape');await expect(help).toBeFocused();
  await page.screenshot({path:info.outputPath('keyboard-opener-restored.png'),fullPage:true});expect(errors).toEqual([]);
});
