import { expect, it } from 'vitest';
import { contentSchema, words, lines } from './content';
import data from './content.json';
it('validates the authored corpus and rejects segmentation drift', () => {
  expect(contentSchema.safeParse(data).success).toBe(true);
  const broken=structuredClone(data); broken.lines[0].tokens.pop(); expect(contentSchema.safeParse(broken).success).toBe(false);
  expect(words.some(w=>w.text==='蓝色')).toBe(true); expect(lines.find(l=>l.id==='apartment.window')?.tokens.map(w=>w.text).join('')).toBe('桌子放在窗户旁边');
});
