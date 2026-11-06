import { expect, type Locator, type Page } from '@playwright/test';
import type { Line } from '../src/contracts';
import { adaptMandarinContent } from '../src/content/mandarin';
import { createLineSchema } from '../src/content/schema';
import { language } from '../src/language';
import apartment from '../src/features/apartment/content.json' with {type: 'json'};
import cats from '../src/features/cats/content.json' with {type: 'json'};
import repairs from '../src/features/repairs/content.json' with {type: 'json'};
import garden from '../src/features/garden/content.json' with {type: 'json'};

const lines = {apartment: apartment.lines, cats: cats.lines, repairs: repairs.characters.flatMap(character => character.lines), garden: garden.lines};
export function featureLine(feature: keyof typeof lines, id: string): Line {
  const line = lines[feature].find(value => value.id === `${feature}.${id}`);
  if (!line) throw new Error(`Unknown feature line ${feature}.${id}`);
  return createLineSchema(language).parse(adaptMandarinContent(line));
}

export async function expectNativeSpeech(page: Page, path: string, since = 0) {
  await expect.poll(() => page.evaluate(({path, since}) => {
    const probe = window as any;
    return probe.__audioProbe.slice(since).some((row: any) => row.src.endsWith(path) && row.status === 'playing')
      && probe.__audioElements.some((audio: HTMLAudioElement) => audio.src.endsWith(path) && !audio.error && audio.readyState >= 2 && Number.isFinite(audio.duration) && audio.duration > 0);
  }, {path, since})).toBe(true);
}

export async function checkLineAndWord(page: Page, line: Line, spoken: Locator, replay: Locator) {
  await expectNativeSpeech(page, line.audio);
  let since = await page.evaluate(() => (window as any).__audioProbe.length);
  await replay.click();
  await expectNativeSpeech(page, line.audio, since);
  const token = spoken.locator('[data-word-lookup]').first();
  await expect(token).toHaveText(line.tokens[0].text);
  since = await page.evaluate(() => (window as any).__audioProbe.length);
  await token.click();
  await expect(page.locator('.word-popover .pinyin')).not.toBeEmpty();
  await expectNativeSpeech(page, line.tokens[0].audio, since);
  since = await page.evaluate(() => (window as any).__audioProbe.length);
  await page.getByRole('button', {name: '听这个词', exact: true}).click();
  await expectNativeSpeech(page, line.tokens[0].audio, since);
  await page.getByRole('button', {name: '关闭词卡', exact: true}).click();
  await expect(token).toBeFocused();
}
