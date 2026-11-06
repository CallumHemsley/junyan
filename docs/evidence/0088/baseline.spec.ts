import {test,expect} from '@playwright/test';
import {playOpening} from '../../../e2e/opening';
import {writeFile} from 'node:fs/promises';
test('normal opening and independent five-location baseline',async({page},info)=>{
 const errors:string[]=[]; const metrics:any[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('./?seed=42');await playOpening(page);await page.getByRole('button',{name:'开门迎客'}).click();
 expect(await page.evaluate(()=> '__TEST__' in window)).toBe(false);
 for(const [id,name] of [['restaurant','早安小馆'],['apartment','家'],['cats','院子'],['repairs','修理间'],['garden','屋顶花园']]) {
  await page.getByRole('navigation',{name:'楼里',exact:true}).getByRole('button',{name,exact:true}).click();
  await expect(page.locator(`[data-location-button="${id}"]`)).toHaveAttribute('aria-current','page');
  await page.waitForTimeout(600);
  await page.screenshot({path:`docs/evidence/0088/${info.project.name}-${id}.png`,fullPage:true});
  metrics.push(await page.evaluate((id)=>({id,viewport:{width:innerWidth,height:innerHeight},document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},canvases:[...document.querySelectorAll('canvas')].map(c=>({width:c.width,height:c.height,rect:c.getBoundingClientRect().toJSON()}))}),id));
  await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowDown');
 }
 await page.reload();await expect(page.locator('[data-location-button="garden"]')).toHaveAttribute('aria-current','page');
 await writeFile(`docs/evidence/0088/${info.project.name}-observations.json`,JSON.stringify({source:'8cd5bc209b7dc2d91cc0f765991de313f813f4eb',method:'Normal opening; actual menu clicks document baseline limitation, not world traversal acceptance; reload rooftop',errors,metrics},null,2));
 expect(errors).toEqual([]);
});
