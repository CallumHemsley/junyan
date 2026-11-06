import { interactAt, closeActivity, savedGame } from './world-journey';
import { privateArtifact } from './private-artifacts';
import { test, expect } from '@playwright/test';
import { withSkip } from './opening';
import type { Content, GameState } from '../src/contracts';
test.use({ launchOptions: { args: ['--mute-audio'] } });
for (const viewport of [
    { name: 'desktop', width: 1440, height: 1000 }, { name: 'phone', width: 390, height: 844 },
    { name: 'small', width: 320, height: 568 }, { name: 'landscape', width: 844, height: 390 },
]) {
    test(`${viewport.name}: scene-first layout keeps service controls accessible`, async ({ page }, info) => {
        test.setTimeout(180000);
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error')
            errors.push(message.text()); });
        await page.setViewportSize(viewport);
        await page.goto(withSkip('/?test=1&seed=42'));
        const help = page.getByRole('dialog', { name: '怎么玩' });
        const disclosure = help.getByRole('button', { name: '怎么玩', exact: true });
        await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
        await expect(help.locator('.help-line')).toHaveCount(1);
        await page.screenshot({ path: privateArtifact(`${info.project.name}-${viewport.name}-welcome.png`), scale: 'css' });
        await disclosure.focus();
        await page.keyboard.press('Enter');
        await expect(help.locator('[data-help-step]')).toHaveCount(3);
        await disclosure.press('Enter');
        await help.getByRole('button', { name: '关闭', exact: true }).focus();
        await page.keyboard.press('Shift+Tab');
        await expect(disclosure).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(help.getByRole('button', { name: '关闭', exact: true })).toBeFocused();
        await help.getByRole('button', { name: '开门迎客' }).click();
        await expect(page.getByTestId('world-viewport')).toBeVisible();
        const scene = await page.getByTestId('world-viewport').boundingBox();
        expect(scene!.width).toBeGreaterThanOrEqual(Math.min(viewport.width - 32, 560));
        expect((await savedGame(page)).customers).toHaveLength(4);
        expect((await savedGame(page)).earnings).toBe(0);
        await expect(page.getByRole('button', { name: '托盘', exact: true })).toContainText('0/6');
        for (const button of await page.locator('.help-button,.world-pocket-bar button,.world-pad button').all()) {
            const box = (await button.boundingBox())!;
            expect(box.height).toBeGreaterThanOrEqual(44);
            expect(box.width).toBeGreaterThanOrEqual(44);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await interactAt(page, 'restaurant.table-1');
        const context = page.locator('.world-context[data-target=table]');
        await expect(context).toBeVisible();
        const foodNames = await page.evaluate(() => {
            const hooks = (window as Window & {
                __TEST__: {
                    content: Content;
                    getState: () => GameState;
                };
            }).__TEST__;
            const order = hooks.content.orders.find(entry => entry.id === hooks.getState().customers[0].orderId)!;
            return order.items.map(item => hooks.content.foods.find(food => food.id === item.foodId)!.word.text);
        });
        await page.keyboard.press('Escape');
        await expect(page.locator('[data-world-anchor="restaurant.table-1"]')).toBeFocused();
        for (const food of foodNames)
            await expect(page.locator('main')).not.toContainText(food);
        await interactAt(page, 'restaurant.kitchen');
        const kitchen = page.locator('.world-context[data-target=kitchen]');
        for (let count = 0; count < 6; count++)
            await kitchen.locator('.world-kitchen-food > button[aria-label]').nth(count).click();
        await expect(kitchen.locator('.world-tray-item')).toHaveCount(6);
        await kitchen.getByRole('button', { name: '端好了，去上菜' }).click();
        await expect(page.getByRole('button', { name: '托盘', exact: true })).toContainText('6/6');
        await page.getByRole('button', { name: '托盘', exact: true }).click();
        const tray = page.locator('.tray-pocket');
        await expect(tray.locator('[data-word-lookup]')).toHaveCount(6);
        const word = tray.locator('[data-word-lookup]').last();
        await word.click();
        await expect(page.getByRole('button', { name: '关闭词卡' })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(word).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('button', { name: '托盘', exact: true })).toBeFocused();
        await page.locator('.help-button').click();
        await page.keyboard.press('Escape');
        await expect(page.locator('.help-button')).toBeFocused();
        await page.getByRole('button', { name: '本子', exact: true }).click();
        await expect(page.getByRole('dialog', { name: '本子' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('button', { name: '本子', exact: true })).toBeFocused();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: privateArtifact(`${info.project.name}-${viewport.name}-full-tray.png`), fullPage: true, scale: 'css' });
        expect(errors).toEqual([]);
    });
}
test('service remains bound to the last visited waiting table without checking food', async ({ page }) => {
    test.setTimeout(180000);
    await page.goto(withSkip('/?test=1&seed=42'));
    await page.getByRole('button', { name: '开门迎客' }).click();
    for (const table of [1, 4]) {
        await interactAt(page, `restaurant.table-${table}`);
        await expect(page.locator('.world-context')).toHaveAccessibleName(`${table}桌点餐`);
        await closeActivity(page);
    }
    await interactAt(page, 'restaurant.kitchen');
    await page.locator('.world-kitchen-food > button[aria-label]').first().click();
    await page.getByRole('button', { name: '端好了，去上菜' }).click();
    await interactAt(page, 'restaurant.table-4');
    await expect(page.locator('.world-context')).toHaveAttribute('data-target', 'table');
    expect((await savedGame(page)).customers.find(customer => customer.table === 4)!.phase).toBe('ordered');
    await expect(page.getByRole('button', { name: '上菜', exact: true })).toBeVisible();
});
test('reduced motion keeps disclosures and world navigation usable', async ({ page }, info) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(withSkip('/?test=1&seed=42'));
    await page.getByRole('button', { name: '开门迎客' }).click();
    await interactAt(page, 'restaurant.table-1');
    await expect(page.locator('.world-context')).toBeVisible();
    expect(await page.locator('.world-submit').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
    await page.screenshot({ path: privateArtifact(`${info.project.name}-reduced-motion-dialogue.png`), scale: 'css' });
});
test('primary service action names the checkout phase', async ({ page }) => {
    test.setTimeout(180000);
    await page.goto(withSkip('/?test=1&seed=42'));
    await page.getByRole('button', { name: '开门迎客' }).click();
    await interactAt(page, 'restaurant.table-1');
    await interactAt(page, 'restaurant.kitchen');
    const foods = await page.evaluate(() => {
        const hooks = (window as Window & {
            __TEST__: {
                content: Content;
                getState: () => GameState;
            };
        }).__TEST__;
        return hooks.content.orders.find(entry => entry.id === hooks.getState().customers[0].orderId)!.items.map(item => ({ name: hooks.content.foods.find(food => food.id === item.foodId)!.word.text, quantity: item.quantity }));
    });
    for (const food of foods)
        for (let i = 0; i < food.quantity; i++)
            await page.getByRole('button', { name: `拿${food.name}`, exact: true }).click();
    await page.getByRole('button', { name: '端好了，去上菜' }).click();
    await interactAt(page, 'restaurant.table-1');
    await page.getByRole('button', { name: '上菜', exact: true }).click();
    await expect(page.getByRole('button', { name: '递上找零' })).toBeVisible();
    await closeActivity(page);
    await interactAt(page, 'restaurant.table-1');
    await expect(page.getByRole('button', { name: '递上找零' })).toBeVisible();
});
