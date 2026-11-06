import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({headless:true, executablePath:'/usr/bin/chromium', args:['--no-sandbox']});
const results = [];
for (const viewport of [{width:390,height:664},{width:1440,height:900}]) {
  for (const placement of ['bottom','top']) {
    const page = await browser.newPage({viewport});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:5494/src/world/ui/harness.html?placement=${placement}&long=1`);
    await page.getByRole('button',{name:'1桌',exact:true}).click();
    await page.locator('.world-context .word').first().click();
    await page.locator('.world-context[inert]').waitFor();
    await page.getByRole('button',{name:'关闭词卡'}).focus();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.word-popover').count(),0);
    assert.equal(await page.locator('.world-context').count(),1);
    await page.waitForFunction(() => document.activeElement?.matches('.world-context .word'));
    await page.getByRole('button',{name:'继续走走'}).focus();
    await page.screenshot({path:`docs/evidence/0090/${viewport.width}-${placement}.png`});
    const geometry = await page.locator('.world-context').boundingBox();
    assert(geometry.height < viewport.height * .7);
    assert(await page.getByRole('button',{name:'继续走走'}).evaluate(el => el === document.activeElement));
    await page.locator('.world-context-scroll').evaluate(el => { el.scrollTop = el.scrollHeight; });
    await page.getByRole('button',{name:'+2块',exact:true}).click();
    await page.getByRole('button',{name:'递上找零',exact:true}).click();
    assert.equal(await page.locator('[data-notice]').textContent(),'pay-2');
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(),0);
    assert(await page.getByRole('button',{name:'1桌',exact:true}).evaluate(el => el === document.activeElement));
    await page.getByRole('button',{name:'1桌',exact:true}).click();
    await page.getByRole('button',{name:'去厨房',exact:true}).click();
    const pickup = page.locator('.world-kitchen-food > button:first-child').first();
    await pickup.click();
    assert.equal(await page.locator('.world-kitchen-tray button').count(),1);
    await page.locator('.world-kitchen-tray button').click();
    assert.equal(await page.locator('.world-kitchen-tray button').count(),0);
    assert.deepEqual(errors,[]);
    results.push({viewport,placement,geometry,errors});
    await page.close();
  }
}
console.log(JSON.stringify(results,null,2));
await browser.close();
