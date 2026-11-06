import { expect, test, type Locator } from '@playwright/test';
import { createGame } from '../src/game';
import { content } from '../src/content';
import { readingRoomMap } from '../src/world/maps/reading-room';
import { seedDayOne } from './opening';
import { savedGame } from './world-journey';
import { privateArtifact } from './private-artifacts';

test('distinguishes furniture play from desk inspection when cycling nearby reading targets', async ({ page, baseURL, isMobile }, info) => {
  if (isMobile) await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const activate = async (control: Locator) => {
    if (isMobile) await control.tap();
    else { await control.focus(); await control.press('Enter'); }
  };

  // Declared arrival fixture isolates labels; subsequent cycling and activation use real controls.
  const game = createGame(content, 42);
  game.neighbourhood!.location = 'reading-room';
  game.world = { version: 1, mapId: 'reading-room', position: readingRoomMap.anchors[0].position, facing: 'north', activeActivity: null, activeAnchorId: null, returnPositions: {} };
  await seedDayOne(page, baseURL!, game);
  await page.goto('/?seed=42');
  const open = page.getByRole('button', { name: '开门迎客', exact: true });
  if (await open.isVisible()) await activate(open);
  await expect(page.getByTestId('world-viewport')).toHaveAttribute('data-map', 'reading-room');
  await expect(page.locator('.connected-world canvas')).toHaveAttribute('data-rendered', 'true');

  const group = page.locator('.world-target-group');
  const action = group.locator('.world-target-activate');
  const cycle = group.locator('.world-target-switch');
  await expect(group).toHaveAttribute('data-target-id', 'reading-room.project');
  await expect(group.locator('.world-target-label')).toHaveText('桌子椅子');
  await expect(action).toHaveAccessibleName('桌子椅子', { exact: true });
  await expect(group.locator('[data-word-lookup].fogged')).toHaveCount(2);
  await expect(cycle).toHaveAccessibleName('查看看看 2', { exact: true });
  await page.screenshot({ path: privateArtifact(`0107/${info.project.name}-project-target.png`) });

  await activate(cycle);
  await expect(group).toHaveAttribute('data-target-id', 'reading-room.shared-desk');
  await expect(group.locator('.world-target-label')).toHaveText('看看');
  await expect(action).toHaveAccessibleName('看看', { exact: true });
  await expect(cycle).toHaveAccessibleName('查看桌子椅子 2', { exact: true });
  await activate(action);
  await expect.poll(async () => (await savedGame(page)).world!.life?.discoveries).toContainEqual({ mapId: 'reading-room', landmarkId: 'reading-room.shared-desk', day: 1 });
  await expect(page.locator('.reading-room')).toHaveCount(0);
  await page.screenshot({ path: privateArtifact(`0107/${info.project.name}-desk-inspection.png`) });

  await activate(cycle);
  await expect(action).toHaveAccessibleName('桌子椅子', { exact: true });
  await activate(action);
  await expect(page.locator('.reading-room')).toBeVisible();
  await expect.poll(async () => (await savedGame(page)).world!.activeAnchorId).toBe('reading-room.project');
  await page.screenshot({ path: privateArtifact(`0107/${info.project.name}-furniture-editor.png`) });
  expect(await page.locator('main').innerText()).not.toMatch(/[a-z]/i);
  expect(errors).toEqual([]);
});
