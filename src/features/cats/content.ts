import { z } from 'zod';
import type { Line, Word } from '../../contracts';
import data from './content.json';
import { content as sharedContent } from '../../content';
import { contentWords } from '../../content/words';
const canonical = new Map(contentWords(sharedContent).map(word => [word.id, word]));

const id = z.string().regex(/^(cats\.)?[a-z][a-z0-9-]*$/);
const audio = z.string().regex(/^\/audio\/(cats\/)?[a-z0-9-]+\.(wav|m4a)$/);
const wordSchema = z.strictObject({
  id, hanzi: z.string().regex(/^[\p{Script=Han}]+$/u),
  pinyin: z.string().min(1), gloss: z.string().min(1), audio,
});
export const contentSchema = z.strictObject({
  words: z.array(wordSchema),
  lines: z.array(z.strictObject({
    id: z.string().regex(/^cats\.[a-z][a-z0-9-]*$/), text: z.string().regex(/^[\p{Script=Han}，。！？]+$/u),
    tokens: z.array(wordSchema).min(1), audio: z.string().regex(/^\/audio\/cats\/[a-z0-9-]+\.(wav|m4a)$/),
  })),
}).superRefine((value, ctx) => {
  const vocabulary = new Map(value.words.map(word => [word.id, word]));
  if (vocabulary.size !== value.words.length || new Set(value.lines.map(line => line.id)).size !== value.lines.length)
    ctx.addIssue({ code: 'custom', message: 'Duplicate content ID' });
  value.words.forEach(word => {
    if (word.id.startsWith('cats.') && !word.audio.startsWith('/audio/cats/'))
      ctx.addIssue({ code: 'custom', message: 'Feature words need feature-owned audio' });
    if (!word.id.startsWith('cats.') && JSON.stringify(canonical.get(word.id)) !== JSON.stringify(word))
      ctx.addIssue({ code: 'custom', message: 'Shared word must match canonical content' });
  });
  value.lines.forEach((line, index) => {
    if (line.text.replace(/[，。！？]/gu, '') !== line.tokens.map(word => word.hanzi).join(''))
      ctx.addIssue({ code: 'custom', message: 'Text differs from authored tokens', path: ['lines', index] });
    for (const word of line.tokens) {
      if (JSON.stringify(vocabulary.get(word.id)) !== JSON.stringify(word))
        ctx.addIssue({ code: 'custom', message: 'Noncanonical word', path: ['lines', index] });
    }
  });
});
export const content = contentSchema.parse(data);
export const words: Word[] = content.words;
export const lines: Line[] = content.lines;
export function lineFor(key: string): Line & { text: string } {
  const line = content.lines.find(line => line.id === `cats.${key}`);
  if (!line) throw new Error(`Unknown cats line: ${key}`);
  return line;
}
